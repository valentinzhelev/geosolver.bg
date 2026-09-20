import { DEFAULT_CRS, isSupportedCrs } from '../domain/geodesy/crsTransform';

/**
 * Project creation helpers (QA-01). A Project is the primary geodetic work object; it does NOT depend on the
 * Field Book pilot and does not require a workspace. Contract: POST /api/fieldbooks/projects
 * { name (required), notes, crs (default EPSG:7801), workspaceId (optional; must be a workspace the user may edit) }.
 */

export const PROJECT_NAME_MAX = 120;

export const emptyProjectForm = () => ({ name: '', notes: '', crs: DEFAULT_CRS, workspaceId: '' });

/** Returns a Bulgarian/English error text, or '' when the form can be submitted. */
export function validateProjectForm(form, language = 'bg') {
  const bg = language === 'bg';
  const name = String(form?.name || '').trim();
  if (!name) return bg ? 'Въведете име на проекта.' : 'Enter a project name.';
  if (name.length > PROJECT_NAME_MAX) return bg ? `Името е твърде дълго (макс. ${PROJECT_NAME_MAX} знака).` : `Name is too long (max ${PROJECT_NAME_MAX}).`;
  if (form.crs && !isSupportedCrs(form.crs)) return bg ? 'Изберете поддържана координатна система.' : 'Choose a supported coordinate system.';
  return '';
}

/** Request body for POST /projects: only fields the existing contract supports; no workspace key for a personal project. */
export function buildProjectPayload(form) {
  const payload = {
    name: String(form.name || '').trim(),
    notes: String(form.notes || '').trim(),
    crs: form.crs || DEFAULT_CRS,
  };
  if (form.workspaceId) payload.workspaceId = form.workspaceId;
  return payload;
}

/** A newly created project goes to the top of the list immediately (no reload needed to see it). */
export function addCreatedProject(projects, created) {
  return [created, ...(projects || []).filter((p) => String(p._id) !== String(created._id))];
}

/** What the user should do next in a new, empty project. The first action is ALWAYS adding points. */
export function nextStepLinks(projectId, language = 'bg') {
  const bg = language === 'bg';
  return [
    { key: 'points', primary: true, to: `/points?projectId=${projectId}`, label: bg ? 'Добави точки' : 'Add points' },
    { key: 'capture', to: `/capture?projectId=${projectId}`, label: bg ? 'Сканирай таблица' : 'Capture a table' },
    { key: 'calculations', to: `/calculations/history?projectId=${projectId}`, label: bg ? 'Изчисления' : 'Calculations' },
    { key: 'map', to: `/map?projectId=${projectId}`, label: bg ? 'Карта' : 'Map' },
    { key: 'gnss', to: `/gnss?projectId=${projectId}`, label: bg ? 'GNSS импорт' : 'GNSS import' },
    { key: 'fieldbooks', to: '/fieldbook', label: bg ? 'Карнети (пилот)' : 'Field books (pilot)' },
  ];
}

/**
 * Counts for the hub. Every source is independent: the Field Book list needs pilot access and may be refused
 * (403) for an ordinary user, which must never wipe the point / calculation counts.
 */
export async function loadProjectSummaries(list, { listPoints, listBooks, getCalcHistory }) {
  const pointCounts = {};
  const bookCounts = {};
  const calcCounts = {};
  let booksAvailable = true;
  await Promise.all(
    list.map(async (p) => {
      const [pts, bks, calcs] = await Promise.allSettled([listPoints(p._id), listBooks(p._id), getCalcHistory(p._id)]);
      pointCounts[p._id] = pts.status === 'fulfilled' ? (pts.value?.data || []).length : 0;
      if (bks.status === 'fulfilled') {
        bookCounts[p._id] = (bks.value?.data || bks.value?.books || []).length;
      } else {
        bookCounts[p._id] = 0;
        booksAvailable = false;
      }
      calcCounts[p._id] = calcs.status === 'fulfilled' ? calcs.value?.pagination?.totalItems ?? 0 : 0;
    })
  );
  return { pointCounts, bookCounts, calcCounts, booksAvailable };
}
