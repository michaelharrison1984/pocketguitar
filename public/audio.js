export class Band {
 constructor(onBeat,onStop){this.onBeat=onBeat;this.onStop=onStop;this.ctx=null;this.running=false;this.events=[];this.voices=new Set();}
 async init(){if(!this.ctx){this.ctx=new (window.AudioContext||window.webkitAudioContext)();this.master=this.ctx.createGain();this.master.gain.value=.5;const limiter=this.ctx.createDynamicsCompressor();limiter.threshold.value=-14;limiter.ratio.value=6;this.master.connect(limiter);limiter.connect(this.ctx.destination);}await this.ctx.resume();}
 volume(v){if(this.master)this.master.gain.setTargetAtTime(v,this.ctx.currentTime,.04);}
 tone(midi,time,duration=.5,level=.13,type='triangle'){
  const o=this.ctx.createOscillator(),g=this.ctx.createGain();o.type=type;o.frequency.value=440*2**((midi-69)/12);o.connect(g);g.connect(this.master);g.gain.setValueAtTime(0,time);g.gain.linearRampToValueAtTime(level,time+.012);g.gain.exponentialRampToValueAtTime(.001,time+Math.max(.03,duration));o.start(time);o.stop(time+duration+.025);this.voices.add(o);o.onended=()=>{this.voices.delete(o);o.disconnect();g.disconnect();};
 }
 hit(time,kind){if(kind==='kick'){this.tone(36,time,.15,.22,'sine');return;}this.tone(kind==='snare'?78:105,time,kind==='snare'?.055:.025,kind==='snare'?.045:.035,'square');}
 voicing(c){let last=47;return c.tones.map(pc=>{let n=48+pc;while(n<=last)n+=12;last=n;return n;});}
 async preview(midi){await this.init();this.tone(midi,this.ctx.currentTime+.02,.7,.2);}
 async start(config){await this.init();this.stop(false);this.config=config;this.running=true;this.index=config.count?-4:0;this.next=this.ctx.currentTime+.1;this.events=[];this.tick();this.timer=setInterval(()=>this.tick(),25);this.paint();}
 tick(){if(!this.running)return;const c=this.config,spb=60/c.bpm,total=c.chords.length*c.bars*4;
 while(this.next<this.ctx.currentTime+.12){let step=this.index,beat=((step%4)+4)%4,ci=step<0?-1:Math.floor((step%total)/(c.bars*4));this.events.push({time:this.next,ci,beat,bar:step<0?0:Math.floor((step%(c.bars*4))/4)+1});
 if(step<0){this.tone(beat===0?92:86,this.next,.04,.07,'sine');}
 else {const chord=c.chords[ci],v=this.voicing(chord),t=this.next;
 if(c.click)this.tone(beat===0?92:86,t,.035,.05,'sine');
 if(beat===0||beat===2)this.tone(36+(beat===2?chord.tones[2]:chord.root),t,spb*.85,.19,'sine');
 if(c.pattern==='pad'&&beat===0)v.forEach(n=>this.tone(n,t,spb*3.85,.065));
 if(c.pattern==='strum'){v.forEach((n,i)=>this.tone(n,t+i*.012,spb*.75,beat===0?.075:.045));if(beat===1||beat===3){const off=c.feel==='shuffle'?2/3:.5;[...v].reverse().forEach((n,i)=>this.tone(n,t+spb*off+i*.009,spb*.24,.035));}}
 if(c.pattern==='arp'){const off=c.feel==='shuffle'?2/3:.5;this.tone(v[(beat*2)%v.length],t,spb*.85,.12);this.tone(v[(beat*2+1)%v.length],t+spb*off,spb*.65,.1);}
 if(c.drums){this.hit(t,beat===0||beat===2?'kick':'snare');this.hit(t,'hat');this.hit(t+spb*(c.feel==='shuffle'?2/3:.5),'hat');}}
 this.index++;this.next+=spb;}
 }
 paint(){if(!this.running)return;const time=this.ctx.currentTime;let e;while(this.events.length&&this.events[0].time<=time)e=this.events.shift();if(e)this.onBeat(e);this.raf=requestAnimationFrame(()=>this.paint());}
 stop(notify=true){this.running=false;clearInterval(this.timer);cancelAnimationFrame(this.raf);this.events=[];for(const v of this.voices){try{v.stop();}catch{}}this.voices.clear();if(notify)this.onStop();}
}
