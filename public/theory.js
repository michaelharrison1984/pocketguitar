export const mod = n => ((n % 12) + 12) % 12;
const sharp = ['C','C♯','D','D♯','E','F','F♯','G','G♯','A','A♯','B'];
const flat = ['C','D♭','D','E♭','E','F','G♭','G','A♭','A','B♭','B'];
export const KEYS = ['C','D♭','D','E♭','E','F','F♯','G','A♭','A','B♭','B'];
const major = [0,2,4,5,7,9,11], minor = [0,2,3,5,7,8,10];
export function note(pc, key=7) { return ([1,3,5,8,10].includes(+key) ? flat : sharp)[mod(pc)]; }
export function scale(key, mode) { return (mode==='minor'?minor:major).map(n=>mod(+key+n)); }
// Spell diatonic scales by letter; this preserves E♯ in F♯ major and B♯ in G♯ minor.
export function scaleNames(key, mode) {
 const names=scale(key,mode), letters=['C','D','E','F','G','A','B'], natural=[0,2,4,5,7,9,11];
 const first=letters.indexOf(KEYS[+key][0]);
 return names.map((pc,i)=>{const j=(first+i)%7;let d=mod(pc-natural[j]);if(d>6)d-=12;return letters[j]+(d>0?'♯'.repeat(d):'♭'.repeat(-d));});
}
export function named(pc,key,mode) {const i=scale(key,mode).indexOf(mod(pc));return i>=0?scaleNames(key,mode)[i]:note(pc,key);}
export function chord(key, mode, degree, sevenths=false) {
 const s=scale(key, mode), d=+degree;
 const tones=[s[d],s[(d+2)%7],s[(d+4)%7]];
 if(sevenths) tones.push(s[(d+6)%7]);
 const third=mod(tones[1]-tones[0]), fifth=mod(tones[2]-tones[0]);
 let suffix=fifth===6?'dim':third===3?'m':'';
 if(sevenths) suffix=fifth===6?'m7♭5':third===3?'m7':mod(tones[3]-tones[0])===11?'maj7':'7';
 let roman=['I','II','III','IV','V','VI','VII'][d];if(third===3)roman=roman.toLowerCase();if(fifth===6)roman+='°';
 return {root:tones[0],tones,name:scaleNames(key,mode)[d]+suffix,roman,intervals:tones.map(x=>mod(x-tones[0]))};
}
export function bluesChord(key,degree){const root=mod(+key+[0,5,7][degree]);return {root,tones:[root,mod(root+4),mod(root+7),mod(root+10)],name:note(root,key)+'7',roman:['I7','IV7','V7'][degree],intervals:[0,4,7,10]};}
export const PRESETS={
 folk:{label:'Folk · open road',mode:'major',patterns:[[0,4,5,3],[0,3,0,4],[0,5,3,4],[0,3,5,4]]},
 country:{label:'Country · homeward',mode:'major',patterns:[[0,3,4,0],[0,5,3,4],[0,0,3,4],[0,3,0,4]]},
 pop:{label:'Major · melodic',mode:'major',patterns:[[0,4,5,3],[5,3,0,4],[0,5,1,4],[0,2,3,4]]},
 minor:{label:'Minor · moody',mode:'minor',patterns:[[0,5,2,6],[0,3,6,0],[0,6,5,6],[0,3,4,0]]},
 blues:{label:'Blues · 12 bar',mode:'major',patterns:[[0,0,0,0,1,1,0,0,2,1,0,2]]}
};
export function makeProgression(key,style,degrees,sevenths){return degrees.map(d=>style==='blues'?bluesChord(key,d):chord(key,PRESETS[style].mode,d,sevenths));}
export function palette(key, mode, type){
 const intervals=type==='pent'?(mode==='minor'?[0,3,5,7,10]:[0,2,4,7,9]):type==='blues'?[0,3,5,6,7,10]:(mode==='minor'?minor:major);
 return intervals.map(i=>mod(+key+i));
}
export function nearestTarget(current,targets){return [...targets].sort((a,b)=>Math.min(mod(a-current),mod(current-a))-Math.min(mod(b-current),mod(current-b)))[0];}
export const intervalName=n=>({0:'Root',3:'♭3',4:'3rd',6:'♭5',7:'5th',10:'♭7',11:'7th'}[n]||'Tone');
