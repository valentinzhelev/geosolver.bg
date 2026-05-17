/** MVP: four core geodetic calculators shipped publicly */
export const MVP_TOOL_ROUTES = [
  '/first-task',
  '/second-task',
  '/forward-intersection',
  '/resection',
];

/** Hidden until post-MVP; routes show a coming-soon page */
export const POST_MVP_TOOL_ROUTES = [
  '/polar-intersection',
  '/coordinate-transformation',
  '/hansen-task',
  '/area-calculation',
  '/distance-bearing',
];

export const POST_MVP_TOOL_LABELS = {
  '/polar-intersection': { bg: 'Полярна засечка', en: 'Polar Intersection' },
  '/coordinate-transformation': { bg: 'Коорд. трансформация', en: 'Coordinate Transformation' },
  '/hansen-task': { bg: 'Задача за ханзен', en: 'Hansen Task' },
  '/area-calculation': { bg: 'Изчисляване на площ', en: 'Area Calculation' },
  '/distance-bearing': { bg: 'Разстояние и посока', en: 'Distance & Bearing' },
};

export const isMvpToolRoute = (route) => MVP_TOOL_ROUTES.includes(route);

export const isPostMvpToolRoute = (route) => POST_MVP_TOOL_ROUTES.includes(route);

/** Base path without /docs suffix */
export const normalizeToolRoute = (pathname) => {
  const base = pathname.replace(/\/docs\/?$/, '') || pathname;
  return base.endsWith('/') && base.length > 1 ? base.slice(0, -1) : base;
};
