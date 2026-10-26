import {describe,it,expect} from 'vitest';
import {buildPlayer,editorNotices} from '../scripts/build-player.mjs';

describe('actual distributable player',()=>{
 it('includes editor dependency notices and chooses the JSZip MIT option',async()=>{const notices=await editorNotices();for(const name of ['jszip','matter-js','pako','lie','readable-stream'])expect(notices).toContain(name);expect(notices).toContain('selects the MIT license option')});
 it('bundles the shared runtime with no module imports or network APIs',async()=>{
  const bundle=await buildPlayer();
  expect(bundle.javascript.length).toBeGreaterThan(50000);expect(bundle.stylesheet).toContain('.art-layer');
  expect(bundle.javascript).not.toMatch(/\b(?:fetch|XMLHttpRequest|WebSocket|EventSource)\b|\bimport\s*\(/);
  expect(bundle.stylesheet).not.toMatch(/@import|url\(/);
  expect(bundle.notices).toContain('Liam Brummitt');expect(bundle.notices).toContain('PINBALL FORGE contributors');
  expect(bundle.javascript).toContain('GAME OVER');expect(bundle.javascript).toContain('requestFullscreen');
 },15000);
});
