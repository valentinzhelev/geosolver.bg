/**
 * Полярна засечка:
 * Определяне на координатите на точка P по известна точка A, ъгъл и разстояние.
 * 
 * Формули:
 * ΔX = S · cos(α)
 * ΔY = S · sin(α)
 * YP = YA + ΔY
 * XP = XA + ΔX
 * 
 * @param {number} xA - X координата на точка A
 * @param {number} yA - Y координата на точка A
 * @param {number} angle - Ъгъл в гради [0, 400)
 * @param {number} distance - Разстояние в метри (трябва да е > 0)
 * @returns {Object} Резултати от изчисленията
 * @throws {Error} При невалидни входни данни
 */
export function calculatePolarIntersection(xA, yA, angle, distance) {
  // Валидация на входните данни
  if (typeof xA !== 'number' || isNaN(xA) || !isFinite(xA)) {
    throw new Error('XA трябва да е валидно число');
  }
  if (typeof yA !== 'number' || isNaN(yA) || !isFinite(yA)) {
    throw new Error('YA трябва да е валидно число');
  }
  if (typeof angle !== 'number' || isNaN(angle) || !isFinite(angle)) {
    throw new Error('Ъгълът трябва да е валидно число');
  }
  if (typeof distance !== 'number' || isNaN(distance) || !isFinite(distance)) {
    throw new Error('Разстоянието трябва да е валидно число');
  }
  if (distance <= 0) {
    throw new Error('Разстоянието трябва да е положително число');
  }

  // Преобразуване на ъгъла от гради в радиани
  const angleRad = (angle * Math.PI) / 200;
  
  // Изчисляване на тригонометричните функции
  const sinAlpha = Math.sin(angleRad);
  const cosAlpha = Math.cos(angleRad);
  
  // Изчисляване на координатните разлики
  const deltaX = distance * cosAlpha;
  const deltaY = distance * sinAlpha;
  
  // Изчисляване на координатите на неизвестната точка
  const xP = xA + deltaX;
  const yP = yA + deltaY;

  // Изчисляване на обратния ъгъл
  const reverseAngle = angle >= 200 ? angle - 200 : angle + 200;

  // Определяне на квадранта
  let quadrant = '';
  if (deltaX >= 0 && deltaY >= 0) quadrant = 'I';
  else if (deltaX < 0 && deltaY >= 0) quadrant = 'II';
  else if (deltaX < 0 && deltaY < 0) quadrant = 'III';
  else if (deltaX >= 0 && deltaY < 0) quadrant = 'IV';

  // Проверка - изчисляване на разстоянието и ъгъла
  const calculatedDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  let calculatedAngle = Math.atan2(deltaY, deltaX) * 200 / Math.PI;
  if (calculatedAngle < 0) calculatedAngle += 400;

  return {
    xA,
    yA,
    angle,
    distance,
    angleRad,
    sinAlpha,
    cosAlpha,
    deltaX,
    deltaY,
    xP,
    yP,
    reverseAngle,
    quadrant,
    calculatedDistance,
    calculatedAngle
  };
}
