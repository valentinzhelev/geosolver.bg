import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { SurveyPointsProvider, POINTS_STALE_MS } from '../SurveyPointsContext';
import PointPicker from '../../components/tasks/PointPicker';
import { surveyPointsApi } from '../../services/surveyPointsApi';
import CalculationService from '../../services/calculationService';

// QA-05: the shared survey-points cache must show CURRENT project points without a browser refresh, must not fetch
// N times for N pickers, and must refresh after every point mutation. Real provider + real PointPicker + real API layer;
// only fetch is faked (an in-memory "database").

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

jest.mock('react-router-dom', () => ({ Link: ({ to, children, ...rest }) => <a href={to} {...rest}>{children}</a> }), { virtual: true });
// a STABLE user object (as the real AuthContext provides), otherwise hooks keyed on it would re-run every render
const mockAuth = { user: { _id: 'u1' } };
jest.mock('../../components/auth/AuthContext', () => ({ useAuth: () => mockAuth }));
jest.mock('../ProjectContext', () => ({ useProjectContext: () => ({ currentProject: { _id: 'proj1' } }) }));

let db;
let seq;
let gets;
let getGate; // optional promise a GET waits on (to simulate a slow request)
let getFailures; // number of upcoming GETs that fail

const ok = (body, status = 200) => ({ ok: true, status, json: async () => body });
const clone = (v) => JSON.parse(JSON.stringify(v));

beforeEach(() => {
  db = [];
  seq = 0;
  gets = 0;
  getGate = null;
  getFailures = 0;
  global.fetch = jest.fn(async (url, opts = {}) => {
    const u = String(url);
    const method = opts.method || 'GET';
    const body = opts.body ? JSON.parse(opts.body) : null;
    if (method === 'GET' && /\/points(\?|$)/.test(u)) {
      gets += 1;
      const snapshot = clone(db); // the response reflects the database AT REQUEST TIME (may become stale)
      if (getGate) await getGate;
      if (getFailures > 0) {
        getFailures -= 1;
        return { ok: false, status: 500, json: async () => ({ message: 'Server error' }) };
      }
      return ok({ success: true, data: snapshot });
    }
    if (method === 'POST' && /\/points\/import$/.test(u)) {
      body.points.forEach((p) => db.push({ _id: `p${++seq}`, ...p, projectId: body.projectId }));
      return ok({ success: true, count: body.points.length }, 201);
    }
    if (method === 'POST' && /\/points$/.test(u)) {
      const p = { _id: `p${++seq}`, ...body };
      db.push(p);
      return ok({ success: true, data: p }, 201);
    }
    if (method === 'PUT' && /\/points\/[^/]+$/.test(u)) {
      const id = u.split('/').pop();
      db = db.map((p) => (p._id === id ? { ...p, ...body } : p));
      return ok({ success: true });
    }
    if (method === 'DELETE' && /\/points\/[^/]+$/.test(u)) {
      const id = u.split('/').pop();
      db = db.filter((p) => p._id !== id);
      return ok({ success: true });
    }
    if (method === 'POST' && /\/calculations\/[^/]+\/create-point$/.test(u)) {
      const p = { _id: `p${++seq}`, name: body.name, x: 4700200, y: 500200, projectId: 'proj1' };
      db.push(p);
      return ok({ success: true, data: p }, 201);
    }
    throw new Error(`unexpected request ${method} ${u}`);
  });
});

let root;
let container;
afterEach(async () => {
  if (root) await act(async () => root.unmount());
  root = null;
  if (container) container.remove();
  jest.restoreAllMocks();
});

const flush = () => act(async () => { await new Promise((r) => setTimeout(r, 0)); });

async function mount(pickerCount = 1, onSelect = () => {}) {
  container = document.createElement('div');
  document.body.appendChild(container);
  let setCount;
  function App() {
    const [n, setN] = React.useState(pickerCount);
    setCount = setN;
    return (
      <SurveyPointsProvider>
        {Array.from({ length: n }, (_, i) => <PointPicker key={i} language="bg" label={`Точка ${i + 1}`} onSelect={onSelect} />)}
      </SurveyPointsProvider>
    );
  }
  root = createRoot(container);
  await act(async () => root.render(<App />));
  await flush();
  return { setPickerCount: (n) => act(async () => { setCount(n); }) };
}

const optionTexts = () => [...container.querySelectorAll('select option')].map((o) => o.textContent);
const A = { name: 'A', x: 4700000, y: 500000, projectId: 'proj1' };
const create = (p) => act(async () => { await surveyPointsApi.create(p); });

describe('the exact QA scenario: points created after the cache was loaded', () => {
  it('provider loads ZERO points, point A is created afterwards, the SAME mounted picker shows it (no reload)', async () => {
    await mount(1);
    expect(container.textContent).toContain('В този проект няма точки.');
    expect(gets).toBe(1);

    await create(A);
    await flush();
    expect(optionTexts().some((t) => t.startsWith('A (Y=500000.00, X=4700000.00)'))).toBe(true);
    expect(container.textContent).not.toContain('няма точки');
    expect(gets).toBe(2); // one refresh, not a burst
  });

  it('selecting the point hands the full SurveyPoint (id, x, y) to the calculator', async () => {
    const picked = jest.fn();
    await mount(1, picked);
    await create(A);
    await flush();
    const select = container.querySelector('select');
    await act(async () => {
      select.value = db[0]._id;
      select.dispatchEvent(new Event('change', { bubbles: true }));
    });
    expect(picked).toHaveBeenCalledTimes(1);
    expect(picked.mock.calls[0][0]).toMatchObject({ _id: db[0]._id, x: 4700000, y: 500000 });
  });
});

describe('every point mutation refreshes the shared cache', () => {
  it('create, edit (rename), delete and import are all reflected without a reload', async () => {
    await mount(1);
    await create(A);
    await flush();
    const id = db[0]._id;

    await act(async () => { await surveyPointsApi.update(id, { name: 'A2' }); });
    await flush();
    expect(optionTexts().some((t) => t.startsWith('A2 '))).toBe(true);

    await act(async () => { await surveyPointsApi.importMany({ points: [{ name: 'B', x: 4700100, y: 500000 }, { name: 'C', x: 4700000, y: 500100 }], projectId: 'proj1' }); });
    await flush();
    expect(optionTexts().filter((t) => /^(B|C) \(/.test(t))).toHaveLength(2);

    await act(async () => { await surveyPointsApi.remove(id); });
    await flush();
    expect(optionTexts().some((t) => t.startsWith('A2 '))).toBe(false);
    expect(optionTexts().filter((t) => /^(B|C) \(/.test(t))).toHaveLength(2);
  });

  it('Save Calculation as Point refreshes the cache before the next picker use', async () => {
    await mount(1);
    expect(container.textContent).toContain('В този проект няма точки.');
    let result;
    await act(async () => { result = await CalculationService.createPointFromCalculation('calc1', { name: 'P' }); });
    await flush();
    expect(result.status).toBe(201);
    expect(optionTexts().some((t) => t.startsWith('P ('))).toBe(true);
  });

  it('a mutation that fails does not refresh anything', async () => {
    await mount(1);
    global.fetch.mockImplementationOnce(async () => ({ ok: false, status: 400, json: async () => ({ message: 'bad' }) }));
    await act(async () => { await surveyPointsApi.create({}).catch(() => {}); });
    await flush();
    expect(gets).toBe(1);
  });
});

describe('request deduplication (no N× fetch burst)', () => {
  it('three pickers on one calculator cause exactly ONE request, and one mutation causes exactly ONE refresh', async () => {
    await mount(3);
    expect(container.textContent.split('В този проект няма точки.').length - 1).toBe(3); // three pickers, all in the empty state
    expect(gets).toBe(1);
    await create(A);
    await flush();
    expect(gets).toBe(2);
    expect(container.querySelectorAll('select')).toHaveLength(3);
  });

  it('a burst of concurrent mutations coalesces (at most one follow-up) and the final state is complete', async () => {
    await mount(3);
    await act(async () => {
      await Promise.all([1, 2, 3].map((i) => surveyPointsApi.create({ ...A, name: `P${i}`, x: 4700000 + i })));
    });
    await flush();
    expect(gets).toBeLessThanOrEqual(3); // 1 initial + at most 2 (in-flight + one follow-up)
    expect(optionTexts().filter((t) => /^P[123] \(/.test(t))).toHaveLength(9); // 3 points x 3 pickers
  });

  it('a mutation while a request is in flight is not lost (the stale response is followed by one fresh fetch)', async () => {
    let release;
    getGate = new Promise((r) => { release = r; });
    await mount(1); // the initial GET is now pending
    await create(A); // mutation lands while it is in flight
    getGate = null;
    await act(async () => { release(); });
    await flush();
    expect(optionTexts().some((t) => t.startsWith('A ('))).toBe(true);
    expect(gets).toBe(2);
  });
});

describe('fallback for stale caches (no polling)', () => {
  it('a picker that mounts after the cache went stale refreshes it once; a fresh cache is not refetched', async () => {
    const t0 = Date.now();
    const now = jest.spyOn(Date, 'now').mockReturnValue(t0);
    const ui = await mount(1);
    expect(gets).toBe(1);

    db.push({ _id: 'external', name: 'FromElsewhere', x: 1, y: 2, projectId: 'proj1' }); // changed outside this tab

    await ui.setPickerCount(2); // still fresh: no fetch
    await flush();
    expect(gets).toBe(1);

    now.mockReturnValue(t0 + POINTS_STALE_MS + 1000);
    await ui.setPickerCount(3); // stale: exactly one refresh
    await flush();
    expect(gets).toBe(2);
    expect(optionTexts().some((t) => t.startsWith('FromElsewhere'))).toBe(true);
  });

  it('no timers: nothing refetches by itself', async () => {
    await mount(1); // (real timers while mounting)
    const before = gets;
    jest.useFakeTimers();
    await act(async () => { jest.advanceTimersByTime(10 * 60 * 1000); });
    jest.useRealTimers();
    expect(gets).toBe(before);
  });
});

describe('loading / empty / error states of the picker', () => {
  it('LOADING: a visible, disabled picker (not a vanished control)', async () => {
    let release;
    getGate = new Promise((r) => { release = r; });
    await mount(1);
    const select = container.querySelector('select');
    expect(select).not.toBeNull();
    expect(select.disabled).toBe(true);
    expect(container.textContent).toContain('Зареждане на точки...');
    await act(async () => { release(); });
    await flush();
  });

  it('EMPTY project: "В този проект няма точки." with an [Добави точки] action to this project\'s Points Library', async () => {
    await mount(1);
    expect(container.textContent).toContain('В този проект няма точки.');
    const link = container.querySelector('a');
    expect(link.textContent).toBe('Добави точки');
    expect(link.getAttribute('href')).toBe('/points?projectId=proj1');
    expect(container.querySelector('select')).toBeNull();
  });

  it('with points: the normal picker (enabled, options for the project points only)', async () => {
    db.push({ ...A, _id: 'a' }, { name: 'Other', x: 1, y: 2, projectId: 'another-project', _id: 'o' });
    await mount(1);
    const select = container.querySelector('select');
    expect(select.disabled).toBe(false);
    expect(optionTexts().some((t) => t.startsWith('A ('))).toBe(true);
    expect(optionTexts().some((t) => t.startsWith('Other'))).toBe(false);
  });

  it('ERROR: a clear message and a working "Опитай отново"', async () => {
    getFailures = 1;
    await mount(1);
    expect(container.querySelector('[role="alert"]').textContent).toContain('Точките не могат да бъдат заредени.');
    db.push({ ...A, _id: 'a' });
    await act(async () => { container.querySelector('[role="alert"] button').click(); });
    await flush();
    expect(optionTexts().some((t) => t.startsWith('A ('))).toBe(true);
  });
});
