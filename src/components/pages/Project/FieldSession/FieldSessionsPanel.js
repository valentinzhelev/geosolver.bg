import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fieldSessionsApi } from '../../../../services/fieldSessionsApi';
import { sessionErrorMessage, sessionSummaryLine, statusBadge } from '../../../../utils/fieldSessionView';
import CaptureHistory from '../../Capture/CaptureHistory';

const BTN_PRIMARY = "min-h-[44px] px-4 py-2 rounded-lg text-sm font-semibold font-['Manrope'] bg-black dark:bg-white text-white dark:text-black disabled:opacity-40";
const BTN_GHOST = "min-h-[44px] px-3 py-2 rounded-lg text-sm font-semibold font-['Manrope'] bg-white dark:bg-zinc-900 outline outline-1 outline-gray-300 dark:outline-zinc-700 disabled:opacity-40";

/** The next useful action for a session, decided by its (server-derived) state alone. */
function nextAction(session, bg) {
  if (session.status === 'processed') return { label: bg ? 'Виж резултата' : 'See the result', section: 'processing' };
  if (session.status === 'confirmed') return { label: bg ? 'Обработи' : 'Process', section: 'processing' };
  if (session.status === 'review' || session.source === 'capture') return { label: bg ? 'Продължи проверката' : 'Continue the review', section: 'review' };
  return { label: bg ? 'Отвори' : 'Open', section: '' };
}

const SessionCard = ({ session, onOpen, bg }) => {
  const badge = statusBadge(session.status, bg);
  const action = nextAction(session, bg);
  const issueCount = session.issues.errors + session.issues.warnings;
  return (
    <li className="flex flex-col gap-2 p-3 md:p-4 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900" data-testid="field-session-card">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <button type="button" className="min-w-0 text-left min-h-[44px]" onClick={() => onOpen(session.id, '')} data-testid="field-session-open">
          <span className="block text-sm font-bold font-['Manrope'] text-black dark:text-white truncate" data-testid="field-session-title">{session.title}</span>
          <span className="block text-xs text-neutral-500 dark:text-zinc-400 font-['Manrope']">
            {[session.dateLabel, session.operator, session.sourceLabel].filter(Boolean).join(' · ')}
          </span>
        </button>
        <span className={`px-2 py-0.5 rounded-md border text-xs font-semibold font-['Manrope'] ${badge.tone}`} data-testid="field-session-status">{badge.text}</span>
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-['Manrope'] text-neutral-600 dark:text-zinc-300">
        <span data-testid="field-session-counts">{sessionSummaryLine(session, bg)}</span>
        {issueCount > 0 && (
          <span className={session.issues.errors ? 'text-red-700 dark:text-red-400' : 'text-amber-700 dark:text-amber-400'} data-testid="field-session-issues">
            {session.issues.errors ? '✕' : '!'} {issueCount} {bg ? (issueCount === 1 ? 'проблем' : 'проблема') : (issueCount === 1 ? 'issue' : 'issues')}
          </span>
        )}
        {session.processing.runCount > 0 && (
          <span data-testid="field-session-processing">
            {session.processing.runCount} {bg ? 'обработки' : 'runs'} · {session.processing.pointCount} {bg ? 'точки' : 'points'} · {session.processing.reportCount} {bg ? 'отчета' : 'reports'}
          </span>
        )}
        {session.revisionOf && <span>{bg ? 'ревизия' : 'revision'}</span>}
      </div>
      <button type="button" className={`${BTN_GHOST} self-start`} onClick={() => onOpen(session.id, action.section)} data-testid="field-session-next">{action.label}</button>
    </li>
  );
};

/**
 * "Теренни данни": the project's Field Sessions first; then, for compatibility, the captures that belong to no
 * session (made before sessions existed, or not yet wrapped in one) and the legacy digital carnets. Nothing is
 * migrated or hidden: every older capture stays reachable, and one tap wraps a notebook capture in a new session.
 */
const FieldSessionsPanel = ({ projectId, bg = true, onOpenSession, onOpenCapture }) => {
  const [data, setData] = useState(null); // null = loading
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [captureRefresh, setCaptureRefresh] = useState(0);

  const load = useCallback(() => {
    if (!projectId) return undefined;
    let cancelled = false;
    setError('');
    fieldSessionsApi.list(projectId)
      .then((d) => { if (!cancelled) setData(d); })
      .catch((e) => { if (!cancelled) { setError(sessionErrorMessage(e, bg)); setData({ sessions: [], attachedCaptureJobIds: [], legacyFieldBooks: { total: 0, active: 0 } }); } });
    return () => { cancelled = true; };
  }, [projectId, bg]);

  useEffect(() => load(), [load]);

  const createSession = async (body, section) => {
    setBusy(true);
    setError('');
    try {
      const created = await fieldSessionsApi.create({ projectId, ...body });
      onOpenSession(created.id, section);
    } catch (e) {
      setError(sessionErrorMessage(e, bg));
      setBusy(false);
    }
  };

  const sessions = data ? data.sessions : [];
  const legacy = data ? data.legacyFieldBooks : { total: 0, active: 0 };

  return (
    <div className="flex flex-col gap-4" data-testid="field-sessions-panel">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <h2 className="text-sm font-bold font-['Manrope'] text-black dark:text-white">{bg ? 'Теренни данни' : 'Field data'}</h2>
          <p className="text-xs text-neutral-500 dark:text-zinc-400 font-['Manrope']">
            {bg
              ? 'Теренни сесии: една реална работа в полето – станции и наблюдения, въведени ръчно или от снимка на полеви карнет. Сесията се проверява, потвърждава и тогава се обработва до точки и отчет.'
              : 'Field sessions: one real piece of work in the field - stations and observations entered manually or from a field notebook photo. A session is checked, confirmed, then processed into points and a report.'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className={BTN_PRIMARY} onClick={() => createSession({}, 'entry')} disabled={busy} data-testid="field-session-new">{bg ? 'Нова теренна сесия' : 'New field session'}</button>
          <Link to={`/capture?projectId=${encodeURIComponent(projectId)}`} className={`${BTN_GHOST} inline-flex items-center`} data-testid="project-field-data-new">{bg ? 'Ново заснемане' : 'New capture'}</Link>
        </div>
      </div>

      {error && <div role="alert" className="p-3 rounded-lg bg-red-50 text-red-700 text-sm font-['Manrope']" data-testid="field-sessions-error">{error}</div>}
      {data === null && <p className="text-xs text-neutral-400 font-['Manrope']" role="status">{bg ? 'Зареждане...' : 'Loading...'}</p>}
      {data && sessions.length === 0 && !error && (
        <p className="text-sm text-neutral-500 dark:text-zinc-400 font-['Manrope']" data-testid="field-sessions-empty">{bg ? 'Още няма теренни сесии в този проект.' : 'There are no field sessions in this project yet.'}</p>
      )}
      {sessions.length > 0 && (
        <ul className="flex flex-col gap-2" aria-label={bg ? 'Теренни сесии' : 'Field sessions'} data-testid="field-sessions-list">
          {sessions.map((s) => <SessionCard key={s.id} session={s} onOpen={onOpenSession} bg={bg} />)}
        </ul>
      )}

      {data && (
        <CaptureHistory
          projectId={projectId}
          refreshKey={captureRefresh}
          excludeIds={data.attachedCaptureJobIds}
          title={bg ? 'Заснемания извън сесия' : 'Captures outside a session'}
          emptyText={bg ? 'Няма заснемания извън сесиите.' : 'No captures outside the sessions.'}
          onOpen={onOpenCapture}
          rowAction={(job) => (job.mode === 'field-notebook' ? (
            <button type="button" className={BTN_GHOST} disabled={busy} onClick={async () => { await createSession({ captureJobId: job.id }, 'review'); setCaptureRefresh((n) => n + 1); }} data-testid="capture-to-session">
              {bg ? 'Създай сесия' : 'Create session'}
            </button>
          ) : null)}
          bg={bg}
        />
      )}

      {legacy.total > 0 && (
        <section className="flex flex-col gap-2 p-3 md:p-4 rounded-xl border border-gray-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-950" aria-label={bg ? 'Карнети от предходния модул' : 'Carnets from the previous module'} data-testid="legacy-carnets">
          <h3 className="text-sm font-bold font-['Manrope'] text-black dark:text-white">{bg ? 'Карнети от предходния модул' : 'Carnets from the previous module'}</h3>
          <p className="text-xs text-neutral-600 dark:text-zinc-300 font-['Manrope']">
            {bg
              ? `Проектът има ${legacy.total} ${legacy.total === 1 ? 'карнет' : 'карнета'} (${legacy.active} активни) в модула за електронни карнети. Те остават непроменени и се отварят от него.`
              : `This project has ${legacy.total} ${legacy.total === 1 ? 'carnet' : 'carnets'} (${legacy.active} active) in the electronic carnets module. They are unchanged and open from there.`}
          </p>
          <Link to="/fieldbook" className="self-start text-sm font-semibold underline font-['Manrope'] text-neutral-700 dark:text-zinc-200" data-testid="legacy-carnets-link">{bg ? 'Към електронните карнети' : 'Go to electronic carnets'}</Link>
        </section>
      )}
    </div>
  );
};

export default FieldSessionsPanel;
