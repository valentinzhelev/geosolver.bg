/**
 * Разстояние и посока:
 * Изчислява разстоянието и посоката между две точки.
 * Същата логика като SecondTask, но с различна структура на резултата.
 * 
 * @param {number} x1 - X координата на първа точка
 * @param {number} y1 - Y координата на първа точка
 * @param {number} x2 - X координата на втора точка
 * @param {number} y2 - Y координата на втора точка
 * @returns {Object} Резултати от изчисленията
 * @throws {Error} При невалидни входни данни
 */
export function calculateDistanceBearing(x1, y1, x2, y2) {
  // Validate input data
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

  // Coordinate differences
  const deltaY = y2 - y1;
  const deltaX = x2 - x1;

  // Distance
  const distance = Math.sqrt(deltaY * deltaY + deltaX * deltaX);

  // Bearing (azimuth)
  let bearingRad = Math.atan2(deltaX, deltaY);
  
  // Normalize angle (0 to 2pi)
  if (bearingRad < 0) {
    bearingRad += 2 * Math.PI;
  }

  // Convert to gon and degrees
  const bearingGon = (bearingRad * 200) / Math.PI;
  const bearingDeg = (bearingRad * 180) / Math.PI;

  // Quadrants aligned with secondTask / surveying convention (ΔX east, ΔY north)
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
    quadrant
  };
}
