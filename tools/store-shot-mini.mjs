// App Store ekran görüntüleri: 1290x2796 (iPhone 6.7"). Çıktı: store/screenshots/*.png
import {createRequire} from 'node:module';const {chromium}=createRequire(import.meta.url)('playwright');import {resolve} from 'node:path';import fs from 'node:fs';
const out=resolve('store/screenshots');fs.mkdirSync(out,{recursive:true});
const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const ctx=await b.newContext({viewport:{width:430,height:932},deviceScaleFactor:3});const pg=await ctx.newPage();pg.setDefaultTimeout(180000);const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.addInitScript(()=>{try{localStorage.setItem('sb_q','2');localStorage.setItem('sb_tut','0');localStorage.setItem('sb_rep','0')}catch{}});
await pg.goto('file://'+resolve('dist/index.html'));await pg.waitForTimeout(3000);
const shot=async n=>{await pg.waitForTimeout(800);await pg.screenshot({path:`${out}/${n}.png`,timeout:180000});console.log('ok',n);};
await pg.click('[data-a=newin][data-v="1"]');await pg.click('[data-a=pickS][data-v=koy]');await pg.click('[data-a=pickC][data-v=istanbul]');await pg.click('[data-a=start]');await pg.waitForTimeout(1500);
const clear=async()=>{for(let i=0;i<12;i++){const c=await pg.$('.veil .card:not(.dz) button:not([disabled])');if(!c)break;await c.click();await pg.waitForTimeout(30);}};
const adv=yrs=>pg.evaluate(y=>{const g=window.__g;const W=g.w;for(let i=0;i<y*12&&!W.over;i++){g.S.botTurn(W);g.S.advance(W);}g.S.botTurn(W);W.cards=[];W.result=null;W.report=null;g.city.t=.40;g.set(W);return W.firm&&W.firm.stage;},yrs);
await pg.evaluate(()=>{const g=window.__g;g.w.cards=[];g.set(g.w);});
// mini oyun
await pg.evaluate(()=>window.__g.openMini('seramik',{skill:60,onDone:()=>{}}));await pg.waitForTimeout(800);const c2=await pg.$('.mgc');const bb=await c2.boundingBox();await pg.waitForTimeout(1500);await shot('6_mini');
await b.close();console.log('hatalar',errs);
