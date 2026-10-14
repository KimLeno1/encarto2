import { ArticleData } from './types.ts';

async function postJSON<T>(path:string,body:Record<string,unknown>):Promise<T>{
 const response=await fetch(path,{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},cache:'no-store',body:JSON.stringify(body)});
 const raw=await response.text();let payload:any;
 try{payload=raw?JSON.parse(raw):{};}catch{throw new Error('AI service returned HTTP '+response.status+' with a non-JSON response. Check the API deployment.');}
 if(!response.ok)throw new Error(typeof payload?.error==='string'?payload.error:'AI request failed (HTTP '+response.status+').');
 return payload as T;
}
export async function getEncyclopediaEntry(query:string):Promise<ArticleData>{return postJSON<ArticleData>('/api/ai/gemini/encyclopedia',{query});}
export async function generateBrandMascot():Promise<string>{return (await postJSON<{image:string}>('/api/ai/gemini/image',{placement:'mascot'})).image;}
export async function generateTopicImage(topic:string):Promise<string>{return (await postJSON<{image:string}>('/api/ai/gemini/image',{placement:'topic',topic})).image;}
export async function generateSpeech(text:string):Promise<Uint8Array>{const result=await postJSON<{audioBase64:string}>('/api/ai/gemini/speech',{text});const binary=atob(result.audioBase64);const bytes=new Uint8Array(binary.length);for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);return bytes;}
export const decodePCM=async(data:Uint8Array,ctx:AudioContext):Promise<AudioBuffer>=>{const pcm=new Int16Array(data.buffer,data.byteOffset,Math.floor(data.byteLength/2));const buffer=ctx.createBuffer(1,pcm.length,24000);const channels=buffer.getChannelData(0);for(let i=0;i<pcm.length;i++)channels[i]=pcm[i]/32768;return buffer;};
