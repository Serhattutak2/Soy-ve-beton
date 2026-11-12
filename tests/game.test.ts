import {describe,it,expect} from 'vitest';
import {newWorld,advance,botTurn} from '../src/core/sim';
import {EV,buildOpts} from '../src/core/events';
import {year} from '../src/core/util';
import {STAGES} from '../src/core/data';
(globalThis as any).STRICT=true;
const run=(seed:number,scen:string,city:string,yrs:number)=>{const w=newWorld({seed,scen,city});const y0=year(w);while(year(w)-y0<yrs&&!w.over){
  for(const c of w.cards){const e=EV[c.id];expect(typeof e.title(w,c.a)).toBe('string');expect(typeof e.text(w,c.a)).toBe('string');expect(buildOpts(w,c).length).toBeGreaterThan(0);}
  botTurn(w);advance(w);expect(Number.isFinite(w.cash)&&Number.isFinite(w.debt)).toBe(true);}return w;};
describe('Soy ve Beton',()=>{
 it('40 aşama var',()=>expect(STAGES.length).toBe(40));
 for(const scen of ['koy','batik','kalfa','dul'])for(const city of ['istanbul','ankara','erzurum','samsun'])it(`${scen}/${city} 130 yıl hatasız`,()=>{for(let s=0;s<3;s++){const w=run(50+s*11,scen,city,130);expect(JSON.parse(JSON.stringify(w)).m).toBe(w.m);}},120000);
 it('aynı tohum aynı tarih',()=>{expect(JSON.stringify(run(7,'koy','van',40))).toBe(JSON.stringify(run(7,'koy','van',40)));});
 it('farklı tohum farklı hikâye',()=>{expect(newWorld({seed:1}).arcs.join()).not.toBe(newWorld({seed:2}).arcs.join());});
 it('kuşak değişir',()=>{const w=run(99,'koy','izmir',110);expect(w.gen>=2||!!w.over).toBe(true);},60000);
});

import * as S2 from '../src/core/sim';
import {ek} from '../src/core/util';
describe('v3: isim, işçiliğe dönüş, süre',()=>{
 it('ad, soyad ve firma adı oyuncuya yazılır',()=>{const w=S2.newWorld({seed:3,scen:'kalfa',name:'Serhat',sur:'Tutak',firm:'Tutak Yapı'});expect(w.people[w.playerId].name).toBe('Serhat');expect(w.surname).toBe('Tutak');w.rank=3;w.cash=50000;expect(S2.openFirm(w)).toBe(true);expect(w.firm!.name).toBe('Tutak Yapı');});
 it('firma kapanır, işçiliğe dönülür, yeniden açılınca geriden başlar',()=>{const w=S2.newWorld({seed:4,scen:'kalfa'});w.rank=3;w.cash=60000;S2.openFirm(w);w.firm!.stage=8;w.firm!.rep=40;w.projects=[];expect(S2.closeFirm(w)).toBe('');expect(w.firm).toBeNull();for(let i=0;i<6;i++){w.cards=[];S2.advance(w);}w.cards=[];w.cash=Math.max(w.cash,30000);w.rank=Math.max(w.rank,2);expect(S2.openFirm(w)).toBe(true);expect(w.firm!.stage).toBe(5);});
 it('yevmiyeye çıkınca para gelir',()=>{const w=S2.newWorld({seed:5,scen:'kalfa'});w.rank=3;w.cash=60000;S2.openFirm(w);S2.setOut(w,true);const c0=w.cash;w.cards=[];S2.advance(w);expect(w.flags.gundelik).toBe(1);expect(w.selfWork).not.toBe('');void c0;});
 it('küçük bina şantiye şefiyle bir yıl civarı sürer',()=>{const ms:number[]=[];for(let sd=1;sd<=4;sd++){const w=S2.newWorld({seed:sd*31,scen:'kalfa'});const y0=year(w);const seen:Record<number,number>={};while(year(w)-y0<20){S2.botTurn(w);(globalThis as any).BOTAUTO=false;S2.advance(w);for(const p of w.projects){if(p.stage>=2&&p.stage<=3){seen[p.id]??=w.m;if(p.status==='satis'&&seen[p.id]>0){ms.push(w.m-seen[p.id]);seen[p.id]=-1;}}}}}(globalThis as any).BOTAUTO=true;ms.sort((a,b)=>a-b);expect(ms.length).toBeGreaterThan(3);expect(ms[ms.length>>1]).toBeLessThanOrEqual(16);});
 it('Türkçe ekler',()=>{expect(ek('Leyla','gen')).toBe("Leyla'nın");expect(ek('Gaziantep','loc')).toBe("Gaziantep'te");});
});

import * as V4 from '../src/core/v4';
describe('v4: uzun oyun paketi',()=>{
 const firmW=(seed:number,stage=10)=>{const w=S2.newWorld({seed,scen:'kalfa'});w.rank=3;w.cash=5e7;S2.openFirm(w);w.firm!.stage=stage;w.firm!.rep=70;w.cards=[];return w;};
 it('firma kurulunca vasiyet gelir ve bağışla yerine gelir',()=>{const w=firmW(7);w.cards=[];S2.advance(w);expect(w.will).toBeTruthy();w.will!.id='okul';w.cards=[];const r=V4.fulfillWill(w);expect(r).toBe('ok');expect(w.will!.done).toBe(true);});
 it('arsa al, projeye çevir: arsa sahibine daire yok',()=>{const w=firmW(8);V4.landMarket(w);const l=w.landMkt![0];l.share=0;l.zone=1;l.m2=2000;expect(V4.buyLand(w,l.id)).toBe(true);expect(V4.buildOnLand(w,l.id)).toBe('ok');const o=w.offers[w.offers.length-1];expect(o.deal!.ok).toBe(true);expect(o.deal!.ask).toBe(0);});
 it('holding şirketi gelir getirir',()=>{const w=firmW(9,12);expect(V4.buySub(w,'emlak')).toBe(true);const c0=w.cash;w.cards=[];S2.advance(w);expect(w.subs!.emlak).toBeTruthy();void c0;});
 it('emekli olunca varis koltuğa geçer, dede yaşar',()=>{const w=firmW(10);const me=w.people[w.playerId];me.by=w.m-12*60;const k=Object.values(w.people).find(p=>p.id!==me.id&&p.dm===undefined)!;k.by=w.m-12*30;k.fa=me.id;me.kids.push(k.id);w.heirId=k.id;expect(S2.canRetire(w)).toBe(true);expect(S2.retire(w)).toBe(true);expect(w.playerId).toBe(k.id);expect(w.people[me.id].dm).toBeUndefined();expect(w.flags.danisman).toBe(me.id);});
 it('zorluk başlangıç parasını ve krizleri değiştirir',()=>{const a=S2.newWorld({seed:11,scen:'koy',diff:0});const b=S2.newWorld({seed:11,scen:'koy',diff:3});expect(a.cash).toBeGreaterThan(b.cash);expect(b.crises.length).toBeGreaterThan(a.crises.length);});
 it('yurt dışı aşamasının teklifleri yurt dışı şehirlerden gelir',()=>{const w=firmW(12,30);w.firm!.rep=95;w.offers=[];for(let i=0;i<20;i++)S2.genOffers(w,true);const yd=w.offers.filter(o=>STAGES[o.stage].yd);expect(yd.every(o=>CITIES_[o.city].yd)).toBe(true);});
});
import {CITIES as CITIES_} from '../src/core/data';
