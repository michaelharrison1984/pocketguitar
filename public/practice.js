import {practiceActivity} from './wake.js?v=1.6.0';
import {ROUTINES} from './foundations-data.js?v=1.6.0';
const $=id=>document.getElementById(id);
export function initPractice({openAction,toast,onProgress=()=>{}}){
 let level='beginner';try{level=localStorage.getItem('pocket-guitar-level-v1')||level;}catch{}if(!ROUTINES[level])level='beginner';
 let seconds=1200,running=false,end=0,started=false;
 function current(){let elapsed=1200-seconds,total=0;return ROUTINES[level].stages.find(s=>(total+=s.minutes*60)>elapsed)||ROUTINES[level].stages.at(-1);}
 function render(){practiceActivity('routine',running);const st=current(),time=`${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`;$('timer').textContent=$('dockTime').textContent=time;$('routineStage').textContent=$('dockStage').textContent=seconds?st.title:'Session complete';$('routineText').textContent=seconds?st.text:'Save one discovery below and build on it next time.';$('pauseRoutine').textContent=$('dockPause').textContent=running?'Pause':'Resume';$('pauseRoutine').disabled=!started||!seconds;$('dockPause').disabled=!seconds;$('routineDock').hidden=!started;document.body.classList.toggle('has-routine',started);$('startRoutine').disabled=running;}
 function cards(){$('skillLevel').value=level;$('routineSummary').textContent=ROUTINES[level].summary;$('pathCards').innerHTML=ROUTINES[level].stages.map((s,i)=>`<article class="lesson-card"><span class="tag">STEP ${i+1} · ${s.minutes} MINUTES</span><h3>${s.title}</h3><p>${s.text}</p><button class="secondary" data-stage="${i}">Open exercise →</button></article>`).join('');$('pathCards').querySelectorAll('button').forEach(b=>b.onclick=()=>openAction(ROUTINES[level].stages[+b.dataset.stage].action));render();}
 function start(){if(!seconds)seconds=1200;started=true;running=true;end=Date.now()+seconds*1000;render();}
 function pause(){if(running){seconds=Math.max(0,Math.ceil((end-Date.now())/1000));running=false;render();}else start();}
 $('startRoutine').onclick=start;$('pauseRoutine').onclick=$('dockPause').onclick=pause;
 $('resetRoutine').onclick=()=>{seconds=1200;running=false;started=false;render();};
 $('openRoutineStage').onclick=$('dockExercise').onclick=()=>openAction(current().action);
 $('dockReturn').onclick=()=>document.querySelector('[data-tab="learn"]').click();
 $('skillLevel').onchange=()=>{level=$('skillLevel').value;seconds=1200;running=false;started=false;try{localStorage.setItem('pocket-guitar-level-v1',level);}catch{}cards();};
 setInterval(()=>{if(!running)return;const previous=current();seconds=Math.max(0,Math.ceil((end-Date.now())/1000));if(!seconds){running=false;try{localStorage.setItem('pocket-guitar-tutor-sessions-v1',String(1+(+localStorage.getItem('pocket-guitar-tutor-sessions-v1')||0)));}catch{}onProgress();toast('Session complete — save one discovery.');}else if(current()!==previous)toast(`Next: ${current().title}. Use Open exercise when ready.`);render();},500);cards();
}
