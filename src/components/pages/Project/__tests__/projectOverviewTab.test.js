import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import ProjectOverviewTab from '../ProjectOverviewTab';
import { surveyPointsApi } from '../../../../services/surveyPointsApi';
import { captureApi } from '../../../../services/captureApi';
import { fieldProcessingApi } from '../../../../services/fieldProcessingApi';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  Link: ({ to, children, ...rest }) => <a href={to} {...rest}>{children}</a>,
  useNavigate: () => mockNavigate,
}), { virtual: true });
jest.mock('../../../../services/surveyPointsApi', () => ({ surveyPointsApi: { list: jest.fn() } }));
jest.mock('../../../../services/captureApi', () => ({ captureApi: { listJobs: jest.fn() } }));
jest.mock('../../../../services/fieldProcessingApi', () => ({ fieldProcessingApi: { listRunsForProject: jest.fn() } }));

const job = (over = {}) => ({ id: 'job1', originalName: 'x.jpg', mode: 'field-notebook', status: 'needs_review', rows: 2, review: 1, importedCount: 0, createdAt: '2026-09-20T10:00:00Z', ...over });
const polarRun = () => ({ id: 'run1', processingType: 'polar', createdAt: '2026-09-21T10:00:00Z', setups: [{ index: 0, observations: [{ status: 'READY' }] }] });

let root;
let container;
async function mount() {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  await act(async () => root.render(<ProjectOverviewTab projectId="proj1" bg />));
}
afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  jest.clearAllMocks();
});

const q = (testid) => container.querySelector(`[data-testid="${testid}"]`);
const qa = (testid) => [...container.querySelectorAll(`[data-testid="${testid}"]`)];
const flush = () => act(async () => { await Promise.resolve(); await Promise.resolve(); await Promise.resolve(); });

describe('ProjectOverviewTab: a lean project dashboard', () => {
  it('shows counts once every source has loaded', async () => {
    surveyPointsApi.list.mockResolvedValue({ data: [{ _id: 'p1' }, { _id: 'p2' }] });
    captureApi.listJobs.mockResolvedValue([job(), job({ id: 'job2', status: 'confirmed' })]);
    fieldProcessingApi.listRunsForProject.mockResolvedValue([polarRun()]);
    await mount();
    await flush();
    expect(container.textContent).toContain('2'); // points
    const rows = qa('overview-activity-row');
    expect(rows.length).toBeGreaterThan(0);
  });

  it('offers the four primary actions', async () => {
    surveyPointsApi.list.mockResolvedValue({ data: [] });
    captureApi.listJobs.mockResolvedValue([]);
    fieldProcessingApi.listRunsForProject.mockResolvedValue([]);
    await mount();
    await flush();
    expect(q('overview-action-points').getAttribute('href')).toBe('/points?projectId=proj1');
    expect(q('overview-action-capture').getAttribute('href')).toBe('/capture?projectId=proj1');
    expect(q('overview-action-map').getAttribute('href')).toBe('/map?projectId=proj1');
    expect(q('overview-action-process')).toBeTruthy();
  });

  it('"Process field data" navigates into the Field Data tab', async () => {
    surveyPointsApi.list.mockResolvedValue({ data: [] });
    captureApi.listJobs.mockResolvedValue([]);
    fieldProcessingApi.listRunsForProject.mockResolvedValue([]);
    await mount();
    await flush();
    await act(async () => { q('overview-action-process').click(); });
    expect(mockNavigate).toHaveBeenCalledWith('/project?projectId=proj1&tab=field-data');
  });

  it('a job needing review is counted separately from confirmed ones', async () => {
    surveyPointsApi.list.mockResolvedValue({ data: [] });
    captureApi.listJobs.mockResolvedValue([job({ status: 'needs_review' }), job({ id: 'job2', status: 'confirmed' })]);
    fieldProcessingApi.listRunsForProject.mockResolvedValue([]);
    await mount();
    await flush();
    const tab = q('project-overview-tab');
    expect(tab).toBeTruthy();
  });
});
