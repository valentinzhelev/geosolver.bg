import React from 'react';

const statusStyles = {
  correct: 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/20',
  close: 'text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20',
  incorrect: 'text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20',
};

const StudentGaiFeedback = ({ feedback, bg }) => {
  if (!feedback) return null;

  const headline = bg ? feedback.headline?.bg : feedback.headline?.en;

  return (
    <div className="rounded-xl border border-violet-200 dark:border-violet-800 bg-gradient-to-br from-violet-50 to-white dark:from-violet-950/40 dark:to-zinc-900 p-4 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className="w-8 h-8 rounded-lg bg-violet-600 text-white text-xs font-bold flex items-center justify-center font-['Manrope']">
          GAI
        </span>
        <span className="text-xs font-semibold uppercase text-violet-600 dark:text-violet-400 font-['Manrope']">
          {bg ? 'Обратна връзка от GeoSolver AI' : 'GeoSolver AI feedback'}
        </span>
        {feedback.score != null && (
          <span className="ml-auto text-lg font-bold font-['Manrope']">{Math.round(feedback.score)}%</span>
        )}
      </div>
      {headline && <p className="text-sm font-medium font-['Manrope'] text-black dark:text-white">{headline}</p>}
      {feedback.fields?.length > 0 && (
        <ul className="flex flex-col gap-2">
          {feedback.fields.map((f) => (
            <li
              key={f.key}
              className={`text-sm font-['Manrope'] px-3 py-2 rounded-lg ${statusStyles[f.status] || statusStyles.incorrect}`}
            >
              <span className="font-medium">{bg ? f.label?.bg : f.label?.en}: </span>
              {bg ? f.message?.bg : f.message?.en}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default StudentGaiFeedback;
