import {
  POINT_OUTPUT_FIELDS,
  isPointProducingTool,
  canOfferSaveAsPoint,
  getPointPreview,
  buildCreatePointPayload,
  interpretCreatePointResult,
  existingPointLabel,
} from '../calculationPointCapability';

describe('Save-as-point capability (UX mirror of the backend allow-list)', () => {
  it('supports exactly the nine verified single-point tools', () => {
    expect(Object.keys(POINT_OUTPUT_FIELDS).sort()).toEqual([
      'coordinate-transformation', 'first-basic-task', 'forward-intersection', 'hansen-task',
      'line-intersection', 'offset-point', 'polar-intersection', 'resection', 'segment-division',
    ]);
  });

  it.each(['second-basic-task', 'distance-bearing', 'area-calculation', 'scientific-calculator'])(
    'excludes %s (scalar / utility)',
    (toolName) => {
      expect(isPointProducingTool(toolName)).toBe(false);
      expect(canOfferSaveAsPoint({ toolName, projectId: 'p1' })).toBe(false);
    }
  );

  it('offers the action only for point-producing PROJECT calculations', () => {
    expect(canOfferSaveAsPoint({ toolName: 'resection', projectId: 'p1' })).toBe(true);
    expect(canOfferSaveAsPoint({ toolName: 'resection', projectId: null })).toBe(false); // standalone
    expect(canOfferSaveAsPoint({ toolName: 'resection' })).toBe(false);
    expect(canOfferSaveAsPoint(null)).toBe(false);
  });

  it('previews the stored coordinates using the tool-specific fields', () => {
    expect(getPointPreview({ toolName: 'first-basic-task', resultData: { x2: 5, y2: 6 } })).toEqual({ x: 5, y: 6 });
    expect(getPointPreview({ toolName: 'line-intersection', resultData: { xI: 1, yI: 2 } })).toEqual({ x: 1, y: 2 });
    expect(getPointPreview({ toolName: 'coordinate-transformation', resultData: { xTransformed: 7, yTransformed: 8 } })).toEqual({ x: 7, y: 8 });
    expect(getPointPreview({ toolName: 'resection', resultData: { x2: 1, y2: 2 } })).toBeNull(); // wrong fields for this tool
    expect(getPointPreview({ toolName: 'area-calculation', resultData: { area: 3 } })).toBeNull();
  });
});

describe('create-point request payload', () => {
  it('contains only user-entered identity fields — never coordinates, projectId or provenance', () => {
    const payload = buildCreatePointPayload({
      name: '  T1 ', code: ' 101 ',
      x: 1, y: 2, projectId: 'p', sourceCalculationId: 'c', h: 3,
    });
    expect(payload).toEqual({ name: 'T1', code: '101' });
    ['x', 'y', 'h', 'projectId', 'sourceCalculationId'].forEach((k) => expect(payload).not.toHaveProperty(k));
  });

  it('omits an empty code', () => {
    expect(buildCreatePointPayload({ name: 'T1', code: '  ' })).toEqual({ name: 'T1' });
  });
});

describe('reopening a calculation that already produced a point', () => {
  it('a repeat click is a normal "already exists" state — not an error — and identifies the existing point', () => {
    const result = interpretCreatePointResult(409, {
      error: 'A point was already created from this calculation',
      code: 'ALREADY_CREATED',
      data: { _id: 'pt', name: 'T1', code: '101' },
    });
    expect(result.state).toBe('already');
    expect(result.state).not.toBe('error');
    expect(existingPointLabel(result.point)).toBe('101 · T1');
  });

  it('labels an existing point sensibly with partial or missing data', () => {
    expect(existingPointLabel({ name: 'T1' })).toBe('T1');
    expect(existingPointLabel({ code: '7' })).toBe('7');
    expect(existingPointLabel(null)).toBe('');
  });
});

describe('create-point response handling', () => {
  it('created', () => {
    expect(interpretCreatePointResult(201, { success: true, data: { _id: 'pt' } })).toEqual({ state: 'created', point: { _id: 'pt' } });
  });
  it('already created (duplicate) is a distinct, non-error state carrying the existing point', () => {
    expect(interpretCreatePointResult(409, { code: 'ALREADY_CREATED', data: { _id: 'pt' } })).toEqual({ state: 'already', point: { _id: 'pt' } });
  });
  it('CRS mismatch is surfaced, not treated as generic failure', () => {
    expect(interpretCreatePointResult(409, { code: 'CRS_MISMATCH', calculationCrs: 'A', projectCrs: 'B' }))
      .toEqual({ state: 'crs_mismatch', calculationCrs: 'A', projectCrs: 'B' });
  });
  it('forbidden / invalid / unknown errors', () => {
    expect(interpretCreatePointResult(403, {}).state).toBe('forbidden');
    expect(interpretCreatePointResult(400, { code: 'NAME_REQUIRED' }).state).toBe('invalid');
    expect(interpretCreatePointResult(500, { error: 'boom' })).toEqual({ state: 'error', message: 'boom' });
  });
});
