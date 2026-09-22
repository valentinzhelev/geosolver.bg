/**
 * Pure presentation helpers for the Traverse Processing (V2.4.2) results view. Interpretation, sequencing, every
 * formula and the Bowditch adjustment run on the SERVER (fieldProcessing/); this file only labels, orders and
 * formats what it returns. Reuses fieldProcessingView.js's statusLabel/statusTone/fmtCoord/fmtAngle - a traverse
 * leg's own status (READY/XY_ONLY/ERROR) is the exact same vocabulary V2.4.1 already established.
 */
export const TRAVERSE_TYPE = {
  CLOSED_LOOP: { bg: 'Затворен ход', en: 'Closed loop' },
  KNOWN_ENDPOINT: { bg: 'Ход с известна крайна точка', en: 'Known endpoint' },
  OPEN: { bg: 'Отворен ход', en: 'Open traverse' },
};
export const traverseTypeLabel = (type, bg = true) => {
  const t = TRAVERSE_TYPE[type];
  return t ? (bg ? t.bg : t.en) : type;
};

const RUN_STATUS = {
  READY: { bg: 'Готов', en: 'Ready' },
  PARTIAL: { bg: 'Частичен', en: 'Partial' },
  INVALID: { bg: 'Невалиден', en: 'Invalid' },
};
export const runStatusLabel = (status, bg = true) => {
  const s = RUN_STATUS[status];
  return s ? (bg ? s.bg : s.en) : status;
};

const SEQUENCE_ISSUE = {
  START_STATION_NOT_FOUND: { bg: 'Началната станция не е намерена в наблюденията.', en: 'The start station was not found among the observations.' },
  END_STATION_NOT_SPECIFIED: { bg: 'Не е зададена крайна станция.', en: 'No end station was specified.' },
  MISSING_FORESIGHT_OBSERVATION: { bg: 'Липсва напредно наблюдение към следващата станция.', en: 'A foresight observation to the next station is missing.' },
  ENDPOINT_NOT_REACHED: { bg: 'Ходът не достигна декларираната крайна точка.', en: 'The traverse never reached the declared endpoint.' },
  AMBIGUOUS_CONTINUATION: { bg: 'Има повече от едно възможно продължение - не може да се избере автоматично.', en: 'More than one possible continuation exists and cannot be chosen automatically.' },
  DUPLICATE_STATION_IDENTIFIER_IN_OBSERVATION_SET: { bg: 'Две станции имат едно и също име в наблюденията.', en: 'Two stations share the same name in the observations.' },
  NO_LEGS_FOUND: { bg: 'Не бяха разпознати отсечки на хода.', en: 'No traverse legs could be identified.' },
};
export function sequenceIssueMessage(issue, bg = true) {
  if (!issue) return '';
  const entry = SEQUENCE_ISSUE[issue.code];
  const base = entry ? (bg ? entry.bg : entry.en) : issue.code;
  const parts = [base];
  if (issue.atStationIdentifier) parts.push(`(${bg ? 'при' : 'at'} ${issue.atStationIdentifier})`);
  if (issue.expectedNextIdentifier) parts.push(`${bg ? '→ очаквана следваща станция' : '→ expected next station'}: ${issue.expectedNextIdentifier}`);
  if (issue.candidateIdentifiers && issue.candidateIdentifiers.length) parts.push(`(${issue.candidateIdentifiers.join(', ')})`);
  return parts.join(' ');
}

const CLOSURE_UNAVAILABLE = {
  OPEN_TRAVERSE: { bg: 'Отвореният ход няма независим контрол за затваряне.', en: 'An open traverse has no independent closing control.' },
  ENDPOINT_NOT_REACHED: { bg: 'Ходът не достигна декларираната крайна точка.', en: 'The traverse never reached the declared endpoint.' },
  INVALID_LEGS: { bg: 'Има невалидна отсечка в хода - невръзка не може да се изчисли.', en: 'The traverse has an invalid leg - closure cannot be computed.' },
  END_NOT_RESOLVED: { bg: 'Крайната контролна точка не е намерена сред точките на проекта.', en: 'The endpoint control point was not found among the project points.' },
  END_COORDINATES_UNKNOWN: { bg: 'Крайната контролна точка няма записани координати.', en: 'The endpoint control point has no recorded coordinates.' },
  NO_LEGS: { bg: 'Не бяха идентифицирани отсечки.', en: 'No legs were identified.' },
};
export function closureUnavailableMessage(reason, bg = true) {
  if (!reason) return '';
  const entry = CLOSURE_UNAVAILABLE[reason];
  return entry ? (bg ? entry.bg : entry.en) : reason;
}

/** "1 : 18493" - a transparent measurement, never a good/bad judgement (V2.4.2 section 19). */
export function fmtRelativeClosure(denominator, bg = true) {
  if (typeof denominator !== 'number' || !Number.isFinite(denominator)) return '—';
  return `1 : ${Math.round(denominator).toLocaleString(bg ? 'bg-BG' : 'en-US')}`;
}

/** How many legs "Създай точки" would save by default (READY + XY_ONLY, never ERROR). */
export function savableLegCount(traverse) {
  return (traverse && traverse.legs ? traverse.legs : []).filter((l) => l.status === 'READY' || l.status === 'XY_ONLY').length;
}

/** Whether the confirm dialog and the results table should present ADJUSTED coordinates at all for this run. */
export const hasAdjustment = (traverse) => !!(traverse && traverse.adjustment && traverse.adjustment.applied);
