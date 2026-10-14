import {describe,expect,it} from 'vitest';
import {encartoToolDefinitions,executeEncartoTool} from '../aiTools.ts';
describe('Encarto AI read-only tools',()=>{
 it('contains only the allowlisted tools',()=>expect(encartoToolDefinitions.map((t)=>t.function.name)).toEqual(['get_encarto_game_catalog','get_encarto_platform_help','get_current_time']));
 it('returns the game catalog without account secrets',()=>{const r=executeEncartoTool('get_encarto_game_catalog') as {games:Array<{name:string}>};expect(r.games.some((g)=>g.name==='Encarto Arena')).toBe(true);expect(JSON.stringify(r)).not.toMatch(/password|session|balance|api.?key/i)});
 it('validates help topics',()=>{expect(executeEncartoTool('get_encarto_platform_help',{topic:'wallet'})).toHaveProperty('topic','wallet');expect(executeEncartoTool('get_encarto_platform_help',{topic:'root_access'})).toHaveProperty('error')});
 it('rejects non-allowlisted tools',()=>expect(executeEncartoTool('delete_account',{})).toHaveProperty('error'));
 it('returns a UTC ISO timestamp',()=>{expect(executeEncartoTool('get_current_time')).toMatchObject({timezone:'UTC'});expect((executeEncartoTool('get_current_time') as {timestamp:string}).timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T.*Z$/)});
});
