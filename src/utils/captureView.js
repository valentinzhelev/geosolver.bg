/**
 * Pure presentation helpers for the Capture review screen (no React, no I/O). Interpretation and validation are done
 * by the BACKEND; this file only labels, orders and positions what the server returns.
 */

/** Column meanings the user can choose (X = Northing / север, Y = Easting / изток). */
export const SEMANTIC_OPTIONS = [
  { value: '', bg: 'Не се импортира', en: 'Not imported' },
  { value: 'point', bg: 'Точка', en: 'Point' },
  { value: 'code', bg: 'Код', en: 'Code' },
  { value: 'x', bg: 'X (север)', en: 'X (Northing)' },
  { value: 'y', bg: 'Y (изток)', en: 'Y (Easting)' },
  { value: 'h', bg: 'H (кота)', en: 'H (height)' },
  { value: 'notes', bg: 'Бележки', en: 'Notes' },
];

export const semanticLabel = (semantic, bg = true) => {
  const o = SEMANTIC_OPTIONS.find((x) => x.value === (semantic || ''));
  return o ? (bg ? o.bg : o.en) : '';
};

/** Cell states must be readable WITHOUT colour: every state has its own symbol and word. */
export const CELL_STATES = {
  accepted: { symbol: '✓', bg: 'Приета', en: 'Accepted', tone: 'border-emerald-300 bg-emerald-50/60 dark:border-emerald-800 dark:bg-emerald-950/20' },
  review: { symbol: '!', bg: 'За проверка', en: 'Review suggested', tone: 'border-amber-400 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/30' },
  invalid: { symbol: '✕', bg: 'Невалидна', en: 'Invalid', tone: 'border-red-400 bg-red-50 dark:border-red-700 dark:bg-red-950/30' },
  edited: { symbol: '✎', bg: 'Редактирана', en: 'Edited', tone: 'border-sky-400 bg-sky-50 dark:border-sky-700 dark:bg-sky-950/30' },
};

export const cellStateLabel = (state, bg = true) => {
  const s = CELL_STATES[state] || CELL_STATES.accepted;
  return `${s.symbol} ${bg ? s.bg : s.en}`;
};

/** What the user currently sees in a cell: the correction if there is one, otherwise the OCR text. */
export const cellDisplayValue = (cell) => (cell.userValue !== null && cell.userValue !== undefined ? cell.userValue : cell.rawText);

export function summaryText(summary, bg = true) {
  if (!summary) return '';
  const rows = bg ? 'реда' : 'rows';
  const parts = [
    `${summary.rows} ${rows}`,
    `${summary.ready} ${bg ? 'готови' : 'ready'}`,
    `${summary.review} ${bg ? 'за проверка' : 'need review'}`,
    `${summary.invalid} ${bg ? 'невалидни' : 'invalid'}`,
  ];
  if (summary.excluded) parts.push(`${summary.excluded} ${bg ? 'изключени' : 'excluded'}`);
  return parts.join(' · ');
}

/** Position of a source box over the review image, as percentages (independent of the displayed size and zoom). */
export function bboxToPercent(bbox, size) {
  if (!bbox || !size || !size.width || !size.height) return null;
  return {
    left: (bbox.x / size.width) * 100,
    top: (bbox.y / size.height) * 100,
    width: (bbox.w / size.width) * 100,
    height: (bbox.h / size.height) * 100,
  };
}

/** The rows a user has to look at, in order (invalid first is NOT applied: document order is kept). */
export const rowNeedsAttention = (row) => row.status === 'error' || row.status === 'warning';
export const dataRows = (table) => (table ? table.rows.filter((r) => !r.skipped) : []);

export function nextAttentionRow(table, fromIndex) {
  const rows = dataRows(table);
  const start = rows.findIndex((r) => r.index === fromIndex);
  for (let i = 1; i <= rows.length; i += 1) {
    const r = rows[(start + i) % rows.length];
    if (r && rowNeedsAttention(r)) return r.index;
  }
  return null;
}

/** Only semantic columns are shown as editable fields (unmapped columns are shown, but marked as not imported). */
export const columnsOf = (table) => (table ? table.columns : []);

/* ---------------------------------------------------------------------------------------------------------------
 * V2.2: candidates & arbitration (multiple recognition signals -> a trust decision the server made; the UI only
 * presents the evidence and lets the user pick or correct - it never re-decides trust on its own).
 * ------------------------------------------------------------------------------------------------------------ */

/** Other readings the server gathered for this cell (never the currently shown one), for "Други разчитания". */
export function candidateAlternatives(cell) {
  const alts = (cell && cell.arbitration && cell.arbitration.alternatives) || [];
  return alts.filter((a) => a && a.text !== undefined && a.text !== null && String(a.text) !== '');
}
export const hasAlternatives = (cell) => candidateAlternatives(cell).length > 0;

const ARBITRATION_REASONS = {
  CONTRADICTED_BY_CONSENSUS: ['Друго разчитане на клетката се повтори при няколко опита.', 'Another reading of this cell repeated across several passes.'],
  DISAGREEMENT_NO_CONSENSUS: ['Разчитанията на клетката при различните опити не съвпадат.', 'The readings from different passes disagree.'],
  CONSENSUS_BUT_SUSPICIOUS_SYMBOL: ['Един от знаците е разпознат с ниска сигурност.', 'One character was recognised with low confidence.'],
  GENERATED_ALTERNATIVE_FROM_LOOKALIKE: ['Възможно е знак да е объркан с цифра (напр. O и 0).', 'A character may be confused with a digit (e.g. O and 0).'],
  SINGLE_LOW_CONFIDENCE: ['Разпознаването е с много ниска сигурност.', 'The recognition has very low confidence.'],
  SINGLE_MODERATE_CONFIDENCE: ['Разпознаването е с умерена сигурност.', 'The recognition has moderate confidence.'],
  PRIMARY_UNPARSEABLE: ['Стойността не прилича на валидно число.', 'The value does not look like a valid number.'],
  INSUFFICIENT_EVIDENCE: ['Няма достатъчно сигурно разчитане на клетката.', 'There is not enough confident evidence for this cell.'],
};
/** A short, fixed explanation of WHY the cell needs a second look (never invented text - a fixed lookup). */
export function arbitrationReason(cell, bg = true) {
  const reason = cell && cell.arbitration && cell.arbitration.reason;
  const entry = reason && ARBITRATION_REASONS[reason];
  return entry ? entry[bg ? 0 : 1] : '';
}

/* ---------------------------------------------------------------------------------------------------------------
 * V2.2: row exclusion ("Не импортирай този ред") - explicit and reversible.
 * ------------------------------------------------------------------------------------------------------------ */
export const excludeRowLabel = (excluded, bg = true) => {
  if (excluded) return bg ? 'Включи отново' : 'Re-include row';
  return bg ? 'Не импортирай този ред' : 'Do not import this row';
};

const MESSAGES = {
  PRO_REQUIRED: ['Capture е функция на Pro плана.', 'Capture is a Pro plan feature.'],
  POINT_CONFLICTS: ['В проекта вече има точки със същите имена. Променете имената и опитайте отново.', 'The project already has points with the same names. Rename them and try again.'],
  VALIDATION_ERRORS: ['В таблицата има неразрешени грешки.', 'The table still has unresolved errors.'],
  REVISION_CONFLICT: ['Данните са променени междувременно. Презаредени са.', 'The data changed meanwhile. It was reloaded.'],
  QUOTA_EXCEEDED: ['Достигнахте месечния лимит за сканирания.', 'You reached the monthly scan limit.'],
};

/** A user-facing message for an API error; server messages are already sanitized Bulgarian text. */
export function describeCaptureError(err, bg = true) {
  if (err && err.code && MESSAGES[err.code]) return MESSAGES[err.code][bg ? 0 : 1];
  if (err && err.message) return err.message;
  return bg ? 'Възникна грешка. Опитайте отново.' : 'Something went wrong. Try again.';
}

export const canConfirmJob = (job) => Boolean(job && job.status === 'needs_review' && job.validationSummary && job.validationSummary.canConfirm);
export const importCount = (job) => (job && job.validationSummary ? job.validationSummary.rows : 0);

export const ACCEPTED_TYPES = 'image/jpeg,image/png,image/webp';
export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

/** Client-side pre-check for a friendlier message; the server validates the real content again. */
export function checkFile(file, bg = true) {
  if (!file) return bg ? 'Изберете файл.' : 'Choose a file.';
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return bg ? 'Поддържат се само JPG, PNG и WebP.' : 'Only JPG, PNG and WebP are supported.';
  if (file.size > MAX_UPLOAD_BYTES) return bg ? 'Файлът е над 8 MB.' : 'The file is larger than 8 MB.';
  return '';
}
