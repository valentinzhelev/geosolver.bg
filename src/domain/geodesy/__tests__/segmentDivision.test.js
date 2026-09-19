import { calculateSegmentPoint as divide } from '../segmentDivision';

/**
 * Segment Division — reference + characterization (Milestone 2.0B).
 * Signature: (yA, xA, yB, xB, value, mode)   <- Y first. mode: 'distance' (value = s in metres)
 * or 'ratio' (value = k in [0, 1]). Result: yP, xP (persisted, unrounded), len, s, t, mode.
 */

const close = (a, b, digits = 9) => expect(a).toBeCloseTo(b, digits);

describe('distance mode — segment A=(X0,Y0) to B=(X100,Y0)', () => {
  const at = (s) => divide(0, 0, 0, 100, s, 'distance');
  it('s = 0 is A, midpoint, s = len is B', () => {
    let r = at(0); close(r.xP, 0); close(r.yP, 0); close(r.t, 0);
    r = at(50); close(r.xP, 50); close(r.yP, 0); close(r.t, 0.5);
    r = at(100); close(r.xP, 100); close(r.yP, 0); close(r.t, 1);
    expect(r.len).toBe(100);
  });
});

describe('ratio mode', () => {
  const at = (k) => divide(0, 0, 0, 100, k, 'ratio');
  it('k = 0 is A, k = 0.5 the midpoint, k = 1 is B; s is reported as k * len', () => {
    let r = at(0); close(r.xP, 0); close(r.s, 0);
    r = at(0.5); close(r.xP, 50); close(r.s, 50);
    r = at(1); close(r.xP, 100); close(r.s, 100);
  });
});

describe('diagonal segment (3-4-5): A=(X0,Y0) B=(X30,Y40), length 50', () => {
  it('distance s=10 -> (6, 8), t = 0.2', () => {
    const r = divide(0, 0, 40, 30, 10, 'distance');
    close(r.xP, 6); close(r.yP, 8); close(r.t, 0.2); close(r.len, 50);
  });
  it('ratio k=0.5 -> (15, 20); k=0.25 -> (7.5, 10)', () => {
    let r = divide(0, 0, 40, 30, 0.5, 'ratio');
    close(r.xP, 15); close(r.yP, 20);
    r = divide(0, 0, 40, 30, 0.25, 'ratio');
    close(r.xP, 7.5); close(r.yP, 10);
  });
  it('distance and ratio modes agree for equivalent values (s = k * len)', () => {
    const d = divide(0, 0, 40, 30, 37.5, 'distance');
    const k = divide(0, 0, 40, 30, 0.75, 'ratio');
    close(d.xP, k.xP); close(d.yP, k.yP);
  });
});

describe('argument order is Y first: (yA, xA, yB, xB)', () => {
  it('A=(X10,Y200) B=(X90,Y260): midpoint = (X50, Y230)', () => {
    const r = divide(200, 10, 260, 90, 0.5, 'ratio');
    close(r.xP, 50); close(r.yP, 230);
  });
});

describe('the point always lies on the segment and splits it as requested', () => {
  it.each([[0.1], [0.37], [0.99]])('k=%f', (k) => {
    const [yA, xA, yB, xB] = [-40.5, 12.25, 61.75, 88.5];
    const r = divide(yA, xA, yB, xB, k, 'ratio');
    close(Math.hypot(r.xP - xA, r.yP - yA), k * Math.hypot(xB - xA, yB - yA), 9);
    const cross = (xB - xA) * (r.yP - yA) - (yB - yA) * (r.xP - xA);
    expect(Math.abs(cross)).toBeLessThan(1e-9);
  });
});

describe('validation (current behavior)', () => {
  it('coincident A and B', () => {
    expect(() => divide(5, 5, 5, 5, 1, 'distance')).toThrow('Точките A и B съвпадат');
  });

  it('distance outside [0, len] is rejected (bounds inclusive)', () => {
    expect(() => divide(0, 0, 0, 100, -0.001, 'distance')).toThrow(/извън отсечката/);
    expect(() => divide(0, 0, 0, 100, 100.001, 'distance')).toThrow(/извън отсечката/);
    expect(() => divide(0, 0, 0, 100, 100, 'distance')).not.toThrow();
  });

  it('ratio outside [0, 1] is rejected (bounds inclusive)', () => {
    expect(() => divide(0, 0, 0, 100, -0.1, 'ratio')).toThrow('Пропорцията k трябва да е между 0 и 1');
    expect(() => divide(0, 0, 0, 100, 1.1, 'ratio')).toThrow('Пропорцията k трябва да е между 0 и 1');
    expect(() => divide(0, 0, 0, 100, 1, 'ratio')).not.toThrow();
  });

  it('non-finite values are rejected with a 1-based position', () => {
    expect(() => divide(NaN, 0, 0, 100, 1, 'distance')).toThrow('Невалидна стойност (1)');
    expect(() => divide(0, 0, 0, 100, Infinity, 'distance')).toThrow('Невалидна стойност (5)');
    expect(() => divide(0, 0, 0, 100, '5', 'distance')).toThrow('Невалидна стойност (5)'); // numbers only
  });

  it('the default mode is distance', () => {
    const r = divide(0, 0, 0, 100, 25);
    expect(r.mode).toBe('distance');
    close(r.xP, 25);
  });
});

describe('KNOWN GAP — unknown mode is silently treated as distance (canonical contract must reject it)', () => {
  // DECISION for the future canonical engine: mode must be exactly 'distance' or 'ratio';
  // anything else (including different case, null, or other strings) is a VALIDATION ERROR
  // (code INVALID_MODE). The calculator UI only ever sends 'distance' or 'ratio', so no
  // production UI behavior needs to change; the domain function is left as shipped here and
  // this test pins the lenient behavior so the future change is explicit.
  it('any string other than "ratio" behaves as distance', () => {
    const asDistance = divide(0, 0, 0, 100, 0.5, 'distance');
    for (const mode of ['foo', 'RATIO', 'Ratio', '', null]) {
      const r = divide(0, 0, 0, 100, 0.5, mode);
      close(r.xP, asDistance.xP); // 0.5 m along the segment, NOT the midpoint
      close(r.xP, 0.5);
    }
  });
});
