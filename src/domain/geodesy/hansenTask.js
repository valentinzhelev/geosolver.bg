/**
 * Задача на Хансен:
 * Определяне на координатите на точка P с две известни точки A и B и два ъгъла.
 * 
 * @param {number} xA - X координата на точка A
 * @param {number} yA - Y координата на точка A
 * @param {number} xB - X координата на точка B
 * @param {number} yB - Y координата на точка B
 * @param {number} alpha - Ъгъл α в гради
 * @param {number} beta - Ъгъл β в гради
 * @returns {Object} Резултати от изчисленията
 * @throws {Error} При невалидни входни данни
 */
export function calculateHansenTask(xA, yA, xB, yB, alpha, beta) {
  // Validate input data
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

  // Gon to radians
  const alphaRad = (alpha * Math.PI) / 200;
  const betaRad = (beta * Math.PI) / 200;

  // Distance A-B
  const distanceAB = Math.sqrt((xB - xA) ** 2 + (yB - yA) ** 2);

  // Line AB angle
  const angleAB = Math.atan2(yB - yA, xB - xA);

  // Trig functions
  const sinAlpha = Math.sin(alphaRad);
  const sinAlphaBeta = Math.sin(alphaRad + betaRad);

  // Coefficient
  const coefficient = sinAlpha / sinAlphaBeta;

  // Coordinate differences
  const deltaX = (xB - xA) * coefficient;
  const deltaY = (yB - yA) * coefficient;

  // Point P coordinates
  const xP = xA + deltaX;
  const yP = yA + deltaY;

  // Verification - distances
  const distanceAP = Math.sqrt((xP - xA) ** 2 + (yP - yA) ** 2);
  const distanceBP = Math.sqrt((xP - xB) ** 2 + (yP - yB) ** 2);

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
    deltaX,
    deltaY,
    xP,
    yP,
    distanceAP,
    distanceBP
  };
}
