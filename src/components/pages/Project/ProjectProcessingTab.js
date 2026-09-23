import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fieldProcessingApi } from '../../../services/fieldProcessingApi';
import { reportsApi } from '../../../services/reportsApi';
import { statusLabel, statusTone, fmtCoord, runCounts } from '../../../utils/fieldProcessingView';
import { traverseTypeLabel, closureUnavailableMessage, fmtRelativeClosure, hasAdjustment } from '../../../utils/traverseView';
import { statusLabel as sharedStatusLabel, statusTone as sharedStatusTone, polarRunStatusKey, traverseRunStatusKey } from '../../../utils/statusLabels';
import { reportTypeLabel } from '../../../utils/reportLabels';

const formatWhen = (iso, bg) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString(bg ? 'bg-BG' : 'en-GB', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
};

/** Read-only detail for one POLAR run: every setup's observations, no start/save controls. */
const PolarRunDetail = ({ run, bg }) => (
  <div className="flex flex-col gap-3">
    {run.setups.map((setup) => (
      <div key={setup.index} className="flex flex-col gap-1.5">
        <div className="text-xs font-['Manrope'] text-neutral-600 dark:text-zinc-300">
          <span className="font-semibold text-black dark:text-white">{bg ? 'Станция' : 'Station'} {setup.station.identifier}</span>
          {setup.orientation && <span> · {bg ? 'Ориентир' : 'Orientation'} {setup.orientation.identifier}</span>}
        </div>
        {setup.setupError ? (
          <p className="text-xs text-red-700 dark:text-red-400 font-['Manrope']">✕ {setup.setupError}</p>
        ) : (
          <div className="overflow-auto rounded-lg border border-gray-100 dark:border-zinc-800">
            <table className="min-w-full text-left border-collapse text-xs">
              <thead className="bg-stone-50 dark:bg-zinc-800">
                <tr>{[bg ? 'Цел' : 'Target', 'X', 'Y', 'H', bg ? 'Статус' : 'Status'].map((h) => <th key={h} className="p-1.5 font-semibold text-neutral-600 dark:text-zinc-300 font-['Manrope']">{h}</th>)}</tr>
              </thead>
              <tbody>
                {setup.observations.map((o) => (
                  <tr key={o.index} className={`border-t border-gray-100 dark:border-zinc-800 ${statusTone(o.status)}`}>
                    <td className="p-1.5 font-mono">{o.target}</td>
                    <td className="p-1.5 font-mono">{fmtCoord(o.x)}</td>
                    <td className="p-1.5 font-mono">{fmtCoord(o.y)}</td>
                    <td className="p-1.5 font-mono">{fmtCoord(o.h)}</td>
                    <td className="p-1.5">{statusLabel(o.status, bg)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    ))}
  </div>
);

/** Read-only detail for one TRAVERSE run: closure summary + the ordered leg table, no start/save controls. */
const TraverseRunDetail = ({ run, bg }) => {
  const t = run.traverse;
  const adjusted = hasAdjustment(t);
  return (
    <div className="flex flex-col gap-3">
      <div className="text-xs font-['Manrope'] text-neutral-700 dark:text-zinc-300">
        {t.closure.available ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1">
            <span>{bg ? 'Обща дължина' : 'Total length'}: {fmtCoord(t.closure.totalLength)} m</span>
            <span>{bg ? 'Линейна невръзка' : 'Linear misclosure'}: {fmtCoord(t.closure.linearMisclosure)} m</span>
            <span>{bg ? 'Относителна невръзка' : 'Relative closure'}: {t.closure.perfectClosure ? (bg ? 'точно съвпадение' : 'exact match') : fmtRelativeClosure(t.closure.relativeClosureDenominator, bg)}</span>
          </div>
        ) : (
          <p className="text-neutral-500 dark:text-zinc-400">{closureUnavailableMessage(t.closure.reason, bg)}</p>
        )}
      </div>
      <div className="overflow-auto rounded-lg border border-gray-100 dark:border-zinc-800">
        <table className="min-w-full text-left border-collapse text-xs">
          <thead className="bg-stone-50 dark:bg-zinc-800">
            <tr>
              {[bg ? 'Станция' : 'Station', bg ? 'Цел' : 'Target', `${bg ? 'Сурови' : 'Raw'} X`, `${bg ? 'Сурови' : 'Raw'} Y`, `${bg ? 'Изравнени' : 'Adjusted'} X`, `${bg ? 'Изравнени' : 'Adjusted'} Y`, bg ? 'Статус' : 'Status'].map((h) => (
                <th key={h} className="p-1.5 font-semibold text-neutral-600 dark:text-zinc-300 font-['Manrope']">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {t.legs.map((l) => (
              <tr key={l.index} className={`border-t border-gray-100 dark:border-zinc-800 ${statusTone(l.status)}`}>
                <td className="p-1.5 font-mono">{l.from}</td>
                <td className="p-1.5 font-mono">{l.to}</td>
                <td className="p-1.5 font-mono">{fmtCoord(l.rawX)}</td>
                <td className="p-1.5 font-mono">{fmtCoord(l.rawY)}</td>
                <td className="p-1.5 font-mono">{adjusted ? fmtCoord(l.adjustedX) : (bg ? 'Не е приложимо' : 'Not applicable')}</td>
                <td className="p-1.5 font-mono">{adjusted ? fmtCoord(l.adjustedY) : (bg ? 'Не е приложимо' : 'Not applicable')}</td>
                <td className="p-1.5">{statusLabel(l.status, bg)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const RunCard = ({ run, projectId, bg, expanded, onToggle }) => {
  const isTraverse = run.processingType === 'traverse';
  const badge = isTraverse ? (bg ? 'Полигонов ход' : 'Traverse') : (bg ? 'Полярна обработка' : 'Polar');
  const reportType = isTraverse ? 'TRAVERSE_PROCESSING_REPORT' : 'POLAR_PROCESSING_REPORT';
  const [genStage, setGenStage] = useState('idle'); // idle | confirm | generating | done
  const [genError, setGenError] = useState('');
  const [genReport, setGenReport] = useState(null);

  let title;
  let sharedStatus;
  let rowCount;
  if (isTraverse) {
    const t = run.traverse;
    title = `${traverseTypeLabel(t.traverseType, bg)} · ${t.startIdentifier}${t.endIdentifier ? ` → ${t.endIdentifier}` : ''}`;
    sharedStatus = traverseRunStatusKey(t.status);
    rowCount = t.legs.length;
  } else {
    const targetCount = run.setups.reduce((s, setup) => s + setup.observations.length, 0);
    const counts = run.setups.reduce((acc, setup) => {
      const c = runCounts({ setups: [setup] });
      Object.keys(c).forEach((k) => { acc[k] = (acc[k] || 0) + c[k]; });
      return acc;
    }, {});
    const stations = run.setups.map((s) => s.station.identifier).join(', ');
    title = `${bg ? 'Станция' : 'Station'} ${stations} · ${targetCount} ${bg ? 'цели' : 'targets'}`;
    sharedStatus = polarRunStatusKey(counts);
    rowCount = targetCount;
  }

  const generateReport = async () => {
    setGenStage('generating');
    setGenError('');
    try {
      const created = await reportsApi.createReport({ reportType, projectId, sourceId: run.id });
      setGenReport(created);
      setGenStage('done');
    } catch (e) {
      setGenError(e.message);
      setGenStage('idle');
    }
  };

  return (
    <div className="flex flex-col gap-2 p-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900" data-testid="processing-run-card">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold font-['Manrope'] ${isTraverse ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300' : 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300'}`}>{badge}</span>
            <span className={`text-xs font-semibold font-['Manrope'] ${sharedStatusTone(sharedStatus)}`}>{sharedStatusLabel(sharedStatus, bg)}</span>
          </div>
          <span className="text-sm font-medium font-['Manrope'] text-black dark:text-white">{title}</span>
          <span className="text-[11px] text-neutral-400 font-['Manrope']">{formatWhen(run.createdAt, bg)}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {run.generatedPointIds.length > 0 && (
            <Link to={`/points?projectId=${projectId}`} className="text-xs font-['Manrope'] underline text-emerald-700 dark:text-emerald-400" data-testid="processing-run-points-link">
              {run.generatedPointIds.length} {bg ? 'генерирани точки' : 'generated points'}
            </Link>
          )}
          <Link to={`/capture?projectId=${projectId}&jobId=${run.source.captureJobId}`} className="text-xs font-['Manrope'] underline text-neutral-500 dark:text-zinc-400" data-testid="processing-run-source-link">
            {bg ? 'Изходен карнет' : 'Source notebook'}
          </Link>
          <button type="button" onClick={onToggle} className="text-xs font-['Manrope'] underline text-black dark:text-white" data-testid="processing-run-toggle">
            {expanded ? (bg ? 'Скрий детайли' : 'Hide details') : (bg ? 'Детайли' : 'Details')}
          </button>
          {genStage === 'idle' && (
            <button type="button" onClick={() => setGenStage('confirm')} className="text-xs font-['Manrope'] underline text-orange-700 dark:text-orange-400" data-testid="processing-run-generate-report">
              {bg ? 'Генерирай отчет' : 'Generate report'}
            </button>
          )}
        </div>
      </div>

      {genStage === 'confirm' && (
        <div className="p-2.5 rounded-lg bg-orange-50 dark:bg-orange-950/20 outline outline-1 outline-orange-200 dark:outline-orange-900/50 flex flex-col gap-2" role="alertdialog" aria-label={bg ? 'Потвърждение' : 'Confirmation'} data-testid="processing-run-report-confirm">
          <p className="text-xs font-['Manrope'] text-black dark:text-white">
            {bg
              ? `Ще бъде генериран ${reportTypeLabel(reportType, bg)} с ${rowCount} реда.`
              : `A ${reportTypeLabel(reportType, bg)} with ${rowCount} rows will be generated.`}
          </p>
          <div className="flex gap-2">
            <button type="button" onClick={generateReport} className="px-3 py-1.5 rounded-lg text-xs font-semibold font-['Manrope'] bg-black dark:bg-white text-white dark:text-black" data-testid="processing-run-report-go">
              {bg ? 'Генерирай' : 'Generate'}
            </button>
            <button type="button" onClick={() => setGenStage('idle')} className="px-3 py-1.5 rounded-lg text-xs font-medium font-['Manrope'] bg-white dark:bg-zinc-900 outline outline-1 outline-gray-200 dark:outline-zinc-700">
              {bg ? 'Отказ' : 'Cancel'}
            </button>
          </div>
        </div>
      )}
      {genStage === 'generating' && <p className="text-xs text-neutral-500 font-['Manrope']">{bg ? 'Генериране...' : 'Generating...'}</p>}
      {genStage === 'done' && genReport && (
        <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 outline outline-1 outline-emerald-200 dark:outline-emerald-900/50 flex flex-wrap items-center gap-2" role="status" data-testid="processing-run-report-done">
          <span className="text-xs font-semibold font-['Manrope'] text-emerald-800 dark:text-emerald-300">✓ {bg ? 'Отчетът е генериран.' : 'Report generated.'}</span>
          <Link to={`/project?projectId=${projectId}&tab=documents`} className="text-xs font-['Manrope'] underline text-black dark:text-white">
            {bg ? 'Отвори в Документи' : 'Open in Documents'}
          </Link>
        </div>
      )}
      {genError && <p className="text-xs text-red-600 font-['Manrope']" role="alert">{genError}</p>}

      {expanded && (
        <div className="pt-2 border-t border-gray-100 dark:border-zinc-800" data-testid="processing-run-detail">
          {isTraverse ? <TraverseRunDetail run={run} bg={bg} /> : <PolarRunDetail run={run} bg={bg} />}
        </div>
      )}
    </div>
  );
};

/**
 * V2.4.3 "Обработки": project-wide, read-only list of every Field Processing run (polar V2.4.1 and traverse
 * V2.4.2), newest first. Opening a run never mutates it - historical authoritative runs stay reproducible and
 * immutable (only the already-existing Field Notebook screen can start a NEW run or explicitly "Създай точки").
 */
const ProjectProcessingTab = ({ projectId, bg = true }) => {
  const [runs, setRuns] = useState(null); // null = loading
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    if (!projectId) return undefined;
    let cancelled = false;
    setRuns(null);
    setError('');
    fieldProcessingApi.listRunsForProject(projectId)
      .then((data) => { if (!cancelled) setRuns(data || []); })
      .catch((e) => { if (!cancelled) { setError(e.message); setRuns([]); } });
    return () => { cancelled = true; };
  }, [projectId]);

  return (
    <div className="flex flex-col gap-3" data-testid="project-processing-tab">
      <div className="flex flex-col gap-1">
        <h2 className="text-sm font-bold font-['Manrope'] text-black dark:text-white">{bg ? 'Обработки' : 'Processing'}</h2>
        <p className="text-xs text-neutral-500 dark:text-zinc-400 font-['Manrope']">
          {bg
            ? 'Всички полярни обработки и полигонови ходове в проекта. Нова обработка се стартира от потвърден полеви карнет в „Теренни данни“.'
            : 'Every polar and traverse processing run in this project. Start a new one from a confirmed field notebook under "Field Data".'}
        </p>
      </div>
      {runs === null && <p className="text-xs text-neutral-400 font-['Manrope']" role="status">{bg ? 'Зареждане...' : 'Loading...'}</p>}
      {error && <p className="text-xs text-red-600 font-['Manrope']" role="alert">{error}</p>}
      {runs && runs.length === 0 && !error && (
        <p className="text-xs text-neutral-400 font-['Manrope']" data-testid="project-processing-empty">
          {bg ? 'Все още няма обработки за този проект.' : 'No processing runs for this project yet.'}
        </p>
      )}
      {runs && runs.length > 0 && (
        <div className="flex flex-col gap-2">
          {runs.map((run) => (
            <RunCard
              key={run.id} run={run} projectId={projectId} bg={bg}
              expanded={expandedId === run.id}
              onToggle={() => setExpandedId(expandedId === run.id ? null : run.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectProcessingTab;
