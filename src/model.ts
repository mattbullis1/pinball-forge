export type Kind = 'wall'|'bumper'|'leftFlipper'|'rightFlipper'|'launcher'|'slingshot'|'target'|'rollover'|'drain'|'light'|'zone'|'ball';
export type Part = { id:string; kind:Kind; x:number; y:number; x2?:number; y2?:number; r?:number; color:string; score:number; rotation:number };
export type Table = { id:string; title:string; surface:string; wallColor:string; parts:Part[] };
export const W=560, H=840;
export const palette: {kind:Kind;label:string;group:string;icon:string}[] = [
  {kind:'leftFlipper',label:'Left flipper',group:'Controls',icon:'◢'},{kind:'rightFlipper',label:'Right flipper',group:'Controls',icon:'◣'},
  {kind:'ball',label:'Pinball',group:'Controls',icon:'●'},{kind:'launcher',label:'Launcher',group:'Controls',icon:'↟'},
  {kind:'bumper',label:'Bumper',group:'Action',icon:'◎'},{kind:'wall',label:'Wall',group:'Structure',icon:'━'},
  {kind:'slingshot',label:'Slingshot',group:'Action',icon:'▲'},{kind:'target',label:'Target',group:'Action',icon:'▣'},
  {kind:'rollover',label:'Rollover',group:'Action',icon:'◌'},{kind:'drain',label:'Drain',group:'Structure',icon:'⌄'},
  {kind:'light',label:'Light',group:'Decor',icon:'✦'},{kind:'zone',label:'Scoring zone',group:'Action',icon:'◇'}
];
let counter=0;
export function uid(){return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}-${++counter}`}
export function makePart(kind:Kind,x:number,y:number):Part {
  const colors:Record<Kind,string>={wall:'#78d7e8',bumper:'#fa6ab0',leftFlipper:'#f1eee7',rightFlipper:'#f1eee7',launcher:'#ffc75a',slingshot:'#ef6694',target:'#ffc75a',rollover:'#80e1d2',drain:'#fa6a7e',light:'#f7db69',zone:'#a68cff',ball:'#f7f8ff'};
  return {id:`p${Date.now().toString(36)}${++counter}`,kind,x,y,...(kind==='wall'?{x2:x+100,y2:y}:{}),r:kind==='bumper'?30:kind==='ball'?11:kind==='light'?12:24,color:colors[kind],score:['bumper','target','slingshot','rollover','zone'].includes(kind)?100:0,rotation:0};
}
function base(title:string,surface:string,wallColor:string):Table {
  const parts=[makePart('wall',24,28),makePart('wall',24,28),makePart('wall',536,28),makePart('wall',24,800),makePart('wall',414,800),makePart('drain',280,812),makePart('leftFlipper',206,720),makePart('rightFlipper',354,720),makePart('launcher',508,748),makePart('ball',507,692)];
  Object.assign(parts[0],{x2:536,y2:28});Object.assign(parts[1],{x2:24,y2:800});Object.assign(parts[2],{x2:536,y2:800});Object.assign(parts[3],{x2:230,y2:800});Object.assign(parts[4],{x2:536,y2:800});
  return {id:uid(),title,surface,wallColor,parts};
}
export function sampleTables():Table[] {
  const a=base('Neon Circuit','#101326','#65dbe8');
  [[180,230],[380,230],[280,365],[170,500],[390,500]].forEach(([x,y])=>a.parts.push(makePart('bumper',x,y)));
  a.parts.push(makePart('slingshot',105,655),makePart('slingshot',455,655),makePart('target',280,140));
  const b=base('Cosmic Voyage','#19122a','#bd91ff');
  [[130,210],[280,270],[430,210],[205,430],[355,430]].forEach(([x,y])=>b.parts.push(makePart('bumper',x,y)));
  b.parts.push(makePart('zone',280,550),makePart('light',280,120),makePart('target',120,350),makePart('target',440,350));
  const c=base('Ocean Drive','#092c36','#55d7cf');
  [[130,310],[280,180],[430,310]].forEach(([x,y])=>c.parts.push(makePart('bumper',x,y)));
  c.parts.push(makePart('wall',95,450),makePart('wall',360,450),makePart('rollover',280,480),makePart('light',280,95));
  Object.assign(c.parts[c.parts.length-4],{x2:200,y2:525});Object.assign(c.parts[c.parts.length-3],{x2:465,y2:525});
  return [a,b,c];
}
export function validateTable(value:unknown):value is Table {
  if(!value||typeof value!=='object')return false;
  const t=value as Table;
  return typeof t.title==='string'&&typeof t.surface==='string'&&typeof t.wallColor==='string'&&Array.isArray(t.parts)&&t.parts.every(p=>p&&typeof p.id==='string'&&palette.some(k=>k.kind===p.kind)&&[p.x,p.y,p.rotation,p.score].every(Number.isFinite)&&typeof p.color==='string');
}
