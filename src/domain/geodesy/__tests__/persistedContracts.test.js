import fs from 'fs';
import path from 'path';
import contracts from '../__fixtures__/persistedContracts.json';

// Tripwire: the persisted-result contract lives in the calculator components (the
// getResultData mapping and the UI rounding wrappers), NOT in the domain layer. This
// test reads the actual component sources and fails if the saved key set or the
// rounding of any professional tool changes silently — that is exactly what a
// canonical backend port would otherwise have to rediscover by accident.

const TASKS = path.join(__dirname, '../../../components/tasks');
const DOMAIN = path.join(__dirname, '..');
const read = (file) => fs.readFileSync(file, 'utf8').replace(/\r/g, '');
const componentSource = (name) => read(path.join(TASKS, name));

// Extracts the { key: r.key } pairs of a component's getResultData mapping.
function savedFields(source) {
  const start = source.indexOf('getResultData:');
  expect(start).toBeGreaterThan(-1);
  const open = source.indexOf('({', start);
  const close = source.indexOf('})', open);
  const body = source.slice(open + 2, close);
  return [...body.matchAll(/(\w+)\s*:\s*r\.(\w+)/g)].map((m) => {
    expect(m[1]).toBe(m[2]); // saved under the same name it has in the result
    return m[1];
  });
}

const tools = Object.entries(contracts.tools);

describe('persisted-result contract vs the real component sources', () => {
  it('covers exactly the 12 professional tools', () => {
    expect(tools.map(([name]) => name).sort()).toEqual([
      'area-calculation', 'coordinate-transformation', 'distance-bearing', 'first-basic-task',
      'forward-intersection', 'hansen-task', 'line-intersection', 'offset-point',
      'polar-intersection', 'resection', 'second-basic-task', 'segment-division',
    ]);
  });

  it.each(tools.map(([name, c]) => [name, c]))('%s: saved resultData keys match the contract', (_name, c) => {
    const source = componentSource(c.component);
    const saved = savedFields(source).sort();
    const declared = c.persistedResult.map(([field]) => field).sort();
    expect(saved).toEqual(declared);
  });

  it.each(tools.map(([name, c]) => [name, c]))('%s: rounding applied before saving matches the contract', (_name, c) => {
    const source = componentSource(c.component);
    for (const [field, decimals] of c.persistedResult) {
      if (decimals === 'string') continue;
      if (c.roundingSource === 'component') {
        const m = source.match(new RegExp(`\\b${field}:\\s*roundTo\\(result\\.${field},\\s*(\\d+)\\)`));
        expect(m).not.toBeNull();
        expect(Number(m[1])).toBe(decimals);
      } else if (c.roundingSource === 'shipped-module') {
        const shipped = read(path.join(DOMAIN, 'secondTaskShipped.js'));
        const factor = 10 ** decimals;
        expect(shipped).toContain(`${field}: Math.round(${field} * ${factor}) / ${factor}`);
      } else {
        // 'none': persisted at full precision — no roundTo on that result field in the component.
        expect(decimals).toBeNull();
        expect(source).not.toMatch(new RegExp(`roundTo\\(result\\.${field}\\b`));
      }
    }
  });

  it('only offset-point and resection are engine v2 (both keep v1 as a legacy version); every other tool is v1', () => {
    for (const [name, c] of tools) {
      expect(c.engineVersion).toBe(['offset-point', 'resection'].includes(name) ? 2 : 1);
    }
    expect(contracts.tools['offset-point'].legacyVersions).toEqual([1, 2]);
    expect(contracts.tools.resection.legacyVersions).toEqual([1, 2]);
  });

  it('the declared argument order is documented for every tool (Y-first vs X-first is NOT uniform)', () => {
    expect(contracts.tools['first-basic-task'].argOrder.slice(0, 2)).toEqual(['y1', 'x1']);
    expect(contracts.tools['second-basic-task'].argOrder.slice(0, 2)).toEqual(['x1', 'y1']);
    expect(contracts.tools['polar-intersection'].argOrder.slice(0, 2)).toEqual(['xA', 'yA']);
    expect(contracts.tools['forward-intersection'].argOrder.slice(0, 2)).toEqual(['yA', 'xA']);
    expect(contracts.tools['hansen-task'].argOrder.slice(0, 2)).toEqual(['xA', 'yA']);
  });
});
