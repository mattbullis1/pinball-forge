import {afterEach,expect,it,vi} from 'vitest';
import {bindMouseFlippers,FlipperInput} from './play-input';
afterEach(()=>vi.unstubAllGlobals());
function rig(){
 const canvas=Object.assign(new EventTarget(),{focus:vi.fn()}),win=new EventTarget(),changed=vi.fn(),gesture=vi.fn(),input=new FlipperInput(changed);
 let playing=true;vi.stubGlobal('window',win);
 const unbind=bindMouseFlippers(canvas as unknown as HTMLCanvasElement,input,()=>playing,gesture);
 const event=(target:EventTarget,type:string,button=0,buttons=0)=>{const e=Object.assign(new Event(type,{cancelable:true}),{button,buttons});target.dispatchEvent(e);return e};
 return {canvas,win,changed,gesture,input,unbind,event,disable:()=>{playing=false}};
}
it('holds both mouse buttons, releases each independently even outside the canvas, and blocks the playfield context menu',()=>{
 const r=rig();r.event(r.canvas,'mousedown',0,1);expect(r.changed).toHaveBeenLastCalledWith(true,false);
 r.event(r.canvas,'mousedown',2,3);expect(r.changed).toHaveBeenLastCalledWith(true,true);
 expect(r.event(r.canvas,'contextmenu',2,3).defaultPrevented).toBe(true);
 r.event(r.win,'mouseup',0,2);expect(r.changed).toHaveBeenLastCalledWith(false,true);
 r.event(r.win,'mouseup',2);expect(r.changed).toHaveBeenLastCalledWith(false,false);expect(r.gesture).toHaveBeenCalledTimes(2);r.unbind();
});
it('keeps keyboard/touch holds independent and clears lost mouse releases and focus',()=>{
 const r=rig();r.input.press('keyboard','left');r.event(r.canvas,'mousedown',0,1);r.event(r.canvas,'mousedown',2,3);
 r.event(r.win,'mousemove',0,1);expect(r.changed).toHaveBeenLastCalledWith(true,false);
 r.event(r.win,'blur');expect(r.changed).toHaveBeenLastCalledWith(true,false);
 r.input.release('keyboard');expect(r.changed).toHaveBeenLastCalledWith(false,false);r.unbind();
});
it('leaves building and middle-button behavior alone and removes handlers on disposal',()=>{
 const r=rig();r.event(r.canvas,'mousedown',1,4);expect(r.changed).not.toHaveBeenCalled();
 r.disable();expect(r.event(r.canvas,'mousedown',0,1).defaultPrevented).toBe(false);expect(r.event(r.canvas,'contextmenu',2).defaultPrevented).toBe(false);
 expect(r.gesture).not.toHaveBeenCalled();r.unbind();
});
