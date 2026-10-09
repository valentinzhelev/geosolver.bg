import React from 'react';
import { statusBadge, SOURCE_LABEL } from '../../../../utils/fieldSessionView';

const INPUT = "w-full min-h-[44px] px-3 py-2 rounded-lg text-base font-['Manrope'] bg-white dark:bg-zinc-900 text-black dark:text-white outline outline-1 outline-gray-300 dark:outline-zinc-700 disabled:opacity-60 disabled:bg-stone-50 dark:disabled:bg-zinc-800";
const BTN_PRIMARY = "min-h-[48px] px-4 py-2 rounded-lg text-base font-semibold font-['Manrope'] bg-black dark:bg-white text-white dark:text-black disabled:opacity-40";
const BTN_GHOST = "min-h-[44px] px-3 py-2 rounded-lg text-sm font-semibold font-['Manrope'] bg-white dark:bg-zinc-900 outline outline-1 outline-gray-300 dark:outline-zinc-700";

const STEPS = ['draft', 'review', 'confirmed', 'processed'];
const STEP_LABEL = { draft: ['Чернова', 'Draft'], review: ['За проверка', 'Needs review'], confirmed: ['Потвърдена', 'Confirmed'], processed: ['Обработена', 'Processed'] };

const MetaField = ({ id, label, children }) => (
  <div className="flex flex-col gap-1 min-w-0">
    <label htmlFor={id} className="text-xs font-semibold font-['Manrope'] text-neutral-600 dark:text-zinc-300">{label}</label>
    {children}
  </div>
);

/** Преглед: lifecycle, deterministic progress counts, provenance, and the (all optional) session metadata. */
const SessionOverview = ({ session, meta, editable, editMeta, onGoto, onOpenSession, bg = true }) => {
  const badge = statusBadge(session.status, bg);
  const stepIndex = STEPS.indexOf(session.status);
  const src = SOURCE_LABEL[session.source] || SOURCE_LABEL.none;
  const field = (key, id, props = {}) => (
    <input id={id} className={INPUT} value={meta[key] || ''} disabled={!editable} onChange={(e) => editMeta({ [key]: e.target.value })} autoComplete="off" data-testid={`meta-${key}`} {...props} />
  );

  return (
    <div className="flex flex-col gap-4" data-testid="session-overview">
      <ol className="flex flex-wrap gap-2" aria-label={bg ? 'Етапи на сесията' : 'Session stages'} data-testid="session-lifecycle">
        {STEPS.map((st, i) => (
          <li key={st} aria-current={st === session.status ? 'step' : undefined} className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-['Manrope'] border ${st === session.status ? badge.tone : i < stepIndex ? 'border-emerald-300 text-emerald-800 dark:border-emerald-800 dark:text-emerald-300' : 'border-gray-200 dark:border-zinc-800 text-neutral-400'}`}>
            {i < stepIndex ? '✓ ' : ''}{STEP_LABEL[st][bg ? 0 : 1]}
          </li>
        ))}
      </ol>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2" data-testid="session-progress">
        {[
          [bg ? 'Станции' : 'Stations', session.setupCount],
          [bg ? 'Наблюдения' : 'Observations', session.observationCount],
          [bg ? 'За проверка' : 'Issues', session.issues.errors + session.issues.warnings],
          [bg ? 'Обработки' : 'Processing runs', session.processing.runCount],
          [bg ? 'Създадени точки' : 'Points created', session.processing.pointCount],
          [bg ? 'Отчети' : 'Reports', session.processing.reportCount],
        ].map(([label, n]) => (
          <div key={label} className="p-3 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <div className="text-xl font-bold font-['Manrope'] text-black dark:text-white">{n}</div>
            <div className="text-xs text-neutral-500 font-['Manrope']">{label}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-1 text-sm font-['Manrope'] text-neutral-700 dark:text-zinc-200" data-testid="session-provenance">
        <span>{bg ? 'Източник на данните' : 'Data source'}: <strong>{src[bg ? 0 : 1]}</strong></span>
        {session.revisionOf && (
          <span>{bg ? 'Това е ревизия на ' : 'This is a revision of '}<button type="button" className="underline font-semibold" onClick={() => onOpenSession(session.revisionOf)} data-testid="session-open-original">{bg ? 'предишна сесия' : 'an earlier session'}</button>.</span>
        )}
        {session.hasRevision && <span data-testid="session-has-revision">{bg ? 'За тази сесия има създадена ревизия.' : 'A revision of this session exists.'}</span>}
      </div>

      {session.confirmed && !session.processing.runCount && (
        <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl border border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/20">
          <span className="text-sm font-['Manrope'] text-emerald-900 dark:text-emerald-200">{bg ? 'Сесията е потвърдена. Следваща стъпка:' : 'The session is confirmed. Next step:'}</span>
          <button type="button" className={BTN_PRIMARY} onClick={() => onGoto('processing')} data-testid="overview-process">{bg ? 'Обработи измерванията' : 'Process the measurements'}</button>
        </div>
      )}
      {!session.confirmed && session.source === 'capture' && session.capture && session.capture.available && (
        <button type="button" className={`${BTN_GHOST} self-start`} onClick={() => onGoto('review')} data-testid="overview-continue-review">{bg ? 'Продължи проверката' : 'Continue the review'}</button>
      )}

      <section className="flex flex-col gap-3 p-3 md:p-4 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900" aria-label={bg ? 'Данни за сесията' : 'Session details'}>
        <h3 className="text-sm font-bold font-['Manrope'] text-black dark:text-white">{bg ? 'Данни за сесията' : 'Session details'} <span className="font-normal text-neutral-400">({bg ? 'по желание' : 'optional'})</span></h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <MetaField id="meta-title" label={bg ? 'Заглавие' : 'Title'}>{field('title', 'meta-title', { placeholder: session.title })}</MetaField>
          <MetaField id="meta-date" label={bg ? 'Дата' : 'Date'}>{field('date', 'meta-date', { type: 'date' })}</MetaField>
          <MetaField id="meta-operator" label={bg ? 'Оператор / екип' : 'Operator / team'}>{field('operator', 'meta-operator')}</MetaField>
          <MetaField id="meta-instrument" label={bg ? 'Инструмент' : 'Instrument'}>{field('instrument', 'meta-instrument')}</MetaField>
          <MetaField id="meta-serial" label={bg ? 'Сериен номер' : 'Serial number'}>{field('instrumentSerial', 'meta-serial')}</MetaField>
          <MetaField id="meta-conditions" label={bg ? 'Условия (време)' : 'Conditions (weather)'}>{field('conditions', 'meta-conditions')}</MetaField>
          <MetaField id="meta-angleUnit" label={bg ? 'Ъглова единица за числа без означение' : 'Angle unit for bare numbers'}>
            <select id="meta-angleUnit" className={INPUT} value={meta.angleUnit || 'gon'} disabled={!editable} onChange={(e) => editMeta({ angleUnit: e.target.value })} data-testid="meta-angleUnit">
              <option value="gon">{bg ? 'Гради (gon)' : 'Gradians (gon)'}</option>
              <option value="deg">{bg ? 'Градуси (°)' : 'Degrees (°)'}</option>
            </select>
          </MetaField>
          <div className="sm:col-span-2">
            <MetaField id="meta-notes" label={bg ? 'Бележки' : 'Notes'}>
              <textarea id="meta-notes" className={`${INPUT} min-h-[88px]`} value={meta.notes || ''} disabled={!editable} onChange={(e) => editMeta({ notes: e.target.value })} data-testid="meta-notes" />
            </MetaField>
          </div>
        </div>
        {!editable && <p className="text-xs text-neutral-500 font-['Manrope']">{bg ? 'Данните на потвърдена сесия не се променят.' : 'The details of a confirmed session cannot be changed.'}</p>}
      </section>
    </div>
  );
};

export default SessionOverview;
