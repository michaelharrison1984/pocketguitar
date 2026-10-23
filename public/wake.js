// Shared activity tracking keeps one screen lock for all players and the practice timer.
const activities=new Set();let controller=null;
export function practiceActivity(owner,active){if(active)activities.add(owner);else activities.delete(owner);controller?.setActive(activities.size>0);}
export class ScreenAwake {
 constructor({navigator,document,secure=true,onStatus=()=>{}}){Object.assign(this,{navigator,document,secure,onStatus});this.enabled=true;this.active=false;this.lock=null;this.pending=null;this.generation=0;}
 status(text){this.onStatus(text);}
 setEnabled(value){this.enabled=value;return this.update();}
 setActive(value){if(this.active===value)return;this.active=value;return this.update();}
 async update(){
  const wanted=this.enabled&&this.active&&this.document.visibilityState==='visible';
  if(!wanted){this.generation++;const lock=this.lock;this.lock=null;if(lock)try{await lock.release();}catch{}this.status(!this.enabled?'Screen awake: off':this.active?'Screen awake: paused while app is hidden':!this.secure?'Screen awake unavailable: open this app over HTTPS on your phone, or extend the phone’s screen timeout.':!this.navigator.wakeLock?'Screen awake unavailable in this browser. Extend the phone’s screen timeout while practising.':'Screen awake: ready for playback or a timed session');return;}
  if(!this.secure){this.status('Screen awake unavailable: open this app over HTTPS on your phone, or extend the phone’s screen timeout.');return;}
  if(!this.navigator.wakeLock){this.status('Screen awake unavailable in this browser. Extend the phone’s screen timeout while practising.');return;}
  if(this.lock&&!this.lock.released){this.status('Screen awake: active');return;}
  if(this.pending)return;
  const generation=this.generation;this.status('Screen awake: requesting…');
  this.pending=this.navigator.wakeLock.request('screen');
  try{const lock=await this.pending;if(generation!==this.generation||!this.enabled||!this.active||this.document.visibilityState!=='visible'){await lock.release();return;}this.lock=lock;lock.addEventListener('release',()=>{if(this.lock!==lock)return;this.lock=null;this.status('Screen awake released by the device. Tap Retry, or check battery-saving settings.');});this.status('Screen awake: active');}
  catch{this.status('Screen awake was not allowed. Tap Retry, or check battery-saving settings.');}
  finally{this.pending=null;if(generation!==this.generation&&this.enabled&&this.active&&this.document.visibilityState==='visible')this.update();}
 }
}
export function initWake(){
 const toggle=document.getElementById('keepAwake'),status=document.getElementById('wakeStatus'),settingsStatus=document.getElementById('wakeSettingsStatus');let enabled=true;
 try{enabled=localStorage.getItem('pocket-guitar-awake-v1')!=='false';}catch{}
 controller=new ScreenAwake({navigator,document,secure:window.isSecureContext,onStatus:text=>{status.textContent=settingsStatus.textContent=text;document.getElementById('wakeRetry').hidden=!/unavailable|released|not allowed/.test(text);}});
 toggle.checked=enabled;controller.setEnabled(enabled);
 toggle.onchange=()=>{try{localStorage.setItem('pocket-guitar-awake-v1',String(toggle.checked));}catch{}controller.setEnabled(toggle.checked);};
 document.getElementById('wakeRetry').onclick=()=>controller.update();
 document.addEventListener('visibilitychange',()=>controller.update());
 window.addEventListener('pagehide',()=>controller.setActive(false));
}
