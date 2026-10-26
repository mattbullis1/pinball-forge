export type Asset={id:string;name:string;mime:string;data:string;width:number;height:number};
export type Animation={columns:number;rows:number;frames:number;fps:number};
export type Artwork={assetId:string;width:number;height:number;role:'decoration'|'obstacle'|'target';layer:'back'|'front';opacity:number;animation?:Animation;sequence?:string[]};
export const imageTypes=['image/png','image/jpeg','image/webp','image/gif'];
export function validAsset(a:Asset){return !!a&&typeof a.id==='string'&&typeof a.name==='string'&&imageTypes.includes(a.mime)&&typeof a.data==='string'&&a.data.startsWith(`data:${a.mime};base64,`)&&/^[A-Za-z0-9+/]+={0,2}$/.test(a.data.split(',')[1]??'')&&[a.width,a.height].every(v=>Number.isSafeInteger(v)&&v>0)}
export function validArt(a:Artwork,assets:Record<string,Asset>){
 if(!a||!Object.hasOwn(assets,a.assetId)||!['decoration','obstacle','target'].includes(a.role)||!['back','front'].includes(a.layer)||![a.width,a.height,a.opacity].every(Number.isFinite)||a.width<=0||a.height<=0||a.opacity<0||a.opacity>1)return false;
 if(a.sequence&&(!Array.isArray(a.sequence)||!a.sequence.length||a.sequence.some(id=>typeof id!=='string'||!Object.hasOwn(assets,id))))return false;
 const n=a.animation;if(n&&(![n.columns,n.rows,n.frames].every(v=>Number.isSafeInteger(v)&&v>0)||!Number.isFinite(n.fps)||n.fps<=0||n.frames>(a.sequence?.length??n.columns*n.rows)))return false;
 return true;
}
export function frameAt(elapsed:number,animation:Animation){return Math.floor(Math.max(0,elapsed)*animation.fps/1000)%animation.frames}
export function frameLayout(a:Artwork,frame:number){const columns=a.sequence?1:a.animation?.columns??1,rows=a.sequence?1:a.animation?.rows??1,cell=a.sequence?0:frame;return{columns,rows,x:-100*(cell%columns)/columns,y:-100*Math.floor(cell/columns)/rows}}
