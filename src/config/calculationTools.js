/** Maps backend toolName → route and labels */
export const CALCULATION_TOOLS = {
  'first-basic-task': { path: '/first-task', label: { bg: 'Първа основна задача', en: 'First basic task' } },
  'second-basic-task': { path: '/second-task', label: { bg: 'Втора основна задача', en: 'Second basic task' } },
  'forward-intersection': { path: '/forward-intersection', label: { bg: 'Права засечка', en: 'Forward intersection' } },
  resection: { path: '/resection', label: { bg: 'Обратна засечка', en: 'Resection' } },
  'polar-intersection': { path: '/polar-intersection', label: { bg: 'Полярна засечка', en: 'Polar intersection' } },
  'hansen-task': { path: '/hansen-task', label: { bg: 'Задача на Хансен', en: 'Hansen task' } },
  'coordinate-transformation': { path: '/coordinate-transformation', label: { bg: 'Координатна трансформация', en: 'Coordinate transformation' } },
  'area-calculation': { path: '/area-calculation', label: { bg: 'Площ и периметър', en: 'Area calculation' } },
  'distance-bearing': { path: '/distance-bearing', label: { bg: 'Разстояние и посока', en: 'Distance and bearing' } },
  'line-intersection': { path: '/line-intersection', label: { bg: 'Пресичане на прави', en: 'Line intersection' } },
  'offset-point': { path: '/offset-point', label: { bg: 'Ортогонален offset', en: 'Orthogonal offset' } },
  'segment-division': { path: '/segment-division', label: { bg: 'Деление на отсечка', en: 'Segment division' } },
  'scientific-calculator': { path: '/scientific-calculator', label: { bg: 'Научен калкулатор', en: 'Scientific calculator' } },
};

/** Not a Project calculation — general utility with no server persistence. */
const PROJECT_EXCLUDED_TOOLS = new Set(['scientific-calculator']);

/** Appends ?projectId= to a calculator path when a project context is given. */
export function withProjectId(path, projectId) {
  if (!projectId) return path;
  return `${path}${path.includes('?') ? '&' : '?'}projectId=${encodeURIComponent(projectId)}`;
}

export function getToolPath(toolName, projectId) {
  return withProjectId(CALCULATION_TOOLS[toolName]?.path || '/tools', projectId);
}

/** Professional calculators that can be opened inside a Project (registry minus excluded utilities). */
export function getProjectCalculationTools() {
  return Object.entries(CALCULATION_TOOLS)
    .filter(([id]) => !PROJECT_EXCLUDED_TOOLS.has(id))
    .map(([id, meta]) => ({ id, ...meta }));
}

/** True when pathname is a professional (Project-capable) calculator route. */
export function isCalculatorPath(pathname) {
  return getProjectCalculationTools().some((t) => t.path === pathname);
}

export function getToolLabel(toolName, language = 'bg', fallback) {
  const meta = CALCULATION_TOOLS[toolName];
  if (meta) return meta.label[language === 'bg' ? 'bg' : 'en'];
  if (fallback?.[language]) return fallback[language];
  if (fallback?.bg) return fallback.bg;
  return toolName || '—';
}

export function toolFilterOptions(language = 'bg') {
  const bg = language === 'bg';
  return [
    { value: '', label: bg ? 'Всички инструменти' : 'All tools' },
    ...Object.entries(CALCULATION_TOOLS).map(([id, meta]) => ({
      value: id,
      label: meta.label[bg ? 'bg' : 'en'],
    })),
  ];
}
