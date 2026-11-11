import Matter from 'matter-js';
import {afterEach,describe,expect,it,vi} from 'vitest';
import {emptyWorkbench,fromPreset,makePart,newTable,Part,validateTable} from './model';
import {addCorner,end,moveVertex,perimeter,shape,vertices} from './geometry';
import {History} from './history';
import {createGame,Game,TICK_MS} from './physics';

const games:Game[]=[];
afterEach(()=>{games.splice(0).forEach(g=>g.stop());vi.restoreAllMocks()});
function rig(parts:Part[]){
 const t=emptyWorkbench();t.parts=parts;t.gravity=0;
 const spy=vi.spyOn(Matter.Engine,'create'),g=createGame(t,()=>{}),engine=spy.mock.results.at(-1)!.value as Matter.Engine;spy.mockRestore();games.push(g);
 return {g,engine,ball:Matter.Composite.allBodies(engine.world).find(b=>b.label==='Pinball')!};
}
describe('independent wall points',()=>{
 it('moves only the chosen outer point and its two attached endpoints',()=>{
  const t=newTable(),before=structuredClone(t),p=t.parts[0],at={x:90,y:50};
  moveVertex(t,{id:p.id,index:0,point:p},at);
  for(const old of before.parts){const now=t.parts.find(p=>p.id===old.id)!;
   expect({x:now.x,y:now.y}).toEqual(old.id===p.id?at:{x:old.x,y:old.y});
   if(old.kind==='wall')expect(end(now)).toEqual(end(old).x===before.parts[0].x&&end(old).y===before.parts[0].y?at:end(old));
  }
  expect(validateTable(t)).toBe(true);
 });
 it('projects insertion onto the segment, retaining all original points and its shape',()=>{
  const t=newTable(),before=perimeter(t),p=t.parts[0],v=addCorner(t,p.id,{x:250,y:30},'new')!;
  expect(v.point).toEqual({x:250,y:22});expect(perimeter(t)).toEqual([before[0],v.point,...before.slice(1)]);expect(validateTable(t)).toBe(true);
 });
 it('keeps every inserted interior joint connected without moving unrelated points or touching walls',()=>{
  const t=emptyWorkbench(),p={...makePart('wall',100,300),x2:500,y2:300},other={...makePart('wall',200,300),x2:200,y2:450};t.parts.push(p,other);const outside=structuredClone(t.parts.filter(p=>p.boundary));
  addCorner(t,p.id,{x:200,y:300},'b');addCorner(t,'b',{x:300,y:300},'c');addCorner(t,'c',{x:400,y:300},'d');
  moveVertex(t,{id:p.id,index:1,point:{x:200,y:300}},{x:200,y:240});
  moveVertex(t,{id:'b',index:1,point:{x:300,y:300}},{x:300,y:360});
  moveVertex(t,{id:'c',index:1,point:{x:400,y:300}},{x:400,y:250});
  const walls=t.parts.filter(q=>q.wallGroup===p.id);
  expect(walls.map(q=>({x:q.x,y:q.y}))).toEqual([{x:100,y:300},{x:200,y:240},{x:300,y:360},{x:400,y:250}]);
  walls.slice(0,-1).forEach((q,i)=>expect(end(q)).toEqual({x:walls[i+1].x,y:walls[i+1].y}));expect(end(walls[3])).toEqual({x:500,y:300});
  expect(other).toMatchObject({x:200,y:300,x2:200,y2:450});expect(t.parts.filter(p=>p.boundary)).toEqual(outside);expect(validateTable(t)).toBe(true);
 });
 it('does not move an unrelated ball or another structure sharing a corner location',()=>{
  const t=emptyWorkbench(),a=fromPreset('box',250,300),b=fromPreset('box',250,300),ball=makePart('ball',218,268);t.parts.push(a,b,ball);const before=structuredClone(t);
  moveVertex(t,vertices(t,a.id)[0],{x:200,y:240});
  expect(shape(a).slice(1)).toEqual(shape(before.parts.find(p=>p.id===a.id)!).slice(1));
  for(const p of t.parts.filter(p=>p.id!==a.id))expect(p).toEqual(before.parts.find(q=>q.id===p.id));
 });
 it('keeps distinct joints independent when points within one structure overlap',()=>{
  const t=emptyWorkbench(),p={...makePart('wall',100,300),x2:500,y2:300};t.parts.push(p);
  const first=addCorner(t,p.id,{x:200,y:300},'b')!;addCorner(t,'b',{x:300,y:300},'c');const last=addCorner(t,'c',{x:400,y:300},'d')!;
  moveVertex(t,last,{x:200,y:300});moveVertex(t,first,{x:200,y:250});
  expect(end(p)).toEqual({x:200,y:250});expect(t.parts.find(p=>p.id==='b')).toMatchObject({x:200,y:250});
  expect(end(t.parts.find(p=>p.id==='c')!)).toEqual({x:200,y:300});expect(t.parts.find(p=>p.id==='d')).toMatchObject({x:200,y:300});expect(validateTable(t)).toBe(true);
 });
 it('creates a detached four-corner box and inserts independent points on all four sides',()=>{
  const t=emptyWorkbench(),box=fromPreset('box',300,300);t.parts.push(box);const original=shape(box);
  expect(box.wallLoop).toBe(true);expect(box.boundary).toBeUndefined();expect(original).toHaveLength(4);
  for(let i=0;i<4;i++){const a=original[i],b=original[(i+1)%4];expect(addCorner(t,box.id,{x:(a.x+b.x)/2,y:(a.y+b.y)/2},'unused')).toBeDefined()}
  expect(shape(box)).toHaveLength(8);const before=shape(box),v=vertices(t,box.id)[1];moveVertex(t,v,{x:300,y:240});
  shape(box).forEach((p,i)=>expect(p).toEqual(i===1?{x:300,y:240}:before[i]));expect(validateTable(t)).toBe(true);
 });
 it('edits a rotated and scaled box in world coordinates',()=>{
  const t=emptyWorkbench(),p=fromPreset('box',300,300);p.rotation=35;p.scale=1.5;t.parts.push(p);const before=shape(p),a=before[0],b=before[1];
  const v=addCorner(t,p.id,{x:(a.x+b.x)/2,y:(a.y+b.y)/2},'unused')!;moveVertex(t,v,{x:310,y:240});const after=shape(p);
  expect(after[1].x).toBeCloseTo(310);expect(after[1].y).toBeCloseTo(240);for(const [i,j] of [[0,0],[2,1],[3,2],[4,3]])expect(after[i]).toEqual(before[j]);expect(validateTable(t)).toBe(true);
 });
 it('rejects collapsed insertion and invalid geometry metadata without mutating the table',()=>{
  const t=emptyWorkbench(),p=fromPreset('box',300,300);t.parts.push(p);const before=structuredClone(t);
  expect(addCorner(t,p.id,shape(p)[0],'unused')).toBeUndefined();expect(t).toEqual(before);
  expect(validateTable({...t,parts:[{...p,wallLoop:'bad'}]})).toBe(false);expect(validateTable({...t,parts:[{...makePart('bumper',200,200),wallGroup:'bad'}]})).toBe(false);
 });
 it('undoes and redoes insertion and movement separately, including serialized joints and boxes',()=>{
  const t=emptyWorkbench(),wall={...makePart('wall',100,300),x2:400,y2:300},box=fromPreset('box',300,500);t.parts.push(wall,box);const h=new History(),before=structuredClone(t);
  const v=addCorner(t,wall.id,{x:250,y:300},'inserted')!;addCorner(t,box.id,{x:300,y:468},'unused');h.record(before,t);const inserted=structuredClone(t);
  moveVertex(t,v,{x:250,y:250});h.record(inserted,t);const edited=JSON.parse(JSON.stringify(t));expect(validateTable(edited)).toBe(true);
  expect(h.undo(t)).toEqual(inserted);expect(h.undo(inserted)).toEqual(before);expect(h.redo(before)).toEqual(inserted);expect(h.redo(inserted)).toEqual(edited);
  moveVertex(edited,vertices(edited,wall.id).find(v=>v.id===wall.id&&v.index===1)!,{x:250,y:350});expect(edited.parts.find((p:Part)=>p.id==='inserted')).toMatchObject({x:250,y:350});
 });
 it('preserves unmodified legacy tables exactly through validation and playtest',()=>{
  const t=newTable(),before=JSON.stringify(t),copy=JSON.parse(before);expect(validateTable(copy)).toBe(true);const g=createGame(copy,()=>{});games.push(g);g.step(TICK_MS);expect(JSON.stringify(copy)).toBe(before);
 });
});
describe('edited wall collision geometry',()=>{
 it('uses the reshaped hollow box outline without making its interior solid',()=>{
  const t=emptyWorkbench(),p=fromPreset('box',300,300);p.points=[{x:-90,y:-90},{x:90,y:-90},{x:90,y:90},{x:-90,y:90}];t.parts.push(p);
  const v=addCorner(t,p.id,{x:300,y:210},'unused')!;moveVertex(t,v,{x:300,y:170});const points=shape(p),{g,engine,ball}=rig([makePart('ball',300,300),p]);
  const walls=Matter.Composite.allBodies(engine.world).filter(b=>b.isStatic);
  expect(Matter.Query.point(walls,{x:300,y:300})).toHaveLength(0);
  for(let i=0;i<points.length;i++){const a=points[i],b=points[(i+1)%points.length];expect(Matter.Query.point(walls,{x:(a.x+b.x)/2,y:(a.y+b.y)/2})).not.toHaveLength(0);expect(Matter.Query.point(walls,a)).not.toHaveLength(0)}
  Matter.Body.setVelocity(ball,{x:0,y:-15});let bounced=false;for(let i=0;i<60;i++){g.step(TICK_MS);if(Matter.Body.getVelocity(ball).y>0)bounced=true;expect(ball.position.y).toBeGreaterThan(170)}expect(bounced).toBe(true);
 });
 it('bounces from the newly inserted and moved joint rather than its old location',()=>{
  const t=emptyWorkbench(),p={...makePart('wall',180,350),x2:420,y2:350};t.parts.push(p);const v=addCorner(t,p.id,{x:300,y:350},'joint')!;moveVertex(t,v,{x:300,y:280});
  const {g,ball}=rig([makePart('ball',300,230),...t.parts.filter(p=>!p.boundary)]);Matter.Body.setVelocity(ball,{x:0,y:18});let bounced=false;
  for(let i=0;i<15;i++){g.step(TICK_MS);if(Matter.Body.getVelocity(ball).y<0)bounced=true;expect(ball.position.y).toBeLessThan(280)}expect(bounced).toBe(true);
 });
});
