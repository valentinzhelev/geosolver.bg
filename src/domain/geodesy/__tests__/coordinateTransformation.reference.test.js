import { calculateCoordinateTransformation as transform } from '../coordinateTransformation';

/**
 * Reference evidence (Milestone 2.0B) for coordinate-transformation.
 * Signature: (x, y, transformationType, parameters). Types: translation | rotation | scaling.
 *   translation: X' = X + dx,  Y' = Y + dy        (defaults dx=dy=0)
 *   rotation:    X' = X cos a - Y sin a, Y' = X sin a + Y cos a   (a in gon, about the ORIGIN; default 0)
 *   scaling:     X' = X sx,   Y' = Y sy             (defaults sx=sy=1)
 * Rotation direction in the X-north/Y-east frame: a positive angle turns +X toward +Y, i.e. it
 * INCREASES bearing by a (clockwise on a map). This is a characterization of what ships today.
 */

const close = (a, b, digits = 9) => expect(a).toBeCloseTo(b, digits);
const out = (r) => [r.xTransformed, r.yTransformed];

describe('translation', () => {
  it('(100, 200) + (10, -5) = (110, 195)', () => {
    const r = transform(100, 200, 'translation', { dx: 10, dy: -5 });
    expect(out(r)).toEqual([110, 195]);
    expect(r.deltaX).toBe(10);
    expect(r.deltaY).toBe(-5);
  });

  it('missing parameters default to zero shift (also with parameters undefined)', () => {
    expect(out(transform(7, 8, 'translation', {}))).toEqual([7, 8]);
    expect(out(transform(7, 8, 'translation', undefined))).toEqual([7, 8]);
    expect(out(transform(7, 8, 'translation', { dx: 3 }))).toEqual([10, 8]);
  });

  it('inverse translation restores the original point', () => {
    const fwd = transform(123.456, -78.9, 'translation', { dx: 55.5, dy: 12.25 });
    const back = transform(fwd.xTransformed, fwd.yTransformed, 'translation', { dx: -55.5, dy: -12.25 });
    close(back.xTransformed, 123.456, 10); close(back.yTransformed, -78.9, 10);
  });
});

describe('rotation (angle in gon, about the origin)', () => {
  it('(100, 0) rotated 100 gon (90 deg) -> (0, 100)', () => {
    const [x, y] = out(transform(100, 0, 'rotation', { angle: 100 }));
    close(x, 0); close(y, 100);
  });

  it('(0, 100) rotated 100 gon -> (-100, 0)', () => {
    const [x, y] = out(transform(0, 100, 'rotation', { angle: 100 }));
    close(x, -100); close(y, 0);
  });

  it('(100, 0) rotated 200 gon -> (-100, 0); 300 gon -> (0, -100)', () => {
    let [x, y] = out(transform(100, 0, 'rotation', { angle: 200 }));
    close(x, -100); close(y, 0);
    [x, y] = out(transform(100, 0, 'rotation', { angle: 300 }));
    close(x, 0); close(y, -100);
  });

  it('(100, 0) rotated 50 gon (45 deg) -> (100/sqrt2, 100/sqrt2)', () => {
    const [x, y] = out(transform(100, 0, 'rotation', { angle: 50 }));
    close(x, 100 * Math.SQRT1_2); close(y, 100 * Math.SQRT1_2);
  });

  it('a positive angle INCREASES bearing: the rotated +X point has bearing = angle (gon)', () => {
    for (const a of [10, 50, 100, 150, 250, 399]) {
      const [x, y] = out(transform(100, 0, 'rotation', { angle: a }));
      let bearing = (Math.atan2(y, x) * 200) / Math.PI;
      if (bearing < 0) bearing += 400;
      close(bearing, a, 8);
    }
  });

  it('rotation preserves the distance from the origin', () => {
    const [x, y] = out(transform(123.5, -45.25, 'rotation', { angle: 77.7 }));
    close(Math.hypot(x, y), Math.hypot(123.5, -45.25), 9);
  });

  it('a full turn (400 gon) restores the point; rotating by a then -a is the identity', () => {
    let [x, y] = out(transform(321.5, 987.25, 'rotation', { angle: 400 }));
    close(x, 321.5, 9); close(y, 987.25, 9);
    const fwd = transform(321.5, 987.25, 'rotation', { angle: 63.21 });
    const back = transform(fwd.xTransformed, fwd.yTransformed, 'rotation', { angle: -63.21 });
    close(back.xTransformed, 321.5, 9); close(back.yTransformed, 987.25, 9);
  });

  it('missing angle defaults to 0 (identity)', () => {
    expect(out(transform(5, 6, 'rotation', {}))).toEqual([5, 6]);
  });
});

describe('scaling', () => {
  it('(100, 200) with sx=2, sy=0.5 -> (200, 100)', () => {
    expect(out(transform(100, 200, 'scaling', { scaleX: 2, scaleY: 0.5 }))).toEqual([200, 100]);
  });

  it('missing scale factors default to 1; negative factors mirror', () => {
    expect(out(transform(9, 8, 'scaling', {}))).toEqual([9, 8]);
    expect(out(transform(9, 8, 'scaling', { scaleX: -1, scaleY: 1 }))).toEqual([-9, 8]);
  });

  it('the domain honours a scale of 0 (collapses the axis) — the UI replaces 0 by 1 before calling (parseFloat(...) || 1)', () => {
    expect(out(transform(9, 8, 'scaling', { scaleX: 0, scaleY: 2 }))).toEqual([0, 16]);
  });

  it('scaling then the reciprocal scaling restores the point', () => {
    const fwd = transform(12.5, -33.25, 'scaling', { scaleX: 3, scaleY: 0.25 });
    const back = transform(fwd.xTransformed, fwd.yTransformed, 'scaling', { scaleX: 1 / 3, scaleY: 4 });
    close(back.xTransformed, 12.5, 10); close(back.yTransformed, -33.25, 10);
  });
});

describe('validation (current behavior)', () => {
  it('x and y must be finite numbers; the type is required and must be known', () => {
    expect(() => transform(NaN, 1, 'translation', {})).toThrow('X координатата трябва да е валидно число');
    expect(() => transform(1, Infinity, 'translation', {})).toThrow('Y координатата трябва да е валидно число');
    expect(() => transform(1, 1, undefined, {})).toThrow('Типът трансформация е задължителен');
    expect(() => transform(1, 1, 'shear', {})).toThrow('Неизвестен тип трансформация');
  });

  it('echoes the input and parameters and reports the deltas', () => {
    const r = transform(10, 20, 'translation', { dx: 1, dy: 2 });
    expect(r).toMatchObject({ xOriginal: 10, yOriginal: 20, transformationType: 'translation', parameters: { dx: 1, dy: 2 } });
  });
});

describe('KNOWN GAP — parameters are not type-checked by the domain function (NOT a mathematical feature)', () => {
  // The future canonical contract requires every numeric parameter to be a finite Number after
  // normalization and must REJECT these inputs. They are pinned here only so the gap is visible
  // and so a later fix shows up as an explicit test change. The calculator UI always converts
  // parameters with parseFloat(...) before calling, so real UI traffic never takes these paths.
  it('a string dx concatenates instead of adding (JS "+" semantics)', () => {
    const r = transform(100, 200, 'translation', { dx: '5', dy: 0 });
    expect(r.xTransformed).toBe('1005');
    expect(typeof r.xTransformed).toBe('string');
  });

  it('a non-numeric rotation angle silently yields NaN coordinates', () => {
    const r = transform(100, 200, 'rotation', { angle: 'abc' });
    expect(Number.isNaN(r.xTransformed)).toBe(true);
    expect(Number.isNaN(r.yTransformed)).toBe(true);
  });

  it('NaN and Infinity parameters are accepted and propagate', () => {
    expect(Number.isNaN(transform(1, 2, 'scaling', { scaleX: NaN }).xTransformed)).toBe(true);
    expect(transform(1, 2, 'scaling', { scaleY: Infinity }).yTransformed).toBe(Infinity);
  });
});
