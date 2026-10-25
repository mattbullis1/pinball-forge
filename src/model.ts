import { validGeometry } from './geometry';
export type Kind = 'wall'|'obstacle'|'bumper'|'leftFlipper'|'rightFlipper'|'launcher'|'slingshot'|'target'|'rollover'|'drain'|'light'|'zone'|'ball';
export type Point = {x:number;y:number};
export type Part = {id:string;kind:Kind;x:number;y:number;x2?:number;y2?:number;r?:number;color:string;score:number;rotation:number;boundary?:boolean;points?:Point[];scale?:number;mirror?:boolean};
export type Table = {id:string;title:string;surface:string;wallColor:string;exterior?:string;parts:Part[]};
export const W=560,H=840;
export const palette:{kind:Kind;label:string;group:string;icon:string}[]=[
{kind:'leftFlipper',label:'Left flipper',group:'Controls',icon:'◢'},{kind:'rightFlipper',label:'Right flipper',group:'Controls',icon:'◣'},
{kind:'ball',label:'Pinball',group:'Controls',icon:'●'},{kind:'launcher',label:'Launcher',group:'Controls',icon:'↟'},
{kind:'wall',label:'Wall guide',group:'Shapes',icon:'╱'},{kind:'obstacle',label:'Solid obstacle',group:'Shapes',icon:'▰'},
{kind:'bumper',label:'Bumper',group:'Action',icon:'◎'},{kind:'slingshot',label:'Slingshot',group:'Action',icon:'◢'},
{kind:'target',label:'Target',group:'Action',icon:'▣'},{kind:'rollover',label:'Rollover',group:'Action',icon:'◇'},
{kind:'drain',label:'Drain',group:'Action',icon:'⌄'},{kind:'light',label:'Light',group:'Decoration',icon:'✦'},{kind:'zone',label:'Scoring zone',group:'Action',icon:'◇'}];
export const colors=['#f4f4ef','#63f21c','#a042ff','#ff8426','#42e7ef','#ff50dc','#050505'];
export function uid(){return `p-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`}
export function makePart(kind:Kind,x:number,y:number):Part{return {id:uid(),kind,x,y,...(kind==='wall'?{x2:x+100,y2:y}:{}),...(kind==='obstacle'?{points:[{x:-40,y:-35},{x:40,y:-35},{x:40,y:35},{x:-40,y:35}]}:{}),r:kind==='bumper'?27:kind==='ball'?10:kind==='light'?10:22,color:['bumper','slingshot','target','light'].includes(kind)?colors[2]:colors[0],score:['bumper','target','slingshot','rollover','zone'].includes(kind)?100:0,rotation:0,scale:1}}
export type Preset={id:string;label:string;kind:Kind;changes?:Partial<Part>};
export const presets:Preset[]=[
{id:'leftFlipper',label:'Left flipper',kind:'leftFlipper'},{id:'rightFlipper',label:'Right flipper',kind:'rightFlipper'},
{id:'smallLeft',label:'Small left flipper',kind:'leftFlipper',changes:{scale:.65}},{id:'smallRight',label:'Small right flipper',kind:'rightFlipper',changes:{scale:.65}},
{id:'ball',label:'Pinball',kind:'ball'},{id:'wall',label:'Wall guide',kind:'wall'},
{id:'obstacle',label:'Solid obstacle',kind:'obstacle',changes:{color:colors[2]}},{id:'wedge',label:'Wedge obstacle',kind:'obstacle',changes:{color:colors[1],points:[{x:-35,y:-40},{x:35,y:40},{x:-35,y:40}]}},
{id:'bumper',label:'Bumper',kind:'bumper'},{id:'smallBumper',label:'Small bumper',kind:'bumper',changes:{r:18,color:colors[1]}},
{id:'slingshot',label:'Left slingshot',kind:'slingshot'},{id:'rightSling',label:'Right slingshot',kind:'slingshot',changes:{mirror:true}},
{id:'target',label:'Target',kind:'target'},{id:'sideTarget',label:'Side target',kind:'target',changes:{rotation:90}},
{id:'launcher',label:'Launcher',kind:'launcher'},{id:'drain',label:'Drain',kind:'drain'},
{id:'rollover',label:'Rollover',kind:'rollover',changes:{color:colors[1]}},{id:'zone',label:'Scoring zone',kind:'zone'},
{id:'light',label:'Purple light',kind:'light'},{id:'greenLight',label:'Green light',kind:'light',changes:{color:colors[1]}}];
export function fromPreset(id:string,x:number,y:number){const preset=presets.find(p=>p.id===id)!;return Object.assign(makePart(preset.kind,x,y),structuredClone(preset.changes??{}))}
export function newTable(title='My Pinball Table'):Table{
const outline:Point[]=[{x:60,y:22},{x:440,y:22},{x:530,y:100},{x:530,y:810},{x:340,y:810},{x:205,y:810},{x:28,y:750},{x:28,y:440},{x:60,y:365},{x:28,y:310},{x:28,y:80}];
const parts:Part[]=outline.flatMap((v,i)=>i===4?[]:[{...makePart('wall',v.x,v.y),x2:outline[(i+1)%outline.length].x,y2:outline[(i+1)%outline.length].y,boundary:true,color:colors[1]}]);
parts.push({...makePart('wall',486,160),x2:486,y2:765},{...makePart('wall',78,680),x2:192,y2:744},{...makePart('wall',450,680),x2:350,y2:744},
{...makePart('leftFlipper',192,744),rotation:28,scale:.85},{...makePart('rightFlipper',350,744),rotation:-28,scale:.85},makePart('launcher',508,775),makePart('ball',508,720),makePart('drain',273,826));
return {id:uid(),title,surface:colors[6],wallColor:colors[0],exterior:colors[1],parts};}
export function sampleTables():Table[]{
const a=newTable('Classic Builder');[[180,300],[330,380],[145,480]].forEach(([x,y])=>a.parts.push(makePart('bumper',x,y)));
a.parts.push({...makePart('slingshot',110,645),scale:1.25},{...makePart('slingshot',425,645),mirror:true,scale:1.25},
{...makePart('obstacle',125,130),color:colors[2],points:[{x:-50,y:-50},{x:80,y:-30},{x:-15,y:0},{x:-25,y:90},{x:-50,y:90}]},makePart('target',310,150),{...makePart('wall',310,205),x2:430,y2:265},makePart('rollover',250,540),makePart('light',85,580));
const b=newTable('Star Cadet');b.exterior=colors[2];b.parts.filter(p=>p.boundary).forEach(p=>p.color=colors[2]);[[130,210],[280,270],[410,210],[205,430],[355,430]].forEach(([x,y])=>b.parts.push(makePart('bumper',x,y)));b.parts.push(makePart('zone',280,550),makePart('target',120,350),makePart('target',430,350));
const c=newTable('Electric Avenue');c.exterior=colors[5];c.parts.filter(p=>p.boundary).forEach(p=>p.color=colors[5]);[[130,310],[280,180],[410,310]].forEach(([x,y])=>c.parts.push({...makePart('bumper',x,y),color:colors[4]}));c.parts.push({...makePart('wall',85,460),x2:195,y2:535},{...makePart('wall',350,535),x2:455,y2:460},makePart('rollover',280,480));return [a,b,c];}
export function validateTable(value:unknown):value is Table{
if(!value||typeof value!=='object')return false;const t=value as Table,hex=(v:unknown)=>typeof v==='string'&&/^#[0-9a-f]{6}$/i.test(v);
if(typeof t.id!=='string'||typeof t.title!=='string'||t.title.length>100||!hex(t.surface)||!hex(t.wallColor)||t.exterior!==undefined&&!hex(t.exterior)||!Array.isArray(t.parts)||t.parts.length>1000)return false;
const ids=new Set<string>();for(const p of t.parts){if(!p||typeof p.id!=='string'||ids.has(p.id)||!palette.some(k=>k.kind===p.kind)||![p.x,p.y,p.rotation,p.score].every(Number.isFinite)||p.score<0||p.score>1e9||!hex(p.color))return false;ids.add(p.id);
if(p.scale!==undefined&&(!Number.isFinite(p.scale)||p.scale<.4||p.scale>2))return false;if(p.r!==undefined&&(!Number.isFinite(p.r)||p.r<3||p.r>100))return false;
if(p.boundary!==undefined&&typeof p.boundary!=='boolean'||p.boundary&&p.kind!=='wall')return false;
if(p.kind==='wall'&&![p.x2,p.y2].every(Number.isFinite))return false;
if(p.kind==='obstacle'&&(!Array.isArray(p.points)||p.points.length<3||p.points.length>64||p.points.some(v=>!v||![v.x,v.y].every(Number.isFinite))))return false;}
return validGeometry(t);}
