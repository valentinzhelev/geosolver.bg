import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { issueLocation, splitIssues } from '../../../../utils/fieldSessionView';

const BTN_PRIMARY = "min-h-[48px] px-4 py-2 rounded-lg text-base font-semibold font-['Manrope'] bg-black dark:bg-white text-white dark:text-black disabled:opacity-40 disabled:cursor-not-allowed";
const BTN_GHOST = "min-h-[44px] px-3 py-2 rounded-lg text-sm font-semibold font-['Manrope'] bg-white dark:bg-zinc-900 outline outline-1 outline-gray-300 dark:outline-zinc-700 disabled:opacity-40";

const IssueList = ({ title, tone, symbol, issues, setups, onJump, bg, testId }) => (
  <section className={`flex flex-col gap-2 p-3 rounded-xl border ${tone}`} aria-label={title} data-testid={testId}>
    <h3 className="text-sm font-bold font-['Manrope'] text-black dark:text-white">{symbol} {title} ({issues.length})</h3>
    <ul className="flex flex-col gap-2">
      {issues.map((i, n) => (
        // eslint-disable-next-line react/no-array-index-key
        <li key={`${i.code}-${i.setup}-${i.row}-${i.field}-${n}`} className="flex flex-wrap items-center justify-between gap-2" data-testid="review-issue">
          <span className="flex-1 min-w-0">
            <span className="block text-xs font-semibold font-['Manrope'] text-neutral-600 dark:text-zinc-300">{issueLocation(i, setups, bg)}</span>
            <span className="block text-sm font-['Manrope'] text-black dark:text-white">{i.message}</span>
          </span>
          {onJump && i.setup !== null && i.setup !== undefined && i.section !== 'session' && (
            <button type="button" className={BTN_GHOST} onClick={() => onJump(i)} data-testid="review-issue-jump">{bg ? 'Към полето' : 'Go to field'}</button>
          )}
        </li>
      ))}
    </ul>
  </section>
);

/**
 * Преглед преди потвърждение. The server's evaluation is the only judge: errors block confirmation (here AND on
 * the server), warnings never block but are listed again in the confirmation dialog so nothing is confirmed unseen.
 * Confirmation needs everything typed to have reached the server (the evaluation shown is of the SAVED version).
 */
const SessionReview = ({
  session, setups, saveState, busy, error, onJump, onSubmit, onConfirm, onRevise, onDelete, captureLink, bg = true,
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
    const c = session.capture || {};
    return (
      <div className="flex flex-col gap-3" data-testid="session-review">
        <div className="flex flex-col gap-2 p-3 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900" data-testid="session-capture-card">
          <h3 className="text-sm font-bold font-['Manrope'] text-black dark:text-white">{bg ? 'Снимка на полеви карнет' : 'Field notebook photo'}</h3>
          {!c.available ? (
            <p className="text-sm text-neutral-600 dark:text-zinc-300 font-['Manrope']" data-testid="session-capture-unavailable">{bg ? 'Заснемането вече не е налично. Можете да изтриете сесията и да започнете отново.' : 'The capture is no longer available. You can delete the session and start again.'}</p>
          ) : (
            <>
              <p className="text-sm font-['Manrope'] text-neutral-700 dark:text-zinc-200">
                {session.setupCount} {bg ? 'станции' : 'stations'} · {session.observationCount} {bg ? 'наблюдения' : 'observations'}
                {c.invalid > 0 && <span className="text-red-700 dark:text-red-400"> · ✕ {c.invalid} {bg ? 'невалидни' : 'invalid'}</span>}
                {c.review > 0 && <span className="text-amber-700 dark:text-amber-400"> · ! {c.review} {bg ? 'за проверка' : 'to check'}</span>}
              </p>
              <p className="text-xs text-neutral-500 dark:text-zinc-400 font-['Manrope']">
                {bg ? 'Разпознатото от снимката се проверява и потвърждава в прегледа на заснемането. След потвърждение сесията става „Потвърдена“.' : 'What was recognised from the photo is reviewed and confirmed in the capture review. After confirmation the session becomes "Confirmed".'}
              </p>
              {c.mine && captureLink
                ? <Link to={captureLink} className={`${BTN_PRIMARY} self-start inline-flex items-center`} data-testid="session-continue-capture">{bg ? 'Продължи проверката' : 'Continue the review'}</Link>
                : <p className="text-xs text-neutral-500 font-['Manrope']" data-testid="session-capture-not-mine">{bg ? 'Проверката се извършва от потребителя, качил снимката.' : 'The review is done by the user who uploaded the photo.'}</p>}
            </>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" className={BTN_GHOST} onClick={() => setStage('delete')} disabled={busy} data-testid="session-delete">{bg ? 'Изтрий сесията' : 'Delete session'}</button>
        </div>
        {stage === 'delete' && <DeleteDialog bg={bg} busy={busy} onGo={onDelete} onCancel={() => setStage('idle')} />}
        {error && <div role="alert" className="p-3 rounded-lg bg-red-50 text-red-700 text-sm font-['Manrope']">{error}</div>}
      </div>
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
        <div className="flex flex-col gap-2 p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20 outline outline-1 outline-orange-200 dark:outline-orange-900/50" role="alertdialog" aria-label={bg ? 'Потвърждение' : 'Confirmation'} data-testid="session-confirm-dialog">
          <p className="text-sm font-['Manrope'] text-black dark:text-white">
            {bg
              ? `Ще бъдат записани ${s.observations} наблюдения от ${s.setups} станции като потвърдени теренни данни. Те не могат да се променят след това – за корекции се създава ревизия. Досега нищо не е записано.`
              : `${s.observations} observations from ${s.setups} stations will be recorded as confirmed field data. They cannot be changed afterwards - corrections are made in a revision. Nothing has been recorded so far.`}
          </p>
          {warnings.length > 0 && (
            <p className="text-xs text-amber-800 dark:text-amber-300 font-['Manrope']" data-testid="session-confirm-warnings">! {warnings.length} {bg ? 'предупреждения остават неразрешени.' : 'warnings remain unresolved.'}</p>
          )}
          <div className="flex flex-wrap gap-2">
            <button type="button" className={BTN_PRIMARY} onClick={() => { setStage('idle'); onConfirm(); }} disabled={busy} data-testid="session-confirm-go">{bg ? 'Потвърди' : 'Confirm'}</button>
            <button type="button" className={BTN_GHOST} onClick={() => setStage('idle')}>{bg ? 'Отказ' : 'Cancel'}</button>
          </div>
        </div>
      )}
      {stage === 'delete' && <DeleteDialog bg={bg} busy={busy} onGo={onDelete} onCancel={() => setStage('idle')} />}
      {error && <div role="alert" className="p-3 rounded-lg bg-red-50 text-red-700 text-sm font-['Manrope']" data-testid="session-review-error">{error}</div>}
    </div>
  );
};

const DeleteDialog = ({ bg, busy, onGo, onCancel }) => (
  <div className="flex flex-col gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/20 outline outline-1 outline-red-200 dark:outline-red-900/50" role="alertdialog" aria-label={bg ? 'Потвърждение за изтриване' : 'Confirm deletion'} data-testid="session-delete-dialog">
    <p className="text-sm font-['Manrope'] text-black dark:text-white">{bg ? 'Сесията и въведените в нея данни ще бъдат изтрити. Потвърдени сесии не могат да се изтриват.' : 'The session and its entered data will be deleted. Confirmed sessions cannot be deleted.'}</p>
    <div className="flex flex-wrap gap-2">
      <button type="button" className={BTN_GHOST} onClick={onGo} disabled={busy} data-testid="session-delete-go">{bg ? 'Изтрий' : 'Delete'}</button>
      <button type="button" className={BTN_GHOST} onClick={onCancel}>{bg ? 'Отказ' : 'Cancel'}</button>
    </div>
  </div>
);

export default SessionReview;
