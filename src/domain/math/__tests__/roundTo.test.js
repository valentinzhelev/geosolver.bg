import { roundTo } from '../roundTo';

describe('roundTo', () => {
  test('happy path - закръгля до 3 десетични', () => {
    expect(roundTo(12.34567, 3)).toBe(12.346);
  });

  test('граничен случай - закръгля до 0 десетични', () => {
    expect(roundTo(12.7, 0)).toBe(13);
  });

  test('невалиден вход - NaN', () => {
    expect(() => {
      roundTo(NaN, 3);
    }).toThrow('Стойността трябва да е валидно число');
  });

  test('невалиден вход - отрицателни десетични', () => {
    expect(() => {
      roundTo(12.34, -1);
    }).toThrow('Броят десетични знаци трябва да е неотрицателно число');
  });
});
