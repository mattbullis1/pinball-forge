import Matter from 'matter-js';
import {afterEach,describe,expect,it,vi} from 'vitest';
import {createGame,Game,TICK_MS} from './physics';
import {fromPreset,makePart,newTable,Part,Table,validateTable} from './model';
import {removeReferences} from './advanced-model';
import {History} from './history';
import {workshopTable} from './workshop';
import {createGameZip} from './export-game';
import {readGamePackage} from './game-package';
import JSZip from 'jszip';
const games:Game[]=[];
afterEach(()=>{games.splice(0).forEach(g=>g.stop());vi.restoreAllMocks()});
function rig(parts:Part[],advanced?:Table['advanced']){
 const t=newTable();t.parts=[makePart('ball',280,80),...parts];t.advanced=advanced;
 const spy=vi.spyOn(Matter.Engine,'create'),sound=vi.fn();const game=createGame(t,()=>{},()=>{},sound),engine=spy.mock.results.at(-1)!.value as Matter.Engine;spy.mockRestore();games.push(game);engine.gravity.scale=0;
 const balls=()=>Matter.Composite.allBodies(engine.world).filter(b=>b.label==='Pinball');
 function touch(p:Part){Matter.Body.setPosition(balls()[0],{x:p.x,y:p.y-(p.kind==='dropTarget'?20:0)});Matter.Body.setVelocity(balls()[0],{x:0,y:0});game.step(TICK_MS)}
 function leave(){Matter.Body.setPosition(balls()[0],{x:280,y:80});Matter.Body.setVelocity(balls()[0],{x:0,y:0});run(game,20)}
 return {t,game,engine,balls,touch,leave,sound};
}
function run(g:Game,n:number){for(let i=0;i<n;i++)g.step(TICK_MS)}
describe('advanced physics',()=>{
 it('adds two balls once per gate per turn, and loses one life only after all balls drain',()=>{
  const gate=fromPreset('multiball',280,300),r=rig([gate]);r.touch(gate);expect(r.balls()).toHaveLength(3);expect(r.game.ballPositions()).toHaveLength(3);expect(r.game.balls()).toBe(3);
  r.leave();r.touch(gate);expect(r.balls()).toHaveLength(3);
  Matter.Body.setPosition(r.balls()[0],{x:280,y:880});r.game.step(TICK_MS);expect(r.balls()).toHaveLength(2);expect(r.game.balls()).toBe(3);
  for(const b of r.balls())Matter.Body.setPosition(b,{x:280,y:880});r.game.step(TICK_MS);expect(r.balls()).toHaveLength(1);expect(r.game.balls()).toBe(2);expect(r.game.snapshot().canLaunch).toBe(true);
  r.touch(gate);expect(r.balls()).toHaveLength(3);r.game.restart();expect(r.balls()).toHaveLength(1);expect(r.game.balls()).toBe(3);
 });
 it('awards an extra ball once per gate per game, and resets on restart',()=>{const p=fromPreset('extraBall',280,300),r=rig([p]);r.touch(p);expect(r.game.balls()).toBe(4);r.leave();r.touch(p);expect(r.game.balls()).toBe(4);r.game.restart();r.touch(p);expect(r.game.balls()).toBe(4)});
 it('drops targets, suppresses repeat contacts, and raises them after five simulated seconds',()=>{const p=fromPreset('dropTarget',280,300),r=rig([p]);r.touch(p);expect(r.game.score()).toBe(250);expect(r.game.parts().find(x=>x.id===p.id)?.enabled).toBe(false);r.leave();r.touch(p);expect(r.game.score()).toBe(250);r.leave();run(r.game,600);expect(r.game.parts().find(x=>x.id===p.id)?.enabled).toBe(true);r.touch(p);expect(r.game.score()).toBe(500)});
 it('moves the obstacle and restores its starting position on restart',()=>{const p=fromPreset('movingObstacle',280,400),r=rig([p]);run(r.game,90);expect(r.game.parts()[1].x).toBeGreaterThan(320);const physical=Matter.Composite.allBodies(r.engine.world).find(b=>b.label!=='Pinball')!;expect(physical.position.x).toBeCloseTo(r.game.parts()[1].x);r.game.restart();expect(r.game.parts()[1].x).toBe(280)});
 it('moving obstacles transfer momentum when they strike the ball',()=>{const p=fromPreset('movingObstacle',220,400),r=rig([p]);Matter.Body.setPosition(r.balls()[0],{x:258,y:400});run(r.game,35);expect(Matter.Body.getVelocity(r.balls()[0]).x).toBeGreaterThan(0)});
 it('magnets attract nearby balls, and deactivated magnets do not',()=>{const p=fromPreset('magnet',300,300),r=rig([p]);Matter.Body.setPosition(r.balls()[0],{x:240,y:300});run(r.game,10);expect(r.game.snapshot().velocity!.x).toBeGreaterThan(0);const off=rig([{...p,enabled:false}]);Matter.Body.setPosition(off.balls()[0],{x:240,y:300});run(off.game,10);expect(off.game.snapshot().velocity!.x).toBe(0)});
 it('boost ramps launch in their rotated arrow direction',()=>{const p={...fromPreset('ramp',280,300),rotation:90},r=rig([p]);r.touch(p);expect(r.game.snapshot().velocity!.x).toBeGreaterThan(21);expect(Math.abs(r.game.snapshot().velocity!.y)).toBeLessThan(.01)});
 it('spinners rotate after contact and stop on restart',()=>{const p=fromPreset('spinner',280,300),r=rig([p]);r.touch(p);r.leave();expect(r.game.parts()[1].rotation).toBeGreaterThan(100);r.game.restart();expect(r.game.parts()[1].rotation).toBe(0)});
 it('bonus lasts ten simulated seconds and freezes while paused',()=>{const bonus=fromPreset('bonus',150,300),target=makePart('zone',350,300),r=rig([bonus,target]);r.touch(bonus);r.leave();r.touch(target);expect(r.game.score()).toBe(200);expect(r.game.snapshot().advanced.multiplier).toBe(2);r.game.pause(true);run(r.game,2000);expect(r.game.snapshot().advanced.multiplier).toBe(2);r.game.pause(false);r.leave();run(r.game,1200);expect(r.game.snapshot().advanced.multiplier).toBe(1);r.touch(target);expect(r.game.score()).toBe(300)});
});
describe('visual rules, missions and persistence',()=>{
 it('combines actions, completes a mission once and resets all game state',()=>{
  const a=makePart('zone',150,300),b=makePart('zone',350,300),light=makePart('light',200,500);
  const r=rig([a,b,light],{combo:true,missions:[{id:'m',title:'Both zones',targets:[a.id,b.id],reward:2000}],rules:[{id:'r',source:a.id,once:true,actions:[{type:'score',value:500},{type:'flash',target:light.id},{type:'effect'},{type:'sound',soundId:'chime'}]}]});
  r.touch(a);expect(r.game.score()).toBe(600);expect(r.sound).toHaveBeenCalledWith('chime');expect(r.game.effects()).toHaveLength(1);expect(r.game.parts()[3].animationPhase).toBe(-1);r.leave();r.touch(b);expect(r.game.score()).toBe(2750);expect(r.game.snapshot().advanced.missions[0]).toMatchObject({hits:2,total:2,complete:true});
  r.leave();r.touch(a);expect(r.game.score()).toBe(2950);expect(r.sound).toHaveBeenCalledTimes(1);r.game.restart();expect(r.game.score()).toBe(0);expect(r.game.effects()).toHaveLength(0);expect(r.game.snapshot().advanced.missions[0].hits).toBe(0);
 });
 it('activates a disabled target and deactivates its trigger without recursive events',()=>{
  const a=makePart('zone',150,300),b={...makePart('zone',350,300),enabled:false};const r=rig([a,b],{rules:[{id:'r',source:a.id,actions:[{type:'activate',target:b.id},{type:'deactivate',target:a.id}]}]});
  r.touch(b);expect(r.game.score()).toBe(0);r.leave();r.touch(a);expect(r.game.score()).toBe(100);expect(r.game.parts()[1].enabled).toBe(false);r.leave();r.touch(b);expect(r.game.score()).toBe(200);
 });
 it('validates references and removes deleted references with undo support',()=>{
  const t=workshopTable();expect(validateTable(t)).toBe(true);const history=new History(),before=structuredClone(t),id=t.advanced!.missions![0].targets[0];t.parts=t.parts.filter(p=>p.id!==id);removeReferences(t,id);history.record(before,t);expect(validateTable(t)).toBe(true);expect(history.undo(t)).toEqual(before);
  const invalid=structuredClone(before);invalid.advanced!.rules![0].actions.push({type:'activate',target:'missing'});expect(validateTable(invalid)).toBe(false);
 });
 it('serializes all optional settings and audio into an editable project',()=>{const t=workshopTable(),roundtrip=JSON.parse(JSON.stringify(t));expect(validateTable(roundtrip)).toBe(true);expect(roundtrip).toEqual(t)});
 it('packages exact audio bytes, preserves rules and rejects external audio paths',async()=>{
  const t=workshopTable(),before=structuredClone(t),result=await createGameZip(t,{javascript:'player',stylesheet:'style',notices:'MIT'}),zip=await JSZip.loadAsync(result.bytes,{checkCRC32:true});expect(result.soundCount).toBe(2);
  const text=await zip.file('table.js')!.async('string'),pack=JSON.parse(text.slice(text.indexOf('=')+1).trim().replace(/;$/,''));const loaded=readGamePackage(pack);expect(loaded.advanced).toEqual(t.advanced);
  expect(await zip.file(loaded.sounds!.chime.data)!.async('base64')).toBe(t.sounds!.chime.data.split(',')[1]);expect(t).toEqual(before);
  pack.table.sounds.chime.data='https://example.invalid/music.wav';expect(()=>readGamePackage(pack)).toThrow('invalid sound path');
 });
});
