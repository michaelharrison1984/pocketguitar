import test from 'node:test';
import assert from 'node:assert/strict';
import {diagram} from '../public/foundations.js';
test('horizontal chord diagram retains high e at top and low E at bottom',()=>{
 const svg=diagram({name:'G',kind:'major',root:7,frets:[3,2,0,0,0,3],fingers:[2,1,0,0,0,3]});
 assert.match(svg,/viewBox="0 0/);
 assert.ok(svg.indexOf('>e</text>')<svg.indexOf('>E</text>'));
 assert.match(svg,/High E at top/);
 assert.equal((svg.match(/<circle /g)||[]).length,3);
});
