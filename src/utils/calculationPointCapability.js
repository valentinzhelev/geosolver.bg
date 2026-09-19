/**
 * UX-only capability helper for "Save as point" (Milestone 1.1).
 *
 * The BACKEND is authoritative about whether a calculation can produce a
 * SurveyPoint (geosolver-backend/utils/calculationPointOutputs.js) and
 * re-checks everything on every request. This mirror exists only so the UI
 * can decide whether to show the action and preview the coordinates that
 * will be saved. Keep it identical to the backend allow-list — a test pins
 * the exact tool list.
 */
export const POINT_OUTPUT_FIELDS = {
  'first-basic-task': { xField: 'x2', yField: 'y2' },
  'forward-intersection': { xField: 'xP', yField: 'yP' },
  resection: { xField: 'xP', yField: 'yP' },
  'polar-intersection': { xField: 'xP', yField: 'yP' },
  'hansen-task': { xField: 'xP', yField: 'yP' },
  'coordinate-transformation': { xField: 'xTransformed', yField: 'yTransformed' },
  'line-intersection': { xField: 'xI', yField: 'yI' },
  'offset-point': { xField: 'xP', yField: 'yP' },
  'segment-division': { xField: 'xP', yField: 'yP' },
};

const isFiniteNumber = (v) => typeof v === 'number' && Number.isFinite(v);

export function isPointProducingTool(toolName) {
  return Object.prototype.hasOwnProperty.call(POINT_OUTPUT_FIELDS, toolName);
}

/** The action is offered only for point-producing calculations that belong to a Project. */
export function canOfferSaveAsPoint(calculation) {
  return Boolean(calculation && calculation.projectId && isPointProducingTool(calculation.toolName));
}

/** The stored coordinates that will become the point, for display only ({x, y} or null). */
export function getPointPreview(calculation) {
  if (!calculation || !isPointProducingTool(calculation.toolName)) return null;
  const spec = POINT_OUTPUT_FIELDS[calculation.toolName];
  const x = calculation.resultData?.[spec.xField];
  const y = calculation.resultData?.[spec.yField];
  return isFiniteNumber(x) && isFiniteNumber(y) ? { x, y } : null;
}

/**
 * Request body for POST /api/calculations/:id/create-point. Deliberately
 * only user-entered identity fields — never coordinates, projectId or
 * provenance; the server derives all of those.
 */
export function buildCreatePointPayload({ name, code } = {}) {
  const payload = { name: String(name || '').trim() };
  const trimmedCode = String(code || '').trim();
  if (trimmedCode) payload.code = trimmedCode;
  return payload;
}

/** Short human label for an existing point ("101 · T1", "T1", or ''), for the already-created state. */
export function existingPointLabel(point) {
  if (!point) return '';
  const name = String(point.name || '').trim();
  const code = String(point.code || '').trim();
  return [code, name].filter(Boolean).join(' · ');
}

/**
 * Maps the API response to a UI state:
 * created | already | crs_mismatch | forbidden | invalid | error
 */
export function interpretCreatePointResult(status, body) {
  if (status === 201 && body?.data) return { state: 'created', point: body.data };
  if (status === 409 && body?.code === 'ALREADY_CREATED') return { state: 'already', point: body.data || null };
  if (status === 409 && body?.code === 'CRS_MISMATCH') {
    return { state: 'crs_mismatch', calculationCrs: body.calculationCrs, projectCrs: body.projectCrs };
  }
  if (status === 403) return { state: 'forbidden' };
  if (status === 400 && body?.code === 'NAME_REQUIRED') return { state: 'invalid' };
  return { state: 'error', message: body?.error || null };
}
