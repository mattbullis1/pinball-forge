// Build isolated local QA artifacts from the same APIs used by the editor.
import {build} from 'esbuild';
import {mkdir,writeFile} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import JSZip from 'jszip';
import {buildPlayer} from './build-player.mjs';
await mkdir('.qa',{recursive:true});
await build({stdin:{contents:"export {workshopTable} from './src/workshop';export {makePart,newTable,fromPreset} from './src/model';export {createGameZip} from './src/export-game';",resolveDir:process.cwd()},bundle:true,platform:'node',format:'esm',packages:'external',outfile:'.qa/phase5-api.mjs'});
const {workshopTable,makePart,newTable,fromPreset,createGameZip}=await import('../.qa/phase5-api.mjs?'+Date.now());
const bundle=await buildPlayer(),workshop=workshopTable();
await writeFile('examples/forge-workshop.pinball.json',JSON.stringify(workshop,null,2));
await writeFile('.qa/workshop-chime.wav',Buffer.from(workshop.sounds.chime.data.split(',')[1],'base64'));
const circuit=newTable('Rule Circuit');circuit.parts=[];const ball=makePart('ball',280,100),bonus=fromPreset('bonus',280,200),zone=makePart('zone',280,300),extra=fromPreset('extraBall',280,400),multi=fromPreset('multiball',280,510),light=makePart('light',400,300);
circuit.parts.push(ball,bonus,zone,extra,multi,light,makePart('leftFlipper',190,744),makePart('rightFlipper',360,744));circuit.sounds=workshop.sounds;
circuit.advanced={combo:true,musicId:'music',rules:[{id:'reaction',source:zone.id,once:true,actions:[{type:'score',value:500},{type:'flash',target:light.id},{type:'sound',soundId:'chime'},{type:'effect'}]}],missions:[{id:'circuit',title:'Complete the circuit',targets:[bonus.id,zone.id,extra.id,multi.id],reward:2000}]};
await writeFile('tests/fixtures/rule-circuit.pinball.json',JSON.stringify(circuit,null,2));
const qaRoot=resolve(process.argv[2]??'.qa/phase5');await mkdir(qaRoot,{recursive:true});
const results=[];
for(const table of [workshop,circuit]){
 const pack=await createGameZip(table,bundle),zip=await JSZip.loadAsync(pack.bytes,{checkCRC32:true}),folder=resolve(qaRoot,pack.filename.replace(/\.zip$/,''));
 await writeFile(resolve(qaRoot,pack.filename),pack.bytes);
 for(const entry of Object.values(zip.files)){if(entry.dir)continue;const target=resolve(folder,entry.name);if(!target.startsWith(folder+'\\')&&!target.startsWith(folder+'/'))throw Error('Unexpected archive path');await mkdir(dirname(target),{recursive:true});await writeFile(target,await entry.async('nodebuffer'))}
 results.push({title:table.title,parts:table.parts.length,audio:pack.soundCount,files:pack.fileCount,bytes:pack.bytes.length,folder});
}
await writeFile('docs/phase5-packages.json',JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));
