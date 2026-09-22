import React, { useEffect, useState } from 'react';
import CaptureCellCrop from './CaptureCellCrop';
import { cellDisplayValue, cellStateLabel, arbitrationReason, candidateAlternatives } from '../../../utils/captureView';

/**
 * V2.2 review panel for the SELECTED cell: an enlarged crop, the current value, why it needs a second look (when it
 * does), and any alternative readings the server gathered as buttons. Picking an alternative or typing a correction
 * both go through the normal correction path (onCommit): nothing here decides trust on its own - it only lets the
 * user act on the evidence the server already produced.
 */
const CaptureCandidatePanel = ({ cell, row, imageUrl, onCommit, disabled = false, bg = true }) => {
  const shown = cell ? cellDisplayValue(cell) : '';
  const [draft, setDraft] = useState(shown);
  useEffect(() => setDraft(shown), [shown]);

  if (!cell || !row) {
    return (
      <div className="p-4 rounded-xl border border-dashed border-gray-300 dark:border-zinc-700 text-xs text-neutral-400 font-['Manrope']" data-testid="capture-candidates-empty">
        {bg ? 'Изберете клетка от таблицата, за да видите уголемен изглед и алтернативни разчитания.' : 'Select a cell in the table to see a close-up and alternative readings.'}
      </div>
    );
  }

  const alternatives = candidateAlternatives(cell);
  const reason = arbitrationReason(cell, bg);
  const commit = () => { if (draft !== shown) onCommit(row.index, cell.col, draft); };
  const pick = (value) => onCommit(row.index, cell.col, value);
  const btn = "px-2.5 py-1.5 rounded-lg text-xs font-semibold font-['Manrope'] bg-white dark:bg-zinc-900 outline outline-1 outline-gray-200 dark:outline-zinc-700 disabled:opacity-40 text-left";

  return (
    <div className="flex flex-col gap-3 p-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900" data-testid="capture-candidates">
      <CaptureCellCrop imageUrl={imageUrl} bbox={cell.bbox} bg={bg} className="w-full h-28 object-none" />
      <div>
        <div className="text-[10px] uppercase tracking-wide text-neutral-400 font-['Manrope']">{bg ? 'Прочетено' : 'Read as'}</div>
        <input
          value={draft}
          disabled={disabled}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); commit(); } }}
          className="w-full mt-0.5 px-2 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-600 bg-white dark:bg-zinc-900 font-mono text-sm text-black dark:text-white"
          aria-label={bg ? 'Стойност на клетката' : 'Cell value'}
        />
        <div className="mt-1 text-[11px] text-neutral-500 dark:text-zinc-400 font-['Manrope']">{cellStateLabel(cell.reviewState, bg)}</div>
      </div>
      {reason && <p className="text-xs text-amber-700 dark:text-amber-400 font-['Manrope']" data-testid="capture-candidates-reason">{reason}</p>}
      {alternatives.length > 0 && (
        <div>
          <div className="text-[10px] uppercase tracking-wide text-neutral-400 font-['Manrope'] mb-1">{bg ? 'Други разчитания' : 'Other readings'}</div>
          <div className="flex flex-col gap-1">
            {alternatives.map((a, i) => (
              <button key={`${a.text}-${i}`} type="button" className={btn} disabled={disabled} onClick={() => pick(a.text)} data-testid="capture-candidate-option">
                <span className="font-mono">{a.text}</span>
                {a.source === 'generated-alternative' && <span className="ml-2 text-[10px] text-neutral-400">{bg ? '(изведено)' : '(inferred)'}</span>}
                {a.passCount > 0 && <span className="ml-2 text-[10px] text-neutral-400">{bg ? `${a.passCount}× разчетено` : `read ${a.passCount}×`}</span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CaptureCandidatePanel;
