import { calculateResection } from '../resection';
import { RESECTION_DOC_EXAMPLE } from '../resectionExample';

// DOCUMENTATION: the worked example on the Resection docs page is rendered from
// RESECTION_DOC_EXAMPLE. This test keeps it honest — the angles are re-derived from the known
// station with an independent atan2 construction, and the production v2 solver must reproduce the
// station from the DISPLAYED (rounded) angles. If the engine or the example changes, this fails.

const clockwise = (from, to, P) => {
  let d = Math.atan2(to.y - P.y, to.x - P.x) - Math.atan2(from.y - P.y, from.x - P.x);
  while (d < 0) d += 2 * Math.PI;
  return (d * 200) / Math.PI;
};

const { controls, station, angles, displayToleranceMetres } = RESECTION_DOC_EXAMPLE;
const points = { xA: controls.A.x, yA: controls.A.y, xB: controls.B.x, yB: controls.B.y, xC: controls.C.x, yC: controls.C.y };

describe('Resection docs worked example (directed clockwise angles)', () => {
  it('the displayed angles equal the independently derived directed angles at the known station (to the 4 decimals shown)', () => {
    expect(angles.beta1).toBeCloseTo(clockwise(controls.A, controls.B, station), 4);
    expect(angles.beta2).toBeCloseTo(clockwise(controls.B, controls.C, station), 4);
    expect(String(angles.beta1).split('.')[1].length).toBeLessThanOrEqual(4);
    expect(String(angles.beta2).split('.')[1].length).toBeLessThanOrEqual(4);
  });

  it('the production v2 solver reproduces the documented station from the displayed angles, within the displayed 2-decimal precision', () => {
    const r = calculateResection(points, angles);
    expect(Math.abs(r.xP - station.x)).toBeLessThan(displayToleranceMetres);
    expect(Math.abs(r.yP - station.y)).toBeLessThan(displayToleranceMetres);
    expect(r.xP.toFixed(2)).toBe(station.x.toFixed(2));
    expect(r.yP.toFixed(2)).toBe(station.y.toFixed(2));
    expect(r.conditionNumber).toBeLessThan(5); // "strong geometry"
    expect(Math.max(r.error1, r.error2)).toBeLessThan(1e-6);
  });

  it('the example is simple and valid: whole-metre control coordinates, angles inside (0, 400), A-B-C seen clockwise from P', () => {
    for (const p of Object.values(controls)) {
      expect(Number.isInteger(p.x)).toBe(true);
      expect(Number.isInteger(p.y)).toBe(true);
    }
    expect(angles.beta1).toBeGreaterThan(0);
    expect(angles.beta2).toBeGreaterThan(0);
    expect(angles.beta1 + angles.beta2).toBeLessThan(400);
    const bearing = (Q) => (((Math.atan2(Q.y - station.y, Q.x - station.x) * 200) / Math.PI) + 400) % 400;
    const bA = bearing(controls.A);
    const bB = bearing(controls.B);
    const bC = bearing(controls.C);
    expect(((bB - bA) + 400) % 400).toBeCloseTo(angles.beta1, 3);
    expect(((bC - bB) + 400) % 400).toBeCloseTo(angles.beta2, 3);
  });

  it('the previous documented example (beta 80 / 70 -> Y 1417.19, X 4142.16) is not reproduced by any reading — it stays retired', () => {
    const old = { xA: 4047.53, yA: 1209.12, xB: 4214.61, yB: 1289.19, xC: 4100, yC: 1400 };
    const r = calculateResection(old, { beta1: 80, beta2: 70 });
    expect(Math.hypot(r.xP - 4142.16, r.yP - 1417.19)).toBeGreaterThan(10);
  });
});
