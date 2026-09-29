export function upcomingTones(chord,mode='all',enabled=true){
 if(!enabled||!chord)return [];
 return mode==='root'?[chord.root]:mode==='third'?[chord.tones[1]]:[...chord.tones];
}
