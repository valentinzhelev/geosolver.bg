import {
  calculateResection, ResectionError, RESECTION_ERROR_CODES, RESECTION_TOLERANCES,
} from '../resection';
import { calculateResection as calculateResectionFromIndex } from '../index';
import { calculateResectionV1 } from '../resection.v1';
import legacy from '../__fixtures__/resection.v1.legacy.vectors.json';
import {
  clockwiseGon, circularDiffGon, resectionV2Reference, V2_TOLERANCES,
} from '../__testing__/resectionOracle';

/**
 * PRODUCTION Resection engine v2 (Milestone 2.0C) — directed CLOCKWISE angles.
 *   beta1 = clockwise angle at P from ray P->A to ray P->B, beta2 = from P->B to P->C, 0 < beta < 400 gon.
 *   beta and 400-beta are NOT interchangeable; there is no complement search.
 *
 * Test kinds are labelled in each describe:
 *   REFERENCE     — mathematical evidence (independent atan2/geometry, independent oracle)
 *   VALIDATION    — input/geometry rejection behavior and error codes
 *   DETERMINISM   — identical input, identical output
 *   LEGACY        — v1 is preserved and distinguished from v2
 */

const A = { x: 0, y: 0 };
const B = { x: 100, y: 0 };
const C = { x: 50, y: 80 };
const POINTS = { xA: 0, yA: 0, xB: 100, yB: 0, xC: 50, yC: 80 };
const CENTER = { x: 50, y: 24.375 }; // circumcentre of A, B, C
const RADIUS = 55.625;

const pointsOf = (a, b, c) => ({ xA: a.x, yA: a.y, xB: b.x, yB: b.y, xC: c.x, yC: c.y });
const enteredFor = (a, b, c, P) => ({ beta1: clockwiseGon(a, b, P), beta2: clockwiseGon(b, c, P) });
const onRing = (offset, theta = 2) => ({ x: CENTER.x + (RADIUS + offset) * Math.cos(theta), y: CENTER.y + (RADIUS + offset) * Math.sin(theta) });
const solveFor = (a, b, c, P) => calculateResection(pointsOf(a, b, c), enteredFor(a, b, c, P));
const errorOf = (fn) => {
  try {
    fn();
  } catch (e) {
    expect(e).toBeInstanceOf(ResectionError);
    expect(e).toBeInstanceOf(Error);
    expect(typeof e.message).toBe('string');
    return e;
  }
  return null;
};
const codeOf = (fn) => (errorOf(fn) || { code: null }).code;

describe('REFERENCE — well-conditioned stations are recovered exactly as entered', () => {
  it.each([[50, 35], [40.5, 30.25], [45.75, 20.5], [55, 60.25], [37.5, 22.25]])('interior station (%f, %f)', (x, y) => {
    const r = solveFor(A, B, C, { x, y });
    expect(r.xP).toBeCloseTo(x, 8);
    expect(r.yP).toBeCloseTo(y, 8);
    expect(r.conditionNumber).toBeLessThan(20);
    expect(Math.max(r.error1, r.error2)).toBeLessThan(1e-9);
    expect(r.method).toBe('circle-intersection');
  });

  it.each([[30, -40], [140, 90], [-60, 20], [207.2512871487786, 49.321070637566926], [11, 6], [67, 48]])(
    'exterior / near-side station (%f, %f) — directed angles make these unambiguous',
    (x, y) => {
      const r = solveFor(A, B, C, { x, y });
      expect(r.xP).toBeCloseTo(x, 6);
      expect(r.yP).toBeCloseTo(y, 6);
    }
  );

  it('reports distances to the control points and the angles it reproduces at P', () => {
    const P = { x: 50, y: 35 };
    const r = solveFor(A, B, C, P);
    expect(r.distAP).toBeCloseTo(Math.hypot(P.x - A.x, P.y - A.y), 8);
    expect(r.distBP).toBeCloseTo(Math.hypot(P.x - B.x, P.y - B.y), 8);
    expect(r.distCP).toBeCloseTo(Math.hypot(P.x - C.x, P.y - C.y), 8);
    expect(r.calcBeta1).toBeCloseTo(clockwiseGon(A, B, P), 8);
    expect(r.calcBeta2).toBeCloseTo(clockwiseGon(B, C, P), 8);
  });

  it('is exported through the domain index and returns the fields the Resection UI reads', () => {
    expect(calculateResectionFromIndex).toBe(calculateResection);
    const r = solveFor(A, B, C, { x: 50, y: 35 });
    for (const key of ['xP', 'yP', 'distAP', 'distBP', 'distCP', 'calcBeta1', 'calcBeta2', 'error1', 'error2', 'method', 'calculationDetails']) {
      expect(r).toHaveProperty(key);
    }
  });

  it('valid directed input whose angles sum to 400 gon or more is accepted (no "beta1 + beta2 < 400" rule)', () => {
    let found = null;
    for (let x = -150; x <= 250 && !found; x += 5) {
      for (let y = -120; y <= 200 && !found; y += 5) {
        const P = { x, y };
        if (Math.abs(Math.hypot(x - CENTER.x, y - CENTER.y) - RADIUS) < 3) continue;
        const e = enteredFor(A, B, C, P);
        if (e.beta1 + e.beta2 >= 400) found = { P, ...e };
      }
    }
    expect(found).not.toBeNull();
    const r = calculateResection(POINTS, { beta1: found.beta1, beta2: found.beta2 });
    expect(r.xP).toBeCloseTo(found.P.x, 6);
    expect(r.yP).toBeCloseTo(found.P.y, 6);
  });

  it('no complement search: a pair and its complement are different inputs with their own answers', () => {
    const P = { x: 40.5, y: 30.25 };
    const { beta1, beta2 } = enteredFor(A, B, C, P);
    const own = calculateResection(POINTS, { beta1, beta2 });
    expect(Math.hypot(own.xP - P.x, own.yP - P.y)).toBeLessThan(1e-6);
    const flipped = errorOf(() => calculateResection(POINTS, { beta1: 400 - beta1, beta2: 400 - beta2 }));
    if (flipped) {
      expect([RESECTION_ERROR_CODES.INCONSISTENT_ANGLES, RESECTION_ERROR_CODES.UNSTABLE_GEOMETRY]).toContain(flipped.code);
    } else {
      const other = calculateResection(POINTS, { beta1: 400 - beta1, beta2: 400 - beta2 });
      expect(Math.hypot(other.xP - P.x, other.yP - P.y)).toBeGreaterThan(1);
    }
  });
});

describe('REFERENCE — the previously proven ambiguous P / Q case', () => {
  const P = { x: -60, y: 20 };
  const Q = { x: 207.2512871487786, y: 49.321070637566926 };

  it("P's directed angles return P; Q's directed angles return Q", () => {
    const atP = calculateResection(POINTS, enteredFor(A, B, C, P));
    const atQ = calculateResection(POINTS, enteredFor(A, B, C, Q));
    expect(Math.hypot(atP.xP - P.x, atP.yP - P.y)).toBeLessThan(1e-6);
    expect(Math.hypot(atQ.xP - Q.x, atQ.yP - Q.y)).toBeLessThan(1e-6);
    expect(Math.hypot(atP.xP - atQ.xP, atP.yP - atQ.yP)).toBeGreaterThan(200);
  });

  it('is decided by the entered numbers alone — a 1e-13 gon perturbation cannot flip the station', () => {
    const e = enteredFor(A, B, C, P);
    const one = calculateResection(POINTS, e);
    const two = calculateResection(POINTS, { beta1: e.beta1 + 1e-13, beta2: e.beta2 - 1e-13 });
    expect(Math.hypot(one.xP - two.xP, one.yP - two.yP)).toBeLessThan(1e-8);
  });
});

describe('REFERENCE — scale and coordinate magnitude', () => {
  it.each([1e-3, 1, 1e3])('scale %s: the result scales with the geometry and the residual stays at noise level', (s) => {
    const P = { x: 37.5 * s, y: 22.25 * s };
    const r = solveFor({ x: A.x * s, y: A.y * s }, { x: B.x * s, y: B.y * s }, { x: C.x * s, y: C.y * s }, P);
    expect(Math.hypot(r.xP - P.x, r.yP - P.y) / s).toBeLessThan(1e-8);
    expect(Math.max(r.error1, r.error2)).toBeLessThan(RESECTION_TOLERANCES.residualGon);
  });

  it('UTM-like coordinates (500000 / 4700000 origin, 100 m triangle) are reproduced to a micrometre', () => {
    const o = { x: 500000, y: 4700000 };
    const P = { x: o.x + 37.5, y: o.y + 22.25 };
    const r = solveFor({ x: o.x, y: o.y }, { x: o.x + 100, y: o.y }, { x: o.x + 50, y: o.y + 80 }, P);
    expect(Math.hypot(r.xP - P.x, r.yP - P.y)).toBeLessThan(1e-6);
  });

  it('scale-free conditioning: the same shape gives the same condition number at 1e-3 and 1e3', () => {
    const k = (s) => solveFor({ x: 0, y: 0 }, { x: 100 * s, y: 0 }, { x: 50 * s, y: 80 * s }, { x: 50 * s, y: 35 * s }).conditionNumber;
    expect(k(1e-3)).toBeCloseTo(k(1), 6);
    expect(k(1e3)).toBeCloseTo(k(1), 6);
  });
});

describe('REFERENCE — production v2 agrees with the independent oracle', () => {
  it('same station and residual on a grid of stations away from the danger circle', () => {
    let n = 0;
    for (let x = -120; x <= 220; x += 17) {
      for (let y = -100; y <= 180; y += 13) {
        const P = { x, y };
        if (Math.abs(Math.hypot(x - CENTER.x, y - CENTER.y) - RADIUS) < 1) continue;
        const e = enteredFor(A, B, C, P);
        let oracle;
        try {
          oracle = resectionV2Reference(POINTS, e);
        } catch {
          expect(errorOf(() => calculateResection(POINTS, e))).not.toBeNull(); // both must refuse
          continue;
        }
        const r = calculateResection(POINTS, e);
        expect(r.xP).toBeCloseTo(oracle.xP, 9);
        expect(r.yP).toBeCloseTo(oracle.yP, 9);
        expect(r.conditionNumber).toBeCloseTo(oracle.kappa, 6);
        n += 1;
      }
    }
    expect(n).toBeGreaterThan(300);
  });

  it('the production tolerances equal the validated preflight tolerances', () => {
    expect(RESECTION_TOLERANCES.residualGon).toBe(1e-6);
    expect(RESECTION_TOLERANCES.kappaMax).toBe(1e4);
    expect(RESECTION_TOLERANCES.collinearSin).toBe(1e-9);
    expect(RESECTION_TOLERANCES).toEqual(expect.objectContaining({
      residualGon: V2_TOLERANCES.residualGon,
      kappaMax: V2_TOLERANCES.kappaMax,
      collinearSin: V2_TOLERANCES.collinearSin,
      coincidentPoints: V2_TOLERANCES.coincidentPoints,
      stationOnControlLineSin: V2_TOLERANCES.stationOnControlLineSin,
    }));
  });

  it('an independent algorithm (the frozen v1 Tienstra solver) agrees wherever v1 is unambiguous', () => {
    const stable = legacy.vectors.filter((v) => !v.noiseDependent);
    expect(stable.length).toBeGreaterThanOrEqual(6);
    for (const v of stable) {
      const v2 = calculateResection(legacy.controlPoints, { beta1: v.input.beta1, beta2: v.input.beta2 });
      const v1 = calculateResectionV1(legacy.controlPoints, { beta1: v.input.beta1, beta2: v.input.beta2 });
      expect(v2.xP).toBeCloseTo(v1.xP, 6);
      expect(v2.yP).toBeCloseTo(v1.yP, 6);
    }
  });
});

describe('VALIDATION — input and geometry rejection with distinguishable reasons', () => {
  const C_ = RESECTION_ERROR_CODES;

  it('non-finite coordinates are INVALID_COORDINATE and non-finite angles INVALID_ANGLE', () => {
    expect(codeOf(() => calculateResection({ ...POINTS, xA: NaN }, { beta1: 50, beta2: 60 }))).toBe(C_.INVALID_COORDINATE);
    expect(codeOf(() => calculateResection({ ...POINTS, yC: Infinity }, { beta1: 50, beta2: 60 }))).toBe(C_.INVALID_COORDINATE);
    expect(codeOf(() => calculateResection({ ...POINTS, xB: '100' }, { beta1: 50, beta2: 60 }))).toBe(C_.INVALID_COORDINATE); // numbers only
    expect(codeOf(() => calculateResection(POINTS, { beta1: NaN, beta2: 60 }))).toBe(C_.INVALID_ANGLE);
    expect(codeOf(() => calculateResection(POINTS, { beta1: 50, beta2: Infinity }))).toBe(C_.INVALID_ANGLE);
    expect(codeOf(() => calculateResection(POINTS, { beta1: '50', beta2: 60 }))).toBe(C_.INVALID_ANGLE);
  });

  it('angles must be strictly inside (0, 400) gon', () => {
    for (const [b1, b2] of [[0, 50], [50, 0], [400, 50], [50, 400], [-5, 50], [50, 401], [1000, 1000]]) {
      expect(codeOf(() => calculateResection(POINTS, { beta1: b1, beta2: b2 }))).toBe(C_.INVALID_ANGLE);
    }
  });

  it('duplicate control points (any pair) are DUPLICATE_CONTROL_POINT', () => {
    expect(codeOf(() => calculateResection({ ...POINTS, xB: 0, yB: 0 }, { beta1: 50, beta2: 60 }))).toBe(C_.DUPLICATE_CONTROL_POINT);
    expect(codeOf(() => calculateResection({ ...POINTS, xC: 100, yC: 0 }, { beta1: 50, beta2: 60 }))).toBe(C_.DUPLICATE_CONTROL_POINT);
    expect(codeOf(() => calculateResection({ ...POINTS, xC: 0, yC: 0 }, { beta1: 50, beta2: 60 }))).toBe(C_.DUPLICATE_CONTROL_POINT);
  });

  it('exactly collinear controls are COLLINEAR_CONTROLS; a NORMALIZED collinearity below 1e-9 is too, at any scale', () => {
    expect(codeOf(() => calculateResection(pointsOf({ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 200, y: 0 }), { beta1: 50, beta2: 60 }))).toBe(C_.COLLINEAR_CONTROLS);
    expect(codeOf(() => calculateResection(pointsOf({ x: 0, y: 0 }, { x: 100, y: 100 }, { x: -50, y: -50 }), { beta1: 50, beta2: 60 }))).toBe(C_.COLLINEAR_CONTROLS);
    expect(codeOf(() => calculateResection(pointsOf(A, B, { x: 200, y: 1e-9 }), { beta1: 50, beta2: 60 }))).toBe(C_.COLLINEAR_CONTROLS);
    for (const s of [1e-3, 1e3]) {
      expect(codeOf(() => calculateResection(pointsOf({ x: 0, y: 0 }, { x: 100 * s, y: 0 }, { x: 200 * s, y: 1e-9 * s }), { beta1: 50, beta2: 60 }))).toBe(C_.COLLINEAR_CONTROLS);
    }
  });

  it('nearly collinear controls with a well-placed station are numerically stable and ACCEPTED (v1 returned a wrong point here)', () => {
    for (const off of [1, 0.001, 1e-6]) {
      const r = solveFor(A, B, { x: 200, y: off }, { x: 100, y: 40 });
      expect(r.xP).toBeCloseTo(100, 6);
      expect(r.yP).toBeCloseTo(40, 6);
    }
  });

  it('a station exactly on the danger circle is DANGER_CIRCLE (several positions)', () => {
    for (const theta of [1.0, 2.0, 4.0, 5.5]) {
      expect(codeOf(() => solveFor(A, B, C, onRing(0, theta)))).toBe(C_.DANGER_CIRCLE);
    }
  });

  it('~1 mm from the danger circle is UNSTABLE_GEOMETRY; at 10 mm, 1 m and 5 m it is accepted and accurate', () => {
    expect(codeOf(() => solveFor(A, B, C, onRing(0.001)))).toBe(C_.UNSTABLE_GEOMETRY);
    for (const off of [0.01, 1, 5]) {
      const P = onRing(off);
      const r = solveFor(A, B, C, P);
      expect(Math.hypot(r.xP - P.x, r.yP - P.y)).toBeLessThan(1e-6);
    }
  });

  it('an entered angle of 0 or 200 gon (station on a control line) is UNSTABLE_GEOMETRY, but a station very near such a line is solved', () => {
    expect(codeOf(() => calculateResection(POINTS, { beta1: 200, beta2: 60 }))).toBe(C_.UNSTABLE_GEOMETRY);
    expect(codeOf(() => calculateResection(POINTS, { beta1: 50, beta2: 200 }))).toBe(C_.UNSTABLE_GEOMETRY);
    for (const y of [1, 0.001]) {
      const r = solveFor(A, B, C, { x: 50, y });
      expect(r.xP).toBeCloseTo(50, 5);
      expect(r.yP).toBeCloseTo(y, 5);
    }
  });

  it('angle pairs no station can produce are INCONSISTENT_ANGLES — never a residual-ranked guess', () => {
    for (const [b1, b2] of [[150, 300], [300, 300], [250, 150]]) {
      const e = errorOf(() => calculateResection(POINTS, { beta1: b1, beta2: b2 }));
      expect(e.code).toBe(C_.INCONSISTENT_ANGLES);
    }
  });

  it('every failure carries a professional Bulgarian message, and the seven failure reasons are distinguishable', () => {
    const failures = [
      [C_.INVALID_COORDINATE, () => calculateResection({ ...POINTS, xA: NaN }, { beta1: 50, beta2: 60 })],
      [C_.INVALID_ANGLE, () => calculateResection(POINTS, { beta1: 0, beta2: 60 })],
      [C_.DUPLICATE_CONTROL_POINT, () => calculateResection({ ...POINTS, xB: 0, yB: 0 }, { beta1: 50, beta2: 60 })],
      [C_.COLLINEAR_CONTROLS, () => calculateResection(pointsOf({ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 200, y: 0 }), { beta1: 50, beta2: 60 })],
      [C_.DANGER_CIRCLE, () => solveFor(A, B, C, onRing(0))],
      [C_.UNSTABLE_GEOMETRY, () => solveFor(A, B, C, onRing(0.001))],
      [C_.INCONSISTENT_ANGLES, () => calculateResection(POINTS, { beta1: 150, beta2: 300 })],
    ];
    const messages = new Set();
    for (const [expectedCode, run] of failures) {
      const e = errorOf(run);
      expect(e.code).toBe(expectedCode);
      expect(e.message).toMatch(/[А-Яа-я]{4,}/); // Bulgarian text
      expect(e.message).not.toMatch(/^[A-Z_]+$/); // never a bare code
      messages.add(e.message);
    }
    expect(messages.size).toBe(failures.length); // no two reasons share a message
    expect(failures.map(([code]) => code).sort()).toEqual(Object.values(C_).sort());
  });

  it('the error code set is exactly the documented concepts', () => {
    expect(Object.keys(RESECTION_ERROR_CODES).sort()).toEqual([
      'COLLINEAR_CONTROLS', 'DANGER_CIRCLE', 'DUPLICATE_CONTROL_POINT', 'INCONSISTENT_ANGLES',
      'INVALID_ANGLE', 'INVALID_COORDINATE', 'UNSTABLE_GEOMETRY',
    ]);
  });
});

describe('DETERMINISM', () => {
  it('repeated identical execution returns byte-identical results (25 runs, several inputs)', () => {
    for (const P of [{ x: 37.123, y: 41.987 }, { x: -60, y: 20 }, { x: 207.2512871487786, y: 49.321070637566926 }, onRing(0.5)]) {
      const args = [POINTS, enteredFor(A, B, C, P)];
      const first = calculateResection(...args);
      for (let i = 0; i < 25; i++) expect(calculateResection(...args)).toEqual(first);
    }
  });

  it('the result never depends on a residual comparison between different stations (no candidate list)', () => {
    // If v2 still ranked candidates by residual, feeding a pair together with an alternative exact
    // station's pair could flip the answer. Each input must return exactly its own directed station.
    const stations = [{ x: -60, y: 20 }, { x: 67, y: 48 }, { x: 11, y: 6 }, { x: 81, y: 27 }, { x: 53, y: 62 }];
    for (const P of stations) {
      const r = calculateResection(POINTS, enteredFor(A, B, C, P));
      expect(Math.hypot(r.xP - P.x, r.yP - P.y)).toBeLessThan(1e-6);
    }
  });
});

describe('LEGACY — v1 is preserved, frozen and explicitly distinguished from v2', () => {
  it('v1 and v2 are separate functions in separate modules', () => {
    expect(calculateResectionV1).not.toBe(calculateResection);
    expect(calculateResectionV1(legacy.controlPoints, { beta1: 122.239955, beta2: 138.880022 }).method).toBe('Tienstra');
    expect(calculateResection(legacy.controlPoints, { beta1: 122.239955, beta2: 138.880022 }).method).toBe('circle-intersection');
  });

  it('v2 returns the entered-directed station for EVERY frozen v1 vector, including those where v1 returned an alternative station', () => {
    let alternatives = 0;
    for (const v of legacy.vectors) {
      const r = calculateResection(legacy.controlPoints, { beta1: v.input.beta1, beta2: v.input.beta2 });
      expect(r.xP).toBeCloseTo(v.trueDirectedStation.xP, 6);
      expect(r.yP).toBeCloseTo(v.trueDirectedStation.yP, 6);
      if (v.category === 'ambiguous-returned-ALTERNATIVE-station') {
        alternatives += 1;
        expect(Math.hypot(r.xP - v.v1.xP, r.yP - v.v1.yP)).toBeGreaterThan(1); // v2 does NOT reproduce v1's alternative station
      }
    }
    expect(alternatives).toBeGreaterThanOrEqual(5);
  });

  it('inputs v1 silently answered badly are handled explicitly by v2', () => {
    const special = (s) => legacy.specials.find((x) => x.name.includes(s));
    const sum400 = special('sum to 400').input; // beta2 = 200 gon: station on a control line
    expect(codeOf(() => calculateResection(legacy.controlPoints, { beta1: sum400.beta1, beta2: sum400.beta2 }))).toBe(RESECTION_ERROR_CODES.UNSTABLE_GEOMETRY);
    const near = special('nearly collinear').input; // v1 returned a poor solution with a 6 gon residual
    const r = calculateResection(
      { xA: near.xA, yA: near.yA, xB: near.xB, yB: near.yB, xC: near.xC, yC: near.yC },
      { beta1: near.beta1, beta2: near.beta2 }
    );
    expect(r.xP).toBeCloseTo(100, 6);
    expect(r.yP).toBeCloseTo(40, 6);
    expect(r.error1).toBeLessThan(1e-6);
  });

  it('the frozen v1 fixture is untouched: still labelled historical engine 1', () => {
    expect(legacy.engineVersion).toBe(1);
    expect(legacy._about).toMatch(/HISTORICAL/);
    expect(circularDiffGon(0, 0)).toBe(0);
  });
});
