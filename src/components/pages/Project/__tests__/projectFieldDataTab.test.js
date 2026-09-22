import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import ProjectFieldDataTab from '../ProjectFieldDataTab';
import { captureApi } from '../../../../services/captureApi';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({ useNavigate: () => mockNavigate }), { virtual: true });
jest.mock('../../../../services/captureApi', () => ({ captureApi: { listJobs: jest.fn() } }));

const job = (over = {}) => ({ id: 'job1', originalName: 'notebook.jpg', mode: 'field-notebook', status: 'needs_review', rows: 4, review: 1, importedCount: 0, createdAt: '2026-09-20T10:00:00Z', ...over });

let root;
let container;
async function mount() {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  await act(async () => root.render(<ProjectFieldDataTab projectId="proj1" bg />));
}
afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  jest.clearAllMocks();
});

const q = (testid) => container.querySelector(`[data-testid="${testid}"]`);
const click = (el) => act(async () => { el.click(); });
const flush = () => act(async () => { await Promise.resolve(); await Promise.resolve(); });

describe('ProjectFieldDataTab: unified capture history for the project', () => {
  it('reuses CaptureHistory to list both capture types and offers a "new capture" action', async () => {
    captureApi.listJobs.mockResolvedValue([job()]);
    await mount();
    await flush();
    expect(captureApi.listJobs).toHaveBeenCalledWith('proj1');
    expect(q('capture-history-row')).toBeTruthy();
    expect(q('project-field-data-new')).toBeTruthy();
  });

  it('"new capture" navigates to the Capture page for this project', async () => {
    captureApi.listJobs.mockResolvedValue([]);
    await mount();
    await flush();
    await click(q('project-field-data-new'));
    expect(mockNavigate).toHaveBeenCalledWith('/capture?projectId=proj1');
  });

  it('opening a history row deep-links into the Capture page with the exact job id', async () => {
    captureApi.listJobs.mockResolvedValue([job()]);
    await mount();
    await flush();
    await click(q('capture-history-row'));
    expect(mockNavigate).toHaveBeenCalledWith('/capture?projectId=proj1&jobId=job1');
  });
});
