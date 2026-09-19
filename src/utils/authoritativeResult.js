/**
 * Authoritative-result handling for the shared calculation path (useGuardedCalculation).
 *
 * The backend computes and persists the authoritative resultData. The frontend still computes a
 * full local result for instant UX and for step-by-step display fields that are NOT persisted.
 * After a successful save the shared hook returns the local result with the persisted fields
 * replaced by the backend's values, so the user never sees one coordinate while another is stored:
 *
 *   { ...runResult, ...saved.resultData }      only when saved.resultAuthority === 'server'
 *
 * No calculator component is involved: all twelve go through runWithTracking.
 */

const AUTHORITY_KEY = '__resultAuthority';

const isPlainObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

/**
 * Returns `runResult` with the persisted (authoritative) fields taken from the saved
 * Calculation. Legacy behavior is preserved (the local result is returned untouched) when the
 * response is not server-authoritative — e.g. an older backend, or a client-authored row.
 * `runResult` is never mutated.
 */
export function applyAuthoritativeResult(runResult, saved) {
  if (!isPlainObject(runResult)) return runResult;
  if (!saved || saved.resultAuthority !== 'server' || !isPlainObject(saved.resultData)) return runResult;

  const merged = { ...runResult, ...saved.resultData };
  // Non-enumerable so it never leaks into spreads, JSON, or the calculators' local history.
  Object.defineProperty(merged, AUTHORITY_KEY, {
    enumerable: false,
    value: Object.freeze({
      source: 'server',
      engineVersion: saved.engineVersion ?? null,
      overlaidFields: Object.keys(saved.resultData),
      clientCheck: saved.clientCheck ?? null,
    }),
  });
  return merged;
}

/**
 * Shared state for a future mismatch notice: null when the result is purely local, otherwise
 * { source, engineVersion, overlaidFields, clientCheck } where clientCheck.status is
 * 'match' | 'mismatch' | 'not_provided'.
 */
export function getResultAuthority(result) {
  return (result && result[AUTHORITY_KEY]) || null;
}

const REFRESH_MESSAGE = {
  bg: 'Версията на GeoSolver в този прозорец е остаряла за този инструмент. Моля, опреснете страницата (Ctrl+F5) и опитайте отново — изчислението не е запазено.',
  en: 'This GeoSolver window is out of date for this tool. Please refresh the page (Ctrl+F5) and try again — the calculation was not saved.',
};

export function refreshRequiredMessage(language) {
  return language === 'bg' ? REFRESH_MESSAGE.bg : REFRESH_MESSAGE.en;
}

/**
 * Classifies a failed save. CalculationService.saveCalculation throws Errors carrying `status`,
 * `code` and `field` from the backend's structured response.
 *   refresh_required | validation | auth | limit | other
 */
export function classifySaveError(err) {
  const message = (err && err.message) || '';
  if (err && err.code === 'CLIENT_REFRESH_REQUIRED') return { kind: 'refresh_required' };
  if (message.includes('Authentication required') || (err && err.status === 401) || message.includes('401')) return { kind: 'auth' };
  if (err && err.status === 400 && err.code) return { kind: 'validation', code: err.code, field: err.field };
  // Same rule the hook always used: a 403 is only the free-plan limit when its message says so (an edu-policy 403 is not).
  if (message.includes('limit') || message.includes('403')) return { kind: 'limit' };
  return { kind: 'other' };
}

export function validationMessage(err, language) {
  if (language === 'bg') return err.message || 'Данните не бяха приети от сървъра. Проверете стойностите и опитайте отново.';
  return `The input was rejected by the server (code: ${err.code}). Check the values and try again — the calculation was not saved.`;
}
