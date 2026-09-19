import { applySelection, applyFieldChange, toPointReferences } from '../pointReferenceTracking';

const P101 = { _id: 'p101', y: 100, x: 200 };

describe('pointReferenceTracking (Milestone 1 §5/§11)', () => {
  it('records a selection and serializes it as a pointReferences entry', () => {
    let state = {};
    state = applySelection(state, 'station', P101, { y1: '100', x1: '200' });
    expect(toPointReferences(state)).toEqual([{ pointId: 'p101', role: 'station' }]);
  });

  it('retains the reference when the field is left untouched', () => {
    let state = applySelection({}, 'station', P101, { y1: '100', x1: '200' });
    // A change to some OTHER field must not affect this role's reference.
    state = applyFieldChange(state, 'alpha', '50');
    expect(toPointReferences(state)).toEqual([{ pointId: 'p101', role: 'station' }]);
  });

  it('clears the reference the moment a point-derived field is manually edited', () => {
    let state = applySelection({}, 'station', P101, { y1: '100', x1: '200' });
    state = applyFieldChange(state, 'x1', '999'); // user hand-edits X1 after picking P101
    expect(toPointReferences(state)).toEqual([]);
  });

  it('treats even a pure reformat of the same numeric value as a manual edit', () => {
    let state = applySelection({}, 'station', P101, { y1: '100', x1: '200' });
    state = applyFieldChange(state, 'x1', '200.0'); // same value, different string
    expect(toPointReferences(state)).toEqual([]);
  });

  it('tracks multiple roles independently — editing one does not clear the other', () => {
    let state = applySelection({}, 'pointA', { _id: 'pA', y: 1, x: 1 }, { yA: '1', xA: '1' });
    state = applySelection(state, 'pointB', { _id: 'pB', y: 2, x: 2 }, { yB: '2', xB: '2' });

    state = applyFieldChange(state, 'xA', '999'); // only pointA's field changes

    const refs = toPointReferences(state);
    expect(refs).toHaveLength(1);
    expect(refs[0]).toEqual({ pointId: 'pB', role: 'pointB' });
  });

  it('a fresh selection for the same role replaces the previous one', () => {
    let state = applySelection({}, 'station', P101, { y1: '100', x1: '200' });
    const P102 = { _id: 'p102', y: 500, x: 600 };
    state = applySelection(state, 'station', P102, { y1: '500', x1: '600' });
    expect(toPointReferences(state)).toEqual([{ pointId: 'p102', role: 'station' }]);
  });
});
