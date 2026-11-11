// Independent input sources prevent one finger/key from releasing another.
export class FlipperInput {
  private sources=new Map<string,'left'|'right'>();
  constructor(private changed:(left:boolean,right:boolean)=>void) {}
  press(source:string,side:'left'|'right'){this.sources.set(source,side);this.emit()}
  release(source:string){this.sources.delete(source);this.emit()}
  clear(){this.sources.clear();this.emit()}
  private emit(){const sides=[...this.sources.values()];this.changed(sides.includes('left'),sides.includes('right'))}
}

// Mouse events include both button presses when left and right are held together.
// Releases belong to the window so dragging off the board cannot stick a flipper.
export function bindMouseFlippers(canvas:HTMLCanvasElement,input:FlipperInput,playing:()=>boolean,gesture:()=>void){
 const held=new Set<number>();
 const release=(button:number)=>{if(held.delete(button))input.release(button===0?'mouse-left':'mouse-right')};
 const down=(e:MouseEvent)=>{
  if(!playing()||(e.button!==0&&e.button!==2))return;
  e.preventDefault();canvas.focus();gesture();held.add(e.button);
  input.press(e.button===0?'mouse-left':'mouse-right',e.button===0?'left':'right');
 };
 const up=(e:MouseEvent)=>release(e.button);
 const move=(e:MouseEvent)=>{for(const button of held)if(!(e.buttons&(button===0?1:2)))release(button)};
 const clear=()=>{for(const button of held)release(button)};
 const menu=(e:MouseEvent)=>{if(playing())e.preventDefault()};
 canvas.addEventListener('mousedown',down);canvas.addEventListener('contextmenu',menu);
 window.addEventListener('mouseup',up);window.addEventListener('mousemove',move);window.addEventListener('blur',clear);
 return ()=>{clear();canvas.removeEventListener('mousedown',down);canvas.removeEventListener('contextmenu',menu);window.removeEventListener('mouseup',up);window.removeEventListener('mousemove',move);window.removeEventListener('blur',clear)};
}
