import type {Kind} from './model';

const art:Record<Kind,string>={
  leftFlipper:'<path d="M13 49 L45 30 L52 37 L24 56 Z" fill="#f4f4ef"/><circle cx="19" cy="49" r="5" fill="#ff56d8"/>',
  rightFlipper:'<path d="M51 49 L19 30 L12 37 L40 56 Z" fill="#f4f4ef"/><circle cx="45" cy="49" r="5" fill="#ff56d8"/>',
  ball:'<circle cx="32" cy="32" r="14" fill="#f4f4ef"/><rect x="23" y="22" width="8" height="5" fill="#4cf1f3"/>',
  launcher:'<rect x="24" y="8" width="16" height="48" fill="#f4f4ef"/><rect x="28" y="13" width="8" height="29" fill="#4cf1f3"/><rect x="20" y="45" width="24" height="7" fill="#ff56d8"/>',
  bumper:'<circle cx="32" cy="32" r="24" fill="#f4f4ef"/><circle cx="32" cy="32" r="18" fill="#4cf1f3"/><circle cx="32" cy="32" r="9" fill="#ff56d8"/><rect x="28" y="10" width="8" height="8" fill="#050505"/>',
  wall:'<path d="M8 44 L54 19" stroke="#f4f4ef" stroke-width="8" stroke-linecap="square"/><rect x="4" y="40" width="9" height="9" fill="#4cf1f3"/><rect x="51" y="15" width="9" height="9" fill="#4cf1f3"/>',
  slingshot:'<path d="M10 55 L25 12 L52 49 Z" fill="#4cf1f3" stroke="#f4f4ef" stroke-width="4"/>',
  target:'<rect x="13" y="18" width="38" height="28" fill="#ff56d8" stroke="#f4f4ef" stroke-width="4"/><rect x="20" y="25" width="24" height="7" fill="#f4f4ef"/>',
  rollover:'<circle cx="32" cy="32" r="21" fill="#050505" stroke="#f4f4ef" stroke-width="4"/><path d="M20 32 L32 20 L44 32 L32 44 Z" fill="#4cf1f3"/>',
  drain:'<path d="M8 24 L32 46 L56 24" fill="none" stroke="#f4f4ef" stroke-width="7"/><rect x="28" y="45" width="8" height="8" fill="#ff56d8"/>',
  light:'<path d="M32 5 L38 25 L59 32 L38 38 L32 59 L25 38 L5 32 L25 25 Z" fill="#ff56d8"/><rect x="28" y="28" width="8" height="8" fill="#f4f4ef"/>',
  zone:'<path d="M32 6 L57 32 L32 57 L6 32 Z" fill="#050505" stroke="#4cf1f3" stroke-width="5"/><path d="M32 16 L45 32 L32 47 L19 32 Z" fill="#ff56d8"/>'
};
export function partArt(kind:Kind){return `<svg viewBox="0 0 64 64" aria-hidden="true" focusable="false">${art[kind]}</svg>`}
