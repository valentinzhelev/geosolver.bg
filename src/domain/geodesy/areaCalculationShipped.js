/**
 * SHIPPED Area Calculation implementation — verbatim extraction (Milestone 2.0 preflight).
 *
 * parseAreaPoints / calculateAreaShipped are the exact functions that used to live inline
 * inside components/tasks/AreaCalculation.js (bodies unchanged, only de-indented and renamed
 * for export). Production runs THESE — not domain/geodesy/areaCalculation.js, which is
 * currently unused by the UI and validates more strictly. Extracted only so the shipped
 * behavior can be characterized by tests.
 * Do not "improve" here — a behavior change needs an explicit decision + engineVersion review.
 */

export const parseAreaPoints = (pointsText) => {
  const lines = pointsText.trim().split('\n');
  const parsedPoints = [];
  
  for (let line of lines) {
    line = line.trim();
    if (line) {
      const parts = line.split(/[,\s]+/);
      if (parts.length >= 2) {
        const x = parseFloat(parts[0]);
        const y = parseFloat(parts[1]);
        if (!isNaN(x) && !isNaN(y)) {
          parsedPoints.push({ x, y });
        }
      }
    }
  }
  
  return parsedPoints;
};

/**
 * Изчисляване на площ (Enhanced):
 * Изчислява площта на многоъгълник по различни методи
 * 
 * @param {Array} points - Масив от точки [{x, y}, {x, y}, ...]
 * @param {string} method - Метод за изчисление
 * @returns {Object} Резултати от изчисленията
 */
export const calculateAreaShipped = (points, method = 'shoelace') => {
  if (points.length < 3) {
    throw new Error('Необходими са поне 3 точки за изчисляване на площ');
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

  // Perimeter calculation
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
};
