import test from 'node:test';
import assert from 'node:assert/strict';
import {upcomingTones} from '../public/upcoming.js';
import {makeProgression,PRESETS} from '../public/theory.js';
test('upcoming selector covers all/root/third/off for every key and progression',()=>{
 for(let k=0;k<12;k++)for(const [style,preset] of Object.entries(PRESETS))for(const ds of preset.patterns){
  const p=makeProgression(k,style,ds,true);for(let i=0;i<p.length;i++){const next=p[(i+1)%p.length];assert.deepEqual(upcomingTones(next,'all'),next.tones);assert.deepEqual(upcomingTones(next,'root'),[next.root]);assert.deepEqual(upcomingTones(next,'third'),[next.tones[1]]);assert.deepEqual(upcomingTones(next,'third',false),[]);}
 }
});
test('shared tones retain their membership of the current chord',()=>{const [g,c]=makeProgression(7,'folk',[0,3],false);const next=upcomingTones(c);assert.deepEqual(next.filter(pc=>g.tones.includes(pc)),[7]);assert.deepEqual(upcomingTones(c,'third'),[4]);});
