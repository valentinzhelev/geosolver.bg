import { useCallback, useRef, useState } from 'react';
import { applySelection, applyFieldChange, toPointReferences } from '../utils/pointReferenceTracking';

/**
 * Tracks which form fields were populated from a SurveyPoint selection, per
 * semantic role (e.g. "station", "pointA"), and clears a role's reference
 * the moment the user manually edits any field that pick set — a Calculation
 * must never claim values came from a SurveyPoint after they were hand-edited
 * (Milestone 1 §5). The actual state-transition rules live in
 * utils/pointReferenceTracking.js (framework-free, directly unit-tested);
 * this hook is just the React state wiring around them.
 *
 * Usage in a calculator component:
 *   const { recordSelection, noteFieldChange, getPointReferences, resetPointReferences } = usePointReferences();
 *
 *   // in the PointPicker's onSelect:
 *   onSelect={(p) => {
 *     const fields = { y1: String(p.y), x1: String(p.x) };
 *     setForm((f) => ({ ...f, ...fields }));
 *     recordSelection('station', p, fields);
 *   }}
 *
 *   // in the generic form-field change handler:
 *   const handleChange = (e) => {
 *     setForm((f) => ({ ...f, [e.target.id]: e.target.value }));
 *     noteFieldChange(e.target.id, e.target.value);
 *   };
 *
 *   // when saving:
 *   pointReferences: getPointReferences()
 *
 *   // on form reset:
 *   resetPointReferences();
 */
export function usePointReferences() {
  const [refsByRole, setRefsByRole] = useState({});
  // Kept alongside state so noteFieldChange can read the latest value
  // synchronously without waiting on a re-render.
  const refsRef = useRef(refsByRole);
  refsRef.current = refsByRole;

  const recordSelection = useCallback((role, point, fields) => {
    setRefsByRole((prev) => applySelection(prev, role, point, fields));
  }, []);

  const noteFieldChange = useCallback((fieldId, newValue) => {
    const next = applyFieldChange(refsRef.current, fieldId, newValue);
    if (next !== refsRef.current) setRefsByRole(next);
  }, []);

  const getPointReferences = useCallback(() => toPointReferences(refsRef.current), []);

  const resetPointReferences = useCallback(() => setRefsByRole({}), []);

  return { recordSelection, noteFieldChange, getPointReferences, resetPointReferences };
}
