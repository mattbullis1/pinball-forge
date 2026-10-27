import JSZip from 'jszip';
import {audioPath} from './advanced-model';
import {Table,validateTable} from './model';
import {assetPath,GamePackage} from './game-package';
import modernPartsData from './assets/modern-parts.png?inline';
export type PlayerBundle={javascript:string;stylesheet:string;notices:string};
export function gameFilename(title:string){return (title.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,80)||'my-pinball-game')+'.zip'}
const htmlEscape=(text:string)=>text.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
export function packageScript(pack:GamePackage){return 'window.PINBALL_FORGE_GAME = '+JSON.stringify(pack).replace(/</g,'\\u003c').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029')+';\n'}
export async function createGameZip(source:Table,bundle:PlayerBundle,progress?:(percent:number)=>void){
 if(!validateTable(source))throw Error('The table is invalid. Save a project copy and check its components.');
 if(!bundle.javascript||!bundle.stylesheet||!bundle.notices)throw Error('The standalone player is unavailable.');
 const table=structuredClone(source),zip=new JSZip(),assets=Object.values(table.assets??{});
 for(const [index,asset] of assets.entries()){
  const path=assetPath(index,asset.mime);
  zip.file(path,asset.data.slice(asset.data.indexOf(',')+1),{base64:true,compression:'STORE'});
  asset.data=path;
 }
 const sounds=Object.values(table.sounds??{});
 for(const [index,sound] of sounds.entries()){const path=audioPath(index,sound.mime);zip.file(path,sound.data.slice(sound.data.indexOf(',')+1),{base64:true,compression:'STORE'});sound.data=path}
 zip.file('index.html',`<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>${htmlEscape(table.title)} — PINBALL FORGE</title><link rel="icon" href="data:,"><link rel="stylesheet" href="./player.css"></head>
<body><div id="player"><p id="load-message" role="status">Loading your pinball game…</p><p id="load-error" role="alert" hidden></p></div><noscript>Enable JavaScript to play this pinball game.</noscript><script defer src="./table.js"></script><script defer src="./runtime.js" onerror="document.getElementById('load-message').textContent='The player could not load. Extract the entire ZIP before opening index.html.'"></script></body></html>`);
 zip.file('runtime.js',bundle.javascript);zip.file('player.css',bundle.stylesheet);
 if(table.theme==='polished')zip.file('modern-parts.png',modernPartsData.slice(modernPartsData.indexOf(',')+1),{base64:true,compression:'STORE'});
 zip.file('table.js',packageScript({format:'pinball-forge-game',version:1,table}));
 zip.file('LICENSES.txt',bundle.notices);
 zip.file('README.txt',`PINBALL FORGE — ${table.title}\n\nExtract the entire ZIP, keeping all files and the assets folder together.\nOpen index.html in a current browser. If direct file opening is restricted, serve this folder with an ordinary static web server. No editor, account, CDN, API, Node.js runtime, PHP or database is required by the game.\n\nTo host: upload all extracted contents to one directory on static web hosting, then open that directory's index.html URL. All resource paths are relative.\n\nChoose Play. Left Shift / Right Shift: flippers. Space: launch a fresh ball. Touch buttons are provided. Use Pause, Restart and Fullscreen on screen. Switching away pauses gameplay. Sound starts after Play and can be disabled.\n\nAssets included: ${assets.length}. PNG/JPG/WebP/GIF bytes and sprite/sequence settings are preserved. Audio files included: ${sounds.length}. Default sounds are synthesized locally. Imported sounds and looping music are packaged with the game. Optional components, missions and visual rules use the same runtime as Test. Native GIF/WebP and fullscreen support depend on the browser.\n\nThis ZIP is a playable game. Keep your separate .pinball.json project to continue editing. Game source and Matter.js notices are in LICENSES.txt. Imported artwork and audio retain their original licensing; include any notices required by its owner when distributing.\n`);
 const bytes=await zip.generateAsync({type:'uint8array',compression:'DEFLATE',compressionOptions:{level:6}},m=>progress?.(Math.round(m.percent)));
 return {bytes,filename:gameFilename(source.title),assetCount:assets.length,soundCount:sounds.length,fileCount:Object.values(zip.files).filter(f=>!f.dir).length};
}
