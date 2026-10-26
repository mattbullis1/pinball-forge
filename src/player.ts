import './player.css';
import {readGamePackage} from './game-package';
import {createGame,Game} from './physics';
import {drawBackground,drawTable} from './draw';
import {ArtworkLayers,checkArtwork} from './artwork';
import {FlipperInput} from './play-input';
import {GameAudio} from './game-audio';
import {measureRender,measureSimulation} from './diagnostics';

async function boot(){
 const table=readGamePackage((window as Window&{PINBALL_FORGE_GAME?:unknown}).PINBALL_FORGE_GAME);
 await checkArtwork(table);
 const root=document.querySelector<HTMLElement>('#player')!;
 root.innerHTML=`<header><p class="brand">PINBALL FORGE</p><h1 id="title"></h1><button id="fullscreen">Fullscreen</button></header>
 <main class="layout"><section class="stage" aria-label="Pinball game"><div class="board"><canvas id="background" width="560" height="840" aria-hidden="true"></canvas><div class="art-layer" id="art-back" aria-hidden="true"></div><canvas id="canvas" width="560" height="840" tabindex="0" aria-label="Pinball playfield"></canvas><div class="art-layer" id="art-front" aria-hidden="true"></div>
 <section class="overlay" id="welcome" aria-label="Title screen"><p class="eyebrow">YOUR PINBALL GAME</p><h2 id="welcome-title"></h2><button id="play" class="primary">Play</button><p>Left Shift · Right Shift<br>Space to launch</p><p class="small">Or use the touch buttons below.</p></section>
 <section class="overlay" id="gameover" aria-label="Game over" hidden><h2>GAME OVER</h2><p>FINAL SCORE</p><output id="final-score">0</output><button id="play-again" class="primary">Play again</button></section></div>
 <div id="touch-play" aria-label="Touch controls"><button id="left" disabled>Left flipper</button><button id="launch" disabled>Launch</button><button id="right" disabled>Right flipper</button></div></section>
 <aside id="scoreboard" aria-label="Scoreboard"><div class="readout"><p>SCORE</p><output id="score">00000000</output><p>BALLS REMAINING</p><output id="balls">● ● ●</output></div><p id="game-state" role="status">Ready to play</p><button id="pause" disabled>Pause</button><button id="restart" disabled>Restart</button><label class="sound"><input id="sound" type="checkbox" checked> Sound</label><p class="small">Left Shift / Right Shift: flippers<br>Space: launch<br>Three balls. Make them count.</p></aside></main><footer><span id="message" role="status"></span><span>Made with PINBALL FORGE</span></footer>`;
 root.classList.toggle('polished',table.theme==='polished');
 const $=<T extends HTMLElement=HTMLElement>(id:string)=>root.querySelector<T>('#'+id)!;
 const canvas=$<HTMLCanvasElement>('canvas'),ctx=canvas.getContext('2d')!;
 $('title').textContent=table.title;$('welcome-title').textContent=table.title;
 document.title=table.title+' — PINBALL FORGE';
 const audio=new GameAudio(()=>$<HTMLInputElement>('sound').checked);
 const artwork=new ArtworkLayers($('art-back'),$('art-front'));
 drawBackground($<HTMLCanvasElement>('background').getContext('2d')!,table);
 artwork.sync(table,undefined,true);
 let game:Game|undefined,last=performance.now(),over=false;
 const input=new FlipperInput((left,right)=>game?.flippers(left,right));
 const text=(id:string,value:string)=>{if($(id).textContent!==value)$(id).textContent=value};
 function render(){
  const started=performance.now();
  drawTable(ctx,table,{testing:!!game,gameParts:game?.parts(),ball:game?.ball(),flash:game?.flash()});artwork.flash(game?.flash());
  if(game){const state=game.snapshot();root.dataset.state=state.state;
   text('score',String(state.score).padStart(8,'0'));text('balls','● '.repeat(state.balls)||'—');
   text('game-state',state.state==='gameover'?'Game over':state.state==='paused'?'Paused — choose Resume':state.canLaunch?'Space or Launch to start':'Keep the ball in play');
   text('pause',state.state==='paused'?'Resume':'Pause');
   $<HTMLButtonElement>('pause').disabled=state.state==='gameover';$<HTMLButtonElement>('launch').disabled=!state.canLaunch;
   for(const side of ['left','right'])$<HTMLButtonElement>(side).disabled=state.state==='paused'||state.state==='gameover';
   if(state.state==='gameover'&&!over){over=true;$('gameover').hidden=false;text('final-score',String(state.score));$('play-again').focus();input.clear()}
  }else root.dataset.state='title';
  measureRender(canvas,started,!!game);
 }
 function start(){
  input.clear();void audio.unlock();if(game)game.restart();else game=createGame(table,()=>{},audio.hit);
  over=false;$('welcome').hidden=true;$('gameover').hidden=true;$<HTMLButtonElement>('restart').disabled=false;
  last=performance.now();canvas.focus();render();
 }
 function pause(value:boolean){if(!game||!game.balls())return;input.clear();game.pause(value);last=performance.now();if(!value){void audio.unlock();canvas.focus()}render()}
 $('play').addEventListener('click',start);$('play-again').addEventListener('click',start);$('restart').addEventListener('click',start);
 $('pause').addEventListener('click',()=>pause(game?.snapshot().state!=='paused'));
 for(const id of ['left','right','launch'] as const){const button=$<HTMLButtonElement>(id);
  button.addEventListener('pointerdown',e=>{e.preventDefault();button.setPointerCapture(e.pointerId);if(id==='launch')game?.launch();else input.press('pointer-'+e.pointerId,id)});
  const release=(e:PointerEvent)=>input.release('pointer-'+e.pointerId);
  button.addEventListener('pointerup',release);button.addEventListener('pointercancel',release);button.addEventListener('lostpointercapture',release);
  button.addEventListener('keydown',e=>{if(e.code!=='Space'&&e.code!=='Enter')return;e.preventDefault();e.stopPropagation();if(!e.repeat){if(id==='launch')game?.launch();else input.press('button-'+id,id)}});
  button.addEventListener('keyup',e=>{if(e.code==='Space'||e.code==='Enter'){e.preventDefault();e.stopPropagation();input.release('button-'+id)}});
  button.addEventListener('blur',()=>input.release('button-'+id));
 }
 document.addEventListener('keydown',e=>{
  if(!game||(e.target as HTMLElement).matches('input,select,textarea'))return;
  if(e.code==='ShiftLeft')input.press('key-left','left');if(e.code==='ShiftRight')input.press('key-right','right');
  if(e.code==='Space'&&!(e.target as HTMLElement).closest('button')){e.preventDefault();if(!e.repeat)game.launch()}
  if(e.code==='Escape'&&!document.fullscreenElement)pause(true);
 });
 document.addEventListener('keyup',e=>{if(e.code==='ShiftLeft')input.release('key-left');if(e.code==='ShiftRight')input.release('key-right')});
 window.addEventListener('blur',()=>pause(true));document.addEventListener('visibilitychange',()=>{if(document.hidden)pause(true)});
 $('fullscreen').hidden=!document.fullscreenEnabled;
 $('fullscreen').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await root.requestFullscreen();text('message','')}catch{text('message','Fullscreen is unavailable in this browser. You can still play in this window.')}});
 document.addEventListener('fullscreenchange',()=>text('fullscreen',document.fullscreenElement?'Exit fullscreen':'Fullscreen'));
 function frame(now:number){if(game){const started=performance.now();game.step(now-last);measureSimulation(canvas,started,game)}last=now;render();requestAnimationFrame(frame)}
 render();$('play').focus();requestAnimationFrame(frame);
}
void boot().catch(error=>{const message=document.querySelector<HTMLElement>('#load-message');if(message)message.textContent='This game could not start.';const output=document.querySelector<HTMLElement>('#load-error');if(output){output.hidden=false;output.textContent=String(error instanceof Error?error.message:error)+' Extract the complete ZIP and keep its files together.'}});
