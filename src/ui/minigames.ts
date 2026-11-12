// Gerçekçi branş işleri. Her biri atlanabilir; atlanırsa ortalama sonuç (0,5) verir.
import {sound} from './audio';
export interface MGDefect{trade:string;txt:string;}
export interface MGOpts{skill:number;defects?:MGDefect[];title?:string;onDone:(r:MGResult)=>void;}
export interface MGResult{score:number;skipped:boolean;text:string;found:number[];}
type P={x:number;y:number};
interface Game{title:string;hint:string;draw(g:CanvasRenderingContext2D,W:number,H:number,t:number):void;down?(p:P):void;move?(p:P,held:boolean):void;up?(p:P):void;buttons():{t:string;a:string;y?:boolean}[];act?(a:string):void;done:boolean;score:number;text:string;found?:number[];tick?(dt:number):void;}
export const MG_NAMES:Record<string,string>={demir:'Etriye bağlama',beton:'Beton dökümü',duvar:'Duvar örme',kalip:'Kalıp ve payanda',siva:'Sıva ve mastar',denetim:'Usta gözüyle denetim',cekic:'Çekiç testi',seramik:'Seramik döşeme',elektrik:'Elektrik panosu'};
const clamp=(x:number,a=0,b=1)=>Math.max(a,Math.min(b,x));
const R=Math.random;
let pat:Record<string,CanvasPattern|null>={};
function noiseCanvas(base:[number,number,number],amt:number,size=128,spots=0,spotC='rgba(0,0,0,.25)'){const c=document.createElement('canvas');c.width=c.height=size;const g=c.getContext('2d')!;const im=g.createImageData(size,size);for(let i=0;i<size*size;i++){const k=1+(R()-.5)*amt;im.data[i*4]=base[0]*k;im.data[i*4+1]=base[1]*k;im.data[i*4+2]=base[2]*k;im.data[i*4+3]=255;}g.putImageData(im,0,0);g.fillStyle=spotC;for(let i=0;i<spots;i++){g.beginPath();g.arc(R()*size,R()*size,.5+R()*1.6,0,7);g.fill();}return c;}
function P_(g:CanvasRenderingContext2D,k:string){if(!pat[k]){const src=k==='conc'?noiseCanvas([168,168,162],.18,128,40):k==='wetc'?noiseCanvas([120,122,124],.12,128,10,'rgba(255,255,255,.15)'):k==='wood'?woodCanvas():k==='plaster'?noiseCanvas([214,206,192],.12,128,20,'rgba(90,80,70,.15)'):k==='dirt'?noiseCanvas([120,98,70],.3,128,60):noiseCanvas([180,90,60],.2);pat[k]=g.createPattern(src,'repeat');}return pat[k]!;}
function woodCanvas(){const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d')!;g.fillStyle='#b48a56';g.fillRect(0,0,128,128);for(let x=0;x<128;x+=21){g.fillStyle=`rgba(${110+R()*50},${75+R()*30},${35+R()*20},.5)`;g.fillRect(x,0,19,128);g.fillStyle='rgba(60,40,20,.6)';g.fillRect(x+19,0,2,128);}for(let i=0;i<40;i++){g.strokeStyle=`rgba(90,60,30,${.15+R()*.2})`;g.beginPath();const x=R()*128;g.moveTo(x,0);g.bezierCurveTo(x+R()*6,40,x-R()*6,90,x,128);g.stroke();}return c;}
function rebar(g:CanvasRenderingContext2D,x1:number,y1:number,x2:number,y2:number,w:number,rust=false){const ang=Math.atan2(y2-y1,x2-x1);const len=Math.hypot(x2-x1,y2-y1);g.save();g.translate(x1,y1);g.rotate(ang);if(w>=5){g.shadowColor='rgba(0,0,0,.45)';g.shadowBlur=4;g.shadowOffsetY=2;}const gr=g.createLinearGradient(0,-w/2,0,w/2);gr.addColorStop(0,rust?'#c27a3e':'#8a6a55');gr.addColorStop(.4,rust?'#a0521e':'#5a4436');gr.addColorStop(1,rust?'#5e2e10':'#2a201a');g.fillStyle=gr;g.fillRect(0,-w/2,len,w);g.shadowColor='transparent';g.fillStyle='rgba(255,255,255,.18)';g.fillRect(0,-w/2+1,len,Math.max(1,w*.18));g.strokeStyle=rust?'rgba(240,160,90,.5)':'rgba(170,150,130,.45)';g.lineWidth=1;for(let i=3;i<len;i+=w*1.1){g.beginPath();g.moveTo(i,-w/2);g.lineTo(i+w*.5,w/2);g.stroke();}g.restore();}
function label(g:CanvasRenderingContext2D,t:string,x:number,y:number,size=13,col='#f2eee4',align:CanvasTextAlign='left'){g.font=`600 ${size}px Barlow, system-ui, sans-serif`;g.fillStyle=col;g.textAlign=align;g.fillText(t,x,y);}
// ---------- Görsel katman: şantiye arka planı, toz, kıvılcım, harç sıçraması, uçan yazılar ----------
let bgC:HTMLCanvasElement|null=null;let bgK='';let curKind='';
function backdrop(W:number,H:number,kind:string){const c=document.createElement('canvas');const d=Math.min(2,devicePixelRatio||1);c.width=W*d;c.height=H*d;const g=c.getContext('2d')!;g.scale(d,d);
 // gökyüzü: sabah, toz pus
 const sky=g.createLinearGradient(0,0,0,H*.7);sky.addColorStop(0,'#6f8aa3');sky.addColorStop(.55,'#c9b796');sky.addColorStop(1,'#d9b483');g.fillStyle=sky;g.fillRect(0,0,W,H);
 const sun=g.createRadialGradient(W*.78,H*.18,4,W*.78,H*.18,H*.5);sun.addColorStop(0,'rgba(255,236,190,.9)');sun.addColorStop(.12,'rgba(255,220,160,.35)');sun.addColorStop(1,'rgba(255,220,160,0)');g.fillStyle=sun;g.fillRect(0,0,W,H);
 // uzak şehir: apartman siluetleri ve pencereler
 const rnd=(()=>{let x=W*13+H*7+kind.length*101;return()=>{x=(x*16807)%2147483647;return x/2147483647;};})();
 for(const [base,col,hmul] of [[H*.62,'#8d8f95',.55],[H*.7,'#6c6e74',.42]] as [number,string,number][]){let x=-10;while(x<W+10){const bw=24+rnd()*46,bh=H*hmul*(.25+rnd()*.75);g.fillStyle=col;g.fillRect(x,base-bh,bw,bh+H);g.fillStyle='rgba(255,236,190,.22)';for(let yy=base-bh+6;yy<base-6;yy+=9)for(let xx=x+4;xx<x+bw-5;xx+=8)if(rnd()<.35)g.fillRect(xx,yy,4,5);if(rnd()<.3){g.fillStyle=col;g.fillRect(x+bw*.3,base-bh-10,3,10);g.beginPath();g.arc(x+bw*.3+1,base-bh-12,4,Math.PI,0);g.fill();}x+=bw+2+rnd()*6;}}
 // kule vinç silueti
 g.strokeStyle='#2f3338';g.lineWidth=3;const cx=W*.18,ct=H*.12;g.beginPath();g.moveTo(cx,H*.72);g.lineTo(cx,ct);g.moveTo(cx-W*.1,ct+6);g.lineTo(cx+W*.55,ct+6);g.stroke();g.lineWidth=1;for(let y=ct;y<H*.72;y+=10){g.beginPath();g.moveTo(cx-4,y);g.lineTo(cx+4,y+10);g.stroke();}g.beginPath();g.moveTo(cx+W*.42,ct+6);g.lineTo(cx+W*.42,H*.34);g.stroke();g.fillStyle='#2f3338';g.fillRect(cx+W*.42-7,H*.34,14,8);g.fillRect(cx-W*.1,ct+2,W*.06,12);
 // iskele ve file, yanlarda
 for(const sx of [6,W-26]){g.fillStyle='rgba(60,110,70,.55)';g.fillRect(sx,H*.08,20,H);g.strokeStyle='#8a8d91';g.lineWidth=2;g.beginPath();g.moveTo(sx,0);g.lineTo(sx,H);g.moveTo(sx+20,0);g.lineTo(sx+20,H);for(let y=H*.1;y<H;y+=46){g.moveTo(sx,y);g.lineTo(sx+20,y);g.moveTo(sx,y);g.lineTo(sx+20,y+46);}g.stroke();}
 // zemin: toprak ve çakıl
 const gy=H*.86;const dirt=g.createLinearGradient(0,gy,0,H);dirt.addColorStop(0,'#7a6248');dirt.addColorStop(1,'#4c3c2c');g.fillStyle=dirt;g.fillRect(0,gy,W,H-gy);for(let i=0;i<W*.6;i++){g.fillStyle=`rgba(${60+rnd()*80},${50+rnd()*60},${40+rnd()*40},.6)`;g.fillRect(rnd()*W,gy+rnd()*(H-gy),1+rnd()*2,1+rnd()*2);}
 // çalışma alanını okunur kılan koyu perde ve kenar kararması
 g.fillStyle='rgba(16,18,22,.58)';g.fillRect(0,0,W,H);const vg=g.createRadialGradient(W/2,H*.5,Math.min(W,H)*.25,W/2,H*.5,Math.max(W,H)*.75);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.55)');g.fillStyle=vg;g.fillRect(0,0,W,H);
 // sıcak ışık huzmesi
 const lb=g.createLinearGradient(W,0,W*.3,H);lb.addColorStop(0,'rgba(255,214,150,.13)');lb.addColorStop(.5,'rgba(255,214,150,.04)');lb.addColorStop(1,'rgba(255,214,150,0)');g.fillStyle=lb;g.fillRect(0,0,W,H);
 return c;}
function bg(g:CanvasRenderingContext2D,W:number,H:number){const k=W+'x'+H+curKind;if(k!==bgK||!bgC){bgC=backdrop(W,H,curKind);bgK=k;}g.drawImage(bgC,0,0,W,H);}
type Pt={x:number;y:number;vx:number;vy:number;life:number;max:number;r:number;c:string;k:string};
const fx:Pt[]=[];const pops:{x:number;y:number;t:string;c:string;life:number}[]=[];let lastP={x:0,y:0};
function emit(x:number,y:number,k:string,n=8){for(let i=0;i<n;i++){const a=R()*Math.PI*2;const sp=k==='spark'?80+R()*160:k==='splash'?40+R()*110:k==='chip'?60+R()*120:10+R()*40;
 fx.push({x,y,vx:Math.cos(a)*sp,vy:(k==='dust'?-Math.abs(Math.sin(a))*sp*.6:Math.sin(a)*sp-(k==='splash'?60:k==='chip'?50:0)),life:0,max:k==='dust'?1.2+R():k==='ring'?.6:.5+R()*.5,r:k==='spark'?1.2+R():k==='dust'?3+R()*5:k==='ring'?6:1.5+R()*2.5,
  c:k==='spark'?`hsl(${40+R()*20},100%,${60+R()*30}%)`:k==='splash'?`rgba(${105+R()*30},${108+R()*30},${112+R()*30},.95)`:k==='chip'?`rgba(${150+R()*40},${145+R()*40},${135+R()*40},1)`:k==='mortar'?`rgba(${190+R()*30},${180+R()*25},${160+R()*20},1)`:k==='ring'?'#b4dfa9':k==='bad'?'#ff8d6e':`rgba(${170+R()*40},${150+R()*30},${120+R()*30},.35)`,k});}}
function pop(x:number,y:number,t:string,c='#f2e7c9'){pops.push({x,y,t,c,life:0});}
function fxDraw(g:CanvasRenderingContext2D,dt:number){for(let i=fx.length-1;i>=0;i--){const p=fx[i];p.life+=dt;if(p.life>p.max){fx.splice(i,1);continue;}const k=p.life/p.max;
  if(p.k==='ring'||p.k==='bad'){g.strokeStyle=p.c;g.globalAlpha=1-k;g.lineWidth=3*(1-k)+1;g.beginPath();g.arc(p.x,p.y,8+k*34,0,7);g.stroke();g.globalAlpha=1;continue;}
  p.vy+=(p.k==='dust'?-6:p.k==='spark'?260:420)*dt;p.vx*=1-dt*(p.k==='dust'?1.5:.6);p.x+=p.vx*dt;p.y+=p.vy*dt;g.globalAlpha=Math.max(0,1-k);g.fillStyle=p.c;g.beginPath();g.arc(p.x,p.y,p.r*(p.k==='dust'?1+k*1.5:1),0,7);g.fill();}
 g.globalAlpha=1;for(let i=pops.length-1;i>=0;i--){const q=pops[i];q.life+=dt;if(q.life>1.1){pops.splice(i,1);continue;}g.globalAlpha=Math.min(1,(1.1-q.life)*2);g.font='800 17px "Barlow Condensed", Barlow, system-ui, sans-serif';g.textAlign='center';g.lineWidth=4;g.strokeStyle='rgba(0,0,0,.7)';g.strokeText(q.t,q.x,q.y-q.life*34);g.fillStyle=q.c;g.fillText(q.t,q.x,q.y-q.life*34);}g.globalAlpha=1;}
/** Ses + görsel efekt: son dokunulan noktada */
function sfx(n:string,arg?:any){sound.sfx(n as any,arg);const{x,y}=lastP;
 if(n==='place'){emit(x,y,'dust',7);emit(x,y,'mortar',6);}else if(n==='pour'){emit(x,y,'splash',10);}else if(n==='vib'){emit(x,y,'splash',5);emit(x,y,'ring',1);}else if(n==='tie'){emit(x,y,'spark',6);}
 else if(n==='tok'){emit(x,y,'chip',arg?4:9);emit(x,y,'dust',arg?2:6);}else if(n==='good'){emit(x,y,'ring',1);}else if(n==='click'){emit(x,y,'dust',3);}}

// ---------- 1. Etriye: ölç, kaydır, bağla ----------
function demir(o:MGOpts):Game{const ideal=[5,15,25,35,45,65,85,105,125,145];const st=ideal.map((_,i)=>({y:2+i*3+R()*6,tied:false}));let drag=-1;let tying=-1;let tt=0;const G:any={title:MG_NAMES.demir,hint:'Kolon altındaki ilk 50 cm sıklaştırma bölgesi: 10 cm\'de bir etriye. Yukarısı 20 cm\'de bir. Etriyeleri cetvele bakarak sürükle, sonra bağla.',done:false,score:0,text:'',
 draw(g:CanvasRenderingContext2D,W:number,H:number){bg(g,W,H);const top=40,bot=H-30,cm=(bot-top)/150;const cx=W*.55,cw=Math.min(150,W*.32);
  // kolon kalıbı arka plan
  g.fillStyle=P_(g,'wood');g.globalAlpha=.25;g.fillRect(cx-cw/2-20,top-20,cw+40,bot-top+30);g.globalAlpha=1;
  // cetvel
  g.fillStyle='#e8c84a';g.fillRect(20,top,34,bot-top);for(let c=0;c<=150;c+=5){const y=bot-c*cm;g.fillStyle='#222';g.fillRect(20,y,c%10?10:18,1.5);if(c%10===0)label(g,String(c),58,y+4,11,'#ddd');}
  if(o.skill>45){g.strokeStyle='rgba(242,185,15,.18)';g.setLineDash([3,4]);for(const v of ideal){const y=bot-v*cm;g.beginPath();g.moveTo(cx-cw/2-14,y);g.lineTo(cx+cw/2+14,y);g.stroke();}g.setLineDash([]);}
  g.fillStyle='rgba(214,83,47,.12)';g.fillRect(cx-cw/2-16,bot-50*cm,cw+32,50*cm);label(g,'Sıklaştırma',cx+cw/2+20,bot-25*cm,11,'#ffb39a');
  // boyuna demirler
  for(const x of[cx-cw/2+8,cx-cw/6,cx+cw/6,cx+cw/2-8])rebar(g,x,top-10,x,bot+6,9);
  // etriyeler
  st.forEach((s,i)=>{const y=bot-s.y*cm;rebar(g,cx-cw/2-2,y,cx+cw/2+2,y,6);rebar(g,cx+cw/2-4,y,cx+cw/2-14,y-12,5);if(s.tied){g.fillStyle='#ccc';for(const x of[cx-cw/2+8,cx-cw/6,cx+cw/6,cx+cw/2-8]){g.fillRect(x-3,y-4,6,2);g.fillRect(x-3,y+2,6,2);}}if(i===drag){g.strokeStyle='#f2b90f';g.lineWidth=2;g.strokeRect(cx-cw/2-6,y-8,cw+12,16);label(g,s.y.toFixed(0)+' cm',cx-cw/2-60,y+4,13,'#f2b90f');}});
  label(g,'Kolon 1. kat, alt bölüm',W-10,24,12,'#c9c2b3','right');},
 down(p:P){const H=this._H;const top=40,bot=H-30,cm=(bot-top)/150;let best=-1,bd=24;st.forEach((s,i)=>{const d=Math.abs(bot-s.y*cm-p.y);if(d<bd&&tying<0){bd=d;best=i;}});drag=best;},
 move(p:P,held:boolean){if(drag<0||!held)return;const H=this._H;const top=40,bot=H-30,cm=(bot-top)/150;st[drag].y=clamp(Math.round((bot-p.y)/cm),1,149);},up(){drag=-1;},
 buttons(){return tying>=0?[]:[{t:'Tel ile bağla',a:'tie',y:true}];},
 act(a:string){if(a==='tie'){tying=0;}},
 tick(dt:number){if(tying<0||this.done)return;tt+=dt;if(tt>.18){tt=0;if(tying<st.length){st[tying].tied=true;sfx('tie');tying++;}else{const ys=st.map(s=>s.y).sort((a,b)=>a-b);const err=ys.reduce((s,y,i)=>s+Math.abs(y-ideal[i]),0)/ideal.length;const dense=ys.filter(y=>y<=50).length;this.score=clamp(1-err/9-(dense<5?.15:0));this.text=`Ortalama sapma ${err.toFixed(1)} cm. Sıklaştırma bölgesinde ${dense} etriye var (olması gereken 5).`;this.done=true;}}}} as any;return G;}

// ---------- 2. Beton: irsaliye, döküm, vibratör ----------
function beton(o:MGOpts):Game{const bad=R()<.4;const slump=bad?(R()<.5?22+Math.floor(R()*5):12):12+Math.floor(R()*3)-1;const cls=bad&&slump<20?'C20':'C30';const water=bad&&slump>=20;let ph=0;let decision=0;const C=6,Rw=4;const fill=Array(C*Rw).fill(0);const air=Array(C*Rw).fill(0).map(()=>2+Math.floor(R()*3));const seg=Array(C*Rw).fill(0);let hose:P|null=null;let held=false;let time=22;let snd=0;
 const cell=(W:number,H:number)=>{const x0=16,y0=50,w=(W-32)/C,h=(H-70)/Rw;return{x0,y0,w,h};};
 const G:any={title:MG_NAMES.beton,hint:'Önce irsaliyeye bak: projede C30 ve 10-15 cm çökme (slump) isteniyor. Sonra hortumu kalıbın üstünde gezdirip betonu eşit dök, en son vibratör vur.',done:false,score:0,text:'',
 draw(g:CanvasRenderingContext2D,W:number,H:number,t:number){bg(g,W,H);this._W=W;this._H=H;
  if(ph===0){g.fillStyle='#ece6d7';g.fillRect(W*.1,40,W*.8,H-80);g.fillStyle='#201c15';label(g,'SEVK İRSALİYESİ',W/2,72,18,'#201c15','center');const rows=[['Hazır beton sınıfı',cls],['Çökme (slump)',slump+' cm'],['Miktar','24 m³'],['Çıkış saati','08:40'],['Not',water?'Şantiyede su ilave edildi':'—']];rows.forEach(([a,b],i)=>{label(g,a,W*.15,110+i*30,14,'#4a4436');label(g,b,W*.85,110+i*30,15,(a.startsWith('Hazır')&&b!=='C30')||(a.startsWith('Çökme')&&slump>16)||(a==='Not'&&water)?'#a33':'#201c15','right');});
   g.strokeStyle='#6f6754';g.strokeRect(W*.15,H-140,W*.7,40);label(g,o.skill>40?'Slump konisi: '+(slump>16?'beton akıp yayıldı':'beton tutarlı çöktü'):'Slump konisi deneyi yapıldı',W/2,H-115,13,'#201c15','center');return;}
  const{x0,y0,w,h}=cell(W,H);
  for(let i=0;i<C*Rw;i++){const cx=x0+(i%C)*w,cy=y0+Math.floor(i/C)*h;g.fillStyle=P_(g,'wood');g.fillRect(cx,cy,w,h);for(let k=1;k<4;k++){rebar(g,cx,cy+k*h/4,cx+w,cy+k*h/4,3);rebar(g,cx+k*w/4,cy,cx+k*w/4,cy+h,3);}
   const f=fill[i];if(f>0){g.globalAlpha=Math.min(1,f);g.fillStyle=P_(g,'wetc');g.fillRect(cx,cy,w,h);g.globalAlpha=1;if(f>1.15){g.fillStyle='rgba(180,200,220,.35)';g.fillRect(cx,cy,w,h);}
    if(ph===2){for(let k=0;k<air[i]*3;k++){g.fillStyle='rgba(30,30,30,.55)';g.beginPath();g.arc(cx+((k*37+i*13)%97)/97*w,cy+((k*53+i*7)%89)/89*h,1.6,0,7);g.fill();}if(seg[i]){g.fillStyle='rgba(170,200,230,.45)';g.fillRect(cx+3,cy+3,w-6,h-6);}}}
   g.strokeStyle='rgba(0,0,0,.4)';g.strokeRect(cx,cy,w,h);}
  if(ph===1){label(g,`Kalan süre ${Math.ceil(time)} sn`,16,30,14);if(hose){g.strokeStyle='#222';g.lineWidth=10;g.beginPath();g.moveTo(W,0);g.quadraticCurveTo(W*.8,hose.y*.3,hose.x,hose.y-6);g.stroke();g.fillStyle='#444';g.beginPath();g.arc(hose.x,hose.y,9,0,7);g.fill();if(held){g.fillStyle='rgba(120,122,124,.6)';for(let k=0;k<6;k++){g.beginPath();g.arc(hose.x+(R()-.5)*14,hose.y+(R()-.5)*14,3,0,7);g.fill();}}}}
  if(ph===2)label(g,'Hava kabarcığı olan bölmeye dokun: vibratör. Fazla vurma, beton ayrışır.',16,30,13);},
 down(p:P){if(ph===1){hose=p;held=true;}else if(ph===2){const{x0,y0,w,h}=cell(this._W,this._H);const i=Math.floor((p.x-x0)/w)+Math.floor((p.y-y0)/h)*C;if(i>=0&&i<C*Rw&&p.x>x0&&p.y>y0){sfx('vib');if(air[i]>0)air[i]--;else seg[i]=1;}}},
 move(p:P,h:boolean){if(ph===1){hose=p;held=h;}},up(){held=false;},
 tick(dt:number){if(ph!==1)return;time-=dt;if(held&&hose){const{x0,y0,w,h}=cell(this._W,this._H);const cx=Math.floor((hose.x-x0)/w),cy=Math.floor((hose.y-y0)/h);if(cx>=0&&cx<C&&cy>=0&&cy<Rw){fill[cy*C+cx]+=dt*.9;}snd-=dt;if(snd<=0){snd=.3;sfx('pour');}}if(time<=0||fill.every(f=>f>=.95))ph=2;},
 buttons(){if(ph===0)return[{t:'Kabul et, dök',a:'ok',y:true},{t:'Kamyonu geri çevir',a:'no'}];if(ph===1)return[{t:'Dökümü bitir',a:'next'}];return[{t:'Vibratörü bitir',a:'end',y:true}];},
 act(a:string){if(ph===0){decision=(a==='no')===bad?1:0;if(a==='no'&&bad){/* yeni kamyon gelir */}ph=1;sfx(decision?'good':'bad');}else if(ph===1&&a==='next'){ph=2;}else if(a==='end'){const even=1-fill.reduce((s,f)=>s+Math.min(1,Math.abs(f-1)),0)/fill.length;const airL=air.reduce((s,a)=>s+a,0)/(fill.length*3);const segL=seg.reduce((s,a)=>s+a,0)/fill.length;const accBad=decision===0&&bad;this.score=clamp(.35*even+.35*(1-airL)+.1*(1-segL)+.2*decision-(accBad?.25:0));
  this.text=(bad?(decision?'Kötü betonu yakaladın, yeni kamyon geldi. ':'Kötü betonu kabul ettin, kolonların içine girdi. '):(decision?'Beton iyiydi, doğru karar. ':'İyi betonu boşuna geri çevirdin, yarım gün kaybettin. '))+`Döküm düzgünlüğü %${Math.round(even*100)}, kalan hava %${Math.round(airL*100)}.`;this.done=true;}}};return G;}

// ---------- 3. Duvar: şaşırtmalı tuğla dizimi ----------
function duvar(o:MGOpts):Game{const rows=4,per=3;const placed:{r:number;x:number}[]=[];let x=0,dir=1;let lean=0;const sp=.55+Math.max(0,(50-o.skill))/120;
 const G:any={title:MG_NAMES.duvar,hint:'Kayan tuğlayı ip hizasındaki gölgeye bırak. Her sıra bir alttakinin yarım tuğla kaydırılmışı olmalı (şaşırtma). Şakül ipi duvarın eğrildiğini gösterir.',done:false,score:0,text:'',errs:[] as number[],
 geo(W:number,H:number){const bw=Math.min(110,(W-80)/(per+.5)),bh=bw*.42;const x0=(W-bw*(per+.5))/2,y0=H-30;return{bw,bh,x0,y0};},
 draw(g:CanvasRenderingContext2D,W:number,H:number,t:number){bg(g,W,H);this._W=W;this._H=H;const{bw,bh,x0,y0}=this.geo(W,H);g.fillStyle=P_(g,'conc');g.fillRect(x0-20,y0,bw*(per+.5)+40,20);
  const r=Math.floor(placed.length/per),k=placed.length%per;
  for(let i=0;i<placed.length;i++){const p=placed[i];const yy=y0-(p.r+1)*(bh+4);g.fillStyle='#c8c0ae';g.fillRect(p.x-2,yy-2,bw+4,bh+8);const gr=g.createLinearGradient(0,yy,0,yy+bh);gr.addColorStop(0,'#c46a42');gr.addColorStop(1,'#8f4a2c');g.fillStyle=gr;g.fillRect(p.x,yy,bw,bh);g.fillStyle='rgba(60,25,15,.35)';for(let j=0;j<3;j++)g.fillRect(p.x+8+j*(bw-16)/3,yy+bh/2-3,(bw-16)/3-5,6);}
  if(r<rows){const off=r%2?bw/2:0;const tx=x0+off+k*bw;const yy=y0-(r+1)*(bh+4);g.strokeStyle='rgba(242,185,15,.7)';g.setLineDash([5,4]);g.strokeRect(tx,yy,bw,bh);g.setLineDash([]);
   g.strokeStyle='#eee';g.lineWidth=1;g.beginPath();g.moveTo(x0-30,yy+bh);g.lineTo(x0+bw*(per+.5)+30,yy+bh);g.stroke();
   const bx=x;g.fillStyle='#b55f3a';g.fillRect(bx,yy-bh*1.6,bw,bh);label(g,'↓',bx+bw/2,yy-bh*1.8,16,'#f2b90f','center');}
  // şakül
  const px=x0+bw*(per+.5)+26;g.strokeStyle='#ddd';g.beginPath();g.moveTo(px,20);g.lineTo(px+lean*.4,y0-6);g.stroke();g.fillStyle='#f2b90f';g.beginPath();g.moveTo(px+lean*.4-6,y0-14);g.lineTo(px+lean*.4+6,y0-14);g.lineTo(px+lean*.4,y0-2);g.fill();label(g,'Şakül',px,16,11,'#c9c2b3','center');},
 tick(dt:number){const W=this._W||360;const{bw,x0}=this.geo(W,this._H||400);x+=dir*dt*W*sp;if(x>x0+bw*(per+.5)){x=x0+bw*(per+.5);dir=-1;}if(x<x0-bw){x=x0-bw;dir=1;}},
 down(){if(this.done)return;const{bw,x0}=this.geo(this._W,this._H);const r=Math.floor(placed.length/per),k=placed.length%per;const off=r%2?bw/2:0;const tx=x0+off+k*bw;const e=x-tx;this.errs.push(Math.abs(e));lean+=e*.15;placed.push({r,x});{const gg=this.geo(this._W,this._H);lastP={x:x+bw/2,y:gg.y0-(r+1)*(gg.bh+4)+gg.bh/2};const ae=Math.abs(e)/bw;pop(lastP.x,lastP.y-gg.bh,ae<.06?'Tam yerinde':ae<.16?'İyi':ae<.3?'Kaçık':'Çok kaçık',ae<.16?'#b4dfa9':'#ffb39a');}sfx('place');if(placed.length>=rows*per){const me=this.errs.reduce((s:number,v:number)=>s+v,0)/this.errs.length;this.score=clamp(1-me/(bw*.35)-Math.abs(lean)/(bw*1.5));this.text=`Ortalama kayma ${Math.round(me/bw*19)} cm${Math.abs(lean)>bw*.3?', duvar şakülden kaçtı':', duvar şakülünde'}.`;this.done=true;}},
 buttons(){return[];}};return G;}

// ---------- 4. Kalıp: payanda yerleşimi ----------
function kalip(o:MGOpts):Game{const props:number[]=[];let poured=false;let anim=0;const span=6;const G:any={title:MG_NAMES.kalip,hint:'6 metrelik döşeme kalıbının altına payanda yerleştir. İki destek arası 1,2 metreyi geçerse döşeme sarkar. Az payanda ucuz, fazlası boşuna masraf.',done:false,score:0,text:'',
 geo(W:number,H:number){const x0=30,x1=W-30,y=H*.38;return{x0,x1,y,m:(x1-x0)/span};},
 sag(){const pts=[0,...props.slice().sort((a,b)=>a-b),span];let mx=0;for(let i=1;i<pts.length;i++)mx=Math.max(mx,pts[i]-pts[i-1]);return{mx,mm:Math.pow(mx,4)*2.2};},
 draw(g:CanvasRenderingContext2D,W:number,H:number){bg(g,W,H);this._W=W;this._H=H;const{x0,x1,y,m}=this.geo(W,H);const s=this.sag();
  g.fillStyle=P_(g,'conc');g.fillRect(x0-24,y-10,24,H-y-20);g.fillRect(x1,y-10,24,H-y-20);g.fillStyle=P_(g,'dirt');g.fillRect(0,H-20,W,20);
  const sorted=[0,...props.slice().sort((a,b)=>a-b),span];g.beginPath();g.moveTo(x0,y);for(let i=1;i<sorted.length;i++){const a=sorted[i-1],b=sorted[i];const L=b-a;const d=poured?Math.min(40,Math.pow(L,4)*2.2*anim)*.35:0;g.quadraticCurveTo(x0+(a+L/2)*m,y+d*2,x0+b*m,y);}g.lineTo(x1,y-22);g.lineTo(x0,y-22);g.closePath();g.fillStyle=poured?P_(g,'wetc'):P_(g,'wood');g.fill();g.strokeStyle='#222';g.stroke();
  for(const p of props){const x=x0+p*m;const mid=y+(H-y-20)*.45;const tg=g.createLinearGradient(x-4,0,x+4,0);tg.addColorStop(0,'#5d646b');tg.addColorStop(.5,'#c3c9cf');tg.addColorStop(1,'#4a5056');g.fillStyle=tg;g.fillRect(x-2.5,y,5,mid-y);g.fillRect(x-4,mid,8,H-20-mid);g.fillStyle='#d6532f';g.fillRect(x-6,mid-2,12,3);g.fillStyle='#3b3f44';g.fillRect(x-10,y,20,4);g.fillRect(x-9,H-24,18,4);}
  for(let i=0;i<=span;i++){label(g,i+' m',x0+i*m,H-4,10,'#c9c2b3','center');}
  label(g,`Payanda: ${props.length}`,16,26,14);label(g,`En geniş açıklık ${s.mx.toFixed(2)} m`,W-16,26,13,s.mx>1.2?'#ffb39a':'#b4dfa9','right');if(poured)label(g,`Sarkma ${s.mm.toFixed(1)} mm`,W/2,y+60,16,s.mm>4.6?'#ffb39a':'#b4dfa9','center');},
 down(p:P){if(poured)return;const{x0,x1,y,m}=this.geo(this._W,this._H);if(p.y<y||p.x<x0+5||p.x>x1-5)return;const v=Math.round((p.x-x0)/m*10)/10;const near=props.findIndex(q=>Math.abs(q-v)<.25);if(near>=0)props.splice(near,1);else if(props.length<9){props.push(v);sfx('place');}},
 tick(dt:number){if(poured&&anim<1){anim=Math.min(1,anim+dt*.6);if(anim>=1&&!this.done){const s=this.sag();const safe=s.mx<=1.2;this.score=clamp(safe?1-Math.max(0,props.length-5)*.08:Math.max(0,.5-(s.mx-1.2)*.8));this.text=safe?`Döşeme ${s.mm.toFixed(1)} mm sarktı, sınırın altında. ${props.length} payanda kullandın.`:`Açıklık fazla: ${s.mm.toFixed(1)} mm sarkma. Döşemede çatlak riski var.`;this.done=true;}}},
 buttons(){return poured?[]:[{t:'Betonu dök',a:'pour',y:true}];},act(a:string){if(a==='pour'){poured=true;lastP={x:(this._W||360)/2,y:(this._H||400)*.38-20};sfx('pour');for(let i=0;i<5;i++)emit((this._W||360)*(.15+i*.17),(this._H||400)*.38-20,'splash',6);}}};return G;}

// ---------- 5. Sıva: harç at, mastar çek ----------
function siva(o:MGOpts):Game{const N=14;const h=Array(N).fill(0).map(()=>(R()-.5)*16);const init=Math.sqrt(h.reduce((s,v)=>s+v*v,0)/N);let mast:number|null=null;let time=25;const G:any={title:MG_NAMES.siva,hint:'Duvar yüzeyi yamuk. Çukur yere dokunup harç at, sonra mastarı (cetveli) duvar boyunca sürükleyip fazlayı al. Su terazisi düzlüğü gösterir.',done:false,score:0,text:'',
 geo(W:number,H:number){return{x0:24,w:(W-48)/N,y:H*.55};},
 draw(g:CanvasRenderingContext2D,W:number,H:number,t:number){bg(g,W,H);this._W=W;this._H=H;const{x0,w,y}=this.geo(W,H);
  g.fillStyle=P_(g,'conc');g.fillRect(x0,y,w*N,H-y-10);
  g.beginPath();g.moveTo(x0,y);for(let i=0;i<N;i++)g.lineTo(x0+i*w+w/2,y-20-h[i]*2.2);g.lineTo(x0+N*w,y);g.closePath();g.fillStyle=P_(g,'plaster');g.fill();
  g.strokeStyle='rgba(242,185,15,.5)';g.setLineDash([4,4]);g.beginPath();g.moveTo(x0,y-20);g.lineTo(x0+N*w,y-20);g.stroke();g.setLineDash([]);
  if(mast!==null){g.fillStyle='#c9ced2';g.fillRect(mast-90,y-28,180,8);g.fillStyle='#8a9096';g.fillRect(mast-90,y-30,180,3);}
  const rms=Math.sqrt(h.reduce((s,v)=>s+v*v,0)/N);const bx=W/2+clamp(rms/init,0,1)*60*(h[0]>0?1:-1);g.fillStyle='#2b3238';g.fillRect(W/2-80,30,160,22);g.fillStyle='#b8e06a';g.beginPath();g.ellipse(bx,41,14,7,0,0,7);g.fill();g.strokeStyle='#fff';g.strokeRect(W/2-16,32,32,18);label(g,'Su terazisi',W/2,24,11,'#c9c2b3','center');label(g,`Süre ${Math.ceil(time)}`,16,24,13);},
 down(p:P){const{x0,w,y}=this.geo(this._W,this._H);if(p.y<y-80||p.y>y+40){return;}if(p.y>y-60&&p.y<y+30){const i=Math.floor((p.x-x0)/w);if(i>=0&&i<N&&p.y>y-40){h[i]+=4+R()*2;if(i>0)h[i-1]+=1.5;if(i<N-1)h[i+1]+=1.5;sfx('place');}mast=p.x;}},
 move(p:P,held:boolean){if(!held)return;const{x0,w}=this.geo(this._W,this._H);mast=p.x;const i=Math.floor((p.x-x0)/w);for(let k=i-3;k<=i+3;k++)if(k>=0&&k<N&&h[k]>0)h[k]=Math.max(0,h[k]-1.2);},up(){mast=null;},
 tick(dt:number){time-=dt;if(time<=0&&!this.done)this.finish();},
 finish(){const rms=Math.sqrt(h.reduce((s,v)=>s+v*v,0)/N);const low=h.filter(v=>v<-2).length;this.score=clamp(1-rms/init*.9-low*.03);this.text=`Yüzey sapması ${rms.toFixed(1)} mm (başta ${init.toFixed(1)} mm). ${low?low+' çukur kaldı.':'Çukur kalmadı.'}`;this.done=true;},
 buttons(){return[{t:'Bitir',a:'end',y:true}];},act(a:string){if(a==='end')this.finish();}};return G;}

// ---------- 6. Usta gözü: hataları bul ----------
const VIS:Record<string,string[]>={demir:['etriye','pas','filiz'],beton:['bosluk','bosluk2'],kalip:['kacik'],duvar:['bag'],ince:['boru']};
function denetim(o:MGOpts):Game{const real=(o.defects||[]).slice(0,5);const items:{k:string;x:number;y:number;real:number;hit:boolean}[]=[];const used=new Set<string>();
 real.forEach((d,i)=>{const opts=VIS[d.trade]||['bosluk'];const k=opts.find(x=>!used.has(x))||opts[0];used.add(k);items.push({k,x:0,y:0,real:i,hit:false});});
 let time=30;let wrong=0;const marks:P[]=[];const G:any={title:MG_NAMES.denetim,hint:'Şantiyede dolaşıyorsun. Gördüğün hatalara dokun. Yanlış yere dokunmak ustaların gözünde itibarını düşürür. Hata yoksa "Temiz" de.',done:false,score:0,text:'',found:[] as number[],
 lay(W:number,H:number){const cols=[W*.18,W*.5,W*.82];const pos:Record<string,P>={etriye:{x:cols[0],y:H*.53},pas:{x:cols[2]+10,y:H*.3},filiz:{x:cols[1],y:H*.44},bosluk:{x:cols[1],y:H*.77},bosluk2:{x:cols[0],y:H*.77},kacik:{x:cols[2],y:H*.55},bag:{x:W*.34,y:H*.84},boru:{x:W*.66,y:H*.8}};for(const it of items){it.x=pos[it.k].x;it.y=pos[it.k].y;}return cols;},
 draw(g:CanvasRenderingContext2D,W:number,H:number,t:number){bg(g,W,H);this._W=W;this._H=H;const cols=this.lay(W,H);const has=(k:string)=>items.some(i=>i.k===k);
  g.fillStyle=P_(g,'dirt');g.fillRect(0,H*.9,W,H*.1);g.fillStyle=P_(g,'conc');g.fillRect(0,H*.88,W,10);
  // tuğla duvar parçası
  for(let r=0;r<3;r++)for(let c=0;c<6;c++){const bw=W*.62/6,bh=12;const off=has('bag')&&r===1?0:(r%2?bw/2:0);g.fillStyle=r%2?'#a85c3a':'#b8653f';g.fillRect(W*.18+c*bw+off,H*.88-(r+1)*(bh+2)-2,bw-3,bh);}
  cols.forEach((cx:number,ci:number)=>{const top=H*.18,bot=H*.88;const tilt=has('kacik')&&ci===2?.06:0;g.save();g.translate(cx,bot);g.rotate(tilt);
   const poured=ci!==1||!has('filiz');g.fillStyle=poured?P_(g,'conc'):'rgba(0,0,0,0)';const cw=W*.11;if(ci!==0){g.fillRect(-cw/2,-(bot-top)*.55,cw,(bot-top)*.55);}
   if(ci===0||!poured){for(const x of[-cw/2+5,cw/2-5])rebar(g,x,0,x,-(bot-top),6,has('pas')&&(ci as number)===2);for(let k=1;k<12;k++){if(has('etriye')&&ci===0&&k>=5&&k<=7)continue;const yy=-k*(bot-top)/12;rebar(g,-cw/2,yy,cw/2,yy,4);}}
   if(poured&&ci!==0){for(const x of[-cw/2+5,cw/2-5]){const fl=has('filiz')&&ci===1?.08:.25;rebar(g,x,-(bot-top)*.55,x,-(bot-top)*(.55+fl),6,has('pas')&&ci===2);}}
   if(has('bosluk')&&ci===1||has('bosluk2')&&ci===0){g.fillStyle='rgba(40,35,30,.8)';for(let k=0;k<30;k++){g.beginPath();g.arc((R()*.7-.35)*cw,-(bot-top)*(.12+R()*.08)-(ci===0?0:(bot-top)*.0),1.5+R()*2,0,7);g.fill();}}
   g.restore();});
  if(has('pas')){/* paslı demirler boyandı */}
  if(has('boru')){g.strokeStyle='#d9d4c4';g.lineWidth=5;g.beginPath();g.moveTo(W*.58,H*.88);g.lineTo(W*.74,H*.74);g.stroke();}
  if(o.skill>55){for(const it of items){if(it.hit)continue;g.strokeStyle=`rgba(242,185,15,${.12+.1*Math.sin(t*4)})`;g.lineWidth=2;g.beginPath();g.arc(it.x,it.y,26,0,7);g.stroke();}}
  for(const m of marks){g.strokeStyle='#ff8d6e';g.lineWidth=2;g.beginPath();g.moveTo(m.x-7,m.y-7);g.lineTo(m.x+7,m.y+7);g.moveTo(m.x+7,m.y-7);g.lineTo(m.x-7,m.y+7);g.stroke();}
  for(const it of items)if(it.hit){g.strokeStyle='#76b86b';g.lineWidth=3;g.beginPath();g.arc(it.x,it.y,22,0,7);g.stroke();label(g,(o.defects![it.real].txt),it.x,it.y-28,11,'#b4dfa9','center');}
  label(g,`Süre ${Math.ceil(time)}`,14,22,13);},
 down(p:P){const r=Math.max(34,this._W*.08);const it=items.find(i=>!i.hit&&Math.hypot(i.x-p.x,i.y-p.y)<r);if(it){it.hit=true;sfx('good');}else{wrong++;marks.push(p);sfx('click');}},
 tick(dt:number){time-=dt;if(time<=0&&!this.done)this.finish();},
 finish(){const n=items.filter(i=>i.hit).length;this.found=items.filter(i=>i.hit).map(i=>i.real);this.score=items.length?clamp(n/items.length-wrong*.08):clamp(1-wrong*.15);this.text=items.length?`${items.length} hatanın ${n} tanesini buldun${wrong?`, ${wrong} kez yanlış yere dokundun`:''}.`:(wrong?'Şantiye temizdi ama sen olmayan hataları aradın.':'Şantiye temizdi, doğru gördün.');this.done=true;},
 buttons(){return[{t:items.length?'Denetimi bitir':'Temiz, bitir',a:'end',y:true}];},act(a:string){if(a==='end')this.finish();}};return G;}

// ---------- 7. Çekiç testi ----------
function cekic(o:MGOpts):Game{const hollowN=(o.defects||[]).filter(d=>d.trade==='beton').length;const spots=Array(6).fill(0).map((_,i)=>({hollow:false,mark:0,ring:0}));const idx=[0,1,2,3,4,5].sort(()=>R()-.5).slice(0,Math.min(3,hollowN));for(const i of idx)spots[i].hollow=true;
 const G:any={title:MG_NAMES.cekic,hint:'Kolona çekiçle vur ve dinle. Tok ve tiz ses sağlam, boğuk ve uzun ses boşluklu betondur. Her noktaya bir daha dokununca işaretin değişir: sağlam, boşluklu.',done:false,score:0,text:'',found:[] as number[],
 pos(W:number,H:number){return spots.map((_,i)=>({x:W*(.36+(i%2)*.28),y:H*(.22+Math.floor(i/2)*.26)}));},
 draw(g:CanvasRenderingContext2D,W:number,H:number,t:number){bg(g,W,H);this._W=W;this._H=H;g.fillStyle=P_(g,'conc');g.fillRect(W*.22,20,W*.56,H-40);g.strokeStyle='rgba(0,0,0,.3)';g.strokeRect(W*.22,20,W*.56,H-40);
  this.pos(W,H).forEach((p:P,i:number)=>{const s=spots[i];g.fillStyle='rgba(0,0,0,.25)';g.beginPath();g.arc(p.x,p.y,18,0,7);g.fill();if(s.ring>0){const solid=!s.hollow;g.strokeStyle=`rgba(255,255,255,${s.ring})`;g.lineWidth=2;const rr=(1-s.ring)*(solid?26:46)+18;g.beginPath();g.arc(p.x,p.y,rr,0,7);g.stroke();if(!sound.set.sfx){g.beginPath();g.arc(p.x,p.y,rr+(solid?4:14),0,7);g.stroke();}}
   if(s.mark){label(g,s.mark===1?'Sağlam':'Boşluklu',p.x,p.y+36,12,s.mark===1?'#b4dfa9':'#ffb39a','center');}label(g,String(i+1),p.x,p.y+5,13,'#eee','center');});},
 down(p:P){this.pos(this._W,this._H).forEach((q:P,i:number)=>{if(Math.hypot(q.x-p.x,q.y-p.y)<30){const s=spots[i];sfx('tok',!s.hollow);s.ring=1;s.mark=s.mark===1?2:1;}});},
 tick(dt:number){for(const s of spots)s.ring=Math.max(0,s.ring-dt*(s.hollow?.8:2));},
 buttons(){return[{t:'Sonucu yaz',a:'end',y:true}];},act(a:string){if(a==='end'){let ok=0;for(const s of spots)if((s.mark===2)===s.hollow&&s.mark)ok++;const hitH=spots.filter(s=>s.hollow&&s.mark===2).length;this.found=hitH?(o.defects||[]).map((d,i)=>d.trade==='beton'?i:-1).filter(i=>i>=0).slice(0,hitH):[];this.score=ok/6;this.text=`${ok}/6 noktayı doğru okudun.${hollowN?` Boşluklu ${spots.filter(s=>s.hollow).length} nokta vardı.`:' Beton her yerde sağlamdı.'}`;this.done=true;}}};return G;}


// ---------- 8. Seramik: yapıştırıcıya karo yerleştir, derz ve gönye ----------
let tileC:HTMLCanvasElement|null=null;
function tileTex(){if(tileC)return tileC;const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d')!;const gr=g.createLinearGradient(0,0,128,128);gr.addColorStop(0,'#efe9df');gr.addColorStop(1,'#d9d1c3');g.fillStyle=gr;g.fillRect(0,0,128,128);
 for(let i=0;i<7;i++){g.strokeStyle=`rgba(${120+R()*40},${115+R()*30},${110+R()*30},${.12+R()*.2})`;g.lineWidth=.6+R()*1.4;g.beginPath();let x=R()*128,y=R()*128;g.moveTo(x,y);for(let k=0;k<6;k++){x+=(R()-.3)*40;y+=(R()-.5)*30;g.lineTo(x,y);}g.stroke();}
 for(let i=0;i<300;i++){g.fillStyle=`rgba(150,140,128,${R()*.15})`;g.fillRect(R()*128,R()*128,1,1);}return tileC=c;}
function seramik(o:MGOpts):Game{const C=4,Rw=4;const placed:{dx:number;dy:number;rot:number}[]=[];let t=0;const sp=.9+Math.max(0,(55-o.skill))/60;
 const G:any={title:MG_NAMES.seramik,hint:'Karo, yapıştırıcının üstünde sallanıyor. Yerine tam oturduğu ve düz durduğu anda dokun. Derz 3 mm olmalı; artı takozlar aralığı gösterir.',done:false,score:0,text:'',errs:[] as number[],
 geo(W:number,H:number){const ts=Math.min((W-60)/C,(H-130)/Rw);const x0=(W-ts*C)/2,y0=Math.max(64,(H-ts*Rw)/2-10);return{ts,x0,y0};},
 cur(){return{dx:Math.sin(t*2.1*sp)*.28+Math.sin(t*3.7*sp)*.08,dy:Math.cos(t*1.7*sp)*.12,rot:Math.sin(t*2.9*sp+1)*.14};},
 draw(g:CanvasRenderingContext2D,W:number,H:number){bg(g,W,H);this._W=W;this._H=H;const{ts,x0,y0}=this.geo(W,H);
  // şap ve taraklı yapıştırıcı
  g.fillStyle=P_(g,'conc');g.fillRect(x0-12,y0-12,ts*C+24,ts*Rw+24);g.fillStyle='rgba(190,190,186,.75)';g.fillRect(x0-4,y0-4,ts*C+8,ts*Rw+8);g.strokeStyle='rgba(120,120,118,.55)';g.lineWidth=2;for(let yy=y0;yy<y0+ts*Rw;yy+=7){g.beginPath();g.moveTo(x0-4,yy);for(let xx=x0;xx<x0+ts*C+4;xx+=12)g.lineTo(xx,yy+(xx/12%2?2:-2));g.stroke();}
  // ip ve gönye
  g.strokeStyle='rgba(242,185,15,.55)';g.lineWidth=1;g.setLineDash([6,5]);g.beginPath();g.moveTo(x0-20,y0);g.lineTo(x0+ts*C+20,y0);g.moveTo(x0,y0-20);g.lineTo(x0,y0+ts*Rw+20);g.stroke();g.setLineDash([]);
  const tex=tileTex();const gap=ts*.035;
  const drawTile=(cx:number,cy:number,rot:number,lift=0)=>{g.save();g.translate(cx,cy-lift);g.rotate(rot);g.shadowColor='rgba(0,0,0,.45)';g.shadowBlur=lift?16:4;g.shadowOffsetY=lift?10:2;g.drawImage(tex,-ts/2+gap,-ts/2+gap,ts-gap*2,ts-gap*2);g.shadowColor='transparent';const gl=g.createLinearGradient(-ts/2,-ts/2,ts/2,ts/2);gl.addColorStop(0,'rgba(255,255,255,.35)');gl.addColorStop(.35,'rgba(255,255,255,0)');gl.addColorStop(.6,'rgba(255,255,255,0)');gl.addColorStop(.75,'rgba(255,255,255,.12)');gl.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gl;g.fillRect(-ts/2+gap,-ts/2+gap,ts-gap*2,ts-gap*2);g.strokeStyle='rgba(0,0,0,.18)';g.strokeRect(-ts/2+gap,-ts/2+gap,ts-gap*2,ts-gap*2);g.restore();};
  placed.forEach((p,i)=>{const c=i%C,r=Math.floor(i/C);drawTile(x0+(c+.5)*ts+p.dx*ts,y0+(r+.5)*ts+p.dy*ts,p.rot);});
  // artı takozlar
  g.fillStyle='#e8eef3';placed.forEach((_,i)=>{const c=i%C,r=Math.floor(i/C);const x=x0+(c+1)*ts,y=y0+(r+1)*ts;g.fillRect(x-5,y-1.2,10,2.4);g.fillRect(x-1.2,y-5,2.4,10);});
  if(placed.length<C*Rw){const i=placed.length;const c=i%C,r=Math.floor(i/C);g.strokeStyle='rgba(242,185,15,.8)';g.setLineDash([5,4]);g.strokeRect(x0+c*ts+gap,y0+r*ts+gap,ts-gap*2,ts-gap*2);g.setLineDash([]);const q=this.cur();g.globalAlpha=.97;drawTile(x0+(c+.5)*ts+q.dx*ts,y0+(r+.5)*ts+q.dy*ts,q.rot,10);g.globalAlpha=1;}
  label(g,`Karo ${Math.min(placed.length+1,C*Rw)}/${C*Rw}`,16,30,14);label(g,'60x60 granit seramik',W-16,30,12,'#c9c2b3','right');
  // su terazisi: son karonun açısı
  const lr=placed.length?placed[placed.length-1].rot:0;const lx=W/2,ly=H-26;g.fillStyle='#e7b928';g.fillRect(lx-70,ly-9,140,18);g.fillStyle='#bfe6c6';g.fillRect(lx-18,ly-6,36,12);g.fillStyle='#6a9';g.beginPath();g.arc(lx+clamp(lr*120,-15,15),ly,4.5,0,7);g.fill();g.strokeStyle='#333';g.strokeRect(lx-18,ly-6,36,12);},
 tick(dt:number){t+=dt;},
 down(){if(this.done||placed.length>=C*Rw)return;const q=this.cur();placed.push(q);const{ts,x0,y0}=this.geo(this._W,this._H);const i=placed.length-1;lastP={x:x0+(i%C+.5)*ts,y:y0+(Math.floor(i/C)+.5)*ts};const e=Math.hypot(q.dx,q.dy)+Math.abs(q.rot)*1.4;this.errs.push(e);pop(lastP.x,lastP.y-ts*.3,e<.06?'Tam oturdu':e<.14?'İyi':e<.25?'Derz kaçtı':'Yamuk',e<.14?'#b4dfa9':'#ffb39a');sfx('place');
  if(placed.length>=C*Rw){const me=this.errs.reduce((s:number,v:number)=>s+v,0)/this.errs.length;this.score=clamp(1.15-me*3.2);const mm=Math.round(3+me*40);this.text=`Ortalama derz ${mm} mm${mm<=5?', göz düz görüyor':', derzler dalgalı, köşeler birbirini tutmuyor'}.`;this.done=true;}},
 buttons(){return[];}};return G;}

// ---------- 9. Elektrik panosu: kabloları doğru klemense bağla, sigortayı kesite göre seç ----------
function elektrik(o:MGOpts):Game{
 const CIR=[{n:'Aydınlatma',mm:'1,5 mm²',amp:10},{n:'Priz',mm:'2,5 mm²',amp:16},{n:'Fırın',mm:'4 mm²',amp:25}];
 const COLS=[{k:'L',n:'Faz',c:'#7a4a24'},{k:'N',n:'Nötr',c:'#2f6fd0'},{k:'PE',n:'Toprak',c:'#d9c22a'}];
 const AMPS=[10,16,25];const rating=CIR.map(c=>AMPS[(AMPS.indexOf(c.amp)+1+Math.floor(R()*2))%3]);
 const ends=CIR.flatMap((_,ci)=>COLS.map((_,ki)=>({ci,ki,to:'' as string,x:0,y:0})));let drag=-1;let dp={x:0,y:0};let tested=false;let lamp=0;
 const geoE=(W:number,H:number)=>{const px=W*.5,pw=W*.46,py=40,ph=H-90;const brk=CIR.map((_,i)=>({x:px+pw*(.2+i*.3),y:py+56}));const nb={x:px+pw*.12,y:py+ph*.62,w:pw*.76};const pe={x:px+pw*.12,y:py+ph*.82,w:pw*.76};
  const src=CIR.map((_,i)=>({x:16,y:py+40+i*((ph-40)/3)}));return{px,pw,py,ph,brk,nb,pe,src};};
 const G:any={title:MG_NAMES.elektrik,hint:'Kahverengi faz kendi sigortasına, mavi nötr N barasına, sarı-yeşil toprak PE barasına. Sigortaya dokunup amperini kabloya göre seç: 1,5 mm² 10 A, 2,5 mm² 16 A, 4 mm² 25 A.',done:false,score:0,text:'',
 geo:(W:number,H:number)=>geoE(W,H),
 endPos(i:number,W:number,H:number){const e=ends[i];const G2=geoE(W,H);if(i===drag)return dp;if(e.to){return this.term(e.to,W,H);}const s=G2.src[e.ci];return{x:s.x+92,y:s.y+12+e.ki*16};},
 term(id:string,W:number,H:number){const G2=geoE(W,H);const[k,n]=id.split(':');const j=+n;if(k==='L')return{x:G2.brk[j].x,y:G2.brk[j].y+34};if(k==='N')return{x:G2.nb.x+12+j*(G2.nb.w-24)/8,y:G2.nb.y};return{x:G2.pe.x+12+j*(G2.pe.w-24)/8,y:G2.pe.y};},
 draw(g:CanvasRenderingContext2D,W:number,H:number,tt:number){bg(g,W,H);this._W=W;this._H=H;const G2=geoE(W,H);
  // pano kutusu
  g.save();g.shadowColor='rgba(0,0,0,.5)';g.shadowBlur=12;g.fillStyle='#d9dcdf';g.fillRect(G2.px,G2.py,G2.pw,G2.ph);g.restore();g.fillStyle='#bfc3c7';g.fillRect(G2.px+8,G2.py+8,G2.pw-16,G2.ph-16);g.fillStyle='#8f9499';g.fillRect(G2.px+8,G2.py+36,G2.pw-16,6);
  // sigortalar
  G2.brk.forEach((b,i)=>{g.fillStyle='#f4f5f6';g.fillRect(b.x-16,b.y-22,32,52);g.strokeStyle='#888';g.strokeRect(b.x-16,b.y-22,32,52);g.fillStyle=tested&&lamp>0&&rating[i]===CIR[i].amp?'#2e9b4f':'#333';g.fillRect(b.x-5,b.y-14,10,14);label(g,`C${rating[i]}`,b.x,b.y+14,12,'#222','center');g.fillStyle='#777';g.beginPath();g.arc(b.x,b.y+34,4,0,7);g.fill();label(g,CIR[i].n,b.x,b.y-28,10,'#333','center');});
  // baralar
  for(const[bar,col,tx]of[[G2.nb,'#2f6fd0','N'],[G2.pe,'#3a8f3a','PE']]as[any,string,string][]){const bg2=g.createLinearGradient(0,bar.y-6,0,bar.y+6);bg2.addColorStop(0,'#e8c27a');bg2.addColorStop(1,'#a8782c');g.fillStyle=bg2;g.fillRect(bar.x,bar.y-6,bar.w,12);for(let j=0;j<9;j++){g.fillStyle='#666';g.beginPath();g.arc(bar.x+12+j*(bar.w-24)/8,bar.y,3,0,7);g.fill();}g.fillStyle=col;g.fillRect(bar.x-22,bar.y-9,18,18);label(g,tx,bar.x-13,bar.y+4,10,'#fff','center');}
  // gelen kablolar (gri kılıf) ve uçlar
  G2.src.forEach((s,i)=>{g.fillStyle='#9aa0a6';g.fillRect(s.x,s.y,70,46);g.strokeStyle='#555';g.strokeRect(s.x,s.y,70,46);label(g,CIR[i].n,s.x+4,s.y-6,11);label(g,CIR[i].mm,s.x+4,s.y+60,10,'#c9c2b3');});
  ends.forEach((e,i)=>{const s=G2.src[e.ci];const a={x:s.x+70,y:s.y+12+e.ki*16};const b=this.endPos(i,W,H);g.strokeStyle=COLS[e.ki].c;g.lineWidth=4;g.lineCap='round';g.beginPath();g.moveTo(a.x,a.y);g.bezierCurveTo(a.x+60,a.y,b.x-40,b.y+(e.to?40:0),b.x,b.y);g.stroke();if(e.ki===2){g.strokeStyle='#3a8f3a';g.lineWidth=2;g.setLineDash([5,5]);g.beginPath();g.moveTo(a.x,a.y);g.bezierCurveTo(a.x+60,a.y,b.x-40,b.y+(e.to?40:0),b.x,b.y);g.stroke();g.setLineDash([]);}
   g.fillStyle='#d8b26a';g.beginPath();g.arc(b.x,b.y,e.to?3:5,0,7);g.fill();});
  if(tested){const ok=lamp>0;label(g,ok?'Kaçak akım rölesi sakin, lamba yandı':'Röle attı: bağlantı hatası',W/2,H-14,14,ok?'#b4dfa9':'#ffb39a','center');if(ok){g.fillStyle=`rgba(255,230,140,${.25+.1*Math.sin(tt*8)})`;g.beginPath();g.arc(W*.25,H-60,26,0,7);g.fill();}}
  else label(g,'Uçları sürükle, sigortaya dokun',W/2,H-14,12,'#c9c2b3','center');},
 down(p:P){if(this.done)return;const W=this._W,H=this._H;const G2=geoE(W,H);
  const bi=G2.brk.findIndex(b=>Math.abs(p.x-b.x)<18&&p.y>b.y-24&&p.y<b.y+28);if(bi>=0){rating[bi]=AMPS[(AMPS.indexOf(rating[bi])+1)%3];sfx('click');return;}
  let best=-1,bd=26;ends.forEach((e,i)=>{const q=this.endPos(i,W,H);const d=Math.hypot(q.x-p.x,q.y-p.y);if(d<bd){bd=d;best=i;}});if(best>=0){drag=best;ends[best].to='';dp=p;}},
 move(p:P,held:boolean){if(drag>=0&&held)dp=p;},
 up(p:P){if(drag<0)return;const W=this._W,H=this._H;const G2=geoE(W,H);let id='';
  G2.brk.forEach((b,i)=>{if(Math.hypot(p.x-b.x,p.y-(b.y+34))<26)id='L:'+i;});
  for(const[k,bar]of[['N',G2.nb],['PE',G2.pe]]as[string,any][]){if(Math.abs(p.y-bar.y)<20&&p.x>bar.x-10&&p.x<bar.x+bar.w+10){for(let j=0;j<9;j++){const tid=k+':'+j;if(!ends.some(e=>e.to===tid)){id=tid;break;}}}}
  if(id&&!ends.some(e=>e.to===id)){ends[drag].to=id;lastP=this.term(id,W,H);sfx('tie');}drag=-1;},
 buttons(){return this.done?[]:[{t:'Şalteri kaldır, test et',a:'test',y:true}];},
 act(a:string){if(a!=='test')return;tested=true;let ok=0,peBad=0,lBad=0;for(const e of ends){const want=e.ki===0?'L:'+e.ci:e.ki===1?'N':'PE';const got=e.to.split(':')[0];if(e.ki===0?e.to===want:got===want)ok++;else{if(e.ki===2)peBad++;if(e.ki===0)lBad++;}}
  const rOk=rating.filter((r,i)=>r===CIR[i].amp).length;const over=rating.some((r,i)=>r>CIR[i].amp);lamp=ok===9?1:0;
  this.score=clamp(ok/9*.7+rOk/3*.3-(peBad?.25:0)-(over?.15:0));
  this.text=ok===9&&rOk===3?'Pano tertemiz: fazlar kendi sigortasında, toprak yerinde, amperler kabloya uygun.':`${ok}/9 uç doğru, ${rOk}/3 sigorta doğru.${peBad?' Toprak hattı yanlış: kaçak akımda insan çarpılır.':''}${over?' Kalın sigorta ince kabloyu korumaz, kablo ısınır.':''}`;
  lastP={x:this._W*.72,y:this._H*.3};sfx(lamp?'good':'bad');if(lamp)emit(this._W*.25,this._H-60,'spark',12);this.done=true;}};return G;}
const MAKERS:Record<string,(o:MGOpts)=>Game>={demir,beton,duvar,kalip,siva,denetim,cekic,seramik,elektrik};
/** Mini oyunu tam ekran açar */
export function openMini(kind:string,o:MGOpts){const mk=MAKERS[kind];if(!mk){o.onDone({score:.5,skipped:true,text:'',found:[]});return;}curKind=kind;bgC=null;fx.length=0;pops.length=0;const G=mk(o) as any;sound.sfx('card');let doneT=0;
 const ov=document.createElement('div');ov.className='mgov';ov.innerHTML=`<div class="mgbox"><div class="mghead"><h2>${o.title||G.title}</h2><button class="s" data-m="skip">Atla</button></div><p class="m mgh">${G.hint}</p><canvas class="mgc"></canvas><div class="mgbtn"></div></div>`;document.body.appendChild(ov);
 const cv=ov.querySelector('canvas') as HTMLCanvasElement;const g=cv.getContext('2d')!;const btn=ov.querySelector('.mgbtn') as HTMLElement;let W=0,H=0;let held=false;let alive=true;let last=performance.now();let shown=false;
 const size=()=>{const r=cv.getBoundingClientRect();const d=Math.min(2,devicePixelRatio||1);W=r.width;H=r.height;cv.width=W*d;cv.height=H*d;g.setTransform(d,0,0,d,0,0);};size();addEventListener('resize',size);
 const pt=(e:PointerEvent)=>{const r=cv.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top};};
 cv.addEventListener('pointerdown',e=>{held=true;cv.setPointerCapture(e.pointerId);G._W=W;G._H=H;lastP=pt(e);G.down?.(lastP);});cv.addEventListener('pointermove',e=>{const q=pt(e);if(held)lastP=q;G.move?.(q,held);});cv.addEventListener('pointerup',e=>{held=false;G.up?.(pt(e));});
 let bsig='';const renderBtns=()=>{const b=G.done?[{t:'Tamam',a:'__ok',y:true}]:G.buttons();const s=JSON.stringify(b);if(s===bsig)return;bsig=s;btn.innerHTML=b.map((x:any)=>`<button class="${x.y?'y':''}" data-m="${x.a}">${x.t}</button>`).join('');};
 const close=(r:MGResult)=>{alive=false;removeEventListener('resize',size);ov.remove();o.onDone(r);};
 ov.addEventListener('click',e=>{const t=(e.target as HTMLElement).closest('[data-m]') as HTMLElement|null;if(!t)return;const a=t.dataset.m!;if(a==='skip')close({score:.5,skipped:true,text:'İşi ustalara bıraktın, ortalama bir iş çıktı.',found:[]});else if(a==='__ok')close({score:G.score,skipped:false,text:G.text,found:G.found||[]});else{G._W=W;G._H=H;G.act?.(a);sound.sfx('click');}});
 const loop=(now:number)=>{if(!alive)return;const dt=Math.min(.05,(now-last)/1000);last=now;G._W=W;G._H=H;G.tick?.(dt);G.draw(g,W,H,now/1000);fxDraw(g,dt);if(G.done){if(!shown){shown=true;sound.sfx(G.score>=.6?'good':'bad');for(let i=0;i<(G.score>=.8?3:G.score>=.55?2:1);i++)emit(W/2+(i-1)*44,H*.42,'spark',14);}doneT=Math.min(1,doneT+dt*3);resultCard(g,W,H,G.score,G.text,doneT);}renderBtns();requestAnimationFrame(loop);};requestAnimationFrame(loop);}
/** Bitiş kartı: yıldızlar, usta yorumu, açıklama */
function star(g:CanvasRenderingContext2D,x:number,y:number,r:number,on:boolean){g.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5;const rr=i%2?r*.45:r;g.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr);}g.closePath();g.fillStyle=on?'#f2b90f':'rgba(255,255,255,.12)';g.fill();g.strokeStyle=on?'#8a5e00':'rgba(255,255,255,.25)';g.lineWidth=1.5;g.stroke();}
function resultCard(g:CanvasRenderingContext2D,W:number,H:number,score:number,text:string,t:number){const n=score>=.8?3:score>=.55?2:1;const cw=Math.min(340,W-28),ch=176;const x=(W-cw)/2,y=H*.5-ch/2+(1-t)*30;
 g.globalAlpha=t;g.fillStyle='rgba(8,10,13,.55)';g.fillRect(0,0,W,H);g.save();g.shadowColor='rgba(0,0,0,.6)';g.shadowBlur=24;g.fillStyle='#1d2126';g.beginPath();(g as any).roundRect?(g as any).roundRect(x,y,cw,ch,14):g.rect(x,y,cw,ch);g.fill();g.restore();
 g.strokeStyle='rgba(242,185,15,.35)';g.lineWidth=1;g.beginPath();(g as any).roundRect?(g as any).roundRect(x+.5,y+.5,cw-1,ch-1,14):g.rect(x,y,cw,ch);g.stroke();
 for(let i=0;i<3;i++)star(g,W/2+(i-1)*44,y+36,i<n?17*(.8+.2*t):15,i<n);
 label(g,score>=.8?'Ustalar başını salladı':score>=.55?'İdare eder, iş görür':'Ustabaşı bir şey demedi, bakışı yetti',W/2,y+82,18,score>=.55?'#b4dfa9':'#ffb39a','center');
 g.fillStyle='rgba(255,255,255,.08)';g.fillRect(x+20,y+94,cw-40,6);g.fillStyle=score>=.55?'#76b86b':'#d6532f';g.fillRect(x+20,y+94,(cw-40)*Math.max(.03,score)*t,6);
 wrap(g,text,W/2,y+122,cw-34,14);g.globalAlpha=1;}
function wrap(g:CanvasRenderingContext2D,t:string,x:number,y:number,mw:number,lh:number){g.font='500 13px Barlow, system-ui, sans-serif';g.fillStyle='#e8e2d6';g.textAlign='center';const words=t.split(' ');let line='',yy=y;for(const w of words){const test=line?line+' '+w:w;if(g.measureText(test).width>mw&&line){g.fillText(line,x,yy);line=w;yy+=lh+2;}else line=test;}if(line)g.fillText(line,x,yy);}
/** İşçi branşından mini oyun türü */
export const tradeGame=(trade:string)=>({demir:'demir',beton:'beton',kalip:'kalip',duvar:'duvar',ince:['siva','seramik','elektrik'][Math.floor(Math.random()*3)]} as Record<string,string>)[trade]||'duvar';
/** İş kaleminden mini oyun türü */
export const itemGame=(id:string)=>({demir:'demir',korkuluk:'demir',temel:'beton',beton:'beton',kalip:'kalip',merdiven:'kalip',duvar:'duvar',siva:'siva',sap:'siva',cephe:'siva',seramik:'seramik',parke:'seramik',elektrik:'elektrik',yangin:'elektrik'} as Record<string,string>)[id]||'';
