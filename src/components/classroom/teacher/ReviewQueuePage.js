import React, { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import SEO from '../../shared/SEO';
import ClassroomLayout from '../ClassroomLayout';
import { Card, EmptyState } from '../ui/Card';
import SubmissionReviewCard from '../ui/SubmissionReviewCard';
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
  const [scope, setScope] = useState('all');
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
    else if (scope !== 'all') params.scope = scope;
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
  }, [filterAssignment, courseFilter, lateOnly, manualOnly, scope, sortOrder]);

  useEffect(() => {
    load();
  }, [load]);

  const hasActiveFilters = Boolean(
    courseFilter || lateOnly || manualOnly || scope !== 'all' || sortOrder !== 'newest'
  );
  const activeFilterCount = [courseFilter, lateOnly, manualOnly, scope !== 'all', sortOrder !== 'newest'].filter(
    Boolean
  ).length;

  const clearFilters = () => {
    setCourseFilter('');
    setLateOnly(false);
    setManualOnly(false);
    setScope('all');
    setSortOrder('newest');
  };

  const filterChipClass = (active) =>
    `px-3 py-2 rounded-lg text-sm font-medium font-['Manrope'] transition-colors ${
      active
        ? 'bg-black text-white dark:bg-white dark:text-black shadow-sm'
        : 'text-neutral-600 dark:text-zinc-400 hover:bg-white dark:bg-zinc-900 dark:hover:bg-zinc-700 hover:text-black dark:hover:text-white'
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
        subtitle={
          bg
            ? 'Всички предавания с отговори — включително автоматично оценените.'
            : 'All submissions with answers — including auto-graded.'
        }
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
                  className="text-xs font-medium font-['Manrope'] text-neutral-500 dark:text-zinc-400 hover:text-black dark:hover:text-white underline-offset-2 hover:underline"
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
                    onClick={() => {
                      setManualOnly((v) => !v);
                      if (!manualOnly) setScope('all');
                    }}
                    className={filterChipClass(manualOnly)}
                    aria-pressed={manualOnly}
                  >
                    {bg ? 'Само за ръчна оценка' : 'Manual review only'}
                  </button>
                </div>
              </div>

              {!manualOnly && (
                <label className="flex flex-col gap-1.5 lg:max-w-[180px]">
                  <span className="text-sm font-medium text-black dark:text-white font-['Manrope']">
                    {bg ? 'Статус' : 'Status'}
                  </span>
                  <select
                    value={scope}
                    onChange={(e) => setScope(e.target.value)}
                    className="px-3 py-2.5 rounded-lg border border-gray-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-sm font-['Manrope']"
                  >
                    <option value="all">{bg ? 'Всички' : 'All'}</option>
                    <option value="pending">{bg ? 'Чакащи' : 'Pending'}</option>
                    <option value="graded">{bg ? 'Оценени' : 'Graded'}</option>
                  </select>
                </label>
              )}

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
        {loading && <Card className="p-8 text-center text-neutral-500 dark:text-zinc-400">{bg ? 'Зареждане...' : 'Loading...'}</Card>}
        {!loading && items.length === 0 && (
          <EmptyState
            title={bg ? 'Няма предавания' : 'No submissions'}
            description={
              bg
                ? 'Опитайте „Всички“ във филтъра Статус или проверете друга група.'
                : 'Try "All" in the Status filter or another group.'
            }
          />
        )}
        <div className="flex flex-col gap-4">
          {items.map((s) => (
            <SubmissionReviewCard
              key={s._id}
              submission={s}
              bg={bg}
              gradingId={gradingId}
              score={score}
              feedback={feedback}
              onScoreChange={setScore}
              onFeedbackChange={setFeedback}
              onGrade={handleGrade}
            />
          ))}
        </div>
      </ClassroomLayout>
    </>
  );
};

export default ReviewQueuePage;
