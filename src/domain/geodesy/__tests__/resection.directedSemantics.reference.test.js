import {
  clockwiseGon, circularDiffGon, solveDirected, conditionNumber, unsignedCandidateStations,
} from '../__testing__/resectionOracle';

/**
 * REFERENCE / MATHEMATICAL EVIDENCE (Milestone 2.0C) — not a description of shipped behavior.
 * Everything here is derived from geometry with an independent circle-intersection construction
 * (see __testing__/resectionOracle.js); it does not call the shipped Tienstra solver.
 *
 * It answers the product-semantics question with mathematics:
 *   - DIRECTED clockwise angles determine at most one station (proved by construction + grid).
 *   - UNSIGNED angles (beta or 400-beta interchangeable) do not: most entered pairs admit 2-4 stations.
 */

const A = { x: 0, y: 0 };
const B = { x: 100, y: 0 };
const C = { x: 50, y: 80 };
const POINTS = { xA: 0, yA: 0, xB: 100, yB: 0, xC: 50, yC: 80 };
const CENTER = { x: 50, y: 24.375 }; // circumcentre of A, B, C
const RADIUS = 55.625;

const directedAngles = (P) => [clockwiseGon(A, B, P), clockwiseGon(B, C, P)];
const nearDangerCircle = (P, band) => Math.abs(Math.hypot(P.x - CENTER.x, P.y - CENTER.y) - RADIUS) < band;

describe('DIRECTED angles determine at most one station (uniqueness by construction, checked on a grid)', () => {
  it('the circle-intersection construction recovers every station on a 7 m grid', () => {
    let checked = 0;
    for (let x = -150; x <= 250; x += 7) {
      for (let y = -120; y <= 200; y += 7) {
        const P = { x, y };
        if (nearDangerCircle(P, 1)) continue;
        const [b1, b2] = directedAngles(P);
        const s = solveDirected(A, B, C, b1, b2);
        expect(s.status).toBe('ok');
        expect(Math.hypot(s.P.x - x, s.P.y - y)).toBeLessThan(1e-6);
        checked += 1;
      }
    }
    expect(checked).toBeGreaterThan(2000);
  });

  it('no OTHER point reproduces the entered directed pair: every other angle/complement combination either returns the same station or fails the directed check', () => {
    for (let x = -100; x <= 200; x += 19) {
      for (let y = -90; y <= 170; y += 17) {
        const P = { x, y };
        if (nearDangerCircle(P, 2)) continue;
        const [b1, b2] = directedAngles(P);
        for (const [t1, t2] of [[400 - b1, b2], [b1, 400 - b2], [400 - b1, 400 - b2]]) {
          const s = solveDirected(A, B, C, t1, t2);
          if (s.status !== 'ok') continue;
          const samePoint = Math.hypot(s.P.x - P.x, s.P.y - P.y) < 1e-6;
          const reproducesEntered =
            circularDiffGon(clockwiseGon(A, B, s.P), b1) < 1e-6 && circularDiffGon(clockwiseGon(B, C, s.P), b2) < 1e-6;
          expect(samePoint || !reproducesEntered).toBe(true);
        }
      }
    }
  });

  it('the wrong-branch alternative misses the entered angle by ~200 gon, not by a small amount (so no tolerance can confuse them)', () => {
    const P = { x: 40, y: 30 };
    const [b1, b2] = directedAngles(P);
    const s = solveDirected(A, B, C, 400 - b1, b2); // a different station that shares the circle-angle mod 200
    const miss = Math.max(circularDiffGon(clockwiseGon(A, B, s.P), b1), circularDiffGon(clockwiseGon(B, C, s.P), b2));
    expect(miss).toBeGreaterThan(1); // gon — order of magnitude, never near the 1e-6 acceptance tolerance
  });
});

describe('UNSIGNED angles (beta and 400-beta interchangeable) are NOT determinate', () => {
  const histogram = () => {
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0 };
    let total = 0;
    for (let x = -150; x <= 250; x += 11) {
      for (let y = -120; y <= 200; y += 11) {
        const P = { x, y };
        if (nearDangerCircle(P, 3)) continue;
        const [d1, d2] = directedAngles(P);
        const u1 = Math.min(d1, 400 - d1); // a user typing the small angle ∠APB
        const u2 = Math.min(d2, 400 - d2);
        const n = unsignedCandidateStations(POINTS, u1, u2).length;
        counts[n] += 1;
        total += 1;
      }
    }
    return { counts, total };
  };

  it('most entered pairs are consistent with several distinct exact stations', () => {
    const { counts, total } = histogram();
    expect(total).toBeGreaterThan(1000);
    expect(counts[1] / total).toBeLessThan(0.2); // uniquely determined: a small minority
    expect(counts[4] / total).toBeGreaterThan(0.5); // four distinct stations: the majority
    expect(counts[2]).toBeGreaterThan(0);
    expect(counts[3]).toBeGreaterThan(0);
  });

  it('the previously proven P / Q pair: one unsigned pair, two different exact stations', () => {
    const P = { x: -60, y: 20 };
    const Q = { x: 207.2512871487786, y: 49.321070637566926 };
    const [d1, d2] = directedAngles(P);
    const stations = unsignedCandidateStations(POINTS, d1, d2);
    const has = (S) => stations.some((s) => Math.hypot(s.x - S.x, s.y - S.y) < 1e-6);
    expect(has(P)).toBe(true);
    expect(has(Q)).toBe(true);
    expect(stations.length).toBeGreaterThanOrEqual(2);
  });
});

describe('the documented worked example does not support ANY reading of the angles (docs defect, logged not fixed)', () => {
  // ResectionDocs.js: A(Y1209.12,X4047.53) B(Y1289.19,X4214.61) C(Y1400.00,X4100.00), beta1=80, beta2=70
  // documented result Yp = 1417.19, Xp = 4142.16.
  const docPoints = { xA: 4047.53, yA: 1209.12, xB: 4214.61, yB: 1289.19, xC: 4100, yC: 1400 };
  const docResult = { x: 4142.16, y: 1417.19 };

  it('none of the four (angle | complement) readings reproduces the documented station', () => {
    const stations = unsignedCandidateStations(docPoints, 80, 70);
    expect(stations.length).toBeGreaterThan(0);
    for (const s of stations) {
      expect(Math.hypot(s.x - docResult.x, s.y - docResult.y)).toBeGreaterThan(10); // metres away
    }
  });

  it('the documented station itself measures 59.96 / 291.86 gon (directed) or 59.96 / 108.14 (unsigned), not 80 / 70', () => {
    const Ad = { x: docPoints.xA, y: docPoints.yA };
    const Bd = { x: docPoints.xB, y: docPoints.yB };
    const Cd = { x: docPoints.xC, y: docPoints.yC };
    expect(clockwiseGon(Ad, Bd, docResult)).toBeCloseTo(59.9628, 3);
    expect(clockwiseGon(Bd, Cd, docResult)).toBeCloseTo(291.8575, 3);
  });

  it('read as directed angles, (80, 70) has exactly one station: X=4042.44, Y=1337.69', () => {
    const s = solveDirected({ x: docPoints.xA, y: docPoints.yA }, { x: docPoints.xB, y: docPoints.yB }, { x: docPoints.xC, y: docPoints.yC }, 80, 70);
    expect(s.status).toBe('ok');
    expect(s.P.x).toBeCloseTo(4042.4364, 3);
    expect(s.P.y).toBeCloseTo(1337.6871, 3);
  });
});

describe('numerical evidence behind the proposed tolerances', () => {
  // deterministic pseudo-random stream (no Math.random)
  const stream = (seed) => {
    let s = seed;
    return () => {
      s = (s * 1103515245 + 12345) & 0x7fffffff;
      return s / 0x7fffffff;
    };
  };

  it('kappa (angle-Jacobian condition number) is scale-free', () => {
    const P = { x: 50, y: 35 };
    const at = (s) => conditionNumber({ x: A.x * s, y: A.y * s }, { x: B.x * s, y: B.y * s }, { x: C.x * s, y: C.y * s }, { x: P.x * s, y: P.y * s }).kappa;
    expect(at(1e-3)).toBeCloseTo(at(1), 6);
    expect(at(1e3)).toBeCloseTo(at(1), 6);
  });

  it('kappa is small for the documented "strong geometry" and blows up like 1/distance near the danger circle', () => {
    expect(conditionNumber(A, B, C, { x: 50, y: 45 }).kappa).toBeLessThan(5);
    const at = (offset) => {
      const r = RADIUS + offset;
      return conditionNumber(A, B, C, { x: CENTER.x + r * Math.cos(2), y: CENTER.y + r * Math.sin(2) }).kappa;
    };
    expect(at(5)).toBeLessThan(20);
    expect(at(0.1)).toBeGreaterThan(300);
    expect(at(0.001) / at(0.01)).toBeGreaterThan(8); // ~10x per decade of distance
    expect(at(0.001) / at(0.01)).toBeLessThan(12);
  });

  it('residual is bimodal: consistent inputs re-measure to <1e-8 gon (kappa<1e4), wrong-branch inputs miss by ~200 gon — nothing in between', () => {
    const rnd = stream(2024);
    let consistent = 0;
    let wrongBranchMin = Infinity;
    for (let i = 0; i < 4000; i++) {
      const P = { x: -300 + 600 * rnd(), y: -300 + 600 * rnd() };
      if (nearDangerCircle(P, 0.5)) continue;
      const [b1, b2] = directedAngles(P);
      if (conditionNumber(A, B, C, P).kappa > 1e4) continue;
      const s = solveDirected(A, B, C, b1, b2);
      expect(Math.max(circularDiffGon(clockwiseGon(A, B, s.P), b1), circularDiffGon(clockwiseGon(B, C, s.P), b2))).toBeLessThan(1e-8);
      consistent += 1;
      // independent random directed pair (no station behind it)
      const r1 = 1 + 398 * rnd();
      const r2 = 1 + 398 * rnd();
      const q = solveDirected(A, B, C, r1, r2);
      if (q.status !== 'ok') continue;
      const miss = Math.max(circularDiffGon(clockwiseGon(A, B, q.P), r1), circularDiffGon(clockwiseGon(B, C, q.P), r2));
      if (miss > 1e-8) wrongBranchMin = Math.min(wrongBranchMin, miss);
    }
    expect(consistent).toBeGreaterThan(3000);
    expect(wrongBranchMin).toBeGreaterThan(199); // the gap that makes the 1e-6 gon tolerance safe
  });
});
