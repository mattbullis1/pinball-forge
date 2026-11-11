import source from './assets/construction-reference.gif?inline';
import type {Part,Point} from './model';

type Sprite={rect:[number,number,number,number];pivot?:[number,number];outline?:[number,number][];color?:string;pass?:[number,number]};
// Coordinates in the user's 560 × 384 construction-set reference.
// Only identified pieces are exposed; unknown controls are not assigned actions.
export const referenceSprites:Record<string,Sprite>={
 smallLeft:{rect:[332,14,22,16],pivot:[5,4],outline:[[0,2],[2,0],[9,0],[21,12],[21,15],[16,15],[4,9],[0,5]]},
 smallRight:{rect:[362,14,22,16],pivot:[16,4],outline:[[0,12],[12,0],[19,0],[21,2],[21,5],[17,9],[5,15],[0,15]]},
 leftFlipper:{rect:[404,10,32,24],pivot:[6,5],outline:[[0,2],[2,0],[11,0],[31,20],[31,23],[28,23],[4,11],[0,7]]},
 rightFlipper:{rect:[442,10,32,24],pivot:[25,5],outline:[[0,20],[20,0],[29,0],[31,2],[31,7],[27,11],[3,23],[0,23]]},
 ball:{rect:[490,10,10,10]},
 box:{rect:[332,50,36,32],color:'#14f63d'},
 wall:{rect:[396,54,4,34]},shortWall:{rect:[408,64,4,24]},
 angledWall:{rect:[420,44,68,18]},reverseWall:{rect:[420,70,68,18]},
 bumper:{rect:[332,96,32,28]},smallBumper:{rect:[368,98,26,22]},
 sideTarget:{rect:[400,96,10,28],color:'#ff44fb',outline:[[0,2],[2,0],[7,0],[9,2],[9,25],[7,27],[2,27],[0,25]]},
 target:{rect:[412,106,38,10],color:'#ff44fb',outline:[[0,2],[2,0],[35,0],[37,2],[37,7],[35,9],[2,9],[0,7]]},
 leftTarget:{rect:[454,96,22,22],color:'#ff44fb',outline:[[0,2],[2,0],[7,0],[21,14],[21,19],[19,21],[14,21],[0,7]]},
 rightTarget:{rect:[482,96,22,22],color:'#ff44fb',outline:[[0,14],[14,0],[19,0],[21,2],[21,7],[7,21],[2,21],[0,19]]},
 slingshot:{rect:[332,136,38,52],color:'#14f43b',outline:[[0,2],[2,0],[7,0],[11,4],[35,40],[37,44],[37,49],[35,51],[26,51],[2,43],[0,41]]},
 rightSling:{rect:[380,136,38,52],color:'#14f43b',outline:[[0,44],[2,40],[26,4],[30,0],[35,0],[37,2],[37,41],[35,43],[11,51],[2,51],[0,49]]},
 upSpring:{rect:[426,150,12,20]},sideSpring:{rect:[448,156,24,12]},launcher:{rect:[480,146,14,24]},
 bounceVertical:{rect:[336,200,10,64],color:'#ff6b3d'},bounceHorizontal:{rect:[364,200,62,8],color:'#ff6b3d'},
 ballTrap:{rect:[372,216,22,38]},blackHole:{rect:[406,224,22,18]},classicSpinner:{rect:[460,200,14,10],color:'#14f43b'},
 gateUpLeft:{rect:[402,288,14,18],color:'#ff44fb',pass:[0,-1],outline:[[10,0],[14,0],[4,12],[4,14],[6,14],[6,18],[0,18],[0,10]]},
 gateUpRight:{rect:[430,288,14,18],color:'#ff44fb',pass:[0,-1],outline:[[0,0],[4,0],[14,10],[14,18],[8,18],[8,14],[10,14],[10,12]]},
 gateRight:{rect:[458,288,14,18],color:'#14f43b',pass:[1,0],outline:[[4,0],[8,0],[4,6],[4,18],[0,18],[0,4]]},
 gateLeft:{rect:[486,288,14,18],color:'#14f43b',pass:[-1,0],outline:[[6,0],[10,0],[14,4],[14,18],[10,18],[10,6]]},
 classicMagnet:{rect:[458,232,20,14],color:'#ff6b3d'},
 greenLight:{rect:[338,288,10,20],color:'#14f43b'},
 mediumLight:{rect:[358,288,10,16],color:'#14f43b'},
 smallLight:{rect:[378,288,10,10],color:'#14f43b'},
 rollBall:{rect:[338,320,10,10]},rollPinkPlus:{rect:[352,320,10,10],color:'#ff44fb'},rollOrangePlus:{rect:[366,320,10,10],color:'#ff6b3d'},
 rollWhiteBar:{rect:[384,320,14,6]},rollGreenBar:{rect:[406,320,14,6],color:'#14f43b'},rollCyanBar:{rect:[428,320,14,6],color:'#14d0fe'},
 rollWhiteVertical:{rect:[454,320,6,14]},rollPinkVertical:{rect:[468,320,6,14],color:'#ff44fb'},rollOrangeVertical:{rect:[482,320,6,14],color:'#ff6b3d'}
};
const pivot=(s:Sprite)=>s.pivot??[s.rect[2]/2,s.rect[3]/2];
export function referenceOutline(id:string,radius?:number):Point[]|undefined{
 const s=referenceSprites[id];if(!s)return;
 if(id==='blackHole')return Array.from({length:24},(_,i)=>({x:Math.cos(i*Math.PI/12)*22,y:Math.sin(i*Math.PI/12)*18}));
 if(id==='bumper'||id==='smallBumper'){const scale=(radius??s.rect[3])/s.rect[3];return Array.from({length:24},(_,i)=>({x:Math.cos(i*Math.PI/12)*s.rect[2]*scale,y:Math.sin(i*Math.PI/12)*s.rect[3]*scale}))}
 if(!s.outline)return [{x:-s.rect[2],y:-s.rect[3]},{x:s.rect[2],y:-s.rect[3]},{x:s.rect[2],y:s.rect[3]},{x:-s.rect[2],y:s.rect[3]}];
 const [x,y]=pivot(s);return s.outline.map(p=>({x:(p[0]-x)*2,y:(p[1]-y)*2}));
}
let atlas:HTMLImageElement|undefined,ready=false;
const tiles=new Map<string,HTMLCanvasElement>();
function tile(id:string,color?:string,flash=false){
 if(!atlas){atlas=new Image();atlas.onload=()=>{ready=true;window.dispatchEvent(new Event('pinball-art-ready'))};atlas.src=source}
 if(!ready)return;
 const key=id+color+flash,cached=tiles.get(key);if(cached)return cached;
 const s=referenceSprites[id],canvas=document.createElement('canvas'),[x,y,w,h]=s.rect;
 canvas.width=w;canvas.height=h;const c=canvas.getContext('2d')!;
 c.drawImage(atlas,x,y,w,h,0,0,w,h);
 const pixels=c.getImageData(0,0,w,h),d=pixels.data;
 const tint=color&&color!==(s.color??'#ffffff')?color:undefined;
 for(let i=0;i<d.length;i+=4){
  const max=Math.max(d[i],d[i+1],d[i+2]),min=Math.min(d[i],d[i+1],d[i+2]);
  if(max<60)d[i+3]=0;
  else if(flash&&(!id.startsWith('bounce')||d[i]>d[i+1]))d[i]=d[i+1]=d[i+2]=255;
  else if(tint&&(!s.color||max-min>60)){d[i]=parseInt(tint.slice(1,3),16);d[i+1]=parseInt(tint.slice(3,5),16);d[i+2]=parseInt(tint.slice(5,7),16)}
 }
 c.putImageData(pixels,0,0);if(tiles.size>128)tiles.clear();tiles.set(key,canvas);return canvas;
}
export function drawReferenceThumbnail(canvas:HTMLCanvasElement,p:Part){
 const s=p.sprite&&referenceSprites[p.sprite];if(!s)return false;
 canvas.width=s.rect[2]+8;canvas.height=s.rect[3]+8;
 const art=tile(p.sprite!,p.color);if(art)canvas.getContext('2d')!.drawImage(art,4,4);
 return true;
}
export function drawReferencePart(c:CanvasRenderingContext2D,p:Part,flash:boolean){
 const s=p.sprite&&referenceSprites[p.sprite];if(!s||p.kind==='wall'||p.wallLoop)return false;
 const art=tile(p.sprite!,p.color,flash);if(!art)return false;
 const [x,y]=pivot(s);let scale=(p.scale??1)*2;
 if(p.kind==='ball'||p.kind==='bumper')scale*=(p.r??s.rect[3])/s.rect[3];
 c.save();c.translate(p.x,p.y);c.rotate(p.rotation*Math.PI/180);c.scale(p.mirror?-scale:scale,scale);
 if(p.sprite==='classicSpinner'){const face=Math.cos(Math.max(0,p.animationPhase??0));c.scale(1,(face<0?-1:1)*Math.max(.12,Math.abs(face)))}
 c.imageSmoothingEnabled=false;c.drawImage(art,-x,-y);
 if(p.kind==='ballTrap'){c.fillStyle='#ffffff';for(let i=0;i<(p.trappedBalls??0);i++){c.beginPath();c.arc(0,9-i*11,5,0,Math.PI*2);c.fill()}}
 c.restore();return true;
}
