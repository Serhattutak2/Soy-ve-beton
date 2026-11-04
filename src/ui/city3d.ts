// Canlı 3D şehir: her oyunda farklı yerleşim, gün döngüsü, hava, dönem değişimi, vinçler ve oyuncunun binaları.
import * as T from 'three';
export interface VM{seed:number;city:string;year:number;month:number;phase:string;surname:string;
 buildings:{id:number;slot:number;floors:number;state:string;q:string;stage:number}[];
 sites:{id:number;slot:number;floors:number;prog:number;halt:boolean;stage:number;seal:boolean}[];}
const rngF=(s:number)=>()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};
const lerp=(a:number,b:number,t:number)=>a+(b-a)*t;
const C=(h:number)=>new T.Color(h);
function winTex(){const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d')!;const e=document.createElement('canvas');e.width=e.height=128;const ge=e.getContext('2d')!;
 g.fillStyle='#fff';g.fillRect(0,0,128,128);ge.fillStyle='#000';ge.fillRect(0,0,128,128);
 for(let y=0;y<4;y++)for(let x=0;x<4;x++){g.fillStyle='#2b3a48';g.fillRect(x*32+7,y*32+7,18,17);g.fillStyle='#d9d4c5';g.fillRect(x*32+5,y*32+24,22,2);
  if(Math.random()<.42){ge.fillStyle=['#ffc56e','#ffd98f','#ffe9c0','#bfe0ff'][Math.floor(Math.random()*4)];ge.fillRect(x*32+7,y*32+7,18,17);}}
 const a=new T.CanvasTexture(c),b=new T.CanvasTexture(e);for(const t of[a,b]){t.wrapS=t.wrapT=T.RepeatWrapping;t.colorSpace=T.SRGBColorSpace;t.anisotropy=2;}return[a,b];}
function boxUV(w:number,h:number,d:number,rx:number,ry:number){const g=new T.BoxGeometry(w,h,d);g.translate(0,h/2,0);const uv=g.attributes.uv as T.BufferAttribute;for(let i=0;i<uv.count;i++){uv.setXY(i,uv.getX(i)*rx/4,uv.getY(i)*ry/4);}
 g.clearGroups();g.addGroup(0,12,0);g.addGroup(12,12,1);g.addGroup(24,12,0);return g;}
const SKY=[ // t, üst, ufuk, güneş rengi, şiddet, ortam
 [0,0x050914,0x0f1a2e,0x8fa8d8,.16,.28],[.22,0x08102a,0x1d2545,0x8fa8d8,.16,.3],[.27,0x31406f,0xf3936a,0xffa86b,.9,.5],[.34,0x4f8fd0,0xf7cf9d,0xffe2b8,1.5,.72],[.5,0x2f7fd4,0xa8d3ec,0xfff4e0,1.9,.9],[.66,0x3c7cc6,0xe9d6b0,0xffe0b4,1.6,.75],[.74,0x38335f,0xff7f50,0xff8f4e,1.05,.5],[.79,0x161a3c,0x7b3a56,0xc77b6a,.4,.34],[.86,0x050914,0x0f1a2e,0x8fa8d8,.16,.28],[1,0x050914,0x0f1a2e,0x8fa8d8,.16,.28]];
export class City{
 r:T.WebGLRenderer|null=null;sc=new T.Scene();cam=new T.PerspectiveCamera(46,1,.5,2600);clock=new T.Clock();ok=false;t=.7;vm:VM|null=null;builtFor='';yearBuilt=-1;sig='';
 sun=new T.DirectionalLight(0xffffff,1.5);amb=new T.HemisphereLight(0xbcd8ff,0x5a5040,.7);skyU:any;fogC=new T.Color();stars!:T.Points;
 dyn=new T.Group();base=new T.Group();inst:T.InstancedMesh[]=[];lots:{x:number,z:number,r:number,a:number,g:number,t:number,k:number,c:number}[]=[];pLots:{x:number,z:number}[]=[];
 winA!:T.Texture;winE!:T.Texture;mats:T.MeshStandardMaterial[]=[];cars!:T.InstancedMesh;carD:any[]=[];lights!:T.Points;clouds!:T.InstancedMesh;cloudD:any[]=[];birds!:T.InstancedMesh;
 cranes:{arm:T.Object3D,hook:T.Object3D,sp:number,ph:number,l:T.Mesh}[]=[];workers:{m:T.Object3D,a:T.Vector3,b:T.Vector3,ph:number}[]=[];rain!:T.Points;rainKind=0;water:any=null;smoke:{m:T.Mesh,o:T.Vector3,ph:number}[]=[];fw:{p:T.Points,life:number,v:Float32Array}[]=[];
 shake=0;shot=0;shotT=38;yaw=0;yawV=0;zoom=1;ptr=new Map<number,{x:number,y:number}>();pinch=0;pos=new T.Vector3(60,40,60);look=new T.Vector3();tgt=new T.Vector3();focusUntil=0;gnd!:T.Mesh;time=0;
 constructor(public cv:HTMLCanvasElement){try{this.r=new T.WebGLRenderer({canvas:cv,antialias:devicePixelRatio<2,powerPreference:'high-performance'});this.ok=true;}catch{this.ok=false;return;}
  const r=this.r;r.setPixelRatio(Math.min(devicePixelRatio,1.75));r.outputColorSpace=T.SRGBColorSpace;r.toneMapping=T.ACESFilmicToneMapping;r.toneMappingExposure=1.3;r.shadowMap.enabled=true;r.shadowMap.type=T.PCFSoftShadowMap;
  const s=this.sc;s.fog=new T.Fog(0x8899aa,180,760);s.add(this.amb,this.sun,this.sun.target,this.base,this.dyn);this.sun.castShadow=true;this.sun.shadow.mapSize.set(1536,1536);const sc=this.sun.shadow.camera;sc.left=sc.bottom=-170;sc.right=sc.top=170;sc.far=800;this.sun.shadow.bias=-.0006;this.sun.shadow.normalBias=.5;
  [this.winA,this.winE]=winTex();this.sky();this.resize();addEventListener('resize',()=>this.resize());this.input();const loop=()=>{requestAnimationFrame(loop);this.frame();};loop();}
 resize(){if(!this.r)return;const w=innerWidth,h=innerHeight;this.r.setSize(w,h,false);this.cam.aspect=w/h;this.cam.fov=w<h?58:44;this.cam.updateProjectionMatrix();}
 input(){const c=this.cv;c.style.touchAction='none';const dist=()=>{const a=[...this.ptr.values()];return a.length<2?0:Math.hypot(a[0].x-a[1].x,a[0].y-a[1].y);};
  c.addEventListener('pointerdown',e=>{this.ptr.set(e.pointerId,{x:e.clientX,y:e.clientY});this.pinch=dist();});
  c.addEventListener('pointermove',e=>{const p=this.ptr.get(e.pointerId);if(!p)return;if(this.ptr.size===1){this.yawV=(e.clientX-p.x)*.0012;this.yaw+=(e.clientX-p.x)*.006;}p.x=e.clientX;p.y=e.clientY;if(this.ptr.size===2){const d=dist();if(this.pinch)this.zoom=T.MathUtils.clamp(this.zoom*this.pinch/d,.45,2);this.pinch=d;}});
  const up=(e:PointerEvent)=>{this.ptr.delete(e.pointerId);this.pinch=0;};c.addEventListener('pointerup',up);c.addEventListener('pointercancel',up);c.addEventListener('wheel',e=>{this.zoom=T.MathUtils.clamp(this.zoom*(1+e.deltaY*.001),.45,2);},{passive:true});}
 sky(){const u={top:{value:C(0x2f7fd4)},hor:{value:C(0xa8d3ec)},sunC:{value:C(0xffffff)},sunD:{value:new T.Vector3(0,1,0)},cloudy:{value:0}};this.skyU=u;
  const m=new T.ShaderMaterial({side:T.BackSide,depthWrite:false,fog:false,uniforms:u,vertexShader:'varying vec3 v;void main(){v=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
   fragmentShader:`varying vec3 v;uniform vec3 top,hor,sunC,sunD;uniform float cloudy;void main(){float h=clamp(v.y*1.25,0.,1.);vec3 c=mix(hor,top,pow(h,.55));float d=max(dot(normalize(v),sunD),0.);c+=sunC*(pow(d,700.)*2.5+pow(d,24.)*.28+pow(d,5.)*.12*(1.-h));c=mix(c,vec3(dot(c,vec3(.33)))*.85,cloudy);gl_FragColor=vec4(c,1.);}`});
  const sp=new T.Mesh(new T.SphereGeometry(1800,24,16),m);sp.frustumCulled=false;this.sc.add(sp);
  const g=new T.BufferGeometry();const a=new Float32Array(1500*3);for(let i=0;i<1500;i++){const th=Math.random()*6.28,y=Math.random()*.9+.08,ra=Math.sqrt(1-y*y);a.set([Math.cos(th)*ra*1500,y*1500,Math.sin(th)*ra*1500],i*3);}g.setAttribute('position',new T.BufferAttribute(a,3));
  this.stars=new T.Points(g,new T.PointsMaterial({color:0xffffff,size:2.4,sizeAttenuation:false,transparent:true,opacity:0,fog:false,depthWrite:false}));this.sc.add(this.stars);
  const cg=new T.IcosahedronGeometry(1,1);this.clouds=new T.InstancedMesh(cg,new T.MeshLambertMaterial({color:0xffffff,flatShading:true,transparent:true,opacity:.92,fog:false}),96);this.clouds.frustumCulled=false;this.sc.add(this.clouds);
  const bg=new T.ConeGeometry(.5,2,3);bg.rotateX(Math.PI/2);this.birds=new T.InstancedMesh(bg,new T.MeshBasicMaterial({color:0x1b1f27}),14);this.birds.frustumCulled=false;this.sc.add(this.birds);}
 setup(vm:VM){const key=vm.seed+vm.city;if(this.builtFor===key)return;this.builtFor=key;const R=rngF(vm.seed);this.base.clear();this.lots=[];this.pLots=[];this.yearBuilt=-1;this.water=null;this.smoke=[];this.yaw=R()*6.28;this.t=[.27,.5,.72,.77,.3][Math.floor(R()*5)];
  // Bulutlar her oyunda başka
  this.cloudD=[];const M=new T.Matrix4();for(let i=0;i<96;i+=6){const cx=(R()-.5)*1700,cz=(R()-.5)*1700,cy=220+R()*180,s=30+R()*60;for(let j=0;j<6;j++)this.cloudD.push({x:cx+(R()-.5)*s*2.4,y:cy+(R()-.5)*s*.4,z:cz+(R()-.5)*s*1.4,s:s*(.5+R()*.7),v:2+R()*3});}
  // Zemin
  const size=2600;const gg=new T.PlaneGeometry(size,size,1,1);gg.rotateX(-Math.PI/2);this.gnd=new T.Mesh(gg,new T.MeshStandardMaterial({color:0x8a8a5c,roughness:1}));this.gnd.receiveShadow=true;this.base.add(this.gnd);
  const city=vm.city;const seaX=city==='sahil'?150:1e9;const N=9,B=30;const rx:number[]=[];
  // Yollar
  const road=new T.MeshStandardMaterial({color:0x54575c,roughness:.95});const rg=new T.BoxGeometry(1,.12,1);const rows=(2*N+1)*2;const ri=new T.InstancedMesh(rg,road,rows);let k=0;const m=new T.Matrix4();const len=N*2*B+8;
  for(let i=-N;i<=N;i++){const p=i*B+B/2;const w=(i%3===0)?7:4.6;m.makeScale(Math.min(len,seaX+len/2),1,w);m.setPosition(city==='sahil'?(seaX-len/2)/2:0,.1,p);ri.setMatrixAt(k++,m);m.makeScale(w,1,len);m.setPosition(p,.1,0);if(p<seaX){ri.setMatrixAt(k++,m);}else{m.makeScale(0,0,0);ri.setMatrixAt(k++,m);}rx.push(p);}
  ri.count=k;ri.receiveShadow=true;this.base.add(ri);
  // Dağlar
  const mm=new T.MeshStandardMaterial({color:city==='fay'?0x5b5a55:0x5f7058,flatShading:true,roughness:1});const mc=city==='fay'?34:16;const mg=new T.ConeGeometry(1,1,6,2);const mi=new T.InstancedMesh(mg,mm,mc);
  for(let i=0;i<mc;i++){const a=city==='sahil'?(Math.PI*.55+R()*Math.PI*.9):city==='fay'?(Math.PI*.7+R()*.9):R()*6.28;const d=(city==='fay'?430:560)+R()*280;const h=(city==='fay'?190:90)+R()*(city==='fay'?260:130),w=100+R()*170;m.compose(new T.Vector3(Math.cos(a)*d,h/2-2,Math.sin(a)*d),new T.Quaternion().setFromEuler(new T.Euler(0,R()*3,0)),new T.Vector3(w,h,w));mi.setMatrixAt(i,m);}this.base.add(mi);
  if(city==='fay'){// fay yarığı
   const fg=new T.PlaneGeometry(500,5);fg.rotateX(-Math.PI/2);const f=new T.Mesh(fg,new T.MeshBasicMaterial({color:0x2b241f}));f.position.set(-260,.25,-160);f.rotation.y=.8;this.base.add(f);}
  if(city==='sahil'){const u={t:{value:0},col:{value:C(0x1f6f8f)},sky:{value:C(0xaaccdd)},sun:{value:C(0xffffff)},sd:{value:new T.Vector3()},fogc:{value:new T.Color()}};this.water=u;const wg=new T.PlaneGeometry(1300,2600,110,80);wg.rotateX(-Math.PI/2);
   const wm=new T.ShaderMaterial({uniforms:u,vertexShader:'uniform float t;varying vec3 w;varying float h;void main(){vec3 p=position;h=sin(p.x*.05+t)*.35+sin(p.z*.07+t*1.3)*.28+sin((p.x+p.z)*.13+t*2.)*.14;p.y+=h;w=(modelMatrix*vec4(p,1.)).xyz;gl_Position=projectionMatrix*viewMatrix*vec4(w,1.);}',
   fragmentShader:'uniform vec3 col,sky,sun,sd,fogc;varying vec3 w;varying float h;void main(){vec3 n=normalize(vec3(cos(w.x*.05)*.1+sin(w.z*.3+w.x*.2)*.05,1.,cos(w.z*.07)*.1+sin(w.x*.33)*.05));vec3 v=normalize(cameraPosition-w);float f=pow(1.-max(dot(n,v),0.),3.);vec3 c=mix(col+h*.02,sky,f*.55);c+=sun*pow(max(dot(reflect(-sd,n),v),0.),90.)*1.6;float dd=length(cameraPosition-w);c=mix(c,fogc,smoothstep(300.,1100.,dd));gl_FragColor=vec4(c,1.);}'});
   const wa=new T.Mesh(wg,wm);wa.position.set(seaX+650,-.2,0);this.base.add(wa);
   const be=new T.Mesh(new T.PlaneGeometry(40,2600).rotateX(-Math.PI/2),new T.MeshStandardMaterial({color:0xd9c79a,roughness:1}));be.position.set(seaX+6,.15,0);this.base.add(be);}
  if(city==='sanayi'){// Fabrikalar
   const fm=new T.MeshStandardMaterial({color:0x6b4d3d,roughness:1});const sm=new T.MeshStandardMaterial({color:0x8d8378,roughness:1});const pg=new T.CylinderGeometry(.9,1.4,1,8);pg.translate(0,.5,0);
   for(let i=0;i<7;i++){const x=-250-R()*70,z=-160+i*50+R()*20;const b=new T.Mesh(new T.BoxGeometry(46,12+R()*8,28),fm);b.position.set(x,8,z);b.castShadow=true;this.base.add(b);const h=38+R()*30;const ch=new T.Mesh(pg,sm);ch.scale.set(2,h,2);ch.position.set(x+14,0,z+6);ch.castShadow=true;this.base.add(ch);for(let j=0;j<6;j++){const pm=new T.Mesh(new T.IcosahedronGeometry(1,0),new T.MeshLambertMaterial({color:0xb7b0a6,transparent:true,opacity:.55}));this.base.add(pm);this.smoke.push({m:pm,o:new T.Vector3(x+14,h,z+6),ph:R()*6.28});}}}
  // Parseller
  for(let i=-N+1;i<N;i++)for(let j=-N+1;j<N;j++){const bx=i*B,bz=j*B;for(const[ox,oz]of[[-6.4,-6.4],[6.4,-6.4],[-6.4,6.4],[6.4,6.4]]){const x=bx+ox+(R()-.5),z=bz+oz+(R()-.5);if(x>seaX-8)continue;const r=Math.hypot(x,z);this.lots.push({x,z,r,a:1955+r*.16+R()*18,g:1980+r*.14+R()*32,t:2012+r*.12+R()*55+(R()<.65?120:0),k:R(),c:Math.floor(R()*7)});}}
  this.lots.sort((a,b)=>a.r-b.r);
  // Oyuncu binaları için merkeze yakın ayrılmış parseller
  const res=this.lots.filter((_,i)=>i%3===0&&i>2).slice(0,90);this.pLots=res.map(l=>({x:l.x,z:l.z}));const rs=new Set(res);this.lots=this.lots.filter(l=>!rs.has(l));
  // Ağaçlar
  const tg=new T.IcosahedronGeometry(1,0);const ti=new T.InstancedMesh(tg,new T.MeshLambertMaterial({color:0x54743f,flatShading:true}),420);for(let i=0;i<420;i++){const a=R()*6.28,d=30+R()*480;const x=Math.cos(a)*d,z=Math.sin(a)*d;if(x>seaX-6){m.makeScale(0,0,0);ti.setMatrixAt(i,m);continue;}const s=1.3+R()*2.4;m.compose(new T.Vector3(Math.round(x/B)*B+B/2+ (R()-.5)*4,s*1.1,z),new T.Quaternion(),new T.Vector3(s,s*1.3,s));ti.setMatrixAt(i,m);}ti.castShadow=true;this.base.add(ti);
  // Trafik
  const cg=new T.BoxGeometry(1.7,1,3.4);cg.translate(0,.7,0);this.cars=new T.InstancedMesh(cg,new T.MeshStandardMaterial({color:0xffffff,roughness:.45,metalness:.3}),70);this.cars.frustumCulled=false;this.base.add(this.cars);this.carD=[];const pal=[0xd8d4cc,0xb33a2e,0x2d4a6e,0x2c2c2e,0xd5a21c,0x7e8a91];for(let i=0;i<70;i++){const hz=R()<.5;const road=rx[Math.floor(R()*rx.length)];this.carD.push({hz,road,p:(R()-.5)*len,v:(R()<.5?1:-1)*(8+R()*9),off:(R()<.5?1:-1)*1.1});this.cars.setColorAt(i,C(pal[i%6]));}
  const lg=new T.BufferGeometry();lg.setAttribute('position',new T.BufferAttribute(new Float32Array(70*3),3));this.lights=new T.Points(lg,new T.PointsMaterial({color:0xfff2b0,size:1.6,transparent:true,opacity:0,depthWrite:false,blending:T.AdditiveBlending}));this.lights.frustumCulled=false;this.base.add(this.lights);
  // Yağmur, kar
  const rg2=new T.BufferGeometry();const ra=new Float32Array(1400*3);for(let i=0;i<ra.length;i++)ra[i]=(Math.random()-.5)*220;rg2.setAttribute('position',new T.BufferAttribute(ra,3));this.rain=new T.Points(rg2,new T.PointsMaterial({color:0xbfd4ee,size:.5,transparent:true,opacity:.65,depthWrite:false}));this.rain.frustumCulled=false;this.rain.visible=false;this.base.add(this.rain);}
 cityLayer(y:number){if(this.yearBuilt===y)return;this.yearBuilt=y;for(const i of this.inst){this.base.remove(i);i.dispose();}this.inst=[];
  const m=new T.Matrix4(),q=new T.Quaternion(),v=new T.Vector3(),s=new T.Vector3();const R=rngF(this.vm!.seed+7);
  const groups={kon:[] as any[],apt3:[] as any[],apt6:[] as any[],apt10:[] as any[],tow:[] as any[]};
  for(const l of this.lots){if(y<l.a)continue;if(y<l.g)groups.kon.push(l);else if(y<l.t){const f=2+Math.floor((1-Math.min(1,l.r/260))*5*l.k+l.k*3);(f<=4?groups.apt3:f<=8?groups.apt6:groups.apt10).push(l);}else groups.tow.push(l);}
  const apt=[0xe5d9c3,0xd9c9a8,0xc8cfd1,0xe0c2a2,0xb6a999,0xd6b5a2,0xcdd6c6],gl=[0x7d95a6,0x8fa2ab,0x6b7f92,0xa4a7a6];
  const side=new T.MeshStandardMaterial({map:this.winA,emissiveMap:this.winE,emissive:0xffffff,emissiveIntensity:0,roughness:.85});const roof=new T.MeshStandardMaterial({color:0x9a948a,roughness:1});this.mats=[side];
  const add=(g:T.BufferGeometry,mat:any,list:any[],fn:(l:any,s:T.Vector3)=>void,col:(l:any)=>number)=>{if(!list.length)return;const im=new T.InstancedMesh(g,mat,list.length);list.forEach((l,i)=>{fn(l,s);m.compose(v.set(l.x,0,l.z),q.setFromEuler(new T.Euler(0,Math.round(l.k*4)*Math.PI/2,0)),s);im.setMatrixAt(i,m);im.setColorAt(i,C(col(l)));});im.castShadow=true;im.receiveShadow=true;this.base.add(im);this.inst.push(im);return im;};
  add(new T.BoxGeometry(1,1,1).translate(0,.5,0),new T.MeshStandardMaterial({color:0xffffff,roughness:1}),groups.kon,(l,s)=>s.set(5+l.k*3,2.8,5+l.k*2),(l)=>[0xcfc4ad,0xbdb49d,0xd4c7a3,0xa8a08c][l.c%4]);
  add(new T.ConeGeometry(.78,1,4).rotateY(Math.PI/4).translate(0,.5,0),new T.MeshStandardMaterial({color:0xffffff,flatShading:true}),groups.kon,(l,s)=>s.set(5.6+l.k*3,1.5,5.6+l.k*2),()=>0xa8522f);
  // çatılar konutta yükseğe taşınır
  if(groups.kon.length){const im=this.inst[this.inst.length-1];groups.kon.forEach((l,i)=>{m.compose(v.set(l.x,2.8,l.z),q.identity(),s.set(5.8+l.k*3,1.6,5.8+l.k*2));im.setMatrixAt(i,m);});}
  const hs=[[3,10,3],[6,19,5],[11,35,5]];[groups.apt3,groups.apt6,groups.apt10].forEach((g,gi)=>{add(boxUV(1,1,1,hs[gi][2],hs[gi][0]),[side,roof],g,(l,s)=>s.set(9+l.k*3,hs[gi][1],9+l.k*2),(l)=>apt[l.c]);});
  add(boxUV(1,1,1,8,26),[side,roof],groups.tow,(l,s)=>s.set(11,62+l.k*42,11),(l)=>gl[l.c%4]);void R;}
 own(){const vm=this.vm!;const sig=JSON.stringify([vm.buildings,vm.sites.map(s=>[s.id,Math.floor(s.prog*16),s.halt,s.seal])]);if(sig===this.sig)return;this.sig=sig;this.dyn.clear();this.cranes=[];this.workers=[];
  const conc=new T.MeshStandardMaterial({color:0x9aa0a2,roughness:1});const iron=new T.MeshStandardMaterial({color:0xe8a800,roughness:.6,metalness:.3});const side=this.mats[0]||new T.MeshStandardMaterial({map:this.winA});
  const place=(slot:number)=>this.pLots[slot%this.pLots.length];
  const foot=(fl:number,st:number)=>st>=20?18:fl>=18?14:fl>=8?11.5:9.5;
  for(const b of vm.buildings){const p=place(b.slot);const f=b.floors;if(f<=0)continue;const fp=foot(f,b.stage);const h=f*3.1;const g=new T.Group();g.position.set(p.x,0,p.z);
   if(b.state==='yikik'){for(let i=0;i<46;i++){const r=new T.Mesh(new T.BoxGeometry(.8+Math.random()*2.2,.5+Math.random()*1.3,.8+Math.random()*2.2),conc);r.position.set((Math.random()-.5)*fp*1.1,Math.random()*2.6,(Math.random()-.5)*fp*1.1);r.rotation.set(Math.random()*3,Math.random()*3,Math.random()*3);g.add(r);}
    const t=new T.Mesh(new T.ConeGeometry(2.4,2.2,4),new T.MeshStandardMaterial({color:0xcfe0ee}));t.position.set(fp*.9,1.1,fp*.2);g.add(t);this.dyn.add(g);continue;}
   const col=b.q==='sag'?0xe7e2d6:b.q==='kis'?0xc9bca3:0xdad1be;const mat=[new T.MeshStandardMaterial({color:b.state==='hasar'?0x8c8378:col,map:this.winA,emissiveMap:this.winE,emissive:0xffffff,emissiveIntensity:side.emissiveIntensity,roughness:.75}),new T.MeshStandardMaterial({color:0x8c867c})];this.mats.push(mat[0]);
   const bd=new T.Mesh(boxUV(fp,h,fp,Math.ceil(fp/2.4),f),mat);bd.castShadow=true;bd.receiveShadow=true;if(b.state==='hasar')bd.rotation.z=.018;g.add(bd);
   // tabela
   const sg=new T.Mesh(new T.BoxGeometry(fp*.7,1.5,.25),new T.MeshStandardMaterial({color:0xf2b90f,emissive:0xf2b90f,emissiveIntensity:.5}));sg.position.set(0,h+1.1,0);g.add(sg);this.dyn.add(g);}
  for(const s of vm.sites){const p=place(s.slot);const f=s.floors;const g=new T.Group();g.position.set(p.x,0,p.z);if(f<=0){const pile=new T.Mesh(new T.ConeGeometry(2.6,2,6),new T.MeshStandardMaterial({color:0xa9875c,flatShading:true}));pile.position.set(0,1,0);g.add(pile);const ms=new T.Mesh(new T.BoxGeometry(5,3,3),iron);ms.position.set(-2.5,1.5,2);ms.castShadow=true;g.add(ms);this.dyn.add(g);continue;}
   const fp=foot(f,s.stage);const done=Math.floor(s.prog*f);const skel=Math.min(f,Math.ceil(s.prog*f*1.3));const fh=3.1;
   const pit=new T.Mesh(new T.BoxGeometry(fp+6,.2,fp+6),new T.MeshStandardMaterial({color:0x6e5a3e,roughness:1}));pit.position.y=.15;g.add(pit);
   if(done>0){const mt=[new T.MeshStandardMaterial({color:0xcfc8b8,map:this.winA,roughness:.9}),conc];const bd=new T.Mesh(boxUV(fp,done*fh,fp,Math.ceil(fp/2.4),done),mt);bd.castShadow=true;g.add(bd);}
   const cg=new T.BoxGeometry(.55,fh,.55);const sl=new T.BoxGeometry(fp,.32,fp);for(let i=done;i<skel;i++){const y=i*fh;const sb=new T.Mesh(sl,conc);sb.position.y=y+fh;sb.castShadow=true;g.add(sb);for(const[a,b]of[[-1,-1],[1,-1],[-1,1],[1,1],[0,-1],[0,1],[-1,0],[1,0]]){const c=new T.Mesh(cg,conc);c.position.set(a*(fp/2-.4),y+fh/2,b*(fp/2-.4));g.add(c);}}
   // iskele
   const scm=new T.MeshBasicMaterial({color:0x8a6a2b,wireframe:true});const sc=new T.Mesh(new T.BoxGeometry(fp+1.5,Math.max(1,skel)*fh+1,fp+1.5,3,Math.max(1,skel),3).translate(0,(Math.max(1,skel)*fh+1)/2,0),scm);g.add(sc);
   // vinç
   const H=Math.max(18,f*fh+12);const mast=new T.Mesh(new T.BoxGeometry(.9,H,.9),iron);mast.position.set(fp/2+3,H/2,fp/2+3);mast.castShadow=true;g.add(mast);const pivot=new T.Group();pivot.position.set(fp/2+3,H,fp/2+3);g.add(pivot);const L=Math.max(24,fp*2.2);const arm=new T.Mesh(new T.BoxGeometry(L,.7,.7),iron);arm.position.x=-L*.36;arm.castShadow=true;pivot.add(arm);const cw=new T.Mesh(new T.BoxGeometry(3,1.6,1.6),conc);cw.position.x=L*.16;pivot.add(cw);
   const hook=new T.Mesh(new T.BoxGeometry(1.5,1.1,1.5),conc);hook.position.set(-L*.55,-H*.42,0);pivot.add(hook);const wire=new T.Mesh(new T.BoxGeometry(.08,H*.42,.08),new T.MeshBasicMaterial({color:0x222222}));wire.position.set(-L*.55,-H*.21,0);pivot.add(wire);
   const lamp=new T.Mesh(new T.SphereGeometry(.45,6,6),new T.MeshBasicMaterial({color:0xff2a20}));lamp.position.set(-L*.86,.7,0);pivot.add(lamp);this.cranes.push({arm:pivot,hook,sp:s.halt?0:.12+Math.random()*.18,ph:Math.random()*6,l:lamp});
   // işçiler
   if(!s.halt)for(let i=0;i<6;i++){const wk=new T.Mesh(new T.CapsuleGeometry(.28,.8,2,6),new T.MeshStandardMaterial({color:i%2?0xf4a300:0x27507a}));const a=new T.Vector3((Math.random()-.5)*(fp+4),.8,fp/2+2),b=new T.Vector3((Math.random()-.5)*(fp+4),.8,-fp/2-2);g.add(wk);this.workers.push({m:wk,a,b,ph:Math.random()*6});}
   if(s.seal){const band=new T.Mesh(new T.BoxGeometry(fp+6.5,1.3,fp+6.5),new T.MeshBasicMaterial({color:0xc4271b,wireframe:true}));band.position.y=.7;g.add(band);}
   this.dyn.add(g);}}
 sites(){return this.vm?this.vm.sites.filter(s=>s.floors>0).map(s=>this.pLots[s.slot%this.pLots.length]):[];}
 quake(sev:number){this.shake=Math.max(this.shake,sev*2.4);}
 focus(slot:number){const p=this.pLots[slot%this.pLots.length];if(p){this.tgt.set(p.x,8,p.z);this.focusUntil=performance.now()+9000;}}
 update(vm:VM){if(!this.ok)return;this.vm=vm;this.setup(vm);this.cityLayer(vm.year);this.own();const m=this.gnd.material as T.MeshStandardMaterial;const mo=vm.month;const snow=mo===0||mo===1||mo===11;const fall=mo>=8&&mo<=10;m.color.setHex(snow&&vm.city!=='sahil'?0xe6ebee:fall?0xa98f58:mo>=5&&mo<8?0xb3ab70:0x86a05a);
  this.rainKind=(snow&&vm.city!=='sahil'&&(vm.seed+vm.year+mo)%3===0)?2:(fall||mo===3)&&(vm.seed+vm.year+mo)%3===0?1:0;
  if(mo===9&&(vm.year+vm.seed)%2===0&&Math.random()<.5)this.firework();}
 firework(){if(!this.ok)return;const n=90,g=new T.BufferGeometry(),a=new Float32Array(n*3),v=new Float32Array(n*3);const cx=(Math.random()-.5)*160,cz=(Math.random()-.5)*160,cy=70+Math.random()*50;for(let i=0;i<n;i++){a.set([cx,cy,cz],i*3);const th=Math.random()*6.28,ph=Math.random()*3.14,sp=10+Math.random()*16;v.set([Math.sin(ph)*Math.cos(th)*sp,Math.cos(ph)*sp,Math.sin(ph)*Math.sin(th)*sp],i*3);}g.setAttribute('position',new T.BufferAttribute(a,3));const p=new T.Points(g,new T.PointsMaterial({color:[0xff4a3a,0xf2b90f,0x7ad1ff,0xffffff][Math.floor(Math.random()*4)],size:1.8,transparent:true,depthWrite:false,blending:T.AdditiveBlending}));this.sc.add(p);this.fw.push({p,life:2.2,v});}
 skyAt(t:number){let i=0;while(i<SKY.length-2&&t>SKY[i+1][0])i++;const a=SKY[i],b=SKY[i+1];const f=(t-a[0])/(b[0]-a[0]||1);return{top:C(a[1]).lerp(C(b[1]),f),hor:C(a[2]).lerp(C(b[2]),f),sun:C(a[3]).lerp(C(b[3]),f),si:lerp(a[4],b[4],f),am:lerp(a[5],b[5],f)};}
 frame(){if(!this.ok||!this.vm||!this.r)return;const dt=Math.min(.05,this.clock.getDelta());this.time+=dt;const tm=this.time;this.t=(this.t+dt/360)%1;
  const s=this.skyAt(this.t);const ang=(this.t-.25)*Math.PI*2;const dir=new T.Vector3(Math.cos(ang)*.85,Math.sin(ang),.42).normalize();const night=T.MathUtils.smoothstep(-dir.y,-.02,.18);const lightDir=dir.y>0?dir:new T.Vector3(-dir.x,-dir.y,dir.z);
  const crisis=this.vm.phase==='kriz';const cl=this.rainKind?.6:crisis?.22:0;
  const u=this.skyU;u.top.value.copy(s.top);u.hor.value.copy(s.hor);u.sunC.value.copy(s.sun);u.sunD.value.copy(dir);u.cloudy.value=cl;this.fogC.copy(s.hor).lerp(new T.Color(.55,.55,.57),cl);(this.sc.fog as T.Fog).color.copy(this.fogC);(this.sc.fog as T.Fog).near=this.rainKind?90:180;(this.sc.fog as T.Fog).far=this.rainKind?430:820;
  this.sun.position.copy(lightDir).multiplyScalar(300);this.sun.color.copy(s.sun);this.sun.intensity=s.si*(1-cl*.6)*1.5;this.amb.intensity=s.am*1.7+.25;this.amb.color.copy(s.top).lerp(C(0xffffff),.55);(this.stars.material as T.PointsMaterial).opacity=night*(1-cl);
  for(const m of this.mats)m.emissiveIntensity=night*1.4+.02;
  // bulutlar
  const M=new T.Matrix4(),Q=new T.Quaternion(),P=new T.Vector3(),SC=new T.Vector3();this.cloudD.forEach((c,i)=>{c.x+=c.v*dt*(this.rainKind?2:1);if(c.x>950)c.x=-950;M.compose(P.set(c.x,c.y,c.z),Q.identity(),SC.set(c.s*1.5,c.s*.5,c.s));this.clouds.setMatrixAt(i,M);});this.clouds.instanceMatrix.needsUpdate=true;(this.clouds.material as T.MeshLambertMaterial).color.copy(s.sun).lerp(C(0xffffff),.5).multiplyScalar(.5+s.am*.6);
  // kuşlar
  const bc=new T.Vector3(Math.cos(tm*.05)*220,70+Math.sin(tm*.2)*10,Math.sin(tm*.05)*220);for(let i=0;i<14;i++){const rw=Math.ceil(i/2);const sd=i%2?1:-1;M.compose(P.set(bc.x+sd*rw*3,bc.y+Math.sin(tm*6+i)*.5,bc.z-rw*3),Q.setFromEuler(new T.Euler(0,-tm*.05,0)),SC.set(1,.4+Math.abs(Math.sin(tm*8+i))*.3,1));this.birds.setMatrixAt(i,M);}this.birds.instanceMatrix.needsUpdate=true;
  // trafik
  const yr=this.vm.year;const cnt=Math.floor(T.MathUtils.clamp((yr-1965)*1.2,6,70));this.cars.count=cnt;const lp=this.lights.geometry.attributes.position as T.BufferAttribute;for(let i=0;i<cnt;i++){const c=this.carD[i];c.p+=c.v*dt*(crisis?.7:1);if(c.p>270)c.p=-270;if(c.p<-270)c.p=270;const r=c.road+c.off;if(c.hz){M.compose(P.set(c.p,0,r),Q.setFromEuler(new T.Euler(0,c.v>0?Math.PI/2:-Math.PI/2,0)),SC.set(1,1,1));lp.setXYZ(i,c.p+Math.sign(c.v)*2,1,r);}else{M.compose(P.set(r,0,c.p),Q.setFromEuler(new T.Euler(0,c.v>0?0:Math.PI,0)),SC.set(1,1,1));lp.setXYZ(i,r,1,c.p+Math.sign(c.v)*2);}this.cars.setMatrixAt(i,M);}this.cars.instanceMatrix.needsUpdate=true;lp.needsUpdate=true;this.lights.geometry.setDrawRange(0,cnt);(this.lights.material as T.PointsMaterial).opacity=night;
  // vinç ve işçiler
  for(const c of this.cranes){c.arm.rotation.y=Math.sin(tm*c.sp+c.ph)*2.2;c.hook.position.y=(c.hook.position.y)+Math.sin(tm*.5+c.ph)*.01;c.l.visible=Math.sin(tm*4+c.ph)>0&&night>.2;}
  for(const w of this.workers){const f=(Math.sin(tm*.22+w.ph)+1)/2;w.m.position.lerpVectors(w.a,w.b,f);}
  for(const m of this.smoke){const f=((tm*.09+m.ph)%1);m.m.position.set(m.o.x+f*18,m.o.y+f*34,m.o.z+f*6);m.m.scale.setScalar(1.5+f*7);(m.m.material as T.MeshLambertMaterial).opacity=.55*(1-f);}
  if(this.water){const u=this.water;u.t.value=tm*.8;u.sky.value.copy(s.hor);u.sun.value.copy(s.sun);u.sd.value.copy(lightDir);u.fogc.value.copy(this.fogC);u.col.value.setHex(night>.5?0x0c2333:0x1d6d8d);}
  // yağış
  this.rain.visible=this.rainKind>0;if(this.rain.visible){const rm=this.rain.material as T.PointsMaterial;rm.size=this.rainKind===2?.8:.42;rm.color.setHex(this.rainKind===2?0xffffff:0xb8cce4);const a=this.rain.geometry.attributes.position as T.BufferAttribute;const v=this.rainKind===2?12:70;for(let i=0;i<a.count;i++){let y=a.getY(i)-v*dt;if(y<-110)y=110;a.setY(i,y);if(this.rainKind===2)a.setX(i,a.getX(i)+Math.sin(tm+i)*dt*2);}a.needsUpdate=true;this.rain.position.set(this.pos.x*.7,60,this.pos.z*.7);}
  // havai fişek
  for(let i=this.fw.length-1;i>=0;i--){const f=this.fw[i];f.life-=dt;const a=f.p.geometry.attributes.position as T.BufferAttribute;for(let j=0;j<a.count;j++){a.setXYZ(j,a.getX(j)+f.v[j*3]*dt,a.getY(j)+f.v[j*3+1]*dt,a.getZ(j)+f.v[j*3+2]*dt);f.v[j*3+1]-=6*dt;}a.needsUpdate=true;(f.p.material as T.PointsMaterial).opacity=Math.max(0,f.life/2.2);if(f.life<=0){this.sc.remove(f.p);f.p.geometry.dispose();this.fw.splice(i,1);}}
  // Kamera: 4 sinematik plan arasında gezer
  this.shotT-=dt;if(this.shotT<=0){this.shot=(this.shot+1)%4;this.shotT=38;}const sites=this.sites();const focus=performance.now()<this.focusUntil;const shots=[[255,30,40],[200,105,8],[105,60,10],[240,46,30]];const[sr,sh,ly]=focus?[62,30,8]:shots[this.shot];
  if(!focus){if(sites.length&&this.shot===2){const q=sites[Math.floor(tm/76)%sites.length];this.tgt.set(q.x,ly,q.z);}else this.tgt.set(0,ly,0);}
  this.yaw+=(this.ptr.size?0:.012+this.yawV)*dt*3;this.yawV*=.95;
  const mob=innerWidth<innerHeight?1.25:1;const R=sr*this.zoom*mob,H=sh*this.zoom*mob;const px=this.tgt.x+Math.cos(this.yaw)*R,pz=this.tgt.z+Math.sin(this.yaw)*R;let py=this.tgt.y+H+Math.sin(tm*.12)*3;for(const l of this.lots){if(Math.abs(l.x-px)<24&&Math.abs(l.z-pz)<24&&yr>=l.t)py=Math.max(py,118);}for(const b of this.vm.buildings){const q=this.pLots[b.slot%this.pLots.length];if(q&&Math.abs(q.x-px)<24&&Math.abs(q.z-pz)<24)py=Math.max(py,b.floors*3.1+14);}
  this.pos.lerp(P.set(px,py,pz),1-Math.pow(.25,dt));this.look.lerp(this.tgt,1-Math.pow(.25,dt));this.cam.position.copy(this.pos);if(this.shake>.01){this.cam.position.x+=(Math.random()-.5)*this.shake;this.cam.position.y+=(Math.random()-.5)*this.shake;this.shake*=Math.pow(.25,dt);}
  this.cam.lookAt(this.look.x,this.look.y,this.look.z);this.sun.target.position.copy(this.look);this.sun.position.add(this.look);
  this.r.render(this.sc,this.cam);}
}
