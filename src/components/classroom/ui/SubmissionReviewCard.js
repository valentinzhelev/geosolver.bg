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

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M5 13l4 4L19 7" />
  </svg>
);

const CrossIcon = () => (
  <svg viewBox="0 0 24 24" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

const StatusPill = ({ correct, bg }) =>
  correct ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-black text-white dark:bg-white dark:text-black text-[11px] font-bold uppercase tracking-wide">
      <CheckIcon />
      {bg ? 'Вярно' : 'Correct'}
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 dark:bg-zinc-800 dark:text-zinc-300 ring-1 ring-stone-300 dark:ring-zinc-600 text-[11px] font-bold uppercase tracking-wide">
      <CrossIcon />
      {bg ? 'Грешка' : 'Wrong'}
    </span>
  );

const StudentAvatar = ({ student }) => {
  const name = student?.name || student?.email || '?';
  const photo = student?.avatar || student?.photo || student?.picture || student?.image;
  const initials = name
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  if (photo) {
    return (
      <img
        src={photo}
        alt={name}
        className="w-11 h-11 rounded-full object-cover ring-1 ring-stone-200 dark:ring-zinc-700 shrink-0"
      />
    );
  }
  return (
    <span className="w-11 h-11 rounded-full shrink-0 bg-stone-100 dark:bg-zinc-800 text-black dark:text-white flex items-center justify-center text-sm font-bold font-['Manrope'] ring-1 ring-stone-200 dark:ring-zinc-700">
      {initials}
    </span>
  );
};

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

  const correctCount = comparisonRows.filter((r) => r.isCorrect).length;

  const core = (
    <Card className="p-5 flex flex-col gap-4 shadow-lg ring-1 ring-stone-200/80 dark:ring-zinc-700">
      {/* Header */}
      <div className="flex items-start gap-3">
        <StudentAvatar student={s.student} />
        <div className="min-w-0 flex-1">
          <div className="font-bold font-['Manrope'] text-black dark:text-white truncate">
            {s.student?.name || s.student?.email}
          </div>
          <div className="text-sm text-neutral-500 dark:text-zinc-400 truncate">
            {s.assignment?.title}
            {s.assignment?.course?.name && ` · ${s.assignment.course.name}`}
          </div>
          {assignmentId && (
            <Link
              to={`/classroom/teaching/assignments/${assignmentId}`}
              className="text-xs text-neutral-500 dark:text-zinc-400 hover:text-black dark:hover:text-white mt-1 inline-block font-['Manrope']"
            >
              {bg ? 'Към заданието →' : 'View assignment →'}
            </Link>
          )}
        </div>
        <div className="text-right shrink-0 flex flex-col items-end gap-1">
          {s.finalScore != null && (
            <div className="text-xl font-bold font-['Manrope'] text-black dark:text-white leading-none">
              {Math.round(s.finalScore)}%
            </div>
          )}
          <span className="text-[11px] uppercase tracking-wide font-semibold px-2 py-0.5 rounded-full bg-stone-100 dark:bg-zinc-800 text-neutral-600 dark:text-zinc-300 font-['Manrope']">
            {s.status}
          </span>
          {s.isLate && (
            <span className="text-[11px] text-neutral-500 dark:text-zinc-400 font-['Manrope']">
              {bg ? 'късно' : 'late'}
            </span>
          )}
          {s.submittedAt && (
            <span className="text-[11px] text-neutral-400 dark:text-zinc-500 font-['Manrope']">
              {new Date(s.submittedAt).toLocaleDateString(bg ? 'bg-BG' : 'en-US')}
            </span>
          )}
        </div>
      </div>

      {/* Comparison — structured grid */}
      {comparisonRows.length > 0 ? (
        <div className="rounded-xl border border-stone-200 dark:border-zinc-700 overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 bg-stone-50 dark:bg-zinc-800/60">
            <span className="text-xs text-neutral-500 dark:text-zinc-400 font-['Manrope']">
              {bg ? 'Сравнение с верния отговор' : 'Comparison with solution'} · {bg ? 'вариант' : 'variant'}{' '}
              {(s.variantIndex ?? 0) + 1}
            </span>
            <span className="text-xs font-semibold text-neutral-600 dark:text-zinc-300 font-['Manrope'] tabular-nums">
              {correctCount}/{comparisonRows.length}
            </span>
          </div>
          <div className="divide-y divide-stone-100 dark:divide-zinc-800">
            {comparisonRows.map((row) => (
              <div
                key={row.field}
                className="grid grid-cols-[minmax(56px,auto)_1fr_auto] gap-3 items-center px-3 py-2.5"
              >
                <span className="text-sm font-semibold text-black dark:text-white font-['Manrope']">
                  {fieldLabel(row.field)}
                </span>
                <span className="flex items-center gap-1.5 text-sm font-mono min-w-0">
                  <span className="text-black dark:text-white truncate">{formatAnswerValue(row.studentValue)}</span>
                  <span className="text-neutral-300 dark:text-zinc-600">→</span>
                  <span className="text-neutral-500 dark:text-zinc-400 truncate">{formatAnswerValue(row.correctValue)}</span>
                </span>
                <StatusPill correct={row.isCorrect} bg={bg} />
              </div>
            ))}
          </div>
        </div>
      ) : (
        answerEntries.length > 0 && (
          <div className="rounded-xl border border-stone-200 dark:border-zinc-700 overflow-hidden">
            <div className="px-3 py-2 bg-stone-50 dark:bg-zinc-800/60 text-xs text-neutral-500 dark:text-zinc-400 font-['Manrope']">
              {bg ? 'Отговори на ученика' : 'Student answers'} · {bg ? 'вариант' : 'variant'}{' '}
              {(s.variantIndex ?? 0) + 1}
            </div>
            <div className="divide-y divide-stone-100 dark:divide-zinc-800">
              {answerEntries.map((row) => (
                <div key={row.key} className="flex items-center justify-between gap-3 px-3 py-2.5">
                  <span className="text-sm font-semibold text-black dark:text-white font-['Manrope']">{row.label}</span>
                  <span className="font-mono text-sm text-black dark:text-white">{formatAnswerValue(row.value)}</span>
                </div>
              ))}
            </div>
          </div>
        )
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
