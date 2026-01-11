/**
 * Права засечка:
 * Определяне на координатите на точка P от две известни точки A и B с два ъгъла.
 * 
 * Формули:
 * αAB = atan2(ΔY, ΔX) * 200/π
 * SAB = √(ΔX² + ΔY²)
 * SAP = SAB · sin(β2) / sin(β1 + β2)
 * SBP = SAB · sin(β1) / sin(β1 + β2)
 * XP = XA + SAP · cos(αAP)
 * YP = YA + SAP · sin(αAP)
 * 
 * @param {number} yA - Y координата на точка A
 * @param {number} xA - X координата на точка A
 * @param {number} yB - Y координата на точка B
 * @param {number} xB - X координата на точка B
 * @param {number} beta1 - Ъгъл β₁ в гради
 * @param {number} beta2 - Ъгъл β₂ в гради
 * @returns {Object} Резултати от изчисленията
 * @throws {Error} При невалидни входни данни
 */
export function calculateForwardIntersection(yA, xA, yB, xB, beta1, beta2) {
  // Валидация на входните данни
  if (typeof yA !== 'number' || isNaN(yA) || !isFinite(yA)) {
    throw new Error('YA трябва да е валидно число');
  }
  if (typeof xA !== 'number' || isNaN(xA) || !isFinite(xA)) {
    throw new Error('XA трябва да е валидно число');
  }
  if (typeof yB !== 'number' || isNaN(yB) || !isFinite(yB)) {
    throw new Error('YB трябва да е валидно число');
  }
  if (typeof xB !== 'number' || isNaN(xB) || !isFinite(xB)) {
    throw new Error('XB трябва да е валидно число');
  }
  if (typeof beta1 !== 'number' || isNaN(beta1) || !isFinite(beta1)) {
    throw new Error('β₁ трябва да е валидно число');
  }
  if (typeof beta2 !== 'number' || isNaN(beta2) || !isFinite(beta2)) {
    throw new Error('β₂ трябва да е валидно число');
  }
  if (beta1 <= 0 || beta2 <= 0) {
    throw new Error('Ъглите трябва да бъдат положителни');
  }
  if (beta1 + beta2 >= 200) {
    throw new Error('Сумата от ъглите не може да бъде по-голяма от 200 гради');
  }
  if (xA === xB && yA === yB) {
    throw new Error('Точките A и B не могат да съвпадат');
  }

  // Изчисляване на разликите в координатите
  const deltaY = yB - yA;
  const deltaX = xB - xA;

  // Изчисляване на разстоянието SAB
  const sAB = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

  // Изчисляване на αAB с atan2 за точност
  const alphaABRad = Math.atan2(deltaY, deltaX);
  let alphaAB = (alphaABRad * 200) / Math.PI;
  if (alphaAB < 0) alphaAB += 400;

  // Изчисляване на αBA
  const alphaBA = alphaAB >= 200 ? alphaAB - 200 : alphaAB + 200;

  // Изчисляване на αAP и αBP
  let alphaAP = alphaAB - beta1;
  let alphaBP = alphaBA + beta2;
  
  // Нормализиране на ъглите (0-400 гради)
  if (alphaAP < 0) alphaAP += 400;
  if (alphaAP >= 400) alphaAP -= 400;
  if (alphaBP < 0) alphaBP += 400;
  if (alphaBP >= 400) alphaBP -= 400;

  // Константа за преобразуване от гради в радиани
  const gonToRad = Math.PI / 200;

  // Изчисляване на ъглите в радиани
  const beta1Rad = beta1 * gonToRad;
  const beta2Rad = beta2 * gonToRad;
  const beta3Rad = (beta1 + beta2) * gonToRad;
  const alphaAPRad = alphaAP * gonToRad;
  const alphaBPRad = alphaBP * gonToRad;

  // Изчисляване на разстоянията SAP и SBP
  const sAP = (sAB * Math.sin(beta2Rad)) / Math.sin(beta3Rad);
  const sBP = (sAB * Math.sin(beta1Rad)) / Math.sin(beta3Rad);

  // Изчисляване на разликите в координатите
  const deltaX_AP = sAP * Math.cos(alphaAPRad);
  const deltaY_AP = sAP * Math.sin(alphaAPRad);
  const deltaX_BP = sBP * Math.cos(alphaBPRad);
  const deltaY_BP = sBP * Math.sin(alphaBPRad);

  // Изчисляване на координатите на точка P от двете посоки
  const xPrimP = xA + deltaX_AP;
  const yPrimP = yA + deltaY_AP;
  const xSecondP = xB + deltaX_BP;
  const ySecondP = yB + deltaY_BP;

  // Финални координати на точка P (средно аритметично)
  const xP = (xPrimP + xSecondP) / 2;
  const yP = (yPrimP + ySecondP) / 2;

  // Изчисляване на разликите за проверка
  const diffX = Math.abs(xPrimP - xSecondP);
  const diffY = Math.abs(yPrimP - ySecondP);
  const maxDiff = Math.max(diffX, diffY);

  // Проверка на изчисленията
  const checkSAP = Math.sqrt((xP - xA) * (xP - xA) + (yP - yA) * (yP - yA));
  const checkSBP = Math.sqrt((xP - xB) * (xP - xB) + (yP - yB) * (yP - yB));

  return {
    // Основни резултати
    deltaX,
    deltaY,
    alphaAB,
    alphaBA,
    sAB,
    alphaAP,
    alphaBP,
    sAP,
    sBP,
    xP,
    yP,
    
    // Междинни изчисления
    deltaX_AP,
    deltaY_AP,
    deltaX_BP,
    deltaY_BP,
    xPrimP,
    yPrimP,
    xSecondP,
    ySecondP,
    
    // Проверки
    diffX,
    diffY,
    maxDiff,
    checkSAP,
    checkSBP,
    
    // Ъгли в радиани за проверка
    alphaABRad,
    alphaAPRad,
    alphaBPRad
  };
}
