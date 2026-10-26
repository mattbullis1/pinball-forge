// Repeatable CPU measurement of the actual shared simulation; no web server opens.
import fs from 'node:fs/promises';
import {createServer} from 'vite';
const loader=await createServer({server:{middlewareMode:true,hmr:false,watch:null},appType:'custom'});
try {
 const {createGame}=await loader.ssrLoadModule('/src/physics.ts');
 const {sampleTables}=await loader.ssrLoadModule('/src/model.ts');
 const results=[];
 for(const table of sampleTables()) {
  const game=createGame(table,()=>{}),timings=[];
  for(let frame=0;frame<1800;frame++) {
   if(game.snapshot().canLaunch)game.launch();if(!game.balls())game.restart();
   game.flippers(frame%36<18,frame%48<24);
   const start=performance.now();game.step(1000/60);timings.push(performance.now()-start);
  }
  game.stop();timings.sort((a,b)=>a-b);
  results.push({table:table.title,parts:table.parts.length,simulatedSeconds:30,frames:1800,simulationP95Ms:+timings[Math.floor(timings.length*.95)].toFixed(3),simulationMaxMs:+timings.at(-1).toFixed(3)});
 }
 const report={measuredAt:new Date().toISOString(),node:process.version,scope:'Simulation CPU only; excludes rendering, images, audio and browser scheduling.',results};
 await fs.writeFile('docs/phase3-performance.json',JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify(report,null,2));
} finally {await loader.close()}
