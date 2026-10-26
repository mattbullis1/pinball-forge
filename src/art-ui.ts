import {Asset,validArt} from './art-model';
import {builtInArtwork,readArtwork} from './artwork';
import {makePart,Part,Point,Table,W,H} from './model';
type Hooks={table:()=>Table;commit:(f:(t:Table)=>void)=>boolean;select:(id:string)=>void;message:(s:string)=>void;busy:()=>boolean};
export function artworkControls(canvas:HTMLCanvasElement,h:Hooks){
 const panel=document.createElement('aside');panel.id='art-library';panel.hidden=true;panel.setAttribute('aria-label','Artwork library');
 panel.innerHTML=`<button class="close-art" aria-label="Close artwork library">×</button><h2>Artwork</h2><p>Drop images onto the table, or import them here. New artwork is decoration only.</p><button id="import-art">Import pictures / GIFs</button><button id="import-frames">Import frame sequence</button><input id="art-files" type="file" accept="image/png,image/jpeg,image/webp,image/gif" multiple hidden><input id="frame-files" type="file" accept="image/png,image/jpeg,image/webp,image/gif" multiple hidden><h3>Animated parts</h3><div class="art-tiles" id="built-in-art"></div><h3>Your artwork</h3><div class="art-tiles" id="imported-art"></div><p>Drag a tile onto the table, or click to place it. Use Adjust to set its role, size, or animation.</p>`;
 document.body.append(panel);panel.querySelector('.close-art')!.addEventListener('click',()=>panel.hidden=true);
 const builtins=(['beacon','energy','spacecraft'] as const).map(kind=>builtInArtwork(kind));
 function point(e:PointerEvent):Point{const r=canvas.getBoundingClientRect();return{x:(e.clientX-r.left)/r.width*W,y:(e.clientY-r.top)/r.height*H}}
 function add(assets:Asset[],where={x:280,y:400},sequence=false,builtin=false){
  if(h.busy())return;let id='';h.commit(t=>{t.assets??={};for(const a of assets)t.assets[a.id]=a;
   const first=assets[0],width=builtin?96:Math.min(160,first.width),height=builtin?96:width*first.height/first.width;
   const p=makePart('artwork',Math.max(0,Math.min(W,where.x)),Math.max(0,Math.min(H,where.y)));p.art={assetId:first.id,width,height,role:'decoration',layer:'back',opacity:1,...(builtin?{animation:{columns:8,rows:1,frames:8,fps:12}}:{}),...(sequence?{sequence:assets.map(a=>a.id),animation:{columns:1,rows:1,frames:assets.length,fps:12}}:{})};const previous=t.parts.find(q=>q.art?.assetId===first.id);if(!builtin&&!sequence&&previous?.art)p.art=structuredClone(previous.art);t.parts.push(p);id=p.id;
  });if(id)h.select(id);h.message(sequence?`${assets.length} frames placed in one animation.`:'Artwork placed. Drag to move; Adjust changes size and role.');
 }
 function tile(asset:Asset,builtin:boolean){const b=document.createElement('button');b.className='art-tile';b.title=asset.name;b.setAttribute('aria-label',`Place ${asset.name}`);const img=new Image();img.src=asset.data;img.alt='';const preview=document.createElement('div');preview.className='art-tile-image';const template=h.table().parts.find(p=>p.art?.assetId===asset.id)?.art;const animation=builtin?{columns:8,rows:1}:template?.sequence?undefined:template?.animation;if(animation){img.style.width=`${animation.columns*64}px`;img.style.height=`${animation.rows*64}px`;img.style.objectFit='fill'}preview.append(img);const label=document.createElement('span');label.textContent=asset.name;b.append(preview,label);let dragged=false;
  b.addEventListener('pointerdown',e=>{dragged=false;b.setPointerCapture(e.pointerId)});
  b.addEventListener('pointerup',e=>{if(!b.hasPointerCapture(e.pointerId))return;const p=point(e);b.releasePointerCapture(e.pointerId);if(p.x>=0&&p.x<=W&&p.y>=0&&p.y<=H){dragged=true;add([asset],p,false,builtin)}});
  b.addEventListener('click',()=>{if(dragged){dragged=false;return}add([asset],undefined,false,builtin)});return b;
 }
 panel.querySelector('#built-in-art')!.replaceChildren(...builtins.map(a=>tile(a,true)));
 function sync(){panel.querySelector('#imported-art')!.replaceChildren(...Object.values(h.table().assets??{}).map(a=>tile(a,false)))}
 async function importFiles(files:File[],sequence=false,where?:Point){if(!files.length||h.busy())return;const project=h.table().id,assets:Asset[]=[],errors:string[]=[];
  for(const file of files){try{assets.push(await readArtwork(file))}catch(e){errors.push(e instanceof Error?e.message:String(e))}}
  if(project!==h.table().id||h.busy()){h.message('The table changed during import. Please import again.');return}
  if(sequence&&assets.length)add(assets,where,true);else assets.forEach((a,i)=>add([a],where??{x:220+i%4*30,y:340+i%4*30}));sync();
  h.message(`${files.length} selected · ${assets.length} imported · ${sequence&&assets.length?1:assets.length} placed.${errors.length?' '+errors.join(' '):''}`);
 }
 for(const [button,input,sequence] of [['#import-art','#art-files',false],['#import-frames','#frame-files',true]] as const){const file=panel.querySelector<HTMLInputElement>(input)!;panel.querySelector(button)!.addEventListener('click',()=>file.click());file.addEventListener('change',()=>{const files=Array.from(file.files??[]);file.value='';void importFiles(files,sequence)})}
 canvas.addEventListener('dragover',e=>{if(e.dataTransfer?.types.includes('Files'))e.preventDefault()});
 canvas.addEventListener('drop',e=>{e.preventDefault();const r=canvas.getBoundingClientRect();void importFiles(Array.from(e.dataTransfer?.files??[]),false,{x:(e.clientX-r.left)/r.width*W,y:(e.clientY-r.top)/r.height*H})});
 return{open(){if(h.busy())return;sync();panel.hidden=false},close(){panel.hidden=true},sync};
}

export function artworkProperties(container:HTMLElement,p:Part,h:Hooks){if(!p.art)return;const a=p.art;
 const fields=document.createElement('div');fields.className='art-properties';fields.innerHTML=`<label>Artwork role<select id="art-role"><option value="decoration">Decoration only</option><option value="obstacle">Physical obstacle</option><option value="target">Interactive target</option></select></label><p>The outlined rectangle is the collision shape. Transparent pixels do not change it.</p><label>Layer<select id="art-layer"><option value="back">Behind components and ball</option><option value="front">Front overlay</option></select></label><div class="field-row"><label>Width<input id="art-width" type="number" min="1"></label><label>Height<input id="art-height" type="number" min="1"></label></div><label>Opacity<input id="art-opacity" type="range" min="0" max="100"></label><button id="art-fit">Fit artwork to playfield</button><details><summary>Sprite sheet / animation</summary><p>GIF and animated WebP play automatically. Sprite sheets use a regular grid, read left to right, top to bottom. Frame sequences use file-picker order.</p><label>Columns<input id="art-columns" type="number" min="1"></label><label>Rows<input id="art-rows" type="number" min="1"></label><label>Frames<input id="art-frames" type="number" min="1"></label><label>Frames per second<input id="art-fps" type="number" min="1"></label><button id="art-animate">Apply frame animation</button><button id="art-still">Use whole image</button></details>`;container.append(fields);
 const input=(id:string)=>fields.querySelector<HTMLInputElement>('#art-'+id)!;
 for(const key of ['role','layer','width','height','opacity'] as const){input(key).value=String(key==='opacity'?a.opacity*100:a[key]);input(key).addEventListener('change',()=>{const value=input(key).value;const next={...a,[key]:['role','layer'].includes(key)?value:Number(value)/(key==='opacity'?100:1)};if(!validArt(next,h.table().assets??{})){h.message('Use positive dimensions and a valid artwork role.');input(key).value=String(key==='opacity'?a.opacity*100:a[key]);return}h.commit(t=>{const q=t.parts.find(q=>q.id===p.id)!;q.art=next;if(next.role==='target'&&a.role!=='target'&&q.score===0)q.score=100})})}
 fields.querySelector('#art-fit')!.addEventListener('click',()=>h.commit(t=>{const q=t.parts.find(q=>q.id===p.id)!;q.x=W/2;q.y=H/2;q.rotation=0;q.scale=1;q.art={...q.art!,width:W,height:H,layer:'back'}}));
 for(const [key,value] of Object.entries(a.animation??{columns:1,rows:1,frames:a.sequence?.length??1,fps:12}))input(key).value=String(value);
 if(a.sequence){input('columns').disabled=true;input('rows').disabled=true}
 fields.querySelector('#art-animate')!.addEventListener('click',()=>{const animation={columns:Number(input('columns').value),rows:Number(input('rows').value),frames:Number(input('frames').value),fps:Number(input('fps').value)},next={...a,animation};if(!validArt(next,h.table().assets??{})){h.message('Use positive whole columns/rows/frames; frames must fit the sheet or sequence.');return}h.commit(t=>{const q=t.parts.find(q=>q.id===p.id)!;if(!a.animation&&!a.sequence){q.art!.width=a.width/animation.columns;q.art!.height=a.height/animation.rows}q.art!.animation=animation})});
 fields.querySelector('#art-still')!.addEventListener('click',()=>h.commit(t=>{const q=t.parts.find(q=>q.id===p.id)!;delete q.art!.animation;delete q.art!.sequence}));
}
