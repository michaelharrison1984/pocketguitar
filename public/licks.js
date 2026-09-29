import {mod,makeProgression} from './theory.js';
export const TUNING=[64,59,55,50,45,40];
const ev=(beat,duration,string,fret,extra={})=>({beat,duration,notes:[{string,fret}],...extra});
const move=(beat,duration,string,fret,toFret,tech,extra={})=>({beat,duration,notes:[{string,fret,toFret,tech,...extra}]});
export const LICKS=[
 {id:'folk-answer-v2',title:'A rolling folk answer',genre:'Folk',level:'Hammer-on & space',baseKey:7,style:'folk',degrees:[0,3,4,0],feel:'straight',tone:'warm',
  description:'Start with a D-to-E hammer-on, answer with G and D, then settle on B, the third of G. The legato opening gives the phrase a flowing feel.',
  task:'Pick the first note of 3h5 once, then hammer your finger firmly onto fret 5. Keep the gap before the final note. Adapt mode changes only that final target.',
  events:[move(0,1,1,3,5,'hammer'),ev(1,.5,1,8,{accent:1.05}),ev(1.5,.5,2,7),move(2,.5,1,5,3,'pull'),ev(3,1,2,4,{vibrato:true})]},
 {id:'country-pairs-v2',title:'Pedal-steel country answer',genre:'Country',level:'Held double-stop bend',baseKey:7,style:'country',degrees:[0,3,4,0],feel:'straight',tone:'twang',
  description:'Hold D on the high e string while bending A up a whole tone to B on the B string. That moving note against a held note is the pedal-steel colour. Finish on B over G.',
  task:'Play the B-string target at fret 12 first to hear the pitch. Then bend fret 10 up to that sound while keeping high e fret 10 steady. The tab’s b12 is a pitch target, not a finger move to fret 12.',
  events:[{beat:0,duration:1.5,notes:[{string:1,fret:10,toFret:12,tech:'bend'},{string:0,fret:10}],accent:1.1},ev(1.5,.5,0,7,{gate:.5}),move(2,1,1,8,7,'pull'),ev(3,1,0,7,{vibrato:true})]},
 {id:'major-run-v2',title:'Chicken-pickin’ snap',genre:'Country',level:'Short accents & hammer-ons',baseKey:7,style:'country',degrees:[0,3,4,0],feel:'straight',tone:'twang',
  description:'A G-to-A hammer-on leads into short, bright B and D notes. A quick B♭-to-B hammer-on adds a chromatic country approach before the final B.',
  task:'Keep the short picked notes clipped, not rushed. Try pick on the G string and middle finger on the B string; the demo uses a brighter attack, but no picking technique is mandatory.',
  events:[move(0,1,3,5,7,'hammer'),ev(1,.5,2,4,{gate:.4,accent:1.2}),ev(1.5,.5,2,7,{gate:.4,accent:1.15}),ev(2,.5,1,5,{gate:.45}),move(2.5,.5,2,3,4,'hammer'),ev(3,1,0,7,{vibrato:true})]},
 {id:'minor-answer-v2',title:'Minor blues bend & reply',genre:'Blues',level:'Shuffle · bend & release',baseKey:9,style:'minor',degrees:[0,3,6,0],feel:'shuffle',tone:'blues',
  description:'Bend D up to E and release it, answer with E and A, then pull G down to E. The final C is Am’s minor third. Long–short eighths and vibrato give the line its blues feel.',
  task:'Keep your finger at fret 7 for 7b9r7: bend to the pitch of fret 9, then release to the original pitch. Pick only once. Slow the phrase down until the bend reaches E cleanly.',
  events:[move(0,1,2,7,9,'bend',{release:true}),ev(1,.5,1,5),ev(1.5,.5,0,5,{accent:1.1}),move(2,1,1,8,5,'pull'),ev(3,1,2,5,{vibrato:true})]},
 {id:'blues-resolve-v2',title:'Blues bite, major landing',genre:'Blues',level:'Shuffle · slide & blue third',baseKey:9,style:'blues',degrees:[0,1,0,2],feel:'shuffle',tone:'blues',
  description:'Hammer C into C♯ over A7, slide D up to E, then bend G up to A and release. The final C♯ makes the dominant chord sound settled after the blues tension.',
  task:'Listen to the difference between C and C♯. For the slide, keep finger pressure on the G string as you move from fret 7 to 9. Keep the rhythm relaxed rather than squeezing in extra notes.',
  events:[move(0,1,2,5,6,'hammer'),ev(1,.5,3,7,{gate:.65}),move(1.5,.5,2,7,9,'slide'),move(2,1,1,8,10,'bend',{release:true}),ev(3,1,2,6,{vibrato:true})]},
 {id:'folk-descent-v2',title:'Sliding folk descent',genre:'Folk',level:'Slide & pull-off',baseKey:7,style:'folk',degrees:[0,4,5,3],feel:'straight',tone:'warm',
  description:'Slide E up to G, then pull F♯ off to E and answer with D. A little space before B lets the major third sound like an arrival rather than another scale note.',
  task:'For 5/8, pick once and slide. For 7p5, hold fret 5 before pulling away from fret 7. Keep the slide in time; it should lead into the phrase, not delay the whole bar.',
  events:[move(0,1,1,5,8,'slide'),move(1,1,1,7,5,'pull'),ev(2,.5,2,7),ev(3,1,2,4,{vibrato:true})]}
];
export const midi=p=>TUNING[p.string]+p.fret;
export function transposeEvents(lick,key){
 let shift=mod(Number(key)-lick.baseKey);
 const frets=lick.events.flatMap(e=>e.notes.flatMap(p=>[p.fret,...(p.toFret===undefined?[]:[p.toFret])]));
 if(Math.max(...frets)+shift>22&&Math.min(...frets)+shift-12>=0)shift-=12;
 return lick.events.map(e=>({...e,notes:e.notes.map(p=>({...p,fret:p.fret+shift,...(p.toFret===undefined?{}:{toFret:p.toFret+shift})}))}));
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
// Straight score positions are mapped onto a long–short shuffle grid for playback.
export function beatTime(beat,feel='straight'){
 const whole=Math.floor(beat),part=beat-whole;
 return feel==='shuffle'?whole+(part<=.5?part*4/3:2/3+(part-.5)*2/3):beat;
}
export function scoreBeat(time,feel='straight'){
 const whole=Math.floor(time),part=time-whole;
 return feel==='shuffle'?whole+(part<=2/3?part*3/4:.5+(part-2/3)*3/2):time;
}
export function tabNote(p){
 if(!p.tech||p.toFret===undefined)return String(p.fret);
 const mark={hammer:'h',pull:'p',slide:p.toFret>p.fret?'/':'\\',bend:'b'}[p.tech];
 return `${p.fret}${mark}${p.toFret}${p.release?'r'+p.fret:''}`;
}
