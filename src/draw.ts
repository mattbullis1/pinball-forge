import {Part,Point,Table,tableSize} from './model';
import {end,perimeter,shape,vertices} from './geometry';
import {drawPolished,surface,effects} from './polished';
import {drawAdvanced} from './advanced-draw';
import {drawModern} from './modern-parts';
import {drawReferencePart,drawReferenceThumbnail} from './reference-parts';
import type {Burst} from './game-rules';
import {drawSurfacePaint} from './surface-paint';
const WHITE='#f4f4ef',BLACK='#050505';
function path(c:CanvasRenderingContext2D,v:Point[]){c.beginPath();if(!v.length)return;c.moveTo(v[0].x,v[0].y);v.slice(1).forEach(p=>c.lineTo(p.x,p.y));c.closePath()}
export function drawPart(c:CanvasRenderingContext2D,p:Part,flash=false,polished=false){
 if(p.kind==='artwork')return;flash ||= p.animationPhase===-1;if(p.enabled===false){c.save();c.globalAlpha=.25;drawPart(c,{...p,enabled:true},false,polished);c.restore();return}if(drawReferencePart(c,p,flash)||drawAdvanced(c,p,flash))return;if(polished&&!p.wallLoop&&(drawModern(c,p,flash)||drawPolished(c,p,flash)))return;
 c.save();c.lineWidth=3;c.lineCap='square';c.lineJoin='miter';c.strokeStyle=WHITE;c.fillStyle=flash?WHITE:p.color;
 if(p.wallLoop){path(c,shape(p));c.strokeStyle=flash?WHITE:p.color;c.lineWidth=7;c.lineJoin='round';c.stroke()}
 else if(p.kind==='wall'){c.strokeStyle=flash?WHITE:p.color;c.lineWidth=p.boundary?4:7;if(p.wallGroup)c.lineCap='round';c.beginPath();c.moveTo(p.x,p.y);c.lineTo(end(p).x,end(p).y);c.stroke()}
 else if(['obstacle','slingshot','leftFlipper','rightFlipper','target','drain'].includes(p.kind)){
  path(c,shape(p));c.fill();if(p.kind!=='drain')c.stroke();
  if(p.kind.endsWith('Flipper')){c.fillStyle='#a042ff';c.fillRect(p.x-4,p.y-4,8,8)}
  if(p.kind==='target'){c.save();c.translate(p.x,p.y);c.rotate(p.rotation*Math.PI/180);c.scale(p.scale??1,p.scale??1);c.fillStyle=WHITE;c.fillRect(-23,-13,46,4);c.fillRect(-23,9,46,4);c.restore()}
  if(p.kind==='drain'){c.fillStyle=BLACK;c.fillRect(p.x-33,p.y-4,66,8)}
 }else if(p.kind==='launcher'){
  c.translate(p.x,p.y);c.rotate(p.rotation*Math.PI/180);c.scale(p.scale??1,p.scale??1);c.fillStyle=WHITE;c.fillRect(-12,-34,24,6);c.fillRect(-12,28,24,6);c.beginPath();c.moveTo(-9,-26);for(let y=-26;y<28;y+=6){c.lineTo(9,y+3);c.lineTo(-9,y+6)}c.stroke();
 }else{
  const r=(p.r??22)*(p.scale??1);c.beginPath();c.arc(p.x,p.y,r,0,Math.PI*2);c.fill();c.stroke();
  if(p.kind==='bumper'){c.fillStyle=BLACK;c.beginPath();c.arc(p.x,p.y,r*.76,0,Math.PI*2);c.fill();c.fillStyle=flash?WHITE:p.color;c.beginPath();c.moveTo(p.x,p.y);c.arc(p.x,p.y,r*.7,-Math.PI/2,0);c.lineTo(p.x,p.y);c.arc(p.x,p.y,r*.7,Math.PI/2,Math.PI);c.closePath();c.fill()}
  if(p.kind==='rollover'||p.kind==='zone'){c.fillStyle=BLACK;c.beginPath();c.arc(p.x,p.y,r*.8,0,7);c.fill();c.fillStyle=p.color;path(c,[{x:p.x,y:p.y-r/2},{x:p.x+r/2,y:p.y},{x:p.x,y:p.y+r/2},{x:p.x-r/2,y:p.y}]);c.fill()}
 }
 c.restore();
}
let buffer:HTMLCanvasElement|undefined;
export type ViewOptions={selected?:string;corners?:boolean;activeVertex?:{id:string;index:number};handleRadius?:number;invalid?:Table;gameParts?:Part[];ball?:Point;balls?:Point[];bursts?:Burst[];elapsed?:number;testing?:boolean;flash?:string;grid?:boolean;guides?:{x?:number;y?:number}};
export function drawTable(ctx:CanvasRenderingContext2D,t:Table,o:ViewOptions={}){
 const {width:W,height:H}=tableSize(t);sizeCanvas(ctx,W,H);
 buffer??=document.createElement('canvas');const polished=t.theme==='polished';buffer.width=polished?W:W/2;buffer.height=polished?H:H/2;const c=buffer.getContext('2d')!;if(!polished)c.scale(.5,.5);
 // The separate background canvas lets native animated images sit beneath the game pieces.
 if(o.grid&&!o.testing){c.fillStyle='#ffffff22';for(let x=20;x<W;x+=20)for(let y=20;y<H;y+=20){c.fillRect(x,y,1,1)}}
 for(const p of o.gameParts??t.parts){if(o.testing&&p.kind==='ball')continue;if(t.playfield==='reference'&&p.boundary&&p.color===t.exterior&&p.id!==o.flash)continue;drawPart(c,p,p.id===o.flash,polished)}
 for(const ball of o.balls??(o.ball?[o.ball]:[])){if(polished){const part:Part={id:'runtime-ball',kind:'ball',...ball,r:10,color:WHITE,score:0,rotation:0};if(!drawModern(c,part))drawPolished(c,part)}else{c.fillStyle=WHITE;c.beginPath();c.arc(ball.x,ball.y,10,0,7);c.fill()}}
 if(polished)effects(c,t,o.flash,o.testing);
 for(const b of o.bursts??[]){const age=((o.elapsed??0)-b.start)/700;c.save();c.globalAlpha=Math.max(0,1-age);c.fillStyle=b.color;for(let i=0;i<16;i++){const a=i*Math.PI/8;c.fillRect(b.x+Math.cos(a)*age*90-2,b.y+Math.sin(a)*age*90-2,4,4)}c.restore()}
 if(!o.testing){
  const selected=t.parts.find(p=>p.id===o.selected);
  if(selected&&!o.corners){c.strokeStyle=WHITE;c.lineWidth=2;c.setLineDash([5,5]);const v=selected.kind==='wall'?[selected,end(selected)]:selected.sprite||['artwork','obstacle','target','slingshot','leftFlipper','rightFlipper','launcher','drain'].includes(selected.kind)?shape(selected):[{x:selected.x-(selected.r??25),y:selected.y-(selected.r??25)},{x:selected.x+(selected.r??25),y:selected.y+(selected.r??25)}];const xs=v.map(p=>p.x),ys=v.map(p=>p.y);c.strokeRect(Math.min(...xs)-7,Math.min(...ys)-7,Math.max(...xs)-Math.min(...xs)+14,Math.max(...ys)-Math.min(...ys)+14);c.setLineDash([])}
  if(o.corners){
   const active=o.activeVertex&&vertices(t,o.activeVertex.id).find(v=>v.id===o.activeVertex!.id&&v.index===o.activeVertex!.index),r=o.handleRadius??7;
   for(const v of vertices(t,o.selected)){const selected=active&&Math.hypot(active.point.x-v.point.x,active.point.y-v.point.y)<.01;c.fillStyle=selected?'#ff44fb':BLACK;c.fillRect(v.point.x-r,v.point.y-r,r*2,r*2);c.strokeStyle=selected?'#42e7ef':WHITE;c.lineWidth=2;c.strokeRect(v.point.x-r,v.point.y-r,r*2,r*2)}
  }
  if(o.guides){c.strokeStyle='#42e7ef';c.lineWidth=1;c.setLineDash([5,5]);if(o.guides.x!==undefined){c.beginPath();c.moveTo(o.guides.x,0);c.lineTo(o.guides.x,H);c.stroke()}if(o.guides.y!==undefined){c.beginPath();c.moveTo(0,o.guides.y);c.lineTo(W,o.guides.y);c.stroke()}c.setLineDash([])}
  if(o.invalid){c.globalAlpha=.7;for(const p of o.invalid.parts.filter(p=>p.id===o.selected||p.boundary&&selected?.boundary)){drawPart(c,{...p,color:'#ff3030'})}c.globalAlpha=1}
 }
 ctx.imageSmoothingEnabled=polished;ctx.clearRect(0,0,W,H);ctx.drawImage(buffer,0,0,W,H);
}
export function drawThumbnail(canvas:HTMLCanvasElement,p:Part,polished=true){if(drawReferenceThumbnail(canvas,p))return;canvas.width=96;canvas.height=80;const c=canvas.getContext('2d')!;c.translate(48,40);c.scale(.8,.8);const q={...p,x:0,y:0};if(q.kind==='wall'){const dx=(p.x2??p.x+100)-p.x,dy=(p.y2??p.y)-p.y,s=Math.min(1,80/Math.max(Math.abs(dx),Math.abs(dy)));q.x=-dx*s/2;q.y=-dy*s/2;q.x2=dx*s/2;q.y2=dy*s/2}if(q.kind==='leftFlipper')q.x=-30;if(q.kind==='rightFlipper')q.x=30;drawPart(c,q,false,polished)}

function sizeCanvas(ctx:CanvasRenderingContext2D,width:number,height:number){if(ctx.canvas.width!==width)ctx.canvas.width=width;if(ctx.canvas.height!==height)ctx.canvas.height=height}
let backgroundBuffer:HTMLCanvasElement|undefined;
export function drawBackground(ctx:CanvasRenderingContext2D,t:Table){
 const {width,height}=tableSize(t);sizeCanvas(ctx,width,height);ctx.clearRect(0,0,width,height);
 if(t.playfield==='reference'&&t.theme!=='polished'){
  // The original border steps in two source pixels (four world units).
  backgroundBuffer??=document.createElement('canvas');backgroundBuffer.width=width/4;backgroundBuffer.height=height/4;
  const c=backgroundBuffer.getContext('2d')!;c.scale(.25,.25);surface(c,t);
  // Canvas path edges otherwise leave blended pixels unlike the supplied art.
  const pixels=c.getImageData(0,0,width/4,height/4),colors=[t.surface,t.exterior??'#63f21c','#000000'].map(hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)));
  for(let i=0;i<pixels.data.length;i+=4){let best=colors[0],distance=Infinity;for(const color of colors){const r=color[0]-pixels.data[i],g=color[1]-pixels.data[i+1],b=color[2]-pixels.data[i+2],d=r*r+g*g+b*b;if(d<distance){best=color;distance=d}}for(let k=0;k<3;k++)pixels.data[i+k]=best[k]}
  c.putImageData(pixels,0,0);drawSurfacePaint(c,t);
  ctx.imageSmoothingEnabled=false;ctx.drawImage(backgroundBuffer,0,0,width,height);
 }else{surface(ctx,t);drawSurfacePaint(ctx,t)}
}
