// Independent input sources prevent one finger/key from releasing another.
export class FlipperInput {
  private sources=new Map<string,'left'|'right'>();
  constructor(private changed:(left:boolean,right:boolean)=>void) {}
  press(source:string,side:'left'|'right'){this.sources.set(source,side);this.emit()}
  release(source:string){this.sources.delete(source);this.emit()}
  clear(){this.sources.clear();this.emit()}
  private emit(){const sides=[...this.sources.values()];this.changed(sides.includes('left'),sides.includes('right'))}
}
