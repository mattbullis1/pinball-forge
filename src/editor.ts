import './workbench.css';
import './advanced.css';
import './pictures.css';
import {advancedControls} from './advanced-ui';
import {removeReferences} from './advanced-model';
import {advancedStatus} from './game-rules';
import {colors,emptyWorkbench,fromPreset,palette,Part,Point,presets,sampleTables,Table,uid,validateTable,tableSize} from './model';
import {addCorner,end,inside,moveVertex,paintConnected,perimeter,project,shape,splitBarrier,translate,validGeometry,Vertex,vertices} from './geometry';
import {History} from './history';
import {drawTable,drawThumbnail,drawBackground} from './draw';
import {createGame,Game} from './physics';
import {bindMouseFlippers,FlipperInput} from './play-input';
import {GameAudio} from './game-audio';
import {createGameZip} from './export-game';
import * as playerBundle from 'virtual:pinball-player';
import {ArtworkLayers,checkArtwork} from './artwork';
import {artworkControls,artworkProperties} from './art-ui';
import {measureRender,measureSimulation} from './diagnostics';
import {saveProject,loadProject} from './storage';
import {pictureControls} from './pictures';
import {referenceSprites} from './reference-parts';
import {paintSurface} from './surface-paint';
type Mode='hand'|'corner'|'cut'|'hammer'|'paint';
const modeInfo:Record<Mode,[string,string,string]>={
 hand:['Move','Drag a wall point to reshape it, or drag a part to move it','M8 18v-7c0-2 3-2 3 0V4c0-2 3-2 3 0v7-3c0-2 3-2 3 0v4-2c0-2 3-2 3 0v5c0 5-3 8-7 8-3 0-5-2-7-5l-3-4c-1-2 1-3 3-1z'],
 corner:['Stretch wall','Click a wall edge to add a point; drag a point to stretch its connected walls','M4 2v19l5-6 4 7 4-2-4-7h8z'],
 cut:['Cut barrier','Scissors — click a barrier to split it into two barriers','M8 8l12 12M8 16L20 4M8 7a3 3 0 1 0-6 0 3 3 0 0 0 6 0M8 17a3 3 0 1 0-6 0 3 3 0 0 0 6 0'],
 hammer:['Hammer tool','Hammer — click a piece to remove it','M3 7l5-5h8l5 5-4 4-4-4-2 2 2 2-9 11-3-3 9-10-2-2-2 2z'],
 paint:['Brush','Brush — choose a color, then click the attached area to paint','M4 15l5 5 12-15-3-3zM4 15c-5 2-1 5-3 7 6 0 8-3 8-3']};
const icon=(path:string)=>`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${path}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square" stroke-linejoin="miter"/></svg>`;
const app=document.querySelector<HTMLDivElement>('#app')!;
app.innerHTML=`<header><h1>PINBALL FORGE</h1><nav aria-label="Project"><button id="new">New</button><button id="open">Open</button><button id="save">Save</button><button id="undo">Undo</button><button id="redo">Redo</button><button id="test">▶ Test</button><button id="export" title="Download an editable project file">Project ↓</button></nav></header>
<div class="download-bar"><button id="download-game">DOWNLOAD MY PINBALL GAME</button><span id="download-status" role="status">Standalone HTML5 ZIP · everything included</span></div>
<main><aside class="headboard-preview" aria-label="Headboard preview"><div class="picture-controls"><label class="picture-upload">Headboard picture<input id="headboard-picture-file" type="file" accept="image/png,image/jpeg,image/webp,image/gif" aria-label="Choose headboard picture"></label><select id="headboard-picture-fit" aria-label="Headboard picture fit"><option value="cover">Crop to fill</option><option value="contain">Show whole picture</option></select><button id="headboard-picture-remove" aria-label="Remove headboard picture">Remove</button></div><div class="headboard-frame"><img id="headboard-picture-image" alt="" hidden><div id="headboard-empty">Headboard picture<br><strong id="headboard-title"></strong></div></div><div class="headboard-readout"><span>SCORE <output id="headboard-score">00000000</output></span><span>BALLS <output id="headboard-balls">3</output></span></div></aside>
<section class="stage" aria-label="Pinball table"><div class="table-heading"><span id="table-title"></span><div class="picture-controls"><label class="picture-upload">Background picture<input id="table-picture-file" type="file" accept="image/png,image/jpeg,image/webp,image/gif" aria-label="Choose playfield background picture"></label><select id="table-picture-fit" aria-label="Playfield background picture fit"><option value="cover">Crop to fill</option><option value="contain">Show whole picture</option></select><button id="table-picture-remove" aria-label="Remove playfield background picture">Remove</button><button id="settings" aria-label="Table settings">Table ▾</button></div></div><div class="canvas-wrap"><canvas id="background" width="560" height="840" aria-hidden="true"></canvas><img id="table-picture-image" class="table-picture-image" alt="" hidden><div id="art-back" class="art-layer" aria-hidden="true"></div><canvas id="canvas" width="560" height="840" tabindex="0" aria-label="Pinball construction playfield"></canvas><div id="art-front" class="art-layer" aria-hidden="true"></div></div><div id="touch-play" hidden><button id="left">Left flipper</button><button id="launch">Launch</button><button id="right">Right flipper</button></div></section>
<section class="workbox" aria-label="Parts and tools"><div class="parts-area"><div id="build-box"><div class="box-heading"><span>PARTS BOX</span><label class="snap"><input type="checkbox" id="snap" checked> Snap</label></div><div id="parts" aria-label="Component palette"></div><div id="part-help">Drag to table, or tap a part then tap the table.</div><button id="artwork">Artwork +</button><button id="advanced">Advanced +</button><div id="selection" class="selection"><strong id="selection-name">Your construction set</strong><div id="selection-actions" hidden><button id="tune">Adjust</button><button id="duplicate">Duplicate</button><button id="delete">Delete</button></div><p id="selection-help">Shape the walls. Add a few parts. Try it.</p></div><details id="accessible-parts"><summary>Select a part by name</summary><label>Table parts<select id="part-list"><option value="">Choose a part</option></select></label></details></div>
<div id="scoreboard" hidden aria-label="Playtest scoreboard"><p class="small">PINBALL FORGE</p><h2 id="game-title"></h2><div class="score-label">SCORE</div><output id="score">00000000</output><div class="score-label">BALLS</div><output id="balls">● ● ●</output><p id="advanced-status" role="status"></p><p id="game-state">Make something. Play something.</p><button id="pause">Pause</button><button id="restart">Restart game</button><button id="back">Back to Build</button><p class="instructions">LEFT / RIGHT MOUSE OR SHIFT<br>SPACE TO LAUNCH</p><label><input type="checkbox" id="sound" checked> Sound</label></div></div>
<nav class="tools" aria-label="Construction tools">${Object.entries(modeInfo).map(([mode,[label,,path]])=>`<button data-mode="${mode}" title="${label}" aria-label="${label}">${icon(path)}<span>${label}</span></button>`).join('')}<div id="swatches" aria-label="Paint colors">${colors.map((c,i)=>`<button data-color="${c}" aria-label="${['White','Green','Purple','Orange','Cyan','Magenta','Black'][i]} paint" title="${['White','Green','Purple','Orange','Cyan','Magenta','Black'][i]}" style="--swatch:${c}"></button>`).join('')}</div><label class="custom-paint" title="Choose another paint color">Color<input id="custom-color" type="color" value="#a042ff" aria-label="Custom paint color"></label><button id="tool-test" aria-label="Test table" title="Test table">${icon('M6 3l15 9-15 9z')}<span>Test</span></button><button id="tool-gravity" aria-label="Gravity" title="Adjust board gravity">${icon('M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18M8 12l4 5 4-5M12 7v10')}<span>Gravity</span></button><button id="tool-save" aria-label="Save project" title="Save project">${icon('M3 3h18v18H3zM12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10')}<span>Save</span></button></nav></section></main>
<footer><span id="status" role="status"></span><span id="mode-label">BUILD</span></footer>
<aside id="inspector" hidden aria-label="Adjust selection"><button id="close-inspector" aria-label="Close adjustments">×</button><h2 id="inspector-title">Adjust</h2><div id="properties"></div></aside>
<dialog id="table-dialog"><h2>Your table</h2><label>Table name<input id="title" maxlength="60"></label><div class="color-fields"><label>Surface<input id="surface" type="color"></label><label>Outside walls<input id="exterior" type="color"></label></div><label>Appearance<select id="theme"><option value="classic">Classic — faithful construction set</option><option value="polished">Polished — metal, lights and reflections</option></select></label><label>Gravity <output id="gravity-value">1.1</output><input id="gravity" type="range" min="0" max="3" step="0.1" aria-label="Board gravity"></label><label>Sample table<select id="sample"><option value="">Choose a sample…</option>${sampleTables().map((t,i)=>`<option value="${i}">${t.title}</option>`).join('')}</select></label><p>Loading a sample can be undone.</p><button id="load-sample">Load sample</button><button id="apply-table">Apply table settings</button><button data-close="table-dialog">Close</button></dialog>
<dialog id="open-dialog"><h2>Open a table</h2><button id="open-saved">Open saved project</button><button id="open-file">Choose project file</button><button data-close="open-dialog">Cancel</button><p>Save keeps one project in this browser.<br>Project ↓ downloads a portable editing copy.</p></dialog>
<input id="file" type="file" accept="application/json,.json" hidden><div id="toast" role="status"></div>`;
const $=<T extends HTMLElement=HTMLElement>(s:string)=>document.querySelector<T>(s)!;
const canvas=$<HTMLCanvasElement>('#canvas'),ctx=canvas.getContext('2d')!;
let table=emptyWorkbench(),selected:string|undefined,mode:Mode='hand',chosen:string|undefined,paint=colors[2],snap=true,invalid:Table|undefined,guides:{x?:number;y?:number}|undefined;
const backgrounds=$<HTMLCanvasElement>('#background').getContext('2d')!;
const artworkLayers=new ArtworkLayers($('#art-back'),$('#art-front'));
const artHooks={table:()=>table,commit,select:(id:string)=>{selected=id;chosen=undefined;mode='hand';refresh()},message:(s:string)=>{message(s);toast(s)},busy:()=>!!game};
const artControls=artworkControls(canvas,artHooks);
$('#artwork').addEventListener('click',()=>artControls.open());
const pictures=pictureControls({table:()=>table,commit,busy:()=>!!game,message:toast});
const history=new History();let game:Game|undefined,raf=0;
const advanced=advancedControls({table:()=>table,commit,message:toast,busy:()=>!!game});
$('#advanced').addEventListener('click',()=>advanced.open());
const playInput=new FlipperInput((left,right)=>game?.flippers(left,right));
let drag:{before:Table;origin:Point;id:string;vertex?:Vertex;pointer:number}|undefined;
let paletteDrag:{preset:string;start:Point;pointer:number;source:HTMLButtonElement;ghost:HTMLCanvasElement}|undefined;
let toastTimer:ReturnType<typeof setTimeout>;
const label=(p:Part)=>p.kind==='artwork'?(table.assets?.[p.art!.assetId]?.name??'Artwork'):p.boundary?'Outer wall':presets.find(s=>s.id===p.sprite)?.label??palette.find(k=>k.kind===p.kind)!.label;
const behavior:Partial<Record<Part['kind'],string>>={ballTrap:'Holds two balls and serves replacements. The third capture releases all three.',bounceWall:'Bounces the ball back and flashes its lights.',oneWayGate:'Pass through in the arrow direction. The reverse side blocks the ball.',drain:'The ball is lost, just as when it passes the flippers.',upKicker:'Kicks upward when the ball touches its top.',sideKicker:'Kicks sideways when touched from either side.',launcher:'Holds the starting ball until you launch.'};
const current=()=>table.parts.find(p=>p.id===selected);
let activeVertex:Vertex|undefined;
const corners=()=>!chosen&&(mode==='corner'||mode==='hand'&&(current()?.kind==='wall'||current()?.kind==='obstacle'));
function message(text:string){$('#status').textContent=text}
function toast(text:string){clearTimeout(toastTimer);$('#toast').textContent=text;$('#toast').classList.add('show');toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),3200)}
function paintCanvas(updateArtwork=true){const started=performance.now();if(updateArtwork)artworkLayers.sync(table,selected,!!game,game?.flash());else artworkLayers.flash(game?.flash());drawTable(ctx,table,{selected,corners:corners(),activeVertex,handleRadius:6*tableSize(table).width/(canvas.getBoundingClientRect().width||tableSize(table).width),invalid,guides,testing:!!game,gameParts:game?.parts(),balls:game?.ballPositions(),bursts:game?.effects(),elapsed:game?.snapshot().elapsedMs,flash:game?.flash()});if(game){const score=String(game.score()).padStart(8,'0');$('#score').textContent=score;$('#headboard-score').textContent=score;$('#balls').textContent='● '.repeat(game.balls())||'—';$('#headboard-balls').textContent=String(game.balls());const state=game.snapshot();$('#advanced-status').textContent=advancedStatus(state.advanced);audio.sync(state.state==='paused'||state.state==='gameover');$('#game-state').textContent=state.state==='gameover'?'GAME OVER — restart to play again':state.state==='paused'?'PAUSED — Resume when ready':state.canLaunch?'SPACE OR LAUNCH TO START':'MOUSE BUTTONS OR SHIFT · FLIPPERS';$('#pause').textContent=state.state==='paused'?'Resume':'Pause';$<HTMLButtonElement>('#pause').disabled=state.state==='gameover';$<HTMLButtonElement>('#launch').disabled=!state.canLaunch;for(const id of ['left','right'])$<HTMLButtonElement>('#'+id).disabled=state.state==='paused'||state.state==='gameover'}measureRender(canvas,started,!!game)}
function refresh(){
 const size=tableSize(table);$('.stage').style.setProperty('--playfield-ratio',String(size.width/size.height));$('.stage').style.setProperty('--playfield-width',size.width+'px');
 drawBackground(backgrounds,table);pictures.sync();canvas.classList.toggle('polished',table.theme==='polished');paintCanvas();$('#table-title').textContent=table.title;$('#headboard-title').textContent=table.title;$<HTMLButtonElement>('#undo').disabled=!!game||!history.past.length;$<HTMLButtonElement>('#redo').disabled=!!game||!history.future.length;
 document.querySelectorAll<HTMLButtonElement>('button[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===mode&&!chosen)));
 document.querySelectorAll<HTMLButtonElement>('[data-preset]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.preset===chosen)));
 document.querySelectorAll<HTMLButtonElement>('[data-color]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.color===paint)));
 canvas.dataset.mode=chosen?'place':mode;
 const cursorPath=modeInfo[mode][2],cursorSvg='<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path d="'+cursorPath+'" fill="none" stroke="black" stroke-width="4"/><path d="'+cursorPath+'" fill="none" stroke="white" stroke-width="2"/></svg>';
 canvas.style.cursor=chosen?'copy':mode==='corner'?'default':mode==='hand'?'grab':'url("data:image/svg+xml,'+encodeURIComponent(cursorSvg)+'") 4 4, crosshair';$('#mode-label').textContent=game?'PLAY':chosen?'PLACE':modeInfo[mode][0].toUpperCase();
 const p=current();$('#selection-name').textContent=p?label(p):'Your construction set';$('#selection-actions').hidden=!p;
 $('#selection-help').textContent=p?(p.wallLoop?'Separate wall loop — drag its points; Stretch adds more.':p.boundary?'Use corner tools to change the outline.':behavior[p.kind]??(p.kind==='artwork'?`${p.art!.role} · Adjust for artwork controls`:p.kind==='light'?'Decoration only — the ball passes through.':p.kind==='obstacle'?'Solid shape — use corner tools to sculpt it.':['rollover','spinner'].includes(p.kind)?`Ball passes through · ${p.score} points per crossing`:`${p.score} points · ready to play`)):'Shape the walls. Add a few parts. Try it.';
 $<HTMLButtonElement>('#delete').disabled=!!p?.boundary;$<HTMLButtonElement>('#duplicate').disabled=p?.kind==='ball';
 const list=$<HTMLSelectElement>('#part-list');list.replaceChildren(new Option('Choose a part',''),...table.parts.map((p,i)=>new Option(`${i+1}. ${label(p)}`,p.id)));list.value=selected??'';
 if(!$('#inspector').hidden)renderProperties();
}
function commit(change:(t:Table)=>void){if(game)return false;const before=structuredClone(table);change(table);for(const p of before.parts)if(!table.parts.some(q=>q.id===p.id))removeReferences(table,p.id);if(!validateTable(table)){table=before;toast('That change has invalid geometry or a missing rule / asset reference.');refresh();return false}history.record(before,table);refresh();return true}
function setMode(next:Mode){if(game)return;mode=next;chosen=undefined;invalid=undefined;activeVertex=undefined;message(modeInfo[mode][1]);refresh()}
function grid(n:number){return snap?Math.round(n/10)*10:Math.round(n)}
function coords(e:{clientX:number;clientY:number}):Point{const {width:W,height:H}=tableSize(table);const r=canvas.getBoundingClientRect();return{x:(e.clientX-r.left)*W/r.width,y:(e.clientY-r.top)*H/r.height}}
function inCanvas(e:{clientX:number;clientY:number}){const r=canvas.getBoundingClientRect();return e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom}
function radius(){return 12*tableSize(table).width/canvas.getBoundingClientRect().width}
function hit(point:Point,shapesOnly=false){const rank=(p:Part)=>p.kind==='artwork'?(p.art?.layer==='front'?2:0):1;return [...table.parts].reverse().sort((a,b)=>rank(b)-rank(a)).find(p=>{
 if(shapesOnly&&!['wall','obstacle'].includes(p.kind))return false;
 if(p.kind==='wall')return project(point,p,end(p)).distance<radius();
 if(p.wallLoop){const v=shape(p);return v.some((a,i)=>project(point,a,v[(i+1)%v.length]).distance<radius())}
 if(p.sprite)return inside(point,shape(p));
 if(['artwork','obstacle','slingshot','target','leftFlipper','rightFlipper','launcher','drain'].includes(p.kind))return inside(point,shape(p));
 return Math.hypot(p.x-point.x,p.y-point.y)<(p.r??22)*(p.scale??1)+5;
})}
function nearestVertex(point:Point){return vertices(table).map(v=>({...v,d:Math.hypot(v.point.x-point.x,v.point.y-point.y)})).filter(v=>v.d<radius()).sort((a,b)=>Math.abs(a.d-b.d)>.001?a.d-b.d:Number(b.id===activeVertex?.id&&b.index===activeVertex?.index)-Number(a.id===activeVertex?.id&&a.index===activeVertex?.index))[0]}
function align(point:Point,id?:string){const out={x:grid(point.x),y:grid(point.y)};guides={};if(snap){const others=table.parts.filter(p=>p.id!==id&&!p.boundary);for(const axis of ['x','y'] as const){const close=others.map(p=>p[axis]).sort((a,b)=>Math.abs(a-point[axis])-Math.abs(b-point[axis]))[0];if(close!==undefined&&Math.abs(close-point[axis])<5){out[axis]=close;guides[axis]=close}}}return out}
function place(id:string,point:Point){if(game)return;const {width:W,height:H}=tableSize(table);const ok=commit(t=>{
 const p=fromPreset(id,grid(Math.max(45,Math.min(W-80,point.x))),grid(Math.max(50,Math.min(H-50,point.y))));
 if(p.kind==='wall'){p.color=t.wallColor;const dx=Math.min(0,W-8-Math.max(p.x,p.x2!)),dy=Math.min(0,H-8-Math.max(p.y,p.y2!));p.x+=dx;p.x2!+=dx;p.y+=dy;p.y2!+=dy}
 if(p.kind==='ball')t.parts=t.parts.filter(q=>q.kind!=='ball');t.parts.push(p);selected=p.id;
 });if(ok&&current()){chosen=undefined;activeVertex=undefined;mode='hand';message(current()!.kind==='wall'||current()!.wallLoop?`${label(current()!)} placed — drag a point; Stretch adds more points`:`${label(current()!)} placed — drag to move, or choose Adjust`);refresh()}}
function movePaint(point:Point){const p=hit(point);commit(t=>{if(p){paintConnected(t,p.id,paint);selected=p.id}else if(inside(point,perimeter(t))){paintSurface(t,point,paint);selected=undefined}else{t.exterior=paint;t.parts.filter(p=>p.boundary).forEach(p=>p.color=paint);selected=undefined}});message(p?`${label(p)} painted`:'Table painted')}
canvas.addEventListener('pointerdown',e=>{
 if(game||e.button!==0)return;e.preventDefault();canvas.focus();const point=coords(e);
 if(chosen){place(chosen,point);return}if(mode==='paint'){movePaint(point);return}
 if(mode==='hammer'){selected=hit(point)?.id;if(selected)removeSelected();return}
 if(mode==='cut'){const p=hit(point,true);if(!p||p.kind!=='wall'){message('Click a wall barrier where you want to cut it');return}const id=uid();let split=false;commit(t=>{split=splitBarrier(t,p.id,point,id);if(split)selected=id});message(split?'Barrier split into two — use the arrow to shape either edge':'Cut farther from the end of the barrier');return}
 // Point handles take precedence over whole-part movement in both existing tools.
 let v:Vertex|undefined=nearestVertex(point);
 if(mode==='corner'&&!v){
  const p=hit(point,true);if(p){let inserted:Vertex|undefined;const ok=commit(t=>{inserted=addCorner(t,p.id,point,uid());if(inserted){selected=p.id;activeVertex=inserted}});if(ok)v=inserted}
 }
 if(v){selected=v.id;activeVertex=v;drag={before:structuredClone(table),origin:point,id:v.id,vertex:v,pointer:e.pointerId};canvas.setPointerCapture(e.pointerId);message('Drag this point — the other points stay fixed');refresh();return}
 const p=hit(point);selected=p?.id;activeVertex=undefined;
 if(mode==='corner'||p?.kind==='wall'||p?.wallLoop){message(mode==='corner'?'Click a wall edge to add a point, or drag an existing point':'Drag a point to reshape this wall. Stretch adds more points.');refresh();return}
 if(p){drag={before:structuredClone(table),origin:point,id:p.id,pointer:e.pointerId};canvas.setPointerCapture(e.pointerId)}refresh();
});
canvas.addEventListener('pointermove',e=>{
 if(!drag||e.pointerId!==drag.pointer||game)return;const point=coords(e),candidate=structuredClone(drag.before);
 if(drag.vertex)moveVertex(candidate,drag.vertex,align(point,drag.id));else{const old=candidate.parts.find(p=>p.id===drag!.id)!;const target=align({x:old.x+point.x-drag.origin.x,y:old.y+point.y-drag.origin.y},drag.id);translate(candidate,drag.id,target.x-old.x,target.y-old.y)}
 if(validGeometry(candidate)){table=candidate;invalid=undefined;message(drag.vertex?'Release to keep this wall shape':'Release to place the part')}else{invalid=candidate;message('Red shape is invalid — move back inside without crossing edges')}
 drawBackground(backgrounds,table);pictures.sync();paintCanvas();
});
function finishDrag(cancel=false){if(!drag)return;if(cancel)table=drag.before;else history.record(drag.before,table);const pointer=drag.pointer;drag=undefined;invalid=undefined;guides=undefined;if(canvas.hasPointerCapture(pointer))canvas.releasePointerCapture(pointer);message(cancel?'Move cancelled':modeInfo[mode][1]);refresh()}
canvas.addEventListener('pointerup',()=>finishDrag());canvas.addEventListener('pointercancel',()=>finishDrag(true));canvas.addEventListener('lostpointercapture',()=>{if(drag)finishDrag(true)});
canvas.addEventListener('dblclick',()=>{if(!game&&current()&&mode!=='corner')openInspector()});
$('#parts').innerHTML=presets.map(p=>`<button class="part" data-preset="${p.id}" title="${p.label}" aria-label="${p.label}"><canvas aria-hidden="true"></canvas><span>${p.label}</span></button>`).join('');
document.querySelectorAll<HTMLButtonElement>('[data-preset]').forEach(b=>{
 const [x,y,w,h]=referenceSprites[b.dataset.preset!].rect;
 Object.assign(b.style,{left:`${(x-328)/180*100}%`,top:`${(y-4)/342*100}%`,width:`${(w+8)/180*100}%`,height:`${(h+8)/342*100}%`});
});
window.addEventListener('pinball-art-ready',()=>{document.querySelectorAll<HTMLButtonElement>('[data-preset]').forEach(b=>drawThumbnail(b.querySelector('canvas')!,fromPreset(b.dataset.preset!,0,0),false));paintCanvas(false)});
let suppressClick=false;
type DragPosition={pointerId:number;clientX:number;clientY:number};
function startPaletteDrag(b:HTMLButtonElement,e:DragPosition,capture:boolean){
 suppressClick=false;const ghost=document.createElement('canvas'),source=b.querySelector('canvas')!;
 ghost.width=source.width;ghost.height=source.height;ghost.getContext('2d')!.drawImage(source,0,0);ghost.className='palette-ghost';document.body.append(ghost);
 ghost.style.width=`${source.width*2}px`;ghost.style.height=`${source.height*2}px`;
 paletteDrag={preset:b.dataset.preset!,start:{x:e.clientX,y:e.clientY},pointer:e.pointerId,source:b,ghost};
 if(capture)b.setPointerCapture(e.pointerId);movePaletteGhost(e);message('Drag onto the table and release to place this piece');
}
function movePaletteGhost(e:DragPosition){
 const drag=paletteDrag;if(!drag||drag.pointer!==e.pointerId)return;
 drag.ghost.style.left=`${e.clientX-drag.ghost.width}px`;drag.ghost.style.top=`${e.clientY-drag.ghost.height*2-15}px`;
 const over=inCanvas(e);canvas.classList.toggle('drag-over',over);drag.ghost.classList.toggle('over-table',over);
}
function endPaletteDrag(e:DragPosition,cancel=false){
 const drag=paletteDrag;if(!drag||drag.pointer!==e.pointerId)return;
 const moved=Math.hypot(e.clientX-drag.start.x,e.clientY-drag.start.y)>8;
 paletteDrag=undefined;drag.ghost.remove();canvas.classList.remove('drag-over');
 if(drag.source.hasPointerCapture(e.pointerId))drag.source.releasePointerCapture(e.pointerId);
 if(!cancel&&moved&&inCanvas(e)){place(drag.preset,coords(e));suppressClick=true}
 else if(moved){suppressClick=true;message('Drop a piece inside the table, or tap a piece then tap the table')}
}
window.addEventListener('pointermove',movePaletteGhost);
window.addEventListener('pointerup',e=>endPaletteDrag(e));
window.addEventListener('pointercancel',e=>endPaletteDrag(e,true));
document.querySelectorAll<HTMLButtonElement>('[data-preset]').forEach(b=>{
 drawThumbnail(b.querySelector('canvas')!,fromPreset(b.dataset.preset!,0,0),false);
 const select=()=>{if(game)return;chosen=b.dataset.preset;message(`Place ${b.title.toLowerCase()} — click or tap the table`);refresh()};
 b.addEventListener('pointerdown',e=>{if(game||e.button!==0||e.pointerType==='touch')return;startPaletteDrag(b,e,true)});
 b.addEventListener('touchstart',e=>{if(game)return;e.preventDefault();const touch=e.changedTouches[0];startPaletteDrag(b,{pointerId:touch.identifier+10000,clientX:touch.clientX,clientY:touch.clientY},false)},{passive:false});
 b.addEventListener('touchmove',e=>{const drag=paletteDrag;if(!drag)return;const touch=Array.from(e.changedTouches).find(t=>t.identifier+10000===drag.pointer);if(!touch)return;e.preventDefault();movePaletteGhost({pointerId:drag.pointer,clientX:touch.clientX,clientY:touch.clientY})},{passive:false});
 b.addEventListener('touchend',e=>{const drag=paletteDrag;if(!drag)return;const touch=Array.from(e.changedTouches).find(t=>t.identifier+10000===drag.pointer);if(!touch)return;e.preventDefault();const moved=Math.hypot(touch.clientX-drag.start.x,touch.clientY-drag.start.y)>8;endPaletteDrag({pointerId:drag.pointer,clientX:touch.clientX,clientY:touch.clientY});if(!moved)select()},{passive:false});
 b.addEventListener('touchcancel',e=>{const drag=paletteDrag;if(!drag)return;const touch=Array.from(e.changedTouches).find(t=>t.identifier+10000===drag.pointer);if(touch)endPaletteDrag({pointerId:drag.pointer,clientX:touch.clientX,clientY:touch.clientY},true)});
 b.addEventListener('click',()=>{if(suppressClick){suppressClick=false;return}select()});
 b.addEventListener('mouseenter',()=>$('#part-help').textContent=b.title);b.addEventListener('focus',()=>$('#part-help').textContent=b.title);
});
document.querySelectorAll<HTMLButtonElement>('button[data-mode]').forEach(b=>b.addEventListener('click',()=>setMode(b.dataset.mode as Mode)));
document.querySelectorAll<HTMLButtonElement>('[data-color]').forEach(b=>b.addEventListener('click',()=>{paint=b.dataset.color!;$<HTMLInputElement>('#custom-color').value=paint;setMode('paint')}));
$('#custom-color').addEventListener('input',e=>{paint=(e.target as HTMLInputElement).value;setMode('paint')});
$('#snap').addEventListener('change',e=>snap=(e.target as HTMLInputElement).checked);
$('#part-list').addEventListener('change',e=>{selected=(e.target as HTMLSelectElement).value||undefined;refresh()});
function duplicate(){const p=current();if(!p||p.kind==='ball')return;commit(t=>{const q=structuredClone(p);q.id=uid();q.boundary=false;delete q.wallGroup;delete q.wallNodes;t.parts.push(q);translate(t,q.id,20,20);selected=q.id});message('Copy placed — drag it to its new position')}
function removeSelected(){const p=current();if(!p||game)return;if(p.boundary){toast('Use the arrow to reshape the outer area.');return}commit(t=>{t.parts=t.parts.filter(q=>q.id!==p.id);removeReferences(t,p.id);selected=undefined});message('Piece removed — Undo restores it')}
$('#duplicate').addEventListener('click',duplicate);$('#delete').addEventListener('click',removeSelected);
function undo(){if(game)return;finishDrag(true);table=history.undo(table);selected=undefined;refresh();message('Undo — previous table restored')}
function redo(){if(game)return;table=history.redo(table);selected=undefined;refresh();message('Redo — change restored')}
$('#undo').addEventListener('click',undo);$('#redo').addEventListener('click',redo);
function openInspector(){if(!current())return;$('#inspector').hidden=false;renderProperties()}
$('#tune').addEventListener('click',openInspector);$('#close-inspector').addEventListener('click',()=>$('#inspector').hidden=true);
function renderProperties(){const p=current();if(!p){$('#inspector').hidden=true;return}$('#inspector-title').textContent=label(p);
 $('#properties').innerHTML=`${p.kind==='artwork'?'':'<label>Color<input id="part-color" type="color"></label>'}<div class="field-row"><label>X<input id="part-x" type="number" min="0" max="${tableSize(table).width}"></label><label>Y<input id="part-y" type="number" min="0" max="${tableSize(table).height}"></label></div>${p.kind==='wall'?'<p>Use the arrow to reshape this wall.</p>':'<label>Rotation<input id="part-rotation" type="range" min="-180" max="180" step="5"></label>'}${!['ball','wall'].includes(p.kind)?'<label>Size<input id="part-size" type="range" min="40" max="200" step="5"></label>':''}<label>Points<input id="part-score" type="number" min="0" max="1000000000" step="10"></label>`;
 for(const [name,value] of [['color',p.color],['x',p.x],['y',p.y],['rotation',p.rotation],['size',(p.scale??1)*100],['score',p.score]] as const){const el=document.querySelector<HTMLInputElement>(`#part-${name}`);if(!el)continue;el.value=String(value);el.addEventListener('change',()=>{const value=name==='color'?el.value:Number(el.value);if(typeof value==='number'&&!Number.isFinite(value))return;commit(t=>{const q=t.parts.find(q=>q.id===p.id)!;if(name==='x'||name==='y')translate(t,q.id,name==='x'?Number(value)-q.x:0,name==='y'?Number(value)-q.y:0);else if(name==='size')q.scale=Math.max(.4,Math.min(2,Number(value)/100));else if(name==='color')q.color=String(value);else if(name==='score')q.score=Math.max(0,Math.min(1e9,Number(value)));else q.rotation=Number(value)})})}
 const enabled=document.createElement('label');enabled.innerHTML='<input id="part-enabled" type="checkbox"> Active at start';const check=enabled.querySelector('input')!;check.checked=p.enabled!==false;check.onchange=()=>commit(t=>{t.parts.find(q=>q.id===p.id)!.enabled=check.checked});if(!p.boundary&&!['ball','launcher'].includes(p.kind)){const details=document.createElement('details'),summary=document.createElement('summary');summary.textContent='Advanced behavior';details.append(summary,enabled);$('#properties').append(details)}
 artworkProperties($('#properties'),p,artHooks);
}
function openTableSettings(){if(game)return;$<HTMLInputElement>('#gravity').value=String(table.gravity??1.1);$('#gravity-value').textContent=String(table.gravity??1.1);$<HTMLSelectElement>('#theme').value=table.theme??'classic';$<HTMLInputElement>('#title').value=table.title;$<HTMLInputElement>('#surface').value=table.surface;$<HTMLInputElement>('#exterior').value=table.exterior??colors[5];$<HTMLDialogElement>('#table-dialog').showModal()}
$('#settings').addEventListener('click',openTableSettings);
$('#tool-gravity').addEventListener('click',()=>{openTableSettings();$('#gravity').focus()});
$('#gravity').addEventListener('input',()=>$('#gravity-value').textContent=$<HTMLInputElement>('#gravity').value);
$('#apply-table').addEventListener('click',()=>{commit(t=>{t.gravity=Number($<HTMLInputElement>('#gravity').value);t.theme=$<HTMLSelectElement>('#theme').value as 'classic'|'polished';t.title=$<HTMLInputElement>('#title').value.trim()||'My Pinball Table';const surface=$<HTMLInputElement>('#surface').value;if(surface!==t.surface)delete t.surfacePaint;t.surface=surface;t.exterior=$<HTMLInputElement>('#exterior').value;t.parts.filter(p=>p.boundary).forEach(p=>p.color=t.exterior!)});$<HTMLDialogElement>('#table-dialog').close()});
$('#load-sample').addEventListener('click',()=>{const value=$<HTMLSelectElement>('#sample').value;if(value==='')return;replaceTable(sampleTables()[Number(value)]);$<HTMLDialogElement>('#table-dialog').close()});
document.querySelectorAll<HTMLButtonElement>('[data-close]').forEach(b=>b.addEventListener('click',()=>$<HTMLDialogElement>('#'+b.dataset.close).close()));
function replaceTable(next:Table){if(game)return;history.record(table,next);table=structuredClone(next);selected=undefined;chosen=undefined;activeVertex=undefined;mode='hand';refresh();message(modeInfo.hand[1])}
$('#new').addEventListener('click',()=>replaceTable(emptyWorkbench()));
$('#save').addEventListener('click',async()=>{try{await saveProject(structuredClone(table));toast('Table and artwork saved in this browser.')}catch(e){toast('Save failed. Download Project ↓ to keep a copy. '+String(e))}});
$('#tool-save').addEventListener('click',()=>$('#save').click());
$('#open').addEventListener('click',()=>{if(game)return;$<HTMLDialogElement>('#open-dialog').showModal()});
$('#open-saved').addEventListener('click',async()=>{try{const value=await loadProject();if(!value){toast('No saved project in this browser yet.');return}await checkArtwork(value);replaceTable(value);$<HTMLDialogElement>('#open-dialog').close();toast('Saved project and artwork opened')}catch(e){toast('Could not open the saved project. '+String(e))}});
$('#open-file').addEventListener('click',()=>{$<HTMLDialogElement>('#open-dialog').close();$('#file').click()});
$('#file').addEventListener('change',async e=>{const input=e.target as HTMLInputElement,file=input.files?.[0];if(!file)return;try{const value=JSON.parse(await file.text());if(!validateTable(value))throw Error('Invalid project data');await checkArtwork(value);if(!game){replaceTable(value);toast('Project file opened')}}catch{toast('Could not read a valid table. Your current table is unchanged.')}finally{input.value=''}});
$('#export').addEventListener('click',()=>{const url=URL.createObjectURL(new Blob([JSON.stringify(table,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download=`${table.title.toLowerCase().replace(/[^a-z0-9]+/g,'-')}.pinball.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Editable project downloaded. Use DOWNLOAD MY PINBALL GAME for a playable ZIP.')});
const audio=new GameAudio(()=>$<HTMLInputElement>('#sound').checked,message);
bindMouseFlippers(canvas,playInput,()=>!!game,()=>{void audio.unlock()});
$('#sound').addEventListener('change',()=>{if($<HTMLInputElement>('#sound').checked)void audio.unlock();const state=game?.snapshot().state;audio.sync(!game||state==='paused'||state==='gameover')});
const sound=audio.hit;
let exporting=false,exportUrl:string|undefined;
$('#download-game').addEventListener('click',async()=>{
 if(exporting)return;finishDrag();if(game)pauseTest(true);const snapshot=structuredClone(table),button=$<HTMLButtonElement>('#download-game');
 exporting=true;button.disabled=true;$('#download-status').textContent='Checking artwork…';
 try{
  await checkArtwork(snapshot);
  const result=await createGameZip(snapshot,playerBundle,percent=>$('#download-status').textContent='Packing your game… '+percent+'%');
  if(exportUrl)URL.revokeObjectURL(exportUrl);$('#download-status').querySelector('a')?.remove();
  exportUrl=URL.createObjectURL(new Blob([new Uint8Array(result.bytes).buffer],{type:'application/zip'}));const link=document.createElement('a');link.href=exportUrl;link.download=result.filename;link.textContent='Save ZIP again';
  $('#download-status').textContent=result.filename+' ready · '+result.fileCount+' files · '+result.assetCount+' images · '+result.soundCount+' sounds · ';$('#download-status').append(link);link.click();
  toast('Your game is ready. Extract the whole ZIP and open index.html.');
 }catch(error){$('#download-status').textContent='Export failed: '+(error instanceof Error?error.message:String(error));toast('Export could not finish. Your editable table is unchanged.')}
 finally{exporting=false;button.disabled=false}
});
function playUI(on:boolean){if(on){artControls.close();advanced.close()}$('#build-box').hidden=on;$('#scoreboard').hidden=!on;$('#touch-play').hidden=!on;$('.tools').hidden=on;$('#inspector').hidden=true;$('#test').textContent=on?'■ Back to Build':'▶ Test';for(const id of ['new','open','settings'])$<HTMLButtonElement>('#'+id).disabled=on;$('#game-title').textContent=table.title;refresh()}
function startTest(){
 if(game)return;finishDrag();playInput.clear();chosen=undefined;
 audio.configure(table);void audio.unlock();audio.sync(false);
 game=createGame(table,()=>{},sound,audio.sound);playUI(true);canvas.focus();
 message('Mouse buttons or Shift keys: flippers · Space: launch · Escape: build');
 let last=performance.now();
 const loop=(now:number)=>{if(!game)return;const started=performance.now();game.step(now-last);last=now;measureSimulation(canvas,started,game);paintCanvas(false);raf=requestAnimationFrame(loop)};
 raf=requestAnimationFrame(loop);
}
function stopTest(){if(!game)return;cancelAnimationFrame(raf);playInput.clear();game.stop();audio.stop();game=undefined;playUI(false);message('Back to building — your table is exactly as you left it')}
function pauseTest(paused:boolean){if(!game||game.balls()===0)return;playInput.clear();game.pause(paused);if(!paused){void audio.unlock();canvas.focus()}paintCanvas(false)}
$('#test').addEventListener('click',()=>game?stopTest():startTest());$('#tool-test').addEventListener('click',startTest);$('#back').addEventListener('click',stopTest);
$('#restart').addEventListener('click',()=>{playInput.clear();game?.restart();audio.configure(table);void audio.unlock();audio.sync(false);canvas.focus();paintCanvas(false)});
$('#pause').addEventListener('click',()=>pauseTest(game?.snapshot().state!=='paused'));
for(const id of ['left','right','launch'] as const){
 const b=$<HTMLButtonElement>('#'+id);
 b.addEventListener('pointerdown',e=>{e.preventDefault();void audio.unlock();b.setPointerCapture(e.pointerId);if(id==='launch')game?.launch();else playInput.press('pointer-'+e.pointerId,id)});
 const release=(e:PointerEvent)=>playInput.release('pointer-'+e.pointerId);
 b.addEventListener('pointerup',release);b.addEventListener('pointercancel',release);b.addEventListener('lostpointercapture',release);
 b.addEventListener('keydown',e=>{if(e.code!=='Space'&&e.code!=='Enter')return;e.preventDefault();e.stopPropagation();if(!e.repeat){if(id==='launch')game?.launch();else playInput.press('button-'+id,id)}});
 b.addEventListener('keyup',e=>{if(e.code!=='Space'&&e.code!=='Enter')return;e.preventDefault();e.stopPropagation();playInput.release('button-'+id)});
 b.addEventListener('blur',()=>playInput.release('button-'+id));
}
window.addEventListener('blur',()=>{pauseTest(true);finishDrag(true)});
document.addEventListener('visibilitychange',()=>{if(document.hidden)pauseTest(true)});
document.addEventListener('keydown',e=>{
 if((e.target as HTMLElement).matches('input,select,textarea')||document.querySelector('dialog[open]'))return;
 if(game){if(['ShiftLeft','ShiftRight','Space'].includes(e.code)&&!e.repeat)void audio.unlock();if(e.code==='ShiftLeft')playInput.press('key-left','left');if(e.code==='ShiftRight')playInput.press('key-right','right');if(e.code==='Space'){e.preventDefault();if(!e.repeat)game.launch()}if(e.key==='Escape')stopTest();return}
 if(e.key==='Escape'){advanced.close();artControls.close();finishDrag(true);chosen=undefined;selected=undefined;$('#inspector').hidden=true;setMode('hand')}
 if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='z'){e.preventDefault();e.shiftKey?redo():undo()}
 if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='y'){e.preventDefault();redo()}
 if(e.key==='Delete'||e.key==='Backspace'){e.preventDefault();removeSelected()}
 const keys:Record<string,Mode>={h:'hand',v:'corner',x:'cut',d:'hammer',p:'paint'};if(!e.ctrlKey&&!e.metaKey&&keys[e.key.toLowerCase()])setMode(keys[e.key.toLowerCase()]);
});
document.addEventListener('keyup',e=>{if(e.code==='ShiftLeft')playInput.release('key-left');if(e.code==='ShiftRight')playInput.release('key-right')});
message(modeInfo.hand[1]);refresh();
