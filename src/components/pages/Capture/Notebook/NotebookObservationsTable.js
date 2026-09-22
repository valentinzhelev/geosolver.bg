import React from 'react';
import NotebookFieldInput from './NotebookFieldInput';
import { NOTEBOOK_FIELD_OPTIONS, notebookObservations, excludeRowLabel, fieldAddrKey } from '../../../../utils/captureView';

const MAPPING_NOTE = {
  ambiguous: { bg: 'Потвърдете значението', en: 'Confirm the meaning' },
  unmapped: { bg: 'Не е разпозната', en: 'Not recognised' },
};

/** DESKTOP: the observation table for ONE setup. Column meanings are editable; every cell shows its own review state. */
const NotebookObservationsTable = ({ setup, selectedKey, onSelect, onCommit, onMapColumn, onToggleExclude, disabled = false, bg = true }) => {
  const rows = notebookObservations(setup);
  const cols = setup.observations[0] ? setup.observations[0].cols : [];
  if (!cols.length) {
    return <p className="text-sm text-neutral-400 font-['Manrope']" data-testid="notebook-no-observations">{bg ? 'Няма разпознати наблюдения за тази станция.' : 'No observations detected for this setup.'}</p>;
  }
  return (
    <div className="overflow-auto rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 max-h-[60vh]">
      <table className="min-w-full text-left border-collapse">
        <thead className="sticky top-0 bg-stone-50 dark:bg-zinc-800 z-10">
          <tr>
            <th className="p-2 text-[10px] uppercase tracking-wide text-neutral-400 font-['Manrope']">#</th>
            {cols.map((col) => {
              const note = MAPPING_NOTE[col.mapping];
              return (
                <th key={col.index} className="p-2 align-top min-w-[120px]">
                  <div className="text-[11px] font-semibold text-neutral-700 dark:text-zinc-200 font-['Manrope'] mb-1 truncate" title={col.headerText}>
                    {col.headerText || (bg ? '(без заглавие)' : '(no header)')}
                  </div>
                  <select
                    value={col.field || ''}
                    disabled={disabled}
                    onChange={(e) => onMapColumn(setup.index, col.index, e.target.value || null)}
                    aria-label={`${bg ? 'Значение на колона' : 'Column meaning'} ${col.index + 1}`}
                    className="w-full px-2 py-1 rounded-lg border border-gray-200 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-xs font-medium font-['Manrope']"
                  >
                    {NOTEBOOK_FIELD_OPTIONS.map((o) => <option key={o.value} value={o.value}>{bg ? o.bg : o.en}</option>)}
                  </select>
                  {note && !col.field && <div className="mt-0.5 text-[10px] text-amber-700 dark:text-amber-400 font-['Manrope']">! {bg ? note.bg : note.en}</div>}
                </th>
              );
            })}
            <th className="p-2 text-[10px] uppercase tracking-wide text-neutral-400 font-['Manrope']" />
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.index}
              className={`align-top border-t border-gray-100 dark:border-zinc-800 ${row.excluded ? 'opacity-45' : ''}`}
              data-row-status={row.status}
              data-row-excluded={row.excluded ? 'true' : 'false'}
            >
              <td className="p-2 text-xs tabular-nums text-neutral-400 font-['Manrope']">{row.index + 1}</td>
              {cols.map((col, i) => {
                const cell = row.cells[i];
                if (!cell) return <td key={col.index} />;
                const addr = { setup: setup.index, section: 'observation', row: row.index, field: col.field };
                return (
                  <td key={col.index} className={`p-1 ${col.field ? '' : 'opacity-50'}`}>
                    <NotebookFieldInput
                      cell={cell} addr={addr} bg={bg} disabled={disabled || row.excluded}
                      selected={fieldAddrKey(addr) === selectedKey} onSelect={onSelect} onCommit={onCommit}
                    />
                  </td>
                );
              })}
              <td className="p-1">
                {onToggleExclude && (
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => onToggleExclude(setup.index, row.index, !row.excluded)}
                    className="px-2 py-1 rounded-lg text-[11px] font-medium font-['Manrope'] bg-white dark:bg-zinc-900 outline outline-1 outline-gray-200 dark:outline-zinc-700 disabled:opacity-40 whitespace-nowrap"
                    data-testid="notebook-row-exclude-toggle"
                  >
                    {excludeRowLabel(row.excluded, bg)}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default NotebookObservationsTable;
