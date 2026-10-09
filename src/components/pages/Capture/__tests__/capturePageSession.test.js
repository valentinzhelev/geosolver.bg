import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import CapturePage from '../CapturePage';
import { captureApi } from '../../../../services/captureApi';
import { fieldSessionsApi } from '../../../../services/fieldSessionsApi';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let mockSearch = 'projectId=proj1&sessionId=s1';
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
jest.mock('../../../../hooks/useProScan', () => ({ useProScan: () => ({ isProUser: true, proScanMessage: '' }) }));
jest.mock('../../../../services/captureApi', () => ({
  captureApi: { patchJob: jest.fn(), getJob: jest.fn(), confirmJob: jest.fn(), createJob: jest.fn(), fetchImageObjectUrl: jest.fn(), listJobs: jest.fn() },
}));
jest.mock('../../../../services/fieldSessionsApi', () => ({ fieldSessionsApi: { attachCapture: jest.fn() } }));
jest.mock('../Notebook/NotebookReview', () => (props) => <div data-testid="notebook-review" data-job={props.initialJob.id} />);

const nbJob = (over = {}) => ({ id: 'nb1', project: 'proj1', status: 'needs_review', revision: 0, mode: 'field-notebook', images: { review: '/img' }, ...over });

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
const q = (id) => container.querySelector(`[data-testid="${id}"]`);

beforeEach(() => {
  mockSearch = 'projectId=proj1&sessionId=s1';
  captureApi.fetchImageObjectUrl.mockResolvedValue('blob:img');
  captureApi.listJobs.mockResolvedValue([]);
  global.URL.revokeObjectURL = jest.fn();
});
afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  jest.resetAllMocks();
  mockSetParamsSpy.mockClear();
});

describe('Capture page inside a Field Session ("Добави от снимка")', () => {
  it('is always a field notebook: no coordinate-table choice, and a way back to the session', async () => {
    await mount();
    expect(q('capture-mode-coordinate-table')).toBeNull();
    expect(q('capture-mode-field-notebook')).toBeNull();
    expect(q('capture-upload').textContent).toContain('Полева книжка');
    expect(q('capture-back-to-session').getAttribute('href')).toBe('/project?projectId=proj1&tab=field-data&session=s1');
  });

  it('uploads as a notebook, attaches the new job to the session, and keeps the session in the URL', async () => {
    captureApi.createJob.mockResolvedValue(nbJob());
    fieldSessionsApi.attachCapture.mockResolvedValue({ id: 's1' });
    await mount();
    const file = new File(['png'], 'page.png', { type: 'image/png' });
    await pickFile(file);
    await flush();
    expect(captureApi.createJob).toHaveBeenCalledWith(file, 'proj1', 'field-notebook');
    expect(fieldSessionsApi.attachCapture).toHaveBeenCalledWith('s1', 'nb1');
    expect(mockSetParamsSpy).toHaveBeenCalledWith({ projectId: 'proj1', jobId: 'nb1', sessionId: 's1' });
    expect(q('notebook-review').dataset.job).toBe('nb1');
    expect(q('capture-back-to-session')).toBeTruthy(); // still there while reviewing
  });

  it('if attaching fails the capture is still there to review, with a safe message', async () => {
    captureApi.createJob.mockResolvedValue(nbJob());
    fieldSessionsApi.attachCapture.mockRejectedValue({ status: 409, code: 'CAPTURE_ALREADY_ATTACHED', message: 'Това заснемане вече е добавено към друга сесия.' });
    await mount();
    await pickFile(new File(['png'], 'page.png', { type: 'image/png' }));
    await flush();
    expect(q('notebook-review')).toBeTruthy();
    expect(container.querySelector('[role="alert"]').textContent).toBe('Това заснемане вече е добавено към друга сесия.');
  });

  it('an upload failure never attaches anything', async () => {
    captureApi.createJob.mockRejectedValue({ status: 500, code: 'INTERNAL', message: 'x' });
    await mount();
    await pickFile(new File(['png'], 'page.png', { type: 'image/png' }));
    await flush();
    expect(fieldSessionsApi.attachCapture).not.toHaveBeenCalled();
  });

  it('reopening the capture of a session (from "Продължи проверката") keeps the way back', async () => {
    mockSearch = 'projectId=proj1&jobId=nb1&sessionId=s1';
    captureApi.getJob.mockResolvedValue(nbJob());
    await mount();
    await flush();
    expect(captureApi.getJob).toHaveBeenCalledWith('nb1');
    expect(q('notebook-review')).toBeTruthy();
    expect(q('capture-back-to-session').getAttribute('href')).toContain('session=s1');
  });
});

describe('without a session the Capture page is exactly what it was', () => {
  it('keeps both modes, defaults to the coordinate table, and never touches the sessions API', async () => {
    mockSearch = 'projectId=proj1';
    captureApi.createJob.mockResolvedValue({ id: 'job9', project: 'proj1', status: 'needs_review', revision: 0, mode: 'coordinate-table', table: { issues: [], columns: [], rows: [] }, validationSummary: {}, images: {} });
    await mount();
    expect(q('capture-mode-coordinate-table')).toBeTruthy();
    expect(q('capture-mode-field-notebook')).toBeTruthy();
    expect(q('capture-back-to-session')).toBeNull();
    const file = new File(['png'], 't.png', { type: 'image/png' });
    await pickFile(file);
    await flush();
    expect(captureApi.createJob).toHaveBeenCalledWith(file, 'proj1', 'coordinate-table');
    expect(fieldSessionsApi.attachCapture).not.toHaveBeenCalled();
    expect(mockSetParamsSpy).toHaveBeenCalledWith({ projectId: 'proj1', jobId: 'job9' });
  });

  it('?mode=field-notebook preselects the notebook tab (used by "Нова сесия от снимка" links) without any session', async () => {
    mockSearch = 'projectId=proj1&mode=field-notebook';
    await mount();
    expect(q('capture-mode-field-notebook').getAttribute('aria-selected')).toBe('true');
  });
});
