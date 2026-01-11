import { calculateArea } from '../areaCalculation';

describe('calculateArea', () => {
  test('happy path - shoelace формула', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 100, y: 100 },
      { x: 0, y: 100 }
    ];
    const result = calculateArea(points, 'shoelace');
    
    expect(result.area).toBeCloseTo(10000, 0);
    expect(result.perimeter).toBeGreaterThan(0);
    expect(result.method).toBe('shoelace');
  });

  test('граничен случай - триъгълник', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 50, y: 100 }
    ];
    const result = calculateArea(points, 'shoelace');
    
    expect(result.area).toBeGreaterThan(0);
    expect(result.points).toBe(3);
  });

  test('невалиден вход - по-малко от 3 точки', () => {
    expect(() => {
      calculateArea([{ x: 0, y: 0 }, { x: 100, y: 0 }], 'shoelace');
    }).toThrow('Необходими са поне 3 точки за изчисляване на площ');
  });

  test('невалиден вход - невалидни координати', () => {
    expect(() => {
      calculateArea([{ x: NaN, y: 0 }, { x: 100, y: 0 }, { x: 50, y: 100 }], 'shoelace');
    }).toThrow('Точка 1 трябва да има валидни координати x и y');
  });

  test('невалиден вход - неизвестен метод', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 50, y: 100 }
    ];
    expect(() => {
      calculateArea(points, 'invalid');
    }).toThrow('Неизвестен метод за изчисление');
  });

  test('trapezoidal метод', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 100, y: 100 },
      { x: 0, y: 100 }
    ];
    const result = calculateArea(points, 'trapezoidal');
    
    expect(result.area).toBeGreaterThan(0);
    expect(result.method).toBe('trapezoidal');
  });
});
