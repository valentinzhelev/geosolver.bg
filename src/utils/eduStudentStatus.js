/** Labels for backend `studentStatus` keys */
export const STUDENT_STATUS_LABELS = {
  pending: { bg: 'Чака предаване', en: 'Pending', tone: 'neutral' },
  late_pending: { bg: 'Късно — чака', en: 'Late — pending', tone: 'amber' },
  submitted: { bg: 'Предадено', en: 'Submitted', tone: 'blue' },
  submitted_late: { bg: 'Предадено (късно)', en: 'Submitted late', tone: 'amber' },
  awaiting_review: { bg: 'За преглед', en: 'Awaiting review', tone: 'purple' },
  graded: { bg: 'Оценено', en: 'Graded', tone: 'green' },
  graded_late: { bg: 'Оценено (късно)', en: 'Graded late', tone: 'green' },
  attempts_exhausted: { bg: 'Изчерпани опити', en: 'No attempts left', tone: 'red' },
  closed: { bg: 'Приключило', en: 'Closed', tone: 'neutral' },
};

export function getStudentStatusLabel(status, language = 'bg') {
  const row = STUDENT_STATUS_LABELS[status];
  if (!row) return status || '—';
  return language === 'bg' ? row.bg : row.en;
}

export function studentStatusTone(status) {
  return STUDENT_STATUS_LABELS[status]?.tone || 'neutral';
}
