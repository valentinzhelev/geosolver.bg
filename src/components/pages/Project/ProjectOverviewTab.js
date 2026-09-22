import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { surveyPointsApi } from '../../../services/surveyPointsApi';
import { captureApi } from '../../../services/captureApi';
import { fieldProcessingApi } from '../../../services/fieldProcessingApi';
import { statusLabel, statusTone, captureStatusKey, traverseRunStatusKey, polarRunStatusKey } from '../../../utils/statusLabels';
import { runCounts } from '../../../utils/fieldProcessingView';

const StatTile = ({ label, value }) => (
  <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl outline outline-1 outline-gray-200 dark:outline-zinc-800">
    <div className="text-[10px] uppercase tracking-wide text-neutral-400 font-['Manrope']">{label}</div>
    <div className="text-xl font-bold text-black dark:text-white font-['Manrope']">{value}</div>
  </div>
);

/**
 * V2.4.3 "Обзор": a project dashboard - counts, unresolved review items, latest activity, and the primary next
 * actions - deliberately lean (section 7: "Do not overload the dashboard").
 */
const ProjectOverviewTab = ({ projectId, bg = true }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pointCount, setPointCount] = useState(0);
  const [jobs, setJobs] = useState([]);
  const [runs, setRuns] = useState([]);

  useEffect(() => {
    if (!projectId) return undefined;
    let cancelled = false;
    setLoading(true);
    setError('');
    Promise.all([
      surveyPointsApi.list({ projectId }).catch(() => ({ data: [] })),
      captureApi.listJobs(projectId).catch(() => []),
      fieldProcessingApi.listRunsForProject(projectId).catch(() => []),
    ]).then(([ptsRes, jobsRes, runsRes]) => {
      if (cancelled) return;
      setPointCount((ptsRes.data || []).length);
      setJobs(jobsRes || []);
      setRuns(runsRes || []);
      setLoading(false);
    }).catch((e) => { if (!cancelled) { setError(e.message); setLoading(false); } });
    return () => { cancelled = true; };
  }, [projectId]);

  const needsReviewCount = jobs.filter((j) => j.status === 'needs_review').length;

  const activity = [
    ...jobs.map((j) => ({
      kind: 'capture', date: j.createdAt, id: j.id,
      label: `${bg ? (j.mode === 'field-notebook' ? 'Полеви карнет' : 'Таблица с координати') : (j.mode === 'field-notebook' ? 'Field notebook' : 'Coordinate table')}: ${j.originalName || (bg ? '(без име)' : '(unnamed)')}`,
      statusKey: captureStatusKey(j.status),
      to: `/project?projectId=${projectId}&tab=field-data`,
    })),
    ...runs.map((r) => {
      const isTraverse = r.processingType === 'traverse';
      const statusKey = isTraverse ? traverseRunStatusKey(r.traverse.status) : polarRunStatusKey(runCounts(r));
      return {
        kind: 'processing', date: r.createdAt, id: r.id,
        label: isTraverse ? (bg ? `Полигонов ход ${r.traverse.startIdentifier}` : `Traverse ${r.traverse.startIdentifier}`) : (bg ? 'Полярна обработка' : 'Polar processing'),
        statusKey,
        to: `/project?projectId=${projectId}&tab=processing`,
      };
    }),
  ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 6);

  const primary = "px-4 py-2 rounded-lg text-sm font-semibold font-['Manrope'] bg-black dark:bg-white text-white dark:text-black";
  const ghost = "px-4 py-2 rounded-lg text-sm font-medium font-['Manrope'] bg-white dark:bg-zinc-900 outline outline-1 outline-gray-200 dark:outline-zinc-700";

  return (
    <div className="flex flex-col gap-4" data-testid="project-overview-tab">
      {error && <div role="alert" className="p-3 rounded-lg bg-red-50 text-red-700 text-sm font-['Manrope']">{error}</div>}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <StatTile label={bg ? 'Точки' : 'Points'} value={loading ? '—' : pointCount} />
        <StatTile label={bg ? 'Теренни данни' : 'Field captures'} value={loading ? '—' : jobs.length} />
        <StatTile label={bg ? 'Обработки' : 'Processing runs'} value={loading ? '—' : runs.length} />
        <StatTile label={bg ? 'За проверка' : 'Needs review'} value={loading ? '—' : needsReviewCount} />
      </div>

      <div className="flex flex-wrap gap-2">
        <Link to={`/points?projectId=${projectId}`} className={primary} data-testid="overview-action-points">{bg ? 'Добави точки' : 'Add points'}</Link>
        <Link to={`/capture?projectId=${projectId}`} className={ghost} data-testid="overview-action-capture">{bg ? 'Импортирай / Заснеми' : 'Import / Capture'}</Link>
        <button type="button" className={ghost} onClick={() => navigate(`/project?projectId=${projectId}&tab=field-data`)} data-testid="overview-action-process">
          {bg ? 'Обработи теренни данни' : 'Process field data'}
        </button>
        <Link to={`/map?projectId=${projectId}`} className={ghost} data-testid="overview-action-map">{bg ? 'Отвори карта' : 'Open map'}</Link>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-xs font-bold uppercase tracking-wide text-neutral-400 font-['Manrope']">{bg ? 'Последна активност' : 'Latest activity'}</h3>
        {loading && <p className="text-xs text-neutral-400 font-['Manrope']" role="status">{bg ? 'Зареждане...' : 'Loading...'}</p>}
        {!loading && activity.length === 0 && (
          <p className="text-xs text-neutral-400 font-['Manrope']">{bg ? 'Все още няма активност в проекта.' : 'No activity yet.'}</p>
        )}
        {activity.length > 0 && (
          <ul className="flex flex-col divide-y divide-gray-100 dark:divide-zinc-800 rounded-xl bg-white dark:bg-zinc-900 outline outline-1 outline-gray-200 dark:outline-zinc-800">
            {activity.map((a) => (
              <li key={`${a.kind}-${a.id}`}>
                <Link to={a.to} className="flex items-center justify-between gap-2 py-2 px-3 hover:bg-stone-50 dark:hover:bg-zinc-800" data-testid="overview-activity-row">
                  <span className="text-sm font-['Manrope'] text-black dark:text-white">{a.label}</span>
                  <span className={`text-xs font-semibold font-['Manrope'] ${statusTone(a.statusKey)}`}>{statusLabel(a.statusKey, bg)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default ProjectOverviewTab;
