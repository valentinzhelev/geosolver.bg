import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import SessionPagesReview from '../SessionPagesReview';
import { captureApi } from '../../../../../services/captureApi';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

jest.mock('react-router-dom', () => ({ Link: ({ to, children, ...rest }) => <a href={to} {...rest}>{children}</a> }), { virtual: true });
jest.mock('../../../../../services/captureApi', () => ({
  captureApi: { getJob: jest.fn(), fetchImageObjectUrl: jest.fn(), createJob: jest.fn(), listJobs: jest.fn() },
}));
jest.mock('../../../../../services/fieldSessionsApi', () => ({
  fieldSessionsApi: { attachPage: jest.fn(), detachPage: jest.fn(), reorderPages: jest.fn(), list: jest.fn() },
}));
// the existing capture review is its own component (covered elsewhere): here only how the session embeds it
jest.mock('../../../Capture/Notebook/NotebookReview', () => (props) => (
  <button type="button" data-testid="mock-notebook" data-job={props.initialJob.id} data-embedded={String(!!props.embedded)} data-focus={JSON.stringify(props.focus)} onClick={() => props.onChange && props.onChange({})}>edit</button>
));

const typed = (v, unit = 'gon') => ({ value: v, unit });
const obs = (row, target, page, pageRow, over = {}) => ({
  row, target, page, pageSetup: 0, pageRow, hz: typed(10 * (row + 1)), vz: typed(100), distance: typed(25 + row, 'm'), horizontalDistance: null, prismHeight: typed(1.5, 'm'), code: '', notes: '',
  bbox: { x: 10, y: 20 * (row + 1), w: 100, h: 20 }, ...over,
});
const logical = () => ({
  setups: [
    { index: 0, station: { point: '101', instrumentHeight: typed(1.5, 'm'), notes: '' }, orientation: { target: '102', direction: typed(0) }, pages: [1, 2], observations: [obs(0, '201', 1, 0), obs(1, '202', 1, 1), obs(2, '203', 2, 0), obs(3, '204', 2, 1)] },
    { index: 1, station: { point: '102', instrumentHeight: null, notes: '' }, orientation: { target: '101', direction: null }, pages: [3], observations: [obs(0, '205', 3, 0)] },
  ],
});
const page = (n, over = {}) => ({ id: `job${n}`, page: n, state: 'ready', mine: true, hasImage: true, setupCount: 1, observationCount: 2, errors: 0, warnings: 0, continuesStation: null, repeatsStation: null, ...over });
const clean = { summary: { pages: 3, setups: 2, observations: 5, errors: 0, warnings: 0, canConfirm: true }, issues: [] };
const session = (over = {}) => ({
  id: 's1', revision: 4, source: 'capture', status: 'review', confirmed: false, pages: [page(1), page(2, { continuesStation: '101' }), page(3)], pageCount: 3,
  logical: logical(), evaluation: clean, ...over,
});

let root;
let container;
const handlers = { onSessionChange: jest.fn(), onRefresh: jest.fn(), onConfirm: jest.fn(), onDelete: jest.fn() };
async function mount(sess, props = {}) {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  await act(async () => root.render(<SessionPagesReview session={sess} projectId="proj1" busy={false} error="" bg {...handlers} {...props} />));
  await flush();
}
beforeEach(() => {
  captureApi.getJob.mockImplementation(async (id) => ({ id, status: 'needs_review', images: { review: `/api/capture/jobs/${id}/image/review` }, source: { review: { width: 1000, height: 1000 } }, notebook: { setups: [{}] } }));
  captureApi.fetchImageObjectUrl.mockResolvedValue('blob:img');
  captureApi.listJobs.mockResolvedValue([]);
  global.URL.revokeObjectURL = jest.fn();
});
afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  jest.resetAllMocks();
  Object.values(handlers).forEach((h) => h.mockClear());
});

const q = (id) => container.querySelector(`[data-testid="${id}"]`);
const qa = (id) => [...container.querySelectorAll(`[data-testid="${id}"]`)];
const click = (el) => act(async () => { el.click(); });
const flush = () => act(async () => { for (let i = 0; i < 10; i += 1) await Promise.resolve(); });

describe('the unified review: ONE logical notebook across pages', () => {
  it('shows page, station, observation and error counts for the whole session', async () => {
    await mount(session());
    const tiles = [...q('review-summary').children].map((c) => c.textContent);
    expect(tiles).toEqual(['3Страници', '2Станции', '5Наблюдения', '0Грешки', '0Предупреждения']);
  });

  it('stations in order, each observation with the page it came from, a station spanning pages says so', async () => {
    await mount(session());
    const setups = qa('logical-setup');
    expect(setups).toHaveLength(2);
    expect(setups[0].querySelector('h4').textContent).toContain('Станция 101');
    expect(setups[0].querySelector('[data-testid="logical-setup-pages"]').textContent).toContain('стр. 1–2');
    expect(setups[1].querySelector('[data-testid="logical-setup-pages"]').textContent).toContain('стр. 3');
    expect(qa('logical-row').map((r) => [r.querySelector('span span').textContent, r.dataset.page])).toEqual([['201', '1'], ['202', '1'], ['203', '2'], ['204', '2'], ['205', '3']]);
    expect(qa('logical-row-page').map((c) => c.textContent)).toEqual(['стр. 1', 'стр. 1', 'стр. 2', 'стр. 2', 'стр. 3']);
    expect(qa('logical-row')[2].textContent).toContain('Hz 30 gon');
  });

  it('a clean merge says so honestly (and that clean does not mean accurate)', async () => {
    await mount(session());
    expect(q('review-clean').textContent).toContain('Това не означава, че измерванията са точни');
    expect(q('review-issue-groups')).toBeNull();
  });

  it('selecting an observation shows its page photo with that observation\'s region highlighted', async () => {
    await mount(session());
    await click(qa('logical-row')[2]); // 203 is on page 2
    await flush();
    expect(captureApi.getJob).toHaveBeenCalledWith('job2');
    expect(q('page-image').textContent).toContain('Страница 2');
    expect(q('capture-highlight')).toBeTruthy();
    // a row of ANOTHER page than the one shown never highlights on it
    await click(qa('logical-row')[0]);
    await flush();
    expect(q('page-image').textContent).toContain('Страница 1');
  });

  it('the photo of a page uploaded by someone else is not fetched', async () => {
    await mount(session({ pages: [page(1, { mine: false }), page(2), page(3)] }));
    expect(q('page-image-not-mine')).toBeTruthy();
    expect(captureApi.getJob).not.toHaveBeenCalledWith('job1');
  });

  it('nothing internal reaches the screen', async () => {
    await mount(session());
    expect(container.textContent).not.toMatch(/undefined|null|captureJob|FieldSession|FieldObservationSet|job[123]\b|[0-9a-f]{24}/);
  });
});

describe('issues: grouped by page, located, with a way into the right page', () => {
  const issues = () => [
    { code: 'CROSS_PAGE_CONFLICT', severity: 'error', message: 'Несъответствие между страниците. Станция 101: височина на инструмента – 1.5 m (стр. 1) и 1.7 m (стр. 2). Поправете една от стойностите.', section: 'station', field: 'instrumentHeight', setup: 0, row: null, page: 2, pageSetup: 0, pageRow: null },
    { code: 'MALFORMED_DISTANCE', severity: 'error', message: 'Стойността не е разпозната като валидно число.', section: 'observation', field: 'distance', setup: 0, row: 3, page: 2, pageSetup: 0, pageRow: 1 },
    { code: 'MISSING_ORIENTATION', severity: 'warning', message: 'Няма зададена ориентация (заден пункт) за тази станция.', section: 'setup', field: null, setup: 1, row: null, page: 3, pageSetup: null, pageRow: null },
    { code: 'NO_PAGES', severity: 'error', message: 'Добавете поне една страница.', section: 'page', field: null, setup: null, row: null, page: null, pageSetup: null, pageRow: null },
  ];
  const blocked = () => session({ evaluation: { summary: { pages: 3, setups: 2, observations: 5, errors: 3, warnings: 1, canConfirm: false }, issues: issues() } });

  it('groups by page (session-wide first) and names page, station, observation and field', async () => {
    await mount(blocked());
    const groups = qa('review-page-issues');
    expect(groups.map((g) => g.querySelector('h3').textContent)).toEqual(['✕ Цялата сесия (1)', '✕ Страница 2 (2)', '! Страница 3 (1)']);
    const locs = qa('review-issue').map((i) => i.querySelector('span span').textContent);
    expect(locs).toEqual(['Цялата сесия', 'Страница 2 · Станция 101 · Височина на инструмента', 'Страница 2 · Станция 101 · наблюдение към 204 · Наклонено разстояние', 'Страница 3 · Станция 102']);
  });

  it('"Към полето" opens THAT page in the review, on the field the issue points at (page-local address)', async () => {
    await mount(blocked());
    const jumps = qa('review-issue-jump');
    expect(jumps).toHaveLength(3); // the session-wide issue has nowhere to go
    await click(jumps[0]); // the cross-page conflict on page 2's instrument height
    await flush();
    const editor = q('mock-notebook');
    expect(editor.dataset.job).toBe('job2');
    expect(editor.dataset.embedded).toBe('true');
    expect(JSON.parse(editor.dataset.focus)).toEqual({ setup: 0, section: 'station', field: 'instrumentHeight' });
    expect(q('review-mode-page').getAttribute('aria-selected')).toBe('true');
  });

  it('an observation issue focuses the exact row and column of the page', async () => {
    await mount(blocked());
    await click(qa('review-issue-jump')[1]);
    await flush();
    expect(JSON.parse(q('mock-notebook').dataset.focus)).toEqual({ setup: 0, section: 'observation', row: 1, field: 'distance' });
  });

  it('a setup-level issue opens the page without pretending to know a cell', async () => {
    await mount(blocked());
    await click(qa('review-issue-jump')[2]);
    await flush();
    expect(q('mock-notebook').dataset.job).toBe('job3');
    expect(JSON.parse(q('mock-notebook').dataset.focus)).toBeNull();
  });

  it('no jump is offered into a page the user cannot open (someone else\'s capture)', async () => {
    const s = blocked();
    s.pages = [page(1), page(2, { mine: false }), page(3)];
    await mount(s);
    expect(qa('review-issue-jump')).toHaveLength(1); // only page 3's
  });

  it('after an edit in the page editor the session is re-read (the unified review follows the correction)', async () => {
    await mount(blocked());
    await click(qa('review-issue-jump')[0]);
    await flush();
    await click(q('mock-notebook'));
    expect(handlers.onRefresh).toHaveBeenCalled();
  });

  it('the editor can walk the pages and return to the unified review', async () => {
    await mount(blocked());
    await click(qa('review-issue-jump')[0]);
    await flush();
    expect(q('page-editor-prev').disabled).toBe(false);
    await click(q('page-editor-next'));
    await flush();
    expect(q('mock-notebook').dataset.job).toBe('job3');
    expect(q('page-editor-next').disabled).toBe(true);
    await click(q('page-editor-back'));
    expect(q('review-unified')).toBeTruthy();
    expect(q('page-editor')).toBeNull();
  });

  it('a page uploaded by someone else shows who does the review, not an editor', async () => {
    await mount(session({ pages: [page(1, { mine: false }), page(2), page(3)] }));
    await click(q('review-mode-page'));
    expect(q('page-editor-not-mine')).toBeTruthy();
    expect(q('mock-notebook')).toBeNull();
  });
});

describe('confirm and delete', () => {
  it('confirm is disabled while errors remain, with the reason', async () => {
    await mount(session({ evaluation: { summary: { pages: 3, setups: 2, observations: 5, errors: 1, warnings: 0, canConfirm: false }, issues: [{ code: 'X', severity: 'error', message: 'грешка', section: 'page', field: null, setup: null, row: null, page: null }] } }));
    expect(q('session-confirm-start').disabled).toBe(true);
    expect(q('review-confirm-reason').textContent).toBe('Поправете грешките, за да потвърдите.');
  });

  it('with no pages there is nothing to confirm, and the way to start is offered', async () => {
    await mount(session({ pages: [], pageCount: 0, logical: { setups: [] }, evaluation: { summary: { pages: 0, setups: 0, observations: 0, errors: 1, warnings: 0, canConfirm: false }, issues: [] } }));
    expect(q('session-confirm-start').disabled).toBe(true);
    expect(q('review-confirm-reason').textContent).toBe('Добавете поне една страница.');
    expect(q('session-page-upload')).toBeTruthy();
  });

  it('the confirmation says what will be recorded from how many pages, that it is final, and lists unresolved warnings', async () => {
    const warn = { code: 'MISSING_ORIENTATION', severity: 'warning', message: 'w', section: 'setup', field: null, setup: 1, row: null, page: 3, pageSetup: null, pageRow: null };
    await mount(session({ evaluation: { summary: { pages: 3, setups: 2, observations: 5, errors: 0, warnings: 1, canConfirm: true }, issues: [warn] } }));
    await click(q('session-confirm-start'));
    const dlg = q('session-confirm-dialog');
    expect(dlg.textContent).toContain('5 наблюдения от 2 станции, обединени от 3 страници');
    expect(dlg.textContent).toContain('не могат да се променят');
    expect(dlg.textContent).toContain('Досега нищо не е записано');
    expect(q('session-confirm-warnings').textContent).toContain('1 предупреждения остават неразрешени');
    expect(handlers.onConfirm).not.toHaveBeenCalled();
    await click(q('session-confirm-go'));
    expect(handlers.onConfirm).toHaveBeenCalledTimes(1);
  });

  it('confirm is disabled while something is running (busy), so it cannot be double-submitted', async () => {
    await mount(session(), { busy: true });
    expect(q('session-confirm-start').disabled).toBe(true);
    expect(qa('session-page-down').every((b) => b.disabled)).toBe(true);
  });

  it('delete explains the photos are NOT deleted', async () => {
    await mount(session());
    await click(q('session-delete'));
    expect(q('session-delete-dialog').textContent).toContain('Снимките (заснеманията) не се изтриват');
    await click(q('session-delete-go'));
    expect(handlers.onDelete).toHaveBeenCalledTimes(1);
  });

  it('a server-side refusal is shown inline', async () => {
    await mount(session(), { error: 'В сесията има грешки, които трябва да се поправят преди потвърждаване.' });
    expect(q('session-review-error').textContent).toContain('преди потвърждаване');
  });
});

describe('mobile ergonomics', () => {
  it('the page photo can be hidden on a phone (toggle), and every action is a large touch target', async () => {
    await mount(session());
    expect(q('review-toggle-image')).toBeTruthy();
    const targets = [...container.querySelectorAll('button')].filter((b) => !b.className.includes('min-h-[44px]') && !b.className.includes('min-h-[48px]') && !b.className.includes('min-w-[44px]'));
    // the only small buttons are the image-zoom controls of the shared image pane
    expect(targets.every((b) => b.closest('[role="toolbar"]'))).toBe(true);
  });
});
