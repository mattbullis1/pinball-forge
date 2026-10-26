import {describe,it,expect} from 'vitest';
import {readFile} from 'node:fs/promises';
import JSZip from 'jszip';
import {createGameZip} from '../src/export-game';
import {readGamePackage} from '../src/game-package';

describe('complete artwork exports',()=>{
 it.each([
  ['examples/star-workshop.pinball.json',3],
  ['tests/fixtures/artwork-laboratory.pinball.json',13],
  ['tests/fixtures/drain-check.pinball.json',0],
 ])('preserves every byte and setting in %s',async(path,count)=>{
  const table=JSON.parse(await readFile(path,'utf8'));
  const result=await createGameZip(table,{javascript:'/* fixture runtime */',stylesheet:'body{}',notices:'MIT'});
  const zip=await JSZip.loadAsync(result.bytes,{checkCRC32:true});
  const text=await zip.file('table.js').async('string');
  const data=JSON.parse(text.slice('window.PINBALL_FORGE_GAME = '.length).trim().slice(0,-1));
  const loaded=readGamePackage(data);expect(loaded.parts).toEqual(table.parts);expect(result.assetCount).toBe(count);expect(result.fileCount).toBe(6+count);
  for(const [id,asset] of Object.entries(table.assets??{})){
   const bytes=await zip.file(loaded.assets[id].data).async('nodebuffer');
   expect(bytes.equals(Buffer.from(asset.data.split(',')[1],'base64'))).toBe(true);
   expect({...loaded.assets[id],data:asset.data}).toEqual(asset);
  }
 });
});
