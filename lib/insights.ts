import type {Player,Team} from './recommend';

const slots:Record<string,number>={QB:2,RB:2,WR:3,TE:1};
const scarcity:Record<string,number>={QB:1.34,RB:1.18,WR:1.0,TE:.98,K:.45,DEF:.5};
const depthTarget:Record<string,number>={QB:3,RB:5,WR:6,TE:2};
const clamp=(n:number,a=0,b=100)=>Math.max(a,Math.min(b,n));
const pts=(p:Player)=>Number(p.points||0);

export function playerValue(p:Player,all:Player[]=[]){
  const position=p.position||'UNK';
  const peers=all.filter(x=>x.position===position).map(pts).sort((a,b)=>b-a);
  const rank=Math.max(0,peers.findIndex(x=>x<=pts(p)));
  const percentile=peers.length?1-rank/Math.max(1,peers.length-1):.5;
  const own=Number(p.percent_owned||0)/100;
  const injury=/IR|OUT|PUP|SUSP/i.test(p.status||'')?-.18:/Q|QUESTION|DOUBT/i.test(p.status||'')?-.06:0;
  const raw=42+percentile*36+Math.min(14,pts(p)/8)+(scarcity[position]||.75)*7+own*4+injury*100;
  return Math.round(clamp(raw));
}
function count(team:Team,pos:string){return (team.players||[]).filter(p=>p.position===pos).length}
export function positionNeed(team:Team,pos:string,all:Player[]=[]){
  const ps=(team.players||[]).filter(p=>p.position===pos).sort((a,b)=>playerValue(b,all)-playerValue(a,all));
  const starterN=slots[pos]||1; const target=depthTarget[pos]||starterN+1;
  const starterAvg=ps.slice(0,starterN).reduce((s,p)=>s+playerValue(p,all),0)/Math.max(1,Math.min(starterN,ps.length));
  const quantityGap=Math.max(0,target-ps.length);
  const qualityGap=Math.max(0,74-starterAvg);
  const score=clamp(quantityGap*15+qualityGap*.9+(pos==='QB'&&ps.length<3?12:0));
  return {position:pos,score:Math.round(score),count:ps.length,starterAvg:Math.round(starterAvg),label:score>=70?'Critical':score>=48?'High':score>=28?'Medium':'Low',why:quantityGap?`${ps.length} ${pos}s vs ${target} preferred depth; ${pos==='QB'?'2-QB scarcity makes the shortage especially costly.':'depth is thin.'}`:qualityGap>10?`Enough bodies, but current ${pos} starter quality trails the league target.`:`Position is comparatively stable; upgrade only for clear value.`};
}
export function allTeamNeeds(teams:Team[],all:Player[]){return teams.map(t=>{const needs=['QB','RB','WR','TE'].map(pos=>positionNeed(t,pos,all)).sort((a,b)=>b.score-a.score);return {team:t.name,needs,top:needs[0]};})}
export function bestDrop(team:Team,target:Player,all:Player[]){
  const candidates=(team.players||[]).filter(p=>p.name!==target.name).map(p=>({p,value:playerValue(p,all)})).sort((a,b)=>a.value-b.value);
  const protectedPositions=new Set(['QB']);
  const viable=candidates.filter(x=>!(protectedPositions.has(x.p.position||'')&&count(team,x.p.position||'')<=3));
  return (viable[0]||candidates[0])?.p;
}
export function warRoomScore(target:Player,team:Team,all:Player[]){
  const need=positionNeed(team,target.position||'',all); const val=playerValue(target,all); const drop=bestDrop(team,target,all); const dropVal=drop?playerValue(drop,all):0;
  const net=val-dropVal; const score=clamp(val*.52+need.score*.32+clamp(net+30)*.16);
  const why=`${target.name} carries a ${val}/100 Fantasy Fools value. ${need.why} Adding him would ${net>=10?'materially improve':net>=0?'improve':'not clearly improve'} the roster versus the best current cut.`;
  const dropWhy=drop?`${drop.name} is the lowest-cost roster spot in this model (${dropVal}/100). Cutting him preserves stronger starters/depth while creating a projected net value change of ${net>=0?'+':''}${net}.`:'No clear drop candidate is available.';
  return {score:Math.round(score),grade:score>=90?'A+':score>=84?'A':score>=77?'A-':score>=70?'B+':score>=63?'B':score>=55?'C+':'C',value:val,need:need.score,drop,dropValue:dropVal,net,why,dropWhy};
}
export function tradeValue(p:Player,all:Player[]){const v=playerValue(p,all);return Math.round(v*1.35+(v>=90?18:v>=82?9:0)+(p.position==='QB'?8:0));}
export function evaluateTrade(teamA:Team,teamB:Team,giveA:Player[],giveB:Player[],all:Player[]){
 const aOut=giveA.reduce((s,p)=>s+tradeValue(p,all),0),aIn=giveB.reduce((s,p)=>s+tradeValue(p,all),0),bOut=aIn,bIn=aOut;
 const needBoost=(team:Team,incoming:Player[])=>incoming.reduce((s,p)=>s+positionNeed(team,p.position||'',all).score*.12,0);
 const aNet=Math.round(aIn-aOut+needBoost(teamA,giveB)), bNet=Math.round(bIn-bOut+needBoost(teamB,giveA));
 const fairness=clamp(100-Math.abs(aIn-aOut)*1.15); const overall=Math.round(fairness*.55+clamp(70+aNet)*.225+clamp(70+bNet)*.225);
 return {aOut,aIn,bOut,bIn,aNet,bNet,fairness:Math.round(fairness),score:overall,verdict:overall>=85?'Strong structure':overall>=72?'Workable':overall>=60?'Needs adjustment':'Poor fit',whyA:`${teamA.name} receives ${aIn} raw trade-value points for ${aOut} sent. Need-adjusted roster impact: ${aNet>=0?'+':''}${aNet}.`,whyB:`${teamB.name} receives ${bIn} raw trade-value points for ${bOut} sent. Need-adjusted roster impact: ${bNet>=0?'+':''}${bNet}.`};
}
export function tradeRecommendations(mine:Team|undefined,teams:Team[],all:Player[]){
 if(!mine)return []; const myNeeds=allTeamNeeds([mine],all)[0].needs; const out:any[]=[];
 for(const other of teams.filter(t=>t.name!==mine.name)){
  const theirNeeds=allTeamNeeds([other],all)[0].needs;
  const targetPositions=myNeeds.filter(n=>n.score>=28).slice(0,2).map(n=>n.position);
  const offerPositions=theirNeeds.filter(n=>n.score>=28).slice(0,2).map(n=>n.position);
  const targets=(other.players||[]).filter(p=>targetPositions.includes(p.position||'')).sort((a,b)=>tradeValue(b,all)-tradeValue(a,all)).slice(0,3);
  const offers=(mine.players||[]).filter(p=>offerPositions.includes(p.position||'')).sort((a,b)=>tradeValue(a,all)-tradeValue(b,all));
  for(const target of targets){
   const tv=tradeValue(target,all); const offer=offers.filter(p=>p.name!==target.name).sort((a,b)=>Math.abs(tradeValue(a,all)-tv)-Math.abs(tradeValue(b,all)-tv))[0]; if(!offer)continue;
   const ev=evaluateTrade(mine,other,[offer],[target],all);
   out.push({partner:other.name,target,offer,score:ev.score,myNet:ev.aNet,partnerNet:ev.bNet,reason:`${target.position} addresses Nixflix's ${positionNeed(mine,target.position||'',all).label.toLowerCase()} need; ${offer.position} aligns with ${other.name}'s ${positionNeed(other,offer.position||'',all).label.toLowerCase()} need.`});
  }
 }
 return out.sort((a,b)=>(b.score+b.myNet)-(a.score+a.myNet)).slice(0,18);
}
export function powerRankings(teams:Team[],all:Player[]){return teams.map(t=>{const top=(t.players||[]).map(p=>playerValue(p,all)).sort((a,b)=>b-a);return {team:t.name,score:Math.round(top.slice(0,9).reduce((s,v)=>s+v,0)+top.slice(9,14).reduce((s,v)=>s+v*.22,0)),top:(t.players||[]).sort((a,b)=>playerValue(b,all)-playerValue(a,all))[0]?.name||'—'}}).sort((a,b)=>b.score-a.score).map((x,i)=>({...x,rank:i+1}));}
export function optimizeLineup(players:Player[],all:Player[]){const rem=[...players].sort((a,b)=>playerValue(b,all)-playerValue(a,all));const order=['QB','QB','RB','RB','WR','WR','WR','TE','FLEX'];const starters:any[]=[];for(const slot of order){const i=rem.findIndex(p=>slot==='FLEX'?['RB','WR','TE'].includes(p.position||''):p.position===slot);if(i<0){starters.push({slot,player:null,value:0});continue}const [player]=rem.splice(i,1);starters.push({slot,player,value:playerValue(player,all)})}return {starters,bench:rem}}
