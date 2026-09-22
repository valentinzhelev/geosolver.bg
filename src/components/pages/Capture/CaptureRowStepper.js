import React from 'react';
import CaptureCellInput from './CaptureCellInput';
import { dataRows, nextAttentionRow, semanticLabel, SEMANTIC_OPTIONS, excludeRowLabel } from '../../../utils/captureView';

/**
 * MOBILE: one row at a time as a card (image above, fields below, previous / next). The desktop table is deliberately
 * not squeezed onto a phone.
 */
const CaptureRowStepper = ({ table, rowIndex, onRowChange, selected, onSelect, onCommit, onMapColumn, onToggleExclude, disabled = false, bg = true }) => {
  const rows = dataRows(table);
  const position = Math.max(0, rows.findIndex((r) => r.index === rowIndex));
  const row = rows[position];
  if (!row) return null;
  const go = (delta) => {
    const next = rows[Math.min(rows.length - 1, Math.max(0, position + delta))];
    if (next) onRowChange(next.index);
  };
  const problem = nextAttentionRow(table, row.index);
  const btn = "px-3 py-2 rounded-lg text-sm font-semibold font-['Manrope'] bg-white dark:bg-zinc-900 outline outline-1 outline-gray-200 dark:outline-zinc-700 disabled:opacity-40";

  return (
    <div className="flex flex-col gap-3" data-testid="capture-row-card">
      <div className="flex items-center justify-between gap-2">
        <button type="button" className={btn} onClick={() => go(-1)} disabled={position === 0}>← {bg ? 'Назад' : 'Prev'}</button>
        <span className="text-sm font-semibold font-['Manrope'] text-black dark:text-white" data-testid="capture-row-counter">
          {bg ? 'Ред' : 'Row'} {position + 1} / {rows.length}
        </span>
        <button type="button" className={btn} onClick={() => go(1)} disabled={position === rows.length - 1}>{bg ? 'Напред' : 'Next'} →</button>
      </div>
      {problem !== null && problem !== row.index && (
        <button type="button" className="self-start text-xs underline font-['Manrope'] text-amber-700 dark:text-amber-400" onClick={() => onRowChange(problem)}>
          {bg ? 'Към следващия ред за проверка' : 'Go to the next row to check'}
        </button>
      )}
      {onToggleExclude && (
        <button
          type="button"
          disabled={disabled}
          onClick={() => onToggleExclude(row.index, !row.excluded)}
          className="self-start px-2.5 py-1.5 rounded-lg text-xs font-medium font-['Manrope'] bg-white dark:bg-zinc-900 outline outline-1 outline-gray-200 dark:outline-zinc-700 disabled:opacity-40"
          data-testid="capture-row-exclude-toggle"
        >
          {excludeRowLabel(row.excluded, bg)}
        </button>
      )}
      <div className={`flex flex-col gap-2 p-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 ${row.excluded ? 'opacity-45' : ''}`} data-row-excluded={row.excluded ? 'true' : 'false'}>
        {table.columns.map((col) => {
          const cell = row.cells.find((c) => c.col === col.index);
          if (!cell) return null;
          return (
            <div key={col.index} className="flex flex-col gap-1">
              <label className="flex items-center justify-between gap-2 text-xs font-semibold text-neutral-600 dark:text-zinc-300 font-['Manrope']">
                <span>{col.semantic ? semanticLabel(col.semantic, bg) : col.headerText || (bg ? 'Колона' : 'Column')}</span>
                <select
                  value={col.semantic || ''}
                  disabled={disabled}
                  onChange={(e) => onMapColumn(col.index, e.target.value || null)}
                  aria-label={`${bg ? 'Значение на колона' : 'Column meaning'} ${col.index + 1}`}
                  className="px-1.5 py-1 rounded-md border border-gray-200 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-[11px]"
                >
                  {SEMANTIC_OPTIONS.map((o) => <option key={o.value} value={o.value}>{bg ? o.bg : o.en}</option>)}
                </select>
              </label>
              <CaptureCellInput
                cell={cell}
                row={row}
                bg={bg}
                compact
                disabled={disabled || row.excluded}
                selected={selected && selected.row === row.index && selected.col === col.index}
                onSelect={onSelect}
                onCommit={onCommit}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CaptureRowStepper;
