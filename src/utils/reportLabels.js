/**
 * Professional Bulgarian labels for the Report / Document Engine (V2.5). Internal enum values (reportType,
 * sourceType) and raw ids are never shown to the user directly - see V2.5 section 11.
 */
const REPORT_TYPE_LABEL = {
  POLAR_PROCESSING_REPORT: { bg: 'Отчет за полярна обработка', en: 'Polar processing report' },
  TRAVERSE_PROCESSING_REPORT: { bg: 'Отчет за обработка на полигонов ход', en: 'Traverse processing report' },
  PROJECT_COORDINATE_LIST: { bg: 'Координатен регистър', en: 'Coordinate list' },
};
export const reportTypeLabel = (type, bg = true) => {
  const t = REPORT_TYPE_LABEL[type];
  return t ? (bg ? t.bg : t.en) : type;
};

const SOURCE_TYPE_LABEL = {
  'field-processing-run': { bg: 'Обработка на теренни данни', en: 'Field processing run' },
  'project-points-snapshot': { bg: 'Снимка на точките в проекта', en: 'Project points snapshot' },
};
export const sourceTypeLabel = (type, bg = true) => {
  const t = SOURCE_TYPE_LABEL[type];
  return t ? (bg ? t.bg : t.en) : type;
};

export function fmtFileSize(bytes) {
  if (typeof bytes !== 'number' || !Number.isFinite(bytes)) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function fmtGeneratedAt(value, bg = true) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString(bg ? 'bg-BG' : 'en-GB', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
}
