import type {Part,Point,Table} from './model';
export const same=(a:Point,b:Point)=>Math.hypot(a.x-b.x,a.y-b.y)<.01;
export const end=(p:Part):Point=>({x:p.x2??p.x+100,y:p.y2??p.y});
export function transform(p:Part,v:Point):Point {const a=p.rotation*Math.PI/180,s=p.scale??1,x=p.mirror?-v.x:v.x;return {x:p.x+s*(x*Math.cos(a)-v.y*Math.sin(a)),y:p.y+s*(x*Math.sin(a)+v.y*Math.cos(a))}}
export function local(p:Part,v:Point):Point {const a=-p.rotation*Math.PI/180,s=p.scale??1,x=(v.x-p.x)/s,y=(v.y-p.y)/s;return {x:(p.mirror?-1:1)*(x*Math.cos(a)-y*Math.sin(a)),y:x*Math.sin(a)+y*Math.cos(a)}}
export function shape(p:Part):Point[]{
  if(p.kind==='obstacle')return (p.points??[]).map(v=>transform(p,v));
  if(p.kind==='slingshot')return [{x:-22,y:-40},{x:24,y:40},{x:-22,y:22}].map(v=>transform(p,v));
  if(p.kind==='leftFlipper'||p.kind==='rightFlipper'){const d=p.kind==='leftFlipper'?1:-1;return [{x:-6,y:-10},{x:82*d,y:-4},{x:92*d,y:3},{x:0,y:11}].map(v=>transform(p,v))}
  const w=p.kind==='artwork'?(p.art?.width??80)/2:p.kind==='launcher'?9:p.kind==='drain'?38:23,h=p.kind==='artwork'?(p.art?.height??80)/2:p.kind==='launcher'?32:p.kind==='drain'?7:13;
  return [{x:-w,y:-h},{x:w,y:-h},{x:w,y:h},{x:-w,y:h}].map(v=>transform(p,v));
}
export function perimeter(t:Table):Point[]{const out:Point[]=[];for(const p of t.parts.filter(p=>p.boundary)){if(!out.length||!same(out[out.length-1],p))out.push({x:p.x,y:p.y});out.push(end(p))}if(out.length>1&&same(out[0],out[out.length-1]))out.pop();return out}
const cross=(a:Point,b:Point,c:Point)=>(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);
function on(a:Point,b:Point,c:Point){return Math.abs(cross(a,b,c))<.001&&c.x>=Math.min(a.x,b.x)-.001&&c.x<=Math.max(a.x,b.x)+.001&&c.y>=Math.min(a.y,b.y)-.001&&c.y<=Math.max(a.y,b.y)+.001}
function intersects(a:Point,b:Point,c:Point,d:Point){return cross(a,b,c)*cross(a,b,d)<0&&cross(c,d,a)*cross(c,d,b)<0||on(a,b,c)||on(a,b,d)||on(c,d,a)||on(c,d,b)}
export function simplePolygon(v:Point[]):boolean{
  if(v.length<3)return false;
  let area=0;for(let i=0;i<v.length;i++){const a=v[i],b=v[(i+1)%v.length];if(Math.hypot(a.x-b.x,a.y-b.y)<3)return false;area+=a.x*b.y-b.x*a.y;
    for(let j=i+1;j<v.length;j++){if(j===i+1||i===0&&j===v.length-1)continue;if(intersects(a,b,v[j],v[(j+1)%v.length]))return false}}
  return Math.abs(area)>40;
}
export function inside(point:Point,v:Point[]){let yes=false;for(let i=0,j=v.length-1;i<v.length;j=i++){const a=v[i],b=v[j];if(on(a,b,point))return true;if((a.y>point.y)!==(b.y>point.y)&&point.x<(b.x-a.x)*(point.y-a.y)/(b.y-a.y)+a.x)yes=!yes}return yes}
export function project(v:Point,a:Point,b:Point){const dx=b.x-a.x,dy=b.y-a.y,d=dx*dx+dy*dy;const u=d?Math.max(0,Math.min(1,((v.x-a.x)*dx+(v.y-a.y)*dy)/d)):0;const point={x:a.x+dx*u,y:a.y+dy*u};return {point,distance:Math.hypot(v.x-point.x,v.y-point.y)}}
export function validGeometry(t:Table){
  const bounded=(v:Point)=>Number.isFinite(v.x)&&Number.isFinite(v.y)&&v.x>=0&&v.x<=560&&v.y>=0&&v.y<=840;
  for(const p of t.parts){if(!bounded(p))return false;if(p.kind==='wall'&&(!bounded(end(p))||Math.hypot(p.x-end(p).x,p.y-end(p).y)<3))return false;if(p.kind==='obstacle'){const v=shape(p);if(!v.every(bounded)||!simplePolygon(v))return false}}
  const border=t.parts.filter(p=>p.boundary);if(!border.length)return true;
  if(border.filter((p,i)=>!same(end(p),border[(i+1)%border.length])).length!==1)return false;
  return simplePolygon(perimeter(t));
}
export type Vertex={id:string;index:number;point:Point};
export function vertices(t:Table,id?:string):Vertex[]{return t.parts.filter(p=>p.id===id||(t.parts.find(q=>q.id===id)?.boundary&&p.boundary)).flatMap(p=>p.kind==='wall'?[{id:p.id,index:0,point:{x:p.x,y:p.y}},{id:p.id,index:1,point:end(p)}]:p.kind==='obstacle'?shape(p).map((point,index)=>({id:p.id,index,point})):[])}
export function moveVertex(t:Table,v:Vertex,to:Point){const p=t.parts.find(p=>p.id===v.id)!;if(p.kind==='obstacle'){p.points![v.index]=local(p,to);return}const old=v.index===0?{x:p.x,y:p.y}:end(p);for(const q of t.parts){if(q.id!==p.id&&!(p.boundary&&q.boundary))continue;if(same(q,old)){q.x=to.x;q.y=to.y}if(q.kind==='wall'&&same(end(q),old)){q.x2=to.x;q.y2=to.y}}}
export function translate(t:Table,id:string,dx:number,dy:number){const p=t.parts.find(p=>p.id===id)!;if(p.kind==='wall'){const a={x:p.x,y:p.y},b=end(p);moveVertex(t,{id,index:0,point:a},{x:a.x+dx,y:a.y+dy});moveVertex(t,{id,index:1,point:b},{x:b.x+dx,y:b.y+dy})}else{p.x+=dx;p.y+=dy}}
export function addCorner(t:Table,id:string,point:Point,newId:string){const p=t.parts.find(p=>p.id===id)!;if(p.kind==='wall'){const q={...p,id:newId,x:point.x,y:point.y};p.x2=point.x;p.y2=point.y;t.parts.splice(t.parts.indexOf(p)+1,0,q)}else if(p.kind==='obstacle'){const v=shape(p);const edges=v.map((a,i)=>({i,...project(point,a,v[(i+1)%v.length])})).sort((a,b)=>a.distance-b.distance);p.points!.splice(edges[0].i+1,0,local(p,edges[0].point))}}
export function removeCorner(t:Table,v:Vertex):boolean{const p=t.parts.find(p=>p.id===v.id)!;if(p.kind==='obstacle'){if(p.points!.length<=3)return false;p.points!.splice(v.index,1);return true}
  const point=v.index===0?{x:p.x,y:p.y}:end(p);const incoming=t.parts.find(q=>q.kind==='wall'&&!!q.boundary===!!p.boundary&&same(end(q),point));const outgoing=t.parts.find(q=>q.kind==='wall'&&!!q.boundary===!!p.boundary&&same(q,point));
  if(!incoming||!outgoing||incoming.id===outgoing.id)return false;
  incoming.x2=outgoing.x2;incoming.y2=outgoing.y2;t.parts.splice(t.parts.indexOf(outgoing),1);return true;
}
export function triangles(points:Point[]):Point[][]{let v=points.map(p=>({...p}));if(v.reduce((a,p,i)=>a+p.x*v[(i+1)%v.length].y-v[(i+1)%v.length].x*p.y,0)<0)v.reverse();const out:Point[][]=[];let guard=0;
  while(v.length>3&&guard++<200){let found=false;for(let i=0;i<v.length;i++){const a=v[(i+v.length-1)%v.length],b=v[i],c=v[(i+1)%v.length];if(cross(a,b,c)<=.001)continue;if(v.some(p=>p!==a&&p!==b&&p!==c&&inside(p,[a,b,c])))continue;out.push([a,b,c]);v.splice(i,1);found=true;break}if(!found)break}if(v.length===3)out.push(v);return out;
}
