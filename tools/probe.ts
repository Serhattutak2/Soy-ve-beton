import {newWorld,advance,botTurn,stageKeys,canStart} from '../src/core/sim';import {year,age,pl} from '../src/core/util';
const w=newWorld({seed:+(process.argv[2]||1000)});const y0=year(w);console.log(w.scen,w.city);
while(year(w)-y0<+(process.argv[3]||150)&&!w.over){botTurn(w);advance(w);if(w.m%(12*+(process.argv[4]||8))===0)console.log(year(w)-y0,'g',w.gen,'a',age(w,pl(w)),'st',w.firm?.stage,'rep',Math.round(w.firm?.rep||0),'cert',w.firm?.cert,'cash',Math.round(w.cash),'debt',Math.round(w.debt),'bank',w.stats.bankrupt,'hp',Math.round(w.health),'pr',w.projects.map(p=>p.stage+(p.status[0])+(p.halt?'H:'+p.reason:'')+Math.round(p.prog*100)).join(' ').slice(0,60),'of',w.offers.map(o=>o.stage+':'+stageKeys(w,o.stage).map(k=>k.ok?1:0).join('')+(canStart(w,o)?'Y':'')).join(','));}
console.log(w.log.slice(0,25).map(l=>Math.floor(l.m/12)+' '+l.t.slice(0,70)).join('\n'));
import {monthly} from '../src/core/sim';import {STAGES} from '../src/core/data';
console.log(monthly(w).map(l=>l.n+':'+Math.round(l.v)).join(' | '));console.log(STAGES.slice(0,8).map(s=>Math.round(s.cost)+'/'+Math.round(s.net)).join(' '));console.log(JSON.stringify(w.stock));
