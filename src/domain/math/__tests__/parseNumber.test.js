import { parseNumber } from '../parseNumber';

describe('parseNumber', () => {
  test('happy path - парсва число с точка', () => {
    expect(parseNumber('12.34')).toBe(12.34);
  });

  test('happy path - парсва число с запетая', () => {
    expect(parseNumber('12,34')).toBe(12.34);
  });

  test('граничен случай - тримва whitespace', () => {
    expect(parseNumber('  12.34  ')).toBe(12.34);
  });

  test('невалиден вход - празен низ', () => {
    expect(() => {
      parseNumber('');
    }).toThrow('Празен низ не може да бъде парснат');
  });

  test('невалиден вход - текст', () => {
    expect(() => {
      parseNumber('abc');
    }).toThrow('не може да бъде парснато като число');
  });
});
