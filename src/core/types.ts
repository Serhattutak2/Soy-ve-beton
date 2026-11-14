export type Sex='e'|'k';
export interface Person{id:number;name:string;sur:string;sex:Sex;by:number;dm?:number;cause?:string;fa?:number;mo?:number;sp?:number;kids:number[];
  dream:string;tal:number;trait:string;bond:number;edu:number;work:number;kus?:boolean;gen:number;job?:string;}
export interface Defect{trade:string;sev:number;txt:string;found:boolean;}
export interface Unit{k:number;l:string;t:string;m2:number;fl:number;fr:string;n:number;sold:number;own:boolean;pr:number;buyer?:string;rent?:boolean;}
export interface PItem{id:string;prog:number;tas:boolean;q:'kis'|'nor'|'sag';paid:boolean;tq:number;mg?:number;fin?:boolean;}
export interface Project{id:number;stage:number;name:string;city:string;hood:string;locMul:number;m2:number;q:'kis'|'nor'|'sag';prog:number;months:number;gross:number;cost:number;estRev:number;
  sold:number;seal:number;defects:Defect[];struct:number;status:'insa'|'satis';halt:boolean;reason:string;floors:number;slot:number;partner?:boolean;bribe?:boolean;
  sellOn:boolean;lux:number;items:PItem[];cur:number;tw:number;done:number;units:Unit[];ownerN:number;bought:Record<string,number>;cheap:number;skipEtut:boolean;spent:number;income:number;eng:number;flats:number;shops:number;mix:number;park:boolean;illegal:number;look:Look;merged?:boolean;auto?:boolean;cons?:number;fx0?:number;}
export interface Look{col:number;roof:number;bal:number;cumba:boolean;}
export interface Design{floors:number;mix:number;park:boolean;illegal:number;look:Look;}
export interface Deal{kind?:string;ownerName:string;trait:string;total:number;ask:number;min:number;patience:number;floors:'adil'|'iyi'|'kotu';cash:number;line:string;rounds:number;ok:boolean;lastYou?:string;need:string;}
export interface Offer{id:number;stage:number;name:string;city:string;hood:string;locMul:number;expires:number;deal?:Deal;won?:number;bidDone?:boolean;imar?:{floors:number};merged?:boolean;mergeCost?:number;cons?:number;}
export interface Crew{n:number;sk:number;usta:string;}
export interface Engineer{id:number;name:string;sk:number;hon:number;pid:number;}
export interface Master{id:number;name:string;tr:string;by:number;sk:number;loy:number;since:number;app?:string;appSk?:number;}
export interface Rival{name:string;stage:number;rel:number;head:string;spec:string;}
export interface Rental{name:string;city:string;val:number;n:number;}
export interface Payable{m:number;amt:number;note:string;}
export interface Building{id:number;name:string;stage:number;struct:number;year:number;floors:number;slot:number;residents:string[];look?:Look;shops?:number;state:'ayakta'|'hasar'|'yikik'|'donusum';q:string;gen:number;owner:string;kin?:number;city:string;m2:number;}
export interface Firm{name:string;stage:number;done:number[];cert:number;exp:number;rep:number;crews:Record<string,Crew>;engs:Engineer[];qual:number;open:number;path:string;masters:Master[];equip:Record<string,number>;}
export interface Card{id:string;a:Record<string,any>;}
export interface World{v:number;seed:number;rng:number;m:number;scen:string;city:string;surname:string;
  playerId:number;heirId:number;founderId:number;gen:number;people:Record<number,Person>;nid:number;
  cash:number;debt:number;rank:number;xp:number;trade:string;skills:Record<string,number>;evening:string;employer:string;unemployed:number;
  firm:Firm|null;projects:Project[];offers:Offer[];buildings:Building[];
  home:number;car:number;inv:Record<string,number>;biz:Record<string,boolean>;
  health:number;stress:number;guilt:number;hatir:number;jail:number;
  econ:{phase:string;left:number;demand:number;mat:number;rate:number;fx:number;gold:number;stock:number;land:number;news:string};
  crises:number[];quakes:{y:number;sev:number}[];
  cards:Card[];sched:{m:number;id:string;a:any}[];seen:Record<string,number>;flags:Record<string,any>;arcs:string[];
  cool:number;comfort:number;stock:Record<string,number>;payables:Payable[];selfWork:string;log:{m:number;t:string;k?:string}[];
  rival:{name:string;stage:number;rel:number;head:string;gen:number};rivals:Rival[];rentals:Rental[];ach:Record<string,number>;furn:Record<string,number>;council:number;
  result:string|null;over:null|{why:string};peakStage:number;stats:{collapse:number;saved:number;accidents:number;bankrupt:number;jail:number;projects:number;dead:number};
  quakeNow?:number;walk?:boolean;legacy?:string|null;
  subs?:Record<string,{lv:number;mgr?:number;since:number}>;branches?:Record<string,{mgr?:number;since:number}>;lands?:Land[];landMkt?:Land[];will?:Will;wills?:{id:string;gen:number;ok:boolean}[];staff?:Staff[];diff?:number;report?:YearReport;yr?:{nw:number;proj:number;bld:number;m:number};}
export interface Land{id:number;name:string;city:string;hood:string;m2:number;paid:number;val:number;since:number;share?:number;zone:number;village?:boolean;tags:string[];}
export interface Will{id:string;gen:number;start:number;dl:number;arg?:number;done?:boolean;fail?:boolean;}
export interface Staff{id:number;name:string;role:'mimar'|'statik'|'muhasebe'|'hukuk';sk:number;loy:number;by:number;since:number;}
export interface YearReport{y:number;nw:number;dnw:number;proj:number;bld:number;news:string[];fam:string[];seen?:boolean;}
