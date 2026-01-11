import { calculateDistanceBearing } from '../distanceBearing';

describe('calculateDistanceBearing', () => {
  test('happy path - изчислява разстояние и посока', () => {
    const result = calculateDistanceBearing(0, 0, 100, 0);
    
    expect(result).toHaveProperty('distance');
    expect(result).toHaveProperty('bearingGon');
    expect(result).toHaveProperty('bearingDeg');
    expect(result).toHaveProperty('bearingRad');
    expect(result.quadrant).toBeDefined();
    expect(result.distance).toBeCloseTo(100, 3);
  });

  test('граничен случай - съвпадащи точки', () => {
    const result = calculateDistanceBearing(100, 200, 100, 200);
    
    expect(result.distance).toBe(0);
    expect(result.quadrant).toBeDefined();
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
