import {afterEach,expect,it,vi} from 'vitest';
import {GameAudio} from './game-audio';
import {workshopTable} from './workshop';
afterEach(()=>vi.unstubAllGlobals());
it('starts music once, pauses all audio, honors mute, resumes and releases it on exit',()=>{
 const voices:FakeAudio[]=[];
 class FakeAudio{loop=false;volume=1;paused=true;ended=false;onended?:()=>void;onerror?:()=>void;play=vi.fn(async()=>{this.paused=false});pause=vi.fn(()=>{this.paused=true});removeAttribute=vi.fn();load=vi.fn();constructor(public src:string){voices.push(this)}}
 vi.stubGlobal('Audio',FakeAudio);let enabled=true;const audio=new GameAudio(()=>enabled);audio.configure(workshopTable());audio.sync(false);audio.sync(false);expect(voices[0].loop).toBe(true);expect(voices[0].play).toHaveBeenCalledTimes(1);
 audio.sound('chime');expect(voices).toHaveLength(2);expect(voices[1].play).toHaveBeenCalledTimes(1);audio.sync(true);expect(voices.every(v=>v.paused)).toBe(true);audio.sound('chime');expect(voices).toHaveLength(2);
 audio.sync(false);expect(voices.every(v=>!v.paused)).toBe(true);enabled=false;audio.sync(false);expect(voices.every(v=>v.paused)).toBe(true);audio.sound('chime');expect(voices).toHaveLength(2);enabled=true;audio.sync(false);audio.stop();expect(voices.every(v=>v.paused)).toBe(true);expect(voices[1].removeAttribute).toHaveBeenCalledWith('src');
});
it('reports unsupported playback once rather than retrying every frame',async()=>{
 const play=vi.fn(()=>Promise.reject(Error('unsupported')));vi.stubGlobal('Audio',class{play=play;pause(){};loop=false;volume=1});const report=vi.fn(),audio=new GameAudio(()=>true,report);audio.configure(workshopTable());for(let i=0;i<100;i++)audio.sync(false);await Promise.resolve();expect(play).toHaveBeenCalledTimes(1);expect(report).toHaveBeenCalledTimes(1);
});
it('synthesizes different bumper and light sounds, releases voices, and respects mute/pause/exit',async()=>{
 const tones:any[]=[];
 const parameter=()=>({setValueAtTime:vi.fn(),linearRampToValueAtTime:vi.fn(),exponentialRampToValueAtTime:vi.fn()});
 const resume=vi.fn(async()=>{context.state='running'});
 const context={state:'suspended',currentTime:0,destination:{},resume,
  createOscillator:()=>{const tone={type:'sine',frequency:parameter(),connect:vi.fn((v:any)=>v),disconnect:vi.fn(),start:vi.fn(),stop:vi.fn(),onended:()=>{}};tones.push(tone);return tone},
  createGain:()=>({gain:parameter(),connect:vi.fn(),disconnect:vi.fn()})};
 vi.stubGlobal('AudioContext',class{constructor(){return context}});
 let enabled=true;const audio=new GameAudio(()=>enabled);audio.sync(false);await audio.unlock();expect(resume).toHaveBeenCalledOnce();
 audio.hit(100,'bumper');expect(tones).toHaveLength(3);expect(tones[0].type).toBe('triangle');
 audio.hit(0,'light');expect(tones).toHaveLength(5);expect(tones[3].frequency.setValueAtTime).toHaveBeenCalledWith(1046,0);
 audio.hit(0,'rollover');expect(tones).toHaveLength(7);expect(tones[5].frequency.setValueAtTime).toHaveBeenCalledWith(880,0);
 tones[0].onended();expect(tones[0].disconnect).toHaveBeenCalled();
 audio.sync(true);expect(tones[1].stop).toHaveBeenCalledTimes(2);audio.hit(100,'bumper');expect(tones).toHaveLength(7);
 audio.sync(false);enabled=false;audio.sync(false);audio.hit(100,'bumper');expect(tones).toHaveLength(7);
 enabled=true;audio.sync(false);audio.hit(100,'bumper');audio.stop();expect(tones.at(-1).disconnect).toHaveBeenCalled();audio.hit(100,'bumper');expect(tones).toHaveLength(10);
});
