/**
 * Закръгля число до определен брой десетични знаци
 * 
 * @param {number} value - Число за закръгляване
 * @param {number} decimals - Брой десетични знаци (по подразбиране 3)
 * @returns {number} Закръгленото число
 */
export function roundTo(value, decimals = 3) {
  if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
    throw new Error('Стойността трябва да е валидно число');
  }

  if (typeof decimals !== 'number' || decimals < 0) {
    throw new Error('Броят десетични знаци трябва да е неотрицателно число');
  }

  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}
