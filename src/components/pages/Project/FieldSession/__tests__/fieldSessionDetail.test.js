import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import FieldSessionDetail from '../FieldSessionDetail';
import { fieldSessionsApi } from '../../../../../services/fieldSessionsApi';
import { reportsApi } from '../../../../../services/reportsApi';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

jest.mock('react-router-dom', () => ({ Link: ({ to, children, ...rest }) => <a href={to} {...rest}>{children}</a> }), { virtual: true });
jest.mock('../../../../../services/fieldSessionsApi', () => ({
  fieldSessionsApi: { get: jest.fn(), update: jest.fn(), submit: jest.fn(), confirm: jest.fn(), revise: jest.fn(), remove: jest.fn(), attachCapture: jest.fn(), list: jest.fn(), create: jest.fn() },
}));
jest.mock('../../../../../services/reportsApi', () => ({ reportsApi: { createReport: jest.fn() } }));
jest.mock('../../../Capture/Notebook/FieldProcessingWorkflow', () => (props) => (
  <div data-testid="mock-workflow" data-modes={props.availableModes.join(',')} data-set={props.fieldObservationSetId} data-suggest={JSON.stringify(props.traverseSuggestions)} />
));

const rawSetup = (over = {}) => ({
  index: 0, station: { point: '101', instrumentHeight: '1.52', notes: '' }, orientation: { target: '102', direction: '0' },
  observations: [{ row: 0, target: '201', hz: '10', vz: '', distance: '50', horizontalDistance: '', prismHeight: '', code: '', notes: '' }], ...over,
});
const clean = { summary: { setups: 1, observations: 1, errors: 0, warnings: 0, canConfirm: true }, issues: [] };
const view = (over = {}) => ({
  id: 's1', projectId: 'proj1', title: 'Теренна сесия — 09.10.2026', customTitle: '', date: '2026-10-09', dateLabel: '09.10.2026', operator: '', instrument: '', instrumentSerial: '', conditions: '', notes: '', angleUnit: 'gon',
  source: 'manual', sourceLabel: 'Ръчно въведена', status: 'draft', statusLabel: 'Чернова', confirmed: false, setupCount: 1, observationCount: 1,
  issues: { errors: 0, warnings: 0 }, capture: null, processing: { runCount: 0, pointCount: 0, reportCount: 0 }, revisionOf: null, hasRevision: false, createdByMe: true,
  revision: 3, createdAt: '2026-10-09T08:00:00Z', updatedAt: '2026-10-09T08:00:00Z', confirmedAt: null, observationSetId: null,
  setups: [rawSetup()], evaluation: clean, evidence: null, processingOptions: null, runs: [], reports: [], ...over,
});
const confirmedView = (over = {}) => view({
  status: 'confirmed', statusLabel: 'Потвърдена', confirmed: true, observationSetId: 'fos1', confirmedAt: '2026-10-09T09:00:00Z', evaluation: null, revision: 4,
  evidence: { setups: [{ index: 0, station: { point: '101', instrumentHeight: { value: 1.52, unit: 'm' } }, orientation: { target: '102', direction: { value: 0, unit: 'gon' } },
    observations: [{ row: 0, target: '201', hz: { value: 10, unit: 'gon' }, vz: null, distance: { value: 50, unit: 'm' }, horizontalDistance: null, prismHeight: null, code: '', notes: '' }] }] },
  processingOptions: { polar: { available: true, reason: null, setupCount: 1, observationCount: 1 }, traverse: { available: false, reason: 'NEEDS_TWO_STATIONS' } }, ...over,
});

let root;
let container;
const onBack = jest.fn();
const onOpen = jest.fn();
async function mount(props = {}) {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  await act(async () => root.render(<FieldSessionDetail projectId="proj1" sessionId="s1" bg onBack={onBack} onOpenSession={onOpen} {...props} />));
  await flush();
}
beforeEach(() => {
  fieldSessionsApi.update.mockImplementation(async (id, body) => view({ revision: body.baseRevision + 1 }));
});
afterEach(async () => {
  jest.useRealTimers();
  await act(async () => root.unmount());
  container.remove();
  jest.resetAllMocks();
  onBack.mockClear();
  onOpen.mockClear();
});

const q = (id) => container.querySelector(`[data-testid="${id}"]`);
const qa = (id) => [...container.querySelectorAll(`[data-testid="${id}"]`)];
const click = (el) => act(async () => { el.click(); });
const flush = () => act(async () => { for (let i = 0; i < 6; i += 1) await Promise.resolve(); });
const type = (el, value) => act(async () => {
  const proto = el.tagName === 'TEXTAREA' ? window.HTMLTextAreaElement.prototype : window.HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, value);
  el.dispatchEvent(new Event('input', { bubbles: true }));
});
const advance = (ms) => act(async () => { jest.advanceTimersByTime(ms); for (let i = 0; i < 6; i += 1) await Promise.resolve(); });
const section = (id) => click(q(`session-section-${id}`));

describe('loading and the section a session opens on', () => {
  it.each([
    ['an empty manual draft opens on the entry screen', view({ setups: [], observationCount: 0, setupCount: 0 }), 'session-entry'],
    ['a draft with data opens on the overview', view(), 'session-overview'],
    ['a session marked "За проверка" opens on the review', view({ status: 'review', statusLabel: 'За проверка' }), 'session-review'],
    ['a confirmed session opens on the overview', confirmedView(), 'session-overview'],
    ['a notebook-photo session opens on the review', view({ source: 'capture', setups: [], evaluation: null, capture: { attached: true, available: true, status: 'needs_review', mine: true, jobId: 'job1', rows: 4, review: 1, invalid: 0 } }), 'session-review'],
  ])('%s', async (_, v, testid) => {
    fieldSessionsApi.get.mockResolvedValue(v);
    await mount();
    expect(q(testid)).toBeTruthy();
    expect(q('session-title').textContent).toBe(v.title);
  });

  it('an explicit section wins', async () => {
    fieldSessionsApi.get.mockResolvedValue(view());
    await mount({ initialSection: 'review' });
    expect(q('session-review')).toBeTruthy();
  });

  it('a load failure shows a safe message with retry and a way back', async () => {
    fieldSessionsApi.get.mockRejectedValueOnce({ code: 'NOT_FOUND', message: 'Теренната сесия не е намерена.' });
    await mount();
    expect(q('session-load-error').textContent).toContain('Теренната сесия не е намерена.');
    fieldSessionsApi.get.mockResolvedValueOnce(view());
    await click([...container.querySelectorAll('button')].find((b) => b.textContent === 'Опитай отново'));
    await flush();
    expect(q('field-session-detail')).toBeTruthy();
    await act(async () => root.unmount());
    container.remove();
    fieldSessionsApi.get.mockRejectedValueOnce(new TypeError('Failed to fetch'));
    await mount();
    expect(q('session-load-error').textContent).toContain('Възникна проблем. Опитайте отново.');
    expect(q('session-load-error').textContent).not.toContain('Failed to fetch');
  });

  it('sections: Преглед · Станции и наблюдения · Проверка · Обработка · Документи, with the status always as symbol + word', async () => {
    fieldSessionsApi.get.mockResolvedValue(view());
    await mount();
    expect([...container.querySelectorAll('[role="tab"]')].map((t) => t.textContent)).toEqual(['Преглед', 'Станции и наблюдения', 'Проверка', 'Обработка', 'Документи']);
    expect(q('session-status').textContent).toBe('✎ Чернова');
    expect(container.textContent).not.toMatch(/FieldSession|FieldObservationSet|CaptureJob|observationSetId/);
  });
});

describe('autosave: local-first, serialised, never loses what was typed', () => {
  beforeEach(() => { jest.useFakeTimers(); });

  const typeStation = async (v) => { await section('entry'); await type(q('station-field-point'), v); };

  it('saves after a pause with the revision the edit was based on, and shows the progress', async () => {
    fieldSessionsApi.get.mockResolvedValue(view());
    await mount();
    await typeStation('105');
    expect(q('session-save-state').dataset.state).toBe('dirty');
    expect(q('session-save-state').textContent).toContain('не са запазени');
    expect(fieldSessionsApi.update).not.toHaveBeenCalled(); // debounced - not a request per keystroke

    await advance(700);
    expect(fieldSessionsApi.update).toHaveBeenCalledTimes(1);
    const [, body] = fieldSessionsApi.update.mock.calls[0];
    expect(body.baseRevision).toBe(3);
    expect(body.setups[0].station.point).toBe('105');
    expect(q('session-save-state').dataset.state).toBe('saved');
    expect(q('session-save-state').textContent).toBe('✓ Запазено');
  });

  it('coalesces a burst of typing into one request, and sends the next edit with the NEW revision', async () => {
    fieldSessionsApi.get.mockResolvedValue(view());
    await mount();
    await typeStation('1');
    await typeStation('10');
    await type(q('station-field-point'), '105');
    await advance(700);
    expect(fieldSessionsApi.update).toHaveBeenCalledTimes(1);
    await type(q('station-field-instrumentHeight'), '1.6');
    await advance(700);
    expect(fieldSessionsApi.update).toHaveBeenCalledTimes(2);
    expect(fieldSessionsApi.update.mock.calls[1][1].baseRevision).toBe(4); // the server's answer to the first save
  });

  it('never has two saves in flight: a slow network cannot reorder or interleave edits', async () => {
    fieldSessionsApi.get.mockResolvedValue(view());
    let release;
    fieldSessionsApi.update.mockImplementationOnce(() => new Promise((r) => { release = () => r(view({ revision: 4 })); }));
    await mount();
    await typeStation('105');
    await advance(700);
    expect(fieldSessionsApi.update).toHaveBeenCalledTimes(1); // in flight, unresolved
    expect(q('session-save-state').dataset.state).toBe('saving');

    await type(q('station-field-point'), '106');
    await advance(700); // the debounce fires while the first request is still pending
    expect(fieldSessionsApi.update).toHaveBeenCalledTimes(1); // ...and does NOT start a second request

    await act(async () => { release(); await Promise.resolve(); });
    await flush();
    expect(fieldSessionsApi.update).toHaveBeenCalledTimes(2);
    expect(fieldSessionsApi.update.mock.calls[1][1]).toMatchObject({ baseRevision: 4 });
    expect(fieldSessionsApi.update.mock.calls[1][1].setups[0].station.point).toBe('106');
    expect(q('station-field-point').value).toBe('106'); // what the user typed was never overwritten by a response
  });

  it('a failed save keeps everything on screen, says so plainly, and a retry succeeds', async () => {
    fieldSessionsApi.get.mockResolvedValue(view());
    fieldSessionsApi.update.mockRejectedValueOnce({ status: 0, code: 'NETWORK_ERROR' });
    await mount();
    await typeStation('105');
    await advance(700);
    expect(q('session-save-state').dataset.state).toBe('error');
    expect(q('session-save-state').textContent).toContain('Не е запазено');
    expect(q('session-save-state').textContent).toContain('Няма връзка със сървъра');
    expect(q('station-field-point').value).toBe('105');
    expect(fieldSessionsApi.update).toHaveBeenCalledTimes(1); // no tight retry loop on a dead network

    await click(q('session-save-retry'));
    await flush();
    expect(fieldSessionsApi.update).toHaveBeenCalledTimes(2);
    expect(fieldSessionsApi.update.mock.calls[1][1].setups[0].station.point).toBe('105');
    expect(q('session-save-state').dataset.state).toBe('saved');
  });

  it('a revision conflict (another device saved first) stops saving and asks to reload - it never overwrites', async () => {
    fieldSessionsApi.get.mockResolvedValue(view());
    fieldSessionsApi.update.mockRejectedValueOnce({ status: 409, code: 'REVISION_CONFLICT' });
    await mount();
    await typeStation('105');
    await advance(700);
    expect(q('session-save-state').dataset.state).toBe('conflict');
    expect(q('session-save-state').textContent).toContain('друго устройство');
    await type(q('station-field-point'), '106');
    await advance(2000);
    expect(fieldSessionsApi.update).toHaveBeenCalledTimes(1); // blocked until the user reloads

    fieldSessionsApi.get.mockResolvedValueOnce(view({ revision: 9, setups: [rawSetup({ station: { point: '999', instrumentHeight: '', notes: '' } })] }));
    await click(q('session-save-reload'));
    await flush();
    expect(q('station-field-point').value).toBe('999');
    expect(q('session-save-state').dataset.state).toBe('saved');
  });

  it('metadata saves only the field that changed; the entries are not re-sent', async () => {
    fieldSessionsApi.get.mockResolvedValue(view());
    await mount();
    await type(q('meta-operator'), 'В. Желев');
    await advance(700);
    expect(fieldSessionsApi.update.mock.calls[0][1]).toEqual({ baseRevision: 3, operator: 'В. Желев' });
    await type(q('meta-notes'), 'слънчево');
    await advance(700);
    expect(fieldSessionsApi.update.mock.calls[1][1]).toEqual({ baseRevision: 4, notes: 'слънчево' });
  });

  it('the evaluation returned by a save is what the entry shows (highlighted on the field)', async () => {
    fieldSessionsApi.get.mockResolvedValue(view());
    fieldSessionsApi.update.mockResolvedValueOnce(view({ revision: 4, evaluation: { summary: { errors: 1, warnings: 0, observations: 1, setups: 1, canConfirm: false },
      issues: [{ severity: 'error', code: 'MALFORMED_ANGLE', message: 'Ъгълът не е разпознат като валидна стойност.', setup: 0, section: 'observation', row: 0, field: 'hz' }] } }));
    await mount();
    await typeStation('105');
    await advance(700);
    expect(q('obs-row').getAttribute('data-state')).toBe('invalid');
    expect(q('obs-row-issue').textContent).toContain('Ъгълът не е разпознат');
  });

  it('leaving the screen with unsaved edits still sends them (best effort)', async () => {
    fieldSessionsApi.get.mockResolvedValue(view());
    await mount();
    await typeStation('105');
    await act(async () => root.unmount());
    container.remove();
    expect(fieldSessionsApi.update).toHaveBeenCalledTimes(1);
    expect(fieldSessionsApi.update.mock.calls[0][1].setups[0].station.point).toBe('105');
    // remount so afterEach has something to unmount
    fieldSessionsApi.get.mockResolvedValue(view());
    await mount();
  });
});

describe('review and confirmation', () => {
  const withIssues = view({
    status: 'review', statusLabel: 'За проверка',
    evaluation: {
      summary: { setups: 1, observations: 2, errors: 1, warnings: 1, canConfirm: false },
      issues: [
        { severity: 'error', code: 'MALFORMED_ANGLE', message: 'Ъгълът не е разпознат като валидна стойност.', setup: 0, section: 'observation', row: 0, field: 'hz' },
        { severity: 'warning', code: 'STATION_NOT_FOUND', message: 'Станцията не е намерена сред точките на проекта.', setup: 0, section: 'station', field: 'point' },
      ],
    },
  });

  it('lists errors and warnings in plain words, with where each one is, and blocks confirmation', async () => {
    fieldSessionsApi.get.mockResolvedValue(withIssues);
    await mount();
    expect(q('review-errors').textContent).toContain('Станция 101 · наблюдение към 201 · Hz');
    expect(q('review-errors').textContent).toContain('Ъгълът не е разпознат');
    expect(q('review-warnings').textContent).toContain('Станцията не е намерена сред точките на проекта.');
    expect(q('session-confirm-start').disabled).toBe(true);
    expect(q('review-confirm-reason').textContent).toBe('Поправете грешките, за да потвърдите.');
    expect([...q('review-summary').children].map((c) => c.firstChild.textContent)).toEqual(['1', '2', '1', '1']);
  });

  it('"Към полето" opens the entry on exactly that observation', async () => {
    fieldSessionsApi.get.mockResolvedValue(withIssues);
    await mount();
    await click(q('review-issue-jump'));
    expect(q('session-entry')).toBeTruthy();
    expect(q('obs-field-target').value).toBe('201');
    expect(q('obs-add').textContent).toBe('Запази промените');
  });

  it('a clean review does not claim the data is correct', async () => {
    fieldSessionsApi.get.mockResolvedValue(view({ status: 'review' }));
    await mount();
    expect(q('review-clean').textContent).toContain('не означава, че измерванията са точни');
    expect(q('review-clean').textContent).not.toMatch(/всичко е наред|няма проблеми/i);
    expect(q('session-confirm-start').disabled).toBe(false);
  });

  it('confirm is a deliberate two-step: nothing is sent until the dialog is accepted, and warnings are repeated there', async () => {
    fieldSessionsApi.get.mockResolvedValue(view({ status: 'review', evaluation: { summary: { setups: 1, observations: 1, errors: 0, warnings: 1, canConfirm: true }, issues: [{ severity: 'warning', code: 'MISSING_ORIENTATION', message: 'Няма зададена ориентация.', setup: 0, section: 'station', field: 'orientation' }] } }));
    await mount();
    await click(q('session-confirm-start'));
    expect(fieldSessionsApi.confirm).not.toHaveBeenCalled();
    expect(q('session-confirm-dialog').textContent).toContain('Ще бъдат записани 1 наблюдения от 1 станции');
    expect(q('session-confirm-dialog').textContent).toContain('не могат да се променят');
    expect(q('session-confirm-warnings').textContent).toContain('1 предупреждения остават неразрешени');

    fieldSessionsApi.confirm.mockResolvedValue({ data: confirmedView(), alreadyConfirmed: false });
    await click(q('session-confirm-go'));
    await flush();
    expect(fieldSessionsApi.confirm).toHaveBeenCalledWith('s1');
    expect(q('session-status').textContent).toBe('✓ Потвърдена');
    expect(q('session-overview')).toBeTruthy();
    expect(q('overview-process')).toBeTruthy(); // the natural next step is offered
  });

  it('cancelling the dialog sends nothing', async () => {
    fieldSessionsApi.get.mockResolvedValue(view({ status: 'review' }));
    await mount();
    await click(q('session-confirm-start'));
    await click([...q('session-confirm-dialog').querySelectorAll('button')].find((b) => b.textContent === 'Отказ'));
    expect(q('session-confirm-dialog')).toBeNull();
    expect(fieldSessionsApi.confirm).not.toHaveBeenCalled();
  });

  it('cannot confirm while changes are still unsaved, and the stale evaluation says so', async () => {
    jest.useFakeTimers();
    fieldSessionsApi.get.mockResolvedValue(view({ status: 'review' }));
    await mount();
    await section('entry');
    await type(q('station-field-point'), '105');
    await section('review');
    expect(q('session-confirm-start').disabled).toBe(true);
    expect(q('review-stale')).toBeTruthy();
    expect(q('review-confirm-reason').textContent).toBe('Изчакайте запазването на промените.');
    await advance(700);
    expect(q('session-confirm-start').disabled).toBe(false);
  });

  it('the server may still refuse (422): the message is shown and the review is refreshed', async () => {
    fieldSessionsApi.get.mockResolvedValue(view({ status: 'review' }));
    await mount();
    await click(q('session-confirm-start'));
    fieldSessionsApi.confirm.mockRejectedValue({ status: 422, code: 'VALIDATION_ERRORS', message: 'В сесията има грешки, които трябва да се поправят преди потвърждаване.' });
    fieldSessionsApi.get.mockResolvedValue(withIssues);
    await click(q('session-confirm-go'));
    await flush();
    expect(q('session-review-error').textContent).toBe('В сесията има грешки, които трябва да се поправят преди потвърждаване.');
    expect(q('review-errors')).toBeTruthy(); // refreshed from the server
  });

  it('"За проверка" is a state the user sets deliberately, then the review opens', async () => {
    fieldSessionsApi.get.mockResolvedValue(view());
    await mount({ initialSection: 'review' });
    fieldSessionsApi.submit.mockResolvedValue(view({ status: 'review', statusLabel: 'За проверка', revision: 5 }));
    await click(q('session-submit'));
    await flush();
    expect(fieldSessionsApi.submit).toHaveBeenCalledWith('s1');
    expect(q('session-status').textContent).toBe('! За проверка');
    expect(q('session-submit')).toBeNull(); // already in review
  });

  it('deleting a draft is a two-step action and returns to the list', async () => {
    fieldSessionsApi.get.mockResolvedValue(view());
    await mount({ initialSection: 'review' });
    await click(q('session-delete'));
    expect(fieldSessionsApi.remove).not.toHaveBeenCalled();
    fieldSessionsApi.remove.mockResolvedValue(true);
    await click(q('session-delete-go'));
    await flush();
    expect(fieldSessionsApi.remove).toHaveBeenCalledWith('s1');
    expect(onBack).toHaveBeenCalled();
  });
});

describe('a confirmed session is immutable evidence', () => {
  it('shows the confirmed observations read-only, with units, and disables every metadata field', async () => {
    fieldSessionsApi.get.mockResolvedValue(confirmedView());
    await mount();
    expect(q('meta-operator').disabled).toBe(true);
    expect(q('meta-notes').disabled).toBe(true);
    expect(q('session-save-state')).toBeNull(); // nothing to save
    await section('entry');
    expect(q('session-evidence')).toBeTruthy();
    expect(q('session-evidence-row').textContent).toContain('Hz 10 gon');
    expect(q('session-evidence-row').textContent).toContain('S 50 m');
    expect(container.querySelectorAll('input[type="text"]')).toHaveLength(0);
    expect(q('session-add-station')).toBeNull();
    expect(fieldSessionsApi.update).not.toHaveBeenCalled();
  });

  it('the review offers a revision (a NEW session) instead of any edit, and no delete', async () => {
    fieldSessionsApi.get.mockResolvedValue(confirmedView());
    await mount({ initialSection: 'review' });
    expect(q('session-confirmed-note').textContent).toContain('не могат да се променят');
    expect(q('session-confirm-start')).toBeNull();
    expect(q('session-delete')).toBeNull();
    fieldSessionsApi.revise.mockResolvedValue(view({ id: 's2', title: 'Теренна сесия — 09.10.2026 (ревизия)', revisionOf: 's1' }));
    await click(q('session-revise'));
    await flush();
    expect(fieldSessionsApi.revise).toHaveBeenCalledWith('s1');
    expect(onOpen).toHaveBeenCalledWith('s2', 'entry');
  });

  it('a revision shows where it came from and a confirmed original says it has one', async () => {
    fieldSessionsApi.get.mockResolvedValue(view({ revisionOf: 's0' }));
    await mount();
    await click(q('session-open-original'));
    expect(onOpen).toHaveBeenCalledWith('s0');
    await act(async () => root.unmount());
    container.remove();
    fieldSessionsApi.get.mockResolvedValue(confirmedView({ hasRevision: true }));
    await mount();
    expect(q('session-has-revision')).toBeTruthy();
  });

  it('the lifecycle shows where the session is: Чернова -> За проверка -> Потвърдена -> Обработена', async () => {
    fieldSessionsApi.get.mockResolvedValue(confirmedView({ status: 'processed', statusLabel: 'Обработена', processing: { runCount: 1, pointCount: 3, reportCount: 1 } }));
    await mount();
    const steps = [...q('session-lifecycle').querySelectorAll('li')];
    expect(steps.map((s) => s.textContent)).toEqual(['✓ Чернова', '✓ За проверка', '✓ Потвърдена', 'Обработена']);
    expect(steps[3].getAttribute('aria-current')).toBe('step');
    expect([...q('session-progress').children].map((c) => c.textContent)).toEqual(['1Станции', '1Наблюдения', '0За проверка', '1Обработки', '3Създадени точки', '1Отчети']);
  });
});

describe('processing: only what the confirmed data supports', () => {
  it('is locked until the session is confirmed', async () => {
    fieldSessionsApi.get.mockResolvedValue(view());
    await mount({ initialSection: 'processing' });
    expect(q('session-processing-locked').textContent).toContain('след като сесията бъде потвърдена');
    expect(q('mock-workflow')).toBeNull();
  });

  it('polar only: the workflow is given exactly that mode and the session\'s observation set', async () => {
    fieldSessionsApi.get.mockResolvedValue(confirmedView());
    await mount({ initialSection: 'processing' });
    expect(q('mock-workflow').dataset.modes).toBe('polar');
    expect(q('mock-workflow').dataset.set).toBe('fos1');
    expect(q('mock-workflow').dataset.suggest).toBe('null');
  });

  it('polar + traverse: both are offered, with the inferred chain as editable suggestions', async () => {
    fieldSessionsApi.get.mockResolvedValue(confirmedView({
      processingOptions: { polar: { available: true }, traverse: { available: true, suggestedStart: '101', chain: ['101', '102'], endCandidates: ['103'], closesOnStart: false } },
    }));
    await mount({ initialSection: 'processing' });
    expect(q('mock-workflow').dataset.modes).toBe('polar,traverse');
    expect(JSON.parse(q('mock-workflow').dataset.suggest)).toEqual({ suggestedStart: '101', chain: ['101', '102'], endCandidates: ['103'], closesOnStart: false });
  });

  it('nothing processable: no workflow, a plain-language reason', async () => {
    fieldSessionsApi.get.mockResolvedValue(confirmedView({ processingOptions: { polar: { available: false, reason: 'NO_OBSERVATIONS' }, traverse: { available: false, reason: 'NEEDS_TWO_STATIONS' } } }));
    await mount({ initialSection: 'processing' });
    expect(q('mock-workflow')).toBeNull();
    expect(q('session-processing-none').textContent).toBe('В сесията няма наблюдения за обработка.');
  });

  it('lists the runs made from the session and refreshes them on demand', async () => {
    const withRun = confirmedView({ status: 'processed', processing: { runCount: 1, pointCount: 3, reportCount: 0 }, runs: [{ id: 'r1', processingType: 'traverse', createdAt: '2026-10-09T10:00:00Z', pointCount: 3, traverseType: 'KNOWN_ENDPOINT', status: 'READY', start: '101', end: '103' }] });
    fieldSessionsApi.get.mockResolvedValue(confirmedView());
    await mount({ initialSection: 'processing' });
    expect(q('session-runs-empty')).toBeTruthy();
    fieldSessionsApi.get.mockResolvedValue(withRun);
    await click(q('session-runs-refresh'));
    await flush();
    expect(q('session-run').textContent).toContain('Полигонов ход 101 → 103');
    expect(q('session-run').textContent).toContain('3 точки');
    expect(q('session-run-link').getAttribute('href')).toBe('/project?projectId=proj1&tab=processing');
    expect(q('session-status').textContent).toBe('✓✓ Обработена');
  });
});

describe('documents', () => {
  const processed = () => confirmedView({
    status: 'processed', processing: { runCount: 2, pointCount: 3, reportCount: 1 },
    runs: [{ id: 'r2', processingType: 'traverse', createdAt: '2026-10-09T11:00:00Z', pointCount: 1, start: '101', end: '103' }, { id: 'r1', processingType: 'polar', createdAt: '2026-10-09T10:00:00Z', pointCount: 3 }],
    reports: [{ id: 'rep1', title: 'Отчет за полярна обработка', reportType: 'POLAR_PROCESSING_REPORT', generatedAt: '2026-10-09T10:30:00Z' }],
  });

  it('is locked until confirmed', async () => {
    fieldSessionsApi.get.mockResolvedValue(view());
    await mount({ initialSection: 'documents' });
    expect(q('session-documents-locked')).toBeTruthy();
  });

  it('lists the session\'s reports and generates one per run with the right type and source', async () => {
    fieldSessionsApi.get.mockResolvedValue(processed());
    await mount({ initialSection: 'documents' });
    expect(q('session-report').textContent).toContain('Отчет за полярна обработка');
    expect(q('session-documents-link').getAttribute('href')).toBe('/project?projectId=proj1&tab=documents');

    reportsApi.createReport.mockResolvedValue({ id: 'rep2' });
    fieldSessionsApi.get.mockResolvedValue({ ...processed(), reports: [...processed().reports, { id: 'rep2', title: 'Отчет за обработка на полигонов ход', reportType: 'TRAVERSE_PROCESSING_REPORT', generatedAt: '2026-10-09T12:00:00Z' }] });
    await click(qa('session-report-generate')[0]);
    await flush();
    expect(reportsApi.createReport).toHaveBeenCalledWith({ reportType: 'TRAVERSE_PROCESSING_REPORT', projectId: 'proj1', sourceId: 'r2' });
    expect(qa('session-report')).toHaveLength(2);

    await click(qa('session-report-generate')[1]);
    await flush();
    expect(reportsApi.createReport).toHaveBeenLastCalledWith({ reportType: 'POLAR_PROCESSING_REPORT', projectId: 'proj1', sourceId: 'r1' });
  });

  it('a failed generation says so safely and keeps the list', async () => {
    fieldSessionsApi.get.mockResolvedValue(processed());
    await mount({ initialSection: 'documents' });
    reportsApi.createReport.mockRejectedValue(new Error('OpenAI 429 stack'));
    await click(qa('session-report-generate')[0]);
    await flush();
    expect(container.querySelector('[role="alert"]').textContent).toBe('Отчетът не можа да бъде генериран. Опитайте отново.');
    expect(qa('session-report')).toHaveLength(1);
  });

  it('nothing to report before processing', async () => {
    fieldSessionsApi.get.mockResolvedValue(confirmedView());
    await mount({ initialSection: 'documents' });
    expect(q('session-documents-no-runs').textContent).toBe('Първо обработете измерванията.');
  });
});

describe('a session fed by a field notebook photo', () => {
  const capture = (over = {}) => ({ attached: true, available: true, status: 'needs_review', mine: true, jobId: 'job1', rows: 8, review: 1, invalid: 2, ...over });
  const photoSession = (over = {}) => view({ source: 'capture', sourceLabel: 'От снимка на полеви карнет', setups: [], setupCount: 2, observationCount: 8, evaluation: null, capture: capture(), ...over });

  it('the review mirrors the capture and sends the user to the existing capture review, coming back to this session', async () => {
    fieldSessionsApi.get.mockResolvedValue(photoSession());
    await mount();
    expect(q('session-capture-card').textContent).toContain('2 станции · 8 наблюдения');
    expect(q('session-capture-card').textContent).toContain('✕ 2 невалидни');
    expect(q('session-capture-card').textContent).toContain('! 1 за проверка');
    expect(q('session-continue-capture').getAttribute('href')).toBe('/capture?projectId=proj1&jobId=job1&sessionId=s1');
    expect(q('session-confirm-start')).toBeNull(); // confirmation happens in the capture review
    expect(container.querySelectorAll('input[type="text"]')).toHaveLength(0);
  });

  it('the entry section explains where the observations are checked instead of showing a second editor', async () => {
    fieldSessionsApi.get.mockResolvedValue(photoSession());
    await mount();
    await section('entry');
    expect(q('session-entry-capture').textContent).toContain('снимка на полеви карнет');
    expect(q('session-entry')).toBeNull();
  });

  it('another project member sees the state but gets no link into the uploader\'s private review', async () => {
    fieldSessionsApi.get.mockResolvedValue(photoSession({ capture: capture({ mine: false }) }));
    await mount();
    expect(q('session-continue-capture')).toBeNull();
    expect(q('session-capture-not-mine')).toBeTruthy();
  });

  it('a capture that is gone is reported plainly, with the way out', async () => {
    fieldSessionsApi.get.mockResolvedValue(photoSession({ capture: capture({ available: false, status: null }) }));
    await mount();
    expect(q('session-capture-unavailable')).toBeTruthy();
    expect(q('session-continue-capture')).toBeNull();
    expect(q('session-delete')).toBeTruthy();
  });

  it('after the capture review confirms, switching sections picks the confirmed state up', async () => {
    fieldSessionsApi.get.mockResolvedValue(photoSession());
    await mount();
    fieldSessionsApi.get.mockResolvedValue(confirmedView({ source: 'capture', capture: capture({ status: 'confirmed' }) }));
    await section('processing');
    await flush();
    expect(q('session-status').textContent).toBe('✓ Потвърдена');
    expect(q('mock-workflow')).toBeTruthy();
  });

  it('an empty manual session also offers "add from a photo" through the capture page, tied to this session', async () => {
    fieldSessionsApi.get.mockResolvedValue(view({ setups: [], setupCount: 0, observationCount: 0 }));
    await mount();
    expect(q('session-add-photo').getAttribute('href')).toBe('/capture?projectId=proj1&mode=field-notebook&sessionId=s1');
  });
});
