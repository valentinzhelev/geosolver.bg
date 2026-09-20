import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { usePointReferences } from '../usePointReferences';

// QA-05: provenance semantics are UNCHANGED. Real usePointReferences hook driven exactly like the calculators drive it:
// PointPicker.onSelect -> fields + recordSelection ; handleChange -> noteFieldChange ; save -> getPointReferences.

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const A = { _id: 'pointA-id', name: 'A', x: 4700000, y: 500000 };
const B = { _id: 'pointB-id', name: 'B', x: 4700100, y: 500000 };

let api;
let root;
let container;
function Harness() {
  api = usePointReferences();
  return null;
}
beforeEach(async () => {
  container = document.createElement('div');
  root = createRoot(container);
  await act(async () => root.render(<Harness />));
});
afterEach(async () => {
  await act(async () => root.unmount());
});

// what every calculator's PointPicker.onSelect does (Forward: pointA -> yA/xA)
const pick = (role, yf, xf, point) => {
  const fields = { [yf]: String(point.y), [xf]: String(point.x) };
  act(() => api.recordSelection(role, point, fields));
  return fields;
};

describe('selecting a library point establishes provenance', () => {
  it('coordinate fields receive A.y / A.x and the reference carries the correct pointId + role', () => {
    const fields = pick('pointA', 'yA', 'xA', A);
    expect(fields).toEqual({ yA: '500000', xA: '4700000' });
    expect(api.getPointReferences()).toEqual([{ pointId: 'pointA-id', role: 'pointA' }]);
  });

  it('several roles keep their own references (Resection A, B, C)', () => {
    pick('pointA', 'yA', 'xA', A);
    pick('pointB', 'yB', 'xB', B);
    expect(api.getPointReferences()).toEqual([
      { pointId: 'pointA-id', role: 'pointA' },
      { pointId: 'pointB-id', role: 'pointB' },
    ]);
  });

  it('the calculation payload the calculators send contains exactly these references', () => {
    pick('station', 'y1', 'x1', A);
    const payload = { toolName: 'first-basic-task', inputData: { y1: 500000, x1: 4700000 }, pointReferences: api.getPointReferences() };
    expect(payload.pointReferences).toEqual([{ pointId: 'pointA-id', role: 'station' }]);
  });
});

describe('manual edits clear the reference of that role only', () => {
  it('editing one referenced coordinate removes that role\'s reference', () => {
    pick('pointA', 'yA', 'xA', A);
    pick('pointB', 'yB', 'xB', B);
    act(() => api.noteFieldChange('xA', '4700001')); // hand-edit A's X
    expect(api.getPointReferences()).toEqual([{ pointId: 'pointB-id', role: 'pointB' }]);
  });

  it('an edit that leaves the value unchanged keeps the reference; an unrelated field never clears it', () => {
    pick('pointA', 'yA', 'xA', A);
    act(() => api.noteFieldChange('xA', '4700000'));
    act(() => api.noteFieldChange('beta1', '50'));
    expect(api.getPointReferences()).toEqual([{ pointId: 'pointA-id', role: 'pointA' }]);
  });

  it('re-picking after an edit re-establishes the reference; reset clears everything', () => {
    pick('pointA', 'yA', 'xA', A);
    act(() => api.noteFieldChange('yA', '1'));
    expect(api.getPointReferences()).toEqual([]);
    pick('pointA', 'yA', 'xA', A);
    expect(api.getPointReferences()).toHaveLength(1);
    act(() => api.resetPointReferences());
    expect(api.getPointReferences()).toEqual([]);
  });
});

describe('manual typing (no PointPicker) is unchanged', () => {
  it('no reference is recorded, so the calculation saves as before without provenance', () => {
    act(() => api.noteFieldChange('xA', '4700000'));
    act(() => api.noteFieldChange('yA', '500000'));
    expect(api.getPointReferences()).toEqual([]);
  });
});
