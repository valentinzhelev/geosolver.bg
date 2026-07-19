import { calculateHansenTask } from '../hansenTask';
import { calculateForwardIntersection } from '../forwardIntersection';

describe('calculateHansenTask', () => {
  test('съвпада с права засечка (ъгли при A и B)', () => {
    const hansen = calculateHansenTask(0, 0, 100, 0, 50, 60);
    const fwd = calculateForwardIntersection(0, 0, 0, 100, 50, 60);

    expect(hansen.xP).toBeCloseTo(fwd.xP, 6);
    expect(hansen.yP).toBeCloseTo(fwd.yP, 6);
    // P must be off the AB line (AB is along +X here)
    expect(Math.abs(hansen.yP)).toBeGreaterThan(1);
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
