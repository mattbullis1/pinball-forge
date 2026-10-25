import './workbench.css';
import {colors,fromPreset,H,newTable,palette,Part,Point,presets,sampleTables,Table,uid,validateTable,W} from './model';
import {addCorner,end,inside,moveVertex,perimeter,project,removeCorner,shape,translate,validGeometry,Vertex,vertices} from './geometry';
import {History} from './history';
import {drawTable,drawThumbnail} from './draw';
import {createGame,Game} from './physics';
type Mode='hand'|'corner'|'add'|'cut'|'paint';
const modeInfo:Record<Mode,[string,string,string]>={
 hand:['Hand','Move a part — drag it on the table','M8 18v-7c0-2 3-2 3 0V4c0-2 3-2 3 0v7-3c0-2 3-2 3 0v4-2c0-2 3-2 3 0v5c0 5-3 8-7 8-3 0-5-2-7-5l-3-4c-1-2 1-3 3-1z'],
 corner:['Move corner','Move corner — select a wall or shape, then drag a square','M12 2v20M2 12h20M8 6l4-4 4 4M8 18l4 4 4-4M6 8l-4 4 4 4M18 8l4 4-4 4'],
 add:['Add corner','Add corner — click an edge, then drag the new corner','M12 3v18M3 12h18'],
 cut:['Remove corner','Remove corner — click a square to reconnect its neighbors','M8 8l12 12M8 16L20 4M8 7a3 3 0 1 0-6 0 3 3 0 0 0 6 0M8 17a3 3 0 1 0-6 0 3 3 0 0 0 6 0'],
 paint:['Paint','Paint — choose a color, then click a part, wall, or empty surface','M4 15l5 5 12-15-3-3zM4 15c-5 2-1 5-3 7 6 0 8-3 8-3']};
const icon=(path:string)=>`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${path}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter"/></svg>`;
const app=document.querySelector<HTMLDivElement>('#app')!;
app.innerHTML=`<header><h1>PINBALL FORGE</h1><nav aria-label="Project"><button id="new">New</button><button id="open">Open</button><button id="save">Save</button><button id="undo">Undo</button><button id="redo">Redo</button><button id="test">▶ Test</button><button id="export" title="Download an editable project file">Project ↓</button></nav></header>
<main><section class="stage" aria-label="Pinball table"><div class="table-heading"><span id="table-title"></span><button id="settings" aria-label="Table settings">Table ▾</button></div><div class="canvas-wrap"><canvas id="canvas" width="560" height="840" tabindex="0" aria-label="Pinball construction playfield"></canvas></div><div id="touch-play" hidden><button id="left">Left flipper</button><button id="launch">Launch</button><button id="right">Right flipper</button></div></section>
<section class="workbox" aria-label="Parts and tools"><div class="parts-area"><div id="build-box"><div class="box-heading"><span>PARTS BOX</span><label class="snap"><input type="checkbox" id="snap" checked> Snap</label></div><div id="parts" aria-label="Component palette"></div><div id="part-help">Take a part. Put it on the table.</div><div id="selection" class="selection"><strong id="selection-name">Your construction set</strong><div id="selection-actions" hidden><button id="tune">Adjust</button><button id="duplicate">Duplicate</button><button id="delete">Delete</button></div><p id="selection-help">Shape the walls. Add a few parts. Try it.</p></div><details id="accessible-parts"><summary>Select a part by name</summary><label>Table parts<select id="part-list"><option value="">Choose a part</option></select></label></details></div>
<div id="scoreboard" hidden aria-label="Playtest scoreboard"><p class="small">PINBALL FORGE</p><h2 id="game-title"></h2><div class="score-label">SCORE</div><output id="score">00000000</output><div class="score-label">BALLS</div><output id="balls">● ● ●</output><p id="game-state">Make something. Play something.</p><button id="restart">Restart game</button><button id="back">Back to Build</button><p class="instructions">LEFT SHIFT · RIGHT SHIFT<br>SPACE TO LAUNCH</p><label><input type="checkbox" id="sound" checked> Sound</label></div></div>
<nav class="tools" aria-label="Construction tools">${Object.entries(modeInfo).map(([mode,[label,,path]])=>`<button data-mode="${mode}" title="${label}" aria-label="${label}">${icon(path)}<span>${label}</span></button>`).join('')}<div id="swatches" aria-label="Paint colors">${colors.map((c,i)=>`<button data-color="${c}" aria-label="${['White','Green','Purple','Orange','Cyan','Magenta','Black'][i]} paint" title="${['White','Green','Purple','Orange','Cyan','Magenta','Black'][i]}" style="--swatch:${c}"></button>`).join('')}</div><label class="custom-paint" title="Choose another paint color">Color<input id="custom-color" type="color" value="#a042ff" aria-label="Custom paint color"></label><button id="tool-test" aria-label="Test table" title="Test table">${icon('M6 3l15 9-15 9z')}<span>Test</span></button></nav></section></main>
<footer><span id="status" role="status"></span><span id="mode-label">BUILD</span></footer>
<aside id="inspector" hidden aria-label="Adjust selection"><button id="close-inspector" aria-label="Close adjustments">×</button><h2 id="inspector-title">Adjust</h2><div id="properties"></div></aside>
<dialog id="table-dialog"><h2>Your table</h2><label>Table name<input id="title" maxlength="60"></label><div class="color-fields"><label>Surface<input id="surface" type="color"></label><label>Outside walls<input id="exterior" type="color"></label></div><label>Sample table<select id="sample"><option value="">Choose a sample…</option>${sampleTables().map((t,i)=>`<option value="${i}">${t.title}</option>`).join('')}</select></label><p>Loading a sample can be undone.</p><button id="load-sample">Load sample</button><button id="apply-table">Apply colors & name</button><button data-close="table-dialog">Close</button></dialog>
<dialog id="open-dialog"><h2>Open a table</h2><button id="open-saved">Open saved project</button><button id="open-file">Choose project file</button><button data-close="open-dialog">Cancel</button><p>Save keeps one project in this browser.<br>Project ↓ downloads a portable editing copy.</p></dialog>
<input id="file" type="file" accept="application/json,.json" hidden><div id="toast" role="status"></div>`;
const $=<T extends HTMLElement=HTMLElement>(s:string)=>document.querySelector<T>(s)!;
const canvas=$<HTMLCanvasElement>('#canvas'),ctx=canvas.getContext('2d')!;
let table=sampleTables()[0],selected:string|undefined,mode:Mode='hand',chosen:string|undefined,paint=colors[2],snap=true,invalid:Table|undefined,guides:{x?:number;y?:number}|undefined;
const history=new History();let game:Game|undefined,raf=0,left=false,right=false;
let drag:{before:Table;origin:Point;id:string;vertex?:Vertex;pointer:number}|undefined;
let paletteDrag:{preset:string;start:Point;pointer:number}|undefined;
let toastTimer:ReturnType<typeof setTimeout>;
const label=(p:Part)=>p.boundary?'Outer wall':palette.find(k=>k.kind===p.kind)!.label;
const current=()=>table.parts.find(p=>p.id===selected);
const corners=()=>['corner','add','cut'].includes(mode);
function message(text:string){$('#status').textContent=text}
function toast(text:string){clearTimeout(toastTimer);$('#toast').textContent=text;$('#toast').classList.add('show');toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),3200)}
function paintCanvas(){drawTable(ctx,table,{selected,corners:corners(),invalid,guides,testing:!!game,gameParts:game?.parts(),ball:game?.ball(),flash:game?.flash()});if(game){$('#score').textContent=String(game.score()).padStart(8,'0');$('#balls').textContent='● '.repeat(game.balls())||'—';$('#game-state').textContent=game.balls()?'LEFT SHIFT / RIGHT SHIFT · SPACE':'GAME OVER'}}
function refresh(){
 paintCanvas();$('#table-title').textContent=table.title;$<HTMLButtonElement>('#undo').disabled=!!game||!history.past.length;$<HTMLButtonElement>('#redo').disabled=!!game||!history.future.length;
 document.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===mode&&!chosen)));
 document.querySelectorAll<HTMLButtonElement>('[data-preset]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.preset===chosen)));
 document.querySelectorAll<HTMLButtonElement>('[data-color]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.color===paint)));
 canvas.dataset.mode=chosen?'place':mode;$('#mode-label').textContent=game?'PLAY':chosen?'PLACE':modeInfo[mode][0].toUpperCase();
 const p=current();$('#selection-name').textContent=p?label(p):'Your construction set';$('#selection-actions').hidden=!p;
 $('#selection-help').textContent=p?(p.boundary?'Use corner tools to change the outline.':p.kind==='light'?'Decoration only — the ball passes through.':p.kind==='obstacle'?'Solid shape — use corner tools to sculpt it.':`${p.score} points · ready to play`):'Shape the walls. Add a few parts. Try it.';
 $<HTMLButtonElement>('#delete').disabled=!!p?.boundary;$<HTMLButtonElement>('#duplicate').disabled=p?.kind==='ball';
 const list=$<HTMLSelectElement>('#part-list');list.replaceChildren(new Option('Choose a part',''),...table.parts.map((p,i)=>new Option(`${i+1}. ${label(p)}`,p.id)));list.value=selected??'';
 if(!$('#inspector').hidden)renderProperties();
}
function commit(change:(t:Table)=>void){if(game)return false;const before=structuredClone(table);change(table);if(!validGeometry(table)){table=before;toast('That shape crosses itself, collapses, or leaves the table.');refresh();return false}history.record(before,table);refresh();return true}
function setMode(next:Mode){if(game)return;mode=next;chosen=undefined;invalid=undefined;message(modeInfo[mode][1]);refresh()}
function grid(n:number){return snap?Math.round(n/10)*10:Math.round(n)}
function coords(e:{clientX:number;clientY:number}):Point{const r=canvas.getBoundingClientRect();return{x:(e.clientX-r.left)*W/r.width,y:(e.clientY-r.top)*H/r.height}}
function inCanvas(e:{clientX:number;clientY:number}){const r=canvas.getBoundingClientRect();return e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom}
function radius(){return 12*W/canvas.getBoundingClientRect().width}
function hit(point:Point,shapesOnly=false){return [...table.parts].reverse().find(p=>{
 if(shapesOnly&&!['wall','obstacle'].includes(p.kind))return false;
 if(p.kind==='wall')return project(point,p,end(p)).distance<radius();
 if(['obstacle','slingshot','target','leftFlipper','rightFlipper','launcher','drain'].includes(p.kind))return inside(point,shape(p));
 return Math.hypot(p.x-point.x,p.y-point.y)<(p.r??22)*(p.scale??1)+5;
})}
function nearestVertex(point:Point){return vertices(table,selected).map(v=>({...v,d:Math.hypot(v.point.x-point.x,v.point.y-point.y)})).filter(v=>v.d<radius()).sort((a,b)=>a.d-b.d)[0]}
function align(point:Point,id?:string){const out={x:grid(point.x),y:grid(point.y)};guides={};if(snap){const others=table.parts.filter(p=>p.id!==id&&!p.boundary);for(const axis of ['x','y'] as const){const close=others.map(p=>p[axis]).sort((a,b)=>Math.abs(a-point[axis])-Math.abs(b-point[axis]))[0];if(close!==undefined&&Math.abs(close-point[axis])<5){out[axis]=close;guides[axis]=close}}}return out}
function place(id:string,point:Point){if(game)return;const ok=commit(t=>{const p=fromPreset(id,grid(Math.max(45,Math.min(W-80,point.x))),grid(Math.max(50,Math.min(H-50,point.y))));if(p.kind==='wall')p.color=t.wallColor;if(p.kind==='ball')t.parts=t.parts.filter(q=>q.kind!=='ball');t.parts.push(p);selected=p.id});if(ok&&current()){chosen=undefined;mode='hand';message(`${label(current()!)} placed — drag to move, or choose Adjust`);refresh()}}
function movePaint(point:Point){const p=hit(point);commit(t=>{if(p){p.color=paint;selected=p.id}else if(inside(point,perimeter(t))){t.surface=paint;selected=undefined}else{t.exterior=paint;t.parts.filter(p=>p.boundary).forEach(p=>p.color=paint);selected=undefined}});message(p?`${label(p)} painted`:'Table painted')}
canvas.addEventListener('pointerdown',e=>{
 if(game||e.button!==0)return;e.preventDefault();canvas.focus();const point=coords(e);
 if(chosen){place(chosen,point);return}if(mode==='paint'){movePaint(point);return}
 if(corners()){
  let v=nearestVertex(point);if(!v){const p=hit(point,true);selected=p?.id;refresh();v=nearestVertex(point)}
  if(mode==='cut'){if(v){commit(t=>{if(!removeCorner(t,v!))toast('Keep at least three corners. Drain ends stay open.');if(!t.parts.some(p=>p.id===selected))selected=t.parts.find(p=>p.boundary)?.id});message('Neighbors reconnect when a corner is removed')}else message('Select a shape, then click a corner square');return}
  if(mode==='add'){const p=hit(point,true);if(p){selected=p.id;const nearest=p.kind==='wall'?project(point,p,end(p)).point:point;const ok=commit(t=>addCorner(t,p.id,nearest,uid()));if(ok){mode='corner';message('Corner added — drag its square to shape the wall');refresh()}}else message('Click a wall edge or an obstacle edge');return}
  if(v){drag={before:structuredClone(table),origin:point,id:v.id,vertex:v,pointer:e.pointerId};selected=v.id;canvas.setPointerCapture(e.pointerId)}else message('Select a wall or obstacle to show its corners');refresh();return;
 }
 const p=hit(point);selected=p?.id;if(p){drag={before:structuredClone(table),origin:point,id:p.id,pointer:e.pointerId};canvas.setPointerCapture(e.pointerId)}refresh();
});
canvas.addEventListener('pointermove',e=>{
 if(!drag||e.pointerId!==drag.pointer||game)return;const point=coords(e),candidate=structuredClone(drag.before);
 if(drag.vertex)moveVertex(candidate,drag.vertex,align(point,drag.id));else{const old=candidate.parts.find(p=>p.id===drag!.id)!;const target=align({x:old.x+point.x-drag.origin.x,y:old.y+point.y-drag.origin.y},drag.id);translate(candidate,drag.id,target.x-old.x,target.y-old.y)}
 if(validGeometry(candidate)){table=candidate;invalid=undefined;message(drag.vertex?'Release to keep this wall shape':'Release to place the part')}else{invalid=candidate;message('Red shape is invalid — move back inside without crossing edges')}
 paintCanvas();
});
function finishDrag(cancel=false){if(!drag)return;if(cancel)table=drag.before;else history.record(drag.before,table);const pointer=drag.pointer;drag=undefined;invalid=undefined;guides=undefined;if(canvas.hasPointerCapture(pointer))canvas.releasePointerCapture(pointer);message(cancel?'Move cancelled':modeInfo[mode][1]);refresh()}
canvas.addEventListener('pointerup',()=>finishDrag());canvas.addEventListener('pointercancel',()=>finishDrag(true));canvas.addEventListener('lostpointercapture',()=>{if(drag)finishDrag(true)});
canvas.addEventListener('dblclick',()=>{if(!game&&current()&&!corners())openInspector()});
$('#parts').innerHTML=presets.map(p=>`<button class="part" data-preset="${p.id}" title="${p.label}" aria-label="${p.label}"><canvas aria-hidden="true"></canvas><span>${p.label}</span></button>`).join('');
let suppressClick=false;
document.querySelectorAll<HTMLButtonElement>('[data-preset]').forEach(b=>{
 drawThumbnail(b.querySelector('canvas')!,fromPreset(b.dataset.preset!,0,0));
 b.addEventListener('pointerdown',e=>{if(game)return;paletteDrag={preset:b.dataset.preset!,start:{x:e.clientX,y:e.clientY},pointer:e.pointerId};b.setPointerCapture(e.pointerId)});
 b.addEventListener('pointerup',e=>{if(!paletteDrag||paletteDrag.pointer!==e.pointerId)return;const moved=Math.hypot(e.clientX-paletteDrag.start.x,e.clientY-paletteDrag.start.y)>8;if(moved&&inCanvas(e)){place(paletteDrag.preset,coords(e));suppressClick=true}paletteDrag=undefined;b.releasePointerCapture(e.pointerId)});
 b.addEventListener('pointercancel',()=>paletteDrag=undefined);
 b.addEventListener('click',()=>{if(suppressClick){suppressClick=false;return}if(game)return;chosen=b.dataset.preset;message(`Place ${b.title.toLowerCase()} — click or tap the table`);refresh()});
 b.addEventListener('mouseenter',()=>$('#part-help').textContent=b.title);b.addEventListener('focus',()=>$('#part-help').textContent=b.title);
});
document.querySelectorAll<HTMLButtonElement>('[data-mode]').forEach(b=>b.addEventListener('click',()=>setMode(b.dataset.mode as Mode)));
document.querySelectorAll<HTMLButtonElement>('[data-color]').forEach(b=>b.addEventListener('click',()=>{paint=b.dataset.color!;$<HTMLInputElement>('#custom-color').value=paint;setMode('paint')}));
$('#custom-color').addEventListener('input',e=>{paint=(e.target as HTMLInputElement).value;setMode('paint')});
$('#snap').addEventListener('change',e=>snap=(e.target as HTMLInputElement).checked);
$('#part-list').addEventListener('change',e=>{selected=(e.target as HTMLSelectElement).value||undefined;refresh()});
function duplicate(){const p=current();if(!p||p.kind==='ball')return;commit(t=>{const q=structuredClone(p);q.id=uid();q.boundary=false;t.parts.push(q);translate(t,q.id,20,20);selected=q.id});message('Copy placed — drag it to its new position')}
function removeSelected(){const p=current();if(!p||game)return;if(p.boundary){toast('Use Remove corner to reshape the outer wall.');return}commit(t=>{t.parts=t.parts.filter(q=>q.id!==p.id);selected=undefined})}
$('#duplicate').addEventListener('click',duplicate);$('#delete').addEventListener('click',removeSelected);
function undo(){if(game)return;finishDrag(true);table=history.undo(table);selected=undefined;refresh();message('Undo — previous table restored')}
function redo(){if(game)return;table=history.redo(table);selected=undefined;refresh();message('Redo — change restored')}
$('#undo').addEventListener('click',undo);$('#redo').addEventListener('click',redo);
function openInspector(){if(!current())return;$('#inspector').hidden=false;renderProperties()}
$('#tune').addEventListener('click',openInspector);$('#close-inspector').addEventListener('click',()=>$('#inspector').hidden=true);
function renderProperties(){const p=current();if(!p){$('#inspector').hidden=true;return}$('#inspector-title').textContent=label(p);
 $('#properties').innerHTML=`<label>Color<input id="part-color" type="color"></label><div class="field-row"><label>X<input id="part-x" type="number" min="0" max="560"></label><label>Y<input id="part-y" type="number" min="0" max="840"></label></div>${p.kind==='wall'?'<p>Use Move corner to reshape this wall.</p>':'<label>Rotation<input id="part-rotation" type="range" min="-180" max="180" step="5"></label>'}${!['ball','wall'].includes(p.kind)?'<label>Size<input id="part-size" type="range" min="40" max="200" step="5"></label>':''}<label>Points<input id="part-score" type="number" min="0" max="1000000000" step="10"></label>`;
 for(const [name,value] of [['color',p.color],['x',p.x],['y',p.y],['rotation',p.rotation],['size',(p.scale??1)*100],['score',p.score]] as const){const el=document.querySelector<HTMLInputElement>(`#part-${name}`);if(!el)continue;el.value=String(value);el.addEventListener('change',()=>{const value=name==='color'?el.value:Number(el.value);if(typeof value==='number'&&!Number.isFinite(value))return;commit(t=>{const q=t.parts.find(q=>q.id===p.id)!;if(name==='x'||name==='y')translate(t,q.id,name==='x'?Number(value)-q.x:0,name==='y'?Number(value)-q.y:0);else if(name==='size')q.scale=Math.max(.4,Math.min(2,Number(value)/100));else if(name==='color')q.color=String(value);else if(name==='score')q.score=Math.max(0,Math.min(1e9,Number(value)));else q.rotation=Number(value)})})}
}
$('#settings').addEventListener('click',()=>{if(game)return;$<HTMLInputElement>('#title').value=table.title;$<HTMLInputElement>('#surface').value=table.surface;$<HTMLInputElement>('#exterior').value=table.exterior??colors[5];$<HTMLDialogElement>('#table-dialog').showModal()});
$('#apply-table').addEventListener('click',()=>{commit(t=>{t.title=$<HTMLInputElement>('#title').value.trim()||'My Pinball Table';t.surface=$<HTMLInputElement>('#surface').value;t.exterior=$<HTMLInputElement>('#exterior').value;t.parts.filter(p=>p.boundary).forEach(p=>p.color=t.exterior!)});$<HTMLDialogElement>('#table-dialog').close()});
$('#load-sample').addEventListener('click',()=>{const value=$<HTMLSelectElement>('#sample').value;if(value==='')return;replaceTable(sampleTables()[Number(value)]);$<HTMLDialogElement>('#table-dialog').close()});
document.querySelectorAll<HTMLButtonElement>('[data-close]').forEach(b=>b.addEventListener('click',()=>$<HTMLDialogElement>('#'+b.dataset.close).close()));
function replaceTable(next:Table){if(game)return;history.record(table,next);table=structuredClone(next);selected=undefined;chosen=undefined;mode='hand';refresh();message(modeInfo.hand[1])}
$('#new').addEventListener('click',()=>replaceTable(newTable()));
$('#save').addEventListener('click',()=>{try{localStorage.setItem('pinball-forge-project',JSON.stringify(table));toast('Saved on this browser. Use Project ↓ for a file copy.')}catch{toast('Browser storage is full or unavailable. Download a project copy.')}});
$('#open').addEventListener('click',()=>{if(game)return;$<HTMLButtonElement>('#open-saved').disabled=!localStorage.getItem('pinball-forge-project');$<HTMLDialogElement>('#open-dialog').showModal()});
$('#open-saved').addEventListener('click',()=>{try{const value=JSON.parse(localStorage.getItem('pinball-forge-project')??'null');if(!validateTable(value))throw Error();replaceTable(value);$<HTMLDialogElement>('#open-dialog').close();toast('Saved project opened')}catch{toast('This saved project is invalid. Your current table is unchanged.')}});
$('#open-file').addEventListener('click',()=>{$<HTMLDialogElement>('#open-dialog').close();$('#file').click()});
$('#file').addEventListener('change',async e=>{const input=e.target as HTMLInputElement,file=input.files?.[0];if(!file)return;try{if(file.size>5e6)throw Error();const value=JSON.parse(await file.text());if(!validateTable(value))throw Error();if(!game){replaceTable(value);toast('Project file opened')}}catch{toast('Could not read a valid table. Your current table is unchanged.')}finally{input.value=''}});
$('#export').addEventListener('click',()=>{const url=URL.createObjectURL(new Blob([JSON.stringify(table,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download=`${table.title.toLowerCase().replace(/[^a-z0-9]+/g,'-')}.pinball.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Editable project downloaded. Standalone game export is a later phase.')});
let audio:AudioContext|undefined;
function sound(score:number){if(!$<HTMLInputElement>('#sound').checked||!audio)return;const oscillator=audio.createOscillator(),gain=audio.createGain();oscillator.type='square';oscillator.frequency.setValueAtTime(score?660:330,audio.currentTime);oscillator.frequency.exponentialRampToValueAtTime(180,audio.currentTime+.09);gain.gain.setValueAtTime(.025,audio.currentTime);gain.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.1);oscillator.connect(gain).connect(audio.destination);oscillator.start();oscillator.stop(audio.currentTime+.1)}
function playUI(on:boolean){$('#build-box').hidden=on;$('#scoreboard').hidden=!on;$('#touch-play').hidden=!on;$('.tools').hidden=on;$('#inspector').hidden=true;$('#test').textContent=on?'■ Back to Build':'▶ Test';for(const id of ['new','open','settings'])$<HTMLButtonElement>('#'+id).disabled=on;$('#game-title').textContent=table.title;refresh()}
function startTest(){if(game)return;finishDrag();left=right=false;chosen=undefined;try{audio??=new AudioContext();void audio.resume()}catch{/* Play also works without audio. */}game=createGame(structuredClone(table),()=>{},sound);playUI(true);message('Left Shift / Right Shift: flippers · Space: launch · Escape: back to build');let last=performance.now(),acc=0;const loop=(now:number)=>{if(!game)return;acc+=Math.min(now-last,100);last=now;while(acc>=1000/120){game.step(1000/120);acc-=1000/120}paintCanvas();raf=requestAnimationFrame(loop)};raf=requestAnimationFrame(loop)}
function stopTest(){if(!game)return;cancelAnimationFrame(raf);game.stop();game=undefined;left=right=false;playUI(false);message('Back to building — your table is exactly as you left it')}
$('#test').addEventListener('click',()=>game?stopTest():startTest());$('#tool-test').addEventListener('click',startTest);$('#back').addEventListener('click',stopTest);$('#restart').addEventListener('click',()=>{stopTest();startTest()});
for(const id of ['left','right','launch']){const b=$<HTMLButtonElement>('#'+id);b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);if(id==='launch')game?.launch();if(id==='left')left=true;if(id==='right')right=true;game?.flippers(left,right)});const release=()=>{if(id==='left')left=false;if(id==='right')right=false;game?.flippers(left,right)};b.addEventListener('pointerup',release);b.addEventListener('pointercancel',release);b.addEventListener('lostpointercapture',release)}
window.addEventListener('blur',()=>{left=right=false;game?.flippers(false,false);finishDrag(true)});
document.addEventListener('keydown',e=>{
 if((e.target as HTMLElement).matches('input,select,textarea')||document.querySelector('dialog[open]'))return;
 if(game){if(e.code==='ShiftLeft')left=true;if(e.code==='ShiftRight')right=true;if(e.code==='Space'){e.preventDefault();if(!e.repeat)game.launch()}if(e.key==='Escape')stopTest();game?.flippers(left,right);return}
 if(e.key==='Escape'){finishDrag(true);chosen=undefined;selected=undefined;$('#inspector').hidden=true;setMode('hand')}
 if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();e.shiftKey?redo():undo()}
 if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='y'){e.preventDefault();redo()}
 if(e.key==='Delete'||e.key==='Backspace'){e.preventDefault();removeSelected()}
 const keys:Record<string,Mode>={h:'hand',v:'corner',a:'add',x:'cut',p:'paint'};if(!e.ctrlKey&&!e.metaKey&&keys[e.key.toLowerCase()])setMode(keys[e.key.toLowerCase()]);
});
document.addEventListener('keyup',e=>{if(e.code==='ShiftLeft')left=false;if(e.code==='ShiftRight')right=false;game?.flippers(left,right)});
message(modeInfo.hand[1]);refresh();
