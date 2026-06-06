import { parseReading, roundTo, computeLevelingCarnet } from '../levelingCarnet';

describe('levelingCarnet · помощни функции', () => {
  test('parseReading приема запетая като десетичен разделител', () => {
    expect(parseReading('1,5')).toBe(1.5);
  });

  test('parseReading връща null за празно/невалидно', () => {
    expect(parseReading('')).toBeNull();
    expect(parseReading('xx')).toBeNull();
  });

  test('roundTo закръгля и пропуска null', () => {
    expect(roundTo(1.23456, 3)).toBe(1.235);
    expect(roundTo(null, 3)).toBeNull();
  });
});

describe('computeLevelingCarnet', () => {
  test('H_i = H_{i-1} + (задно − предно), репер по подразбиране', () => {
    const settings = { benchmarkHeight: 100, rounding: 3, toleranceMm: 5 };
    const rows = [
      { station: 'BM', back: '1.000', fore: '', isControl: true },
      { station: '1', back: '1.200', fore: '0.800' },
      { station: '2', back: '0.900', fore: '1.100', isControl: true },
    ];
    const { rows: out } = computeLevelingCarnet(rows, settings);

    expect(out[0].height).toBe(100);
    expect(out[1].delta).toBe(0.4);
    expect(out[1].height).toBe(100.4);
    expect(out[2].delta).toBeCloseTo(-0.2, 3);
    expect(out[2].height).toBeCloseTo(100.2, 3);
  });

  test('ръчно зададената начална кота има приоритет пред репера', () => {
    const rows = [{ station: 'A', back: '1', fore: '', height: '250' }];
    const { rows: out } = computeLevelingCarnet(rows, { benchmarkHeight: 100 });
    expect(out[0].height).toBe(250);
  });

  test('предупреждава при липсваща станция', () => {
    const { warnings } = computeLevelingCarnet([{ station: '', back: '', fore: '' }], {});
    expect(warnings.some((w) => w.includes('липсва станция'))).toBe(true);
  });

  test('предупреждава при превишен допуск между контролни точки', () => {
    const settings = { benchmarkHeight: 100, toleranceMm: 5, rounding: 3 };
    const rows = [
      { station: 'C1', back: '1.000', fore: '', isControl: true },
      { station: 'M', back: '1.000', fore: '0.980' },
      { station: 'C2', back: '1.000', fore: '1.000', isControl: true },
    ];
    const { warnings } = computeLevelingCarnet(rows, settings);
    expect(warnings.some((w) => w.includes('контролни точки'))).toBe(true);
  });
});
