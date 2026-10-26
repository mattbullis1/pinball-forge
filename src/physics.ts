import Matter from 'matter-js';
import {H,Part,Point,Table,W} from './model';
import {end,shape,triangles} from './geometry';
export type Game={step:(dt:number)=>void;stop:()=>void;ball:()=>Point|undefined;score:()=>number;balls:()=>number;launch:()=>void;flippers:(left:boolean,right:boolean)=>void;parts:()=>Part[];flash:()=>string|undefined};
export function createGame(t:Table,onChange:()=>void,onHit?:(score:number)=>void):Game{
 const {Engine,Bodies,Body,Composite,Events,Vertices}=Matter;
 const engine=Engine.create({gravity:{x:0,y:1.1,scale:.001}});engine.positionIterations=10;engine.velocityIterations=10;
 let points=0,remaining=3,ball:Matter.Body|undefined,leftOn=false,rightOn=false,lastHit:string|undefined,hitTime=-9999;
 const mapping=new Map<number,Part>(),flippers:{p:Part;body:Matter.Body;center:Point;angle:number}[]=[];
 function polygon(p:Part,sensor=false){const pieces=triangles(shape(p)).map(v=>{const center=Vertices.centre(v as Matter.Vector[]);return Bodies.fromVertices(center.x,center.y,[v],{isStatic:true,isSensor:sensor,restitution:.65},true)});const body=Body.create({parts:pieces,isStatic:true,isSensor:sensor,restitution:.65});return body}
 function add(body:Matter.Body,p:Part){Composite.add(engine.world,body);mapping.set(body.id,p);body.parts.forEach(b=>mapping.set(b.id,p))}
 for(const p of t.parts){
  if(p.kind==='wall'){const b=end(p),dx=b.x-p.x,dy=b.y-p.y;add(Bodies.rectangle((p.x+b.x)/2,(p.y+b.y)/2,Math.hypot(dx,dy),p.boundary?4:7,{isStatic:true,angle:Math.atan2(dy,dx),restitution:.65}),p)}
  else if(['bumper','rollover','zone'].includes(p.kind))add(Bodies.circle(p.x,p.y,(p.r??27)*(p.scale??1),{isStatic:true,isSensor:p.kind!=='bumper',restitution:1.1}),p);
  else if(p.kind==='artwork'&&p.art?.role!=='decoration'){add(polygon(p),p)}
  else if(['obstacle','slingshot','target','leftFlipper','rightFlipper','drain'].includes(p.kind)){const b=polygon(p,p.kind==='drain');add(b,p);if(p.kind.endsWith('Flipper'))flippers.push({p,body:b,center:{...b.position},angle:0})}
  else if(p.kind==='launcher'){const angle=p.rotation*Math.PI/180,s=p.scale??1;add(Bodies.rectangle(p.x-Math.sin(angle)*28*s,p.y+Math.cos(angle)*28*s,24*s,6*s,{isStatic:true,angle}),p)}
 }
 const spawn=()=>{if(ball)Composite.remove(engine.world,ball);const p=t.parts.find(p=>p.kind==='ball');ball=Bodies.circle(p?.x??508,p?.y??720,10,{restitution:.5,friction:.002,frictionAir:.0007});Composite.add(engine.world,ball)};
 let drainPending=false;
 Events.on(engine,'collisionStart',e=>{const contacted=new Set<string>();for(const pair of e.pairs){const other=pair.bodyA===ball?pair.bodyB:pair.bodyB===ball?pair.bodyA:undefined;if(!other)continue;const p=mapping.get(other.id);if(!p||contacted.has(p.id))continue;contacted.add(p.id);
 if(p.kind==='drain'){drainPending=true;continue}
 if(['bumper','target','slingshot','rollover','zone'].includes(p.kind)||p.kind==='artwork'&&p.art?.role==='target'){points+=p.score;lastHit=p.id;hitTime=engine.timing.timestamp;onHit?.(p.score);if(ball&&['bumper','slingshot'].includes(p.kind)){const dx=ball.position.x-p.x,dy=ball.position.y-p.y,n=Math.hypot(dx,dy)||1;Body.setVelocity(ball,{x:dx/n*10,y:dy/n*10})}onChange()}
 if(ball&&p.kind.endsWith('Flipper')&&(p.kind==='leftFlipper'?leftOn:rightOn))Body.setVelocity(ball,{x:p.kind==='leftFlipper'?4:-4,y:-12});
 }});
 spawn();return {
 step(dt){for(const f of flippers){const activated=f.p.kind==='leftFlipper'?leftOn:rightOn,target=activated?(f.p.kind==='leftFlipper'?-1:1)*.7:0;f.angle+=(target-f.angle)*.45;const dx=f.center.x-f.p.x,dy=f.center.y-f.p.y,a=f.angle;Body.setAngle(f.body,a);Body.setPosition(f.body,{x:f.p.x+dx*Math.cos(a)-dy*Math.sin(a),y:f.p.y+dx*Math.sin(a)+dy*Math.cos(a)})}
 Engine.update(engine,Math.min(dt,1000/120));if(ball&&(drainPending||ball.position.y>H+20||ball.position.x<-30||ball.position.x>W+30)){drainPending=false;remaining--;if(remaining>0)spawn();else{Composite.remove(engine.world,ball);ball=undefined}onChange()}},
 stop(){Events.off(engine,'collisionStart');Composite.clear(engine.world,false);Engine.clear(engine)},ball(){return ball?{...ball.position}:undefined},score(){return points},balls(){return remaining},
 launch(){if(ball){const launcher=t.parts.filter(p=>p.kind==='launcher').sort((a,b)=>Math.hypot(a.x-ball!.position.x,a.y-ball!.position.y)-Math.hypot(b.x-ball!.position.x,b.y-ball!.position.y))[0];const a=(launcher?.rotation??0)*Math.PI/180;Body.setVelocity(ball,{x:Math.sin(a)*20,y:-Math.cos(a)*20})}},
 flippers(left,right){leftOn=left;rightOn=right},parts(){return t.parts.map(p=>{const f=flippers.find(f=>f.p.id===p.id);return f?{...p,rotation:p.rotation+f.angle*180/Math.PI}:p})},flash(){return engine.timing.timestamp-hitTime<130?lastHit:undefined}
 };
}
