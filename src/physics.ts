import Matter from 'matter-js';
import {H,Table,W} from './model';
export type Game={step:(dt:number)=>void;stop:()=>void;ball:()=>{x:number;y:number}|undefined;score:()=>number;balls:()=>number;launch:()=>void;flippers:(left:boolean,right:boolean)=>void};
export function createGame(t:Table,onChange:()=>void):Game{
  const {Engine,Bodies,Body,Composite,Events}=Matter;const engine=Engine.create({gravity:{x:0,y:1.15,scale:.001}});engine.positionIterations=10;engine.velocityIterations=10;
  let points=0,remaining=3,ball:Matter.Body|undefined;const flipperBodies:{left?:Matter.Body;right?:Matter.Body}={};let leftOn=false,rightOn=false;
  const spawn=()=>{if(ball)Composite.remove(engine.world,ball);const p=t.parts.find(x=>x.kind==='ball');ball=Bodies.circle(p?.x??508,p?.y??690,11,{restitution:.6,friction:.002,frictionAir:.0005,label:'ball'});Composite.add(engine.world,ball);onChange()};
  const wall=(x:number,y:number,x2:number,y2:number,color='wall')=>{const dx=x2-x,dy=y2-y;const b=Bodies.rectangle((x+x2)/2,(y+y2)/2,Math.hypot(dx,dy),9,{isStatic:true,angle:Math.atan2(dy,dx),restitution:.55,label:color});Composite.add(engine.world,b)};
  for(const p of t.parts){
    if(p.kind==='wall')wall(p.x,p.y,p.x2??p.x+100,p.y2??p.y);
    else if(p.kind==='bumper'){Composite.add(engine.world,Bodies.circle(p.x,p.y,p.r??30,{isStatic:true,restitution:1.55,label:`score:${p.score||100}`}))}
    else if(p.kind==='target')Composite.add(engine.world,Bodies.rectangle(p.x,p.y,46,32,{isStatic:true,restitution:.9,label:`score:${p.score||100}`}));
    else if(p.kind==='slingshot')Composite.add(engine.world,Bodies.polygon(p.x,p.y,3,30,{isStatic:true,restitution:1.2,label:`score:${p.score||100}`}));
    else if(p.kind==='leftFlipper'||p.kind==='rightFlipper'){const d=p.kind==='leftFlipper'?1:-1;const b=Bodies.rectangle(p.x+d*45,p.y,95,17,{isStatic:true,angle:d===1?.12:Math.PI-.12,restitution:.5,label:p.kind});Composite.add(engine.world,b);flipperBodies[d===1?'left':'right']=b}
    else if(p.kind==='zone'||p.kind==='rollover')Composite.add(engine.world,Bodies.circle(p.x,p.y,p.r??24,{isStatic:true,isSensor:true,label:`score:${p.score||100}`}));
  }
  wall(0,0,W,0);wall(0,0,0,H);wall(W,0,W,H);
  const hits=new Map<string,number>();Events.on(engine,'collisionStart',e=>{for(const pair of e.pairs){const other=pair.bodyA===ball?pair.bodyB:pair.bodyB===ball?pair.bodyA:undefined;if(!other||!other.label.startsWith('score:'))continue;const now=engine.timing.timestamp;if(now-(hits.get(other.id.toString())??-9999)<180)continue;hits.set(other.id.toString(),now);points+=Number(other.label.slice(6));if(ball&&!other.isSensor)Body.setVelocity(ball,{x:ball.velocity.x*1.1,y:Math.min(ball.velocity.y,-7)});onChange()}});
  spawn();return {step(dt){if(flipperBodies.left)Body.setAngle(flipperBodies.left,(leftOn?-.52:.12));if(flipperBodies.right)Body.setAngle(flipperBodies.right,(rightOn?Math.PI+.52:Math.PI-.12));Engine.update(engine,Math.min(dt,1000/60));if(ball&&(ball.position.y>H+20||ball.position.x<-30||ball.position.x>W+30)){remaining--;if(remaining>0)spawn();else{Composite.remove(engine.world,ball);ball=undefined;onChange()}}},stop(){Matter.Composite.clear(engine.world,false)},ball(){return ball?.position},score(){return points},balls(){return remaining},launch(){if(ball)Body.setVelocity(ball,{x:-2,y:-17})},flippers(left,right){leftOn=left;rightOn=right}};
}
