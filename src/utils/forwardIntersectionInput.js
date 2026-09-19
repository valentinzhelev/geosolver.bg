/**
 * Numeric input for Forward Intersection, built once from the form state and
 * used for BOTH the calculation and the persisted `inputData`.
 *
 * Form fields are strings. Before this helper the component persisted the raw
 * form strings while calculating on Number(...) — so a project calculation
 * using PointPicker references was rejected by the backend's point-provenance
 * validator (utils/toolPointRoles.js requires finite Numbers). Number() is the
 * same conversion the calculation always used, so no semantic value changes.
 */
export const FORWARD_INTERSECTION_FIELDS = ['yA', 'xA', 'yB', 'xB', 'beta1', 'beta2'];

export function buildForwardIntersectionInput(form) {
  const input = {};
  for (const key of FORWARD_INTERSECTION_FIELDS) {
    input[key] = Number(form[key]);
  }
  return input;
}
