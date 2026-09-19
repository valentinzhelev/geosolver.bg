/**
 * RESECTION TEST ORACLE + PROPOSED v2 CONTRACT REFERENCE (Milestone 2.0C).
 *
 * NOT PRODUCTION CODE. Production engine v2 is domain/geodesy/resection.js; the historical
 * v1 solver is frozen in resection.v1.js. This module is an INDEPENDENT re-derivation (test
 * oracle) used to cross-check production v2 and to prove the mathematics of the confirmed
 * "directed angles" semantics without relying on the production code path:
 *
 *   beta1 = clockwise angle at P from ray P->A to ray P->B   (gon, in (0, 400))
 *   beta2 = clockwise angle at P from ray P->B to ray P->C
 *
 * Construction (no candidate search, no residual tie-breaking): the locus of stations that
 * see chord A->B under the directed angle beta1 (mod 200) is a circle; likewise B->C. The two
 * circles share B, so the station is the SECOND intersection = the reflection of B across the
 * line of centres. Two distinct circles meet in at most two points, one of which is B, so
 * there is AT MOST ONE station for a directed pair — uniqueness follows from the construction.
 * The branch (mod 400) is then verified against the entered angles.
 *
 * Frame: X = north, Y = east, angles clockwise from +X, gon.
 */

const GON = Math.PI / 200;
const RAD_TO_GON = 200 / Math.PI;

/** Numeric tolerances of the PROPOSED v2 contract, each with its derivation. */
export const V2_TOLERANCES = {
  // Consistent inputs re-measure to <= 1.7e-10 gon (kappa < 1e4, 20k random stations); a wrong
  // branch misses by ~200 gon. 1e-6 sits ~4 orders above the noise floor and ~8 below the gap.
  residualGon: 1e-6,
  // Noise floor was measured for kappa < 1e4 only; beyond that the input is treated as singular.
  // kappa ~ 7e3 is ~10 mm from the danger circle for the reference triangle; kappa is scale-free.
  kappaMax: 1e4,
  // Normalized cross product (= sin of the angle at B). Float noise of a UTM-scale (1e7 m)
  // coordinate difference over a 10 m edge is ~2e-10, so 1e-9 clears it.
  collinearSin: 1e-9,
  // Same absolute length test the shipped solver uses for coincident control points.
  coincidentPoints: 1e-12,
  // |sin(beta)| below this puts the station on the line through two control points (circle -> line).
  stationOnControlLineSin: 1e-9,
};

export class ResectionError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

const isFiniteNumber = (v) => typeof v === 'number' && Number.isFinite(v);

export function clockwiseGon(from, to, P) {
  let d = Math.atan2(to.y - P.y, to.x - P.x) - Math.atan2(from.y - P.y, from.x - P.x);
  while (d < 0) d += 2 * Math.PI;
  while (d >= 2 * Math.PI) d -= 2 * Math.PI;
  return d * RAD_TO_GON;
}

export function circularDiffGon(a, b) {
  const d = Math.abs(a - b) % 400;
  return Math.min(d, 400 - d);
}

// Centre of the circle over chord F->T whose points see the chord under directed angle theta (mod 200).
function circleCenter(F, T, thetaGon) {
  const dx = T.x - F.x;
  const dy = T.y - F.y;
  const len = Math.hypot(dx, dy);
  const offset = len / 2 / Math.tan(thetaGon * GON);
  return { x: (F.x + T.x) / 2 + offset * (-dy / len), y: (F.y + T.y) / 2 + offset * (dx / len), r: Math.hypot(offset, len / 2) };
}

/** Second intersection of the two circles (reflection of B across the line of centres). */
export function solveDirected(A, B, C, theta1, theta2) {
  const O1 = circleCenter(A, B, theta1);
  const O2 = circleCenter(B, C, theta2);
  const ex = O2.x - O1.x;
  const ey = O2.y - O1.y;
  const el = Math.hypot(ex, ey);
  if (!Number.isFinite(el)) return { status: 'nonfinite' };
  if (el <= 1e-9 * (O1.r + O2.r)) return { status: 'coincident' }; // danger circle: infinitely many stations
  const ux = ex / el;
  const uy = ey / el;
  const p = (B.x - O1.x) * ux + (B.y - O1.y) * uy;
  const P = { x: 2 * (O1.x + p * ux) - B.x, y: 2 * (O1.y + p * uy) - B.y };
  return Number.isFinite(P.x) && Number.isFinite(P.y) ? { status: 'ok', P } : { status: 'nonfinite' };
}

/**
 * Scale-free condition number (sigma_max / sigma_min) of the 2x2 Jacobian d(beta1, beta2)/d(P).
 * It is invariant under uniform scaling of all coordinates, is ~1-15 for the documented
 * "strong geometry" and grows like 1/distance as P approaches the danger circle.
 */
export function conditionNumber(A, B, C, P) {
  const grad = (Q) => {
    const dx = Q.x - P.x;
    const dy = Q.y - P.y;
    const r2 = dx * dx + dy * dy;
    return [dy / r2, -dx / r2];
  };
  const gA = grad(A);
  const gB = grad(B);
  const gC = grad(C);
  const a = gB[0] - gA[0];
  const b = gB[1] - gA[1];
  const c = gC[0] - gB[0];
  const d = gC[1] - gB[1];
  const s1 = a * a + b * b + c * c + d * d;
  const det = a * d - b * c;
  const disc = Math.sqrt(Math.max(0, s1 * s1 - 4 * det * det));
  const smax = Math.sqrt((s1 + disc) / 2);
  const smin = Math.sqrt(Math.max(0, (s1 - disc) / 2));
  return { kappa: smin > 0 ? smax / smin : Infinity, sigmaMin: smin, sigmaMax: smax };
}

/** PROPOSED v2 contract (directed angles). Throws ResectionError with a stable `code`. */
export function resectionV2Reference(points, angles) {
  const { xA, yA, xB, yB, xC, yC } = points;
  const { beta1, beta2 } = angles;
  if (![xA, yA, xB, yB, xC, yC, beta1, beta2].every(isFiniteNumber)) {
    throw new ResectionError('INVALID_INPUT', 'coordinates and angles must be finite numbers');
  }
  if (!(beta1 > 0 && beta1 < 400 && beta2 > 0 && beta2 < 400)) {
    throw new ResectionError('INVALID_INPUT', 'beta1 and beta2 must be inside (0, 400) gon');
  }
  const A = { x: xA, y: yA };
  const B = { x: xB, y: yB };
  const C = { x: xC, y: yC };
  const ab = Math.hypot(B.x - A.x, B.y - A.y);
  const bc = Math.hypot(C.x - B.x, C.y - B.y);
  const ca = Math.hypot(A.x - C.x, A.y - C.y);
  if (Math.min(ab, bc, ca) < V2_TOLERANCES.coincidentPoints) {
    throw new ResectionError('DUPLICATE_POINTS', 'control points A, B, C must be distinct');
  }
  const sinB = Math.abs((B.x - A.x) * (C.y - B.y) - (B.y - A.y) * (C.x - B.x)) / (ab * bc);
  if (sinB < V2_TOLERANCES.collinearSin) {
    throw new ResectionError('COLLINEAR_CONTROLS', 'control points A, B, C must not be collinear');
  }
  for (const beta of [beta1, beta2]) {
    if (Math.abs(Math.sin(beta * GON)) < V2_TOLERANCES.stationOnControlLineSin) {
      throw new ResectionError('UNSTABLE_GEOMETRY', 'station lies on the line through two control points');
    }
  }

  const solved = solveDirected(A, B, C, beta1, beta2);
  if (solved.status === 'coincident') {
    throw new ResectionError('DANGER_CIRCLE', 'station is on the circle through A, B, C');
  }
  if (solved.status !== 'ok') throw new ResectionError('UNSTABLE_GEOMETRY', 'solution is not finite');

  const P = solved.P;
  const calcBeta1 = clockwiseGon(A, B, P);
  const calcBeta2 = clockwiseGon(B, C, P);
  const error1 = circularDiffGon(calcBeta1, beta1);
  const error2 = circularDiffGon(calcBeta2, beta2);
  if (Math.max(error1, error2) > V2_TOLERANCES.residualGon) {
    throw new ResectionError('INCONSISTENT_ANGLES', 'no station reproduces the entered directed angles');
  }
  const { kappa } = conditionNumber(A, B, C, P);
  if (!Number.isFinite(kappa) || kappa > V2_TOLERANCES.kappaMax) {
    throw new ResectionError('UNSTABLE_GEOMETRY', 'ill-conditioned geometry (near the danger circle)');
  }
  return {
    xP: P.x, yP: P.y,
    distAP: Math.hypot(P.x - A.x, P.y - A.y), distBP: Math.hypot(P.x - B.x, P.y - B.y), distCP: Math.hypot(P.x - C.x, P.y - C.y),
    calcBeta1, calcBeta2, error1, error2, kappa,
  };
}

/**
 * ALL distinct exact stations an UNSIGNED entered pair (each treated as beta or 400-beta)
 * is consistent with. Demonstrates why unsigned semantics are not determinate.
 */
export function unsignedCandidateStations(points, unsignedBeta1, unsignedBeta2) {
  const A = { x: points.xA, y: points.yA };
  const B = { x: points.xB, y: points.yB };
  const C = { x: points.xC, y: points.yC };
  const found = [];
  for (const t1 of [unsignedBeta1, 400 - unsignedBeta1]) {
    for (const t2 of [unsignedBeta2, 400 - unsignedBeta2]) {
      const s = solveDirected(A, B, C, t1, t2);
      if (s.status !== 'ok') continue;
      const ok = circularDiffGon(clockwiseGon(A, B, s.P), t1) < 1e-7 && circularDiffGon(clockwiseGon(B, C, s.P), t2) < 1e-7;
      if (ok && !found.some((q) => Math.hypot(q.x - s.P.x, q.y - s.P.y) < 1e-6)) found.push(s.P);
    }
  }
  return found;
}

/**
 * PROPOSED legacy (engineVersion 1) Save-as-point verification. It NEVER re-runs a solver:
 * it reconstructs the angles a stored station would produce and compares them with the stored
 * input angles. The tolerance is derived from the 3-decimal rounding of the stored coordinates:
 * moving P by <= d = 0.5e-3 * sqrt(2) m changes each ray's bearing by <= d / distance (rad).
 *
 * Verdicts:
 *   DIRECTED_MATCH  - stored P reproduces the angles exactly as entered (verified)
 *   COMPLEMENT_ONLY - stored P reproduces them only via 400-beta (a v1 alternative exact station)
 *   MISMATCH        - stored P reproduces neither (corrupted / forged)
 *   UNSTABLE        - geometry too ill-conditioned for the check to resolve a forgery
 */
export function verifyLegacyResection(points, angles, stored) {
  const A = { x: points.xA, y: points.yA };
  const B = { x: points.xB, y: points.yB };
  const C = { x: points.xC, y: points.yC };
  const P = { x: stored.xP, y: stored.yP };
  if (![P.x, P.y, angles.beta1, angles.beta2].every(isFiniteNumber)) return { verdict: 'MISMATCH' };
  const dA = Math.hypot(P.x - A.x, P.y - A.y);
  const dB = Math.hypot(P.x - B.x, P.y - B.y);
  const dC = Math.hypot(P.x - C.x, P.y - C.y);
  if (Math.min(dA, dB, dC) < 1e-9) return { verdict: 'MISMATCH' };
  const kappa = conditionNumber(A, B, C, P).kappa;
  if (!Number.isFinite(kappa) || kappa > V2_TOLERANCES.kappaMax) return { verdict: 'UNSTABLE', kappa };
  const d = 0.5e-3 * Math.SQRT2;
  const tol1 = (d / dA + d / dB) * RAD_TO_GON + 1e-9;
  const tol2 = (d / dB + d / dC) * RAD_TO_GON + 1e-9;
  const c1 = clockwiseGon(A, B, P);
  const c2 = clockwiseGon(B, C, P);
  const e1 = circularDiffGon(c1, angles.beta1);
  const e2 = circularDiffGon(c2, angles.beta2);
  const ratio = Math.max(e1 / tol1, e2 / tol2);
  if (e1 <= tol1 && e2 <= tol2) return { verdict: 'DIRECTED_MATCH', ratio, kappa };
  const okC1 = e1 <= tol1 || circularDiffGon(c1, 400 - angles.beta1) <= tol1;
  const okC2 = e2 <= tol2 || circularDiffGon(c2, 400 - angles.beta2) <= tol2;
  return okC1 && okC2 ? { verdict: 'COMPLEMENT_ONLY', kappa } : { verdict: 'MISMATCH', kappa };
}

/**
 * STRICT legacy Save-as-point policy for engineVersion 1 resection rows (decision confirmed
 * in Milestone 2.0C). There is deliberately NO override / "continue anyway" parameter.
 */
export const LEGACY_RESECTION_POLICY = Object.freeze({
  DIRECTED_MATCH: Object.freeze({ allowed: true }),
  COMPLEMENT_ONLY: Object.freeze({ allowed: false, code: 'LEGACY_RESECTION_ALTERNATIVE_SOLUTION' }),
  MISMATCH: Object.freeze({ allowed: false, code: 'RESULT_MISMATCH' }),
  UNSTABLE: Object.freeze({ allowed: false, code: 'LEGACY_RESECTION_UNSTABLE' }),
});

export function legacyResectionCreatePointDecision(points, angles, stored) {
  const { verdict } = verifyLegacyResection(points, angles, stored);
  return { verdict, ...LEGACY_RESECTION_POLICY[verdict] };
}
