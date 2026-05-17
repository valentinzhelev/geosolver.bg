const PREFIX = 'geosolver_edu_draft_';

export function saveAnswerDraft(assignmentId, answers) {
  try {
    sessionStorage.setItem(`${PREFIX}${assignmentId}`, JSON.stringify({ answers, savedAt: Date.now() }));
  } catch {
    /* ignore quota */
  }
}

export function loadAnswerDraft(assignmentId) {
  try {
    const raw = sessionStorage.getItem(`${PREFIX}${assignmentId}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearAnswerDraft(assignmentId) {
  sessionStorage.removeItem(`${PREFIX}${assignmentId}`);
}
