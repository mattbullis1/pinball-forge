import Matter from 'matter-js';
import {afterEach,describe,expect,it,vi} from 'vitest';
import {fromPreset,makePart,newTable,Part,presets,Table,validateTable} from './model';
import {createGame,Game,TICK_MS} from './physics';
import {local,transform} from './geometry';
import {referenceSprites} from './reference-parts';

const games:Game[]=[];
afterEach(()=>{games.forEach(g=>g.stop());games.length=0;vi.restoreAllMocks()});
function rig(parts:Part[],advanced?:Table['advanced'],onHit?:(score:number,kind:Part['kind'])=>void){
 const table=newTable();table.parts=[makePart('ball',100,150),...parts];table.advanced=advanced;
 const spy=vi.spyOn(Matter.Engine,'create'),game=createGame(table,()=>{},onHit),engine=spy.mock.results.at(-1)!.value as Matter.Engine;
 spy.mockRestore();games.push(game);
 const balls=()=>Matter.Composite.allBodies(engine.world).filter(b=>b.label==='Pinball');
 return {table,game,engine,balls};
}
function run(game:Game,n:number){for(let i=0;i<n;i++)game.step(TICK_MS)}
function at(body:Matter.Body,p:{x:number;y:number},v={x:0,y:0}){Matter.Body.setPosition(body,p);Matter.Body.setVelocity(body,v)}
function capture(r:ReturnType<typeof rig>,p:Part){
 r.game.launch();at(r.balls()[0],transform(p,{x:0,y:12}));r.game.step(TICK_MS);
}
describe('annotated reference behaviors',()=>{
 it.each(presets.filter(p=>['light','rollover'].includes(p.kind)).map(p=>p.id))('%s chimes once per crossing, stays pass-through and preserves scoring',id=>{
  const p=fromPreset(id,280,350),hit=vi.fn(),r=rig([p],undefined,hit);r.engine.gravity.scale=0;
  at(r.balls()[0],p);run(r.game,30);
  expect(hit).toHaveBeenCalledExactlyOnceWith(p.score,p.kind);expect(r.game.score()).toBe(p.kind==='rollover'?p.score:0);
  at(r.balls()[0],{x:280,y:250});run(r.game,2);at(r.balls()[0],{x:280,y:280},{x:0,y:10});run(r.game,35);
  expect(hit).toHaveBeenCalledTimes(2);expect(r.game.ball()!.y).toBeGreaterThan(410);expect(r.game.score()).toBe(p.kind==='rollover'?p.score*2:0);
 });
 it.each(['bumper','smallBumper','slingshot','rightSling','bounceHorizontal','bounceVertical'])('%s reports powered contact for its pinball sound',id=>{
  const p=fromPreset(id,280,350),hit=vi.fn(),r=rig([p],undefined,hit);
  at(r.balls()[0],p);r.game.step(TICK_MS);expect(hit).toHaveBeenCalledWith(p.score,p.kind);
 });
 it.each(['bounceVertical','bounceHorizontal'])('%s rebounds and flashes on contact',id=>{
  const p=fromPreset(id,280,350),r=rig([p]),horizontal=id==='bounceHorizontal';
  at(r.balls()[0],{x:horizontal?280:250,y:horizontal?322:350},{x:horizontal?0:10,y:horizontal?10:0});
  for(let i=0;i<20&&!r.game.flash();i++)r.game.step(TICK_MS);
  expect(r.game.flash()).toBe(p.id);expect(horizontal?r.game.snapshot().velocity!.y:r.game.snapshot().velocity!.x).toBeLessThan(-8);
  expect(r.game.parts()[1].animationPhase).toBe(-1);
  expect(r.game.score()).toBe(0);
 });
 it('holds two balls without consuming lives and releases three on the third capture',()=>{
  const p=fromPreset('ballTrap',280,350),r=rig([p]),before=structuredClone(r.table);
  for(let count=1;count<=3;count++){
   capture(r,p);expect(r.game.balls()).toBe(3);expect(r.game.parts()[1].trappedBalls).toBe(count%3);
   expect(r.balls()).toHaveLength(count===3?3:1);expect(r.game.snapshot().canLaunch).toBe(count<3);
   if(count<3){expect(r.game.ball()!.x).toBe(100);expect(r.game.ball()!.y).toBeCloseTo(150,0)}
  }
  expect(r.balls().every(b=>b.position.y>p.y+38&&Matter.Body.getVelocity(b).y>=0)).toBe(true);
  const released=r.balls().map(b=>({...b.position}));run(r.game,12);
  r.balls().forEach((b,i)=>{expect(b.position.y).toBeGreaterThan(released[i].y);expect(b.position.x).toBeCloseTo(released[i].x,3)});
  expect(r.game.parts()[1].trappedBalls).toBe(0);expect(r.game.balls()).toBe(3);
  expect(r.table).toEqual(before);
  r.game.pause(true);const paused=r.game.snapshot();run(r.game,30);expect(r.game.snapshot()).toEqual(paused);
  r.game.restart();expect(r.balls()).toHaveLength(1);expect(r.game.parts()[1].trappedBalls).toBe(0);
 });
 it('captures through the U opening, not through its sides or bottom',()=>{
  const p=fromPreset('ballTrap',280,350),r=rig([p]);
  for(const point of [{x:248,y:350},{x:280,y:397}]){at(r.balls()[0],point);run(r.game,2);expect(r.game.parts()[1].trappedBalls).toBe(0)}
  at(r.balls()[0],{x:280,y:285},{x:0,y:8});
  for(let i=0;i<40&&!r.game.parts()[1].trappedBalls;i++)r.game.step(TICK_MS);
  expect(r.game.parts()[1].trappedBalls).toBe(1);
 });
 it('honors a rotated trap and retains its locked ball across a later drain',()=>{
  const p={...fromPreset('ballTrap',280,350),rotation:90},r=rig([p]);
  capture(r,p);expect(r.game.parts()[1].trappedBalls).toBe(1);
  at(r.balls()[0],{x:280,y:880});r.game.step(TICK_MS);
  expect(r.game.balls()).toBe(2);expect(r.game.parts()[1].trappedBalls).toBe(1);
 });
 it.each([0,90,180,270])('releases a scaled catcher at %s degrees without an ejection impulse',rotation=>{
  const p={...fromPreset('ballTrap',280,350),rotation,scale:1.5},r=rig([p]);r.engine.gravity.scale=0;
  for(let i=0;i<3;i++)capture(r,p);
  expect(r.balls()).toHaveLength(3);
  for(const b of r.balls()){expect(local(p,b.position).y).toBeGreaterThan(38);expect(Matter.Body.getSpeed(b)).toBeCloseTo(0,6)}
 });
 it('loses one life for a black hole and ends after the third drained turn',()=>{
  const p=fromPreset('blackHole',280,350),r=rig([p]);
  for(let remaining=2;remaining>=0;remaining--){at(r.balls()[0],p);r.game.step(TICK_MS);expect(r.game.balls()).toBe(remaining)}
  expect(r.game.snapshot().state).toBe('gameover');
 });
 it('spins top-to-bottom without blocking the ball, scores a crossing and resets',()=>{
  const p=fromPreset('classicSpinner',280,350),r=rig([p]);r.engine.gravity.scale=0;
  at(r.balls()[0],{x:280,y:310},{x:0,y:10});run(r.game,20);
  expect(r.game.ball()!.y).toBeGreaterThan(390);expect(r.game.score()).toBe(100);
  expect(r.game.parts()[1].rotation).toBe(0);expect(r.game.parts()[1].animationPhase).toBeGreaterThan(0);
  r.game.pause(true);const phase=r.game.parts()[1].animationPhase;run(r.game,20);expect(r.game.parts()[1].animationPhase).toBe(phase);
  r.game.restart();expect(r.game.parts()[1].animationPhase).toBe(0);expect(r.game.score()).toBe(0);
 });
 it.each(['gateUpLeft','gateUpRight','gateRight','gateLeft'])('%s permits only the arrow direction',id=>{
  const p=fromPreset(id,280,350),[dx,dy]=referenceSprites[id].pass!;
  for(const allowed of [true,false]){
   const r=rig([p]);r.engine.gravity.scale=0;const sign=allowed?1:-1;
   at(r.balls()[0],{x:280-dx*60*sign,y:350-dy*60*sign},{x:dx*18*sign,y:dy*18*sign});
   const contacts:boolean[]=[];
   Matter.Events.on(r.engine,'collisionStart',event=>{for(const pair of event.pairs)contacts.push(pair.isSensor)});
   run(r.game,20);
   expect(contacts.length).toBeGreaterThan(0);expect(contacts[0]).toBe(allowed);
   if(allowed){const b=r.game.ball()!;expect((b.x-p.x)*dx+(b.y-p.y)*dy).toBeGreaterThan(35)}
   else if(dx){expect((r.game.ball()!.x-p.x)*dx).toBeGreaterThan(0)}
  }
 });
 it('keeps opposite gate approaches independent during multiball',()=>{
  const trap=fromPreset('ballTrap',180,250),gate=fromPreset('gateRight',340,450),r=rig([trap,gate]);r.engine.gravity.scale=0;
  for(let i=0;i<3;i++)capture(r,trap);
  const [a,b,c]=r.balls();at(a,{x:300,y:440},{x:14,y:0});at(b,{x:370,y:464},{x:-14,y:0});at(c,{x:100,y:100});
  let allowed=false,blocked=false;
  Matter.Events.on(r.engine,'collisionStart',event=>{for(const pair of event.pairs){
   const bodies=[pair.bodyA.parent,pair.bodyB.parent];
   if(bodies.includes(a)&&!bodies.includes(b)&&pair.isSensor)allowed=true;
   if(bodies.includes(b)&&!bodies.includes(a)&&!pair.isSensor)blocked=true;
  }});
  run(r.game,12);
  expect(allowed).toBe(true);expect(blocked).toBe(true);
 });
 it('preserves the annotated parts and a multi-part bonus challenge in a saved table',()=>{
  const a=fromPreset('rollPinkPlus',180,350),b=fromPreset('rollGreenBar',380,350);
  const challenge={missions:[{id:'combo',title:'Both lights',targets:[a.id,b.id],reward:500}]};
  const r=rig([a,b,fromPreset('ballTrap',280,500),fromPreset('blackHole',150,650),fromPreset('gateRight',380,500)],challenge);
  expect(validateTable(JSON.parse(JSON.stringify(r.table)))).toBe(true);
  at(r.balls()[0],a);r.game.step(TICK_MS);expect(r.game.score()).toBe(100);
  at(r.balls()[0],{x:100,y:150});r.game.step(TICK_MS);
  at(r.balls()[0],b);r.game.step(TICK_MS);expect(r.game.score()).toBe(700);
  expect(r.game.snapshot().advanced.missions[0].complete).toBe(true);
 });
});
