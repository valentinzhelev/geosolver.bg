/**
 * Обратна засечка — engine v2 (Milestone 2.0C).
 *
 * ПРОДУКТОВ ДОГОВОР (официален за GeoSolver):
 *   β₁ — насочен ъгъл ПО ЧАСОВНИКОВАТА СТРЕЛКА от лъч P→A към лъч P→B (гради)
 *   β₂ — насочен ъгъл ПО ЧАСОВНИКОВАТА СТРЕЛКА от лъч P→B към лъч P→C (гради)
 *   Валиден интервал: 0 < β < 400. β и 400−β НЕ са взаимозаменяеми.
 *
 * Рамка: X = север, Y = изток, посоки по часовниковата стрелка от +X.
 *
 * МЕТОД: геометрията на вписан ъгъл. Множеството от станции, от които хорда A→B се вижда
 * под насочен ъгъл β₁ (mod 200), е окръжност; аналогично за B→C и β₂. Двете окръжности
 * минават през B, затова P е ВТОРАТА им пресечна точка (отражението на B спрямо линията
 * на центровете). Две различни окръжности имат най-много още една обща точка, следователно
 * насочена двойка ъгли определя най-много една станция. Няма търсене на кандидати,
 * няма допълващи ъгли (400−β) и няма избор по плаващо-запетайни разлики. След решението
 * клонът (mod 400) се проверява спрямо въведените ъгли.
 *
 * Прагове (изведени от доказателствата в Milestone 2.0C, не „магически“):
 *   - остатък (residual) ≤ 1e-6 gon: съгласувани данни се препроверяват до ≈1.7e-10 gon
 *     (κ < 1e4), а грешен клон се разминава с ≈200 gon;
 *   - число на обусловеност κ на якобиана на ъглите ≤ 1e4 (без мащаб; шумовият под е
 *     измерен само до 1e4);
 *   - нормализирана колинеарност sin(∠B) < 1e-9 (шумът на UTM-мащабна разлика е ≈2e-10).
 *
 * Engine v1 (Tienstra + търсене на кандидати) е исторически и е замразен в resection.v1.js.
 */

export const RESECTION_TOLERANCES = Object.freeze({
  residualGon: 1e-6,
  kappaMax: 1e4,
  collinearSin: 1e-9,
  coincidentPoints: 1e-12,
  stationOnControlLineSin: 1e-9,
});

export const RESECTION_ERROR_CODES = Object.freeze({
  INVALID_COORDINATE: 'INVALID_COORDINATE',
  INVALID_ANGLE: 'INVALID_ANGLE',
  DUPLICATE_CONTROL_POINT: 'DUPLICATE_CONTROL_POINT',
  COLLINEAR_CONTROLS: 'COLLINEAR_CONTROLS',
  DANGER_CIRCLE: 'DANGER_CIRCLE',
  INCONSISTENT_ANGLES: 'INCONSISTENT_ANGLES',
  UNSTABLE_GEOMETRY: 'UNSTABLE_GEOMETRY',
});

/** Error with a stable machine-readable `code`; `message` is user-facing Bulgarian. */
export class ResectionError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'ResectionError';
    this.code = code;
  }
}

const GON = Math.PI / 200;
const RAD_TO_GON = 200 / Math.PI;

const isFiniteNumber = (v) => typeof v === 'number' && Number.isFinite(v);

function assertFinite(name, v, code) {
  if (!isFiniteNumber(v)) {
    throw new ResectionError(code, `${name} трябва да е валидно число`);
  }
}

/** Насочен ъгъл по часовниковата стрелка в P от лъч P→from към лъч P→to, в гради [0, 400). */
function clockwiseGon(from, to, P) {
  let d = Math.atan2(to.y - P.y, to.x - P.x) - Math.atan2(from.y - P.y, from.x - P.x);
  while (d < 0) d += 2 * Math.PI;
  while (d >= 2 * Math.PI) d -= 2 * Math.PI;
  return d * RAD_TO_GON;
}

function circularDiffGon(a, b) {
  const d = Math.abs(a - b) % 400;
  return Math.min(d, 400 - d);
}

// Център (и радиус) на окръжността над хорда F→T, от чиито точки хордата се вижда под насочен ъгъл theta (mod 200).
function circleCenter(F, T, thetaGon) {
  const dx = T.x - F.x;
  const dy = T.y - F.y;
  const len = Math.hypot(dx, dy);
  const offset = len / 2 / Math.tan(thetaGon * GON);
  return {
    x: (F.x + T.x) / 2 + offset * (-dy / len),
    y: (F.y + T.y) / 2 + offset * (dx / len),
    r: Math.hypot(offset, len / 2),
  };
}

/**
 * Число на обусловеност (σmax/σmin) на 2×2 якобиана d(β₁,β₂)/d(P). Не зависи от мащаба,
 * е ≈1–15 за „силна геометрия“ и расте като 1/разстояние към опасната окръжност.
 */
function conditionNumber(A, B, C, P) {
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
  return smin > 0 ? smax / smin : Infinity;
}

/**
 * @param {Object} points - {xA, yA, xB, yB, xC, yC}
 * @param {Object} angles - {beta1, beta2} — насочени ъгли по часовниковата стрелка, гради, (0, 400)
 * @throws {ResectionError} с `code` от RESECTION_ERROR_CODES
 */
export function calculateResection(points, angles) {
  const { xA, yA, xB, yB, xC, yC } = points;
  const { beta1, beta2 } = angles;
  const { INVALID_COORDINATE, INVALID_ANGLE, DUPLICATE_CONTROL_POINT, COLLINEAR_CONTROLS, DANGER_CIRCLE, INCONSISTENT_ANGLES, UNSTABLE_GEOMETRY } = RESECTION_ERROR_CODES;
  const T = RESECTION_TOLERANCES;

  assertFinite('XA', xA, INVALID_COORDINATE);
  assertFinite('YA', yA, INVALID_COORDINATE);
  assertFinite('XB', xB, INVALID_COORDINATE);
  assertFinite('YB', yB, INVALID_COORDINATE);
  assertFinite('XC', xC, INVALID_COORDINATE);
  assertFinite('YC', yC, INVALID_COORDINATE);
  assertFinite('β₁', beta1, INVALID_ANGLE);
  assertFinite('β₂', beta2, INVALID_ANGLE);

  if (!(beta1 > 0 && beta1 < 400 && beta2 > 0 && beta2 < 400)) {
    throw new ResectionError(INVALID_ANGLE, 'Ъглите β₁ и β₂ трябва да са в интервала (0, 400) гради');
  }

  const A = { x: xA, y: yA };
  const B = { x: xB, y: yB };
  const C = { x: xC, y: yC };
  const ab = Math.hypot(B.x - A.x, B.y - A.y);
  const bc = Math.hypot(C.x - B.x, C.y - B.y);
  const ca = Math.hypot(A.x - C.x, A.y - C.y);
  if (Math.min(ab, bc, ca) < T.coincidentPoints) {
    throw new ResectionError(DUPLICATE_CONTROL_POINT, 'Контролните точки A, B и C трябва да са различни');
  }

  const sinB = Math.abs((B.x - A.x) * (C.y - B.y) - (B.y - A.y) * (C.x - B.x)) / (ab * bc);
  if (sinB < T.collinearSin) {
    throw new ResectionError(COLLINEAR_CONTROLS, 'Контролните точки A, B и C лежат на една права — обратна засечка не може да се определи');
  }

  for (const beta of [beta1, beta2]) {
    if (Math.abs(Math.sin(beta * GON)) < T.stationOnControlLineSin) {
      throw new ResectionError(UNSTABLE_GEOMETRY, 'Ъгъл 0 или 200 гради означава станция върху права през две контролни точки — решението е неустойчиво');
    }
  }

  const O1 = circleCenter(A, B, beta1);
  const O2 = circleCenter(B, C, beta2);
  const ex = O2.x - O1.x;
  const ey = O2.y - O1.y;
  const el = Math.hypot(ex, ey);
  if (!Number.isFinite(el)) {
    throw new ResectionError(UNSTABLE_GEOMETRY, 'Решението не е числено устойчиво за тези данни');
  }
  if (el <= 1e-9 * (O1.r + O2.r)) {
    throw new ResectionError(DANGER_CIRCLE, 'Станцията лежи върху опасната окръжност през A, B и C — положението ѝ не е определено');
  }

  const ux = ex / el;
  const uy = ey / el;
  const p = (B.x - O1.x) * ux + (B.y - O1.y) * uy;
  const P = { x: 2 * (O1.x + p * ux) - B.x, y: 2 * (O1.y + p * uy) - B.y };
  if (!Number.isFinite(P.x) || !Number.isFinite(P.y)) {
    throw new ResectionError(UNSTABLE_GEOMETRY, 'Решението не е числено устойчиво за тези данни');
  }

  const calcBeta1 = clockwiseGon(A, B, P);
  const calcBeta2 = clockwiseGon(B, C, P);
  const error1 = circularDiffGon(calcBeta1, beta1);
  const error2 = circularDiffGon(calcBeta2, beta2);
  if (Math.max(error1, error2) > T.residualGon) {
    throw new ResectionError(
      INCONSISTENT_ANGLES,
      'Въведените насочени ъгли β₁ и β₂ не отговарят на нито една станция — проверете дали са по часовниковата стрелка (P→A→P→B и P→B→P→C)'
    );
  }

  const kappa = conditionNumber(A, B, C, P);
  if (!Number.isFinite(kappa) || kappa > T.kappaMax) {
    throw new ResectionError(UNSTABLE_GEOMETRY, 'Станцията е твърде близо до опасната окръжност — геометрията е неустойчива');
  }

  return {
    xP: P.x,
    yP: P.y,
    distAP: Math.hypot(P.x - A.x, P.y - A.y),
    distBP: Math.hypot(P.x - B.x, P.y - B.y),
    distCP: Math.hypot(P.x - C.x, P.y - C.y),
    calcBeta1,
    calcBeta2,
    error1,
    error2,
    conditionNumber: kappa,
    method: 'circle-intersection',
    calculationDetails:
      'Обратна засечка по насочени ъгли (по часовниковата стрелка): P е втората пресечна точка на две окръжности — през A и B при β₁ и през B и C при β₂',
  };
}
