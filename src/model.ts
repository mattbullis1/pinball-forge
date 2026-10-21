export type Kind = 'wall'|'bumper'|'leftFlipper'|'rightFlipper'|'launcher'|'slingshot'|'target'|'rollover'|'drain'|'light'|'zone'|'ball';
export type Part = { id:string; kind:Kind; x:number; y:number; x2?:number; y2?:number; r?:number; color:string; score:number; rotation:number; boundary?:boolean };
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
  const colors:Record<Kind,string>={wall:'#f4f4ef',bumper:'#4cf1f3',leftFlipper:'#f4f4ef',rightFlipper:'#f4f4ef',launcher:'#4cf1f3',slingshot:'#4cf1f3',target:'#ff56d8',rollover:'#4cf1f3',drain:'#f4f4ef',light:'#ff56d8',zone:'#ff56d8',ball:'#f4f4ef'};
  return {id:`p${Date.now().toString(36)}${++counter}`,kind,x,y,...(kind==='wall'?{x2:x+100,y2:y}:{}),r:kind==='bumper'?30:kind==='ball'?11:kind==='light'?12:24,color:colors[kind],score:['bumper','target','slingshot','rollover','zone'].includes(kind)?100:0,rotation:0};
}
function base(title:string,surface:string,wallColor:string):Table {
  const outline:[[number,number],...Array<[number,number]>]=[[70,25],[465,25],[518,95],[520,265],[495,340],[518,560],[520,780],[350,806],[210,806],[42,780],[35,590],[62,405],[35,275],[38,115]];
  const parts:Part[]=outline.map(([x,y],i)=>{const [x2,y2]=outline[(i+1)%outline.length];const p=makePart('wall',x,y);Object.assign(p,{x2,y2,boundary:true,color:wallColor});return p});
  parts.splice(7,1); // The gap at the foot of the table is the ball drain.
  parts.push(makePart('drain',280,812),makePart('leftFlipper',206,720),makePart('rightFlipper',354,720),makePart('launcher',508,748),makePart('ball',507,692));
  return {id:uid(),title,surface,wallColor,parts};
}
export function sampleTables():Table[] {
  const a=base('Classic Builder','#050505','#f4f4ef');
  [[180,230],[380,230],[280,365],[170,500],[390,500]].forEach(([x,y])=>a.parts.push(makePart('bumper',x,y)));
  a.parts.push(makePart('slingshot',105,655),makePart('slingshot',455,655),makePart('target',280,140));
  const guideA=makePart('wall',70,110),guideB=makePart('wall',360,110),guideC=makePart('wall',92,570),guideD=makePart('wall',468,570);
  Object.assign(guideA,{x2:145,y2:78,color:'#f4f4ef'});Object.assign(guideB,{x2:450,y2:150,color:'#f4f4ef'});
  Object.assign(guideC,{x2:175,y2:615,color:'#f4f4ef'});Object.assign(guideD,{x2:385,y2:615,color:'#f4f4ef'});
  a.parts.push(guideA,guideB,guideC,guideD,makePart('rollover',280,80),makePart('light',100,390));
  const b=base('Star Cadet','#08050d','#4cf1f3');
  [[130,210],[280,270],[430,210],[205,430],[355,430]].forEach(([x,y])=>b.parts.push(makePart('bumper',x,y)));
  b.parts.push(makePart('zone',280,550),makePart('light',280,120),makePart('target',120,350),makePart('target',440,350));
  const c=base('Electric Avenue','#070707','#ff56d8');
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
