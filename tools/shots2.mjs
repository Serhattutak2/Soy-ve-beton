import {createRequire} from 'node:module';import {resolve} from 'node:path';const {chromium}=createRequire(import.meta.url)('playwright');const out=process.env.OUT;
const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--enable-webgl']});const pg=await b.newPage({viewport:{width:390,height:844}});const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.goto('file://'+resolve('dist/index.html'));await pg.waitForTimeout(1500);await pg.click('[data-a=menu][data-v=new]');await pg.click('[data-a=pickS][data-v=dul]');await pg.click('[data-a=pickC][data-v=ankara]');await pg.click('[data-a=start]');await pg.waitForTimeout(1000);
await pg.evaluate(()=>{const g=window.__g;const W=g.w;W.cards=[];W.result=null;W.cash=200000;g.city.t=.42;g.set(W);});await pg.waitForTimeout(4000);await pg.screenshot({path:out+'/a.png'});
const s=async(n,fn)=>{await pg.evaluate(fn);await pg.waitForTimeout(500);await pg.screenshot({path:out+'/'+n+'.png'});};
await pg.click('[data-a=tab][data-v=santiye]');await pg.waitForTimeout(100);await pg.click('[data-a=sel]');await pg.waitForTimeout(200);await pg.screenshot({path:out+'/b.png'});
await pg.click('[data-a=sub][data-v=daire]');await pg.waitForTimeout(200);await pg.screenshot({path:out+'/c.png'});
await pg.click('[data-a=tab][data-v=arsa]');await pg.waitForTimeout(200);await pg.screenshot({path:out+'/d.png'});
const h=await pg.$('[data-a=pz]');if(h){await h.click();await pg.waitForTimeout(100);await pg.click('[data-x=para]');await pg.waitForTimeout(200);await pg.screenshot({path:out+'/e.png'});}
await pg.click('[data-a=tab][data-v=para]');await pg.waitForTimeout(200);await pg.screenshot({path:out+'/f.png'});
await pg.click('[data-a=tab][data-v=para]');await pg.evaluate(()=>{const g=window.__g;const W=g.w;const p=W.projects[0];for(const it of p.items){it.q='nor';}const i=p.items.findIndex(x=>x.id==='duvar');p.cur=i;p.items[i].prog=.6;p.floors=6;g.set(W);});await pg.waitForTimeout(3000);await pg.screenshot({path:out+'/g.png'});
await pg.evaluate(()=>{const g=window.__g;const W=g.w;const p=W.projects[0];const i=p.items.findIndex(x=>x.id==='cephe');p.cur=i;p.items[i].prog=.7;g.set(W);});await pg.waitForTimeout(3000);await pg.screenshot({path:out+'/h.png'});
await b.close();console.log('err',errs);
