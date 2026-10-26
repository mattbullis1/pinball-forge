import {Table,validateTable} from './model';
function database():Promise<IDBDatabase>{return new Promise((resolve,reject)=>{const r=indexedDB.open('pinball-forge',1);r.onupgradeneeded=()=>r.result.createObjectStore('projects');r.onerror=()=>reject(r.error);r.onblocked=()=>reject(Error('Close older PINBALL FORGE tabs and retry.'));r.onsuccess=()=>resolve(r.result)})}
export async function saveProject(table:Table){const db=await database();try{await new Promise<void>((resolve,reject)=>{const tx=db.transaction('projects','readwrite');tx.objectStore('projects').put(table,'current');tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error??Error('Save cancelled'))})}finally{db.close()}}
export async function loadProject():Promise<Table|undefined>{const db=await database();let value:unknown;try{value=await new Promise((resolve,reject)=>{const tx=db.transaction('projects','readonly'),r=tx.objectStore('projects').get('current');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error)})}finally{db.close()}
 if(value===undefined){const legacy=localStorage.getItem('pinball-forge-project');if(legacy)value=JSON.parse(legacy)}
 if(value===undefined)return;if(!validateTable(value))throw Error('The saved project is invalid.');return value;
}
