// Denetim: botla çok oyun oynatır; NaN, hatalı metin, istisna, aşırı tekrar eden olay ve mantıksız değerleri toplar.
import {newWorld,advance,botTurn} from '../src/core/sim';import {EV} from '../src/core/events';import {year} from '../src/core/util';import {SCENS,TR_KEYS} from '../src/core/data';
const N=+(process.argv[2]||24);const Y=+(process.argv[3]||120);
const bad:Record<string,{n:number;ex:string}>={};const note=(k:string,ex:string)=>{const b=bad[k]||(bad[k]={n:0,ex});b.n++;};
const BADRE0=/undefined|NaN|\bnull\b|\[object|Infinity|\$\{/;
const V='aeıioöuü',BK='aıou';const lastV=(x:string)=>{for(let i=x.length-1;i>=0;i--)if(V.includes(x[i]))return x[i];return 'e';};
const acc:Record<string,string>={a:'ı',ı:'ı',o:'u',u:'u',e:'i',i:'i',ö:'ü',ü:'ü'};const HARD='çfhkpsştÇFHKPSŞT';
function sufBad(s:string){const re=/([A-Za-zÇĞİÖŞÜçğıöşü]+)'([a-zçğıöşü]+)/g;let m;while((m=re.exec(s))){const wd=m[1].toLocaleLowerCase('tr'),sf=m[2];const lv=lastV(wd),ev=V.includes(wd[wd.length-1]);const back=BK.includes(lv);
 const dat=(ev?'y':'')+(back?'a':'e'),ac=(ev?'y':'')+acc[lv],gen=(ev?'n':'')+acc[lv]+'n',loc=(HARD.includes(wd[wd.length-1])?'t':'d')+(back?'a':'e');
 if(/^(cemal|kemal|celal|hilal|kemal|iqbal|resul)$/.test(wd))continue;const fam=(x:string)=>/^y?[aeıiuü]$/.test(x)?'d|a':/^n?[ıiuü]n$/.test(x)?'g':/^[dt][ae]$/.test(x)?'l':/^[dt][ae]n$/.test(x)?'ab':'';
 const f=fam(sf);if(f==='d|a'){if(sf!==dat&&sf!==ac)return m[0];}else if(f==='g'){if(sf!==gen)return m[0];}else if(f==='l'){if(sf!==loc)return m[0];}else if(f==='ab'){if(sf!==loc+'n')return m[0];}}return '';}
const BADRE={test:(s:string)=>BADRE0.test(s)||!!sufBad(s)};
let cur='';
for(const id in EV){const e=EV[id];const o0=e.o,t0=e.title,x0=e.text;
 e.title=(w,a)=>{const s=t0(w,a);if(BADRE.test(s))note('baslik:'+id,s);return s;};
 e.text=(w,a)=>{const s=x0(w,a);if(BADRE.test(s))note('metin:'+id,s.slice(0,160));return s;};
 e.o=(w,a)=>o0(w,a).map(op=>{if(BADRE.test(op.t))note('secenek:'+id,op.t);const f=op.f;return{...op,f:f?(ww:any,aa:any)=>{cur=id;let r;try{r=f(ww,aa);}catch(err:any){note('HATA:'+id,String(err?.stack||err).slice(0,300));}if(typeof r==='string'&&BADRE.test(r))note('sonuc:'+id,r.slice(0,160));return r;}:f};});}
function scanNum(o:any,path:string,depth=0){if(depth>6||!o||typeof o!=='object')return;for(const k in o){const v=o[k];if(typeof v==='number'&&!isFinite(v))note('NaN:'+path+'.'+k,String(v));else if(v&&typeof v==='object')scanNum(v,path+'.'+(Array.isArray(o)?'[]':k),depth+1);}}
const scens=Object.keys(SCENS);const rows:any[]=[];const evc:Record<string,number>={};
for(let s=0;s<N;s++){const w=newWorld({seed:5000+s*13,scen:scens[s%scens.length],city:TR_KEYS[s%TR_KEYS.length],diff:s%3});const y0=year(w);let maxC=0,minC=0,logN=0,cardN=0;const seenLog=new Set<string>();
 try{while(year(w)-y0<Y&&!w.over){for(const c of w.cards){evc[c.id]=(evc[c.id]||0)+1;cardN++;try{EV[c.id].title(w,c.a);EV[c.id].text(w,c.a);}catch(err:any){note('HATA-metin:'+c.id,String(err).slice(0,200));}}
  botTurn(w);advance(w);
  for(const l of w.log){if(l.m!==w.m&&l.m!==w.m-1)break;const k=l.m+'|'+l.t;if(seenLog.has(k))continue;seenLog.add(k);logN++;if(BADRE.test(l.t))note('log',l.t.slice(0,160));}
  if(w.m%12===0)scanNum(w,'w');maxC=Math.max(maxC,w.cash);minC=Math.min(minC,w.cash);
  if(w.cash<-1)note('negatif-nakit',w.scen+' '+w.cash);if(w.debt<-1)note('negatif-borc',''+w.debt);
  for(const p of w.projects){const P:any=p;if(P._s===undefined)P._s=w.m;if(p.status==='insa'&&w.m-P._s>12*6&&!P._n){P._n=1;note('uzun-santiye',p.stage+' '+p.name+' '+p.m2+'m2');}}
  if(w.health<0||w.stress>100||w.stress<0)note('sinir',`h${w.health} s${w.stress}`);}}
 catch(err:any){note('HATA-dongu',String(err?.stack||err).slice(0,400));}
 rows.push({s,scen:w.scen,city:w.city,d:s%3,yil:year(w)-y0,son:(w.over?.why||'').slice(0,14),kusak:w.gen,tepe:w.peakStage,kart:cardN,iflas:w.stats.bankrupt,cokme:w.stats.collapse,hapis:w.stats.jail,maxNakit:(maxC/1e6).toFixed(0)+'M'});}
console.table(rows);
const top=Object.entries(evc).sort((a,b)=>b[1]-a[1]).slice(0,15);console.log('en sık olaylar',top);
const never=Object.keys(EV).filter(k=>!evc[k]);console.log('hiç çıkmayan olay sayısı',never.length,'/',Object.keys(EV).length,never.slice(0,80).join(' '));
console.log(JSON.stringify(bad,null,1));
