import { calculateResectionV1 as calculateResection } from '../resection.v1';

/**
 * Resection engine v1 (Tienstra) — HISTORICAL CHARACTERIZATION (Milestone 2.0B). These tests run
 * the FROZEN v1 solver (resection.v1.js), which production no longer uses (production is v2,
 * directed clockwise angles — see resection.v2.test.js). Nothing here is evidence that v1 is right.
 * Signature: calculateResection({xA,yA,xB,yB,xC,yC}, {beta1, beta2}) with beta1 = angle APB and
 * beta2 = angle BPC at the station P, in gon.
 *
 * KEY FINDING (see the ambiguity block): the solver tries the four combinations
 * (b1|400-b1, b2|400-b2) and keeps the one with the smallest residual, but the residual accepts
 * a measured angle OR its complement (400 - beta). Exactly-consistent alternative solutions
 * therefore tie at ~1e-14 and the winner is decided by floating-point noise / candidate order.
 * Tests below assert only what is robust: geometric consistency of the returned point, the
 * classic well-conditioned recovery, and the validation/instability behavior as observed.
 */

const A = { x: 0, y: 0 };
const B = { x: 100, y: 0 };
const C = { x: 50, y: 80 };
const POINTS = { xA: A.x, yA: A.y, xB: B.x, yB: B.y, xC: C.x, yC: C.y };

const bearing = (from, to) => Math.atan2(to.y - from.y, to.x - from.x);
// Clockwise angle at station P from the ray P->from to the ray P->to, in gon [0, 400).
const cw = (from, to, P) => {
  let d = bearing(P, to) - bearing(P, from);
  while (d < 0) d += 2 * Math.PI;
  while (d >= 2 * Math.PI) d -= 2 * Math.PI;
  return (d * 200) / Math.PI;
};
const circDiff = (a, b) => {
  const d = Math.abs(a - b) % 400;
  return Math.min(d, 400 - d);
};
// The solver's own acceptance rule, computed independently at a candidate point.
const accepts = (P, b1, b2, tol = 1e-7) => {
  const okAngle = (calc, measured) => circDiff(calc, measured) < tol || circDiff(calc, 400 - measured) < tol;
  return okAngle(cw(A, B, P), b1) && okAngle(cw(B, C, P), b2);
};
const solve = (b1, b2, pts = POINTS) => calculateResection(pts, { beta1: b1, beta2: b2 });
const close = (a, b, digits = 9) => expect(a).toBeCloseTo(b, digits);

describe('well-conditioned geometry (station inside the control triangle, moderate angles)', () => {
  it.each([[50, 35], [40, 30], [60, 30], [50, 50], [45, 20], [55, 60]])(
    'station (%f, %f) is recovered from its exact clockwise angles',
    (x, y) => {
      const P = { x, y };
      const r = solve(cw(A, B, P), cw(B, C, P));
      close(r.xP, x, 8); close(r.yP, y, 8);
      expect(r.error1).toBeLessThan(1e-9);
      expect(r.error2).toBeLessThan(1e-9);
      expect(r.method).toBe('Tienstra');
    }
  );

  it('reports distances to the control points and the angles it reproduces at P', () => {
    const P = { x: 50, y: 35 };
    const r = solve(cw(A, B, P), cw(B, C, P));
    close(r.distAP, Math.hypot(P.x - A.x, P.y - A.y), 8);
    close(r.distBP, Math.hypot(P.x - B.x, P.y - B.y), 8);
    close(r.distCP, Math.hypot(P.x - C.x, P.y - C.y), 8);
    close(r.calcBeta1, cw(A, B, P), 8);
    close(r.calcBeta2, cw(B, C, P), 8);
  });

  it('a larger, differently shaped control triangle also recovers an interior station', () => {
    const pts = { xA: 1000, yA: 1000, xB: 1200, yB: 1000, xC: 1100, yC: 1200 };
    const P = { x: 1100, y: 1060 };
    const ang = (f, t) => cw({ x: f[0], y: f[1] }, { x: t[0], y: t[1] }, P);
    const r = calculateResection(pts, { beta1: ang([1000, 1000], [1200, 1000]), beta2: ang([1200, 1000], [1100, 1200]) });
    close(r.xP, P.x, 7); close(r.yP, P.y, 7);
  });
});

describe('geometric consistency of the returned point (robust property)', () => {
  it('for every grid station where the solver answers, the returned point reproduces the measured angles (or their complements)', () => {
    let answered = 0;
    for (let x = -120; x <= 220; x += 17) {
      for (let y = -100; y <= 180; y += 13) {
        const P = { x, y };
        const b1 = cw(A, B, P);
        const b2 = cw(B, C, P);
        let r;
        try {
          r = solve(b1, b2);
        } catch {
          continue; // unstable geometry (see below)
        }
        answered += 1;
        expect(accepts({ x: r.xP, y: r.yP }, b1, b2)).toBe(true);
        expect(r.error1 + r.error2).toBeLessThan(1e-6);
      }
    }
    expect(answered).toBeGreaterThan(300);
  });

  it('error1/error2 only measure that consistency — they cannot tell a right solution from an alternative exact one', () => {
    const P = { x: 26.643758798791634, y: 75.40931808059139 }; // outside the triangle
    const r = solve(cw(A, B, P), cw(B, C, P));
    expect(r.error1 + r.error2).toBeLessThan(1e-9); // "perfect" residual whichever solution was returned
  });
});

describe('complementary-angle ambiguity (reproducible, pure geometry)', () => {
  // P and Q are two DIFFERENT points; the measured pair (b1, b2) taken at P is accepted at Q too,
  // because acceptance treats an angle and its complement (400 - angle) as equal.
  const P = { x: -60, y: 20 };
  const Q = { x: 207.2512871487786, y: 49.321070637566926 };
  const b1 = cw(A, B, P);
  const b2 = cw(B, C, P);

  it('the same measured pair is consistent with two different stations', () => {
    expect(Math.hypot(P.x - Q.x, P.y - Q.y)).toBeGreaterThan(200);
    expect(accepts(P, b1, b2)).toBe(true);
    expect(accepts(Q, b1, b2)).toBe(true);
  });

  it('the solver returns one of them — which one is not guaranteed by the algorithm', () => {
    const r = solve(b1, b2);
    const nearP = Math.hypot(r.xP - P.x, r.yP - P.y) < 1e-6;
    const nearQ = Math.hypot(r.xP - Q.x, r.yP - Q.y) < 1e-6;
    expect(nearP || nearQ).toBe(true);
  });

  it('even INSIDE the control triangle a station near a triangle side (one angle above ~160 gon) can come back as an alternative solution', () => {
    // Observed on Node 22: (67, 48) with beta2 = 192.7 is not recovered. Only the geometric
    // consistency is asserted (the identity of the returned point is noise-dependent).
    const S = { x: 67, y: 48 };
    const s1 = cw(A, B, S);
    const s2 = cw(B, C, S);
    expect(s2).toBeGreaterThan(160);
    const r = solve(s1, s2);
    expect(accepts({ x: r.xP, y: r.yP }, s1, s2)).toBe(true);
  });
});

describe('unstable and invalid geometry — current behavior', () => {
  it('collinear control points cannot be solved (throws)', () => {
    expect(() => solve(50, 60, { xA: 0, yA: 0, xB: 100, yB: 0, xC: 200, yC: 0 })).toThrow(
      'Неуспешно решаване на обратната засечка (опасен кръг или невалидни ъгли)'
    );
  });

  it('a station exactly on the circumscribed circle (danger circle) cannot be solved (throws)', () => {
    const center = { x: 50, y: 24.375 };
    const radius = 55.625;
    for (const theta of [1.0, 2.0, 4.0, 5.5]) {
      const P = { x: center.x + radius * Math.cos(theta), y: center.y + radius * Math.sin(theta) };
      expect(() => solve(cw(A, B, P), cw(B, C, P))).toThrow('Неуспешно решаване на обратната засечка');
    }
  });

  it('control points that are NEARLY collinear (C 1 m off the line) still recover a good station', () => {
    const pts = { xA: 0, yA: 0, xB: 100, yB: 0, xC: 200, yC: 1 };
    const P = { x: 100, y: 40 };
    const Cn = { x: 200, y: 1 };
    const r = calculateResection(pts, { beta1: cw(A, B, P), beta2: cw(B, Cn, P) });
    close(r.xP, 100, 5); close(r.yP, 40, 5);
  });

  it('control points nearly collinear to 1 mm return a POOR solution WITHOUT throwing (large residual)', () => {
    const pts = { xA: 0, yA: 0, xB: 100, yB: 0, xC: 200, yC: 0.001 };
    const P = { x: 100, y: 40 };
    const Cn = { x: 200, y: 0.001 };
    const r = calculateResection(pts, { beta1: cw(A, B, P), beta2: cw(B, Cn, P) });
    expect(Number.isFinite(r.xP)).toBe(true);
    expect(r.error1).toBeGreaterThan(1); // gon — the residual flags it, but nothing rejects it
    expect(Math.hypot(r.xP - P.x, r.yP - P.y)).toBeGreaterThan(1);
  });

  it('angles whose sum reaches 400 gon return a solution with a HUGE residual instead of an error', () => {
    const r = solve(250, 200);
    expect(Number.isFinite(r.xP)).toBe(true);
    expect(r.error1).toBeGreaterThan(50);
    expect(r.error2).toBeGreaterThan(50);
  });

  it('duplicate control points throw', () => {
    expect(() => solve(50, 60, { ...POINTS, xB: 0, yB: 0 })).toThrow('Точките A, B, C не могат да съвпадат'); // A = B
    expect(() => solve(50, 60, { ...POINTS, xC: 100, yC: 0 })).toThrow('Точките A, B, C не могат да съвпадат'); // B = C
    expect(() => solve(50, 60, { ...POINTS, xC: 0, yC: 0 })).toThrow('Точките A, B, C не могат да съвпадат'); // A = C
  });

  it('angle validation: each angle must be a finite number strictly inside (0, 400)', () => {
    const msg = 'Ъглите β₁ и β₂ трябва да са в интервала (0, 400) гради';
    for (const [b1, b2] of [[0, 50], [50, 0], [400, 50], [50, 400], [-5, 50]]) {
      expect(() => solve(b1, b2)).toThrow(msg);
    }
    expect(() => solve(NaN, 50)).toThrow('β₁ трябва да е валидно число');
    expect(() => solve(50, Infinity)).toThrow('β₂ трябва да е валидно число');
    expect(() => calculateResection({ ...POINTS, xA: NaN }, { beta1: 50, beta2: 60 })).toThrow('XA трябва да е валидно число');
  });

  it('is deterministic: the same input always yields the same output', () => {
    const P = { x: 50, y: 35 };
    const one = solve(cw(A, B, P), cw(B, C, P));
    const two = solve(cw(A, B, P), cw(B, C, P));
    expect(one).toEqual(two);
  });
});
