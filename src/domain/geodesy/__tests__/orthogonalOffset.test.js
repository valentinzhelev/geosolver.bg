import { calculateOrthogonalOffset } from '../orthogonalOffset';
import v1 from '../__fixtures__/orthogonalOffset.v1.legacy.vectors.json';

/**
 * Offset Point — engine v2 (Milestone 2.0B).
 *
 * Product convention: X = NORTH, Y = EAST, bearings clockwise from +X (gon),
 * direction A -> B, positive d = LEFT while looking from A to B, negative d = RIGHT.
 * Facing bearing alpha, "left" is bearing (alpha - 100 gon).
 *
 * Engine v1 (shipped before this milestone) placed positive d on the RIGHT. Those
 * results are historical: they are frozen in orthogonalOffset.v1.legacy.vectors.json
 * and are NOT rewritten. v2 is the mirror image about the segment.
 *
 * Signature: calculateOrthogonalOffset(yA, xA, yB, xB, s, d) — note Y first.
 */

const GON = Math.PI / 200;

// Independent reference: d metres LEFT of A->B, derived from the bearing (not from the code's normal vector).
function leftOffsetByBearing({ xA, yA, xB, yB, s, d }) {
  const len = Math.hypot(xB - xA, yB - yA);
  const bearing = Math.atan2(yB - yA, xB - xA);
  const xOn = xA + (s / len) * (xB - xA);
  const yOn = yA + (s / len) * (yB - yA);
  const leftBearing = bearing - 100 * GON;
  return { xP: xOn + d * Math.cos(leftBearing), yP: yOn + d * Math.sin(leftBearing) };
}

const run = ({ xA, yA, xB, yB, s, d }) => calculateOrthogonalOffset(yA, xA, yB, xB, s, d);
const close = (r, xP, yP) => {
  expect(r.xP).toBeCloseTo(xP, 9);
  expect(r.yP).toBeCloseTo(yP, 9);
};

describe('Offset Point v2 — hand-derived reference cases (positive d = LEFT)', () => {
  describe('north axis: A=(X0,Y0) B=(X100,Y0); left = west (Y decreases)', () => {
    const c = { xA: 0, yA: 0, xB: 100, yB: 0, s: 50 };
    it('d=+10 -> (50, -10)', () => close(run({ ...c, d: 10 }), 50, -10));
    it('d=-10 -> (50, +10)', () => close(run({ ...c, d: -10 }), 50, 10));
  });

  describe('east axis: A=(X0,Y0) B=(X0,Y100); left = north (X increases)', () => {
    const c = { xA: 0, yA: 0, xB: 0, yB: 100, s: 50 };
    it('d=+10 -> (+10, 50)', () => close(run({ ...c, d: 10 }), 10, 50));
    it('d=-10 -> (-10, 50)', () => close(run({ ...c, d: -10 }), -10, 50));
  });

  describe('diagonal: A=(0,0) B=(100,100), bearing 50 gon; left = bearing 350 gon (north-west)', () => {
    const c = { xA: 0, yA: 0, xB: 100, yB: 100, s: Math.hypot(50, 50) };
    it('d=+10 -> (50 + 10/sqrt2, 50 - 10/sqrt2)', () => close(run({ ...c, d: 10 }), 50 + 10 * Math.SQRT1_2, 50 - 10 * Math.SQRT1_2));
    it('d=-10 -> (50 - 10/sqrt2, 50 + 10/sqrt2)', () => close(run({ ...c, d: -10 }), 50 - 10 * Math.SQRT1_2, 50 + 10 * Math.SQRT1_2));
  });

  describe('southward and westward segments (left flips with direction)', () => {
    it('facing south (B at X-100): left = east, so d=+10 -> Y=+10', () => {
      close(run({ xA: 0, yA: 0, xB: -100, yB: 0, s: 50, d: 10 }), -50, 10);
    });
    it('facing west (B at Y-100): left = south, so d=+10 -> X=-10', () => {
      close(run({ xA: 0, yA: 0, xB: 0, yB: -100, s: 50, d: 10 }), -10, -50);
    });
  });

  it('d=0 is the on-segment point for any convention', () => {
    const r = run({ xA: 0, yA: 0, xB: 100, yB: 100, s: Math.hypot(50, 50), d: 0 });
    close(r, 50, 50);
    expect(r.xOn).toBeCloseTo(50, 9);
    expect(r.yOn).toBeCloseTo(50, 9);
  });

  it('s=0: the offset starts at A', () => {
    close(run({ xA: 0, yA: 0, xB: 100, yB: 0, s: 0, d: 10 }), 0, -10);
    close(run({ xA: 0, yA: 0, xB: 100, yB: 0, s: 0, d: 0 }), 0, 0);
  });

  it('s=segment length: the offset starts at B', () => {
    close(run({ xA: 0, yA: 0, xB: 100, yB: 0, s: 100, d: 10 }), 100, -10);
    close(run({ xA: 0, yA: 0, xB: 100, yB: 0, s: 100, d: 0 }), 100, 0);
  });
});

describe('Offset Point v2 — independent bearing-based reference and geometry identities', () => {
  const cases = [
    { xA: 0, yA: 0, xB: 100, yB: 0, s: 50, d: 10 },
    { xA: 0, yA: 0, xB: 0, yB: 100, s: 30, d: 7 },
    { xA: 12.5, yA: -40, xB: 88, yB: 61, s: 40, d: 13.25 },
    { xA: 500000, yA: 4700000, xB: 499950, yB: 4700080, s: 25, d: -8.5 },
    { xA: -30, yA: 10, xB: -80, yB: -90, s: 60, d: 4 },
  ];

  it.each(cases.map((c, i) => [i, c]))('case %i matches the bearing-derived LEFT reference', (_i, c) => {
    const r = run(c);
    const ref = leftOffsetByBearing(c);
    expect(r.xP).toBeCloseTo(ref.xP, 6);
    expect(r.yP).toBeCloseTo(ref.yP, 6);
  });

  it.each(cases.map((c, i) => [i, c]))('case %i: offset length is |d| and perpendicular to A->B', (_i, c) => {
    const r = run(c);
    expect(Math.hypot(r.xP - r.xOn, r.yP - r.yOn)).toBeCloseTo(Math.abs(c.d), 6);
    const dot = (r.xP - r.xOn) * (c.xB - c.xA) + (r.yP - r.yOn) * (c.yB - c.yA);
    expect(dot / Math.hypot(c.xB - c.xA, c.yB - c.yA)).toBeCloseTo(0, 6);
  });

  it('left/right symmetry: +d and -d are mirror images about the segment', () => {
    const c = { xA: 12.5, yA: -40, xB: 88, yB: 61, s: 40 };
    const l = run({ ...c, d: 9 });
    const r = run({ ...c, d: -9 });
    expect((l.xP + r.xP) / 2).toBeCloseTo(l.xOn, 9);
    expect((l.yP + r.yP) / 2).toBeCloseTo(l.yOn, 9);
  });

  it('LEFT is verified with the cross product sign in the X-north/Y-east frame', () => {
    // left of direction (dx, dy) in (X north, Y east): cross(dX,dY ; pX,pY) = dX*pY - dY*pX  is NEGATIVE for a point on the left
    const c = { xA: 0, yA: 0, xB: 37, yB: 91, s: 40, d: 5 };
    const r = run(c);
    const dX = c.xB - c.xA;
    const dY = c.yB - c.yA;
    const vx = r.xP - r.xOn;
    const vy = r.yP - r.yOn;
    expect(dX * vy - dY * vx).toBeLessThan(0);
  });

  it('reports bearing alpha = atan2(dY,dX) in gon (north=0, east=100), unchanged by the fix', () => {
    expect(run({ xA: 0, yA: 0, xB: 100, yB: 0, s: 1, d: 0 }).bearingGon).toBeCloseTo(0, 9);
    expect(run({ xA: 0, yA: 0, xB: 0, yB: 100, s: 1, d: 0 }).bearingGon).toBeCloseTo(100, 9);
    expect(run({ xA: 0, yA: 0, xB: -100, yB: 0, s: 1, d: 0 }).bearingGon).toBeCloseTo(200, 9);
  });
});

describe('Offset Point — legacy engine v1 preserved as historical fixtures', () => {
  it('the v1 fixture is labelled as the historical right-side behavior', () => {
    expect(v1.engineVersion).toBe(1);
    expect(v1.convention).toMatch(/RIGHT/);
    expect(v1.vectors.length).toBeGreaterThanOrEqual(10);
  });

  it.each(v1.vectors.map((v) => [v.name, v]))('v2 is the exact mirror of v1: %s', (_name, v) => {
    const { xA, yA, xB, yB, s, d } = v.input;
    // v1(d) === v2(-d)  <=>  v2(d) === v1(-d): the same segment and foot point, opposite side.
    const mirrored = run({ xA, yA, xB, yB, s, d: -d });
    expect(mirrored.xP).toBeCloseTo(v.result.xP, 9);
    expect(mirrored.yP).toBeCloseTo(v.result.yP, 9);
  });

  it('v1 and v2 differ for every non-zero d (so legacy rows can never be mistaken for v2 results)', () => {
    for (const v of v1.vectors.filter((x) => x.input.d !== 0)) {
      const { xA, yA, xB, yB, s, d } = v.input;
      const now = run({ xA, yA, xB, yB, s, d });
      expect(Math.hypot(now.xP - v.result.xP, now.yP - v.result.yP)).toBeGreaterThan(Math.abs(d));
    }
  });

  it('v1 and v2 agree when d = 0 (the offset foot point is version-independent)', () => {
    const zero = v1.vectors.find((x) => x.input.d === 0);
    const { xA, yA, xB, yB, s } = zero.input;
    close(run({ xA, yA, xB, yB, s, d: 0 }), zero.result.xP, zero.result.yP);
  });
});

describe('Offset Point — validation (unchanged by the fix)', () => {
  it('rejects coincident A/B, s outside [0, len], and non-finite values', () => {
    expect(() => run({ xA: 1, yA: 1, xB: 1, yB: 1, s: 0, d: 0 })).toThrow('Точките A и B съвпадат');
    expect(() => run({ xA: 0, yA: 0, xB: 100, yB: 0, s: 101, d: 0 })).toThrow(/извън отсечката/);
    expect(() => run({ xA: 0, yA: 0, xB: 100, yB: 0, s: -1, d: 0 })).toThrow(/извън отсечката/);
    expect(() => run({ xA: 0, yA: 0, xB: 100, yB: 0, s: NaN, d: 0 })).toThrow('Невалидна стойност');
    expect(() => run({ xA: 0, yA: 0, xB: 100, yB: 0, s: 5, d: Infinity })).toThrow('Невалидна стойност');
  });

  it('s exactly 0 and exactly len are accepted (inclusive bounds)', () => {
    expect(() => run({ xA: 0, yA: 0, xB: 100, yB: 0, s: 0, d: 1 })).not.toThrow();
    expect(() => run({ xA: 0, yA: 0, xB: 100, yB: 0, s: 100, d: 1 })).not.toThrow();
  });
});
