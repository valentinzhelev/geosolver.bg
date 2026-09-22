import React, { useEffect, useState } from 'react';
import { captureApi } from '../../../services/captureApi';
import { describeCaptureError } from '../../../utils/captureView';

const STATUS_LABEL = {
  needs_review: ['За преглед', 'Needs review'],
  confirmed: ['Импортирано', 'Imported'],
  failed: ['Неуспешно', 'Failed'],
  uploaded: ['Качено', 'Uploaded'],
  processing: ['Обработва се', 'Processing'],
};

// V2.3: a clear type badge per job, since Capture history now lists both coordinate-table and field-notebook jobs.
const MODE_LABEL = {
  'coordinate-table': ['Таблица с координати', 'Coordinate table'],
  'field-notebook': ['Полева книжка', 'Field notebook'],
};

const formatWhen = (iso, bg) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString(bg ? 'bg-BG' : 'en-GB', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
};

/**
 * V2.2 Capture history for a project: recent jobs, newest first. Reopens a needs_review job for further review, or
 * a confirmed job in the same (now read-only) review screen for audit. `refreshKey` re-fetches when it changes
 * (e.g. right after a new upload), so the list stays current without the caller managing fetch timing.
 */
const CaptureHistory = ({ projectId, refreshKey, onOpen, bg = true }) => {
  const [jobs, setJobs] = useState(null); // null = loading
  const [error, setError] = useState('');

  useEffect(() => {
    if (!projectId) return undefined;
    let cancelled = false;
    setJobs(null);
    setError('');
    captureApi.listJobs(projectId)
      .then((data) => { if (!cancelled) setJobs(data || []); })
      .catch((e) => { if (!cancelled) { setError(describeCaptureError(e, bg)); setJobs([]); } });
    return () => { cancelled = true; };
  }, [projectId, refreshKey]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!projectId) return null;

  return (
    <div className="flex flex-col gap-2 p-4 rounded-xl bg-white dark:bg-zinc-900 outline outline-1 outline-gray-200 dark:outline-zinc-800" data-testid="capture-history">
      <h2 className="text-sm font-bold font-['Manrope'] text-black dark:text-white">{bg ? 'Скорошни сканирания' : 'Recent captures'}</h2>
      {jobs === null && <p className="text-xs text-neutral-400 font-['Manrope']" role="status">{bg ? 'Зареждане...' : 'Loading...'}</p>}
      {error && <p className="text-xs text-red-600 font-['Manrope']" role="alert">{error}</p>}
      {jobs && jobs.length === 0 && !error && (
        <p className="text-xs text-neutral-400 font-['Manrope']" data-testid="capture-history-empty">{bg ? 'Все още няма сканирания за този проект.' : 'No captures for this project yet.'}</p>
      )}
      {jobs && jobs.length > 0 && (
        <ul className="flex flex-col divide-y divide-gray-100 dark:divide-zinc-800">
          {jobs.map((job) => {
            const label = STATUS_LABEL[job.status] || [job.status, job.status];
            const modeLabel = MODE_LABEL[job.mode] || [job.mode, job.mode];
            return (
              <li key={job.id}>
                <button
                  type="button"
                  onClick={() => onOpen(job.id)}
                  className="w-full flex flex-wrap items-center justify-between gap-2 py-2 text-left hover:bg-stone-50 dark:hover:bg-zinc-800 rounded-lg px-1"
                  data-testid="capture-history-row"
                >
                  <span className="flex flex-col">
                    <span className="flex items-center gap-1.5">
                      <span className="text-sm font-medium font-['Manrope'] text-black dark:text-white">{job.originalName || (bg ? '(без име)' : '(unnamed)')}</span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-semibold font-['Manrope'] ${job.mode === 'field-notebook' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300' : 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300'}`}
                        data-testid="capture-history-type"
                      >
                        {bg ? modeLabel[0] : modeLabel[1]}
                      </span>
                    </span>
                    <span className="text-[11px] text-neutral-400 font-['Manrope']">{formatWhen(job.createdAt, bg)}</span>
                  </span>
                  <span className="flex items-center gap-3 text-[11px] font-['Manrope'] text-neutral-500 dark:text-zinc-400">
                    <span data-testid="capture-history-status">{bg ? label[0] : label[1]}</span>
                    <span>{job.rows} {bg ? 'реда' : 'rows'}</span>
                    {job.review > 0 && <span className="text-amber-700 dark:text-amber-400">{job.review} {bg ? 'за проверка' : 'to review'}</span>}
                    {job.status === 'confirmed' && <span className="text-emerald-700 dark:text-emerald-400">{job.importedCount} {bg ? 'импортирани' : 'imported'}</span>}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default CaptureHistory;
