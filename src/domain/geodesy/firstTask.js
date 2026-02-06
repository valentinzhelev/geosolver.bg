/**
 * Първа основна геодезическа задача:
 * Изчислява координатите на втора точка по дадени координати на първа точка, ъгъл и разстояние.
 * 
 * Формули:
 * ΔX = S · cos(α)
 * ΔY = S · sin(α)
 * Y2 = Y1 + ΔY
 * X2 = X1 + ΔX
 * 
 * @param {number} y1 - Y координата на начална точка
 * @param {number} x1 - X координата на начална точка
 * @param {number} alphaGon - Ъгъл в гради [0, 400)
 * @param {number} s - Разстояние в метри (трябва да е > 0)
 * @returns {Object} Резултати от изчисленията
 * @throws {Error} При невалидни входни данни
 */
export function calculateFirstTask(y1, x1, alphaGon, s) {
  // Validate input data
  if (typeof y1 !== 'number' || isNaN(y1) || !isFinite(y1)) {
    throw new Error('Y1 трябва да е валидно число');
  }
  if (typeof x1 !== 'number' || isNaN(x1) || !isFinite(x1)) {
    throw new Error('X1 трябва да е валидно число');
  }
  if (typeof alphaGon !== 'number' || isNaN(alphaGon) || !isFinite(alphaGon)) {
    throw new Error('Посочният ъгъл трябва да е валидно число');
  }
  if (alphaGon < 0 || alphaGon >= 400) {
    throw new Error('Посочният ъгъл трябва да бъде между 0 и 400 гради');
  }
  if (typeof s !== 'number' || isNaN(s) || !isFinite(s)) {
    throw new Error('Разстоянието трябва да е валидно число');
  }
  if (s <= 0) {
    throw new Error('Дължината трябва да бъде положителна');
  }

  // Convert gon to radians
  const alphaRad = (alphaGon * Math.PI) / 200;
  
  // Compute sin and cos
  const sinAlpha = Math.sin(alphaRad);
  const cosAlpha = Math.cos(alphaRad);
  
  // Coordinate differences
  const deltaX = s * cosAlpha;
  const deltaY = s * sinAlpha;
  
  // Point 2 coordinates
  const x2 = x1 + deltaX;
  const y2 = y1 + deltaY;

  // Determine quadrant
  let quadrant = '';
  if (deltaX >= 0 && deltaY >= 0) quadrant = 'I';
  else if (deltaX < 0 && deltaY >= 0) quadrant = 'II';
  else if (deltaX < 0 && deltaY < 0) quadrant = 'III';
  else if (deltaX >= 0 && deltaY < 0) quadrant = 'IV';

  // Verification checks
  const calculatedDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  let calculatedAngle = Math.atan2(deltaY, deltaX) * 200 / Math.PI;
  if (calculatedAngle < 0) calculatedAngle += 400;

  return {
    x1,
    y1,
    alphaGon,
    s,
    alphaRad,
    sinAlpha,
    cosAlpha,
    deltaX,
    deltaY,
    x2,
    y2,
    quadrant,
    calculatedDistance,
    calculatedAngle
  };
}
