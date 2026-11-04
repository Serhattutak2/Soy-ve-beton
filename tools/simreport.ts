import {newWorld,advance,botTurn} from '../src/core/sim';import {year,age,pl} from '../src/core/util';import {STAGES} from '../src/core/data';
const N=+(process.argv[2]||16);const Y=+(process.argv[3]||130);const rows:any[]=[];
for(let s=0;s<N;s++){const w=newWorld({seed:1000+s*7});const y0=year(w);const mark:Record<number,number>={};let lastG=1;const gs:Record<number,number>={};let endY=0;
 while(year(w)-y0<Y&&!w.over){botTurn(w);advance(w);const st=w.firm?w.firm.stage:-1;if(st>=0&&mark[st]===undefined)mark[st]=year(w)-y0;if(w.gen!==lastG){gs[lastG]=w.firm?w.firm.stage:-1;lastG=w.gen;}endY=year(w)-y0;}
 rows.push({s,scen:w.scen,city:w.city,end:endY,over:w.over?.why?.slice(0,12)??'',gen:w.gen,peak:w.peakStage,now:w.firm?.stage,t3:mark[3],t12:mark[12],t20:mark[20],t29:mark[29],bank:w.stats.bankrupt,col:w.stats.collapse,jail:w.stats.jail,cash:Math.round(w.cash),debt:Math.round(w.debt),gs:Object.values(gs).join(",")});}
console.table(rows);
