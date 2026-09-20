/**
 * Tiny publish/subscribe for "survey points changed" (QA-05). Every successful SurveyPoint mutation notifies here
 * (from services/surveyPointsApi.js and the Save-as-point call), and the shared SurveyPointsContext subscribes to
 * refresh its single cache. It is one common helper, so no component has to know about the cache.
 */
const listeners = new Set();

export function onSurveyPointsChanged(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function notifySurveyPointsChanged() {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch {
      /* a failing subscriber must never break a mutation */
    }
  });
}
