import {Part} from './model';

let atlas:HTMLImageElement|undefined;
function image(){
 if(typeof Image==='undefined')return;
 if(!atlas){atlas=new Image();atlas.onload=()=>window.dispatchEvent(new Event('pinball-art-ready'));atlas.src=new URL('modern-parts.png',document.baseURI).href}
 return atlas.complete&&atlas.naturalWidth?atlas:undefined;
}
type Rect=[number,number,number,number];
const sprites:{red:Rect;blue:Rect;amber:Rect;left:Rect;right:Rect;ball:Rect;sling:Rect;target:Rect;light:Rect}={
 red:[90,36,335,330],blue:[597,36,335,330],amber:[1105,36,340,330],
 left:[46,452,460,175],right:[586,452,460,175],ball:[1230,440,180,180],
 sling:[98,704,330,285],target:[615,752,320,182],light:[1185,730,245,240]
};
function hue(color:string){if(color.toLowerCase()==='#f4f4ef')return 0;
 const values=[1,3,5].map(i=>parseInt(color.slice(i,i+2),16)/255),max=Math.max(...values),min=Math.min(...values),delta=max-min;
 if(!delta)return 0;
 let h=max===values[0]?(values[1]-values[2])/delta:max===values[1]?(values[2]-values[0])/delta+2:(values[0]-values[1])/delta+4;
 h=(h*60+360)%360;return h-210;
}
export function drawModern(c:CanvasRenderingContext2D,p:Part,flash=false){
 const src=image();if(!src)return false;
 let sprite:Rect|undefined,x=0,y=0,w=0,h=0;
 const scale=p.scale??1;
 if(p.kind==='bumper'){
  sprite=p.color.toLowerCase()==='#ff8426'?sprites.amber:p.color.toLowerCase()==='#ff3030'?sprites.red:sprites.blue;
  const r=(p.r??27);x=-r;y=-r;w=2*r;h=2*r;
 }else if(p.kind==='ball'){sprite=sprites.ball;const r=p.r??10;x=-r;y=-r;w=2*r;h=2*r}
 else if(p.kind==='leftFlipper'){sprite=sprites.left;x=-13;y=-15;w=108;h=30}
 else if(p.kind==='rightFlipper'){sprite=sprites.right;x=-95;y=-15;w=108;h=30}
 else if(p.kind==='slingshot'){sprite=sprites.sling;x=-28;y=-46;w=60;h=92}
 else if(p.kind==='target'){sprite=sprites.target;x=-27;y=-16;w=54;h=32}
 else if(p.kind==='light'){sprite=sprites.light;const r=p.r??10;x=-r;y=-r;w=2*r;h=2*r}
 if(!sprite)return false;
 c.save();c.translate(p.x,p.y);c.rotate(p.rotation*Math.PI/180);c.scale((p.mirror?-1:1)*scale,scale);
 if(flash)c.filter='brightness(1.65)';
 else if(p.color&&p.kind!=='ball'&&p.kind!=='light'&&sprite!==sprites.red&&sprite!==sprites.amber)c.filter=`hue-rotate(${hue(p.color)}deg)`;
 c.drawImage(src,...sprite,x,y,w,h);c.restore();return true;
}
