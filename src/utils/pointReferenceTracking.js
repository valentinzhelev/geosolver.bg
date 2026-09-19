/**
 * Pure state-transition logic behind usePointReferences (Milestone 1 §5/§11).
 * Kept framework-free and separate from the hook so it can be unit-tested
 * the same way the rest of this repo's domain/utils logic is (no React
 * rendering needed) — see src/hooks/usePointReferences.js for the thin
 * React wrapper.
 *
 * State shape: { [role]: { pointId, fields: { [fieldId]: valueAtSelection } } }
 */

/** Records that `role` was filled by `point`, having set the given `fields`. */
export function applySelection(state, role, point, fields) {
  if (!role || !point || !fields) return state;
  return {
    ...state,
    [role]: { pointId: point._id, fields: { ...fields } },
  };
}

/**
 * A form field changed to `newValue`. Any role whose recorded fields include
 * this fieldId, and whose value at selection time no longer matches, loses
 * its reference — exact-string comparison, since any hand edit (even a pure
 * reformat of the same number) means the value is no longer purely
 * point-derived.
 */
export function applyFieldChange(state, fieldId, newValue) {
  let changed = false;
  const next = { ...state };
  for (const role of Object.keys(state)) {
    const ref = state[role];
    if (Object.prototype.hasOwnProperty.call(ref.fields, fieldId)) {
      if (String(ref.fields[fieldId]) !== String(newValue)) {
        delete next[role];
        changed = true;
      }
    }
  }
  return changed ? next : state;
}

/** Serializes tracked state into the [{ pointId, role }] shape the backend expects. */
export function toPointReferences(state) {
  return Object.entries(state).map(([role, ref]) => ({
    pointId: ref.pointId,
    role,
  }));
}
