import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import CaptureReview from '../CaptureReview';
import { captureApi } from '../../../../services/captureApi';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

jest.mock('react-router-dom', () => ({ Link: ({ to, children, ...rest }) => <a href={to} {...rest}>{children}</a> }), { virtual: true });
jest.mock('../../../../services/captureApi', () => ({
  captureApi: { patchJob: jest.fn(), getJob: jest.fn(), confirmJob: jest.fn(), createJob: jest.fn(), fetchImageObjectUrl: jest.fn() },
}));

// ---- a realistic job as the server returns it --------------------------------------------------------------------------
const cell = (col, rawText, extra = {}) => ({
  col, rawText, normalizedValue: null, semanticType: ['point', 'code', 'x', 'y', 'h'][col], confidence: 0.98, page: 0,
  bbox: { x: 100 + col * 150, y: 50, w: 120, h: 26 }, validation: { status: 'ok', issues: [] }, userValue: null, reviewState: 'accepted', candidates: [], ...extra,
});
const row = (index, cells, status = 'ok') => ({ index, bbox: { x: 0, y: 50, w: 800, h: 26 }, status, skipped: false, cells });
const columns = [
  { index: 0, headerText: 'Точка', semantic: 'point', mapping: 'ok' },
  { index: 1, headerText: 'Код', semantic: 'code', mapping: 'ok' },
  { index: 2, headerText: 'X', semantic: 'x', mapping: 'ok' },
  { index: 3, headerText: 'Y', semantic: 'y', mapping: 'ok' },
  { index: 4, headerText: 'H', semantic: 'h', mapping: 'ok' },
];
const invalidX = { rawText: '4 7OO 100,50', reviewState: 'invalid', validation: { status: 'error', issues: [{ code: 'VALUE_INVALID', severity: 'error', message: 'Стойността не е валидно число.' }] } };
const reviewH = { reviewState: 'review', validation: { status: 'warning', issues: [{ code: 'LOW_CONFIDENCE', severity: 'warning', message: 'Ниска сигурност на разпознаването - проверете стойността.' }] } };
const editedX = { userValue: '4 700 200,00', reviewState: 'edited' };

const makeJob = (over = {}) => ({
  id: 'job1', project: 'proj1', status: 'needs_review', revision: 0, mode: 'coordinate-table',
  source: { review: { width: 1000, height: 400 }, quality: { warnings: [] } },
  table: {
    columns, issues: [],
    rows: [
      row(0, [cell(0, 'P1'), cell(1, 'CP'), cell(2, '4 700 000,25'), cell(3, '500 000,50'), cell(4, '100,125')]),
      row(1, [cell(0, 'P2'), cell(1, 'CP'), cell(2, invalidX.rawText, invalidX), cell(3, '500 050,75'), cell(4, '101,500', reviewH)], 'error'),
      row(2, [cell(0, 'P3'), cell(1, 'DT'), cell(2, '4 700 200,00', editedX), cell(3, '500 100,25'), cell(4, '')]),
    ],
  },
  validationSummary: { rows: 3, ready: 1, review: 0, invalid: 1, canConfirm: false },
  importedPointIds: [], images: { review: '/api/capture/jobs/job1/image/review' },
  ...over,
});
const cleanJob = () => {
  const j = makeJob();
  j.table.rows[1].cells[2] = cell(2, '4 700 100,50');
  j.table.rows[1].cells[4] = cell(4, '101,500');
  j.table.rows[1].status = 'ok';
  j.validationSummary = { rows: 3, ready: 3, review: 0, invalid: 0, canConfirm: true };
  return j;
};

let root;
let container;
async function mount(job) {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  await act(async () => root.render(<CaptureReview initialJob={job} imageUrl="blob:review" bg />));
}
afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  jest.clearAllMocks();
});

const desktop = () => container.querySelector('.md\\:grid');
const mobile = () => container.querySelector('.md\\:hidden');
const type = (el, value) => act(async () => {
  Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set.call(el, value);
  el.dispatchEvent(new Event('input', { bubbles: true }));
});
const focus = (el) => act(async () => { el.focus(); });
const blur = (el) => act(async () => { el.blur(); });
const click = (el) => act(async () => { el.click(); });
const byText = (sel, text) => [...container.querySelectorAll(sel)].find((e) => e.textContent.includes(text));

describe('layout and summary', () => {
  it('shows the summary and BOTH layouts: image + table for desktop, image + row cards for mobile', async () => {
    await mount(makeJob());
    expect(container.querySelector('[data-testid="capture-summary"]').textContent).toBe('3 реда · 1 готови · 0 за проверка · 1 невалидни');
    expect(desktop().querySelector('table')).not.toBeNull();
    expect(desktop().querySelector('img').getAttribute('src')).toBe('blob:review');
    expect(mobile().querySelector('[data-testid="capture-row-card"]')).not.toBeNull();
    expect(mobile().querySelector('table')).toBeNull(); // the desktop table is not squeezed onto a phone
  });

  it('every cell shows its state with a symbol AND a word (not colour alone)', async () => {
    await mount(makeJob());
    const cells = [...desktop().querySelectorAll('[data-state]')];
    const states = new Set(cells.map((c) => c.getAttribute('data-state')));
    expect([...states].sort()).toEqual(['accepted', 'edited', 'invalid', 'review']);
    const invalid = desktop().querySelector('[data-state="invalid"]');
    expect(invalid.textContent).toContain('✕ Невалидна');
    expect(invalid.textContent).toContain('Стойността не е валидно число.');
    expect(desktop().querySelector('[data-state="review"]').textContent).toContain('! За проверка');
    expect(desktop().querySelector('[data-state="edited"]').textContent).toContain('✎ Редактирана');
    expect(desktop().querySelector('[data-state="accepted"]').textContent).toContain('✓ Приета');
  });

  it('OCR text and the correction are both kept: an edited cell shows the correction', async () => {
    await mount(makeJob());
    const edited = desktop().querySelector('[data-state="edited"] input');
    expect(edited.value).toBe('4 700 200,00');
    expect(desktop().querySelector('[data-state="invalid"] input').value).toBe('4 7OO 100,50');
  });

  it('column meanings are shown as editable selects', async () => {
    await mount(makeJob());
    const selects = [...desktop().querySelectorAll('thead select')];
    expect(selects.map((s) => s.value)).toEqual(['point', 'code', 'x', 'y', 'h']);
    expect([...selects[2].options].map((o) => o.textContent)).toContain('X (север)');
  });
});

describe('source highlighting', () => {
  it('selecting a cell highlights its source region on the image (percentages of the review image); another cell moves it', async () => {
    await mount(makeJob());
    expect(desktop().querySelector('[data-testid="capture-highlight"]')).toBeNull();
    await focus(desktop().querySelectorAll('tbody tr')[1].querySelectorAll('input')[2]); // P2, X
    const h = desktop().querySelector('[data-testid="capture-highlight"]');
    expect(h.style.left).toBe('40%'); // x = 100 + 2*150 = 400 of 1000
    expect(h.style.top).toBe('12.5%'); // y = 50 of 400
    expect(h.style.width).toBe('12%');
    await focus(desktop().querySelectorAll('tbody tr')[0].querySelectorAll('input')[0]); // P1, point
    expect(desktop().querySelector('[data-testid="capture-highlight"]').style.left).toBe('10%');
  });

  it('the image has zoom controls', async () => {
    await mount(makeJob());
    const zoom = desktop().querySelector('[data-testid="capture-zoom"]');
    expect(zoom.textContent).toBe('100%');
    await click(desktop().querySelector('[aria-label="Увеличи"]'));
    expect(zoom.textContent).toBe('150%');
    await click(byText('button', 'Побери'));
    expect(zoom.textContent).toBe('100%');
  });
});

describe('editing goes through the server (which re-validates)', () => {
  it('committing a changed value sends ONLY the correction with the base revision, then shows the server\'s result', async () => {
    const updated = makeJob({ revision: 1 });
    updated.table.rows[1].cells[2] = cell(2, invalidX.rawText, { userValue: '4 700 100,50', reviewState: 'edited' });
    updated.table.rows[1].status = 'warning';
    updated.validationSummary = { rows: 3, ready: 1, review: 1, invalid: 0, canConfirm: true };
    captureApi.patchJob.mockResolvedValue(updated);
    await mount(makeJob());
    const input = desktop().querySelectorAll('tbody tr')[1].querySelectorAll('input')[2];
    await focus(input);
    await type(input, '4 700 100,50');
    await blur(input);
    expect(captureApi.patchJob).toHaveBeenCalledTimes(1);
    expect(captureApi.patchJob).toHaveBeenCalledWith('job1', { edits: [{ row: 1, col: 2, value: '4 700 100,50' }], baseRevision: 0 });
    expect(container.querySelector('[data-testid="capture-summary"]').textContent).toBe('3 реда · 1 готови · 1 за проверка · 0 невалидни');
    expect(desktop().querySelectorAll('tbody tr')[1].querySelectorAll('[data-state]')[2].getAttribute('data-state')).toBe('edited');
  });

  it('an unchanged value sends nothing; Enter commits like blur', async () => {
    captureApi.patchJob.mockResolvedValue(makeJob({ revision: 1 }));
    await mount(makeJob());
    const input = desktop().querySelectorAll('tbody tr')[0].querySelectorAll('input')[0];
    await focus(input);
    await blur(input);
    expect(captureApi.patchJob).not.toHaveBeenCalled();
    await type(input, 'P1A');
    await act(async () => { input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })); });
    expect(captureApi.patchJob).toHaveBeenCalledWith('job1', { edits: [{ row: 0, col: 0, value: 'P1A' }], baseRevision: 0 });
  });

  it('changing a column meaning sends the column choice', async () => {
    captureApi.patchJob.mockResolvedValue(makeJob({ revision: 1 }));
    await mount(makeJob());
    const select = desktop().querySelectorAll('thead select')[4]; // H column -> not imported
    await act(async () => {
      Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value').set.call(select, '');
      select.dispatchEvent(new Event('change', { bubbles: true }));
    });
    expect(captureApi.patchJob).toHaveBeenCalledWith('job1', { columns: [{ index: 4, semantic: null }], baseRevision: 0 });
  });

  it('a stale revision reloads the job and tells the user', async () => {
    captureApi.patchJob.mockRejectedValue({ code: 'REVISION_CONFLICT', message: 'x' });
    captureApi.getJob.mockResolvedValue(makeJob({ revision: 5 }));
    await mount(makeJob());
    const input = desktop().querySelectorAll('tbody tr')[0].querySelectorAll('input')[0];
    await focus(input);
    await type(input, 'Z');
    await blur(input);
    expect(captureApi.getJob).toHaveBeenCalledWith('job1');
    expect(container.querySelector('[role="alert"]').textContent).toContain('Данните са променени');
  });
});

describe('explicit confirmation (nothing is imported before it)', () => {
  it('with unresolved errors the confirm button is disabled and nothing can be sent', async () => {
    await mount(makeJob());
    const start = container.querySelector('[data-testid="capture-confirm-start"]');
    expect(start.disabled).toBe(true);
    expect(captureApi.confirmJob).not.toHaveBeenCalled();
  });

  it('a clean table needs TWO deliberate steps: "Потвърди и импортирай" asks first, "Импортирай" imports', async () => {
    captureApi.confirmJob.mockResolvedValue({ success: true, importedCount: 3, alreadyConfirmed: false, data: { ...cleanJob(), status: 'confirmed', importedPointIds: ['a', 'b', 'c'] } });
    await mount(cleanJob());
    const start = container.querySelector('[data-testid="capture-confirm-start"]');
    expect(start.disabled).toBe(false);
    await click(start);
    expect(captureApi.confirmJob).not.toHaveBeenCalled(); // still only asking
    expect(container.querySelector('[role="alertdialog"]').textContent).toContain('Ще бъдат добавени 3 точки');
    expect(container.querySelector('[role="alertdialog"]').textContent).toContain('Досега нищо не е импортирано');
    await click(container.querySelector('[data-testid="capture-confirm-go"]'));
    expect(captureApi.confirmJob).toHaveBeenCalledTimes(1);
    expect(captureApi.confirmJob).toHaveBeenCalledWith('job1'); // no table, no rows are sent
    const done = container.querySelector('[data-testid="capture-done"]');
    expect(done.textContent).toContain('Импортирани са 3 точки');
    expect(done.querySelector('a').getAttribute('href')).toBe('/points?projectId=proj1');
  });

  it('cancelling the confirmation imports nothing', async () => {
    await mount(cleanJob());
    await click(container.querySelector('[data-testid="capture-confirm-start"]'));
    await click(byText('button', 'Отказ'));
    expect(captureApi.confirmJob).not.toHaveBeenCalled();
    expect(container.querySelector('[role="alertdialog"]')).toBeNull();
  });

  it('point conflicts are listed (per row) and nothing is shown as imported; a row link selects it', async () => {
    captureApi.confirmJob.mockRejectedValue({ code: 'POINT_CONFLICTS', message: 'x', conflicts: [{ row: 1, name: 'P2', existingPointId: 'e1' }] });
    await mount(cleanJob());
    await click(container.querySelector('[data-testid="capture-confirm-start"]'));
    await click(container.querySelector('[data-testid="capture-confirm-go"]'));
    const list = container.querySelector('[data-testid="capture-conflicts"]');
    expect(list.textContent).toContain('Ред 2: „P2“ вече съществува в проекта');
    expect(container.querySelector('[data-testid="capture-done"]')).toBeNull();
    expect(container.querySelector('[role="alert"]').textContent).toContain('вече има точки');
    await click(list.querySelector('button'));
    expect(desktop().querySelector('[data-testid="capture-highlight"]')).not.toBeNull();
  });

  it('server-side validation errors reload the job and show the message', async () => {
    captureApi.confirmJob.mockRejectedValue({ code: 'VALIDATION_ERRORS', message: 'x', errors: [] });
    captureApi.getJob.mockResolvedValue(makeJob({ revision: 3 }));
    await mount(cleanJob());
    await click(container.querySelector('[data-testid="capture-confirm-start"]'));
    await click(container.querySelector('[data-testid="capture-confirm-go"]'));
    expect(captureApi.getJob).toHaveBeenCalledWith('job1');
    expect(container.querySelector('[data-testid="capture-summary"]').textContent).toContain('1 невалидни');
  });

  it('a confirmed job is read-only: inputs are disabled and the confirm button is gone', async () => {
    await mount({ ...cleanJob(), status: 'confirmed', importedPointIds: ['a', 'b', 'c'] });
    expect(container.querySelector('[data-testid="capture-confirm-start"]')).toBeNull();
    expect([...desktop().querySelectorAll('input')].every((i) => i.disabled)).toBe(true);
    expect(container.querySelector('[data-testid="capture-done"]')).not.toBeNull();
  });

  it('table-level problems (e.g. a missing column) and image quality warnings are shown', async () => {
    const job = makeJob();
    job.table.issues = [{ code: 'MISSING_COLUMN', severity: 'error', message: 'Не е зададена колона за задължителното поле.', semantic: 'y' }];
    job.source.quality.warnings = ['BLURRY'];
    await mount(job);
    expect(container.textContent).toContain('✕ Не е зададена колона за задължителното поле.');
    expect(container.textContent).toContain('Качество на снимката: размазана');
  });
});

describe('mobile: one row card at a time', () => {
  it('shows the current row with previous / next and a row counter', async () => {
    await mount(makeJob());
    const card = mobile().querySelector('[data-testid="capture-row-card"]');
    expect(mobile().querySelector('[data-testid="capture-row-counter"]').textContent).toBe('Ред 1 / 3');
    expect(card.querySelectorAll('input').length).toBe(5);
    expect(card.querySelector('input').value).toBe('P1');
    await click(byText('button', 'Напред'));
    expect(mobile().querySelector('[data-testid="capture-row-counter"]').textContent).toBe('Ред 2 / 3');
    expect(mobile().querySelector('[data-testid="capture-row-card"] input').value).toBe('P2');
    await click(byText('button', 'Назад'));
    expect(mobile().querySelector('[data-testid="capture-row-counter"]').textContent).toBe('Ред 1 / 3');
  });

  it('jumps to the next row that needs checking, and editing a card field uses the same server round trip', async () => {
    captureApi.patchJob.mockResolvedValue(makeJob({ revision: 1 }));
    await mount(makeJob());
    await click(byText('button', 'Към следващия ред за проверка'));
    expect(mobile().querySelector('[data-testid="capture-row-counter"]').textContent).toBe('Ред 2 / 3');
    const field = mobile().querySelector('[data-testid="capture-row-card"] [data-state="invalid"] input');
    await focus(field);
    await type(field, '4 700 100,50');
    await blur(field);
    expect(captureApi.patchJob).toHaveBeenCalledWith('job1', { edits: [{ row: 1, col: 2, value: '4 700 100,50' }], baseRevision: 0 });
  });
});
