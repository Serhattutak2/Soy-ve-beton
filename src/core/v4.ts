// Uzun oyun paketi: yurt dışı ve mega işlerin olayları, bina yaşlanması ve dönüşüm, kuşak vasiyetleri,
// aile dramı, holding şirketleri ve şubeler, arsa bankası, uzun hikâye zincirleri, isimli kadro, zorluk ve yıl sonu raporu.
import type {World,Person,Offer,Land,Staff,Building,Deal} from './types';
import {STAGES,CITIES,TR_KEYS,MNAMES,FNAMES,LAST,M2_PRICE,priceMul,landShare,SUBS,ROLES,DIFF,dif} from './data';
import {rnd,ri,pick,chance,clamp,year,mon,pl,age,alive,log,cash,rep,stress,hatir,bond,kids,spouse,family,money,ek,netWorth} from './util';
import {EV} from './events';
import type {Ev} from './events';
const def=(e:Ev)=>{EV[e.id]=e;};
const hasF=(w:World)=>!!w.firm;
const st=(w:World)=>w.firm?w.firm.stage:0;
/** Aşamaya göre para ölçeği (bağış, güçlendirme, arsa) */
const scale=(w:World)=>Math.max(30000,STAGES[Math.max(2,st(w))].cost);

// ================= ZORLUK =================
export function applyDiff(w:World,d:number){w.diff=clamp(Math.round(d),0,3);const D=DIFF[w.diff];w.cash=Math.round(w.cash*D.cash);
 if(D.crisis!==1){const y0=year(w);w.crises=[];for(let y=y0+Math.round(ri(w,5,12)*D.crisis);y<y0+260;y+=Math.max(4,Math.round(ri(w,7,15)*D.crisis)))w.crises.push(y);}}

// ================= YIL SONU RAPORU =================
export function yearReport(w:World){const nw=netWorth(w);if(!w.yr){w.yr={nw,proj:w.stats.projects,bld:w.buildings.length,m:w.m};return;}if(mon(w)!==0)return;
 const y=year(w)-1;const since=w.yr.m;const lg=w.log.filter(l=>l.m>since);
 const news=lg.filter(l=>l.k==='iyi'||l.k==='kotu').slice(0,4).map(l=>l.t);const fam=lg.filter(l=>l.k==='aile').slice(0,4).map(l=>l.t);
 w.report={y,nw,dnw:nw-w.yr.nw,proj:w.stats.projects-w.yr.proj,bld:w.buildings.length-w.yr.bld,news:[w.econ.news,...news].filter(Boolean).slice(0,4),fam,seen:false};
 w.yr={nw,proj:w.stats.projects,bld:w.buildings.length,m:w.m};}

// ================= BİNA YAŞLANMASI =================
export const bAge=(w:World,b:Building)=>year(w)-b.year;
function agingYear(w:World){if(mon(w)!==0)return;for(const b of w.buildings){if(b.state!=='ayakta')continue;const a=bAge(w,b);const d=.22+(b.q==='kis'?.35:b.q==='sag'?.04:.14)+(a>40?.35:a>25?.12:0);b.struct=clamp(b.struct-d,5,100);}}
const oldOnes=(w:World)=>w.buildings.filter(b=>b.state==='ayakta'&&b.city===w.city&&bAge(w,b)>=28&&!w.flags['dn'+b.id]);
const isFirst=(w:World,b:Building)=>w.buildings.length>0&&w.buildings[0].id===b.id;
function renewStage(w:World,b:Building){const ok=[6,10,12,16,22].filter(s=>s<=st(w));return ok.length?ok[ok.length-1]:Math.min(st(w),Math.max(2,b.stage));}
function mkDealFixed(owner:string,total:number,ask:number):Deal{return{ownerName:owner,trait:'',total,ask,min:ask,patience:9,floors:'adil',cash:0,line:'',rounds:0,ok:true,need:''};}
def({id:'donusum_talep',kind:'not',gap:48,c:(w)=>hasF(w)&&st(w)>=6&&oldOnes(w).length>0,mk:(w)=>({b:oldOnes(w).sort((a,b)=>a.year-b.year)[0].id}),
 title:(w,a)=>{const b=w.buildings.find(x=>x.id===a.b);return b?`${b.name}: sakinler kapıda`:'Sakinler kapıda';},
 text:(w,a)=>{const b=w.buildings.find(x=>x.id===a.b)!;const yr=bAge(w,b);const first=isFirst(w,b);return`${b.year} yılında ${b.owner} ailesinin diktiği ${b.name} ${yr} yaşında. ${b.struct<45?'Merdiven boşluğunda çatlaklar var, balkon demirleri pas kusuyor.':'Bina ayakta ama yönetmelik değişti, sigorta yenilemiyor.'} Yöneticisi elinde imzalarla geldi: "Siz yaptınız, siz yıkın, siz yeniden yapın." ${first?'Bu senin ailenin ilk binası. Temel atarken kurban kesilen, girişinde dedenin adının yazılı olduğu bina.':''}`;},
 o:(w,a)=>{const b=w.buildings.find(x=>x.id===a.b)!;const cost=Math.round(b.m2*M2_PRICE*.14);return[
  {t:'Dönüşümü üstlen',f:(w)=>{const s=renewStage(w,b);const S=STAGES[s];const tot=Math.max(2,S.flats+S.shops);const hood=pick(w,CITIES[w.city].hoods);const o:Offer={id:w.nid++,stage:s,name:b.name+' (yeni)',city:w.city,hood,locMul:1.08,expires:w.m+24,deal:mkDealFixed(b.name+' sakinleri',tot,Math.round(tot*.45)),imar:{floors:S.floors+1}};w.offers.push(o);b.state='donusum';w.flags['dn'+b.id]=1;if(isFirst(w,b))w.flags.ilkDon=o.name;rep(w,2);return'Sözleşme imzalandı. Sakinler yeni binada daire alacak, kalanını sen satacaksın. İş Arsa sekmesinde seni bekliyor.';}},
  {t:`Güçlendir (${money(cost)})`,off:w.cash<cost,f:(w)=>{cash(w,-cost);b.struct=clamp(b.struct+24,0,100);b.year+=12;w.flags['dn'+b.id]=1;rep(w,1);return'Kolonlar mantolandı, perde duvar eklendi. Bina on yıl daha nefes alacak.';}},
  {t:'Bizim işimiz değil',f:(w)=>{w.flags['dn'+b.id]=1;rep(w,-2);w.guilt+=1;return'Yönetici imzaları katlayıp cebine koydu. Başka müteahhide gidecek, adın o binayla birlikte anılmaya devam edecek.';}}];}});
def({id:'bina_catlak',kind:'kotu',gap:60,c:(w)=>w.buildings.some(b=>b.state==='ayakta'&&bAge(w,b)>18&&b.struct<42),mk:(w)=>({b:w.buildings.filter(b=>b.state==='ayakta'&&bAge(w,b)>18&&b.struct<42)[0].id}),
 title:(w,a)=>`${w.buildings.find(x=>x.id===a.b)?.name||'Eski bina'}: kolonda çatlak`,text:(w,a)=>{const b=w.buildings.find(x=>x.id===a.b)!;return`Bodrumdaki kolonun sıvası döküldü, demir görünüyor. Kat malikleri fotoğraf çekip gruba atmış. Bina ${bAge(w,b)} yaşında.`;},
 o:(w,a)=>{const b=w.buildings.find(x=>x.id===a.b)!;const c=Math.round(b.m2*M2_PRICE*.04);return[{t:`Ekip gönder, onar (${money(c)})`,off:w.cash<c,f:(w)=>{cash(w,-c);b.struct=clamp(b.struct+10,0,100);rep(w,1);return'Kolon sarıldı, sakinler çay ikram etti. Asıl çözüm dönüşüm, herkes biliyor.';}},{t:'Garanti süresi çoktan bitti',f:(w)=>{rep(w,-1);w.guilt+=2;return'Haklısın, kâğıt üstünde. Ama mahallede kâğıda bakan yok.';}}];}});

// ================= KUŞAK VASİYETLERİ =================
interface WillDef{t:string;d:string;ok:(w:World)=>boolean;act?:number;chk?:(w:World,v:NonNullable<World['will']>)=>boolean;mk?:(w:World)=>number;end?:boolean;}
export const WILLS:Record<string,WillDef>={
 okul:{t:'Dedenin köyüne okul yap',d:'Köyde çocuklar hâlâ üç kilometre yürüyerek okula gidiyor. Dede bunu her bayram anlatırdı.',ok:()=>true,act:.35},
 park:{t:'Mahalleye park ve çeşme bağışla',d:'Adını taşıyan binaların arasında çocukların oynayacağı bir yer olsun.',ok:()=>true,act:.18},
 vakif:{t:'Aile vakfı kur, burs ver',d:'Soyadın bir tabelada değil, okuyan çocukların diplomasında yaşasın.',ok:(w)=>st(w)>=10,act:.6},
 kule:{t:'Soyadını bir kuleye yaz',d:'"Şehrin siluetinde bizim de bir çizgimiz olsun" demişti.',ok:(w)=>st(w)>=14&&st(w)<28,chk:(w)=>!!w.firm&&(w.firm.done[23]>0||w.firm.done[28]>0||w.firm.done[LAST]>0)},
 yd:{t:'Yurt dışında bir iş bitir',d:'"Bizim beton başka ülkede de tutar" derdi.',ok:(w)=>st(w)>=18,chk:(w)=>!!w.firm&&[26,30,31,32].some(i=>w.firm!.done[i]>0)},
 asama:{t:'Şirketi büyüt',d:'Devraldığın yerde durma.',ok:(w)=>st(w)<LAST-2,mk:(w)=>Math.min(LAST,st(w)+4),chk:(w,v)=>st(w)>=(v.arg||0)},
 kazasiz:{t:'On yıl iş kazasız çalış',d:'Bir işçinin annesine bir daha haber götürülmesin.',ok:(w)=>hasF(w),mk:(w)=>w.stats.accidents,chk:(w,v)=>w.m-v.start>=120&&w.stats.accidents===(v.arg||0)},
 ilkbina:{t:'İlk binayı yeniden dik',d:'Ailenin ilk binası yaşlandı. Yıkıp yerine daha sağlamını yapmak sana düşüyor.',ok:(w)=>w.buildings.length>0&&bAge(w,w.buildings[0])>=15&&!w.flags.ilkDonOk,chk:(w)=>!!w.flags.ilkDonOk},
 borcsuz:{t:'Borçsuz bir şirket bırak',d:'"Bankaya değil, kendine çalış" derdi.',ok:(w)=>hasF(w),end:true,chk:(w)=>w.debt<=0&&w.cash>scale(w)*.5}};
export const willCost=(w:World,id:string)=>Math.round(scale(w)*(WILLS[id]?.act||0));
function assignWill(w:World){if(w.will&&w.will.gen===w.gen&&!w.will.done&&!w.will.fail)return;if(w.will&&w.will.gen===w.gen)return;
 const used=new Set((w.wills||[]).map(x=>x.id));const opts=Object.keys(WILLS).filter(k=>WILLS[k].ok(w)&&!used.has(k));const pool=opts.length?opts:Object.keys(WILLS).filter(k=>WILLS[k].ok(w));if(!pool.length)return;const id=pick(w,pool);
 w.will={id,gen:w.gen,start:w.m,dl:w.m+12*28,arg:WILLS[id].mk?.(w)};w.cards.push({id:'_vasiyet',a:{}});}
def({id:'_vasiyet',kind:'not',title:()=>'Vasiyet',text:(w)=>{const v=w.will!;const d=WILLS[v.id];return`${w.gen===1?'Annen gece yarısı aradı, babanın eski defterini bulmuş. İçinde tek satır':'Rahmetlinin çekmecesinden bir zarf çıktı. İçinde tek satır'}: "${d.t}." ${d.d}${v.arg!==undefined&&v.id==='asama'?` Hedef: ${STAGES[v.arg].n}.`:''} Önünde ${Math.round((v.dl-w.m)/12)} yıl var.`;},o:()=>[{t:'Söz veriyorum',f:(w)=>{for(const p of family(w))bond(w,p.id,3);return'Zarfı cüzdanına koydun. Ağırlığını her gün hissedeceksin.';}}]});
export function fulfillWill(w:World){const v=w.will;if(!v||v.done||v.fail)return'';const d=WILLS[v.id];if(!d.act)return'';const c=willCost(w,v.id);if(w.cash<c)return'Kasada yeterli para yok.';cash(w,-c);completeWill(w);return'ok';}
function completeWill(w:World){const v=w.will!;v.done=true;(w.wills||(w.wills=[])).push({id:v.id,gen:v.gen,ok:true});rep(w,5);hatir(w,5);w.guilt=Math.max(0,w.guilt-4);for(const p of family(w))bond(w,p.id,5);w.ach.vasiyet=w.ach.vasiyet||w.m;(w.flags.newAch||(w.flags.newAch=[])).push('vasiyet');
 log(w,`Vasiyet yerine geldi: ${WILLS[v.id].t}.`,'iyi');w.cards.push({id:'_vasiyetOk',a:{id:v.id}});}
def({id:'_vasiyetOk',kind:'iyi',title:()=>'Söz tutuldu',text:(w,a)=>({okul:'Köy okulunun açılışında çocuklar şiir okudu. Kapının üstündeki mermerde dedenin adı var.',park:'Parkın açılışında belediye başkanı konuştu, sen konuşmadın. Çeşmenin taşına sadece bir tarih yazdırdın.',vakif:'İlk bursiyerin mektubu geldi: inşaat mühendisliği okuyacakmış.',kule:'Kulenin tepesindeki harfler yandığında annen ağladı.',yd:'Yabancı bir ülkede, yabancı bir dille, senin betonun döküldü. Dede görseydi inanmazdı.',asama:'Şirket büyüdü. Eski ustalar "dedesine çekmiş" diyor.',kazasiz:'On yıl. Bir tane bile cenaze yok. Bunun için kimse plaket vermez ama ustalar bilir.',ilkbina:'Eski binanın temel taşı yeni binanın girişinde duruyor. Üstünde iki tarih var.',borcsuz:'Bankanın müdürü artık seni değil, sen onu bekletiyorsun.'} as Record<string,string>)[a.id]||'Söz tutuldu.',o:()=>[{t:'Gururla'}]});
function willMonth(w:World){if(!w.firm&&!w.will)return;if(w.firm&&(!w.will||w.will.gen!==w.gen))assignWill(w);const v=w.will;if(!v||v.done||v.fail)return;const d=WILLS[v.id];
 if(v.id==='ilkbina'&&w.flags.ilkDon&&w.buildings.some(b=>b.name===w.flags.ilkDon))w.flags.ilkDonOk=1;
 if(d.chk&&!d.end&&d.chk(w,v)){completeWill(w);return;}
 if(v.id==='kazasiz'&&w.stats.accidents>(v.arg||0)){v.start=w.m;v.arg=w.stats.accidents;}
 if(w.m>=v.dl){if(d.end&&d.chk&&d.chk(w,v)){completeWill(w);return;}v.fail=true;(w.wills||(w.wills=[])).push({id:v.id,gen:v.gen,ok:false});w.guilt+=3;log(w,`Vasiyet tutulamadı: ${d.t}.`,'kotu');}}
/** Kuşak değişince çağrılır: biten kuşağın vasiyeti değerlendirilir */
export function onSuccession(w:World){const v=w.will;if(v&&!v.done&&!v.fail){const d=WILLS[v.id];if(d.end&&d.chk&&d.chk(w,v)){v.done=true;(w.wills||(w.wills=[])).push({id:v.id,gen:v.gen,ok:true});rep(w,4);log(w,`Vasiyet yerine geldi: ${d.t}.`,'iyi');}else{v.fail=true;(w.wills||(w.wills=[])).push({id:v.id,gen:v.gen,ok:false});log(w,`${d.t}: söz bir sonraki kuşağa kaldı.`,'kotu');}}
 const okN=(w.wills||[]).filter(x=>x.ok&&x.gen===w.gen-1).length;if(okN){rep(w,3);w.cash+=scale(w)*.08;}w.flags.lastSucc=w.m;}

// ================= AİLE DRAMI =================
const sibs=(w:World)=>{const me=pl(w);return family(w).filter(p=>p.id!==me.id&&p.fa!==undefined&&p.fa===me.fa&&age(w,p)>=18);};
def({id:'miras_davasi',kind:'kotu',gap:200,c:(w)=>w.gen>=2&&hasF(w)&&w.m-(w.flags.lastSucc||-999)<30&&sibs(w).length>0,mk:(w)=>({p:pick(w,sibs(w)).id}),title:(w,a)=>`${w.people[a.p].name} mahkemeye gitti`,
 text:(w,a)=>`${w.people[a.p].name}, şirketteki payını istiyor. Avukatı "babasının emeği" diyor. Bayram sofrasında aynı masaya oturmayacaksınız gibi.`,
 o:(w,a)=>{const c=Math.round(Math.max(0,w.cash)*.15+scale(w)*.05);return[{t:`Payını öde (${money(c)})`,off:w.cash<c,f:(w)=>{cash(w,-c);bond(w,a.p,10);return'Parayı aldı. Barıştınız sayılmaz ama kavga da bitti.';}},
  {t:'Mahkemede görüşürüz',f:(w)=>{const law=(w.staff||[]).some(s=>s.role==='hukuk');if(chance(w,law?.65:.45)){bond(w,a.p,-30);return'Davayı kazandın. Kardeşin kazanmadı, aile hiç kazanmadı.';}cash(w,-Math.max(0,w.cash)*.25);bond(w,a.p,-20);return'Mahkeme payını hesapladı, faiziyle. Kasa ve aile ikiye bölündü.';}},
  {t:'Ona şirkette görev ver',f:(w)=>{const p=w.people[a.p];p.work+=12;bond(w,a.p,18);w.flags.kardesOrtak=a.p;w.sched.push({m:w.m+ri(w,48,96),id:'kardes_ortak2',a:{p:a.p}});return'Odası hazırlandı, kartvizitleri basıldı. Ortak masada iki imza var artık.';}}];}});
def({id:'kardes_ortak2',kind:'kotu',title:(w,a)=>`${w.people[a.p]?.name||'Kardeşin'} ayrılmak istiyor`,c:(w)=>!!w.flags.kardesOrtak&&hasF(w),text:(w,a)=>`Yıllardır aynı koridordasınız. "Benim de çocuklarım var" dedi, kendi firmasını kuracak. Ustaların yarısı onunla gitmeye hazır.`,
 o:(w,a)=>{const c=Math.round(scale(w)*.3);return[{t:`Payını satın al (${money(c)})`,off:w.cash<c,f:(w)=>{cash(w,-c);w.flags.kardesOrtak=0;bond(w,a.p,5);return'El sıkıştınız. Kapıdan çıkarken "abi" dedi, yıllardır demiyordu.';}},
  {t:'Gitsin, kendi işini kursun',f:(w)=>{w.flags.kardesOrtak=0;const p=w.people[a.p];const nm=(p?.sur||w.surname)+' Yapı';if(w.rivals.length<6)w.rivals.push({name:nm.split(' ')[0]+' '+(p?.name||''),stage:Math.max(1,st(w)-4),rel:30,head:p?.name||'',spec:'konut'});rep(w,-1);return`Yeni rakibin bir soyadı seninle aynı. Tabelası seninkinin iki sokak ötesinde.`;}}];}});
def({id:'damat',kind:'not',gap:150,c:(w)=>hasF(w)&&st(w)>=6&&kids(w).some(k=>k.sex==='k'&&k.sp!==undefined&&alive(w.people[k.sp])),mk:(w)=>{const k=kids(w).find(k=>k.sex==='k'&&k.sp!==undefined)!;return{k:k.id,d:k.sp};},
 title:(w,a)=>`Damadın ${w.people[a.d].name} iş istiyor`,text:(w,a)=>`${w.people[a.k].name} akşam yemeğinde lafı dolandırdı: kocası ${w.people[a.d].name} mühendis, ama işi yok. "Babam yanına alır" demiş.`,
 o:(w,a)=>[{t:'Şantiye müdürü yap',f:(w)=>{const d=w.people[a.d];w.firm!.engs.push({id:w.nid++,name:d.name+' (damat)',sk:ri(w,35,85),hon:ri(w,25,95),pid:-1});bond(w,a.k,12);return'Kızın sana sarıldı. Damadın kalitesini zaman gösterecek.';}},{t:'İş başka, aile başka',f:(w)=>{bond(w,a.k,-14);return'Kızın bir hafta aramadı. Damat başka bir firmada iş buldu, rakibinde.';}}]});
const grandkids=(w:World)=>{const me=pl(w);return Object.values(w.people).filter(p=>alive(p)&&age(w,p)>=17&&age(w,p)<=19&&p.edu<60&&[p.fa,p.mo].some(x=>x!==undefined&&[w.people[x]?.fa,w.people[x]?.mo].includes(me.id)));};
def({id:'torun_okul',kind:'not',gap:90,c:(w)=>grandkids(w).length>0,mk:(w)=>({p:grandkids(w)[0].id}),title:(w,a)=>`Torunun ${w.people[a.p].name} yurt dışında okumak istiyor`,
 text:(w,a)=>`${w.people[a.p].name} burs sınavını kazanmış, ama yurt ve yol masrafı sende. "Mimar olup döneceğim" diyor. Bu yaşta herkes dönecek diyor.`,
 o:(w,a)=>{const c=Math.round(scale(w)*.06);return[{t:`Gönder (${money(c)})`,off:w.cash<c,f:(w)=>{cash(w,-c);const p=w.people[a.p];p.edu+=40;p.dream=chance(w,.3)?'gurbet':'mimar';bond(w,a.p,15);return p.dream==='mimar'?'Havaalanında sarıldı. Mektupları çizimlerle dolu geliyor.':'Gitti. Telefonları seyreldi; orada kalacak gibi.';}},{t:'Burada da okunur',f:(w)=>{bond(w,a.p,-8);w.people[a.p].edu+=15;return'Buradaki üniversiteye yazıldı. Arada bir sitem ediyor.';}}];}});
def({id:'dede_akil',kind:'iyi',gap:36,c:(w)=>{const d=w.flags.danisman;return !!d&&!!w.people[d]&&alive(w.people[d])&&hasF(w);},title:(w)=>`${w.people[w.flags.danisman].name} dedenin akşam ziyareti`,
 text:(w)=>`${w.people[w.flags.danisman].name} artık şantiyeye gelmiyor ama her akşam telefon ediyor. Bu akşam bastonuyla ofise geldi, defterlere baktı.`,
 o:()=>[{t:'Fikrini sor',f:(w)=>{w.firm!.qual=clamp(w.firm!.qual+3,0,100);rep(w,1);return'"Betonu ucuzdan alma, demiri saydır" dedi. Ertesi gün iki tedarikçiyi değiştirdin.';}},{t:'Sadece çay iç',f:(w)=>{stress(w,-8);for(const p of family(w))bond(w,p.id,2);return'İş konuşmadınız. Eski şantiyeleri, ölen ustaları andınız.';}}]});

// ================= HOLDİNG VE ŞUBELER =================
export const subPrice=(k:string)=>Math.round(STAGES[SUBS[k].st].cost*SUBS[k].k*3);
export function buySub(w:World,k:string){const S=SUBS[k];if(!w.firm||!S||w.firm.stage<S.st||w.subs?.[k])return false;const p=subPrice(k);if(w.cash<p)return false;cash(w,-p);(w.subs||(w.subs={}))[k]={lv:1,since:w.m};log(w,`${S.n} kuruldu.`,'iyi');return true;}
export function sellSub(w:World,k:string){if(!w.subs?.[k])return false;w.cash+=subPrice(k)*.75;delete w.subs[k];return true;}
export function setMgr(w:World,k:string,id:number){const s=w.subs?.[k];if(!s)return;s.mgr=id>0?id:undefined;if(id>0)bond(w,id,4);}
export const holdValue=(w:World)=>Object.keys(w.subs||{}).reduce((s,k)=>s+subPrice(k)*.75,0)+(w.lands||[]).reduce((s,l)=>s+l.val,0);
function subsMonth(w:World){if(!w.subs)return;const ph=w.econ.phase;const pm=({kriz:.35,durgun:.75,canli:1,patlama:1.35} as Record<string,number>)[ph]||1;
 for(const k in w.subs){const s=w.subs[k];const m=s.mgr!==undefined?w.people[s.mgr]:undefined;const mm=m&&alive(m)?1+(m.tal-50)/150:.75;if(m&&!alive(m))s.mgr=undefined;w.cash+=subPrice(k)*SUBS[k].r/12*pm*mm*(k==='isletme'&&ph==='kriz'?.6:1);}}
def({id:'mudur_yolsuz',kind:'kotu',gap:70,c:(w)=>Object.values(w.subs||{}).some(s=>s.mgr===undefined),mk:(w)=>({k:pick(w,Object.keys(w.subs!).filter(k=>w.subs![k].mgr===undefined))}),title:(w,a)=>`${SUBS[a.k].n}: kasada açık`,
 text:(w,a)=>`Dışarıdan getirdiğin müdür üç aydır faturaları şişiriyormuş. ${SUBS[a.k].n} için muhasebe yeniden yapılıyor. "Başına aileden birini koysaydın" diyen çok.`,
 o:(w,a)=>[{t:'Kovup dava aç',f:(w)=>{cash(w,-subPrice(a.k)*.04);return'Dava sürecek. Kasadaki açık kapanmayacak.';}},{t:'Sessizce gönder',f:(w)=>{cash(w,-subPrice(a.k)*.06);rep(w,-1);return'Gitti. Yerine gelen ilk iş kasanın şifresini değiştirdi.';}}]});
export const branchCost=(w:World,c:string)=>Math.round(Math.max(40000,scale(w)*.06)*CITIES[c].mul);
export function openBranch(w:World,c:string){if(!w.firm||st(w)<8||!CITIES[c]||CITIES[c].yd||c===w.city||w.branches?.[c])return false;const p=branchCost(w,c);if(w.cash<p)return false;cash(w,-p);(w.branches||(w.branches={}))[c]={since:w.m};log(w,`${CITIES[c].n} şubesi açıldı.`,'iyi');return true;}
export function closeBranch(w:World,c:string){if(w.branches?.[c]){delete w.branches[c];return true;}return false;}
export const branchMonthly=(w:World)=>Object.keys(w.branches||{}).reduce((s,c)=>s+branchCost(w,c)*.012,0);
export const hasBranch=(w:World,c:string)=>!!w.branches?.[c];

// ================= ARSA BANKASI =================
export const landM2Price=(w:World,city:string,loc=1)=>M2_PRICE*priceMul(CITIES[city].mul)*landShare(CITIES[city].mul)*w.econ.land*loc*.55;
function newLand(w:World,city:string,village=false):Land{const big=Math.max(1,st(w));const m2=village?ri(w,3000,9000):ri(w,260,320+big*260);const hood=village?'Köy':pick(w,CITIES[city].hoods);const loc=.8+rnd(w)*.4;const share=!village&&chance(w,.22)?ri(w,3,9):0;let val=Math.round(m2*landM2Price(w,city,loc)*(village?.08:1));if(share)val=Math.round(val*.62);
 return{id:w.nid++,name:village?`${CITIES[city].n} köyünde dede tarlası`:`${hood} ${pick(w,['köşe parsel','ara parsel','yol üstü arsa','bahçeli arsa','eski bostan'])}`,city,hood,m2,paid:val,val,since:w.m,share,zone:village?0:1,village,tags:[]};}
export function landMarket(w:World){if(!w.firm)return;const cs=[w.city,w.city,...Object.keys(w.branches||{})];w.landMkt=Array.from({length:3},()=>newLand(w,pick(w,cs)));}
export function buyLand(w:World,id:number){const i=(w.landMkt||[]).findIndex(l=>l.id===id);if(i<0)return false;const l=w.landMkt![i];if(w.cash<l.val)return false;cash(w,-l.val);l.paid=l.val;l.since=w.m;(w.lands||(w.lands=[])).push(l);w.landMkt!.splice(i,1);log(w,`Arsa alındı: ${l.name}.`,'not');return true;}
export function sellLand(w:World,id:number){const i=(w.lands||[]).findIndex(l=>l.id===id);if(i<0)return false;const l=w.lands![i];w.cash+=l.val*.96;w.lands!.splice(i,1);log(w,`${l.name} satıldı: ${money(l.val*.96)}.`,l.val>l.paid?'iyi':'not');return true;}
export function resolveShare(w:World,id:number){const l=(w.lands||[]).find(x=>x.id===id);if(!l||!l.share)return'';const c=Math.round(l.val*.12);if(w.cash<c)return'Hissedarları ikna etmeye kasa yetmiyor.';cash(w,-c);if(chance(w,.5+w.hatir/200)){l.share=0;l.val=Math.round(l.val/.62);return'Son hissedar da imzaladı. Tapu tek isimde, arsa gerçek değerinde.';}l.share=Math.max(1,l.share-ri(w,1,3));return`İkna turu sürüyor: ${l.share} hissedar daha imza bekliyor.`;}
/** Arsada yapılabilecek en büyük satış işi (emsal: imar durumuna göre) */
export function landStage(w:World,l:Land){if(!w.firm)return-1;const cap=l.m2*(l.village?.35:1.1+l.zone*.7);let best=-1;for(let s=2;s<=w.firm.stage;s++){const S=STAGES[s];if(S.kind!=='sat'||S.yd)continue;if(S.m2<=cap*1.15)best=s;}return best;}
export function buildOnLand(w:World,id:number){const l=(w.lands||[]).find(x=>x.id===id);if(!l||l.share||l.zone<=0&&!l.village)return'';const s=landStage(w,l);if(s<0)return'Bu arsaya şirketin şu anki seviyesinde bina sığmıyor.';const S=STAGES[s];const tot=Math.max(2,S.flats+S.shops);
 const o:Offer={id:w.nid++,stage:s,name:l.village?'Köy evleri':l.hood+' '+pick(w,['Konutları','Apartmanı','Evleri']),city:l.city,hood:l.hood,locMul:1,expires:w.m+36,deal:mkDealFixed('Kendi arsan',tot,0),imar:{floors:S.floors+(l.zone>1?2:0)}};
 w.offers.push(o);w.lands=w.lands!.filter(x=>x!==l);return'ok';}
function landsYear(w:World){if(mon(w)!==0)return;for(const l of w.lands||[]){const g=({kriz:-.06,durgun:-.01,canli:.04,patlama:.09} as Record<string,number>)[w.econ.phase]||0;l.val=Math.round(l.val*(1+g+(rnd(w)-.4)*.06));}if(w.firm&&(!w.landMkt||w.landMkt.length<2||chance(w,.5)))landMarket(w);}
const myLand=(w:World,f:(l:Land)=>boolean)=>(w.lands||[]).filter(f);
def({id:'arsa_yol',kind:'iyi',gap:40,c:(w)=>myLand(w,l=>!l.tags.includes('yol')&&!l.village).length>0,mk:(w)=>({l:pick(w,myLand(w,l=>!l.tags.includes('yol')&&!l.village)).id}),title:()=>'Arsanın önünden yol geçiyor',
 text:(w,a)=>{const l=w.lands!.find(x=>x.id===a.l)!;return`Belediye imar planını askıya çıkardı: ${l.name} önünden 30 metrelik bulvar geçecek. Emlakçılar telefonla aramaya başladı.`;},o:(w,a)=>[{t:'Bekle, değeri artsın',f:(w)=>{const l=w.lands!.find(x=>x.id===a.l);if(l){l.val=Math.round(l.val*1.35);l.tags.push('yol');}return'Arsanın değeri bir gecede üçte bir arttı.';}}]});
def({id:'arsa_metro',kind:'iyi',gap:80,c:(w)=>myLand(w,l=>!l.tags.includes('metro')&&!l.village&&CITIES[l.city].mul>=1.2).length>0,mk:(w)=>({l:pick(w,myLand(w,l=>!l.tags.includes('metro')&&!l.village&&CITIES[l.city].mul>=1.2)).id}),title:()=>'Metro durağı geliyor',
 text:(w,a)=>`Yeni metro hattının güzergâhı açıklandı. Durak, ${w.lands!.find(x=>x.id===a.l)!.name} ile aynı köşede.`,o:(w,a)=>[{t:'Oh be',f:(w)=>{const l=w.lands!.find(x=>x.id===a.l);if(l){l.val=Math.round(l.val*1.6);l.tags.push('metro');}return'Arsa artık şehrin en çok sorulan köşesi.';}}]});
def({id:'arsa_imar',kind:'not',gap:50,c:(w)=>myLand(w,l=>l.zone===1&&!l.village&&!l.share).length>0,mk:(w)=>({l:pick(w,myLand(w,l=>l.zone===1&&!l.village&&!l.share)).id}),title:()=>'İmar değişikliği masada',
 text:(w,a)=>`Meclis üyesi bir tanıdık, ${w.lands!.find(x=>x.id===a.l)!.name} için kat artışının gündeme alınabileceğini söyledi. "Dosyayı ben takip ederim, sen de kampanyama destek olursun."`,
 o:(w,a)=>{const c=Math.round(w.lands!.find(x=>x.id===a.l)!.val*.1);return[{t:`Kampanyaya destek ver (${money(c)})`,off:w.cash<c,f:(w)=>{cash(w,-c);w.guilt+=2;const l=w.lands!.find(x=>x.id===a.l);if(l&&chance(w,.7)){l.zone=2;l.val=Math.round(l.val*1.7);return'Kat artışı geçti. Arsanın emsali neredeyse ikiye katlandı.';}return'Meclis toplandı, dosya gündemde yoktu. Destek iade edilmedi.';}},{t:'Kurallara göre giderim',f:(w)=>{rep(w,1);return'Tanıdık omuz silkti. Arsa olduğu gibi, vicdanın da.';}}];}});
def({id:'arsa_sit',kind:'kotu',gap:120,c:(w)=>myLand(w,l=>l.zone>0&&!l.village).length>0,mk:(w)=>({l:pick(w,myLand(w,l=>l.zone>0&&!l.village)).id}),title:()=>'Arsada tarihi kalıntı',
 text:(w,a)=>`Kepçe sondaj yaparken çanak çömlek çıktı. Müze ekibi ${w.lands!.find(x=>x.id===a.l)!.name} için kazı kararı verdi. Sit kararı çıkarsa arsa yapılaşmaya kapanır.`,
 o:(w,a)=>[{t:'Kazıya destek ol',f:(w)=>{const l=w.lands!.find(x=>x.id===a.l);if(l){if(chance(w,.5)){l.zone=0;l.val=Math.round(l.val*.45);rep(w,2);return'Sit kararı çıktı. Arsa kâğıt üstünde değerini yitirdi, gazete seni "duyarlı müteahhit" diye yazdı.';}}rep(w,1);return'Kazı bitti, alan kayıt altına alındı. Kenarında bir vitrin şartıyla izin çıktı.';}},
  {t:'Gece kepçeyi çalıştır',f:(w)=>{w.guilt+=6;if(chance(w,.4)){const l=w.lands!.find(x=>x.id===a.l);if(l){l.zone=0;l.val=Math.round(l.val*.3);}rep(w,-6);return'Bekçi gördü. Hem sit kararı hem suç duyurusu geldi.';}return'Sabah geriye düz bir zemin kaldı. Bunu kimseye anlatamayacaksın.';}}]});
def({id:'koye_yol',kind:'iyi',gap:200,c:(w)=>myLand(w,l=>!!l.village&&!l.tags.includes('yol')).length>0&&year(w)>1995,mk:(w)=>({l:myLand(w,l=>!!l.village)[0].id}),title:()=>'Köye asfalt geldi',
 text:()=>'Köy yolu asfaltlandı, şehirden yazlıkçılar gelmeye başladı. Dedenin tarlası artık "imara açılabilir" diye konuşuluyor.',o:(w,a)=>[{t:'Tarlaya bir bak',f:(w)=>{const l=w.lands!.find(x=>x.id===a.l);if(l){l.val=Math.round(l.val*3.2);l.tags.push('yol');}return'Tarlanın değeri üç katına çıktı. Annen "dede biliyordu" dedi.';}}]});
export function addVillageLand(w:World){(w.lands||(w.lands=[])).push(newLand(w,w.city,true));}

// ================= İSİMLİ KADRO =================
export const staffWage=(w:World,s:Staff)=>Math.round((1400+s.sk*28)*(1+st(w)*.07));
export function hireStaff(w:World,role:string){if(!w.firm||!ROLES[role]||st(w)<ROLES[role].st)return false;const sex=chance(w,.4)?'k':'e';const s:Staff={id:w.nid++,name:pick(w,sex==='e'?MNAMES:FNAMES)+' '+pick(w,['Bey','Hanım']).replace(sex==='e'?'Hanım':'Bey',sex==='e'?'Bey':'Hanım'),role:role as Staff['role'],sk:ri(w,35,80),loy:ri(w,45,75),by:w.m-12*ri(w,28,45),since:w.m};
 const fee=staffWage(w,s)*2;if(w.cash<fee)return false;cash(w,-fee);(w.staff||(w.staff=[])).push(s);return true;}
export function fireStaff(w:World,id:number){const i=(w.staff||[]).findIndex(s=>s.id===id);if(i<0)return;const s=w.staff![i];cash(w,-staffWage(w,s)*3);w.staff!.splice(i,1);}
export const staffMonthly=(w:World)=>(w.staff||[]).reduce((s,x)=>s+staffWage(w,x),0);
function staffMonth(w:World){for(const s of w.staff||[]){if(s.sk<95)s.sk+=.03;s.loy=clamp(s.loy-.05+(w.econ.phase==='kriz'?-.08:0),0,100);}}
def({id:'kadro_teklif',kind:'kotu',gap:50,c:(w)=>(w.staff||[]).some(s=>s.loy<45&&s.sk>55),mk:(w)=>({s:(w.staff||[]).filter(s=>s.loy<45&&s.sk>55)[0].id,r:(w.rivals.length?pick(w,w.rivals).name:w.rival.name)}),
 title:(w,a)=>`${w.staff!.find(s=>s.id===a.s)?.name||'Kadron'} gitmek istiyor`,text:(w,a)=>{const s=w.staff!.find(x=>x.id===a.s)!;return`${ROLES[s.role].n} ${s.name}, ${a.r} ailesinden teklif almış: maaşının bir buçuk katı ve araba. "Size çok şey borçluyum ama" diye başladı.`;},
 o:(w,a)=>{const s=w.staff!.find(x=>x.id===a.s)!;const r=staffWage(w,s)*6;return[{t:`Zam yap (${money(r)})`,off:w.cash<r,f:(w)=>{cash(w,-r);s.loy=clamp(s.loy+35,0,100);s.sk+=1;return'Kaldı. Ertesi sabah herkesten önce ofisteydi.';}},{t:'Yolun açık olsun',f:(w)=>{w.staff=w.staff!.filter(x=>x.id!==a.s);const rv=w.rivals.find(x=>x.name===a.r);if(rv)rv.stage=Math.min(LAST,rv.stage+1);return'Gitti. Rakibin ilk ihalesinde senin dosya düzenini gördün.';}}];}});
function staffAge(w:World){if(mon(w)!==3)return;for(const s of (w.staff||[]).slice()){const a=Math.floor((w.m-s.by)/12);if(a>=64&&chance(w,.35)){w.staff=w.staff!.filter(x=>x.id!==s.id);log(w,`${ROLES[s.role].n} ${s.name} emekli oldu. Veda yemeğinde ilk projesini anlattı.`,'not');}}}

// ================= YURT DIŞI VE MEGA İŞLER =================
const ydActive=(w:World)=>w.projects.filter(p=>p.status==='insa'&&STAGES[p.stage].yd);
def({id:'yd_siyasi',kind:'kotu',gap:40,c:(w)=>ydActive(w).length>0,mk:(w)=>({p:pick(w,ydActive(w)).id}),title:(w,a)=>`${CITIES[w.projects.find(p=>p.id===a.p)?.city||'baku'].n}: ortalık karıştı`,
 text:(w,a)=>{const p=w.projects.find(x=>x.id===a.p);return`${p?CITIES[p.city].n:'Şantiye'}'den gece yarısı telefon: hükümet değişti, yeni bakan eski sözleşmeleri incelemeye almış. Kampta 140 işçin var, pasaportları şantiye şefinde.`;},
 o:(w,a)=>{const p=w.projects.find(x=>x.id===a.p);return[{t:'Bekle, ekip kampta kalsın',f:(w)=>{if(p)p.seal+=ri(w,3,7);return'Aylar geçti. İşçiler kartla aradı, çocuklarının sesini dinledi. Sonunda yeni bakan sözleşmeyi onayladı.';}},
  {t:'Elçiliği ara',off:w.hatir<8,f:(w)=>{hatir(w,-8);if(p)p.seal+=1;return'Bir telefon, bir resepsiyon, bir tokalaşma. Şantiye bir ayda yeniden döndü.';}},
  {t:'Ekibi geri çek, sigortaya git',f:(w)=>{if(p){p.gross*=.82;p.seal+=2;}rep(w,-1);return'Sigorta zararın bir kısmını karşıladı. Geri dönen ekip iki ay sonra yine yola çıktı.';}}];}});
const megaActive=(w:World)=>w.projects.filter(p=>p.status==='insa'&&p.stage>=30&&STAGES[p.stage].kind==='ihale');
def({id:'hakedis_kavga',kind:'kotu',gap:30,c:(w)=>megaActive(w).length>0,mk:(w)=>({p:pick(w,megaActive(w)).id}),title:()=>'Hakediş masada kaldı',
 text:(w,a)=>`${w.projects.find(p=>p.id===a.p)?.name||'Büyük iş'} için onay bekleyen hakediş üç aydır imzada. İdare "keşif artışı" diyor, sen "iş değişti" diyorsun. Bankaya taahhütlerin işliyor.`,
 o:(w,a)=>{const p=w.projects.find(x=>x.id===a.p);const g=p?Math.round(p.gross*.04):0;return[{t:'Bekle, idareyi kızdırma',f:(w)=>{w.payables.push({m:w.m+ri(w,6,12),amt:-g*1.05,note:'Geciken hakediş'});cash(w,-g);return'Para geldi sayılmaz, gelecek sayılır. Kasadan eksildi, deftere yazıldı.';}},
  {t:'Tahkime git',f:(w)=>{const law=(w.staff||[]).some(s=>s.role==='hukuk');if(chance(w,law?.7:.5)){w.payables.push({m:w.m+ri(w,14,24),amt:-g*1.4,note:'Tahkim kararı'});return'Hakem heyeti haklı buldu. Para geç gelecek ama faiziyle.';}cash(w,-g*.5);rep(w,-1);return'Tahkimi kaybettin. Bir sonraki ihalede idare seni hatırlayacak.';}}];}});
def({id:'kons_ortak',kind:'kotu',gap:50,c:(w)=>w.projects.some(p=>p.status==='insa'&&(p.cons||0)>0),mk:(w)=>({p:pick(w,w.projects.filter(p=>p.status==='insa'&&(p.cons||0)>0)).id,r:(w.rivals.length?pick(w,w.rivals).name:w.rival.name)}),title:()=>'Konsorsiyum ortağı çekiliyor',
 text:(w,a)=>`${a.r} ailesi konsorsiyumdan çıkmak istiyor; bankaları kredi limitini kesmiş. Payını sana devretmeyi teklif ediyorlar.`,
 o:(w,a)=>{const p=w.projects.find(x=>x.id===a.p);const c=p?Math.round(p.cost*(p.cons||0)/(1-(p.cons||0))*.55):0;return[{t:`Payını devral (${money(c)})`,off:!p||w.cash<c,f:(w)=>{if(p){cash(w,-c);const k=1/(1-(p.cons||0));p.gross*=k;p.cost*=k;p.cons=0;}return'Artık iş tamamen senin: kârı da, riski de.';}},{t:'Yeni ortak bul',f:(w)=>{if(p)p.seal+=ri(w,2,4);rep(w,-1);return'Yeni ortak masaya oturana kadar şantiye ağır çekimde döndü.';}}];}});

// ================= UZUN HİKÂYE ZİNCİRLERİ =================
const later=(w:World,id:string,a:number,b:number,arg:any={})=>w.sched.push({m:w.m+ri(w,a,b),id,a:arg});
const law=(w:World)=>(w.staff||[]).some(s=>s.role==='hukuk');
// 1. Balkon davası (yıllar sürer)
def({id:'ch_dava1',kind:'kotu',gap:9999,c:(w)=>hasF(w)&&w.buildings.filter(b=>b.state==='ayakta').length>=4&&!w.flags.chDava,mk:(w)=>({b:pick(w,w.buildings.filter(b=>b.state==='ayakta')).id}),title:()=>'Balkon çöktü',
 text:(w,a)=>`${w.buildings.find(b=>b.id===a.b)?.name||'Eski binan'}da bir balkon gece çöktü. Şükür, altında kimse yoktu. Ertesi gün kapında bir avukat: kat malikleri adına tazminat davası.`,
 o:(w,a)=>[{t:'Uzlaş, masrafları öde',f:(w)=>{w.flags.chDava=1;cash(w,-scale(w)*.04);rep(w,1);return'Balkonlar yenilendi, dava açılmadı. Ama hikâye mahallede kaldı.';}},
  {t:'Mahkemede savun',f:(w)=>{w.flags.chDava=2;cash(w,-scale(w)*.01);later(w,'ch_dava2',18,30,a);return'Dava açıldı. Avukatın "uzun sürer" dedi. Ne kadar uzun, söylemedi.';}}]});
def({id:'ch_dava2',kind:'not',title:()=>'Bilirkişi raporu',text:(w,a)=>{const b=w.buildings.find(x=>x.id===a.b);return`Bilirkişi binaya geldi, karot aldı. Rapor ${b&&b.struct>55?'lehine: "Beton projeye uygun, balkon bakımsızlıktan çökmüş."':'aleyhine: "Demir eksik, beton zayıf."'} Karşı taraf itiraz edecek.`;},
 o:(w,a)=>[{t:'İkinci bilirkişi iste',f:(w)=>{cash(w,-scale(w)*.01);w.flags.chDavaIt=1;later(w,'ch_dava3',20,34,a);return'Dosya bir yıl daha bekleyecek. Sen de.';}},{t:'Karar duruşmasını bekle',f:(w)=>{later(w,'ch_dava3',8,16,a);return'Takvim belli oldu. Duruşma sabahı için bir ceket ayırdın.';}}]});
def({id:'ch_dava3',kind:'not',title:()=>'Balkon davası: karar',text:()=>'Yıllar süren davanın karar duruşması. Salon kalabalık: kat malikleri, gazeteci, iki eski ustan.',
 o:(w,a)=>[{t:'Kararı dinle',f:(w)=>{const b=w.buildings.find(x=>x.id===a.b);const p=(b?b.struct/100:.5)+(law(w)?.18:0)+(w.flags.chDavaIt?.08:0)-.15;if(chance(w,clamp(p,.15,.85))){rep(w,3);return'Beraat. Kat malikleri koridorda seninle tokalaşmadı ama başlarını da çevirmediler.';}cash(w,-scale(w)*.12);rep(w,-4);w.guilt+=2;return'Tazminat faiziyle birlikte. Gazete manşeti üç gün sürdü, utancı daha uzun.';}}]});
// 2. Gazetecinin dosyası
def({id:'ch_gaz1',kind:'kotu',gap:9999,c:(w)=>hasF(w)&&st(w)>=8&&(w.guilt>8||w.buildings.some(b=>b.q==='kis'))&&!w.flags.chGaz,title:()=>'Genç bir gazeteci',
 text:()=>'Kendini serbest gazeteci diye tanıtan genç bir kadın aradı. Eski ruhsatlarını, kat karşılığı sözleşmelerini soruyor. "Bir kitap yazıyorum" dedi.',
 o:()=>[{t:'Ofise davet et, açık konuş',f:(w)=>{w.flags.chGaz=1;later(w,'ch_gaz2',30,54,{open:1});return'Üç saat konuştunuz. Not defteri doldu, çayı soğudu.';}},{t:'Avukatım arar',f:(w)=>{w.flags.chGaz=2;later(w,'ch_gaz2',24,48,{open:0});return'Telefonu kapattı. Sonra bir mesaj: "Siz bilirsiniz."';}},{t:'Patronunu ara, sustur',f:(w)=>{w.flags.chGaz=3;w.guilt+=4;hatir(w,-4);later(w,'ch_gaz2',36,60,{open:-1});return'Bir telefonla dosya rafa kalktı. Raf her zaman raf olarak kalmaz.';}}]});
def({id:'ch_gaz2',kind:'not',title:()=>'Kitap çıktı',text:(w,a)=>a.open>0?'"Betonun Hafızası" adlı kitap çıktı. Senin bölümün dürüst: hataların da var, sağlam binaların da.':a.open===0?'Kitap çıktı. Senin bölümün kısa ve soğuk: "Firma görüşme talebimizi reddetti."':'Kitap yurt dışında basıldı. Senin bölümünün başlığı: "Susturulan dosya".',
 o:(w,a)=>[{t:'Oku',f:(w)=>{if(a.open>0){rep(w,4);w.guilt=Math.max(0,w.guilt-5);}else if(a.open===0)rep(w,-2);else{rep(w,-7);w.guilt+=3;}later(w,'ch_gaz3',90,140,a);return a.open>0?'İnsanlar seni sokakta tanıyıp "kitapta okudum" diyor. İyi anlamda.':'Kitap ikinci baskıya geçti. Her baskıda biraz daha konuşuluyor.';}}]});
def({id:'ch_gaz3',kind:'not',title:()=>'Belgesel ekibi',text:(w,a)=>`Yıllar sonra aynı gazeteci bu kez bir belgesel çekiyor. Torunların yaşındaki kameraman şirketin ilk binasının önünde duruyor. ${a.open>0?'"Size teşekkür etmek istiyorum" dedi.':'"Bu kez konuşacak mısınız?" dedi.'}`,
 o:(w,a)=>[{t:'Kameraya konuş',f:(w)=>{rep(w,a.open>0?3:1);w.guilt=Math.max(0,w.guilt-3);return'Belgesel yayınlandı. Son sahnede dedenin malası var.';}},{t:'Hayır',f:(w)=>{rep(w,-1);return'Belgeselin sonunda boş bir sandalye gösterildi.';}}]});
// 3. Yirmi yıllık husumet
def({id:'ch_hus1',kind:'kotu',gap:9999,c:(w)=>hasF(w)&&st(w)>=4&&!w.flags.chHus,title:(w)=>`${w.rival.name} düğünde`,
 text:(w)=>`Bir tanıdığın düğününde ${w.rival.name} ailesinin büyüğü ${w.rival.head}, masanın öbür ucundan herkesin duyacağı sesle "Kat karşılığı ev yapan da müteahhit oldu" dedi.`,
 o:()=>[{t:'Duymazdan gel',f:(w)=>{w.flags.chHus=1;later(w,'ch_hus2',48,80,{t:0});return'Halay başladı, laf müziğin altında kaldı. Senin içinde kalmadı.';}},{t:'Aynı sertlikle cevap ver',f:(w)=>{w.flags.chHus=2;w.rival.rel-=15;later(w,'ch_hus2',36,60,{t:1});return'Masada buz gibi bir sessizlik. Düğün sahibi bir daha ikinizi aynı güne çağırmayacak.';}},{t:'Yanına git, elini sık',f:(w)=>{w.flags.chHus=3;w.rival.rel+=10;later(w,'ch_hus2',60,96,{t:-1});return'Elini sıktı ama bırakmadı: "Bakalım" dedi.';}}]});
def({id:'ch_hus2',kind:'kotu',title:(w)=>`${w.rival.name} ihaleyi bozdu`,text:(w,a)=>`Yıllar geçti ama ${w.rival.name} unutmadı. ${a.t>0?'Büyük bir ihalede şikâyet dilekçesi verdi, iş altı ay askıya alındı.':'Ustalarının ikisini yüksek maaşla kendine çekti.'} Arkasından gülen çok.`,
 o:(w,a)=>[{t:'Ben de onun ihalesine itiraz ederim',f:(w)=>{w.rival.rel-=15;w.guilt+=1;w.flags.chHusSert=1;later(w,'ch_hus3',60,96,a);return'Savaş açıldı. Her ihalede iki dosya: biri iş için, biri onun için.';}},{t:'İşime bakarım',f:(w)=>{rep(w,1);later(w,'ch_hus3',60,110,a);return'Zarar ettin, ama yüzünü buruşturmadın. Bunu gören biri oldu.';}}]});
def({id:'ch_hus3',kind:'not',title:(w)=>`${w.rival.name} ailesi zor durumda`,text:(w)=>`${w.rival.name} ailesinin şirketi krizde bankaya battı. ${w.rival.head}'in oğlu sana geldi: "Babam bilmiyor buraya geldiğimi. Yarım kalan sitemizi siz bitirir misiniz? Yoksa yüz aile evsiz kalacak."`,
 o:(w)=>[{t:'Siteyi bitir, borcunu sonra konuşuruz',f:(w)=>{cash(w,-scale(w)*.1);rep(w,5);hatir(w,10);w.rival.rel=80;w.flags.chHusSon='baris';return'Yıllar sonra bir bayram sabahı kapın çaldı: elinde baklava, yüzünde utanç. Yirmi yıllık kavga bir kahveyle bitti.';}},
  {t:'Siteyi ucuza satın al',f:(w)=>{w.flags.devralinan={st:Math.min(st(w),Math.max(2,w.rival.stage)),n:w.rival.name};w.rival.rel=-60;w.guilt+=3;w.flags.chHusSon='zafer';later(w,'ch_hus4',100,160,{});return'Tapu senin. Oğlunun gözlerindeki bakışı yıllarca unutamayacaksın.';}}]});
def({id:'ch_hus4',kind:'kotu',title:()=>'Eski hesap',text:(w)=>`Rakip ailenin torunu kendi firmasını kurmuş: ${w.rival.name} Yapı Yeni Nesil. İlk röportajında senin soyadını andı: "Bizim evimizi onlar aldı."`,
 o:()=>[{t:'Bir buluşma teklif et',f:(w)=>{w.guilt=Math.max(0,w.guilt-2);rep(w,1);return'Buluşmaya geldi. Uzlaşma değil ama bir ateşkes oldu.';}},{t:'Rekabet budur',f:(w)=>{w.rival.stage=Math.min(LAST,w.rival.stage+2);return'Yeni nesil hırslı. Masadaki her işte karşına çıkacak.';}}]});

// ================= AYLIK ÇAĞRI =================
export function v4Month(w:World){yearReport(w);agingYear(w);landsYear(w);subsMonth(w);staffMonth(w);staffAge(w);willMonth(w);}
export const v4Monthly=(w:World)=>{const L:{n:string;v:number}[]=[];const s=staffMonthly(w);if(s)L.push({n:`Kadro (${(w.staff||[]).length})`,v:s});const b=branchMonthly(w);if(b)L.push({n:`Şubeler (${Object.keys(w.branches||{}).length})`,v:b});return L;};
export {DIFF,dif,SUBS,ROLES};
void TR_KEYS;void kids;void spouse;void ek;void (null as unknown as Person);
