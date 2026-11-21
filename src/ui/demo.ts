// Tanıtım modu: yalnızca "sb_demo" kaydı 1 ise çalışır (App Review ekran kaydı için simülatörde açılır).
// Oyunu normal bir oyuncu gibi dokunarak gezer; dokunulan yer beyaz bir halkayla gösterilir.
const sleep=(ms:number)=>new Promise(r=>setTimeout(r,ms));
let dot:HTMLDivElement;
function ring(){dot=document.createElement('div');dot.style.cssText='position:fixed;z-index:99999;width:44px;height:44px;margin:-22px 0 0 -22px;border-radius:50%;border:3px solid rgba(255,255,255,.95);background:rgba(255,255,255,.28);box-shadow:0 0 12px rgba(0,0,0,.5);pointer-events:none;transition:left .45s ease,top .45s ease,transform .15s;left:50%;top:60%;opacity:0';document.body.appendChild(dot);}
async function moveTo(x:number,y:number){dot.style.opacity='1';dot.style.left=x+'px';dot.style.top=y+'px';await sleep(520);dot.style.transform='scale(.7)';await sleep(140);dot.style.transform='scale(1)';}
async function tap(sel:string,wait=1100):Promise<boolean>{const el=document.querySelector(sel) as HTMLElement|null;if(!el||(el as HTMLButtonElement).disabled)return false;el.scrollIntoView({block:'center'});await sleep(250);const r=el.getBoundingClientRect();await moveTo(r.left+r.width/2,r.top+r.height/2);el.click();await sleep(wait);return true;}
async function tapAt(x:number,y:number,target:Element){await moveTo(x,y);const o={clientX:x,clientY:y,bubbles:true,pointerId:1,isPrimary:true,pointerType:'touch'} as any;for(const t of ['pointerdown','mousedown']) target.dispatchEvent(new (t.startsWith('p')?PointerEvent:MouseEvent)(t,o));await sleep(90);for(const t of ['pointerup','mouseup','click']) target.dispatchEvent(new (t.startsWith('p')?PointerEvent:MouseEvent)(t,o));await sleep(450);}
async function cards(n:number){for(let i=0;i<n;i++){if(!await tap('.veil .card:not(.dz) button:not([disabled])',1500))break;}}
async function scrollSheet(){const s=document.querySelector('.sheet') as HTMLElement|null;if(!s)return;for(let i=0;i<3;i++){s.scrollBy({top:220,behavior:'smooth'});await sleep(700);}s.scrollTo({top:0,behavior:'smooth'});await sleep(500);}
export async function runDemo(){ring();await sleep(6000);
 await tap('[data-a=newin][data-v="1"]',1400);
 await tap('[data-a=pickS][data-v=koy]',900);await tap('[data-a=pickC][data-v=istanbul]',900);
 await tap('[data-a=start]',2500);
 await cards(3);
 // işçi hayatı: mini oyun
 if(await tap('[data-a=workmini]',1200)){const c=document.querySelector('.mgc');if(c){const b=c.getBoundingClientRect();for(let i=0;i<6;i++)await tapAt(b.left+b.width*(.3+.08*i),b.top+b.height*(.45+.04*(i%3)),c);}
  for(let t=0;t<5;t++){if(!await tap('.mgbtn button',1500))break;if(!document.querySelector('.mgov'))break;}if(document.querySelector('.mgov'))await tap('[data-m=skip]',1000);}
 await cards(3);
 await tap('[data-a=spd][data-v="2"]',5000);await cards(3);await tap('[data-a=spd][data-v="0"]',600);
 // yıllar sonrası: firmanın büyüdüğü an (oyuncunun aylarca oynayacağı kısmı atlar)
 const g=(window as any).__g;if(g&&g.w){const W=g.w;for(let i=0;i<12*30&&!W.over;i++){g.S.botTurn(W);g.S.advance(W);}g.S.botTurn(W);W.cards=[];W.result=null;W.report=null;g.set(W);}
 await sleep(3500);
 for(const t of ['santiye','arsa','ekip','hayat','aile','para']){await tap(`[data-a=tab][data-v=${t}]`,1300);if(t==='santiye'){await tap('.sheet [data-a=sel]',1800);}await scrollSheet();await tap(`.tabs [data-v=${t}].on`,700);}
 await tap('[data-a=cam]',6000);await tap('[data-a=cam]',2500);
 await tap('[data-a=spd][data-v="1"]',6000);await cards(2);
 dot.style.opacity='0';}
