import React from 'react';
import { formatAnswerValue } from '../../../utils/eduSubmissionDisplay';

const levelStyles = {
  excellent: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800',
  good: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
  partial: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
  weak: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
  unknown: 'bg-stone-50 dark:bg-zinc-800 border-stone-200 dark:border-zinc-700',
};

const severityDot = {
  none: 'bg-emerald-500',
  low: 'bg-amber-400',
  medium: 'bg-orange-500',
  high: 'bg-red-500',
};

const GaiInsightPanel = ({ gaiInsights, bg, compact = false }) => {
  if (!gaiInsights?.summary) return null;

  const { summary, fieldInsights = [], recommendations = [] } = gaiInsights;
  const headline = bg ? summary.headline?.bg : summary.headline?.en;
  const boxClass = levelStyles[summary.level] || levelStyles.unknown;

  return (
    <div className={`rounded-xl border p-4 flex flex-col gap-3 ${boxClass}`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-black dark:bg-white text-white dark:text-black text-xs font-bold font-['Manrope']">
            GAI
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-zinc-400 font-['Manrope']">
              {bg ? 'GeoSolver AI анализ' : 'GeoSolver AI insight'}
            </p>
            {!compact && gaiInsights.toolName && (
              <p className="text-xs text-neutral-500 dark:text-zinc-400 font-['Manrope']">
                {bg ? gaiInsights.toolName.bg : gaiInsights.toolName.en}
              </p>
            )}
          </div>
        </div>
        {summary.score != null && (
          <span className="text-lg font-bold font-['Manrope'] text-black dark:text-white">
            {Math.round(summary.score)}%
          </span>
        )}
      </div>

      {headline && (
        <p className="text-sm font-medium font-['Manrope'] text-black dark:text-white">{headline}</p>
      )}

      {fieldInsights.length > 0 && (
        <ul className="flex flex-col gap-2">
          {fieldInsights.map((f) => (
            <li
              key={f.key}
              className="flex flex-col gap-1 text-sm font-['Manrope'] bg-white dark:bg-zinc-900/60 dark:bg-zinc-900/40 rounded-lg px-3 py-2"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${severityDot[f.severity] || severityDot.medium}`}
                />
                <span className="font-medium text-black dark:text-white">
                  {bg ? f.label?.bg : f.label?.en}
                </span>
                <span className="font-mono text-neutral-600 dark:text-zinc-300">
                  {formatAnswerValue(f.studentValue)}
                </span>
                {!f.isCorrect && f.correctValue != null && (
                  <span className="text-neutral-400 dark:text-zinc-400 text-xs">
                    → {formatAnswerValue(f.correctValue)}
                    {f.relativeErrorPct != null && ` (${f.relativeErrorPct.toFixed(1)}%)`}
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-600 dark:text-zinc-400 pl-4">
                {bg ? f.diagnosis?.bg : f.diagnosis?.en}
              </p>
            </li>
          ))}
        </ul>
      )}

      {recommendations.length > 0 && !compact && (
        <div className="border-t border-black/5 dark:border-white/10 pt-3">
          <p className="text-xs font-semibold uppercase text-neutral-500 dark:text-zinc-400 mb-2 font-['Manrope']">
            {bg ? 'Препоръки за преподавателя' : 'Teacher recommendations'}
          </p>
          <ul className="flex flex-col gap-1.5">
            {recommendations.map((r, i) => (
              <li key={i} className="text-sm text-neutral-700 dark:text-zinc-300 font-['Manrope'] flex gap-2">
                <span className="text-neutral-400 dark:text-zinc-400">•</span>
                {bg ? r.bg : r.en}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default GaiInsightPanel;
