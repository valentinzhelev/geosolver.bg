import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import CaptureHistory from '../CaptureHistory';
import { captureApi } from '../../../../services/captureApi';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

jest.mock('../../../../services/captureApi', () => ({
  captureApi: { listJobs: jest.fn() },
}));

let root;
let container;
async function mount(props) {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  await act(async () => root.render(<CaptureHistory projectId="proj1" bg {...props} />));
}
afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  jest.clearAllMocks();
});

const job = (over = {}) => ({ id: 'j1', mode: 'coordinate-table', status: 'needs_review', originalName: 'table.png', rows: 4, review: 1, invalid: 0, importedCount: 0, createdAt: '2026-01-01T10:00:00.000Z', ...over });

describe('CaptureHistory', () => {
  it('renders nothing without a project (Capture is always project-scoped)', async () => {
    await mount({ projectId: '' });
    expect(container.querySelector('[data-testid="capture-history"]')).toBeNull();
  });

  it('fetches the project\'s jobs and lists them newest-first as the server returns them, with status/row/review counts', async () => {
    let resolve;
    captureApi.listJobs.mockReturnValue(new Promise((r) => { resolve = r; }));
    await mount();
    expect(container.querySelector('[role="status"]')).not.toBeNull(); // loading
    await act(async () => resolve([job({ id: 'j2' }), job({ id: 'j1' })]));
    expect(captureApi.listJobs).toHaveBeenCalledWith('proj1');
    const rows = container.querySelectorAll('[data-testid="capture-history-row"]');
    expect(rows).toHaveLength(2);
    expect(rows[0].textContent).toContain('table.png');
    expect(rows[0].querySelector('[data-testid="capture-history-status"]').textContent).toBe('За преглед');
    expect(rows[0].textContent).toContain('4 реда');
    expect(rows[0].textContent).toContain('1 за проверка');
  });

  it('V2.3: shows a type badge distinguishing coordinate-table from field-notebook jobs', async () => {
    captureApi.listJobs.mockResolvedValue([job({ id: 'j1', mode: 'coordinate-table' }), job({ id: 'j2', mode: 'field-notebook', originalName: 'notebook.png' })]);
    await mount();
    await act(async () => {});
    const badges = [...container.querySelectorAll('[data-testid="capture-history-type"]')];
    expect(badges.map((b) => b.textContent)).toEqual(['Таблица с координати', 'Полева книжка']);
  });

  it('a confirmed job shows the imported count instead of a review count', async () => {
    captureApi.listJobs.mockResolvedValue([job({ status: 'confirmed', review: 0, importedCount: 4 })]);
    await mount();
    await act(async () => {});
    const row = container.querySelector('[data-testid="capture-history-row"]');
    expect(row.querySelector('[data-testid="capture-history-status"]').textContent).toBe('Импортирано');
    expect(row.textContent).toContain('4 импортирани');
  });

  it('clicking a row calls onOpen with that job\'s id', async () => {
    captureApi.listJobs.mockResolvedValue([job({ id: 'j9' })]);
    const onOpen = jest.fn();
    await mount({ onOpen });
    await act(async () => {});
    container.querySelector('[data-testid="capture-history-row"]').click();
    expect(onOpen).toHaveBeenCalledWith('j9');
  });

  it('shows an honest empty state, not a fake "no data" error', async () => {
    captureApi.listJobs.mockResolvedValue([]);
    await mount();
    await act(async () => {});
    expect(container.querySelector('[data-testid="capture-history-empty"]')).not.toBeNull();
  });

  it('a fetch failure shows a sanitized message, not a stack', async () => {
    captureApi.listJobs.mockRejectedValue({ code: 'X', message: 'Грешка при заявката.' });
    await mount();
    await act(async () => {});
    expect(container.querySelector('[role="alert"]').textContent).toBe('Грешка при заявката.');
  });

  it('re-fetches when refreshKey changes (e.g. right after a new upload)', async () => {
    captureApi.listJobs.mockResolvedValue([job()]);
    await mount({ refreshKey: 0 });
    await act(async () => {});
    expect(captureApi.listJobs).toHaveBeenCalledTimes(1);
    await act(async () => root.render(<CaptureHistory projectId="proj1" bg refreshKey={1} />));
    expect(captureApi.listJobs).toHaveBeenCalledTimes(2);
  });
});
