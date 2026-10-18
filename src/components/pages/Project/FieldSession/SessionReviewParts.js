import React from 'react';
import { issueLocation } from '../../../../utils/fieldSessionView';

export const BTN_PRIMARY = "min-h-[48px] px-4 py-2 rounded-lg text-base font-semibold font-['Manrope'] bg-black dark:bg-white text-white dark:text-black disabled:opacity-40 disabled:cursor-not-allowed";
export const BTN_GHOST = "min-h-[44px] px-3 py-2 rounded-lg text-sm font-semibold font-['Manrope'] bg-white dark:bg-zinc-900 outline outline-1 outline-gray-300 dark:outline-zinc-700 disabled:opacity-40";

/**
 * A list of located issues. `locate(issue)` says where each one is (default: station / observation / field of a manual
 * session); `canJump(issue)` decides whether a jump button is offered (default: the issue has a setup).
 */
export const IssueList = ({ title, tone, symbol, issues, setups, onJump, bg, testId, locate = null, canJump = null }) => (
  <section className={`flex flex-col gap-2 p-3 rounded-xl border ${tone}`} aria-label={title} data-testid={testId}>
    <h3 className="text-sm font-bold font-['Manrope'] text-black dark:text-white">{symbol} {title} ({issues.length})</h3>
    <ul className="flex flex-col gap-2">
      {issues.map((i, n) => (
        // eslint-disable-next-line react/no-array-index-key
        <li key={`${i.code}-${i.page}-${i.setup}-${i.row}-${i.field}-${n}`} className="flex flex-wrap items-center justify-between gap-2" data-testid="review-issue">
          <span className="flex-1 min-w-0">
            <span className="block text-xs font-semibold font-['Manrope'] text-neutral-600 dark:text-zinc-300">{locate ? locate(i) : issueLocation(i, setups, bg)}</span>
            <span className="block text-sm font-['Manrope'] text-black dark:text-white">{i.message}</span>
            {i.detail && <span className="block text-xs font-['Manrope'] text-neutral-500 dark:text-zinc-400">{i.detail}</span>}
          </span>
          {onJump && (canJump ? canJump(i) : (i.setup !== null && i.setup !== undefined && i.section !== 'session')) && (
            <button type="button" className={BTN_GHOST} onClick={() => onJump(i)} data-testid="review-issue-jump">{bg ? 'Към полето' : 'Go to field'}</button>
          )}
        </li>
      ))}
    </ul>
  </section>
);

export const DeleteDialog = ({ bg, busy, onGo, onCancel, text = null }) => (
  <div className="flex flex-col gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/20 outline outline-1 outline-red-200 dark:outline-red-900/50" role="alertdialog" aria-label={bg ? 'Потвърждение за изтриване' : 'Confirm deletion'} data-testid="session-delete-dialog">
    <p className="text-sm font-['Manrope'] text-black dark:text-white">{text || (bg ? 'Сесията и въведените в нея данни ще бъдат изтрити. Потвърдени сесии не могат да се изтриват.' : 'The session and its entered data will be deleted. Confirmed sessions cannot be deleted.')}</p>
    <div className="flex flex-wrap gap-2">
      <button type="button" className={BTN_GHOST} onClick={onGo} disabled={busy} data-testid="session-delete-go">{bg ? 'Изтрий' : 'Delete'}</button>
      <button type="button" className={BTN_GHOST} onClick={onCancel}>{bg ? 'Отказ' : 'Cancel'}</button>
    </div>
  </div>
);

/** The explicit confirmation of a session: what will be recorded, that it is final, and any warnings left unresolved. */
export const ConfirmDialog = ({ bg, busy, text, warningCount, onGo, onCancel }) => (
  <div className="flex flex-col gap-2 p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20 outline outline-1 outline-orange-200 dark:outline-orange-900/50" role="alertdialog" aria-label={bg ? 'Потвърждение' : 'Confirmation'} data-testid="session-confirm-dialog">
    <p className="text-sm font-['Manrope'] text-black dark:text-white">{text}</p>
    {warningCount > 0 && (
      <p className="text-xs text-amber-800 dark:text-amber-300 font-['Manrope']" data-testid="session-confirm-warnings">! {warningCount} {bg ? 'предупреждения остават неразрешени.' : 'warnings remain unresolved.'}</p>
    )}
    <div className="flex flex-wrap gap-2">
      <button type="button" className={BTN_PRIMARY} onClick={onGo} disabled={busy} data-testid="session-confirm-go">{bg ? 'Потвърди' : 'Confirm'}</button>
      <button type="button" className={BTN_GHOST} onClick={onCancel}>{bg ? 'Отказ' : 'Cancel'}</button>
    </div>
  </div>
);
