import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import SessionPages from '../SessionPages';
import { captureApi } from '../../../../../services/captureApi';
import { fieldSessionsApi } from '../../../../../services/fieldSessionsApi';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

jest.mock('../../../../../services/captureApi', () => ({
  captureApi: { createJob: jest.fn(), listJobs: jest.fn(), fetchImageObjectUrl: jest.fn() },
}));
jest.mock('../../../../../services/fieldSessionsApi', () => ({
  fieldSessionsApi: { attachPage: jest.fn(), detachPage: jest.fn(), reorderPages: jest.fn(), list: jest.fn() },
}));

const page = (n, over = {}) => ({
  id: `job${n}`, page: n, state: 'ready', mine: true, hasImage: true, setupCount: 1, observationCount: 4, errors: 0, warnings: 0, continuesStation: null, repeatsStation: null, ...over,
});
const session = (pages, over = {}) => ({ id: 's1', revision: 7, pages, ...over });

let root;
let container;
const onChanged = jest.fn();
const onRefresh = jest.fn();
const onOpen = jest.fn();
async function mount(sess, props = {}) {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  await act(async () => root.render(<SessionPages session={sess} projectId="proj1" selectedId="job1" onOpen={onOpen} onChanged={onChanged} onRefresh={onRefresh} bg {...props} />));
  await flush();
}
beforeEach(() => {
  captureApi.fetchImageObjectUrl.mockResolvedValue('blob:thumb');
  captureApi.listJobs.mockResolvedValue([]);
  fieldSessionsApi.list.mockResolvedValue({ sessions: [], attachedCaptureJobIds: [], legacyFieldBooks: { total: 0, active: 0 } });
  global.URL.revokeObjectURL = jest.fn();
});
afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  jest.resetAllMocks();
  onChanged.mockClear();
  onRefresh.mockClear();
  onOpen.mockClear();
});

const q = (id) => container.querySelector(`[data-testid="${id}"]`);
const qa = (id) => [...container.querySelectorAll(`[data-testid="${id}"]`)];
const click = (el) => act(async () => { el.click(); });
const flush = () => act(async () => { for (let i = 0; i < 8; i += 1) await Promise.resolve(); });
const pickFile = (testId, file) => act(async () => {
  const input = q(testId);
  Object.defineProperty(input, 'files', { value: [file], configurable: true });
  input.dispatchEvent(new Event('change', { bubbles: true }));
});
const png = () => new File(['png'], 'page.png', { type: 'image/png' });

describe('page cards', () => {
  it('lists the pages in order with number, state, counts and what each continues', async () => {
    await mount(session([page(1), page(2, { continuesStation: '101', observationCount: 2 }), page(3, { repeatsStation: '102', warnings: 2, errors: 1 })]));
    const cards = qa('session-page');
    expect(cards).toHaveLength(3);
    expect(cards.map((c) => c.querySelector('[data-testid="session-page-title"]').textContent)).toEqual(['Страница 1', 'Страница 2', 'Страница 3']);
    expect(cards[0].querySelector('[data-testid="session-page-state"]').textContent).toBe('✓ Готова за проверка');
    expect(cards[0].querySelector('[data-testid="session-page-counts"]').textContent).toBe('4 наблюдения');
    expect(cards[1].querySelector('[data-testid="session-page-continues"]').textContent).toBe('Продължава станция 101');
    expect(cards[2].querySelector('[data-testid="session-page-repeats"]').textContent).toBe('Повтаря заглавието на станция 102');
    expect(cards[2].querySelector('[data-testid="session-page-counts"]').textContent).toBe('4 наблюдения · ✕ 1 грешка · ! 2 предупреждения');
    expect(q('session-pages-section').textContent).toContain('Страници (3)');
  });

  it('shows a failed page as failed and replaceable, never as data', async () => {
    await mount(session([page(1), page(2, { state: 'failed', observationCount: 0 })]));
    const card = qa('session-page')[1];
    expect(card.querySelector('[data-testid="session-page-state"]').textContent).toBe('✕ Не е разпозната');
    expect(card.querySelector('[data-testid="session-page-failed"]').textContent).toContain('Заменете я с нова снимка');
    expect(card.querySelector('[data-testid="session-page-counts"]')).toBeNull();
    expect(card.querySelector('[data-testid="session-page-replace"]')).toBeTruthy();
  });

  it('a page uploaded by someone else cannot be opened, and says why', async () => {
    await mount(session([page(1, { mine: false })]));
    expect(q('session-page-open')).toBeNull();
    expect(q('session-page-not-mine').textContent).toContain('друг потребител');
  });

  it('thumbnails come only from the uploader\'s own capture (authenticated fetch), with a numbered placeholder otherwise', async () => {
    await mount(session([page(1), page(2, { mine: false }), page(3, { hasImage: false })]));
    expect(captureApi.fetchImageObjectUrl).toHaveBeenCalledTimes(1);
    expect(captureApi.fetchImageObjectUrl).toHaveBeenCalledWith('/capture/jobs/job1/image/thumbnail');
    expect(qa('page-thumb')).toHaveLength(1);
    expect(qa('page-thumb-placeholder').map((p) => p.textContent)).toEqual(['2', '3']);
  });

  it('an empty session explains how to start; nothing internal is ever printed', async () => {
    await mount(session([]));
    expect(q('session-pages-empty').textContent).toContain('Добавете първата страница');
    expect(q('session-page-add')).toBeTruthy();
    expect(container.textContent).not.toMatch(/undefined|null|captureJob|FieldSession|[0-9a-f]{24}/);
  });

  it('Отвори hands the page to the review', async () => {
    await mount(session([page(1), page(2)]));
    await click(qa('session-page-open')[1]);
    expect(onOpen).toHaveBeenCalledWith('job2');
  });
});

describe('order', () => {
  it('up/down are disabled at the ends', async () => {
    await mount(session([page(1), page(2), page(3)]));
    const up = qa('session-page-up');
    const down = qa('session-page-down');
    expect(up.map((b) => b.disabled)).toEqual([true, false, false]);
    expect(down.map((b) => b.disabled)).toEqual([false, false, true]);
  });

  it('moving a page sends the WHOLE new order with the revision it was based on, and adopts the session the server returns', async () => {
    const updated = session([page(2), page(1), page(3)], { revision: 8 });
    fieldSessionsApi.reorderPages.mockResolvedValue(updated);
    await mount(session([page(1), page(2), page(3)]));
    await click(qa('session-page-down')[0]);
    expect(fieldSessionsApi.reorderPages).toHaveBeenCalledWith('s1', ['job2', 'job1', 'job3'], 7);
    expect(onChanged).toHaveBeenCalledWith(updated);
    expect(captureApi.createJob).not.toHaveBeenCalled(); // reordering never uploads or re-reads a page
  });

  it('a reorder conflict shows the clear message and reloads the session', async () => {
    fieldSessionsApi.reorderPages.mockRejectedValue({ status: 409, code: 'REVISION_CONFLICT', message: 'Сесията е променена от друго устройство. Презаредете и опитайте отново.' });
    await mount(session([page(1), page(2)]));
    await click(qa('session-page-up')[1]);
    expect(q('session-pages-error').textContent).toContain('друго устройство');
    expect(onRefresh).toHaveBeenCalled();
    expect(onChanged).not.toHaveBeenCalled();
  });
});

describe('remove', () => {
  it('asks first, says the capture is not deleted, and then detaches that page with the revision', async () => {
    const updated = session([page(2)], { revision: 8 });
    fieldSessionsApi.detachPage.mockResolvedValue(updated);
    await mount(session([page(1), page(2)]));
    await click(qa('session-page-remove')[0]);
    expect(q('session-page-remove-dialog').textContent).toContain('не се изтрива');
    expect(fieldSessionsApi.detachPage).not.toHaveBeenCalled();
    await click(q('session-page-remove-go'));
    expect(fieldSessionsApi.detachPage).toHaveBeenCalledWith('s1', 'job1', 7);
    expect(onChanged).toHaveBeenCalledWith(updated);
  });

  it('cancelling removes nothing', async () => {
    await mount(session([page(1)]));
    await click(q('session-page-remove'));
    await click(q('session-page-remove-dialog').querySelectorAll('button')[1]);
    expect(q('session-page-remove-dialog')).toBeNull();
    expect(fieldSessionsApi.detachPage).not.toHaveBeenCalled();
  });
});

describe('add a page', () => {
  it('upload: recognised as a field notebook, then attached as the next page', async () => {
    const file = png();
    const updated = session([page(1), page(2)], { revision: 8 });
    captureApi.createJob.mockResolvedValue({ id: 'job2' });
    fieldSessionsApi.attachPage.mockResolvedValue(updated);
    await mount(session([page(1)]));
    await pickFile('page-file-input', file);
    await flush();
    expect(captureApi.createJob).toHaveBeenCalledWith(file, 'proj1', 'field-notebook');
    expect(fieldSessionsApi.attachPage).toHaveBeenCalledWith('s1', 'job2', {});
    expect(onChanged).toHaveBeenCalledWith(updated);
  });

  it('camera uses the same path', async () => {
    captureApi.createJob.mockResolvedValue({ id: 'job2' });
    fieldSessionsApi.attachPage.mockResolvedValue(session([page(1), page(2)]));
    await mount(session([page(1)]));
    expect(q('page-camera-input').getAttribute('capture')).toBe('environment');
    await pickFile('page-camera-input', png());
    await flush();
    expect(fieldSessionsApi.attachPage).toHaveBeenCalledWith('s1', 'job2', {});
  });

  it('a photo that was stored but could not be read is still attached - as a failed page - and the reason is shown', async () => {
    captureApi.createJob.mockRejectedValue(Object.assign(new Error('x'), { name: 'CaptureApiError', status: 422, code: 'NO_NOTEBOOK_DETECTED', jobId: 'bad9', message: 'Не беше разпозната поле-книжка.' }));
    fieldSessionsApi.attachPage.mockResolvedValue(session([page(1), page(2, { id: 'bad9', state: 'failed' })]));
    await mount(session([page(1)]));
    await pickFile('page-file-input', png());
    await flush();
    expect(fieldSessionsApi.attachPage).toHaveBeenCalledWith('s1', 'bad9', {});
    expect(q('session-pages-error')).toBeTruthy();
    expect(onChanged).toHaveBeenCalled();
  });

  it('a failed upload that stored nothing attaches nothing and shows a safe message', async () => {
    captureApi.createJob.mockRejectedValue(new TypeError('Failed to fetch')); // the browser's own English text must never reach the user
    await mount(session([page(1)]));
    await pickFile('page-file-input', png());
    await flush();
    expect(fieldSessionsApi.attachPage).not.toHaveBeenCalled();
    expect(q('session-pages-error').textContent).not.toContain('Failed to fetch');
  });

  it('a wrong file type is refused before anything is sent', async () => {
    await mount(session([page(1)]));
    await pickFile('page-file-input', new File(['x'], 'notes.txt', { type: 'text/plain' }));
    await flush();
    expect(captureApi.createJob).not.toHaveBeenCalled();
    expect(q('session-pages-error')).toBeTruthy();
  });

  it('replacing a FAILED page puts the new one in its place and detaches the failed one', async () => {
    captureApi.createJob.mockResolvedValue({ id: 'new5' });
    fieldSessionsApi.attachPage.mockResolvedValue(session([page(1), page(2, { id: 'new5' }), page(3, { id: 'bad9', state: 'failed' })], { revision: 8 }));
    const final = session([page(1), page(2, { id: 'new5' })], { revision: 9 });
    fieldSessionsApi.detachPage.mockResolvedValue(final);
    await mount(session([page(1), page(2, { id: 'bad9', state: 'failed' })]));
    await click(q('session-page-replace'));
    await pickFile('page-file-input', png());
    await flush();
    expect(fieldSessionsApi.attachPage).toHaveBeenCalledWith('s1', 'new5', { position: 1 });
    expect(fieldSessionsApi.detachPage).toHaveBeenCalledWith('s1', 'bad9', 8);
    expect(onChanged).toHaveBeenLastCalledWith(final);
  });

  it('the page limit and duplicate errors are shown as the server worded them', async () => {
    captureApi.createJob.mockResolvedValue({ id: 'job9' });
    fieldSessionsApi.attachPage.mockRejectedValue({ status: 409, code: 'PAGE_LIMIT_REACHED', message: 'Сесията е достигнала максималния брой страници. Създайте нова сесия за останалите.' });
    await mount(session([page(1)]));
    await pickFile('page-file-input', png());
    await flush();
    expect(q('session-pages-error').textContent).toContain('максималния брой страници');
  });

  it('while a change is running every page action is disabled (no double submit)', async () => {
    let release;
    fieldSessionsApi.reorderPages.mockReturnValue(new Promise((r) => { release = r; }));
    await mount(session([page(1), page(2)]));
    await click(qa('session-page-down')[0]);
    expect(qa('session-page-down').every((b) => b.disabled)).toBe(true);
    expect(q('session-page-upload').disabled).toBe(true);
    await act(async () => { release(session([page(2), page(1)])); });
    await flush();
    expect(q('session-page-upload').disabled).toBe(false);
  });

  it('adding an existing capture lists only free field-notebook captures and attaches the one picked', async () => {
    captureApi.listJobs.mockResolvedValue([
      { id: 'free1', mode: 'field-notebook', status: 'needs_review', originalName: 'a.jpg', rows: 5, createdAt: '2026-10-01T10:00:00Z' },
      { id: 'taken', mode: 'field-notebook', status: 'needs_review', originalName: 'b.jpg', rows: 3, createdAt: '2026-10-01T10:00:00Z' },
      { id: 'table', mode: 'coordinate-table', status: 'needs_review', originalName: 't.jpg', rows: 3, createdAt: '2026-10-01T10:00:00Z' },
      { id: 'done', mode: 'field-notebook', status: 'confirmed', originalName: 'c.jpg', rows: 3, createdAt: '2026-10-01T10:00:00Z' },
    ]);
    fieldSessionsApi.list.mockResolvedValue({ sessions: [], attachedCaptureJobIds: ['taken'], legacyFieldBooks: { total: 0, active: 0 } });
    const updated = session([page(1), page(2, { id: 'free1' })], { revision: 8 });
    fieldSessionsApi.attachPage.mockResolvedValue(updated);
    await mount(session([page(1)]));
    await click(q('session-page-existing'));
    await flush();
    expect(qa('page-picker-row')).toHaveLength(1);
    expect(q('page-picker').textContent).toContain('a.jpg');
    await click(q('page-picker-row'));
    await flush();
    expect(fieldSessionsApi.attachPage).toHaveBeenCalledWith('s1', 'free1', { baseRevision: 7 });
    expect(q('page-picker')).toBeNull();
    expect(onChanged).toHaveBeenCalledWith(updated);
  });

  it('no free capture -> a plain empty state', async () => {
    await mount(session([page(1)]));
    await click(q('session-page-existing'));
    await flush();
    expect(q('page-picker-empty').textContent).toContain('Няма свободни заснемания');
  });
});
