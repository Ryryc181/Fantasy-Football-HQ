import {yahooGet} from './yahoo';
import {extractPlayers,extractTeams} from './normalize';
export async function getLiveLeague(){
 const leagueKey=process.env.YAHOO_LEAGUE_KEY;if(!leagueKey)return null;
 try{
  const [standings,scoreboard,teamsRaw]=await Promise.all([yahooGet(`league/${leagueKey}/standings`),yahooGet(`league/${leagueKey}/scoreboard`),yahooGet(`league/${leagueKey}/teams`)]);
  const teams=extractTeams(teamsRaw);const keys:any[]=[];
  const scan=(v:any)=>{if(Array.isArray(v))v.forEach(scan);else if(v&&typeof v==='object'){if(v.team_key&&v.name)keys.push({key:v.team_key,name:typeof v.name==='string'?v.name:Array.isArray(v.name)?v.name[0]:''});Object.values(v).forEach(scan)}};scan(teamsRaw);
  for(const team of teams){const tk=keys.find(x=>x.name===team.name)?.key;if(tk){const rr=await yahooGet(`team/${tk}/roster;out=players`);team.players=extractPlayers(rr)}}
  let free_agents:any[]=[];for(let start=0;start<250;start+=25){const raw=await yahooGet(`league/${leagueKey}/players;status=FA;sort=AR;start=${start};count=25`);const p=extractPlayers(raw);free_agents.push(...p);if(p.length<20)break}
  free_agents=[...new Map(free_agents.map((p:any)=>[p.name,p])).values()];
  return {league_key:leagueKey,synced_at:new Date().toISOString(),teams,free_agents,standings,scoreboard};
 }catch(e:any){return {error:e.message,teams:[],free_agents:[]}}
}
