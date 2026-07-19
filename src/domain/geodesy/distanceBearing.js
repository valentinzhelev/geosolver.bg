/**
 * Разстояние и посока между две точки.
 * Същата конвенция като Second Task: α = atan2(ΔY, ΔX) в гради [0, 400).
 *
 * @param {number} x1 - X координата на първа точка
 * @param {number} y1 - Y координата на първа точка
 * @param {number} x2 - X координата на втора точка
 * @param {number} y2 - Y координата на втора точка
 */
export function calculateDistanceBearing(x1, y1, x2, y2) {
  if (typeof x1 !== 'number' || isNaN(x1) || !isFinite(x1)) {
    throw new Error('X1 трябва да е валидно число');
  }
  if (typeof y1 !== 'number' || isNaN(y1) || !isFinite(y1)) {
    throw new Error('Y1 трябва да е валидно число');
  }
  if (typeof x2 !== 'number' || isNaN(x2) || !isFinite(x2)) {
    throw new Error('X2 трябва да е валидно число');
  }
  if (typeof y2 !== 'number' || isNaN(y2) || !isFinite(y2)) {
    throw new Error('Y2 трябва да е валидно число');
  }
  if (x1 === x2 && y1 === y2) {
    throw new Error('Точките не могат да съвпадат');
  }

  const deltaY = y2 - y1;
  const deltaX = x2 - x1;
  const distance = Math.sqrt(deltaY * deltaY + deltaX * deltaX);

  // Same as secondTask: α = atan2(ΔY, ΔX)
  let bearingRad = Math.atan2(deltaY, deltaX);
  if (bearingRad < 0) {
    bearingRad += 2 * Math.PI;
  }

  const bearingGon = (bearingRad * 200) / Math.PI;
  const bearingDeg = (bearingRad * 180) / Math.PI;

  // Quadrants: X north-ish / Y east-ish (BG grid): ΔX>0, ΔY≥0 → I
  let quadrantName = 'I';
  if (deltaX > 0 && deltaY >= 0) quadrantName = 'I';
  else if (deltaX <= 0 && deltaY > 0) quadrantName = 'II';
  else if (deltaX < 0 && deltaY <= 0) quadrantName = 'III';
  else quadrantName = 'IV';

  const gonRanges = { I: '0-100', II: '100-200', III: '200-300', IV: '300-400' };
  const quadrant = `${quadrantName} квадрант (${gonRanges[quadrantName]} gon)`;

  return {
    x1,
    y1,
    x2,
    y2,
    deltaY,
    deltaX,
    distance,
    bearingRad,
    bearingGon,
    bearingDeg,
    quadrant,
  };
}
