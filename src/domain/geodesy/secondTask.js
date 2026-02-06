/**
 * Втора основна геодезическа задача:
 * Изчислява разстоянието и посоката между две точки.
 * 
 * Формули:
 * ΔX = X2 - X1
 * ΔY = Y2 - Y1
 * S = √(ΔX² + ΔY²)
 * α = atan2(ΔY, ΔX) * 200/π (в гради)
 * 
 * @param {number} x1 - X координата на първа точка
 * @param {number} y1 - Y координата на първа точка
 * @param {number} x2 - X координата на втора точка
 * @param {number} y2 - Y координата на втора точка
 * @returns {Object} Резултати от изчисленията
 * @throws {Error} При невалидни входни данни
 */
export function calculateSecondTask(x1, y1, x2, y2) {
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
  if (x1 === x2 && y1 === y2) {
    throw new Error('Точките не могат да съвпадат');
  }

  // Coordinate differences
  const deltaX = x2 - x1;
  const deltaY = y2 - y1;
  
  // Distance calculation
  const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  
  // Tangent (check for division by zero)
  const tangens = deltaX !== 0 ? deltaY / deltaX : (deltaY > 0 ? Infinity : -Infinity);
  
  // Arctan (absolute value)
  const arctanTab = Math.atan(Math.abs(tangens)) * 200 / Math.PI;
  
  // Determine quadrant and direction angle
  let quadrant, quadrantName, alpha;
  
  if (deltaX > 0 && deltaY >= 0) {
    // First quadrant (0 - 100 gon)
    quadrant = 1;
    quadrantName = 'I';
    alpha = arctanTab;
  } else if (deltaX <= 0 && deltaY > 0) {
    // Second quadrant (100 - 200 gon)
    quadrant = 2;
    quadrantName = 'II';
    alpha = 200 - arctanTab;
  } else if (deltaX < 0 && deltaY <= 0) {
    // Third quadrant (200 - 300 gon)
    quadrant = 3;
    quadrantName = 'III';
    alpha = 200 + arctanTab;
  } else if (deltaX >= 0 && deltaY < 0) {
    // Fourth quadrant (300 - 400 gon)
    quadrant = 4;
    quadrantName = 'IV';
    alpha = 400 - arctanTab;
  }
  
  // Angle in radians
  const alphaRad = (alpha * Math.PI) / 200;
  
  // atan2 for accuracy
  let alphaAtan2 = Math.atan2(deltaY, deltaX) * 200 / Math.PI;
  if (alphaAtan2 < 0) alphaAtan2 += 400;
  
  // sin and cos for verification
  const sinAlpha = Math.sin(alphaRad);
  const cosAlpha = Math.cos(alphaRad);
  
  // Verification
  const checkDeltaX = distance * cosAlpha;
  const checkDeltaY = distance * sinAlpha;
  
  return {
    // Main results
    deltaX,
    deltaY,
    distance,
    tangens,
    arctanTab,
    quadrant,
    quadrantName,
    alpha,
    
    // Additional calculations
    alphaRad,
    alphaAtan2,
    sinAlpha,
    cosAlpha,
    
    // Checks
    checkDeltaX,
    checkDeltaY,
    differenceX: deltaX - checkDeltaX,
    differenceY: deltaY - checkDeltaY
  };
}
