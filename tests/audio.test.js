import test from 'node:test';
import assert from 'node:assert/strict';
import {Band} from '../public/audio.js';
import {makeProgression} from '../public/theory.js';
globalThis.requestAnimationFrame=()=>1;
globalThis.cancelAnimationFrame=()=>{};
function setup(count=false,bars=1){const beats=[],band=new Band(e=>beats.push(e),()=>{});band.ctx={currentTime:0};band.init=async()=>{};const sounds=[];band.tone=(...args)=>sounds.push(args);band.hit=(...args)=>sounds.push(args);return {band,beats,sounds,config:{chords:makeProgression(7,'folk',[0,4],false),bpm:120,bars,count,click:false,pattern:'arp',drums:true,feel:'shuffle'}};}
test('audio clock changes chords after four beats and loops to the first',async()=>{const {band,beats,config,sounds}=setup();try{await band.start(config);clearInterval(band.timer);for(const t of [.11,.61,1.11,1.61,2.11,2.61,3.11,3.61,4.11]){band.ctx.currentTime=t;band.tick();band.paint();}assert.deepEqual(beats.map(e=>e.ci),[0,0,0,0,1,1,1,1,0]);assert.deepEqual(beats.slice(0,4).map(e=>e.beat),[0,1,2,3]);assert.ok(sounds.length>20);}finally{band.stop();}});
test('count-in lasts four beats; two-bar slots last eight beats',async()=>{const {band,beats,config}=setup(true,2);try{await band.start(config);clearInterval(band.timer);for(let n=0;n<13;n++){band.ctx.currentTime=.11+n*.5;band.tick();band.paint();}assert.deepEqual(beats.slice(0,4).map(e=>e.ci),[-1,-1,-1,-1]);assert.deepEqual(beats.slice(4,12).map(e=>e.ci),Array(8).fill(0));assert.equal(beats[12].ci,1);assert.equal(beats[8].bar,2);}finally{band.stop();}});
test('stop clears scheduled drawing and stops sound sources',()=>{const {band}=setup();let stopped=0;band.voices.add({stop(){stopped++;}});band.running=true;band.events=[{time:1,ci:1}];band.stop();assert.equal(stopped,1);assert.equal(band.running,false);assert.equal(band.events.length,0);assert.equal(band.voices.size,0);});
