export const encartoToolDefinitions = [
  { type: 'function', function: { name: 'get_encarto_game_catalog', description: 'List games available in the Encarto gaming hub.', parameters: { type: 'object', properties: {}, additionalProperties: false } } },
  { type: 'function', function: { name: 'get_encarto_platform_help', description: 'Get concise, factual help for a read-only Encarto feature.', parameters: { type: 'object', properties: { topic: { type: 'string', enum: ['arena','tournaments','teams','chat','progression','wallet','security'] } }, required: ['topic'], additionalProperties: false } } },
  { type: 'function', function: { name: 'get_current_time', description: 'Get the current server time as an ISO 8601 timestamp in UTC.', parameters: { type: 'object', properties: {}, additionalProperties: false } } },
];
const games = [{name:'Encarto Arena',mode:'Real-time 2D multiplayer combat'},{name:'Chess',mode:'Strategy board game'},{name:'Checkers',mode:'Strategy board game'},{name:'Car Racing',mode:'Racing'},{name:'Stunt Bike Racing',mode:'Racing and stunts'}];
const help: Record<string,string> = {
arena:'Encarto Arena is the real-time 2D combat mode. Use the Arena entry in More. Matchmaking availability depends on the hosted backend.',
tournaments:'The Tournaments panel lists events and schedules. Registration, fees, tickets, and live brackets depend on the server-side tournament implementation.',
teams:'Squad Hub is the teams area for discovery, join requests, and membership. Do not share passwords or private credentials in public chat.',
chat:'Chat Hub is the community messaging interface. Treat public messages as public; never share API keys, passwords, or payment details.',
progression:'Progression tracks rank, experience, and match history. Rank, experience, and balances must be awarded by the server, never by a client or AI response.',
wallet:'Wallet and M3GA balances are account data. This assistant is read-only and cannot modify balances.',
security:'Use a unique password and never paste passwords, session cookies, API keys, or payment details into prompts. Cloud API keys are not saved by Encarto.'
};
export function executeEncartoTool(name:string,input:unknown={}):unknown {
 let args:Record<string,unknown>={};
 if(typeof input==='string'){try{args=JSON.parse(input) as Record<string,unknown>}catch{return {error:'Invalid JSON tool arguments.'}}}
 else if(input&&typeof input==='object'&&!Array.isArray(input)) args=input as Record<string,unknown>;
 switch(name){
 case 'get_encarto_game_catalog': return {games};
 case 'get_encarto_platform_help': {const topic=typeof args.topic==='string'?args.topic:'';return help[topic]?{topic,help:help[topic]}:{error:'Unknown help topic. No action was performed.'};}
 case 'get_current_time': return {timestamp:new Date().toISOString(),timezone:'UTC'};
 default: return {error:'Tool not allowlisted. No action was performed.'};
 }
}
