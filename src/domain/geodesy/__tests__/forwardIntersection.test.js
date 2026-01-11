import { calculateForwardIntersection } from '../forwardIntersection';

describe('calculateForwardIntersection', () => {
  test('happy path - изчислява координати на точка P', () => {
    const result = calculateForwardIntersection(100, 200, 300, 400, 50, 60);
    
    expect(result).toHaveProperty('xP');
    expect(result).toHaveProperty('yP');
    expect(result).toHaveProperty('sAB');
    expect(result).toHaveProperty('sAP');
    expect(result).toHaveProperty('sBP');
    expect(typeof result.xP).toBe('number');
    expect(typeof result.yP).toBe('number');
  });

  test('граничен случай - малки ъгли', () => {
    const result = calculateForwardIntersection(100, 200, 300, 400, 10, 10);
    
    expect(result.xP).toBeFinite();
    expect(result.yP).toBeFinite();
  });

  test('невалиден вход - съвпадащи точки A и B', () => {
    expect(() => {
      calculateForwardIntersection(100, 200, 100, 200, 50, 60);
    }).toThrow('Точките A и B не могат да съвпадат');
  });

  test('невалиден вход - сумата на ъглите >= 200 гради', () => {
    expect(() => {
      calculateForwardIntersection(100, 200, 300, 400, 100, 100);
    }).toThrow('Сумата от ъглите не може да бъде по-голяма от 200 гради');
  });

  test('невалиден вход - отрицателни ъгли', () => {
    expect(() => {
      calculateForwardIntersection(100, 200, 300, 400, -10, 60);
    }).toThrow('Ъглите трябва да бъдат положителни');
  });
});
