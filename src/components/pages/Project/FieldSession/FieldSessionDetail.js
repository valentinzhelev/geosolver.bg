import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fieldSessionsApi } from '../../../../services/fieldSessionsApi';
import { sessionErrorMessage, statusBadge } from '../../../../utils/fieldSessionView';
import { useSessionDraft } from './useSessionDraft';
import SessionOverview from './SessionOverview';
import SessionEntry from './SessionEntry';
import SessionEvidence from './SessionEvidence';
import SessionReview from './SessionReview';
import SessionProcessing from './SessionProcessing';
import SessionDocuments from './SessionDocuments';

const SECTIONS = [
  { id: 'overview', bg: 'Преглед', en: 'Overview' },
  { id: 'entry', bg: 'Станции и наблюдения', en: 'Stations & observations' },
  { id: 'review', bg: 'Проверка', en: 'Review' },
  { id: 'processing', bg: 'Обработка', en: 'Processing' },
  { id: 'documents', bg: 'Документи', en: 'Documents' },
];
const VALID = new Set(SECTIONS.map((s) => s.id));
const BTN_GHOST = "min-h-[44px] px-3 py-2 rounded-lg text-sm font-semibold font-['Manrope'] bg-white dark:bg-zinc-900 outline outline-1 outline-gray-300 dark:outline-zinc-700 disabled:opacity-40";

/** Where a session should open when no section was asked for: the screen its current state needs. */
function defaultSection(session) {
  if (session.confirmed) return 'overview';
  if (session.source === 'capture') return 'review';
  if (session.status === 'review') return 'review';
  return session.observationCount === 0 ? 'entry' : 'overview';
}

const SaveIndicator = ({ saveState, saveError, onRetry, onReload, bg }) => {
  const text = {
    saved: bg ? '✓ Запазено' : '✓ Saved',
    dirty: bg ? '… Промените още не са запазени' : '… Changes not saved yet',
    saving: bg ? 'Запазване…' : 'Saving…',
    error: `${bg ? '✕ Не е запазено' : '✕ Not saved'}${saveError ? ` – ${saveError}` : ''}`,
    conflict: `✕ ${saveError}`,
  }[saveState];
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs font-['Manrope'] text-neutral-600 dark:text-zinc-300" role="status" aria-live="polite" data-testid="session-save-state" data-state={saveState}>
      <span>{text}</span>
      {saveState === 'error' && <button type="button" className={BTN_GHOST} onClick={onRetry} data-testid="session-save-retry">{bg ? 'Опитай отново' : 'Try again'}</button>}
      {saveState === 'conflict' && <button type="button" className={BTN_GHOST} onClick={onReload} data-testid="session-save-reload">{bg ? 'Презареди' : 'Reload'}</button>}
    </div>
  );
};

/**
 * One Field Session. Sections: Преглед · Станции и наблюдения · Проверка · Обработка · Документи. An unconfirmed
 * manual session is edited here (local-first, serialised autosave); a confirmed one shows its evidence read-only
 * and offers the next step (process) or a revision; a notebook-photo session mirrors its capture and sends the
 * review to the existing capture workflow.
 */
const FieldSessionDetail = ({ projectId, sessionId, bg = true, initialSection = '', onBack, onOpenSession }) => {
  const draft = useSessionDraft({ sessionId, bg });
  const { session, setSession, setups, meta, editable, saveState, saveError, editSetups, editMeta, flush, ensureSaved, reload } = draft;

  const [section, setSection] = useState(VALID.has(initialSection) ? initialSection : '');
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState('');
  const [selectRequest, setSelectRequest] = useState(null);

  useEffect(() => { if (session && !section) setSection(defaultSection(session)); }, [session, section]);

  const refresh = useCallback(async () => {
    try { setSession(await fieldSessionsApi.get(sessionId)); } catch { /* the visible view stays as it was */ }
  }, [sessionId, setSession]);

  const goto = useCallback((id) => {
    setSection(id);
    setActionError('');
    // confirmed / capture-backed sessions have no local edits to protect - pick up changes made elsewhere
    // (a capture confirmed in the review, a run made in the processing form)
    if (!editable) refresh();
  }, [editable, refresh]);

  const run = async (fn) => {
    setBusy(true);
    setActionError('');
    try {
      return await fn();
    } catch (e) {
      setActionError(sessionErrorMessage(e, bg));
      if (e && (e.code === 'VALIDATION_ERRORS' || e.code === 'SESSION_CONFIRMED')) await refresh();
      return undefined;
    } finally {
      setBusy(false);
    }
  };

  if (draft.loadError) {
    return (
      <div className="flex flex-col gap-3" data-testid="session-load-error">
        <div role="alert" className="p-3 rounded-lg bg-red-50 text-red-700 text-sm font-['Manrope']">{draft.loadError}</div>
        <div className="flex gap-2">
          <button type="button" className={BTN_GHOST} onClick={reload}>{bg ? 'Опитай отново' : 'Try again'}</button>
          <button type="button" className={BTN_GHOST} onClick={onBack}>{bg ? '← Всички сесии' : '← All sessions'}</button>
        </div>
      </div>
    );
  }
  if (!session || !section) return <p className="text-xs text-neutral-400 font-['Manrope']" role="status">{bg ? 'Зареждане...' : 'Loading...'}</p>;

  const badge = statusBadge(session.status, bg);
  const captureLink = session.capture && session.capture.available
    ? `/capture?projectId=${encodeURIComponent(projectId)}&jobId=${encodeURIComponent(session.capture.jobId)}&sessionId=${encodeURIComponent(session.id)}`
    : null;

  const submit = () => run(async () => {
    if (!(await ensureSaved())) throw Object.assign(new Error('x'), { code: 'NOT_SAVED' });
    setSession(await fieldSessionsApi.submit(session.id));
    setSection('review');
  });
  const confirm = () => run(async () => {
    if (!(await ensureSaved())) throw Object.assign(new Error('x'), { code: 'NOT_SAVED' });
    const { data } = await fieldSessionsApi.confirm(session.id);
    setSession(data);
    setSection('overview');
  });
  const revise = () => run(async () => {
    const created = await fieldSessionsApi.revise(session.id);
    onOpenSession(created.id, 'entry');
  });
  const remove = () => run(async () => {
    await fieldSessionsApi.remove(session.id);
    onBack();
  });
  const addPhoto = () => `/capture?projectId=${encodeURIComponent(projectId)}&mode=field-notebook&sessionId=${encodeURIComponent(session.id)}`;

  let body;
  if (section === 'overview') {
    body = <SessionOverview session={session} meta={meta} editable={editable} editMeta={editMeta} onGoto={goto} onOpenSession={onOpenSession} bg={bg} />;
  } else if (section === 'entry') {
    if (session.confirmed) body = <SessionEvidence evidence={session.evidence} bg={bg} />;
    else if (session.source === 'capture') {
      body = <p className="text-sm text-neutral-600 dark:text-zinc-300 font-['Manrope']" data-testid="session-entry-capture">{bg ? 'Наблюденията на тази сесия идват от снимка на полеви карнет и се проверяват в прегледа на заснемането (раздел „Проверка“).' : 'This session\'s observations come from a field notebook photo and are checked in the capture review ("Review" section).'}</p>;
    } else {
      body = (
        <div className="flex flex-col gap-3">
          <SessionEntry setups={setups} editSetups={editSetups} evaluation={session.evaluation} angleUnit={meta.angleUnit || 'gon'} bg={bg} selectRequest={selectRequest} />
          {!setups.length && (
            <Link to={addPhoto()} className={`${BTN_GHOST} self-start inline-flex items-center`} data-testid="session-add-photo">{bg ? 'Или добави от снимка' : 'Or add from a photo'}</Link>
          )}
        </div>
      );
    }
  } else if (section === 'review') {
    body = (
      <SessionReview
        session={session} setups={setups} saveState={saveState} busy={busy} error={actionError} captureLink={captureLink} bg={bg}
        onJump={(issue) => { setSelectRequest({ setup: issue.setup, row: issue.row, nonce: Date.now() }); setSection('entry'); }}
        onSubmit={submit} onConfirm={confirm} onRevise={revise} onDelete={remove}
      />
    );
  } else if (section === 'processing') {
    body = <SessionProcessing session={session} projectId={projectId} onRefresh={refresh} bg={bg} />;
  } else {
    body = <SessionDocuments session={session} projectId={projectId} onChanged={refresh} bg={bg} />;
  }

  return (
    <div className="flex flex-col gap-4" data-testid="field-session-detail">
      <div className="flex flex-col gap-2">
        <button type="button" className={`${BTN_GHOST} self-start`} onClick={onBack} data-testid="session-back">{bg ? '← Всички сесии' : '← All sessions'}</button>
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-lg font-bold font-['Manrope'] text-black dark:text-white" data-testid="session-title">{session.title}</h2>
          <span className={`px-2 py-0.5 rounded-md border text-xs font-semibold font-['Manrope'] ${badge.tone}`} data-testid="session-status">{badge.text}</span>
        </div>
        {editable && <SaveIndicator saveState={saveState} saveError={saveError} onRetry={flush} onReload={reload} bg={bg} />}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label={bg ? 'Раздели на сесията' : 'Session sections'}>
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            type="button"
            role="tab"
            aria-selected={section === s.id}
            onClick={() => goto(s.id)}
            className={`shrink-0 min-h-[44px] px-4 rounded-lg text-sm font-semibold font-['Manrope'] touch-manipulation ${section === s.id ? 'bg-black dark:bg-white text-white dark:text-black' : 'bg-white dark:bg-zinc-900 outline outline-1 outline-gray-300 dark:outline-zinc-700'}`}
            data-testid={`session-section-${s.id}`}
          >
            {bg ? s.bg : s.en}
          </button>
        ))}
      </div>

      {actionError && section !== 'review' && <div role="alert" className="p-3 rounded-lg bg-red-50 text-red-700 text-sm font-['Manrope']" data-testid="session-action-error">{actionError}</div>}
      {body}
    </div>
  );
};

export default FieldSessionDetail;
