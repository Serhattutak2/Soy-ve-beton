// Gerçek tarayıcıda oyunu açar, ekran görüntüsü alır, bütün düğmelere basar. Sayfa hatası testi düşürür.
import {createRequire} from 'node:module';const {chromium}=createRequire(import.meta.url)('playwright');
import {resolve} from 'node:path';
const shots=process.argv.includes('--shots');const out=process.env.OUT||'.';
const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--enable-webgl']});
const pg=await b.newPage({viewport:{width:390,height:844}});const errs=[];pg.on('pageerror',e=>errs.push(e.message));pg.on('console',m=>{if(m.type()==='error'&&!/ERR_|fonts/.test(m.text()))errs.push(m.text());});
await pg.goto('file://'+resolve('dist/index.html'));await pg.waitForTimeout(5000);const snap=async n=>{if(shots)await pg.screenshot({path:`${out}/${n}.png`});};await snap('1-menu');
await pg.click('[data-a=menu][data-v=new]');await pg.waitForTimeout(300);await snap('2-new');await pg.click('[data-a=pickS][data-v=koy]');await pg.click('[data-a=pickC][data-v=sahil]');await pg.click('[data-a=start]');await pg.waitForTimeout(4000);await snap('3-start');
const clear=async()=>{for(let i=0;i<8;i++){const c=await pg.$('.card button:not([disabled])');if(!c)break;await c.click();await pg.waitForTimeout(40);}};await clear();
for(const t of ['is','santiye','hayat','aile','para','defter']){await pg.click(`[data-a=tab][data-v=${t}]`);await pg.waitForTimeout(150);await snap('4-'+t);}
await pg.click('[data-a=tab][data-v=defter]');
// botla ileri sar
const adv=async yrs=>pg.evaluate(y=>{const g=window.__g;const W=g.w;for(let i=0;i<y*12;i++){g.S.botTurn(W);g.S.advance(W);}g.S.botTurn(W);W.cards=[];W.result=null;g.set(W);return{y:Math.floor(W.m/12),st:W.firm&&W.firm.stage,gen:W.gen,bd:W.buildings.length,pr:W.projects.length};},yrs);
for(const [yrs,n] of [[22,'a'],[28,'b'],[35,'c']]){console.log(await adv(yrs));await pg.waitForTimeout(3500);await pg.evaluate(k=>{const c=window.__g.city;c.t={a:.5,b:.73,c:.92}[k];c.shot=0;c.shotT=30;},n);await pg.waitForTimeout(3000);await snap('5-city-'+n);
 for(const t of ['is','santiye','hayat','aile','para','defter']){await clear();await pg.click(`[data-a=tab][data-v=${t}]`);await pg.waitForTimeout(100);if(n==='a')await snap(`6-${t}`);
  const bs=await pg.$$('.sheet button:not([disabled])');for(let i=0;i<bs.length&&i<12;i++){try{await pg.evaluate(el=>el.isConnected&&el.click(),bs[i]);}catch{} await clear();}
  if(await pg.$(`.tabs [data-v=${t}].on`))await pg.click(`[data-a=tab][data-v=${t}]`);}}
if(shots){await pg.evaluate(()=>{const g=window.__g;g.w.cards=[{id:'ceza_vergi',a:{}}];g.set(g.w);});await pg.waitForTimeout(1500);await snap('7-card');console.log('kart',await pg.evaluate(()=>{const c=document.querySelector('.card');return c&&JSON.stringify(c.getBoundingClientRect())+getComputedStyle(c).opacity;}));}
await b.close();console.log('hatalar:',errs.length,errs.slice(0,8));process.exit(errs.length?1:0);
