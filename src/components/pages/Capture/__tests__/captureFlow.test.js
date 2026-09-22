import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import CapturePage from '../CapturePage';
import { captureApi } from '../../../../services/captureApi';
import { nextStepLinks } from '../../../../utils/projectCreation';
import fs from 'fs';
import path from 'path';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let mockSearch = 'projectId=proj1';
let mockPro = true;
const mockSetParamsSpy = jest.fn();
jest.mock('react-router-dom', () => {
  const R = require('react');
  return {
    Link: ({ to, children, ...rest }) => <a href={to} {...rest}>{children}</a>,
    useSearchParams: () => {
      const [p, setP] = R.useState(() => new URLSearchParams(mockSearch));
      return [p, (next) => { mockSetParamsSpy(next); setP(new URLSearchParams(next)); }];
    },
  };
}, { virtual: true });
jest.mock('../../../layout/Layout', () => ({ children }) => <div>{children}</div>);
jest.mock('../../../shared/SEO', () => () => null);
jest.mock('../../../../hooks/useTranslation', () => ({ useTranslation: () => ({ language: 'bg' }) }));
jest.mock('../../../../hooks/useProScan', () => ({ useProScan: () => ({ isProUser: mockPro, proScanMessage: 'Сканирането е функция на Pro плана. Моля, абонирайте се.' }) }));
jest.mock('../../../../services/captureApi', () => ({
  captureApi: { patchJob: jest.fn(), getJob: jest.fn(), confirmJob: jest.fn(), createJob: jest.fn(), fetchImageObjectUrl: jest.fn(), listJobs: jest.fn() },
}));

const job = (over = {}) => ({
  id: 'job9', project: 'proj1', status: 'needs_review', revision: 0, mode: 'coordinate-table',
  source: { review: { width: 800, height: 300 }, quality: { warnings: [] } },
  table: {
    issues: [],
    columns: [{ index: 0, headerText: 'Точка', semantic: 'point', mapping: 'ok' }, { index: 1, headerText: 'X', semantic: 'x', mapping: 'ok' }, { index: 2, headerText: 'Y', semantic: 'y', mapping: 'ok' }],
    rows: [{ index: 0, status: 'ok', skipped: false, bbox: { x: 0, y: 0, w: 1, h: 1 }, cells: [0, 1, 2].map((c) => ({ col: c, rawText: ['P1', '4700000', '500000'][c], reviewState: 'accepted', validation: { status: 'ok', issues: [] }, userValue: null, bbox: { x: 10 * c, y: 10, w: 8, h: 8 } })) }],
  },
  validationSummary: { rows: 1, ready: 1, review: 0, invalid: 0, canConfirm: true }, importedPointIds: [],
  images: { review: '/api/capture/jobs/job9/image/review' }, ...over,
});

const notebookJob = (over = {}) => ({
  id: 'nb1', project: 'proj1', status: 'needs_review', revision: 0, mode: 'field-notebook',
  source: { review: { width: 800, height: 300 }, quality: { warnings: [] } },
  notebook: {
    pageIndex: 0, issues: [],
    setups: [{
      index: 0,
      station: {
        point: { col: 0, rawText: 'T1', normalizedValue: 'T1', reviewState: 'accepted', validation: { status: 'ok', issues: [] }, userValue: null, bbox: { x: 0, y: 0, w: 8, h: 8 }, candidates: [] },
        instrumentHeight: { col: 0, rawText: '1.450', normalizedValue: 1.45, reviewState: 'accepted', validation: { status: 'ok', issues: [] }, userValue: null, bbox: { x: 0, y: 0, w: 8, h: 8 }, candidates: [] },
        notes: { col: 0, rawText: '', normalizedValue: null, reviewState: 'accepted', validation: { status: 'ok', issues: [] }, userValue: null, bbox: { x: 0, y: 0, w: 8, h: 8 }, candidates: [] },
        bbox: { x: 0, y: 0, w: 8, h: 8 },
      },
      orientation: null,
      issues: [],
      observations: [{
        index: 0, bbox: { x: 0, y: 10, w: 8, h: 8 }, status: 'ok', skipped: false, excluded: false,
        cols: [{ index: 0, headerText: 'Точка', field: 'target', mapping: 'ok' }, { index: 1, headerText: 'Hz', field: 'hz', mapping: 'ok' }],
        cells: [
          { col: 0, rawText: 'A1', normalizedValue: 'A1', reviewState: 'accepted', validation: { status: 'ok', issues: [] }, userValue: null, bbox: { x: 0, y: 10, w: 8, h: 8 }, candidates: [] },
          { col: 1, rawText: '94.5000g', normalizedValue: 94.5, reviewState: 'accepted', validation: { status: 'ok', issues: [] }, userValue: null, bbox: { x: 20, y: 10, w: 8, h: 8 }, candidates: [] },
        ],
      }],
    }],
  },
  validationSummary: { setups: 1, observations: 1, ready: 1, review: 0, invalid: 0, excluded: 0, canConfirm: true },
  images: { review: '/api/capture/jobs/nb1/image/review' }, ...over,
});

let root;
let container;
async function mount() {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  await act(async () => root.render(<CapturePage />));
}
const pickFile = (file) => act(async () => {
  const input = container.querySelector('[data-testid="capture-file-input"]');
  Object.defineProperty(input, 'files', { value: [file], configurable: true });
  input.dispatchEvent(new Event('change', { bubbles: true }));
});
const flush = () => act(async () => { await new Promise((r) => setTimeout(r, 0)); });
const click = (el) => act(async () => { el.click(); });

beforeEach(() => {
  mockSearch = 'projectId=proj1';
  mockPro = true;
  captureApi.fetchImageObjectUrl.mockResolvedValue('blob:img');
  captureApi.listJobs.mockResolvedValue([]);
  global.URL.revokeObjectURL = jest.fn();
});
afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  jest.clearAllMocks();
});

describe('Capture page entry conditions', () => {
  it('a non-Pro user sees the Pro message and no upload control (Capture is Pro-only)', async () => {
    mockPro = false;
    await mount();
    expect(container.querySelector('[data-testid="capture-pro-gate"]').textContent).toContain('Pro');
    expect(container.querySelector('[data-testid="capture-file-input"]')).toBeNull();
    expect(container.querySelector('a[href="/prices"]')).not.toBeNull();
  });

  it('without a project there is nothing to upload to: the user is sent to the projects', async () => {
    mockSearch = '';
    await mount();
    expect(container.querySelector('[data-testid="capture-no-project"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="capture-file-input"]')).toBeNull();
    expect(container.querySelector('a[href="/projects"]')).not.toBeNull();
  });

  it('the upload screen explains the trust rule and the convention (X = north, Y = east)', async () => {
    await mount();
    const upload = container.querySelector('[data-testid="capture-upload"]');
    expect(upload.textContent).toContain('само чернова');
    expect(upload.textContent).toContain('X е север, Y е изток');
    expect(upload.querySelector('input[capture="environment"]')).not.toBeNull(); // camera
    expect(container.querySelector('[data-testid="capture-file-input"]').getAttribute('accept')).toBe('image/jpeg,image/png,image/webp');
  });
});

describe('upload -> review', () => {
  it('a valid image is uploaded for THIS project and the reconstructed draft is shown for review', async () => {
    captureApi.createJob.mockResolvedValue(job());
    await mount();
    const file = new File(['png'], 'table.png', { type: 'image/png' });
    await pickFile(file);
    await flush();
    expect(captureApi.createJob).toHaveBeenCalledWith(file, 'proj1', 'coordinate-table');
    expect(captureApi.fetchImageObjectUrl).toHaveBeenCalledWith('/api/capture/jobs/job9/image/review');
    expect(container.querySelector('[data-testid="capture-review"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="capture-summary"]').textContent).toBe('1 реда · 1 готови · 0 за проверка · 0 невалидни');
    expect(mockSetParamsSpy).toHaveBeenCalledWith({ projectId: 'proj1', jobId: 'job9' }); // reload-safe URL
    expect(container.querySelector('[data-testid="capture-upload"]')).toBeNull();
    expect(container.querySelector('img').getAttribute('src')).toBe('blob:img');
  });

  it('an unsupported file is refused BEFORE any request (friendly message)', async () => {
    await mount();
    await pickFile(new File(['%PDF'], 'scan.pdf', { type: 'application/pdf' }));
    expect(captureApi.createJob).not.toHaveBeenCalled();
    expect(container.querySelector('[role="alert"]').textContent).toContain('JPG, PNG и WebP');
  });

  it('a server rejection shows the sanitized message and keeps the upload screen (no stack, no raw JSON)', async () => {
    captureApi.createJob.mockRejectedValue({ code: 'PROVIDER_UNAVAILABLE', message: 'Разпознаването временно не е възможно. Опитайте отново по-късно.' });
    await mount();
    await pickFile(new File(['png'], 'table.png', { type: 'image/png' }));
    await flush();
    const alert = container.querySelector('[role="alert"]');
    expect(alert.textContent).toBe('Разпознаването временно не е възможно. Опитайте отново по-късно.');
    expect(container.querySelector('[data-testid="capture-upload"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="capture-review"]')).toBeNull();
  });

  it('the quota and the Pro gate come back as clear messages', async () => {
    captureApi.createJob.mockRejectedValue({ code: 'QUOTA_EXCEEDED', message: 'x' });
    await mount();
    await pickFile(new File(['png'], 'a.png', { type: 'image/png' }));
    await flush();
    expect(container.querySelector('[role="alert"]').textContent).toContain('месечния лимит');
  });

  it('nothing is imported by uploading: only createJob is called, never confirm', async () => {
    captureApi.createJob.mockResolvedValue(job());
    await mount();
    await pickFile(new File(['png'], 'table.png', { type: 'image/png' }));
    await flush();
    expect(captureApi.confirmJob).not.toHaveBeenCalled();
    expect(captureApi.patchJob).not.toHaveBeenCalled();
  });
});

describe('V2.3: choosing between coordinate-table and field-notebook mode', () => {
  it('defaults to coordinate-table; explains the trust rule for it', async () => {
    await mount();
    expect(container.querySelector('[data-testid="capture-mode-coordinate-table"]').getAttribute('aria-selected')).toBe('true');
    expect(container.querySelector('[data-testid="capture-mode-field-notebook"]').getAttribute('aria-selected')).toBe('false');
    expect(container.querySelector('[data-testid="capture-upload"]').textContent).toContain('X е север, Y е изток');
  });

  it('switching to field notebook changes the explanation and the mode sent on upload', async () => {
    captureApi.createJob.mockResolvedValue(notebookJob());
    await mount();
    await click(container.querySelector('[data-testid="capture-mode-field-notebook"]'));
    expect(container.querySelector('[data-testid="capture-upload"]').textContent).toContain('станция, ориентир, наблюдения');
    expect(container.querySelector('[data-testid="capture-upload"]').textContent).not.toContain('X е север');
    await pickFile(new File(['png'], 'notebook.png', { type: 'image/png' }));
    await flush();
    expect(captureApi.createJob).toHaveBeenCalledWith(expect.anything(), 'proj1', 'field-notebook');
  });

  it('a field-notebook job renders the Field Notebook review workspace, not the coordinate-table one', async () => {
    captureApi.createJob.mockResolvedValue(notebookJob());
    await mount();
    await click(container.querySelector('[data-testid="capture-mode-field-notebook"]'));
    await pickFile(new File(['png'], 'notebook.png', { type: 'image/png' }));
    await flush();
    expect(container.querySelector('[data-testid="notebook-review"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="capture-review"]')).toBeNull();
    // a field-notebook capture never offers "project points" (it creates no SurveyPoints)
    expect(container.querySelector('a[href="/points?projectId=proj1"]')).toBeNull();
  });
});

describe('reopening and restarting', () => {
  it('a job id in the URL reopens the job (reload-safe)', async () => {
    mockSearch = 'projectId=proj1&jobId=job9';
    captureApi.getJob.mockResolvedValue(job());
    await mount();
    await flush();
    expect(captureApi.getJob).toHaveBeenCalledWith('job9');
    expect(container.querySelector('[data-testid="capture-review"]')).not.toBeNull();
  });

  it('"Ново сканиране" returns to the upload screen and links to the project points', async () => {
    mockSearch = 'projectId=proj1&jobId=job9';
    captureApi.getJob.mockResolvedValue(job());
    await mount();
    await flush();
    expect(container.querySelector('a[href="/points?projectId=proj1"]')).not.toBeNull();
    await act(async () => { [...container.querySelectorAll('button')].find((b) => b.textContent === 'Ново сканиране').click(); });
    expect(container.querySelector('[data-testid="capture-upload"]')).not.toBeNull();
  });
});

describe('V2.2 Capture history on the upload screen', () => {
  it('shows the project\'s recent captures, and a new upload is reflected once the user returns to the upload screen', async () => {
    captureApi.listJobs.mockResolvedValueOnce([]).mockResolvedValueOnce([{ id: 'jH', status: 'needs_review', originalName: 'table.png', rows: 1, review: 0, invalid: 0, importedCount: 0, createdAt: '2026-01-01T10:00:00.000Z' }]);
    captureApi.createJob.mockResolvedValue(job());
    await mount();
    await flush();
    expect(captureApi.listJobs).toHaveBeenCalledWith('proj1');
    expect(container.querySelector('[data-testid="capture-history-empty"]')).not.toBeNull();

    await pickFile(new File(['png'], 'table.png', { type: 'image/png' }));
    await flush();
    expect(container.querySelector('[data-testid="capture-review"]')).not.toBeNull(); // navigated away from the upload screen

    await act(async () => { [...container.querySelectorAll('button')].find((b) => b.textContent === 'Ново сканиране').click(); });
    await flush();
    expect(captureApi.listJobs).toHaveBeenCalledTimes(2); // the upload screen's history is current again
    expect(container.querySelector('[data-testid="capture-history-row"]').textContent).toContain('table.png');
  });

  it('clicking a history row reopens that job (even while a different one is showing)', async () => {
    captureApi.listJobs.mockResolvedValue([{ id: 'jOld', status: 'needs_review', originalName: 'old.png', rows: 1, review: 0, invalid: 0, importedCount: 0, createdAt: '2026-01-01T10:00:00.000Z' }]);
    captureApi.getJob.mockImplementation(async (id) => job({ id }));
    await mount();
    await flush();
    await act(async () => { container.querySelector('[data-testid="capture-history-row"]').click(); });
    await flush();
    expect(captureApi.getJob).toHaveBeenCalledWith('jOld');
    expect(container.querySelector('[data-testid="capture-review"]')).not.toBeNull();
  });
});

describe('entry points in the project workflow', () => {
  it('the project next-steps offer Capture right after "Add points" (points stays the primary action)', () => {
    const links = nextStepLinks('p1', 'bg');
    expect(links[0].key).toBe('points');
    expect(links[1]).toMatchObject({ key: 'capture', to: '/capture?projectId=p1' });
  });

  it('the Project Hub card links to /capture for its project, and the route is protected', () => {
    const hub = fs.readFileSync(path.join(__dirname, '..', '..', 'Projects', 'ProjectHubPage.js'), 'utf8');
    expect(hub).toContain('to={`/capture?projectId=${p._id}`}');
    const app = fs.readFileSync(path.join(__dirname, '..', '..', '..', '..', 'App.js'), 'utf8');
    expect(app).toMatch(/path="\/capture"[\s\S]{0,120}<ProtectedRoute>[\s\S]{0,60}<CapturePage \/>/);
  });

  it('the legacy scan flow is untouched (First Task still uses scanService, Capture does not)', () => {
    const first = fs.readFileSync(path.join(__dirname, '..', '..', '..', 'tasks', 'FirstTask.js'), 'utf8');
    expect(first).toContain("from '../../services/scanService'");
    const page = fs.readFileSync(path.join(__dirname, '..', 'CapturePage.js'), 'utf8');
    expect(page).not.toContain('scanService');
  });
});
