// Proje, daire, malzeme ve ekip hesapları. Olaylar da motor da buradan okur.
import type {World,Project,Unit,Firm} from './types';
import {STAGES,CITIES,M2_PRICE,MATS,SUPPLIERS,CREWS,ITEM,setItems,CERT_M2,priceMul} from './data';
import {rnd,ri,pick,chance,clamp} from './util';
import {MNAMES,FNAMES} from './data';
export const FRONTS=['Güney','Doğu','Kuzey','Batı'];
const flatType=(m:number)=>m<85?'1+1':m<112?'2+1':m<150?'3+1':'4+1';
export function genUnits(w:World,p:Project,ownerN:number,floorsDeal:string){const st=STAGES[p.stage];if(st.kind!=='sat'){return[];}const U:Unit[]=[];let k=1;const total=p.flats;const m2=total?p.m2*.82/total:0;
 if(total>0&&total<=24){const fl=Math.max(1,p.floors);const per=Math.ceil(total/fl);for(let i=0;i<total;i++){const f=Math.floor(i/per);const z=m2*(.86+.28*((i%per)/Math.max(1,per-1)||0));U.push({k:k++,l:'Daire '+(i+1),t:flatType(z),m2:Math.round(z),fl:f,fr:FRONTS[i%4],n:1,sold:0,own:false,pr:1});}}
 else if(total>24){const g=Math.min(12,Math.ceil(total/20));const each=Math.ceil(total/g);for(let i=0;i<g;i++){const b=String.fromCharCode(65+i);const z=m2*(.86+.28*(i/Math.max(1,g-1)));U.push({k:k++,l:b+' Bloğu',t:flatType(z),m2:Math.round(z),fl:Math.floor(p.floors*(i+.5)/g),fr:FRONTS[i%4],n:i===g-1?total-each*(g-1):each,sold:0,own:false,pr:1});}}
 const sh=p.shops;if(sh){const lots=sh<=8?sh:6;const each=Math.ceil(sh/lots);for(let i=0;i<lots;i++)U.push({k:k++,l:sh<=8?'Dükkân '+(i+1):'Mağaza grubu '+(i+1),t:'Dükkân',m2:p.flats?70:Math.round(p.m2*.75/sh),fl:0,fr:FRONTS[i%4],n:i===lots-1?sh-each*(lots-1):each,sold:0,own:false,pr:1});}
 // arsa sahibinin payı
 const order=U.slice().sort((a,b)=>floorsDeal==='iyi'?b.fl-a.fl:floorsDeal==='kotu'?a.fl-b.fl:(a.k%2)-(b.k%2));let left=ownerN;const extra:Unit[]=[];for(const u of order){if(left<=0)break;if(u.n<=left){u.own=true;left-=u.n;}else{extra.push({...u,k:k++,n:left,own:true,l:u.l+' (arsa payı)'});u.n-=left;left=0;}}U.push(...extra);return U;}
export function unitBase(w:World,p:Project,u:Unit){const st=STAGES[p.stage];const c=CITIES[p.city];const fm=u.t==='Dükkân'?1.6:u.fl===0?.92:1+u.fl*.008+(u.fl===p.floors-1?.05:0);const ds=(1.06-.1*(p.mix??.5))*(p.park?1.06:1)*(p.look?.cumba?1.03:1)*(p.look?.bal===2?1.02:1)*(p.illegal?1.02:1);const fr=u.fr==='Güney'?1.04:u.fr==='Kuzey'?.96:1;const q=p.q==='sag'?1.06:p.q==='kis'?.97:1;return M2_PRICE*priceMul(c.mul)*p.locMul*st.mm*u.m2*fm*fr*q*ds;}
export function market(w:World,p:Project,u:Unit){const rep=w.firm?w.firm.rep:20;return Math.round(unitBase(w,p,u)*(.62+.38*w.econ.demand)*(.92+rep/600)*(p.status==='insa'?.85:1)/10)*10;}
export const canSell=(p:Project)=>{if(STAGES[p.stage].kind!=='sat')return false;const r=p.items.find(i=>i.id==='ruhsat');return p.sellOn&&(!r||r.prog>=1);};
export function saleRate(w:World,p:Project,u:Unit){const f=w.firm!;const d=CITIES[p.city].dem;let r=.15*w.econ.demand*d*(.55+f.rep/110)*Math.exp(-(u.pr-1)*7);if(f.done[13]>0)r*=1.3;if(p.status==='insa')r*=.55;if(f.path==='luks')r*=.92;r*=1.2-.4*(p.mix??.5);if(w.council>w.m)r*=1.05;return clamp(r,0,.75);}
export function estMonths(w:World,p:Project,u:Unit){const r=saleRate(w,p,u);if(r<=.005)return 99;return Math.max(1,Math.round(1/r));}
const BUY=['Öğretmen','Emekli','Doktor','Hemşire','Terzi','Şoför','Kuaför','Memur','Bakkal','Gurbetçi','Mühendis','Esnaf'];
export const buyerName=(w:World)=>pick(w,BUY)+' '+pick(w,chance(w,.5)?MNAMES:FNAMES);
export function sellMonth(w:World,p:Project){if(!canSell(p))return;for(const u of p.units){if(u.own||u.rent||u.sold>=u.n)continue;const left=u.n-u.sold;const r=saleRate(w,p,u);let c=0;if(left<=4){for(let i=0;i<left;i++)if(rnd(w)<r)c++;}else{c=Math.min(left,Math.round(left*r*(.7+rnd(w)*.6)));}if(!c)continue;const v=market(w,p,u)*u.pr*c;u.sold+=c;w.cash+=v;p.income+=v;if(u.n===1)u.buyer=buyerName(w);if(u.n>1&&!u.buyer)u.buyer=buyerName(w)+' ve diğerleri';}p.sold=soldFrac(p);}
export const soldFrac=(p:Project)=>{const a=p.units.filter(u=>!u.own);const t=a.reduce((s,u)=>s+u.n,0);return t?a.reduce((s,u)=>s+(u.rent?u.n:u.sold),0)/t:1;};
export function sellNow(w:World,p:Project,frac:number,mul:number){let tot=0;for(const u of p.units){if(u.own||u.rent||u.sold>=u.n)continue;const c=Math.max(1,Math.ceil((u.n-u.sold)*frac));const v=market(w,p,u)*mul*c;u.sold+=c;if(!u.buyer)u.buyer=buyerName(w);tot+=v;if(u.n===1&&frac<1)break;}w.cash+=tot;p.income+=tot;p.sold=soldFrac(p);return tot;}
export function matPrice(w:World,m:string,sup=1){let k=(.55+.45*w.econ.mat)*SUPPLIERS[sup].mul;if(w.biz.ocak)k*=.95;if(w.firm&&w.firm.done[17]>0&&(m==='cimento'||m==='kum'||m==='cakil'))k*=.88;if(m==='demir')k*=1+(w.econ.fx-1)*.12;if(w.firm?.equip?.kamyon)k*=.96;return MATS[m].p*k;}
export const qFac=(q:string,id:string)=>['demir','beton','temel','duvar'].includes(id)?(q==='kis'?.8:q==='sag'?1.12:1):1;
export function phaseNeed(w:World,p:Project,ph:string){const n:Record<string,number>={};for(const it of p.items){const d=ITEM[it.id];if(d.ph!==ph)continue;for(const m in d.mats)n[m]=(n[m]||0)+d.mats[m]*p.m2*(1-it.prog)*qFac(it.q,it.id);}return n;}
export function phaseList(w:World,p:Project,ph:string){const n=phaseNeed(w,p,ph);return Object.keys(n).map(m=>({m,need:n[m],have:w.stock[m]||0,miss:Math.max(0,n[m]-(w.stock[m]||0))}));}
export const phaseCost=(w:World,p:Project,ph:string,sup:number)=>phaseList(w,p,ph).reduce((s,x)=>s+x.miss*matPrice(w,x.m,sup),0);
export const curPhase=(p:Project)=>{const i=p.items[p.cur];return i?ITEM[i.id].ph:'';};
export const crewTotal=(f:Firm)=>Object.values(f.crews).reduce((s,c)=>s+c.n,0);
export function addCrew(w:World,n:number){const f=w.firm!;const k=Object.keys(f.crews).sort((a,b)=>f.crews[b].n-f.crews[a].n)[0]||'isci';f.crews[k].n+=n;}
export function loseCrew(w:World,fr:number){const f=w.firm!;for(const k in f.crews){f.crews[k].n=Math.floor(f.crews[k].n*(1-fr));}}
export const activeM2=(w:World)=>w.projects.filter(p=>p.status==='insa').reduce((s,p)=>s+p.m2,0);
export const certLimit=(w:World)=>w.firm?CERT_M2[w.firm.cert]:0;
export const crewWage=(c:{n:number;sk:number},t:string)=>c.n*CREWS[t].y*26*(.7+c.sk/140);
export const siteCap=(m2:number)=>.2*Math.pow(m2,.55);
void ri;void setItems;
