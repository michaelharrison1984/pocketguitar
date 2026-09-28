import test from 'node:test';
import assert from 'node:assert/strict';
import {Band} from '../public/audio.js';
import {makeProgression,PRESETS} from '../public/theory.js';
globalThis.requestAnimationFrame=()=>1;
globalThis.cancelAnimationFrame=()=>{};
function setup(count=false,bars=1){const beats=[],band=new Band(e=>beats.push(e),()=>{});band.ctx={currentTime:0};band.init=async()=>{};const sounds=[];band.tone=(...args)=>sounds.push(args);band.hit=(...args)=>sounds.push(args);band.pluck=(...args)=>sounds.push(args);return {band,beats,sounds,config:{chords:makeProgression(7,'folk',[0,4],false),bpm:120,bars,count,click:false,pattern:'arp',drums:true,feel:'shuffle'}};}
test('audio clock changes chords after four beats and loops to the first',async()=>{const {band,beats,config,sounds}=setup();try{await band.start(config);clearInterval(band.timer);for(const t of [.11,.61,1.11,1.61,2.11,2.61,3.11,3.61,4.11]){band.ctx.currentTime=t;band.tick();band.paint();}assert.deepEqual(beats.map(e=>e.ci),[0,0,0,0,1,1,1,1,0]);assert.deepEqual(beats.slice(0,4).map(e=>e.beat),[0,1,2,3]);assert.ok(sounds.length>20);}finally{band.stop();}});
test('count-in lasts four beats; two-bar slots last eight beats',async()=>{const {band,beats,config}=setup(true,2);try{await band.start(config);clearInterval(band.timer);for(let n=0;n<13;n++){band.ctx.currentTime=.11+n*.5;band.tick();band.paint();}assert.deepEqual(beats.slice(0,4).map(e=>e.ci),[-1,-1,-1,-1]);assert.deepEqual(beats.slice(4,12).map(e=>e.ci),Array(8).fill(0));assert.equal(beats[12].ci,1);assert.equal(beats[8].bar,2);}finally{band.stop();}});
test('stop clears scheduled drawing and stops sound sources',()=>{const {band}=setup();let stopped=0;band.voices.add({stop(){stopped++;}});band.running=true;band.events=[{time:1,ci:1}];band.stop();assert.equal(stopped,1);assert.equal(band.running,false);assert.equal(band.events.length,0);assert.equal(band.voices.size,0);});


test('every preset in every key plays pitched chord notes in all accompaniment modes',async()=>{
 for(let key=0;key<12;key++)for(const [style,preset] of Object.entries(PRESETS))for(const degrees of preset.patterns)for(const pattern of ['strum','arp','pad'])for(const sevenths of [false,true]){
  const {band,config}=setup();const played=[];band.pluck=(midi,time,duration,level)=>played.push({midi,time,duration,level});
  const chords=makeProgression(key,style,degrees,sevenths);
  try{
   await band.start({...config,chords,pattern});clearInterval(band.timer);
   for(let step=1;step<chords.length*4;step++){band.ctx.currentTime=.1+step*.5;band.tick();}
   for(let i=0;i<chords.length;i++){
    const from=.1+i*2,notes=played.filter(n=>n.time>=from-.001&&n.time<from+2-.001);
    assert.ok(notes.length>=4,`${key}/${style}/${pattern}: chord ${i} must sound`);
    assert.ok(notes.every(n=>n.duration>=.28&&n.level>0&&n.midi>=55&&n.midi<=83));
    assert.ok(notes.every(n=>chords[i].tones.includes(n.midi%12)));
   }
  }finally{band.stop();}
 }
});
test('unknown accompaniment falls back to pitched strumming',async()=>{
 const {band,config}=setup();let count=0;band.pluck=()=>count++;
 try{await band.start({...config,pattern:'obsolete-pattern'});clearInterval(band.timer);assert.equal(band.config.pattern,'strum');assert.ok(count>=4);}finally{band.stop();}
});
test('late scheduler skips expired beats instead of emitting a burst of clicks',async()=>{
 const {band,config}=setup();const times=[];band.pluck=(m,t)=>times.push(t);
 try{await band.start(config);clearInterval(band.timer);times.length=0;band.ctx.currentTime=8;band.tick();assert.ok(times.every(t=>t>=8));assert.ok(times.length<=2);assert.ok(band.next>8);}finally{band.stop();}
});
test('pitched envelope retains a note body before a smooth release',()=>{
 const {band}=setup();delete band.pluck;
 const events=[],o={frequency:{},setPeriodicWave(w){this.wave=w;},connect(){},start(t){this.started=t;},stop(t){this.stopped=t;}};
 const g={gain:{setValueAtTime(v,t){events.push([v,t]);},linearRampToValueAtTime(v,t){events.push([v,t]);},exponentialRampToValueAtTime(v,t){events.push([v,t]);}},connect(){}};
 band.ctx={currentTime:0,createOscillator:()=>o,createGain:()=>g};band.strings={};band.master={};
 band.pluck(69,.1,.5,.1);
 assert.equal(o.frequency.value,440);assert.equal(o.wave,band.strings);assert.deepEqual(events.map(e=>+e[1].toFixed(3)),[.1,.108,.18,.5,.6]);assert.ok(events[3][0]>=.03);assert.equal(events[4][0],0);assert.ok(o.stopped>events[4][1]);
});

test('one-shot playback stops at the end and bar hooks share the backing clock',async()=>{
 const {band,config}=setup();const hooks=[];
 try{await band.start({...config,chords:[config.chords[0]],loop:false,onSchedule:e=>hooks.push(e)});clearInterval(band.timer);for(const t of [.11,.61,1.11,1.61,2.11]){band.ctx.currentTime=t;band.tick();band.paint();}assert.equal(band.running,false);assert.deepEqual(hooks.map(e=>e.beat),[0,1,2,3]);assert.deepEqual(hooks.map(e=>e.time),[.1,.6,1.1,1.6]);}finally{band.stop();}
});
