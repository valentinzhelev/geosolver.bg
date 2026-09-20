import {
  SEMANTIC_OPTIONS, semanticLabel, CELL_STATES, cellStateLabel, cellDisplayValue, summaryText, bboxToPercent,
  dataRows, nextAttentionRow, describeCaptureError, canConfirmJob, importCount, checkFile, MAX_UPLOAD_BYTES,
} from '../captureView';
import { captureApi, CaptureApiError } from '../../services/captureApi';
import { onSurveyPointsChanged } from '../surveyPointsEvents';

describe('column meanings (X = Northing, Y = Easting)', () => {
  it('offers Point, Code, X (север), Y (изток), H, Notes and "not imported"', () => {
    expect(SEMANTIC_OPTIONS.map((o) => o.value)).toEqual(['', 'point', 'code', 'x', 'y', 'h', 'notes']);
    expect(semanticLabel('x', true)).toBe('X (север)');
    expect(semanticLabel('y', true)).toBe('Y (изток)');
    expect(semanticLabel('x', false)).toBe('X (Northing)');
    expect(semanticLabel(null, true)).toBe('Не се импортира');
  });
});

describe('cell states are readable without colour', () => {
  it('each state has its own symbol AND a word, in both languages', () => {
    const symbols = Object.values(CELL_STATES).map((s) => s.symbol);
    expect(new Set(symbols).size).toBe(4);
    expect(cellStateLabel('accepted')).toBe('✓ Приета');
    expect(cellStateLabel('review')).toBe('! За проверка');
    expect(cellStateLabel('invalid')).toBe('✕ Невалидна');
    expect(cellStateLabel('edited')).toBe('✎ Редактирана');
    expect(cellStateLabel('invalid', false)).toBe('✕ Invalid');
  });

  it('the displayed value is the correction when there is one, otherwise the OCR text', () => {
    expect(cellDisplayValue({ rawText: '4 7OO', userValue: '4 700' })).toBe('4 700');
    expect(cellDisplayValue({ rawText: '4 7OO', userValue: null })).toBe('4 7OO');
    expect(cellDisplayValue({ rawText: 'x', userValue: '' })).toBe(''); // an explicit blanking is respected
  });
});

describe('summary and geometry', () => {
  it('summary reads like "42 реда · 39 готови · 2 за проверка · 1 невалидни"', () => {
    expect(summaryText({ rows: 42, ready: 39, review: 2, invalid: 1 }, true)).toBe('42 реда · 39 готови · 2 за проверка · 1 невалидни');
    expect(summaryText({ rows: 3, ready: 1, review: 1, invalid: 1 }, false)).toBe('3 rows · 1 ready · 1 need review · 1 invalid');
    expect(summaryText(null)).toBe('');
  });

  it('a source box becomes percentages of the review image (exact at any zoom)', () => {
    expect(bboxToPercent({ x: 100, y: 50, w: 200, h: 25 }, { width: 1000, height: 500 })).toEqual({ left: 10, top: 10, width: 20, height: 5 });
    expect(bboxToPercent(null, { width: 1, height: 1 })).toBeNull();
    expect(bboxToPercent({ x: 1, y: 1, w: 1, h: 1 }, null)).toBeNull();
  });

  it('rows needing attention are found in document order and wrap around', () => {
    const table = { rows: [{ index: 0, status: 'ok' }, { index: 1, status: 'warning' }, { index: 2, status: 'ok' }, { index: 3, status: 'error' }, { index: 4, skipped: true, status: 'error' }] };
    expect(dataRows(table).map((r) => r.index)).toEqual([0, 1, 2, 3]);
    expect(nextAttentionRow(table, 0)).toBe(1);
    expect(nextAttentionRow(table, 1)).toBe(3);
    expect(nextAttentionRow(table, 3)).toBe(1);
    expect(nextAttentionRow({ rows: [{ index: 0, status: 'ok' }] }, 0)).toBeNull();
  });

  it('confirm is only possible for a needs_review job whose validation allows it', () => {
    expect(canConfirmJob({ status: 'needs_review', validationSummary: { canConfirm: true } })).toBe(true);
    expect(canConfirmJob({ status: 'needs_review', validationSummary: { canConfirm: false } })).toBe(false);
    expect(canConfirmJob({ status: 'confirmed', validationSummary: { canConfirm: true } })).toBe(false);
    expect(canConfirmJob(null)).toBe(false);
    expect(importCount({ validationSummary: { rows: 7 } })).toBe(7);
  });
});

describe('errors and file checks', () => {
  it('known codes get a stable message; server text is used otherwise; never a stack or JSON', () => {
    expect(describeCaptureError({ code: 'POINT_CONFLICTS' })).toMatch(/вече има точки/);
    expect(describeCaptureError({ code: 'PRO_REQUIRED' })).toMatch(/Pro/);
    expect(describeCaptureError({ code: 'X', message: 'Файлът не е валидно изображение.' })).toBe('Файлът не е валидно изображение.');
    expect(describeCaptureError(null)).toMatch(/грешка/i);
  });

  it('client-side file pre-check (the server validates the real content again)', () => {
    expect(checkFile(null)).toMatch(/Изберете/);
    expect(checkFile({ type: 'application/pdf', size: 10 })).toMatch(/JPG, PNG и WebP/);
    expect(checkFile({ type: 'image/gif', size: 10 })).toMatch(/JPG, PNG и WebP/);
    expect(checkFile({ type: 'image/png', size: MAX_UPLOAD_BYTES + 1 })).toMatch(/8 MB/);
    for (const type of ['image/jpeg', 'image/png', 'image/webp']) expect(checkFile({ type, size: 1000 })).toBe('');
  });
});

describe('captureApi (the real client with a faked fetch)', () => {
  const realFetch = global.fetch;
  let calls;
  const respond = (status, body) => {
    global.fetch = jest.fn(async (url, options) => {
      calls.push({ url, options });
      return { ok: status < 400, status, json: async () => body, blob: async () => new Blob(['img']) };
    });
  };
  beforeEach(() => { calls = []; localStorage.setItem('token', 'test-token'); global.URL.createObjectURL = jest.fn(() => 'blob:review'); });
  afterEach(() => { global.fetch = realFetch; localStorage.removeItem('token'); });

  it('createJob uploads multipart with the project, the mode and the image, authenticated', async () => {
    respond(201, { success: true, data: { id: 'j1' } });
    const file = new File(['x'], 'table.png', { type: 'image/png' });
    expect(await captureApi.createJob(file, 'proj1')).toEqual({ id: 'j1' });
    const { url, options } = calls[0];
    expect(url).toMatch(/\/capture\/jobs$/);
    expect(options.method).toBe('POST');
    expect(options.headers.Authorization).toBe('Bearer test-token');
    expect(options.body.get('projectId')).toBe('proj1');
    expect(options.body.get('mode')).toBe('coordinate-table');
    expect(options.body.get('image').name).toBe('table.png');
    expect(options.headers['Content-Type']).toBeUndefined(); // the browser sets the multipart boundary
  });

  it('patchJob sends only corrections / column choices as JSON; confirmJob sends no table at all', async () => {
    respond(200, { success: true, data: { id: 'j1' } });
    await captureApi.patchJob('j1', { baseRevision: 2, edits: [{ row: 0, col: 2, value: '4700000' }] });
    expect(calls[0].url).toMatch(/\/capture\/jobs\/j1\/cells$/);
    expect(calls[0].options.method).toBe('PATCH');
    expect(JSON.parse(calls[0].options.body)).toEqual({ baseRevision: 2, edits: [{ row: 0, col: 2, value: '4700000' }] });
    calls.length = 0;
    respond(200, { success: true, importedCount: 3, pointIds: ['a'] });
    await captureApi.confirmJob('j1');
    expect(calls[0].url).toMatch(/\/capture\/jobs\/j1\/confirm$/);
    expect(calls[0].options.body).toBeUndefined();
  });

  it('a confirmed capture refreshes the shared SurveyPoints cache; a failed confirm does not', async () => {
    const seen = jest.fn();
    const off = onSurveyPointsChanged(seen);
    respond(409, { success: false, code: 'POINT_CONFLICTS' });
    await captureApi.confirmJob('j1').catch(() => {});
    expect(seen).not.toHaveBeenCalled();
    respond(200, { success: true, importedCount: 1 });
    await captureApi.confirmJob('j1');
    expect(seen).toHaveBeenCalledTimes(1);
    off();
  });

  it('errors keep the server code, conflicts and validation errors; the Pro gate becomes PRO_REQUIRED', async () => {
    respond(409, { success: false, code: 'POINT_CONFLICTS', message: 'Някои точки вече съществуват в проекта.', conflicts: [{ row: 1, name: 'P2' }] });
    const e = await captureApi.confirmJob('j1').catch((x) => x);
    expect(e).toBeInstanceOf(CaptureApiError);
    expect(e).toMatchObject({ status: 409, code: 'POINT_CONFLICTS', conflicts: [{ row: 1, name: 'P2' }] });
    respond(402, { error: 'Active subscription required', message: 'Please subscribe to GeoSolver Pro to access this feature.' });
    expect((await captureApi.getJob('j1').catch((x) => x)).code).toBe('PRO_REQUIRED');
    respond(422, { success: false, code: 'VALIDATION_ERRORS', errors: [{ row: 0, col: 2, code: 'VALUE_INVALID' }] });
    expect((await captureApi.confirmJob('j1').catch((x) => x)).errors).toHaveLength(1);
  });

  it('the review image is fetched WITH the token and exposed as an object URL', async () => {
    respond(200, {});
    expect(await captureApi.fetchImageObjectUrl('/api/capture/jobs/j1/image/review')).toBe('blob:review');
    expect(calls[0].url).toMatch(/\/capture\/jobs\/j1\/image\/review$/);
    expect(calls[0].options.headers.Authorization).toBe('Bearer test-token');
  });
});
