import Matter from 'matter-js';
import {Part,Point,Table,tableSize} from './model';
import {end,local,project,shape,transform,triangles} from './geometry';
import {referenceSprites} from './reference-parts';
import {GameRules,AdvancedSnapshot,Burst} from './game-rules';
import {advancedKinds,RuleAction} from './advanced-model';

// Display-independent 120 Hz ticks, each with four fixed Matter updates.
export const TICK_MS=1000/120;
const SUBSTEPS=4, STEP_MS=TICK_MS/SUBSTEPS;
export const MAX_BALL_SPEED=36; // Matter units: table units per 60 Hz frame.
const SWING=.7, UP_SPEED=10, RETURN_SPEED=5;
const KICK_SCATTER=2*Math.PI/180;
const SCATTER_SEED=0x6d2b79f5;
export type GameState='ready'|'playing'|'paused'|'gameover';
export type GameSnapshot={state:GameState;elapsedMs:number;score:number;balls:number;ball?:Point;velocity?:Point;canLaunch:boolean;advanced:AdvancedSnapshot};
export type Game={step:(dt:number)=>void;stop:()=>void;restart:()=>void;pause:(paused:boolean)=>void;snapshot:()=>GameSnapshot;ball:()=>Point|undefined;score:()=>number;balls:()=>number;launch:()=>void;flippers:(left:boolean,right:boolean)=>void;parts:()=>Part[];flash:()=>string|undefined;ballPositions:()=>Point[];effects:()=>Burst[]};

export function createGame(source:Table,onChange:()=>void,onHit?:(score:number,kind:Part['kind'])=>void,onSound?:(id:string)=>void):Game {
  const t=structuredClone(source);
  const {width:W,height:H}=tableSize(t);
  const {Engine,Bodies,Body,Composite,Vertices}=Matter;
  const engine=Engine.create({gravity:{x:0,y:t.gravity??1.1,scale:.001}});
  engine.positionIterations=10; engine.velocityIterations=10;
  let points=0,remaining=3,elapsed=0,accumulator=0;
  // Advance only on powered contacts, never on render frames. A fixed seed keeps
  // replay/restart and the editor/export identical while varying successive kicks.
  let scatterState=SCATTER_SEED;
  function scatterAngle(){scatterState^=scatterState<<13;scatterState^=scatterState>>>17;scatterState^=scatterState<<5;return ((scatterState>>>0)/0x100000000*2-1)*KICK_SCATTER}
  let ball:Matter.Body|undefined,servedBall:Matter.Body|undefined;
  let leftOn=false,rightOn=false,paused=false,stopped=false,serving=true;
  let lastHit:string|undefined,hitTime=-Infinity;
  let touching=new Set<string>();
  const liveBalls:Matter.Body[]=[];
  const bodies=new Map<string,Matter.Body>(),disabled=new Set(t.parts.filter(p=>p.enabled===false).map(p=>p.id));
  const dropped=new Map<string,number>(),spins=new Map<string,{angle:number;speed:number}>();
  const trapped=new Map<string,number>();
  const rules=new GameRules(t,action,(value)=>{points+=value});
  const lastAward=new Map<string,number>(),mapping=new Map<number,Part>();
  const flippers:{p:Part;body:Matter.Body;center:Point;angle:number}[]=[];
  const startingBall=t.parts.find(p=>p.kind==='ball');
  const launcher=t.parts.filter(p=>p.kind==='launcher').sort((a,b)=>startingBall
    ? Math.hypot(a.x-startingBall.x,a.y-startingBall.y)-Math.hypot(b.x-startingBall.x,b.y-startingBall.y):0)[0];
  const launchAngle=(launcher?.rotation??0)*Math.PI/180;
  const launchOffset=launcher?.sprite==='launcher'?34*(launcher.scale??1):55;
  const spawnPoint=startingBall?{x:startingBall.x,y:startingBall.y}:launcher
    ?{x:launcher.x+Math.sin(launchAngle)*launchOffset,y:launcher.y-Math.cos(launchAngle)*launchOffset}:{x:W-52,y:H-120};

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
    mapping.set(body.id,p); bodies.set(p.id,body);if(disabled.has(p.id))body.collisionFilter.mask=0;Composite.add(engine.world,body);
  }
  for(const p of t.parts) {
    if(p.kind==='wall') {const b=end(p),dx=b.x-p.x,dy=b.y-p.y;add(Bodies.rectangle((p.x+b.x)/2,(p.y+b.y)/2,Math.hypot(dx,dy),p.boundary?4:7,{isStatic:true,angle:Math.atan2(dy,dx)}),p,.7)}
    else if(p.wallLoop){
      const v=shape(p),edges=v.flatMap((a,i)=>{const b=v[(i+1)%v.length],dx=b.x-a.x,dy=b.y-a.y;return [
        Bodies.rectangle((a.x+b.x)/2,(a.y+b.y)/2,Math.hypot(dx,dy),7,{isStatic:true,angle:Math.atan2(dy,dx)}),
        Bodies.circle(a.x,a.y,3.5,{isStatic:true})
      ]});
      add(Body.create({parts:edges,isStatic:true}),p,.7);
    }
    else if(p.kind==='upKicker'||p.kind==='sideKicker'||['rollover','light','bumper'].includes(p.kind)&&p.sprite) add(polygon(p,p.kind==='rollover'||p.kind==='light'),p,p.kind==='bumper'?.7:.6);
    else if(p.kind==='bounceWall'||p.kind==='oneWayGate')add(polygon(p),p,p.kind==='oneWayGate'?0:.6);
    else if(p.kind==='ballTrap'){
      const s=p.scale??1,a=p.rotation*Math.PI/180;
      const rect=(x:number,y:number,w:number,h:number,sensor=false)=>{const at=transform(p,{x,y});return Bodies.rectangle(at.x,at.y,w*s,h*s,{isStatic:true,isSensor:sensor,angle:a})};
      add(Body.create({parts:[rect(-18,-6,8,64),rect(18,-6,8,64),rect(0,32,36,8),rect(0,-6,24,60,true)],isStatic:true}),p,.2);
    }
    else if(['bumper','rollover','light','zone','multiball','bonus','extraBall','magnet'].includes(p.kind)) add(Bodies.circle(p.x,p.y,(p.r??27)*(p.scale??1),{isStatic:true,isSensor:p.kind!=='bumper'}),p,.7);
    else if(p.kind==='artwork'&&p.art?.role!=='decoration') add(polygon(p),p);
    else if(['obstacle','slingshot','target','leftFlipper','rightFlipper','drain','ramp','movingObstacle','dropTarget','spinner'].includes(p.kind)) {
      const body=polygon(p,['drain','ramp','spinner'].includes(p.kind));add(body,p,p.kind.endsWith('Flipper')?.35:.6);
      if(p.kind.endsWith('Flipper')) flippers.push({p,body,center:{...body.position},angle:0});
    } else if(p.kind==='launcher') {
      const a=p.rotation*Math.PI/180,s=p.scale??1;
      const head=p.sprite==='launcher'?-21:28,width=p.sprite==='launcher'?28:24;
      add(Bodies.rectangle(p.x-Math.sin(a)*head*s,p.y+Math.cos(a)*head*s,width*s,6*s,{isStatic:true,angle:a}),p,.2);
    }
  }
  // Decide passage per ball/contact before Matter resolves it. A gate must not
  // become globally non-solid when another ball approaches its allowed side.
  Matter.Events.on(engine,'collisionStart',event=>{
    for(const pair of event.pairs){
      const a=pair.bodyA.parent,b=pair.bodyB.parent;
      const moving=a.label==='Pinball'?a:b.label==='Pinball'?b:undefined;
      const part=moving&&mapping.get(moving===a?pair.bodyB.id:pair.bodyA.id);
      if(!moving||part?.kind!=='oneWayGate')continue;
      const axis=(part.sprite?referenceSprites[part.sprite]?.pass:undefined)??[0,-1];
      const direction=transform(part,{x:axis[0],y:axis[1]}),v=Body.getVelocity(moving);
      pair.isSensor=v.x*(direction.x-part.x)+v.y*(direction.y-part.y)>0;
    }
  });
  function makeBall(position:Point,velocity?:Point) {
    const b=Bodies.circle(position.x,position.y,10,{label:'Pinball',restitution:.35,friction:.008,frictionStatic:.03,frictionAir:.0007,slop:.02},32);
    liveBalls.push(b);Composite.add(engine.world,b);if(velocity)Body.setVelocity(b,velocity);return b;
  }
  function spawn() {
    for(const b of liveBalls)Composite.remove(engine.world,b);liveBalls.length=0;
    ball=servedBall=makeBall(spawnPoint);serving=true;touching.clear();lastAward.clear();rules.newTurn();
  }
  function enable(id:string,on:boolean){
    if(on){disabled.delete(id);dropped.delete(id)}else disabled.add(id);
    const b=bodies.get(id);if(b)for(const piece of b.parts)piece.collisionFilter.mask=on?0xffffffff:0;
  }
  function action(a:RuleAction,source:Part){
    if(a.type==='sound')onSound?.(a.soundId!);
    else if(a.type==='activate'||a.type==='deactivate')enable(a.target!,a.type==='activate');
    else if(a.type==='extraBall')remaining++;
    else if(a.type==='resetTargets'){for(const p of t.parts)if(p.kind==='dropTarget')enable(p.id,true)}
    else if(a.type==='multiball'){
      // Every activation adds two balls. Contact-start/once-per-turn gates prevent repeated spawning while occupied.
      for(const direction of [-1,1])makeBall({x:Math.max(15,Math.min(W-15,source.x+direction*25)),y:Math.max(15,source.y-30)},{x:direction*7,y:-14});
      serving=false;servedBall=undefined;
    }
  }
  function advanceParts(){
    for(const [id,until] of dropped)if(elapsed>=until)enable(id,true);
    for(const p of t.parts){
      const body=bodies.get(p.id);if(!body||disabled.has(p.id))continue;
      if(p.kind==='movingObstacle'){
        const angle=p.rotation*Math.PI/180,travel=Math.sin(elapsed/1000*2)*45*(p.scale??1);
        const position={x:Math.max(25,Math.min(W-25,p.x+Math.cos(angle)*travel)),y:Math.max(25,Math.min(H-25,p.y+Math.sin(angle)*travel))};
        (Body.setPosition as (b:Matter.Body,p:Point,v:boolean)=>void)(body,position,true);
      }
      if(p.kind==='spinner'){
        const spin=spins.get(p.id);if(spin){spin.angle+=spin.speed*STEP_MS/1000;spin.speed*=Math.exp(-STEP_MS/1400);if(Math.abs(spin.speed)<.05)spin.speed=0;if(p.sprite!=='classicSpinner')Body.setAngle(body,p.rotation*Math.PI/180+spin.angle)}
      }
      if(p.kind==='magnet')for(const b of liveBalls){const dx=p.x-b.position.x,dy=p.y-b.position.y,d=Math.hypot(dx,dy),radius=100*(p.scale??1);if(d>12&&d<radius){const strength=.000018*b.mass*(1-d/radius);Body.applyForce(b,b.position,{x:dx*strength,y:dy*strength})}}
    }
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
    if(kick>0){const angle=scatterAngle(),cos=Math.cos(angle),sin=Math.sin(angle);
      // Vary just the powered rubber impulse. Preserve the incoming tangent and
      // impulse magnitude; passive walls and player-controlled flippers stay exact.
      Body.setVelocity(ball,{x:v.x+(normal.x*cos-normal.y*sin)*kick,y:v.y+(normal.x*sin+normal.y*cos)*kick});
    }
  }
  function drain() {
    if(!ball)return;if(ball===servedBall){servedBall=undefined;serving=false}Composite.remove(engine.world,ball);liveBalls.splice(liveBalls.indexOf(ball),1);ball=liveBalls[0];
    if(!liveBalls.length){remaining--;lastHit=undefined;if(remaining>0)spawn();else serving=false}
    onChange();
  }
  function capture(p:Part){
    if(!ball)return;
    const count=(trapped.get(p.id)??0)+1;
    if(ball===servedBall)servedBall=undefined;
    Composite.remove(engine.world,ball);liveBalls.splice(liveBalls.indexOf(ball),1);
    trapped.set(p.id,count%3);
    if(count===3){
      for(const side of [-1,0,1]){
        // Open the bottom: release clear of the catcher, with no launch impulse.
        const at=transform({...p,scale:1},{x:side*22,y:38*(p.scale??1)+16});
        makeBall(at);
      }
    }else if(!servedBall)servedBall=makeBall(spawnPoint);
    serving=!!servedBall;ball=liveBalls[0];rules.hit(p);lastHit=p.id;hitTime=elapsed;onChange();
  }
  function springDirection(p:Part):Point|undefined {
    if(!ball)return;const b=local(p,ball.position),s=p.sprite?referenceSprites[p.sprite]:undefined;
    const w=s?.rect[2]??23,h=s?.rect[3]??13,a=p.rotation*Math.PI/180;
    if(p.kind==='upKicker'&&b.y<=-h&&Math.abs(b.x)<=w+2)return {x:Math.sin(a),y:-Math.cos(a)};
    if(p.kind==='sideKicker'&&Math.abs(b.x)>=w&&Math.abs(b.y)<=h+2){const side=Math.sign(b.x);return{x:side*Math.cos(a),y:side*Math.sin(a)}}
  }
  function substep() {
    if(!ball)return;
    for(const f of flippers) {
      const active=f.p.kind==='leftFlipper'?leftOn:rightOn,target=active?(f.p.kind==='leftFlipper'?-SWING:SWING):0;
      const distance=target-f.angle,travel=(active?UP_SPEED:RETURN_SPEED)*STEP_MS/1000;
      moveFlipper(f,f.angle+Math.sign(distance)*Math.min(Math.abs(distance),travel),true);
    }
    advanceParts();
    for(const b of liveBalls){ball=b;capSpeed()}
    Engine.update(engine,STEP_MS);elapsed+=STEP_MS;rules.tick(elapsed);
    const nextTouching=new Set<string>();
    for(const currentBall of [...liveBalls]){
    ball=currentBall;
    // Read solved contacts once; a compound part can produce several pairs.
    const contacts=new Map<string,Part>();
    for(const pair of engine.pairs.list as {isActive:boolean;bodyA:Matter.Body;bodyB:Matter.Body}[]) {
      if(!pair.isActive)continue;
      const other=pair.bodyA.parent===ball?pair.bodyB:pair.bodyB.parent===ball?pair.bodyA:undefined;
      const p=other&&mapping.get(other.id);if(p&&!disabled.has(p.id))contacts.set(p.id,p);
    }
    const trap=[...contacts.values()].find(p=>{if(p.kind!=='ballTrap')return false;const at=local(p,ball!.position);return Math.abs(at.x)<=14&&at.y>=10-(trapped.get(p.id)??0)*22&&at.y<=24});
    if(trap){capture(trap);continue}

    for(const p of contacts.values()) {
      const spring=p.kind==='upKicker'||p.kind==='sideKicker',direction=spring?springDirection(p):undefined;
      if(spring&&!direction)continue;
      const scores=spring||['bumper','bounceWall','target','slingshot','rollover','zone',...advancedKinds].includes(p.kind)||p.kind==='artwork'&&p.art?.role==='target'||t.advanced?.rules?.some(r=>r.source===p.id)||t.advanced?.missions?.some(m=>m.targets.includes(p.id));
      const key=ball.id+':'+p.id;nextTouching.add(key);
      if((!scores&&p.kind!=='light')||touching.has(key)||elapsed-(lastAward.get(key)??-Infinity)<100)continue;
      lastAward.set(key,elapsed);if(scores)rules.hit(p);lastHit=p.id;hitTime=elapsed;
      if(p.kind==='dropTarget'){enable(p.id,false);dropped.set(p.id,elapsed+5000)}
      if(p.kind==='spinner'){const v=Body.getVelocity(ball);spins.set(p.id,{angle:spins.get(p.id)?.angle??0,speed:(v.x<0?-1:1)*16})}
      if(p.kind==='ramp'){const a=p.rotation*Math.PI/180;Body.setVelocity(ball,{x:Math.sin(a)*22,y:-Math.cos(a)*22})}
      if(p.kind==='bumper'||p.kind==='slingshot'||p.kind==='bounceWall')rubberKick(p);
      if(p.kind==='bounceWall')rules.flash(p.id,130);
      if(direction){const v=Body.getVelocity(ball),kick=Math.max(0,16-v.x*direction.x-v.y*direction.y);Body.setVelocity(ball,{x:v.x+direction.x*kick,y:v.y+direction.y*kick})}
      onHit?.(p.score,p.kind);onChange();
    }

    if([...contacts.values()].some(p=>{if(p.kind!=='drain')return false;if(p.sprite!=='blackHole')return true;const at=local(p,ball!.position);return (at.x/18)**2+(at.y/14)**2<=1})||ball.position.y>H+20||ball.position.y<-40||ball.position.x<-30||ball.position.x>W+30){drain();continue}
    if(ball===servedBall&&Math.hypot(ball.position.x-spawnPoint.x,ball.position.y-spawnPoint.y)>85){serving=false;servedBall=undefined}
    capSpeed();
    }
    touching=nextTouching;ball=liveBalls[0];
  }
  spawn();
  return {
    step(dt) {
      if(stopped||paused||!ball||!Number.isFinite(dt)||dt<=0)return;
      // Bound catch-up after stalls; keep fixed steps on 30/60/120/144 Hz displays.
      accumulator+=Math.min(dt,100);
      while(accumulator+1e-8>=TICK_MS&&ball){for(let i=0;i<SUBSTEPS&&ball;i++)substep();accumulator-=TICK_MS}
    },
    stop(){if(stopped)return;stopped=true;ball=servedBall=undefined;liveBalls.length=0;Composite.clear(engine.world,false);Engine.clear(engine)},
    restart(){if(stopped)return;points=elapsed=accumulator=0;scatterState=SCATTER_SEED;remaining=3;rules.reset();dropped.clear();spins.clear();trapped.clear();for(const p of t.parts){enable(p.id,p.enabled!==false);if(p.kind==='movingObstacle'||p.kind==='spinner'){const b=bodies.get(p.id)!;Body.setPosition(b,{x:p.x,y:p.y});Body.setAngle(b,p.rotation*Math.PI/180)}}leftOn=rightOn=paused=false;lastHit=undefined;hitTime=-Infinity;for(const f of flippers){moveFlipper(f,0,false);Body.setVelocity(f.body,{x:0,y:0});Body.setAngularVelocity(f.body,0)}Engine.clear(engine);spawn();onChange()},
    pause(value){paused=value;accumulator=0;if(value)leftOn=rightOn=false;onChange()},
    snapshot(){return{state:remaining===0?'gameover':paused?'paused':serving?'ready':'playing',elapsedMs:elapsed,score:points,balls:remaining,ball:ball?{...ball.position}:undefined,velocity:ball?Body.getVelocity(ball):undefined,canLaunch:!!servedBall&&serving&&!paused&&!stopped,advanced:rules.snapshot(liveBalls.length)}},
    ball:()=>ball?{...ball.position}:undefined,score:()=>points,balls:()=>remaining,
    launch(){if(!servedBall||!serving||paused||stopped)return;serving=false;Body.setVelocity(servedBall,{x:Math.sin(launchAngle)*22,y:-Math.cos(launchAngle)*22});servedBall=undefined;onChange()},
    flippers(left,right){leftOn=!paused&&left;rightOn=!paused&&right},
    parts:()=>t.parts.map(p=>{const f=flippers.find(f=>f.p.id===p.id);const body=bodies.get(p.id),moving=p.kind==='movingObstacle',spin=spins.get(p.id);return {...p,...(moving&&body?body.position:{}),rotation:p.rotation+(f?f.angle*180/Math.PI:spin&&p.sprite!=='classicSpinner'?spin.angle*180/Math.PI:0),enabled:!disabled.has(p.id),animationPhase:rules.flashing(p.id)?-1:p.sprite==='classicSpinner'?(spin?.angle??0):elapsed/1000,...(p.kind==='ballTrap'?{trappedBalls:trapped.get(p.id)??0}:{})}}),
    flash:()=>elapsed-hitTime<130?lastHit:undefined,ballPositions:()=>liveBalls.map(b=>({...b.position})),effects:()=>rules.effects()
  };
}
