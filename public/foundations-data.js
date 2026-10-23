import {mod,note} from './theory.js';
export const OPEN=[64,59,55,50,45,40];
export const SCALES={
 major:{name:'Major scale',intervals:[0,2,4,5,7,9,11],degrees:['1','2','3','4','5','6','7'],mode:'major',tip:'A seven-note map for major-key melodies. Start and finish on the root; aim for even volume rather than speed.'},
 minor:{name:'Natural minor',intervals:[0,2,3,5,7,8,10],degrees:['1','2','♭3','4','5','♭6','♭7'],mode:'minor',tip:'Hear the minor third: it changes the colour of the scale. Keep the same pulse while crossing strings.'},
 majorPent:{name:'Major pentatonic',intervals:[0,2,4,7,9],degrees:['1','2','3','5','6'],mode:'major',tip:'Five notes, with space for melody. Try three-note phrases over major chords and finish on a chord tone.'},
 minorPent:{name:'Minor pentatonic',intervals:[0,3,5,7,10],degrees:['1','♭3','4','5','♭7'],mode:'minor',tip:'A useful starting point for blues and minor-key solos. Learn the roots so the shape has a musical home.'},
 blues:{name:'Minor blues scale',intervals:[0,3,5,6,7,10],degrees:['1','♭3','4','♭5','5','♭7'],mode:'minor',tip:'The flat fifth is a passing colour. Move through it and resolve to a chord tone rather than resting on it.'}
};
export function scaleNotes(key,type){return SCALES[type].intervals.map(n=>mod(+key+n));}
export function scaleRoute(key,type,start=0,end=5){
 const pool=[];OPEN.forEach((open,string)=>{for(let fret=start;fret<=end;fret++)pool.push({string,fret,midi:open+fret});});
 const roots=pool.filter(p=>mod(p.midi)===+key).sort((a,b)=>a.midi-b.midi||a.fret-b.fret);
 for(const root of roots){const notes=[...SCALES[type].intervals,12].map(n=>root.midi+n);let route=[root];let valid=true;
  for(const m of notes.slice(1)){const last=route.at(-1);const choices=pool.filter(p=>p.midi===m);const cost=p=>start===0?p.fret+Math.abs(p.string-last.string):Math.abs(p.string-last.string)*3+Math.abs(p.fret-last.fret);choices.sort((a,b)=>cost(a)-cost(b));if(!choices.length){valid=false;break;}route.push(choices[0]);}
  if(valid)return route;
 }
 return [];
}
export function scaleSequence(route,direction){if(direction==='down')return [...route].reverse();if(direction==='both')return [...route,...route.slice(0,-1).reverse()];return [...route];}
export const QUALITIES={dim:{label:'Diminished',suffix:'dim',intervals:[0,3,6]},halfDim:{label:'Minor 7 flat 5',suffix:'m7♭5',intervals:[0,3,6,10]},major:{label:'Major',suffix:'',intervals:[0,4,7]},minor:{label:'Minor',suffix:'m',intervals:[0,3,7]},seven:{label:'Dominant 7',suffix:'7',intervals:[0,4,7,10]},maj7:{label:'Major 7',suffix:'maj7',intervals:[0,4,7,11]},min7:{label:'Minor 7',suffix:'m7',intervals:[0,3,7,10]},sus2:{label:'Sus2',suffix:'sus2',intervals:[0,2,7]},sus4:{label:'Sus4',suffix:'sus4',intervals:[0,5,7]}};
// Frets and finger numbers run low E to high e. -1 = mute, 0 = open.
const SHAPES={
 '0:major':[[-1,3,2,0,1,0],[0,3,2,0,1,0]],'2:major':[[-1,-1,0,2,3,2],[0,0,0,1,3,2]],'4:major':[[0,2,2,1,0,0],[0,2,3,1,0,0]],'7:major':[[3,2,0,0,0,3],[2,1,0,0,0,3]],'9:major':[[-1,0,2,2,2,0],[0,0,1,2,3,0]],
 '2:minor':[[-1,-1,0,2,3,1],[0,0,0,2,3,1]],'4:minor':[[0,2,2,0,0,0],[0,2,3,0,0,0]],'9:minor':[[-1,0,2,2,1,0],[0,0,2,3,1,0]],
 '0:seven':[[-1,3,2,3,1,0],[0,3,2,4,1,0]],'2:seven':[[-1,-1,0,2,1,2],[0,0,0,2,1,3]],'4:seven':[[0,2,0,1,0,0],[0,2,0,1,0,0]],'7:seven':[[3,2,0,0,0,1],[3,2,0,0,0,1]],'9:seven':[[-1,0,2,0,2,0],[0,0,1,0,2,0]],'11:seven':[[-1,2,1,2,0,2],[0,2,1,3,0,4]],
 '0:maj7':[[-1,3,2,0,0,0],[0,3,2,0,0,0]],'2:maj7':[[-1,-1,0,2,2,2],[0,0,0,1,1,1]],'9:maj7':[[-1,0,2,1,2,0],[0,0,2,1,3,0]],
 '2:min7':[[-1,-1,0,2,1,1],[0,0,0,2,1,1]],'4:min7':[[0,2,0,0,0,0],[0,2,0,0,0,0]],'9:min7':[[-1,0,2,0,1,0],[0,0,2,0,1,0]],
 '2:sus2':[[-1,-1,0,2,3,0],[0,0,0,1,3,0]],'9:sus2':[[-1,0,2,2,0,0],[0,0,1,2,0,0]],
 '2:sus4':[[-1,-1,0,2,3,3],[0,0,0,1,3,4]],'4:sus4':[[0,2,2,2,0,0],[0,2,3,4,0,0]],'9:sus4':[[-1,0,2,2,3,0],[0,0,1,2,3,0]]
};
const E={major:[0,2,2,1,0,0],minor:[0,2,2,0,0,0],seven:[0,2,0,1,0,0],min7:[0,2,0,0,0,0],sus4:[0,2,2,2,0,0]};
const A={dim:[-1,0,1,2,1,-1],halfDim:[-1,0,1,0,1,-1],major:[-1,0,2,2,2,0],minor:[-1,0,2,2,1,0],seven:[-1,0,2,0,2,0],min7:[-1,0,2,0,1,0],maj7:[-1,0,2,1,2,0],sus2:[-1,0,2,2,0,0],sus4:[-1,0,2,2,3,0]};
export function chordShape(key,quality,voicing='easy'){
 key=+key;const q=QUALITIES[quality],tones=q.intervals.map(i=>mod(key+i)),open=voicing==='easy'?SHAPES[`${key}:${quality}`]:null;
 let frets,fingers,barre=null,kind;
 if(open){[frets,fingers]=open;kind='Open position';}
 else {const er=mod(key-4),ar=mod(key-9),useE=E[quality]&&er<=ar,base=useE?er:ar,template=useE?E[quality]:A[quality];frets=template.map(f=>f<0?-1:f+base);const af={major:[0,1,3,3,3,1],minor:[0,1,3,4,2,1],seven:[0,1,3,1,4,1],min7:[0,1,3,1,2,1],maj7:[0,1,3,2,4,1],sus2:[0,1,3,4,1,1],sus4:[0,1,3,3,4,1],dim:[0,1,2,4,3,0],halfDim:[0,1,2,1,3,0]};fingers=template.map((f,i)=>f<0?0:f===0?(base===0?0:1):useE?(quality==='sus4'?(i===3?4:3):(i===1?3:i===2?4:2)):af[quality][i]);if(base>0)barre={fret:base,from:useE?0:1,to:template.findLastIndex(f=>f>=0)};kind=`${useE?'E':'A'}-shape ${base?'barre':'open'}`;}
 return {root:key,tones,intervals:q.intervals,name:note(key,key)+q.suffix,frets:[...frets],fingers:[...fingers],barre,kind,quality};
}
export function shapePitches(shape){return shape.frets.flatMap((f,i)=>f<0?[]:[OPEN[5-i]+f]);}
export function qualityFor(chord){const ints=chord.tones.map(n=>mod(n-chord.root));return Object.keys(QUALITIES).find(q=>JSON.stringify(QUALITIES[q].intervals)===JSON.stringify(ints))||null;}
export const PROGRESSIONS=[
 {id:'two',title:'First changes · E–A',level:'Beginner',key:4,style:'folk',degrees:[0,3,0,3],bpm:55,bars:2,tip:'One downstroke on beat 1. Use the remaining beats to prepare the next shape.'},
 {id:'minor-two',title:'Minor changes · Em–Am',level:'Beginner',key:4,style:'minor',degrees:[0,3,0,3],bpm:55,bars:2,tip:'Pick each string slowly to find muted notes, then switch on the beat.'},
 {id:'open',title:'Four open chords · G–Em–C–D',level:'Beginner',key:7,style:'folk',degrees:[0,5,3,4],bpm:60,bars:2,tip:'Keep the pulse moving. Aim for clean changes before adding a strum pattern.'},
 {id:'country',title:'Country changes · G–C–D–G',level:'Improver',key:7,style:'country',degrees:[0,3,4,0],bpm:70,bars:1,tip:'Alternate bass notes and light strums. Avoid rushing into the D chord.'},
 {id:'minor',title:'Minor song loop · Am–F–C–G',level:'Improver',key:9,style:'minor',degrees:[0,5,2,6],bpm:65,bars:1,tip:'Work on the F barre slowly. Reduce tempo if the change breaks the pulse.'},
 {id:'sevenths',title:'Seventh colours · Cmaj7–Am7–Dm7–G7',level:'Intermediate',key:0,style:'folk',degrees:[0,5,1,4],sevenths:true,bpm:70,bars:1,tip:'Hear the extra colour of each seventh. Try a softer touch and let the notes ring.'},
 {id:'blues',title:'12-bar A blues',level:'Intermediate',key:9,style:'blues',degrees:[0,0,0,0,1,1,0,0,2,1,0,2],bpm:75,bars:1,tip:'Use the dominant seventh shapes and keep the shuffle pulse relaxed.'}
];
export const ROUTINES={
 beginner:{label:'Beginner',summary:'Learn a small scale shape, two clean chord changes, then keep time.',stages:[
 {minutes:2,title:'Settle into the pulse',text:'Play open strings gently with the click. Keep your hands relaxed.',action:{tab:'scales',key:7,type:'major',box:0,bpm:50}},
 {minutes:5,title:'G major · E shape',text:'Follow the numbered route. Play one note per beat; repeat slowly before hiding the names.',action:{tab:'scales',key:7,type:'major',box:0,bpm:55}},
 {minutes:6,title:'Two-chord changes',text:'Learn E and A, then allow two bars for each chord. Aim for a clean beat 1.',action:{tab:'chords',progression:'two'}},
 {minutes:5,title:'Four open chords',text:'Try G–Em–C–D with one strum per bar. Slow down if the pulse stops.',action:{tab:'chords',progression:'open'}},
 {minutes:2,title:'Keep one discovery',text:'Write down the chord change or scale note that needs another go.',action:{tab:'journal'}}]},
 improver:{label:'Improver',summary:'Join scale shapes, steadier chord changes and a short melodic phrase.',stages:[
 {minutes:3,title:'Minor pentatonic control',text:'Play A minor pentatonic up and down. Keep every note the same length.',action:{tab:'scales',key:9,type:'minorPent',box:0,bpm:65}},
 {minutes:5,title:'Major scale confidence',text:'Use the E-shape box of G major. Say the notes, then test yourself with hidden names.',action:{tab:'scales',key:7,type:'major',box:0,bpm:65}},
 {minutes:5,title:'Steady country changes',text:'Play G–C–D–G. Keep your right hand moving through the changes.',action:{tab:'chords',progression:'country'}},
 {minutes:5,title:'Learn a short phrase',text:'Use the rolling folk answer. Listen first, then copy without adding extra notes.',action:{tab:'licklab',lick:0,mode:'copy',bpm:60}},
 {minutes:2,title:'Keep one discovery',text:'Record your comfortable tempo and one thing to improve.',action:{tab:'journal'}}]},
 intermediate:{label:'Intermediate',summary:'Connect scales to chord tones, seventh chords and expressive phrasing.',stages:[
 {minutes:3,title:'Blues scale, deliberate roots',text:'Use Box 1 of A blues. Pass through the flat fifth and settle on A.',action:{tab:'scales',key:9,type:'blues',box:0,bpm:75}},
 {minutes:5,title:'Seventh chord colours',text:'Practise Cmaj7–Am7–Dm7–G7. Listen for the thirds and sevenths.',action:{tab:'chords',progression:'sevenths'}},
 {minutes:5,title:'Follow the next third',text:'Play over G–D–Em–C with upcoming thirds visible. Resolve as the chord changes.',action:{tab:'jam',key:7,style:'folk',degrees:[0,4,5,3],showUpcoming:true,upcomingMode:'third',box:0,jamView:'tones',bpm:75}},
 {minutes:5,title:'Adapt a blues phrase',text:'Try the major-landing blues lick in Adapt mode. Keep the bend in tune and change the ending.',action:{tab:'licklab',lick:4,mode:'adapt',bpm:65}},
 {minutes:2,title:'Keep one discovery',text:'Write a phrase or target-note connection you want to remember.',action:{tab:'journal'}}]}
};
