/**
 * Обратна засечка (Tienstra):
 * Позиция на P по измерени ъгли β₁=∠APB и β₂=∠BPC към известни A, B, C.
 *
 * β₁ / β₂ са хоризонталните ъгли при станцията P (в гради).
 * Ако е въведена по-малката дъга вместо обхода A→B→C, алгоритъмът
 * пробва и допълващите ъгли (400 − β) и избира решението с най-малка грешка.
 */

function assertFinite(name, v) {
  if (typeof v !== 'number' || !Number.isFinite(v)) {
    throw new Error(`${name} трябва да е валидно число`);
  }
}

function normalizeGon(g) {
  let x = g % 400;
  if (x < 0) x += 400;
  return x;
}

function circularDiffGon(a, b) {
  const d = Math.abs(normalizeGon(a) - normalizeGon(b));
  return Math.min(d, 400 - d);
}

/** Грешка спрямо измерен ъгъл или неговия допълнителен (400 − β). */
function angleMatchErr(calcGon, measuredGon) {
  return Math.min(
    circularDiffGon(calcGon, measuredGon),
    circularDiffGon(calcGon, 400 - measuredGon)
  );
}

function orientedAngleGon(fromX, fromY, toX, toY, pivotX, pivotY) {
  const a = Math.atan2(fromY - pivotY, fromX - pivotX);
  const b = Math.atan2(toY - pivotY, toX - pivotX);
  let d = b - a;
  while (d < 0) d += 2 * Math.PI;
  while (d >= 2 * Math.PI) d -= 2 * Math.PI;
  return (d * 200) / Math.PI;
}

function triangleInteriorAngles(xA, yA, xB, yB, xC, yC) {
  const ab = Math.hypot(xB - xA, yB - yA);
  const bc = Math.hypot(xC - xB, yC - yB);
  const ca = Math.hypot(xA - xC, yA - yC);
  if (ab < 1e-12 || bc < 1e-12 || ca < 1e-12) {
    throw new Error('Точките A, B, C не могат да съвпадат');
  }
  const cosA = (ca * ca + ab * ab - bc * bc) / (2 * ca * ab);
  const cosB = (ab * ab + bc * bc - ca * ca) / (2 * ab * bc);
  const cosC = (bc * bc + ca * ca - ab * ab) / (2 * bc * ca);
  const clamp = (c) => Math.max(-1, Math.min(1, c));
  return {
    A: Math.acos(clamp(cosA)),
    B: Math.acos(clamp(cosB)),
    C: Math.acos(clamp(cosC)),
  };
}

function solveTienstra(xA, yA, xB, yB, xC, yC, b1, b2, A, B, C) {
  if (b1 <= 0 || b2 <= 0 || b1 >= 400 || b2 >= 400) return null;
  if (b1 + b2 >= 400) return null;

  const angAPB = (b1 * Math.PI) / 200; // срещу C
  const angBPC = (b2 * Math.PI) / 200; // срещу A
  const angCPA = 2 * Math.PI - angAPB - angBPC; // срещу B
  if (angCPA <= 1e-12) return null;

  const cot = (t) => Math.cos(t) / Math.sin(t);
  const denA = cot(A) - cot(angBPC);
  const denB = cot(B) - cot(angCPA);
  const denC = cot(C) - cot(angAPB);

  if (Math.abs(denA) < 1e-14 || Math.abs(denB) < 1e-14 || Math.abs(denC) < 1e-14) {
    return null;
  }

  const KA = 1 / denA;
  const KB = 1 / denB;
  const KC = 1 / denC;
  const sumK = KA + KB + KC;
  if (!Number.isFinite(sumK) || Math.abs(sumK) < 1e-14) return null;

  const xP = (KA * xA + KB * xB + KC * xC) / sumK;
  const yP = (KA * yA + KB * yB + KC * yC) / sumK;
  if (!Number.isFinite(xP) || !Number.isFinite(yP)) return null;

  // Oriented CCW angles at P for verification
  const calcBeta1 = orientedAngleGon(xA, yA, xB, yB, xP, yP);
  const calcBeta2 = orientedAngleGon(xB, yB, xC, yC, xP, yP);
  const error1 = angleMatchErr(calcBeta1, b1);
  const error2 = angleMatchErr(calcBeta2, b2);

  return {
    xP,
    yP,
    distAP: Math.hypot(xP - xA, yP - yA),
    distBP: Math.hypot(xP - xB, yP - yB),
    distCP: Math.hypot(xP - xC, yP - yC),
    calcBeta1,
    calcBeta2,
    error1,
    error2,
    usedBeta1: b1,
    usedBeta2: b2,
    residual: error1 + error2,
  };
}

/**
 * @param {Object} points - {xA, yA, xB, yB, xC, yC}
 * @param {Object} angles - {beta1, beta2} в гради (∠APB, ∠BPC)
 */
export function calculateResection(points, angles) {
  const { xA, yA, xB, yB, xC, yC } = points;
  const { beta1, beta2 } = angles;

  assertFinite('XA', xA);
  assertFinite('YA', yA);
  assertFinite('XB', xB);
  assertFinite('YB', yB);
  assertFinite('XC', xC);
  assertFinite('YC', yC);
  assertFinite('β₁', beta1);
  assertFinite('β₂', beta2);

  if (beta1 <= 0 || beta2 <= 0 || beta1 >= 400 || beta2 >= 400) {
    throw new Error('Ъглите β₁ и β₂ трябва да са в интервала (0, 400) гради');
  }

  const { A, B, C } = triangleInteriorAngles(xA, yA, xB, yB, xC, yC);

  const candidates = [
    [beta1, beta2],
    [400 - beta1, beta2],
    [beta1, 400 - beta2],
    [400 - beta1, 400 - beta2],
  ];

  let best = null;
  for (const [b1, b2] of candidates) {
    const sol = solveTienstra(xA, yA, xB, yB, xC, yC, b1, b2, A, B, C);
    if (!sol) continue;
    if (!best || sol.residual < best.residual) best = sol;
  }

  if (!best) {
    throw new Error('Неуспешно решаване на обратната засечка (опасен кръг или невалидни ъгли)');
  }

  return {
    xP: best.xP,
    yP: best.yP,
    distAP: best.distAP,
    distBP: best.distBP,
    distCP: best.distCP,
    calcBeta1: best.calcBeta1,
    calcBeta2: best.calcBeta2,
    error1: best.error1,
    error2: best.error2,
    method: 'Tienstra',
    calculationDetails:
      'Обратна засечка по Tienstra; при нужда се пробва и допълващият ъгъл (400 − β)',
  };
}
