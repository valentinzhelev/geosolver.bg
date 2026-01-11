import { calculateFirstTask } from '../firstTask';

describe('calculateFirstTask', () => {
  test('happy path - изчислява координати на втора точка', () => {
    const result = calculateFirstTask(100, 200, 50, 100);
    
    expect(result).toHaveProperty('x2');
    expect(result).toHaveProperty('y2');
    expect(result).toHaveProperty('deltaX');
    expect(result).toHaveProperty('deltaY');
    expect(result.quadrant).toBeDefined();
    expect(typeof result.x2).toBe('number');
    expect(typeof result.y2).toBe('number');
    expect(result.s).toBe(100);
    expect(result.alphaGon).toBe(50);
  });

  test('граничен случай - ъгъл 0 гради', () => {
    const result = calculateFirstTask(100, 200, 0, 100);
    
    expect(result.deltaY).toBeCloseTo(0, 3);
    expect(result.deltaX).toBeCloseTo(100, 3);
    expect(result.y2).toBeCloseTo(100, 3);
    expect(result.x2).toBeCloseTo(300, 3);
  });

  test('невалиден вход - отрицателно разстояние', () => {
    expect(() => {
      calculateFirstTask(100, 200, 50, -10);
    }).toThrow('Дължината трябва да бъде положителна');
  });

  test('невалиден вход - ъгъл извън диапазона', () => {
    expect(() => {
      calculateFirstTask(100, 200, 450, 100);
    }).toThrow('Посочният ъгъл трябва да бъде между 0 и 400 гради');
  });

  test('невалиден вход - NaN стойности', () => {
    expect(() => {
      calculateFirstTask(NaN, 200, 50, 100);
    }).toThrow('Y1 трябва да е валидно число');
  });
});
