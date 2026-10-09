/**
 * Pure presentation helpers for the Project GAI tab (V1.0.2). The backend already returns safe, normalised error
 * codes and product-language evidence labels; this file is the frontend's own guard so that a raw provider payload,
 * an English network error ("Failed to fetch") or an internal evidence kind can never be shown to a user.
 */

const ERROR_COPY = {
  GAI_DISABLED: { bg: 'Асистентът временно не е активен.', en: 'The assistant is temporarily inactive.' },
  PROVIDER_NOT_CONFIGURED: { bg: 'Асистентът не е настроен.', en: 'The assistant is not configured.' },
  PROVIDER_UNAVAILABLE: { bg: 'Асистентът временно не е достъпен.', en: 'The assistant is temporarily unavailable.' },
  PROVIDER_TIMEOUT: { bg: 'Отговорът се забави прекалено дълго. Опитайте отново.', en: 'The answer took too long. Please try again.' },
  PROVIDER_ERROR: { bg: 'Възникна проблем при генерирането на отговора.', en: 'Something went wrong while generating the answer.' },
  INTERNAL: { bg: 'Възникна проблем при генерирането на отговора.', en: 'Something went wrong while generating the answer.' },
  NETWORK_ERROR: { bg: 'Няма връзка със сървъра. Проверете връзката и опитайте отново.', en: 'Cannot reach the server. Check your connection and try again.' },
};
const GENERIC = { bg: 'Възникна проблем. Опитайте отново.', en: 'Something went wrong. Please try again.' };
// validation / access codes whose backend message is fixed, short Bulgarian copy written by GeoSolver itself
const BACKEND_WORDED = new Set(['INVALID_REQUEST', 'NOT_FOUND']);

/** A user-safe message for any GAI error - never the raw text of an unknown error. */
export function gaiErrorMessage(err, bg = true) {
  const code = err && err.code;
  if (code && ERROR_COPY[code]) return bg ? ERROR_COPY[code].bg : ERROR_COPY[code].en;
  if (bg && code && BACKEND_WORDED.has(code) && err.message) return err.message;
  return bg ? GENERIC.bg : GENERIC.en;
}

const KIND_LABEL = {
  project: { bg: 'Проект', en: 'Project' },
  surveyPoint: { bg: 'Точка', en: 'Point' },
  captureJob: { bg: 'Заснемане', en: 'Capture' },
  fieldObservationSet: { bg: 'Потвърдени теренни наблюдения', en: 'Confirmed field observations' },
  processingRun: { bg: 'Обработка', en: 'Processing' },
  report: { bg: 'Отчет', en: 'Report' },
  calculation: { bg: 'Изчисление', en: 'Calculation' },
};
const OBJECT_ID = /^[0-9a-f]{24}$/i;

/** Chip text: the backend's product label; for older stored chips (bare point name) a "Точка" prefix; never a kind. */
export function evidenceChipLabel(e, bg = true) {
  const kind = KIND_LABEL[e && e.kind] || { bg: 'Източник', en: 'Source' };
  const raw = e && typeof e.label === 'string' ? e.label.trim() : '';
  if (!raw || OBJECT_ID.test(raw)) return bg ? kind.bg : kind.en;
  if (e.kind === 'surveyPoint' && !/^(Точка|Point)\s/.test(raw)) return `${bg ? 'Точка' : 'Point'} ${raw}`;
  return raw;
}

const KIND_TAB = { surveyPoint: 'points', captureJob: 'field-data', fieldObservationSet: 'field-data', processingRun: 'processing', report: 'documents' };

/** A real in-app destination for a chip, or null (rendered as plain text - never a dead link). */
export function evidenceHref(e, projectId) {
  if (!e || !projectId) return null;
  const pid = encodeURIComponent(projectId);
  if (KIND_TAB[e.kind]) return `/project?projectId=${pid}&tab=${KIND_TAB[e.kind]}`;
  if (e.kind === 'calculation') return `/calculations/history?projectId=${pid}`;
  return null;
}

/** Fallback starters (no point-specific question - those come from the server, for points that really exist). */
export const FALLBACK_STARTERS = {
  bg: ['Обобщи проекта', 'Кои данни чакат проверка?'],
  en: ['Summarize the project', 'Which data is awaiting review?'],
};
