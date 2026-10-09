import React from 'react';
import { Link } from 'react-router-dom';
import FieldProcessingWorkflow from '../../Capture/Notebook/FieldProcessingWorkflow';
import { availableModes, noProcessingReason } from '../../../../utils/fieldSessionView';

const BTN_GHOST = "min-h-[44px] px-3 py-2 rounded-lg text-sm font-semibold font-['Manrope'] bg-white dark:bg-zinc-900 outline outline-1 outline-gray-300 dark:outline-zinc-700 disabled:opacity-40";

const runTitle = (run, bg) => {
  if (run.processingType === 'traverse') return `${bg ? 'Полигонов ход' : 'Traverse'}${run.start ? ` ${run.start}${run.end ? ` → ${run.end}` : ''}` : ''}`;
  return bg ? 'Полярна обработка' : 'Polar processing';
};
const fmtDate = (iso, bg) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleString(bg ? 'bg-BG' : 'en-GB', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
};

/**
 * "Обработи измерванията": processing from the session's CONFIRMED observations. Only the kinds the data supports
 * are offered (the server infers them); the existing polar/traverse workflow does the rest - the deterministic
 * engines stay authoritative and nothing is calculated here.
 */
const SessionProcessing = ({ session, projectId, onRefresh, refreshing, bg = true }) => {
  if (!session.confirmed) {
    return (
      <p className="text-sm text-neutral-600 dark:text-zinc-300 font-['Manrope']" data-testid="session-processing-locked">
        {bg ? 'Измерванията могат да се обработят след като сесията бъде потвърдена.' : 'The measurements can be processed once the session is confirmed.'}
      </p>
    );
  }
  const options = session.processingOptions;
  const modes = availableModes(options);
  const traverse = options && options.traverse && options.traverse.available
    ? { suggestedStart: options.traverse.suggestedStart, chain: options.traverse.chain, endCandidates: options.traverse.endCandidates, closesOnStart: options.traverse.closesOnStart }
    : null;

  return (
    <div className="flex flex-col gap-4" data-testid="session-processing">
      <h3 className="text-sm font-bold font-['Manrope'] text-black dark:text-white">{bg ? 'Обработи измерванията' : 'Process the measurements'}</h3>
      {modes.length > 0 && session.observationSetId ? (
        <FieldProcessingWorkflow fieldObservationSetId={session.observationSetId} projectId={projectId} bg={bg} availableModes={modes} traverseSuggestions={traverse} />
      ) : (
        <p className="text-sm text-neutral-600 dark:text-zinc-300 font-['Manrope']" data-testid="session-processing-none">{noProcessingReason(options, bg)}</p>
      )}

      <section className="flex flex-col gap-2 p-3 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900" aria-label={bg ? 'Обработки на сесията' : 'Processing of the session'} data-testid="session-runs">
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-sm font-bold font-['Manrope'] text-black dark:text-white">{bg ? 'Извършени обработки' : 'Processing done'} ({session.runs.length})</h4>
          <button type="button" className={BTN_GHOST} onClick={onRefresh} disabled={refreshing} data-testid="session-runs-refresh">{bg ? 'Обнови' : 'Refresh'}</button>
        </div>
        {session.runs.length === 0 && <p className="text-xs text-neutral-400 font-['Manrope']" data-testid="session-runs-empty">{bg ? 'Още няма обработки за тази сесия.' : 'No processing for this session yet.'}</p>}
        <ul className="flex flex-col divide-y divide-gray-100 dark:divide-zinc-800">
          {session.runs.map((r) => (
            <li key={r.id} className="py-2 flex flex-wrap items-center justify-between gap-2" data-testid="session-run">
              <span className="text-sm font-['Manrope'] text-black dark:text-white">{runTitle(r, bg)} <span className="text-xs text-neutral-500">· {fmtDate(r.createdAt, bg)} · {r.pointCount} {bg ? 'точки' : 'points'}</span></span>
              <Link to={`/project?projectId=${encodeURIComponent(projectId)}&tab=processing`} className="text-xs font-semibold underline font-['Manrope'] text-neutral-600 dark:text-zinc-300" data-testid="session-run-link">{bg ? 'Виж в „Обработки“' : 'See in "Processing"'}</Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default SessionProcessing;
