import Matter from 'matter-js';
import {H,Part,Point,Table,W} from './model';
import {end,project,shape,triangles} from './geometry';

// Display-independent 120 Hz ticks, each with four fixed Matter updates.
export const TICK_MS=1000/120;
const SUBSTEPS=4, STEP_MS=TICK_MS/SUBSTEPS;
export const MAX_BALL_SPEED=36; // Matter units: table units per 60 Hz frame.
const SWING=.7, UP_SPEED=10, RETURN_SPEED=5;
export type GameState='ready'|'playing'|'paused'|'gameover';
export type GameSnapshot={state:GameState;elapsedMs:number;score:number;balls:number;ball?:Point;velocity?:Point;canLaunch:boolean};
export type Game={step:(dt:number)=>void;stop:()=>void;restart:()=>void;pause:(paused:boolean)=>void;snapshot:()=>GameSnapshot;ball:()=>Point|undefined;score:()=>number;balls:()=>number;launch:()=>void;flippers:(left:boolean,right:boolean)=>void;parts:()=>Part[];flash:()=>string|undefined};

export function createGame(source:Table,onChange:()=>void,onHit?:(score:number)=>void):Game {
  const t=structuredClone(source);
  const {Engine,Bodies,Body,Composite,Vertices}=Matter;
  const engine=Engine.create({gravity:{x:0,y:1.1,scale:.001}});
  engine.positionIterations=10; engine.velocityIterations=10;
  let points=0,remaining=3,elapsed=0,accumulator=0;
  let ball:Matter.Body|undefined;
  let leftOn=false,rightOn=false,paused=false,stopped=false,serving=true;
  let lastHit:string|undefined,hitTime=-Infinity;
  let touching=new Set<string>();
  const lastAward=new Map<string,number>(),mapping=new Map<number,Part>();
  const flippers:{p:Part;body:Matter.Body;center:Point;angle:number}[]=[];
  const startingBall=t.parts.find(p=>p.kind==='ball');
  const launcher=t.parts.filter(p=>p.kind==='launcher').sort((a,b)=>startingBall
    ? Math.hypot(a.x-startingBall.x,a.y-startingBall.y)-Math.hypot(b.x-startingBall.x,b.y-startingBall.y):0)[0];
  const launchAngle=(launcher?.rotation??0)*Math.PI/180;
  const spawnPoint=startingBall?{x:startingBall.x,y:startingBall.y}:launcher
    ?{x:launcher.x+Math.sin(launchAngle)*55,y:launcher.y-Math.cos(launchAngle)*55}:{x:508,y:720};

  function polygon(p:Part,sensor=false) {
    const v=shape(p);
    // Avoid artificial triangle seams on convex flippers and targets.
    if(Vertices.isConvex(v as Matter.Vector[])) {
      const c=Vertices.centre(v as Matter.Vector[]);
      return Bodies.fromVertices(c.x,c.y,[v],{isStatic:true,isSensor:sensor});
    }
    const pieces=triangles(v).map(v=>{const c=Vertices.centre(v as Matter.Vector[]);return Bodies.fromVertices(c.x,c.y,[v],{isStatic:true,isSensor:sensor})});
    return Body.create({parts:pieces,isStatic:true,isSensor:sensor});
  }
  function add(body:Matter.Body,p:Part,restitution=.6) {
    // Matter's setStatic resets materials; apply rubber after body creation.
    for(const piece of body.parts) {
      piece.restitution=restitution;piece.friction=.015;piece.frictionStatic=.05;piece.slop=.02;
      mapping.set(piece.id,p);
    }
    mapping.set(body.id,p); Composite.add(engine.world,body);
  }
  for(const p of t.parts) {
    if(p.kind==='wall') {const b=end(p),dx=b.x-p.x,dy=b.y-p.y;add(Bodies.rectangle((p.x+b.x)/2,(p.y+b.y)/2,Math.hypot(dx,dy),p.boundary?4:7,{isStatic:true,angle:Math.atan2(dy,dx)}),p,.7)}
    else if(['bumper','rollover','zone'].includes(p.kind)) add(Bodies.circle(p.x,p.y,(p.r??27)*(p.scale??1),{isStatic:true,isSensor:p.kind!=='bumper'}),p,.7);
    else if(p.kind==='artwork'&&p.art?.role!=='decoration') add(polygon(p),p);
    else if(['obstacle','slingshot','target','leftFlipper','rightFlipper','drain'].includes(p.kind)) {
      const body=polygon(p,p.kind==='drain');add(body,p,p.kind.endsWith('Flipper')?.35:.6);
      if(p.kind.endsWith('Flipper')) flippers.push({p,body,center:{...body.position},angle:0});
    } else if(p.kind==='launcher') {
      const a=p.rotation*Math.PI/180,s=p.scale??1;
      add(Bodies.rectangle(p.x-Math.sin(a)*28*s,p.y+Math.cos(a)*28*s,24*s,6*s,{isStatic:true,angle:a}),p,.2);
    }
  }
  function spawn() {
    if(ball)Composite.remove(engine.world,ball);
    ball=Bodies.circle(spawnPoint.x,spawnPoint.y,10,{label:'Pinball',restitution:.35,friction:.008,frictionStatic:.03,frictionAir:.0007,slop:.02},32);
    Composite.add(engine.world,ball);serving=true;touching.clear();lastAward.clear();
  }
  function capSpeed() {
    if(!ball)return;const v=Body.getVelocity(ball),speed=Math.hypot(v.x,v.y);
    if(speed>MAX_BALL_SPEED)Body.setVelocity(ball,{x:v.x*MAX_BALL_SPEED/speed,y:v.y*MAX_BALL_SPEED/speed});
  }
  function moveFlipper(f:typeof flippers[number],angle:number,inferVelocity:boolean) {
    const dx=f.center.x-f.p.x,dy=f.center.y-f.p.y;
    // The installed 0.19 typings omit the documented 0.20 third argument.
    (Body.setAngle as (b:Matter.Body,a:number,v:boolean)=>void)(f.body,angle,inferVelocity);
    (Body.setPosition as (b:Matter.Body,p:Point,v:boolean)=>void)(f.body,{x:f.p.x+dx*Math.cos(angle)-dy*Math.sin(angle),y:f.p.y+dx*Math.sin(angle)+dy*Math.cos(angle)},inferVelocity);
    f.angle=angle;
  }
  function rubberKick(p:Part) {
    if(!ball)return;
    let normal:Point;
    if(p.kind==='bumper')normal={x:ball.position.x-p.x,y:ball.position.y-p.y};
    else {const v=shape(p),nearest=v.map((a,i)=>project(ball!.position,a,v[(i+1)%v.length])).sort((a,b)=>a.distance-b.distance)[0].point;normal={x:ball.position.x-nearest.x,y:ball.position.y-nearest.y}}
    const length=Math.hypot(normal.x,normal.y);if(length<.001)return;
    normal.x/=length;normal.y/=length;
    const v=Body.getVelocity(ball),outward=v.x*normal.x+v.y*normal.y,kick=Math.max(0,(p.kind==='bumper'?12:10)-outward);
    Body.setVelocity(ball,{x:v.x+normal.x*kick,y:v.y+normal.y*kick});
  }
  function drain() {
    if(!ball)return;Composite.remove(engine.world,ball);ball=undefined;remaining--;lastHit=undefined;
    if(remaining>0)spawn();else serving=false;
    onChange();
  }
  function substep() {
    if(!ball)return;
    for(const f of flippers) {
      const active=f.p.kind==='leftFlipper'?leftOn:rightOn,target=active?(f.p.kind==='leftFlipper'?-SWING:SWING):0;
      const distance=target-f.angle,travel=(active?UP_SPEED:RETURN_SPEED)*STEP_MS/1000;
      moveFlipper(f,f.angle+Math.sign(distance)*Math.min(Math.abs(distance),travel),true);
    }
    capSpeed();Engine.update(engine,STEP_MS);elapsed+=STEP_MS;
    // Read solved contacts once; a compound part can produce several pairs.
    const contacts=new Map<string,Part>();
    for(const pair of engine.pairs.list as {isActive:boolean;bodyA:Matter.Body;bodyB:Matter.Body}[]) {
      if(!pair.isActive)continue;
      const other=pair.bodyA.parent===ball?pair.bodyB:pair.bodyB.parent===ball?pair.bodyA:undefined;
      const p=other&&mapping.get(other.id);if(p)contacts.set(p.id,p);
    }
    if([...contacts.values()].some(p=>p.kind==='drain')||ball.position.y>H+20||ball.position.y<-40||ball.position.x<-30||ball.position.x>W+30){drain();return}
    for(const p of contacts.values()) {
      const scores=['bumper','target','slingshot','rollover','zone'].includes(p.kind)||p.kind==='artwork'&&p.art?.role==='target';
      if(!scores||touching.has(p.id)||elapsed-(lastAward.get(p.id)??-Infinity)<100)continue;
      lastAward.set(p.id,elapsed);points+=p.score;lastHit=p.id;hitTime=elapsed;
      if(p.kind==='bumper'||p.kind==='slingshot')rubberKick(p);
      onHit?.(p.score);onChange();
    }
    touching=new Set(contacts.keys());
    if(serving&&Math.hypot(ball.position.x-spawnPoint.x,ball.position.y-spawnPoint.y)>85)serving=false;
    capSpeed();
  }
  spawn();
  return {
    step(dt) {
      if(stopped||paused||!ball||!Number.isFinite(dt)||dt<=0)return;
      // Bound catch-up after stalls; keep fixed steps on 30/60/120/144 Hz displays.
      accumulator+=Math.min(dt,100);
      while(accumulator+1e-8>=TICK_MS&&ball){for(let i=0;i<SUBSTEPS&&ball;i++)substep();accumulator-=TICK_MS}
    },
    stop(){if(stopped)return;stopped=true;ball=undefined;Composite.clear(engine.world,false);Engine.clear(engine)},
    restart(){if(stopped)return;points=elapsed=accumulator=0;remaining=3;leftOn=rightOn=paused=false;lastHit=undefined;hitTime=-Infinity;for(const f of flippers){moveFlipper(f,0,false);Body.setVelocity(f.body,{x:0,y:0});Body.setAngularVelocity(f.body,0)}Engine.clear(engine);spawn();onChange()},
    pause(value){paused=value;accumulator=0;if(value)leftOn=rightOn=false;onChange()},
    snapshot(){return{state:remaining===0?'gameover':paused?'paused':serving?'ready':'playing',elapsedMs:elapsed,score:points,balls:remaining,ball:ball?{...ball.position}:undefined,velocity:ball?Body.getVelocity(ball):undefined,canLaunch:!!ball&&serving&&!paused&&!stopped}},
    ball:()=>ball?{...ball.position}:undefined,score:()=>points,balls:()=>remaining,
    launch(){if(!ball||!serving||paused||stopped)return;serving=false;Body.setVelocity(ball,{x:Math.sin(launchAngle)*22,y:-Math.cos(launchAngle)*22});onChange()},
    flippers(left,right){leftOn=!paused&&left;rightOn=!paused&&right},
    parts:()=>t.parts.map(p=>{const f=flippers.find(f=>f.p.id===p.id);return f?{...p,rotation:p.rotation+f.angle*180/Math.PI}:p}),
    flash:()=>elapsed-hitTime<130?lastHit:undefined
  };
}
