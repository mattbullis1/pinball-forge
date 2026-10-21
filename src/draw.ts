import {H,Part,Table,W} from './model';
export function drawTable(ctx:CanvasRenderingContext2D,t:Table,selected?:string,ball?:{x:number;y:number},score=0,testing=false){
  ctx.clearRect(0,0,W,H);ctx.fillStyle='#ff56d8';ctx.fillRect(0,0,W,H);ctx.fillStyle=t.surface;ctx.fillRect(16,16,W-32,H-32);
  ctx.strokeStyle='#f4f4ef';ctx.lineWidth=3;ctx.strokeRect(18,18,W-36,H-36);
  for(const p of t.parts)drawPart(ctx,p,p.id===selected,t.wallColor);
  if(ball){ctx.beginPath();ctx.arc(ball.x,ball.y,11,0,Math.PI*2);const m=ctx.createRadialGradient(ball.x-4,ball.y-5,1,ball.x,ball.y,12);m.addColorStop(0,'white');m.addColorStop(.45,'#cbd7df');m.addColorStop(1,'#556977');ctx.fillStyle=m;ctx.fill();ctx.strokeStyle='#ffffffaa';ctx.stroke()}
  if(testing){ctx.fillStyle='#07101aba';ctx.fillRect(12,12,168,48);ctx.fillStyle='#e7fbff';ctx.font='bold 19px system-ui';ctx.fillText(`SCORE ${score}`,23,43)}
}
function drawPart(c:CanvasRenderingContext2D,p:Part,selected:boolean,wallColor:string){
  c.save();c.shadowColor=p.color;c.shadowBlur=p.kind==='light'?16:0;c.lineCap='square';c.lineJoin='miter';
  if(p.kind==='wall'){
    c.strokeStyle=p.color||wallColor;c.lineWidth=9;c.beginPath();c.moveTo(p.x,p.y);c.lineTo(p.x2??p.x+100,p.y2??p.y);c.stroke();c.strokeStyle='#ffffff88';c.lineWidth=2;c.stroke();
    if(selected){for(const [x,y] of [[p.x,p.y],[p.x2??p.x+100,p.y2??p.y]]){c.fillStyle='#fff';c.beginPath();c.arc(x,y,8,0,7);c.fill()}}c.restore();return;
  }
  c.translate(p.x,p.y);c.rotate(p.rotation*Math.PI/180);c.fillStyle=p.color;c.strokeStyle='#ffffffaa';c.lineWidth=2;
  if(p.kind==='bumper'){c.beginPath();c.arc(0,0,p.r??30,0,7);c.fill();c.stroke();c.fillStyle='#1d1835';c.beginPath();c.arc(0,0,(p.r??30)*.65,0,7);c.fill();c.stroke();c.fillStyle=p.color;c.beginPath();c.arc(0,0,(p.r??30)*.35,0,7);c.fill()}
  else if(p.kind==='ball'){c.beginPath();c.arc(0,0,11,0,7);c.fill();c.stroke()}
  else if(p.kind==='leftFlipper'||p.kind==='rightFlipper'){const d=p.kind==='leftFlipper'?1:-1;c.beginPath();c.moveTo(0,-10);c.lineTo(d*90,-4);c.quadraticCurveTo(d*107,0,d*90,5);c.lineTo(0,10);c.closePath();c.fill();c.stroke();c.fillStyle='#f05e80';c.beginPath();c.arc(0,0,7,0,7);c.fill()}
  else if(p.kind==='slingshot'){c.beginPath();c.moveTo(0,-30);c.lineTo(27,25);c.lineTo(-27,25);c.closePath();c.fill();c.stroke()}
  else if(p.kind==='target'){c.fillRect(-23,-16,46,32);c.strokeRect(-23,-16,46,32);c.fillStyle='#fff8';c.fillRect(-17,-10,34,6)}
  else if(p.kind==='launcher'){c.fillRect(-9,-46,18,92);c.strokeRect(-9,-46,18,92);c.fillStyle='#202636';c.fillRect(-5,-35,10,45)}
  else if(p.kind==='drain'){c.beginPath();c.moveTo(-38,-8);c.lineTo(0,12);c.lineTo(38,-8);c.strokeStyle=p.color;c.lineWidth=8;c.stroke()}
  else if(p.kind==='light'){c.beginPath();c.arc(0,0,p.r??12,0,7);c.fill();c.stroke()}
  else {c.beginPath();c.arc(0,0,p.r??24,0,7);c.stroke();c.fillStyle=p.color+'55';c.fill();c.fillStyle='#fff';c.font='bold 20px system-ui';c.textAlign='center';c.textBaseline='middle';c.fillText(p.kind==='rollover'?'R':'★',0,0)}
  if(selected){c.shadowBlur=0;c.strokeStyle='#fff';c.setLineDash([5,4]);c.lineWidth=1.5;c.strokeRect(-42,-42,84,84)}c.restore();
}
