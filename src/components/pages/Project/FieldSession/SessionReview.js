import React, { useState } from 'react';
import { splitIssues } from '../../../../utils/fieldSessionView';
import { BTN_PRIMARY, BTN_GHOST, IssueList, DeleteDialog, ConfirmDialog } from './SessionReviewParts';
import SessionPagesReview from './SessionPagesReview';

/**
 * Преглед преди потвърждение. The server's evaluation is the only judge: errors block confirmation (here AND on
 * the server), warnings never block but are listed again in the confirmation dialog so nothing is confirmed unseen.
 * Confirmation needs everything typed to have reached the server (the evaluation shown is of the SAVED version).
 *
 * A session fed by notebook PAGES (photos) is reviewed in SessionPagesReview: the same rules, but over the ONE logical
 * notebook its pages make up.
 */
const SessionReview = ({
  session, projectId, setups, saveState, busy, error, onJump, onSubmit, onConfirm, onRevise, onDelete, onSessionChange, onRefresh, bg = true,
}) => {
  const [stage, setStage] = useState('idle'); // idle | confirm | delete
  const evaluation = session.evaluation;
  const { errors, warnings } = splitIssues(evaluation);
  const manual = session.source === 'manual' || session.source === 'none';
  const saved = saveState === 'saved';
  const canConfirm = manual && !!evaluation && evaluation.summary.canConfirm && saved && !busy;

  if (session.confirmed) {
    return (
      <div className="flex flex-col gap-3" data-testid="session-review">
        <div className="p-3 rounded-xl border border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/20 text-sm font-['Manrope'] text-emerald-900 dark:text-emerald-200" data-testid="session-confirmed-note">
          ✓ {bg ? 'Сесията е потвърдена. Потвърдените данни не могат да се променят.' : 'The session is confirmed. Confirmed data cannot be changed.'}
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className={BTN_GHOST} onClick={onRevise} disabled={busy} data-testid="session-revise">{bg ? 'Създай ревизия за корекции' : 'Create a revision to correct'}</button>
        </div>
        {error && <div role="alert" className="p-3 rounded-lg bg-red-50 text-red-700 text-sm font-['Manrope']">{error}</div>}
      </div>
    );
  }

  if (session.source === 'capture') {
    return (
      <SessionPagesReview
        session={session} projectId={projectId} busy={busy} error={error} bg={bg}
        onSessionChange={onSessionChange} onRefresh={onRefresh} onConfirm={onConfirm} onDelete={onDelete}
      />
    );
  }

  const s = evaluation ? evaluation.summary : { setups: 0, observations: 0, errors: 0, warnings: 0 };
  const reason = !evaluation || s.observations === 0
    ? (bg ? 'Добавете поне едно наблюдение.' : 'Add at least one observation.')
    : s.errors > 0 ? (bg ? 'Поправете грешките, за да потвърдите.' : 'Fix the errors to confirm.')
      : !saved ? (bg ? 'Изчакайте запазването на промените.' : 'Wait for your changes to be saved.') : '';

  return (
    <div className="flex flex-col gap-3" data-testid="session-review">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2" data-testid="review-summary">
        {[
          [bg ? 'Станции' : 'Stations', s.setups, ''],
          [bg ? 'Наблюдения' : 'Observations', s.observations, ''],
          [bg ? 'Грешки' : 'Errors', s.errors, s.errors ? 'text-red-700 dark:text-red-400' : ''],
          [bg ? 'Предупреждения' : 'Warnings', s.warnings, s.warnings ? 'text-amber-700 dark:text-amber-400' : ''],
        ].map(([label, n, tone]) => (
          <div key={label} className="p-3 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <div className={`text-xl font-bold font-['Manrope'] ${tone || 'text-black dark:text-white'}`}>{n}</div>
            <div className="text-xs text-neutral-500 font-['Manrope']">{label}</div>
          </div>
        ))}
      </div>

      {errors.length > 0 && <IssueList title={bg ? 'Грешки – блокират потвърждението' : 'Errors - they block confirmation'} tone="border-red-400 bg-red-50 dark:border-red-700 dark:bg-red-950/30" symbol="✕" issues={errors} setups={setups} onJump={onJump} bg={bg} testId="review-errors" />}
      {warnings.length > 0 && <IssueList title={bg ? 'Предупреждения – за проверка' : 'Warnings - to check'} tone="border-amber-400 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/30" symbol="!" issues={warnings} setups={setups} onJump={onJump} bg={bg} testId="review-warnings" />}
      {evaluation && errors.length === 0 && warnings.length === 0 && s.observations > 0 && (
        <p className="text-sm text-neutral-600 dark:text-zinc-300 font-['Manrope']" data-testid="review-clean">
          {bg ? 'Проверката не откри предупреждения или грешки във въведените данни. Това не означава, че измерванията са точни – проверете ги внимателно преди потвърждение.' : 'The check found no warnings or errors in the entered data. That does not mean the measurements are accurate - review them carefully before confirming.'}
        </p>
      )}

      {saveState !== 'saved' && <p className="text-xs text-neutral-500 font-['Manrope']" data-testid="review-stale">{bg ? 'Показаната проверка е за последно запазената версия.' : 'The check shown is for the last saved version.'}</p>}

      <div className="flex flex-wrap items-center gap-2">
        {session.status === 'draft' && (
          <button type="button" className={BTN_GHOST} onClick={onSubmit} disabled={busy || s.observations === 0 || !saved} data-testid="session-submit">{bg ? 'Маркирай „За проверка“' : 'Mark "Needs review"'}</button>
        )}
        <button type="button" className={BTN_PRIMARY} onClick={() => setStage('confirm')} disabled={!canConfirm} data-testid="session-confirm-start">{bg ? 'Потвърди сесията' : 'Confirm the session'}</button>
        <button type="button" className={BTN_GHOST} onClick={() => setStage('delete')} disabled={busy} data-testid="session-delete">{bg ? 'Изтрий сесията' : 'Delete session'}</button>
      </div>
      {reason && <p className="text-xs text-neutral-500 font-['Manrope']" data-testid="review-confirm-reason">{reason}</p>}

      {stage === 'confirm' && (
        <ConfirmDialog
          bg={bg} busy={busy} warningCount={warnings.length}
          text={bg
            ? `Ще бъдат записани ${s.observations} наблюдения от ${s.setups} станции като потвърдени теренни данни. Те не могат да се променят след това – за корекции се създава ревизия. Досега нищо не е записано.`
            : `${s.observations} observations from ${s.setups} stations will be recorded as confirmed field data. They cannot be changed afterwards - corrections are made in a revision. Nothing has been recorded so far.`}
          onGo={() => { setStage('idle'); onConfirm(); }} onCancel={() => setStage('idle')}
        />
      )}
      {stage === 'delete' && <DeleteDialog bg={bg} busy={busy} onGo={onDelete} onCancel={() => setStage('idle')} />}
      {error && <div role="alert" className="p-3 rounded-lg bg-red-50 text-red-700 text-sm font-['Manrope']" data-testid="session-review-error">{error}</div>}
    </div>
  );
};

export default SessionReview;
