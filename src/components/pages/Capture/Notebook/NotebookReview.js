import React, { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { captureApi } from '../../../../services/captureApi';
import CaptureImagePane from '../CaptureImagePane';
import CaptureCandidatePanel from '../CaptureCandidatePanel';
import NotebookStationCard from './NotebookStationCard';
import NotebookObservationsTable from './NotebookObservationsTable';
import NotebookRowStepper from './NotebookRowStepper';
import FieldProcessingResults from './FieldProcessingResults';
import { canConfirmNotebookJob, notebookObservations, describeCaptureError, notebookImportCount, notebookSummaryText, fieldAddrKey } from '../../../../utils/captureView';

/** Finds the cell (and a row-shaped wrapper for CaptureCandidatePanel/onCommit) for a field address. */
function cellAtAddr(job, addr) {
  if (!addr || !job.notebook) return { cell: null, row: null };
  const setup = job.notebook.setups.find((s) => s.index === addr.setup);
  if (!setup) return { cell: null, row: null };
  if (addr.section === 'station') return { cell: setup.station[addr.field], row: { index: 0 } };
  if (addr.section === 'orientation') return { cell: setup.orientation && setup.orientation[addr.field], row: { index: 0 } };
  const row = setup.observations.find((r) => r.index === addr.row);
  if (!row) return { cell: null, row: null };
  const cell = row.cells[row.cols.findIndex((c) => c.field === addr.field)];
  return { cell: cell || null, row };
}

/**
 * The Field Notebook review workspace (V2.3): a dedicated workspace, not the coordinate-table UI overloaded - a
 * notebook page may have several stations/setups, each with its own station/orientation card and observation
 * table, which the coordinate-table's single-grid UI has no room for.
 */
const NotebookReview = ({ initialJob, imageUrl, bg = true }) => {
  const [job, setJob] = useState(initialJob);
  const setups = job.notebook ? job.notebook.setups : [];
  const [setupIndex, setSetupIndex] = useState(0);
  const setup = setups.find((s) => s.index === setupIndex) || setups[0];
  const [selectedAddr, setSelectedAddr] = useState(null);
  const [rowIndex, setRowIndex] = useState(() => {
    const first = setup ? notebookObservations(setup)[0] : null;
    return first ? first.index : 0;
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [stage, setStage] = useState('idle'); // idle | ask | importing | done
  const [result, setResult] = useState(null);

  const confirmed = job.status === 'confirmed';
  const locked = busy || confirmed || stage === 'importing';
  const reviewSize = job.source && job.source.review;

  const { cell: selectedCell, row: selectedRow } = useMemo(() => cellAtAddr(job, selectedAddr), [job, selectedAddr]);
  const selectedBbox = selectedCell ? selectedCell.bbox : null;

  const handleSelect = useCallback((addr) => {
    setSelectedAddr(addr);
    if (addr && addr.setup !== setupIndex) setSetupIndex(addr.setup);
    if (addr && addr.section === 'observation') setRowIndex(addr.row);
  }, [setupIndex]);

  const send = useCallback(async (body) => {
    setBusy(true);
    setError('');
    try {
      const updated = await captureApi.patchJob(job.id, { ...body, baseRevision: job.revision });
      setJob(updated);
    } catch (e) {
      if (e.code === 'REVISION_CONFLICT') {
        try { setJob(await captureApi.getJob(job.id)); } catch { /* keep the old view */ }
      }
      setError(describeCaptureError(e, bg));
    } finally {
      setBusy(false);
    }
  }, [job.id, job.revision, bg]);

  const handleCommit = useCallback((addr, value) => send({ edits: [{ ...addr, value }] }), [send]);
  const handleMapColumn = useCallback((setupIdx, index, field) => send({ columns: [{ setup: setupIdx, index, field }] }), [send]);
  const handleToggleExclude = useCallback((setupIdx, index, excluded) => send({ rows: [{ setup: setupIdx, index, excluded }] }), [send]);

  const handleConfirm = async () => {
    setStage('importing');
    setError('');
    try {
      const res = await captureApi.confirmJob(job.id);
      setJob(res.data);
      setResult({ already: res.alreadyConfirmed, observationSetId: res.observationSetId });
      setStage('done');
    } catch (e) {
      setStage('idle');
      if (e.code === 'VALIDATION_ERRORS') {
        try { setJob(await captureApi.getJob(job.id)); } catch { /* keep the old view */ }
      }
      setError(describeCaptureError(e, bg));
    }
  };

  if (!setup) return <p className="text-sm text-neutral-400 font-['Manrope']">{bg ? 'Няма разпозната станция.' : 'No station recognised.'}</p>;

  const quality = (job.source && job.source.quality && job.source.quality.warnings) || [];
  const primary = "px-4 py-2 rounded-lg text-sm font-semibold font-['Manrope'] bg-black dark:bg-white text-white dark:text-black disabled:opacity-40 disabled:cursor-not-allowed";
  const ghost = "px-4 py-2 rounded-lg text-sm font-medium font-['Manrope'] bg-white dark:bg-zinc-900 outline outline-1 outline-gray-200 dark:outline-zinc-700";

  return (
    <div className="flex flex-col gap-4" data-testid="notebook-review">
      <div className="flex flex-col gap-2 p-3 md:p-4 rounded-xl bg-white dark:bg-zinc-900 outline outline-1 outline-gray-200 dark:outline-zinc-800">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-semibold font-['Manrope'] text-black dark:text-white" data-testid="notebook-summary" role="status">
            {confirmed ? (bg ? 'Импортирано · ' : 'Imported · ') : ''}{notebookSummaryText(job.validationSummary, bg)}
          </p>
          {!confirmed && stage !== 'ask' && (
            <button type="button" className={primary} disabled={!canConfirmNotebookJob(job) || locked} onClick={() => setStage('ask')} data-testid="notebook-confirm-start">
              {bg ? 'Потвърди и импортирай' : 'Confirm and import'}
            </button>
          )}
        </div>
        {!confirmed && stage === 'ask' && (
          <div className="flex flex-col gap-2 p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20 outline outline-1 outline-orange-200 dark:outline-orange-900/50" role="alertdialog" aria-label={bg ? 'Потвърждение на импорта' : 'Import confirmation'}>
            <p className="text-sm font-['Manrope'] text-black dark:text-white">
              {bg
                ? `Ще бъдат записани ${notebookImportCount(job)} наблюдения. Досега нищо не е записано.`
                : `${notebookImportCount(job)} observations will be saved. Nothing has been saved so far.`}
            </p>
            <div className="flex flex-wrap gap-2">
              <button type="button" className={primary} onClick={handleConfirm} data-testid="notebook-confirm-go">{bg ? 'Запиши' : 'Save'}</button>
              <button type="button" className={ghost} onClick={() => setStage('idle')}>{bg ? 'Отказ' : 'Cancel'}</button>
            </div>
          </div>
        )}
        {stage === 'importing' && <p className="text-sm text-neutral-500 font-['Manrope']">{bg ? 'Запис...' : 'Saving...'}</p>}
        {confirmed && (
          <div className="flex flex-wrap items-center gap-3 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 outline outline-1 outline-emerald-200 dark:outline-emerald-900/50" role="status" data-testid="notebook-done">
            <span className="text-sm font-semibold font-['Manrope'] text-emerald-800 dark:text-emerald-300">
              ✓ {bg
                ? (result && result.already ? 'Вече беше записано по-рано.' : 'Наблюденията са записани.')
                : (result && result.already ? 'Already saved earlier.' : 'The observations were saved.')}
            </span>
            <Link to={`/capture?projectId=${job.project}`} className={primary}>{bg ? 'Ново сканиране' : 'New capture'}</Link>
          </div>
        )}
        {error && <div role="alert" className="p-2 rounded-lg bg-red-50 text-red-700 text-sm font-['Manrope']">{error}</div>}
        {quality.length > 0 && (
          <p className="text-xs text-amber-700 dark:text-amber-400 font-['Manrope']">
            ! {bg ? 'Качество на снимката: ' : 'Image quality: '}{quality.join(', ')}
          </p>
        )}
        {setups.length > 1 && (
          <div className="flex flex-wrap gap-1.5" role="tablist" aria-label={bg ? 'Станции' : 'Setups'}>
            {setups.map((s) => (
              <button
                key={s.index} type="button" role="tab" aria-selected={s.index === setupIndex}
                onClick={() => { setSetupIndex(s.index); setSelectedAddr(null); const first = notebookObservations(s)[0]; setRowIndex(first ? first.index : 0); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-['Manrope'] ${s.index === setupIndex ? 'bg-black dark:bg-white text-white dark:text-black' : 'bg-white dark:bg-zinc-900 outline outline-1 outline-gray-200 dark:outline-zinc-700'}`}
                data-testid="notebook-setup-tab"
              >
                {s.station.point.rawText || `#${s.index + 1}`}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* DESKTOP: image left; station card + observations table + candidate panel right */}
      <div className="hidden md:grid md:grid-cols-2 gap-4 items-start">
        <CaptureImagePane imageUrl={imageUrl} size={reviewSize} selectedBbox={selectedBbox} bg={bg} />
        <div className="flex flex-col gap-4">
          <NotebookStationCard setup={setup} selectedKey={fieldAddrKey(selectedAddr)} onSelect={handleSelect} onCommit={handleCommit} disabled={locked} bg={bg} />
          <NotebookObservationsTable
            setup={setup} selectedKey={fieldAddrKey(selectedAddr)} onSelect={handleSelect} onCommit={handleCommit}
            onMapColumn={handleMapColumn} onToggleExclude={confirmed ? undefined : handleToggleExclude} disabled={locked} bg={bg}
          />
        </div>
        <CaptureCandidatePanel cell={selectedCell} row={selectedRow} imageUrl={imageUrl} onCommit={(r, c, v) => handleCommit(selectedAddr, v)} disabled={locked} bg={bg} />
      </div>

      {/* MOBILE: image, setup summary, one observation at a time, candidate panel */}
      <div className="md:hidden flex flex-col gap-3">
        <CaptureImagePane imageUrl={imageUrl} size={reviewSize} selectedBbox={selectedBbox} bg={bg} />
        <NotebookRowStepper
          setup={setup} rowIndex={rowIndex} onRowChange={setRowIndex} selectedKey={fieldAddrKey(selectedAddr)} onSelect={handleSelect}
          onCommit={handleCommit} onMapColumn={handleMapColumn} onToggleExclude={confirmed ? undefined : handleToggleExclude} disabled={locked} bg={bg}
        />
        <CaptureCandidatePanel cell={selectedCell} row={selectedRow} imageUrl={imageUrl} onCommit={(r, c, v) => handleCommit(selectedAddr, v)} disabled={locked} bg={bg} />
      </div>

      {/* V2.4.1: once confirmed, the Field Notebook workflow continues straight into processing - never a
          disconnected calculator screen. */}
      {confirmed && job.importedFieldObservationSetId && (
        <FieldProcessingResults fieldObservationSetId={job.importedFieldObservationSetId} projectId={job.project} bg={bg} />
      )}
    </div>
  );
};

export default NotebookReview;
