import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import ProjectProcessingTab from '../ProjectProcessingTab';
import { fieldProcessingApi } from '../../../../services/fieldProcessingApi';
import { reportsApi } from '../../../../services/reportsApi';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

jest.mock('react-router-dom', () => ({ Link: ({ to, children, ...rest }) => <a href={to} {...rest}>{children}</a> }), { virtual: true });
jest.mock('../../../../services/fieldProcessingApi', () => ({ fieldProcessingApi: { listRunsForProject: jest.fn() } }));
jest.mock('../../../../services/reportsApi', () => ({ reportsApi: { createReport: jest.fn() } }));

const polarRun = () => ({
  id: 'run-polar-1',
  processingType: 'polar',
  createdAt: '2026-09-20T10:00:00Z',
  generatedPointIds: ['p1'],
  source: { captureJobId: 'job-1', fieldObservationSetId: 'fos-1' },
  setups: [
    {
      index: 0, setupError: null, station: { identifier: '101' }, orientation: { identifier: '102' },
      observations: [
        { index: 0, target: '201', status: 'READY', x: 1000, y: 2050, h: 499.5 },
        { index: 1, target: '202', status: 'XY_ONLY', x: 1030, y: 2000, h: null },
      ],
    },
  ],
});

const traverseRun = () => ({
  id: 'run-traverse-1',
  processingType: 'traverse',
  createdAt: '2026-09-21T10:00:00Z',
  generatedPointIds: [],
  source: { captureJobId: 'job-2', fieldObservationSetId: 'fos-2' },
  traverse: {
    traverseType: 'KNOWN_ENDPOINT', startIdentifier: '101', endIdentifier: '103', status: 'READY',
    legs: [
      { index: 0, from: '101', to: '102', status: 'READY', rawX: 1100, rawY: 2000, adjustedX: 1100.04, adjustedY: 2000.02 },
      { index: 1, from: '102', to: '103', status: 'XY_ONLY', rawX: 1100, rawY: 2050, adjustedX: 1100.06, adjustedY: 2050.03 },
    ],
    closure: { available: true, reason: null, totalLength: 150, fX: -0.06, fY: -0.03, linearMisclosure: 0.067, perfectClosure: false, relativeClosureDenominator: 2237 },
    adjustment: { method: 'bowditch', version: 1, applied: true, reasonNotApplied: null },
  },
});

let root;
let container;
async function mount(props = {}) {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  await act(async () => root.render(<ProjectProcessingTab projectId="proj1" bg {...props} />));
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

describe('ProjectProcessingTab: project-wide, read-only run listing', () => {
  it('shows a loading state, then an empty state when there are no runs', async () => {
    fieldProcessingApi.listRunsForProject.mockResolvedValue([]);
    await mount();
    expect(fieldProcessingApi.listRunsForProject).toHaveBeenCalledWith('proj1');
    await flush();
    expect(q('project-processing-empty')).toBeTruthy();
  });

  it('lists both polar and traverse runs with distinguishing badges and shared status labels', async () => {
    fieldProcessingApi.listRunsForProject.mockResolvedValue([traverseRun(), polarRun()]);
    await mount();
    await flush();
    const cards = qa('processing-run-card');
    expect(cards).toHaveLength(2);
    expect(cards[0].textContent).toContain('Полигонов ход');
    expect(cards[0].textContent).toContain('101');
    expect(cards[1].textContent).toContain('Полярна обработка');
  });

  it('a run with generated points links to Project Points; a run without does not', async () => {
    fieldProcessingApi.listRunsForProject.mockResolvedValue([traverseRun(), polarRun()]);
    await mount();
    await flush();
    const links = qa('processing-run-points-link');
    expect(links).toHaveLength(1); // only the polar run has generatedPointIds
    expect(links[0].getAttribute('href')).toBe('/points?projectId=proj1');
  });

  it('every run links back to its source Field Notebook via the capture job id', async () => {
    fieldProcessingApi.listRunsForProject.mockResolvedValue([polarRun()]);
    await mount();
    await flush();
    expect(q('processing-run-source-link').getAttribute('href')).toBe('/capture?projectId=proj1&jobId=job-1');
  });

  it('clicking Details expands a read-only detail block; clicking again collapses it (never mutates the run)', async () => {
    fieldProcessingApi.listRunsForProject.mockResolvedValue([traverseRun()]);
    await mount();
    await flush();
    expect(q('processing-run-detail')).toBeFalsy();
    await click(q('processing-run-toggle'));
    const detail = q('processing-run-detail');
    expect(detail).toBeTruthy();
    expect(detail.textContent).toContain('1100.040'); // adjusted X
    await click(q('processing-run-toggle'));
    expect(q('processing-run-detail')).toBeFalsy();
  });

  it('a polar run detail shows the per-target table with status and never a start/save control', async () => {
    fieldProcessingApi.listRunsForProject.mockResolvedValue([polarRun()]);
    await mount();
    await flush();
    await click(q('processing-run-toggle'));
    const detail = q('processing-run-detail');
    expect(detail.textContent).toContain('201');
    expect(detail.textContent).toContain('1000.000');
    expect(container.querySelector('button[data-testid="field-processing-start-button"]')).toBeFalsy();
  });

  it('an OPEN-style traverse without adjustment reads "Не е приложимо" for adjusted columns', async () => {
    const open = traverseRun();
    open.traverse.closure = { available: false, reason: 'OPEN_TRAVERSE', totalLength: null, fX: null, fY: null, linearMisclosure: null, perfectClosure: null, relativeClosureDenominator: null };
    open.traverse.adjustment = { method: 'bowditch', version: 1, applied: false, reasonNotApplied: 'OPEN_TRAVERSE' };
    fieldProcessingApi.listRunsForProject.mockResolvedValue([open]);
    await mount();
    await flush();
    await click(q('processing-run-toggle'));
    expect(q('processing-run-detail').textContent).toContain('Не е приложимо');
  });
});

describe('"Генерирай отчет": a lightweight confirmation before generating, never silent', () => {
  it('shows a confirm step naming the report type and row count before calling the API', async () => {
    fieldProcessingApi.listRunsForProject.mockResolvedValue([polarRun()]);
    await mount();
    await flush();
    expect(reportsApi.createReport).not.toHaveBeenCalled();
    await click(q('processing-run-generate-report'));
    const dialog = q('processing-run-report-confirm');
    expect(dialog).toBeTruthy();
    expect(dialog.textContent).toContain('полярна');
    expect(dialog.textContent).toContain('2'); // two observations in the polar fixture
    expect(reportsApi.createReport).not.toHaveBeenCalled();
  });

  it('confirming calls createReport with the exact run id and reportType, then shows a done state with a Documents link', async () => {
    fieldProcessingApi.listRunsForProject.mockResolvedValue([polarRun()]);
    reportsApi.createReport.mockResolvedValue({ id: 'report1', title: 'Отчет за полярна обработка' });
    await mount();
    await flush();
    await click(q('processing-run-generate-report'));
    await click(q('processing-run-report-go'));
    await flush();
    expect(reportsApi.createReport).toHaveBeenCalledWith({ reportType: 'POLAR_PROCESSING_REPORT', projectId: 'proj1', sourceId: 'run-polar-1' });
    const done = q('processing-run-report-done');
    expect(done).toBeTruthy();
    expect(done.querySelector('a').getAttribute('href')).toBe('/project?projectId=proj1&tab=documents');
  });

  it('a traverse run generates a TRAVERSE_PROCESSING_REPORT', async () => {
    fieldProcessingApi.listRunsForProject.mockResolvedValue([traverseRun()]);
    reportsApi.createReport.mockResolvedValue({ id: 'report2', title: 'Отчет за обработка на полигонов ход' });
    await mount();
    await flush();
    await click(q('processing-run-generate-report'));
    await click(q('processing-run-report-go'));
    await flush();
    expect(reportsApi.createReport).toHaveBeenCalledWith(expect.objectContaining({ reportType: 'TRAVERSE_PROCESSING_REPORT', sourceId: 'run-traverse-1' }));
  });

  it('cancelling the confirmation never calls the API', async () => {
    fieldProcessingApi.listRunsForProject.mockResolvedValue([polarRun()]);
    await mount();
    await flush();
    await click(q('processing-run-generate-report'));
    await click(container.querySelector('[data-testid="processing-run-report-confirm"] button:not([data-testid])'));
    expect(q('processing-run-report-confirm')).toBeFalsy();
    expect(reportsApi.createReport).not.toHaveBeenCalled();
  });

  it('a failed generation shows the error and returns to the idle state, offering a retry', async () => {
    fieldProcessingApi.listRunsForProject.mockResolvedValue([polarRun()]);
    reportsApi.createReport.mockRejectedValue({ message: 'Грешка при заявката.' });
    await mount();
    await flush();
    await click(q('processing-run-generate-report'));
    await click(q('processing-run-report-go'));
    await flush();
    expect(container.querySelector('[role="alert"]').textContent).toBe('Грешка при заявката.');
    expect(q('processing-run-generate-report')).toBeTruthy(); // back to idle, can retry
  });
});
