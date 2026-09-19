import { calculateOrthogonalOffset } from '../orthogonalOffset';

/**
 * Offset Point — SIGN-CONVENTION CHARACTERIZATION (Milestone 2.0 preflight, Part 2).
 *
 * GeoSolver frame: X = NORTH, Y = EAST, bearings measured CLOCKWISE from +X, in gon.
 * Every UI/doc string says "d > 0 = LEFT of A->B" (OffsetPoint.js result text and
 * help line, OffsetPointDocs.js). Facing bearing alpha, "left" is bearing (alpha - 100 gon).
 *
 * FINDING: the shipped code offsets toward (alpha + 100 gon), i.e. the RIGHT in this
 * frame. It uses the perpendicular (nx, ny) = (-uy, ux) as if (x, y) were a math-plane
 * pair, ignoring that geodetic X is the vertical/north axis.
 *
 * This file does NOT fix that. It pins the CURRENT behavior so a later, deliberate
 * decision (fix + engineVersion plan) shows up as an explicit test change, and it
 * computes the DOCUMENTED expectation independently (bearing-based) so the discrepancy
 * itself is asserted.
 *
 * Signature: calculateOrthogonalOffset(yA, xA, yB, xB, s, d) — note Y first.
 */

const GON = Math.PI / 200;

// Independent reference for "d metres to the LEFT of A->B" in the X-north/Y-east frame.
function documentedLeftOffset({ xA, yA, xB, yB, s, d }) {
  const bearing = Math.atan2(yB - yA, xB - xA); // radians, clockwise from +X (north)
  const len = Math.hypot(xB - xA, yB - yA);
  const xOn = xA + (s / len) * (xB - xA);
  const yOn = yA + (s / len) * (yB - yA);
  const leftBearing = bearing - 100 * GON; // left = counter-clockwise = bearing - 100 gon
  return { xP: xOn + d * Math.cos(leftBearing), yP: yOn + d * Math.sin(leftBearing) };
}

const run = ({ xA, yA, xB, yB, s, d }) => calculateOrthogonalOffset(yA, xA, yB, xB, s, d);

describe('Offset Point sign convention — current behavior vs documented "left"', () => {
  describe('CASE A: A=(X0,Y0) B=(X100,Y0), facing NORTH; left = WEST (Y decreases)', () => {
    const c = { xA: 0, yA: 0, xB: 100, yB: 0, s: 50 };

    it('documented convention: d=+10 -> (X=50, Y=-10); d=-10 -> (X=50, Y=+10)', () => {
      const plus = documentedLeftOffset({ ...c, d: 10 });
      const minus = documentedLeftOffset({ ...c, d: -10 });
      expect(plus.xP).toBeCloseTo(50, 9); expect(plus.yP).toBeCloseTo(-10, 9);
      expect(minus.xP).toBeCloseTo(50, 9); expect(minus.yP).toBeCloseTo(10, 9);
    });

    it('CURRENT code: d=+10 -> (X=50, Y=+10) i.e. EAST = RIGHT of the northward direction (mirrored vs docs)', () => {
      const plus = run({ ...c, d: 10 });
      const minus = run({ ...c, d: -10 });
      expect(plus.xP).toBeCloseTo(50, 9); expect(plus.yP).toBeCloseTo(10, 9);
      expect(minus.xP).toBeCloseTo(50, 9); expect(minus.yP).toBeCloseTo(-10, 9);
    });
  });

  describe('CASE B: A=(X0,Y0) B=(X0,Y100), facing EAST; left = NORTH (X increases)', () => {
    const c = { xA: 0, yA: 0, xB: 0, yB: 100, s: 50 };

    it('documented convention: d=+10 -> (X=+10, Y=50); d=-10 -> (X=-10, Y=50)', () => {
      const plus = documentedLeftOffset({ ...c, d: 10 });
      const minus = documentedLeftOffset({ ...c, d: -10 });
      expect(plus.xP).toBeCloseTo(10, 9); expect(plus.yP).toBeCloseTo(50, 9);
      expect(minus.xP).toBeCloseTo(-10, 9); expect(minus.yP).toBeCloseTo(50, 9);
    });

    it('CURRENT code: d=+10 -> (X=-10, Y=50) i.e. SOUTH = RIGHT of the eastward direction (mirrored vs docs)', () => {
      const plus = run({ ...c, d: 10 });
      const minus = run({ ...c, d: -10 });
      expect(plus.xP).toBeCloseTo(-10, 9); expect(plus.yP).toBeCloseTo(50, 9);
      expect(minus.xP).toBeCloseTo(10, 9); expect(minus.yP).toBeCloseTo(50, 9);
    });
  });

  describe('CASE C: A=(0,0) B=(X100,Y100), bearing 50 gon (north-east); left = bearing 350 gon (north-west)', () => {
    const s = Math.hypot(50, 50); // foot of the offset at (50, 50)
    const c = { xA: 0, yA: 0, xB: 100, yB: 100, s };

    it('documented convention: d=+10 -> (X=57.0711, Y=42.9289)', () => {
      const plus = documentedLeftOffset({ ...c, d: 10 });
      expect(plus.xP).toBeCloseTo(50 + 10 * Math.SQRT1_2, 9);
      expect(plus.yP).toBeCloseTo(50 - 10 * Math.SQRT1_2, 9);
    });

    it('CURRENT code: d=+10 -> (X=42.9289, Y=57.0711) (mirrored vs docs)', () => {
      const plus = run({ ...c, d: 10 });
      expect(plus.xP).toBeCloseTo(50 - 10 * Math.SQRT1_2, 9);
      expect(plus.yP).toBeCloseTo(50 + 10 * Math.SQRT1_2, 9);
    });
  });

  it('the discrepancy is exactly a mirror about the segment: current(d) == documented(-d) for every case', () => {
    const cases = [
      { xA: 0, yA: 0, xB: 100, yB: 0, s: 50, d: 10 },
      { xA: 0, yA: 0, xB: 0, yB: 100, s: 30, d: 7 },
      { xA: 12.5, yA: -40, xB: 88, yB: 61, s: 40, d: 13.25 },
    ];
    for (const c of cases) {
      const now = run(c);
      const doc = documentedLeftOffset({ ...c, d: -c.d });
      expect(now.xP).toBeCloseTo(doc.xP, 9);
      expect(now.yP).toBeCloseTo(doc.yP, 9);
    }
  });
});

describe('Offset Point — parts that do NOT depend on the sign decision', () => {
  it('d=0 is the on-segment point, independent of any sign convention', () => {
    const r = run({ xA: 0, yA: 0, xB: 100, yB: 100, s: Math.hypot(50, 50), d: 0 });
    expect(r.xP).toBeCloseTo(50, 9);
    expect(r.yP).toBeCloseTo(50, 9);
    expect(r.xOn).toBeCloseTo(50, 9);
    expect(r.yOn).toBeCloseTo(50, 9);
  });

  it('the offset distance from the segment equals |d| and the offset is perpendicular', () => {
    const r = run({ xA: 12.5, yA: -40, xB: 88, yB: 61, s: 40, d: 13.25 });
    expect(Math.hypot(r.xP - r.xOn, r.yP - r.yOn)).toBeCloseTo(13.25, 9);
    const dot = (r.xP - r.xOn) * (88 - 12.5) + (r.yP - r.yOn) * (61 - -40);
    expect(dot).toBeCloseTo(0, 6);
  });

  it('reports bearing alpha = atan2(dY,dX) in gon (north=0, east=100)', () => {
    expect(run({ xA: 0, yA: 0, xB: 100, yB: 0, s: 1, d: 0 }).bearingGon).toBeCloseTo(0, 9);
    expect(run({ xA: 0, yA: 0, xB: 0, yB: 100, s: 1, d: 0 }).bearingGon).toBeCloseTo(100, 9);
  });

  it('validation: coincident A/B, s outside [0,len], non-finite values', () => {
    expect(() => run({ xA: 1, yA: 1, xB: 1, yB: 1, s: 0, d: 0 })).toThrow('Точките A и B съвпадат');
    expect(() => run({ xA: 0, yA: 0, xB: 100, yB: 0, s: 101, d: 0 })).toThrow(/извън отсечката/);
    expect(() => run({ xA: 0, yA: 0, xB: 100, yB: 0, s: -1, d: 0 })).toThrow(/извън отсечката/);
    expect(() => run({ xA: 0, yA: 0, xB: 100, yB: 0, s: NaN, d: 0 })).toThrow('Невалидна стойност');
  });
});
