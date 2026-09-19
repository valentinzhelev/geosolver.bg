import contracts from '../__fixtures__/persistedContracts.json';
import vectors from '../__fixtures__/persistedVectors.json';
import { calculateFirstTask } from '../firstTask';
import { calculateForwardIntersection } from '../forwardIntersection';
import { calculateResection } from '../resection';
import { calculatePolarIntersection } from '../polarIntersection';
import { calculateCoordinateTransformation } from '../coordinateTransformation';
import { calculateHansenTask } from '../hansenTask';
import { calculateDistanceBearing } from '../distanceBearing';
import { calculateLineIntersection } from '../lineIntersection';
import { calculateOrthogonalOffset } from '../orthogonalOffset';
import { calculateSegmentPoint } from '../segmentDivision';
import { roundTo } from '../../math';

// Re-derives every golden persisted vector from the real domain functions + the contract's
// rounding rule. The adapters encode each tool's positional argument order — which differs
// between tools and must be reproduced exactly by any port.
const adapters = {
  'first-basic-task': (i) => calculateFirstTask(i.y1, i.x1, i.alpha, i.s),
  'forward-intersection': (i) => calculateForwardIntersection(i.yA, i.xA, i.yB, i.xB, i.beta1, i.beta2),
  resection: (i) => calculateResection({ xA: i.xA, yA: i.yA, xB: i.xB, yB: i.yB, xC: i.xC, yC: i.yC }, { beta1: i.beta1, beta2: i.beta2 }),
  'polar-intersection': (i) => calculatePolarIntersection(i.xA, i.yA, i.angle, i.distance),
  'coordinate-transformation': (i) => calculateCoordinateTransformation(i.x, i.y, i.transformationType, i.parameters),
  'hansen-task': (i) => calculateHansenTask(i.xA, i.yA, i.xB, i.yB, i.alpha, i.beta),
  'distance-bearing': (i) => calculateDistanceBearing(i.x1, i.y1, i.x2, i.y2),
  'line-intersection': (i) => calculateLineIntersection(i.x1, i.y1, i.x2, i.y2, i.x3, i.y3, i.x4, i.y4),
  'offset-point': (i) => calculateOrthogonalOffset(i.yA, i.xA, i.yB, i.xB, i.s, i.d),
  'segment-division': (i) => calculateSegmentPoint(i.yA, i.xA, i.yB, i.xB, i.value, i.mode),
};

const persistedOf = (tool, full) => {
  const result = {};
  for (const [field, decimals] of contracts.tools[tool].persistedResult) {
    result[field] = typeof decimals === 'number' ? roundTo(full[field], decimals) : full[field];
  }
  return result;
};

const cases = Object.entries(vectors.tools).flatMap(([tool, t]) => t.vectors.map((v) => [`${tool}: ${v.name}`, tool, v]));

describe('golden persisted vectors (input -> persisted result, contract rounding applied)', () => {
  it('covers the ten domain-layer tools (second-basic-task and area have their own shipped vector files)', () => {
    expect(Object.keys(vectors.tools).sort()).toEqual(Object.keys(adapters).sort());
  });

  it.each(cases)('%s', (_label, tool, v) => {
    // The saved input has exactly the contract's key set.
    expect(Object.keys(v.input).sort()).toEqual([...contracts.tools[tool].persistedInput].sort());
    const derived = persistedOf(tool, adapters[tool](v.input));
    expect(Object.keys(derived).sort()).toEqual(Object.keys(v.result).sort());
    for (const [field, decimals] of contracts.tools[tool].persistedResult) {
      if (typeof decimals === 'number') {
        expect(derived[field]).toBe(v.result[field]); // rounded values must match exactly
      } else if (decimals === 'string') {
        expect(derived[field]).toBe(v.result[field]);
      } else {
        expect(derived[field]).toBeCloseTo(v.result[field], 9); // unrounded: tolerate last-bit noise
      }
    }
  });

  it('every saved input value is a finite Number (or the documented enum/object) — no strings', () => {
    for (const [, tool, v] of cases) {
      for (const [key, value] of Object.entries(v.input)) {
        if (key === 'mode' || key === 'transformationType') expect(typeof value).toBe('string');
        else if (key === 'parameters') expect(typeof value).toBe('object');
        else expect(Number.isFinite(value)).toBe(true);
      }
      expect(tool in contracts.tools).toBe(true);
    }
  });
});
