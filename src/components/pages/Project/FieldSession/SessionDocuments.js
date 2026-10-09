import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { reportsApi } from '../../../../services/reportsApi';
import { reportTypeLabel, fmtGeneratedAt } from '../../../../utils/reportLabels';

const BTN_GHOST = "min-h-[44px] px-3 py-2 rounded-lg text-sm font-semibold font-['Manrope'] bg-white dark:bg-zinc-900 outline outline-1 outline-gray-300 dark:outline-zinc-700 disabled:opacity-40";

/** The documents generated from this session's processing, and a way to generate one per processing run. */
const SessionDocuments = ({ session, projectId, onChanged, bg = true }) => {
  const [busyRun, setBusyRun] = useState('');
  const [error, setError] = useState('');

  const generate = async (run) => {
    setBusyRun(run.id);
    setError('');
    try {
      await reportsApi.createReport({
        reportType: run.processingType === 'traverse' ? 'TRAVERSE_PROCESSING_REPORT' : 'POLAR_PROCESSING_REPORT',
        projectId,
        sourceId: run.id,
      });
      await onChanged();
    } catch (e) {
      setError(bg ? 'Отчетът не можа да бъде генериран. Опитайте отново.' : 'The report could not be generated. Please try again.');
    } finally {
      setBusyRun('');
    }
  };

  if (!session.confirmed) {
    return <p className="text-sm text-neutral-600 dark:text-zinc-300 font-['Manrope']" data-testid="session-documents-locked">{bg ? 'Документи се генерират след обработка на потвърдена сесия.' : 'Documents are generated after a confirmed session is processed.'}</p>;
  }

  return (
    <div className="flex flex-col gap-3" data-testid="session-documents">
      <section className="flex flex-col gap-2 p-3 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900" aria-label={bg ? 'Генериране на отчет' : 'Generate a report'}>
        <h3 className="text-sm font-bold font-['Manrope'] text-black dark:text-white">{bg ? 'Отчет за обработка' : 'Processing report'}</h3>
        {session.runs.length === 0 && <p className="text-xs text-neutral-400 font-['Manrope']" data-testid="session-documents-no-runs">{bg ? 'Първо обработете измерванията.' : 'Process the measurements first.'}</p>}
        <ul className="flex flex-col gap-2">
          {session.runs.map((r) => (
            <li key={r.id} className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-['Manrope'] text-black dark:text-white">{r.processingType === 'traverse' ? (bg ? 'Полигонов ход' : 'Traverse') : (bg ? 'Полярна обработка' : 'Polar processing')}{r.start ? ` ${r.start}${r.end ? ` → ${r.end}` : ''}` : ''}</span>
              <button type="button" className={BTN_GHOST} onClick={() => generate(r)} disabled={busyRun === r.id} data-testid="session-report-generate">
                {busyRun === r.id ? (bg ? 'Генериране...' : 'Generating...') : (bg ? 'Генерирай отчет' : 'Generate report')}
              </button>
            </li>
          ))}
        </ul>
        {error && <div role="alert" className="p-2 rounded-lg bg-red-50 text-red-700 text-sm font-['Manrope']">{error}</div>}
      </section>

      <section className="flex flex-col gap-2" aria-label={bg ? 'Генерирани отчети' : 'Generated reports'}>
        <h3 className="text-sm font-bold font-['Manrope'] text-black dark:text-white">{bg ? 'Генерирани отчети' : 'Generated reports'} ({session.reports.length})</h3>
        {session.reports.length === 0 && <p className="text-xs text-neutral-400 font-['Manrope']" data-testid="session-reports-empty">{bg ? 'Още няма генерирани отчети за тази сесия.' : 'No reports generated for this session yet.'}</p>}
        <ul className="flex flex-col divide-y divide-gray-100 dark:divide-zinc-800">
          {session.reports.map((rep) => (
            <li key={rep.id} className="py-2 text-sm font-['Manrope'] text-black dark:text-white" data-testid="session-report">
              {rep.title} <span className="text-xs text-neutral-500">· {rep.title === reportTypeLabel(rep.reportType, bg) ? null : <>{reportTypeLabel(rep.reportType, bg)} · </>}{fmtGeneratedAt(rep.generatedAt, bg)}</span>
            </li>
          ))}
        </ul>
        <Link to={`/project?projectId=${encodeURIComponent(projectId)}&tab=documents`} className="self-start text-sm font-semibold underline font-['Manrope'] text-neutral-700 dark:text-zinc-200" data-testid="session-documents-link">{bg ? 'Към „Документи“ за изтегляне' : 'Go to "Documents" to download'}</Link>
      </section>
    </div>
  );
};

export default SessionDocuments;
