import React from 'react';
import { Link } from 'react-router-dom';
import { useSharedSurveyPoints } from '../../context/SurveyPointsContext';
import { useProjectContext } from '../../context/ProjectContext';
import { getEduWorkContext } from '../../utils/eduCalculatorBridge';
import { resolveEffectiveProjectId } from '../../utils/projectScoping';

/**
 * Dropdown to fill coordinate fields from the points library.
 * @param {function} onSelect - (point) => void
 *
 * Project scoping precedence (Milestone 1 §9): an explicit classroom
 * assignment's linkedProjectId always wins over the general "current
 * project" context — an assignment is a narrower, teacher-defined scope
 * that must not be silently widened by whatever project a student's URL
 * happens to carry. An explicit `projectId` prop (if a caller ever passes
 * one) is honored next, then the general ProjectContext (set via
 * ?projectId= on the calculator route), then no scoping at all. This
 * preserves today's edu behavior exactly — no current caller passes an
 * explicit projectId prop, so this ordering changes nothing observable
 * until ProjectContext starts being populated.
 */
const PointPicker = ({ language = 'bg', label, onSelect, className = '', projectId } = {}) => {
  const bg = language === 'bg';
  const eduProjectId = getEduWorkContext()?.linkedProjectId;
  const { currentProject } = useProjectContext();
  const effectiveProjectId = resolveEffectiveProjectId({
    eduProjectId,
    projectId,
    currentProjectId: currentProject?._id,
  });
  const { points, loading, loaded, error, hasPoints, reload } = useSharedSurveyPoints(
    effectiveProjectId ? { projectId: effectiveProjectId } : {}
  );
  const busy = loading || loaded === false;
  const addPointsTo = effectiveProjectId ? `/points?projectId=${effectiveProjectId}` : '/points';
  const boxClass = `flex flex-col gap-1 ${className}`;
  const labelNode = label && (
    <span className="text-[11px] font-medium font-['Manrope'] text-neutral-500 dark:text-zinc-400">{label}</span>
  );

  // LOADING: a clear, disabled picker (never a vanished control)
  if (busy && !hasPoints) {
    return (
      <label className={boxClass}>
        {labelNode}
        <select disabled aria-busy="true" className="w-full px-2.5 py-1.5 rounded-lg border border-gray-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-xs font-medium font-['Manrope'] text-neutral-400 opacity-60">
          <option>{bg ? 'Зареждане на точки...' : 'Loading points...'}</option>
        </select>
      </label>
    );
  }

  // ERROR: say so and allow a retry
  if (error && !hasPoints) {
    return (
      <div className={boxClass}>
        {labelNode}
        <div role="alert" className="flex flex-wrap items-center gap-2 px-2.5 py-1.5 rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20 text-xs font-['Manrope'] text-red-700">
          <span>{bg ? 'Точките не могат да бъдат заредени.' : 'Points could not be loaded.'}</span>
          <button type="button" onClick={() => reload?.()} className="underline font-semibold">
            {bg ? 'Опитай отново' : 'Retry'}
          </button>
        </div>
      </div>
    );
  }

  // EMPTY: a visible state with a clear action (not a tiny link)
  if (!hasPoints) {
    return (
      <div className={boxClass}>
        {labelNode}
        <div className="flex flex-wrap items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg border border-dashed border-gray-300 dark:border-zinc-600 bg-stone-50 dark:bg-zinc-800 text-xs font-['Manrope'] text-neutral-600 dark:text-zinc-300">
          <span>{effectiveProjectId ? (bg ? 'В този проект няма точки.' : 'This project has no points.') : bg ? 'В библиотеката няма точки.' : 'The library has no points.'}</span>
          <Link to={addPointsTo} className="px-2 py-1 rounded bg-black dark:bg-white text-white dark:text-black font-semibold">
            {bg ? 'Добави точки' : 'Add points'}
          </Link>
        </div>
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
        disabled={false}
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
