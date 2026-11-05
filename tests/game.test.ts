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
 it('30 aşama var',()=>expect(STAGES.length).toBe(30));
 for(const scen of ['koy','batik','kalfa','dul'])for(const city of ['istanbul','ankara','erzurum','samsun'])it(`${scen}/${city} 130 yıl hatasız`,()=>{for(let s=0;s<3;s++){const w=run(50+s*11,scen,city,130);expect(JSON.parse(JSON.stringify(w)).m).toBe(w.m);}},120000);
 it('aynı tohum aynı tarih',()=>{expect(JSON.stringify(run(7,'koy','van',40))).toBe(JSON.stringify(run(7,'koy','van',40)));});
 it('farklı tohum farklı hikâye',()=>{expect(newWorld({seed:1}).arcs.join()).not.toBe(newWorld({seed:2}).arcs.join());});
 it('kuşak değişir',()=>{const w=run(99,'koy','izmir',110);expect(w.gen>=2||!!w.over).toBe(true);},60000);
});
