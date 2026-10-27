// Create an editable two-picture example and independently served standalone package.
import {build} from 'esbuild';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import JSZip from 'jszip';
import {buildPlayer} from './build-player.mjs';

await mkdir('.qa',{recursive:true});
await build({stdin:{contents:"export {sampleTables} from './src/model';export {createGameZip} from './src/export-game';",resolveDir:process.cwd()},bundle:true,platform:'node',format:'esm',packages:'external',loader:{'.png':'dataurl'},outfile:'.qa/modern-api.mjs'});
const {sampleTables,createGameZip}=await import('../.qa/modern-api.mjs?'+Date.now());
const table=sampleTables()[0];table.title='Modern Space';table.theme='polished';table.surface='#071020';table.exterior='#152132';table.wallColor='#aacbe2';
table.parts.filter(p=>p.boundary).forEach(p=>p.color='#42e7ef');
table.parts.filter(p=>p.kind==='bumper').forEach((p,i)=>p.color=['#ff3030','#42e7ef','#ff8426'][i%3]);
table.parts.filter(p=>p.kind==='slingshot').forEach(p=>p.color='#42e7ef');
const source=[['table','space-table.png'],['headboard','space-headboard.png']];
table.assets={};table.pictures={};
for(const [slot,name] of source){const bytes=await readFile('examples/artwork/'+name),id='modern-'+slot;
 table.assets[id]={id,name,mime:'image/png',data:'data:image/png;base64,'+bytes.toString('base64'),width:bytes.readUInt32BE(16),height:bytes.readUInt32BE(20)};
 table.pictures[slot]={assetId:id,fit:'cover'};
}
await writeFile('examples/modern-space.pinball.json',JSON.stringify(table));
const bundle=await buildPlayer(),pack=await createGameZip(table,bundle),zip=await JSZip.loadAsync(pack.bytes,{checkCRC32:true});
const root=resolve(process.argv[2]??'.qa/modern-space');await mkdir(root,{recursive:true});
await writeFile(resolve(root,'modern-space.zip'),pack.bytes);
for(const entry of Object.values(zip.files)){if(entry.dir)continue;const target=resolve(root,'game',entry.name),folder=resolve(root,'game');if(!target.startsWith(folder+'\\')&&!target.startsWith(folder+'/'))throw Error('Unexpected ZIP path');await mkdir(dirname(target),{recursive:true});await writeFile(target,await entry.async('nodebuffer'))}
console.log(JSON.stringify({title:table.title,parts:table.parts.length,assets:pack.assetCount,files:pack.fileCount,zipBytes:pack.bytes.length,root},null,2));
