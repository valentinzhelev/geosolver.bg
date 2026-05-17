import React from 'react';

export function EduWorkBanner({ eduCtx, bg, onApply, onDismiss, showApply }) {
  if (!eduCtx) return null;
  return (
    <div className="mb-4 p-3 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 flex flex-wrap items-center justify-between gap-2">
      <p className="text-sm font-['Manrope'] text-indigo-900 dark:text-indigo-200">
        {bg
          ? `Работите по задание: ${eduCtx.assignmentTitle || ''}`
          : `Working on assignment: ${eduCtx.assignmentTitle || ''}`}
      </p>
      <div className="flex gap-2">
        {showApply && onApply && (
          <button
            type="button"
            onClick={onApply}
            className="px-3 py-1.5 text-sm rounded-lg bg-indigo-600 text-white font-medium"
          >
            {bg ? 'Запиши в заданието' : 'Save to assignment'}
          </button>
        )}
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="px-3 py-1.5 text-sm rounded-lg outline outline-1 outline-indigo-300 text-indigo-800 dark:text-indigo-200"
          >
            {bg ? 'Затвори' : 'Dismiss'}
          </button>
        )}
      </div>
    </div>
  );
}

export default EduWorkBanner;
