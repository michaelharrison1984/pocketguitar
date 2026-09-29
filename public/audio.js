const PATTERNS = new Set(['strum', 'arp', 'pad']);
export class Band {
 constructor(onBeat,onStop){this.onBeat=onBeat;this.onStop=onStop;this.ctx=null;this.running=false;this.events=[];this.voices=new Set();}
 async init(){
  if(!this.ctx){
   this.ctx=new (window.AudioContext||window.webkitAudioContext)();
   this.master=this.ctx.createGain();this.master.gain.value=.5;
   const limiter=this.ctx.createDynamicsCompressor();limiter.threshold.value=-12;limiter.ratio.value=4;
   this.master.connect(limiter);limiter.connect(this.ctx.destination);
   // Fundamental plus gentle upper harmonics: audible pitch even on small speakers.
   this.strings=this.ctx.createPeriodicWave(new Float32Array(7),new Float32Array([0,1,.42,.22,.12,.065,.035]));
   this.twangStrings=this.ctx.createPeriodicWave(new Float32Array(9),new Float32Array([0,1,.65,.38,.28,.18,.12,.08,.04]));
   this.bluesStrings=this.ctx.createPeriodicWave(new Float32Array(7),new Float32Array([0,1,.18,.4,.08,.17,.03]));
  }
  await this.ctx.resume();
 }
 volume(v){if(this.master)this.master.gain.setTargetAtTime(Math.max(0,Math.min(1,v)),this.ctx.currentTime,.04);}
 tone(midi,time,duration=.5,level=.13,type='triangle'){
  const o=this.ctx.createOscillator(),g=this.ctx.createGain();
  const start=Math.max(time,this.ctx.currentTime),length=Math.max(.03,duration);
  o.type=type;o.frequency.value=440*2**((midi-69)/12);o.connect(g);g.connect(this.master);
  g.gain.setValueAtTime(0,start);g.gain.linearRampToValueAtTime(level,start+.008);
  g.gain.exponentialRampToValueAtTime(.001,start+length);
  o.start(start);o.stop(start+length+.025);this.track(o,g);
 }
 pluck(midi,time,duration=.65,level=.09,sustain=false){
  const o=this.ctx.createOscillator(),g=this.ctx.createGain();
  const start=Math.max(time,this.ctx.currentTime),length=Math.max(.28,duration);
  o.setPeriodicWave(this.strings);o.frequency.value=440*2**((midi-69)/12);
  o.connect(g);g.connect(this.master);
  g.gain.setValueAtTime(0,start);
  g.gain.linearRampToValueAtTime(level,start+(sustain?.025:.008));
  g.gain.exponentialRampToValueAtTime(level*.7,start+.08);
  // Keep the body of the note audible; avoid an immediate decay into a click.
  g.gain.exponentialRampToValueAtTime(level*(sustain?.55:.32),start+length-.1);
  g.gain.linearRampToValueAtTime(0,start+length);
  o.start(start);o.stop(start+length+.02);this.track(o,g);
 }
 lead(midi,time,duration=.6,options={}){
  const start=Math.max(time,this.ctx.currentTime),length=Math.max(.09,duration),end=start+length;
  const o=this.ctx.createOscillator(),g=this.ctx.createGain(),filter=this.ctx.createBiquadFilter();
  const twang=options.tone==='twang',blues=options.tone==='blues';
  if(twang)o.setPeriodicWave(this.twangStrings);else if(blues)o.setPeriodicWave(this.bluesStrings);else o.setPeriodicWave(this.strings);
  const hz=n=>440*2**((n-69)/12),level=.19*(options.accent||1),target=options.targetMidi;
  o.frequency.setValueAtTime(hz(midi),start);
  if(Number.isFinite(target)){
   const targetHz=hz(target);
   if(options.tech==='bend'){
    o.frequency.setValueAtTime(hz(midi),start+length*.08);
    o.frequency.exponentialRampToValueAtTime(targetHz,start+length*.43);
    o.frequency.setValueAtTime(targetHz,start+length*(options.release?.62:.95));
    if(options.release)o.frequency.exponentialRampToValueAtTime(hz(midi),start+length*.87);
   }else if(options.tech==='slide'){
    o.frequency.setValueAtTime(hz(midi),start+length*.15);
    o.frequency.exponentialRampToValueAtTime(targetHz,start+length*.55);
   }else if(options.tech==='hammer'||options.tech==='pull'){
    // One picked attack: change pitch quickly without starting a second oscillator.
    o.frequency.setValueAtTime(hz(midi),start+length*.44);
    o.frequency.exponentialRampToValueAtTime(targetHz,start+length*.46);
   }
  }
  filter.type='lowpass';filter.Q.value=twang?.8:.45;
  filter.frequency.setValueAtTime(twang?6500:blues?3500:4200,start);
  filter.frequency.exponentialRampToValueAtTime(twang?2200:1800,end);
  o.connect(filter);filter.connect(g);g.connect(this.master);
  const attack=Math.min(.009,length*.1),release=Math.min(.065,length*.25);
  g.gain.setValueAtTime(0,start);g.gain.linearRampToValueAtTime(level,start+attack);
  g.gain.exponentialRampToValueAtTime(level*(twang?.5:.68),start+length*.4);
  g.gain.exponentialRampToValueAtTime(level*(options.tech==='pull'?.3:.4),end-release);
  g.gain.linearRampToValueAtTime(0,end);
  let lfo,depth;
  if(options.vibrato){
   lfo=this.ctx.createOscillator();depth=this.ctx.createGain();lfo.frequency.value=5.5;
   depth.gain.setValueAtTime(0,start);depth.gain.setValueAtTime(0,start+length*.4);depth.gain.linearRampToValueAtTime(blues?22:12,start+length*.65);
   lfo.connect(depth);depth.connect(o.detune);lfo.start(start);lfo.stop(end+.02);this.voices.add(lfo);
   lfo.onended=()=>{this.voices.delete(lfo);lfo.disconnect();depth.disconnect();};
  }
  o.start(start);o.stop(end+.02);this.voices.add(o);
  o.onended=()=>{this.voices.delete(o);o.disconnect();filter.disconnect();g.disconnect();};
 }
 track(o,g){this.voices.add(o);o.onended=()=>{this.voices.delete(o);o.disconnect();g.disconnect();};}
 hit(time,kind){
  if(kind==='kick'){this.tone(36,time,.12,.065,'sine');return;}
  this.tone(kind==='snare'?78:105,time,kind==='snare'?.045:.025,kind==='snare'?.014:.008,'triangle');
 }
 voicing(c){
  // Root position with an octave root, kept above G3 for a clear chord register.
  let root=48+Number(c.root);while(root<55)root+=12;
  const notes=c.tones.map(pc=>root+((Number(pc)-Number(c.root)+12)%12));
  return [...new Set([...notes,root+12])].sort((a,b)=>a-b);
 }
 async preview(midi){await this.init();this.pluck(midi,this.ctx.currentTime+.02,.85,.16);}
 async start(config){
  await this.init();this.stop(false);
  this.config={...config,pattern:PATTERNS.has(config.pattern)?config.pattern:'strum',bpm:Math.max(40,Math.min(180,Number(config.bpm)||80)),bars:[1,2,4].includes(Number(config.bars))?Number(config.bars):1};
  this.running=true;this.index=config.count?-4:0;this.next=this.ctx.currentTime+.1;this.events=[];this.endTime=null;
  this.tick();this.timer=setInterval(()=>this.tick(),25);this.paint();
 }
 tick(){
  if(!this.running)return;
  const c=this.config,spb=60/c.bpm,total=c.chords.length*c.bars*4,now=this.ctx.currentTime;
  // A busy browser must not dump expired notes into the current audio instant.
  if(this.next<now-.04){const missed=Math.ceil((now+.04-this.next)/spb);this.index+=missed;this.next+=missed*spb;this.events=[];}
  while(this.next<now+.12){
   if(c.loop===false&&this.index>=total){this.endTime=this.next;break;}
   const step=this.index,beat=((step%4)+4)%4,ci=step<0?-1:Math.floor((step%total)/(c.bars*4));
   this.events.push({time:this.next,ci,beat,bar:step<0?0:Math.floor((step%(c.bars*4))/4)+1});
   if(step<0){this.tone(beat===0?92:86,this.next,.04,.055,'sine');}
   else {
    const chord=c.chords[ci],v=this.voicing(chord),t=this.next;
    if(c.onSchedule)c.onSchedule({ci,beat,time:t,spb,step});
    if(c.click)this.tone(beat===0?92:86,t,.035,.035,'sine');
    if(beat===0||beat===2)this.tone(36+Number(beat===2?chord.tones[2]:chord.root),t,spb*.95,.1,'triangle');
    if(c.pattern==='pad'&&beat===0)v.forEach(n=>this.pluck(n,t,spb*3.95,.07,true));
    if(c.pattern==='strum'){
     v.forEach((n,i)=>this.pluck(n,t+i*.014,Math.max(.45,spb*1.3),beat===0?.09:.07));
     if(beat===1||beat===3){const off=c.feel==='shuffle'?2/3:.5;[...v].reverse().forEach((n,i)=>this.pluck(n,t+spb*off+i*.009,Math.max(.3,spb*.6),.038));}
    }
    if(c.pattern==='arp'){
     const off=c.feel==='shuffle'?2/3:.5;
     this.pluck(v[(beat*2)%v.length],t,Math.max(.4,spb*1.2),.13);
     this.pluck(v[(beat*2+1)%v.length],t+spb*off,Math.max(.35,spb*.9),.11);
    }
    if(c.drums){this.hit(t,beat===0||beat===2?'kick':'snare');this.hit(t,'hat');this.hit(t+spb*(c.feel==='shuffle'?2/3:.5),'hat');}
   }
   this.index++;this.next+=spb;
  }
 }
 paint(){if(!this.running)return;const time=this.ctx.currentTime;let e;while(this.events.length&&this.events[0].time<=time)e=this.events.shift();if(e)this.onBeat(e);if(this.endTime!==null&&this.endTime!==undefined&&time>=this.endTime){this.stop();return;}this.raf=requestAnimationFrame(()=>this.paint());}
 stop(notify=true){this.running=false;clearInterval(this.timer);cancelAnimationFrame(this.raf);this.events=[];for(const v of this.voices){try{v.stop();}catch{}}this.voices.clear();if(notify)this.onStop();}
}
