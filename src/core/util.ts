import type {World,Person} from './types';
import {STAGES,WAGE,MNAMES,FNAMES} from './data';
export function rnd(w:World){let t=(w.rng+=0x6D2B79F5)|0;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);w.rng|=0;return((t^(t>>>14))>>>0)/4294967296;}
export const ri=(w:World,a:number,b:number)=>a+Math.floor(rnd(w)*(b-a+1));
export const pick=<T,>(w:World,l:T[])=>l[Math.floor(rnd(w)*l.length)];
export const chance=(w:World,p:number)=>rnd(w)<p;
export const clamp=(x:number,a:number,b:number)=>Math.max(a,Math.min(b,x));
export const year=(w:World)=>Math.floor(w.m/12);
export const mon=(w:World)=>w.m%12;
export const MONTHS=['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
export const pl=(w:World)=>w.people[w.playerId];
export const age=(w:World,p:Person)=>Math.floor(((p.dm??w.m)-p.by)/12);
export const alive=(p?:Person)=>!!p&&p.dm===undefined;
export const full=(p:Person)=>p.name+' '+p.sur;
export function money(n:number){const s=n<0?'−':'';n=Math.abs(n);
 if(n>=1e9)return s+(n/1e9).toFixed(n>=1e10?1:2).replace('.',',')+' Milyar ₺';
 if(n>=1e6)return s+(n/1e6).toFixed(n>=1e8?0:1).replace('.',',')+' Milyon ₺';
 return s+Math.round(n).toLocaleString('tr-TR')+' ₺';}
export function log(w:World,t:string,k?:string){w.log.unshift({m:w.m,t,k});if(w.log.length>400)w.log.length=400;}
/** olayların para büyüklüğü oyuncunun çapına göre ölçeklenir */
export function base(w:World){if(w.firm){const s=Math.min(w.firm.stage,STAGES.length-1);return Math.max(1200,STAGES[s].cost*.03);}return WAGE[w.rank]*2.5;}
export const nice=(n:number)=>{const p=Math.pow(10,Math.max(0,Math.floor(Math.log10(Math.max(1,Math.abs(n))))-1));return Math.round(n/p)*p;};
export const sc=(w:World,f:number)=>nice(base(w)*f);
export function cash(w:World,n:number){w.cash+=n;}
export function rep(w:World,n:number){if(w.firm)w.firm.rep=clamp(w.firm.rep+n,0,100);}
export function hurt(w:World,n:number){w.health=clamp(w.health-n,1,100);}
export function stress(w:World,n:number){w.stress=clamp(w.stress+n,0,100);}
export function hatir(w:World,n:number){w.hatir=clamp(w.hatir+n,-30,60);}
export function bond(w:World,id:number|undefined,n:number){if(id===undefined)return;const p=w.people[id];if(p){p.bond=clamp(p.bond+n,0,100);if(p.bond<15)p.kus=true;if(p.bond>35)p.kus=false;}}
export function family(w:World,withSelf=false){return Object.values(w.people).filter(p=>alive(p)&&(withSelf||p.id!==w.playerId));}
export function kids(w:World,p=pl(w)){return p.kids.map(i=>w.people[i]).filter(alive);}
export function spouse(w:World){const s=pl(w).sp;return s!==undefined&&alive(w.people[s])?w.people[s]:undefined;}
export function addPerson(w:World,o:Partial<Person>&{sex:'e'|'k';by:number;sur:string}):Person{
 const id=w.nid++;const tr=['hirsli','durust','savurgan','sakin','kurnaz'];
 const p:Person={id,name:o.name??pick(w,o.sex==='e'?MNAMES:FNAMES),sur:o.sur,sex:o.sex,by:o.by,fa:o.fa,mo:o.mo,sp:o.sp,kids:[],dream:o.dream??pick(w,['insaat','insaat','doktor','ogretmen','muzik','mimar','avukat','gurbet']),tal:o.tal??ri(w,25,85),trait:o.trait??pick(w,tr),bond:o.bond??ri(w,45,75),edu:o.edu??0,work:o.work??0,gen:o.gen??w.gen};
 w.people[id]=p;return p;}
export function heirCandidates(w:World){const me=w.playerId;return family(w).filter(p=>{if(age(w,p)<14)return false;if(p.sp===me)return true;let c:number|undefined=p.fa??p.mo;
  /* soydan gelen herkes: kendi kanımız ya da eş olarak devralan */return blood(w,p)||p.sp===me;});}
export function blood(w:World,p:Person){return p.fa!==undefined||p.mo!==undefined||p.id===w.founderId||!!w.flags['kan'+p.id];}
export function title(w:World){const f=w.firm;if(!f)return['Amele','Kalfa','Usta','Ustabaşı'][w.rank];const s=f.stage;
 if(s<2)return'Taşeron';if(s<6)return'Mahalle müteahhidi';if(s<12)return'İlçe müteahhidi';if(s<19)return'Şehrin müteahhidi';if(s<25)return'Büyük müteahhit';if(s<29)return'Holding patronu';return'Şehrin kurucusu';}
export function netWorth(w:World){let t=w.cash-w.debt;for(const k in w.inv)t+=w.inv[k];return t;}
