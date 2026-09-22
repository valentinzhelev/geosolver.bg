import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import ProjectPointsTab from '../ProjectPointsTab';
import ProjectMapTab from '../ProjectMapTab';
import { surveyPointsApi } from '../../../../services/surveyPointsApi';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

jest.mock('react-router-dom', () => ({ Link: ({ to, children, ...rest }) => <a href={to} {...rest}>{children}</a> }), { virtual: true });
jest.mock('../../../../services/surveyPointsApi', () => ({ surveyPointsApi: { list: jest.fn() } }));

let root;
let container;
async function mount(el) {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  await act(async () => root.render(el));
}
afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  jest.clearAllMocks();
});

const q = (testid) => container.querySelector(`[data-testid="${testid}"]`);
const flush = () => act(async () => { await Promise.resolve(); await Promise.resolve(); });

describe('ProjectPointsTab: a compact preview, deep-linking to the full library', () => {
  it('shows the point count and a preview table, plus a link to the full page', async () => {
    surveyPointsApi.list.mockResolvedValue({ data: [{ _id: '1', name: 'A', y: 500000.123, x: 4700000.456, h: 120.5 }] });
    await mount(<ProjectPointsTab projectId="proj1" bg />);
    await flush();
    expect(surveyPointsApi.list).toHaveBeenCalledWith({ projectId: 'proj1' });
    expect(q('project-points-open-full').getAttribute('href')).toBe('/points?projectId=proj1');
    expect(container.textContent).toContain('A');
  });

  it('an empty project says so, never crashes on a missing preview', async () => {
    surveyPointsApi.list.mockResolvedValue({ data: [] });
    await mount(<ProjectPointsTab projectId="proj1" bg />);
    await flush();
    expect(q('project-points-tab').textContent).toMatch(/няма точки/);
  });
});

describe('ProjectMapTab: hands off to the full Map page', () => {
  it('links to /map with the project id', async () => {
    await mount(<ProjectMapTab projectId="proj1" bg />);
    expect(q('project-map-open').getAttribute('href')).toBe('/map?projectId=proj1');
  });
});
