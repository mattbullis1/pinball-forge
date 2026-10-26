import type {Table} from './model';

export const advancedKinds=['multiball','ramp','movingObstacle','dropTarget','magnet','spinner','bonus','extraBall'] as const;
export type AdvancedKind=typeof advancedKinds[number];
export const actionTypes=['score','flash','sound','activate','deactivate','multiball','extraBall','bonus','effect','resetTargets'] as const;
export type RuleAction={type:typeof actionTypes[number];target?:string;value?:number;soundId?:string};
export type Rule={id:string;source:string;once?:boolean;actions:RuleAction[]};
export type Mission={id:string;title:string;targets:string[];reward:number};
export type AudioAsset={id:string;name:string;mime:string;data:string};
export type AdvancedSettings={rules?:Rule[];combo?:boolean;missions?:Mission[];musicId?:string};
export const audioExtensions:Record<string,string>={'audio/wav':'wav','audio/mpeg':'mp3','audio/ogg':'ogg','audio/webm':'webm'};
export const audioPath=(index:number,mime:string)=>`assets/sound-${String(index).padStart(4,'0')}.${audioExtensions[mime]}`;
export function validAudio(a:AudioAsset){return !!a&&typeof a.id==='string'&&typeof a.name==='string'&&Object.hasOwn(audioExtensions,a.mime)&&typeof a.data==='string'&&a.data.startsWith(`data:${a.mime};base64,`)&&/^[A-Za-z0-9+/]+={0,2}$/.test(a.data.split(',')[1]??'')}
export function validAdvanced(t:Table){
 const a=t.advanced,ids=new Set(t.parts.map(p=>p.id)),sounds=t.sounds??{};
 if(t.sounds!==undefined&&(!t.sounds||typeof t.sounds!=='object'||Array.isArray(t.sounds)||Object.entries(sounds).some(([id,s])=>!validAudio(s)||s.id!==id)))return false;
 if(t.parts.some(p=>p.enabled!==undefined&&typeof p.enabled!=='boolean'))return false;
 if(a===undefined)return true;
 if(!a||typeof a!=='object'||Array.isArray(a)||a.combo!==undefined&&typeof a.combo!=='boolean'||a.musicId!==undefined&&!Object.hasOwn(sounds,a.musicId))return false;
 const unique=(v:{id:string}[])=>v.every(x=>x&&typeof x.id==='string')&&new Set(v.map(x=>x.id)).size===v.length;
 if(a.rules!==undefined&&(!Array.isArray(a.rules)||!unique(a.rules)||a.rules.some(r=>!ids.has(r.source)||r.once!==undefined&&typeof r.once!=='boolean'||!Array.isArray(r.actions)||!r.actions.length||r.actions.some(x=>!x||!actionTypes.includes(x.type)||['flash','activate','deactivate'].includes(x.type)&&!ids.has(x.target??'')||x.type==='sound'&&!Object.hasOwn(sounds,x.soundId??'')||x.type==='score'&&(!Number.isFinite(x.value)||x.value!<0||x.value!>1e9)))))return false;
 if(a.missions!==undefined&&(!Array.isArray(a.missions)||!unique(a.missions)||a.missions.some(m=>typeof m.title!=='string'||!m.title.trim()||m.title.length>80||!Array.isArray(m.targets)||!m.targets.length||new Set(m.targets).size!==m.targets.length||m.targets.some(id=>!ids.has(id))||!Number.isFinite(m.reward)||m.reward<0||m.reward>1e9)))return false;
 return true;
}
export function removeReferences(t:Table,id:string){
 if(!t.advanced)return;
 t.advanced.rules=t.advanced.rules?.filter(r=>r.source!==id).map(r=>({...r,actions:r.actions.filter(a=>a.target!==id)})).filter(r=>r.actions.length);
 t.advanced.missions=t.advanced.missions?.map(m=>({...m,targets:m.targets.filter(x=>x!==id)})).filter(m=>m.targets.length);
}
