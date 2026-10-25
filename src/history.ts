import type {Table} from './model';
export class History{
  past:Table[]=[];future:Table[]=[];
  record(before:Table,after:Table){if(JSON.stringify(before)===JSON.stringify(after))return false;this.past.push(structuredClone(before));if(this.past.length>80)this.past.shift();this.future=[];return true}
  undo(t:Table){const prev=this.past.pop();if(!prev)return t;this.future.push(structuredClone(t));return prev}
  redo(t:Table){const next=this.future.pop();if(!next)return t;this.past.push(structuredClone(t));return next}
}
