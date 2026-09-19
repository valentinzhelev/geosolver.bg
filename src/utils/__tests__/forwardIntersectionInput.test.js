import { buildForwardIntersectionInput, FORWARD_INTERSECTION_FIELDS } from '../forwardIntersectionInput';
import { applySelection, applyFieldChange, toPointReferences } from '../pointReferenceTracking';
import { calculateForwardIntersection } from '../../domain/geodesy';

// Exactly what ForwardIntersection.js's PointPicker handlers write into form state.
const pickA = { _id: 'pA', y: 200.5, x: 100.25 };
const pickB = { _id: 'pB', y: 310, x: 420.125 };

describe('Forward Intersection persisted input (Milestone 2.0 preflight)', () => {
  const stringForm = { yA: '200.5', xA: '100.25', yB: '310', xB: '420.125', beta1: '50', beta2: '60' };

  it('persists finite Numbers for every field (never the raw form strings)', () => {
    const input = buildForwardIntersectionInput(stringForm);
    expect(Object.keys(input).sort()).toEqual([...FORWARD_INTERSECTION_FIELDS].sort());
    for (const key of FORWARD_INTERSECTION_FIELDS) {
      expect(typeof input[key]).toBe('number');
      expect(Number.isFinite(input[key])).toBe(true);
    }
    expect(input).toEqual({ yA: 200.5, xA: 100.25, yB: 310, xB: 420.125, beta1: 50, beta2: 60 });
  });

  it('a PointPicker-filled project form yields backend-compatible inputData plus pointReferences', () => {
    let refs = {};
    const fieldsA = { yA: String(pickA.y), xA: String(pickA.x) };
    const fieldsB = { yB: String(pickB.y), xB: String(pickB.x) };
    refs = applySelection(refs, 'pointA', pickA, fieldsA);
    refs = applySelection(refs, 'pointB', pickB, fieldsB);

    const input = buildForwardIntersectionInput({ ...fieldsA, ...fieldsB, beta1: '50', beta2: '60' });
    // Backend toolPointRoles reads xA/yA (pointA) and xB/yB (pointB) as Numbers
    // and compares them to the SurveyPoint's x/y.
    expect(input.xA).toBe(pickA.x);
    expect(input.yA).toBe(pickA.y);
    expect(input.xB).toBe(pickB.x);
    expect(input.yB).toBe(pickB.y);
    expect(toPointReferences(refs)).toEqual([
      { pointId: 'pA', role: 'pointA' },
      { pointId: 'pB', role: 'pointB' },
    ]);
  });

  it('manual form use calculates exactly as before (same values reach the domain function)', () => {
    const input = buildForwardIntersectionInput(stringForm);
    const viaInput = calculateForwardIntersection(input.yA, input.xA, input.yB, input.xB, input.beta1, input.beta2);
    const viaLegacyNumberCalls = calculateForwardIntersection(
      Number(stringForm.yA), Number(stringForm.xA), Number(stringForm.yB), Number(stringForm.xB),
      Number(stringForm.beta1), Number(stringForm.beta2)
    );
    expect(viaInput).toEqual(viaLegacyNumberCalls);
    expect(Number.isFinite(viaInput.xP)).toBe(true);
  });

  it('a manual edit of a picked coordinate still clears only that role', () => {
    let refs = {};
    refs = applySelection(refs, 'pointA', pickA, { yA: String(pickA.y), xA: String(pickA.x) });
    refs = applySelection(refs, 'pointB', pickB, { yB: String(pickB.y), xB: String(pickB.x) });
    refs = applyFieldChange(refs, 'xA', '100.3'); // hand-edit a point-A-derived field
    expect(toPointReferences(refs)).toEqual([{ pointId: 'pB', role: 'pointB' }]);
    refs = applyFieldChange(refs, 'beta1', '55'); // non-derived field: no effect
    expect(toPointReferences(refs)).toEqual([{ pointId: 'pB', role: 'pointB' }]);
  });

  it('non-numeric form values are still NaN (the component still blocks these before calculating)', () => {
    const input = buildForwardIntersectionInput({ ...stringForm, beta1: '5o' });
    expect(Number.isNaN(input.beta1)).toBe(true);
  });
});
