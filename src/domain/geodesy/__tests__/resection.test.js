import { calculateResection } from '../resection';

// Basic resection tests, updated for the v2 contract (Milestone 2.0C): beta1/beta2 are directed
// CLOCKWISE angles at P (P->A to P->B, P->B to P->C). The earlier versions of these tests derived
// UNSIGNED angles (|d|), which was the v1 interchangeable-complement semantics. The full v2
// suite is resection.v2.test.js; frozen v1 evidence is resection.v1.legacy.test.js.

const clockwise = (from, to, pivot) => {
  let d = Math.atan2(to.y - pivot.y, to.x - pivot.x) - Math.atan2(from.y - pivot.y, from.x - pivot.x);
  while (d < 0) d += 2 * Math.PI;
  return (d * 200) / Math.PI;
};

describe('calculateResection (v2, directed clockwise angles)', () => {
  test('възстановява известна точка P', () => {
    const A = { x: 1000, y: 1000 };
    const B = { x: 1200, y: 1000 };
    const C = { x: 1100, y: 1200 };
    const P = { x: 1050, y: 950 };

    const beta1 = clockwise(A, B, P);
    const beta2 = clockwise(B, C, P);

    const result = calculateResection(
      { xA: A.x, yA: A.y, xB: B.x, yB: B.y, xC: C.x, yC: C.y },
      { beta1, beta2 }
    );

    expect(result.xP).toBeCloseTo(P.x, 6);
    expect(result.yP).toBeCloseTo(P.y, 6);
    expect(result.error1).toBeLessThan(1e-6);
    expect(result.error2).toBeLessThan(1e-6);
  });

  test('приема координата 0', () => {
    const A = { x: 0, y: 0 };
    const B = { x: 200, y: 0 };
    const C = { x: 100, y: 200 };
    const P = { x: 80, y: -50 };
    const result = calculateResection(
      { xA: A.x, yA: A.y, xB: B.x, yB: B.y, xC: C.x, yC: C.y },
      { beta1: clockwise(A, B, P), beta2: clockwise(B, C, P) }
    );
    expect(result.xP).toBeCloseTo(P.x, 6);
    expect(result.yP).toBeCloseTo(P.y, 6);
  });

  test('отхвърля невалидни ъгли', () => {
    expect(() =>
      calculateResection(
        { xA: 0, yA: 0, xB: 1, yB: 0, xC: 0, yC: 1 },
        { beta1: 0, beta2: 50 }
      )
    ).toThrow('Ъглите β₁ и β₂ трябва да са в интервала (0, 400) гради');
  });
});
