import {scaleBox,boxOptions,jamScaleType} from './boxes.js?v=1.5.0';
import {chordShape,qualityFor} from './foundations-data.js?v=1.5.0';
import {initWake} from './wake.js?v=1.5.0';
import {initFoundations,diagram} from './foundations.js?v=1.5.0';
import {initPractice} from './practice.js?v=1.5.0';
import {MIX_DEFAULTS,MIX_PRESETS,normalMix} from './sound.js?v=1.5.0';
import {upcomingTones} from './upcoming.js?v=1.5.0';
import {initAppearance} from './appearance.js?v=1.5.0';
import {initLab} from './lab.js?v=1.5.0';
import {KEYS,PRESETS,mod,note,named,makeProgression,palette,nearestTarget,intervalName} from './theory.js';
import {Band} from './audio.js?v=1.5.0';
import {lessons} from './lessons.js?v=1.5.0';
const $=id=>document.getElementById(id);
let memory={};try{memory=JSON.parse(localStorage.getItem('pocket-guitar-v1')||'{}')||{};}catch{}
const defaults={...MIX_DEFAULTS,mixPreset:'custom',key:7,style:'folk',bpm:80,bars:1,feel:'straight',pattern:'strum',sevenths:false,drums:true,click:false,count:true,volume:65,focus:'all',scale:'pent',box:'0',jamView:'tones',labels:'notes',lefty:false,showUpcoming:false,upcomingMode:'all',degrees:[0,4,5,3]};
let state={...defaults,...memory.settings},active=0,saves=Array.isArray(memory.saves)?memory.saves:[],journal=Array.isArray(memory.journal)?memory.journal:[];
if(!PRESETS[state.style])state.style='folk';
if(!Number.isInteger(+state.key)||state.key<0||state.key>11)state.key=7;
if(!Array.isArray(state.degrees)||!state.degrees.length||state.degrees.some(d=>!Number.isInteger(d)||d<0||d>(state.style==='blues'?2:6)))state.degrees=[...PRESETS[state.style].patterns[0]];
let lab=null,foundations=null;
state={...state,...normalMix(state)};
let chords=[],lastPreset=0,toastTimer,starting=false;
function toast(t){$('toast').textContent=t;$('toast').style.display='block';clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').style.display='none',3200);}
function persist(){try{localStorage.setItem('pocket-guitar-v1',JSON.stringify({settings:state,saves,journal}));}catch{toast('Browser storage is unavailable or full. Changes remain for this visit.');}}
function label(pc){return named(pc,+state.key,PRESETS[state.style].mode);}
const band=new Band(e=>{if(e.ci<0){$('playStatus').textContent=`Count in · ${e.beat+1}`;}else{if(active!==e.ci){active=e.ci;renderTargets();highlight();}$('playStatus').textContent=`${chords[active].name} · bar ${e.bar}/${state.bars} · beat ${e.beat+1}`;}[...$('beats').children].forEach((x,i)=>x.classList.toggle('on',i===e.beat));},()=>{$('play').textContent='▶ Play backing';$('playStatus').textContent='Stopped';[...$('beats').children].forEach(x=>x.classList.remove('on'));});
function stop(){band.stop();}
function config(){return {...state,chords,bpm:+state.bpm,bars:+state.bars};}
async function play(){lab?.stop();foundations?.stop();if(starting)return;if(band.running){stop();return;}starting=true;try{await band.start(config());band.volume(state.volume/100);$('play').textContent='■ Stop backing';}catch{stop();toast('Audio could not start. Try a browser with Web Audio support.');}finally{starting=false;}}
$('key').innerHTML=KEYS.map((k,i)=>`<option value="${i}">${k}</option>`).join('');
$('style').innerHTML=Object.entries(PRESETS).map(([v,p])=>`<option value="${v}">${p.label}</option>`).join('');
function sync(){const type=jamScaleType(state.style,state.scale);$('box').replaceChildren(...boxOptions(+state.key,type).map(o=>new Option(o.label,o.value)));if(!['0','1','2','3','4'].includes(String(state.box)))state.box='0';if(!['tones','chords','both'].includes(state.jamView))state.jamView='tones';if(!['strum','arp','pad'].includes(state.pattern))state.pattern='strum';Object.keys(defaults).forEach(id=>{const el=$(id);if(!el||['lefty'].includes(id))return;if(el.type==='checkbox')el.checked=state[id];else el.value=state[id];});for(const id of ['guitarLevel','pianoLevel','padLevel','bassLevel','drumsLevel','room'])$(id+'Text').textContent=state[id]+'%';$('bpmText').textContent=`${state.bpm} BPM`;$('lefty').setAttribute('aria-pressed',state.lefty);$('sevenths').disabled=state.style==='blues';$('bars').disabled=state.style==='blues';}
function rebuild(){chords=makeProgression(+state.key,state.style,state.degrees,state.sevenths);active=Math.min(active,chords.length-1);$('progressionTitle').textContent=`${KEYS[state.key]} ${state.style==='blues'?'blues':PRESETS[state.style].mode}`;
 $('progression').innerHTML=chords.map((c,i)=>`<button class="chord-card ${i===active?'active':''}" data-chord="${i}" aria-label="Select chord ${i+1}: ${c.name}"><span>${c.roman} · ${i+1}</span><strong>${c.name}</strong></button>`).join('');
 $('progression').querySelectorAll('button').forEach(b=>b.onclick=()=>{stop();active=+b.dataset.chord;highlight();renderTargets();});renderEditor();renderTargets();persist();}
function highlight(){$('progression').querySelectorAll('.chord-card').forEach((el,i)=>el.classList.toggle('active',i===active));}
function renderEditor(){const options=Array.from({length:state.style==='blues'?3:7},(_,i)=>makeProgression(+state.key,state.style,[i],state.sevenths)[0]);$('editor').innerHTML=state.degrees.map((d,i)=>`<label>Slot ${i+1}<select data-slot="${i}" aria-label="Chord slot ${i+1}">${options.map((c,j)=>`<option value="${j}" ${d===j?'selected':''}>${c.name} (${c.roman})</option>`).join('')}</select></label>`).join('');$('editor').querySelectorAll('select').forEach(s=>s.onchange=()=>{stop();state.degrees[+s.dataset.slot]=+s.value;rebuild();});}
function renderTargets(){const c=chords[active],next=chords[(active+1)%chords.length];$('currentChord').textContent=c.name;$('targetNotes').innerHTML=c.tones.map((n,i)=>`<span class="note-pill ${i===0?'root':''}">${label(n)}<small>${intervalName(c.intervals[i])}</small></span>`).join('');$('nextChord').textContent=next.name;$('nextNotes').textContent=next.tones.map(label).join(' · ');const from=c.tones[1],to=nearestTarget(from,next.tones);$('voiceLead').textContent=`Try ${label(from)} → ${label(to)}${from===to?' · hold this shared note.':' as the chord changes.'}`;
 $('coach').textContent=state.focus==='third'?`Aim for ${label(c.tones[1])}, the ${c.intervals[1]===3?'minor':'major'} third of ${c.name}. Land on beat 1, then leave some space.`:state.focus==='root'?`Land on ${label(c.root)} on beat 1. Hum it, find it, then let it ring.`:`Use ${c.tones.map(label).join(', ')} as resting points. Connect them with nearby scale notes; try resolving on beats 1 or 3.`;renderJamShapes();renderBoard();}
function renderJamShapes(){
 const current=chords[active],next=chords[(active+1)%chords.length];$('jamChordDiagrams').hidden=state.jamView==='tones';$('jamFretPanel').hidden=state.jamView==='chords';
 for(const [chord,prefix] of [[current,'jamShape'],[next,'jamNextShape']]){const q=qualityFor(chord);$(prefix+'Name').textContent=chord.name;$(prefix).innerHTML=q?diagram(chordShape(chord.root,q)):'<p>No fingering available for this chord.</p>'; }
 $('jamShapeHelp').textContent=`Hold ${current.name}, then prepare ${next.name}. Try one downstroke on beat 1 and keep the pulse while changing shapes.`;
}
function renderBoard(){
 const c=chords[active],next=chords[(active+1)%chords.length],mode=PRESETS[state.style].mode,allowed=state.scale==='tones'?[]:palette(+state.key,mode,state.scale),future=upcomingTones(next,state.upcomingMode,state.showUpcoming);
 $('upcomingMode').disabled=!state.showUpcoming;
 $('upcomingSummary').textContent=state.showUpcoming?`Next: ${next.name} · ${future.map(label).join(' · ')}. N marks your next targets; a coloured ring means the note also belongs to the current chord.`:'Turn on the next-chord overlay to plan your landing notes without leaving the Jam room.';
 $('upcomingLegend').hidden=!state.showUpcoming;
 const box=scaleBox(+state.key,jamScaleType(state.style,state.scale),+state.box);$('jamBoxName').textContent=box.description+'. The outlined region is the scale shape; chord targets may extend outside it.';let frets=Array.from({length:box.end-box.start+1},(_,i)=>box.start+i);if(state.lefty)frets.reverse();
 const strings=[64,59,55,50,45,40],cols=frets.length;$('fretboard').style.gridTemplateColumns=`25px repeat(${cols},minmax(48px,1fr))`;$('fretboard').style.minWidth=`${25+cols*48}px`;
 let html='<div></div>'+frets.map(f=>`<div class="fret-label">${f}${[3,5,7,9,12,15].includes(f)?' ·':''}</div>`).join('');
 strings.forEach((open,si)=>{html+=`<div class="string-label">${['e','B','G','D','A','E'][si]}</div>`;frets.forEach(f=>{
  const inBox=box.positions.some(p=>p.string===si&&p.fret===f),pc=mod(open+f),tone=c.tones.includes(pc),root=pc===c.root,upcoming=future.includes(pc),visible=tone||upcoming||(inBox&&allowed.includes(pc)),dim=tone&&((state.focus==='root'&&!root)||(state.focus==='third'&&pc!==c.tones[1]));
  let text=label(pc);if(state.labels==='degrees'){if(tone)text=pc===c.root?'R':intervalName(mod(pc-c.root));else if(upcoming)text=(pc===next.root?'R':intervalName(mod(pc-next.root)))+'→';}
  const desc=`String ${si+1}, fret ${f}, ${label(pc)}${tone?', '+intervalName(mod(pc-c.root))+' of '+c.name:''}${upcoming?', next '+next.name+': '+intervalName(mod(pc-next.root)):''}`;
  html+=`<div class="fret-cell ${f===0?'nut':''} ${inBox?'box-cell':''}">${visible?`<button class="fret-note ${root?'root':tone?'chord':''} ${dim?'dim':tone&&state.focus!=='all'?'focused':''} ${upcoming?(tone?'upcoming-shared':'upcoming-only'):''}" data-midi="${open+f}" data-pc="${pc}" data-upcoming="${upcoming}" title="${desc}" aria-label="${desc}">${text}${upcoming?'<span class="next-tag" aria-hidden="true">N</span>':''}</button>`:''}</div>`;
 });});$('fretboard').innerHTML=html;
 $('fretboard').querySelectorAll('button').forEach(b=>b.onclick=async()=>{try{await band.init();band.volume(state.volume/100);await band.preview(+b.dataset.midi);}catch{toast('Audio is unavailable.');}});
 $('scaleHint').textContent=state.scale==='blues'?'Minor blues notes add tension against major chords. Resolve to the highlighted chord tones; not every blue note is a resting point.':state.style==='blues'?'The blues chords contain notes outside the key’s major scale. The bright chord targets take priority as each chord changes.':'Chord tones are the strongest landing notes. The other dots help you travel between them. All positions use standard tuning.';
}
const mixKeys=Object.keys(MIX_DEFAULTS);
Object.keys(defaults).filter(id=>$(id)&&id!=='lefty').forEach(id=>{$(id).addEventListener($(id).type==='range'&&id!=='bpm'?'input':'change',()=>{
 const isMix=mixKeys.includes(id)||id==='mixPreset';
 if(!isMix&&id!=='volume'&&!['focus','scale','box','jamView','labels','showUpcoming','upcomingMode'].includes(id))stop();
 state[id]=$(id).type==='checkbox'?$(id).checked:$(id).value;
 if(id==='mixPreset'&&MIX_PRESETS[state.mixPreset])Object.assign(state,MIX_PRESETS[state.mixPreset]);else if(isMix)state.mixPreset='custom';
 if(id==='style'){state.degrees=[...PRESETS[state.style].patterns[0]];state.scale=state.style==='blues'?'blues':'pent';state.feel=state.style==='blues'?'shuffle':'straight';if(state.style==='blues')state.bars=1;active=0;}
 if(id==='volume')band.volume(state.volume/100);
 if(isMix)band.updateMix(state);sync();if(isMix||id==='volume')persist();else rebuild();
 });});
$('bpm').oninput=()=>{$('bpmText').textContent=`${$('bpm').value} BPM`;};
$('generate').onclick=()=>{stop();const patterns=PRESETS[state.style].patterns;lastPreset=(lastPreset+1+Math.floor(Math.random()*Math.max(1,patterns.length-1)))%patterns.length;state.degrees=[...patterns[lastPreset]];active=0;rebuild();toast(state.style==='blues'?'Classic 12-bar blues loaded':'New progression ready');};
$('play').onclick=play;$('lefty').onclick=()=>{state.lefty=!state.lefty;sync();renderBoard();persist();};
$('addChord').onclick=()=>{if(state.degrees.length>=16){toast('Maximum 16 chord slots');return;}stop();state.degrees.push(0);rebuild();};$('removeChord').onclick=()=>{if(state.degrees.length>1){stop();state.degrees.pop();rebuild();}};
function renderSaves(){const selection=$('saved').value;$('saved').replaceChildren(new Option('Choose a saved setup…',''));saves.forEach((s,i)=>$('saved').add(new Option(s.name,String(i))));$('saved').value=selection;}
$('save').onclick=()=>{const name=prompt('Name this setup',`${KEYS[state.key]} · ${chords.map(c=>c.name).join(' – ')} · ${state.bpm} BPM`);if(!name?.trim())return;if(saves.length>=50){toast('50 setups saved. Delete one before adding more.');return;}saves.push({name:name.trim().slice(0,100),state:structuredClone(state)});persist();renderSaves();toast('Setup saved');};
$('saved').onchange=()=>{if($('saved').value==='')return;stop();state={...defaults,...structuredClone(saves[+$('saved').value].state)};active=0;sync();rebuild();};$('deleteSaved').onclick=()=>{if($('saved').value==='')return;saves.splice(+$('saved').value,1);$('saved').value='';persist();renderSaves();toast('Saved setup deleted');};
function tab(id){stop();lab?.stop();foundations?.stop();document.querySelectorAll('.tab-panel').forEach(p=>p.hidden=p.id!==id);document.querySelectorAll('.tab').forEach(b=>{b.classList.toggle('active',b.dataset.tab===id);b.setAttribute('aria-current',b.dataset.tab===id?'page':'false');});}
document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>tab(b.dataset.tab));
function loadPractice(settings){stop();state={...state,...settings};active=0;sync();rebuild();tab('jam');window.scrollTo({top:0,behavior:'smooth'});toast('Practice setup loaded — press Play when ready');}
$('lessonCards').innerHTML=lessons.map((l,i)=>`<article class="lesson-card"><span class="tag">${l.tag}</span><h3>${l.title}</h3><p>${l.body}</p><p><strong>Move on when:</strong> ${l.goal}</p><button class="secondary" data-lesson="${i}">Load exercise →</button></article>`).join('');
document.querySelectorAll('[data-lesson]').forEach(b=>b.onclick=()=>{const l=lessons[+b.dataset.lesson];loadPractice({key:l.blues?9:7,style:l.blues?'blues':'folk',degrees:[...PRESETS[l.blues?'blues':'folk'].patterns[0]],bpm:65,bars:1,sevenths:false,focus:l.focus,scale:l.scale,box:'0',jamView:'tones',feel:l.blues?'shuffle':'straight'});});
function renderJournal(){$('journalEntries').replaceChildren();journal.slice(0,20).forEach(e=>{const div=document.createElement('div');div.className='entry';const date=document.createElement('small');date.textContent=new Date(e.date).toLocaleString();const text=document.createElement('div');text.textContent=e.text;div.append(date,text);$('journalEntries').append(div);});$('practiceStats').textContent=journal.length?`${journal.length} practice note${journal.length===1?'':'s'} saved · Keep showing up.`:'Your next 20 minutes start here.';}
$('logSession').onclick=()=>{const text=$('journalText').value.trim();if(!text){toast('Write one discovery first.');return;}journal.unshift({date:new Date().toISOString(),text:text.slice(0,1500)});journal=journal.slice(0,100);$('journalText').value='';persist();renderJournal();toast('Practice note saved');};
document.addEventListener('keydown',e=>{if(e.code==='Space'&&!['INPUT','SELECT','TEXTAREA','BUTTON'].includes(e.target.tagName)&&!$('jam').hidden){e.preventDefault();play();}});
// Stop when the tab is hidden: throttled background timers cannot guarantee accurate backing.
document.addEventListener('visibilitychange',()=>{if(document.hidden&&band.running){stop();$('playStatus').textContent='Paused because the tab was hidden';}});
initWake();initAppearance();sync();rebuild();renderSaves();renderJournal();
lab=initLab({stopJam:()=>{stop();foundations?.stop();},getJam:()=>({...state,chords,key:+state.key,volume:+state.volume}),toast});
foundations=initFoundations({stopOthers:()=>{stop();lab?.stop();},loadJam:loadPractice,getMix:()=>({...state,volume:+state.volume}),toast});
initPractice({toast,openAction:a=>{if(a.tab==='jam')loadPractice({bars:1,sevenths:false,focus:'all',feel:'straight',...a});else if(a.tab==='journal'){tab('learn');$('journalText').scrollIntoView({behavior:'smooth',block:'center'});$('journalText').focus({preventScroll:true});}else{tab(a.tab);if(a.tab==='scales')foundations.loadScale(a);if(a.tab==='chords')foundations.loadProgression(a.progression);if(a.tab==='licklab')lab.loadExercise(a);window.scrollTo({top:0,behavior:'smooth'});}}});
