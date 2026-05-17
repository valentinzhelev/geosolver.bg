import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [gradingId, setGradingId] = useState(null);
  const [score, setScore] = useState(100);
  const [feedback, setFeedback] = useState('');

  const load = () => {
    setLoading(true);
    classroomApi
      .getReviewQueue()
      .then((res) => {
        let data = res.data || [];
        if (filterAssignment) {
          data = data.filter((s) => s.assignment?._id === filterAssignment || s.assignment === filterAssignment);
        }
        setItems(data);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, [filterAssignment]);

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
                  <div className="text-sm text-neutral-500">{s.assignment?.title}</div>
                </div>
                <div className="text-sm font-['Manrope']">
                  {s.status} · {s.finalScore != null ? `${Math.round(s.finalScore)}%` : '—'}
                </div>
              </div>
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
