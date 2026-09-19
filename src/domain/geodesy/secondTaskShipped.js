/**
 * SHIPPED Second Basic Task implementation — verbatim extraction (Milestone 2.0 preflight).
 *
 * This is the exact function that used to live inline in components/tasks/SecondTask.js
 * and is what production actually runs. It is NOT domain/geodesy/secondTask.js (which
 * is currently unused by the UI and differs in validation and rounding). Extracted only
 * so the shipped behavior can be characterized by tests; the body is unchanged.
 * Do not "improve" it here — a behavior change needs an explicit decision + engineVersion review.
 */

/**
 * Втора основна геодезическа задача (Enhanced):
 * Дадени са координатите на две точки (X1, Y1) и (X2, Y2).
 * Изчисляват се: ΔX, ΔY, тангенс, табличен арктангенс, квадрант,
 * посочен ъгъл α (в гради) и дължина на отсечката S.
 * 
 * Формули:
 * ΔX = X2 - X1
 * ΔY = Y2 - Y1
 * S = √(ΔX² + ΔY²)
 * tan(α) = ΔY/ΔX
 * α = atan2(ΔY, ΔX) * 200/π (в гради)
 * 
 * @param {number} x1 - X координата на точка 1
 * @param {number} y1 - Y координата на точка 1
 * @param {number} x2 - X координата на точка 2
 * @param {number} y2 - Y координата на точка 2
 * @returns {Object} Резултати: ΔX, ΔY, тангенс, табличен ъгъл, квадрант, α (gon), S (m)
 */
export function vtoraOsnovnaZadacha(x1, y1, x2, y2) {
  // Validate input data
  if (x1 === x2 && y1 === y2) {
    throw new Error('Точките не могат да съвпадат');
  }

  // Coordinate differences
  const deltaX = x2 - x1;
  const deltaY = y2 - y1;
  
  // Distance
  const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  
  // Tangent (check division by zero)
  const tangens = deltaX !== 0 ? deltaY / deltaX : (deltaY > 0 ? Infinity : -Infinity);
  
  // Arctan (absolute value)
  const arctanTab = Math.atan(Math.abs(tangens)) * 200 / Math.PI;
  
  // Quadrant and direction angle
  let quadrant, quadrantName, alpha;
  
  if (deltaX > 0 && deltaY >= 0) {
    // First quadrant
    quadrant = 1;
    quadrantName = 'I';
    alpha = arctanTab;
  } else if (deltaX <= 0 && deltaY > 0) {
    // Second quadrant
    quadrant = 2;
    quadrantName = 'II';
    alpha = 200 - arctanTab;
  } else if (deltaX < 0 && deltaY <= 0) {
    // Third quadrant
    quadrant = 3;
    quadrantName = 'III';
    alpha = 200 + arctanTab;
  } else if (deltaX >= 0 && deltaY < 0) {
    // Fourth quadrant
    quadrant = 4;
    quadrantName = 'IV';
    alpha = 400 - arctanTab;
  }
  
  // Angle in radians
  const alphaRad = alpha * Math.PI / 200;
  
  // atan2 for accuracy
  const alphaAtan2 = Math.atan2(deltaY, deltaX) * 200 / Math.PI;
  const alphaAtan2Normalized = alphaAtan2 < 0 ? alphaAtan2 + 400 : alphaAtan2;
  
  // sin and cos for verification
  const sinAlpha = Math.sin(alphaRad);
  const cosAlpha = Math.cos(alphaRad);
  
  // Verification
  const checkDeltaX = distance * cosAlpha;
  const checkDeltaY = distance * sinAlpha;
  
  return {
    // Main results
    deltaX: Math.round(deltaX * 1000) / 1000,
    deltaY: Math.round(deltaY * 1000) / 1000,
    distance: Math.round(distance * 1000) / 1000,
    tangens: Math.round(tangens * 1000000) / 1000000,
    arctanTab: Math.round(arctanTab * 1000) / 1000,
    quadrant,
    quadrantName,
    alpha: Math.round(alpha * 1000) / 1000,
    
    // Additional calculations
    alphaRad: Math.round(alphaRad * 1000000) / 1000000,
    alphaAtan2: Math.round(alphaAtan2Normalized * 1000) / 1000,
    sinAlpha: Math.round(sinAlpha * 1000000) / 1000000,
    cosAlpha: Math.round(cosAlpha * 1000000) / 1000000,
    
    // Checks
    checkDeltaX: Math.round(checkDeltaX * 1000) / 1000,
    checkDeltaY: Math.round(checkDeltaY * 1000) / 1000,
    differenceX: Math.round((deltaX - checkDeltaX) * 1000) / 1000,
    differenceY: Math.round((deltaY - checkDeltaY) * 1000) / 1000
  };
}
