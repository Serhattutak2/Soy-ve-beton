// Kodla üretilen malzeme dokuları: renk, pürüzlülük ve yüzey (normal) haritaları.
// Dosya indirmeden gerçekçi görünüm için her doku tuval üzerinde gürültüyle çizilir.
import * as T from 'three';

const rng=(s:number)=>()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};
function cv(n:number){const c=document.createElement('canvas');c.width=c.height=n;return[c,c.getContext('2d',{willReadFrequently:true})!] as const;}
/** Değer gürültüsü: birkaç oktav, döşenebilir */
function noise(n:number,seed:number,oct=5,base=4){const R=rng(seed);const out=new Float32Array(n*n);let amp=1,tot=0;
 for(let o=0;o<oct;o++){const g=base<<o;const grid=new Float32Array(g*g);for(let i=0;i<g*g;i++)grid[i]=R();
  for(let y=0;y<n;y++){const fy=y*g/n,iy=Math.floor(fy),ty=fy-iy,sy=ty*ty*(3-2*ty);for(let x=0;x<n;x++){const fx=x*g/n,ix=Math.floor(fx),tx=fx-ix,sx=tx*tx*(3-2*tx);
   const a=grid[(iy%g)*g+ix%g],b=grid[(iy%g)*g+(ix+1)%g],c=grid[((iy+1)%g)*g+ix%g],d=grid[((iy+1)%g)*g+(ix+1)%g];out[y*n+x]+=amp*((a*(1-sx)+b*sx)*(1-sy)+(c*(1-sx)+d*sx)*sy);}}
  tot+=amp;amp*=.5;}
 for(let i=0;i<out.length;i++)out[i]/=tot;return out;}
/** Yükseklik dizisinden normal haritası */
function normalFrom(h:Float32Array,n:number,str:number){const[c,g]=cv(n);const im=g.createImageData(n,n);
 for(let y=0;y<n;y++)for(let x=0;x<n;x++){const l=h[y*n+(x-1+n)%n],r=h[y*n+(x+1)%n],u=h[((y-1+n)%n)*n+x],d=h[((y+1)%n)*n+x];let nx=(l-r)*str,ny=(u-d)*str,nz=1;const k=1/Math.hypot(nx,ny,nz);
  const i=(y*n+x)*4;im.data[i]=(nx*k*.5+.5)*255;im.data[i+1]=(ny*k*.5+.5)*255;im.data[i+2]=(nz*k*.5+.5)*255;im.data[i+3]=255;}
 g.putImageData(im,0,0);return c;}
function grayFrom(h:Float32Array,n:number,lo:number,hi:number){const[c,g]=cv(n);const im=g.createImageData(n,n);for(let i=0;i<n*n;i++){const v=(lo+(hi-lo)*h[i])*255;im.data[i*4]=im.data[i*4+1]=im.data[i*4+2]=v;im.data[i*4+3]=255;}g.putImageData(im,0,0);return c;}
function readH(g:CanvasRenderingContext2D,n:number){const d=g.getImageData(0,0,n,n).data;const h=new Float32Array(n*n);for(let i=0;i<n*n;i++)h[i]=d[i*4]/255;return h;}
export interface Mat{map:T.Texture;normal:T.Texture;rough:T.Texture;emit?:T.Texture;}
function tex(c:HTMLCanvasElement,srgb:boolean){const t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=4;if(srgb)t.colorSpace=T.SRGBColorSpace;t.generateMipmaps=true;t.minFilter=T.LinearMipmapLinearFilter;return t;}
function pack(col:HTMLCanvasElement,h:Float32Array,n:number,ns:number,r0:number,r1:number,emit?:HTMLCanvasElement):Mat{return{map:tex(col,true),normal:tex(normalFrom(h,n,ns),false),rough:tex(grayFrom(h,n,r1,r0),false),emit:emit?tex(emit,true):undefined};}
function shade(g:CanvasRenderingContext2D,n:number,nz:Float32Array,amt:number,bias=0){const im=g.getImageData(0,0,n,n);const d=im.data;for(let i=0;i<n*n;i++){const k=1+(nz[i]-.5+bias)*amt;d[i*4]*=k;d[i*4+1]*=k;d[i*4+2]*=k;}g.putImageData(im,0,0);}

/** Apartman cephesi: 4 sütun x 4 kat. Sıva, PVC pencere, mermer denizlik, panjur, perde, lekeler. */
export function facade(seed=1,style=0):Mat{const n=512,c=128;const R=rng(seed);const[col,g]=cv(n);const[hc,hg]=cv(n);const[ec,eg]=cv(n);
 const nz=noise(n,seed+3,6,8);g.fillStyle='#f2efe8';g.fillRect(0,0,n,n);shade(g,n,nz,.16);
 hg.fillStyle='#808080';hg.fillRect(0,0,n,n);eg.fillStyle='#000';eg.fillRect(0,0,n,n);
 // kat silmeleri
 for(let y=0;y<4;y++){g.fillStyle='rgba(0,0,0,.07)';g.fillRect(0,y*c+c-6,n,6);hg.fillStyle='#9a9a9a';hg.fillRect(0,y*c+c-6,n,5);}
 for(let y=0;y<4;y++)for(let x=0;x<4;x++){const X=x*c,Y=y*c;const wide=style===1&&x%2===0;const ww=wide?84:56,wh=62,wx=X+(c-ww)/2,wy=Y+22;
  // yağmur lekesi
  const lg=g.createLinearGradient(0,wy+wh,0,wy+wh+50);lg.addColorStop(0,'rgba(70,60,50,.16)');lg.addColorStop(1,'rgba(70,60,50,0)');g.fillStyle=lg;g.fillRect(wx+6,wy+wh+4,ww-12,50);
  // pencere boşluğu
  hg.fillStyle='#2a2a2a';hg.fillRect(wx-2,wy-2,ww+4,wh+4);
  g.fillStyle='#e9e6df';g.fillRect(wx-4,wy-4,ww+8,wh+8);
  const gl=g.createLinearGradient(wx,wy,wx+ww,wy+wh);gl.addColorStop(0,'#5d7489');gl.addColorStop(.45,'#8ea6b8');gl.addColorStop(.55,'#3c4f60');gl.addColorStop(1,'#2a3846');g.fillStyle=gl;g.fillRect(wx,wy,ww,wh);
  const kind=R();if(kind<.28){const sh=wh*(.3+R()*.6);g.fillStyle='#d8d4cb';g.fillRect(wx,wy,ww,sh);g.fillStyle='rgba(0,0,0,.12)';for(let i=4;i<sh;i+=5)g.fillRect(wx,wy+i,ww,1);}
  else if(kind<.62){g.fillStyle=['#efe6cf','#d9c7a4','#c9d3d8','#e8d2c8'][Math.floor(R()*4)];g.fillRect(wx+2,wy+2,ww*.3,wh-4);g.fillRect(wx+ww*.7-2,wy+2,ww*.3,wh-4);}
  g.fillStyle='#f6f4ef';g.fillRect(wx+ww/2-2,wy,4,wh);g.fillRect(wx,wy+wh*.32,ww,3);
  // mermer denizlik
  g.fillStyle='#ece8e2';g.fillRect(wx-7,wy+wh+3,ww+14,6);g.fillStyle='rgba(0,0,0,.18)';g.fillRect(wx-7,wy+wh+9,ww+14,2);hg.fillStyle='#c8c8c8';hg.fillRect(wx-7,wy+wh+3,ww+14,6);
  // gece ışığı
  if(R()<.45){const warm=['#ffc067','#ffd28a','#ffe4b8','#cfe3ff'][Math.floor(R()*4)];eg.fillStyle=warm;eg.fillRect(wx,wy,ww,wh);if(kind>=.28&&kind<.62){eg.fillStyle='rgba(0,0,0,.45)';eg.fillRect(wx+2,wy+2,ww*.3,wh-4);eg.fillRect(wx+ww*.7-2,wy+2,ww*.3,wh-4);}}
 }
 const h=readH(hg,n);for(let i=0;i<h.length;i++)h[i]=h[i]*.85+nz[i]*.15;return pack(col,h,n,4,.92,.55,ec);}
export function brick(seed=2):Mat{const n=256;const R=rng(seed);const[col,g]=cv(n);const[hc,hg]=cv(n);const nz=noise(n,seed,5,8);
 g.fillStyle='#b9b2a3';g.fillRect(0,0,n,n);hg.fillStyle='#202020';hg.fillRect(0,0,n,n);const bh=n/8,bw=n/4;
 for(let r=0;r<8;r++){const off=r%2?bw/2:0;for(let k=-1;k<5;k++){const x=k*bw+off;const hue=[[176,82,52],[160,74,48],[188,96,62],[150,70,46]][Math.floor(R()*4)];g.fillStyle=`rgb(${hue[0]},${hue[1]},${hue[2]})`;g.fillRect(x+2,r*bh+2,bw-4,bh-4);
  // delikli tuğla deliği izi (yan yüz)
  g.fillStyle='rgba(60,25,15,.25)';for(let j=0;j<3;j++)g.fillRect(x+8+j*(bw-16)/3,r*bh+bh/2-2,(bw-16)/3-4,4);hg.fillStyle='#d0d0d0';hg.fillRect(x+2,r*bh+2,bw-4,bh-4);}}
 shade(g,n,nz,.35);const h=readH(hg,n);for(let i=0;i<h.length;i++)h[i]=h[i]*.8+nz[i]*.2;return pack(col,h,n,5,1,.8);}
export function concrete(seed=3):Mat{const n=256;const R=rng(seed);const[col,g]=cv(n);const nz=noise(n,seed,6,4);const fine=noise(n,seed+9,3,64);
 g.fillStyle='#a9a8a2';g.fillRect(0,0,n,n);shade(g,n,nz,.28);shade(g,n,fine,.12);
 // kalıp panel izleri ve tij delikleri
 g.strokeStyle='rgba(60,60,58,.35)';g.lineWidth=1.5;for(let i=0;i<=2;i++){g.beginPath();g.moveTo(0,i*n/2);g.lineTo(n,i*n/2);g.stroke();g.beginPath();g.moveTo(i*n/2,0);g.lineTo(i*n/2,n);g.stroke();}
 g.fillStyle='rgba(40,40,40,.55)';for(let i=0;i<4;i++)for(let j=0;j<4;j++){g.beginPath();g.arc(i*n/4+n/8,j*n/4+n/8,2.4,0,7);g.fill();}
 for(let i=0;i<30;i++){g.fillStyle=`rgba(50,50,48,${.2+R()*.3})`;g.beginPath();g.arc(R()*n,R()*n,.6+R()*1.5,0,7);g.fill();}
 const h=new Float32Array(n*n);for(let i=0;i<h.length;i++)h[i]=nz[i]*.6+fine[i]*.4;return pack(col,h,n,2.5,1,.85);}
export function asphalt(seed=4,worn=0):Mat{const n=256;const R=rng(seed);const[col,g]=cv(n);const nz=noise(n,seed,5,4);const fine=noise(n,seed+1,2,128);
 g.fillStyle=worn>1?'#8a7458':'#3d3f42';g.fillRect(0,0,n,n);shade(g,n,fine,.5);shade(g,n,nz,.25);
 if(worn>1){for(let i=0;i<120;i++){g.fillStyle=`rgba(${110+R()*40},${95+R()*30},${70+R()*20},.5)`;g.beginPath();g.arc(R()*n,R()*n,1+R()*3,0,7);g.fill();}}
 else{g.strokeStyle=`rgba(20,20,20,${worn?.55:.3})`;g.lineWidth=1;for(let i=0;i<(worn?14:5);i++){g.beginPath();let x=R()*n,y=R()*n;g.moveTo(x,y);for(let j=0;j<6;j++){x+=(R()-.5)*30;y+=(R()-.5)*30;g.lineTo(x,y);}g.stroke();}
  if(worn){for(let i=0;i<5;i++){g.fillStyle='rgba(30,30,30,.4)';g.beginPath();g.ellipse(R()*n,R()*n,6+R()*12,4+R()*8,R()*3,0,7);g.fill();}}}
 const h=new Float32Array(n*n);for(let i=0;i<h.length;i++)h[i]=fine[i]*.7+nz[i]*.3;return pack(col,h,n,3,1,worn>1?.95:.75);}
/** Kilitli parke taşı kaldırım (Türk usulü) */
export function paving(seed=5):Mat{const n=256;const R=rng(seed);const[col,g]=cv(n);const[hc,hg]=cv(n);const nz=noise(n,seed,4,8);
 g.fillStyle='#6d6a64';g.fillRect(0,0,n,n);hg.fillStyle='#202020';hg.fillRect(0,0,n,n);const s=n/8;
 for(let y=0;y<8;y++)for(let x=0;x<8;x++){const horiz=(x+y)%2===0;const v=150+R()*40;const red=(x*3+y*5)%11===0;g.fillStyle=red?`rgb(${v*.95},${v*.6},${v*.5})`:`rgb(${v},${v*.98},${v*.94})`;
  const bx=x*s,by=y*s;if(horiz){g.fillRect(bx+2,by+2,s-4,s/2-3);g.fillRect(bx+2,by+s/2+1,s-4,s/2-3);hg.fillStyle='#c8c8c8';hg.fillRect(bx+2,by+2,s-4,s/2-3);hg.fillRect(bx+2,by+s/2+1,s-4,s/2-3);}
  else{g.fillRect(bx+2,by+2,s/2-3,s-4);g.fillRect(bx+s/2+1,by+2,s/2-3,s-4);hg.fillStyle='#c8c8c8';hg.fillRect(bx+2,by+2,s/2-3,s-4);hg.fillRect(bx+s/2+1,by+2,s/2-3,s-4);}}
 shade(g,n,nz,.3);const h=readH(hg,n);return pack(col,h,n,4,1,.8);}
export function roofTile(seed=6):Mat{const n=256;const R=rng(seed);const[col,g]=cv(n);const[hc,hg]=cv(n);const nz=noise(n,seed,5,8);const rows=8,cols=6;
 for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){const w=n/cols,h=n/rows;const v=.85+R()*.25;const gr=g.createLinearGradient(0,y*h,0,y*h+h);gr.addColorStop(0,`rgb(${200*v},${100*v},${62*v})`);gr.addColorStop(1,`rgb(${130*v},${58*v},${36*v})`);g.fillStyle=gr;g.fillRect(x*w,y*h,w,h);
  const hh=hg.createLinearGradient(x*w,0,x*w+w,0);hh.addColorStop(0,'#404040');hh.addColorStop(.5,'#e0e0e0');hh.addColorStop(1,'#404040');hg.fillStyle=hh;hg.fillRect(x*w,y*h,w,h);}
 shade(g,n,nz,.35);const h=readH(hg,n);return pack(col,h,n,5,.95,.7);}
export function grass(seed=7,dry=0):Mat{const n=256;const R=rng(seed);const[col,g]=cv(n);const nz=noise(n,seed,6,4);const fine=noise(n,seed+4,2,128);
 const a=dry?[150,140,92]:[96,128,66];g.fillStyle=`rgb(${a[0]},${a[1]},${a[2]})`;g.fillRect(0,0,n,n);shade(g,n,nz,.45);shade(g,n,fine,.35);
 for(let i=0;i<400;i++){g.fillStyle=`rgba(${60+R()*60},${80+R()*60},${30+R()*30},.35)`;g.fillRect(R()*n,R()*n,1,2+R()*3);}
 const h=new Float32Array(n*n);for(let i=0;i<h.length;i++)h[i]=fine[i]*.6+nz[i]*.4;return pack(col,h,n,2,1,.9);}
export function dirt(seed=8):Mat{const n=256;const R=rng(seed);const[col,g]=cv(n);const nz=noise(n,seed,6,4);const fine=noise(n,seed+2,2,96);
 g.fillStyle='#8a6e4b';g.fillRect(0,0,n,n);shade(g,n,nz,.5);shade(g,n,fine,.4);for(let i=0;i<160;i++){const v=90+R()*80;g.fillStyle=`rgba(${v},${v*.85},${v*.7},.6)`;g.beginPath();g.arc(R()*n,R()*n,.8+R()*2.2,0,7);g.fill();}
 const h=new Float32Array(n*n);for(let i=0;i<h.length;i++)h[i]=fine[i]*.5+nz[i]*.5;return pack(col,h,n,4,1,.92);}
export function wood(seed=9):Mat{const n=256;const R=rng(seed);const[col,g]=cv(n);const nz=noise(n,seed,4,4);g.fillStyle='#b48a56';g.fillRect(0,0,n,n);
 for(let x=0;x<n;x+=n/6){g.fillStyle=`rgba(${120+R()*40},${80+R()*30},${40+R()*20},.5)`;g.fillRect(x,0,n/6-2,n);g.fillStyle='rgba(60,40,20,.5)';g.fillRect(x+n/6-2,0,2,n);}
 for(let i=0;i<60;i++){g.strokeStyle=`rgba(90,60,30,${.15+R()*.2})`;g.beginPath();const x=R()*n;g.moveTo(x,0);g.bezierCurveTo(x+R()*8,n/3,x-R()*8,n*2/3,x,n);g.stroke();}shade(g,n,nz,.3);
 return pack(col,nz,n,2,1,.8);}
/** Dükkân tabelaları: tek dokuda 8 tabela */
export const SIGNS=['BAKKAL','BERBER','ECZANE','KASAP','EMLAK','FIRIN','TERZİ','KIRTASİYE'];
export function signAtlas():T.Texture{const W=512,H=512;const c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d')!;const bg=['#c0392b','#1f5f8b','#2e7d4f','#8e2b2b','#d68910','#6e2c00','#34495e','#1a5276'];
 SIGNS.forEach((s,i)=>{const y=i*H/8;g.fillStyle=bg[i];g.fillRect(0,y,W,H/8);g.strokeStyle='rgba(255,255,255,.75)';g.lineWidth=3;g.strokeRect(6,y+6,W-12,H/8-12);g.fillStyle=i===2?'#ffffff':'#fff6d8';g.font='bold 40px "Barlow Condensed", "Arial Narrow", sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText(s,W/2,y+H/16+2);
  if(i===2){g.fillStyle='#e74c3c';g.fillRect(30,y+18,28,28);g.fillStyle='#fff';g.fillRect(40,y+22,8,20);g.fillRect(34,y+28,20,8);}});
 const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;t.anisotropy=4;return t;}
/** Malzemeyi dünya koordinatına göre döşer: yer, yol, kaldırım için */
export function worldUV(m:T.MeshStandardMaterial,scale:number){m.onBeforeCompile=(s)=>{s.vertexShader=s.vertexShader.replace('#include <uv_vertex>',`#include <uv_vertex>
 vec4 wp_=vec4(position,1.);
 #ifdef USE_INSTANCING
 wp_=instanceMatrix*wp_;
 #endif
 wp_=modelMatrix*wp_;vec2 wuv_=wp_.xz*${scale.toFixed(4)};
 #ifdef USE_MAP
 vMapUv=wuv_;
 #endif
 #ifdef USE_NORMALMAP
 vNormalMapUv=wuv_;
 #endif
 #ifdef USE_ROUGHNESSMAP
 vRoughnessMapUv=wuv_;
 #endif`);};m.customProgramCacheKey=()=>'wuv'+scale;return m;}
export function std(M:Mat,o:T.MeshStandardMaterialParameters={}){return new T.MeshStandardMaterial({map:M.map,normalMap:M.normal,roughnessMap:M.rough,roughness:1,...o});}
/** Giydirme cephe (cam kule): 4 sütun x 4 kat, alüminyum kayıtlar, cam tonu farkları, bazı perdeler ve gece ışıkları. */
export function curtain(seed=12):Mat{const n=256,c=64;const R=rng(seed);const[col,g]=cv(n);const[ec,eg]=cv(n);const h=new Float32Array(n*n).fill(.5);
 eg.fillStyle='#000';eg.fillRect(0,0,n,n);
 for(let fy=0;fy<4;fy++)for(let fx=0;fx<4;fx++){const x=fx*c,y=fy*c;const t=R();const base=t<.15?[70,92,110]:t<.3?[120,140,152]:[88,112,132];
  const gr=g.createLinearGradient(x,y,x+c,y+c);gr.addColorStop(0,`rgb(${base[0]+40},${base[1]+44},${base[2]+46})`);gr.addColorStop(.55,`rgb(${base[0]},${base[1]},${base[2]})`);gr.addColorStop(1,`rgb(${base[0]-20},${base[1]-18},${base[2]-14})`);g.fillStyle=gr;g.fillRect(x,y,c,c);
  if(R()<.25){g.fillStyle='rgba(225,220,205,.55)';g.fillRect(x+4,y+6,c-8,(c-16)*(.3+R()*.5));}
  g.fillStyle='rgba(255,255,255,.06)';g.beginPath();g.moveTo(x,y+c);g.lineTo(x+c*.4,y);g.lineTo(x+c*.6,y);g.lineTo(x+c*.2,y+c);g.fill();
  if(R()<.35){eg.fillStyle=R()<.5?'#ffe2a8':'#dff0ff';eg.fillRect(x+4,y+6,c-8,c-14);}
  // spandrel (kat arası opak bant)
  g.fillStyle='#3d4852';g.fillRect(x,y+c-9,c,9);}
 g.fillStyle='#c4c8cc';for(let i=0;i<=4;i++){g.fillRect(i*c-2,0,4,n);g.fillRect(0,i*c-2,n,3);}
 for(let y=0;y<n;y++)for(let x=0;x<n;x++){const m=(x%c<3||x%c>c-3||y%c<3||y%c>c-10);h[y*n+x]=m?.85:.4;}
 const P=pack(col,h,n,1.5,.75,.05);P.emit=tex(ec,true);return P;}
