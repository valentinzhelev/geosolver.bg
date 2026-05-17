import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from './Card';
import {
  getToolForSubmission,
  getAnswerEntries,
  formatAnswerValue,
  getComparisonRows,
} from '../../../utils/eduSubmissionDisplay';
import GaiRadialWorkspace from './GaiRadialWorkspace';
import { buildTeacherGaiCallouts } from '../../../utils/buildStudentGaiCallouts';

const SubmissionReviewCard = ({
  submission: s,
  bg,
  gradingId,
  score,
  feedback,
  onScoreChange,
  onFeedbackChange,
  onGrade,
}) => {
  const tool = getToolForSubmission(s);
  const answerEntries = getAnswerEntries(s.answers, tool, bg);
  const comparisonRows = getComparisonRows(s);
  const assignmentId = s.assignment?._id || s.assignment;

  const fieldLabel = (key) => {
    const f = tool?.answerKeys?.find((x) => x.key === key);
    return f ? (bg ? f.labelBg : f.labelEn) : key;
  };

  const { left: leftCallouts, right: rightCallouts } = buildTeacherGaiCallouts({
    bg,
    gaiInsights: s.gaiInsights,
    llmNarrative: s.llmNarrative || s.gaiLlm?.teacher,
  });

  const core = (
    <Card className="p-5 flex flex-col gap-3 shadow-lg ring-1 ring-stone-200/80 dark:ring-zinc-700">
      <div className="flex flex-wrap justify-between gap-2">
        <div>
          <div className="font-bold font-['Manrope'] text-black dark:text-white">
            {s.student?.name || s.student?.email}
          </div>
          <div className="text-sm text-neutral-500">
            {s.assignment?.title}
            {s.assignment?.course?.name && ` · ${s.assignment.course.name}`}
          </div>
          {assignmentId && (
            <Link
              to={`/classroom/teaching/assignments/${assignmentId}`}
              className="text-xs text-neutral-500 hover:text-black dark:hover:text-white mt-1 inline-block font-['Manrope']"
            >
              {bg ? 'Към заданието →' : 'View assignment →'}
            </Link>
          )}
        </div>
        <div className="text-sm font-['Manrope'] text-right">
          <div>{s.status}</div>
          {s.isLate && (
            <span className="text-amber-600 dark:text-amber-400 text-xs">{bg ? 'късно' : 'late'}</span>
          )}
          {s.finalScore != null && (
            <div className="font-semibold">{Math.round(s.finalScore)}%</div>
          )}
          {s.submittedAt && (
            <div className="text-xs text-neutral-400">
              {new Date(s.submittedAt).toLocaleString(bg ? 'bg-BG' : 'en-US')}
            </div>
          )}
        </div>
      </div>

      {answerEntries.length > 0 && (
        <div className="px-3 py-3 rounded-lg bg-stone-50 dark:bg-zinc-800">
          <span className="text-xs text-neutral-500 font-['Manrope'] block mb-2">
            {bg ? 'Отговори на ученика' : 'Student answers'} · {bg ? 'вариант' : 'variant'}{' '}
            {(s.variantIndex ?? 0) + 1}
          </span>
          <div className="grid sm:grid-cols-2 gap-2">
            {answerEntries.map((row) => (
              <div key={row.key} className="text-sm font-['Manrope']">
                <span className="text-neutral-500">{row.label}: </span>
                <span className="font-mono text-black dark:text-white">{formatAnswerValue(row.value)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {comparisonRows.length > 0 && (
        <div className="px-3 py-3 rounded-lg border border-stone-200 dark:border-zinc-700">
          <span className="text-xs text-neutral-500 font-['Manrope'] block mb-2">
            {bg ? 'Сравнение с верния отговор' : 'Comparison with solution'}
          </span>
          <ul className="flex flex-col gap-1 text-sm font-['Manrope']">
            {comparisonRows.map((row) => (
              <li key={row.field} className="flex flex-wrap gap-2 items-center">
                <span className="font-medium">{fieldLabel(row.field)}</span>
                <span className="font-mono">{formatAnswerValue(row.studentValue)}</span>
                <span className="text-neutral-400">→ {formatAnswerValue(row.correctValue)}</span>
                <span
                  className={
                    row.isCorrect
                      ? 'text-green-600 dark:text-green-400 text-xs'
                      : 'text-red-600 dark:text-red-400 text-xs'
                  }
                >
                  {row.isCorrect ? (bg ? 'верно' : 'correct') : (bg ? 'грешка' : 'wrong')}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {s.feedback && (
        <p className="text-sm text-neutral-600 dark:text-zinc-400 font-['Manrope']">
          <span className="font-medium">{bg ? 'Коментар' : 'Feedback'}: </span>
          {s.feedback}
        </p>
      )}

      {s.status === 'needs_review' && onGrade && (
        <div className="flex flex-wrap gap-2 items-end border-t border-stone-100 dark:border-zinc-800 pt-3">
          <label className="text-sm">
            {bg ? 'Точки' : 'Score'}
            <input
              type="number"
              min={0}
              max={100}
              value={score}
              onChange={(e) => onScoreChange(e.target.value)}
              className="block mt-1 px-2 py-1 rounded border border-gray-200 dark:border-zinc-700 w-20"
            />
          </label>
          <label className="text-sm flex-1 min-w-[200px]">
            {bg ? 'Коментар' : 'Feedback'}
            <input
              value={feedback}
              onChange={(e) => onFeedbackChange(e.target.value)}
              className="block mt-1 px-2 py-1 rounded border border-gray-200 dark:border-zinc-700 w-full"
            />
          </label>
          <button
            type="button"
            disabled={gradingId === s._id}
            onClick={() => onGrade(s)}
            className="px-3 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg text-sm"
          >
            {bg ? 'Оцени' : 'Grade'}
          </button>
        </div>
      )}
    </Card>
  );

  if (leftCallouts.length === 0 && rightCallouts.length === 0) {
    return core;
  }

  return (
    <GaiRadialWorkspace leftCallouts={leftCallouts} rightCallouts={rightCallouts}>
      {core}
    </GaiRadialWorkspace>
  );
};

export default SubmissionReviewCard;
