export class GameAudio {
 private context?:AudioContext;
 constructor(private enabled:()=>boolean){}
 async unlock(){try{this.context??=new AudioContext();await this.context.resume()}catch{/* Silent play remains available. */}}
 hit=(score:number)=>{const audio=this.context;if(!this.enabled()||!audio||audio.state!=='running')return;
  const oscillator=audio.createOscillator(),gain=audio.createGain();oscillator.type='square';
  oscillator.frequency.setValueAtTime(score?660:330,audio.currentTime);oscillator.frequency.exponentialRampToValueAtTime(180,audio.currentTime+.09);
  gain.gain.setValueAtTime(.025,audio.currentTime);gain.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.1);
  oscillator.connect(gain).connect(audio.destination);oscillator.start();oscillator.stop(audio.currentTime+.1);
 };
}
