import React from 'react';
import { Card } from './Card';

const GaiAssignmentAnalytics = ({ analytics, bg, loading }) => {
  if (loading) {
    return (
      <Card className="p-6 text-sm text-neutral-500 font-['Manrope']">
        {bg ? 'GAI анализира класа...' : 'GAI is analyzing the class...'}
      </Card>
    );
  }

  if (!analytics || analytics.submissionCount === 0) return null;

  return (
    <Card className="p-6 flex flex-col gap-5 border-violet-200 dark:border-violet-900/50 bg-gradient-to-br from-violet-50/80 to-white dark:from-violet-950/30 dark:to-zinc-900">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-violet-600 text-white text-sm font-bold font-['Manrope']">
            GAI
          </span>
          <div>
            <h2 className="text-lg font-bold font-['Manrope'] text-black dark:text-white">
              {bg ? 'Анализ на класа' : 'Class analytics'}
            </h2>
            <p className="text-xs text-neutral-500 font-['Manrope']">
              {bg
                ? 'GeoSolver Artificial Intelligence · обобщение по предаванията'
                : 'GeoSolver Artificial Intelligence · submission summary'}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-4 text-sm font-['Manrope']">
          <div className="text-center">
            <div className="text-2xl font-bold text-black dark:text-white">{analytics.submissionCount}</div>
            <div className="text-xs text-neutral-500">{bg ? 'предавания' : 'submissions'}</div>
          </div>
          {analytics.avgScore != null && (
            <div className="text-center">
              <div className="text-2xl font-bold text-violet-700 dark:text-violet-300">{analytics.avgScore}%</div>
              <div className="text-xs text-neutral-500">{bg ? 'среден резултат' : 'average'}</div>
            </div>
          )}
          {analytics.passRatePct != null && (
            <div className="text-center">
              <div className="text-2xl font-bold text-black dark:text-white">{analytics.passRatePct}%</div>
              <div className="text-xs text-neutral-500">{bg ? 'над 50%' : 'pass rate'}</div>
            </div>
          )}
        </div>
      </div>

      {analytics.scoreDistribution?.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase text-neutral-500 mb-2 font-['Manrope']">
            {bg ? 'Разпределение на оценките' : 'Score distribution'}
          </p>
          <div className="flex flex-wrap gap-2">
            {analytics.scoreDistribution.map((b) => (
              <div
                key={b.range}
                className="flex-1 min-w-[72px] px-3 py-2 rounded-lg bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-center"
              >
                <div className="text-lg font-bold font-['Manrope']">{b.count}</div>
                <div className="text-xs text-neutral-500">{b.range}%</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {analytics.fieldErrorRates?.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase text-neutral-500 mb-2 font-['Manrope']">
            {bg ? 'Грешки по полета' : 'Errors by field'}
          </p>
          <div className="flex flex-col gap-2">
            {analytics.fieldErrorRates.map((f) => (
              <div key={f.key} className="flex items-center gap-3 text-sm font-['Manrope']">
                <span className="w-16 shrink-0 font-medium">{bg ? f.label?.bg : f.label?.en}</span>
                <div className="flex-1 h-2 rounded-full bg-stone-200 dark:bg-zinc-700 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-violet-500"
                    style={{ width: `${Math.min(100, f.errorRatePct)}%` }}
                  />
                </div>
                <span className="text-xs text-neutral-500 w-10 text-right">{f.errorRatePct}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {analytics.classInsights?.length > 0 && (
        <ul className="flex flex-col gap-2">
          {analytics.classInsights.map((ins, i) => (
            <li
              key={i}
              className="text-sm font-['Manrope'] px-3 py-2 rounded-lg bg-violet-100/60 dark:bg-violet-900/20 text-violet-900 dark:text-violet-200"
            >
              {bg ? ins.bg : ins.en}
            </li>
          ))}
        </ul>
      )}

      {analytics.studentSnapshots?.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase text-neutral-500 mb-2 font-['Manrope']">
            {bg ? 'Ученици (по резултат)' : 'Students (by score)'}
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-['Manrope']">
              <thead>
                <tr className="text-left text-xs text-neutral-500 border-b border-stone-200 dark:border-zinc-700">
                  <th className="pb-2 pr-4">{bg ? 'Ученик' : 'Student'}</th>
                  <th className="pb-2 pr-4">{bg ? 'Резултат' : 'Score'}</th>
                  <th className="pb-2">{bg ? 'GAI' : 'GAI'}</th>
                </tr>
              </thead>
              <tbody>
                {analytics.studentSnapshots.map((row) => (
                  <tr key={row.submissionId} className="border-b border-stone-100 dark:border-zinc-800">
                    <td className="py-2 pr-4">
                      {row.student?.name || row.student?.email || '—'}
                      {row.isLate && (
                        <span className="ml-1 text-xs text-amber-600">{bg ? 'късно' : 'late'}</span>
                      )}
                    </td>
                    <td className="py-2 pr-4 font-mono">
                      {row.score != null ? `${Math.round(row.score)}%` : '—'}
                    </td>
                    <td className="py-2 text-xs text-neutral-500 capitalize">{row.level}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Card>
  );
};

export default GaiAssignmentAnalytics;
