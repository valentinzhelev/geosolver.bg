import React from 'react';
import { getCalculatorPolicyMeta } from '../../../config/eduCalculatorPolicy';

export function EduWorkBanner({ eduCtx, bg, onApply, onDismiss, showApply }) {
  if (!eduCtx) return null;
  const policyMeta = getCalculatorPolicyMeta(eduCtx.calculatorPolicy, bg);
  return (
    <div className="mb-4 p-3 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 flex flex-col gap-2">
      <p className="text-sm font-['Manrope'] text-indigo-900 dark:text-indigo-200">
        {bg
          ? `Работите по задание: ${eduCtx.assignmentTitle || ''}`
          : `Working on assignment: ${eduCtx.assignmentTitle || ''}`}
        <span className="ml-2 text-xs opacity-80">({policyMeta.label})</span>
      </p>
      <p className="text-xs font-['Manrope'] text-indigo-800/90 dark:text-indigo-300/90">{policyMeta.studentHint}</p>
      <div className="flex flex-wrap gap-2">
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
