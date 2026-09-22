/**
 * Shared status vocabulary for the Project workspace (V2.4.3): Field Data and Processing speak the SAME
 * icon+label language, never colour alone (matches the convention already established by Capture's cell states
 * and Field Processing's READY/XY_ONLY/WARNING/ERROR badges).
 */
export const STATUS = {
  DRAFT: { symbol: '○', bg: 'Чернова', en: 'Draft', tone: 'text-neutral-500 dark:text-zinc-400' },
  NEEDS_REVIEW: { symbol: '!', bg: 'За проверка', en: 'Needs review', tone: 'text-amber-700 dark:text-amber-400' },
  CONFIRMED: { symbol: '✓', bg: 'Потвърдено', en: 'Confirmed', tone: 'text-emerald-700 dark:text-emerald-400' },
  PROCESSED: { symbol: '✓', bg: 'Обработено', en: 'Processed', tone: 'text-emerald-700 dark:text-emerald-400' },
  PARTIAL: { symbol: '~', bg: 'Частичен резултат', en: 'Partial result', tone: 'text-sky-700 dark:text-sky-400' },
  ERROR: { symbol: '✕', bg: 'Грешка', en: 'Error', tone: 'text-red-700 dark:text-red-400' },
};

export const statusLabel = (key, bg = true) => {
  const e = STATUS[key];
  return e ? `${e.symbol} ${bg ? e.bg : e.en}` : key;
};
export const statusTone = (key) => (STATUS[key] || STATUS.DRAFT).tone;

/** Maps a Capture job's backend status ('uploaded'|'processing'|'needs_review'|'confirmed'|'failed') to the shared vocabulary. */
export function captureStatusKey(jobStatus) {
  if (jobStatus === 'confirmed') return 'CONFIRMED';
  if (jobStatus === 'needs_review') return 'NEEDS_REVIEW';
  if (jobStatus === 'failed') return 'ERROR';
  return 'DRAFT'; // 'uploaded' / 'processing' - not yet ready for the user to act on
}

/** Maps a traverse run's own status (READY/PARTIAL/INVALID) to the shared vocabulary. */
export function traverseRunStatusKey(runStatus) {
  if (runStatus === 'READY') return 'PROCESSED';
  if (runStatus === 'PARTIAL') return 'PARTIAL';
  return 'ERROR'; // INVALID
}

/** A polar run has no single run-level status field (V2.4.1); derive one from its READY/XY_ONLY/WARNING/ERROR counts. */
export function polarRunStatusKey(counts) {
  const ok = (counts.READY || 0) + (counts.XY_ONLY || 0);
  if (ok === 0) return 'ERROR';
  if ((counts.ERROR || 0) > 0 || (counts.WARNING || 0) > 0) return 'PARTIAL';
  return 'PROCESSED';
}
