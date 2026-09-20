import React from 'react';
import CaptureCellInput from './CaptureCellInput';
import { SEMANTIC_OPTIONS, dataRows } from '../../../utils/captureView';

const MAPPING_NOTE = {
  ambiguous: { bg: 'Потвърдете значението', en: 'Confirm the meaning' },
  unmapped: { bg: 'Не е разпозната', en: 'Not recognised' },
};

/** DESKTOP: the reconstructed table. Column meanings are editable; every cell shows its own review state. */
const CaptureTable = ({ table, selected, onSelect, onCommit, onMapColumn, disabled = false, bg = true }) => {
  const rows = dataRows(table);
  return (
    <div className="overflow-auto rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 max-h-[70vh]">
      <table className="min-w-full text-left border-collapse">
        <thead className="sticky top-0 bg-stone-50 dark:bg-zinc-800 z-10">
          <tr>
            <th className="p-2 text-[10px] uppercase tracking-wide text-neutral-400 font-['Manrope']">#</th>
            {table.columns.map((col) => {
              const note = MAPPING_NOTE[col.mapping];
              return (
                <th key={col.index} className="p-2 align-top min-w-[130px]">
                  <div className="text-[11px] font-semibold text-neutral-700 dark:text-zinc-200 font-['Manrope'] mb-1 truncate" title={col.headerText}>
                    {col.headerText || (bg ? '(без заглавие)' : '(no header)')}
                  </div>
                  <select
                    value={col.semantic || ''}
                    disabled={disabled}
                    onChange={(e) => onMapColumn(col.index, e.target.value || null)}
                    aria-label={`${bg ? 'Значение на колона' : 'Column meaning'} ${col.index + 1}`}
                    className="w-full px-2 py-1 rounded-lg border border-gray-200 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-xs font-medium font-['Manrope']"
                  >
                    {SEMANTIC_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{bg ? o.bg : o.en}</option>
                    ))}
                  </select>
                  {note && !col.semantic && (
                    <div className="mt-0.5 text-[10px] text-amber-700 dark:text-amber-400 font-['Manrope']">! {bg ? note.bg : note.en}</div>
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.index} className="align-top border-t border-gray-100 dark:border-zinc-800" data-row-status={row.status}>
              <td className="p-2 text-xs tabular-nums text-neutral-400 font-['Manrope']">{row.index + 1}</td>
              {table.columns.map((col) => {
                const cell = row.cells.find((c) => c.col === col.index);
                if (!cell) return <td key={col.index} />;
                return (
                  <td key={col.index} className={`p-1 ${col.semantic ? '' : 'opacity-50'}`}>
                    <CaptureCellInput
                      cell={cell}
                      row={row}
                      bg={bg}
                      disabled={disabled}
                      selected={selected && selected.row === row.index && selected.col === col.index}
                      onSelect={onSelect}
                      onCommit={onCommit}
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CaptureTable;
