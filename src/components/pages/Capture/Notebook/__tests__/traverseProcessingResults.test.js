import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import TraverseProcessingResults from '../TraverseProcessingResults';
import { fieldProcessingApi } from '../../../../../services/fieldProcessingApi';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

jest.mock('react-router-dom', () => ({ Link: ({ to, children, ...rest }) => <a href={to} {...rest}>{children}</a> }), { virtual: true });
jest.mock('../../../../../services/fieldProcessingApi', () => ({
  fieldProcessingApi: { listRuns: jest.fn(), createTraverseRun: jest.fn(), getRun: jest.fn(), createPoints: jest.fn() },
}));

const leg = (over = {}) => ({
  index: 0, fromSetupIndex: 0, toSetupIndex: 1, from: '101', to: '102', sourceObservation: { setupIndex: 0, row: 0 },
  status: 'READY', bearingGon: 0, horizontalDistance: 100, rawDeltaX: 100, rawDeltaY: 0, rawX: 1100, rawY: 2000,
  rawH: 499.5, heightReason: null, adjustedDeltaX: 100.04, adjustedDeltaY: 0.02, adjustedX: 1100.04, adjustedY: 2000.02,
  correctionX: 0.04, correctionY: 0.02, errors: [], warnings: [],
  ...over,
});

const run = (traverseOver = {}, topOver = {}) => ({
  id: 'run1',
  processingType: 'traverse',
  generatedPointIds: [],
  ...topOver,
  traverse: {
    traverseType: 'KNOWN_ENDPOINT',
    startIdentifier: '101',
    endIdentifier: '103',
    orientation: { identifier: '100' },
    sequence: { state: 'RESOLVED', issue: null },
    status: 'READY',
    legs: [
      leg(),
      leg({ index: 1, fromSetupIndex: 1, toSetupIndex: null, from: '102', to: '103', status: 'XY_ONLY', rawX: 1100, rawY: 2050, rawH: null, heightReason: 'PRISM_HEIGHT_MISSING', warnings: [{ code: 'PRISM_HEIGHT_MISSING', message: 'Липсва височина на призмата.' }], adjustedX: 1100.06, adjustedY: 2050.03, correctionX: 0.02, correctionY: 0.01 }),
    ],
    closure: { available: true, reason: null, totalLength: 150, fX: -0.06, fY: -0.03, linearMisclosure: 0.0671, perfectClosure: false, relativeClosureDenominator: 2235 },
    adjustment: { method: 'bowditch', version: 1, applied: true, reasonNotApplied: null },
    ...traverseOver,
  },
});

const openRun = () => run({
  traverseType: 'OPEN', startIdentifier: '101', endIdentifier: null, orientation: { identifier: '100' },
  sequence: { state: 'RESOLVED', issue: null }, status: 'READY',
  legs: [leg({ adjustedX: null, adjustedY: null, correctionX: null, correctionY: null })],
  closure: { available: false, reason: 'OPEN_TRAVERSE', totalLength: null, fX: null, fY: null, linearMisclosure: null, perfectClosure: null, relativeClosureDenominator: null },
  adjustment: { method: 'bowditch', version: 1, applied: false, reasonNotApplied: 'OPEN_TRAVERSE' },
});

let root;
let container;
async function mount(props = {}) {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  await act(async () => root.render(<TraverseProcessingResults fieldObservationSetId="fos1" projectId="proj1" bg {...props} />));
}
afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  jest.clearAllMocks();
});

const q = (testid) => container.querySelector(`[data-testid="${testid}"]`);
const qa = (testid) => [...container.querySelectorAll(`[data-testid="${testid}"]`)];
const click = (el) => act(async () => { el.click(); });
const type = (el, value) => act(async () => {
  Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set.call(el, value);
  el.dispatchEvent(new Event('input', { bubbles: true }));
});
const flush = () => act(async () => { await Promise.resolve(); await Promise.resolve(); });

describe('no existing run: idle state collects the traverse definition', () => {
  it('shows type/start/end/convention fields and the start button', async () => {
    fieldProcessingApi.listRuns.mockResolvedValue([]);
    await mount();
    expect(q('traverse-start')).toBeTruthy();
    expect(q('traverse-type-select')).toBeTruthy();
    expect(q('traverse-start-identifier')).toBeTruthy();
    expect(q('traverse-end-identifier')).toBeTruthy(); // default type is CLOSED_LOOP -> end shown
  });

  it('OPEN type hides the end-identifier field entirely', async () => {
    fieldProcessingApi.listRuns.mockResolvedValue([]);
    await mount();
    const select = container.querySelector('[data-testid="traverse-type-select"]');
    await act(async () => {
      Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value').set.call(select, 'OPEN');
      select.dispatchEvent(new Event('change', { bubbles: true }));
    });
    expect(q('traverse-end-identifier')).toBeFalsy();
  });

  it('refuses to submit without a start station (client-side, before any request)', async () => {
    fieldProcessingApi.listRuns.mockResolvedValue([]);
    await mount();
    await click(q('traverse-start-button'));
    expect(fieldProcessingApi.createTraverseRun).not.toHaveBeenCalled();
    expect(container.querySelector('[role="alert"]')).toBeTruthy();
  });

  it('KNOWN_ENDPOINT without an end identifier is refused client-side too', async () => {
    fieldProcessingApi.listRuns.mockResolvedValue([]);
    await mount();
    const typeSelect = container.querySelector('[data-testid="traverse-type-select"]');
    await act(async () => {
      Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value').set.call(typeSelect, 'KNOWN_ENDPOINT');
      typeSelect.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await type(q('traverse-start-identifier'), '101');
    await click(q('traverse-start-button'));
    expect(fieldProcessingApi.createTraverseRun).not.toHaveBeenCalled();
  });

  it('a valid submission calls createTraverseRun with the exact declared definition and shows results', async () => {
    fieldProcessingApi.listRuns.mockResolvedValue([]);
    fieldProcessingApi.createTraverseRun.mockResolvedValue(run());
    await mount();
    const typeSelect = container.querySelector('[data-testid="traverse-type-select"]');
    await act(async () => {
      Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value').set.call(typeSelect, 'KNOWN_ENDPOINT');
      typeSelect.dispatchEvent(new Event('change', { bubbles: true }));
    });
    await type(q('traverse-start-identifier'), '101');
    await type(q('traverse-end-identifier'), '103');
    await click(q('traverse-start-button'));
    await flush();
    expect(fieldProcessingApi.createTraverseRun).toHaveBeenCalledWith('fos1', {
      traverseType: 'KNOWN_ENDPOINT', startIdentifier: '101', endIdentifier: '103', verticalAngleConvention: null,
    });
    expect(q('traverse-results')).toBeTruthy();
  });
});

describe('existing run: results view', () => {
  it('shows the summary, closure block, and the ordered leg table with RAW and ADJUSTED columns', async () => {
    fieldProcessingApi.listRuns.mockResolvedValue([run()]);
    await mount();
    await flush();
    expect(q('traverse-summary').textContent).toContain('101');
    expect(q('traverse-summary').textContent).toContain('103');
    const rows = qa('traverse-leg-row');
    expect(rows).toHaveLength(2);
    expect(rows[0].textContent).toContain('1100.000');
    expect(rows[0].textContent).toContain('1100.040'); // adjusted X shown since Bowditch was applied
    expect(rows[1].dataset.status).toBe('XY_ONLY');

    const closure = q('traverse-closure');
    expect(closure.textContent).toContain('150.000'); // total length
    expect(closure.textContent).toContain('Bowditch');
  });

  it('row click expands the per-leg detail including Bowditch corrections', async () => {
    fieldProcessingApi.listRuns.mockResolvedValue([run()]);
    await mount();
    await flush();
    const rows = qa('traverse-leg-row');
    await click(rows[0]);
    const detail = q('traverse-leg-detail');
    expect(detail).toBeTruthy();
    expect(detail.textContent).toContain('cX');
    expect(detail.textContent).toContain('499.500'); // H detail
  });

  it('an OPEN traverse never shows closure/adjustment as available, and adjusted columns read "Не е приложимо"', async () => {
    fieldProcessingApi.listRuns.mockResolvedValue([openRun()]);
    await mount();
    await flush();
    expect(q('traverse-closure').textContent).toMatch(/затваряне/);
    const rows = qa('traverse-leg-row');
    expect(rows[0].textContent).toContain('Не е приложимо');
  });

  it('a sequence problem (e.g. AMBIGUOUS) is surfaced explicitly', async () => {
    fieldProcessingApi.listRuns.mockResolvedValue([run({ sequence: { state: 'AMBIGUOUS', issue: { code: 'AMBIGUOUS_CONTINUATION', atStationIdentifier: '101', candidateIdentifiers: ['102', '102b'] } } })]);
    await mount();
    await flush();
    const issue = q('traverse-sequence-issue');
    expect(issue).toBeTruthy();
    expect(issue.textContent).toContain('101');
  });

  it('recalculate returns to the idle/definition screen', async () => {
    fieldProcessingApi.listRuns.mockResolvedValue([run()]);
    await mount();
    await flush();
    await click(q('traverse-recalculate'));
    expect(q('traverse-start')).toBeTruthy();
  });
});

describe('Създай точки: coordinate choice is stated explicitly before saving', () => {
  it('a controlled/adjusted run tells the user ADJUSTED coordinates will be saved', async () => {
    fieldProcessingApi.listRuns.mockResolvedValue([run()]);
    await mount();
    await flush();
    await click(q('traverse-save-start'));
    expect(q('traverse-save-coord-notice').textContent).toContain('ИЗРАВНЕНИ');
  });

  it('an OPEN run tells the user RAW coordinates will be saved', async () => {
    fieldProcessingApi.listRuns.mockResolvedValue([openRun()]);
    await mount();
    await flush();
    await click(q('traverse-save-start'));
    expect(q('traverse-save-coord-notice').textContent).toContain('СУРОВИ');
  });

  it('confirming calls createPoints and shows the done banner; already-saved runs offer no save button', async () => {
    fieldProcessingApi.listRuns.mockResolvedValue([run()]);
    await mount();
    await flush();
    fieldProcessingApi.createPoints.mockResolvedValue({
      created: [{ id: 'p1', name: '102' }],
      skipped: [{ setup: 1, observation: 0, target: '103', reason: 'NAME_CONFLICT' }],
      data: run({}, { generatedPointIds: ['p1'] }),
    });
    await click(q('traverse-save-start'));
    await click(q('traverse-save-go'));
    await flush();
    expect(fieldProcessingApi.createPoints).toHaveBeenCalledWith('run1');
    expect(q('traverse-save-done').textContent).toContain('Създадени са 1 точки.');
    expect(q('traverse-skipped').textContent).toContain('103');
    expect(q('traverse-save-start')).toBeFalsy();
  });
});
