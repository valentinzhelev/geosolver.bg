/**
 * Обратна засечка (Resection):
 * Определяне на позиция на точка P по ъгли от известни точки A, B, C (Hansen Problem).
 * 
 * @param {Object} points - Известни точки {xA, yA, xB, yB, xC, yC}
 * @param {Object} angles - Ъгли {beta1, beta2}
 * @returns {Object} Резултати от изчисленията
 * @throws {Error} При невалидни входни данни
 */
export function calculateResection(points, angles) {
  const { xA, yA, xB, yB, xC, yC } = points;
  const { beta1, beta2 } = angles;

  // Проверка за валидност на входните данни
  if (!xA || !yA || !xB || !yB || !xC || !yC || !beta1 || !beta2) {
    throw new Error('Всички координати и ъгли са задължителни');
  }

  // Проверка за валидни числа
  if (typeof xA !== 'number' || isNaN(xA) || !isFinite(xA)) {
    throw new Error('XA трябва да е валидно число');
  }
  if (typeof yA !== 'number' || isNaN(yA) || !isFinite(yA)) {
    throw new Error('YA трябва да е валидно число');
  }
  if (typeof xB !== 'number' || isNaN(xB) || !isFinite(xB)) {
    throw new Error('XB трябва да е валидно число');
  }
  if (typeof yB !== 'number' || isNaN(yB) || !isFinite(yB)) {
    throw new Error('YB трябва да е валидно число');
  }
  if (typeof xC !== 'number' || isNaN(xC) || !isFinite(xC)) {
    throw new Error('XC трябва да е валидно число');
  }
  if (typeof yC !== 'number' || isNaN(yC) || !isFinite(yC)) {
    throw new Error('YC трябва да е валидно число');
  }
  if (typeof beta1 !== 'number' || isNaN(beta1) || !isFinite(beta1)) {
    throw new Error('β₁ трябва да е валидно число');
  }
  if (typeof beta2 !== 'number' || isNaN(beta2) || !isFinite(beta2)) {
    throw new Error('β₂ трябва да е валидно число');
  }

  // Конвертиране на ъгли от гради в радиани
  const beta1Rad = (beta1 * Math.PI) / 200;
  const beta2Rad = (beta2 * Math.PI) / 200;

  // Hansen Problem решение
  // Използваме формулата за триангулация
  const dxAB = xB - xA;
  const dyAB = yB - yA;
  const dxBC = xC - xB;
  const dyBC = yC - yB;

  // Изчисляване на ъглите на триъгълника ABC
  const angleA = Math.atan2(dyAB, dxAB);
  const angleB = Math.atan2(dyBC, dxBC);

  // Изчисляване на страните
  const sideAB = Math.sqrt(dxAB * dxAB + dyAB * dyAB);
  const sideBC = Math.sqrt(dxBC * dxBC + dyBC * dyBC);

  // Решаване на триъгълника за точка P
  // Използваме синусовата теорема
  const angleAPB = Math.PI - beta1Rad;
  const angleBPC = Math.PI - beta2Rad;

  // Изчисляване на разстоянията от P до A, B, C
  const sideAP = (sideAB * Math.sin(beta1Rad)) / Math.sin(angleAPB);
  const sideBP = (sideBC * Math.sin(beta2Rad)) / Math.sin(angleBPC);

  // Изчисляване на координатите на P
  // Използваме полярна координатна система
  const xP1 = xA + sideAP * Math.cos(angleA + beta1Rad);
  const yP1 = yA + sideAP * Math.sin(angleA + beta1Rad);
  
  const xP2 = xB + sideBP * Math.cos(angleB - beta2Rad);
  const yP2 = yB + sideBP * Math.sin(angleB - beta2Rad);

  // Средно аритметично на двете решения
  const xP = (xP1 + xP2) / 2;
  const yP = (yP1 + yP2) / 2;

  // Изчисляване на разстоянията за проверка
  const distAP = Math.sqrt((xP - xA) * (xP - xA) + (yP - yA) * (yP - yA));
  const distBP = Math.sqrt((xP - xB) * (xP - xB) + (yP - yB) * (yP - yB));
  const distCP = Math.sqrt((xP - xC) * (xP - xC) + (yP - yC) * (yP - yC));

  // Изчисляване на ъглите за проверка
  const calcBeta1 = Math.atan2(yB - yP, xB - xP) - Math.atan2(yA - yP, xA - yP);
  const calcBeta2 = Math.atan2(yC - yP, xC - xP) - Math.atan2(yB - yP, xB - yP);

  // Нормализиране на ъглите
  const normalizedBeta1 = (((calcBeta1 * 200) / Math.PI) + 400) % 400;
  const normalizedBeta2 = (((calcBeta2 * 200) / Math.PI) + 400) % 400;

  return {
    xP,
    yP,
    distAP,
    distBP,
    distCP,
    calcBeta1: normalizedBeta1,
    calcBeta2: normalizedBeta2,
    error1: Math.abs(normalizedBeta1 - beta1),
    error2: Math.abs(normalizedBeta2 - beta2),
    method: 'Hansen Problem',
    calculationDetails: 'Решение на триангулация с три точки и два ъгъла'
  };
}
