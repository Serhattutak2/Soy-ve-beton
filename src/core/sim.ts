import type {World,Project,Person,Offer,Deal,PItem,Design} from './types';
import * as WD from './world';
import {STAGES,CERT,CERT_EXP,RANKS,WAGE,DEFECTS,HOMES,CARS,INV,BIZ,CITIES,SCENS,SURNAMES,RIVALS,MNAMES,FNAMES,ITEM,setItems,CREWS,SUPPLIERS,OWNERS,MATS,priceMul,landShare,EQUIP} from './data';
import {rnd,ri,pick,chance,clamp,year,mon,pl,age,alive,log,sc,cash,rep,hurt,stress,hatir,bond,kids,spouse,addPerson,family,base,money,netWorth,heirCandidates,full,ek,relTo} from './util';
import {EV,ARC,buildOpts,LIVE_BLD} from './events';
import {genUnits,sellMonth as sellProject,market,soldFrac,matPrice,phaseList,phaseCost,curPhase,crewTotal,activeM2,certLimit,crewWage,siteCap,qFac,loseCrew,sellNow} from './project';

function newCrews(w:World){const c:Record<string,{n:number;sk:number;usta:string}>={};for(const k in CREWS)c[k]={n:0,sk:ri(w,32,48),usta:pick(w,MNAMES)};return c;}
export function newWorld(o:{seed?:number;scen?:string;city?:string;legacy?:string|null;name?:string;sur?:string;firm?:string}={}):World{
 const seed=o.seed??Math.floor(Math.random()*2**31);
 const w:World={v:2,seed,rng:seed,m:0,scen:'',city:'',surname:'',playerId:0,heirId:-1,founderId:0,gen:1,people:{},nid:1,cash:0,debt:0,rank:0,xp:0,trade:'beton',skills:{demir:8,beton:8,kalip:8,duvar:8,ince:4},evening:'kahve',employer:'',unemployed:0,firm:null,projects:[],offers:[],buildings:[],home:0,car:0,inv:{altin:0,doviz:0,borsa:0,tarla:0,kira:0},biz:{},health:92,stress:15,guilt:0,hatir:0,jail:0,econ:{phase:'canli',left:24,demand:1,mat:1,rate:.2,fx:1,gold:1,stock:1,land:1,news:''},crises:[],quakes:[],cards:[],sched:[],seen:{},flags:{slot:0},arcs:[],cool:4,comfort:0,stock:{},payables:[],selfWork:'',log:[],rival:{name:'',stage:0,rel:40,head:'',gen:1},rivals:[],rentals:[],ach:{},furn:{},council:0,result:null,over:null,peakStage:0,stats:{collapse:0,saved:0,accidents:0,bankrupt:0,jail:0,projects:0,dead:0},legacy:o.legacy??null};
 const keys=Object.keys(SCENS);w.scen=o.scen&&SCENS[o.scen]?o.scen:pick(w,keys);const sc0=SCENS[w.scen];
 w.m=(sc0.y+ri(w,-2,3))*12+ri(w,1,9);
 w.city=o.city&&CITIES[o.city]?o.city:pick(w,Object.keys(CITIES));
 w.surname=o.sur||pick(w,SURNAMES);if(o.firm)w.flags.firmName=o.firm;w.rival.name=pick(w,RIVALS.filter(r=>r!==w.surname));w.rival.head=pick(w,MNAMES);WD.initRivals(w);
 w.rank=sc0.rank;w.cash=sc0.cash;w.debt=sc0.debt;w.employer=pick(w,['Kel Hikmet','Hacı Nuri','Topal Sabri','Bıyıklı Kenan','Müteahhit Zeki'])+"'in şantiyesi";
 const me=addPerson(w,{name:o.name||undefined,sex:sc0.sex,by:w.m-sc0.age*12-ri(w,0,11),sur:w.surname,dream:'insaat',tal:ri(w,50,75),bond:70,gen:1});w.playerId=me.id;w.founderId=me.id;
 const fa=addPerson(w,{name:pick(w,MNAMES),sex:'e',by:me.by-12*ri(w,22,30),sur:w.surname,dream:'',gen:0});const mo=addPerson(w,{name:pick(w,FNAMES),sex:'k',by:me.by-12*ri(w,18,25),sur:w.surname,dream:'',gen:0,bond:80});
 fa.sp=mo.id;mo.sp=fa.id;fa.kids.push(me.id);mo.kids.push(me.id);me.fa=fa.id;me.mo=mo.id;w.flags.anne=mo.id;
 const nsib=ri(w,1,3);for(let i=0;i<nsib;i++){const s=addPerson(w,{sex:chance(w,.5)?'e':'k',by:me.by+12*ri(w,-3,8),sur:w.surname,fa:fa.id,mo:mo.id,gen:1});fa.kids.push(s.id);mo.kids.push(s.id);}
 if(w.scen==='batik'){fa.dm=w.m-ri(w,2,20);fa.cause='batan iş';w.flags.batik=1;w.home=1;w.skills={demir:14,beton:18,kalip:14,duvar:12,ince:8};w.hatir=-6;}
 if(w.scen==='kalfa'){w.home=1;w.skills={demir:16,beton:22,kalip:16,duvar:18,ince:8};w.flags.yemin=1;}
 if(w.scen==='dul'){const h=addPerson(w,{sex:'e',by:me.by-36,sur:w.surname,dream:'',gen:1});h.dm=w.m-ri(w,1,3);h.cause='iş kazası';for(let i=0;i<2;i++){const k=addPerson(w,{sex:chance(w,.5)?'e':'k',by:w.m-12*ri(w,3,11),sur:w.surname,fa:h.id,mo:me.id,gen:2});me.kids.push(k.id);h.kids.push(k.id);}w.home=3;w.skills={demir:10,beton:10,kalip:8,duvar:8,ince:16};
   openFirmRaw(w,w.flags.firmName||w.surname+' İnşaat');const f=w.firm!;f.stage=2;f.done=[3,2,...Array(28).fill(0)];f.crews.isci.n=2;f.rep=18;f.qual=38;w.flags.ustalar=1;
   const hood=pick(w,CITIES[w.city].hoods);const p=mkProject(w,{id:0,stage:2,name:hood+' Apartmanı',city:w.city,hood,locMul:1,expires:0},'nor',.45,'adil');p.name='Rahmetlinin binası';for(let i=0;i<p.items.length&&ITEM[p.items[i].id].ph==='haz';i++){p.items[i].prog=1;p.items[i].paid=true;p.items[i].tq=60;p.cur=i+1;}p.items.find(i=>i.id==='ruhsat')!.prog=1;w.projects.push(p);genOffers(w,true);}
 const y0=year(w);for(let y=y0+ri(w,5,12);y<y0+130;y+=ri(w,7,15))w.crises.push(y);
 const qm=CITIES[w.city].quake;let qy=y0+ri(w,10,24);while(qy<y0+130){w.quakes.push({y:qy,sev:clamp(.45+rnd(w)*.45*qm,.3,.98)});qy+=Math.round(ri(w,18,42)/Math.max(.3,qm));}
 const arcs=Object.keys(ARC).sort(()=>rnd(w)-.5).slice(0,ri(w,7,10));w.arcs=arcs;
 for(const a of arcs){const late=['donus','tapu','ortak','gazeteci','kiz','cirak','muhtar'].includes(a);w.sched.push({m:w.m+(late?ri(w,70,260):ri(w,4,70)),id:ARC[a],a:{}});}
 if(w.legacy)w.sched.push({m:w.m+ri(w,40,120),id:'efsane',a:{}});
 w.sched.push({m:w.m+1,id:'_intro',a:{}});
 w.flags.startM=w.m;w.flags.startHome=w.home;w.econ.news=eraNews(w);log(w,`${year(w)}: Hikâyen ${ek(CITIES[w.city].n,'loc')} başladı.`,'not');
 return w;}
EV._intro={id:'_intro',title:(w)=>SCENS[w.scen].n,text:(w)=>SCENS[w.scen].d+' '+CITIES[w.city].n+': '+CITIES[w.city].d,o:()=>[{t:'Başla'}]};
function eraNews(w:World){const y=year(w);const p=w.econ.phase;if(p==='kriz')return pick(w,['Dolar yine zıpladı, demirci telefona bakmıyor.','Satışlar durdu, emlakçılar çay içiyor.','Bankalar kredi musluğunu kıstı.']);if(p==='durgun')return pick(w,['Piyasada sessizlik, herkes ötekini bekliyor.','Arsa sahipleri hâlâ eski fiyatta ısrarcı.']);if(p==='patlama')return pick(w,['Faiz düştü, kredi kuyruğu kapıya kadar.','Gazeteler: "Konut alan kazandı."','Vinç kiralamak için sıra var.']);
 if(y<1995)return pick(w,['İmar affı konuşuluyor.','Köyden göç sürüyor, şehir taşıyor.','Radyoda seçim haberleri.']);if(y<2010)return pick(w,['Yapı denetim yasası gündemde.','Toplu konut ihaleleri açılıyor.','Kooperatifler çoğaldı.']);if(y<2035)return pick(w,['Kentsel dönüşüm yasası konuşuluyor.','Rezidans modası sokağa indi.','Yetki belgesi şartları ağırlaşıyor.']);return pick(w,['Şehirde yeni bir fay haritası yayımlandı.','Akıllı bina zorunluluğu geldi.','Eski sitelerin dönüşüm vakti.']);}
function openFirmRaw(w:World,name:string){w.firm={name,stage:0,done:Array(30).fill(0),cert:0,exp:0,rep:6,crews:newCrews(w),engs:[],qual:35,open:w.m,path:'',masters:[],equip:{}};}

// ---------- OYUNCU: İŞ ----------
export function canOpenFirm(w:World){return!w.firm&&w.rank>=2&&w.cash>=18000;}
export function openFirm(w:World){if(!canOpenFirm(w))return false;w.cash-=8000;openFirmRaw(w,w.flags.oldFirm?.name||w.flags.firmName||w.surname+' İnşaat');const of=w.flags.oldFirm;if(of){const f=w.firm!;f.stage=Math.max(0,of.stage-3);f.rep=Math.max(6,of.rep*.6);f.cert=of.cert;f.done=of.done;f.qual=Math.max(30,of.qual*.8);f.exp=of.exp;f.path=of.path||'';w.flags.oldFirm=undefined;log(w,'Eski tabelayı çekmeceden çıkardın. Mahalle seni unutmamış, ama bankalar unutmuş.','iyi');}log(w,`${w.firm!.name} kuruldu. Tabela daha kurumadı.`,'iyi');genOffers(w,true);return true;}
export function canRankUp(w:World){if(w.firm||w.rank>=RANKS.length-1)return false;const need=[20,32,40][w.rank];const best=Object.values(w.skills).sort((a,b)=>b-a);return w.xp>=need&&best[0]>=[16,28,40][w.rank]&&best[1]>=[12,22,32][w.rank];}
export function rankUp(w:World){if(!canRankUp(w))return false;w.rank++;w.xp=0;log(w,`${RANKS[w.rank]} oldun.`,'iyi');return true;}
export const cashNeed=(w:World,s:number)=>STAGES[s].kind==='ihale'&&s<8?0:Math.round(STAGES[s].cost*(STAGES[s].kind==='kurum'?1:s<12?.05:.1));
export function stageKeys(w:World,s:number){const st=STAGES[s];const f=w.firm;if(!f)return[];const ck=cashNeed(w,s);const lim=certLimit(w);return[
 {n:'Nakit',ok:w.cash>=ck,v:money(ck)},{n:'İtibar',ok:f.rep>=st.rep,v:String(st.rep)},{n:'Belge',ok:activeM2(w)+st.m2<=lim,v:`${st.m2.toLocaleString('tr-TR')} m²`}];}
const manualSites=(w:World)=>w.projects.filter(p=>p.status==='insa'&&p.eng<=0).length;
export const capacity=(w:World)=>w.firm?3+w.firm.engs.length:0;
export function canStart(w:World,o:Offer){if(w.jail>0)return false;const st=STAGES[o.stage];if(st.kind==='kurum'&&(w.firm!.done[o.stage]>0||w.projects.some(p=>p.stage===o.stage)))return false;if(!stageKeys(w,o.stage).every(k=>k.ok))return false;if(manualSites(w)>=3&&!w.firm!.engs.some(e=>e.pid<=0))return false;if(st.kind==='sat'&&!o.deal?.ok)return false;if(st.kind==='ihale'&&o.won===undefined&&o.stage>=8)return false;return true;}
function itemWeight(id:string){const d=ITEM[id];return d.md+d.fee/50+d.wait*.012+.002;}
export function defDesign(w:World,o:Offer):Design{const st=STAGES[o.stage];const fl=o.imar?.floors??st.floors;return{floors:fl,mix:.5,park:false,illegal:0,look:{col:Math.floor(rnd(w)*8),roof:fl<=7?0:1,bal:0,cumba:false}};}
export function designStats(w:World,o:Offer,D:Design){const st=STAGES[o.stage];const floors=st.floors>0?Math.max(1,D.floors+D.illegal):st.floors;const ratio=st.kind==='sat'&&st.floors>0?(floors/st.floors)*(o.merged?1.8:1):1;const m2=st.m2*ratio;const flats=st.flats?Math.max(1,Math.round(st.flats*ratio*(1.25-.5*D.mix))):0;const shops=st.shops?Math.max(1,Math.round(st.shops*ratio)):0;const cost=st.cost*ratio*(D.park?1.08:1)*(D.look.cumba?1.02:1);return{floors,m2,flats,shops,cost,ratio};}
function mkProject(w:World,o:Offer,q:'kis'|'nor'|'sag',ownerFrac:number,fl:string,design?:Design):Project{const st=STAGES[o.stage];const ids=setItems(st);const half=!!w.flags.ortak&&o.stage>=15;const D=design||defDesign(w,o);const ds=designStats(w,o,D);
 const items:PItem[]=ids.map(id=>({id,prog:0,tas:false,q,paid:false,tq:0}));const hm=half?.5:1;const m2=ds.m2*hm;const gross=st.kind==='ihale'?st.net*(o.won??1)*hm:0;const home=o.city===w.city;const cost=ds.cost*hm;
 const flats=Math.max(st.flats?1:0,Math.round(ds.flats*hm)),shops=Math.max(st.shops?1:0,Math.round(ds.shops*hm));const ownerN=st.kind==='sat'?Math.min(flats+shops-1,Math.max(0,Math.round(ownerFrac*(flats+shops)))):0;
 const p:Project={auto:true,id:w.nid++,stage:o.stage,name:o.name,city:o.city,hood:o.hood,locMul:o.locMul,m2,q,prog:0,months:Math.round(st.mo*Math.sqrt(ds.ratio)),gross,cost,estRev:0,sold:0,seal:0,defects:[],struct:0,status:'insa',halt:false,reason:'',floors:ds.floors,slot:home?w.flags.slot++:-1,partner:half,items,cur:0,tw:ids.reduce((s,i)=>s+itemWeight(i),0)||1,done:0,units:[],ownerN,bought:{},cheap:0,skipEtut:false,spent:0,income:0,eng:0,sellOn:true,lux:cost*(1-1/st.qm)+(D.park?cost*.074:0),flats,shops,mix:D.mix,park:D.park,illegal:D.illegal,look:D.look,merged:o.merged};
 p.units=genUnits(w,p,ownerN,fl);p.estRev=st.kind==='sat'?p.units.filter(u=>!u.own).reduce((s,u)=>s+market(w,p,u)*u.n,0):gross;return p;}
export function startProject(w:World,offerId:number,q:'kis'|'nor'|'sag',design?:Design){const i=w.offers.findIndex(o=>o.id===offerId);if(i<0)return false;const o=w.offers[i];if(!canStart(w,o))return false;const st=STAGES[o.stage];
 const ownerFrac=o.deal?o.deal.ask/o.deal.total:0;const p=mkProject(w,o,q,ownerFrac,o.deal?.floors||'adil',design);if(o.deal?.cash){w.cash-=o.deal.cash;p.spent+=o.deal.cash;}if(st.kind==='kurum'){w.cash-=st.cost;p.spent+=st.cost;}
 if(o.city!==w.city&&st.kind!=='kurum'){const mob=p.cost*.02;w.cash-=mob;p.spent+=mob;}if(st.kind==='ihale'&&o.stage<8){const av=p.gross*.25;w.cash+=av;p.income+=av;p.gross*=.75;}
 if(p.partner)w.flags.ortak=0;if(q==='kis'&&!w.flags.ilkKisma)w.flags.ilkKisma=w.m;
 if(manualSites(w)>=3||(o.city!==w.city&&w.firm!.engs.some(e=>e.pid<=0))){const e=w.firm!.engs.find(e=>e.pid<=0);if(e){e.pid=p.id;p.eng=e.id;}}
 w.projects.push(p);w.offers.splice(i,1);log(w,`${p.name} başladı.`);if(st.kind==='sat'&&(w.seen.temel_atma===undefined||w.m-w.seen.temel_atma>14)){w.seen.temel_atma=w.m;w.cards.push({id:'temel_atma',a:{p:p.id}});}return true;}
export function mergeLand(w:World,id:number){const o=w.offers.find(x=>x.id===id);if(!o||o.merged||!o.mergeCost||w.cash<o.mergeCost)return false;w.cash-=o.mergeCost;o.merged=true;if(o.imar)o.imar.floors+=1;log(w,`${o.name}: yan parsel alınıp birleştirildi.`);return true;}
export function sellHalf(w:World,pid:number){const i=w.projects.findIndex(x=>x.id===pid);if(i<0)return 0;const p=w.projects[i];if(p.status!=='insa')return 0;const v=Math.max(0,p.spent*.72-p.income*.5);w.cash+=v;w.projects.splice(i,1);const e=w.firm?.engs.find(x=>x.id===p.eng);if(e)e.pid=-1;rep(w,-2);log(w,`${p.name} yarım hâliyle devredildi: ${money(v)}.`,'kotu');return v;}
export function setRent(w:World,pid:number,k:number){const u=w.projects.find(x=>x.id===pid)?.units.find(x=>x.k===k);if(!u||u.own||u.sold>=u.n)return;u.rent=!u.rent;}
export function itemMini(w:World,pid:number,score:number){const p=w.projects.find(x=>x.id===pid);const it=p?.items[p.cur];if(!p||!it)return;it.mg=score;w.flags['mg'+pid]=w.m;if(score>=.92)w.flags.achUsta=1;}
export function inspectFound(w:World,pid:number,idx:number[],all:boolean){const p=w.projects.find(x=>x.id===pid);if(!p)return;const hid=p.defects.filter(d=>!d.found);for(const i of idx)if(hid[i])hid[i].found=true;w.flags['tour'+pid]=w.m;if(all&&hid.length>=2)w.flags.achGozu=1;}
// Konuşmalı pazarlık
function mkDeal(w:World,o:Offer):Deal{const st=STAGES[o.stage];const total=st.flats+st.shops;const trait=pick(w,Object.keys(OWNERS));const base=total>1?total:1;const fr=landShare(CITIES[o.city].mul);const ask=Math.max(1,Math.round(base*(fr+.03+rnd(w)*.09)));const min=Math.max(1,Math.round(base*(fr-(trait==='para'?.15:trait==='inat'?.05:.1))+ri(w,0,Math.max(0,Math.round(base*.03)))));return{ownerName:(chance(w,.7)?'Hacı ':'')+pick(w,MNAMES)+' '+(chance(w,.5)?'Bey':'Amca'),trait,total,ask,min:Math.min(min,ask),patience:ri(w,3,5),floors:'adil',cash:0,line:OWNERS[trait].open,rounds:0,ok:false,need:OWNERS[trait].n};}
export const unitValue=(st:number,city:string,loc:number)=>{const s=STAGES[st];return s.flats+s.shops?s.m2*1400*.82*s.mm*priceMul(CITIES[city].mul)*loc/(s.flats+s.shops):0;};
export function negotiate(w:World,id:number,move:string){const o=w.offers.find(x=>x.id===id);const d=o?.deal;if(!o||!d||d.ok)return;d.rounds++;const step=Math.max(1,Math.round(d.total*.05));const yes=(l:string,n=step)=>{const nx=Math.max(d.min,d.ask-n);if(nx===d.ask){d.line='"Bundan aşağısı olmaz, evlat. Başka arsa da bakabilirsin."';d.patience--;}else{d.ask=nx;d.line=l;}};const val=unitValue(o.stage,o.city,o.locMul);
 if(move==='kabul'){d.ok=true;d.line=`"Hayırlı olsun. ${d.ask} daire benim, gerisi senin." Eller sıkıldı, çay tazelendi.`;log(w,`${o.name} için ${d.ownerName} ile anlaşıldı: ${d.ask}/${d.total} daire onun.`);return;}
 if(move==='kat'){if(d.floors==='iyi'){d.line='"Üst katları zaten verdin evlat, başka ne var?"';}else{d.floors='iyi';yes(d.trait==='kavga'?'"Kardeşlerim buna bir şey diyemez artık." Payı biraz indirdi.':'"En iyi katlar bende olur, tamam. Biraz da senin için ineyim."',d.trait==='kavga'?step*2:step);}}
 else if(move==='para'){const c=Math.round(val*.1);if(w.cash<c+d.cash)d.line='"Oğlum, cebinde yokken nakit sözü verme."';else{d.cash+=c;yes(d.trait==='para'?'"İşte bu! Nakit sözün eridir." Hemen indirdi.':'"Nakit iyidir ama toprak topraktır." Yine de biraz yumuşadı.',d.trait==='para'?step*2:step);}}
 else if(move==='sert'){const p={inat:.2,yasli:.35,para:.5,kavga:.4}[d.trait]!+w.hatir/120;if(chance(w,p))yes('"Peki peki, gitme. Bir daha konuşalım." Blöfün tuttu.');else{d.patience-=2;d.line='Çayını masaya sert bıraktı: "Terbiyesizlik etme. Yürü git istersen."';}}
 else if(move==='hatir'){if(w.hatir<5)d.line='"Seni bu mahallede tanıyan yok ki."';else{hatir(w,-5);yes('"Muhtar Ali\'nin selamı başım üstüne." Kolay indi.');}}
 else if(move==='kalk'){if(chance(w,.45)){d.ask=Math.max(d.min,d.ask-step);d.line='Kapıya varmıştın, sesi arkandan geldi: "Dur hele, otur."';d.patience=Math.max(1,d.patience-1);}else{w.offers=w.offers.filter(x=>x.id!==id);log(w,`${o.name}: ${d.ownerName} arsayı ${w.rival.name} ailesine verdi.`,'kotu');return;}}
 if(d.patience<=0){w.offers=w.offers.filter(x=>x.id!==id);log(w,`${o.name}: ${d.ownerName} masadan kalktı.`,'kotu');}}
export function bid(w:World,id:number,lvl:number){const o=w.offers.find(x=>x.id===id);if(!o||o.bidDone)return'';o.bidDone=true;const p=[.82,.52,.24][lvl]+((w.firm?.rep||0)-50)/500+w.hatir/400+(w.council>w.m?.1:0);if(chance(w,p)){o.won=[.92,1,1.12][lvl];return'İhale sende. Zarf açıldığında salonda fısıltı yükseldi.';}w.offers=w.offers.filter(x=>x.id!==id);if(chance(w,.6))w.rival.rel-=1;return`Kaybettin. ${(w.rivals.length?pick(w,w.rivals).name:w.rival.name)} daha düşük vermiş.`;}
export function setItemTas(w:World,pid:number,ph:string,v=true){const p=w.projects.find(x=>x.id===pid);if(!p)return;for(const it of p.items)if(ITEM[it.id].ph===ph&&it.prog<1&&ITEM[it.id].tr)it.tas=v;}
export function setItemQ(w:World,pid:number,id:string,q:'kis'|'nor'|'sag'){const it=w.projects.find(x=>x.id===pid)?.items.find(i=>i.id===id);if(it&&it.prog<1)it.q=q;}
export function skipEtut(w:World,pid:number){const p=w.projects.find(x=>x.id===pid);const it=p?.items.find(i=>i.id==='etut');if(p&&it&&it.prog<1&&p.items[p.cur]===it){it.prog=1;it.paid=true;p.skipEtut=true;w.guilt+=2;p.done+=itemWeight('etut')/p.tw;p.cur++;}}
export function buyPhase(w:World,pid:number,sup:number,ph?:string){const p=w.projects.find(x=>x.id===pid);if(!p)return false;const P=ph||curPhase(p);const c=phaseCost(w,p,P,sup);if(c<=0)return true;const S=SUPPLIERS[sup];if(S.due===0){if(w.cash<c)return false;w.cash-=c;}else w.payables.push({m:w.m+S.due,amt:c,note:S.n+' malzeme vadesi'});for(const x of phaseList(w,p,P))w.stock[x.m]=(w.stock[x.m]||0)+x.miss;p.bought[P]=sup;p.spent+=c;if(sup===0)p.cheap++;return true;}
export function buyStock(w:World,m:string,qty:number,sup=1){const c=qty*matPrice(w,m,sup);if(w.cash<c)return false;w.cash-=c;w.stock[m]=(w.stock[m]||0)+qty;return true;}
export function sellStock(w:World,m:string,fr:number){const q=(w.stock[m]||0)*fr;if(q<=0)return false;w.stock[m]-=q;w.cash+=q*matPrice(w,m)*.8;return true;}
export function setPrice(w:World,pid:number,k:number,pr:number){const u=w.projects.find(x=>x.id===pid)?.units.find(u=>u.k===k);if(u)u.pr=clamp(pr,.8,1.2);}
export function setAllPrices(w:World,pid:number,pr:number){w.projects.find(x=>x.id===pid)?.units.forEach(u=>{u.pr=clamp(pr,.8,1.2);});}
export function toggleSell(w:World,pid:number){const p=w.projects.find(x=>x.id===pid);if(p)p.sellOn=!p.sellOn;}
export function inspect(w:World,pid:number){const p=w.projects.find(p=>p.id===pid);if(!p||p.status!=='insa')return null;const last=w.flags['tour'+pid];if(last===w.m)return{again:true,list:p.defects.map((d,i)=>({...d,i})).filter(d=>d.found)};w.flags['tour'+pid]=w.m;
 p.defects.forEach((d)=>{if(d.found)return;const sk=clamp(w.skills[d.trade],0,95);if(chance(w,sk/100))d.found=true;});return{again:false,list:p.defects.map((d,i)=>({...d,i})).filter(d=>d.found)};}
export function fixDefect(w:World,pid:number,i:number){const p=w.projects.find(p=>p.id===pid);if(!p)return false;const d=p.defects[i];if(!d||!d.found)return false;const c=Math.round(p.cost*.006*d.sev/8);if(w.cash<c)return false;w.cash-=c;p.spent+=c;p.struct+=d.sev*.4;p.defects.splice(i,1);return true;}
export function ignoreDefect(w:World,pid:number,i:number){const p=w.projects.find(p=>p.id===pid);if(!p)return;p.defects.splice(i,1);p.struct-=3;w.guilt+=1;}
export function hire(w:World,t:string,n:number){const f=w.firm;if(!f||!f.crews[t])return false;const c=n*CREWS[t].y*3;if(w.cash<c)return false;w.cash-=c;f.crews[t].n+=n;return true;}
export function fire(w:World,t:string,n:number){const f=w.firm;if(!f||!f.crews[t]||f.crews[t].n<n)return false;f.crews[t].n-=n;w.cash-=n*CREWS[t].y*6;f.qual=clamp(f.qual-.3,0,100);return true;}
export function train(w:World,t:string){const f=w.firm;if(!f||!f.crews[t]||!f.crews[t].n)return false;const c=f.crews[t].n*CREWS[t].y*8;if(w.cash<c)return false;w.cash-=c;f.crews[t].sk=clamp(f.crews[t].sk+6,0,100);f.qual=clamp(f.qual+.6,0,100);return true;}
export const engFee=(w:World)=>Math.round(1200+(w.firm?.stage||0)*250);
export function hireEng(w:World){const f=w.firm;if(!f||f.stage<6)return false;const c=engFee(w)*2;if(w.cash<c)return false;w.cash-=c;const fr=chance(w,.28);f.engs.push({id:w.nid++,name:pick(w,MNAMES)+' Müh.',sk:ri(w,38,90),hon:fr?ri(w,20,48):ri(w,55,99),pid:-1});return true;}
export function fireEng(w:World,id:number){const f=w.firm;if(!f)return;const e=f.engs.find(x=>x.id===id);if(!e)return;const p=w.projects.find(x=>x.id===e.pid);if(p)p.eng=0;f.engs=f.engs.filter(x=>x.id!==id);}
export function assignEng(w:World,id:number,pid:number){const f=w.firm;if(!f)return;const e=f.engs.find(x=>x.id===id);const p=w.projects.find(x=>x.id===pid);if(!e)return;const old=w.projects.find(x=>x.id===e.pid);if(old)old.eng=0;if(p){if(p.eng){const pe=f.engs.find(x=>x.id===p.eng);if(pe)pe.pid=-1;}p.eng=id;e.pid=pid;}else e.pid=-1;}
export const canJob=(w:World,p:Person)=>alive(p)&&age(w,p)>=18&&age(w,p)<62&&p.id!==w.playerId;
export function setJob(w:World,id:number,t:string){const p=w.people[id];if(!p||(!t?false:!canJob(w,p)))return false;if(t&&p.dream!=='insaat'&&!p.job)bond(w,id,-8);p.job=t||undefined;return true;}
export function setSelf(w:World,t:string){w.selfWork=t;if(!t)w.flags.disari=0;}
/** Firma açıkken başkasının şantiyesinde yevmiyeye çık (ya da geri dön). Kendi şantiyelerin ekiple yürür, sen dışarıda kazanırsın. */
export function setOut(w:World,on:boolean){w.flags.disari=on?1:0;if(on&&!w.selfWork){const best=Object.keys(CREWS).filter(k=>k!=='hafriyat').sort((a,b)=>(w.skills[CREWS[b].sk]||0)-(w.skills[CREWS[a].sk]||0))[0];w.selfWork=w.trade&&CREWS[w.trade]?w.trade:best;}if(!on&&w.flags.disari===0&&w.selfWork&&!w.firm)w.selfWork='';}
/** Firmayı kapat, işçiliğe dön. İnşaattaki şantiye varken olmaz. Belgen ve adın çekmecede kalır; yeniden açarsan kaldığın yere yakın başlarsın. */
export function closeFirmCheck(w:World){const f=w.firm;if(!f)return'Firman yok.';if(w.projects.some(p=>p.status==='insa'))return'Yarım şantiye varken tabela inmez. Önce bitir ya da yarım binayı sat.';return'';}
export function closeFirm(w:World){const why=closeFirmCheck(w);if(why)return why;const f=w.firm!;
 for(const p of w.projects){sellNow(w,p,1,.85);}w.projects=[];w.offers=[];
 w.cash+=Object.keys(w.stock).reduce((s,k)=>s+(w.stock[k]||0)*matPrice(w,k)*.8,0);w.stock={};
 let sev=0;for(const t in f.crews){sev+=f.crews[t].n*CREWS[t].y*6;}w.cash-=sev;
 let eq=0;for(const k in f.equip)if(f.equip[k]){eq+=EQUIP[k].buy*.55;}w.cash+=eq;
 w.flags.oldFirm={name:f.name,stage:f.stage,rep:f.rep,cert:f.cert,done:f.done,qual:f.qual,exp:f.exp,path:f.path};
 w.firm=null;w.flags.disari=0;w.selfWork='';w.unemployed=0;w.employer=pick(w,['Kel Hikmet','Hacı Nuri','Topal Sabri','Bıyıklı Kenan','Müteahhit Zeki'])+"'in şantiyesi";
 log(w,`${f.name} tabelasını indirdin. Ustalara tazminat ${money(sev)}. Yarın sabah yine baret senin başında.`,'kotu');return'';}
export function certNext(w:World){const f=w.firm;if(!f||f.cert>=7)return null;const need=CERT_EXP[f.cert+1];const fee=Math.round(need*.012);return{letter:CERT[f.cert+1],need,fee,ok:f.exp>=need&&w.cash>=fee};}
export function upgradeCert(w:World){const c=certNext(w);if(!c||!c.ok)return false;w.cash-=c.fee;w.firm!.cert++;log(w,`${c.letter} grubu yetki belgesi alındı.`,'iyi');return true;}
export function loanLimit(w:World){let l=2000;if(w.firm){l=Math.max(15000,STAGES[w.firm.stage].cost*(.45+w.firm.rep/120));}for(const p of w.projects)l+=p.estRev*(1-p.sold)*.5*Math.max(.3,p.status==='satis'?1:p.prog);l+=(w.inv.kira||0)*.6+(w.inv.tarla||0)*.4+HOMES[w.home].p*.5+w.rentals.reduce((s,r)=>s+r.val,0)*.6;return Math.round(l);}
export function borrow(w:World,n:number){if(w.debt+n>loanLimit(w))return false;w.cash+=n;w.debt+=n;return true;}
export function repay(w:World,n:number){n=Math.min(n,w.debt,w.cash);if(n<=0)return false;w.cash-=n;w.debt-=n;return true;}
export function buyHome(w:World,i:number){const h=HOMES[i];if(!h||i===w.home)return false;if(w.cash<h.p)return false;w.cash-=h.p;const old=HOMES[w.home];if(old.p>0)w.cash+=old.p*.75;w.home=i;log(w,`Yeni evin: ${h.n}.`,'aile');for(const p of family(w))if(i>2)bond(w,p.id,2);return true;}
export function buyCar(w:World,i:number){const c=CARS[i];if(!c||i===w.car)return false;if(w.cash<c.p)return false;w.cash-=c.p;const old=CARS[w.car];if(old.p>0)w.cash+=old.p*.45;w.car=i;log(w,`Araban: ${c.n}.`,'aile');rep(w,c.s>=5?1:0);return true;}
export function invest(w:World,k:string,n:number){if(!INV[k]||n<=0||w.cash<n)return false;w.cash-=n;w.inv[k]=(w.inv[k]||0)+n;return true;}
export function divest(w:World,k:string,frac:number){const v=(w.inv[k]||0)*frac;if(v<=0)return false;w.inv[k]-=v;w.cash+=v*(k==='tarla'||k==='kira'?.94:.99);return true;}
export function buyBiz(w:World,k:string){const b=BIZ[k];if(!b||w.biz[k]||!w.firm||w.firm.stage<b.st||w.cash<b.p)return false;w.cash-=b.p;w.biz[k]=true;log(w,`${b.n} satın alındı.`,'iyi');return true;}
export function sellBiz(w:World,k:string){const b=BIZ[k];if(!b||!w.biz[k])return false;w.biz[k]=false;w.cash+=b.p*.6;return true;}
export function setHeir(w:World,id:number){w.heirId=id;log(w,`${w.people[id].name} varis olarak yazıldı.`,'aile');}
export function miniReward(w:World,score:number){const t=w.trade;w.skills[t]=clamp(w.skills[t]+score*4,0,100);w.xp+=score*2.5;const g=Math.round(WAGE[w.rank]*.1*score);w.cash+=g;if(score>=.92)w.flags.achUsta=1;return g;}
export function resolve(w:World,i:number){prune(w);const c=w.cards[0];if(!c)return;const o=buildOpts(w,c)[i];if(!o||o.off)return;const t=EV[c.id].title(w,c.a);w.cards.shift();let r:string|void=undefined;try{r=o.f?o.f(w,c.a):undefined;}catch(e){if((globalThis as any).STRICT)throw e;}w.result=typeof r==='string'?r:null;w.seen[c.id]=w.m;if(r&&EV[c.id].kind==='kotu')w.comfort=0;if(EV[c.id].kind!=='not'&&c.id[0]!=='_')log(w,t+(r?': '+r:''),EV[c.id].kind);finalize(w);}
/** Bir ayın gider dökümü: ekranda gösterilir, motor da bunu öder */
export function monthly(w:World){const L:{n:string;v:number}[]=[];const f=w.firm;const h=HOMES[w.home],c=CARS[w.car];
 if(f){for(const t in f.crews){const cr=f.crews[t];if(cr.n)L.push({n:`${CREWS[t].n} (${cr.n})`,v:crewWage(cr,t)*CITIES[w.city].labor});}if(f.engs.length)L.push({n:`Mühendisler (${f.engs.length})`,v:f.engs.length*engFee(w)});L.push({n:'Ofis, sigorta, muhasebe',v:Math.max(100,STAGES[f.stage].cost*.0012)});if(f.masters.length)L.push({n:`Ustabaşları (${f.masters.length})`,v:f.masters.reduce((s,m)=>s+CREWS[m.tr].y*26*1.25,0)});const em=Object.keys(f.equip).filter(k=>f.equip[k]).reduce((s,k)=>s+EQUIP[k].maint,0);if(em)L.push({n:'Ekipman bakımı',v:em});const cr=f.equip.vinc?0:w.projects.filter(WD.needsCrane).length;if(cr)L.push({n:`Kiralık vinç (${cr})`,v:cr*EQUIP.vinc.rent*(1+f.stage*.04)});
  const rel=family(w).filter(p=>p.job);if(rel.length)L.push({n:`Şantiyedeki akrabalar (${rel.length})`,v:rel.length*350});}
 if(h.r)L.push({n:h.n,v:h.r});if(c.u)L.push({n:c.n,v:c.u});L.push({n:'Mutfak ve ev',v:(420+kids(w).length*140+(spouse(w)?100:0))*(1+Math.min(w.home,6)*.25)});if(w.debt>0)L.push({n:'Kredi faizi',v:w.debt*w.econ.rate*(f&&f.stage>=12?.55:1)/12});return L;}

// ---------- AYLIK ADIM ----------
export function advance(w:World){if(w.over||w.cards.length)return false;w.m++;w.quakeNow=undefined;
 econMonth(w);if(w.jail>0)w.jail--;lifeMonth(w);workMonth(w);firmMonth(w);invMonth(w);WD.rentalsMonth(w);WD.homeMonth(w);familyMonth(w);rivalMonth(w);WD.rivalsMonth(w);mastersMonth(w);devralma(w);quakeCheck(w);schedule(w);director(w);finance(w);warnCash(w);deathCheck(w);finalize(w);if(mon(w)===0||w.m%3===0)WD.checkAch(w);return true;}
function mastersMonth(w:World){const f=w.firm;if(!f)return;for(const m of f.masters){m.loy=clamp(m.loy-.06+(w.econ.phase==='kriz'?-.1:0),0,100);if(m.sk<95)m.sk+=.02;if(m.app){m.appSk=Math.min(m.sk-5,(m.appSk||15)+.35);}}}
function devralma(w:World){const d=w.flags.devralinan;if(!d||!w.firm)return;w.flags.devralinan=0;const st=STAGES[d.st];const hood=pick(w,CITIES[w.city].hoods);const o:Offer={id:w.nid++,stage:d.st,name:hood+' (devralınan)',city:w.city,hood,locMul:.95,expires:w.m+1};const p=mkProject(w,o,'nor',0,'adil');for(const it of p.items){if(ITEM[it.id].ph==='haz'||ITEM[it.id].ph==='kaba'){it.prog=1;it.paid=true;it.tq=chance(w,.5)?40:60;p.done+=itemWeight(it.id)/p.tw;p.cur++;}}p.prog=p.done;p.cost*=.55;p.lux*=.5;w.projects.push(p);}
function warnCash(w:World){if(!w.firm||w.cards.length)return;if(w.m-(w.flags.warnM||-99)<14)return;const L=monthly(w);const f=WD.forecast(w,L.reduce((s,x)=>s+x.v,0));const i=f.findIndex(x=>x<0);if(i>=0&&i<3){w.flags.warnM=w.m;w.flags.cashWarn=w.m;w.cards.push({id:'muhasebeci',a:{mo:i+1,need:Math.round(-Math.min(...f.slice(0,4))*1.15/1000)*1000+1000}});}}
export function prune(w:World){w.cards=w.cards.filter(c=>{const e=EV[c.id];return !!e&&(!e.c||safeC(e,w));});}
function finalize(w:World){prune(w);if(w.firm)w.peakStage=Math.max(w.peakStage,w.firm.stage);}
function econMonth(w:World){const e=w.econ;e.left--;const y=year(w);
 if(mon(w)===0&&w.crises.includes(y)&&e.phase!=='kriz'){e.phase='kriz';e.left=ri(w,14,30);e.fx+=.3+rnd(w)*.4;e.mat*=1.2;e.rate=Math.min(.45,e.rate+.1);log(w,`${y}: Ekonomik kriz patladı.`,'kotu');e.news=eraNews(w);}
 else if(e.left<=0){const n=e.phase==='kriz'?'durgun':e.phase==='durgun'?(chance(w,.6)?'canli':'patlama'):e.phase==='canli'?(chance(w,.45)?'patlama':'durgun'):'durgun';e.phase=n;e.left=ri(w,14,44);e.news=eraNews(w);}
 const T:Record<string,[number,number,number]>={kriz:[.5,1.2,.3],durgun:[.78,1,.2],canli:[1,1,.15],patlama:[1.28,1.08,.1]};const[d,m,r]=T[e.phase];
 e.demand+=(d-e.demand)*.09;e.mat+=(m-e.mat)*.05+(rnd(w)-.5)*.01;e.rate+=(r-e.rate)*.05;e.mat=clamp(e.mat,.75,2);e.demand=clamp(e.demand,.3,1.5);
 e.fx=1+(e.fx-1)*.975+(e.phase==='kriz'?.008:0)+(rnd(w)-.5)*.01;e.gold=1+(e.gold-1)*.985+(e.phase==='kriz'?.01:0)+(rnd(w)-.5)*.012;e.stock=1+(e.stock-1)*.99+({kriz:-.015,durgun:-.002,canli:.004,patlama:.012}[e.phase]||0)+(rnd(w)-.5)*.03;e.land=1+(e.land-1)*.99+(e.phase==='patlama'?.006:0);if(mon(w)%6===0)e.news=eraNews(w);}
function lifeMonth(w:World){const me=pl(w),a=age(w,me);
 if(!w.firm){const h=HOMES[w.home],c=CARS[w.car];w.cash-=h.r+c.u+(420+kids(w).length*140+(spouse(w)?100:0))*(1+Math.min(w.home,6)*.25);}
 const e=w.evening;if(w.jail>0){hurt(w,.3);return;}if(e==='ek'&&!w.firm){w.cash+=WAGE[w.rank]*.28;hurt(w,.35);stress(w,.8);}if(e==='okul'){w.xp+=.4;for(const k in w.skills)w.skills[k]=Math.min(100,w.skills[k]+.08);w.cash-=40;stress(w,.2);}if(e==='kahve'){hatir(w,.25);stress(w,-.4);w.cash-=30;}if(e==='aile'){for(const k of family(w))if(k.sp===me.id||k.fa===me.id||k.mo===me.id)bond(w,k.id,.8);stress(w,-1);}if(e==='dinlen'){w.health=clamp(w.health+.5,1,100);stress(w,-1.5);}
 else if(e!=='aile'){for(const k of family(w))if(k.sp===me.id)bond(w,k.id,-.28);}
 if(w.selfWork){hurt(w,a>50?.45:.25);stress(w,.2);const sk=CREWS[w.selfWork]?.sk;if(sk)w.skills[sk]=Math.min(100,w.skills[sk]+.35);}
 w.health=clamp(w.health+(.07*(HOMES[w.home].c-1))-(a>45?.05:0)-(a>60?.1:0)-(w.firm?.02:0)-(w.stress>70?.15:0),1,100);
 stress(w,w.projects.length*.08-.25+(w.debt>w.cash*2&&w.debt>0?.3:0));if(w.guilt>18&&chance(w,.03))stress(w,4);}
function workMonth(w:World){if(w.firm)return;if(w.unemployed>0){w.unemployed--;return;}w.cash+=WAGE[w.rank]*(w.econ.phase==='kriz'?.8:1);w.xp+=1;w.skills[w.trade]=Math.min(100,w.skills[w.trade]+.42);for(const k in w.skills)if(k!==w.trade)w.skills[k]=Math.min(100,w.skills[k]+.09);hurt(w,.05+(w.rank<2?.05:0));}
export function autoRun(w:World,p:Project){const it=p.items[p.cur];if(!it)return;const d=ITEM[it.id];const f=w.firm!;const full=p.eng>0||(globalThis as any).BOTAUTO;const mine=f.crews[d.tr]?.n||0;const fam=(w.selfWork===d.tr?1:0)+family(w).filter(x=>x.job===d.tr).length;if(d.tr&&!it.tas&&(full?mine<siteCap(p.m2)*.4:mine+fam<Math.max(1,siteCap(p.m2)*.25)))it.tas=true;const P=d.ph;if(!p.bought[P]&&phaseList(w,p,P).some(x=>x.miss>0)){buyPhase(w,p.id,1,P)||(full&&buyPhase(w,p.id,2,P));}else if(phaseList(w,p,P).some(x=>x.miss>0&&x.need>0)&&Object.keys(d.mats).some(m=>(w.stock[m]||0)<d.mats[m]*p.m2*(1-it.prog)*qFac(it.q,it.id)*1.02)){buyPhase(w,p.id,1,P)||(full&&buyPhase(w,p.id,2,P));}}
/** Paralel kalem için malzeme: eksikse o aşamanın malzemesini al */
function autoMats(w:World,p:Project,it:PItem){const d=ITEM[it.id];if(Object.keys(d.mats).some(m=>(w.stock[m]||0)<d.mats[m]*p.m2*(1-it.prog)*qFac(it.q,it.id)*1.02)){buyPhase(w,p.id,1,d.ph)||((p.eng>0||(globalThis as any).BOTAUTO)&&buyPhase(w,p.id,2,d.ph));}}
function firmMonth(w:World){const f=w.firm;if(!f)return;if(w.m%3===0||w.flags.bonusOffer)genOffers(w,false);
 for(const k in w.stock){if(k==='cimento')w.stock[k]*=.996;}
 const L=monthly(w);w.cash-=L.reduce((s,x)=>s+x.v,0)-(w.debt>0?L[L.length-1].v:0);
 const rel=family(w).filter(p=>p.job);for(const r of rel){if(!canJob(w,r)){r.job=undefined;continue;}r.work+=.3;if(r.dream!=='insaat'&&r.dream!=='mimar')bond(w,r.id,-.25);}
 if(w.jail>0&&chance(w,.1))rep(w,-1);if(w.jail<=0&&!w.flags.tv)rep(w,-.02);rep(w,Math.min(.08,LIVE_BLD(w).length*.006));f.qual=clamp(f.qual-.02,10,100);
 const active=w.projects.filter(p=>p.status==='insa');
 for(const p of active)if(p.eng>0||(globalThis as any).BOTAUTO)autoRun(w,p);
 // Ekipleri şantiyelere böl
 const need:Record<string,number>={};for(const p of active){if(p.seal>0)continue;const it=p.items[p.cur];if(it&&ITEM[it.id].tr&&!it.tas)need[ITEM[it.id].tr]=(need[ITEM[it.id].tr]||0)+1;}
 const extra:Record<string,{n:number;sk:number}>={};if(w.selfWork&&w.jail<=0&&!w.flags.disari){const s=CREWS[w.selfWork].sk;extra[w.selfWork]={n:1,sk:w.skills[s]};}for(const r of rel){if(r.job){const e=extra[r.job]||(extra[r.job]={n:0,sk:r.tal/2+r.work*.5});e.n++;}}
 for(const p of active)buildMonth(w,p,need,extra);
 if(w.selfWork&&w.jail<=0&&(w.flags.disari||!(need[w.selfWork]>0))){w.cash+=Math.max(CREWS[w.selfWork].y*22,w.flags.disari?WAGE[Math.min(3,w.rank)]:0);w.flags.gundelik=1;}else w.flags.gundelik=0;
 if(!active.some(p=>!p.halt)&&f.stage<=7&&w.jail<=0&&!w.selfWork){w.cash+=WAGE[2]*1.0;w.flags.gundelik=1;}
 for(const p of w.projects.slice()){if(STAGES[p.stage].kind==='sat')sellProject(w,p);if(p.status==='satis'&&soldFrac(p)>=.999)w.projects.splice(w.projects.indexOf(p),1);}
 for(const e of f.engs){if(e.pid>0&&!w.projects.some(p=>p.id===e.pid&&p.status==='insa'))e.pid=-1;}}
function spend(w:World,n:number){if(n<=0)return true;if(w.cash>=n){w.cash-=n;return true;}if(w.debt+n-w.cash<=loanLimit(w)){const b=Math.ceil(n-w.cash);w.debt+=b;w.cash+=b;w.cash-=n;return true;}return false;}
function buildMonth(w:World,p:Project,need:Record<string,number>,extra:Record<string,{n:number;sk:number}>){const f=w.firm!,st=STAGES[p.stage];p.reason='';p.halt=false;if(p.seal>0){p.seal--;p.halt=true;p.reason='Mühürlü';return;}
 if(st.kind==='kurum'){const c=p.cost/p.months;if(!spend(w,c*0)){p.halt=true;return;}p.prog+=1/p.months;p.spent+=c;if(p.prog>=1)finishBuild(w,p);return;}
 const c=CITIES[p.city];const away=p.city!==w.city;const eg=p.eng>0?f.engs.find(e=>e.id===p.eng):undefined;
 // Bir iş kalemini t ay boyunca çalıştırır. Dönüş: kullanılan süre; -1 = para yok/ekip yok (şantiye durur)
 const work=(it:PItem,t:number,front:boolean):number=>{const d=ITEM[it.id];
  if(!it.paid&&d.fee){const fee=d.fee*p.m2;if(!spend(w,fee)){if(front){p.halt=true;p.reason='Para yok: '+d.n;}return -1;}p.spent+=fee;}it.paid=true;
  const W=d.md*p.m2;let dpr=0,tused=0;
  if(!d.tr||W<=0){const dur=d.wait*(d.id==='ruhsat'&&w.hatir>15?.7:1)*(d.id==='ruhsat'&&w.council>w.m?.6:1)||.1;dpr=Math.min(1-it.prog,t/dur);tused=dpr*dur;}
  else{const cap=siteCap(p.m2);const winter=(mon(w)===11||mon(w)<2)&&['temel','beton','kalip','cati','cephe'].includes(d.id)?1-.6*c.winter:1;let rate=0;
   if(it.tas)rate=cap*26*winter;else{const cr=f.crews[d.tr];const sh=Math.max(1,need[d.tr]||1);const ex=extra[d.tr];const ms=WD.masterSk(w,d.tr);const sk=Math.max(cr.n?cr.sk:ex?ex.sk:40,ms*.92);rate=Math.min(cap*1.5,(cr.n/sh+(ex?ex.n/sh:0)))*26*(.6+sk/100)*winter*(ms?1.1:1);if(rate<=0){if(front){p.halt=true;p.reason=`${CREWS[d.tr].n} yok`;}return -1;}}
   const eq=f.equip||{};const kaba=d.ph==='kaba';rate*=(eq.vinc&&kaba&&p.floors>=5?1.15:1)*(eq.pompa&&(it.id==='beton'||it.id==='temel')?1.25:1)*(eq.tunel&&p.flats>=30&&(it.id==='kalip'||it.id==='beton')?1.6:1);const dur=W*(1-it.prog)/rate;const useT=Math.min(t,dur);let dp=(1-it.prog)*useT/dur;
   const qf=qFac(it.q,it.id);let short='';for(const m in d.mats){const q=d.mats[m]*p.m2*qf;const have=w.stock[m]||0;if(q*dp>have+1e-6){dp=Math.max(0,have/q);short=`${MATS[m].n} bitti`;}}
   if(short&&front)p.reason=short;
   if(it.tas){const tasPay=W*dp*CREWS[d.tr].y*1.42*c.labor*(away?1.15:1);if(!spend(w,tasPay)){if(front){p.halt=true;p.reason='Para yok: taşeron';}return -1;}p.spent+=tasPay;}
   if(dp<=0){if(front)p.halt=true;return -1;}
   for(const m in d.mats){w.stock[m]=Math.max(0,(w.stock[m]||0)-d.mats[m]*p.m2*qf*dp);}
   dpr=dp;tused=short?t:useT;}
  it.prog+=dpr;const dw=dpr*itemWeight(d.id)/p.tw;p.done+=dw;p.prog=Math.min(1,p.done);
  if(st.kind==='ihale'){const pd=w.econ.phase==='kriz'&&chance(w,.25)?.7:1;const inc=p.gross*dw*pd;w.cash+=inc;p.income+=inc;}
  if(p.lux>0){const lx=p.lux*dw;if(spend(w,lx))p.spent+=lx;}
  if(it.prog>=.9999&&!it.fin)complete(it);
  return Math.max(tused,.001);};
 const complete=(it:PItem)=>{const d=ITEM[it.id];it.prog=1;it.fin=true;it.tq=(it.q==='kis'?30:it.q==='sag'?84:60)+(it.mg!==undefined?(it.mg-.5)*24:0);const dChance=(it.mg!==undefined?1.4-.8*it.mg:1)*((f.equip||{}).pompa&&(it.id==='beton'||it.id==='temel')?.8:1)*(d.md>0?.38:0)*(it.q==='kis'?1.9:1)*(1.2-f.qual/100)*(it.tas?1.15:1)*(p.bought[d.ph]===0?1.4:1)*(eg?1-eg.sk/170:1)*(away&&!eg?1.35:1);if(chance(w,dChance)){const tr=CREWS[d.tr]?.sk||'beton';const sev=ri(w,4,10);const de={trade:tr,sev,txt:pick(w,DEFECTS[tr]),found:false};if(eg&&chance(w,eg.sk/110))de.found=true;p.defects.push(de);if(eg&&de.found&&spend(w,p.cost*.004)){p.defects.pop();}}};
 // Önde giden kalem: süre artarsa sıradakine geçer (sıralı iş)
 let t=1,guard=0;
 while(t>.001&&guard++<40&&p.cur<p.items.length){if(p.eng>0||p.auto||(globalThis as any).BOTAUTO)autoRun(w,p);const it=p.items[p.cur];
  if(it.prog>=.9999){if(!it.fin)complete(it);p.cur++;continue;}
  const u=work(it,t,true);if(u<0)break;t-=u;if(it.prog>=.9999)p.cur++;if(p.reason)break;}
 // Paralel kalemler: kaba iş bitince dış cephe, tesisat ve ince işler kat kat birlikte yürür.
 // Bir kalem, önceki kalem %40'a gelince başlayabilir; aynı branş iki kalemde birden çalışmaz.
 if(!p.halt||p.reason.endsWith('bitti')){const PAR=['dis','tes','ince','tes2'];const busy=new Set<string>();const fr=p.items[p.cur];if(fr&&ITEM[fr.id].tr)busy.add(ITEM[fr.id].tr);
  for(let j=p.cur+1;j<Math.min(p.items.length,p.cur+5);j++){const it=p.items[j],prev=p.items[j-1];const d=ITEM[it.id];
   if(!PAR.includes(d.ph)||!PAR.includes(ITEM[prev.id].ph)||prev.prog<.4)break;if(it.prog>=.9999)continue;if(d.tr&&busy.has(d.tr))continue;
   if(p.auto&&d.tr&&!it.tas&&f.crews[d.tr].n<siteCap(p.m2)*.25&&!(extra[d.tr]?.n))it.tas=true;
   if(d.tr)busy.add(d.tr);if(p.auto||p.eng>0||(globalThis as any).BOTAUTO)autoMats(w,p,it);work(it,1,false);}
  while(p.cur<p.items.length&&p.items[p.cur].prog>=.9999){if(!p.items[p.cur].fin)complete(p.items[p.cur]);p.cur++;}}
 if(p.reason){p.halt=true;}
 if(p.cur>=p.items.length)finishBuild(w,p);}
function finishBuild(w:World,p:Project){const f=w.firm!,st=STAGES[p.stage];p.prog=1;let tot=0,wei=0;for(const it of p.items){const d=ITEM[it.id];if(d.st){tot+=(it.tq||60)*d.st;wei+=d.st;}}const b0=wei?tot/wei:60;const hidden=p.defects.reduce((s,d)=>s+d.sev*(d.found?.3:1),0);const qq=b0<45?'kis':b0>=74?'sag':'nor';p.struct=clamp(b0+p.struct-hidden*.55+(f.qual-40)*.12-(p.skipEtut?10:0)-Math.min(3,p.cheap)*4,5,100);f.exp+=p.cost;f.done[p.stage]=(f.done[p.stage]||0)+1;w.stats.projects++;
 rep(w,({kis:.5,nor:1.3,sag:2.2}[qq]||1)+(f.stage<4?1:0));if(qq==='kis')w.guilt+=2+st.tier;
 if(st.floors>0){const r:string[]=[];for(const u of p.units)if(u.buyer&&r.length<5)r.push(u.buyer.replace(' ve diğerleri',''));w.buildings.push({id:p.id,name:p.name,stage:p.stage,struct:p.struct,year:year(w),floors:p.floors,slot:p.slot,residents:r,state:'ayakta',q:qq,gen:w.gen,owner:w.surname,city:p.city,m2:p.m2,look:p.look,shops:p.shops});w.flags.lastDone=w.m;
 for(const u of p.units)if(u.rent&&u.sold<u.n){const n=u.n-u.sold;w.rentals.push({name:p.name+', '+u.l,city:p.city,val:market(w,p,u)*n/.85,n});}}
 log(w,`${p.name} bitti.`,'iyi');if(p.stage===25){w.cash+=12e7;log(w,'Halka arz yapıldı, kasaya büyük para girdi.','iyi');}if(p.stage===5&&!w.flags.tabela){w.flags.tabela=1;rep(w,3);}if(p.stage===11)f.equip.kamyon=1;
 if(st.kind!=='sat'||soldFrac(p)>=.999)w.projects.splice(w.projects.indexOf(p),1);else p.status='satis';const e=f.engs.find(x=>x.id===p.eng);if(e)e.pid=-1;p.eng=0;
 if(p.stage===f.stage&&(f.done[p.stage]>=st.req)&&f.stage<29)promote(w);}
function promote(w:World){const f=w.firm!;f.stage++;log(w,`Yeni aşama: ${STAGES[f.stage].n}.`,'iyi');genOffers(w,true);if(f.stage===14&&!f.path)w.cards.unshift({id:'_yol',a:{}});}
EV._yol={id:'_yol',title:()=>'Şirketin yolu',text:()=>'Şehirde yeterince tanınıyorsun. Bundan sonra neyle anılacaksın?',o:()=>[
 {t:'Lüks projeler: pahalı, az ve seçkin',f:(w)=>{w.firm!.path='luks';rep(w,3);return'Broşürde artık "yaşam" yazıyor, "daire" değil.';}},
 {t:'Ucuz toplu konut: çok, hızlı, kalabalık',f:(w)=>{w.firm!.path='halk';return'Herkes bir yerde senin yaptığın bir evde oturuyor.';}},
 {t:'Devlet işleri: sağlam ama siyasi',f:(w)=>{w.firm!.path='devlet';hatir(w,10);return'Şimdi telefonlarına Ankara da bakıyor.';}}]};
const SOK=['Gül','Lale','Menekşe','Çınar','Akasya','Ihlamur','Bahar','Yıldız','Huzur','Umut','Güneş','Zeytin','Nar','Karanfil','Söğüt','Papatya'];
/** Proje adı: mahalle, sokak, aile büyüklerinin ya da çocukların adı (Türkiye'de müteahhitlerin bildik âdeti) */
function projName(w:World,s:number,hood:string){const st=STAGES[s];const kn=kids(w).filter(k=>alive(k)).map(k=>k.name);const sp=spouse(w);
 if(st.kind==='ihale'){const t=s<=1?['Tadilat İşi','Kat İlavesi','Bina Onarımı']:s===8?['Kaldırım İşi','İstinat Duvarı','Okul Onarımı','Park Düzenlemesi']:s===9?['Kooperatif Konutları','Yapı Kooperatifi']:['İhalesi','Kamu Binası','Hizmet Binası'];return hood+' '+pick(w,t);}
 if(st.floors>=10||st.flats>=30){const o=[hood+' '+pick(w,['Sitesi','Evleri','Konakları','Rezidansı']),pick(w,['Park','Vadi','Bahçe','Panorama','Yeşil','Mavi','Kent'])+' '+hood,w.surname+' '+pick(w,['Konakları','Sitesi','Park'])];if(kn.length&&chance(w,.25))o.push(pick(w,kn)+' '+pick(w,['Sitesi','Konakları']));return pick(w,o);}
 const o=[hood+' '+pick(w,['Apartmanı','Yapısı']),pick(w,SOK)+' Sokak Apartmanı',pick(w,SOK)+' Apartmanı',w.surname+' Apartmanı'];if(kn.length)o.push(pick(w,kn)+' Apartmanı',pick(w,kn)+' Apartmanı');if(sp&&alive(sp))o.push(sp.name+' Apartmanı');return pick(w,o);}
export function genOffers(w:World,force:boolean){const f=w.firm;if(!f)return;w.offers=w.offers.filter(o=>o.expires>w.m);const mx=5;const nw=force||w.offers.length===0?2:(chance(w,.55)||w.flags.bonusOffer?1:0);if(w.flags.bonusOffer)w.flags.bonusOffer=0;
 let top=f.stage;while(top>0&&STAGES[top].rep>f.rep+4)top--;for(let i=0;i<nw&&w.offers.length<mx;i++){let s=top;if(!chance(w,.65)&&top>0)s=Math.max(0,top-ri(w,1,2));if(STAGES[s].kind==='kurum'&&f.done[s]>0)s=top;if(STAGES[s].kind==='kurum'&&(f.done[s]>0||w.offers.some(x=>x.stage===s)||w.projects.some(p=>p.stage===s)))continue;const st=STAGES[s];
  let city=w.city;if(st.kind==='ihale'&&s>=8&&chance(w,.6)||st.kind==='sat'&&s>=12&&chance(w,.3)){city=pick(w,Object.keys(CITIES));}const hood=pick(w,CITIES[city].hoods);
  const o:Offer={id:w.nid++,stage:s,name:st.kind==='kurum'?st.n:projName(w,s,hood),city,hood,locMul:.86+rnd(w)*.32,expires:w.m+ri(w,6,14)};if(st.kind==='sat'){o.deal=mkDeal(w,o);o.imar={floors:Math.max(2,st.floors+ri(w,-1,2))};if(s<=10&&s>=2&&chance(w,.35))o.mergeCost=Math.round(st.cost*.14*CITIES[city].mul);}w.offers.push(o);}}
function invMonth(w:World){const e=w.econ;const v=w.inv;const ph=e.phase;if(v.altin)v.altin*=1+(ph==='kriz'?.012:.002)+(rnd(w)-.5)*.012;if(v.doviz)v.doviz*=1+(ph==='kriz'?.016:.002)+(rnd(w)-.5)*.01;if(v.borsa)v.borsa*=1+({kriz:-.022,durgun:-.003,canli:.007,patlama:.017}[ph]||0)+(rnd(w)-.5)*.05;if(v.tarla)v.tarla*=1+(ph==='patlama'?.009:.003);if(v.kira){v.kira*=1.0015;w.cash+=v.kira*.0038*(ph==='kriz'?.7:1);}
 for(const k in w.biz)if(w.biz[k]){const b=BIZ[k];let inc=b.inc;if(k==='otel')inc*=[.3,.3,.4,.7,1,1.5,2,2,1.2,.6,.3,.3][mon(w)]*(ph==='kriz'?.6:1);w.cash+=inc;}if(w.biz.tv)w.flags.tv=1;}
function familyMonth(w:World){const me=pl(w);const yr=mon(w)===0;
 if(yr){if(spouse(w)&&kids(w).length<4&&age(w,me)<46&&chance(w,.3))newChild(w,me,spouse(w)!);
  for(const p of family(w)){if(p.work>0)p.work+=1.5;if(p.gen===me.gen&&p.sp===undefined&&age(w,p)>22&&chance(w,.16)&&p.id!==me.sp&&p.fa!==undefined){const s=addPerson(w,{sex:p.sex==='e'?'k':'e',by:p.by,sur:p.sur,dream:'',gen:p.gen});s.sp=p.id;p.sp=s.id;}
   if(p.sp!==undefined&&p.fa!==undefined&&p.kids.length<3&&age(w,p)<42&&chance(w,.18)&&alive(w.people[p.sp]))newChild(w,p,w.people[p.sp],true);
   if(p.sp===undefined&&age(w,p)>24&&chance(w,.12)&&p.fa!==undefined&&p.kids.length===0){const s=addPerson(w,{sex:p.sex==='e'?'k':'e',by:p.by+12,sur:p.sur,dream:'',gen:p.gen});s.sp=p.id;p.sp=s.id;}
  }
  for(const p of Object.values(w.people)){if(p.id===w.playerId||!alive(p))continue;if(chance(w,mort(age(w,p),70))){p.dm=w.m;p.cause='yaşlılık ya da hastalık';p.job=undefined;w.stats.dead++;if(p.fa===undefined&&p.mo===undefined&&p.sp!==w.playerId&&p.gen<me.gen)continue;log(w,`${relTo(w,p)} ${p.name} ${p.sur} ${age(w,p)} yaşında öldü.`,'aile');if(w.heirId===p.id)w.heirId=-1;}}}}
function newChild(w:World,a:Person,b:Person,quiet=false){const fa=a.sex==='e'?a:b,mo=a.sex==='e'?b:a;const k=addPerson(w,{sex:chance(w,.5)?'e':'k',by:w.m,sur:a.fa!==undefined||a.id===w.playerId?a.sur:b.sur,fa:fa.id,mo:mo.id,tal:clamp(Math.round((a.tal+b.tal)/2+ri(w,-15,15)),10,99),gen:a.gen+1});a.kids.push(k.id);b.kids.push(k.id);if(!quiet)log(w,`${k.name} doğdu.`,'aile');}
const mort=(a:number,lim:number)=>a<45?.002:a<lim?.01+(a-45)*.0014:.05+(a-lim)*.012;
function rivalMonth(w:World){const r=w.rival;if(mon(w)===6&&chance(w,.32))r.stage=Math.min(29,r.stage+1);if(mon(w)===6&&w.econ.phase==='kriz'&&chance(w,.3))r.stage=Math.max(0,r.stage-2);if(mon(w)===0&&chance(w,.03)){r.gen++;r.head=pick(w,MNAMES);log(w,`${r.name} ailesinin başına ${r.head} geçti.`);}}
function quakeCheck(w:World){const y=year(w);if(mon(w)!==9)return;const q=w.quakes.find(q=>q.y===y);if(!q)return;w.quakeNow=q.sev;let lost=0,saved=0;const th=q.sev*72;const local=w.buildings.filter(b=>b.city===w.city);
 for(const b of local){if(b.state==='yikik')continue;if(b.struct<th-10){b.state='yikik';lost++;}else if(b.struct<th){b.state='hasar';}else{saved++;}}
 w.stats.collapse+=lost;w.stats.saved+=saved;w.health=clamp(w.health-5,1,100);stress(w,20);w.econ.demand*=.72;w.econ.phase='durgun';w.econ.left=18;
 if(!local.length){w.cards.unshift({id:'_deprem0',a:{sev:q.sev}});return;}
 const a=lost>0?(pick(w,local.filter(b=>b.state==='yikik')).name):null;w.cards.unshift({id:'_deprem',a:{lost,saved,a,sev:q.sev}});log(w,`${y}: Büyük deprem. ${lost?lost+' binan yıkıldı.':'Binaların ayakta.'}`,lost?'kotu':'iyi');
 if(lost===0){rep(w,10+saved);if(saved>0)w.flags.achDeprem=1;}else{rep(w,-Math.min(45,12+lost*7));w.firm&&(w.firm.qual=clamp(w.firm.qual-6,10,100));cash(w,-Math.min(sc(w,1+lost*.8),w.cash*.5+sc(w,.5)));w.guilt+=lost*5;}}
EV._deprem0={id:'_deprem0',kind:'not',title:()=>'Deprem',text:()=>'Gece dört. Yer homurdandı. Şehirde binalar yıkıldı, sen ve bildiğin ustalar sabaha kadar enkazda el ile taş kaldırdınız. O gün neden sağlam yapmak gerektiğini herkes öğrendi.',o:()=>[{t:'Sabaha kadar enkaz',f:(w)=>{for(const k in w.skills)w.skills[k]=Math.min(100,w.skills[k]+4);hatir(w,8);hurt(w,5);w.flags.enkaz=1;return'Ellerin hâlâ titriyor. Betona artık başka bakıyorsun.';}}]};
EV._deprem={id:'_deprem',kind:'kotu',title:()=>'Deprem',text:(w,a)=>a.lost>0?`Gece dört. ${a.a} ve ${a.lost-1>0?a.lost-1+' binan daha':'başka bina yok'} yıkıldı. Sabah telefonun susmuyor. Savcılar, avukatlar, tanıdığın isimler. Yıllar önce döktüğün betonun faturası bugüne kaldı.`:`Gece dört, şehir sallandı. Komşu binalar yıkılırken ${a.saved} binan ayakta kaldı. Sokakta insanlar elindeki baretle sana bakıyor. Yıllar önce demirden kısmadığın için bugün kimse ölmedi.`,o:(w,a)=>a.lost>0?[{t:'Enkazın başına git, hesabını ver',f:(w)=>{hatir(w,4);w.guilt=Math.max(0,w.guilt-6);cash(w,-sc(w,.5));if(chance(w,.3)){w.jail=ri(w,10,24);w.stats.jail++;return'Teslim oldun. Tutuklandın.';}return'Elindeki taşı bırakmadın. Yüzüne tükürenler de oldu, su verenler de.';}},{t:'Yurt dışına geç, avukatlar konuşsun',f:(w)=>{w.guilt+=8;rep(w,-14);cash(w,-sc(w,1));return'Otel odasından televizyona baktın. Tanıdık bir apartman gösteriyorlardı.';}}]:[{t:'Enkaz için ekip ve kepçeleri gönder',f:(w)=>{rep(w,6);hatir(w,12);cash(w,-sc(w,.4));return'Baretli ustaların sabaha kadar insan çıkardı.';}},{t:'Telefonları aç, sipariş topla',f:(w)=>{rep(w,3);cash(w,sc(w,1));return'Herkes senin dairelerini istiyor. Fiyatını da biliyorsun.';}}]};
function schedule(w:World){const due=w.sched.filter(s=>s.m<=w.m);if(due.length===0)return;for(const s of due){if(s.id==='_unflag'){w.flags[s.a.k]=0;continue;}const ev=EV[s.id];if(!ev)continue;if(w.cards.length>0||(ev.c&&!ev.c(w))){s.m=w.m+ri(w,2,6);continue;}w.cards.push({id:s.id,a:s.a||{}});}w.sched=w.sched.filter(s=>s.m>w.m);}
function director(w:World){if(w.cards.length){w.cool=ri(w,2,5);return;}
 w.comfort++;const y=year(w);if(mon(w)===0&&y%5===0&&w.flags.pencere!==y&&w.m>0){w.flags.pencere=y;w.cards.push({id:'pencere',a:{}});w.cool=2;return;}
 if(--w.cool>0)return;w.cool=ri(w,3,7);
 const low=w.cash<sc(w,.3)&&w.debt>sc(w,.8);const pain=low?.2:Math.min(.75,.34+w.comfort*.008);const pos:{id:string;w:number}[]=[];
 for(const k in EV){const e=EV[k];if(k[0]==='_'||!e.c)continue;if(!safeC(e,w))continue;const gap=(e.gap??60)*(1+.45*Math.min(6,w.flags['n_'+k]||0));if(w.seen[k]!==undefined&&w.m-w.seen[k]<gap)continue;let wt=e.w??1;if(e.kind==='kotu')wt*=(chance(w,pain)?2.4:.4);if(e.kind==='iyi')wt*=low?2.2:1;pos.push({id:k,w:wt});}
 if(!pos.length)return;let t=pos.reduce((s,p)=>s+p.w,0)*rnd(w);let ch=pos[0];for(const p of pos){t-=p.w;if(t<=0){ch=p;break;}}
 const e=EV[ch.id];w.cards.push({id:ch.id,a:e.mk?e.mk(w):{}});w.seen[ch.id]=w.m;w.flags['n_'+ch.id]=(w.flags['n_'+ch.id]||0)+1;if(e.kind==='kotu')w.comfort=0;}
const safeC=(e:{c?:(w:World)=>boolean},w:World)=>{try{return e.c!(w);}catch{return false;}};
function finance(w:World){
 const due=w.payables.filter(p=>p.m<=w.m);w.payables=w.payables.filter(p=>p.m>w.m);let unpaid=0,un:string[]=[];for(const d of due){if(d.amt>0){if(w.cash>=d.amt)w.cash-=d.amt;else{unpaid+=d.amt-Math.max(0,w.cash);w.debt+=d.amt-Math.max(0,w.cash);w.cash=Math.min(w.cash,0);if(!un.includes(d.note))un.push(d.note);}}else{if(chance(w,.06)){log(w,d.note+' karşılıksız çıktı.','kotu');}else w.cash+=-d.amt;}}if(unpaid>0){rep(w,-1);log(w,`${un.join(', ')} ödenemedi; ${money(unpaid)} bankadan krediye çevrildi.`,'kotu');}
 if(w.debt>0){const i=w.debt*w.econ.rate*(w.firm&&w.firm.stage>=12?.55:1)/12;w.debt+=i*.5;w.cash-=i*.5;}
 if(w.cash<0){const n=-w.cash;w.cash=0;w.debt+=n*1.03;w.flags.negMonths=(w.flags.negMonths||0)+1;}else w.flags.negMonths=0;
 if(w.debt>Math.max(30000,loanLimit(w)*1.4+assets(w))&&(w.flags.negMonths||0)>3&&w.m>(w.flags.lastBank||0)+24&&!w.cards.some(c=>c.id==='_haciz'))w.cards.unshift({id:'_haciz',a:{}});}
export const assets=(w:World)=>w.rentals.reduce((s,r)=>s+r.val,0)+Object.values(w.inv).reduce((s,v)=>s+v,0)+HOMES[w.home].p*.7+CARS[w.car].p*.4+Object.keys(w.stock).reduce((s,m)=>s+(w.stock[m]||0)*MATS[m].p*.6,0);
EV._haciz={id:'_haciz',kind:'kotu',title:()=>'Haciz memuru kapıda',text:(w)=>`Sabah bir memur ve iki polis. Banka borcu ${money(w.debt)}. Kasa boş. Ev, araba, depo, ne varsa dosyada. ${w.firm?'Şantiyelere kilit vuruluyor.':''}`,o:(w)=>[
 {t:'Kabul et, borcu sıfırlat, yeniden başla',f:bankrupt},
 ...(w.hatir>=20?[{t:'Hatır defterini aç, herkesi ara',f:(w:World)=>{hatir(w,-20);w.debt*=.5;w.flags.negMonths=0;return'Otuz yıllık selamlar tek gecede bozuldu, ama borcun yarısı yeniden yapılandı.';}}]:[])]};
function bankrupt(w:World){const f=w.firm;w.stats.bankrupt++;w.flags.lastBank=w.m;for(const k in w.inv)w.inv[k]=0;for(const k in w.biz)w.biz[k]=false;w.stock={};w.payables=[];w.rentals=[];if(w.firm){w.firm.equip={};w.firm.masters=w.firm.masters.filter(()=>chance(w,.3));}w.home=HOMES[w.home].p===0?w.home:3;w.car=Math.min(w.car,1);w.debt=0;w.flags.negMonths=0;w.health=Math.max(w.health,40);w.projects=[];w.offers=[];log(w,'Batış. Her şey haczedildi.','kotu');
 if(f){f.stage=Math.max(0,f.stage-ri(w,2,4));w.cash=Math.max(3000,STAGES[f.stage].cost*.12);f.cert=Math.max(0,f.cert-1);f.rep=Math.max(8,f.rep*.65);loseCrew(w,.6);f.engs.forEach(e=>{e.pid=-1;});f.engs=[];f.qual=Math.max(20,f.qual-10);f.done=f.done.map((d,i)=>i>=f.stage?0:d);f.exp*=.7;genOffers(w,true);}else w.cash=800;
 stress(w,25);hurt(w,5);for(const p of family(w))if(p.sp===w.playerId)bond(w,p.id,-8);return'Tabelayı kendi ellerinle indirdin. Kalan kadro ile küçük işlere döneceksin. Gerekirse kendin çalışırsın.';}
function deathCheck(w:World){const me=pl(w);const a=age(w,me);let p=0;if(mon(w)===0)p=a<45?.001:a<60?.005:a<70?.012+(a-60)*.004:.05+(a-70)*.02;p+=w.health<15?.02:w.health<5?.1:0;if(chance(w,p)){me.dm=w.m;me.cause=w.jail>0?'cezaevinde kalp krizi':'kalp krizi';succeed(w);}}
export function succeed(w:World){const me=pl(w);log(w,`${full(me)} ${age(w,me)} yaşında öldü.`,'aile');const c=heirCandidates(w).sort((a,b)=>scoreHeir(w,b)-scoreHeir(w,a));
 const lives=family(w);if(c.length===0){const rel=lives.filter(p=>age(w,p)>=16);if(rel.length===0){w.over={why:'Soyun son ferdi de öldü. Binalar ayakta, tabela boş.'};return;}c.push(rel[0]);}
 const will=w.heirId>=0&&alive(w.people[w.heirId])&&c.some(p=>p.id===w.heirId);w.flags.dosyaDede=me.name;w.selfWork='';w.cards=[];w.result=null;
 if(will){doSucceed(w,w.people[w.heirId],true);}else{const list=c.slice(0,3).map(p=>p.id);w.flags.adaylar=list;w.cards.push({id:'_miras',a:{list}});}}
export function scoreHeir(w:World,p:Person){return p.work*1.5+p.edu*.6+p.tal*.6+(p.dream==='insaat'||p.dream==='mimar'?20:0)+(p.fa===w.playerId||p.mo===w.playerId?15:0)-(p.kus?10:0);}
EV._miras={id:'_miras',kind:'kotu',title:()=>'Vasiyet yok',text:(w)=>`${w.flags.dosyaDede} vasiyet bırakmadı. Cenazeden sonra herkes aynı masada: avukatlar, akrabalar, muhasebeci. Kim oturacak o koltuğa?`,o:(w,a)=>a.list.map((id:number)=>{const p=w.people[id];return{t:`${p.name} (${age(w,p)}, ${p.work>15?'işin içinden':'dışarıdan'})`,f:(ww:World)=>{ww.cash*=.68;if(ww.firm)loseCrew(ww,.18);if(chance(ww,.45)){ww.rival.stage=Math.min(29,ww.rival.stage+1);}doSucceed(ww,ww.people[id],false);return'Kardeşler kavga etti, payını alan gitti. Şirket eksik ama ayakta.';}};})};
function doSucceed(w:World,h:Person,will:boolean){const old=pl(w);w.playerId=h.id;w.flags['kan'+h.id]=1;w.gen=Math.max(w.gen+1,h.gen);h.sur=w.surname;h.job=undefined;w.heirId=-1;w.stress=20;w.health=clamp(95-(age(w,h)>40?age(w,h)-40:0),30,95);w.jail=0;w.evening='kahve';
 const edu=h.edu/2,work=h.work;w.skills={demir:6+work*.8+h.tal*.08,beton:6+work*.9+edu*.3+h.tal*.08,kalip:5+work*.6,duvar:5+work*.6,ince:5+work*.4+edu*.2};
 if(w.firm){const r=h.dream==='insaat'||h.dream==='mimar'||work>15;if(!r){rep(w,-6);w.firm.qual=clamp(w.firm.qual-8,10,100);}if(will)rep(w,1);if(h.tal>70)w.firm.qual=clamp(w.firm.qual+3,0,100);w.projects.forEach(p=>{p.seal=Math.max(p.seal,1);});}
 w.cards=w.cards.filter(c=>c.id==='_devir');w.cards.push({id:'_devir',a:{from:old.id,will}});if(w.buildings.some(b=>b.q==='kis'))w.sched.push({m:w.m+ri(w,6,40),id:'dosya',a:{}});log(w,`${h.name} ${h.sur} şirketin başına geçti. ${w.gen}. kuşak.`,'aile');}
const GOALS=['"O kuleyi dikeceğiz" demişti.','"Şehrin en büyük projesi bizim olsun" derdi.','"Kimseye muhtaç olma" demişti.','"Binalarımın altında kimse kalmasın" diye yalvardı.','"Rakip ailenin önünde eğilme" demişti.'];
EV._devir={id:'_devir',kind:'not',title:(w)=>w.people[w.playerId].name+' koltukta',text:(w,a)=>{const o=w.people[a.from],h=w.people[w.playerId];return`${o.name} ${o.sur} toprağa verildi. ${w.firm?`${w.firm.name} artık senin. ${h.work<10?'Şantiyeyi az biliyorsun, ustalar seni tartıyor.':'Ustalar seni çocukluğundan tanıyor.'}`:'Ondan sana evle birkaç hatır kaldı.'} Son sözü: ${GOALS[h.id%GOALS.length]}`;},o:(w)=>[{t:'Sözümü tutacağım',f:(w)=>{for(const p of family(w))bond(w,p.id,6);return w.flags.mala?'Malayı masanın üstüne koydun.':undefined;}},{t:'Kendi yolumu çizeceğim',f:(w)=>{rep(w,-1);stress(w,6);hatir(w,-2);return'İlk toplantıda eski müdürü değiştirdin. Odada hava değişti.';}}]};
export function epitaph(w:World){const live=w.buildings.filter(b=>b.state==='ayakta');const fall=w.buildings.filter(b=>b.state==='yikik');return{live:live.length,fall:fall.length,gen:w.gen,peak:w.peakStage,net:netWorth(w)};}

// ---------- TEST BOTU: işi bilen sıradan bir oyuncu gibi oynar ----------
export function botTurn(w:World){if(w.over)return;(globalThis as any).BOTAUTO=true;let g=0;while(w.cards.length&&g++<8){const o=buildOpts(w,w.cards[0]);const idx=o.map((x,i)=>x.off?-1:i).filter(i=>i>=0);if(!idx.length){w.cards.shift();continue;}resolve(w,idx[Math.floor(rnd(w)*idx.length)]);}w.result=null;
 if(!w.firm){w.trade='beton';w.evening=w.cash>5000&&chance(w,.3)?'kahve':'okul';rankUp(w);if(canOpenFirm(w))openFirm(w);if(w.home<2&&w.cash>1500)buyHome(w,1);return;}
 const f=w.firm;w.evening=spouse(w)&&spouse(w)!.bond<45?'aile':(w.stress>60?'dinlen':'kahve');w.selfWork=w.cash<1000&&f.stage<8&&w.health>45?'isci':'';
 const ks=heirCandidates(w);if(w.heirId<0&&ks.length){const b=ks.sort((a,b)=>scoreHeir(w,b)-scoreHeir(w,a))[0];setHeir(w,b.id);}
 for(const p of w.projects){if(p.status==='insa'){inspect(w,p.id);p.defects.forEach((d,i)=>{if(d.found)fixDefect(w,p.id,i);});}for(const u of p.units)u.pr=w.econ.phase==='kriz'?.94:1;}
 const up=certNext(w);if(up&&up.ok&&w.cash>up.fee*2)upgradeCert(w);
 if(f.stage>=6&&f.engs.length<Math.min(1+f.stage/3,w.projects.filter(p=>p.status==='insa').length-1)&&w.cash>engFee(w)*12)hireEng(w);for(const e of f.engs)if(e.pid<=0){const p=w.projects.find(x=>x.status==='insa'&&!x.eng);if(p)assignEng(w,e.id,p.id);}
 if(f.qual<40&&w.cash>2000){f.qual+=.5;w.cash-=500;}
 for(const o of w.offers){if(o.deal&&!o.deal.ok&&canStartKeys(w,o)){let t=0;while(t++<6&&w.offers.includes(o)&&o.deal.patience>2&&o.deal.ask>o.deal.min)negotiate(w,o.id,pick(w,['kat','sert','para','hatir']));if(w.offers.includes(o))negotiate(w,o.id,'kabul');}else if(STAGES[o.stage].kind==='ihale'&&o.stage>=8&&!o.bidDone&&canStartKeys(w,o))bid(w,o.id,1);}
 if(w.offers.length){const o=w.offers.slice().sort((a,b)=>b.stage-a.stage)[0];const n=cashNeed(w,o.stage)*1.4-w.cash;if(n>0&&w.debt+n<loanLimit(w)*.6)borrow(w,Math.ceil(n));}
 const halted=w.projects.some(p=>p.halt&&p.reason.startsWith("Para"));const cand=halted||w.debt>STAGES[f.stage].cost*.45||w.projects.filter(p=>p.status==='insa').length>=3+f.engs.length?undefined:w.offers.filter(o=>canStart(w,o)&&w.cash>cashNeed(w,o.stage)*1.2).sort((a,b)=>b.stage-a.stage)[0];if(cand)startProject(w,cand.id,w.guilt>10?'sag':(chance(w,.12)?'kis':chance(w,.3)?'sag':'nor'));
 if(w.cash<cashNeed(w,f.stage)){for(const k in w.inv)if(w.inv[k]>0)divest(w,k,.5);}
 if(w.debt>0&&w.cash>Math.max(sc(w,1.5),cashNeed(w,f.stage)*1.5))repay(w,w.cash-cashNeed(w,f.stage)*1.3);
 if(w.cash>STAGES[f.stage].cost*1.6){const k=pick(w,['altin','kira','borsa','tarla','doviz']);invest(w,k,Math.round(w.cash*.15));}
 for(let i=HOMES.length-1;i>w.home;i--)if(w.cash>HOMES[i].p*8+STAGES[f.stage].cost){buyHome(w,i);break;}for(let i=CARS.length-1;i>w.car;i--)if(w.cash>CARS[i].p*15+STAGES[f.stage].cost){buyCar(w,i);break;}
 for(const k in BIZ)if(w.cash>BIZ[k].p*4+STAGES[f.stage].cost)buyBiz(w,k);}
function canStartKeys(w:World,o:Offer){return stageKeys(w,o.stage).filter(k=>k.n!=='Nakit').every(k=>k.ok);}
void crewTotal;void base;void stress;void kids;void hurt;void netWorth;void curPhase;void INV;
WD.setLoanRef(loanLimit);
