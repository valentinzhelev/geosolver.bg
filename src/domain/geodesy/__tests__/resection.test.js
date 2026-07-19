import { calculateResection } from '../resection';

describe('calculateResection (Tienstra)', () => {
  test('възстановява известна точка P', () => {
    // Control points
    const A = { x: 1000, y: 1000 };
    const B = { x: 1200, y: 1000 };
    const C = { x: 1100, y: 1200 };
    // Place P via first task from A, then measure angles at P
    const P = { x: 1050, y: 950 };

    const ang = (from, to, pivot) => {
      const a = Math.atan2(from.y - pivot.y, from.x - pivot.x);
      const b = Math.atan2(to.y - pivot.y, to.x - pivot.x);
      let d = b - a;
      while (d <= -Math.PI) d += 2 * Math.PI;
      while (d > Math.PI) d -= 2 * Math.PI;
      return (Math.abs(d) * 200) / Math.PI;
    };

    const beta1 = ang(A, B, P);
    const beta2 = ang(B, C, P);

    const result = calculateResection(
      { xA: A.x, yA: A.y, xB: B.x, yB: B.y, xC: C.x, yC: C.y },
      { beta1, beta2 }
    );

    expect(result.xP).toBeCloseTo(P.x, 1);
    expect(result.yP).toBeCloseTo(P.y, 1);
    expect(result.error1).toBeLessThan(0.5);
    expect(result.error2).toBeLessThan(0.5);
  });

  test('приема координата 0', () => {
    const A = { x: 0, y: 0 };
    const B = { x: 200, y: 0 };
    const C = { x: 100, y: 200 };
    const P = { x: 80, y: -50 };
    const ang = (from, to, pivot) => {
      const a = Math.atan2(from.y - pivot.y, from.x - pivot.x);
      const b = Math.atan2(to.y - pivot.y, to.x - pivot.x);
      let d = b - a;
      while (d <= -Math.PI) d += 2 * Math.PI;
      while (d > Math.PI) d -= 2 * Math.PI;
      return (Math.abs(d) * 200) / Math.PI;
    };
    const result = calculateResection(
      { xA: A.x, yA: A.y, xB: B.x, yB: B.y, xC: C.x, yC: C.y },
      { beta1: ang(A, B, P), beta2: ang(B, C, P) }
    );
    expect(result.xP).toBeCloseTo(P.x, 1);
    expect(result.yP).toBeCloseTo(P.y, 1);
  });

  test('отхвърля невалидни ъгли', () => {
    expect(() =>
      calculateResection(
        { xA: 0, yA: 0, xB: 1, yB: 0, xC: 0, yC: 1 },
        { beta1: 0, beta2: 50 }
      )
    ).toThrow();
  });
});
