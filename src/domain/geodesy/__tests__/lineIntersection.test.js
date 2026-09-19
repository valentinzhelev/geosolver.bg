import { calculateLineIntersection as intersect } from '../lineIntersection';

/**
 * Line Intersection — reference + characterization (Milestone 2.0B).
 * Signature: (x1, y1, x2, y2, x3, y3, x4, y4): line 1 = P1->P2, line 2 = P3->P4.
 * Result: xI, yI (persisted, unrounded), plus t and s (parameters along each line, NOT persisted)
 * and segment flags. Existing thresholds (characterized exactly, not changed):
 *   - a line is degenerate when hypot(dx, dy) < 1e-12
 *   - lines are "parallel" when |dx1*dy2 - dy1*dx2| < 1e-12   (ABSOLUTE cross product, units m^2)
 */

const close = (a, b, digits = 9) => expect(a).toBeCloseTo(b, digits);

describe('hand-known intersections', () => {
  it('orthogonal crossing: (0,0)-(100,0) x (50,-50)-(50,50) meet at (50, 0), t=s=0.5', () => {
    const r = intersect(0, 0, 100, 0, 50, -50, 50, 50);
    close(r.xI, 50); close(r.yI, 0);
    close(r.t, 0.5); close(r.s, 0.5);
    expect(r.onSegment1).toBe(true);
    expect(r.onSegment2).toBe(true);
    expect(r.isSegmentIntersection).toBe(true);
  });

  it('two diagonals: (0,0)-(10,10) x (0,10)-(10,0) meet at (5, 5)', () => {
    const r = intersect(0, 0, 10, 10, 0, 10, 10, 0);
    close(r.xI, 5); close(r.yI, 5);
  });

  it('non-obvious hand solution: y-1 = 2(x-1) and y = 5 - x/2 meet at (2.4, 3.8)', () => {
    const r = intersect(1, 1, 4, 7, 0, 5, 6, 2);
    close(r.xI, 2.4); close(r.yI, 3.8);
  });

  it('argument order: coordinates are (x, y) pairs — X first (unlike the Y-first tools)', () => {
    // line 1 along X at Y=10, line 2 along Y at X=20 -> meet at X=20, Y=10
    const r = intersect(0, 10, 100, 10, 20, 0, 20, 100);
    close(r.xI, 20); close(r.yI, 10);
  });

  it('extended (infinite) lines: the crossing outside the segments is still returned, flagged', () => {
    const r = intersect(0, 0, 1, 0, 5, -5, 5, 5);
    close(r.xI, 5); close(r.yI, 0);
    close(r.t, 5); close(r.s, 0.5);
    expect(r.onSegment1).toBe(false);
    expect(r.onSegment2).toBe(true);
    expect(r.isSegmentIntersection).toBe(false);
  });

  it('segment endpoints are inclusive (t = 1 counts as on the segment)', () => {
    const r = intersect(0, 0, 1, 0, 1, -1, 1, 1);
    close(r.t, 1);
    expect(r.onSegment1).toBe(true);
  });
});

describe('independent identity: the point lies on BOTH lines', () => {
  const cases = [
    [0, 0, 7, 3, 1, 9, 8, -2],
    [-13.5, 4.25, 20.75, 91.5, 60, -30.125, -5.5, 44],
    [500000.5, 4700000.25, 500123.75, 4700100, 500080, 4700200.5, 500150.25, 4699950],
  ];
  it.each(cases.map((c, i) => [i, c]))('case %i', (_i, c) => {
    const [x1, y1, x2, y2, x3, y3, x4, y4] = c;
    const r = intersect(...c);
    // collinearity via cross products (independent of the t/s solution)
    const cross1 = (x2 - x1) * (r.yI - y1) - (y2 - y1) * (r.xI - x1);
    const cross2 = (x4 - x3) * (r.yI - y3) - (y4 - y3) * (r.xI - x3);
    expect(Math.abs(cross1)).toBeLessThan(1e-4);
    expect(Math.abs(cross2)).toBeLessThan(1e-4);
    // and the parameters reproduce the point on both lines
    close(x1 + r.t * (x2 - x1), r.xI, 9); close(y1 + r.t * (y2 - y1), r.yI, 9);
    close(x3 + r.s * (x4 - x3), r.xI, 6); close(y3 + r.s * (y4 - y3), r.yI, 6);
  });
});

describe('parallel and near-parallel lines — the existing 1e-12 threshold, characterized exactly', () => {
  it('exactly parallel, anti-parallel and coincident (collinear) lines are rejected as parallel', () => {
    expect(() => intersect(0, 0, 10, 0, 0, 1, 10, 1)).toThrow('Правите са паралелни — няма пресичане');
    expect(() => intersect(0, 0, 10, 0, 10, 1, 0, 1)).toThrow('Правите са паралелни — няма пресичане');
    expect(() => intersect(0, 0, 10, 0, 3, 0, 20, 0)).toThrow('Правите са паралелни — няма пресичане');
  });

  it('near-parallel over 100 m (1e-6 rad) is ACCEPTED and gives the far crossing at X = -1,000,000', () => {
    // line 1: y = 0; line 2: y = 1 + 1e-6 x  ->  crossing at x = -1e6
    const r = intersect(0, 0, 100, 0, 0, 1, 100, 1 + 100 * 1e-6);
    close(r.xI, -1e6, 3); close(r.yI, 0, 6);
    expect(r.isSegmentIntersection).toBe(false);
  });

  it('the threshold is on |dx1*dy2 - dy1*dx2| < 1e-12: 2e-12 passes, 5e-13 is rejected', () => {
    // unit-length line 1 along x; line 2 is (1, eps) so the cross product equals eps
    expect(() => intersect(0, 0, 1, 0, 0, 0, 1, 2e-12)).not.toThrow();
    expect(() => intersect(0, 0, 1, 0, 0, 0, 1, 5e-13)).toThrow('Правите са паралелни — няма пресичане');
  });

  it('the threshold depends on the LINE LENGTHS, not on the angle between the lines (characterized, not changed)', () => {
    const angle = 1e-7; // radians between the lines, identical in both calls
    const build = (len) => [0, 0, len, 0, 0, 0, len * Math.cos(angle), len * Math.sin(angle)];
    expect(() => intersect(...build(1000))).not.toThrow(); // cross ~ 1e6 * 1e-7 = 0.1
    expect(() => intersect(...build(1e-3))).toThrow('Правите са паралелни — няма пресичане'); // cross ~ 1e-6 * 1e-7 = 1e-13
  });
});

describe('degenerate lines and invalid input', () => {
  it('degenerate first line', () => {
    expect(() => intersect(5, 5, 5, 5, 0, 0, 1, 1)).toThrow('Точките на права 1 съвпадат');
  });

  it('degenerate second line — NOTE the shipped message says "права 1" for line 2 as well (known wording defect, not fixed)', () => {
    expect(() => intersect(0, 0, 1, 1, 5, 5, 5, 5)).toThrow('Точките на права 1 съвпадат');
  });

  it('the degenerate-line threshold is hypot < 1e-12: length 5e-13 is degenerate', () => {
    expect(() => intersect(0, 0, 5e-13, 0, 0, 1, 1, 1)).toThrow('Точките на права 1 съвпадат');
  });

  it('non-finite coordinates are rejected with the 1-based position of the offending value', () => {
    expect(() => intersect(0, 0, 1, 1, NaN, 0, 1, 1)).toThrow('Невалидна координата (5)');
    expect(() => intersect(0, 0, 1, 1, 0, 0, 1, Infinity)).toThrow('Невалидна координата (8)');
    expect(() => intersect('0', 0, 1, 1, 0, 1, 1, 0)).toThrow('Невалидна координата (1)'); // numbers only, no string coercion
  });
});
