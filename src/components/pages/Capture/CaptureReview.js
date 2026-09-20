import React, { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { captureApi } from '../../../services/captureApi';
import CaptureImagePane from './CaptureImagePane';
import CaptureTable from './CaptureTable';
import CaptureRowStepper from './CaptureRowStepper';
import { canConfirmJob, dataRows, describeCaptureError, importCount, summaryText } from '../../../utils/captureView';

/**
 * The review workspace: original image + reconstructed table (desktop) or image + row cards (mobile).
 * Nothing here imports anything: corrections and column choices go to the server, which re-validates; the import only
 * happens after the explicit two-step confirmation.
 */
const CaptureReview = ({ initialJob, imageUrl, bg = true }) => {
  const [job, setJob] = useState(initialJob);
  const [selected, setSelected] = useState(null); // { row, col }
  const [rowIndex, setRowIndex] = useState(() => {
    const first = dataRows(initialJob.table)[0];
    return first ? first.index : 0;
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [conflicts, setConflicts] = useState(null);
  const [stage, setStage] = useState('idle'); // idle | ask | importing | done
  const [result, setResult] = useState(null);

  const confirmed = job.status === 'confirmed';
  const locked = busy || confirmed || stage === 'importing';
  const reviewSize = job.source && job.source.review;

  const selectedBbox = useMemo(() => {
    if (!selected || !job.table) return null;
    const row = job.table.rows.find((r) => r.index === selected.row);
    const cell = row && row.cells.find((c) => c.col === selected.col);
    return cell ? cell.bbox : null;
  }, [selected, job.table]);

  const handleSelect = useCallback((row, col) => {
    setSelected({ row, col });
    setRowIndex(row);
  }, []);

  const send = useCallback(async (body) => {
    setBusy(true);
    setError('');
    try {
      const updated = await captureApi.patchJob(job.id, { ...body, baseRevision: job.revision });
      setJob(updated);
      setConflicts(null);
    } catch (e) {
      if (e.code === 'REVISION_CONFLICT') {
        try { setJob(await captureApi.getJob(job.id)); } catch { /* keep the old view */ }
      }
      setError(describeCaptureError(e, bg));
    } finally {
      setBusy(false);
    }
  }, [job.id, job.revision, bg]);

  const handleCommit = useCallback((row, col, value) => send({ edits: [{ row, col, value }] }), [send]);
  const handleMapColumn = useCallback((index, semantic) => send({ columns: [{ index, semantic }] }), [send]);

  const handleConfirm = async () => {
    setStage('importing');
    setError('');
    setConflicts(null);
    try {
      const res = await captureApi.confirmJob(job.id);
      setJob(res.data);
      setResult({ count: res.importedCount, already: res.alreadyConfirmed });
      setStage('done');
    } catch (e) {
      setStage('idle');
      if (e.code === 'POINT_CONFLICTS' && e.conflicts) setConflicts(e.conflicts);
      if (e.code === 'VALIDATION_ERRORS') {
        try { setJob(await captureApi.getJob(job.id)); } catch { /* keep the old view */ }
      }
      setError(describeCaptureError(e, bg));
    }
  };

  const tableIssues = ((job.table && job.table.issues) || []).filter((i) => i.severity === 'error' || i.severity === 'warning');
  const quality = (job.source && job.source.quality && job.source.quality.warnings) || [];
  const primary = "px-4 py-2 rounded-lg text-sm font-semibold font-['Manrope'] bg-black dark:bg-white text-white dark:text-black disabled:opacity-40 disabled:cursor-not-allowed";
  const ghost = "px-4 py-2 rounded-lg text-sm font-medium font-['Manrope'] bg-white dark:bg-zinc-900 outline outline-1 outline-gray-200 dark:outline-zinc-700";

  return (
    <div className="flex flex-col gap-4" data-testid="capture-review">
      <div className="flex flex-col gap-2 p-3 md:p-4 rounded-xl bg-white dark:bg-zinc-900 outline outline-1 outline-gray-200 dark:outline-zinc-800">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-semibold font-['Manrope'] text-black dark:text-white" data-testid="capture-summary" role="status">
            {confirmed ? (bg ? 'Импортирано · ' : 'Imported · ') : ''}{summaryText(job.validationSummary, bg)}
          </p>
          {!confirmed && stage !== 'ask' && (
            <button type="button" className={primary} disabled={!canConfirmJob(job) || locked} onClick={() => setStage('ask')} data-testid="capture-confirm-start">
              {bg ? 'Потвърди и импортирай' : 'Confirm and import'}
            </button>
          )}
        </div>
        {!confirmed && stage === 'ask' && (
          <div className="flex flex-col gap-2 p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20 outline outline-1 outline-orange-200 dark:outline-orange-900/50" role="alertdialog" aria-label={bg ? 'Потвърждение на импорта' : 'Import confirmation'}>
            <p className="text-sm font-['Manrope'] text-black dark:text-white">
              {bg
                ? `Ще бъдат добавени ${importCount(job)} точки в проекта. Досега нищо не е импортирано.`
                : `${importCount(job)} points will be added to the project. Nothing has been imported so far.`}
            </p>
            <div className="flex flex-wrap gap-2">
              <button type="button" className={primary} onClick={handleConfirm} data-testid="capture-confirm-go">{bg ? 'Импортирай' : 'Import'}</button>
              <button type="button" className={ghost} onClick={() => setStage('idle')}>{bg ? 'Отказ' : 'Cancel'}</button>
            </div>
          </div>
        )}
        {stage === 'importing' && <p className="text-sm text-neutral-500 font-['Manrope']">{bg ? 'Импортиране...' : 'Importing...'}</p>}
        {confirmed && (
          <div className="flex flex-wrap items-center gap-3 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 outline outline-1 outline-emerald-200 dark:outline-emerald-900/50" role="status" data-testid="capture-done">
            <span className="text-sm font-semibold font-['Manrope'] text-emerald-800 dark:text-emerald-300">
              ✓ {bg ? `Импортирани са ${result ? result.count : job.importedPointIds.length} точки.` : `${result ? result.count : job.importedPointIds.length} points imported.`}
            </span>
            <Link to={`/points?projectId=${job.project}`} className={primary}>{bg ? 'Отвори точките' : 'Open points'}</Link>
          </div>
        )}
        {error && <div role="alert" className="p-2 rounded-lg bg-red-50 text-red-700 text-sm font-['Manrope']">{error}</div>}
        {conflicts && (
          <ul className="flex flex-col gap-1 p-2 rounded-lg bg-red-50 dark:bg-red-950/20 text-sm font-['Manrope'] text-red-800 dark:text-red-300" data-testid="capture-conflicts">
            {conflicts.map((c) => (
              <li key={`${c.row}-${c.name}`}>
                <button type="button" className="underline" onClick={() => handleSelect(c.row, 0)}>
                  {bg ? `Ред ${c.row + 1}: „${c.name}“ вече съществува в проекта` : `Row ${c.row + 1}: "${c.name}" already exists in the project`}
                </button>
              </li>
            ))}
          </ul>
        )}
        {tableIssues.length > 0 && (
          <ul className="text-xs text-neutral-600 dark:text-zinc-300 font-['Manrope'] list-disc pl-5">
            {tableIssues.map((i, n) => <li key={`${i.code}-${n}`}>{i.severity === 'error' ? '✕ ' : '! '}{i.message}</li>)}
          </ul>
        )}
        {quality.length > 0 && (
          <p className="text-xs text-amber-700 dark:text-amber-400 font-['Manrope']">
            ! {bg ? 'Качество на снимката: ' : 'Image quality: '}{quality.map((w) => QUALITY[w] ? QUALITY[w][bg ? 0 : 1] : w).join(', ')}
          </p>
        )}
      </div>

      {/* DESKTOP: image left, table right */}
      <div className="hidden md:grid md:grid-cols-2 gap-4 items-start">
        <CaptureImagePane imageUrl={imageUrl} size={reviewSize} selectedBbox={selectedBbox} bg={bg} />
        <CaptureTable table={job.table} selected={selected} onSelect={handleSelect} onCommit={handleCommit} onMapColumn={handleMapColumn} disabled={locked} bg={bg} />
      </div>

      {/* MOBILE: image, then one row card at a time */}
      <div className="md:hidden flex flex-col gap-3">
        <CaptureImagePane imageUrl={imageUrl} size={reviewSize} selectedBbox={selectedBbox} bg={bg} />
        <CaptureRowStepper table={job.table} rowIndex={rowIndex} onRowChange={(r) => { setRowIndex(r); setSelected({ row: r, col: 0 }); }} selected={selected} onSelect={handleSelect} onCommit={handleCommit} onMapColumn={handleMapColumn} disabled={locked} bg={bg} />
      </div>
    </div>
  );
};

const QUALITY = {
  LOW_RESOLUTION: ['ниска резолюция', 'low resolution'],
  BLURRY: ['размазана', 'blurry'],
  LOW_CONTRAST: ['нисък контраст', 'low contrast'],
  DARK: ['тъмна', 'dark'],
  OVEREXPOSED: ['преекспонирана', 'overexposed'],
};

export default CaptureReview;
