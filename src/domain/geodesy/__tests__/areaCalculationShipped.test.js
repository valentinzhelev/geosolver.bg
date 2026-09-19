import { parseAreaPoints, calculateAreaShipped } from '../areaCalculationShipped';
import vectors from '../__fixtures__/areaCalculation.shipped.vectors.json';

// Characterizes the SHIPPED Area Calculation (inline AreaCalculation.js code).
// The pre-existing areaCalculation.test.js only covers domain/geodesy/areaCalculation.js,
// which production does not call.

const toPoints = (pairs) => pairs.map(([x, y]) => ({ x, y }));

describe('shipped Area Calculation — textarea parsing (parsePoints)', () => {
  it.each(vectors.parse.map((v) => [v.name, v]))('%s', (_name, v) => {
    expect(parseAreaPoints(v.text)).toEqual(v.points);
  });
});

describe('shipped Area Calculation — persisted golden vectors', () => {
  const cases = vectors.calc.flatMap((c) => vectors.methods.map((m) => [`${c.name} [${m}]`, c, m]));

  it.each(cases)('%s', (_name, c, method) => {
    const r = calculateAreaShipped(toPoints(c.points), method);
    expect(r.area).toBe(c.area); // persisted resultData is { area } — unrounded
    expect(r.perimeter).toBe(c.perimeter); // display-only, not persisted
    expect(r.points).toBe(c.points.length);
    expect(r.method).toBe(method);
  });

  it.each(vectors.errors.map((e) => [e.name, e]))('error: %s', (_name, e) => {
    expect(() => calculateAreaShipped(toPoints(e.points), e.method)).toThrow(e.message);
  });

  it('the fixture declares exactly the persisted fields the component saves', () => {
    expect(vectors.persistedInput).toEqual(['points', 'method']);
    expect(vectors.persistedResult).toEqual(['area']);
  });
});

describe('shipped Area Calculation — behavior notes', () => {
  it('area is not rounded (unrounded floating value is what gets persisted)', () => {
    const r = calculateAreaShipped(toPoints([[0, 0], [1, 0], [0.5, 0.3333333333]]), 'shoelace');
    expect(r.area).not.toBe(Math.round(r.area * 100) / 100);
  });

  it('orientation does not change area (absolute value) and is not reported', () => {
    const cw = calculateAreaShipped(toPoints([[0, 0], [0, 100], [100, 100], [100, 0]]), 'shoelace');
    const ccw = calculateAreaShipped(toPoints([[0, 0], [100, 0], [100, 100], [0, 100]]), 'shoelace');
    expect(cw.area).toBe(ccw.area);
    expect(Object.keys(cw)).not.toContain('orientation');
  });

  it('the default method is shoelace', () => {
    expect(calculateAreaShipped(toPoints([[0, 0], [100, 0], [50, 100]])).method).toBe('shoelace');
  });

  it('does not validate finiteness (unlike domain/geodesy/areaCalculation.js); parsePoints filters NaN upstream', () => {
    const r = calculateAreaShipped(toPoints([[0, 0], [NaN, 1], [1, 0]]), 'shoelace');
    expect(Number.isNaN(r.area)).toBe(true);
  });

  it('never returns an `alternativeArea` field — the UI reference to it is dead (always renders "N/A")', () => {
    const r = calculateAreaShipped(toPoints([[0, 0], [100, 0], [50, 100]]), 'shoelace');
    expect(Object.keys(r).sort()).toEqual(['area', 'calculationDetails', 'method', 'perimeter', 'points']);
    expect(r).not.toHaveProperty('alternativeArea');
  });

  it('independent hand checks: rectangle 100x100 = 10000, triangle base100 x height100 / 2 = 5000', () => {
    expect(calculateAreaShipped(toPoints([[0, 0], [100, 0], [100, 100], [0, 100]]), 'shoelace').area).toBe(10000);
    expect(calculateAreaShipped(toPoints([[0, 0], [100, 0], [50, 100]]), 'trapezoidal').area).toBe(5000);
  });
});
