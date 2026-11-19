// Arayüz metin denetimi: farklı oyun anlarında bütün sekmeleri açar, ekrandaki yazıda undefined/NaN/ek hatası arar, ekran görüntüsü alır.
import {createRequire} from 'node:module';const {chromium}=createRequire(import.meta.url)('playwright');import {resolve} from 'node:path';import fs from 'node:fs';
const out=process.env.OUT||'.';fs.mkdirSync(out,{recursive:true});const shots=process.argv.includes('--shots');
const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
let pg;const errs=[];
const BAD=/undefined|NaN|\bnull\b|\[object|Infinity/;const found=new Map();
const V='aeıioöuü',BK='aıou';const acc={a:'ı',ı:'ı',o:'u',u:'u',e:'i',i:'i',ö:'ü',ü:'ü'};const HARD='çfhkpsşt';
function lastV(x){for(let i=x.length-1;i>=0;i--)if(V.includes(x[i]))return x[i];return 'e';}
function suf(s){const re=/([A-Za-zÇĞİÖŞÜçğıöşü]+)'([a-zçğıöşü]+)/g;let m;while((m=re.exec(s))){const wd=m[1].toLocaleLowerCase('tr'),sf=m[2];if(/^(cemal|kemal|celal|hilal|resul|iqbal)$/.test(wd))continue;const lv=lastV(wd),ev=V.includes(wd.at(-1));const back=BK.includes(lv);
 const dat=(ev?'y':'')+(back?'a':'e'),ac=(ev?'y':'')+acc[lv],gen=(ev?'n':'')+acc[lv]+'n',loc=(HARD.includes(wd.at(-1))?'t':'d')+(back?'a':'e');
 if(/^y?[aeıiuü]$/.test(sf)){if(sf!==dat&&sf!==ac)return m[0];}else if(/^n?[ıiuü]n$/.test(sf)){if(sf!==gen)return m[0];}else if(/^[dt][ae]$/.test(sf)){if(sf!==loc)return m[0];}else if(/^[dt][ae]n$/.test(sf)){if(sf!==loc+'n')return m[0];}}return '';}
const scan=async tag=>{const t=await pg.evaluate(()=>document.body.innerText);for(const line of t.split('\n')){const s=suf(line);if(BAD.test(line)||s){const k=(s||line).slice(0,140);if(!found.has(k)){found.set(k,1);console.log('BULGU',tag+': '+line.slice(0,160));}}}};
const clear=async()=>{for(let i=0;i<12;i++){const c=await pg.$('.veil .card:not(.dz) button:not([disabled])');if(!c)break;await scan('kart');await c.click();await pg.waitForTimeout(30);}};
async function visit(tag){await clear();for(const t of ['santiye','arsa','ekip','hayat','aile','para']){await clear();await pg.click(`[data-a=tab][data-v=${t}]`);await pg.waitForTimeout(80);await scan(tag+'/'+t);
  if(shots){await pg.screenshot({path:`${out}/${tag}-${t}.png`});}
  const subs=await pg.$$('.sheet [data-a=sub]');for(let i=0;i<subs.length&&i<8;i++){try{await subs[i].click({timeout:2000});await pg.waitForTimeout(60);await scan(tag+'/'+t+'/sub');}catch{}}
  const sel=await pg.$('.sheet [data-a=sel]');if(sel&&t==='santiye'){await sel.click();await pg.waitForTimeout(80);await scan(tag+'/detay');if(shots)await pg.screenshot({path:`${out}/${tag}-detay.png`});await pg.click(`[data-a=tab][data-v=${t}]`).catch(()=>{});}
  await pg.click(`[data-a=tab][data-v=${t}]`).catch(()=>{});}}
const start=async(sc,c)=>{if(pg)await pg.context().close();const ctx=await b.newContext({viewport:{width:390,height:844}});pg=await ctx.newPage();pg.setDefaultTimeout(120000);pg.on('pageerror',e=>errs.push(e.message));await pg.addInitScript(()=>{try{localStorage.setItem('sb_q','0');localStorage.setItem('sb_tut','0');localStorage.setItem('sb_rep','0')}catch{}});await pg.goto('file://'+resolve('dist/index.html'));await pg.waitForTimeout(1500);await pg.click('[data-a=newin][data-v="1"]');await pg.click(`[data-a=pickS][data-v=${sc}]`);await pg.click(`[data-a=pickC][data-v=${c}]`);await pg.click('[data-a=start]');await pg.waitForTimeout(800);};
const adv=yrs=>pg.evaluate(y=>{const g=window.__g;const W=g.w;for(let i=0;i<y*12&&!W.over;i++){g.S.botTurn(W);g.S.advance(W);}g.S.botTurn(W);W.result=null;g.set(W);return{st:W.firm&&W.firm.stage,gen:W.gen};},yrs);
for(const [sc,c,steps] of [['hapis','van',[0,12,40]],['gurbet','izmir',[0,25,90]]]){await start(sc,c);for(let i=0;i<steps.length;i++){if(i)console.log(sc,await adv(steps[i]-steps[i-1]));await visit(`${sc}${steps[i]}`);}}
await b.close();console.log('sayfa hataları',errs.length,errs.slice(0,5));
