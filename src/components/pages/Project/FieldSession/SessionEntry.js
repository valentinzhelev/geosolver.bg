import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  addNextStation, addObservation, addSetup, fieldLabel, indexIssues, isBlankObservation, issueKey,
  removeObservation, removeSetup, updateObservation, updateOrientation, updateStation,
} from '../../../../utils/fieldSessionView';

/**
 * Manual field entry (Станции и наблюдения): mobile-first, NOT a spreadsheet.
 *
 * One station is "occupied" at a time (chips along the top, large touch targets); its station card holds the
 * instrument height and backsight; below is ONE quick-add form for the next observation plus a compact list of what
 * was already recorded. Adding an observation keeps the occupied station, keeps focus on "Цел" and clears the
 * rest, so a whole round of observations is a short, repeatable sequence. Values are RAW TEXT: the server parses,
 * validates and reports problems per field (highlighted here with a symbol and a word - never colour alone).
 * Inputs are 16px (no iOS zoom on focus), at least 44px tall, and use the numeric keypad where one fits.
 */
const INPUT = "w-full min-h-[44px] px-3 py-2 rounded-lg text-base font-['Manrope'] bg-white dark:bg-zinc-900 text-black dark:text-white outline outline-1 outline-gray-300 dark:outline-zinc-700 focus:outline-2 focus:outline-black dark:focus:outline-white";
const BTN_PRIMARY = "min-h-[48px] px-4 py-2 rounded-lg text-base font-semibold font-['Manrope'] bg-black dark:bg-white text-white dark:text-black disabled:opacity-40 disabled:cursor-not-allowed";
const BTN_GHOST = "min-h-[44px] px-3 py-2 rounded-lg text-sm font-semibold font-['Manrope'] bg-white dark:bg-zinc-900 outline outline-1 outline-gray-300 dark:outline-zinc-700 disabled:opacity-40";

const stateOf = (issue) => (issue ? (issue.severity === 'error' ? 'invalid' : 'review') : 'ok');
const mark = (issue) => (issue ? (issue.severity === 'error' ? '✕ ' : '! ') : '');

const Field = ({ id, label, value, onChange, issue, inputMode, placeholder, inputRef, onEnter, testId, hint }) => (
  <div className="flex flex-col gap-1 min-w-0">
    <label htmlFor={id} className="text-xs font-semibold font-['Manrope'] text-neutral-600 dark:text-zinc-300">{label}</label>
    <input
      id={id}
      ref={inputRef}
      type="text"
      inputMode={inputMode}
      autoComplete="off"
      autoCapitalize="none"
      autoCorrect="off"
      spellCheck={false}
      enterKeyHint={onEnter ? 'next' : undefined}
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={onEnter ? (e) => { if (e.key === 'Enter') { e.preventDefault(); onEnter(); } } : undefined}
      aria-invalid={issue && issue.severity === 'error' ? 'true' : undefined}
      aria-describedby={issue ? `${id}-msg` : undefined}
      data-state={stateOf(issue)}
      data-testid={testId}
      className={`${INPUT} ${issue ? (issue.severity === 'error' ? 'outline-red-500 dark:outline-red-500' : 'outline-amber-500 dark:outline-amber-500') : ''}`}
    />
    {hint && !issue && <span className="text-[11px] text-neutral-400 font-['Manrope']">{hint}</span>}
    {issue && <span id={`${id}-msg`} className={`text-[11px] font-['Manrope'] ${issue.severity === 'error' ? 'text-red-700 dark:text-red-400' : 'text-amber-700 dark:text-amber-400'}`} data-testid={`${testId}-issue`}>{mark(issue)}{issue.message}</span>}
  </div>
);

const EMPTY_FORM = { target: '', hz: '', vz: '', distance: '', horizontalDistance: '', prismHeight: '', code: '', notes: '' };

const SessionEntry = ({ setups, editSetups, evaluation, angleUnit = 'gon', bg = true, selectRequest }) => {
  const [activeIndex, setActiveIndex] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingRow, setEditingRow] = useState(null);
  const [showMore, setShowMore] = useState(false);
  const [keepPrism, setKeepPrism] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const targetRef = useRef(null);

  const issues = useMemo(() => indexIssues(evaluation && evaluation.issues), [evaluation]);
  const issueOf = (loc) => issues.get(issueKey(loc));

  // the occupied station: the user's choice if it still exists, otherwise the first one
  const active = setups.find((s) => s.index === activeIndex) || setups[0] || null;
  useEffect(() => { if (active && active.index !== activeIndex) setActiveIndex(active.index); }, [active, activeIndex]);

  // "Към полето" from the review jumps to a station (and, for an observation, loads it into the form)
  useEffect(() => {
    if (!selectRequest) return;
    const target = setups.find((s) => s.index === selectRequest.setup);
    if (!target) return;
    setActiveIndex(target.index);
    const obs = selectRequest.row !== undefined && selectRequest.row !== null ? target.observations.find((o) => o.row === selectRequest.row) : null;
    if (obs) { setEditingRow(obs.row); setForm({ ...EMPTY_FORM, ...obs }); }
  }, [selectRequest]); // eslint-disable-line react-hooks/exhaustive-deps

  const angleMode = angleUnit === 'gon' ? 'decimal' : 'text'; // degrees may be typed as 94°30'15" - needs the full keyboard
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const formEmpty = isBlankObservation(form);

  const resetForm = (keep = {}) => { setForm({ ...EMPTY_FORM, ...keep }); setEditingRow(null); };
  const focusTarget = () => { if (targetRef.current) targetRef.current.focus(); };

  const submit = () => {
    if (!active || formEmpty) return;
    if (editingRow !== null) {
      editSetups((prev) => updateObservation(prev, active.index, editingRow, form));
      resetForm();
    } else {
      editSetups((prev) => addObservation(prev, active.index, form));
      resetForm(keepPrism ? { prismHeight: form.prismHeight } : {});
    }
    focusTarget();
  };

  // a new station gets the next free id (the same rule addSetup applies) and becomes the occupied one
  const nextStationIndex = () => Math.max(-1, ...setups.map((s) => s.index)) + 1;
  const startStation = () => {
    const index = nextStationIndex();
    editSetups((prev) => addNextStation(prev));
    setActiveIndex(index);
    setConfirmRemove(false);
    resetForm();
  };
  const addFirst = () => { const index = nextStationIndex(); editSetups((prev) => addSetup(prev)); setActiveIndex(index); };

  if (!setups.length) {
    return (
      <div className="flex flex-col items-start gap-3 p-4 rounded-xl border border-dashed border-gray-300 dark:border-zinc-700" data-testid="session-entry">
        <p className="text-sm text-neutral-600 dark:text-zinc-300 font-['Manrope']">
          {bg ? 'Започнете със станцията, на която стоите: после добавяте наблюдения към целите.' : 'Start with the station you are standing on, then add observations to the targets.'}
        </p>
        <button type="button" className={BTN_PRIMARY} onClick={addFirst} data-testid="session-add-first-station">{bg ? 'Добави станция' : 'Add station'}</button>
      </div>
    );
  }

  const sid = (field) => `st-${active.index}-${field}`;
  const rowIssues = (row) => ['target', 'hz', 'vz', 'distance', 'horizontalDistance', 'prismHeight']
    .map((field) => issueOf({ setup: active.index, section: 'observation', row, field })).filter(Boolean);

  return (
    <div className="flex flex-col gap-4" data-testid="session-entry">
      {/* occupied station: chips, one tap to switch, the rest of the screen keeps its context */}
      <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label={bg ? 'Станции' : 'Stations'}>
        {setups.map((s) => {
          const n = s.observations.filter((o) => !isBlankObservation(o)).length;
          const selected = s.index === active.index;
          return (
            <button
              key={s.index}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => { setActiveIndex(s.index); resetForm(); setConfirmRemove(false); }}
              className={`shrink-0 min-h-[44px] px-4 rounded-lg text-sm font-semibold font-['Manrope'] touch-manipulation ${selected ? 'bg-black dark:bg-white text-white dark:text-black' : 'bg-white dark:bg-zinc-900 outline outline-1 outline-gray-300 dark:outline-zinc-700'}`}
              data-testid="session-station-tab"
            >
              {s.station.point || (bg ? `Станция ${s.index + 1}` : `Station ${s.index + 1}`)} <span className="opacity-70 font-normal">· {n}</span>
            </button>
          );
        })}
        <button type="button" className={`${BTN_GHOST} shrink-0`} onClick={startStation} data-testid="session-add-station">+ {bg ? 'Станция' : 'Station'}</button>
      </div>

      {/* station card */}
      <section className="flex flex-col gap-3 p-3 md:p-4 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900" aria-label={bg ? 'Станция' : 'Station'} data-testid="session-station-card">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field id={sid('point')} testId="station-field-point" label={fieldLabel('point', bg)} value={active.station.point}
            onChange={(v) => editSetups((prev) => updateStation(prev, active.index, { point: v }))} issue={issueOf({ setup: active.index, section: 'station', field: 'point' })} placeholder="101" />
          <Field id={sid('hi')} testId="station-field-instrumentHeight" label={`${fieldLabel('instrumentHeight', bg)} (m)`} value={active.station.instrumentHeight} inputMode="decimal"
            onChange={(v) => editSetups((prev) => updateStation(prev, active.index, { instrumentHeight: v }))} issue={issueOf({ setup: active.index, section: 'station', field: 'instrumentHeight' })} placeholder="1.52" />
          <Field id={sid('ot')} testId="station-field-orientationTarget" label={fieldLabel('orientation', bg)} value={(active.orientation && active.orientation.target) || ''}
            onChange={(v) => editSetups((prev) => updateOrientation(prev, active.index, { target: v }))} issue={issueOf({ setup: active.index, section: 'orientation', field: 'target' })} placeholder="102" />
          <Field id={sid('od')} testId="station-field-orientationDirection" label={`${fieldLabel('direction', bg)} (${angleUnit})`} value={(active.orientation && active.orientation.direction) || ''} inputMode={angleMode}
            onChange={(v) => editSetups((prev) => updateOrientation(prev, active.index, { direction: v }))} issue={issueOf({ setup: active.index, section: 'orientation', field: 'direction' })} placeholder="0" hint={bg ? 'Остави празно, ако е нулирано по ориентира.' : 'Leave empty if zeroed on the backsight.'} />
        </div>
        {issueOf({ setup: active.index, section: 'station', field: 'orientation' }) && (
          <p className="text-xs text-amber-700 dark:text-amber-400 font-['Manrope']" data-testid="station-orientation-warning">! {issueOf({ setup: active.index, section: 'station', field: 'orientation' }).message}</p>
        )}
        <div className="flex flex-wrap items-center gap-2">
          {!confirmRemove ? (
            <button type="button" className={BTN_GHOST} onClick={() => setConfirmRemove(true)} data-testid="session-remove-station">{bg ? 'Премахни станцията' : 'Remove station'}</button>
          ) : (
            <span className="flex flex-wrap items-center gap-2" role="alertdialog" aria-label={bg ? 'Потвърждение за премахване' : 'Confirm removal'}>
              <span className="text-xs font-['Manrope'] text-neutral-700 dark:text-zinc-200">{bg ? 'Станцията и нейните наблюдения ще бъдат премахнати.' : 'The station and its observations will be removed.'}</span>
              <button type="button" className={BTN_GHOST} onClick={() => { editSetups((prev) => removeSetup(prev, active.index)); setConfirmRemove(false); resetForm(); }} data-testid="session-remove-station-go">{bg ? 'Премахни' : 'Remove'}</button>
              <button type="button" className={BTN_GHOST} onClick={() => setConfirmRemove(false)}>{bg ? 'Отказ' : 'Cancel'}</button>
            </span>
          )}
        </div>
      </section>

      {/* quick add / edit one observation */}
      <section className="flex flex-col gap-3 p-3 md:p-4 rounded-xl border border-gray-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-950" aria-label={bg ? 'Ново наблюдение' : 'New observation'} data-testid="session-observation-form">
        <h3 className="text-sm font-bold font-['Manrope'] text-black dark:text-white">
          {editingRow !== null ? (bg ? 'Редакция на наблюдение' : 'Edit observation') : (bg ? 'Ново наблюдение' : 'New observation')}
        </h3>
        <div className="grid grid-cols-2 items-end gap-3">
          <div className="col-span-2">
            <Field id="obs-target" testId="obs-field-target" inputRef={targetRef} label={fieldLabel('target', bg)} value={form.target} onChange={(v) => set({ target: v })}
              issue={editingRow !== null ? issueOf({ setup: active.index, section: 'observation', row: editingRow, field: 'target' }) : null} placeholder="201" />
          </div>
          <Field id="obs-hz" testId="obs-field-hz" label={`Hz (${angleUnit})`} value={form.hz} inputMode={angleMode} onChange={(v) => set({ hz: v })}
            issue={editingRow !== null ? issueOf({ setup: active.index, section: 'observation', row: editingRow, field: 'hz' }) : null} />
          <Field id="obs-vz" testId="obs-field-vz" label={`${fieldLabel('vz', bg)} (${angleUnit})`} value={form.vz} inputMode={angleMode} onChange={(v) => set({ vz: v })}
            issue={editingRow !== null ? issueOf({ setup: active.index, section: 'observation', row: editingRow, field: 'vz' }) : null} />
          <Field id="obs-distance" testId="obs-field-distance" label={`${fieldLabel('distance', bg)} (m)`} value={form.distance} inputMode="decimal" onChange={(v) => set({ distance: v })}
            issue={editingRow !== null ? issueOf({ setup: active.index, section: 'observation', row: editingRow, field: 'distance' }) : null} />
          <Field id="obs-prism" testId="obs-field-prismHeight" label={`${fieldLabel('prismHeight', bg)} (m)`} value={form.prismHeight} inputMode="decimal" onChange={(v) => set({ prismHeight: v })}
            issue={editingRow !== null ? issueOf({ setup: active.index, section: 'observation', row: editingRow, field: 'prismHeight' }) : null} onEnter={submit} />
        </div>

        <button type="button" className="self-start min-h-[44px] text-sm font-semibold font-['Manrope'] underline text-neutral-600 dark:text-zinc-300" aria-expanded={showMore} onClick={() => setShowMore((v) => !v)} data-testid="obs-more-toggle">
          {showMore ? (bg ? 'По-малко' : 'Less') : (bg ? 'Още полета' : 'More fields')}
        </button>
        {showMore && (
          <div className="grid grid-cols-2 items-end gap-3" data-testid="obs-more">
            <Field id="obs-hdist" testId="obs-field-horizontalDistance" label={`${fieldLabel('horizontalDistance', bg)} (m)`} value={form.horizontalDistance} inputMode="decimal" onChange={(v) => set({ horizontalDistance: v })}
              issue={editingRow !== null ? issueOf({ setup: active.index, section: 'observation', row: editingRow, field: 'horizontalDistance' }) : null} />
            <Field id="obs-code" testId="obs-field-code" label={fieldLabel('code', bg)} value={form.code} onChange={(v) => set({ code: v })} />
            <div className="col-span-2"><Field id="obs-notes" testId="obs-field-notes" label={fieldLabel('notes', bg)} value={form.notes} onChange={(v) => set({ notes: v })} /></div>
          </div>
        )}

        <label className="flex items-center gap-2 min-h-[44px] text-sm font-['Manrope'] text-neutral-700 dark:text-zinc-200">
          <input type="checkbox" checked={keepPrism} onChange={(e) => setKeepPrism(e.target.checked)} className="w-5 h-5" data-testid="obs-keep-prism" />
          {bg ? 'Запази височината на призмата за следващото' : 'Keep the prism height for the next one'}
        </label>

        <div className="flex flex-wrap gap-2">
          <button type="button" className={`${BTN_PRIMARY} flex-1 sm:flex-none`} onClick={submit} disabled={formEmpty} data-testid="obs-add">
            {editingRow !== null ? (bg ? 'Запази промените' : 'Save changes') : (bg ? 'Добави наблюдение' : 'Add observation')}
          </button>
          {editingRow !== null && (
            <button type="button" className={BTN_GHOST} onClick={() => resetForm()} data-testid="obs-cancel-edit">{bg ? 'Откажи' : 'Cancel'}</button>
          )}
        </div>
      </section>

      {/* what is already recorded on this station */}
      <section aria-label={bg ? 'Записани наблюдения' : 'Recorded observations'} className="flex flex-col gap-2" data-testid="session-observation-list">
        <h3 className="text-sm font-bold font-['Manrope'] text-black dark:text-white">
          {bg ? 'Наблюдения на станцията' : 'Observations on this station'} <span className="font-normal text-neutral-400">({active.observations.filter((o) => !isBlankObservation(o)).length})</span>
        </h3>
        {active.observations.filter((o) => !isBlankObservation(o)).length === 0 && (
          <p className="text-xs text-neutral-400 font-['Manrope']" data-testid="obs-empty">{bg ? 'Още няма наблюдения от тази станция.' : 'No observations from this station yet.'}</p>
        )}
        <ul className="flex flex-col gap-1.5">
          {active.observations.filter((o) => !isBlankObservation(o)).map((o) => {
            const ri = rowIssues(o.row);
            const worst = ri.find((i) => i.severity === 'error') || ri[0];
            return (
              <li key={o.row} className={`flex items-stretch gap-2 rounded-lg border ${worst ? (worst.severity === 'error' ? 'border-red-400 bg-red-50 dark:border-red-700 dark:bg-red-950/30' : 'border-amber-400 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/30') : 'border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900'} ${editingRow === o.row ? 'ring-2 ring-black dark:ring-white' : ''}`} data-testid="obs-row" data-state={stateOf(worst)}>
                <button type="button" className="flex-1 min-w-0 min-h-[48px] text-left px-3 py-2 touch-manipulation" onClick={() => { setEditingRow(o.row); setForm({ ...EMPTY_FORM, ...o }); setShowMore(!!(o.horizontalDistance || o.code || o.notes)); }} aria-label={`${bg ? 'Редактирай наблюдение към' : 'Edit observation to'} ${o.target || '?'}`} data-testid="obs-row-open">
                  <span className="block text-sm font-semibold font-['Manrope'] text-black dark:text-white truncate">{o.target || (bg ? '(без цел)' : '(no target)')}</span>
                  <span className="block text-xs text-neutral-600 dark:text-zinc-300 font-['Manrope'] truncate">
                    Hz {o.hz || '—'}{o.vz ? ` · V ${o.vz}` : ''} · {o.distance ? `S ${o.distance}` : (o.horizontalDistance ? `${bg ? 'Хор.' : 'Hor.'} ${o.horizontalDistance}` : '—')}{o.prismHeight ? ` · ${bg ? 'приз.' : 'prism'} ${o.prismHeight}` : ''}
                  </span>
                  {worst && <span className={`block text-[11px] font-['Manrope'] ${worst.severity === 'error' ? 'text-red-700 dark:text-red-400' : 'text-amber-700 dark:text-amber-400'}`} data-testid="obs-row-issue">{mark(worst)}{worst.message}{ri.length > 1 ? ` (+${ri.length - 1})` : ''}</span>}
                </button>
                <button type="button" className="min-w-[48px] min-h-[48px] px-3 text-lg text-neutral-500 touch-manipulation" onClick={() => { editSetups((prev) => removeObservation(prev, active.index, o.row)); if (editingRow === o.row) resetForm(); }} aria-label={`${bg ? 'Изтрий наблюдение към' : 'Delete observation to'} ${o.target || '?'}`} data-testid="obs-row-delete">×</button>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
};

export default SessionEntry;
