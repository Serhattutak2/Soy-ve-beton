export type Sex='e'|'k';
export interface Person{id:number;name:string;sur:string;sex:Sex;by:number;dm?:number;cause?:string;fa?:number;mo?:number;sp?:number;kids:number[];
  dream:string;tal:number;trait:string;bond:number;edu:number;work:number;kus?:boolean;gen:number;}
export interface Defect{trade:string;sev:number;txt:string;found:boolean;}
export interface Project{id:number;stage:number;name:string;loc:string;q:'kis'|'nor'|'sag';prog:number;months:number;cost:number;gross:number;share:number;
  sold:number;seal:number;defects:Defect[];struct:number;status:'insa'|'satis';halt:boolean;floors:number;slot:number;partner?:boolean;bribe?:boolean;}
export interface Offer{id:number;stage:number;name:string;loc:string;locMul:number;share:number;haggled:boolean;expires:number;}
export interface Building{id:number;name:string;stage:number;struct:number;year:number;floors:number;slot:number;residents:string[];state:'ayakta'|'hasar'|'yikik'|'donusum';q:string;gen:number;owner:string;kin?:number;}
export interface Firm{name:string;stage:number;done:number[];cert:number;exp:number;rep:number;crew:number;qual:number;eng:boolean;open:number;path:string;}
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
  cool:number;comfort:number;log:{m:number;t:string;k?:string}[];
  rival:{name:string;stage:number;rel:number;head:string;gen:number};
  result:string|null;over:null|{why:string};peakStage:number;stats:{collapse:number;saved:number;accidents:number;bankrupt:number;jail:number;projects:number;dead:number};
  quakeNow?:number;walk?:boolean;legacy?:string|null;}
