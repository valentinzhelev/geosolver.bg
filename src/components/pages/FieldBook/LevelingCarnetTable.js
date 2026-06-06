import React from 'react';
import {
  gridWrap,
  gridTable,
  thGroup,
  thCol,
  thFormula,
  tdCell,
  cellInput,
  cellReadOnly,
} from './carnetGrid';

const fmt = (v) => (v === '' || v === null || v === undefined ? '' : v);

const LevelingCarnetTable = ({ rows, locked, bg, onUpdateRow, onDuplicate, onRemove }) => {
  return (
    <div className={gridWrap}>
      <table className={gridTable}>
        <thead>
          <tr>
            <th className={thGroup}>{bg ? 'Станция' : 'Station'}</th>
            <th className={thGroup}>
              {bg ? 'Задно' : 'Back'}
              <span className={thFormula}>a (m)</span>
            </th>
            <th className={thGroup}>
              {bg ? 'Предно' : 'Fore'}
              <span className={thFormula}>b (m)</span>
            </th>
            <th className={thCol}>
              Δ<span className={thFormula}>a − b (m)</span>
            </th>
            <th className={thCol}>
              {bg ? 'Кота H' : 'Elev. H'}
              <span className={thFormula}>Hᵢ + Δ (m)</span>
            </th>
            <th className={thGroup}>{bg ? 'Контр.' : 'Ctrl.'}</th>
            {!locked && <th className={thGroup} aria-label="actions" />}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row._id || index} className={row.isControl ? 'bg-stone-100/70 dark:bg-zinc-800/40' : ''}>
              <td className={tdCell}>
                <input
                  className={`${cellInput} text-left`}
                  value={row.station}
                  disabled={locked}
                  onChange={(e) => onUpdateRow(index, 'station', e.target.value)}
                />
              </td>
              <td className={tdCell}>
                <input
                  type="number"
                  step="any"
                  className={cellInput}
                  value={row.back}
                  disabled={locked}
                  onChange={(e) => onUpdateRow(index, 'back', e.target.value)}
                />
              </td>
              <td className={tdCell}>
                <input
                  type="number"
                  step="any"
                  className={cellInput}
                  value={row.fore}
                  disabled={locked}
                  onChange={(e) => onUpdateRow(index, 'fore', e.target.value)}
                />
              </td>
              <td className={tdCell}>
                <div className={cellReadOnly}>{fmt(row.delta)}</div>
              </td>
              <td className={tdCell}>
                {index === 0 && !locked ? (
                  <input
                    type="number"
                    step="any"
                    className={cellInput}
                    value={row.height}
                    onChange={(e) => onUpdateRow(index, 'height', e.target.value)}
                    placeholder={bg ? 'репер' : 'BM'}
                  />
                ) : (
                  <div className={cellReadOnly}>{fmt(row.height)}</div>
                )}
              </td>
              <td className={`${tdCell} text-center`}>
                <input
                  type="checkbox"
                  checked={row.isControl}
                  disabled={locked}
                  onChange={(e) => onUpdateRow(index, 'isControl', e.target.checked)}
                />
              </td>
              {!locked && (
                <td className={`${tdCell} px-1 whitespace-nowrap text-center`}>
                  <button
                    type="button"
                    onClick={() => onDuplicate(index)}
                    title={bg ? 'Дублирай' : 'Duplicate'}
                    className="px-1 text-neutral-500 hover:text-black dark:hover:text-white"
                  >
                    ⧉
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemove(index)}
                    title={bg ? 'Изтрий' : 'Delete'}
                    className="px-1 text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LevelingCarnetTable;
