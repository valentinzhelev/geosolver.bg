import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import ProjectFieldDataTab from '../ProjectFieldDataTab';
import { captureApi } from '../../../../services/captureApi';
import { fieldSessionsApi } from '../../../../services/fieldSessionsApi';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let mockSearch = '';
const mockNavigate = jest.fn();
const mockSetParams = jest.fn();
jest.mock('react-router-dom', () => ({
  Link: ({ to, children, ...rest }) => <a href={to} {...rest}>{children}</a>,
  useNavigate: () => mockNavigate,
  useSearchParams: () => [new URLSearchParams(mockSearch), mockSetParams],
}), { virtual: true });
jest.mock('../../../../services/captureApi', () => ({ captureApi: { listJobs: jest.fn() } }));
jest.mock('../../../../services/fieldSessionsApi', () => ({ fieldSessionsApi: { list: jest.fn(), create: jest.fn() } }));
jest.mock('../FieldSession/FieldSessionDetail', () => (props) => (
  <div data-testid="mock-detail" data-session={props.sessionId} data-section={props.initialSection} data-project={props.projectId}>
    <button type="button" data-testid="mock-detail-back" onClick={props.onBack}>back</button>
    <button type="button" data-testid="mock-detail-open" onClick={() => props.onOpenSession('s9', 'entry')}>open</button>
  </div>
));

const session = (over = {}) => ({
  id: 's1', projectId: 'proj1', title: 'Теренна сесия — 09.10.2026', dateLabel: '09.10.2026', operator: 'В. Желев', source: 'manual', sourceLabel: 'Ръчно въведена',
  status: 'draft', statusLabel: 'Чернова', confirmed: false, setupCount: 2, observationCount: 7, issues: { errors: 0, warnings: 0 },
  capture: null, processing: { runCount: 0, pointCount: 0, reportCount: 0 }, revisionOf: null, hasRevision: false, ...over,
});
const listOf = (sessions = [], extra = {}) => ({ sessions, attachedCaptureJobIds: [], legacyFieldBooks: { total: 0, active: 0 }, ...extra });
const job = (over = {}) => ({ id: 'job1', originalName: 'notebook.jpg', mode: 'field-notebook', status: 'needs_review', rows: 4, review: 1, importedCount: 0, createdAt: '2026-09-20T10:00:00Z', ...over });

let root;
let container;
async function mount() {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  await act(async () => root.render(<ProjectFieldDataTab projectId="proj1" bg />));
  await flush();
}
beforeEach(() => {
  mockSearch = '';
  captureApi.listJobs.mockResolvedValue([]);
  fieldSessionsApi.list.mockResolvedValue(listOf());
});
afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  jest.resetAllMocks();
  mockNavigate.mockClear();
  mockSetParams.mockClear();
});

const q = (id) => container.querySelector(`[data-testid="${id}"]`);
const qa = (id) => [...container.querySelectorAll(`[data-testid="${id}"]`)];
const click = (el) => act(async () => { el.click(); });
const flush = () => act(async () => { for (let i = 0; i < 6; i += 1) await Promise.resolve(); });

describe('Теренни данни: the project\'s field sessions', () => {
  it('shows a clear empty state and the two ways to start', async () => {
    await mount();
    expect(fieldSessionsApi.list).toHaveBeenCalledWith('proj1');
    expect(q('field-sessions-empty').textContent).toBe('Още няма теренни сесии в този проект.');
    expect(q('field-session-new').textContent).toBe('Нова теренна сесия');
    expect(q('project-field-data-new').getAttribute('href')).toBe('/capture?projectId=proj1');
  });

  it('each session shows date, operator, source, status, counts, issues and the processing state in product language', async () => {
    fieldSessionsApi.list.mockResolvedValue(listOf([
      session({ id: 's1', status: 'review', statusLabel: 'За проверка', issues: { errors: 1, warnings: 2 } }),
      session({ id: 's2', title: 'Станция 101', status: 'processed', statusLabel: 'Обработена', confirmed: true, source: 'capture', sourceLabel: 'От снимка на полеви карнет', processing: { runCount: 2, pointCount: 5, reportCount: 1 } }),
    ]));
    await mount();
    const cards = qa('field-session-card');
    expect(cards).toHaveLength(2);
    expect(cards[0].textContent).toContain('Теренна сесия — 09.10.2026');
    expect(cards[0].textContent).toContain('09.10.2026 · В. Желев · Ръчно въведена');
    expect(cards[0].querySelector('[data-testid="field-session-status"]').textContent).toBe('! За проверка');
    expect(cards[0].querySelector('[data-testid="field-session-counts"]').textContent).toBe('2 станции · 7 наблюдения');
    expect(cards[0].querySelector('[data-testid="field-session-issues"]').textContent).toBe('✕ 3 проблема');
    expect(cards[1].querySelector('[data-testid="field-session-status"]').textContent).toBe('✓✓ Обработена');
    expect(cards[1].querySelector('[data-testid="field-session-processing"]').textContent).toBe('2 обработки · 5 точки · 1 отчета');
    expect(cards[1].textContent).toContain('От снимка на полеви карнет');
    expect(container.textContent).not.toMatch(/FieldSession|CaptureJob|FieldObservationSet|processingRunId|undefined|null/);
  });

  it.each([
    ['draft', 'Отвори', ''],
    ['review', 'Продължи проверката', 'review'],
    ['confirmed', 'Обработи', 'processing'],
    ['processed', 'Виж резултата', 'processing'],
  ])('a %s session offers "%s" and opens on the right section', async (status, label, sec) => {
    fieldSessionsApi.list.mockResolvedValue(listOf([session({ status, confirmed: status === 'confirmed' || status === 'processed' })]));
    await mount();
    expect(q('field-session-next').textContent).toBe(label);
    await click(q('field-session-next'));
    expect(mockSetParams).toHaveBeenCalledWith({ projectId: 'proj1', tab: 'field-data', session: 's1', ...(sec ? { section: sec } : {}) });
  });

  it('a notebook-photo session that is not yet confirmed continues in its review', async () => {
    fieldSessionsApi.list.mockResolvedValue(listOf([session({ source: 'capture', status: 'draft' })]));
    await mount();
    expect(q('field-session-next').textContent).toBe('Продължи проверката');
  });

  it('opening a card puts the session in the URL (so a link, reload and the back button work)', async () => {
    fieldSessionsApi.list.mockResolvedValue(listOf([session()]));
    await mount();
    await click(q('field-session-open'));
    expect(mockSetParams).toHaveBeenCalledWith({ projectId: 'proj1', tab: 'field-data', session: 's1' });
  });

  it('"Нова теренна сесия" creates an empty session and opens it on the entry screen - no metadata required', async () => {
    fieldSessionsApi.create.mockResolvedValue({ id: 's7' });
    await mount();
    await click(q('field-session-new'));
    await flush();
    expect(fieldSessionsApi.create).toHaveBeenCalledWith({ projectId: 'proj1' });
    expect(mockSetParams).toHaveBeenCalledWith({ projectId: 'proj1', tab: 'field-data', session: 's7', section: 'entry' });
  });

  it('a failed creation shows a safe message and stays on the list', async () => {
    fieldSessionsApi.create.mockRejectedValue({ status: 403, code: 'FORBIDDEN', message: 'Нямате права за този проект.' });
    await mount();
    await click(q('field-session-new'));
    await flush();
    expect(q('field-sessions-error').textContent).toBe('Нямате права за този проект.');
    expect(mockSetParams).not.toHaveBeenCalled();
  });

  it('a list failure never shows the raw error and still offers the way forward', async () => {
    fieldSessionsApi.list.mockRejectedValue(new TypeError('Failed to fetch'));
    await mount();
    expect(q('field-sessions-error').textContent).toBe('Възникна проблем. Опитайте отново.');
    expect(q('field-session-new')).toBeTruthy();
  });
});

describe('compatibility: nothing made before sessions is lost or hidden', () => {
  it('captures that belong to no session stay reachable; attached ones are listed only inside their session', async () => {
    captureApi.listJobs.mockResolvedValue([job({ id: 'attached' }), job({ id: 'loose', originalName: 'loose.jpg' }), job({ id: 'table', mode: 'coordinate-table', originalName: 'table.png' })]);
    fieldSessionsApi.list.mockResolvedValue(listOf([session({ source: 'capture', capture: { jobId: 'attached' } })], { attachedCaptureJobIds: ['attached'] }));
    await mount();
    expect(captureApi.listJobs).toHaveBeenCalledWith('proj1');
    expect(qa('capture-history-row').map((r) => r.textContent)).toEqual([expect.stringContaining('loose.jpg'), expect.stringContaining('table.png')]);
    expect(container.textContent).toContain('Заснемания извън сесия');
  });

  it('opening an outside capture deep-links into the Capture page with the exact job id', async () => {
    captureApi.listJobs.mockResolvedValue([job({ id: 'loose' })]);
    await mount();
    await click(q('capture-history-row'));
    expect(mockNavigate).toHaveBeenCalledWith('/capture?projectId=proj1&jobId=loose');
  });

  it('a notebook capture can be wrapped in a session in one tap (a coordinate table cannot)', async () => {
    captureApi.listJobs.mockResolvedValue([job({ id: 'nb' }), job({ id: 'tb', mode: 'coordinate-table' })]);
    await mount();
    expect(qa('capture-to-session')).toHaveLength(1);
    fieldSessionsApi.create.mockResolvedValue({ id: 's8' });
    await click(q('capture-to-session'));
    await flush();
    expect(fieldSessionsApi.create).toHaveBeenCalledWith({ projectId: 'proj1', captureJobId: 'nb' });
    expect(mockSetParams).toHaveBeenCalledWith({ projectId: 'proj1', tab: 'field-data', session: 's8', section: 'review' });
  });

  it('legacy electronic carnets are acknowledged with counts and a link, never migrated or listed', async () => {
    fieldSessionsApi.list.mockResolvedValue(listOf([], { legacyFieldBooks: { total: 2, active: 1 } }));
    await mount();
    expect(q('legacy-carnets').textContent).toContain('Проектът има 2 карнета (1 активни)');
    expect(q('legacy-carnets').textContent).toContain('остават непроменени');
    expect(q('legacy-carnets-link').getAttribute('href')).toBe('/fieldbook');
  });

  it('no legacy card when the project has none', async () => {
    await mount();
    expect(q('legacy-carnets')).toBeNull();
  });
});

describe('a session open inside the tab', () => {
  it('?session= renders that session (with the requested section) instead of the list', async () => {
    mockSearch = 'projectId=proj1&tab=field-data&session=s1&section=review';
    await mount();
    expect(q('mock-detail').dataset).toMatchObject({ session: 's1', section: 'review', project: 'proj1' });
    expect(q('field-sessions-panel')).toBeNull();
    expect(fieldSessionsApi.list).not.toHaveBeenCalled();
  });

  it('back returns to the list; opening another session (a revision) switches to it', async () => {
    mockSearch = 'projectId=proj1&tab=field-data&session=s1';
    await mount();
    await click(q('mock-detail-back'));
    expect(mockSetParams).toHaveBeenCalledWith({ projectId: 'proj1', tab: 'field-data' });
    await click(q('mock-detail-open'));
    expect(mockSetParams).toHaveBeenCalledWith({ projectId: 'proj1', tab: 'field-data', session: 's9', section: 'entry' });
  });
});
