// Opt-in measurement for local QA: ?diagnostics. No telemetry or network calls.
const enabled=typeof location!=='undefined'&&new URLSearchParams(location.search).has('diagnostics');
if(enabled)window.addEventListener('error',e=>{document.documentElement.dataset.runtimeError=e.message});
const draws:number[]=[],intervals:number[]=[];let previous=0,frames=0,stalls=0;
export function measureRender(canvas:HTMLCanvasElement,started:number,playing:boolean){if(!enabled)return;const now=performance.now();draws.push(now-started);if(playing&&previous){if(now-previous<500)intervals.push(now-previous);else stalls++}previous=playing?now:0;frames++;
 canvas.dataset.renderFrames=String(frames);if(frames%120)return;const percentile=(values:number[])=>{const sorted=[...values].sort((a,b)=>a-b);return sorted.length?Number(sorted[Math.floor((sorted.length-1)*.95)].toFixed(2)):0};
 const memory=(performance as Performance&{memory?:{usedJSHeapSize:number}}).memory;
 canvas.dataset.performance=JSON.stringify({frames,renderP95Ms:percentile(draws),activeIntervalP95Ms:percentile(intervals),stallsOver500ms:stalls,heapMB:memory?Number((memory.usedJSHeapSize/1048576).toFixed(1)):null,artwork:document.querySelectorAll('.art-object').length});draws.length=0;intervals.length=0;stalls=0;
}
