import {Asset,Artwork,validAsset,validArt} from './art-model';
import { validGeometry } from './geometry';
import {AdvancedKind,AdvancedSettings,AudioAsset,validAdvanced} from './advanced-model';
import {referenceSprites} from './reference-parts';
export type Kind = AdvancedKind|'artwork'|'wall'|'obstacle'|'bumper'|'leftFlipper'|'rightFlipper'|'launcher'|'upKicker'|'sideKicker'|'bounceWall'|'ballTrap'|'oneWayGate'|'slingshot'|'target'|'rollover'|'drain'|'light'|'zone'|'ball';
export type Point = {x:number;y:number};
export type Part = {id:string;kind:Kind;x:number;y:number;x2?:number;y2?:number;r?:number;color:string;score:number;rotation:number;boundary?:boolean;wallGroup?:string;wallNodes?:[string,string];wallLoop?:boolean;points?:Point[];scale?:number;mirror?:boolean;art?:Artwork;sprite?:string;enabled?:boolean;animationPhase?:number;trappedBalls?:number};
export type Picture={assetId:string;fit:'cover'|'contain'};
export type Table = {id:string;title:string;surface:string;wallColor:string;playfield?:'reference';exterior?:string;gravity?:number;surfacePaint?:Array<Point&{color:string}>;parts:Part[];assets?:Record<string,Asset>;pictures?:{table?:Picture;headboard?:Picture};theme?:'classic'|'polished';advanced?:AdvancedSettings;sounds?:Record<string,AudioAsset>};
export const W=560,H=840;
// Older projects retain their original coordinate space. Reference tables use
// two world units per source pixel, the same scale as their component sprites.
export function tableSize(t:Table){return t.playfield==='reference'?{width:616,height:768}:{width:W,height:H}}
export const palette:{kind:Kind;label:string;group:string;icon:string}[]=[
{kind:'bounceWall',label:'Flashing rebound wall',group:'Action',icon:'▰'},{kind:'ballTrap',label:'Three-ball trap',group:'Action',icon:'∪'},{kind:'oneWayGate',label:'One-way gate',group:'Action',icon:'↑'},
{kind:'upKicker',label:'Upward spring',group:'Action',icon:'↑'},{kind:'sideKicker',label:'Two-way spring',group:'Action',icon:'↔'},
{kind:'multiball',label:'Multiball gate',group:'Advanced',icon:'●'},
{kind:'ramp',label:'Boost ramp (2D)',group:'Advanced',icon:'↑'},
{kind:'movingObstacle',label:'Moving obstacle',group:'Advanced',icon:'↔'},
{kind:'dropTarget',label:'Drop target',group:'Advanced',icon:'▣'},
{kind:'magnet',label:'Magnet',group:'Advanced',icon:'∩'},
{kind:'spinner',label:'Spinner',group:'Advanced',icon:'✳'},
{kind:'bonus',label:'Timed 2× bonus',group:'Advanced',icon:'2×'},
{kind:'extraBall',label:'Extra ball',group:'Advanced',icon:'+1'},
{kind:'artwork',label:'Artwork',group:'Decoration',icon:'▧'},
{kind:'leftFlipper',label:'Left flipper',group:'Controls',icon:'◢'},{kind:'rightFlipper',label:'Right flipper',group:'Controls',icon:'◣'},
{kind:'ball',label:'Pinball',group:'Controls',icon:'●'},{kind:'launcher',label:'Launcher',group:'Controls',icon:'↟'},
{kind:'wall',label:'Wall guide',group:'Shapes',icon:'╱'},{kind:'obstacle',label:'Solid obstacle',group:'Shapes',icon:'▰'},
{kind:'bumper',label:'Bumper',group:'Action',icon:'◎'},{kind:'slingshot',label:'Slingshot',group:'Action',icon:'◢'},
{kind:'target',label:'Target',group:'Action',icon:'▣'},{kind:'rollover',label:'Rollover',group:'Action',icon:'◇'},
{kind:'drain',label:'Drain',group:'Action',icon:'⌄'},{kind:'light',label:'Light',group:'Decoration',icon:'✦'},{kind:'zone',label:'Scoring zone',group:'Action',icon:'◇'}];
export const colors=['#f4f4ef','#63f21c','#a042ff','#ff8426','#42e7ef','#ff50dc','#050505'];
export function uid(){return `p-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`}
export function makePart(kind:Kind,x:number,y:number):Part{return {id:uid(),kind,x,y,...(kind==='wall'?{x2:x+100,y2:y}:{}),...(kind==='obstacle'?{points:[{x:-40,y:-35},{x:40,y:-35},{x:40,y:35},{x:-40,y:35}]}:{}),r:kind==='bumper'?20:kind==='ball'?10:kind==='light'?10:22,color:['bumper','slingshot','target','light'].includes(kind)?colors[2]:colors[0],score:['bumper','target','slingshot','rollover','zone'].includes(kind)?100:0,rotation:0,scale:1}}
export type Preset={id:string;label:string;kind:Kind;changes?:Partial<Part>;wallEnd?:Point};
export const presets:Preset[]=[
{id:'smallLeft',label:'Small left flipper',kind:'leftFlipper'},{id:'smallRight',label:'Small right flipper',kind:'rightFlipper'},
{id:'leftFlipper',label:'Left flipper',kind:'leftFlipper'},{id:'rightFlipper',label:'Right flipper',kind:'rightFlipper'},
{id:'ball',label:'Pinball',kind:'ball'},
{id:'box',label:'Box',kind:'obstacle',changes:{wallLoop:true,color:'#14f63d',points:[{x:-32,y:-32},{x:32,y:-32},{x:32,y:32},{x:-32,y:32}]}},
{id:'wall',label:'Wall guide',kind:'wall',wallEnd:{x:0,y:68}},{id:'shortWall',label:'Short wall',kind:'wall',wallEnd:{x:0,y:48}},
{id:'angledWall',label:'Angled wall',kind:'wall',wallEnd:{x:136,y:32}},{id:'reverseWall',label:'Opposite angled wall',kind:'wall',wallEnd:{x:136,y:-32}},
{id:'bumper',label:'Bumper',kind:'bumper',changes:{r:28}},{id:'smallBumper',label:'Small bumper',kind:'bumper',changes:{r:22}},
{id:'sideTarget',label:'Upright target',kind:'target'},{id:'target',label:'Horizontal target',kind:'target'},
{id:'leftTarget',label:'Left angled target',kind:'target'},{id:'rightTarget',label:'Right angled target',kind:'target'},
{id:'slingshot',label:'Left slingshot',kind:'slingshot'},{id:'rightSling',label:'Right slingshot',kind:'slingshot'},
{id:'upSpring',label:'Upward spring',kind:'upKicker'},{id:'sideSpring',label:'Two-way spring',kind:'sideKicker'},{id:'launcher',label:'Starting plunger',kind:'launcher'},
{id:'bounceVertical',label:'Vertical flashing rebound wall',kind:'bounceWall'},{id:'bounceHorizontal',label:'Horizontal flashing rebound wall',kind:'bounceWall'},
{id:'ballTrap',label:'Three-ball trap',kind:'ballTrap'},{id:'blackHole',label:'Black hole',kind:'drain'},{id:'classicSpinner',label:'Spinner',kind:'spinner',changes:{score:100}},
{id:'classicMagnet',label:'Magnet',kind:'magnet'},
{id:'greenLight',label:'Tall green light',kind:'light'},{id:'mediumLight',label:'Medium green light',kind:'light'},{id:'smallLight',label:'Small green light',kind:'light'},
{id:'gateUpLeft',label:'Upward gate, left hinge',kind:'oneWayGate'},{id:'gateUpRight',label:'Upward gate, right hinge',kind:'oneWayGate'},
{id:'gateRight',label:'Rightward gate',kind:'oneWayGate'},{id:'gateLeft',label:'Leftward gate',kind:'oneWayGate'},
{id:'rollBall',label:'Round rollover light',kind:'rollover'},
{id:'rollPinkPlus',label:'Pink cross rollover light',kind:'rollover'},{id:'rollOrangePlus',label:'Orange cross rollover light',kind:'rollover'},
{id:'rollWhiteBar',label:'White horizontal rollover light',kind:'rollover'},{id:'rollGreenBar',label:'Green horizontal rollover light',kind:'rollover'},{id:'rollCyanBar',label:'Cyan horizontal rollover light',kind:'rollover'},
{id:'rollWhiteVertical',label:'White upright rollover light',kind:'rollover'},{id:'rollPinkVertical',label:'Pink upright rollover light',kind:'rollover'},{id:'rollOrangeVertical',label:'Orange upright rollover light',kind:'rollover'}];
// Retain factories for old examples and regression checks, not selectable UI parts.
const legacyPresets:Preset[]=[{id:'obstacle',label:'Solid obstacle',kind:'obstacle',changes:{color:colors[2]}},{id:'light',label:'Purple light',kind:'light'},...palette.filter(p=>p.group==='Advanced').map(p=>({id:p.kind,label:p.label,kind:p.kind,changes:{color:colors[4],score:p.kind==='dropTarget'?250:p.kind==='spinner'?100:0}}))];
export function fromPreset(id:string,x:number,y:number){const preset=[...presets,...legacyPresets].find(p=>p.id===id);if(!preset)throw new Error(`Unknown pinball preset: ${id}`);const sprite=referenceSprites[id];const part=Object.assign(makePart(preset.kind,x,y),sprite?{sprite:id,color:sprite.color??'#ffffff'}:{},structuredClone(preset.changes??{}));if(preset.wallEnd){part.x2=x+preset.wallEnd.x;part.y2=y+preset.wallEnd.y}return part}
export function newTable(title='My Pinball Table'):Table{
const outline:Point[]=[{x:60,y:22},{x:440,y:22},{x:530,y:100},{x:530,y:810},{x:340,y:810},{x:205,y:810},{x:28,y:750},{x:28,y:440},{x:60,y:365},{x:28,y:310},{x:28,y:80}];
const parts:Part[]=outline.flatMap((v,i)=>i===4?[]:[{...makePart('wall',v.x,v.y),x2:outline[(i+1)%outline.length].x,y2:outline[(i+1)%outline.length].y,boundary:true,color:colors[1]}]);
parts.push({...makePart('wall',486,160),x2:486,y2:765},{...makePart('wall',78,680),x2:192,y2:744},{...makePart('wall',450,680),x2:350,y2:744},
{...makePart('leftFlipper',192,744),rotation:28,scale:.85},{...makePart('rightFlipper',350,744),rotation:-28,scale:.85},makePart('launcher',508,775),makePart('ball',508,720),makePart('drain',273,826));
return {id:uid(),title,surface:colors[6],wallColor:colors[0],exterior:colors[1],parts};}
// An empty construction surface based on the reference; sample tables retain
// their own starting parts and existing saved tables are never rewritten.
export function emptyWorkbench():Table{
 const green='#14f63d';
 // Traced from the supplied playfield; preserve its stepped edges and open drain.
 const outline:Point[]=[[48,2],[250,20],[262,22],[262,26],[274,30],[274,34],[286,40],[286,50],[290,50],[290,70],[294,70],[294,380],[272,380],[272,350],[190,368],[186,370],[186,384],[100,384],[100,370],[96,368],[16,348],[16,184],[20,184],[36,164],[44,162],[44,152],[40,152],[40,134],[36,134],[36,114],[32,114],[32,96],[28,96],[28,76],[24,76],[24,58],[20,58],[20,38],[16,38],[16,24],[24,20],[24,10]].map(([x,y])=>({x:x*2,y:y*2}));
 const parts=outline.flatMap((p,i)=>{const q=outline[(i+1)%outline.length];return p.y===768&&q.y===768?[]:[{...makePart('wall',p.x,p.y),x2:q.x,y2:q.y,boundary:true,color:green}]});
 return {id:uid(),title:'My Pinball Table',playfield:'reference',surface:'#000000',wallColor:'#ffffff',exterior:green,parts};
}
export function sampleTables():Table[]{
const a=newTable('Classic Builder');[[180,300],[330,380],[145,480]].forEach(([x,y])=>a.parts.push(makePart('bumper',x,y)));
a.parts.push({...makePart('slingshot',110,645),scale:1.25},{...makePart('slingshot',425,645),mirror:true,scale:1.25},
{...makePart('obstacle',125,130),color:colors[2],points:[{x:-50,y:-50},{x:80,y:-30},{x:-15,y:0},{x:-25,y:90},{x:-50,y:90}]},makePart('target',310,150),{...makePart('wall',310,205),x2:430,y2:265},makePart('rollover',250,540),makePart('light',85,580));
const b=newTable('Star Cadet');b.exterior=colors[2];b.parts.filter(p=>p.boundary).forEach(p=>p.color=colors[2]);[[130,210],[280,270],[410,210],[205,430],[355,430]].forEach(([x,y])=>b.parts.push(makePart('bumper',x,y)));b.parts.push(makePart('zone',280,550),makePart('target',120,350),makePart('target',430,350));
const c=newTable('Electric Avenue');c.exterior=colors[5];c.parts.filter(p=>p.boundary).forEach(p=>p.color=colors[5]);[[130,310],[280,180],[410,310]].forEach(([x,y])=>c.parts.push({...makePart('bumper',x,y),color:colors[4]}));c.parts.push({...makePart('wall',85,460),x2:195,y2:535},{...makePart('wall',350,535),x2:455,y2:460},makePart('rollover',280,480));return [a,b,c];}
export function validateTable(value:unknown):value is Table{
if(!value||typeof value!=='object')return false;const t=value as Table,hex=(v:unknown)=>typeof v==='string'&&/^#[0-9a-f]{6}$/i.test(v);
if(typeof t.id!=='string'||typeof t.title!=='string'||t.title.length>100||!hex(t.surface)||!hex(t.wallColor)||t.exterior!==undefined&&!hex(t.exterior)||!Array.isArray(t.parts)||t.parts.length>1000)return false;
if(t.playfield!==undefined&&t.playfield!=='reference')return false;
const {width:W,height:H}=tableSize(t);
if(t.surfacePaint!==undefined&&(!Array.isArray(t.surfacePaint)||t.surfacePaint.length>1000||t.surfacePaint.some(p=>!p||![p.x,p.y].every(Number.isFinite)||p.x<0||p.x>W||p.y<0||p.y>H||!hex(p.color))))return false;
if(t.theme!==undefined&&!['classic','polished'].includes(t.theme))return false;
if(t.gravity!==undefined&&(!Number.isFinite(t.gravity)||t.gravity<0||t.gravity>3))return false;
if(t.assets!==undefined&&(!t.assets||typeof t.assets!=='object'||Array.isArray(t.assets)||Object.entries(t.assets).some(([id,a])=>!validAsset(a)||a.id!==id)))return false;
if(t.pictures!==undefined){if(!t.pictures||typeof t.pictures!=='object'||Array.isArray(t.pictures))return false;for(const slot of ['table','headboard'] as const){const picture=t.pictures[slot];if(picture!==undefined&&(!picture||typeof picture.assetId!=='string'||!Object.hasOwn(t.assets??{},picture.assetId)||!['cover','contain'].includes(picture.fit)))return false}}
const ids=new Set<string>();for(const p of t.parts){if(!p||typeof p.id!=='string'||ids.has(p.id)||!palette.some(k=>k.kind===p.kind)||![p.x,p.y,p.rotation,p.score].every(Number.isFinite)||p.score<0||p.score>1e9||!hex(p.color))return false;ids.add(p.id);if(p.kind==='artwork'&&!validArt(p.art!,t.assets??{}))return false;
if(p.scale!==undefined&&(!Number.isFinite(p.scale)||p.scale<.4||p.scale>2))return false;if(p.r!==undefined&&(!Number.isFinite(p.r)||p.r<3||p.r>100))return false;
if(p.sprite!==undefined&&(typeof p.sprite!=='string'||!Object.hasOwn(referenceSprites,p.sprite)||!presets.some(s=>s.id===p.sprite&&s.kind===p.kind)))return false;
if(p.boundary!==undefined&&typeof p.boundary!=='boolean'||p.boundary&&p.kind!=='wall')return false;
if(p.wallLoop!==undefined&&(typeof p.wallLoop!=='boolean'||p.kind!=='obstacle'))return false;
if(p.wallNodes!==undefined&&(p.kind!=='wall'||!p.wallGroup||!Array.isArray(p.wallNodes)||p.wallNodes.length!==2||p.wallNodes.some(n=>typeof n!=='string'||!n)||p.wallNodes[0]===p.wallNodes[1]))return false;
if(p.wallGroup!==undefined&&(typeof p.wallGroup!=='string'||!p.wallGroup||p.kind!=='wall'||p.boundary))return false;
if(p.kind==='wall'&&![p.x2,p.y2].every(Number.isFinite))return false;
if(p.kind==='obstacle'&&(!Array.isArray(p.points)||p.points.length<3||p.points.length>64||p.points.some(v=>!v||![v.x,v.y].every(Number.isFinite))))return false;}
return validGeometry(t)&&validAdvanced(t);}
