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
  // Валидация на входните данни
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

  // Координатни разлики
  const deltaY = y2 - y1;
  const deltaX = x2 - x1;

  // Изчисляване на разстоянието
  const distance = Math.sqrt(deltaY * deltaY + deltaX * deltaX);

  // Изчисляване на посоката (азимут)
  let bearingRad = Math.atan2(deltaX, deltaY);
  
  // Нормализиране на ъгъла (0 до 2π)
  if (bearingRad < 0) {
    bearingRad += 2 * Math.PI;
  }

  // Преобразуване в гради и градуси
  const bearingGon = (bearingRad * 200) / Math.PI;
  const bearingDeg = (bearingRad * 180) / Math.PI;

  // Определяне на квадранта
  let quadrant = '';
  if (deltaY >= 0 && deltaX >= 0) {
    quadrant = 'I квадрант (0-100 gon)';
  } else if (deltaY < 0 && deltaX >= 0) {
    quadrant = 'II квадрант (100-200 gon)';
  } else if (deltaY < 0 && deltaX < 0) {
    quadrant = 'III квадрант (200-300 gon)';
  } else {
    quadrant = 'IV квадрант (300-400 gon)';
  }

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
