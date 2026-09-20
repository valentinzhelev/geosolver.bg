import React, { useEffect, useState } from 'react';
import { CELL_STATES, cellDisplayValue, cellStateLabel } from '../../../utils/captureView';

/**
 * One editable cell. It shows the value the user currently sees (correction or OCR text), commits on blur / Enter only
 * when the text really changed, and always shows its review state with a symbol AND a word (never colour alone).
 * Editing never touches the OCR text: the server keeps it (rawText) beside the correction.
 */
const CaptureCellInput = ({ cell, row, selected, onSelect, onCommit, disabled = false, bg = true, compact = false }) => {
  const shown = cellDisplayValue(cell);
  const [draft, setDraft] = useState(shown);
  useEffect(() => setDraft(shown), [shown]);
  const state = CELL_STATES[cell.reviewState] ? cell.reviewState : 'accepted';
  const meta = CELL_STATES[state];
  const issues = (cell.validation && cell.validation.issues) || [];

  const commit = () => {
    if (draft !== shown) onCommit(row.index, cell.col, draft);
  };

  return (
    <div className={`flex flex-col gap-0.5 rounded-lg border ${meta.tone} ${selected ? 'ring-2 ring-orange-500' : ''} ${compact ? 'p-2' : 'p-1'}`} data-state={state}>
      <input
        value={draft}
        disabled={disabled}
        onFocus={() => onSelect(row.index, cell.col)}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            commit();
          }
        }}
        aria-label={`${bg ? 'Ред' : 'Row'} ${row.index + 1}: ${cellStateLabel(state, bg)}`}
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

export default CaptureCellInput;
