import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fieldProcessingApi } from '../../../../services/fieldProcessingApi';
import { statusLabel, statusTone, fmtCoord, fmtAngle } from '../../../../utils/fieldProcessingView';
import {
  traverseTypeLabel, runStatusLabel, sequenceIssueMessage, closureUnavailableMessage, fmtRelativeClosure, savableLegCount, hasAdjustment,
} from '../../../../utils/traverseView';

const TRAVERSE_TYPES = [
  { value: 'CLOSED_LOOP', bg: 'Затворен ход', en: 'Closed loop' },
  { value: 'KNOWN_ENDPOINT', bg: 'Ход с известна крайна точка', en: 'Known endpoint' },
  { value: 'OPEN', bg: 'Отворен ход', en: 'Open traverse' },
];
const CONVENTIONS = [
  { value: '', bg: 'Не изчислявай коти (само X/Y)', en: 'Do not calculate heights (X/Y only)' },
  { value: 'zenith', bg: 'Зенитно разстояние (0 = зенит, 100 = хоризонт)', en: 'Zenith angle (0 = zenith, 100 = horizontal)' },
  { value: 'vertical', bg: 'Вертикален ъгъл (0 = хоризонт, знак нагоре/надолу)', en: 'Vertical angle (0 = horizontal, signed up/down)' },
];

/**
 * V2.4.2 "Полигонов ход": deterministic traverse processing over a CONFIRMED FieldObservationSet. Reuses the same
 * confirmed/never-auto-save/server-authoritative contract as FieldProcessingResults (V2.4.1 polar), offered as a
 * sibling choice from the same confirmed Field Notebook rather than a disconnected calculator screen.
 */
const TraverseProcessingResults = ({ fieldObservationSetId, projectId, bg = true }) => {
  const [phase, setPhase] = useState('loading'); // loading | idle | running | ready
  const [run, setRun] = useState(null);
  const [traverseType, setTraverseType] = useState('CLOSED_LOOP');
  const [startIdentifier, setStartIdentifier] = useState('');
  const [endIdentifier, setEndIdentifier] = useState('');
  const [convention, setConvention] = useState('');
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null); // index of the leg shown in detail
  const [saveStage, setSaveStage] = useState('idle'); // idle | confirm | saving | done
  const [saveResult, setSaveResult] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fieldProcessingApi.listRuns(fieldObservationSetId)
      .then((runs) => {
        if (cancelled) return;
        const traverseRuns = (runs || []).filter((r) => r.processingType === 'traverse');
        if (traverseRuns.length) { setRun(traverseRuns[0]); setPhase('ready'); } else { setPhase('idle'); }
      })
      .catch(() => { if (!cancelled) setPhase('idle'); });
    return () => { cancelled = true; };
  }, [fieldObservationSetId]);

  const start = async () => {
    if (!startIdentifier.trim()) { setError(bg ? 'Въведете начална станция.' : 'Enter a start station.'); return; }
    if (traverseType === 'KNOWN_ENDPOINT' && !endIdentifier.trim()) {
      setError(bg ? 'Въведете крайна контролна точка.' : 'Enter an endpoint control point.');
      return;
    }
    setPhase('running');
    setError('');
    try {
      const created = await fieldProcessingApi.createTraverseRun(fieldObservationSetId, {
        traverseType, startIdentifier: startIdentifier.trim(), endIdentifier: endIdentifier.trim() || null, verticalAngleConvention: convention || null,
      });
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
  const input = "px-2 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-sm font-['Manrope']";

  if (phase === 'loading') return <p className="text-sm text-neutral-400 font-['Manrope']" role="status">{bg ? 'Зареждане...' : 'Loading...'}</p>;

  if (phase === 'idle' || phase === 'running') {
    return (
      <div className="flex flex-col gap-3 p-4 rounded-xl bg-white dark:bg-zinc-900 outline outline-1 outline-gray-200 dark:outline-zinc-800" data-testid="traverse-start">
        <h3 className="text-sm font-bold font-['Manrope'] text-black dark:text-white">{bg ? 'Полигонов ход' : 'Traverse processing'}</h3>
        <p className="text-xs text-neutral-500 dark:text-zinc-400 font-['Manrope']">
          {bg
            ? 'Изчислява координати по верига от станции от полевата книжка. Не се създават точки, докато изрично не потвърдите.'
            : 'Calculates coordinates along a chain of stations from the field notebook. No points are created until you explicitly confirm.'}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <label className="flex flex-col gap-1 text-xs font-['Manrope'] text-neutral-600 dark:text-zinc-300">
            {bg ? 'Тип на хода' : 'Traverse type'}
            <select value={traverseType} onChange={(e) => setTraverseType(e.target.value)} disabled={phase === 'running'} className={input} aria-label={bg ? 'Тип на хода' : 'Traverse type'} data-testid="traverse-type-select">
              {TRAVERSE_TYPES.map((t) => <option key={t.value} value={t.value}>{bg ? t.bg : t.en}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs font-['Manrope'] text-neutral-600 dark:text-zinc-300">
            {bg ? 'Конвенция за вертикалния ъгъл' : 'Vertical-angle convention'}
            <select value={convention} onChange={(e) => setConvention(e.target.value)} disabled={phase === 'running'} className={input} aria-label={bg ? 'Конвенция за вертикалния ъгъл' : 'Vertical-angle convention'}>
              {CONVENTIONS.map((c) => <option key={c.value} value={c.value}>{bg ? c.bg : c.en}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs font-['Manrope'] text-neutral-600 dark:text-zinc-300">
            {bg ? 'Начална станция (име от полевата книжка)' : 'Start station (name from the field notebook)'}
            <input value={startIdentifier} onChange={(e) => setStartIdentifier(e.target.value)} disabled={phase === 'running'} className={input} placeholder="101" data-testid="traverse-start-identifier" />
          </label>
          {traverseType !== 'OPEN' && (
            <label className="flex flex-col gap-1 text-xs font-['Manrope'] text-neutral-600 dark:text-zinc-300">
              {bg ? 'Крайна контролна точка' : 'Endpoint control point'}
              {traverseType === 'CLOSED_LOOP' && (
                <span className="text-[11px] text-neutral-400">{bg ? 'по подразбиране - началната станция' : 'defaults to the start station'}</span>
              )}
              <input
                value={endIdentifier} onChange={(e) => setEndIdentifier(e.target.value)} disabled={phase === 'running'} className={input}
                placeholder={traverseType === 'CLOSED_LOOP' ? startIdentifier || '101' : ''} data-testid="traverse-end-identifier"
              />
            </label>
          )}
        </div>
        {error && <div role="alert" className="p-2 rounded-lg bg-red-50 text-red-700 text-sm font-['Manrope']">{error}</div>}
        <button type="button" className={`${primary} self-start`} disabled={phase === 'running'} onClick={start} data-testid="traverse-start-button">
          {phase === 'running' ? (bg ? 'Изчисляване...' : 'Calculating...') : bg ? 'Изчисли полигонов ход' : 'Process the traverse'}
        </button>
      </div>
    );
  }

  const t = run.traverse;
  const canSave = savableLegCount(t) > 0 && run.generatedPointIds.length === 0;
  const adjusted = hasAdjustment(t);

  return (
    <div className="flex flex-col gap-4" data-testid="traverse-results">
      <div className="flex flex-col gap-2 p-3 md:p-4 rounded-xl bg-white dark:bg-zinc-900 outline outline-1 outline-gray-200 dark:outline-zinc-800">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-semibold font-['Manrope'] text-black dark:text-white" data-testid="traverse-summary">
            {traverseTypeLabel(t.traverseType, bg)} · {t.startIdentifier}
            {t.orientation && t.orientation.identifier && <span> · {bg ? 'ориентир' : 'orientation'} {t.orientation.identifier}</span>}
            {t.endIdentifier && <span> · {bg ? 'край' : 'end'} {t.endIdentifier}</span>}
            {' · '}{runStatusLabel(t.status, bg)}
          </p>
          <div className="flex gap-2">
            <button type="button" className={ghost} onClick={() => { setPhase('idle'); setError(''); }} data-testid="traverse-recalculate">
              {bg ? 'Преизчисли' : 'Recalculate'}
            </button>
            {saveStage !== 'confirm' && run.generatedPointIds.length === 0 && (
              <button type="button" className={primary} disabled={!canSave} onClick={() => setSaveStage('confirm')} data-testid="traverse-save-start">
                {bg ? 'Създай точки' : 'Create points'}
              </button>
            )}
          </div>
        </div>
        {saveStage === 'confirm' && (
          <div className="flex flex-col gap-2 p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20 outline outline-1 outline-orange-200 dark:outline-orange-900/50" role="alertdialog" aria-label={bg ? 'Потвърждение' : 'Confirmation'}>
            <p className="text-sm font-['Manrope'] text-black dark:text-white" data-testid="traverse-save-coord-notice">
              {bg
                ? `Ще бъдат създадени до ${savableLegCount(t)} точки, използвайки ${adjusted ? 'ИЗРАВНЕНИ (Bowditch)' : 'СУРОВИ'} координати. Досега нищо не е записано.`
                : `Up to ${savableLegCount(t)} points will be created, using ${adjusted ? 'ADJUSTED (Bowditch)' : 'RAW'} coordinates. Nothing has been saved so far.`}
            </p>
            <div className="flex flex-wrap gap-2">
              <button type="button" className={primary} onClick={save} data-testid="traverse-save-go">{bg ? 'Създай' : 'Create'}</button>
              <button type="button" className={ghost} onClick={() => setSaveStage('idle')}>{bg ? 'Отказ' : 'Cancel'}</button>
            </div>
          </div>
        )}
        {saveStage === 'saving' && <p className="text-sm text-neutral-500 font-['Manrope']">{bg ? 'Създаване...' : 'Creating...'}</p>}
        {saveStage === 'done' && saveResult && (
          <div className="flex flex-wrap items-center gap-3 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 outline outline-1 outline-emerald-200 dark:outline-emerald-900/50" role="status" data-testid="traverse-save-done">
            <span className="text-sm font-semibold font-['Manrope'] text-emerald-800 dark:text-emerald-300">
              ✓ {bg ? `Създадени са ${saveResult.created.length} точки.` : `${saveResult.created.length} points created.`}
              {saveResult.skipped.length > 0 && (bg ? ` (${saveResult.skipped.length} пропуснати - вижте конфликтите)` : ` (${saveResult.skipped.length} skipped - see conflicts)`)}
            </span>
            <Link to={`/points?projectId=${projectId}`} className={primary}>{bg ? 'Точки на проекта' : 'Project points'}</Link>
          </div>
        )}
        {saveResult && saveResult.skipped.length > 0 && (
          <ul className="text-xs text-neutral-600 dark:text-zinc-300 font-['Manrope'] list-disc pl-5" data-testid="traverse-skipped">
            {saveResult.skipped.map((s, i) => (
              <li key={`${s.setup}-${s.observation}-${i}`}>{s.target}: {s.reason === 'NAME_CONFLICT' ? (bg ? 'вече има точка с това име' : 'a point with this name already exists') : (bg ? 'вече е създадена' : 'already created')}</li>
            ))}
          </ul>
        )}
        {error && <div role="alert" className="p-2 rounded-lg bg-red-50 text-red-700 text-sm font-['Manrope']">{error}</div>}

        {t.sequence && t.sequence.state !== 'RESOLVED' && (
          <p className="text-xs text-red-700 dark:text-red-400 font-['Manrope']" data-testid="traverse-sequence-issue">
            ✕ {sequenceIssueMessage(t.sequence.issue, bg)}
          </p>
        )}
      </div>

      {/* Closure summary (V2.4.2 section 19) - a plain measurement, never colour-coded good/bad. */}
      <div className="flex flex-col gap-2 p-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900" data-testid="traverse-closure">
        <h4 className="text-xs font-bold font-['Manrope'] text-black dark:text-white">{bg ? 'Невръзка' : 'Closure'}</h4>
        {t.closure.available ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1 text-xs font-['Manrope'] text-neutral-700 dark:text-zinc-300">
            <span>{bg ? 'Обща дължина' : 'Total length'}: {fmtCoord(t.closure.totalLength)} m</span>
            <span>{bg ? 'Невръзка X' : 'Misclosure X'}: {fmtCoord(t.closure.fX)} m</span>
            <span>{bg ? 'Невръзка Y' : 'Misclosure Y'}: {fmtCoord(t.closure.fY)} m</span>
            <span>{bg ? 'Линейна невръзка' : 'Linear misclosure'}: {fmtCoord(t.closure.linearMisclosure)} m</span>
            <span>{bg ? 'Относителна невръзка' : 'Relative closure'}: {t.closure.perfectClosure ? (bg ? 'точно съвпадение' : 'exact match') : fmtRelativeClosure(t.closure.relativeClosureDenominator, bg)}</span>
            <span>{bg ? 'Метод на изравнение' : 'Adjustment method'}: {adjusted ? 'Bowditch' : (bg ? 'не е приложено' : 'not applied')}</span>
          </div>
        ) : (
          <p className="text-xs text-neutral-500 dark:text-zinc-400 font-['Manrope']">{closureUnavailableMessage(t.closure.reason, bg)}</p>
        )}
      </div>

      {/* Ordered leg table: RAW vs ADJUSTED always distinguished; "Не е приложимо" for a traverse with no adjustment. */}
      <div className="overflow-auto rounded-lg border border-gray-100 dark:border-zinc-800">
        <table className="min-w-full text-left border-collapse text-xs">
          <thead className="bg-stone-50 dark:bg-zinc-800">
            <tr>
              {[bg ? 'Станция' : 'Station', bg ? 'Цел' : 'Target', bg ? 'Посока' : 'Bearing', bg ? 'Разстояние' : 'Distance',
                `${bg ? 'Сурови' : 'Raw'} X`, `${bg ? 'Сурови' : 'Raw'} Y`, `${bg ? 'Изравнени' : 'Adjusted'} X`, `${bg ? 'Изравнени' : 'Adjusted'} Y`, bg ? 'Статус' : 'Status'].map((h) => (
                <th key={h} className="p-2 font-semibold text-neutral-600 dark:text-zinc-300 font-['Manrope']">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {t.legs.map((l) => {
              const isSelected = selected === l.index;
              return (
                <React.Fragment key={l.index}>
                  <tr
                    className={`border-t border-gray-100 dark:border-zinc-800 cursor-pointer ${statusTone(l.status)}`}
                    onClick={() => setSelected(isSelected ? null : l.index)}
                    data-testid="traverse-leg-row"
                    data-status={l.status}
                  >
                    <td className="p-2 font-mono">{l.from}</td>
                    <td className="p-2 font-mono">{l.to}</td>
                    <td className="p-2 font-mono">{fmtAngle(l.bearingGon)}</td>
                    <td className="p-2 font-mono">{fmtCoord(l.horizontalDistance)}</td>
                    <td className="p-2 font-mono">{fmtCoord(l.rawX)}</td>
                    <td className="p-2 font-mono">{fmtCoord(l.rawY)}</td>
                    <td className="p-2 font-mono">{adjusted ? fmtCoord(l.adjustedX) : (bg ? 'Не е приложимо' : 'Not applicable')}</td>
                    <td className="p-2 font-mono">{adjusted ? fmtCoord(l.adjustedY) : (bg ? 'Не е приложимо' : 'Not applicable')}</td>
                    <td className="p-2">{statusLabel(l.status, bg)}</td>
                  </tr>
                  {isSelected && (
                    <tr className="border-t border-gray-100 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-800/50">
                      <td colSpan={9} className="p-3 text-[11px] font-['Manrope'] text-neutral-600 dark:text-zinc-300" data-testid="traverse-leg-detail">
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                          <span>ΔX: {fmtCoord(l.rawDeltaX)}</span>
                          <span>ΔY: {fmtCoord(l.rawDeltaY)}</span>
                          {adjusted && <span>cX: {fmtCoord(l.correctionX)}</span>}
                          {adjusted && <span>cY: {fmtCoord(l.correctionY)}</span>}
                          <span>H: {fmtCoord(l.rawH)}</span>
                        </div>
                        {l.heightReason && <p className="mt-1 text-amber-700 dark:text-amber-400">! {(l.warnings.find((w) => w.code === l.heightReason) || {}).message}</p>}
                        {(l.errors || []).map((er, i) => <p key={i} className="mt-1 text-red-700 dark:text-red-400">✕ {er.message}</p>)}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TraverseProcessingResults;
