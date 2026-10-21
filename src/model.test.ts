import {describe,it,expect} from 'vitest';
import {makePart,sampleTables,validateTable} from './model';
describe('table model',()=>{
  it('creates three independently editable tables',()=>{const tables=sampleTables();expect(tables).toHaveLength(3);expect(new Set(tables.map(t=>t.id)).size).toBe(3);tables[0].parts[0].x=99;expect(tables[1].parts[0].x).not.toBe(99)});
  it('gives placed components useful defaults',()=>{const p=makePart('bumper',120,200);expect(p.score).toBeGreaterThan(0);expect(p.r).toBeGreaterThan(0);expect(p.color).toMatch(/^#/)});
  it('accepts saved tables and rejects malformed ones',()=>{const t=sampleTables()[0];expect(validateTable(JSON.parse(JSON.stringify(t)))).toBe(true);expect(validateTable({...t,parts:[{kind:'wall'}]})).toBe(false)});
});
