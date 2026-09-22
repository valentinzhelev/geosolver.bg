import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fieldProcessingApi } from '../../../../services/fieldProcessingApi';
import {
  statusLabel, statusTone, fmtCoord, fmtAngle, runSummaryText, savableCount, setupErrorMessage,
} from '../../../../utils/fieldProcessingView';

const CONVENTIONS = [
  { value: '', bg: 'Не изчислявай коти (само X/Y)', en: 'Do not calculate heights (X/Y only)' },
  { value: 'zenith', bg: 'Зенитно разстояние (0 = зенит, 100 = хоризонт)', en: 'Zenith angle (0 = zenith, 100 = horizontal)' },
  { value: 'vertical', bg: 'Вертикален ъгъл (0 = хоризонт, знак нагоре/надолу)', en: 'Vertical angle (0 = horizontal, signed up/down)' },
];

/**
 * V2.4.1 "Обработи измерванията": deterministic geodetic processing over a CONFIRMED FieldObservationSet. Server-
 * authoritative throughout - this component only starts a run, shows the immutable result, and lets the user
 * explicitly save the calculated targets as project SurveyPoints ("Създай точки"). Reused from the Field Notebook
 * workflow (NotebookReview), never a disconnected calculator screen.
 */
const FieldProcessingResults = ({ fieldObservationSetId, projectId, bg = true }) => {
  const [phase, setPhase] = useState('loading'); // loading | idle | running | ready | error
  const [run, setRun] = useState(null);
  const [convention, setConvention] = useState('');
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null); // {setupIndex, index} of the observation shown in detail
  const [saveStage, setSaveStage] = useState('idle'); // idle | confirm | saving | done
  const [saveResult, setSaveResult] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fieldProcessingApi.listRuns(fieldObservationSetId)
      .then((runs) => {
        if (cancelled) return;
        if (runs && runs.length) {
          setRun(runs[0]);
          setPhase('ready');
        } else {
          setPhase('idle');
        }
      })
      .catch(() => { if (!cancelled) setPhase('idle'); });
    return () => { cancelled = true; };
  }, [fieldObservationSetId]);

  const start = async () => {
    setPhase('running');
    setError('');
    try {
      const created = await fieldProcessingApi.createRun(fieldObservationSetId, convention || null);
      setRun(created);
      setPhase('ready');
      setSaveStage('idle');
      setSaveResult(null);
      setSelected(null);
    } catch (e) {
      setError(e.message);
      setPhase('idle');
    }
  };

  const save = async () => {
    setSaveStage('saving');
    try {
      const res = await fieldProcessingApi.createPoints(run.id);
      setRun(res.data);
      setSaveResult({ created: res.created, skipped: res.skipped });
      setSaveStage('done');
    } catch (e) {
      setSaveStage('idle');
      setError(e.message);
    }
  };

  const primary = "px-4 py-2 rounded-lg text-sm font-semibold font-['Manrope'] bg-black dark:bg-white text-white dark:text-black disabled:opacity-40 disabled:cursor-not-allowed";
  const ghost = "px-4 py-2 rounded-lg text-sm font-medium font-['Manrope'] bg-white dark:bg-zinc-900 outline outline-1 outline-gray-200 dark:outline-zinc-700";

  if (phase === 'loading') return <p className="text-sm text-neutral-400 font-['Manrope']" role="status">{bg ? 'Зареждане...' : 'Loading...'}</p>;

  if (phase === 'idle' || phase === 'running') {
    return (
      <div className="flex flex-col gap-3 p-4 rounded-xl bg-white dark:bg-zinc-900 outline outline-1 outline-gray-200 dark:outline-zinc-800" data-testid="field-processing-start">
        <h3 className="text-sm font-bold font-['Manrope'] text-black dark:text-white">{bg ? 'Обработи измерванията' : 'Process the observations'}</h3>
        <p className="text-xs text-neutral-500 dark:text-zinc-400 font-['Manrope']">
          {bg
            ? 'Изчислява координати за целите от станцията и ориентира. Не се създават точки, докато изрично не потвърдите.'
            : 'Calculates target coordinates from the station and orientation. No points are created until you explicitly confirm.'}
        </p>
        <label className="flex flex-col gap-1 text-xs font-['Manrope'] text-neutral-600 dark:text-zinc-300">
          {bg ? 'Конвенция за вертикалния ъгъл' : 'Vertical-angle convention'}
          <select
            value={convention}
            onChange={(e) => setConvention(e.target.value)}
            disabled={phase === 'running'}
            className="px-2 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-sm"
            aria-label={bg ? 'Конвенция за вертикалния ъгъл' : 'Vertical-angle convention'}
          >
            {CONVENTIONS.map((c) => <option key={c.value} value={c.value}>{bg ? c.bg : c.en}</option>)}
          </select>
        </label>
        {error && <div role="alert" className="p-2 rounded-lg bg-red-50 text-red-700 text-sm font-['Manrope']">{error}</div>}
        <button type="button" className={`${primary} self-start`} disabled={phase === 'running'} onClick={start} data-testid="field-processing-start-button">
          {phase === 'running' ? (bg ? 'Изчисляване...' : 'Calculating...') : bg ? 'Обработи измерванията' : 'Process the observations'}
        </button>
      </div>
    );
  }

  const canSave = savableCount(run) > 0 && run.generatedPointIds.length === 0;

  return (
    <div className="flex flex-col gap-4" data-testid="field-processing-results">
      <div className="flex flex-col gap-2 p-3 md:p-4 rounded-xl bg-white dark:bg-zinc-900 outline outline-1 outline-gray-200 dark:outline-zinc-800">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-semibold font-['Manrope'] text-black dark:text-white" data-testid="field-processing-summary">{runSummaryText(run, bg)}</p>
          <div className="flex gap-2">
            <button type="button" className={ghost} onClick={() => { setPhase('idle'); setError(''); }} data-testid="field-processing-recalculate">
              {bg ? 'Преизчисли' : 'Recalculate'}
            </button>
            {saveStage !== 'confirm' && run.generatedPointIds.length === 0 && (
              <button type="button" className={primary} disabled={!canSave} onClick={() => setSaveStage('confirm')} data-testid="field-processing-save-start">
                {bg ? 'Създай точки' : 'Create points'}
              </button>
            )}
          </div>
        </div>
        {saveStage === 'confirm' && (
          <div className="flex flex-col gap-2 p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20 outline outline-1 outline-orange-200 dark:outline-orange-900/50" role="alertdialog" aria-label={bg ? 'Потвърждение' : 'Confirmation'}>
            <p className="text-sm font-['Manrope'] text-black dark:text-white">
              {bg ? `Ще бъдат създадени до ${savableCount(run)} точки (готови и само X/Y). Досега нищо не е записано.` : `Up to ${savableCount(run)} points will be created (ready and XY-only). Nothing has been saved so far.`}
            </p>
            <div className="flex flex-wrap gap-2">
              <button type="button" className={primary} onClick={save} data-testid="field-processing-save-go">{bg ? 'Създай' : 'Create'}</button>
              <button type="button" className={ghost} onClick={() => setSaveStage('idle')}>{bg ? 'Отказ' : 'Cancel'}</button>
            </div>
          </div>
        )}
        {saveStage === 'saving' && <p className="text-sm text-neutral-500 font-['Manrope']">{bg ? 'Създаване...' : 'Creating...'}</p>}
        {saveStage === 'done' && saveResult && (
          <div className="flex flex-wrap items-center gap-3 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 outline outline-1 outline-emerald-200 dark:outline-emerald-900/50" role="status" data-testid="field-processing-save-done">
            <span className="text-sm font-semibold font-['Manrope'] text-emerald-800 dark:text-emerald-300">
              ✓ {bg ? `Създадени са ${saveResult.created.length} точки.` : `${saveResult.created.length} points created.`}
              {saveResult.skipped.length > 0 && (bg ? ` (${saveResult.skipped.length} пропуснати - вижте конфликтите)` : ` (${saveResult.skipped.length} skipped - see conflicts)`)}
            </span>
            <Link to={`/points?projectId=${projectId}`} className={primary}>{bg ? 'Точки на проекта' : 'Project points'}</Link>
          </div>
        )}
        {saveResult && saveResult.skipped.length > 0 && (
          <ul className="text-xs text-neutral-600 dark:text-zinc-300 font-['Manrope'] list-disc pl-5" data-testid="field-processing-skipped">
            {saveResult.skipped.map((s, i) => (
              <li key={`${s.setup}-${s.observation}-${i}`}>{s.target}: {s.reason === 'NAME_CONFLICT' ? (bg ? 'вече има точка с това име' : 'a point with this name already exists') : (bg ? 'вече е създадена' : 'already created')}</li>
            ))}
          </ul>
        )}
        {error && <div role="alert" className="p-2 rounded-lg bg-red-50 text-red-700 text-sm font-['Manrope']">{error}</div>}
      </div>

      {run.setups.map((setup) => (
        <div key={setup.index} className="flex flex-col gap-2 p-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900">
          <div className="text-xs font-['Manrope'] text-neutral-600 dark:text-zinc-300">
            <span className="font-semibold text-black dark:text-white">{bg ? 'Станция' : 'Station'} {setup.station.identifier}</span>
            {setup.orientation && <span> · {bg ? 'Ориентир' : 'Backsight'} {setup.orientation.identifier}</span>}
            {setup.orientationConstantGon !== null && <span> · {bg ? 'Ориентировъчен ъгъл' : 'Orientation constant'} {fmtAngle(setup.orientationConstantGon)}</span>}
          </div>
          {setup.setupError && (
            <p className="text-xs text-red-700 dark:text-red-400 font-['Manrope']" data-testid="field-processing-setup-error">✕ {setupErrorMessage(setup, bg)}</p>
          )}
          {!setup.setupError && (
            <div className="overflow-auto rounded-lg border border-gray-100 dark:border-zinc-800">
              <table className="min-w-full text-left border-collapse text-xs">
                <thead className="bg-stone-50 dark:bg-zinc-800">
                  <tr>
                    {[bg ? 'Цел' : 'Target', 'X', 'Y', 'H', bg ? 'Статус' : 'Status'].map((h) => (
                      <th key={h} className="p-2 font-semibold text-neutral-600 dark:text-zinc-300 font-['Manrope']">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {setup.observations.map((o) => {
                    const isSelected = selected && selected.setupIndex === setup.index && selected.index === o.index;
                    return (
                      <React.Fragment key={o.index}>
                        <tr
                          className={`border-t border-gray-100 dark:border-zinc-800 cursor-pointer ${statusTone(o.status)}`}
                          onClick={() => setSelected(isSelected ? null : { setupIndex: setup.index, index: o.index })}
                          data-testid="field-processing-row"
                          data-status={o.status}
                        >
                          <td className="p-2 font-mono">{o.target}</td>
                          <td className="p-2 font-mono">{fmtCoord(o.x)}</td>
                          <td className="p-2 font-mono">{fmtCoord(o.y)}</td>
                          <td className="p-2 font-mono">{fmtCoord(o.h)}</td>
                          <td className="p-2">{statusLabel(o.status, bg)}</td>
                        </tr>
                        {isSelected && (
                          <tr className="border-t border-gray-100 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-800/50">
                            <td colSpan={5} className="p-3 text-[11px] font-['Manrope'] text-neutral-600 dark:text-zinc-300" data-testid="field-processing-detail">
                              <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                <span>{bg ? 'Посока' : 'Direction'}: {fmtAngle(o.direction)}</span>
                                <span>{bg ? 'Хоризонтално разстояние' : 'Horizontal distance'}: {fmtCoord(o.horizontalDistance)}</span>
                                <span>ΔX: {fmtCoord(o.deltaX)}</span>
                                <span>ΔY: {fmtCoord(o.deltaY)}</span>
                              </div>
                              {o.heightReason && <p className="mt-1 text-amber-700 dark:text-amber-400">! {(o.warnings.find((w) => w.code === o.heightReason) || {}).message}</p>}
                              {(o.errors || []).map((er, i) => <p key={i} className="mt-1 text-red-700 dark:text-red-400">✕ {er.message}</p>)}
                              {(o.warnings || []).filter((w) => w.code !== o.heightReason).map((w, i) => <p key={i} className="mt-1 text-amber-700 dark:text-amber-400">! {w.message}</p>)}
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default FieldProcessingResults;
