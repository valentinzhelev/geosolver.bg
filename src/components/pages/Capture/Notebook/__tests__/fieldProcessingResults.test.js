import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import FieldProcessingResults from '../FieldProcessingResults';
import { fieldProcessingApi } from '../../../../../services/fieldProcessingApi';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

jest.mock('react-router-dom', () => ({ Link: ({ to, children, ...rest }) => <a href={to} {...rest}>{children}</a> }), { virtual: true });
jest.mock('../../../../../services/fieldProcessingApi', () => ({
  fieldProcessingApi: { listRuns: jest.fn(), createRun: jest.fn(), getRun: jest.fn(), createPoints: jest.fn() },
}));

const run = (over = {}) => ({
  id: 'run1',
  generatedPointIds: [],
  setups: [
    {
      index: 0,
      setupError: null,
      station: { identifier: '101' },
      orientation: { identifier: '102' },
      orientationConstantGon: 100,
      observations: [
        {
          index: 0, target: '201', status: 'READY', x: 1000, y: 2050, h: 499.5,
          direction: 100, horizontalDistance: 50, deltaX: 0, deltaY: 50, heightReason: null, warnings: [], errors: [],
        },
        {
          index: 1, target: '202', status: 'XY_ONLY', x: 1030, y: 2000, h: null,
          direction: 400, horizontalDistance: 30, deltaX: 30, deltaY: 0,
          heightReason: 'PRISM_HEIGHT_MISSING',
          warnings: [{ code: 'PRISM_HEIGHT_MISSING', message: 'Липсва височина на призмата.' }],
          errors: [],
        },
      ],
    },
  ],
  ...over,
});

const failedSetupRun = () => ({
  id: 'run2',
  generatedPointIds: [],
  setups: [
    {
      index: 0,
      setupError: 'STATION_MISSING',
      station: { identifier: '999' },
      orientation: null,
      orientationConstantGon: null,
      observations: [
        { index: 0, target: '201', status: 'ERROR', x: null, y: null, h: null, errors: [{ code: 'STATION_MISSING', message: 'Станцията не е намерена.' }], warnings: [] },
      ],
    },
  ],
});

let root;
let container;
async function mount(props = {}) {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  await act(async () => root.render(<FieldProcessingResults fieldObservationSetId="fos1" projectId="proj1" bg {...props} />));
}
afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  jest.clearAllMocks();
});

const q = (testid) => container.querySelector(`[data-testid="${testid}"]`);
const qa = (testid) => [...container.querySelectorAll(`[data-testid="${testid}"]`)];
const click = (el) => act(async () => { el.click(); });
const flush = () => act(async () => { await Promise.resolve(); await Promise.resolve(); });

describe('no existing run: idle state offers to start processing', () => {
  it('shows the convention select and start button, never a bare calculator screen', async () => {
    fieldProcessingApi.listRuns.mockResolvedValue([]);
    await mount();
    expect(q('field-processing-start')).toBeTruthy();
    expect(q('field-processing-start-button').textContent).toContain('Обработи измерванията');
    expect(q('field-processing-results')).toBeFalsy();
  });

  it('starting a run passes the chosen vertical-angle convention and shows the results', async () => {
    fieldProcessingApi.listRuns.mockResolvedValue([]);
    fieldProcessingApi.createRun.mockResolvedValue(run());
    await mount();

    const select = container.querySelector('select[aria-label="Конвенция за вертикалния ъгъл"]');
    await act(async () => {
      Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value').set.call(select, 'zenith');
      select.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await click(q('field-processing-start-button'));
    await flush();

    expect(fieldProcessingApi.createRun).toHaveBeenCalledWith('fos1', 'zenith');
    expect(q('field-processing-results')).toBeTruthy();
    expect(q('field-processing-summary').textContent).toBe('1 готови · 1 само X/Y · 0 предупреждения · 0 невалидни');
  });

  it('shows the server error message and stays on the idle screen when the run fails', async () => {
    fieldProcessingApi.listRuns.mockResolvedValue([]);
    fieldProcessingApi.createRun.mockRejectedValue({ message: 'Наблюдателният набор не е потвърден.' });
    await mount();
    await click(q('field-processing-start-button'));
    await flush();
    expect(q('field-processing-start')).toBeTruthy();
    expect(container.querySelector('[role="alert"]').textContent).toBe('Наблюдателният набор не е потвърден.');
  });
});

describe('existing run: loads straight into the results view', () => {
  it('renders the results table without requiring a fresh start', async () => {
    fieldProcessingApi.listRuns.mockResolvedValue([run()]);
    await mount();
    await flush();
    expect(q('field-processing-results')).toBeTruthy();
    expect(q('field-processing-start')).toBeFalsy();
    const rows = qa('field-processing-row');
    expect(rows).toHaveLength(2);
    expect(rows[0].dataset.status).toBe('READY');
    expect(rows[0].textContent).toContain('201');
    expect(rows[0].textContent).toContain('1000.000');
    expect(rows[1].dataset.status).toBe('XY_ONLY');
    expect(rows[1].textContent).toContain('—'); // H is unavailable, never fabricated
  });

  it('clicking a row expands its calculation detail; clicking again collapses it', async () => {
    fieldProcessingApi.listRuns.mockResolvedValue([run()]);
    await mount();
    await flush();
    const rows = qa('field-processing-row');

    await click(rows[1]);
    const detail = q('field-processing-detail');
    expect(detail).toBeTruthy();
    expect(detail.textContent).toContain('ΔX');
    expect(detail.textContent).toContain('Липсва височина на призмата.');

    await click(rows[1]);
    expect(q('field-processing-detail')).toBeFalsy();
  });

  it('a failed setup shows the setup-level error instead of a results table', async () => {
    fieldProcessingApi.listRuns.mockResolvedValue([failedSetupRun()]);
    await mount();
    await flush();
    expect(q('field-processing-setup-error').textContent).toContain('Станцията не е намерена.');
    expect(q('field-processing-row')).toBeFalsy();
  });

  it('recalculate returns to the idle/start screen', async () => {
    fieldProcessingApi.listRuns.mockResolvedValue([run()]);
    await mount();
    await flush();
    await click(q('field-processing-recalculate'));
    expect(q('field-processing-start')).toBeTruthy();
    expect(q('field-processing-results')).toBeFalsy();
  });
});

describe('Създай точки: explicit, two-step, nothing saved before confirmation', () => {
  it('requires a confirm step before calling create-points', async () => {
    fieldProcessingApi.listRuns.mockResolvedValue([run()]);
    await mount();
    await flush();

    expect(fieldProcessingApi.createPoints).not.toHaveBeenCalled();
    await click(q('field-processing-save-start'));
    const dialog = container.querySelector('[role="alertdialog"]');
    expect(dialog).toBeTruthy();
    expect(dialog.textContent).toContain('2');
    expect(fieldProcessingApi.createPoints).not.toHaveBeenCalled();

    fieldProcessingApi.createPoints.mockResolvedValue({
      created: [{ id: 'p1' }, { id: 'p2' }],
      skipped: [],
      data: run({ generatedPointIds: ['p1', 'p2'] }),
    });
    await click(q('field-processing-save-go'));
    await flush();

    expect(fieldProcessingApi.createPoints).toHaveBeenCalledWith('run1');
    const done = q('field-processing-save-done');
    expect(done.textContent).toContain('Създадени са 2 точки.');
    expect(done.querySelector('a').getAttribute('href')).toBe('/points?projectId=proj1');
    expect(q('field-processing-save-start')).toBeFalsy(); // already saved -> not offered again
  });

  it('lists skipped targets (e.g. name conflicts) without hiding them', async () => {
    fieldProcessingApi.listRuns.mockResolvedValue([run()]);
    await mount();
    await flush();
    fieldProcessingApi.createPoints.mockResolvedValue({
      created: [{ id: 'p1' }],
      skipped: [{ setup: 0, observation: 1, target: '202', reason: 'NAME_CONFLICT' }],
      data: run({ generatedPointIds: ['p1'] }),
    });
    await click(q('field-processing-save-start'));
    await click(q('field-processing-save-go'));
    await flush();

    const skipped = q('field-processing-skipped');
    expect(skipped.textContent).toContain('202');
    expect(skipped.textContent).toContain('вече има точка с това име');
  });

  it('a run whose points are already created offers no save button (read-only)', async () => {
    fieldProcessingApi.listRuns.mockResolvedValue([run({ generatedPointIds: ['p1', 'p2'] })]);
    await mount();
    await flush();
    expect(q('field-processing-save-start')).toBeFalsy();
  });

  it('a run with nothing savable (all ERROR/WARNING) disables the save button', async () => {
    const allInvalid = run();
    allInvalid.setups[0].observations.forEach((o) => { o.status = 'ERROR'; });
    fieldProcessingApi.listRuns.mockResolvedValue([allInvalid]);
    await mount();
    await flush();
    expect(q('field-processing-save-start').disabled).toBe(true);
  });
});
