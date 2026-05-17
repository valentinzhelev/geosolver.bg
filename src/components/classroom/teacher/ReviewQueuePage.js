import React, { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import SEO from '../../shared/SEO';
import ClassroomLayout from '../ClassroomLayout';
import { Card, EmptyState } from '../ui/Card';
import { classroomApi } from '../../../services/classroomApi';
import { useTranslation } from '../../../hooks/useTranslation';

const ReviewQueuePage = () => {
  const { language } = useTranslation();
  const bg = language === 'bg';
  const [searchParams] = useSearchParams();
  const filterAssignment = searchParams.get('assignment');
  const [items, setItems] = useState([]);
  const [courses, setCourses] = useState([]);
  const [courseFilter, setCourseFilter] = useState('');
  const [lateOnly, setLateOnly] = useState(false);
  const [manualOnly, setManualOnly] = useState(false);
  const [sortOrder, setSortOrder] = useState('newest');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [gradingId, setGradingId] = useState(null);
  const [score, setScore] = useState(100);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    classroomApi.listCourses().then((res) => setCourses(res.data || [])).catch(() => {});
  }, []);

  const load = useCallback(() => {
    setLoading(true);
    const params = {};
    if (courseFilter) params.course = courseFilter;
    if (lateOnly) params.late = 'true';
    if (manualOnly) params.manualOnly = 'true';
    if (sortOrder === 'oldest') params.sort = 'oldest';

    classroomApi
      .getReviewQueue(params)
      .then((res) => {
        let data = res.data || [];
        if (filterAssignment) {
          data = data.filter(
            (s) => s.assignment?._id === filterAssignment || s.assignment === filterAssignment
          );
        }
        setItems(data);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [filterAssignment, courseFilter, lateOnly, manualOnly, sortOrder]);

  const formatAnswers = (submission) => {
    const answers = submission?.answers;
    if (!answers || typeof answers !== 'object') return null;
    return Object.entries(answers)
      .map(([key, val]) => `${key}: ${typeof val === 'number' ? Number(val).toFixed(3) : val}`)
      .join(' · ');
  };

  useEffect(() => {
    load();
  }, [load]);

  const hasActiveFilters = Boolean(courseFilter || lateOnly || manualOnly || sortOrder !== 'newest');
  const activeFilterCount = [courseFilter, lateOnly, manualOnly, sortOrder !== 'newest'].filter(Boolean)
    .length;

  const clearFilters = () => {
    setCourseFilter('');
    setLateOnly(false);
    setManualOnly(false);
    setSortOrder('newest');
  };

  const filterChipClass = (active) =>
    `px-3 py-2 rounded-lg text-sm font-medium font-['Manrope'] transition-colors ${
      active
        ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm'
        : 'text-neutral-600 dark:text-zinc-400 hover:bg-white dark:hover:bg-zinc-700 hover:text-black dark:hover:text-white'
    }`;

  const handleGrade = async (submission) => {
    const assignmentId = submission.assignment?._id || submission.assignment;
    setGradingId(submission._id);
    try {
      await classroomApi.gradeSubmission(assignmentId, submission._id, {
        score: Number(score),
        feedback,
      });
      setFeedback('');
      load();
    } catch (e) {
      setError(e.message);
    } finally {
      setGradingId(null);
    }
  };

  return (
    <>
      <SEO title={bg ? 'Преглед' : 'Review'} canonical="/classroom/review" />
      <ClassroomLayout
        title={bg ? 'Опашка за преглед' : 'Review queue'}
        subtitle={bg ? 'Предавания за потвърждение или ръчна оценка.' : 'Submissions awaiting confirmation or manual grade.'}
      >
        <Card className="p-4 md:p-5 mb-2">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400 dark:text-zinc-500 font-['Manrope']">
                {bg ? 'Филтри' : 'Filters'}
                {hasActiveFilters && (
                  <span className="ml-2 normal-case font-medium text-neutral-600 dark:text-zinc-300">
                    · {activeFilterCount} {bg ? 'активни' : 'active'}
                  </span>
                )}
              </p>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-xs font-medium font-['Manrope'] text-neutral-500 hover:text-black dark:hover:text-white underline-offset-2 hover:underline"
                >
                  {bg ? 'Изчисти всички' : 'Clear all'}
                </button>
              )}
            </div>

            <div className="flex flex-col lg:flex-row lg:items-end gap-4 lg:gap-6">
              <label className="flex flex-col gap-1.5 flex-1 min-w-0 lg:max-w-sm">
                <span className="text-sm font-medium text-black dark:text-white font-['Manrope']">
                  {bg ? 'Група' : 'Group'}
                </span>
                <select
                  value={courseFilter}
                  onChange={(e) => setCourseFilter(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-sm font-['Manrope'] text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/20"
                >
                  <option value="">{bg ? 'Всички групи' : 'All groups'}</option>
                  {courses.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </label>

              <div className="flex flex-col gap-1.5 flex-1 min-w-0">
                <span className="text-sm font-medium text-black dark:text-white font-['Manrope']">
                  {bg ? 'Покажи' : 'Show'}
                </span>
                <div
                  className="inline-flex flex-wrap gap-1 p-1 rounded-xl bg-stone-100 dark:bg-zinc-800/80 outline outline-1 outline-offset-[-1px] outline-stone-200/80 dark:outline-zinc-700 w-fit max-w-full"
                  role="group"
                  aria-label={bg ? 'Филтри за предавания' : 'Submission filters'}
                >
                  <button
                    type="button"
                    onClick={() => setLateOnly((v) => !v)}
                    className={filterChipClass(lateOnly)}
                    aria-pressed={lateOnly}
                  >
                    {bg ? 'Само късни' : 'Late only'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setManualOnly((v) => !v)}
                    className={filterChipClass(manualOnly)}
                    aria-pressed={manualOnly}
                  >
                    {bg ? 'Само за ръчна оценка' : 'Manual review only'}
                  </button>
                </div>
              </div>

              <label className="flex flex-col gap-1.5 lg:max-w-[160px]">
                <span className="text-sm font-medium text-black dark:text-white font-['Manrope']">
                  {bg ? 'Подредба' : 'Sort'}
                </span>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="px-3 py-2.5 rounded-lg border border-gray-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-sm font-['Manrope']"
                >
                  <option value="newest">{bg ? 'Най-нови' : 'Newest first'}</option>
                  <option value="oldest">{bg ? 'Най-стари' : 'Oldest first'}</option>
                </select>
              </label>

              {!loading && (
                <p className="text-sm text-neutral-500 dark:text-zinc-400 font-['Manrope'] lg:ml-auto lg:pb-2.5 whitespace-nowrap">
                  {items.length}{' '}
                  {bg
                    ? items.length === 1
                      ? 'предаване'
                      : 'предавания'
                    : items.length === 1
                      ? 'submission'
                      : 'submissions'}
                </p>
              )}
            </div>
          </div>
        </Card>

        {error && <Card className="p-4 text-sm text-red-600">{error}</Card>}
        {loading && <Card className="p-8 text-center text-neutral-500">{bg ? 'Зареждане...' : 'Loading...'}</Card>}
        {!loading && items.length === 0 && (
          <EmptyState title={bg ? 'Няма чакащи предавания' : 'Queue is empty'} />
        )}
        <div className="flex flex-col gap-4">
          {items.map((s) => (
            <Card key={s._id} className="p-5 flex flex-col gap-3">
              <div className="flex flex-wrap justify-between gap-2">
                <div>
                  <div className="font-bold font-['Manrope'] text-black dark:text-white">
                    {s.student?.name || s.student?.email}
                  </div>
                  <div className="text-sm text-neutral-500">
                    {s.assignment?.title}
                    {s.assignment?.course?.name && ` · ${s.assignment.course.name}`}
                  </div>
                  {(s.assignment?._id || s.assignment) && (
                    <Link
                      to={`/classroom/teaching/assignments/${s.assignment?._id || s.assignment}`}
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
              {formatAnswers(s) && (
                <div className="px-3 py-2 rounded-lg bg-stone-50 dark:bg-zinc-800 text-sm font-mono">
                  <span className="text-xs text-neutral-500 font-sans block mb-1">
                    {bg ? 'Отговори' : 'Answers'} (v{(s.variantIndex ?? 0) + 1})
                  </span>
                  {formatAnswers(s)}
                </div>
              )}
              {s.status === 'needs_review' && (
                <div className="flex flex-wrap gap-2 items-end border-t border-stone-100 dark:border-zinc-800 pt-3">
                  <label className="text-sm">
                    {bg ? 'Точки' : 'Score'}
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={score}
                      onChange={(e) => setScore(e.target.value)}
                      className="block mt-1 px-2 py-1 rounded border border-gray-200 dark:border-zinc-700 w-20"
                    />
                  </label>
                  <label className="text-sm flex-1 min-w-[200px]">
                    {bg ? 'Коментар' : 'Feedback'}
                    <input
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      className="block mt-1 px-2 py-1 rounded border border-gray-200 dark:border-zinc-700 w-full"
                    />
                  </label>
                  <button
                    type="button"
                    disabled={gradingId === s._id}
                    onClick={() => handleGrade(s)}
                    className="px-3 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg text-sm"
                  >
                    {bg ? 'Оцени' : 'Grade'}
                  </button>
                </div>
              )}
            </Card>
          ))}
        </div>
      </ClassroomLayout>
    </>
  );
};

export default ReviewQueuePage;
