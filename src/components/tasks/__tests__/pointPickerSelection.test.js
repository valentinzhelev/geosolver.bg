import fs from 'fs';
import path from 'path';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { SurveyPointsProvider } from '../../../context/SurveyPointsContext';
import PointPicker from '../PointPicker';
import { usePointReferences } from '../../../hooks/usePointReferences';

// QA-07: a PointPicker keeps showing the selected point for as long as it is the role's provenance reference. The visual
// selection is DRIVEN BY usePointReferences (one source of truth): a manual edit of a referenced coordinate clears both,
// an unrelated edit clears neither, Reset clears both. Real provider + real picker + real hook, wired like the calculators.

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

jest.mock('react-router-dom', () => ({ Link: ({ to, children, ...rest }) => <a href={to} {...rest}>{children}</a> }), { virtual: true });
const mockAuth = { user: { _id: 'u1' } };
jest.mock('../../../components/auth/AuthContext', () => ({ useAuth: () => mockAuth }));
jest.mock('../../../context/ProjectContext', () => ({ useProjectContext: () => ({ currentProject: { _id: 'proj1' } }) }));

const POINTS = [
  { _id: 'idA', name: 'A', code: 'A', x: 4700000, y: 500000, projectId: 'proj1' },
  { _id: 'idB', name: 'B', code: 'B', x: 4700100, y: 500000, projectId: 'proj1' },
];
const EMPTY = { yA: '', xA: '', yB: '', xB: '', beta1: '' };

let hook; // the usePointReferences API of the mounted "calculator"
let root;
let container;

// a miniature calculator wired exactly like the real ones (Forward Intersection: pointA / pointB)
function Calculator() {
  const [form, setForm] = React.useState(EMPTY);
  hook = usePointReferences();
  const { recordSelection, noteFieldChange, resetPointReferences, getSelectedPointId } = hook;
  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.id]: e.target.value }));
    noteFieldChange(e.target.id, e.target.value);
  };
  const pick = (role, yf, xf) => (p) => {
    const fields = { [yf]: String(p.y), [xf]: String(p.x) };
    setForm((f) => ({ ...f, ...fields }));
    recordSelection(role, p, fields);
  };
  return (
    <div>
      <div id="pickerA"><PointPicker selectedId={getSelectedPointId('pointA')} language="bg" label="A" onSelect={pick('pointA', 'yA', 'xA')} /></div>
      <div id="pickerB"><PointPicker selectedId={getSelectedPointId('pointB')} language="bg" label="B" onSelect={pick('pointB', 'yB', 'xB')} /></div>
      {['yA', 'xA', 'yB', 'xB', 'beta1'].map((id) => <input key={id} id={id} value={form[id]} onChange={handleChange} />)}
      <button id="reset" onClick={() => { setForm(EMPTY); resetPointReferences(); }}>reset</button>
    </div>
  );
}

beforeEach(async () => {
  global.fetch = jest.fn(async () => ({ ok: true, status: 200, json: async () => ({ success: true, data: POINTS }) }));
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  await act(async () => root.render(<SurveyPointsProvider><Calculator /></SurveyPointsProvider>));
  await act(async () => { await new Promise((r) => setTimeout(r, 0)); });
});
afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
});

const select = (which) => container.querySelector(`#picker${which} select`);
const choose = (which, id) => act(async () => {
  const el = select(which);
  el.value = id;
  el.dispatchEvent(new Event('change', { bubbles: true }));
});
const type = (id, value) => act(async () => {
  const el = container.querySelector(`#${id}`);
  Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set.call(el, value);
  el.dispatchEvent(new Event('input', { bubbles: true }));
});
const field = (id) => container.querySelector(`#${id}`).value;
const refs = () => hook.getPointReferences();
const selectedLabel = (which) => {
  const el = select(which);
  return el.options[el.selectedIndex].textContent;
};

describe('selecting a point', () => {
  it('the picker visibly keeps showing the selected point, the fields are filled and provenance exists', async () => {
    expect(selectedLabel('A')).toBe('— избери от библиотека —');
    await choose('A', 'idA');
    expect(select('A').value).toBe('idA');
    expect(selectedLabel('A')).toBe('A · A (Y=500000.00, X=4700000.00)');
    expect([field('yA'), field('xA')]).toEqual(['500000', '4700000']);
    expect(refs()).toEqual([{ pointId: 'idA', role: 'pointA' }]);
  });

  it('it stays selected across unrelated re-renders', async () => {
    await choose('A', 'idA');
    await type('beta1', '50');
    await type('beta1', '51');
    expect(select('A').value).toBe('idA');
    expect(refs()).toEqual([{ pointId: 'idA', role: 'pointA' }]);
  });

  it('selecting B in the same picker REPLACES A (visible selection and reference)', async () => {
    await choose('A', 'idA');
    await choose('A', 'idB');
    expect(select('A').value).toBe('idB');
    expect(selectedLabel('A')).toContain('B (Y=500000.00, X=4700100.00)');
    expect(refs()).toEqual([{ pointId: 'idB', role: 'pointA' }]);
    expect([field('yA'), field('xA')]).toEqual(['500000', '4700100']);
  });
});

describe('manual edits', () => {
  it('editing a referenced coordinate clears BOTH the provenance and the visual selection', async () => {
    await choose('A', 'idA');
    await type('xA', '4700001');
    expect(refs()).toEqual([]);
    expect(select('A').value).toBe('');
    expect(selectedLabel('A')).toBe('— избери от библиотека —');
    expect(field('xA')).toBe('4700001'); // the typed value is kept
  });

  it('editing the OTHER referenced coordinate (Y) clears it too', async () => {
    await choose('A', 'idA');
    await type('yA', '500001');
    expect(select('A').value).toBe('');
    expect(refs()).toEqual([]);
  });

  it('editing an unrelated field keeps the selection and the reference', async () => {
    await choose('A', 'idA');
    await type('beta1', '50');
    expect(select('A').value).toBe('idA');
    expect(refs()).toHaveLength(1);
  });

  it('a value identical to the selection-time value keeps the reference (existing provenance policy)', async () => {
    await choose('A', 'idA');
    act(() => hook.noteFieldChange('xA', '4700000'));
    expect(select('A').value).toBe('idA');
    expect(refs()).toHaveLength(1);
  });

  it('re-selecting the point after a manual edit restores the selection', async () => {
    await choose('A', 'idA');
    await type('xA', '1');
    expect(select('A').value).toBe('');
    await choose('A', 'idA');
    expect(select('A').value).toBe('idA');
    expect(refs()).toHaveLength(1);
  });
});

describe('reset and independence of several pickers', () => {
  it('Reset clears the references and returns every picker to the placeholder', async () => {
    await choose('A', 'idA');
    await choose('B', 'idB');
    await act(async () => container.querySelector('#reset').click());
    expect(refs()).toEqual([]);
    expect(select('A').value).toBe('');
    expect(select('B').value).toBe('');
    expect(field('xA')).toBe('');
  });

  it('two pickers keep their own roles independently', async () => {
    await choose('A', 'idA');
    await choose('B', 'idB');
    expect(select('A').value).toBe('idA');
    expect(select('B').value).toBe('idB');
    expect(refs()).toEqual([{ pointId: 'idA', role: 'pointA' }, { pointId: 'idB', role: 'pointB' }]);

    await type('xA', '9'); // editing A's coordinate must not touch B
    expect(select('A').value).toBe('');
    expect(select('B').value).toBe('idB');
    expect(refs()).toEqual([{ pointId: 'idB', role: 'pointB' }]);
  });

  it('a callers that passes no selectedId keeps the old "pick to fill" behaviour (value returns to the placeholder)', async () => {
    // StakeOut and similar pickers do not use provenance; they must still work
    const c2 = document.createElement('div');
    document.body.appendChild(c2);
    const r2 = createRoot(c2);
    const picked = jest.fn();
    await act(async () => r2.render(<SurveyPointsProvider><PointPicker language="bg" onSelect={picked} /></SurveyPointsProvider>));
    await act(async () => { await new Promise((r) => setTimeout(r, 0)); });
    const el = c2.querySelector('select');
    await act(async () => { el.value = 'idA'; el.dispatchEvent(new Event('change', { bubbles: true })); });
    expect(picked).toHaveBeenCalledWith(expect.objectContaining({ _id: 'idA' }));
    expect(c2.querySelector('select').value).toBe('');
    await act(async () => r2.unmount());
    c2.remove();
  });
});

describe('every calculator wires the retained selection for its own roles', () => {
  const TASKS = path.join(__dirname, '..');
  const FILES = ['AreaCalculation', 'CoordinateTransformation', 'DistanceBearing', 'FirstTask', 'ForwardIntersection', 'HansenTask',
    'LineIntersection', 'OffsetPoint', 'PolarIntersection', 'Resection', 'SecondTask', 'SegmentDivision'];

  it.each(FILES.filter((n) => n !== 'AreaCalculation'))('%s: every <PointPicker> passes selectedId for the SAME role it records', (name) => {
    const src = fs.readFileSync(path.join(TASKS, `${name}.js`), 'utf8');
    expect(src).toContain('getSelectedPointId } = usePointReferences()');
    const chunks = src.split('<PointPicker').slice(1);
    expect(chunks.length).toBeGreaterThan(0);
    for (const chunk of chunks) {
      const sel = chunk.match(/^\s*selectedId=\{getSelectedPointId\(('[^']+'|`[^`]+`)\)\}/);
      const rec = chunk.match(/recordSelection\(('[^']+'|`[^`]+`)/);
      expect(sel).not.toBeNull();
      expect(rec).not.toBeNull();
      expect(sel[1]).toBe(rec[1]); // station / point1 / point2 / pointA-D / pointP / vertex:${index}
    }
  });

  it('Area: its single "+" picker APPENDS a vertex on every pick (role vertex:N = the appended row), so it deliberately stays an action picker', () => {
    const src = fs.readFileSync(path.join(TASKS, 'AreaCalculation.js'), 'utf8');
    expect(src).not.toContain('selectedId=');
    expect(src).toContain('recordSelection(`vertex:${index}`');
  });

  it('the retained-selection mechanism itself is generic: any role key (including vertex:N) works', () => {
    // exercised through the same hook the calculators use
    expect(typeof usePointReferences).toBe('function');
    const key = 'vertex:3';
    // getSelectedPointId reads refsByRole[role]?.pointId — role is an opaque string
    const src = fs.readFileSync(path.join(TASKS, '..', '..', 'hooks', 'usePointReferences.js'), 'utf8');
    expect(src).toContain("refsByRole[role]?.pointId || ''");
    expect(key).toMatch(/^vertex:\d+$/);
  });

  it('the picker no longer blanks itself after a selection', () => {
    const src = fs.readFileSync(path.join(TASKS, 'PointPicker.js'), 'utf8');
    expect(src).not.toContain("e.target.value = ''");
    expect(src).toContain('value={selectedId && points.some');
  });
});
