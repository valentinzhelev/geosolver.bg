import React, { useEffect, useState } from 'react';
import { CELL_STATES, cellDisplayValue, cellStateLabel } from '../../../../utils/captureView';

/**
 * One editable Field Notebook field (station point, instrument height, orientation target/direction, or one
 * observation cell). Addressed by `addr` ({setup, section, row?, field}) rather than {row, col} - see
 * capture/notebook/jobService.js#applyNotebookReviewEdits on the server for the same shape. Otherwise identical to
 * CaptureCellInput: shows the current value (correction or OCR text), commits on blur/Enter only when changed, and
 * always shows its review state with a symbol AND a word (never colour alone). rawText is never touched.
 */
const NotebookFieldInput = ({ cell, addr, label, selected, onSelect, onCommit, disabled = false, bg = true, compact = false }) => {
  const shown = cellDisplayValue(cell);
  const [draft, setDraft] = useState(shown);
  useEffect(() => setDraft(shown), [shown]);
  const state = CELL_STATES[cell.reviewState] ? cell.reviewState : 'accepted';
  const meta = CELL_STATES[state];
  const issues = (cell.validation && cell.validation.issues) || [];

  const commit = () => { if (draft !== shown) onCommit(addr, draft); };

  return (
    <div className={`flex flex-col gap-0.5 rounded-lg border ${meta.tone} ${selected ? 'ring-2 ring-orange-500' : ''} ${compact ? 'p-2' : 'p-1'}`} data-state={state}>
      {label && <span className="text-[10px] text-neutral-500 dark:text-zinc-400 font-['Manrope']">{label}</span>}
      <input
        value={draft}
        disabled={disabled}
        onFocus={() => onSelect(addr)}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            commit();
          }
        }}
        aria-label={`${label || ''} ${cellStateLabel(state, bg)}`}
        aria-invalid={state === 'invalid'}
        className={`w-full bg-transparent outline-none font-mono ${compact ? 'text-base' : 'text-xs'} text-black dark:text-white`}
        inputMode="text"
      />
      <span className="text-[10px] leading-none text-neutral-600 dark:text-zinc-300 font-['Manrope']" title={issues.map((i) => i.message).join(' ')}>
        <span aria-hidden="true">{meta.symbol}</span> {bg ? meta.bg : meta.en}
      </span>
      {issues.length > 0 && (
        <span className="text-[10px] leading-tight text-neutral-500 dark:text-zinc-400 font-['Manrope']">{issues[0].message}</span>
      )}
    </div>
  );
};

export default NotebookFieldInput;
