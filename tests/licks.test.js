import test from 'node:test';
import assert from 'node:assert/strict';
import {LICKS,transposeEvents,phraseFor,lickPlan,midi,connection} from '../public/licks.js';
import {makeProgression,mod,PRESETS} from '../public/theory.js';
import {ink,PALETTES} from '../public/appearance.js';
test('all phrases preserve pitch intervals and timing in every key',()=>{
 for(const l of LICKS)for(let key=0;key<12;key++){
  const events=transposeEvents(l,key),shift=mod(key-l.baseKey);assert.ok(events.length>=4);
  events.forEach((e,i)=>{assert.ok(e.beat>=0&&e.beat+e.duration<=4);assert.ok(e.beat*2===Math.floor(e.beat*2));assert.equal(e.beat,l.events[i].beat);e.notes.forEach((p,j)=>{assert.ok(p.fret>=0&&p.fret<=22);assert.equal(midi(p)-midi(l.events[i].notes[j]),shift);});});
 }
});
test('every adapted phrase ends on the current chord third without changing its opening',()=>{
 for(const l of LICKS)for(let key=0;key<12;key++)for(const bar of lickPlan(l,key,'adapt')){
  const events=phraseFor(l,key,bar.chord,true);assert.equal(mod(midi(events.at(-1).notes[0])),bar.chord.tones[1]);assert.deepEqual(events.slice(0,-1),transposeEvents(l,key).slice(0,-1));assert.ok(events.at(-1).notes[0].fret<=22);
 }
});
test('listen, copy and adapt plans give silent answer bars over the same chord',()=>{
 for(const l of LICKS){assert.equal(lickPlan(l,l.baseKey,'listen').length,1);for(const mode of ['copy','adapt']){const p=lickPlan(l,l.baseKey,mode);assert.equal(p.length,mode==='copy'?2:8);for(let i=0;i<p.length;i+=2){assert.equal(p[i].demo,true);assert.equal(p[i+1].demo,false);assert.equal(p[i].chord.name,p[i+1].chord.name);}}}
});
test('original endings are tonic thirds in every phrase',()=>{
 for(const l of LICKS){const chord=lickPlan(l,l.baseKey,'listen')[0].chord;assert.equal(mod(midi(l.events.at(-1).notes[0])),chord.tones[1]);}
});
test('same-string trainer gives valid chord tones across styles, keys and windows',()=>{
 for(const style of Object.keys(PRESETS))for(let key=0;key<12;key++){
  const chords=makeProgression(key,style,PRESETS[style].patterns[0],false);
  for(let i=0;i<chords.length;i++)for(const start of [0,3,5,7,12]){
   const from=chords[i],to=chords[(i+1)%chords.length],p=connection(from,to,start,start+7);
   assert.ok(p);assert.equal(p.from.string,p.to.string);assert.equal(mod(midi(p.from)),from.tones[1]);assert.equal(mod(midi(p.to)),to.root);for(const n of [p.from,p.to])assert.ok(n.fret>=start&&n.fret<=start+7);
  }
 }
});
function luminance(hex){const v=hex.match(/[a-f\d]{2}/gi).map(n=>parseInt(n,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);return v[0]*.2126+v[1]*.7152+v[2]*.0722;}
test('automatic text colour maintains at least 4.5:1 contrast',()=>{
 const values=[...Object.values(PALETTES).flatMap(p=>Object.values(p))];for(let r=0;r<=255;r+=17)for(let g=0;g<=255;g+=17)for(let b=0;b<=255;b+=17)values.push('#'+[r,g,b].map(x=>x.toString(16).padStart(2,'0')).join(''));
 for(const hex of values){const a=luminance(hex),b=luminance(ink(hex));assert.ok((Math.max(a,b)+.05)/(Math.min(a,b)+.05)>=4.5);}
});
