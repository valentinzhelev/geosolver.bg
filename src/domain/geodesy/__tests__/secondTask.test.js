import { calculateSecondTask } from '../secondTask';

describe('calculateSecondTask', () => {
  test('happy path - изчислява разстояние и посока', () => {
    const result = calculateSecondTask(0, 0, 100, 0);
    
    expect(result).toHaveProperty('distance');
    expect(result).toHaveProperty('alpha');
    expect(result).toHaveProperty('deltaX');
    expect(result).toHaveProperty('deltaY');
    expect(result.quadrant).toBe(1);
    expect(result.quadrantName).toBe('I');
    expect(result.distance).toBeCloseTo(100, 3);
  });

  test('граничен случай - съвпадащи точки', () => {
    expect(() => {
      calculateSecondTask(100, 200, 100, 200);
    }).toThrow('Точките не могат да съвпадат');
  });

  test('невалиден вход - NaN стойности', () => {
    expect(() => {
      calculateSecondTask(NaN, 0, 100, 0);
    }).toThrow('X1 трябва да е валидно число');
  });

  test('квадранти - втори квадрант', () => {
    const result = calculateSecondTask(100, 100, 0, 200);
    
    expect(result.quadrant).toBe(2);
    expect(result.quadrantName).toBe('II');
    expect(result.alpha).toBeGreaterThan(100);
    expect(result.alpha).toBeLessThan(200);
  });
});
