import { calculateCoordinateTransformation } from '../coordinateTransformation';

describe('calculateCoordinateTransformation', () => {
  test('happy path - translation', () => {
    const result = calculateCoordinateTransformation(100, 200, 'translation', { dx: 50, dy: 30 });

    expect(result.xTransformed).toBe(150);
    expect(result.yTransformed).toBe(230);
    expect(result.deltaX).toBe(50);
    expect(result.deltaY).toBe(30);
  });

  test('happy path - rotation CCW 100 gon', () => {
    const result = calculateCoordinateTransformation(100, 0, 'rotation', { angle: 100 });

    expect(result.xTransformed).toBeCloseTo(0, 3);
    expect(result.yTransformed).toBeCloseTo(100, 3);
  });

  test('scaleX 0 не става 1', () => {
    const result = calculateCoordinateTransformation(100, 200, 'scaling', { scaleX: 0, scaleY: 2 });
    expect(result.xTransformed).toBe(0);
    expect(result.yTransformed).toBe(400);
  });

  test('happy path - scaling', () => {
    const result = calculateCoordinateTransformation(100, 200, 'scaling', { scaleX: 2, scaleY: 3 });

    expect(result.xTransformed).toBe(200);
    expect(result.yTransformed).toBe(600);
  });

  test('невалиден вход - неизвестен тип трансформация', () => {
    expect(() => {
      calculateCoordinateTransformation(100, 200, 'invalid', {});
    }).toThrow('Неизвестен тип трансформация');
  });

  test('невалиден вход - NaN стойности', () => {
    expect(() => {
      calculateCoordinateTransformation(NaN, 200, 'translation', { dx: 50, dy: 30 });
    }).toThrow('X координатата трябва да е валидно число');
  });
});
