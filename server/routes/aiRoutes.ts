import { Router, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { GoogleGenAI, Type, Modality } from '@google/genai';
import { authenticate } from '../middlewares/auth.ts';
import { encartoToolDefinitions, executeEncartoTool } from '../../aiTools.ts';

export const aiRouter = Router();
aiRouter.use(authenticate, rateLimit({windowMs:60000,limit:18,standardHeaders:true,legacyHeaders:false,message:{error:'Too many AI requests. Please wait a minute and try again.'}}));
const providers = {
 nvidia:{models:'https://integrate.api.nvidia.com/v1/models',chat:'https://integrate.api.nvidia.com/v1/chat/completions'},
 openai:{models:'https://api.openai.com/v1/models',chat:'https://api.openai.com/v1/chat/completions'},
 anthropic:{models:'https://api.anthropic.com/v1/models?limit=100',chat:'https://api.anthropic.com/v1/messages'},
} as const;
type CloudProvider=keyof typeof providers;
type ChatMessage={role:'user'|'assistant';content:string};
const systemPrompt='You are Encarto AI, a helpful assistant for the Encarto gaming hub. Answer clearly and honestly. Use the available read-only Encarto tools when useful. Never claim to have changed accounts, rankings, match outcomes, wallet balances, or settings. Never request passwords, session cookies, API keys, or payment information.';
class ProviderError extends Error { constructor(public status:number){super('Provider request failed');} }
const isProvider=(v:unknown):v is CloudProvider=>typeof v==='string'&&Object.prototype.hasOwnProperty.call(providers,v);
const getKey=(req:Request)=>typeof req.body?.apiKey==='string'?req.body.apiKey.trim():'';
const chatModelId=(id:string)=>!/embedding|rerank|whisper|transcri|moderation|dall-e|text-to-speech|\btts\b|realtime-preview-audio|image-generation/i.test(id);
async function providerJSON(url:string,init:RequestInit):Promise<any>{
 let response:globalThis.Response;
 try{response=await fetch(url,{...init,signal:AbortSignal.timeout(14000)});}catch(e){if(e instanceof Error&&['TimeoutError','AbortError'].includes(e.name))throw e;throw new ProviderError(502);}
 if(!response.ok)throw new ProviderError(response.status);
 return response.json();
}
function authHeaders(provider:CloudProvider,key:string):Record<string,string>{return provider==='anthropic'?{'x-api-key':key,'anthropic-version':'2023-06-01','content-type':'application/json'}:{Authorization:'Bearer '+key,'content-type':'application/json'};}
function reportError(error:unknown,res:Response){
 if(error instanceof ProviderError){
  if([401,403].includes(error.status))return res.status(401).json({error:'The provider rejected this API key or it lacks access to this API.'});
  if(error.status===429)return res.status(429).json({error:'Provider rate limit or quota reached. Check the provider account and try later.'});
  if([400,404,422].includes(error.status))return res.status(400).json({error:'The model rejected this request. Check the model ID and whether it supports tool calling.'});
 }
 if(error instanceof Error&&['TimeoutError','AbortError'].includes(error.name))return res.status(504).json({error:'The AI provider took too long to respond. Try again.'});
 return res.status(502).json({error:'The AI provider could not complete the request. Check provider connectivity and status.'});
}
function modelRows(payload:any,provider:CloudProvider){
 return (Array.isArray(payload?.data)?payload.data:[]).map((m:any)=>({id:typeof m?.id==='string'?m.id:'',label:m?.display_name||m?.name||m?.id||''})).filter((m:{id:string})=>m.id&&(provider==='anthropic'||chatModelId(m.id))).sort((a:{id:string},b:{id:string})=>a.id.localeCompare(b.id));
}
const openAITools=()=>encartoToolDefinitions.map(t=>({type:'function',function:{name:t.function.name,description:t.function.description,parameters:t.function.parameters}}));
const anthropicTools=()=>encartoToolDefinitions.map(t=>({name:t.function.name,description:t.function.description,input_schema:t.function.parameters}));

aiRouter.post('/models',async(req:Request,res:Response)=>{
 const provider=req.body?.provider,key=getKey(req);
 if(!isProvider(provider))return res.status(400).json({error:'Select a supported cloud provider.'});
 if(!key||key.length>500)return res.status(400).json({error:'A valid provider API key is required.'});
 try{const payload=await providerJSON(providers[provider].models,{method:'GET',headers:authHeaders(provider,key)});res.setHeader('Cache-Control','no-store');return res.json({provider,models:modelRows(payload,provider),note:'Provider catalogues do not reliably publish tool-call capability for every model; support is model-dependent.'});}
 catch(e){return reportError(e,res);}
});
function parseChat(req:Request):{provider:CloudProvider;apiKey:string;model:string;messages:ChatMessage[]}|{error:string}{
 const provider=req.body?.provider,key=getKey(req),model=typeof req.body?.model==='string'?req.body.model.trim():'',raw=req.body?.messages;
 if(!isProvider(provider))return {error:'Select a supported cloud provider.'};
 if(!key||key.length>500)return {error:'A provider API key is required.'};
 if(!model||model.length>250)return {error:'Select a model returned by the provider.'};
 if(!Array.isArray(raw)||raw.length<1||raw.length>30)return {error:'Provide between 1 and 30 chat messages.'};
 const messages:ChatMessage[]=[];
 for(const m of raw){if(!m||!['user','assistant'].includes(m.role)||typeof m.content!=='string'||m.content.length>12000)return {error:'Chat message format is invalid or one message is too long.'};messages.push({role:m.role,content:m.content});}
 return {provider,apiKey:key,model,messages};
}
async function runOpenAI(provider:'nvidia'|'openai',apiKey:string,model:string,history:ChatMessage[]){
 const messages:any[]=[{role:'system',content:systemPrompt},...history],toolsUsed:string[]=[];
 for(let round=0;round<=3;round++){
  const payload=await providerJSON(providers[provider].chat,{method:'POST',headers:authHeaders(provider,apiKey),body:JSON.stringify({model,messages,tools:openAITools(),tool_choice:'auto',...(provider==='openai'?{max_completion_tokens:1200}:{max_tokens:1200})})});
  const assistant=payload?.choices?.[0]?.message;if(!assistant)throw new ProviderError(502);
  const calls=Array.isArray(assistant.tool_calls)?assistant.tool_calls:[];
  if(!calls.length){const content=typeof assistant.content==='string'?assistant.content:Array.isArray(assistant.content)?assistant.content.map((p:any)=>p?.text||'').join(''):'';return {content,toolsUsed};}
  if(round===3)return {content:typeof assistant.content==='string'&&assistant.content?assistant.content:'Reached the safe tool-call limit. Ask a follow-up to continue.',toolsUsed};
  messages.push(assistant);
  for(const call of calls.slice(0,4)){const name=String(call?.function?.name||''),result=executeEncartoTool(name,call?.function?.arguments||{});if(encartoToolDefinitions.some(t=>t.function.name===name))toolsUsed.push(name);messages.push({role:'tool',tool_call_id:String(call?.id||('tool-'+round+'-'+toolsUsed.length)),name,content:JSON.stringify(result)});}
 }
 return {content:'Could not finish within the safe tool-call limit.',toolsUsed};
}
async function runAnthropic(apiKey:string,model:string,history:ChatMessage[]){
 const messages:any[]=history.map(m=>({role:m.role,content:m.content})),toolsUsed:string[]=[];
 for(let round=0;round<=3;round++){
  const payload=await providerJSON(providers.anthropic.chat,{method:'POST',headers:authHeaders('anthropic',apiKey),body:JSON.stringify({model,max_tokens:1200,system:systemPrompt,messages,tools:anthropicTools()})});
  const blocks=Array.isArray(payload?.content)?payload.content:[],text=blocks.filter((b:any)=>b?.type==='text').map((b:any)=>String(b.text||'')).join(''),calls=blocks.filter((b:any)=>b?.type==='tool_use');
  if(!calls.length)return {content:text,toolsUsed};
  if(round===3)return {content:text||'Reached the safe tool-call limit. Ask a follow-up to continue.',toolsUsed};
  messages.push({role:'assistant',content:blocks});
  messages.push({role:'user',content:calls.map((call:any)=>{const result=executeEncartoTool(String(call.name||''),call.input||{});if(encartoToolDefinitions.some(t=>t.function.name===call.name))toolsUsed.push(call.name);return {type:'tool_result',tool_use_id:call.id,content:JSON.stringify(result)};})});
 }
 return {content:'Could not finish within the safe tool-call limit.',toolsUsed};
}
aiRouter.post('/chat',async(req:Request,res:Response)=>{
 const parsed=parseChat(req);if('error'in parsed)return res.status(400).json({error:parsed.error});
 try{const result=parsed.provider==='anthropic'?await runAnthropic(parsed.apiKey,parsed.model,parsed.messages):await runOpenAI(parsed.provider,parsed.apiKey,parsed.model,parsed.messages);res.setHeader('Cache-Control','no-store');return res.json(result);}
 catch(e){return reportError(e,res);}
});
function geminiClient(res:Response):GoogleGenAI|null{const key=process.env.GEMINI_API_KEY?.trim();if(!key){res.status(503).json({error:'Gemini is not configured. Add GEMINI_API_KEY to the server environment.'});return null;}return new GoogleGenAI({apiKey:key});}
const textField=(req:Request,field:string,max=12000):string|null=>{const v=req.body?.[field];return typeof v==='string'&&v.trim()&&v.length<=max?v.trim():null;};
aiRouter.post('/gemini/encyclopedia',async(req:Request,res:Response)=>{
 const query=textField(req,'query',500);if(!query)return res.status(400).json({error:'Enter a topic of up to 500 characters.'});const ai=geminiClient(res);if(!ai)return;
 try{const response=await ai.models.generateContent({model:'gemini-3-pro-preview',contents:'Write a comprehensive encyclopedia entry for: "'+query+'".',config:{systemInstruction:'You are Encarto, a high-end multimedia encyclopedia. Provide structured knowledge with a main summary and detailed sections. Be scholarly yet engaging.',responseMimeType:'application/json',responseSchema:{type:Type.OBJECT,properties:{title:{type:Type.STRING},summary:{type:Type.STRING},sections:{type:Type.ARRAY,items:{type:Type.OBJECT,properties:{heading:{type:Type.STRING},content:{type:Type.STRING}},required:['heading','content']}},relatedTopics:{type:Type.ARRAY,items:{type:Type.STRING}},suggestedPrompts:{type:Type.ARRAY,items:{type:Type.STRING}}},required:['title','summary','sections','relatedTopics','suggestedPrompts']}}});return res.json(JSON.parse((response.text||'{}').trim()));}
 catch{return res.status(502).json({error:'Gemini could not generate the entry. Check the server key, quota, and model availability.'});}
});
aiRouter.post('/gemini/image',async(req:Request,res:Response)=>{
 const placement=req.body?.placement,topic=placement==='topic'?textField(req,'topic',500):'Encarto';if(!['topic','mascot'].includes(placement)||!topic)return res.status(400).json({error:'Provide a valid image type and topic.'});const ai=geminiClient(res);if(!ai)return;
 const prompt=placement==='mascot'?"A neon-lit bear wearing a high-tech gaming headset, holding a futuristic glowing plate with the word 'ENCARTO' written in stylized neon letters. Professional mascot design, clean white background, cinematic lighting, esports aesthetic, high contrast.":'A professional, high-quality documentary-style photographic illustration of: '+topic+'. Cinematic lighting, educational context.';
 try{const response=await ai.models.generateContent({model:'gemini-2.5-flash-image',contents:{parts:[{text:prompt}]},config:{imageConfig:{aspectRatio:placement==='mascot'?'1:1':'16:9'}}});for(const part of response.candidates?.[0]?.content?.parts||[]){if(part.inlineData?.data)return res.json({image:'data:'+(part.inlineData.mimeType||'image/png')+';base64,'+part.inlineData.data});}return res.status(502).json({error:'Gemini did not return an image.'});}
 catch{return res.status(502).json({error:'Gemini image generation failed. Check server key, quota, and model availability.'});}
});
aiRouter.post('/gemini/speech',async(req:Request,res:Response)=>{
 const text=textField(req,'text');if(!text)return res.status(400).json({error:'Provide text to narrate.'});const ai=geminiClient(res);if(!ai)return;
 try{const response=await ai.models.generateContent({model:'gemini-2.5-flash-preview-tts',contents:[{parts:[{text:'Read the following with a calm, intellectual, and clear documentary narrator voice: '+text}]}],config:{responseModalities:[Modality.AUDIO],speechConfig:{voiceConfig:{prebuiltVoiceConfig:{voiceName:'Charon'}}}}});const audio=response.candidates?.[0]?.content?.parts?.find(p=>p.inlineData)?.inlineData?.data;if(!audio)return res.status(502).json({error:'Gemini did not return audio.'});res.setHeader('Cache-Control','no-store');return res.json({audioBase64:audio});}
 catch{return res.status(502).json({error:'Gemini speech generation failed. Check server key, quota, and model availability.'});}
});
