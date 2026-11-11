import {tableSize,type Point,type Table} from './model';
import {end,perimeter,shape} from './geometry';

// Match the construction surface's two-pixel grid. Only area boundaries stop
// the brush; rollovers, balls and other game pieces do not divide the surface.
const grid=(t:Table)=>{const {width:W,height:H}=tableSize(t);return {W,H,width:W/2,height:H/2}};
export function floodArea(blocked:Uint8Array,w:number,start:number){
 const found=new Uint8Array(blocked.length),queue=new Int32Array(blocked.length);
 if(start<0||start>=blocked.length||blocked[start])return found;
 let head=0,tail=1;queue[0]=start;found[start]=1;
 const visit=(i:number)=>{if(i>=0&&i<blocked.length&&!blocked[i]&&!found[i]){found[i]=1;queue[tail++]=i}};
 while(head<tail){const i=queue[head++];if(i%w)visit(i-1);if(i%w<w-1)visit(i+1);visit(i-w);visit(i+w)}
 return found;
}
const cell=(p:Point,width:number,height:number)=>Math.max(0,Math.min(height-1,Math.floor(p.y/2)))*width+Math.max(0,Math.min(width-1,Math.floor(p.x/2)));
function areaMask(t:Table){
 const {W,H,width,height}=grid(t);
 const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
 const c=canvas.getContext('2d')!;c.scale(.5,.5);c.fillStyle='#fff';c.fillRect(0,0,W,H);
 const polygon=(points:Point[],outline=false)=>{c.beginPath();points.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.closePath();if(outline)c.stroke();else c.fill()};
 c.fillStyle='#000';const border=perimeter(t);if(border.length)polygon(border);else c.fillRect(0,0,W,H);
 c.strokeStyle=c.fillStyle='#fff';c.lineWidth=7;c.lineCap='square';
 for(const p of t.parts){if(p.kind==='wall'){c.beginPath();c.moveTo(p.x,p.y);c.lineTo(end(p).x,end(p).y);c.stroke()}else if(p.kind==='obstacle')polygon(shape(p),p.wallLoop)}
 const data=c.getImageData(0,0,width,height).data;
 return Uint8Array.from({length:width*height},(_,i)=>data[i*4]>0?1:0);
}
export function paintSurface(t:Table,point:Point,color:string){
 const {width,height}=grid(t);
 const region=floodArea(areaMask(t),width,cell(point,width,height));if(!region[cell(point,width,height)])return;
 // Repainting replaces the previous fill for this connected area.
 t.surfacePaint=(t.surfacePaint??[]).filter(p=>!region[cell(p,width,height)]);
 t.surfacePaint.push({x:point.x,y:point.y,color});
}
export function drawSurfacePaint(c:CanvasRenderingContext2D,t:Table){
 if(!t.surfacePaint?.length)return;
 const {W,H,width,height}=grid(t);
 const blocked=areaMask(t),canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
 const ctx=canvas.getContext('2d')!,image=ctx.createImageData(width,height);
 for(const fill of t.surfacePaint){
  const region=floodArea(blocked,width,cell(fill,width,height)),rgb=[1,3,5].map(i=>parseInt(fill.color.slice(i,i+2),16));
  for(let i=0;i<region.length;i++)if(region[i]){image.data[i*4]=rgb[0];image.data[i*4+1]=rgb[1];image.data[i*4+2]=rgb[2];image.data[i*4+3]=255}
 }
 ctx.putImageData(image,0,0);c.save();c.imageSmoothingEnabled=false;c.drawImage(canvas,0,0,W,H);c.restore();
}
