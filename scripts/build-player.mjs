import {build} from 'vite';
import {readFile,readdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
export async function buildPlayer(){
 const result=await build({configFile:false,root,publicDir:false,logLevel:'error',
  build:{write:false,minify:'esbuild',target:'es2022',lib:{entry:root+'src/player.ts',name:'PinballForgePlayer',formats:['iife'],fileName:()=> 'runtime.js',cssFileName:'player'},rollupOptions:{output:{inlineDynamicImports:true}}}});
 const output=(Array.isArray(result)?result:[result]).flatMap(r=>r.output);
 const chunk=output.find(o=>o.type==='chunk'&&o.isEntry);
 const css=output.find(o=>o.type==='asset'&&o.fileName.endsWith('.css'));
 if(!chunk||!css||chunk.imports.length||chunk.dynamicImports.length||output.length!==2)throw Error('Player build must contain one self-contained script and one stylesheet.');
 return {javascript:chunk.code,stylesheet:String(css.source),notices:
  'PINBALL FORGE\n\n'+await readFile(root+'LICENSE','utf8')+'\n\nMatter.js\n\n'+await readFile(root+'node_modules/matter-js/LICENSE','utf8')};
}
// Include the installed editor dependency tree's notices in its static build.
export async function editorNotices(){
 const sections=['PINBALL FORGE\n\n'+await readFile(root+'LICENSE','utf8')],seen=new Set();
 async function collect(name){if(seen.has(name))return;seen.add(name);const dir=root+'node_modules/'+name+'/';
  const meta=JSON.parse(await readFile(dir+'package.json','utf8')),files=await readdir(dir);
  const license=files.find(f=>/^licen[sc]e(?:\.|$)/i.test(f))??files.find(f=>/^readme/i.test(f));
  if(!license)throw Error('Missing dependency license: '+name);
  let notice=await readFile(dir+license,'utf8');if(name==='jszip')notice=notice.split('GPL version 3')[0]+'\nPINBALL FORGE selects the MIT license option.\n';
  sections.push(name+' '+meta.version+'\n\n'+notice);for(const dep of Object.keys(meta.dependencies??{}))await collect(dep);
 }
 await collect('matter-js');await collect('jszip');return sections.join('\n\n----------------------------------------\n\n');
}
export function playerBundlePlugin(){
 const name='virtual:pinball-player',id='\0'+name;
 let pending;
 return {name:'pinball-standalone-player',
  async generateBundle(){this.emitFile({type:'asset',fileName:'LICENSES.txt',source:await editorNotices()})},
  resolveId(source){if(source===name)return id},
  async load(source){if(source!==id)return;this.addWatchFile(root+'LICENSE');this.addWatchFile(root+'node_modules/matter-js/LICENSE');pending??=buildPlayer();const bundle=await pending;return Object.entries(bundle).map(([key,value])=>`export const ${key}=${JSON.stringify(value)};`).join('\n')},
  handleHotUpdate(ctx){if(!ctx.file.replaceAll('\\','/').includes('/src/')&&!ctx.file.endsWith('LICENSE'))return;pending=undefined;const mod=ctx.server.moduleGraph.getModuleById(id);if(mod){ctx.server.moduleGraph.invalidateModule(mod);return [...ctx.modules,mod]}}
 };
}
