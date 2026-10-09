import React, { act, useState } from 'react';
import { createRoot } from 'react-dom/client';
import SessionEntry from '../SessionEntry';
import { addObservation, addSetup, updateOrientation, updateStation } from '../../../../../utils/fieldSessionView';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

let container;
let root;
let latest; // the setups the harness currently holds
const oneStation = () => updateOrientation(updateStation(addSetup([]), 0, { point: '101', instrumentHeight: '1.52' }), 0, { target: '102', direction: '0' });

const Harness = ({ initial, evaluation = null, angleUnit = 'gon', selectRequest = null }) => {
  const [setups, setSetups] = useState(initial);
  latest = setups;
  return <SessionEntry setups={setups} editSetups={(u) => setSetups((p) => (typeof u === 'function' ? u(p) : u))} evaluation={evaluation} angleUnit={angleUnit} bg selectRequest={selectRequest} />;
};

async function mount(props) {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  await act(async () => root.render(<Harness {...props} />));
}
afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
});

const q = (id) => container.querySelector(`[data-testid="${id}"]`);
const qa = (id) => [...container.querySelectorAll(`[data-testid="${id}"]`)];
const click = (el) => act(async () => { el.click(); });
const type = (el, value) => act(async () => {
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
  setter.call(el, value);
  el.dispatchEvent(new Event('input', { bubbles: true }));
});
const fill = async (values) => { for (const [id, v] of Object.entries(values)) await type(q(`obs-field-${id}`), v); };

describe('empty session', () => {
  it('starts with one clear action, then shows the station card', async () => {
    await mount({ initial: [] });
    expect(q('session-add-first-station')).toBeTruthy();
    expect(q('session-station-card')).toBeNull();
    await click(q('session-add-first-station'));
    expect(latest).toHaveLength(1);
    expect(q('session-station-card')).toBeTruthy();
    expect(qa('session-station-tab')).toHaveLength(1);
  });
});

describe('mobile-first entry (not a spreadsheet)', () => {
  it('uses the numeric keypad for numbers, the full keyboard for names, and gon vs degrees decides the angle keypad', async () => {
    await mount({ initial: oneStation() });
    expect(q('station-field-instrumentHeight').inputMode).toBe('decimal');
    expect(q('station-field-orientationDirection').inputMode).toBe('decimal');
    for (const f of ['hz', 'vz', 'distance', 'prismHeight']) expect(q(`obs-field-${f}`).inputMode).toBe('decimal');
    expect(q('station-field-point').inputMode).toBe('');
    expect(q('obs-field-target').inputMode).toBe('');
    await act(async () => root.unmount());
    container.remove();
    await mount({ initial: oneStation(), angleUnit: 'deg' }); // degrees may be typed as 94°30'15" -> needs the full keyboard
    expect(q('obs-field-hz').inputMode).toBe('text');
    expect(q('station-field-instrumentHeight').inputMode).toBe('decimal');
  });

  it('every input has a visible label, no autocomplete/autocorrect noise, and a 16px+ comfortable touch target', async () => {
    await mount({ initial: oneStation() });
    for (const input of container.querySelectorAll('input[type="text"]')) {
      const label = container.querySelector(`label[for="${input.id}"]`);
      expect(label).toBeTruthy();
      expect(input.getAttribute('autocomplete')).toBe('off');
      expect(input.getAttribute('autocorrect')).toBe('off');
      expect(input.className).toMatch(/min-h-\[44px\]/);
      expect(input.className).toMatch(/text-base/); // 16px: iOS does not zoom the page on focus
    }
    for (const b of container.querySelectorAll('button')) expect(b.className).toMatch(/min-h-\[4[48]px\]|min-w-\[48px\]/);
  });

  it('is cards and a list, not a table, and the station chips scroll sideways instead of wrapping the page', async () => {
    await mount({ initial: oneStation() });
    expect(container.querySelector('table')).toBeNull();
    expect(container.querySelector('[role="tablist"]').className).toMatch(/overflow-x-auto/);
  });

  it('rarely used fields are tucked away so the common round needs minimal scrolling', async () => {
    await mount({ initial: oneStation() });
    expect(q('obs-field-horizontalDistance')).toBeNull();
    await click(q('obs-more-toggle'));
    expect(q('obs-field-horizontalDistance')).toBeTruthy();
    expect(q('obs-field-code')).toBeTruthy();
    expect(q('obs-more-toggle').getAttribute('aria-expanded')).toBe('true');
  });
});

describe('quick add keeps the station context', () => {
  it('adds an observation, clears the form, refocuses the target and keeps the occupied station', async () => {
    await mount({ initial: oneStation() });
    expect(q('obs-add').disabled).toBe(true); // nothing to add yet
    await fill({ target: '201', hz: '100.1234', vz: '99.5', distance: '50.123', prismHeight: '1.8' });
    expect(q('obs-add').disabled).toBe(false);
    await click(q('obs-add'));

    expect(latest[0].observations).toHaveLength(1);
    expect(latest[0].observations[0]).toMatchObject({ row: 0, target: '201', hz: '100.1234', vz: '99.5', distance: '50.123', prismHeight: '1.8' });
    expect(q('obs-field-target').value).toBe('');
    expect(q('obs-field-hz').value).toBe('');
    expect(document.activeElement).toBe(q('obs-field-target'));
    // the station context never moved
    expect(q('station-field-point').value).toBe('101');
    expect(q('station-field-instrumentHeight').value).toBe('1.52');
    expect(qa('obs-row')).toHaveLength(1);
    expect(qa('obs-row')[0].textContent).toContain('201');
  });

  it('Enter in the last field adds the observation (hands stay on the keypad)', async () => {
    await mount({ initial: oneStation() });
    await fill({ target: '202', hz: '10', distance: '20' });
    await act(async () => { q('obs-field-prismHeight').dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })); });
    expect(latest[0].observations.map((o) => o.target)).toEqual(['202']);
  });

  it('can keep the prism height for the next observation, but never does so silently', async () => {
    await mount({ initial: oneStation() });
    await fill({ target: '201', hz: '1', distance: '5', prismHeight: '1.8' });
    await click(q('obs-add'));
    expect(q('obs-field-prismHeight').value).toBe(''); // default: nothing is carried over
    await click(q('obs-keep-prism'));
    await fill({ target: '202', hz: '2', distance: '6', prismHeight: '1.6' });
    await click(q('obs-add'));
    expect(q('obs-field-prismHeight').value).toBe('1.6'); // opted in, and visible in the field
  });

  it('a long round stays usable: 200 observations render and another can still be added', async () => {
    let s = oneStation();
    for (let i = 0; i < 200; i += 1) s = addObservation(s, 0, { target: String(1000 + i), hz: '10', distance: '10' });
    await mount({ initial: s });
    expect(qa('obs-row')).toHaveLength(200);
    await fill({ target: '9999', hz: '1', distance: '1' });
    await click(q('obs-add'));
    expect(qa('obs-row')).toHaveLength(201);
  });
});

describe('stations: switching, adding the next one, removing', () => {
  it('+ Станция starts the next station with the previous one as its backsight, and chips switch between them', async () => {
    await mount({ initial: oneStation() });
    await fill({ target: '201', hz: '1', distance: '5' });
    await click(q('obs-add'));
    await click(q('session-add-station'));

    expect(qa('session-station-tab')).toHaveLength(2);
    expect(latest[1].orientation.target).toBe('101');
    expect(q('station-field-orientationTarget').value).toBe('101');
    expect(q('station-field-point').value).toBe(''); // the new, still unnamed station is the occupied one
    await type(q('station-field-point'), '102');
    await fill({ target: '103', hz: '2', distance: '6' });
    await click(q('obs-add'));
    expect(latest[1].observations.map((o) => o.target)).toEqual(['103']);

    await click(qa('session-station-tab')[0]);
    expect(q('station-field-point').value).toBe('101');
    expect(qa('obs-row').map((r) => r.textContent)).toEqual([expect.stringContaining('201')]); // each station keeps its own list
    expect(qa('session-station-tab').map((t) => t.getAttribute('aria-selected'))).toEqual(['true', 'false']);
  });

  it('removing a station is a deliberate two-step action', async () => {
    await mount({ initial: [...oneStation(), ...updateStation(addSetup([]), 0, { point: 'x' })].map((s, i) => ({ ...s, index: i })) });
    expect(qa('session-station-tab')).toHaveLength(2);
    await click(q('session-remove-station'));
    expect(latest).toHaveLength(2); // nothing yet
    expect(q('session-remove-station-go')).toBeTruthy();
    await click(q('session-remove-station-go'));
    expect(latest).toHaveLength(1);
    expect(latest[0].station.point).toBe('x');
  });
});

describe('editing and deleting what was entered', () => {
  const withTwo = () => addObservation(addObservation(oneStation(), 0, { target: '201', hz: '1', distance: '5' }), 0, { target: '202', hz: '2', distance: '6' });

  it('tapping a row loads it, saving updates only that row, cancel leaves it alone', async () => {
    await mount({ initial: withTwo() });
    await click(qa('obs-row-open')[1]);
    expect(q('obs-field-target').value).toBe('202');
    expect(q('obs-add').textContent).toBe('Запази промените');
    await type(q('obs-field-hz'), '22.5');
    await click(q('obs-add'));
    expect(latest[0].observations.map((o) => [o.target, o.hz])).toEqual([['201', '1'], ['202', '22.5']]);
    expect(q('obs-add').textContent).toBe('Добави наблюдение');

    await click(qa('obs-row-open')[0]);
    await type(q('obs-field-hz'), '999');
    await click(q('obs-cancel-edit'));
    expect(latest[0].observations[0].hz).toBe('1');
  });

  it('delete removes exactly one row; its row id is never reused', async () => {
    await mount({ initial: withTwo() });
    await click(qa('obs-row-delete')[0]);
    expect(latest[0].observations.map((o) => o.target)).toEqual(['202']);
    await fill({ target: '203', hz: '3', distance: '7' });
    await click(q('obs-add'));
    expect(latest[0].observations.map((o) => o.row)).toEqual([1, 2]);
  });

  it('delete buttons have an accessible name that says which observation', async () => {
    await mount({ initial: withTwo() });
    expect(qa('obs-row-delete')[0].getAttribute('aria-label')).toBe('Изтрий наблюдение към 201');
  });
});

describe('issues from the server are shown on the exact field, with a symbol and a word', () => {
  const evaluation = {
    summary: {},
    issues: [
      { severity: 'error', code: 'MALFORMED_ANGLE', message: 'Ъгълът не е разпознат като валидна стойност.', setup: 0, section: 'observation', row: 0, field: 'hz' },
      { severity: 'warning', code: 'INCONSISTENT_ANGLE_UNIT', message: 'Ъгълът е в друга единица.', setup: 0, section: 'observation', row: 1, field: 'hz' },
      { severity: 'error', code: 'NEGATIVE_HEIGHT', message: 'Височината не може да бъде отрицателна.', setup: 0, section: 'station', field: 'instrumentHeight' },
      { severity: 'warning', code: 'MISSING_ORIENTATION', message: 'Няма зададена ориентация.', setup: 0, section: 'station', field: 'orientation' },
    ],
  };
  const data = () => addObservation(addObservation(oneStation(), 0, { target: '201', hz: 'abc', distance: '5' }), 0, { target: '202', hz: '94°', distance: '6' });

  it('station fields and rows are marked invalid / review', async () => {
    await mount({ initial: data(), evaluation });
    expect(q('station-field-instrumentHeight').getAttribute('data-state')).toBe('invalid');
    expect(q('station-field-instrumentHeight').getAttribute('aria-invalid')).toBe('true');
    expect(q('station-field-instrumentHeight-issue').textContent).toBe('✕ Височината не може да бъде отрицателна.');
    expect(q('station-orientation-warning').textContent).toBe('! Няма зададена ориентация.');
    expect(qa('obs-row').map((r) => r.getAttribute('data-state'))).toEqual(['invalid', 'review']);
    expect(qa('obs-row-issue').map((r) => r.textContent)).toEqual(['✕ Ъгълът не е разпознат като валидна стойност.', '! Ъгълът е в друга единица.']);
  });

  it('the issue of the row being edited appears on its field in the form', async () => {
    await mount({ initial: data(), evaluation });
    await click(qa('obs-row-open')[0]);
    expect(q('obs-field-hz').getAttribute('data-state')).toBe('invalid');
    expect(q('obs-field-hz-issue').textContent).toContain('Ъгълът не е разпознат');
    expect(q('obs-field-target').getAttribute('data-state')).toBe('ok');
  });

  it('"Към полето" from the review selects the station and loads the observation', async () => {
    const two = addObservation(addObservation(addObservation(oneStation(), 0, { target: '201' }), 0, { target: '202', hz: '5' }), 0, {});
    await mount({ initial: two, selectRequest: { setup: 0, row: 1, nonce: 1 } });
    expect(q('obs-field-target').value).toBe('202');
    expect(q('obs-field-hz').value).toBe('5');
  });
});
