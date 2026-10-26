import type {Part,Point,Table} from './model';
import type {RuleAction} from './advanced-model';

export type Burst=Point&{color:string;start:number};
export type AdvancedSnapshot={activeBalls:number;multiplier:number;bonusSeconds:number;combo:number;missions:{title:string;hits:number;total:number;complete:boolean}[]};
/** Rules consume contact-start events. Actions never dispatch contacts recursively. */
export class GameRules {
 private now=0;private bonusUntil=0;private combo=0;private lastCombo=-Infinity;private lastSource='';
 private fired=new Set<string>();private collected=new Set<string>();private turnGates=new Set<string>();
 private hits=new Set<string>();private completed=new Set<string>();
 private flashes=new Map<string,number>();private bursts:Burst[]=[];
 constructor(private table:Table,private apply:(action:RuleAction,source:Part)=>void,private award:(points:number)=>void){}
 reset(){this.now=this.bonusUntil=this.combo=0;this.lastCombo=-Infinity;this.lastSource='';this.fired.clear();this.collected.clear();this.turnGates.clear();this.hits.clear();this.completed.clear();this.flashes.clear();this.bursts=[]}
 newTurn(){this.turnGates.clear();this.combo=0;this.lastCombo=-Infinity;this.bonusUntil=0}
 tick(now:number){this.now=now;this.bursts=this.bursts.filter(b=>now-b.start<700);if(now-this.lastCombo>2000)this.combo=0}
 multiplier(){return this.now<this.bonusUntil?2:1}
 bonus(){this.bonusUntil=this.now+10000}
 flash(id:string){this.flashes.set(id,this.now+900)}
 flashing(id:string){return (this.flashes.get(id)??0)>this.now}
 effect(p:Part){this.bursts.push({x:p.x,y:p.y,color:p.color,start:this.now})}
 effects(){return this.bursts.map(b=>({...b}))}
 hit(p:Part){
  if(p.score){this.award(p.score*this.multiplier());if(this.table.advanced?.combo){this.combo=this.now-this.lastCombo<=2000&&this.lastSource!==p.id?this.combo+1:1;if(this.combo>1)this.award(50*(this.combo-1));this.lastCombo=this.now;this.lastSource=p.id}}
  if(p.kind==='bonus')this.bonus();
  if(p.kind==='multiball'&&!this.turnGates.has(p.id)){this.turnGates.add(p.id);this.apply({type:'multiball'},p);this.effect(p)}
  if(p.kind==='extraBall'&&!this.collected.has(p.id)){this.collected.add(p.id);this.apply({type:'extraBall'},p);this.effect(p)}
  this.hits.add(p.id);
  for(const m of this.table.advanced?.missions??[])if(!this.completed.has(m.id)&&m.targets.every(id=>this.hits.has(id))){this.completed.add(m.id);this.award(m.reward);this.effect(p)}
  for(const r of this.table.advanced?.rules??[])if(r.source===p.id&&(!r.once||!this.fired.has(r.id))){this.fired.add(r.id);for(const action of r.actions){if(action.type==='score')this.award(action.value??0);else if(action.type==='bonus')this.bonus();else if(action.type==='flash')this.flash(action.target!);else if(action.type==='effect')this.effect(p);else this.apply(action,p)}}
 }
 snapshot(activeBalls:number):AdvancedSnapshot{return {activeBalls,multiplier:this.multiplier(),bonusSeconds:Math.max(0,Math.ceil((this.bonusUntil-this.now)/1000)),combo:this.combo,missions:(this.table.advanced?.missions??[]).map(m=>({title:m.title,hits:m.targets.filter(id=>this.hits.has(id)).length,total:m.targets.length,complete:this.completed.has(m.id)}))}}
}
export function advancedStatus(a:AdvancedSnapshot){return [a.activeBalls>1?`MULTIBALL · ${a.activeBalls} in play`:'',a.bonusSeconds?`2× BONUS · ${a.bonusSeconds}s`:'',a.combo>1?`COMBO ×${a.combo}`:'',...a.missions.map(m=>m.complete?`${m.title} · COMPLETE`:`${m.title} · ${m.hits}/${m.total}`)].filter(Boolean).join(' · ')}
