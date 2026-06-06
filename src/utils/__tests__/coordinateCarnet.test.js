import {
  parseNum,
  roundTo,
  normalizeGon,
  signedGon,
  computeCoordinateCarnet,
} from '../coordinateCarnet';

describe('coordinateCarnet · помощни функции', () => {
  test('parseNum приема запетая като десетичен разделител', () => {
    expect(parseNum('12,5')).toBe(12.5);
    expect(parseNum('3.25')).toBe(3.25);
  });

  test('parseNum връща null за празно/невалидно', () => {
    expect(parseNum('')).toBeNull();
    expect(parseNum(null)).toBeNull();
    expect(parseNum('abc')).toBeNull();
  });

  test('normalizeGon нормализира в интервала [0, 400)', () => {
    expect(normalizeGon(450)).toBe(50);
    expect(normalizeGon(-50)).toBe(350);
    expect(normalizeGon(400)).toBe(0);
  });

  test('signedGon връща стойност в (-200, 200]', () => {
    expect(signedGon(390)).toBe(-10);
    expect(signedGon(10)).toBe(10);
  });

  test('roundTo закръгля и пропуска null', () => {
    expect(roundTo(1.23456, 3)).toBe(1.235);
    expect(roundTo(null, 3)).toBeNull();
  });
});

describe('computeCoordinateCarnet', () => {
  test('α = 100 gon → движение по +Y (изток)', () => {
    const settings = {
      startY: 1000,
      startX: 1000,
      startBearing: 100,
      closed: false,
      endY: 1050,
      endX: 1000,
      rounding: 3,
      angleRounding: 4,
    };
    const rows = [
      { pointNo: 'A', beta: '', distance: '' },
      { pointNo: 'B', beta: '200', distance: '50' },
    ];
    const { rows: out, summary } = computeCoordinateCarnet(rows, settings);

    expect(out[0].alpha).toBe(100);
    expect(out[1].alpha).toBe(100);
    expect(out[1].deltaY).toBe(50);
    expect(out[1].deltaX).toBeCloseTo(0, 6);
    expect(out[0].y).toBe(1000);
    expect(out[0].x).toBe(1000);
    expect(summary.sumS).toBe(50);
    expect(summary.sumDeltaY).toBe(50);
  });

  test('α = 0 gon → движение по +X (север)', () => {
    const settings = { startY: 500, startX: 500, startBearing: 0, closed: false, rounding: 3, angleRounding: 4 };
    const rows = [
      { pointNo: '1', beta: '', distance: '' },
      { pointNo: '2', beta: '200', distance: '30' },
    ];
    const { rows: out } = computeCoordinateCarnet(rows, settings);

    expect(out[1].alpha).toBe(0);
    expect(out[1].deltaX).toBe(30);
    expect(out[1].deltaY).toBeCloseTo(0, 6);
  });

  test('предупреждава при ъглова невръзка над допуска', () => {
    const settings = { startBearing: 0, closed: true, angularToleranceMgon: 50, rounding: 3, angleRounding: 4 };
    const rows = [
      { pointNo: '1', beta: '200.100', distance: '10' },
      { pointNo: '2', beta: '200.000', distance: '10' },
    ];
    const { warnings, summary } = computeCoordinateCarnet(rows, settings);

    expect(summary.angularMisclosureMgon).toBeCloseTo(100, 1);
    expect(warnings.some((w) => w.includes('Ъглова невръзка'))).toBe(true);
  });

  test('предупреждава при липсващ номер на точка', () => {
    const { warnings } = computeCoordinateCarnet([{ pointNo: '', beta: '', distance: '' }], {});
    expect(warnings.some((w) => w.includes('липсва номер'))).toBe(true);
  });
});
