import { calculateDistanceBearing } from '../distanceBearing';
import { calculateSecondTask } from '../secondTask';

describe('calculateDistanceBearing', () => {
  test('happy path - изчислява разстояние и посока', () => {
    const result = calculateDistanceBearing(0, 0, 100, 0);

    expect(result.distance).toBeCloseTo(100, 3);
    expect(result.bearingGon).toBeCloseTo(0, 3);
    expect(result.quadrant).toContain('I');
  });

  test('съвпада с Second Task за α', () => {
    const db = calculateDistanceBearing(1000, 2000, 1100, 2050);
    const st = calculateSecondTask(1000, 2000, 1100, 2050);
    expect(db.bearingGon).toBeCloseTo(st.alphaAtan2, 6);
    expect(db.distance).toBeCloseTo(st.distance, 6);
  });

  test('изток (+Y) дава ~100 gon', () => {
    const result = calculateDistanceBearing(0, 0, 0, 100);
    expect(result.bearingGon).toBeCloseTo(100, 3);
  });

  test('невалиден вход - съвпадащи точки', () => {
    expect(() => calculateDistanceBearing(100, 200, 100, 200)).toThrow(
      'Точките не могат да съвпадат'
    );
  });

  test('невалиден вход - NaN стойности', () => {
    expect(() => {
      calculateDistanceBearing(NaN, 0, 100, 0);
    }).toThrow('X1 трябва да е валидно число');
  });

  test('квадранти - правилно определя квадрант', () => {
    const result1 = calculateDistanceBearing(0, 0, 100, 100);
    expect(result1.quadrant).toContain('I');

    const result2 = calculateDistanceBearing(0, 0, -100, 100);
    expect(result2.quadrant).toContain('II');
  });
});
