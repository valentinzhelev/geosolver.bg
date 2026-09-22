import React from 'react';
import NotebookFieldInput from './NotebookFieldInput';
import { notebookObservations, nextAttentionObservation, notebookFieldLabel, NOTEBOOK_FIELD_OPTIONS, excludeRowLabel, fieldAddrKey } from '../../../../utils/captureView';

/**
 * MOBILE: a compact station/orientation summary, then ONE observation at a time (previous/next, jump to the next
 * one that needs a look) - practical for use in the field, never a squeezed-down desktop table.
 */
const NotebookRowStepper = ({ setup, rowIndex, onRowChange, selectedKey, onSelect, onCommit, onMapColumn, onToggleExclude, disabled = false, bg = true }) => {
  const rows = notebookObservations(setup);
  const position = Math.max(0, rows.findIndex((r) => r.index === rowIndex));
  const row = rows[position];
  const go = (delta) => {
    const next = rows[Math.min(rows.length - 1, Math.max(0, position + delta))];
    if (next) onRowChange(next.index);
  };
  const problem = row ? nextAttentionObservation(setup, row.index) : null;
  const btn = "px-3 py-2 rounded-lg text-sm font-semibold font-['Manrope'] bg-white dark:bg-zinc-900 outline outline-1 outline-gray-200 dark:outline-zinc-700 disabled:opacity-40";
  const stationAddr = { setup: setup.index, section: 'station', field: 'point' };

  return (
    <div className="flex flex-col gap-3" data-testid="notebook-row-card">
      <div className="p-2 rounded-lg bg-stone-50 dark:bg-zinc-800 text-xs font-['Manrope'] text-neutral-600 dark:text-zinc-300" data-testid="notebook-setup-summary">
        <span className="font-semibold text-black dark:text-white">{bg ? 'Станция' : 'Station'} {setup.station.point.rawText || (bg ? '(без)' : '(none)')}</span>
        {setup.orientation && setup.orientation.target && <span> · {bg ? 'Ориентир' : 'Backsight'} {setup.orientation.target.rawText}</span>}
      </div>

      {!row ? (
        <p className="text-sm text-neutral-400 font-['Manrope']" data-testid="notebook-no-observations">{bg ? 'Няма наблюдения за тази станция.' : 'No observations for this setup.'}</p>
      ) : (
        <>
          <div className="flex items-center justify-between gap-2">
            <button type="button" className={btn} onClick={() => go(-1)} disabled={position === 0}>← {bg ? 'Назад' : 'Prev'}</button>
            <span className="text-sm font-semibold font-['Manrope'] text-black dark:text-white" data-testid="notebook-row-counter">
              {bg ? 'Наблюдение' : 'Observation'} {position + 1} / {rows.length}
            </span>
            <button type="button" className={btn} onClick={() => go(1)} disabled={position === rows.length - 1}>{bg ? 'Напред' : 'Next'} →</button>
          </div>
          {problem !== null && problem !== row.index && (
            <button type="button" className="self-start text-xs underline font-['Manrope'] text-amber-700 dark:text-amber-400" onClick={() => onRowChange(problem)}>
              {bg ? 'Към следващия проблем' : 'Go to the next issue'}
            </button>
          )}
          {onToggleExclude && (
            <button
              type="button" disabled={disabled} onClick={() => onToggleExclude(setup.index, row.index, !row.excluded)}
              className="self-start px-2.5 py-1.5 rounded-lg text-xs font-medium font-['Manrope'] bg-white dark:bg-zinc-900 outline outline-1 outline-gray-200 dark:outline-zinc-700 disabled:opacity-40"
              data-testid="notebook-row-exclude-toggle"
            >
              {excludeRowLabel(row.excluded, bg)}
            </button>
          )}
          <div className={`flex flex-col gap-2 p-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 ${row.excluded ? 'opacity-45' : ''}`} data-row-excluded={row.excluded ? 'true' : 'false'}>
            {row.cols.map((col, i) => {
              const cell = row.cells[i];
              if (!cell) return null;
              const addr = { setup: setup.index, section: 'observation', row: row.index, field: col.field };
              return (
                <div key={col.index} className="flex flex-col gap-1">
                  <label className="flex items-center justify-between gap-2 text-xs font-semibold text-neutral-600 dark:text-zinc-300 font-['Manrope']">
                    <span>{col.field ? notebookFieldLabel(col.field, bg) : col.headerText || (bg ? 'Колона' : 'Column')}</span>
                    <select
                      value={col.field || ''}
                      disabled={disabled}
                      onChange={(e) => onMapColumn(setup.index, col.index, e.target.value || null)}
                      aria-label={`${bg ? 'Значение на колона' : 'Column meaning'} ${col.index + 1}`}
                      className="px-1.5 py-1 rounded-md border border-gray-200 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-[11px]"
                    >
                      {NOTEBOOK_FIELD_OPTIONS.map((o) => <option key={o.value} value={o.value}>{bg ? o.bg : o.en}</option>)}
                    </select>
                  </label>
                  <NotebookFieldInput
                    cell={cell} addr={addr} bg={bg} compact disabled={disabled || row.excluded}
                    selected={fieldAddrKey(addr) === selectedKey} onSelect={onSelect} onCommit={onCommit}
                  />
                </div>
              );
            })}
          </div>
        </>
      )}
      <NotebookFieldInput
        cell={setup.station.point} addr={stationAddr} label={bg ? 'Станция' : 'Station'} compact
        selected={fieldAddrKey(stationAddr) === selectedKey} onSelect={onSelect} onCommit={onCommit} disabled={disabled} bg={bg}
      />
    </div>
  );
};

export default NotebookRowStepper;
