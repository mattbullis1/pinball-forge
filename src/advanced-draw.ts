import type {Part} from './model';
import {advancedKinds} from './advanced-model';
export function drawAdvanced(c:CanvasRenderingContext2D,p:Part,flash:boolean){
 if(!advancedKinds.includes(p.kind as typeof advancedKinds[number]))return false;
 c.save();c.translate(p.x,p.y);c.rotate(p.rotation*Math.PI/180);c.scale(p.scale??1,p.scale??1);
 c.globalAlpha=p.enabled===false?.3:1;c.strokeStyle='#f4f4ef';c.fillStyle=flash?'#f4f4ef':p.color;c.lineWidth=3;
 const phase=Math.max(0,p.animationPhase??0);
 if(p.kind==='movingObstacle'||p.kind==='dropTarget'||p.kind==='spinner'){
  c.fillRect(-23,-13,46,26);c.strokeRect(-23,-13,46,26);c.strokeStyle='#050505';
  if(p.kind==='movingObstacle'){c.beginPath();c.moveTo(-16,0);c.lineTo(16,0);c.moveTo(-10,-6);c.lineTo(-16,0);c.lineTo(-10,6);c.moveTo(10,-6);c.lineTo(16,0);c.lineTo(10,6);c.stroke()}
  if(p.kind==='dropTarget'){c.strokeRect(-9,-7,18,14);if(p.enabled===false){c.strokeStyle='#f4f4ef';c.beginPath();c.moveTo(-23,0);c.lineTo(23,0);c.stroke()}}
  if(p.kind==='spinner'){c.beginPath();c.moveTo(-18,0);c.lineTo(18,0);c.stroke();c.fillStyle='#050505';c.beginPath();c.arc(0,0,5,0,7);c.fill()}
 }else if(p.kind==='ramp'){
  c.fillStyle='#050505';c.fillRect(-23,-13,46,26);c.strokeRect(-23,-13,46,26);
  c.strokeStyle=p.color;for(let i=0;i<3;i++){const y=((i*10+phase*25)%30)-15;c.beginPath();c.moveTo(-12,y+4);c.lineTo(0,y-4);c.lineTo(12,y+4);c.stroke()}
 }else{
  c.beginPath();c.arc(0,0,p.r??22,0,7);c.fill();c.stroke();c.fillStyle='#050505';c.textAlign='center';c.textBaseline='middle';c.font='bold 18px monospace';
  c.fillText(p.kind==='bonus'?'2×':p.kind==='extraBall'?'+1':p.kind==='magnet'?'∩':'●●',0,1);
  if(p.kind==='magnet'){c.strokeStyle=p.color;c.globalAlpha=.25;c.setLineDash([4,6]);c.beginPath();c.arc(0,0,40+Math.sin(phase*3)*5,0,7);c.stroke()}
 }
 c.restore();return true;
}
