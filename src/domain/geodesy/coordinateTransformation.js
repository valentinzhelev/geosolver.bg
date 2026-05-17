/**
 * Координатна трансформация:
 * Трансформация между различни координатни системи.
 * 
 * Типове трансформации:
 * - translation: Паралелно изместване (dx, dy)
 * - rotation: Завъртане (angle в гради)
 * - scaling: Мащабиране (scaleX, scaleY)
 * 
 * @param {number} x - X координата
 * @param {number} y - Y координата
 * @param {string} transformationType - Тип трансформация
 * @param {Object} parameters - Параметри за трансформацията
 * @returns {Object} Резултати от трансформацията
 * @throws {Error} При невалидни входни данни
 */
export function calculateCoordinateTransformation(x, y, transformationType, parameters) {
  // Validate input data
  if (typeof x !== 'number' || isNaN(x) || !isFinite(x)) {
    throw new Error('X координатата трябва да е валидно число');
  }
  if (typeof y !== 'number' || isNaN(y) || !isFinite(y)) {
    throw new Error('Y координатата трябва да е валидно число');
  }
  if (!transformationType) {
    throw new Error('Типът трансформация е задължителен');
  }

  let xNew, yNew;
  let transformationDetails = '';

  switch (transformationType) {
    case 'translation':
      // Translation
      const dx = parameters?.dx || 0;
      const dy = parameters?.dy || 0;
      xNew = x + dx;
      yNew = y + dy;
      transformationDetails = `X' = X + ΔX = ${x} + ${dx} = ${xNew}\nY' = Y + ΔY = ${y} + ${dy} = ${yNew}`;
      break;

    case 'rotation':
      // Rotation
      const angle = (parameters?.angle || 0) * Math.PI / 200;
      const cosAngle = Math.cos(angle);
      const sinAngle = Math.sin(angle);
      // Clockwise rotation (gon, surveying convention)
      xNew = x * cosAngle + y * sinAngle;
      yNew = -x * sinAngle + y * cosAngle;
      transformationDetails = `X' = X·cos(α) - Y·sin(α) = ${x}·${cosAngle.toFixed(6)} - ${y}·${sinAngle.toFixed(6)} = ${xNew}\nY' = X·sin(α) + Y·cos(α) = ${x}·${sinAngle.toFixed(6)} + ${y}·${cosAngle.toFixed(6)} = ${yNew}`;
      break;

    case 'scaling':
      // Scaling
      const scaleX = parameters?.scaleX || 1;
      const scaleY = parameters?.scaleY || 1;
      xNew = x * scaleX;
      yNew = y * scaleY;
      transformationDetails = `X' = X·Sx = ${x}·${scaleX} = ${xNew}\nY' = Y·Sy = ${y}·${scaleY} = ${yNew}`;
      break;

    default:
      throw new Error('Неизвестен тип трансформация');
  }

  return {
    xOriginal: x,
    yOriginal: y,
    xTransformed: xNew,
    yTransformed: yNew,
    transformationType,
    parameters,
    transformationDetails,
    deltaX: xNew - x,
    deltaY: yNew - y
  };
}
