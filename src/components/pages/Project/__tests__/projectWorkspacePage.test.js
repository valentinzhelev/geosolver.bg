import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import ProjectWorkspacePage from '../ProjectWorkspacePage';
import { fieldbooksApi } from '../../../../services/fieldbookApi';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

// react-router-dom v7 cannot be resolved by this project's Jest transform (every existing test in the codebase
// mocks it with virtual:true rather than using a real Router) - useSearchParams is reproduced here as a genuine
// React hook (real useState) backed by `global.__testInitialSearch`, which each test sets before mounting, so
// tab-switching behaviour is exercised for real rather than merely asserted against a static prop.
jest.mock('react-router-dom', () => {
  const ReactLib = require('react');
  return {
    Link: ({ to, children, ...rest }) => ReactLib.createElement('a', { href: to, ...rest }, children),
    useSearchParams: () => {
      const [params, setParams] = ReactLib.useState(() => new URLSearchParams(global.__testInitialSearch || ''));
      const setSearchParams = (next) => setParams(new URLSearchParams(next));
      return [params, setSearchParams];
    },
  };
}, { virtual: true });
jest.mock('../../../../services/fieldbookApi', () => ({ fieldbooksApi: { listProjects: jest.fn() } }));
jest.mock('../../../../hooks/useTranslation', () => ({ useTranslation: () => ({ language: 'bg' }) }));
jest.mock('../../../layout/Layout', () => ({ children }) => <div>{children}</div>);
jest.mock('../../../shared/SEO', () => () => null);
jest.mock('../ProjectOverviewTab', () => () => <div data-testid="tab-content-overview" />);
jest.mock('../ProjectPointsTab', () => () => <div data-testid="tab-content-points" />);
jest.mock('../ProjectFieldDataTab', () => () => <div data-testid="tab-content-field-data" />);
jest.mock('../ProjectProcessingTab', () => () => <div data-testid="tab-content-processing" />);
jest.mock('../ProjectMapTab', () => () => <div data-testid="tab-content-map" />);

const project = { _id: 'proj1', name: 'Обект Витоша' };

let root;
let container;
async function mount(search) {
  global.__testInitialSearch = search;
  fieldbooksApi.listProjects.mockResolvedValue({ data: [project] });
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  await act(async () => root.render(<ProjectWorkspacePage />));
}
afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  jest.clearAllMocks();
  delete global.__testInitialSearch;
});

const q = (testid) => container.querySelector(`[data-testid="${testid}"]`);
const click = (el) => act(async () => { el.click(); });
const flush = () => act(async () => { await Promise.resolve(); await Promise.resolve(); });

describe('ProjectWorkspacePage: the coherent project shell', () => {
  it('with no ?projectId= at all, offers a way back to the project list rather than crashing', async () => {
    await mount('');
    expect(container.textContent).toMatch(/Не е избран проект/);
  });

  it('loads the project by id and defaults to the Overview tab', async () => {
    await mount('projectId=proj1');
    await flush();
    expect(fieldbooksApi.listProjects).toHaveBeenCalled();
    expect(container.textContent).toContain(project.name);
    expect(q('project-tab-overview').getAttribute('aria-selected')).toBe('true');
    expect(q('tab-content-overview')).toBeTruthy();
  });

  it('an unknown project id shows a not-found message instead of a blank/crashed page', async () => {
    fieldbooksApi.listProjects.mockResolvedValue({ data: [] });
    await mount('projectId=ghost');
    await flush();
    expect(container.textContent).toMatch(/не е намерен/);
  });

  it('a ?tab= in the URL selects that tab directly (deep-linkable)', async () => {
    await mount('projectId=proj1&tab=processing');
    await flush();
    expect(q('project-tab-processing').getAttribute('aria-selected')).toBe('true');
    expect(q('tab-content-processing')).toBeTruthy();
    expect(q('tab-content-overview')).toBeFalsy();
  });

  it('clicking a tab switches the visible content for every section', async () => {
    await mount('projectId=proj1');
    await flush();
    await click(q('project-tab-field-data'));
    expect(q('tab-content-field-data')).toBeTruthy();
    await click(q('project-tab-points'));
    expect(q('tab-content-points')).toBeTruthy();
    await click(q('project-tab-map'));
    expect(q('tab-content-map')).toBeTruthy();
  });

  it('an invalid ?tab= value falls back to Overview rather than rendering nothing', async () => {
    await mount('projectId=proj1&tab=nonsense');
    await flush();
    expect(q('project-tab-overview').getAttribute('aria-selected')).toBe('true');
  });
});
