import {H,Part,Point,Table,W} from './model';
import {end,perimeter,shape,vertices} from './geometry';
import {drawPolished,surface,effects} from './polished';
const WHITE='#f4f4ef',BLACK='#050505';
function path(c:CanvasRenderingContext2D,v:Point[]){c.beginPath();if(!v.length)return;c.moveTo(v[0].x,v[0].y);v.slice(1).forEach(p=>c.lineTo(p.x,p.y));c.closePath()}
export function drawPart(c:CanvasRenderingContext2D,p:Part,flash=false,polished=false){
 if(p.kind==='artwork')return;if(polished&&drawPolished(c,p,flash))return;
 c.save();c.lineWidth=3;c.lineCap='square';c.lineJoin='miter';c.strokeStyle=WHITE;c.fillStyle=flash?WHITE:p.color;
 if(p.kind==='wall'){c.strokeStyle=flash?WHITE:p.color;c.lineWidth=p.boundary?4:7;c.beginPath();c.moveTo(p.x,p.y);c.lineTo(end(p).x,end(p).y);c.stroke()}
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
export type ViewOptions={selected?:string;corners?:boolean;invalid?:Table;gameParts?:Part[];ball?:Point;testing?:boolean;flash?:string;grid?:boolean;guides?:{x?:number;y?:number}};
export function drawTable(ctx:CanvasRenderingContext2D,t:Table,o:ViewOptions={}){
 buffer??=document.createElement('canvas');const polished=t.theme==='polished';buffer.width=polished?W:W/2;buffer.height=polished?H:H/2;const c=buffer.getContext('2d')!;if(!polished)c.scale(.5,.5);
 // The separate background canvas lets native animated images sit beneath the game pieces.
 if(o.grid&&!o.testing){c.fillStyle='#ffffff22';for(let x=20;x<W;x+=20)for(let y=20;y<H;y+=20){c.fillRect(x,y,1,1)}}
 for(const p of o.gameParts??t.parts){if(o.testing&&p.kind==='ball')continue;drawPart(c,p,p.id===o.flash,polished)}
 if(o.ball){if(polished)drawPolished(c,{id:'runtime-ball',kind:'ball',...o.ball,r:10,color:WHITE,score:0,rotation:0});else{c.fillStyle=WHITE;c.beginPath();c.arc(o.ball.x,o.ball.y,10,0,7);c.fill()}}
 if(polished)effects(c,t,o.flash,o.testing);
 if(!o.testing){
  const selected=t.parts.find(p=>p.id===o.selected);
  if(selected&&!o.corners){c.strokeStyle=WHITE;c.lineWidth=2;c.setLineDash([5,5]);const v=selected.kind==='wall'?[selected,end(selected)]:['artwork','obstacle','target','slingshot','leftFlipper','rightFlipper','launcher','drain'].includes(selected.kind)?shape(selected):[{x:selected.x-(selected.r??25),y:selected.y-(selected.r??25)},{x:selected.x+(selected.r??25),y:selected.y+(selected.r??25)}];const xs=v.map(p=>p.x),ys=v.map(p=>p.y);c.strokeRect(Math.min(...xs)-7,Math.min(...ys)-7,Math.max(...xs)-Math.min(...xs)+14,Math.max(...ys)-Math.min(...ys)+14);c.setLineDash([])}
  if(o.corners)for(const v of vertices(t,o.selected)){c.fillStyle=BLACK;c.fillRect(v.point.x-7,v.point.y-7,14,14);c.strokeStyle=WHITE;c.lineWidth=3;c.strokeRect(v.point.x-5,v.point.y-5,10,10)}
  if(o.guides){c.strokeStyle='#42e7ef';c.lineWidth=1;c.setLineDash([5,5]);if(o.guides.x!==undefined){c.beginPath();c.moveTo(o.guides.x,0);c.lineTo(o.guides.x,H);c.stroke()}if(o.guides.y!==undefined){c.beginPath();c.moveTo(0,o.guides.y);c.lineTo(W,o.guides.y);c.stroke()}c.setLineDash([])}
  if(o.invalid){c.globalAlpha=.7;for(const p of o.invalid.parts.filter(p=>p.id===o.selected||p.boundary&&selected?.boundary)){drawPart(c,{...p,color:'#ff3030'})}c.globalAlpha=1}
 }
 ctx.imageSmoothingEnabled=polished;ctx.clearRect(0,0,W,H);ctx.drawImage(buffer,0,0,W,H);
}
export function drawThumbnail(canvas:HTMLCanvasElement,p:Part){canvas.width=96;canvas.height=80;const c=canvas.getContext('2d')!;c.translate(48,40);c.scale(.8,.8);const q={...p,x:0,y:0};if(q.kind==='wall'){q.x=-35;q.y=15;q.x2=35;q.y2=-15}if(q.kind==='leftFlipper')q.x=-30;if(q.kind==='rightFlipper')q.x=30;drawPart(c,q)}

export function drawBackground(ctx:CanvasRenderingContext2D,t:Table){ctx.clearRect(0,0,W,H);surface(ctx,t)}
