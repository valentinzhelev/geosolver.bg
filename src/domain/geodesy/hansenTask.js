/**
 * Задача на Хансен (в тази имплементация):
 * Координати на P от известни A, B и ъгли при известните точки
 * α = ∠BAP (при A), β = ∠ABP (при B) — геометрия на права засечка.
 *
 * Класическият Hansen с две неизвестни точки изисква 4 ъгъла;
 * с A, B, α, β уникалното решение е правата засечка.
 */

import { calculateForwardIntersection } from './forwardIntersection';

/**
 * @param {number} xA
 * @param {number} yA
 * @param {number} xB
 * @param {number} yB
 * @param {number} alpha - ъгъл при A в гради
 * @param {number} beta - ъгъл при B в гради
 */
export function calculateHansenTask(xA, yA, xB, yB, alpha, beta) {
  if (typeof xA !== 'number' || isNaN(xA) || !isFinite(xA)) {
    throw new Error('XA трябва да е валидно число');
  }
  if (typeof yA !== 'number' || isNaN(yA) || !isFinite(yA)) {
    throw new Error('YA трябва да е валидно число');
  }
  if (typeof xB !== 'number' || isNaN(xB) || !isFinite(xB)) {
    throw new Error('XB трябва да е валидно число');
  }
  if (typeof yB !== 'number' || isNaN(yB) || !isFinite(yB)) {
    throw new Error('YB трябва да е валидно число');
  }
  if (xA === xB && yA === yB) {
    throw new Error('Точките A и B не могат да съвпадат');
  }
  if (typeof alpha !== 'number' || isNaN(alpha) || !isFinite(alpha)) {
    throw new Error('α трябва да е валидно число');
  }
  if (typeof beta !== 'number' || isNaN(beta) || !isFinite(beta)) {
    throw new Error('β трябва да е валидно число');
  }

  const fwd = calculateForwardIntersection(yA, xA, yB, xB, alpha, beta);

  const distanceAB = fwd.sAB;
  const angleAB = (fwd.alphaAB * Math.PI) / 200;
  const alphaRad = (alpha * Math.PI) / 200;
  const betaRad = (beta * Math.PI) / 200;
  const sinAlpha = Math.sin(alphaRad);
  const sinAlphaBeta = Math.sin(alphaRad + betaRad);
  const coefficient = sinAlphaBeta !== 0 ? sinAlpha / sinAlphaBeta : NaN;

  return {
    xA,
    yA,
    xB,
    yB,
    alpha,
    beta,
    distanceAB,
    angleAB,
    sinAlpha,
    sinAlphaBeta,
    coefficient,
    deltaX: fwd.xP - xA,
    deltaY: fwd.yP - yA,
    xP: fwd.xP,
    yP: fwd.yP,
    distanceAP: fwd.sAP,
    distanceBP: fwd.sBP,
    method: 'forward-intersection',
  };
}
