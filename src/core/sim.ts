import type {World,Project,Person,Offer} from './types';
import {STAGES,REF_SHARE,CERT,CERT_EXP,RANKS,WAGE,DEFECTS,HOMES,CARS,INV,BIZ,CITIES,SCENS,SURNAMES,RIVALS,HOODS,MNAMES,FNAMES} from './data';
import {rnd,ri,pick,chance,clamp,year,mon,pl,age,alive,log,sc,cash,rep,hurt,stress,hatir,bond,kids,spouse,addPerson,family,base,money,netWorth,heirCandidates,full} from './util';
import {EV,ARC,buildOpts,LIVE_BLD} from './events';

export function newWorld(o:{seed?:number;scen?:string;city?:string;legacy?:string|null}={}):World{
 const seed=o.seed??Math.floor(Math.random()*2**31);
 const w:World={v:1,seed,rng:seed,m:0,scen:'',city:'',surname:'',playerId:0,heirId:-1,founderId:0,gen:1,people:{},nid:1,cash:0,debt:0,rank:0,xp:0,trade:'beton',skills:{demir:8,beton:8,kalip:8,duvar:8,ince:4},evening:'kahve',employer:'',unemployed:0,firm:null,projects:[],offers:[],buildings:[],home:0,car:0,inv:{altin:0,doviz:0,borsa:0,tarla:0,kira:0},biz:{},health:92,stress:15,guilt:0,hatir:0,jail:0,econ:{phase:'canli',left:24,demand:1,mat:1,rate:.2,fx:1,gold:1,stock:1,land:1,news:''},crises:[],quakes:[],cards:[],sched:[],seen:{},flags:{},arcs:[],cool:4,comfort:0,log:[],rival:{name:'',stage:0,rel:40,head:'',gen:1},result:null,over:null,peakStage:0,stats:{collapse:0,saved:0,accidents:0,bankrupt:0,jail:0,projects:0,dead:0},legacy:o.legacy??null};
 const keys=Object.keys(SCENS);w.scen=o.scen&&SCENS[o.scen]?o.scen:pick(w,keys);const sc0=SCENS[w.scen];
 const yJit=ri(w,-2,3);const startY=sc0.y+yJit;w.m=startY*12+ri(w,1,9);
 w.city=o.city&&CITIES[o.city]?o.city:pick(w,Object.keys(CITIES));
 w.surname=pick(w,SURNAMES);w.rival.name=pick(w,RIVALS.filter(r=>r!==w.surname));w.rival.head=pick(w,MNAMES);
 w.rank=sc0.rank;w.cash=sc0.cash;w.debt=sc0.debt;w.employer=pick(w,['Kel Hikmet','Hacı Nuri','Topal Sabri','Bıyıklı Kenan','Müteahhit Zeki'])+"'in şantiyesi";
 const me=addPerson(w,{sex:sc0.sex,by:w.m-sc0.age*12-ri(w,0,11),sur:w.surname,dream:'insaat',tal:ri(w,50,75),bond:70,gen:1});w.playerId=me.id;w.founderId=me.id;
 const fa=addPerson(w,{name:pick(w,MNAMES),sex:'e',by:me.by-12*ri(w,22,30),sur:w.surname,dream:'',gen:0});const mo=addPerson(w,{name:pick(w,FNAMES),sex:'k',by:me.by-12*ri(w,18,25),sur:w.surname,dream:'',gen:0,bond:80});
 fa.sp=mo.id;mo.sp=fa.id;fa.kids.push(me.id);mo.kids.push(me.id);me.fa=fa.id;me.mo=mo.id;w.flags.anne=mo.id;
 const nsib=ri(w,1,3);for(let i=0;i<nsib;i++){const s=addPerson(w,{sex:chance(w,.5)?'e':'k',by:me.by+12*ri(w,-3,8),sur:w.surname,fa:fa.id,mo:mo.id,gen:1});fa.kids.push(s.id);mo.kids.push(s.id);}
 if(w.scen==='batik'){fa.dm=w.m-ri(w,2,20);fa.cause='batan iş';w.flags.batik=1;w.home=1;w.skills={demir:14,beton:18,kalip:14,duvar:12,ince:8};w.hatir=-6;}
 if(w.scen==='kalfa'){w.home=1;w.skills={demir:16,beton:22,kalip:16,duvar:18,ince:8};w.flags.yemin=1;}
 if(w.scen==='dul'){const h=addPerson(w,{sex:'e',by:me.by-36,sur:w.surname,dream:'',gen:1});h.dm=w.m-ri(w,1,3);h.cause='iş kazası';me.sp=undefined;for(let i=0;i<2;i++){const k=addPerson(w,{sex:chance(w,.5)?'e':'k',by:w.m-12*ri(w,3,11),sur:w.surname,fa:h.id,mo:me.id,gen:2});me.kids.push(k.id);h.kids.push(k.id);}w.home=3;w.skills={demir:10,beton:10,kalip:8,duvar:8,ince:16};
   openFirmRaw(w,w.surname+' İnşaat');w.firm!.stage=2;w.firm!.done=[2,2,...Array(28).fill(0)];w.firm!.crew=5;w.firm!.rep=18;w.firm!.qual=38;w.flags.ustalar=1;
   w.projects.push(mkProject(w,{id:0,stage:2,name:'Rahmetlinin binası',loc:pick(w,HOODS),locMul:1,share:.45,haggled:true,expires:0},'nor',.45));w.projects[0].prog=.45;}
 // Dünya: krizler ve depremler her oyunda farklı
 const y0=year(w);for(let y=y0+ri(w,5,12);y<y0+130;y+=ri(w,7,15))w.crises.push(y);
 const qm=CITIES[w.city].quake;let qy=y0+ri(w,10,24);while(qy<y0+130){w.quakes.push({y:qy,sev:clamp(.45+rnd(w)*.45*qm,.3,.98)});qy+=Math.round(ri(w,18,42)/qm);}
 // Hikâye yayları: her oyunda farklı karışım
 const arcs=Object.keys(ARC).sort(()=>rnd(w)-.5).slice(0,ri(w,7,10));w.arcs=arcs;
 for(const a of arcs){const late=['donus','tapu','ortak','gazeteci','kiz','cirak','muhtar'].includes(a);w.sched.push({m:w.m+(late?ri(w,70,260):ri(w,4,70)),id:ARC[a],a:{}});}
 if(w.legacy)w.sched.push({m:w.m+ri(w,40,120),id:'efsane',a:{}});
 w.sched.push({m:w.m+1,id:'_intro',a:{}});
 w.econ.news=eraNews(w);log(w,`${year(w)}: Hikâyen ${CITIES[w.city].n}'te başladı.`,'not');
 return w;}
EV._intro={id:'_intro',title:(w)=>SCENS[w.scen].n,text:(w)=>SCENS[w.scen].d+' '+CITIES[w.city].d,o:()=>[{t:'Başla'}]};
function eraNews(w:World){const y=year(w);const p=w.econ.phase;if(p==='kriz')return pick(w,['Dolar yine zıpladı, demirci telefona bakmıyor.','Satışlar durdu, emlakçılar çay içiyor.','Bankalar kredi musluğunu kıstı.']);if(p==='durgun')return pick(w,['Piyasada sessizlik, herkes ötekini bekliyor.','Arsa sahipleri hâlâ eski fiyatta ısrarcı.']);if(p==='patlama')return pick(w,['Faiz düştü, kredi kuyruğu kapıya kadar.','Gazeteler: "Konut alan kazandı."','Vinç kiralamak için sıra var.']);
 if(y<1995)return pick(w,['İmar affı konuşuluyor.','Köyden göç sürüyor, şehir taşıyor.','Radyoda seçim haberleri.']);if(y<2010)return pick(w,['Yapı denetim yasası gündemde.','Toplu konut ihaleleri açılıyor.','Kooperatifler çoğaldı.']);if(y<2035)return pick(w,['Kentsel dönüşüm yasası konuşuluyor.','Rezidans modası sokağa indi.','Yetki belgesi şartları ağırlaşıyor.']);return pick(w,['Şehirde yeni bir fay haritası yayımlandı.','Akıllı bina zorunluluğu geldi.','Eski sitelerin dönüşüm vakti.']);}
function openFirmRaw(w:World,name:string){w.firm={name,stage:0,done:Array(30).fill(0),cert:0,exp:0,rep:6,crew:2,qual:35,eng:false,open:w.m,path:''};}

// ---------- OYUNCU EYLEMLERİ ----------
export function canOpenFirm(w:World){return!w.firm&&w.rank>=2&&w.cash>=18000;}
export function openFirm(w:World){if(!canOpenFirm(w))return false;w.cash-=8000;openFirmRaw(w,w.surname+' İnşaat');log(w,`${w.firm!.name} kuruldu. Tabela daha kurumadı.`,'iyi');genOffers(w,true);return true;}
export function canRankUp(w:World){if(w.firm||w.rank>=RANKS.length-1)return false;const need=[20,32,40][w.rank];const best=Object.values(w.skills).sort((a,b)=>b-a);return w.xp>=need&&best[0]>=[16,28,40][w.rank]&&best[1]>=[12,22,32][w.rank];}
export function rankUp(w:World){if(!canRankUp(w))return false;w.rank++;w.xp=0;log(w,`${RANKS[w.rank]} oldun.`,'iyi');return true;}
export function stageKeys(w:World,s:number){const st=STAGES[s];const f=w.firm;if(!f)return[];const ck=cashNeed(w,s);return[
 {n:'Nakit',ok:w.cash>=ck,v:money(ck)},{n:'İtibar',ok:f.rep>=st.rep,v:String(st.rep)},{n:'Belge',ok:f.cert>=st.cert,v:CERT[st.cert]+' grubu'},{n:'Ekip',ok:f.crew>=st.crew,v:st.crew+' kişi'}];}
export const cashNeed=(w:World,s:number)=>Math.round(STAGES[s].cost*(STAGES[s].kind==='kurum'?1:s<12?.1:.18));
export function canStart(w:World,o:Offer){return stageKeys(w,o.stage).every(k=>k.ok)&&w.projects.filter(p=>p.status==='insa').length<capacity(w)&&w.jail<=0;}
export const capacity=(w:World)=>w.firm?1+Math.floor(w.firm.stage/8):0;
function mkProject(w:World,o:Offer,q:'kis'|'nor'|'sag',share:number):Project{const st=STAGES[o.stage];let cost=st.cost,net=st.net;if(w.flags.ortak&&o.stage>=15){cost*=.5;net*=.5;}
 const gross=st.kind==='sat'?net*o.locMul/(1-REF_SHARE):net;return{id:w.nid++,stage:o.stage,name:o.name,loc:o.loc,q,prog:0,months:st.mo,cost,gross,share:st.kind==='sat'?share:0,sold:0,seal:0,defects:[],struct:{kis:30,nor:60,sag:84}[q]+ri(w,-5,5),status:'insa',halt:false,floors:st.floors,slot:w.buildings.length+w.projects.length,partner:!!w.flags.ortak};}
export function startProject(w:World,offerId:number,q:'kis'|'nor'|'sag'){const i=w.offers.findIndex(o=>o.id===offerId);if(i<0)return false;const o=w.offers[i];if(!canStart(w,o))return false;
 if(STAGES[o.stage].kind==='kurum'){w.cash-=0;}const p=mkProject(w,o,q,o.share);if(w.flags.ortak&&o.stage>=15)w.flags.ortak=0;if(q==='kis'&&!w.flags.ilkKisma){w.flags.ilkKisma=w.m;}w.projects.push(p);w.offers.splice(i,1);log(w,`${p.name} başladı.`);
 if(w.stats.projects===0&&!w.flags.bizdeBina)w.flags.bizdeBina=1;return true;}
export function haggle(w:World,offerId:number){const o=w.offers.find(o=>o.id===offerId);if(!o||o.haggled)return'';o.haggled=true;const p=.35+w.hatir/100+(w.firm?w.firm.rep/250:0);if(chance(w,p)){o.share=Math.max(.2,o.share-.06);return'Arsa sahibi çayını yudumladı: "Peki." Payı düştü.';}if(chance(w,.3)){w.offers=w.offers.filter(x=>x.id!==offerId);return'Arsa sahibi sinirlendi, başka müteahhide gitti.';}return'"O kadar olmaz," dedi. Pay aynı kaldı.';}
export function presale(w:World,pid:number){const p=w.projects.find(p=>p.id===pid);if(!p||STAGES[p.stage].kind!=='sat'||p.sold>=.6||p.status!=='insa')return false;const f=.2;p.sold+=f;w.cash+=p.gross*(1-p.share)*f*.8*(.5+.5*w.econ.demand);w.flags.satis=(w.flags.satis||0)+1;return true;}
export function inspect(w:World,pid:number){const p=w.projects.find(p=>p.id===pid);if(!p||p.status!=='insa')return null;const f=w.firm!;const out:{txt:string;trade:string;id:number}[]=[];
 const last=w.flags['tour'+pid]||0;if(last===w.m)return{again:true,list:p.defects.map((d,i)=>({...d,i})).filter(d=>d.found)};w.flags['tour'+pid]=w.m;
 p.defects.forEach((d)=>{if(d.found)return;const sk=clamp(w.skills[d.trade]+(f.eng?25:0),0,95);if(chance(w,sk/100))d.found=true;});w.skills.beton+=.2;w.skills.demir+=.2;return{again:false,list:p.defects.map((d,i)=>({...d,i})).filter(d=>d.found)};void out;}
export function fixDefect(w:World,pid:number,i:number){const p=w.projects.find(p=>p.id===pid);if(!p)return false;const d=p.defects[i];if(!d||!d.found)return false;const c=Math.round(p.cost*.012*d.sev/8);if(w.cash<c)return false;w.cash-=c;p.struct+=d.sev;p.defects.splice(i,1);w.flags.fixed=(w.flags.fixed||0)+1;return true;}
export function ignoreDefect(w:World,pid:number,i:number){const p=w.projects.find(p=>p.id===pid);if(!p)return;p.defects.splice(i,1);p.struct-=3;w.guilt+=1;}
export function hire(w:World,n:number){const f=w.firm;if(!f)return false;const c=n*600;if(w.cash<c)return false;w.cash-=c;f.crew+=n;return true;}
export function fire(w:World,n:number){const f=w.firm;if(!f||f.crew-n<1)return false;f.crew-=n;f.qual=clamp(f.qual-1,0,100);return true;}
export function train(w:World){const f=w.firm;if(!f)return false;const c=Math.max(1500,f.crew*200);if(w.cash<c)return false;w.cash-=c;f.qual=clamp(f.qual+3,0,100);return true;}
export function toggleEng(w:World){const f=w.firm;if(!f)return;f.eng=!f.eng;}
export function certNext(w:World){const f=w.firm;if(!f||f.cert>=7)return null;const need=CERT_EXP[f.cert+1];return{letter:CERT[f.cert+1],need,fee:Math.round(need*.012),ok:f.exp>=need&&w.cash>=Math.round(need*.012)};}
export function upgradeCert(w:World){const c=certNext(w);if(!c||!c.ok)return false;w.cash-=c.fee;w.firm!.cert++;log(w,`${c.letter} grubu yetki belgesi alındı.`,'iyi');return true;}
export function loanLimit(w:World){let l=2000;if(w.firm){l=Math.max(15000,STAGES[w.firm.stage].cost*(.6+w.firm.rep/100));}for(const p of w.projects)l+=p.gross*(1-p.share)*(1-p.sold)*(STAGES[p.stage].kind==='sat'?.55:.35)*Math.max(.3,p.status==='satis'?1:p.prog);l+=(w.inv.kira||0)*.6+(w.inv.tarla||0)*.4+HOMES[w.home].p*.5;return Math.round(l);}
export function borrow(w:World,n:number){if(w.debt+n>loanLimit(w))return false;w.cash+=n;w.debt+=n;return true;}
export function repay(w:World,n:number){n=Math.min(n,w.debt,w.cash);if(n<=0)return false;w.cash-=n;w.debt-=n;return true;}
export function buyHome(w:World,i:number){const h=HOMES[i];if(!h||i===w.home)return false;if(w.cash<h.p)return false;w.cash-=h.p;const old=HOMES[w.home];if(old.p>0)w.cash+=old.p*.75;w.home=i;log(w,`Yeni evin: ${h.n}.`,'aile');for(const p of family(w))if(i>2)bond(w,p.id,2);return true;}
export function buyCar(w:World,i:number){const c=CARS[i];if(!c||i===w.car)return false;if(w.cash<c.p)return false;w.cash-=c.p;const old=CARS[w.car];if(old.p>0)w.cash+=old.p*.45;w.car=i;log(w,`Araban: ${c.n}.`,'aile');rep(w,c.s>=5?1:0);return true;}
export function invest(w:World,k:string,n:number){if(!INV[k]||n<=0||w.cash<n)return false;w.cash-=n;w.inv[k]=(w.inv[k]||0)+n;return true;}
export function divest(w:World,k:string,frac:number){const v=(w.inv[k]||0)*frac;if(v<=0)return false;w.inv[k]-=v;w.cash+=v*(k==='tarla'||k==='kira'?.94:.99);return true;}
export function buyBiz(w:World,k:string){const b=BIZ[k];if(!b||w.biz[k]||!w.firm||w.firm.stage<b.st||w.cash<b.p)return false;w.cash-=b.p;w.biz[k]=true;log(w,`${b.n} satın alındı.`,'iyi');return true;}
export function sellBiz(w:World,k:string){const b=BIZ[k];if(!b||!w.biz[k])return false;w.biz[k]=false;w.cash+=b.p*.6;return true;}
export function setHeir(w:World,id:number){w.heirId=id;log(w,`${w.people[id].name} varis olarak yazıldı.`,'aile');}
export function miniReward(w:World,score:number){const t=w.trade;w.skills[t]=clamp(w.skills[t]+score*.9,0,100);w.xp+=score*.5;w.cash+=Math.round(WAGE[w.rank]*.02*score);return Math.round(WAGE[w.rank]*.02*score);}
export function resolve(w:World,i:number){prune(w);const c=w.cards[0];if(!c)return;const o=buildOpts(w,c)[i];if(!o||o.off)return;const t=EV[c.id].title(w,c.a);w.cards.shift();let r:string|void=undefined;try{r=o.f?o.f(w,c.a):undefined;}catch(e){if((globalThis as any).STRICT)throw e;}w.result=typeof r==='string'?r:null;w.seen[c.id]=w.m;if(r&&EV[c.id].kind==='kotu')w.comfort=0;if(EV[c.id].kind!=='not'&&c.id[0]!=='_')log(w,t+(r?': '+r:''),EV[c.id].kind);finalize(w);}

// ---------- AYLIK ADIM ----------
export function advance(w:World){if(w.over||w.cards.length)return false;w.m++;
 econMonth(w);if(w.jail>0)w.jail--;lifeMonth(w);workMonth(w);firmMonth(w);invMonth(w);familyMonth(w);rivalMonth(w);quakeCheck(w);schedule(w);director(w);finance(w);deathCheck(w);finalize(w);return true;}
export function prune(w:World){w.cards=w.cards.filter(c=>{const e=EV[c.id];return !!e&&(!e.c||safeC(e,w));});}
function finalize(w:World){prune(w);if(w.firm)w.peakStage=Math.max(w.peakStage,w.firm.stage);}
function econMonth(w:World){const e=w.econ;e.left--;const y=year(w);
 if(mon(w)===0&&w.crises.includes(y)&&e.phase!=='kriz'){e.phase='kriz';e.left=ri(w,14,30);e.fx*=1.3+rnd(w)*.4;e.mat*=1.2;e.rate=Math.min(.6,e.rate+.15);log(w,`${y}: Ekonomik kriz patladı.`,'kotu');e.news=eraNews(w);}
 else if(e.left<=0){const n=e.phase==='kriz'?'durgun':e.phase==='durgun'?(chance(w,.6)?'canli':'patlama'):e.phase==='canli'?(chance(w,.45)?'patlama':'durgun'):'durgun';e.phase=n;e.left=ri(w,14,44);e.news=eraNews(w);}
 const T:Record<string,[number,number,number]>={kriz:[.5,1.2,.42],durgun:[.78,1,.24],canli:[1,1,.18],patlama:[1.28,1.08,.12]};const[d,m,r]=T[e.phase];
 e.demand+=(d-e.demand)*.09;e.mat+=(m-e.mat)*.05+(rnd(w)-.5)*.01;e.rate+=(r-e.rate)*.05;e.mat=clamp(e.mat,.75,2);e.demand=clamp(e.demand,.3,1.5);
 e.fx*=1+(e.phase==='kriz'?.01:.0025)+(rnd(w)-.5)*.012;e.gold*=1+(e.phase==='kriz'?.012:.002)+(rnd(w)-.5)*.015;e.stock*=1+({kriz:-.018,durgun:-.002,canli:.006,patlama:.016}[e.phase]||0)+(rnd(w)-.5)*.05;e.land*=1+(e.phase==='patlama'?.012:.003);if(mon(w)%6===0)e.news=eraNews(w);}
function lifeMonth(w:World){const me=pl(w),a=age(w,me),home=HOMES[w.home],car=CARS[w.car];
 w.cash-=home.r+car.u;w.cash-=(420+kids(w).length*140+(spouse(w)?100:0))*(1+Math.min(w.home,6)*.25);
 const e=w.evening;if(w.jail>0){hurt(w,.3);return;}if(e==='ek'&&!w.firm){w.cash+=WAGE[w.rank]*.28;hurt(w,.35);stress(w,.8);}if(e==='okul'){w.xp+=.4;for(const k in w.skills)w.skills[k]=Math.min(100,w.skills[k]+.08);w.cash-=40;stress(w,.2);}if(e==='kahve'){hatir(w,.25);stress(w,-.4);w.cash-=30;}if(e==='aile'){for(const k of family(w))if(k.sp===me.id||k.fa===me.id||k.mo===me.id)bond(w,k.id,.8);stress(w,-1);}if(e==='dinlen'){w.health=clamp(w.health+.5,1,100);stress(w,-1.5);}
 else if(e!=='aile'){for(const k of family(w))if(k.sp===me.id)bond(w,k.id,-.28);}
 w.health=clamp(w.health+(.07*(HOMES[w.home].c-1))-(a>45?.05:0)-(a>60?.1:0)-(w.firm?.02:0)-(w.stress>70?.15:0),1,100);
 stress(w,w.projects.length*.12-.25+(w.debt>w.cash*2&&w.debt>0?.3:0));if(w.guilt>18&&chance(w,.03))stress(w,4);}
function workMonth(w:World){if(w.firm)return;if(w.unemployed>0){w.unemployed--;return;}w.cash+=WAGE[w.rank]*(w.econ.phase==='kriz'?.8:1);w.xp+=1;w.skills[w.trade]=Math.min(100,w.skills[w.trade]+.42);for(const k in w.skills)if(k!==w.trade)w.skills[k]=Math.min(100,w.skills[k]+.09);hurt(w,.05+(w.rank<2?.05:0));}
function firmMonth(w:World){const f=w.firm;if(!f)return;if(w.m%3===0||w.flags.bonusOffer)genOffers(w,false);
 const tierCost=Math.max(100,STAGES[f.stage].cost*.0016);w.cash-=f.crew*(f.stage<6?70:150)*(1+f.qual/120)+tierCost+(f.eng?base(w)*.05:0);
 if(w.jail>0&&chance(w,.1))rep(w,-1);if(w.jail<=0&&!w.flags.tv)rep(w,-.02);rep(w,Math.min(.16,LIVE_BLD(w).length*.012));f.qual=clamp(f.qual-.02,10,100);
 if(!w.projects.some(p=>p.status==='insa'&&!p.halt)&&f.stage<=7&&w.jail<=0){w.cash+=WAGE[2]*1.1+f.crew*90;w.flags.gundelik=1;}else{w.flags.gundelik=0;if(f.stage<=5&&w.jail<=0)w.cash+=WAGE[2]*.6;}
 for(const p of w.projects.slice()){if(p.status==='insa')buildMonth(w,p);else sellMonth(w,p);}}
function buildMonth(w:World,p:Project){const f=w.firm!;const st=STAGES[p.stage];if(p.seal>0){p.seal--;p.halt=true;return;}
 const crewF=clamp(f.crew/Math.max(1,st.crew),.4,1.15)*(0.85+f.qual/500)*(w.jail>0?.6:1);const dp=crewF/p.months;
 const qm=p.q==='kis'?.82:p.q==='sag'?1.14:1;let mat=w.econ.mat;if(w.biz.ocak)mat*=.95;if(f.done[17]>0)mat*=.95;if(f.done[11]>0)mat*=.98;
 const spend=p.cost/p.months*qm*(.55+.45*mat)*crewF;const inc=st.kind==='ihale'?p.gross*dp:0;if(w.cash+inc<spend&&!(w.cash+inc+loanRoom(w)>=spend)){p.halt=true;rep(w,-.15);f.qual=clamp(f.qual-.1,10,100);return;}p.halt=false;
 const pd=w.econ.phase==='kriz'&&chance(w,.3)?.6:1;if(st.kind==='ihale')w.cash+=p.gross*dp*pd;if(w.cash<spend)borrow(w,Math.ceil(spend-w.cash));w.cash-=spend;p.prog+=dp;
 // Gizli kusurlar: oyuncu şantiye turuyla yakalar
 if(st.kind!=='kurum'&&chance(w,(p.q==='kis'?.22:.1)*(1.2-f.qual/100))){const tr=pick(w,Object.keys(DEFECTS));const sev=ri(w,4,10);p.defects.push({trade:tr,sev,txt:pick(w,DEFECTS[tr]),found:false});}
 if(st.kind==='sat'&&f.done[13]>0&&p.sold<.6){const v=.016*w.econ.demand;p.sold+=v;w.cash+=p.gross*(1-p.share)*v*.92;}
 if(p.prog>=1)finishBuild(w,p);}
function loanRoom(w:World){return Math.max(0,loanLimit(w)-w.debt);}
function finishBuild(w:World,p:Project){const f=w.firm!,st=STAGES[p.stage];p.prog=1;const hidden=p.defects.reduce((s,d)=>s+d.sev*(d.found?.3:1),0);p.struct=clamp(p.struct-hidden*.7+(f.qual-40)*.12,5,100);f.exp+=p.cost;f.done[p.stage]=(f.done[p.stage]||0)+1;w.stats.projects++;
 const q=p.q;rep(w,({kis:1,nor:2.2,sag:3.6}[q]||2)+st.tier*.2+(f.stage<4?1.5:0));
 if(q==='kis'){w.guilt+=2+st.tier;}
 if(st.floors>0){const r:string[]=[];for(let i=0;i<Math.min(4,st.floors+1);i++)r.push(pick(w,['Öğretmen ','Emekli ','Doktor ','Hemşire ','Terzi ','Şoför ','Kuaför ','Memur ','Bakkal '])+pick(w,chance(w,.5)?MNAMES:FNAMES)+' Bey/Hanım'.slice(0,0)+'');
  w.buildings.push({id:p.id,name:p.name,stage:p.stage,struct:p.struct,year:year(w),floors:st.floors,slot:p.slot,residents:r,state:'ayakta',q,gen:w.gen,owner:w.surname});
  w.quakeNow=undefined;}
 log(w,`${p.name} bitti.`,'iyi');
 if(p.stage===25){w.cash+=8e8;log(w,'Halka arz yapıldı, kasaya büyük para girdi.','iyi');}
 if(p.stage===5&&!w.flags.tabela){w.flags.tabela=1;rep(w,3);}
 if(st.kind==='ihale'||st.kind==='kurum'||p.sold>=1)w.projects.splice(w.projects.indexOf(p),1);else p.status='satis';
 if(p.stage===f.stage&&(f.done[p.stage]>=st.req)&&f.stage<29)promote(w);}
function promote(w:World){const f=w.firm!;f.stage++;log(w,`Yeni aşama: ${STAGES[f.stage].n}.`,'iyi');genOffers(w,true);
 if(f.stage===14&&!f.path)w.cards.unshift({id:'_yol',a:{}});}
EV._yol={id:'_yol',title:()=>'Şirketin yolu',text:()=>'Şehirde yeterince tanınıyorsun. Bundan sonra neyle anılacaksın?',o:()=>[
 {t:'Lüks projeler: pahalı, az ve seçkin',f:(w)=>{w.firm!.path='luks';rep(w,3);return'Broşürde artık "yaşam" yazıyor, "daire" değil.';}},
 {t:'Ucuz toplu konut: çok, hızlı, kalabalık',f:(w)=>{w.firm!.path='halk';w.firm!.crew=Math.round(w.firm!.crew*1.15);return'Herkes bir yerde senin yaptığın bir evde oturuyor.';}},
 {t:'Devlet işleri: sağlam ama siyasi',f:(w)=>{w.firm!.path='devlet';hatir(w,10);return'Şimdi telefonlarına Ankara da bakıyor.';}}]};
function sellMonth(w:World,p:Project){const f=w.firm!;let v=.11*w.econ.demand*(.55+f.rep/110)*(p.q==='sag'?1.08:p.q==='kis'?.96:1);if(f.done[13]>0)v*=1.25;if(w.city==='sahil')v*=1.1;v=Math.min(v,1-p.sold);p.sold+=v;
 let price=(.9+.1*w.econ.demand)*(.92+f.rep/1000);price*=({luks:1.08,halk:.97,devlet:1}[f.path]??1);w.cash+=p.gross*(1-p.share)*v*price;if(p.sold>=.999)w.projects.splice(w.projects.indexOf(p),1);}
export function genOffers(w:World,force:boolean){const f=w.firm;if(!f)return;w.offers=w.offers.filter(o=>o.expires>w.m);const mx=4;const nw=force||w.offers.length===0?2:(chance(w,.5)||w.flags.bonusOffer?1:0);if(w.flags.bonusOffer)w.flags.bonusOffer=0;
 for(let i=0;i<nw&&w.offers.length<mx;i++){let s=f.stage;if(!chance(w,.68)&&f.stage>0)s=Math.max(0,f.stage-ri(w,1,2));if(STAGES[s].kind==='kurum'&&f.done[s]>0)s=f.stage;if(STAGES[s].kind==='kurum'&&f.done[s]>0)continue;
  const hood=pick(w,HOODS);const st=STAGES[s];w.offers.push({id:w.nid++,stage:s,name:st.kind==='kurum'?st.n:hood+' '+pick(w,st.floors>=10?['Sitesi','Evleri','Konakları','Rezidansı']:st.kind==='ihale'?['İşi','İhalesi']:['Apartmanı','Yapısı','Sokak Binası']),loc:hood,locMul:.86+rnd(w)*.32,share:st.kind==='sat'?clamp(.42+rnd(w)*.14,.3,.6):0,haggled:false,expires:w.m+ri(w,6,14)});}}
function invMonth(w:World){const e=w.econ;const v=w.inv;const ph=e.phase;if(v.altin)v.altin*=1+(ph==='kriz'?.012:.002)+(rnd(w)-.5)*.012;if(v.doviz)v.doviz*=1+(ph==='kriz'?.016:.002)+(rnd(w)-.5)*.01;if(v.borsa)v.borsa*=1+({kriz:-.022,durgun:-.003,canli:.007,patlama:.017}[ph]||0)+(rnd(w)-.5)*.05;if(v.tarla)v.tarla*=1+(ph==='patlama'?.009:.003);if(v.kira){v.kira*=1.0015;w.cash+=v.kira*.0038*(ph==='kriz'?.7:1);}
 for(const k in w.biz)if(w.biz[k]){const b=BIZ[k];let inc=b.inc;if(k==='otel')inc*=[.3,.3,.4,.7,1,1.5,2,2,1.2,.6,.3,.3][mon(w)]*(ph==='kriz'?.6:1);w.cash+=inc;}if(w.biz.tv)w.flags.tv=1;}
function familyMonth(w:World){const me=pl(w);const yr=mon(w)===0;
 if(yr){if(spouse(w)&&kids(w).length<4&&age(w,me)<46&&chance(w,.3))newChild(w,me,spouse(w)!);
  for(const p of family(w)){if(p.work>0)p.work+=1.5;if(p.gen===me.gen&&p.sp===undefined&&age(w,p)>22&&chance(w,.16)&&p.id!==me.sp&&p.fa!==undefined){const s=addPerson(w,{sex:p.sex==='e'?'k':'e',by:p.by,sur:p.sur,dream:'',gen:p.gen});s.sp=p.id;p.sp=s.id;}
   if(p.sp!==undefined&&p.fa!==undefined&&p.kids.length<3&&age(w,p)<42&&chance(w,.18)&&alive(w.people[p.sp]))newChild(w,p,w.people[p.sp],true);
   if(p.sp===undefined&&age(w,p)>24&&chance(w,.12)&&p.fa!==undefined&&p.kids.length===0){const s=addPerson(w,{sex:p.sex==='e'?'k':'e',by:p.by+12,sur:p.sur,dream:'',gen:p.gen});s.sp=p.id;p.sp=s.id;}
  }
  for(const p of Object.values(w.people)){if(p.id===w.playerId||!alive(p))continue;if(chance(w,mort(age(w,p),70))){p.dm=w.m;p.cause='yaşlılık ya da hastalık';w.stats.dead++;if(p.fa===undefined&&p.mo===undefined&&p.sp!==w.playerId&&p.gen<me.gen)continue;log(w,`${p.name} ${p.sur} öldü.`,'aile');if(w.heirId===p.id)w.heirId=-1;}}}}
function newChild(w:World,a:Person,b:Person,quiet=false){const fa=a.sex==='e'?a:b,mo=a.sex==='e'?b:a;const k=addPerson(w,{sex:chance(w,.5)?'e':'k',by:w.m,sur:a.fa!==undefined||a.id===w.playerId?a.sur:b.sur,fa:fa.id,mo:mo.id,tal:clamp(Math.round((a.tal+b.tal)/2+ri(w,-15,15)),10,99),gen:a.gen+1});a.kids.push(k.id);b.kids.push(k.id);if(!quiet)log(w,`${k.name} doğdu.`,'aile');}
const mort=(a:number,lim:number)=>a<45?.002:a<lim?.01+(a-45)*.0014:.05+(a-lim)*.012;
function rivalMonth(w:World){const r=w.rival;if(mon(w)===6&&chance(w,.32))r.stage=Math.min(29,r.stage+1);if(mon(w)===6&&w.econ.phase==='kriz'&&chance(w,.3))r.stage=Math.max(0,r.stage-2);if(mon(w)===0&&chance(w,.03)){r.gen++;r.head=pick(w,MNAMES);log(w,`${r.name} ailesinin başına ${r.head} geçti.`);}}
function quakeCheck(w:World){const y=year(w);if(mon(w)!==9)return;const q=w.quakes.find(q=>q.y===y);if(!q)return;w.quakeNow=q.sev;let lost=0,saved=0,kin:string|null=null;const th=q.sev*72;
 for(const b of w.buildings){if(b.state==='yikik')continue;if(b.struct<th-10){b.state='yikik';lost++;}else if(b.struct<th){b.state='hasar';}else{saved++;}}
 w.stats.collapse+=lost;w.stats.saved+=saved;
 w.health=clamp(w.health-5,1,100);stress(w,20);w.econ.demand*=.72;w.econ.phase='durgun';w.econ.left=18;
 if(!w.buildings.length){w.cards.unshift({id:'_deprem0',a:{sev:q.sev}});return;}
 const a=lost>0?(pick(w,w.buildings.filter(b=>b.state==='yikik')).name):null;w.cards.unshift({id:'_deprem',a:{lost,saved,a,sev:q.sev}});log(w,`${y}: Büyük deprem. ${lost?lost+' binan yıkıldı.':'Binaların ayakta.'}`,lost?'kotu':'iyi');void kin;
 if(lost===0)rep(w,10+saved);else{rep(w,-Math.min(45,12+lost*7));w.firm&&(w.firm.qual=clamp(w.firm.qual-6,10,100));cash(w,-Math.min(sc(w,1+lost*.8),w.cash*.5+sc(w,.5)));w.guilt+=lost*5;}}
EV._deprem0={id:'_deprem0',kind:'not',title:()=>'Deprem',text:()=>'Gece dört. Yer homurdandı. Şehirde binalar yıkıldı, sen ve bildiğin ustalar sabaha kadar enkazda el ile taş kaldırdınız. O gün neden sağlam yapmak gerektiğini herkes öğrendi.',o:()=>[{t:'Sabaha kadar enkaz',f:(w)=>{for(const k in w.skills)w.skills[k]=Math.min(100,w.skills[k]+4);hatir(w,8);hurt(w,5);w.flags.enkaz=1;return'Ellerin hâlâ titriyor. Betona artık başka bakıyorsun.';}}]};
EV._deprem={id:'_deprem',kind:'kotu',title:()=>'Deprem',text:(w,a)=>a.lost>0?`Gece dört. ${a.a} ve ${a.lost-1>0?a.lost-1+' binan daha':'başka bina yok'} yıkıldı. Sabah telefonun susmuyor. Savcılar, avukatlar, tanıdığın isimler. Yıllar önce döktüğün betonun faturası bugüne kaldı.`:`Gece dört, şehir sallandı. Komşu binalar yıkılırken ${a.saved} binan ayakta kaldı. Sokakta insanlar elindeki baretle sana bakıyor. Yıllar önce demirden kısmadığın için bugün kimse ölmedi.`,o:(w,a)=>a.lost>0?[{t:'Enkazın başına git, hesabını ver',f:(w)=>{hatir(w,4);w.guilt=Math.max(0,w.guilt-6);cash(w,-sc(w,.5));if(chance(w,.3)){w.jail=ri(w,10,24);w.stats.jail++;return'Teslim oldun. Tutuklandın.';}return'Elindeki taşı bırakmadın. Yüzüne tükürenler de oldu, su verenler de.';}},{t:'Yurt dışına geç, avukatlar konuşsun',f:(w)=>{w.guilt+=8;rep(w,-14);cash(w,-sc(w,1));return'Otel odasından televizyona baktın. Tanıdık bir apartman gösteriyorlardı.';}}]:[{t:'Enkaz için ekip ve kepçeleri gönder',f:(w)=>{rep(w,6);hatir(w,12);cash(w,-sc(w,.4));return'Baretli ustaların sabaha kadar insan çıkardı.';}},{t:'Telefonları aç, sipariş topla',f:(w)=>{rep(w,3);cash(w,sc(w,1));return'Herkes senin dairelerini istiyor. Fiyatını da biliyorsun.';}}]};
function schedule(w:World){const due=w.sched.filter(s=>s.m<=w.m);if(due.length===0)return;for(const s of due){if(s.id==='_unflag'){w.flags[s.a.k]=0;continue;}const ev=EV[s.id];if(!ev)continue;if(w.cards.length>0||(ev.c&&!ev.c(w))){s.m=w.m+ri(w,2,6);continue;}if(w.flags.batan&&s.id!=='_intro')continue;w.cards.push({id:s.id,a:s.a||{}});}w.sched=w.sched.filter(s=>s.m>w.m);}
function director(w:World){if(w.cards.length){w.cool=ri(w,2,5);return;}
 w.comfort++;const y=year(w);if(mon(w)===0&&y%5===0&&w.flags.pencere!==y&&w.m>0){w.flags.pencere=y;w.cards.push({id:'pencere',a:{}});w.cool=2;return;}
 if(--w.cool>0)return;w.cool=ri(w,3,7);
 // Hikâye yöneticisi: rahatladıysan kötülük, dipteysen çıkış kapısı
 const low=w.cash<sc(w,.3)&&w.debt>sc(w,.8);const pain=low?.2:Math.min(.75,.34+w.comfort*.008);const pos:{id:string;a:any;w:number}[]=[];
 for(const k in EV){const e=EV[k];if(k[0]==='_'||!e.c)continue;if(!safeC(e,w))continue;const gap=e.gap??60;if(w.seen[k]!==undefined&&w.m-w.seen[k]<gap)continue;let wt=e.w??1;if(e.kind==='kotu')wt*=(chance(w,pain)?2.4:.4);if(e.kind==='iyi')wt*=low?2.2:1;pos.push({id:k,a:null,w:wt});}
 if(!pos.length)return;let t=pos.reduce((s,p)=>s+p.w,0)*rnd(w);let ch=pos[0];for(const p of pos){t-=p.w;if(t<=0){ch=p;break;}}
 const e=EV[ch.id];w.cards.push({id:ch.id,a:e.mk?e.mk(w):{}});w.seen[ch.id]=w.m;if(e.kind==='kotu')w.comfort=0;}
const safeC=(e:{c?:(w:World)=>boolean},w:World)=>{try{return e.c!(w);}catch{return false;}};
function finance(w:World){if(w.debt>0){const i=w.debt*w.econ.rate*(w.firm&&w.firm.stage>=12?.55:1)/12;w.debt+=i*.5;w.cash-=i*.5;}
 if(w.cash<0){const n=-w.cash;w.cash=0;w.debt+=n*1.03;w.flags.negMonths=(w.flags.negMonths||0)+1;}else w.flags.negMonths=0;
 if(w.debt>loanLimit(w)*1.35+assets(w)&&(w.flags.negMonths||0)>2&&!w.cards.some(c=>c.id==='_haciz'))w.cards.unshift({id:'_haciz',a:{}});}
export const assets=(w:World)=>Object.values(w.inv).reduce((s,v)=>s+v,0)+HOMES[w.home].p*.7+CARS[w.car].p*.4;
EV._haciz={id:'_haciz',kind:'kotu',title:()=>'Haciz memuru kapıda',text:(w)=>`Sabah bir memur ve iki polis. Banka borcu ${money(w.debt)}. Kasa boş. Ev, araba, tahvil, ne varsa dosyada. ${w.firm?'Şantiyelere kilit vuruluyor.':''}`,o:(w)=>[
 {t:'Kabul et, borcu sıfırlat, yeniden başla',f:bankrupt},
 ...(w.hatir>=20?[{t:'Hatır defterini aç, herkesi ara',f:(w:World)=>{hatir(w,-20);w.debt*=.5;w.flags.negMonths=0;return'Otuz yıllık selamlar tek gecede bozuldu, ama borcun yarısı yeniden yapılandı.';}}]:[])]};
function bankrupt(w:World){const f=w.firm;w.stats.bankrupt++;for(const k in w.inv)w.inv[k]=0;for(const k in w.biz)w.biz[k]=false;w.home=Math.min(w.home,3)===w.home&&HOMES[w.home].p===0?w.home:3;w.car=Math.min(w.car,1);w.debt=0;w.flags.negMonths=0;w.cash=Math.max(3000,STAGES[f?f.stage:0].cost*.15);w.health=Math.max(w.health,40);w.projects=[];w.offers=[];log(w,'Batış. Her şey haczedildi.','kotu');
 if(f){f.stage=Math.max(0,f.stage-ri(w,2,4));f.cert=Math.max(0,f.cert-1);f.rep=Math.max(8,f.rep*.65);f.crew=Math.max(2,Math.round(f.crew*.5));f.qual=Math.max(20,f.qual-10);f.done=f.done.map((d,i)=>i>=f.stage?0:d);f.exp*=.7;genOffers(w,true);}
 stress(w,25);hurt(w,5);for(const p of family(w))if(p.sp===w.playerId)bond(w,p.id,-8);return'Tabelayı kendi ellerinle indirdin. Kalan kadro ile küçük işlere döneceksin.';}
function deathCheck(w:World){const me=pl(w);const a=age(w,me);let p=0;if(mon(w)===0)p=a<45?.001:a<60?.005:a<70?.012+(a-60)*.004:.05+(a-70)*.02;p+=w.health<15?.02:w.health<5?.1:0;if(w.flags.yurtdisi)p*=.8;if(chance(w,p)){me.dm=w.m;me.cause=w.jail>0?'cezaevinde kalp krizi':'kalp krizi';succeed(w);}}
export function succeed(w:World){const me=pl(w);log(w,`${full(me)} ${age(w,me)} yaşında öldü.`,'aile');const c=heirCandidates(w).sort((a,b)=>scoreHeir(w,b)-scoreHeir(w,a));
 const lives=family(w);if(c.length===0){const rel=lives.filter(p=>age(w,p)>=16);if(rel.length===0){w.over={why:'Soyun son ferdi de öldü. Binalar ayakta, tabela boş.'};return;}c.push(rel[0]);}
 const will=w.heirId>=0&&alive(w.people[w.heirId])&&c.some(p=>p.id===w.heirId);
 w.flags.dosyaDede=me.name;w.cards=[];w.result=null;
 if(will){doSucceed(w,w.people[w.heirId],true);}else{const list=c.slice(0,3).map(p=>p.id);w.flags.adaylar=list;w.cards.push({id:'_miras',a:{list}});}}
export function scoreHeir(w:World,p:Person){return p.work*1.5+p.edu*.6+p.tal*.6+(p.dream==='insaat'||p.dream==='mimar'?20:0)+(p.fa===w.playerId||p.mo===w.playerId?15:0)-(p.kus?10:0);}
EV._miras={id:'_miras',kind:'kotu',title:()=>'Vasiyet yok',text:(w)=>`${w.flags.dosyaDede} vasiyet bırakmadı. Cenazeden sonra herkes aynı masada: avukatlar, akrabalar, muhasebeci. Kim oturacak o koltuğa?`,o:(w,a)=>a.list.map((id:number)=>{const p=w.people[id];return{t:`${p.name} (${age(w,p)}, ${p.work>15?'işin içinden':'dışarıdan'})`,f:(ww:World)=>{ww.cash*=.68;if(ww.firm)ww.firm.crew=Math.max(1,Math.round(ww.firm.crew*.82));if(chance(ww,.45)){ww.rival.stage=Math.min(29,ww.rival.stage+1);}doSucceed(ww,ww.people[id],false);return'Kardeşler kavga etti, payını alan gitti. Şirket eksik ama ayakta.';}};})};
function doSucceed(w:World,h:Person,will:boolean){const old=pl(w);w.playerId=h.id;w.flags['kan'+h.id]=1;w.gen=Math.max(w.gen+1,h.gen);h.sur=w.surname;w.heirId=-1;w.stress=20;w.health=clamp(95-(age(w,h)>40?age(w,h)-40:0),30,95);w.jail=0;w.evening='kahve';
 const edu=h.edu/2,work=h.work;w.skills={demir:6+work*.8+h.tal*.08,beton:6+work*.9+edu*.3+h.tal*.08,kalip:5+work*.6,duvar:5+work*.6,ince:5+work*.4+edu*.2};
 if(w.firm){const r=h.dream==='insaat'||h.dream==='mimar'||work>15;if(!r){rep(w,-6);w.firm.qual=clamp(w.firm.qual-8,10,100);}if(will)rep(w,1);if(h.tal>70)w.firm.qual=clamp(w.firm.qual+3,0,100);
  w.projects.forEach(p=>{p.seal=Math.max(p.seal,1);});}
 if(age(w,h)<20)w.flags.vasi=w.m+(20-age(w,h))*12;
 w.cards=w.cards.filter(c=>c.id==='_devir');w.cards.push({id:'_devir',a:{from:old.id,will}});
 if(w.buildings.some(b=>b.q==='kis'))w.sched.push({m:w.m+ri(w,6,40),id:'dosya',a:{}});
 log(w,`${h.name} ${h.sur} şirketin başına geçti. ${w.gen}. kuşak.`,'aile');}
const GOALS=['"O kuleyi dikeceğiz" demişti.','"Şehrin en büyük projesi bizim olsun" derdi.','"Kimseye muhtaç olma" demişti.','"Binalarımın altında kimse kalmasın" diye yalvardı.','"Rakip ailenin önünde eğilme" demişti.'];
EV._devir={id:'_devir',kind:'not',title:(w)=>w.people[w.playerId].name+' koltukta',text:(w,a)=>{const o=w.people[a.from],h=w.people[w.playerId];return`${o.name} ${o.sur} toprağa verildi. ${w.firm?`${w.firm.name} artık senin. ${h.work<10?'Şantiyeyi az biliyorsun, ustalar seni tartıyor.':'Ustalar seni çocukluğundan tanıyor.'}`:'Ondan sana evle birkaç hatır kaldı.'} Son sözü: ${GOALS[h.id%GOALS.length]}`;},o:(w)=>[{t:'Sözümü tutacağım',f:(w)=>{for(const p of family(w))bond(w,p.id,6);return w.flags.mala?'Malayı masanın üstüne koydun.':undefined;}},{t:'Kendi yolumu çizeceğim',f:(w)=>{rep(w,-1);stress(w,6);hatir(w,-2);return'İlk toplantıda eski müdürü değiştirdin. Odada hava değişti.';}}]};
export function finishGame(w:World){w.walk=true;}
export function epitaph(w:World){const live=w.buildings.filter(b=>b.state==='ayakta');const fall=w.buildings.filter(b=>b.state==='yikik');const sag=live.filter(b=>b.q==='sag').length,kis=live.filter(b=>b.q==='kis').length;return{live:live.length,fall:fall.length,sag,kis,gen:w.gen,peak:w.peakStage,net:netWorth(w)};}

// ---------- TEST BOTU ----------
export function botTurn(w:World){if(w.over)return;let g=0;while(w.cards.length&&g++<8){const o=buildOpts(w,w.cards[0]);const idx=o.map((x,i)=>x.off?-1:i).filter(i=>i>=0);if(!idx.length){w.cards.shift();continue;}resolve(w,idx[Math.floor(rnd(w)*idx.length)]);}
 if(!w.firm){w.trade='beton';w.evening=w.cash>5000&&chance(w,.3)?'kahve':'okul';rankUp(w);if(canOpenFirm(w))openFirm(w);if(w.home<2&&w.cash>1500)buyHome(w,1);return;}
 const f=w.firm;w.evening=spouse(w)&&spouse(w)!.bond<45?'aile':(w.stress>60?'dinlen':'kahve');
 const ks=heirCandidates(w);if(w.heirId<0&&ks.length){const b=ks.sort((a,b)=>scoreHeir(w,b)-scoreHeir(w,a))[0];setHeir(w,b.id);}
 for(const p of w.projects){if(p.status==='insa'){inspect(w,p.id);p.defects.forEach((d,i)=>{if(d.found)fixDefect(w,p.id,i);});if(w.cash<p.cost/p.months*3)presale(w,p.id);}}
 const up=certNext(w);if(up&&up.ok&&w.cash>up.fee*2)upgradeCert(w);
 const need=STAGES[f.stage].crew;if(f.crew<need){hire(w,Math.min(need-f.crew,Math.max(1,Math.floor(w.cash/2000))));}
 if(f.qual<40&&w.cash>f.crew*400)train(w);
 if(w.offers.length){const o=w.offers.slice().sort((a,b)=>b.stage-a.stage)[0];const n=cashNeed(w,o.stage)*1.4-w.cash;if(n>0&&w.debt+n<loanLimit(w)*.6)borrow(w,Math.ceil(n));}
 const cand=w.projects.some(p=>p.halt)||w.debt>STAGES[f.stage].cost*.6?undefined:w.offers.filter(o=>canStart(w,o)&&w.cash>cashNeed(w,o.stage)*1.2).sort((a,b)=>b.stage-a.stage)[0];if(cand)startProject(w,cand.id,w.guilt>10?'sag':(chance(w,.12)?'kis':chance(w,.3)?'sag':'nor'));
 if(w.cash<cashNeed(w,f.stage)&&w.inv){for(const k in w.inv)if(w.inv[k]>0)divest(w,k,.5);}
 if(w.debt>0&&w.cash>Math.max(sc(w,1.5),cashNeed(w,f.stage)*1.5))repay(w,w.cash-cashNeed(w,f.stage)*1.3);
 if(w.cash>STAGES[f.stage].cost*1.6){const k=pick(w,['altin','kira','borsa','tarla','doviz']);invest(w,k,Math.round(w.cash*.15));}
 for(let i=HOMES.length-1;i>w.home;i--)if(w.cash>HOMES[i].p*8+STAGES[f.stage].cost){buyHome(w,i);break;}for(let i=CARS.length-1;i>w.car;i--)if(w.cash>CARS[i].p*15+STAGES[f.stage].cost){buyCar(w,i);break;}
 for(const k in BIZ)if(w.cash>BIZ[k].p*4+STAGES[f.stage].cost)buyBiz(w,k);}
void stress;void netWorth;void LIVE_BLD;void kids;void age;void hurt;
