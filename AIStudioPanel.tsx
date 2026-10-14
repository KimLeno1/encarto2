import React, { useMemo, useState } from 'react';
import { Bot, BrainCircuit, Cpu, KeyRound, Loader2, RefreshCw, Send, ShieldCheck, TriangleAlert, Wrench } from 'lucide-react';
import { encartoToolDefinitions, executeEncartoTool } from './aiTools.ts';
type Provider='nvidia'|'openai'|'anthropic'|'ollama'|'hermes';
type ChatMessage={role:'user'|'assistant';content:string};
type ModelOption={id:string;label:string;provider?:string};
const labels:Record<Provider,string>={nvidia:'NVIDIA NIM',openai:'OpenAI / ChatGPT API',anthropic:'Anthropic Claude',ollama:'Ollama (local)',hermes:'Hermes Agent (local)'};
const systemPrompt='You are Encarto AI, a helpful assistant for Encarto gaming. Use read-only Encarto tools when helpful. Never claim to change accounts, ranks, match results, wallet balances, or settings.';
const rootURL=(v:string)=>{let s=v.trim();while(s.endsWith('/'))s=s.slice(0,-1);if(s.toLowerCase().endsWith('/v1'))s=s.slice(0,-3);return s;};
async function readJSON(res:Response):Promise<any>{const raw=await res.text();let data:any;try{data=raw?JSON.parse(raw):{};}catch{throw new Error('The service returned HTTP '+res.status+' with a non-JSON response. Check endpoint and CORS settings.');}if(!res.ok)throw new Error(data?.error||data?.message||('Request failed (HTTP '+res.status+').'));return data;}
const toolSpecs=encartoToolDefinitions.map(t=>({type:'function',function:{name:t.function.name,description:t.function.description,parameters:t.function.parameters}}));
const hermesModelOptions=(payload:any):ModelOption[]=>{
 const rows:ModelOption[]=[];
 const providers=Array.isArray(payload?.providers)?payload.providers:Array.isArray(payload?.data)?payload.data:Array.isArray(payload?.options)?payload.options:[];
 for(const entry of providers){
  if(!entry||typeof entry!=='object')continue;
  const provider=String(entry.provider||entry.slug||entry.provider_id||entry.id||entry.name||'');
  const list=Array.isArray(entry.models)?entry.models:Array.isArray(entry.options)?entry.options:Array.isArray(entry.model_options)?entry.model_options:[];
  for(const model of list){
   if(typeof model==='string'){rows.push({id:model,label:(provider?provider+' / ':'')+model,provider:provider||undefined});continue;}
   if(!model||typeof model!=='object')continue;
   const id=String(model.id||model.model_id||model.model||model.name||'');
   if(id)rows.push({id,label:(provider?provider+' / ':'')+String(model.display_name||model.label||model.name||id),provider:String(model.provider||provider||'')||undefined});
  }
 }
 if(!rows.length){
  const simple=Array.isArray(payload?.models)?payload.models:Array.isArray(payload?.data)?payload.data:[];
  for(const model of simple){
   if(typeof model==='string')rows.push({id:model,label:model});
   else if(model&&typeof model==='object'){const id=String(model.id||model.model_id||model.model||model.name||'');if(id)rows.push({id,label:String(model.display_name||model.label||id),provider:typeof model.provider==='string'?model.provider:undefined});}
  }
 }
 const seen=new Set<string>();
 return rows.filter(m=>{const key=(m.provider||'')+'::'+m.id;if(seen.has(key))return false;seen.add(key);return true;});
};
const optionValue=(model:ModelOption)=>model.provider?model.provider+'::'+model.id:model.id;
const selectedOption=(models:ModelOption[],value:string)=>models.find(m=>optionValue(m)===value);
async function runOllama(baseURL:string,model:string,history:ChatMessage[]){
 const messages:any[]=[{role:'system',content:systemPrompt},...history],toolsUsed:string[]=[];
 for(let round=0;round<=3;round++){
  const res=await fetch(rootURL(baseURL)+'/v1/chat/completions',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model,messages,tools:toolSpecs,tool_choice:'auto',max_tokens:1200})});
  const payload=await readJSON(res),assistant=payload?.choices?.[0]?.message;
  if(!assistant)throw new Error('Ollama returned an unexpected chat-completion response.');
  const calls=Array.isArray(assistant.tool_calls)?assistant.tool_calls:[];
  if(!calls.length)return {content:typeof assistant.content==='string'?assistant.content:'',toolsUsed};
  if(round===3)return {content:typeof assistant.content==='string'&&assistant.content?assistant.content:'Reached the safe tool-call limit. Ask a follow-up to continue.',toolsUsed};
  messages.push(assistant);
  for(const call of calls.slice(0,4)){const name=String(call?.function?.name||'');let args:unknown=call?.function?.arguments||{};if(typeof args==='string'){try{args=JSON.parse(args);}catch{args={};}}const output=executeEncartoTool(name,args);if(encartoToolDefinitions.some(t=>t.function.name===name))toolsUsed.push(name);messages.push({role:'tool',tool_call_id:String(call?.id||('local-'+round+'-'+toolsUsed.length)),name,content:JSON.stringify(output)});}
 }
 return {content:'Could not finish within the safe tool-call limit.',toolsUsed};
}
const AIStudioPanel:React.FC=()=>{
 const [provider,setProvider]=useState<Provider>('nvidia'),[apiKey,setApiKey]=useState(''),[ollamaURL,setOllamaURL]=useState('http://127.0.0.1:11434'),[hermesURL,setHermesURL]=useState('http://127.0.0.1:8642');
 const [models,setModels]=useState<ModelOption[]>([]),[selectedModel,setSelectedModel]=useState(''),[messages,setMessages]=useState<ChatMessage[]>([]),[input,setInput]=useState('');
 const [loadingModels,setLoadingModels]=useState(false),[sending,setSending]=useState(false),[error,setError]=useState(''),[toolsUsed,setToolsUsed]=useState<string[]>([]);
 const cloud=useMemo(()=>['nvidia','openai','anthropic'].includes(provider),[provider]),localURL=provider==='ollama'?ollamaURL:hermesURL;
 const changeProvider=(p:Provider)=>{setProvider(p);setApiKey('');setModels([]);setSelectedModel('');setMessages([]);setError('');setToolsUsed([]);};
 const fetchModels=async()=>{setLoadingModels(true);setError('');setModels([]);setSelectedModel('');try{let payload:any;
  if(cloud){if(!apiKey.trim())throw new Error('Enter the provider API key first.');payload=await readJSON(await fetch('/api/ai/models',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({provider,apiKey:apiKey.trim()})}));}
  else{
   if(!rootURL(localURL))throw new Error('Enter the local service address.');
   const h:Record<string,string>={};
   if(provider==='hermes'){
    if(!apiKey.trim())throw new Error('Enter the Hermes API_SERVER_KEY configured on your computer.');
    h.Authorization='Bearer '+apiKey.trim();
    try{
     payload=await readJSON(await fetch(rootURL(hermesURL)+'/api/model/options?refresh=1',{headers:h,cache:'no-store'}));
     let found=hermesModelOptions(payload);
     if(found.length)payload={models:found};
     else payload=await readJSON(await fetch(rootURL(hermesURL)+'/v1/models',{headers:h,cache:'no-store'}));
    }catch{
     payload=await readJSON(await fetch(rootURL(hermesURL)+'/v1/models',{headers:h,cache:'no-store'}));
    }
    if(!Array.isArray(payload?.models))payload={models:hermesModelOptions(payload)};
    else if(payload.models.length&&payload.models[0]?.id===undefined)payload={models:hermesModelOptions(payload)};
   }else{
    payload=await readJSON(await fetch(rootURL(ollamaURL)+'/api/tags',{cache:'no-store'}));
    payload={models:(Array.isArray(payload?.models)?payload.models:[]).map((m:any)=>({id:String(m?.name||m?.model||''),label:String(m?.name||m?.model||'')})).filter((m:ModelOption)=>m.id)};
   }
  }
  const found:ModelOption[]=Array.isArray(payload?.models)?payload.models:[];setModels(found);if(found.length)setSelectedModel(optionValue(found[0]));else setError('No models returned. Check the key, endpoint, installed models, and provider access.');
 }catch(e){setError(e instanceof Error?e.message:'Could not load models.');}finally{setLoadingModels(false);}};
 const send=async(event:React.FormEvent)=>{event.preventDefault();const prompt=input.trim();if(!prompt||sending)return;if(!selectedModel){setError('Fetch models and select a model before sending.');return;}const selected=selectedOption(models,selectedModel);if(!selected){setError('Please select a model returned by the selected provider.');return;}if((cloud||provider==='hermes')&&!apiKey.trim()){setError('Enter the API key before sending.');return;}
  const history=[...messages,{role:'user' as const,content:prompt}];setMessages(history);setInput('');setSending(true);setError('');setToolsUsed([]);try{let result:{content:string;toolsUsed?:string[]};
   if(cloud)result=await readJSON(await fetch('/api/ai/chat',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({provider,apiKey:apiKey.trim(),model:selectedModel,messages:history})}));
   else if(provider==='ollama')result=await runOllama(ollamaURL,selectedModel,history);
   else{const payload=await readJSON(await fetch(rootURL(hermesURL)+'/v1/chat/completions',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+apiKey.trim()},body:JSON.stringify({model:selected.id,...(selected.provider?{provider:selected.provider}:{}),messages:[{role:'system',content:systemPrompt},...history],max_tokens:1200})}));const text=payload?.choices?.[0]?.message?.content;result={content:typeof text==='string'?text:''};}
   setMessages(curr=>[...curr,{role:'assistant',content:result.content||'The model returned an empty response.'}]);setToolsUsed(result.toolsUsed||[]);
  }catch(e){setError(e instanceof Error?e.message:'The AI request failed.');}finally{setSending(false);}};
 const clearChat=()=>{setMessages([]);setToolsUsed([]);setError('');};
 return <section className='max-w-6xl mx-auto space-y-6 pb-24'>
  <header className='flex flex-col lg:flex-row lg:items-end justify-between gap-4'><div><div className='flex items-center gap-3 mb-2'><div className='p-3 rounded-2xl bg-primary/20 text-primary border border-primary/20'><BrainCircuit size={28}/></div><h2 className='anime-title text-4xl md:text-5xl text-white uppercase tracking-wide'>AI Studio</h2></div><p className='text-sm text-gray-400 max-w-2xl'>Connect a cloud API key or a model running on this computer. Models are fetched from the selected provider.</p></div><div className='flex items-center gap-2 text-[10px] uppercase tracking-widest text-emerald-300'><ShieldCheck size={16}/> Keys are not saved</div></header>
  <div className='grid xl:grid-cols-[340px_minmax(0,1fr)] gap-5'>
   <aside className='glass-panel border border-white/10 rounded-3xl p-5 space-y-5 h-fit'>
    <div><label className='block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2'>AI provider</label><select value={provider} onChange={e=>changeProvider(e.target.value as Provider)} className='w-full rounded-xl border border-white/10 bg-slate-950 text-white px-3 py-3 text-sm'>{Object.entries(labels).map(([id,label])=><option key={id} value={id}>{label}</option>)}</select></div>
    {(cloud||provider==='hermes')&&<div><label className='flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2'><KeyRound size={13}/>{provider==='hermes'?'Hermes API server key':'Provider API key'}</label><input type='password' autoComplete='off' spellCheck={false} value={apiKey} onChange={e=>setApiKey(e.target.value)} placeholder={provider==='nvidia'?'nvapi-…':provider==='openai'?'sk-…':provider==='anthropic'?'sk-ant-…':'API_SERVER_KEY'} className='w-full rounded-xl border border-white/10 bg-black/50 text-white px-3 py-3 text-sm placeholder:text-gray-700'/>{provider==='openai'&&<p className='text-xs text-amber-200/80 mt-2'>OpenAI API billing is separate from ChatGPT Plus; a ChatGPT subscription does not include API credits.</p>}</div>}
    {provider==='ollama'&&<div><label className='block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2'>Ollama address</label><input value={ollamaURL} onChange={e=>setOllamaURL(e.target.value)} spellCheck={false} className='w-full rounded-xl border border-white/10 bg-black/50 text-white px-3 py-3 text-sm'/><p className='text-xs text-gray-500 mt-2'>Install Ollama and pull a tool-capable model. Configure allowed origins for the actual Encarto site origin. Local browser access may request permission.</p></div>}
    {provider==='hermes'&&<div><label className='block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2'>Hermes Agent address</label><input value={hermesURL} onChange={e=>setHermesURL(e.target.value)} spellCheck={false} className='w-full rounded-xl border border-white/10 bg-black/50 text-white px-3 py-3 text-sm'/><div className='text-xs text-gray-500 mt-2 space-y-1'><p>Install and configure Hermes separately, then run <code>hermes gateway</code>.</p><p>Set <code>API_SERVER_ENABLED=true</code>, a strong <code>API_SERVER_KEY</code>, and exact <code>API_SERVER_CORS_ORIGINS</code>.</p><p>Hermes uses its own configured model and native agent tools. Its model list may show an alias.</p></div></div>}
    <button onClick={fetchModels} disabled={loadingModels} className='w-full flex justify-center items-center gap-2 rounded-xl bg-primary hover:bg-blue-500 disabled:opacity-60 text-white font-black text-xs uppercase tracking-widest px-4 py-3'>{loadingModels?<Loader2 size={16} className='animate-spin'/>:<RefreshCw size={16}/>} Fetch models</button>
    <div><label className='block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2'>Model</label><select value={selectedModel} onChange={e=>setSelectedModel(e.target.value)} disabled={!models.length} className='w-full rounded-xl border border-white/10 bg-slate-950 text-white px-3 py-3 text-sm disabled:opacity-40'>{!models.length&&<option value=''>Fetch models first</option>}{models.map(m=><option key={optionValue(m)} value={optionValue(m)}>{m.label}</option>)}</select>{models.length>0&&<p className='text-xs text-gray-500 mt-2'>{models.length} model(s) discovered.</p>}</div>
    <div className='rounded-xl border border-white/10 bg-black/30 p-3 text-xs text-gray-400 flex gap-2'><TriangleAlert size={16} className='text-amber-300 shrink-0 mt-0.5'/><p>Provider catalogues may not confirm tool-call support. If a model rejects tools, choose another instruction/chat model.</p></div>
   </aside>
   <div className='glass-panel border border-white/10 rounded-3xl overflow-hidden flex flex-col min-h-[620px]'>
    <div className='px-5 py-4 border-b border-white/10 flex items-center justify-between gap-3 bg-black/20'><div className='flex items-center gap-3'><div className='p-2 rounded-xl bg-primary/15 text-primary'><Bot size={18}/></div><div><h3 className='text-sm text-white font-black uppercase tracking-widest'>{labels[provider]}</h3><p className='text-[10px] text-gray-500'>{selectedModel||'No model selected'}</p></div></div><button onClick={clearChat} className='text-[10px] uppercase font-black tracking-widest text-gray-500 hover:text-white'>Clear chat</button></div>
    <div className='flex-1 overflow-y-auto p-5 space-y-4'>{!messages.length&&<div className='h-full min-h-64 flex flex-col items-center justify-center text-center gap-4 text-gray-500'><div className='w-16 h-16 rounded-3xl border border-primary/20 bg-primary/10 text-primary flex items-center justify-center'><Cpu size={28}/></div><div><p className='text-sm text-white font-bold'>Ready when you are</p><p className='text-xs mt-1 max-w-sm'>Ask about games, tournaments, squads, progression, or general topics. Encarto's built-in tools are read-only.</p></div></div>}
     {messages.map((m,i)=><div key={i+'-'+m.role} className={'flex '+(m.role==='user'?'justify-end':'justify-start')}><div className={'max-w-[90%] rounded-2xl px-4 py-3 whitespace-pre-wrap text-sm leading-relaxed '+(m.role==='user'?'bg-primary/20 border border-primary/20 text-white':'bg-white/[0.04] border border-white/10 text-gray-200')}><div className='text-[9px] font-black uppercase tracking-widest text-gray-500 mb-2'>{m.role==='user'?'You':labels[provider]}</div>{m.content}</div></div>)}
     {sending&&<div className='flex items-center gap-2 text-primary text-xs'><Loader2 size={15} className='animate-spin'/> Thinking and running read-only tools…</div>}</div>
    {toolsUsed.length>0&&<div className='px-5 py-2 border-t border-white/5 bg-primary/5 flex items-center gap-2 text-[10px] text-primary'><Wrench size={13}/> Tools used: {toolsUsed.join(', ')}</div>}
    {error&&<div role='alert' className='mx-5 mb-2 p-3 rounded-xl border border-red-500/20 bg-red-500/10 text-sm text-red-200'>{error}</div>}
    <form onSubmit={send} className='p-4 border-t border-white/10 flex items-end gap-3'><textarea value={input} onChange={e=>setInput(e.target.value)} rows={2} maxLength={12000} placeholder='Message your selected model…' className='flex-1 resize-y min-h-12 max-h-40 rounded-xl border border-white/10 bg-black/40 text-white px-4 py-3 text-sm outline-none focus:border-primary'/><button type='submit' disabled={sending||!input.trim()} className='rounded-xl bg-primary hover:bg-blue-500 text-white p-3 disabled:opacity-40' aria-label='Send message'><Send size={18}/></button></form>
   </div>
  </div>
 </section>;
};
export default AIStudioPanel;
