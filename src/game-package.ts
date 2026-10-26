import {Table,validateTable} from './model';
import {audioExtensions,audioPath} from './advanced-model';
export type GamePackage={format:'pinball-forge-game';version:1;table:Table};
export const imageExtension:Record<string,string>={'image/png':'png','image/jpeg':'jpg','image/webp':'webp','image/gif':'gif'};
export function assetPath(index:number,mime:string){return `assets/image-${String(index).padStart(4,'0')}.${imageExtension[mime]}`}
// Editable projects embed images. Standalone packages reference only generated,
// relative filenames; validate all other table fields with the shared validator.
export function readGamePackage(value:unknown):Table {
 if(!value||typeof value!=='object')throw Error('Missing game data.');
 const pack=value as GamePackage;
 if(pack.format!=='pinball-forge-game'||pack.version!==1||!pack.table)throw Error('Unsupported game package.');
 const table=structuredClone(pack.table),check=structuredClone(table);
 const assets=Object.entries(check.assets??{});
 for(const [index,[,asset]] of assets.entries()){
  if(!asset||!imageExtension[asset.mime]||asset.data!==assetPath(index,asset.mime))throw Error('The game contains an invalid image path.');
  asset.data=`data:${asset.mime};base64,AA==`;
 }
 for(const [index,audio] of Object.values(check.sounds??{}).entries()){
  if(!audio||!audioExtensions[audio.mime]||audio.data!==audioPath(index,audio.mime))throw Error('The game contains an invalid sound path.');
  audio.data=`data:${audio.mime};base64,AA==`;
 }
 if(!validateTable(check))throw Error('The game table is invalid.');
 return table;
}
