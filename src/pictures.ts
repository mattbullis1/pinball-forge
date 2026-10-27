import {readArtwork} from './artwork';
import {perimeter} from './geometry';
import {Table,W,H} from './model';

export type PictureSlot='table'|'headboard';

export function syncPicture(image:HTMLImageElement,table:Table,slot:PictureSlot){
 const picture=table.pictures?.[slot],asset=picture&&table.assets?.[picture.assetId];
 image.hidden=!asset;
 if(asset){if(image.getAttribute('src')!==asset.data)image.src=asset.data;image.style.objectFit=picture!.fit}
 else image.removeAttribute('src');
 if(slot==='table'){
  const outline=perimeter(table);
  image.style.clipPath=outline.length?`polygon(${outline.map(p=>`${p.x/W*100}% ${p.y/H*100}%`).join(',')})`:'';
 }
 return !!asset;
}

type Hooks={table:()=>Table;commit:(change:(table:Table)=>void)=>boolean;busy:()=>boolean;message:(text:string)=>void};
export function pictureControls(h:Hooks){
 const slots=['table','headboard'] as const;
 function sync(){for(const slot of slots){
  const active=syncPicture(document.querySelector<HTMLImageElement>(`#${slot}-picture-image`)!,h.table(),slot);
  const remove=document.querySelector<HTMLButtonElement>(`#${slot}-picture-remove`)!;
  const fit=document.querySelector<HTMLSelectElement>(`#${slot}-picture-fit`)!;
  remove.disabled=!active;fit.disabled=!active;fit.value=h.table().pictures?.[slot]?.fit??'cover';
  if(slot==='headboard')document.querySelector<HTMLElement>('#headboard-empty')!.hidden=active;
 }}
 for(const slot of slots){
  const input=document.querySelector<HTMLInputElement>(`#${slot}-picture-file`)!;
  const remove=document.querySelector<HTMLButtonElement>(`#${slot}-picture-remove`)!;
  const fit=document.querySelector<HTMLSelectElement>(`#${slot}-picture-fit`)!;
  input.addEventListener('change',async()=>{
   const file=input.files?.[0];input.value='';if(!file||h.busy())return;
   const project=h.table().id;
   try{const asset=await readArtwork(file);
    if(project!==h.table().id||h.busy()){h.message('The table changed during import. Choose the picture again.');return}
    if(h.commit(t=>{t.assets??={};t.assets[asset.id]=asset;t.pictures??={};t.pictures[slot]={assetId:asset.id,fit:'cover'}}))h.message(`${slot==='table'?'Table':'Headboard'} picture added. It will be saved and included in your game ZIP.`);
   }catch(error){h.message(error instanceof Error?error.message:String(error))}
  });
  remove.addEventListener('click',()=>{if(h.busy())return;h.commit(t=>{if(t.pictures)delete t.pictures[slot]});h.message(`${slot==='table'?'Table':'Headboard'} picture removed.`)});
  fit.addEventListener('change',()=>{const value=fit.value;if(value!=='cover'&&value!=='contain')return;h.commit(t=>{if(t.pictures?.[slot])t.pictures[slot].fit=value})});
 }
 sync();return {sync};
}
