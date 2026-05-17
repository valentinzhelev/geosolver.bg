import { calculateHansenTask } from '../hansenTask';

describe('calculateHansenTask', () => {
  test('happy path - изчислява координати на точка P', () => {
    const result = calculateHansenTask(100, 200, 300, 400, 50, 60);
    
    expect(result).toHaveProperty('xP');
    expect(result).toHaveProperty('yP');
    expect(result).toHaveProperty('distanceAB');
    expect(result).toHaveProperty('distanceAP');
    expect(result).toHaveProperty('distanceBP');
    expect(typeof result.xP).toBe('number');
    expect(typeof result.yP).toBe('number');
  });

  test('граничен случай - малък ъгъл', () => {
    const result = calculateHansenTask(100, 200, 300, 400, 5, 10);
    
    expect(Number.isFinite(result.xP)).toBe(true);
    expect(Number.isFinite(result.yP)).toBe(true);
  });

  test('невалиден вход - съвпадащи точки A и B', () => {
    expect(() => {
      calculateHansenTask(100, 200, 100, 200, 50, 60);
    }).toThrow('Точките A и B не могат да съвпадат');
  });

  test('невалиден вход - NaN стойности', () => {
    expect(() => {
      calculateHansenTask(NaN, 200, 300, 400, 50, 60);
    }).toThrow('XA трябва да е валидно число');
  });
});
