import { gonToRad, radToGon, normalizeAngleGon } from '../angleConversions';

describe('angleConversions', () => {
  test('gonToRad - конвертира гради в радиани', () => {
    expect(gonToRad(200)).toBeCloseTo(Math.PI, 6);
    expect(gonToRad(100)).toBeCloseTo(Math.PI / 2, 6);
  });

  test('radToGon - конвертира радиани в гради', () => {
    expect(radToGon(Math.PI)).toBeCloseTo(200, 3);
    expect(radToGon(Math.PI / 2)).toBeCloseTo(100, 3);
  });

  test('normalizeAngleGon - нормализира ъгъл в диапазона [0, 400)', () => {
    expect(normalizeAngleGon(450)).toBe(50);
    expect(normalizeAngleGon(-50)).toBe(350);
    expect(normalizeAngleGon(400)).toBe(0);
    expect(normalizeAngleGon(0)).toBe(0);
  });

  test('невалиден вход - NaN', () => {
    expect(() => {
      gonToRad(NaN);
    }).toThrow('Ъгълът трябва да е валидно число');
  });
});
