import Matter from 'matter-js';
import {afterEach,describe,it,expect,vi} from 'vitest';
import {createGame,Game,TICK_MS,MAX_BALL_SPEED} from './physics';
import {makePart,newTable,sampleTables,Part} from './model';
import {FlipperInput} from './play-input';
import {moveVertex,project,shape} from './geometry';
const games:Game[]=[];
afterEach(()=>{games.splice(0).forEach(g=>g.stop());vi.restoreAllMocks()});
function rig(parts:Part[]){
 const t=newTable();t.parts=parts;
 const spy=vi.spyOn(Matter.Engine,'create'),hit=vi.fn();
 const game=createGame(t,()=>{},hit),engine=spy.mock.results.at(-1)!.value as Matter.Engine;
 spy.mockRestore();games.push(game);
 const body=()=>Matter.Composite.allBodies(engine.world).find(b=>b.label==='Pinball')!;
 return {game,body,engine,hit};
}
function run(g:Game,ticks:number){for(let i=0;i<ticks;i++)g.step(TICK_MS)}

describe('fixed game clock and lifecycle',()=>{
 it('produces the same ball and flipper results on 30, 60, 120 and 144 Hz displays',()=>{
  const outcomes=[30,60,120,144].map(hz=>{const g=createGame(sampleTables()[0],()=>{});games.push(g);g.launch();g.flippers(true,false);for(let i=0;i<hz*2;i++)g.step(1000/hz);return g.snapshot()});
  for(const actual of outcomes){expect(actual.elapsedMs).toBeCloseTo(2000,5);expect(actual.ball!.x).toBeCloseTo(outcomes[0].ball!.x,7);expect(actual.ball!.y).toBeCloseTo(outcomes[0].ball!.y,7);expect(actual.score).toBe(outcomes[0].score)}
 });
 it('ignores invalid time and caps a long browser stall to 100ms',()=>{
  const {game}=rig([makePart('ball',280,100)]);const before=game.snapshot();
  for(const dt of [NaN,Infinity,0,-20])game.step(dt);expect(game.snapshot()).toEqual(before);
  game.step(30000);expect(game.snapshot().elapsedMs).toBeCloseTo(100,6);
 });
 it('pauses time, clears flippers, and resumes without catch-up',()=>{
  const {game}=rig([makePart('ball',280,100),makePart('leftFlipper',150,700)]);
  game.flippers(true,false);run(game,3);game.pause(true);const before=game.snapshot();game.launch();run(game,200);
  expect(game.snapshot()).toEqual(before);game.pause(false);run(game,30);expect(game.parts()[1].rotation).toBe(0);expect(game.snapshot().elapsedMs).toBeCloseTo(275,5);
 });
 it('allows one launch per served ball and respects launcher rotation',()=>{
  const {game}=rig([makePart('ball',120,200),{...makePart('launcher',70,200),rotation:90}]);
  game.launch();expect(game.snapshot().velocity!.x).toBeCloseTo(22);run(game,3);const before=game.snapshot();game.launch();expect(game.snapshot()).toEqual(before);
 });
 it('spawns beside a rotated launcher when the table has no ball marker',()=>{
  const {game}=rig([{...makePart('launcher',180,300),rotation:90}]);expect(game.ball()).toEqual({x:235,y:300});game.launch();expect(game.snapshot().velocity!.x).toBeCloseTo(22);
 });
 it('counts a compound drain once, serves again and ends after exactly three balls',()=>{
  const {game,body}=rig([makePart('ball',280,100),makePart('drain',280,300)]);
  for(let expected=2;expected>=0;expected--){Matter.Body.setPosition(body(),{x:280,y:300});game.step(TICK_MS);expect(game.balls()).toBe(expected);if(expected)expect(game.snapshot().canLaunch).toBe(true)}
  const ended=game.snapshot();game.launch();run(game,100);expect(game.snapshot()).toEqual(ended);expect(ended.state).toBe('gameover');expect(ended.ball).toBeUndefined();
  game.restart();expect(game.balls()).toBe(3);expect(game.ball()).toEqual({x:280,y:100});expect(game.snapshot().canLaunch).toBe(true);
 });
 it('restarts score, ball, pause, flipper pose and old collision contacts',()=>{
  const {game,body}=rig([makePart('ball',280,100),makePart('bumper',280,250),makePart('leftFlipper',140,700)]);
  run(game,100);expect(game.score()).toBeGreaterThan(0);game.flippers(true,false);run(game,10);game.pause(true);game.restart();
  expect(game.score()).toBe(0);expect(game.snapshot().elapsedMs).toBe(0);expect(game.parts()[2].rotation).toBe(0);expect(body().position).toEqual({x:280,y:100});run(game,100);expect(game.score()).toBeGreaterThan(0);
 });
});

describe('fast contacts and physical flippers',()=>{
 it.each([0,25,65,90])('contains a maximum-speed ball at a thin wall rotated %s degrees',angle=>{
  const a=angle*Math.PI/180,normal={x:-Math.sin(a),y:Math.cos(a)};
  const wall={...makePart('wall',280-Math.cos(a)*110,380-Math.sin(a)*110),x2:280+Math.cos(a)*110,y2:380+Math.sin(a)*110,boundary:true};
  const {game,body}=rig([makePart('ball',280-normal.x*70,380-normal.y*70),wall]);
  Matter.Body.setVelocity(body(),{x:normal.x*MAX_BALL_SPEED,y:normal.y*MAX_BALL_SPEED});
  let maxPenetration=-Infinity;
  for(let i=0;i<10;i++){game.step(TICK_MS);const b=game.ball()!;maxPenetration=Math.max(maxPenetration,(b.x-280)*normal.x+(b.y-380)*normal.y)}
  expect(maxPenetration).toBeLessThan(-8);
 });
 it('detects a thin drain crossed at maximum speed',()=>{
  const {game,body}=rig([makePart('ball',280,240),{...makePart('drain',280,300),scale:.4}]);
  Matter.Body.setVelocity(body(),{x:0,y:MAX_BALL_SPEED});run(game,5);expect(game.balls()).toBe(2);
 });
 it.each(['leftFlipper','rightFlipper'] as const)('%s strikes from motion and stops adding energy when held',kind=>{
  const direction=kind==='leftFlipper'?1:-1;
  const {game,body}=rig([makePart('ball',280+direction*60,480),makePart(kind,280,500)]);
  // Ball rests just above the face at the instant of the upstroke.
  game.flippers(kind==='leftFlipper',kind==='rightFlipper');run(game,5);
  expect(game.snapshot().velocity!.y).toBeLessThan(-4);
  const full=kind==='leftFlipper'?-.7:.7;run(game,15);
  expect(game.parts()[1].rotation).toBeCloseTo(full*180/Math.PI,6);
  // A held-up flipper is a passive surface, not another automatic kick.
  const p=game.parts()[1],a=p.rotation*Math.PI/180;
  Matter.Body.setPosition(body(),{x:280+direction*55*Math.cos(a)+Math.sin(a)*17,y:500+direction*55*Math.sin(a)-Math.cos(a)*17});
  Matter.Body.setVelocity(body(),{x:0,y:0});run(game,2);
  expect(Math.hypot(...Object.values(game.snapshot().velocity!))).toBeLessThan(3);
  game.flippers(false,false);run(game,24);expect(game.parts()[1].rotation).toBe(0);
 });
 it('rotates the strike direction with the flipper and honors small/large sizes',()=>{
  for(const scale of [.65,2]){
   const {game}=rig([makePart('ball',298,280+60*scale),{...makePart('leftFlipper',280,280),rotation:90,scale}]);
   game.flippers(true,false);run(game,6);expect(game.snapshot().velocity!.x).toBeGreaterThan(2);expect(game.snapshot().velocity!.y).toBeGreaterThan(-5);
  }
 });
 it('caps extreme speeds before collision detection',()=>{
  const {game,body}=rig([makePart('ball',280,100)]);Matter.Body.setVelocity(body(),{x:100,y:100});game.step(TICK_MS);expect(Math.hypot(...Object.values(game.snapshot().velocity!))).toBeLessThanOrEqual(MAX_BALL_SPEED+1e-6);
 });
});

describe('contact scoring and rubber',()=>{
 it('does not farm points while the ball rests on a target',()=>{
  const {game}=rig([makePart('ball',280,277),makePart('target',280,300)]);run(game,360);expect(game.score()).toBe(100);expect(game.ball()!.y).toBeLessThan(280);
 });

 it('awards a sensor once while occupied and again after leaving and re-entering',()=>{
  const {game,body}=rig([makePart('ball',280,250),{...makePart('zone',280,250),r:100,score:750}]);
  run(game,20);expect(game.score()).toBe(750);
  Matter.Body.setPosition(body(),{x:450,y:250});Matter.Body.setVelocity(body(),{x:0,y:0});run(game,20);
  Matter.Body.setPosition(body(),{x:280,y:250});Matter.Body.setVelocity(body(),{x:0,y:0});run(game,2);expect(game.score()).toBe(1500);
 });
 it.each(['slingshot','bumper'] as const)('%s kicks away from contact and retains tangential motion',kind=>{
  const {game,body,hit}=rig([makePart('ball',280,200),makePart(kind,280,300)]);
  Matter.Body.setVelocity(body(),{x:1,y:12});for(let i=0;i<40&&!hit.mock.calls.length;i++)game.step(TICK_MS);
  expect(hit).toHaveBeenCalledTimes(1);expect(game.score()).toBe(100);const b=game.ball()!,p=game.parts()[1],v=game.snapshot().velocity!;const outline=shape(p);const contact=kind==='bumper'?p:outline.map((a,i)=>project(b,a,outline[(i+1)%outline.length])).sort((a,b)=>a.distance-b.distance)[0].point;const dx=b.x-contact.x,dy=b.y-contact.y;expect((v.x*dx+v.y*dy)/Math.hypot(dx,dy)).toBeGreaterThan(8);
 });
});

describe('longer independent table runs',()=>{
 it('breaks an exactly repeating two-bumper rally without changing the frame-rate result',()=>{
  const outcomes=[30,60,120,144].map(hz=>{
   const {game,engine,body}=rig([makePart('ball',280,350),makePart('bumper',180,350),makePart('bumper',380,350)]);
   engine.gravity.scale=0;Matter.Body.setVelocity(body(),{x:12,y:0});let deviation=0;
   for(let i=0;i<hz*8;i++){game.step(1000/hz);if(game.ball())deviation=Math.max(deviation,Math.abs(game.ball()!.y-350))}
   expect(deviation).toBeGreaterThan(40);return game.snapshot();
  });
  for(const actual of outcomes){expect(actual.score).toBe(outcomes[0].score);expect(actual.ball!.x).toBeCloseTo(outcomes[0].ball!.x,5);expect(actual.ball!.y).toBeCloseTo(outcomes[0].ball!.y,5)}
 });
 it.each(['bumper','slingshot'] as const)('keeps %s scatter small, contact-only and repeatable after restart',kind=>{
  const {game,engine,body,hit}=rig([makePart('ball',280,200),makePart(kind,280,300)]);engine.gravity.scale=0;
  const contact=()=>{Matter.Body.setPosition(body(),{x:280,y:200});Matter.Body.setVelocity(body(),{x:0,y:12});const count=hit.mock.calls.length;for(let i=0;i<60&&hit.mock.calls.length===count;i++)game.step(TICK_MS);expect(hit.mock.calls.length).toBe(count+1);return game.snapshot()};
  const original=Matter.Body.setVelocity,angles:number[]=[];let observing=false;
  vi.spyOn(Matter.Body,'setVelocity').mockImplementation((b,next)=>{
   if(observing&&b===body()){
    const p=game.parts()[1],v=Matter.Body.getVelocity(b),impulse={x:next.x-v.x,y:next.y-v.y};
    const outline=shape(p),nearest=kind==='bumper'?p:outline.map((a,i)=>project(b.position,a,outline[(i+1)%outline.length])).sort((a,b)=>a.distance-b.distance)[0].point;
    const dx=b.position.x-nearest.x,dy=b.position.y-nearest.y,length=Math.hypot(dx,dy),normal={x:dx/length,y:dy/length};
    if(Math.hypot(impulse.x,impulse.y)>0){angles.push(Math.atan2(impulse.y*normal.x-impulse.x*normal.y,impulse.x*normal.x+impulse.y*normal.y));expect(Math.hypot(impulse.x,impulse.y)).toBeCloseTo(Math.max(0,(kind==='bumper'?12:10)-(v.x*normal.x+v.y*normal.y)),7)}
   }
   original(b,next);
  });
  // The manual starting velocity is excluded; observe only the game's impulse.
  const originalStep=game.step;game.step=dt=>{observing=true;originalStep(dt);observing=false};
  const first=contact();game.restart();expect(game.snapshot().velocity).toEqual({x:0,y:0});game.pause(true);run(game,120);game.pause(false);const second=contact();
  expect(second.velocity!.x).toBeCloseTo(first.velocity!.x,8);expect(second.velocity!.y).toBeCloseTo(first.velocity!.y,8);
  expect(angles).toHaveLength(2);for(const angle of angles){expect(Math.abs(angle)).toBeGreaterThan(.0001);expect(Math.abs(angle)).toBeLessThanOrEqual(2*Math.PI/180+1e-8)}
 });
 it('runs three samples and a reshaped table for 30 seconds each without escaping or mutating construction',()=>{
  const tables=sampleTables();const altered=structuredClone(tables[0]);altered.title='Sculpted physics trial';moveVertex(altered,{id:altered.parts[0].id,index:0,point:altered.parts[0]},{x:80,y:40});
  altered.parts.find(p=>p.kind==='bumper')!.x=220;altered.parts.filter(p=>p.kind.endsWith('Flipper')).forEach(p=>p.scale=.9);tables.push(altered);
  for(const t of tables){const before=structuredClone(t),g=createGame(t,()=>{});games.push(g);let active=0;
   for(let i=0;i<3600;i++){if(g.snapshot().canLaunch)g.launch();if(!g.balls())g.restart();g.flippers(i%72<36,i%96<48);g.step(TICK_MS);const b=g.ball();if(b){active++;expect(Number.isFinite(b.x)&&Number.isFinite(b.y)).toBe(true);expect(b.x,t.title).toBeGreaterThan(0);expect(b.x,t.title).toBeLessThan(560);expect(b.y,t.title).toBeGreaterThan(0);expect(Math.hypot(...Object.values(g.snapshot().velocity!))).toBeLessThanOrEqual(MAX_BALL_SPEED+1e-6)}}
   expect(active).toBeGreaterThan(3000);expect(t).toEqual(before);
  }
 });
});

describe('keyboard and multiple touch sources',()=>{
 it('keeps a flipper held until every source releases and clears both on cancellation',()=>{
  const changed=vi.fn(),input=new FlipperInput(changed);
  input.press('keyboard','left');input.press('finger1','left');input.press('finger2','right');input.release('finger1');
  expect(changed).toHaveBeenLastCalledWith(true,true);input.release('keyboard');expect(changed).toHaveBeenLastCalledWith(false,true);input.clear();expect(changed).toHaveBeenLastCalledWith(false,false);
 });
});
