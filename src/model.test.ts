import {describe,it,expect} from 'vitest';
import {makePart,sampleTables,validateTable} from './model';
describe('table model',()=>{
  it('creates three independently editable tables',()=>{const tables=sampleTables();expect(tables).toHaveLength(3);expect(new Set(tables.map(t=>t.id)).size).toBe(3);tables[0].parts[0].x=99;expect(tables[1].parts[0].x).not.toBe(99)});
  it('gives placed components useful defaults',()=>{const p=makePart('bumper',120,200);expect(p.score).toBeGreaterThan(0);expect(p.r).toBeGreaterThan(0);expect(p.color).toMatch(/^#/)});
  it('accepts saved tables and rejects malformed ones',()=>{const t=sampleTables()[0];expect(validateTable(JSON.parse(JSON.stringify(t)))).toBe(true);expect(validateTable({...t,parts:[{kind:'wall'}]})).toBe(false)});
  it('starts with a shaped perimeter and an open drain',()=>{const walls=sampleTables()[0].parts.filter(p=>p.boundary);expect(walls.length).toBeGreaterThan(8);expect(walls.some(p=>p.y!==p.y2&&p.x!==p.x2)).toBe(true);expect(walls.some(p=>p.x===350&&p.y===806&&p.x2===210&&p.y2===806)).toBe(false)});
});
