import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import NotebookReview from '../NotebookReview';
import { captureApi } from '../../../../../services/captureApi';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

jest.mock('react-router-dom', () => ({ Link: ({ to, children, ...rest }) => <a href={to} {...rest}>{children}</a> }), { virtual: true });
jest.mock('../../../../../services/captureApi', () => ({
  captureApi: { patchJob: jest.fn(), getJob: jest.fn(), confirmJob: jest.fn(), createJob: jest.fn(), fetchImageObjectUrl: jest.fn() },
}));

const field = (col, rawText, extra = {}) => ({
  col, rawText, normalizedValue: null, confidence: 0.98, page: 0,
  bbox: { x: 100 + col * 150, y: 50, w: 120, h: 26 }, validation: { status: 'ok', issues: [] }, userValue: null, reviewState: 'accepted', candidates: [], ...extra,
});
const OBS_COLS = [
  { index: 0, headerText: 'Точка', field: 'target', mapping: 'ok' },
  { index: 1, headerText: 'Hz', field: 'hz', mapping: 'ok' },
  { index: 2, headerText: 'V', field: 'vz', mapping: 'ok' },
  { index: 3, headerText: 'S', field: 'distance', mapping: 'ok' },
  { index: 4, headerText: 'p', field: 'prismHeight', mapping: 'ok' },
];
const obsRow = (index, cells, status = 'ok') => ({ index, bbox: { x: 0, y: 50 + index * 30, w: 800, h: 26 }, status, skipped: false, excluded: false, cols: OBS_COLS, cells });

const invalidHz = { rawText: '94.5000', reviewState: 'invalid', validation: { status: 'error', issues: [{ code: 'AMBIGUOUS_ANGLE_UNIT', severity: 'error', message: 'Не е ясно дали ъгълът е в градуси или гони.' }] } };

const makeSetup = (over = {}) => ({
  index: 0,
  station: { point: field(0, 'T1'), instrumentHeight: field(0, '1.450'), notes: field(0, ''), bbox: { x: 0, y: 0, w: 200, h: 26 } },
  orientation: { target: field(0, 'T0'), direction: field(0, '0.0000g') },
  issues: [],
  observations: [
    obsRow(0, [field(0, 'A1'), field(1, '94.5000g', { normalizedValue: 94.5 }), field(2, '100.2500g', { normalizedValue: 100.25 }), field(3, '123.456', { normalizedValue: 123.456 }), field(4, '1.500', { normalizedValue: 1.5 })]),
    obsRow(1, [field(0, 'A2'), field(1, invalidHz.rawText, invalidHz), field(2, '99.5000g', { normalizedValue: 99.5 }), field(3, '87.320', { normalizedValue: 87.32 }), field(4, '1.500', { normalizedValue: 1.5 })], 'error'),
  ],
  ...over,
});

const makeJob = (over = {}) => ({
  id: 'job1', project: 'proj1', status: 'needs_review', revision: 0, mode: 'field-notebook',
  source: { review: { width: 1000, height: 400 }, quality: { warnings: [] } },
  notebook: { pageIndex: 0, issues: [], setups: [makeSetup()] },
  validationSummary: { setups: 1, observations: 2, ready: 1, review: 0, invalid: 1, excluded: 0, canConfirm: false },
  images: { review: '/api/capture/jobs/job1/image/review' },
  ...over,
});
const cleanJob = () => {
  const j = makeJob();
  j.notebook.setups[0].observations[1].cells[1] = field(1, '94.5000g', { normalizedValue: 94.5 });
  j.notebook.setups[0].observations[1].status = 'ok';
  j.validationSummary = { setups: 1, observations: 2, ready: 2, review: 0, invalid: 0, excluded: 0, canConfirm: true };
  return j;
};

let root;
let container;
async function mount(job) {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  await act(async () => root.render(<NotebookReview initialJob={job} imageUrl="blob:review" bg />));
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
  it('shows the summary and BOTH layouts: station+observations for desktop, image+row-card for mobile', async () => {
    await mount(makeJob());
    expect(container.querySelector('[data-testid="notebook-summary"]').textContent).toBe('1 станции · 2 наблюдения · 1 готови · 0 за проверка · 1 невалидни');
    expect(desktop().querySelector('[data-testid="notebook-station-card"]')).not.toBeNull();
    expect(desktop().querySelector('table')).not.toBeNull();
    expect(mobile().querySelector('[data-testid="notebook-row-card"]')).not.toBeNull();
    expect(mobile().querySelector('table')).toBeNull();
  });

  it('the station card shows station, instrument height and orientation; a missing orientation is shown as a warning', async () => {
    await mount(makeJob());
    const card = desktop().querySelector('[data-testid="notebook-station-card"]');
    const values = [...card.querySelectorAll('input')].map((i) => i.value);
    expect(values).toEqual(['T1', '1.450', 'T0', '0.0000g']);
    const noOrientation = makeJob();
    noOrientation.notebook.setups[0].orientation = null;
    await act(async () => root.unmount());
    await mount(noOrientation);
    expect(desktop().querySelector('[data-testid="notebook-no-orientation"]')).not.toBeNull();
  });

  it('every observation cell shows its state with a symbol AND a word', async () => {
    await mount(makeJob());
    const invalid = desktop().querySelector('[data-state="invalid"]');
    expect(invalid.textContent).toContain('✕ Невалидна');
    expect(invalid.textContent).toContain('Не е ясно дали ъгълът е в градуси или гони.');
    expect(desktop().querySelector('[data-state="accepted"]').textContent).toContain('✓ Приета');
  });

  it('observation column meanings are editable selects', async () => {
    await mount(makeJob());
    const selects = [...desktop().querySelectorAll('table thead select')];
    expect(selects.map((s) => s.value)).toEqual(['target', 'hz', 'vz', 'distance', 'prismHeight']);
  });
});

describe('multiple setups', () => {
  it('shows tabs and switches the visible station/observations', async () => {
    const job = makeJob();
    const second = makeSetup({ index: 1, station: { point: field(0, 'T2'), instrumentHeight: field(0, '1.520'), notes: field(0, ''), bbox: { x: 0, y: 0, w: 1, h: 1 } }, orientation: null, observations: [obsRow(0, [field(0, 'B1'), field(1, '10.0000g', { normalizedValue: 10 }), field(2, '99.0000g', { normalizedValue: 99 }), field(3, '5.000', { normalizedValue: 5 }), field(4, '', { rawText: '' })])] });
    job.notebook.setups.push(second);
    job.validationSummary = { setups: 2, observations: 3, ready: 2, review: 0, invalid: 1, excluded: 0, canConfirm: false };
    await mount(job);
    const tabs = container.querySelectorAll('[data-testid="notebook-setup-tab"]');
    expect(tabs).toHaveLength(2);
    const stationValue = () => desktop().querySelector('[data-testid="notebook-station-card"] input').value;
    expect(stationValue()).toBe('T1');
    await click(tabs[1]);
    expect(stationValue()).toBe('T2');
  });
});

describe('source highlighting and candidates', () => {
  it('selecting a field highlights its source region and shows the candidate panel', async () => {
    await mount(makeJob());
    expect(desktop().querySelector('[data-testid="capture-highlight"]')).toBeNull();
    const hzInput = desktop().querySelectorAll('table tbody tr')[1].querySelectorAll('input')[1];
    await focus(hzInput);
    expect(desktop().querySelector('[data-testid="capture-highlight"]')).not.toBeNull();
    expect(desktop().querySelector('[data-testid="capture-candidates"]')).not.toBeNull();
  });
});

describe('editing goes through the server (re-validates)', () => {
  it('committing a station correction sends the {setup, section, field} address', async () => {
    const updated = makeJob({ revision: 1 });
    captureApi.patchJob.mockResolvedValue(updated);
    await mount(makeJob());
    const stationInput = desktop().querySelector('[data-testid="notebook-station-card"] input');
    await focus(stationInput);
    await type(stationInput, 'T1-corrected');
    await blur(stationInput);
    expect(captureApi.patchJob).toHaveBeenCalledWith('job1', { edits: [{ setup: 0, section: 'station', field: 'point', value: 'T1-corrected' }], baseRevision: 0 });
  });

  it('committing an observation correction sends {setup, section: observation, row, field}', async () => {
    const updated = makeJob({ revision: 1 });
    captureApi.patchJob.mockResolvedValue(updated);
    await mount(makeJob());
    const hzInput = desktop().querySelectorAll('table tbody tr')[1].querySelectorAll('input')[1];
    await focus(hzInput);
    await type(hzInput, '94.5000g');
    await blur(hzInput);
    expect(captureApi.patchJob).toHaveBeenCalledWith('job1', { edits: [{ setup: 0, section: 'observation', row: 1, field: 'hz', value: '94.5000g' }], baseRevision: 0 });
  });

  it('remapping a column sends {setup, index, field}', async () => {
    captureApi.patchJob.mockResolvedValue(makeJob({ revision: 1 }));
    await mount(makeJob());
    const select = desktop().querySelectorAll('table thead select')[4]; // prismHeight -> not imported
    await act(async () => {
      Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value').set.call(select, '');
      select.dispatchEvent(new Event('change', { bubbles: true }));
    });
    expect(captureApi.patchJob).toHaveBeenCalledWith('job1', { columns: [{ setup: 0, index: 4, field: null }], baseRevision: 0 });
  });

  it('excluding a row sends {setup, rows: [{index, excluded}]}', async () => {
    captureApi.patchJob.mockResolvedValue(makeJob({ revision: 1 }));
    await mount(makeJob());
    const toggle = desktop().querySelectorAll('[data-testid="notebook-row-exclude-toggle"]')[0];
    await click(toggle);
    expect(captureApi.patchJob).toHaveBeenCalledWith('job1', { rows: [{ setup: 0, index: 0, excluded: true }], baseRevision: 0 });
  });
});

describe('explicit confirmation (nothing is saved before it)', () => {
  it('with unresolved errors the confirm button is disabled', async () => {
    await mount(makeJob());
    expect(container.querySelector('[data-testid="notebook-confirm-start"]').disabled).toBe(true);
  });

  it('a clean notebook needs TWO deliberate steps', async () => {
    captureApi.confirmJob.mockResolvedValue({ success: true, alreadyConfirmed: false, observationSetId: 'set1', data: { ...cleanJob(), status: 'confirmed' } });
    await mount(cleanJob());
    const start = container.querySelector('[data-testid="notebook-confirm-start"]');
    expect(start.disabled).toBe(false);
    await click(start);
    expect(captureApi.confirmJob).not.toHaveBeenCalled();
    expect(container.querySelector('[role="alertdialog"]').textContent).toContain('Ще бъдат записани 2 наблюдения');
    await click(container.querySelector('[data-testid="notebook-confirm-go"]'));
    expect(captureApi.confirmJob).toHaveBeenCalledWith('job1');
    expect(container.querySelector('[data-testid="notebook-done"]')).not.toBeNull();
  });

  it('a confirmed notebook is read-only: inputs are disabled, no exclude toggle, no confirm button', async () => {
    await mount({ ...cleanJob(), status: 'confirmed' });
    expect(container.querySelector('[data-testid="notebook-confirm-start"]')).toBeNull();
    expect(desktop().querySelector('[data-testid="notebook-row-exclude-toggle"]')).toBeNull();
    expect([...desktop().querySelectorAll('input')].every((i) => i.disabled)).toBe(true);
    expect(container.querySelector('[data-testid="notebook-done"]')).not.toBeNull();
  });
});

describe('mobile: one observation at a time', () => {
  it('shows the setup summary, the current observation, and previous/next', async () => {
    await mount(makeJob());
    expect(mobile().querySelector('[data-testid="notebook-setup-summary"]').textContent).toContain('T1');
    expect(mobile().querySelector('[data-testid="notebook-row-counter"]').textContent).toBe('Наблюдение 1 / 2');
    await click(byText('button', 'Напред'));
    expect(mobile().querySelector('[data-testid="notebook-row-counter"]').textContent).toBe('Наблюдение 2 / 2');
  });
});
