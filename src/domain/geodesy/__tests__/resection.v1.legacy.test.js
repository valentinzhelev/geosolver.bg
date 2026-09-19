import { calculateResectionV1 as calculateResection } from '../resection.v1';
import legacy from '../__fixtures__/resection.v1.legacy.vectors.json';
import {
  clockwiseGon, circularDiffGon, resectionV2Reference, unsignedCandidateStations, verifyLegacyResection,
  LEGACY_RESECTION_POLICY, legacyResectionCreatePointDecision,
} from '../__testing__/resectionOracle';

/**
 * PART 1 — HISTORICAL CHARACTERIZATION of resection engine v1 (frozen, Milestone 2.0C).
 * These tests record what the SHIPPED solver returned. They are NOT evidence that v1 is right:
 * for many inputs it returns an alternative exact station instead of the one the entered
 * directed angles describe. Values that depend on floating-point tie-breaking are compared by
 * geometric consistency, never by identity.
 *
 * PART 2 — VALIDATION of the proposed legacy verification (REFERENCE): a v1 row is verified by
 * reconstructing the angles its stored station produces and comparing them with its stored
 * input angles — the noise-dependent v1 solver is never re-run, and v2 is never used to
 * "recompute" a v1 row.
 */

const A = { x: 0, y: 0 };
const B = { x: 100, y: 0 };
const C = { x: 50, y: 80 };
const POINTS = legacy.controlPoints;
const anglesOf = (v) => ({ beta1: v.input.beta1, beta2: v.input.beta2 });
const run = (v) => calculateResection(POINTS, anglesOf(v));

// v1's own acceptance rule (an angle OR its complement), computed independently.
const v1Accepts = (P, b1, b2, tol = 1e-7) => {
  const ok = (calc, m) => circularDiffGon(calc, m) < tol || circularDiffGon(calc, 400 - m) < tol;
  return ok(clockwiseGon(A, B, P), b1) && ok(clockwiseGon(B, C, P), b2);
};

describe('HISTORICAL — resection v1 frozen vectors', () => {
  const stable = legacy.vectors.filter((v) => !v.noiseDependent);
  const tied = legacy.vectors.filter((v) => v.noiseDependent);

  it('the fixture is labelled historical and contains both stable and tie-dependent vectors', () => {
    expect(legacy.engineVersion).toBe(1);
    expect(legacy._about).toMatch(/HISTORICAL/);
    expect(stable.length).toBeGreaterThanOrEqual(6);
    expect(tied.length).toBeGreaterThanOrEqual(6);
  });

  it.each(stable.map((v) => [v.name, v]))('stable %s: v1 output equals the frozen value AND the unique directed station', (_n, v) => {
    const r = run(v);
    expect(r.xP).toBeCloseTo(v.v1.xP, 9);
    expect(r.yP).toBeCloseTo(v.v1.yP, 9);
    expect(r.xP).toBeCloseTo(v.trueDirectedStation.xP, 6);
    expect(r.yP).toBeCloseTo(v.trueDirectedStation.yP, 6);
    expect(r.method).toBe('Tienstra');
  });

  it.each(tied.map((v) => [v.name, v]))('tie-dependent %s: v1 returns SOME exactly-consistent station (identity is not asserted)', (_n, v) => {
    const r = run(v);
    expect(v1Accepts({ x: r.xP, y: r.yP }, v.input.beta1, v.input.beta2)).toBe(true);
    expect(r.error1 + r.error2).toBeLessThan(1e-9); // the residual looks perfect either way
  });

  it('the fixture categories agree with an independent re-derivation (candidate counts and directed stations)', () => {
    for (const v of legacy.vectors) {
      expect(unsignedCandidateStations(POINTS, v.input.beta1, v.input.beta2).length).toBe(v.candidateStationCount);
      const directed = resectionV2Reference(POINTS, anglesOf(v));
      expect(directed.xP).toBeCloseTo(v.trueDirectedStation.xP, 6);
      expect(directed.yP).toBeCloseTo(v.trueDirectedStation.yP, 6);
      if (v.category === 'deterministic') expect(v.candidateStationCount).toBe(1);
    }
  });

  it('v1 returned an ALTERNATIVE station (not the entered directed one) for a large share of these vectors — historical rows can hold such results', () => {
    const wrong = legacy.vectors.filter((v) => v.category === 'ambiguous-returned-ALTERNATIVE-station');
    expect(wrong.length).toBeGreaterThanOrEqual(5);
    for (const v of wrong) {
      // recorded value was a genuine alternative exact station: it does NOT reproduce the entered directed angles
      const P = { x: v.v1.xP, y: v.v1.yP };
      expect(circularDiffGon(clockwiseGon(A, B, P), v.input.beta1) > 1 || circularDiffGon(clockwiseGon(B, C, P), v.input.beta2) > 1).toBe(true);
      expect(v1Accepts(P, v.input.beta1, v.input.beta2)).toBe(true); // ...but v1 considered it exact
    }
  });

  it('specials: sum>=400 and nearly-collinear return a bad solution silently; collinear, duplicate and danger-circle inputs throw', () => {
    const bySubstring = (s) => legacy.specials.find((x) => x.name.includes(s));
    const sum400 = bySubstring('sum to 400');
    const r1 = calculateResection(POINTS, { beta1: sum400.input.beta1, beta2: sum400.input.beta2 });
    expect(r1.error1).toBeGreaterThan(50);
    const near = bySubstring('nearly collinear');
    const r2 = calculateResection(
      { xA: near.input.xA, yA: near.input.yA, xB: near.input.xB, yB: near.input.yB, xC: near.input.xC, yC: near.input.yC },
      { beta1: near.input.beta1, beta2: near.input.beta2 }
    );
    expect(r2.error1).toBeGreaterThan(1);
    for (const s of legacy.specials.filter((x) => x.v1.ok === false)) {
      const { beta1, beta2, ...pts } = s.input;
      expect(() => calculateResection(pts, { beta1, beta2 })).toThrow();
    }
    expect(legacy.specials.filter((x) => x.v1.ok === false).length).toBe(3);
  });
});

// ---------- PART 2: legacy verification (REFERENCE) ----------
const stream = (seed) => {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
};
const round3 = (v) => Math.round(v * 1000) / 1000;

// Stations at NON-integer coordinates so the 3 dp rounding of the stored result is real.
function legacyRows(count, seed) {
  const rnd = stream(seed);
  const rows = [];
  while (rows.length < count) {
    const P = { x: -150 + 400 * rnd(), y: -120 + 320 * rnd() };
    if (Math.abs(Math.hypot(P.x - 50, P.y - 24.375) - 55.625) < 2) continue;
    const beta1 = clockwiseGon(A, B, P);
    const beta2 = clockwiseGon(B, C, P);
    let r;
    try {
      r = calculateResection(POINTS, { beta1, beta2 });
    } catch {
      continue;
    }
    const stored = { xP: round3(r.xP), yP: round3(r.yP) }; // exactly what the calculator persists
    const directed = resectionV2Reference(POINTS, { beta1, beta2 });
    const v1WasDirected = Math.hypot(r.xP - directed.xP, r.yP - directed.yP) < 1e-6;
    rows.push({ beta1, beta2, stored, v1WasDirected });
  }
  return rows;
}

describe('REFERENCE — validating the proposed legacy (engineVersion 1) verification', () => {
  const rows = legacyRows(600, 7);

  it('a v1 row whose stored station is the directed one verifies as DIRECTED_MATCH, and only via the rounding-derived tolerance', () => {
    let maxRatio = 0;
    let n = 0;
    for (const row of rows.filter((x) => x.v1WasDirected)) {
      const v = verifyLegacyResection(POINTS, row, row.stored);
      if (v.verdict === 'UNSTABLE') continue;
      expect(v.verdict).toBe('DIRECTED_MATCH');
      maxRatio = Math.max(maxRatio, v.ratio);
      n += 1;
    }
    expect(n).toBeGreaterThan(100);
    expect(maxRatio).toBeLessThanOrEqual(1); // the derived tolerance is a true bound on the 3 dp rounding error
    expect(maxRatio).toBeGreaterThan(0.02); // and it is not vacuous: rounding error is actually being consumed
  });

  it('a v1 row holding an alternative exact station verifies only as COMPLEMENT_ONLY — never as verified-as-entered, never as a mismatch', () => {
    const alternatives = rows.filter((x) => !x.v1WasDirected);
    expect(alternatives.length).toBeGreaterThan(50);
    for (const row of alternatives) {
      const v = verifyLegacyResection(POINTS, row, row.stored);
      if (v.verdict === 'UNSTABLE') continue;
      expect(v.verdict).toBe('COMPLEMENT_ONLY');
    }
  });

  it('corrupted or forged stored coordinates are MISMATCH (shifts of 1 cm or more, swapped axes, sign flips, other stations)', () => {
    const verdicts = { detected: {}, total: rows.length };
    for (const s of [0.01, 0.05, 1, 25]) verdicts.detected[s] = 0;
    let swapped = 0;
    let flipped = 0;
    let other = 0;
    for (const row of rows) {
      for (const s of [0.01, 0.05, 1, 25]) {
        const v = verifyLegacyResection(POINTS, row, { xP: row.stored.xP, yP: row.stored.yP + s });
        if (v.verdict === 'MISMATCH' || v.verdict === 'UNSTABLE') verdicts.detected[s] += 1;
      }
      const sw = verifyLegacyResection(POINTS, row, { xP: row.stored.yP, yP: row.stored.xP });
      if (sw.verdict !== 'DIRECTED_MATCH' && sw.verdict !== 'COMPLEMENT_ONLY') swapped += 1;
      const fl = verifyLegacyResection(POINTS, row, { xP: -row.stored.xP, yP: row.stored.yP });
      if (fl.verdict !== 'DIRECTED_MATCH' && fl.verdict !== 'COMPLEMENT_ONLY') flipped += 1;
      const oth = verifyLegacyResection(POINTS, row, { xP: row.stored.xP + 500, yP: row.stored.yP - 500 });
      if (oth.verdict !== 'DIRECTED_MATCH' && oth.verdict !== 'COMPLEMENT_ONLY') other += 1;
    }
    expect(verdicts.detected[0.01] / verdicts.total).toBeGreaterThan(0.99);
    expect(verdicts.detected[0.05]).toBe(verdicts.total);
    expect(verdicts.detected[1]).toBe(verdicts.total);
    expect(verdicts.detected[25]).toBe(verdicts.total);
    expect(swapped / rows.length).toBeGreaterThan(0.95);
    expect(flipped / rows.length).toBeGreaterThan(0.95);
    expect(other).toBe(rows.length);
  });

  it('the resolution is the rounding scale: a 2 mm shift is usually indistinguishable from rounding (documented limit, not a defect)', () => {
    let accepted = 0;
    for (const row of rows) {
      const v = verifyLegacyResection(POINTS, row, { xP: row.stored.xP, yP: row.stored.yP + 0.002 });
      if (v.verdict === 'DIRECTED_MATCH' || v.verdict === 'COMPLEMENT_ONLY') accepted += 1;
    }
    expect(accepted / rows.length).toBeGreaterThan(0.3);
  });

  it('a stored station in ill-conditioned geometry is UNSTABLE — the check cannot bound a forgery there, so it must not verify', () => {
    const P = { x: 50 + 55.626 * Math.cos(2), y: 24.375 + 55.626 * Math.sin(2) }; // ~1 mm outside the danger circle
    const beta1 = clockwiseGon(A, B, P);
    const beta2 = clockwiseGon(B, C, P);
    expect(verifyLegacyResection(POINTS, { beta1, beta2 }, { xP: P.x, yP: P.y }).verdict).toBe('UNSTABLE');
  });

  it('non-finite or missing stored values and a station on a control point are MISMATCH', () => {
    const row = rows[0];
    expect(verifyLegacyResection(POINTS, row, { xP: NaN, yP: 1 }).verdict).toBe('MISMATCH');
    expect(verifyLegacyResection(POINTS, row, { xP: undefined, yP: 1 }).verdict).toBe('MISMATCH');
    expect(verifyLegacyResection(POINTS, row, { xP: 0, yP: 0 }).verdict).toBe('MISMATCH'); // on control A
  });

  it('it never re-runs a solver: the verdict depends only on the stored point and the stored angles', () => {
    const row = rows[3];
    const a = verifyLegacyResection(POINTS, row, row.stored);
    const b = verifyLegacyResection(POINTS, row, row.stored);
    expect(a).toEqual(b);
  });
});

describe('REFERENCE — STRICT legacy Save-as-point policy for engineVersion 1 resection rows', () => {
  const rows = legacyRows(300, 11);

  it('the policy table: only DIRECTED_MATCH is allowed; everything else is blocked with a distinct code and there is no override', () => {
    expect(LEGACY_RESECTION_POLICY.DIRECTED_MATCH).toEqual({ allowed: true });
    expect(LEGACY_RESECTION_POLICY.COMPLEMENT_ONLY).toEqual({ allowed: false, code: 'LEGACY_RESECTION_ALTERNATIVE_SOLUTION' });
    expect(LEGACY_RESECTION_POLICY.MISMATCH).toEqual({ allowed: false, code: 'RESULT_MISMATCH' });
    expect(LEGACY_RESECTION_POLICY.UNSTABLE).toEqual({ allowed: false, code: 'LEGACY_RESECTION_UNSTABLE' });
    expect(Object.keys(LEGACY_RESECTION_POLICY).sort()).toEqual(['COMPLEMENT_ONLY', 'DIRECTED_MATCH', 'MISMATCH', 'UNSTABLE']);
    // no "continue anyway": the decision function takes exactly (points, angles, stored)
    expect(legacyResectionCreatePointDecision.length).toBe(3);
    expect(Object.isFrozen(LEGACY_RESECTION_POLICY)).toBe(true);
  });

  it('DIRECTED_MATCH rows are allowed; alternative-station (COMPLEMENT_ONLY) rows are BLOCKED', () => {
    let allowed = 0;
    let blocked = 0;
    for (const row of rows) {
      const d = legacyResectionCreatePointDecision(POINTS, row, row.stored);
      if (d.verdict === 'UNSTABLE') {
        expect(d.allowed).toBe(false);
        continue;
      }
      if (row.v1WasDirected) {
        expect(d).toEqual({ verdict: 'DIRECTED_MATCH', allowed: true });
        allowed += 1;
      } else {
        expect(d).toEqual({ verdict: 'COMPLEMENT_ONLY', allowed: false, code: 'LEGACY_RESECTION_ALTERNATIVE_SOLUTION' });
        blocked += 1;
      }
    }
    expect(allowed).toBeGreaterThan(20);
    expect(blocked).toBeGreaterThan(20);
  });

  it('forged / corrupted rows are BLOCKED as RESULT_MISMATCH', () => {
    for (const row of rows.slice(0, 100)) {
      const d = legacyResectionCreatePointDecision(POINTS, row, { xP: row.stored.xP + 500, yP: row.stored.yP - 500 });
      expect(d.allowed).toBe(false);
      expect(['RESULT_MISMATCH', 'LEGACY_RESECTION_UNSTABLE']).toContain(d.code);
    }
  });

  it('ill-conditioned rows are BLOCKED as unstable', () => {
    const P = { x: 50 + 55.626 * Math.cos(2), y: 24.375 + 55.626 * Math.sin(2) };
    const d = legacyResectionCreatePointDecision(POINTS, { beta1: clockwiseGon(A, B, P), beta2: clockwiseGon(B, C, P) }, { xP: P.x, yP: P.y });
    expect(d).toEqual({ verdict: 'UNSTABLE', allowed: false, code: 'LEGACY_RESECTION_UNSTABLE' });
  });

  it('a v1 row is NEVER "verified" by re-running v2: an alternative v1 station stays blocked even though v2 would compute a different (directed) station for the same input', () => {
    const alt = legacy.vectors.find((v) => v.category === 'ambiguous-returned-ALTERNATIVE-station');
    const stored = { xP: Math.round(alt.v1.xP * 1000) / 1000, yP: Math.round(alt.v1.yP * 1000) / 1000 };
    const d = legacyResectionCreatePointDecision(POINTS, anglesOf(alt), stored);
    expect(d.allowed).toBe(false);
    expect(d.verdict).toBe('COMPLEMENT_ONLY');
    const v2 = resectionV2Reference(POINTS, anglesOf(alt));
    expect(Math.hypot(v2.xP - stored.xP, v2.yP - stored.yP)).toBeGreaterThan(1);
  });
});
