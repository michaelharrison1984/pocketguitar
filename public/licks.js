import {mod,makeProgression} from './theory.js';
export const TUNING=[64,59,55,50,45,40];
const ev=(beat,duration,string,fret)=>({beat,duration,notes:[{string,fret}]});
export const LICKS=[
 {id:'folk-answer',title:'A little folk answer',genre:'Folk',level:'Start here',baseKey:7,style:'folk',degrees:[0,3,4,0],
  description:'A major-pentatonic phrase with a little space before the ending. The final B is the third of G, giving the phrase a clear major sound.',
  task:'Sing it, copy it, then repeat its rhythm with a different first note. In Adapt mode, keep the rhythm and land on the new chord’s third.',
  events:[ev(0,.5,2,7),ev(.5,.5,1,5),ev(1,1,1,8),ev(2,.5,1,5),ev(3,1,0,7)]},
 {id:'country-pairs',title:'Country in pairs',genre:'Country',level:'Double-stops',baseKey:7,style:'country',degrees:[0,3,4,0],
  description:'Pick the top two strings together. The opening D–G pair belongs to G; E–A adds movement. Finish on D–G again, then answer with the major third, B.',
  task:'Keep both notes equally clear. Play the pairs lightly, then let the single target note speak. The last single note changes in Adapt mode.',
  events:[{beat:0,duration:.5,notes:[{string:0,fret:3},{string:1,fret:3}]},{beat:.5,duration:.5,notes:[{string:0,fret:5},{string:1,fret:5}]},{beat:1.5,duration:1,notes:[{string:0,fret:3},{string:1,fret:3}]},ev(3,1,2,4)]},
 {id:'major-run',title:'Walk into the third',genre:'Country',level:'Chord-tone run',baseKey:7,style:'country',degrees:[0,3,4,0],
  description:'G–A–B, then D–E–D–B. The run starts on the root and finishes on the third. Keep the eighth notes even; speed is optional.',
  task:'Accent the final note, not every note. Then shorten the phrase while keeping its arrival in the same place.',
  events:[ev(0,.5,3,5),ev(.5,.5,3,7),ev(1,.5,2,4),ev(1.5,.5,2,7),ev(2,.5,1,5),ev(2.5,.5,2,7),ev(3,1,2,4)]},
 {id:'minor-answer',title:'Minor-pentatonic reply',genre:'Blues',level:'Space & phrasing',baseKey:9,style:'minor',degrees:[0,3,6,0],
  description:'A–C–D–E, then back to C. Over Am, C is a chord tone: the minor third. Give the phrase a breath before its final note.',
  task:'Copy the rhythm before adding expression. Try starting on beat 2 instead, then invent a shorter reply.',
  events:[ev(0,.5,3,7),ev(.5,.5,2,5),ev(1,.5,2,7),ev(1.5,1,1,5),ev(3,1,2,5)]},
 {id:'blues-resolve',title:'Blues tension, clear ending',genre:'Blues',level:'Major / minor colour',baseKey:9,style:'blues',degrees:[0,1,0,2],
  description:'C gives A7 a bluesy minor-third colour. C♯ at the end is A7’s actual major third. Pick both notes cleanly first so you can hear the resolution.',
  task:'Compare C with C♯ over A7. When you can hear the difference, try sliding from fret 5 to 6 on the G string for your own variation.',
  events:[ev(0,.5,2,5),ev(.5,.5,2,7),ev(1,1,1,5),ev(2,.5,2,5),ev(3,1,2,6)]},
 {id:'folk-descent',title:'A descending melody',genre:'Folk',level:'Major scale',baseKey:7,style:'folk',degrees:[0,4,5,3],
  description:'G–F♯–E–D followed by B. This uses the major scale, with passing notes leading down to a settled chord tone.',
  task:'Keep the descending line quiet, then lean into the ending. Hum a different answer before finding it on the guitar.',
  events:[ev(0,.5,1,8),ev(.5,.5,1,7),ev(1,.5,1,5),ev(1.5,1,2,7),ev(3,1,2,4)]}
];
export const midi=p=>TUNING[p.string]+p.fret;
export function transposeEvents(lick,key){
 const shift=mod(Number(key)-lick.baseKey);
 return lick.events.map(e=>({...e,notes:e.notes.map(p=>({...p,fret:p.fret+shift}))}));
}
export function nearestPosition(pc,reference,min=0,max=22){
 const choices=[];TUNING.forEach((open,string)=>{for(let fret=min;fret<=max;fret++)if(mod(open+fret)===mod(pc))choices.push({string,fret});});
 choices.sort((a,b)=>(Math.abs(a.fret-reference.fret)+Math.abs(a.string-reference.string)*3+Math.abs(midi(a)-midi(reference))*.2)-(Math.abs(b.fret-reference.fret)+Math.abs(b.string-reference.string)*3+Math.abs(midi(b)-midi(reference))*.2));
 return choices[0];
}
export function phraseFor(lick,key,chord,adapt=false){
 const events=transposeEvents(lick,key);
 if(adapt){const last=events.at(-1);last.notes=[nearestPosition(chord.tones[1],last.notes[0])];}
 return events;
}
export function lickPlan(lick,key,mode){
 const progression=makeProgression(+key,lick.style,lick.degrees,false);
 const tonic=makeProgression(+key,lick.style,[0],false)[0];
 if(mode==='listen')return [{chord:tonic,demo:true,adapt:false}];
 const chords=mode==='copy'?[tonic]:progression;
 return chords.flatMap(chord=>[{chord,demo:true,adapt:mode==='adapt'},{chord,demo:false,adapt:mode==='adapt'}]);
}
export function connection(from,to,start=3,end=10,source='third',target='root'){
 const sources=source==='third'?[from.tones[1]]:source==='root'?[from.root]:from.tones;
 const targets=target==='third'?[to.tones[1]]:target==='root'?[to.root]:to.tones;
 const choices=[];
 TUNING.forEach((open,string)=>{for(let a=start;a<=end;a++)if(sources.includes(mod(open+a)))for(let b=start;b<=end;b++)if(targets.includes(mod(open+b)))choices.push({from:{string,fret:a},to:{string,fret:b},distance:Math.abs(a-b)});});
 choices.sort((a,b)=>a.distance-b.distance||Math.abs(a.from.fret-(start+end)/2)-Math.abs(b.from.fret-(start+end)/2)||a.from.string-b.from.string);
 return choices[0]||null;
}
