/**
 * Pure presentation + entry helpers for Field Sessions (Теренна сесия). The server interprets, validates and decides
 * every status; this file only labels, orders and shapes what it returns, and builds the RAW-TEXT entries the user
 * types. Nothing here parses a measurement, calculates a geodetic value or decides whether data is safe.
 */

/** Every status is readable without colour alone: a symbol AND a word (like Capture's cell states). */
export const SESSION_STATUS = {
  draft: { symbol: '✎', bg: 'Чернова', en: 'Draft', tone: 'border-gray-300 bg-gray-50 text-neutral-700 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200' },
  review: { symbol: '!', bg: 'За проверка', en: 'Needs review', tone: 'border-amber-400 bg-amber-50 text-amber-800 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-300' },
  confirmed: { symbol: '✓', bg: 'Потвърдена', en: 'Confirmed', tone: 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-300' },
  processed: { symbol: '✓✓', bg: 'Обработена', en: 'Processed', tone: 'border-sky-300 bg-sky-50 text-sky-800 dark:border-sky-800 dark:bg-sky-950/20 dark:text-sky-300' },
};

export function statusBadge(status, bg = true) {
  const s = SESSION_STATUS[status] || SESSION_STATUS.draft;
  return { text: `${s.symbol} ${bg ? s.bg : s.en}`, tone: s.tone };
}

const ERROR_COPY = {
  NETWORK_ERROR: { bg: 'Няма връзка със сървъра. Данните са запазени на това устройство – опитайте отново.', en: 'Cannot reach the server. Your data is kept on this device - try again.' },
  REVISION_CONFLICT: { bg: 'Сесията е променена от друго устройство. Презаредете, за да продължите.', en: 'The session was changed on another device. Reload to continue.' },
  NOT_SAVED: { bg: 'Промените още не са запазени. Опитайте отново.', en: 'Your changes are not saved yet. Please try again.' },
  INTERNAL: { bg: 'Възникна проблем. Опитайте отново.', en: 'Something went wrong. Please try again.' },
};
const GENERIC = { bg: 'Възникна проблем. Опитайте отново.', en: 'Something went wrong. Please try again.' };
// codes whose message is a fixed Bulgarian sentence written by GeoSolver's server (never a database/provider text)
const SERVER_WORDED = new Set([
  'INVALID_REQUEST', 'NOT_FOUND', 'FORBIDDEN', 'SESSION_CONFIRMED', 'NOT_CONFIRMED', 'VALIDATION_ERRORS', 'SOURCE_CONFLICT',
  'CAPTURE_NOT_FOUND', 'CAPTURE_NOT_NOTEBOOK', 'CAPTURE_ALREADY_ATTACHED', 'CAPTURE_FAILED', 'CONFIRM_IN_PROGRESS',
  'CONFIRM_FAILED', 'CONFIRM_UNAVAILABLE', 'NOTHING_TO_SUBMIT', 'USE_CAPTURE_REVIEW',
  'CAPTURE_CONFIRMED', 'PAGE_LIMIT_REACHED', 'PAGE_NOT_FOUND', 'PAGE_DUPLICATE', 'PAGES_NOT_READY', 'BELONGS_TO_SESSION',
]);

/** A user-safe message for any session error - never an unknown error's own text. */
export function sessionErrorMessage(err, bg = true) {
  const code = err && err.code;
  if (code && ERROR_COPY[code]) return bg ? ERROR_COPY[code].bg : ERROR_COPY[code].en;
  if (bg && code && SERVER_WORDED.has(code) && err.message) return err.message;
  return bg ? GENERIC.bg : GENERIC.en;
}

/* ------------------------------------------------------------------------------------------ entry factories */

export const blankObservation = (row) => ({ row, target: '', hz: '', vz: '', distance: '', horizontalDistance: '', prismHeight: '', code: '', notes: '' });

export const blankSetup = (index) => ({
  index,
  station: { point: '', instrumentHeight: '', notes: '' },
  orientation: { target: '', direction: '' },
  observations: [],
});

const nextId = (items, key) => items.reduce((m, it) => Math.max(m, Number.isInteger(it[key]) ? it[key] : -1), -1) + 1;

/** Appends an empty station (ids are assigned here so the server keeps them and issues can point at them). */
export function addSetup(setups) {
  return [...setups, blankSetup(nextId(setups, 'index'))];
}

export function removeSetup(setups, index) {
  return setups.filter((s) => s.index !== index);
}

export function updateStation(setups, index, patch) {
  return setups.map((s) => (s.index === index ? { ...s, station: { ...s.station, ...patch } } : s));
}

export function updateOrientation(setups, index, patch) {
  return setups.map((s) => (s.index === index ? { ...s, orientation: { target: '', direction: '', ...(s.orientation || {}), ...patch } } : s));
}

/** Adds an observation to one station; the station context (which station, its HI/orientation) is untouched. */
export function addObservation(setups, index, values) {
  return setups.map((s) => {
    if (s.index !== index) return s;
    const row = nextId(s.observations, 'row');
    return { ...s, observations: [...s.observations, { ...blankObservation(row), ...values, row }] };
  });
}

export function updateObservation(setups, index, row, values) {
  return setups.map((s) => (s.index !== index ? s : { ...s, observations: s.observations.map((o) => (o.row === row ? { ...o, ...values, row } : o)) }));
}

export function removeObservation(setups, index, row) {
  return setups.map((s) => (s.index !== index ? s : { ...s, observations: s.observations.filter((o) => o.row !== row) }));
}

/** True when an observation has no content at all (such rows are ignored by the server). */
export const isBlankObservation = (o) => ['target', 'hz', 'vz', 'distance', 'horizontalDistance', 'prismHeight', 'code', 'notes'].every((f) => !String(o[f] || '').trim());

/** The next station to occupy: a new setup whose backsight is the previous station (a traverse's natural continuation). */
export function addNextStation(setups) {
  const prev = setups[setups.length - 1];
  const added = addSetup(setups);
  if (!prev || !prev.station.point) return added;
  return updateOrientation(added, added[added.length - 1].index, { target: prev.station.point });
}

export const countObservations = (setups) => setups.reduce((n, s) => n + s.observations.filter((o) => !isBlankObservation(o)).length, 0);

/* ------------------------------------------------------------------------------------------ issues */

const FIELD_LABELS = {
  point: ['Станция', 'Station'],
  instrumentHeight: ['Височина на инструмента', 'Instrument height'],
  orientation: ['Ориентир', 'Backsight'],
  target: ['Цел', 'Target'],
  direction: ['Посока към ориентира', 'Backsight direction'],
  hz: ['Hz', 'Hz'],
  vz: ['V (зенитно)', 'V (zenith)'],
  distance: ['Наклонено разстояние', 'Slope distance'],
  horizontalDistance: ['Хоризонтално разстояние', 'Horizontal distance'],
  prismHeight: ['Височина на призмата', 'Prism height'],
  code: ['Код', 'Code'],
  notes: ['Бележка', 'Note'],
};
export const fieldLabel = (field, bg = true) => (FIELD_LABELS[field] ? FIELD_LABELS[field][bg ? 0 : 1] : '');

/** A stable lookup key for a located issue / the field it belongs to. */
export const issueKey = ({ setup, section, row, field }) => `${setup === null || setup === undefined ? '' : setup}|${section}|${row === undefined || row === null ? '' : row}|${field || ''}`;

/** @returns {Map<string, object>} the FIRST issue per field (errors before warnings) for highlighting */
export function indexIssues(issues) {
  const map = new Map();
  const ordered = [...(issues || [])].sort((a, b) => (a.severity === b.severity ? 0 : a.severity === 'error' ? -1 : 1));
  for (const i of ordered) {
    const k = issueKey(i);
    if (!map.has(k)) map.set(k, i);
  }
  return map;
}

/** "Станция 101 · наблюдение към 201 · Hz" - where an issue is, in the user's own words. */
export function issueLocation(issue, setups, bg = true) {
  if (issue.section === 'session' || issue.setup === null || issue.setup === undefined) return bg ? 'Цялата сесия' : 'Whole session';
  const setup = (setups || []).find((s) => s.index === issue.setup);
  const station = setup && setup.station.point ? setup.station.point : `№ ${issue.setup + 1}`;
  const parts = [`${bg ? 'Станция' : 'Station'} ${station}`];
  if (issue.section === 'observation') {
    const obs = setup && setup.observations.find((o) => o.row === issue.row);
    parts.push(obs && obs.target ? `${bg ? 'наблюдение към' : 'observation to'} ${obs.target}` : (bg ? 'наблюдение' : 'observation'));
  } else if (issue.section === 'orientation') parts.push(bg ? 'ориентир' : 'backsight');
  if (issue.field && fieldLabel(issue.field, bg)) parts.push(fieldLabel(issue.field, bg));
  return parts.join(' · ');
}

export function splitIssues(evaluation) {
  const issues = (evaluation && evaluation.issues) || [];
  return { errors: issues.filter((i) => i.severity === 'error'), warnings: issues.filter((i) => i.severity !== 'error') };
}

/* ------------------------------------------------------------------------------------------ notebook pages */

const PAGE_STATE = {
  ready: { symbol: '✓', bg: 'Готова за проверка', en: 'Ready for review', tone: 'border-emerald-300 text-emerald-800 dark:border-emerald-800 dark:text-emerald-300' },
  failed: { symbol: '✕', bg: 'Не е разпозната', en: 'Not recognised', tone: 'border-red-400 text-red-800 dark:border-red-700 dark:text-red-300' },
  processing: { symbol: '…', bg: 'Обработва се', en: 'Processing', tone: 'border-amber-400 text-amber-800 dark:border-amber-700 dark:text-amber-300' },
  missing: { symbol: '✕', bg: 'Заснемането липсва', en: 'Capture missing', tone: 'border-red-400 text-red-800 dark:border-red-700 dark:text-red-300' },
  confirmed: { symbol: '✓✓', bg: 'Потвърдена', en: 'Confirmed', tone: 'border-emerald-300 text-emerald-800 dark:border-emerald-800 dark:text-emerald-300' },
};

/** A page's state as a symbol + word (never colour alone) with its tone classes. */
export function pageStateBadge(state, bg = true) {
  const s = PAGE_STATE[state] || PAGE_STATE.processing;
  return { text: `${s.symbol} ${bg ? s.bg : s.en}`, tone: s.tone };
}

/** "2 наблюдения · ✕ 1 проблем" - what a page contributes, in plain words. */
export function pageCountsLine(page, bg = true) {
  const parts = [`${page.observationCount} ${bg ? (page.observationCount === 1 ? 'наблюдение' : 'наблюдения') : (page.observationCount === 1 ? 'observation' : 'observations')}`];
  if (page.errors > 0) parts.push(`✕ ${page.errors} ${bg ? (page.errors === 1 ? 'грешка' : 'грешки') : (page.errors === 1 ? 'error' : 'errors')}`);
  if (page.warnings > 0) parts.push(`! ${page.warnings} ${bg ? (page.warnings === 1 ? 'предупреждение' : 'предупреждения') : (page.warnings === 1 ? 'warning' : 'warnings')}`);
  return parts.join(' · ');
}

/** The new order of page ids after moving the page at `index` by `delta` (-1 up, +1 down); unchanged at the ends. */
export function movePageIds(ids, index, delta) {
  const to = index + delta;
  if (index < 0 || index >= ids.length || to < 0 || to >= ids.length) return ids;
  const next = [...ids];
  [next[index], next[to]] = [next[to], next[index]];
  return next;
}

/** "Страница 2 · Станция 101 · наблюдение към 203 · Hz" - a session-wide issue located by PAGE first. */
export function pageIssueLocation(issue, logicalSetups, bg = true) {
  const page = issue.page ? `${bg ? 'Страница' : 'Page'} ${issue.page}` : '';
  if (issue.setup === null || issue.setup === undefined) return page || (bg ? 'Цялата сесия' : 'Whole session');
  const where = issueLocation(issue, logicalSetups, bg);
  return page ? `${page} · ${where}` : where;
}

/** Issues grouped by page (session-wide ones first), each group in the issues' own (page, setup, row) order. */
export function groupIssuesByPage(issues) {
  const groups = new Map();
  for (const i of issues || []) {
    const key = i.page || 0;
    groups.set(key, [...(groups.get(key) || []), i]);
  }
  return [...groups.entries()].sort((a, b) => a[0] - b[0]).map(([page, list]) => ({ page: page || null, issues: list }));
}

/**
 * Where to jump in the PAGE's own capture review for an issue: the page-local cell address its editor understands, or null when
 * the issue is about the page/setup as a whole (the editor then just opens on that page).
 */
export function pageIssueAddr(issue) {
  if (issue.pageSetup === null || issue.pageSetup === undefined) return null;
  const field = issue.field || null;
  if (issue.section === 'station' && field && ['point', 'instrumentHeight', 'notes'].includes(field)) return { setup: issue.pageSetup, section: 'station', field };
  if (field === 'orientationTarget') return { setup: issue.pageSetup, section: 'orientation', field: 'target' };
  if (field === 'orientationDirection') return { setup: issue.pageSetup, section: 'orientation', field: 'direction' };
  if (issue.section === 'orientation' && field) return { setup: issue.pageSetup, section: 'orientation', field };
  if (issue.section === 'observation' && field && issue.pageRow !== null && issue.pageRow !== undefined) return { setup: issue.pageSetup, section: 'observation', row: issue.pageRow, field };
  return null;
}

/* ------------------------------------------------------------------------------------------ confirmed evidence */

export const fmtNumber = (v) => (typeof v === 'number' && Number.isFinite(v) ? String(v) : '—');

export function fmtAngle(a) {
  if (!a || typeof a.value !== 'number') return '—';
  return `${a.value} ${a.unit === 'deg' ? '°' : 'gon'}`;
}

export function fmtMeasure(m) {
  if (!m || typeof m.value !== 'number') return '—';
  return `${m.value} ${m.unit || 'm'}`;
}

/** One confirmed observation as a compact, readable line (typed values exactly as confirmed). */
export function evidenceLine(o, bg = true) {
  const parts = [`Hz ${fmtAngle(o.hz)}`];
  if (o.vz) parts.push(`V ${fmtAngle(o.vz)}`);
  if (o.distance) parts.push(`${bg ? 'S' : 'S'} ${fmtMeasure(o.distance)}`);
  if (o.horizontalDistance) parts.push(`${bg ? 'Хор.' : 'Hor.'} ${fmtMeasure(o.horizontalDistance)}`);
  if (o.prismHeight) parts.push(`${bg ? 'приз.' : 'prism'} ${fmtMeasure(o.prismHeight)}`);
  return parts.join(' · ');
}

/* ------------------------------------------------------------------------------------------ processing options */

const OPTION_REASON = {
  NO_OBSERVATIONS: ['В сесията няма наблюдения за обработка.', 'The session has no observations to process.'],
  NEEDS_TWO_STATIONS: ['За полигонов ход са нужни поне две станции.', 'A traverse needs at least two stations.'],
  NO_STATION_CHAIN: ['Станциите не са свързани във верига (ориентир и напред наблюдение между съседни станции).', 'The stations do not form a chain (backsight and foresight between neighbouring stations).'],
  DUPLICATE_STATION: ['Една и съща станция е заета повече от веднъж.', 'The same station is occupied more than once.'],
};
export const optionReason = (code, bg = true) => (OPTION_REASON[code] ? OPTION_REASON[code][bg ? 0 : 1] : '');

/** The processing kinds this confirmed data supports - impossible ones are simply absent (never shown disabled). */
export function availableModes(options) {
  const modes = [];
  if (options && options.polar && options.polar.available) modes.push('polar');
  if (options && options.traverse && options.traverse.available) modes.push('traverse');
  return modes;
}

/** Why nothing can be processed, in plain words (only used when `availableModes` is empty). */
export function noProcessingReason(options, bg = true) {
  const code = (options && options.polar && options.polar.reason) || (options && options.traverse && options.traverse.reason);
  return optionReason(code, bg) || (bg ? 'Няма налична обработка за тези данни.' : 'No processing is available for this data.');
}

/* ------------------------------------------------------------------------------------------ misc */

export const SOURCE_LABEL = { manual: ['Ръчно въведена', 'Entered manually'], capture: ['От снимка на полеви карнет', 'From a field notebook photo'], none: ['Още няма данни', 'No data yet'] };

export function sessionSummaryLine(session, bg = true) {
  const parts = [
    `${session.setupCount} ${bg ? (session.setupCount === 1 ? 'станция' : 'станции') : (session.setupCount === 1 ? 'station' : 'stations')}`,
    `${session.observationCount} ${bg ? (session.observationCount === 1 ? 'наблюдение' : 'наблюдения') : (session.observationCount === 1 ? 'observation' : 'observations')}`,
  ];
  return parts.join(' · ');
}

/** Which of a project's capture jobs belong to NO session - the compatibility view for captures made before sessions. */
export function capturesOutsideSessions(jobs, attachedIds) {
  const attached = new Set(attachedIds || []);
  return (jobs || []).filter((j) => !attached.has(j.id));
}
