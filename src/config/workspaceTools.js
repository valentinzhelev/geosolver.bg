const COORD_TOOL_PREFIXES = [
  '/tools',
  '/first-task',
  '/second-task',
  '/forward-intersection',
  '/resection',
  '/polar-intersection',
  '/hansen-task',
  '/coordinate-transformation',
  '/area-calculation',
  '/distance-bearing',
  '/line-intersection',
  '/offset-point',
  '/segment-division',
];

const WORKSPACE_PREFIXES = ['/projects', '/points', '/map', '/gnss', '/stakeout', '/fieldbook', '/integrations', '/workspace'];

export function isCoordToolsPath(pathname) {
  return COORD_TOOL_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export function isWorkspacePath(pathname) {
  return WORKSPACE_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export function isToolsNavActive(pathname) {
  return isCoordToolsPath(pathname) || isWorkspacePath(pathname);
}

export function getWorkspaceTools({ language = 'bg', showFieldBooks = false } = {}) {
  const bg = language === 'bg';
  const items = [
    { to: '/projects', label: bg ? 'Проектен hub' : 'Project hub', prefix: '/projects' },
    { to: '/points', label: bg ? 'Библиотека с точки' : 'Points library', prefix: '/points' },
    { to: '/map', label: bg ? 'Координатна карта' : 'Coordinate map', prefix: '/map' },
    { to: '/gnss', label: 'GNSS import', prefix: '/gnss' },
    { to: '/gnss/live', label: 'NMEA live', prefix: '/gnss/live' },
    { to: '/gnss/post-process', label: bg ? 'GNSS обработка' : 'GNSS processing', prefix: '/gnss/post-process' },
    { to: '/gnss/field-log', label: bg ? 'Полеви дневник' : 'Field log', prefix: '/gnss/field-log' },
    { to: '/integrations', label: 'API', prefix: '/integrations' },
    { to: '/workspace', label: bg ? 'Workspace' : 'Workspace', prefix: '/workspace' },
    { to: '/stakeout', label: bg ? 'Трасиране' : 'Stake-out', prefix: '/stakeout' },
  ];

  if (showFieldBooks) {
    items.push({
      to: '/fieldbook',
      label: bg ? 'Нивелационен карнет' : 'Leveling field book',
      prefix: '/fieldbook',
      beta: true,
    });
  }

  return items;
}
