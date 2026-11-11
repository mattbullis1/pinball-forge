import type {Kind,Table} from './model';
export class GameAudio {
 private context?:AudioContext;
 private tones=new Set<OscillatorNode>();
 private table?:Table;private music?:HTMLAudioElement;private voices=new Set<HTMLAudioElement>();private paused=true;private active=false;
 constructor(private enabled:()=>boolean,private report:(text:string)=>void=()=>{}){}
 configure(table:Table){this.stop();this.table=table;const id=table.advanced?.musicId,asset=id&&table.sounds?.[id];if(asset){this.music=new Audio(asset.data);this.music.loop=true;this.music.volume=.25}}
 private play(voice:HTMLAudioElement){void voice.play().catch(()=>{this.voices.delete(voice);this.report('This browser could not play imported audio. Check its format or toggle Sound to retry.')})}
 sync(paused:boolean){this.paused=paused;const active=!paused&&this.enabled();if(active===this.active)return;this.active=active;if(!active){this.silence();this.music?.pause();for(const voice of this.voices)voice.pause()}else{if(this.music)this.play(this.music);for(const voice of this.voices)if(!voice.ended)this.play(voice)}}
 sound=(id:string)=>{const asset=this.table?.sounds?.[id];if(!asset||!this.enabled()||this.paused)return;const voice=new Audio(asset.data);voice.volume=.6;this.voices.add(voice);voice.onended=()=>this.voices.delete(voice);voice.onerror=()=>{this.voices.delete(voice);this.report('An imported sound could not be decoded by this browser.')};this.play(voice)};
 stop(){this.silence();this.music?.pause();this.music=undefined;for(const v of this.voices){v.pause();v.removeAttribute('src');v.load()}this.voices.clear();this.paused=true;this.active=false}
 async unlock(){try{this.context??=new AudioContext();if(this.context.state!=='running')await this.context.resume()}catch{this.report('Sound could not start. Toggle Sound to retry.')}}
 private silence(){for(const tone of this.tones){tone.stop();tone.disconnect()}this.tones.clear()}
 private tone(frequency:number,end:number,duration:number,volume:number,type:OscillatorType='sine'){
  const audio=this.context!,now=audio.currentTime,oscillator=audio.createOscillator(),gain=audio.createGain();
  oscillator.type=type;oscillator.frequency.setValueAtTime(frequency,now);oscillator.frequency.exponentialRampToValueAtTime(end,now+duration);
  gain.gain.setValueAtTime(0,now);gain.gain.linearRampToValueAtTime(volume,now+.004);gain.gain.exponentialRampToValueAtTime(.0001,now+duration);
  oscillator.connect(gain).connect(audio.destination);this.tones.add(oscillator);
  oscillator.onended=()=>{this.tones.delete(oscillator);oscillator.disconnect();gain.disconnect()};
  oscillator.start(now);oscillator.stop(now+duration+.01);
 }
 hit=(score:number,kind:Kind='target')=>{const audio=this.context;if(!this.enabled()||this.paused||!audio||audio.state!=='running')return;
  if(['bumper','slingshot','bounceWall','upKicker','sideKicker'].includes(kind)){
   // Solenoid thump and a short metallic ring for powered rubber contacts.
   this.tone(180,55,.13,.16,'triangle');this.tone(740,680,.23,.08);this.tone(1720,1600,.12,.025);
  }else{
   // A damped bell with an inharmonic overtone, including zero-point lights.
   const pitch=kind==='light'?1046:kind==='rollover'?880:score?784:660;
   this.tone(pitch,pitch,.38,.12);this.tone(pitch*2.76,pitch*2.76,.16,.035);
  }
 };
}
