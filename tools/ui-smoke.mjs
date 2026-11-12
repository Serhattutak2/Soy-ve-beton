// Gerçek tarayıcıda oyunu açar, ekranları gezer, mini oyunları oynar, düğmelere basar. Sayfa hatası testi düşürür.
import {createRequire} from 'node:module';const {chromium}=createRequire(import.meta.url)('playwright');
import {resolve} from 'node:path';
const shots=process.argv.includes('--shots');const out=process.env.OUT||'.';
const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--enable-webgl','--autoplay-policy=no-user-gesture-required']});
const pg=await b.newPage({viewport:{width:390,height:844}});pg.setDefaultTimeout(120000);const errs=[];pg.on('pageerror',e=>errs.push(e.message));pg.on('console',m=>{if(m.type()==='error'&&!/ERR_|fonts|net::/.test(m.text()))errs.push(m.text());});
await pg.goto('file://'+resolve('dist/index.html'));await pg.waitForTimeout(4000);const snap=async n=>{if(shots)await pg.screenshot({path:`${out}/${n}.png`,timeout:120000});};await snap('01-menu');
await pg.click('[data-a=menu][data-v=set]');await pg.waitForTimeout(200);await snap('02-ayar');await pg.click('[data-a=snd][data-v=music]');await pg.click('[data-a=snd][data-v=music]');await pg.click('[data-a=menu][data-v=home]');
await pg.click('[data-a=menu][data-v=mus]');await pg.waitForTimeout(150);await pg.click('[data-a=menu][data-v=home]');
await pg.click('[data-a=newin][data-v="1"]');await pg.click('[data-a=pickS][data-v=koy]');await pg.click('[data-a=pickC][data-v=istanbul]');await pg.click('[data-a=start]');await pg.waitForTimeout(3500);
const clear=async()=>{for(let i=0;i<10;i++){const c=await pg.$('.veil .card:not(.dz) button:not([disabled])');if(!c)break;await c.click();await pg.waitForTimeout(40);}};await clear();await snap('03-start');
// İşçi mini oyunu: demir
await pg.evaluate(()=>{window.__g.w.trade='demir';window.__g.set(window.__g.w);});await pg.click('[data-a=workmini]');await pg.waitForTimeout(500);await snap('04-demir');
const cv=await pg.$('.mgc');const bx=await cv.boundingBox();for(let i=0;i<10;i++){await pg.mouse.move(bx.x+bx.width*.55,bx.y+bx.height-34-i*3);await pg.mouse.down();await pg.mouse.move(bx.x+bx.width*.55,bx.y+bx.height-40-i*(bx.height-70)/11,{steps:3});await pg.mouse.up();}
await pg.click('.mgbtn button');await pg.waitForTimeout(2600);await snap('05-demir-son');await pg.click('.mgbtn button');await pg.waitForTimeout(200);
// Bütün mini oyunlar: aç, biraz oyna, bitir
for(const k of ['beton','duvar','kalip','siva','denetim','cekic','seramik','elektrik']){await pg.evaluate(k=>window.__g.openMini(k,{skill:60,defects:[{trade:'demir',txt:'Etriye eksik'},{trade:'beton',txt:'Boşluk'},{trade:'kalip',txt:'Kaçık'}],onDone:()=>{window.__mgdone=k;}}),k);await pg.waitForTimeout(400);const c2=await pg.$('.mgc');const bb=await c2.boundingBox();
 for(let i=0;i<8;i++){await pg.mouse.click(bb.x+bb.width*(.2+.08*i),bb.y+bb.height*(.35+.05*(i%4)));await pg.waitForTimeout(60);}
 if(k==='beton'){await pg.click('.mgbtn button');await pg.mouse.move(bb.x+40,bb.y+80);await pg.mouse.down();for(let j=0;j<30;j++){await pg.mouse.move(bb.x+30+(j%6)*(bb.width-60)/6,bb.y+70+Math.floor(j/6)*(bb.height-90)/5,{steps:2});await pg.waitForTimeout(40);}await pg.mouse.up();}
 await snap('06-'+k);for(let t=0;t<6;t++){const bt=await pg.$('.mgbtn button');if(!bt)break;try{await bt.click({timeout:3000});}catch{}await pg.waitForTimeout(700);if(!(await pg.$('.mgov')))break;}
 if(await pg.$('.mgov'))await pg.click('[data-m=skip]');}
// Botla ileri sar, sekmeleri gez
const adv=async yrs=>pg.evaluate(y=>{const g=window.__g;const W=g.w;for(let i=0;i<y*12;i++){g.S.botTurn(W);g.S.advance(W);}g.S.botTurn(W);W.cards=[];W.result=null;g.city.t=.42;g.set(W);return{y:Math.floor(W.m/12),st:W.firm&&W.firm.stage,gen:W.gen,bd:W.buildings.length,pr:W.projects.length};},yrs);
for(const [yrs,n] of [[24,'a'],[22,'b']]){console.log(await adv(yrs));await pg.evaluate(()=>{const c=window.__g.city;c.shot=0;c.shotT=30;});await pg.waitForTimeout(3500);await snap('07-sehir-'+n);
 for(const t of ['santiye','arsa','ekip','hayat','aile','para']){await clear();await pg.click(`[data-a=tab][data-v=${t}]`);await pg.waitForTimeout(120);if(n==='a')await snap(`08-${t}`);
  if(t==='santiye'){const s=await pg.$('[data-a=sel]');if(s){await s.click();await pg.waitForTimeout(150);await snap('09-detay-'+n);const d=await pg.$('[data-a=durus]:not([disabled])');if(d){await d.click();await pg.waitForTimeout(300);await pg.click('[data-m=skip]');}const dn=await pg.$('[data-a=denetim]:not([disabled])');if(dn){await dn.click();await pg.waitForTimeout(300);await pg.click('[data-m=skip]');}}}
  const bs=await pg.$$('.sheet button:not([disabled])');for(let i=0;i<bs.length&&i<14;i++){try{await pg.evaluate(el=>el.isConnected&&!/quit|walk|half|mfire|q|load/.test(el.dataset.a||'')&&el.click(),bs[i]);}catch{} if(await pg.$('.mgov'))await pg.click('[data-m=skip]');await clear();if(await pg.$('.card.dz'))await pg.click('[data-a=dzx]');}
  if(await pg.$(`.tabs [data-v=${t}].on`))await pg.click(`[data-a=tab][data-v=${t}]`);}}
// Proje çizim ekranı
const ok=await pg.evaluate(()=>{const g=window.__g;const W=g.w;const o=W.offers.find(o=>o.deal);if(!o)return false;o.deal.ok=true;W.cash+=1e9;g.set(W);return o.id;});
if(ok){await pg.click('[data-a=tab][data-v=arsa]');await pg.waitForTimeout(100);const dbt=await pg.$(`[data-a=design][data-v="${ok}"]`);if(dbt){await dbt.click();await pg.waitForTimeout(200);await pg.click('[data-a=dz][data-v=col][data-x="3"]');await pg.click('[data-a=dz][data-v=cumba]');await pg.click('[data-a=dz][data-v=park]');await snap('10-cizim');await pg.click('.card.dz [data-a=startP][data-x=nor]');await pg.waitForTimeout(1500);await snap('11-yeni-santiye');}}
// Ev içi ve yüksek kalite
await pg.evaluate(()=>{const g=window.__g;g.w.furn={salon:2,mutfak:2,yatak:1};g.w.home=5;g.set(g.w);});await clear();await pg.click('[data-a=tab][data-v=hayat]');await pg.click('[data-a=homev]');await pg.click('[data-a=tab][data-v=hayat]');await pg.waitForTimeout(1500);await snap('12-ev');await pg.click('[data-a=homev]');
await pg.evaluate(()=>window.__g.city.setQuality(2));await pg.waitForTimeout(3000);await snap('13-yuksek');await pg.evaluate(()=>window.__g.city.setQuality(1));
if(shots){await pg.evaluate(()=>{const g=window.__g;g.w.cards=[{id:'temel_atma',a:{p:0}}];g.set(g.w);});await pg.waitForTimeout(400);await snap('14-kart');}
await b.close();console.log('hatalar:',errs.length,errs.slice(0,8));process.exit(errs.length?1:0);
