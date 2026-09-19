import { vtoraOsnovnaZadacha } from '../secondTaskShipped';
import vectors from '../__fixtures__/secondTask.shipped.vectors.json';

// Characterizes the SHIPPED Second Basic Task (the inline SecondTask.js function).
// The pre-existing secondTask.test.js only covers domain/geodesy/secondTask.js,
// which production does not call.

// The four fields SecondTask.js's getResultData persists as resultData.
const persisted = (r) => ({ alpha: r.alpha, distance: r.distance, deltaX: r.deltaX, deltaY: r.deltaY });

describe('shipped Second Basic Task — persisted golden vectors (value-for-value)', () => {
  it.each(vectors.vectors.map((v) => [v.name, v]))('%s', (_name, v) => {
    const r = vtoraOsnovnaZadacha(v.input.x1, v.input.y1, v.input.x2, v.input.y2);
    expect(persisted(r)).toEqual(v.result);
    expect(r.quadrantName).toBe(v.quadrantName);
  });

  it.each(vectors.errors.map((e) => [e.name, e]))('error: %s', (_name, e) => {
    expect(() => vtoraOsnovnaZadacha(e.input.x1, e.input.y1, e.input.x2, e.input.y2)).toThrow(e.message);
  });

  it('the fixture declares exactly the persisted fields the component saves', () => {
    expect(vectors.persistedResult).toEqual(['alpha', 'distance', 'deltaX', 'deltaY']);
    expect(vectors.persistedInput).toEqual(['x1', 'y1', 'x2', 'y2']);
  });
});

describe('shipped Second Basic Task — independent hand checks (not just self-agreement)', () => {
  it('3-4-5 triangle: alpha = atan(4/3) in gon, distance 100', () => {
    const r = vtoraOsnovnaZadacha(100, 200, 160, 280);
    const expectedGon = (Math.atan(80 / 60) * 200) / Math.PI; // independent closed form
    expect(r.alpha).toBeCloseTo(expectedGon, 3);
    expect(r.distance).toBe(100);
  });

  it('bearing round-trips: X2 = X1 + S cos(alpha), Y2 = Y1 + S sin(alpha)', () => {
    const r = vtoraOsnovnaZadacha(1000.123, 2000.456, 1234.567, 2345.678);
    const rad = (r.alpha * Math.PI) / 200;
    expect(1000.123 + r.distance * Math.cos(rad)).toBeCloseTo(1234.567, 1); // limited by 3dp rounding of alpha/distance
    expect(2000.456 + r.distance * Math.sin(rad)).toBeCloseTo(2345.678, 1);
  });
});

describe('shipped Second Basic Task — rounding contract', () => {
  const r = vtoraOsnovnaZadacha(100, 200, 160, 280);

  it('deltas, distance, tabular angle, alpha, alphaAtan2 and checks are rounded to 3 decimals', () => {
    for (const k of ['deltaX', 'deltaY', 'distance', 'arctanTab', 'alpha', 'alphaAtan2', 'checkDeltaX', 'checkDeltaY', 'differenceX', 'differenceY']) {
      expect(Math.round(r[k] * 1000) / 1000).toBe(r[k]);
    }
  });

  it('tangens, alphaRad, sinAlpha and cosAlpha are rounded to 6 decimals', () => {
    expect(r.tangens).toBe(1.333333);
    expect(r.alphaRad).toBe(0.927295);
    expect(r.sinAlpha).toBe(0.8);
    expect(r.cosAlpha).toBe(0.6);
  });

  it('returns exactly this key set (the full display result the UI consumes)', () => {
    expect(Object.keys(r).sort()).toEqual([
      'alpha', 'alphaAtan2', 'alphaRad', 'arctanTab', 'checkDeltaX', 'checkDeltaY',
      'cosAlpha', 'deltaX', 'deltaY', 'differenceX', 'differenceY', 'distance',
      'quadrant', 'quadrantName', 'sinAlpha', 'tangens',
    ]);
  });
});

describe('shipped Second Basic Task — validation behavior (known gap, characterized not fixed)', () => {
  it('only rejects coincident points; it does NOT validate finiteness (the UI guards NaN before calling)', () => {
    expect(() => vtoraOsnovnaZadacha(5, 5, 5, 5)).toThrow('Точките не могат да съвпадат');
    const r = vtoraOsnovnaZadacha(NaN, 0, 1, 1); // no throw
    expect(Number.isNaN(r.distance)).toBe(true);
    expect(Number.isNaN(r.alpha)).toBe(true);
  });

  it('axis cases yield an Infinity tangens (not persisted) and dx=0 lands in quadrant II/IV labels', () => {
    expect(vtoraOsnovnaZadacha(0, 0, 0, 100).tangens).toBe(Infinity);
    expect(vtoraOsnovnaZadacha(0, 0, 0, -100).tangens).toBe(-Infinity);
  });
});
