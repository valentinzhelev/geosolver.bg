import React from 'react';
import { Link } from 'react-router-dom';
import { useSharedSurveyPoints } from '../../context/SurveyPointsContext';
import { getEduWorkContext } from '../../utils/eduCalculatorBridge';

/**
 * Dropdown to fill coordinate fields from the points library.
 * @param {function} onSelect - (point) => void
 */
const PointPicker = ({ language = 'bg', label, onSelect, className = '', projectId } = {}) => {
  const bg = language === 'bg';
  const eduProjectId = getEduWorkContext()?.linkedProjectId;
  const effectiveProjectId = projectId || eduProjectId || undefined;
  const { points, loading, hasPoints } = useSharedSurveyPoints(
    effectiveProjectId ? { projectId: effectiveProjectId } : {}
  );

  if (!hasPoints && !loading) {
    return (
      <div className={`text-xs font-['Manrope'] text-neutral-400 dark:text-zinc-500 ${className}`}>
        <Link to="/points" className="underline hover:text-black dark:hover:text-white">
          {bg ? 'Добави точки в библиотеката' : 'Add points to library'}
        </Link>
      </div>
    );
  }

  return (
    <label className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <span className="text-[11px] font-medium font-['Manrope'] text-neutral-500 dark:text-zinc-400">
          {label}
        </span>
      )}
      <select
        defaultValue=""
        disabled={loading}
        onChange={(e) => {
          const id = e.target.value;
          if (!id) return;
          const p = points.find((pt) => pt._id === id);
          if (p) onSelect(p);
          e.target.value = '';
        }}
        className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-xs font-medium font-['Manrope'] text-black dark:text-white outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/20 disabled:opacity-50"
      >
        <option value="">
          {loading ? (bg ? 'Зареждане...' : 'Loading...') : bg ? '— избери от библиотека —' : '— pick from library —'}
        </option>
        {points.map((p) => (
          <option key={p._id} value={p._id}>
            {p.code ? `${p.code} · ` : ''}
            {p.name} (Y={Number(p.y).toFixed(2)}, X={Number(p.x).toFixed(2)})
          </option>
        ))}
      </select>
    </label>
  );
};

export default PointPicker;
