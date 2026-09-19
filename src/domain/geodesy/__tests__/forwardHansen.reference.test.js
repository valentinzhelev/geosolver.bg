import { calculateForwardIntersection } from '../forwardIntersection';
import { calculateHansenTask } from '../hansenTask';

/**
 * Independent reference evidence (Milestone 2.0B) for forward-intersection and hansen-task.
 *
 * Frame: X = north, Y = east, bearings clockwise from +X (gon).
 * Forward intersection: alpha_AP = alpha_AB - beta1 and alpha_BP = alpha_BA + beta2, so P is
 * placed on the LEFT of A->B (same "left" as the Offset Point convention).
 *   forward signature: (yA, xA, yB, xB, beta1, beta2)   <- Y first
 *   hansen  signature: (xA, yA, xB, yB, alpha, beta)    <- X first
 */

const close = (a, b, digits = 9) => expect(a).toBeCloseTo(b, digits);
const toGon = (rad) => (rad * 200) / Math.PI;
const norm400 = (g) => ((g % 400) + 400) % 400;

// Independent construction: the interior angles at A and B that a station P sees, from atan2 only.
function anglesFor(A, B, P) {
  const alphaAB = toGon(Math.atan2(B.y - A.y, B.x - A.x));
  const alphaAP = toGon(Math.atan2(P.y - A.y, P.x - A.x));
  const alphaBA = alphaAB + 200;
  const alphaBP = toGon(Math.atan2(P.y - B.y, P.x - B.x));
  return { beta1: norm400(alphaAB - alphaAP), beta2: norm400(alphaBP - alphaBA) };
}

describe('forward-intersection — hand-known geometry', () => {
  it('isosceles right triangle: A=(X0,Y0) B=(X0,Y100), beta1=beta2=50 gon -> P=(50, 50)', () => {
    const r = calculateForwardIntersection(0, 0, 100, 0, 50, 50); // yA,xA,yB,xB
    close(r.xP, 50); close(r.yP, 50);
    close(r.sAB, 100);
    close(r.sAP, 100 * Math.SQRT1_2); close(r.sBP, 100 * Math.SQRT1_2);
    close(r.alphaAB, 100); close(r.alphaBA, 300);
    close(r.alphaAP, 50); close(r.alphaBP, 350);
  });

  it('P lies on the LEFT of A->B (facing east, left is north: X > 0)', () => {
    const r = calculateForwardIntersection(0, 0, 100, 0, 40, 60);
    expect(r.xP).toBeGreaterThan(0);
  });

  it('swapping A and B flips the side (facing west, left is south: X < 0)', () => {
    const r = calculateForwardIntersection(100, 0, 0, 0, 50, 50); // A=(X0,Y100), B=(X0,Y0)
    close(r.xP, -50); close(r.yP, 50);
  });

  it('both independent intersections coincide (maxDiff ~ 0) for consistent angles', () => {
    const r = calculateForwardIntersection(200, 100, 300, 250, 61.5, 48.25);
    expect(r.maxDiff).toBeLessThan(1e-9);
    close(r.xPrimP, r.xSecondP, 9);
    close(r.yPrimP, r.ySecondP, 9);
  });
});

describe('forward-intersection — round trip from a known station P', () => {
  const stations = [
    { A: { x: 0, y: 0 }, B: { x: 0, y: 100 }, P: { x: 30, y: 40 } },
    { A: { x: 100, y: 200 }, B: { x: 160, y: 380 }, P: { x: 190, y: 250 } },
    { A: { x: -50.5, y: 1000.25 }, B: { x: 200.75, y: 1400 }, P: { x: 300, y: 950 } },
  ];

  it.each(stations.map((s, i) => [i, s]))('case %i: P is recovered from atan2-derived angles', (_i, { A, B, P }) => {
    // Precondition (independent): P really is on the left of A->B.
    const cross = (B.x - A.x) * (P.y - A.y) - (B.y - A.y) * (P.x - A.x);
    expect(cross).toBeLessThan(0);
    const { beta1, beta2 } = anglesFor(A, B, P);
    expect(beta1 + beta2).toBeLessThan(200);
    const r = calculateForwardIntersection(A.y, A.x, B.y, B.x, beta1, beta2);
    close(r.xP, P.x, 8); close(r.yP, P.y, 8);
    close(r.checkSAP, Math.hypot(P.x - A.x, P.y - A.y), 8);
    close(r.checkSBP, Math.hypot(P.x - B.x, P.y - B.y), 8);
  });
});

describe('forward-intersection — validation (current behavior)', () => {
  const call = (b1, b2) => calculateForwardIntersection(0, 0, 100, 0, b1, b2);
  it('angles must be > 0 and their sum strictly below 200 gon', () => {
    expect(() => call(0, 50)).toThrow('Ъглите трябва да бъдат положителни');
    expect(() => call(50, -1)).toThrow('Ъглите трябва да бъдат положителни');
    expect(() => call(100, 100)).toThrow('Сумата от ъглите не може да бъде по-голяма от 200 гради'); // == 200 is rejected
    expect(() => call(150, 60)).toThrow('Сумата от ъглите не може да бъде по-голяма от 200 гради');
    expect(() => call(99.999, 100)).not.toThrow();
  });
  it('coincident A/B and non-finite values', () => {
    expect(() => calculateForwardIntersection(5, 5, 5, 5, 40, 40)).toThrow('Точките A и B не могат да съвпадат');
    expect(() => calculateForwardIntersection(NaN, 0, 1, 1, 40, 40)).toThrow('YA трябва да е валидно число');
    expect(() => calculateForwardIntersection(0, 0, 1, 1, 40, NaN)).toThrow('β₂ трябва да е валидно число');
  });
});

describe('hansen-task — this implementation IS a forward intersection (documented in the module)', () => {
  it('isosceles reference: A=(X0,Y0) B=(X0,Y100), alpha=beta=50 gon -> P=(50, 50)', () => {
    const r = calculateHansenTask(0, 0, 0, 100, 50, 50); // xA,yA,xB,yB
    close(r.xP, 50); close(r.yP, 50);
    close(r.distanceAB, 100);
    close(r.distanceAP, 100 * Math.SQRT1_2); close(r.distanceBP, 100 * Math.SQRT1_2);
    close(r.sinAlpha, Math.SQRT1_2);
    close(r.sinAlphaBeta, 1);
    close(r.coefficient, Math.SQRT1_2);
    expect(r.method).toBe('forward-intersection');
  });

  it('argument order differs from forward-intersection: (xA, yA, xB, yB) vs (yA, xA, yB, xB)', () => {
    const A = { x: 10, y: 200 };
    const B = { x: 30, y: 300 };
    const h = calculateHansenTask(A.x, A.y, B.x, B.y, 55, 45);
    const f = calculateForwardIntersection(A.y, A.x, B.y, B.x, 55, 45);
    close(h.xP, f.xP, 12); close(h.yP, f.yP, 12); // parity — the geometry evidence is the round trip below
  });

  it('round trip: P is recovered from atan2-derived angles', () => {
    const A = { x: 100, y: 200 };
    const B = { x: 160, y: 380 };
    const P = { x: 190, y: 250 };
    const { beta1, beta2 } = anglesFor(A, B, P);
    const r = calculateHansenTask(A.x, A.y, B.x, B.y, beta1, beta2);
    close(r.xP, P.x, 8); close(r.yP, P.y, 8);
    close(r.deltaX, P.x - A.x, 8); close(r.deltaY, P.y - A.y, 8);
  });

  it('validation: coincident A/B, non-finite values, and forward-intersection angle rules', () => {
    expect(() => calculateHansenTask(1, 1, 1, 1, 40, 40)).toThrow('Точките A и B не могат да съвпадат');
    expect(() => calculateHansenTask(NaN, 0, 1, 1, 40, 40)).toThrow('XA трябва да е валидно число');
    expect(() => calculateHansenTask(0, 0, 1, 1, NaN, 40)).toThrow('α трябва да е валидно число');
    expect(() => calculateHansenTask(0, 0, 0, 100, 100, 100)).toThrow('Сумата от ъглите');
    expect(() => calculateHansenTask(0, 0, 0, 100, -5, 40)).toThrow('Ъглите трябва да бъдат положителни');
  });
});
