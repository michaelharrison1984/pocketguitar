import {Band} from './audio.js?v=1.3.0';
import {KEYS,note,mod,intervalName} from './theory.js';
import {LICKS,TUNING,midi,phraseFor,lickPlan,beatTime,scoreBeat,tabNote} from './licks.js?v=1.3.0';
const $=id=>document.getElementById(id);
const posText=p=>`string ${p.string+1}, fret ${p.fret}`;
export function initLab({stopJam,getJam,toast}){
 let learnt=[];try{const x=JSON.parse(localStorage.getItem('pocket-guitar-licks-v1')||'[]');if(Array.isArray(x))learnt=x;}catch{}
 let lick=LICKS[0],plan=[],current=0,phrase=[],labOrigin=0,anim=0,lastStep='',pending=false,token=0;
 const labBand=new Band(e=>{if(e.ci<0){$('lickStatus').textContent=`Count in · ${e.beat+1}`;return;}if(current!==e.ci){current=e.ci;showPhrase();}const b=plan[e.ci];$('lickStatus').textContent=`${b.demo?'Listen':'Your turn'} · ${b.chord.name} · beat ${e.beat+1}`;},()=>{$('lickPlay').textContent='▶ Play lick';$('lickStatus').textContent='Stopped — ready for another pass.';cancelAnimationFrame(anim);clearHighlight();});
 function stopAll(){token++;pending=false;labBand.stop();}
 function clearHighlight(){document.querySelectorAll('#lickTab .playing,#lickTab .count-active,#lickBoard .playing').forEach(e=>e.classList.remove('playing','count-active'));}
 function miniBoard(id,items,key,start,end){
  const el=$(id);const frets=Array.from({length:end-start+1},(_,i)=>i+start);el.style.gridTemplateColumns=`26px repeat(${frets.length},minmax(58px,1fr))`;el.style.minWidth=`${26+frets.length*58}px`;
  let html='<div></div>'+frets.map(f=>`<div class="fret-label">${f}</div>`).join('');
  TUNING.forEach((open,string)=>{html+=`<div class="string-label">${['e','B','G','D','A','E'][string]}</div>`;frets.forEach(f=>{const hits=items.filter(x=>x.string===string&&x.fret===f);const target=hits.some(x=>x.target),pitchOnly=hits.every(x=>x.pitchOnly),steps=hits.map(x=>x.step).join(',');html+=`<div class="fret-cell">${hits.length?`<button class="fret-note ${target?'root':'chord'} ${pitchOnly?'pitch-target':''}" data-midi="${open+f}" data-step="${steps}" aria-label="${note(open+f,key)}, string ${string+1}, fret ${f}, step ${steps}${pitchOnly?", bend pitch target: bend from the indicated starting fret":""}">${note(open+f,key)}<small>${steps}</small></button>`:''}</div>`;});});el.innerHTML=html;
  requestAnimationFrame(()=>{const wrap=el.parentElement,buttons=[...el.querySelectorAll('button')];if(!buttons.length||!wrap.clientWidth)return;const xs=buttons.map(b=>b.getBoundingClientRect());const left=Math.min(...xs.map(r=>r.left)),right=Math.max(...xs.map(r=>r.right)),view=wrap.getBoundingClientRect();wrap.scrollLeft+=(right-left<wrap.clientWidth?(left+right)/2-view.left-wrap.clientWidth/2:left-view.left-12);});
  el.querySelectorAll('button').forEach(b=>b.onclick=async()=>{try{stopAll();stopJam();await labBand.init();labBand.volume(getJam().volume/100);await labBand.preview(+b.dataset.midi);}catch{toast('Audio is unavailable.');}});
 }
 function showPhrase(){
  const key=+$('lickKey').value,b=plan[current];phrase=phraseFor(lick,key,b.chord,b.adapt);
  const final=phrase.at(-1).notes[0],pc=mod(midi(final));
  $('lickTarget').textContent=`${b.chord.name} → finish on ${note(pc,key)} (${intervalName(mod(pc-b.chord.root))}) · ${posText(final)}`;
  $('lickProgression').textContent=`Backing: ${plan.filter((_,i)=>$('lickMode').value==='listen'||i%2===0).map(x=>x.chord.name).join(' → ')}. ${b.adapt?'The last note follows each chord’s third.':'The original ending is shown.'}`;
  let html='<table class="music-tab" aria-label="One-bar guitar tab, high e at top"><thead><tr><th>Beat</th>'+Array.from({length:8},(_,i)=>`<th data-count="${i}">${i%2?'&':i/2+1}</th>`).join('')+'</tr></thead><tbody>';
  TUNING.forEach((_,string)=>{html+=`<tr><th scope="row">${['e','B','G','D','A','E'][string]}</th>`;for(let col=0;col<8;col++){const beat=col/2,index=phrase.findIndex(e=>e.beat===beat&&e.notes.some(p=>p.string===string));const event=phrase[index];if(event){const p=event.notes.find(p=>p.string===string);html+=`<td class="note ${index===phrase.length-1?'target':''}" data-event="${index}" title="${tabNote(p)}${event.vibrato?' · vibrato':''}">${tabNote(p)}${event.vibrato?'<small class="vibrato-mark">~</small>':''}</td>`;}else{const held=phrase.some(e=>e.beat<beat&&e.beat+e.duration>beat&&e.notes.some(p=>p.string===string));html+=`<td class="${held?'hold':''}"></td>`;}}html+='</tr>';});$('lickTab').innerHTML=html+'</tbody></table>';
  const items=phrase.flatMap((e,i)=>e.notes.flatMap(p=>[{...p,step:String(i+1),target:i===phrase.length-1},...(p.toFret===undefined?[]:[{...p,fret:p.toFret,step:String(i+1)+(p.tech==='bend'?'b':'→'),target:false,pitchOnly:p.tech==='bend'}])]));const min=Math.max(0,Math.min(...items.map(p=>p.fret))-1),max=Math.min(22,Math.max(...items.map(p=>p.fret))+1);miniBoard('lickBoard',items,key,min,max);
 }
 function refreshLick(){
  current=0;plan=lickPlan(lick,+$('lickKey').value,$('lickMode').value);$('lickTag').textContent=`${lick.genre} · ${lick.level}`;$('lickTitle').textContent=lick.title;
  $('lickDescription').textContent=lick.description+` (Explanation uses the original key, ${KEYS[lick.baseKey]}. Tab, targets and audio follow your selected key.)`;
  $('lickFeel').textContent=`ONE BAR · ${lick.feel==='shuffle'?'SHUFFLE EIGHTHS (LONG–SHORT)':'STRAIGHT EIGHTHS'} · STANDARD TUNING`;$('lickTask').textContent=lick.task;$('lickLearnt').checked=learnt.includes(lick.id);
  $('lickModeHelp').textContent={listen:'Hear one bar over the home chord. Switch off Loop practice for a single play-through.',copy:'One demo bar, then one bar for you over the same chord. The guitar guide is silent in your bar.',adapt:'Each chord gets a demo bar and a copy bar. The final note changes to that chord’s third; watch the target and tab update.'}[$('lickMode').value];showPhrase();
 }
 function animate(){if(!labBand.running)return;const b=(labBand.ctx.currentTime-labOrigin)/(60/labBand.config.bpm);if(b>=0){const phase=scoreBeat(b%4,lick.feel),index=phrase.findIndex(e=>phase>=e.beat&&phase<e.beat+e.duration),half=Math.floor(phase*2),tag=`${current}:${index}:${half}`;if(tag!==lastStep){lastStep=tag;clearHighlight();$('lickTab').querySelector(`[data-count="${half}"]`)?.classList.add('count-active');$('lickTab').querySelectorAll(`[data-event="${index}"]`).forEach(e=>e.classList.add('playing'));$('lickBoard').querySelectorAll('[data-step]').forEach(e=>e.classList.toggle('playing',e.dataset.step.split(',').some(s=>parseInt(s,10)===index+1)));}}anim=requestAnimationFrame(animate);}
 $('lickChoice').innerHTML=LICKS.map((l,i)=>`<option value="${i}">${l.genre} · ${l.title}</option>`).join('');$('lickKey').innerHTML=KEYS.map((k,i)=>`<option value="${i}">${k}</option>`).join('');$('lickKey').value=lick.baseKey;
 for(const id of ['lickChoice','lickKey','lickBpm','lickMode','lickLoop','lickClick'])$(id).addEventListener('change',()=>{stopAll();if(id==='lickChoice'){lick=LICKS[+$('lickChoice').value];$('lickKey').value=lick.baseKey;}refreshLick();});
 $('lickBpm').oninput=()=>$('lickBpmText').textContent=`${$('lickBpm').value} BPM`;
 $('lickLearnt').onchange=()=>{learnt=learnt.filter(id=>id!==lick.id);if($('lickLearnt').checked)learnt.push(lick.id);try{localStorage.setItem('pocket-guitar-licks-v1',JSON.stringify(learnt));}catch{toast('Progress could not be saved in this browser.');}};
 $('lickPlay').onclick=async()=>{
  if(pending||labBand.running){stopAll();return;}stopAll();stopJam();refreshLick();pending=true;const attempt=++token;
  try{await labBand.init();if(attempt!==token)return;await labBand.start({chords:plan.map(b=>b.chord),bpm:+$('lickBpm').value,bars:1,count:true,pattern:'pad',feel:lick.feel,drums:false,click:$('lickClick').checked,loop:$('lickLoop').checked,onSchedule:({ci,beat,time,spb})=>{const b=plan[ci];if(!b.demo)return;const notes=phraseFor(lick,+$('lickKey').value,b.chord,b.adapt);for(const e of notes)if(Math.floor(e.beat)===beat)for(const p of e.notes){const start=beatTime(e.beat,lick.feel),end=beatTime(e.beat+e.duration,lick.feel);labBand.lead(midi(p),time+(start-beat)*spb,(end-start)*spb*(e.gate||.94),{tone:lick.tone,accent:e.accent||1,vibrato:e.vibrato,tech:p.tech,release:p.release,targetMidi:p.toFret===undefined?undefined:TUNING[p.string]+p.toFret});}}});if(attempt!==token){labBand.stop();return;}labBand.volume(getJam().volume/100);labOrigin=labBand.next-labBand.index*(60/labBand.config.bpm);$('lickPlay').textContent='■ Stop lick';lastStep='';animate();}catch{labBand.stop();toast('Audio could not start.');}finally{pending=false;}
 };
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stopAll();});refreshLick();
 return {stop:stopAll,enter(){stopAll();}};
}
