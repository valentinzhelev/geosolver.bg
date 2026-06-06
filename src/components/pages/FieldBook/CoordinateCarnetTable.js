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
  tdSum,
} from './carnetGrid';

const fmt = (v) => (v === '' || v === null || v === undefined ? '' : v);

const CoordinateCarnetTable = ({
  rows,
  summary,
  locked,
  bg,
  onUpdateRow,
  onDuplicate,
  onRemove,
}) => {
  return (
    <div className={gridWrap}>
      <table className={gridTable}>
        <thead>
          <tr>
            <th rowSpan={2} className={thGroup}>
              №
            </th>
            <th rowSpan={2} className={thGroup}>
              {bg ? 'Полигонови ъгли' : 'Polygon angles'}
              <span className={thFormula}>β (gon)</span>
            </th>
            <th rowSpan={2} className={thGroup}>
              {bg ? 'Посочни ъгли' : 'Bearings'}
              <span className={thFormula}>α = α₋₁ + β − 200</span>
            </th>
            <th rowSpan={2} className={thGroup}>
              {bg ? 'Разстояние' : 'Distance'}
              <span className={thFormula}>S (m)</span>
            </th>
            <th colSpan={2} className={thGroup}>
              {bg ? 'Координатни разлики' : 'Coordinate differences'}
            </th>
            <th colSpan={2} className={thGroup}>
              {bg ? 'Координати' : 'Coordinates'}
            </th>
            {!locked && <th rowSpan={2} className={thGroup} aria-label="actions" />}
          </tr>
          <tr>
            <th className={thCol}>
              ΔY<span className={thFormula}>S·sinα</span>
            </th>
            <th className={thCol}>
              ΔX<span className={thFormula}>S·cosα</span>
            </th>
            <th className={thCol}>
              Y<span className={thFormula}>Yᵢ + ΔY</span>
            </th>
            <th className={thCol}>
              X<span className={thFormula}>Xᵢ + ΔX</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row._id || index} className={row.isControl ? 'bg-stone-100/70 dark:bg-zinc-800/40' : ''}>
              <td className={tdCell}>
                <input
                  className={cellInput}
                  value={row.pointNo}
                  disabled={locked}
                  onChange={(e) => onUpdateRow(index, 'pointNo', e.target.value)}
                  placeholder={String(index + 1)}
                />
              </td>
              <td className={tdCell}>
                <input
                  type="number"
                  step="any"
                  className={cellInput}
                  value={row.beta}
                  disabled={locked}
                  onChange={(e) => onUpdateRow(index, 'beta', e.target.value)}
                  title={index === 0 ? (bg ? 'Първият посочен ъгъл се задава в настройките' : 'First bearing is set in settings') : ''}
                />
              </td>
              <td className={tdCell}>
                <div className={cellReadOnly}>{fmt(row.alpha)}</div>
              </td>
              <td className={tdCell}>
                <input
                  type="number"
                  step="any"
                  className={cellInput}
                  value={row.distance}
                  disabled={locked}
                  onChange={(e) => onUpdateRow(index, 'distance', e.target.value)}
                />
              </td>
              <td className={tdCell}>
                <div className={cellReadOnly}>{fmt(row.deltaY)}</div>
              </td>
              <td className={tdCell}>
                <div className={cellReadOnly}>{fmt(row.deltaX)}</div>
              </td>
              <td className={tdCell}>
                <div className={cellReadOnly}>{fmt(row.y)}</div>
              </td>
              <td className={tdCell}>
                <div className={cellReadOnly}>{fmt(row.x)}</div>
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
          {summary && (
            <tr>
              <td className={tdSum}>Σ</td>
              <td className={tdSum}>{fmt(summary.sumBeta)}</td>
              <td className={tdSum} />
              <td className={tdSum}>{fmt(summary.sumS)}</td>
              <td className={tdSum}>{fmt(summary.sumDeltaY)}</td>
              <td className={tdSum}>{fmt(summary.sumDeltaX)}</td>
              <td className={tdSum} />
              <td className={tdSum} />
              {!locked && <td className={tdSum} />}
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CoordinateCarnetTable;
