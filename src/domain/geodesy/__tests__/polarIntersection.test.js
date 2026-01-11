import { calculatePolarIntersection } from '../polarIntersection';

describe('calculatePolarIntersection', () => {
  test('happy path - изчислява координати на точка P', () => {
    const result = calculatePolarIntersection(100, 200, 50, 100);
    
    expect(result).toHaveProperty('xP');
    expect(result).toHaveProperty('yP');
    expect(result).toHaveProperty('deltaX');
    expect(result).toHaveProperty('deltaY');
    expect(result.quadrant).toBeDefined();
    expect(typeof result.xP).toBe('number');
    expect(typeof result.yP).toBe('number');
  });

  test('граничен случай - ъгъл 0 гради', () => {
    const result = calculatePolarIntersection(100, 200, 0, 100);
    
    expect(result.deltaY).toBeCloseTo(0, 3);
    expect(result.deltaX).toBeCloseTo(100, 3);
  });

  test('невалиден вход - отрицателно разстояние', () => {
    expect(() => {
      calculatePolarIntersection(100, 200, 50, -10);
    }).toThrow('Разстоянието трябва да е положително число');
  });

  test('невалиден вход - нулево разстояние', () => {
    expect(() => {
      calculatePolarIntersection(100, 200, 50, 0);
    }).toThrow('Разстоянието трябва да е положително число');
  });

  test('невалиден вход - NaN стойности', () => {
    expect(() => {
      calculatePolarIntersection(NaN, 200, 50, 100);
    }).toThrow('XA трябва да е валидно число');
  });
});
