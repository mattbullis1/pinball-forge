import {describe,it,expect} from 'vitest';
import {emptyWorkbench,makePart,newTable,validateTable} from './model';
import {end,moveEdge,paintConnected,shape,splitBarrier,validGeometry} from './geometry';
import {floodArea} from './surface-paint';
import {createGame,TICK_MS} from './physics';

describe('annotated construction tools',()=>{
 it('cuts an interior barrier into two editable walls without changing its extent or color',()=>{
  const t=emptyWorkbench(),p={...makePart('wall',100,300),x2:400,y2:300,color:'#ff8800'};t.parts.push(p);
  expect(splitBarrier(t,p.id,{x:240,y:305},'cut')).toBe(true);
  const q=t.parts.find(p=>p.id==='cut')!;expect(end(p)).toEqual({x:240,y:300});expect(q).toMatchObject({x:240,y:300,x2:400,y2:300,color:'#ff8800'});
  moveEdge(t,q.id,0,0,40);expect(p.y).toBe(300);expect(q.y).toBe(340);expect(validateTable(t)).toBe(true);
 });
 it('preserves the connected perimeter when cutting and pulling its edge',()=>{
  const t=newTable(),p=t.parts[0];expect(splitBarrier(t,p.id,{x:250,y:22},'cut')).toBe(true);
  moveEdge(t,'cut',0,0,20);expect(validGeometry(t)).toBe(true);expect(end(p)).toEqual({x:250,y:42});expect(t.parts.find(p=>p.id==='cut')!.y2).toBe(42);
 });
 it('rejects a cut that would collapse either new barrier',()=>{
  const t=newTable(),before=structuredClone(t),p=t.parts[0];expect(splitBarrier(t,p.id,{x:p.x+1,y:p.y},'cut')).toBe(false);expect(t).toEqual(before);
 });
 it('pulls just the chosen polygon edge, including rotated shapes',()=>{
  const t=emptyWorkbench(),p={...makePart('obstacle',240,300),rotation:35};t.parts.push(p);
  const before=shape(p);moveEdge(t,p.id,1,20,10);const after=shape(p);
  for(const i of [1,2]){expect(after[i].x).toBeCloseTo(before[i].x+20);expect(after[i].y).toBeCloseTo(before[i].y+10)}
  for(const i of [0,3])expect(after[i]).toEqual(before[i]);expect(validateTable(t)).toBe(true);
 });
 it('paints attached wall segments but keeps disconnected and different-colored walls separate',()=>{
  const t=emptyWorkbench(),a={...makePart('wall',100,200),x2:200,y2:200},b={...makePart('wall',200,200),x2:200,y2:400},c=makePart('wall',300,300),d={...makePart('wall',200,400),color:'#00ff00'};t.parts.push(a,b,c,d);
  paintConnected(t,a.id,'#ff00ff');expect(a.color).toBe('#ff00ff');expect(b.color).toBe('#ff00ff');expect(c.color).toBe('#f4f4ef');expect(d.color).toBe('#00ff00');
  paintConnected(t,t.parts[0].id,'#123456');expect(t.exterior).toBe('#123456');expect(t.parts.filter(p=>p.boundary).every(p=>p.color==='#123456')).toBe(true);
 });
 it('fills only the connected area and does not wrap across image rows',()=>{
  const mask=Uint8Array.from([0,0,1,0,0,0,0,1,0,0,0,0,1,0,0]),left=floodArea(mask,5,0),right=floodArea(mask,5,4);
  expect([...left]).toEqual([1,1,0,0,0,1,1,0,0,0,1,1,0,0,0]);expect(right.reduce((a,b)=>a+b)).toBe(6);expect(floodArea(mask,5,2).some(Boolean)).toBe(false);
 });
 it('round-trips gravity and area paint, while rejecting invalid values',()=>{
  const t={...emptyWorkbench(),gravity:.5,surfacePaint:[{x:200,y:300,color:'#123456'}]};expect(validateTable(JSON.parse(JSON.stringify(t)))).toBe(true);
  for(const gravity of [NaN,-1,Infinity,4])expect(validateTable({...t,gravity})).toBe(false);
  expect(validateTable({...t,surfacePaint:[{x:NaN,y:300,color:'#123456'}]})).toBe(false);expect(validateTable({...t,surfacePaint:[{x:200,y:300,color:'red'}]})).toBe(false);
 });
 it('applies gravity to actual ball motion, keeping the old default for existing projects',()=>{
  const fall=(gravity?:number)=>{const t=emptyWorkbench();t.parts=[makePart('ball',280,100)];if(gravity!==undefined)t.gravity=gravity;const g=createGame(t,()=>{});for(let i=0;i<30;i++)g.step(TICK_MS);const y=g.ball()!.y;g.stop();return y};
  expect(fall(0)).toBeCloseTo(100);expect(fall(.5)).toBeGreaterThan(100);expect(fall(2)).toBeGreaterThan(fall(.5));expect(fall()).toBeCloseTo(fall(1.1));
 });
});
