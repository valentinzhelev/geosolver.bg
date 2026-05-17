const STORAGE_KEY = 'geosolver_edu_work';
const ANSWERS_PREFIX = 'geosolver_edu_answers_';

export function setEduWorkContext(payload) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export function getEduWorkContext() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearEduWorkContext() {
  sessionStorage.removeItem(STORAGE_KEY);
}

export function saveEduAnswersForAssignment(assignmentId, answers) {
  sessionStorage.setItem(`${ANSWERS_PREFIX}${assignmentId}`, JSON.stringify(answers));
}

export function loadEduAnswersForAssignment(assignmentId) {
  try {
    const raw = sessionStorage.getItem(`${ANSWERS_PREFIX}${assignmentId}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearEduAnswersForAssignment(assignmentId) {
  sessionStorage.removeItem(`${ANSWERS_PREFIX}${assignmentId}`);
}

/** Map variant inputData to tool form fields */
export function mapInputToForm(toolKey, inputData) {
  const input = inputData?.input || inputData || {};
  switch (toolKey) {
    case 'first-basic-task':
      return {
        y1: input.y1 != null ? String(input.y1) : '',
        x1: input.x1 != null ? String(input.x1) : '',
        alpha: input.alpha != null ? String(input.alpha) : '',
        s: input.s != null ? String(input.s) : '',
      };
    case 'second-basic-task':
      return {
        x1: input.x1 != null ? String(input.x1) : '',
        y1: input.y1 != null ? String(input.y1) : '',
        x2: input.x2 != null ? String(input.x2) : '',
        y2: input.y2 != null ? String(input.y2) : '',
      };
    case 'forward-intersection':
      return {
        yA: input.yA != null ? String(input.yA) : '',
        xA: input.xA != null ? String(input.xA) : '',
        yB: input.yB != null ? String(input.yB) : '',
        xB: input.xB != null ? String(input.xB) : '',
        beta1: input.beta1 != null ? String(input.beta1) : '',
        beta2: input.beta2 != null ? String(input.beta2) : '',
      };
    case 'resection':
      return {
        xA: input.xA != null ? String(input.xA) : '',
        yA: input.yA != null ? String(input.yA) : '',
        xB: input.xB != null ? String(input.xB) : '',
        yB: input.yB != null ? String(input.yB) : '',
        xC: input.xC != null ? String(input.xC) : '',
        yC: input.yC != null ? String(input.yC) : '',
        beta1: input.beta1 != null ? String(input.beta1) : '',
        beta2: input.beta2 != null ? String(input.beta2) : '',
      };
    default:
      return {};
  }
}

/** Extract answer fields from domain result for Edu submit */
export function mapResultToAnswers(toolKey, result) {
  if (!result) return {};
  switch (toolKey) {
    case 'first-basic-task':
      return { x2: result.x2, y2: result.y2 };
    case 'second-basic-task':
      return { distance: result.distance, alpha: result.alphaGon ?? result.alpha };
    case 'forward-intersection':
    case 'resection':
      return { xP: result.xP, yP: result.yP };
    default:
      return {};
  }
}
