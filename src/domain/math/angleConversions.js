/**
 * Конвертира ъгъл от гради в радиани
 * 200 гради = π радиани
 * 
 * @param {number} gon - Ъгъл в гради
 * @returns {number} Ъгъл в радиани
 */
export function gonToRad(gon) {
  if (typeof gon !== 'number' || isNaN(gon) || !isFinite(gon)) {
    throw new Error('Ъгълът трябва да е валидно число');
  }
  return (gon * Math.PI) / 200;
}

/**
 * Конвертира ъгъл от радиани в гради
 * π радиани = 200 гради
 * 
 * @param {number} rad - Ъгъл в радиани
 * @returns {number} Ъгъл в гради
 */
export function radToGon(rad) {
  if (typeof rad !== 'number' || isNaN(rad) || !isFinite(rad)) {
    throw new Error('Ъгълът трябва да е валидно число');
  }
  return (rad * 200) / Math.PI;
}

/**
 * Нормализира ъгъл в гради до диапазона [0, 400)
 * 
 * @param {number} gon - Ъгъл в гради
 * @returns {number} Нормализиран ъгъл в гради [0, 400)
 */
export function normalizeAngleGon(gon) {
  if (typeof gon !== 'number' || isNaN(gon) || !isFinite(gon)) {
    throw new Error('Ъгълът трябва да е валидно число');
  }
  
  let normalized = gon % 400;
  if (normalized < 0) {
    normalized += 400;
  }
  
  return normalized;
}
