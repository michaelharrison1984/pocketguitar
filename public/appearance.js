export const PALETTES={
 contrast:{upcoming:'#ff83df',board:'#080b10',root:'#ffdf00',chord:'#00d5ff',scale:'#f1f5f9',lines:'#8190a4'},
 warm:{upcoming:'#79efca',board:'#1a1722',root:'#ffb454',chord:'#beafff',scale:'#d9e2e7',lines:'#8d839d'},
 light:{upcoming:'#a00067',board:'#faf8f0',root:'#905100',chord:'#005a98',scale:'#30483f',lines:'#74746c'},
 original:{upcoming:'#eda6eb',board:'#101819',root:'#d2ee93',chord:'#83cfc7',scale:'#52635f',lines:'#8b9995'}
};
export function ink(hex){const rgb=hex.match(/[a-f\d]{2}/gi).map(n=>parseInt(n,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);const l=rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;return (l+.05)/.05>=1.05/(l+.05)?'#000000':'#ffffff';}
export function initAppearance(){
 let saved={};try{saved=JSON.parse(localStorage.getItem('pocket-guitar-appearance-v1')||'{}')||{};}catch{}
 let colours={...PALETTES.contrast};for(const k in colours)if(/^#[a-f\d]{6}$/i.test(saved[k]||''))colours[k]=saved[k];
 let size=['normal','large'].includes(saved.size)?saved.size:'large';
 const box=document.getElementById('appearance');
 function apply(){for(const [k,v] of Object.entries(colours)){document.documentElement.style.setProperty('--fb-'+k,v);if(k!=='lines')document.documentElement.style.setProperty('--fb-'+k+'-ink',ink(v));box.querySelector(`[data-colour="${k}"]`).value=v;}document.documentElement.dataset.noteSize=size;document.getElementById('noteSize').value=size;}
 function save(){try{localStorage.setItem('pocket-guitar-appearance-v1',JSON.stringify({...colours,size}));}catch{document.getElementById('appearanceStatus').textContent='Settings apply for this visit; browser storage is unavailable.';}}
 const preset=document.getElementById('colourPreset');
 preset.add(new Option('Custom colours','custom'));
 const match=Object.keys(PALETTES).find(k=>Object.entries(colours).every(([name,v])=>PALETTES[k][name]===v));preset.value=match||'custom';
 box.querySelectorAll('[data-colour]').forEach(el=>el.addEventListener('input',()=>{colours[el.dataset.colour]=el.value;preset.value='custom';apply();save();}));
 document.getElementById('colourPreset').onchange=e=>{if(PALETTES[e.target.value]){colours={...PALETTES[e.target.value]};apply();save();}};
 document.getElementById('noteSize').onchange=e=>{size=e.target.value;apply();save();};
 document.getElementById('resetColours').onclick=()=>{colours={...PALETTES.contrast};size='large';document.getElementById('colourPreset').value='contrast';apply();save();};
 apply();
}
