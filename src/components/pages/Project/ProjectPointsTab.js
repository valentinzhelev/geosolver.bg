import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { surveyPointsApi } from '../../../services/surveyPointsApi';

/**
 * V2.4.3 "Точки": a compact preview scoped to the project, deep-linking into the existing full Points library
 * (/points) for the actual editing/search/import workflow - that page is a large, already-tested standalone
 * screen (search, CRUD, import); this tab does not re-implement it, only surfaces it from the project workspace.
 */
const ProjectPointsTab = ({ projectId, bg = true }) => {
  const [points, setPoints] = useState(null); // null = loading
  const [error, setError] = useState('');

  useEffect(() => {
    if (!projectId) return undefined;
    let cancelled = false;
    setPoints(null);
    setError('');
    surveyPointsApi.list({ projectId })
      .then((res) => { if (!cancelled) setPoints(res.data || []); })
      .catch((e) => { if (!cancelled) { setError(e.message); setPoints([]); } });
    return () => { cancelled = true; };
  }, [projectId]);

  const preview = (points || []).slice(0, 8);

  return (
    <div className="flex flex-col gap-3" data-testid="project-points-tab">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <h2 className="text-sm font-bold font-['Manrope'] text-black dark:text-white">{bg ? 'Точки' : 'Points'}</h2>
          <p className="text-xs text-neutral-500 dark:text-zinc-400 font-['Manrope']">
            {points === null ? (bg ? 'Зареждане...' : 'Loading...') : `${points.length} ${bg ? 'точки в проекта' : 'points in this project'}`}
          </p>
        </div>
        <Link to={`/points?projectId=${projectId}`} className="px-3 py-2 rounded-lg text-sm font-semibold font-['Manrope'] bg-black dark:bg-white text-white dark:text-black" data-testid="project-points-open-full">
          {bg ? 'Отвори пълния списък' : 'Open full list'}
        </Link>
      </div>
      {error && <p className="text-xs text-red-600 font-['Manrope']" role="alert">{error}</p>}
      {points && points.length === 0 && !error && (
        <p className="text-xs text-neutral-400 font-['Manrope']">{bg ? 'Все още няма точки в проекта.' : 'No points in this project yet.'}</p>
      )}
      {preview.length > 0 && (
        <div className="overflow-auto rounded-lg border border-gray-100 dark:border-zinc-800">
          <table className="min-w-full text-left border-collapse text-xs">
            <thead className="bg-stone-50 dark:bg-zinc-800">
              <tr>{[bg ? 'Име' : 'Name', 'Y', 'X', 'H'].map((h) => <th key={h} className="p-1.5 font-semibold text-neutral-600 dark:text-zinc-300 font-['Manrope']">{h}</th>)}</tr>
            </thead>
            <tbody>
              {preview.map((p) => (
                <tr key={p._id} className="border-t border-gray-100 dark:border-zinc-800">
                  <td className="p-1.5 font-mono">{p.name}</td>
                  <td className="p-1.5 font-mono">{typeof p.y === 'number' ? p.y.toFixed(3) : '—'}</td>
                  <td className="p-1.5 font-mono">{typeof p.x === 'number' ? p.x.toFixed(3) : '—'}</td>
                  <td className="p-1.5 font-mono">{typeof p.h === 'number' ? p.h.toFixed(3) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {points.length > preview.length && (
            <p className="p-2 text-[11px] text-neutral-400 font-['Manrope']">
              {bg ? `+ още ${points.length - preview.length}` : `+ ${points.length - preview.length} more`}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectPointsTab;
