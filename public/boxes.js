import {mod,note} from './theory.js';
// Five connected CAGED major-scale shapes. Offsets from the major tonic on low E.
// Arrays run low E to high e; positions are a fingering pattern, not a rectangular window.
const MAJOR=[
 {name:'E shape',frets:[[-1,0,2],[-1,0,2],[-1,1,2],[-1,1,2],[0,2],[-1,0,2]]},
 {name:'D shape',frets:[[2,4,5],[2,4],[1,2,4],[1,2,4],[2,4,5],[2,4,5]]},
 {name:'C shape',frets:[[4,5,7],[4,6,7],[4,6,7],[4,6],[4,5,7],[4,5,7]]},
 {name:'A shape',frets:[[7,9],[6,7,9],[6,7,9],[6,8,9],[7,9,10],[7,9]]},
 {name:'G shape',frets:[[9,11,12],[9,11,12],[9,11],[8,9,11],[9,10,12],[9,11,12]]}
];
const OPEN=[40,45,50,55,59,64];
const INTERVALS={major:[0,2,4,5,7,9,11],majorPent:[0,2,4,7,9],minor:[0,2,3,5,7,8,10],minorPent:[0,3,5,7,10],blues:[0,3,5,6,7,10]};
export function boxNames(type){return type==='major'||type==='majorPent'?MAJOR.map(s=>s.name):[1,2,3,4,5].map(n=>`Box ${n}`);}
export function scaleBox(key,type='minorPent',index=0,octave=0){
 key=mod(+key);if(!INTERVALS[type])type='minorPent';index=Math.max(0,Math.min(4,Number(index)||0));
 const minor=!['major','majorPent'].includes(type),majorIndex=minor?[4,0,1,2,3][index]:index;
 const tonic=mod(key-4),base=minor?tonic+3-(index===0?12:0):tonic;
 let positions=MAJOR[majorIndex].frets.flatMap((frets,s)=>frets.map(f=>({string:5-s,fret:f+base,midi:OPEN[s]+f+base}))).filter(p=>INTERVALS[type].includes(mod(p.midi-key)));
 if(type==='blues'){
  const min=Math.min(...positions.map(p=>p.fret)),max=Math.max(...positions.map(p=>p.fret));
  for(let s=0;s<6;s++)for(let f=min;f<=max+1;f++)if(mod(OPEN[5-s]+f-key)===6&&positions.some(p=>p.string===s&&Math.abs(p.fret-f)===1)&&!positions.some(p=>p.string===s&&p.fret===f))positions.push({string:s,fret:f,midi:OPEN[5-s]+f});
 }
 let shift=0;while(Math.min(...positions.map(p=>p.fret))+shift<0)shift+=12;
 while(Math.max(...positions.map(p=>p.fret))+shift>22&&Math.min(...positions.map(p=>p.fret))+shift>=12)shift-=12;
 if(octave===1&&Math.max(...positions.map(p=>p.fret))+shift+12<=22)shift+=12;
 positions=positions.map(p=>({...p,fret:p.fret+shift,midi:p.midi+shift,root:mod(p.midi)===key})).sort((a,b)=>b.string-a.string||a.fret-b.fret);
 const start=Math.min(...positions.map(p=>p.fret)),end=Math.max(...positions.map(p=>p.fret));
 const roots=positions.filter(p=>p.root),name=boxNames(type)[index];
 return {key,type,index,name,positions,roots,start,end,description:`${name} · frets ${start}–${end} · ${note(key,key)} roots: ${roots.map(p=>`S${p.string+1}/${p.fret}`).join(', ')}`};
}
export function boxOptions(key,type){return boxNames(type).map((name,i)=>{const b=scaleBox(key,type,i);return {value:String(i),label:name};});}
export function jamScaleType(style,scale){if(scale==='blues')return 'blues';const minor=style==='minor';return scale==='full'||scale==='tones'?(minor?'minor':'major'):(minor?'minorPent':'majorPent');}
export function closestBox(key,type,items){return [0,1,2,3,4].flatMap(i=>[0,1].map(o=>scaleBox(key,type,i,o))).sort((a,b)=>score(b)-score(a))[0];function score(b){return items.reduce((v,p)=>v+(b.positions.some(n=>n.string===p.string&&n.fret===p.fret)?20:0)-Math.min(...b.positions.map(n=>Math.abs(n.fret-p.fret))),0);}}
