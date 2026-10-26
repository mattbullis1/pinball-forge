import {Part,Point,Table,W,H} from './model';
import {shape,end,perimeter} from './geometry';
function polygon(c:CanvasRenderingContext2D,v:Point[]){c.beginPath();v.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.closePath()}
export function surface(c:CanvasRenderingContext2D,t:Table){
 c.fillStyle=t.exterior??'#63f21c';c.fillRect(0,0,W,H);const v=perimeter(t);c.save();if(v.length){polygon(c,v);c.clip()}
 c.fillStyle=t.surface;c.fillRect(0,0,W,H);
 if(t.theme==='polished'){const g=c.createLinearGradient(0,0,W,H);g.addColorStop(0,'#ffffff19');g.addColorStop(.4,'#ffffff02');g.addColorStop(1,'#00000077');c.fillStyle=g;c.fillRect(0,0,W,H);c.strokeStyle='#ffffff08';c.lineWidth=1;for(let y=0;y<H;y+=8){c.beginPath();c.moveTo(0,y);c.lineTo(W,y+90);c.stroke()}}
 c.restore();
}
export function drawPolished(c:CanvasRenderingContext2D,p:Part,flash=false){
 c.save();c.lineJoin='round';c.lineCap='round';c.shadowColor='#000b';c.shadowBlur=5;c.shadowOffsetY=4;
 if(p.kind==='wall'){c.beginPath();c.moveTo(p.x,p.y);c.lineTo(end(p).x,end(p).y);c.strokeStyle='#181d25';c.lineWidth=p.boundary?8:11;c.stroke();c.shadowBlur=0;c.shadowOffsetY=0;c.strokeStyle=p.color;c.lineWidth=p.boundary?4:7;c.stroke();c.strokeStyle='#ffffff99';c.lineWidth=1;c.stroke()}
 else if(['obstacle','slingshot','leftFlipper','rightFlipper','target'].includes(p.kind)){
  const v=shape(p),ys=v.map(q=>q.y);const g=c.createLinearGradient(0,Math.min(...ys),0,Math.max(...ys));
  const metal=p.kind.endsWith('Flipper');g.addColorStop(0,metal?'#f6fcff':'#ffffff');g.addColorStop(.16,metal?'#a7b7c8':p.color);g.addColorStop(.45,metal?'#f9fdff':p.color);g.addColorStop(1,metal?'#667381':'#171923');
  polygon(c,v);c.fillStyle=flash?'#ffffff':g;c.fill();c.shadowBlur=0;c.shadowOffsetY=0;c.strokeStyle=metal?p.color:'#b8c7dd';c.lineWidth=3;c.stroke();
  if(metal){c.fillStyle='#343d4b';c.beginPath();c.arc(p.x,p.y,5,0,7);c.fill();c.fillStyle='#ccd8e2';c.fillRect(p.x-3,p.y-1,6,2)}
 }else if(['bumper','ball','light','rollover','zone'].includes(p.kind)){
  const r=(p.r??22)*(p.scale??1),chrome=p.kind==='ball';
  if(!chrome){c.shadowOffsetY=0;c.shadowColor=p.color;c.shadowBlur=flash?24:12}
  const g=c.createRadialGradient(p.x-r*.35,p.y-r*.4,r*.05,p.x,p.y,r);
  g.addColorStop(0,'#ffffff');g.addColorStop(.2,chrome?'#eef5ff':p.color);g.addColorStop(.62,chrome?'#67788d':p.color);g.addColorStop(.82,chrome?'#17212e':'#181d28');g.addColorStop(1,chrome?'#d9e8f4':'#8994a6');
  c.fillStyle=flash?'#fff':g;c.beginPath();c.arc(p.x,p.y,r,0,7);c.fill();c.shadowBlur=0;c.strokeStyle='#cbd8e5';c.lineWidth=2;c.stroke();
  if(p.kind==='bumper'){c.strokeStyle='#ffffffbb';c.lineWidth=2;c.beginPath();c.arc(p.x,p.y,r*.7,0,7);c.stroke();c.fillStyle='#ffffffbb';c.beginPath();c.ellipse(p.x-r*.2,p.y-r*.35,r*.35,r*.12,-.3,0,7);c.fill()}
 }else{c.restore();return false}c.restore();return true;
}
let lastFlash:string|undefined;
const sparks:{x:number;y:number;dx:number;dy:number;start:number;color:string}[]=[];
export function effects(c:CanvasRenderingContext2D,t:Table,flash?:string,testing=false){const now=performance.now();if(!testing){sparks.length=0;lastFlash=undefined;return}
 if(flash&&flash!==lastFlash){const p=t.parts.find(p=>p.id===flash);if(p)for(let i=0;i<10;i++){const a=i*Math.PI/5;sparks.push({x:p.x,y:p.y,dx:Math.cos(a)*75,dy:Math.sin(a)*75,start:now,color:p.color})}if(sparks.length>80)sparks.splice(0,sparks.length-80)}lastFlash=flash;
 c.save();for(let i=sparks.length-1;i>=0;i--){const s=sparks[i],age=(now-s.start)/1000;if(age>.4){sparks.splice(i,1);continue}c.globalAlpha=1-age/.4;c.fillStyle=s.color;c.fillRect(s.x+s.dx*age,s.y+s.dy*age,3,3)}c.restore();
}
