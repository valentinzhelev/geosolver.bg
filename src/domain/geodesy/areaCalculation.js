/**
 * Изчисляване на площ на полигон:
 * Изчислява площта на многоъгълник от списък с координати.
 * 
 * @param {Array<{x: number, y: number}>} points - Масив от точки с координати {x, y}
 * @param {string} method - Метод за изчисление: 'shoelace' (по подразбиране) или 'trapezoidal'
 * @returns {Object} Резултати от изчисленията
 * @throws {Error} При невалидни входни данни
 */
export function calculateArea(points, method = 'shoelace') {
  if (!Array.isArray(points)) {
    throw new Error('Точките трябва да са масив');
  }
  if (points.length < 3) {
    throw new Error('Необходими са поне 3 точки за изчисляване на площ');
  }

  // Validate points
  for (let i = 0; i < points.length; i++) {
    const point = points[i];
    if (!point || typeof point.x !== 'number' || typeof point.y !== 'number' ||
        isNaN(point.x) || isNaN(point.y) || !isFinite(point.x) || !isFinite(point.y)) {
      throw new Error(`Точка ${i + 1} трябва да има валидни координати x и y`);
    }
  }

  let area = 0;
  let calculationDetails = '';
  let perimeter = 0;

  switch (method) {
    case 'shoelace':
      // Shoelace Formula (Gauss's area formula)
      let sum1 = 0;
      let sum2 = 0;
      
      for (let i = 0; i < points.length; i++) {
        const j = (i + 1) % points.length;
        sum1 += points[i].x * points[j].y;
        sum2 += points[j].x * points[i].y;
      }
      
      area = Math.abs(sum1 - sum2) / 2;
      calculationDetails = `Shoelace формула:\nSum1 = ${sum1.toFixed(2)}\nSum2 = ${sum2.toFixed(2)}\nПлощ = |Sum1 - Sum2| / 2 = ${area.toFixed(2)}`;
      break;

    case 'trapezoidal':
      // Trapezoidal Rule
      for (let i = 0; i < points.length; i++) {
        const j = (i + 1) % points.length;
        area += (points[j].x - points[i].x) * (points[j].y + points[i].y) / 2;
      }
      area = Math.abs(area);
      calculationDetails = `Трапецова формула:\nПлощ = ${area.toFixed(2)}`;
      break;

    default:
      throw new Error('Неизвестен метод за изчисление');
  }

  // Calculate perimeter
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    const dx = points[j].x - points[i].x;
    const dy = points[j].y - points[i].y;
    perimeter += Math.sqrt(dx * dx + dy * dy);
  }

  return {
    area,
    perimeter,
    calculationDetails,
    points: points.length,
    method
  };
}
