/** Shared tool route helpers (labels for breadcrumbs / menus). */

export const TOOL_ROUTE_LABELS = {
  '/first-task': { bg: 'Първа основна задача', en: 'First Basic Task' },
  '/second-task': { bg: 'Втора основна задача', en: 'Second Basic Task' },
  '/forward-intersection': { bg: 'Права засечка', en: 'Forward Intersection' },
  '/resection': { bg: 'Обратна засечка', en: 'Resection' },
  '/polar-intersection': { bg: 'Полярна засечка', en: 'Polar Intersection' },
  '/coordinate-transformation': { bg: 'Коорд. трансформация', en: 'Coordinate Transformation' },
  '/hansen-task': { bg: 'Задача на Хансен', en: 'Hansen Task' },
  '/area-calculation': { bg: 'Изчисляване на площ', en: 'Area Calculation' },
  '/distance-bearing': { bg: 'Разстояние и посока', en: 'Distance & Bearing' },
  '/line-intersection': { bg: 'Пресичане на прави', en: 'Line intersection' },
  '/offset-point': { bg: 'Ортогонален offset', en: 'Orthogonal offset' },
  '/segment-division': { bg: 'Деление на отсечка', en: 'Segment division' },
};

/** Base path without /docs suffix */
export const normalizeToolRoute = (pathname) => {
  const base = pathname.replace(/\/docs\/?$/, '') || pathname;
  return base.endsWith('/') && base.length > 1 ? base.slice(0, -1) : base;
};

export const getToolLabel = (route, language = 'bg') => {
  const key = normalizeToolRoute(route);
  const label = TOOL_ROUTE_LABELS[key];
  if (!label) return key;
  return language === 'bg' ? label.bg : label.en;
};
