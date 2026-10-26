import {fromPreset,makePart,newTable,Table} from './model';
import type {AudioAsset} from './advanced-model';
/** Original synthesized demo audio, generated here and included as WAV bytes. */
function tone(id:string,name:string,notes:number[],seconds:number):AudioAsset{
 const rate=8000,n=Math.round(rate*seconds),bytes=new Uint8Array(44+n*2),v=new DataView(bytes.buffer);
 const word=(offset:number,s:string)=>[...s].forEach((c,i)=>bytes[offset+i]=c.charCodeAt(0));
 word(0,'RIFF');v.setUint32(4,36+n*2,true);word(8,'WAVE');word(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,rate,true);v.setUint32(28,rate*2,true);v.setUint16(32,2,true);v.setUint16(34,16,true);word(36,'data');v.setUint32(40,n*2,true);
 for(let i=0;i<n;i++){const beat=i/n*notes.length,phase=beat%1,envelope=Math.min(1,phase*30)*Math.max(0,1-phase);v.setInt16(44+i*2,Math.sin(2*Math.PI*notes[Math.floor(beat)]*i/rate)*envelope*5000,true)}
 let raw='';for(const b of bytes)raw+=String.fromCharCode(b);return {id,name,mime:'audio/wav',data:'data:audio/wav;base64,'+btoa(raw)};
}
export function workshopTable():Table{
 const t=newTable('Forge Workshop');t.exterior='#42e7ef';t.parts.filter(p=>p.boundary).forEach(p=>p.color=t.exterior!);
 const add=(kind:string,x:number,y:number)=>{const p=fromPreset(kind,x,y);t.parts.push(p);return p};
 const multi=add('multiball',430,140),bonus=add('bonus',280,170),extra=add('extraBall',100,210);
 const d1=add('dropTarget',155,320),d2=add('dropTarget',280,320),d3=add('dropTarget',405,320);
 add('movingObstacle',280,420);add('magnet',120,440);add('spinner',410,470);const ramp=add('ramp',280,555);ramp.rotation=-20;
 const bumper=add('bumper',185,620),light=add('light',395,590);t.parts.push({...makePart('slingshot',110,680),scale:.8},{...makePart('slingshot',425,680),mirror:true,scale:.8});
 t.sounds={chime:tone('chime','Workshop chime.wav',[660,880,1320],.45),music:tone('music','Workshop loop.wav',[220,330,440,330,262,392,524,392],4)};
 t.advanced={combo:true,musicId:'music',missions:[{id:'drop-bank',title:'Clear the three targets',targets:[d1.id,d2.id,d3.id],reward:2000}],rules:[{id:'bumper-light',source:bumper.id,actions:[{type:'flash',target:light.id},{type:'sound',soundId:'chime'},{type:'effect'}]},{id:'multi-reward',source:multi.id,once:true,actions:[{type:'score',value:500}]},{id:'bonus-flash',source:bonus.id,actions:[{type:'effect'}]},{id:'extra-chime',source:extra.id,once:true,actions:[{type:'sound',soundId:'chime'}]}]};return t;
}
