/**
 * Pure presentation helpers for the Field Processing (V2.4.1) results view. Interpretation, resolution and every
 * formula run on the SERVER (fieldProcessing/); this file only labels, orders and formats what it returns.
 */

/** Every status is readable without colour alone: a symbol AND a word, like Capture's cell states. */
export const PROCESSING_STATUS = {
  READY: { symbol: '✓', bg: 'Готово', en: 'Ready', tone: 'border-emerald-300 bg-emerald-50/60 dark:border-emerald-800 dark:bg-emerald-950/20' },
  XY_ONLY: { symbol: '~', bg: 'Само X/Y', en: 'XY only', tone: 'border-sky-300 bg-sky-50/60 dark:border-sky-800 dark:bg-sky-950/20' },
  WARNING: { symbol: '!', bg: 'Предупреждение', en: 'Warning', tone: 'border-amber-400 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/30' },
  ERROR: { symbol: '✕', bg: 'Невалидно', en: 'Invalid', tone: 'border-red-400 bg-red-50 dark:border-red-700 dark:bg-red-950/30' },
};

export const statusLabel = (status, bg = true) => {
  const s = PROCESSING_STATUS[status];
  return s ? `${s.symbol} ${bg ? s.bg : s.en}` : status;
};
export const statusTone = (status) => (PROCESSING_STATUS[status] || PROCESSING_STATUS.ERROR).tone;

/** A calculated coordinate/height, or the em-dash placeholder for "not available" - never a fabricated 0. */
export const fmtCoord = (value, decimals = 3) => (typeof value === 'number' && Number.isFinite(value) ? value.toFixed(decimals) : '—');
export const fmtAngle = (value, decimals = 4) => (typeof value === 'number' && Number.isFinite(value) ? `${value.toFixed(decimals)} g` : '—');

/** Flattens every observation across every setup into one list for the results table, keeping its setup index. */
export function allObservations(run) {
  if (!run) return [];
  return run.setups.flatMap((setup) => setup.observations.map((o) => ({ ...o, setupIndex: setup.index })));
}

export function runCounts(run) {
  const counts = { READY: 0, XY_ONLY: 0, WARNING: 0, ERROR: 0 };
  for (const o of allObservations(run)) counts[o.status] = (counts[o.status] || 0) + 1;
  return counts;
}

export function runSummaryText(run, bg = true) {
  const c = runCounts(run);
  const parts = [
    `${c.READY} ${bg ? 'готови' : 'ready'}`,
    `${c.XY_ONLY} ${bg ? 'само X/Y' : 'XY only'}`,
    `${c.WARNING} ${bg ? 'предупреждения' : 'warnings'}`,
    `${c.ERROR} ${bg ? 'невалидни' : 'invalid'}`,
  ];
  return parts.join(' · ');
}

/** How many observations "Създай точки" would save by default (READY + XY_ONLY, never WARNING/ERROR). */
export const savableCount = (run) => { const c = runCounts(run); return c.READY + c.XY_ONLY; };

/** A short, fixed setup-level problem label (station/orientation unresolved etc.) - the server's own message. */
export function setupErrorMessage(setup, bg = true) {
  if (!setup || !setup.setupError) return '';
  const first = setup.observations[0];
  const msg = first && first.errors && first.errors[0] && first.errors[0].message;
  return msg || setup.setupError;
}
