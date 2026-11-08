// Kodla üretilen sesler: şehir, şantiye ve hava ortamı, olay sesleri ve sakin bir müzik.
// Hiçbir ses dosyası indirilmez; hepsi Web Audio ile anında sentezlenir.
export interface SndSet{music:boolean;sfx:boolean;amb:boolean;vol:number;}
export interface SndInfo{near:number;night:boolean;rain:number;terrain:string;home:boolean;height:number;item:string;menu?:boolean;winter?:boolean;crisis?:boolean;}
const KEY='sb_snd';
export class Sound{
 ctx:AudioContext|null=null;master!:GainNode;mus!:GainNode;sfxG!:GainNode;amb!:GainNode;set:SndSet={music:true,sfx:true,amb:true,vol:.8};
 white!:AudioBuffer;brown!:AudioBuffer;L:Record<string,{g:GainNode;src?:AudioScheduledSourceNode;f?:BiquadFilterNode}>={};plucks:AudioBuffer[]=[];next=0;step=0;timer:any=0;info:SndInfo={near:0,night:false,rain:0,terrain:'ic',home:false,height:50,item:''};mode=0;phrase:number[]=[];
 constructor(){try{const v=localStorage.getItem(KEY);if(v)this.set={...this.set,...JSON.parse(v)};}catch{}}
 save(){try{localStorage.setItem(KEY,JSON.stringify(this.set));}catch{}}
 /** Tarayıcı sesi ancak ilk dokunuştan sonra açar */
 start(){if(this.ctx){if(this.ctx.state==='suspended')this.ctx.resume();return;}const AC=(window as any).AudioContext||(window as any).webkitAudioContext;if(!AC)return;let c:AudioContext;try{c=new AC();}catch{return;}this.ctx=c;
  this.master=c.createGain();this.master.connect(c.destination);const comp=c.createDynamicsCompressor();comp.threshold.value=-14;comp.ratio.value=4;comp.connect(this.master);
  this.mus=c.createGain();this.sfxG=c.createGain();this.amb=c.createGain();[this.mus,this.sfxG,this.amb].forEach(g=>g.connect(comp));this.apply();
  const sr=c.sampleRate;this.white=c.createBuffer(1,sr*2,sr);const w=this.white.getChannelData(0);for(let i=0;i<w.length;i++)w[i]=Math.random()*2-1;this.brown=c.createBuffer(1,sr*4,sr);const b=this.brown.getChannelData(0);let last=0;for(let i=0;i<b.length;i++){last=(last+.02*(Math.random()*2-1))/1.02;b[i]=last*3.5;}
  this.loop('traffic',this.brown,'lowpass',380,.0);this.loop('wind',this.white,'bandpass',500,.0,.6);this.loop('rain',this.white,'highpass',1400,.0);this.loop('sea',this.brown,'lowpass',700,.0);this.loop('mixer',this.brown,'lowpass',140,.0);this.loop('room',this.brown,'lowpass',200,.0);
  this.mkPlucks();this.timer=setInterval(()=>this.tick(),120);}
 apply(){if(!this.ctx)return;const t=this.ctx.currentTime;this.master.gain.setTargetAtTime(this.set.vol,t,.1);this.mus.gain.setTargetAtTime(this.set.music?.32:0,t,.4);this.sfxG.gain.setTargetAtTime(this.set.sfx?.9:0,t,.1);this.amb.gain.setTargetAtTime(this.set.amb?.7:0,t,.4);}
 toggle(k:'music'|'sfx'|'amb'){this.set[k]=!this.set[k];this.save();this.apply();}
 volume(v:number){this.set.vol=Math.max(0,Math.min(1,v));this.save();this.apply();}
 loop(name:string,buf:AudioBuffer,type:BiquadFilterType,freq:number,vol:number,q=1){const c=this.ctx!;const s=c.createBufferSource();s.buffer=buf;s.loop=true;s.playbackRate.value=.9+Math.random()*.2;const f=c.createBiquadFilter();f.type=type;f.frequency.value=freq;f.Q.value=q;const g=c.createGain();g.gain.value=vol;s.connect(f).connect(g).connect(this.amb);s.start();this.L[name]={g,src:s,f};}
 lv(name:string,v:number,tc=.8){const l=this.L[name];if(l&&this.ctx)l.g.gain.setTargetAtTime(v,this.ctx.currentTime,tc);}
 update(i:SndInfo){this.info=i;if(!this.ctx)return;const day=!i.night;const out=i.home?.15:1;const high=Math.min(1,Math.max(0,(i.height-40)/200));
  this.lv('traffic',(i.menu?.25:.45)*(day?1:.45)*(1-high*.5)*out*(i.crisis?.7:1));this.lv('wind',((i.terrain==='dag'?.18:.05)+high*.12+(i.winter?.1:0))*out);this.lv('rain',(i.rain===1?.35:0)*(i.home?.4:1));this.lv('sea',(i.terrain==='sahil'?.28:0)*out*(1-high*.4));
  this.lv('mixer',(i.item==='beton'||i.item==='temel'?.55:.12)*i.near*out);this.lv('room',i.home?.12:0);
  if(this.L.wind.f)this.L.wind.f.frequency.setTargetAtTime(400+Math.sin(this.ctx.currentTime*.13)*220,this.ctx.currentTime,1);
  if(this.L.sea.f)this.L.sea.f.frequency.setTargetAtTime(500+Math.sin(this.ctx.currentTime*.6)*300,this.ctx.currentTime,.4);}
 // ---------- Ortam olayları ----------
 tick(){const c=this.ctx;if(!c)return;const i=this.info;const t=c.currentTime;
  if(this.set.amb&&!i.home){if(!i.night&&Math.random()<.05&&i.rain===0)this.bird(t);if(i.night&&Math.random()<.25&&i.terrain!=='dag')this.cricket(t);if(Math.random()<.012&&!i.night)this.horn(t);if(i.terrain==='sahil'&&Math.random()<.02&&!i.night)this.gull(t);
   if(i.near>.05&&!i.night){const n=i.near;if(Math.random()<.35*n)this.hammer(t,n);if(Math.random()<.03*n)this.clang(t,n);if(Math.random()<.008*n)this.grinder(t,n);if(Math.random()<.01*n)this.beep(t,n);}
   if(i.menu&&Math.random()<.04)this.hammer(t,.25);}
  if(this.set.music)this.music(t);}
 env(g:GainNode,t:number,a:number,peak:number,d:number){g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(peak,t+a);g.gain.exponentialRampToValueAtTime(.0001,t+a+d);}
 noiseHit(t:number,type:BiquadFilterType,f:number,q:number,peak:number,d:number,dest:AudioNode=this.amb){const c=this.ctx!;const s=c.createBufferSource();s.buffer=this.white;const fl=c.createBiquadFilter();fl.type=type;fl.frequency.value=f;fl.Q.value=q;const g=c.createGain();s.connect(fl).connect(g).connect(dest);this.env(g,t,.002,peak,d);s.start(t,Math.random()*1.5);s.stop(t+d+.05);}
 tone(t:number,f:number,type:OscillatorType,peak:number,d:number,dest:AudioNode=this.amb,f2?:number,a=.004){const c=this.ctx!;const o=c.createOscillator();o.type=type;o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+d);const g=c.createGain();o.connect(g).connect(dest);this.env(g,t,a,peak,d);o.start(t);o.stop(t+a+d+.05);}
 bird(t:number){const n=2+Math.floor(Math.random()*4);const b=2500+Math.random()*1800;for(let k=0;k<n;k++)this.tone(t+k*.11,b*(1+Math.random()*.2),'sine',.025,.07,this.amb,b*(1.3+Math.random()*.3));}
 cricket(t:number){for(let k=0;k<3;k++)this.tone(t+k*.045,4600,'sine',.01,.025);}
 horn(t:number){const f=380+Math.random()*120;this.tone(t,f,'square',.025,.28,this.amb,undefined,.01);this.tone(t,f*1.26,'square',.018,.28,this.amb,undefined,.01);}
 gull(t:number){this.tone(t,1400,'sawtooth',.012,.35,this.amb,900,.05);this.tone(t+.4,1500,'sawtooth',.01,.3,this.amb,950,.05);}
 hammer(t:number,n:number){const v=.12*n*(.6+Math.random()*.4);this.noiseHit(t,'bandpass',1800+Math.random()*900,6,v,.06);this.tone(t,140,'sine',v*.8,.08);}
 clang(t:number,n:number){for(const[f,a]of[[523,1],[1307,.6],[2153,.4],[3411,.25]])this.tone(t,f*(.97+Math.random()*.06),'sine',.05*n*a,.9);}
 grinder(t:number,n:number){const c=this.ctx!;const o=c.createOscillator();o.type='sawtooth';o.frequency.setValueAtTime(2900,t);o.frequency.linearRampToValueAtTime(3400,t+.3);o.frequency.linearRampToValueAtTime(3100,t+1.4);const g=c.createGain();o.connect(g).connect(this.amb);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.02*n,t+.15);g.gain.linearRampToValueAtTime(0,t+1.6);o.start(t);o.stop(t+1.7);this.noiseHit(t,'highpass',4000,1,.03*n,1.5);}
 beep(t:number,n:number){for(let k=0;k<4;k++)this.tone(t+k*.5,1040,'square',.02*n,.18);}
 // ---------- Olay sesleri ----------
 sfx(name:string,arg?:any){const c=this.ctx;if(!c||!this.set.sfx)return;const t=c.currentTime+.01;const D=this.sfxG;
  switch(name){case'click':this.noiseHit(t,'bandpass',3200,4,.08,.025,D);break;
   case'card':this.noiseHit(t,'bandpass',900,1,.06,.25,D);this.tone(t+.02,660,'sine',.04,.25,D);break;
   case'cash':[1318,1568,2093].forEach((f,k)=>this.tone(t+k*.06,f,'triangle',.08,.4,D));break;
   case'good':[523,659,784].forEach((f,k)=>this.tone(t+k*.09,f,'triangle',.08,.5,D));break;
   case'bad':[392,330].forEach((f,k)=>this.tone(t+k*.18,f,'triangle',.08,.45,D));break;
   case'knock':for(let k=0;k<3;k++){this.tone(t+k*.18,110,'sine',.35,.12,D);this.noiseHit(t+k*.18,'lowpass',600,1,.2,.06,D);}break;
   case'phone':for(let k=0;k<2;k++)for(let j=0;j<10;j++){this.tone(t+k*1.4+j*.05,[440,480][j%2],'sine',.06,.05,D);}break;
   case'quake':{const s=c.createBufferSource();s.buffer=this.brown;const f=c.createBiquadFilter();f.type='lowpass';f.frequency.value=90;const g=c.createGain();s.connect(f).connect(g).connect(D);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(1.6,t+.6);g.gain.linearRampToValueAtTime(1.2,t+4);g.gain.linearRampToValueAtTime(0,t+7);s.start(t);s.stop(t+7.2);for(let k=0;k<14;k++)this.noiseHit(t+.5+Math.random()*5,'bandpass',300+Math.random()*900,2,.15,.15,D);break;}
   case'tok':{const solid=!!arg;if(solid){this.noiseHit(t,'bandpass',2100,9,.5,.05,D);this.tone(t,1650,'sine',.18,.12,D);}else{this.noiseHit(t,'bandpass',520,2.5,.6,.2,D);this.tone(t,230,'sine',.22,.22,D);}break;}
   case'place':this.tone(t,180,'sine',.25,.09,D);this.noiseHit(t,'lowpass',900,1,.15,.07,D);break;
   case'pour':this.noiseHit(t,'lowpass',500,1,.2,.35,D);break;
   case'vib':{const o=c.createOscillator();o.type='sawtooth';o.frequency.value=95;const g=c.createGain();o.connect(g).connect(D);this.env(g,t,.02,.05,.4);o.start(t);o.stop(t+.5);break;}
   case'tie':this.tone(t,2600,'triangle',.05,.05,D);this.noiseHit(t,'highpass',5000,1,.04,.04,D);break;}}
 // ---------- Müzik: telli çalgı + tef + drone, hicaz ve uşşak kökenli diziler ----------
 mkPlucks(){const c=this.ctx!;const sr=c.sampleRate;const base=146.83;const scales=[[0,1,4,5,7,8,10,12,13,16,17,19],[0,2,3,5,7,8,10,12,14,15,17,19]];this.plucks=[];
  for(const sc of scales)for(const st of sc){const f=base*Math.pow(2,st/12);const len=Math.floor(sr*1.8);const buf=c.createBuffer(1,len,sr);const d=buf.getChannelData(0);const N=Math.round(sr/f);for(let i=0;i<N;i++)d[i]=(Math.random()*2-1)*(1-i/N*.3);
   for(let i=N;i<len;i++)d[i]=.4985*(d[i-N]+d[i-N-1])+(i%N===0?0:0);let pk=0;for(let i=0;i<len;i++)pk=Math.max(pk,Math.abs(d[i]));for(let i=0;i<len;i++)d[i]=d[i]/pk*(i<200?i/200:1);this.plucks.push(buf);}}
 pluck(t:number,idx:number,v:number){const c=this.ctx!;const s=c.createBufferSource();s.buffer=this.plucks[idx];const f=c.createBiquadFilter();f.type='lowpass';f.frequency.value=3200;const g=c.createGain();g.gain.value=v;const p=c.createStereoPanner?c.createStereoPanner():null;s.connect(f).connect(g);if(p){p.pan.value=-.15;g.connect(p).connect(this.mus);}else g.connect(this.mus);s.start(t);s.stop(t+1.8);}
 drum(t:number,low:boolean,v:number){if(low)this.tone(t,85,'sine',.5*v,.25,this.mus,55);else this.noiseHit(t,'bandpass',2400,1.5,.12*v,.06,this.mus);}
 drone(t:number,dur:number){const c=this.ctx!;for(const[f,a]of[[73.42,.05],[110,.03],[146.83,.02]]){const o=c.createOscillator();o.type='triangle';o.frequency.value=f;const vib=c.createOscillator();vib.frequency.value=4.5;const vg=c.createGain();vg.gain.value=.4;vib.connect(vg).connect(o.frequency);const g=c.createGain();o.connect(g).connect(this.mus);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(a,t+1.5);g.gain.setValueAtTime(a,t+dur-1.5);g.gain.linearRampToValueAtTime(0,t+dur);o.start(t);vib.start(t);o.stop(t+dur+.1);vib.stop(t+dur+.1);}}
 music(now:number){const c=this.ctx!;if(this.next<now)this.next=now+.2;const bpm=this.info.menu?72:84;const beat=60/bpm/2;
  while(this.next<now+.6){const t=this.next;const bar=16;const pos=this.step%bar;
   if(this.step%(bar*4)===0){this.mode=Math.random()<.5?0:1;this.drone(t,beat*bar*4);}
   if(pos===0)this.phrase=this.mkPhrase(bar);
   const n=this.phrase[pos];if(n>=0)this.pluck(t,this.mode*12+n,(pos%4===0?.5:.32)*(.8+Math.random()*.3));
   if(!this.info.menu){if(pos===0||pos===6||pos===10)this.drum(t,true,.7);if(pos%4===2||pos===13)this.drum(t,false,.6);}
   this.step++;this.next+=beat*(pos%4===3&&Math.random()<.2?1.5:1);}}
 mkPhrase(len:number){const out:number[]=[];let cur=Math.random()<.5?4:7;for(let i=0;i<len;i++){if(i%4===3&&Math.random()<.45){out.push(-1);continue;}if(Math.random()<.18){out.push(-1);continue;}cur+=[-2,-1,-1,0,1,1,2][Math.floor(Math.random()*7)];cur=Math.max(0,Math.min(11,cur));out.push(cur);}
  out[len-1]=-1;out[len-2]=Math.random()<.6?0:4;return out;}
}
export const sound=new Sound();
