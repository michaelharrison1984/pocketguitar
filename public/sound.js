export const MIX_DEFAULTS={guitar:true,piano:false,pad:false,bass:true,drums:true,guitarLevel:65,pianoLevel:50,padLevel:25,bassLevel:55,drumsLevel:35,room:18};
export const MIX_PRESETS={
 acoustic:{...MIX_DEFAULTS,drums:false,room:14},
 studio:{...MIX_DEFAULTS,guitar:false,piano:true,pad:true,room:24},
 blues:{...MIX_DEFAULTS,piano:true,pianoLevel:32,pad:false,room:12},
 ambient:{...MIX_DEFAULTS,guitar:false,piano:true,pad:true,drums:false,bassLevel:35,padLevel:40,room:35}
};
export function normalMix(c={}){const m=Object.fromEntries(Object.entries(MIX_DEFAULTS).map(([k,v])=>[k,c[k]===undefined?v:c[k]]));for(const k of ['guitar','piano','pad','bass','drums']){m[k]=typeof m[k]==='boolean'?m[k]:MIX_DEFAULTS[k];m[k+'Level']=Math.max(0,Math.min(100,Number(m[k+'Level'])||0));}m.room=Math.max(0,Math.min(50,Number(m.room)||0));return m;}
const hz=m=>440*2**((m-69)/12);
export class SoundRack{
 constructor(ctx,master,voices){
  this.ctx=ctx;this.master=master;this.voices=voices;this.buses={};this.cache=new Map();
  this.wet=ctx.createGain();this.wet.gain.value=.18;this.reverb=ctx.createConvolver();const impulse=ctx.createBuffer(2,Math.floor(ctx.sampleRate*.7),ctx.sampleRate);let seed=6427;const random=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296*2-1;};
  for(let channel=0;channel<2;channel++){const d=impulse.getChannelData(channel);for(let i=0;i<d.length;i++)d[i]=random()*Math.exp(-i/(ctx.sampleRate*.13))*.3;}
  this.reverb.buffer=impulse;this.reverb.connect(this.wet);this.wet.connect(master);
  for(const [name,pan] of [['guitar',-.18],['piano',.18],['pad',0],['bass',0],['drums',0]]){const gain=ctx.createGain(),panner=ctx.createStereoPanner();panner.pan.value=pan;gain.connect(panner);panner.connect(master);if(name!=='bass'&&name!=='drums')panner.connect(this.reverb);this.buses[name]=gain;}
  this.noise=ctx.createBuffer(1,ctx.sampleRate,ctx.sampleRate);const data=this.noise.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=random();this.mix=normalMix();this.update(this.mix);
 }
 update(config){this.mix=normalMix(config);for(const k in this.buses)this.buses[k].gain.setTargetAtTime(this.mix[k]?this.mix[k+'Level']/100:0,this.ctx.currentTime,.025);this.wet.gain.setTargetAtTime(this.mix.room/100,this.ctx.currentTime,.025);}
 silenceRoom(){this.wet.gain.setValueAtTime(0,this.ctx.currentTime);}
 track(source,nodes,start,end){this.voices.add(source);source.start(start);source.stop(end);source.onended=()=>{this.voices.delete(source);source.disconnect();nodes.forEach(n=>n.disconnect());};}
 guitar(midi,time,duration=.7,level=.12){
  const ctx=this.ctx,start=Math.max(time,ctx.currentTime),length=Math.max(.18,Math.min(3,duration)),key=`${midi}:${Math.ceil(length*10)}`;let buffer=this.cache.get(key);
  if(!buffer){const size=Math.ceil(ctx.sampleRate*(Math.ceil(length*10)/10+.05)),period=ctx.sampleRate/hz(midi)-.4,delay=Math.max(2,Math.floor(period)),fraction=period-delay;buffer=ctx.createBuffer(1,size,ctx.sampleRate);const d=buffer.getChannelData(0);let seed=7919+midi*101;
   for(let i=0;i<delay+2;i++){seed=(seed*1664525+1013904223)>>>0;d[i]=(seed/4294967296*2-1)*.7;}
   // Filtered noise circulates at the string period, producing a decaying pluck.
   for(let i=delay+2;i<size;i++){const a=(1-fraction)*d[i-delay]+fraction*d[i-delay-1],b=(1-fraction)*d[i-delay-1]+fraction*d[i-delay-2];d[i]=(a*.6+b*.4)*.997;}
   let peak=0;for(let i=0;i<size;i++){d[i]*=Math.min(1,i/(ctx.sampleRate*.002));peak=Math.max(peak,Math.abs(d[i]));}if(peak)for(let i=0;i<size;i++)d[i]/=peak;
   if(this.cache.size>100)this.cache.delete(this.cache.keys().next().value);this.cache.set(key,buffer);
  }
  const source=ctx.createBufferSource(),gain=ctx.createGain();source.buffer=buffer;gain.gain.setValueAtTime(level*2,start);gain.gain.setValueAtTime(level*2,start+Math.max(.01,length-.06));gain.gain.linearRampToValueAtTime(0,start+length);source.connect(gain);gain.connect(this.buses.guitar);this.track(source,[gain],start,start+length+.02);
 }
 piano(midi,time,duration=1,level=.13){
  const start=Math.max(time,this.ctx.currentTime),length=Math.max(.2,duration);
  [1,.36,.15,.055].forEach((weight,i)=>{const o=this.ctx.createOscillator(),g=this.ctx.createGain();o.type='sine';o.frequency.value=hz(midi)*(i+1)*(i>0?1+i*.0004:1);g.gain.setValueAtTime(0,start);g.gain.linearRampToValueAtTime(level*weight,start+.008);g.gain.exponentialRampToValueAtTime(Math.max(.0001,level*weight*.15),start+length*.75);g.gain.linearRampToValueAtTime(0,start+length);o.connect(g);g.connect(this.buses.piano);this.track(o,[g],start,start+length+.02);});
 }
 pad(midi,time,duration=2,level=.07){
  const start=Math.max(time,this.ctx.currentTime),length=Math.max(.3,duration);
  for(const detune of [-5,5]){const o=this.ctx.createOscillator(),f=this.ctx.createBiquadFilter(),g=this.ctx.createGain();o.type='triangle';o.frequency.value=hz(midi);o.detune.value=detune;f.type='lowpass';f.frequency.value=1400;g.gain.setValueAtTime(0,start);g.gain.linearRampToValueAtTime(level*.5,start+Math.min(.25,length*.2));g.gain.setValueAtTime(level*.45,start+length*.65);g.gain.linearRampToValueAtTime(0,start+length);o.connect(f);f.connect(g);g.connect(this.buses.pad);this.track(o,[f,g],start,start+length+.02);}
 }
 bass(midi,time,duration=.5){
  const start=Math.max(time,this.ctx.currentTime),length=Math.max(.15,duration);
  for(const [mult,level] of [[1,.19],[2,.045]]){const o=this.ctx.createOscillator(),g=this.ctx.createGain();o.type='sine';o.frequency.value=hz(midi)*mult;g.gain.setValueAtTime(0,start);g.gain.linearRampToValueAtTime(level,start+.012);g.gain.exponentialRampToValueAtTime(.001,start+length);o.connect(g);g.connect(this.buses.bass);this.track(o,[g],start,start+length+.02);}
 }
 drum(time,kind){
  const start=Math.max(time,this.ctx.currentTime);
  if(kind==='kick'){const o=this.ctx.createOscillator(),g=this.ctx.createGain();o.frequency.setValueAtTime(130,start);o.frequency.exponentialRampToValueAtTime(48,start+.12);g.gain.setValueAtTime(.3,start);g.gain.exponentialRampToValueAtTime(.001,start+.18);o.connect(g);g.connect(this.buses.drums);this.track(o,[g],start,start+.2);return;}
  const source=this.ctx.createBufferSource(),filter=this.ctx.createBiquadFilter(),g=this.ctx.createGain(),length=kind==='snare'?.13:.045;source.buffer=this.noise;filter.type='highpass';filter.frequency.value=kind==='snare'?1000:6500;g.gain.setValueAtTime(kind==='snare'?.2:.07,start);g.gain.exponentialRampToValueAtTime(.001,start+length);source.connect(filter);filter.connect(g);g.connect(this.buses.drums);this.track(source,[filter,g],start,start+length+.01);
 }
}
