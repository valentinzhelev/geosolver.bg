import { calculateFirstTask } from '../firstTask';
import { calculatePolarIntersection } from '../polarIntersection';
import { calculateDistanceBearing } from '../distanceBearing';
import { vtoraOsnovnaZadacha } from '../secondTaskShipped';

/**
 * Independent reference evidence (Milestone 2.0B) for the direct/inverse family:
 * first-basic-task, polar-intersection, distance-bearing (and the shipped second task).
 *
 * Frame: X = north, Y = east, bearing alpha clockwise from +X in gon
 *   dX = S cos(alpha), dY = S sin(alpha)
 * Evidence is (1) hand-known geometry (axes, 3-4-5), (2) direct<->inverse round trips —
 * NOT merely "two implementations agree".
 */

const GON = Math.PI / 200;
const close = (a, b, digits = 9) => expect(a).toBeCloseTo(b, digits);
const bearing345 = (Math.atan2(80, 60) * 200) / Math.PI; // 59.0334... gon, closed form

describe('first-basic-task — hand-known geometry (signature: y1, x1, alphaGon, s)', () => {
  it('axis directions: 0 -> +X, 100 -> +Y, 200 -> -X, 300 -> -Y', () => {
    const at = (alpha) => calculateFirstTask(1000, 2000, alpha, 50); // y1=1000, x1=2000
    let r = at(0);
    close(r.x2, 2050); close(r.y2, 1000);
    r = at(100);
    close(r.x2, 2000); close(r.y2, 1050);
    r = at(200);
    close(r.x2, 1950); close(r.y2, 1000);
    r = at(300);
    close(r.x2, 2000); close(r.y2, 950);
  });

  it('3-4-5 triangle: alpha = atan(80/60) gives dX=60, dY=80 for S=100', () => {
    const r = calculateFirstTask(200, 100, bearing345, 100);
    close(r.deltaX, 60); close(r.deltaY, 80);
    close(r.x2, 160); close(r.y2, 280);
  });

  it('quadrant labels for interior directions', () => {
    expect(calculateFirstTask(0, 0, 50, 10).quadrant).toBe('I');
    expect(calculateFirstTask(0, 0, 150, 10).quadrant).toBe('II');
    expect(calculateFirstTask(0, 0, 250, 10).quadrant).toBe('III');
    expect(calculateFirstTask(0, 0, 350, 10).quadrant).toBe('IV');
  });

  it('verification fields agree with the inputs (calculatedDistance = S, calculatedAngle = alpha)', () => {
    for (const alpha of [10, 75.5, 150, 199.999, 250.25, 399.5]) {
      const r = calculateFirstTask(12.5, -40.25, alpha, 321.125);
      close(r.calculatedDistance, 321.125);
      close(r.calculatedAngle, alpha, 9);
    }
  });

  it('validation: alpha in [0, 400), S > 0, finite numbers', () => {
    expect(() => calculateFirstTask(0, 0, -0.001, 10)).toThrow('Посочният ъгъл трябва да бъде между 0 и 400 гради');
    expect(() => calculateFirstTask(0, 0, 400, 10)).toThrow('Посочният ъгъл трябва да бъде между 0 и 400 гради');
    expect(() => calculateFirstTask(0, 0, 0, 10)).not.toThrow();
    expect(() => calculateFirstTask(0, 0, 399.999999, 10)).not.toThrow();
    expect(() => calculateFirstTask(0, 0, 50, 0)).toThrow('Дължината трябва да бъде положителна');
    expect(() => calculateFirstTask(0, 0, 50, -1)).toThrow('Дължината трябва да бъде положителна');
    expect(() => calculateFirstTask(NaN, 0, 50, 1)).toThrow('Y1 трябва да е валидно число');
    expect(() => calculateFirstTask(0, Infinity, 50, 1)).toThrow('X1 трябва да е валидно число');
  });
});

describe('first-basic-task <-> distance-bearing round trip (direct then inverse)', () => {
  it.each([[0, 100], [33.3333, 12.5], [100, 77], [166.6667, 250], [200, 5], [250.5, 999.999], [300, 1], [399.9, 42]])(
    'alpha=%f S=%f is recovered from the computed point',
    (alpha, s) => {
      const first = calculateFirstTask(1234.5, 6789.25, alpha, s); // y1, x1
      const inv = calculateDistanceBearing(6789.25, 1234.5, first.x2, first.y2); // x1, y1, x2, y2
      close(inv.distance, s, 8);
      const diff = Math.abs(inv.bearingGon - alpha);
      expect(Math.min(diff, 400 - diff)).toBeLessThan(1e-8); // tolerate 0 vs 400 wrap
    }
  );

  it('the shipped (rounded) second task recovers alpha and S to its 3 dp precision', () => {
    const first = calculateFirstTask(200, 100, bearing345, 100);
    const second = vtoraOsnovnaZadacha(100, 200, first.x2, first.y2);
    expect(second.distance).toBe(100);
    expect(second.alpha).toBeCloseTo(bearing345, 3);
  });
});

describe('polar-intersection — hand-known geometry (signature: xA, yA, angle, distance)', () => {
  it('axis directions: 0 -> +X, 100 -> +Y, 200 -> -X, 300 -> -Y', () => {
    const at = (a) => calculatePolarIntersection(2000, 1000, a, 50); // xA=2000, yA=1000
    let r = at(0); close(r.xP, 2050); close(r.yP, 1000);
    r = at(100); close(r.xP, 2000); close(r.yP, 1050);
    r = at(200); close(r.xP, 1950); close(r.yP, 1000);
    r = at(300); close(r.xP, 2000); close(r.yP, 950);
  });

  it('3-4-5 triangle', () => {
    const r = calculatePolarIntersection(100, 200, bearing345, 100);
    close(r.xP, 160); close(r.yP, 280);
  });

  it('argument order is X first (unlike first-basic-task which is Y first)', () => {
    const r = calculatePolarIntersection(10, 20, 0, 5); // xA=10, yA=20, due +X
    close(r.xP, 15); close(r.yP, 20);
  });

  it('angle is NOT range-checked (unlike first-basic-task): 450 == 50 and -50 == 350', () => {
    const base = calculatePolarIntersection(0, 0, 50, 10);
    const over = calculatePolarIntersection(0, 0, 450, 10);
    const neg = calculatePolarIntersection(0, 0, -350, 10);
    close(over.xP, base.xP); close(over.yP, base.yP);
    close(neg.xP, base.xP); close(neg.yP, base.yP);
    expect(() => calculateFirstTask(0, 0, 450, 10)).toThrow(); // first task rejects the same angle
  });

  it('reverse angle is alpha +/- 200 gon', () => {
    expect(calculatePolarIntersection(0, 0, 50, 10).reverseAngle).toBe(250);
    expect(calculatePolarIntersection(0, 0, 250, 10).reverseAngle).toBe(50);
    expect(calculatePolarIntersection(0, 0, 200, 10).reverseAngle).toBe(0);
  });

  it('validation: distance > 0, finite numbers', () => {
    expect(() => calculatePolarIntersection(0, 0, 10, 0)).toThrow('Разстоянието трябва да е положително число');
    expect(() => calculatePolarIntersection(0, 0, 10, -5)).toThrow('Разстоянието трябва да е положително число');
    expect(() => calculatePolarIntersection(NaN, 0, 10, 5)).toThrow('XA трябва да е валидно число');
    expect(() => calculatePolarIntersection(0, 0, NaN, 5)).toThrow('Ъгълът трябва да е валидно число');
  });
});

describe('polar-intersection <-> distance-bearing round trip', () => {
  it.each([[0, 100], [45.5, 12.25], [100, 80], [180, 33], [200, 5], [271.125, 500], [399.99, 9]])(
    'angle=%f distance=%f is recovered by the inverse',
    (angle, distance) => {
      const p = calculatePolarIntersection(500.5, 800.25, angle, distance); // xA, yA
      const inv = calculateDistanceBearing(500.5, 800.25, p.xP, p.yP);
      close(inv.distance, distance, 8);
      const diff = Math.abs(inv.bearingGon - angle);
      expect(Math.min(diff, 400 - diff)).toBeLessThan(1e-8);
    }
  );

  it('polar and first-basic-task compute the same point (parity only — the evidence is the geometry above)', () => {
    const polar = calculatePolarIntersection(100, 200, 123.456, 250); // xA, yA
    const first = calculateFirstTask(200, 100, 123.456, 250); // y1, x1
    close(polar.xP, first.x2, 12);
    close(polar.yP, first.y2, 12);
  });
});

describe('distance-bearing — hand-known geometry (signature: x1, y1, x2, y2)', () => {
  it('axis bearings: +X = 0 gon (0 deg), +Y = 100 (90), -X = 200 (180), -Y = 300 (270)', () => {
    const at = (x2, y2) => calculateDistanceBearing(0, 0, x2, y2);
    let r = at(100, 0); close(r.bearingGon, 0); close(r.bearingDeg, 0); close(r.distance, 100);
    r = at(0, 100); close(r.bearingGon, 100); close(r.bearingDeg, 90);
    r = at(-100, 0); close(r.bearingGon, 200); close(r.bearingDeg, 180);
    r = at(0, -100); close(r.bearingGon, 300); close(r.bearingDeg, 270);
  });

  it('3-4-5 triangle: distance 100 and bearing atan(80/60) in gon and radians', () => {
    const r = calculateDistanceBearing(100, 200, 160, 280);
    close(r.distance, 100);
    close(r.bearingGon, bearing345);
    close(r.bearingRad, bearing345 * GON);
    close(r.deltaX, 60); close(r.deltaY, 80);
  });

  it('bearing is always in [0, 400) and quadrant labels follow the X-north/Y-east frame', () => {
    const cases = [[10, 10, 'I'], [-10, 10, 'II'], [-10, -10, 'III'], [10, -10, 'IV']];
    for (const [dx, dy, quadrant] of cases) {
      const r = calculateDistanceBearing(0, 0, dx, dy);
      expect(r.bearingGon).toBeGreaterThanOrEqual(0);
      expect(r.bearingGon).toBeLessThan(400);
      expect(r.quadrant.startsWith(`${quadrant} квадрант`)).toBe(true);
    }
    // second quadrant means bearing in (100, 200), etc.
    expect(calculateDistanceBearing(0, 0, -10, 10).bearingGon).toBeGreaterThan(100);
    expect(calculateDistanceBearing(0, 0, -10, 10).bearingGon).toBeLessThan(200);
  });

  it('reversing the points reverses the bearing by 200 gon and keeps the distance', () => {
    const ab = calculateDistanceBearing(120.5, 340.25, 410.75, 88.125);
    const ba = calculateDistanceBearing(410.75, 88.125, 120.5, 340.25);
    close(ab.distance, ba.distance, 10);
    close(((ab.bearingGon + 200) % 400), ba.bearingGon, 9);
  });

  it('validation: coincident points and non-finite values', () => {
    expect(() => calculateDistanceBearing(5, 5, 5, 5)).toThrow('Точките не могат да съвпадат');
    expect(() => calculateDistanceBearing(NaN, 0, 1, 1)).toThrow('X1 трябва да е валидно число');
    expect(() => calculateDistanceBearing(0, 0, 1, Infinity)).toThrow('Y2 трябва да е валидно число');
  });
});
