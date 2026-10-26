import type {Table} from './model';
export class GameAudio {
 private context?:AudioContext;
 private table?:Table;private music?:HTMLAudioElement;private voices=new Set<HTMLAudioElement>();private paused=true;private active=false;
 constructor(private enabled:()=>boolean,private report:(text:string)=>void=()=>{}){}
 configure(table:Table){this.stop();this.table=table;const id=table.advanced?.musicId,asset=id&&table.sounds?.[id];if(asset){this.music=new Audio(asset.data);this.music.loop=true;this.music.volume=.25}}
 private play(voice:HTMLAudioElement){void voice.play().catch(()=>{this.voices.delete(voice);this.report('This browser could not play imported audio. Check its format or toggle Sound to retry.')})}
 sync(paused:boolean){this.paused=paused;const active=!paused&&this.enabled();if(active===this.active)return;this.active=active;if(!active){this.music?.pause();for(const voice of this.voices)voice.pause()}else{if(this.music)this.play(this.music);for(const voice of this.voices)if(!voice.ended)this.play(voice)}}
 sound=(id:string)=>{const asset=this.table?.sounds?.[id];if(!asset||!this.enabled()||this.paused)return;const voice=new Audio(asset.data);voice.volume=.6;this.voices.add(voice);voice.onended=()=>this.voices.delete(voice);voice.onerror=()=>{this.voices.delete(voice);this.report('An imported sound could not be decoded by this browser.')};this.play(voice)};
 stop(){this.music?.pause();this.music=undefined;for(const v of this.voices){v.pause();v.removeAttribute('src');v.load()}this.voices.clear();this.paused=true;this.active=false}
 async unlock(){try{this.context??=new AudioContext();await this.context.resume()}catch{/* Silent play remains available. */}}
 hit=(score:number)=>{const audio=this.context;if(!this.enabled()||!audio||audio.state!=='running')return;
  const oscillator=audio.createOscillator(),gain=audio.createGain();oscillator.type='square';
  oscillator.frequency.setValueAtTime(score?660:330,audio.currentTime);oscillator.frequency.exponentialRampToValueAtTime(180,audio.currentTime+.09);
  gain.gain.setValueAtTime(.025,audio.currentTime);gain.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.1);
  oscillator.connect(gain).connect(audio.destination);oscillator.start();oscillator.stop(audio.currentTime+.1);
 };
}
