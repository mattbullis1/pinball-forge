import {describe,it,expect} from 'vitest';
import JSZip from 'jszip';
import {createGameZip,gameFilename,packageScript} from './export-game';
import {readGamePackage,GamePackage} from './game-package';
import {makePart,newTable,sampleTables} from './model';
import {createGame,TICK_MS} from './physics';
const bundle={javascript:'/* independent runtime */',stylesheet:'body{background:black}',notices:'MIT notices'};
const asset={id:'pixel',name:'../../bad-name.png',mime:'image/png',data:'data:image/png;base64,AQIDBA==',width:1,height:1};
async function unpack(table=newTable()){
 const before=structuredClone(table),result=await createGameZip(table,bundle);expect(table).toEqual(before);
 const zip=await JSZip.loadAsync(result.bytes,{checkCRC32:true}),script=await zip.file('table.js')!.async('string');
 const pack=JSON.parse(script.slice('window.PINBALL_FORGE_GAME = '.length).trim().slice(0,-1)) as GamePackage;
 return {result,zip,pack};
}
describe('standalone ZIP contract',()=>{
 it('contains a player, data, styles, instructions and license notices with relative paths',async()=>{
  const {result,zip,pack}=await unpack();expect(result.fileCount).toBe(6);expect(result.assetCount).toBe(0);
  expect(Object.keys(zip.files).sort()).toEqual(['LICENSES.txt','README.txt','index.html','player.css','runtime.js','table.js'].sort());
  const html=await zip.file('index.html')!.async('string');expect(html).not.toContain('type="module"');expect(html).not.toMatch(/(?:src|href)="(?:https?:|\/\/|\/[^/])/);expect(html).toContain('./runtime.js');expect(readGamePackage(pack).parts).toHaveLength(pack.table.parts.length);
 });
 it('preserves exact image bytes, asset IDs and animation/physics properties',async()=>{
  const t=newTable();t.assets={pixel:asset};const p=makePart('artwork',280,400);p.art={assetId:'pixel',width:80,height:80,role:'target',layer:'front',opacity:.7,animation:{columns:1,rows:1,frames:2,fps:10},sequence:['pixel','pixel']};t.parts.push(p);
  const {result,zip,pack}=await unpack(t);expect(result.assetCount).toBe(1);expect(result.fileCount).toBe(7);expect([...await zip.file('assets/image-0000.png')!.async('uint8array')]).toEqual([1,2,3,4]);expect(pack.table.parts).toEqual(t.parts);expect(readGamePackage(pack).assets!.pixel.data).toBe('assets/image-0000.png');
  expect(Object.keys(zip.files).some(n=>n.includes('bad-name')||n.includes('..'))).toBe(false);
 });
 it('keeps every asset, including unused library images',async()=>{
  const t=newTable();t.assets={pixel:asset,second:{...asset,id:'second',name:'second'}};const {result}=await unpack(t);expect(result.assetCount).toBe(2);
 });
 it('rejects broken projects and unavailable runtime before producing a ZIP',async()=>{
  const t=newTable();t.parts[0].x=NaN;await expect(createGameZip(t,bundle)).rejects.toThrow('invalid');await expect(createGameZip(newTable(),{...bundle,javascript:''})).rejects.toThrow('unavailable');
 });
 it('rejects external, traversing and wrong-format player asset paths',async()=>{
  const t=newTable();t.assets={pixel:asset};const {pack}=await unpack(t);
  for(const path of ['https://example.com/p.png','../p.png','/p.png','assets/image-0000.gif','assets/image-0000.png?url=x']){const bad=structuredClone(pack);bad.table.assets!.pixel.data=path;expect(()=>readGamePackage(bad)).toThrow('image path')}
  expect(()=>readGamePackage({...pack,version:2})).toThrow('Unsupported');
 });
 it('escapes titles and data without changing the project text',async()=>{
  const t=newTable('<script>alert("x")</script> & forge');const {zip,pack}=await unpack(t);const html=await zip.file('index.html')!.async('string');expect(html).toContain('&lt;script&gt;');expect(html).not.toContain('<script>alert');expect(pack.table.title).toBe(t.title);expect(packageScript(pack)).not.toContain('</script>');expect(gameFilename('../../')).toBe('my-pinball-game.zip');
 });
 it.each([0,1,2])('sample %s runs identically from packaged table data',async index=>{
  const t=sampleTables()[index],{pack}=await unpack(t),a=createGame(t,()=>{}),b=createGame(readGamePackage(pack),()=>{});
  try{a.launch();b.launch();for(let i=0;i<1200;i++){a.flippers(i%60<30,i%80<40);b.flippers(i%60<30,i%80<40);a.step(TICK_MS);b.step(TICK_MS);expect(b.snapshot()).toEqual(a.snapshot())}}finally{a.stop();b.stop()}
 });
});
