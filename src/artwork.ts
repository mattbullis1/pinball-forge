import {Asset,frameAt,frameLayout,imageTypes} from './art-model';
import {Table,Part,tableSize,uid} from './model';
import {perimeter} from './geometry';

export async function readArtwork(file:File):Promise<Asset>{
 const bytes=new Uint8Array(await file.slice(0,12).arrayBuffer());
 const ascii=(a:number,b:number)=>String.fromCharCode(...bytes.slice(a,b));
 const mime=bytes[0]===137&&ascii(1,4)==='PNG'?'image/png':bytes[0]===255&&bytes[1]===216?'image/jpeg':ascii(0,3)==='GIF'?'image/gif':ascii(0,4)==='RIFF'&&ascii(8,12)==='WEBP'?'image/webp':'';
 if(!imageTypes.includes(mime))throw Error(`${file.name}: choose PNG, JPG, WebP, or GIF.`);
 const data=await new Promise<string>((resolve,reject)=>{const r=new FileReader();r.onerror=()=>reject(Error(`Cannot read ${file.name}`));r.onload=()=>resolve(String(r.result).replace(/^data:[^;]*;/,`data:${mime};`));r.readAsDataURL(file)});
 const image=await decode(data,file.name);return{id:uid(),name:file.name,mime,data,width:image.naturalWidth,height:image.naturalHeight};
}
function decode(data:string,name:string):Promise<HTMLImageElement>{return new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(Error(`${name}: this browser could not decode the image.`));img.src=data})}
export async function checkArtwork(table:Table){for(const a of Object.values(table.assets??{})){const img=await decode(a.data,a.name);if(img.naturalWidth!==a.width||img.naturalHeight!==a.height)throw Error(`${a.name}: image dimensions do not match the project.`)}}

// Native image playback preserves GIF/WebP disposal, timing and alpha without a decoder dependency.
// The same layer class is independent of editor controls and can be reused by the standalone player.
export class ArtworkLayers{
 private nodes=new Map<string,{box:HTMLDivElement;image:HTMLImageElement;source:string;frame:number}>();
 private parts:Part[]=[];private assets:Record<string,Asset>={};private started=performance.now();private raf=0;private flashing?:string;
 constructor(private back:HTMLElement,private front:HTMLElement){}
 sync(t:Table,selected?:string,testing=false,flash?:string){
  const {width:W,height:H}=tableSize(t);
  this.assets=t.assets??{};this.parts=t.parts.filter(p=>p.kind==='artwork'&&p.art);
  const ids=new Set(this.parts.map(p=>p.id));for(const [id,n] of this.nodes)if(!ids.has(id)){n.box.remove();this.nodes.delete(id)}
  const outline=perimeter(t),clip=outline.length?`polygon(${outline.map(v=>`${v.x/W*100}% ${v.y/H*100}%`).join(',')})`:'';
  this.back.style.clipPath=clip;this.front.style.clipPath=clip;
  for(const p of this.parts){const a=p.art!,asset=this.assets[a.assetId];if(!asset)continue;let n=this.nodes.get(p.id);
   if(!n){const box=document.createElement('div'),image=new Image();box.className='art-object';image.alt='';image.draggable=false;box.append(image);n={box,image,source:'',frame:-1};this.nodes.set(p.id,n)}
   const parent=a.layer==='front'?this.front:this.back;if(n.box.parentElement!==parent)parent.append(n.box);
   n.box.className=`art-object${!testing&&p.id===selected?' selected':''}${!testing&&a.role!=='decoration'?' physical':''}${p.id===flash?' art-hit':''}`;
   Object.assign(n.box.style,{left:`${p.x/W*100}%`,top:`${p.y/H*100}%`,width:`${a.width/W*100}%`,height:`${a.height/H*100}%`,opacity:String(a.opacity),transform:`translate(-50%,-50%) rotate(${p.rotation}deg) scale(${(p.mirror?-1:1)*(p.scale??1)},${p.scale??1})`});
   n.box.title=asset.name;this.updateFrame(p,n,performance.now()-this.started);
  }
  cancelAnimationFrame(this.raf);if(this.parts.some(p=>p.art?.animation))this.raf=requestAnimationFrame(this.tick);
 }
 private updateFrame(p:Part,n:{image:HTMLImageElement;source:string;frame:number},elapsed:number){const a=p.art!,anim=a.animation,frame=anim?frameAt(elapsed,anim):0,asset=this.assets[a.sequence?.[frame]??a.assetId];
  if(!asset)return;if(n.source!==asset.id){n.image.src=asset.data;n.source=asset.id}
  const {columns,rows,x,y}=frameLayout(a,frame);
  n.image.style.width=`${columns*100}%`;n.image.style.height=`${rows*100}%`;n.image.style.transform=`translate(${x}%,${y}%)`;n.frame=frame;
 }
 flash(id?:string){if(id===this.flashing)return;if(this.flashing)this.nodes.get(this.flashing)?.box.classList.remove('art-hit');if(id)this.nodes.get(id)?.box.classList.add('art-hit');this.flashing=id}
 private tick=(now:number)=>{if(!document.hidden)for(const p of this.parts){const n=this.nodes.get(p.id);if(n&&p.art?.animation&&frameAt(now-this.started,p.art.animation)!==n.frame)this.updateFrame(p,n,now-this.started)}this.raf=requestAnimationFrame(this.tick)};
}
