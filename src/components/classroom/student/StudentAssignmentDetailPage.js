import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import SEO from '../../shared/SEO';
import ClassroomLayout from '../ClassroomLayout';
import { Card } from '../ui/Card';
import { studentClassroomApi } from '../../../services/classroomApi';
import { useTranslation } from '../../../hooks/useTranslation';
import { useAuth } from '../../auth/AuthContext';
import {
  EDU_TOOLS,
  toolKeyFromTemplate,
  variantIndexForStudent,
} from '../../../config/eduTools';

const StudentAssignmentDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { language } = useTranslation();
  const bg = language === 'bg';
  const [assignment, setAssignment] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  useEffect(() => {
    studentClassroomApi
      .getAssignment(id)
      .then((res) => {
        setAssignment(res.data);
        const key = toolKeyFromTemplate(res.data.taskTemplate);
        const tool = EDU_TOOLS.find((t) => t.toolKey === key);
        if (tool) {
          const initial = {};
          tool.answerKeys.forEach((f) => {
            initial[f.key] = '';
          });
          setAnswers(initial);
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const toolKey = assignment ? toolKeyFromTemplate(assignment.taskTemplate) : null;
  const tool = EDU_TOOLS.find((t) => t.toolKey === toolKey);
  const variantIndex = assignment
    ? variantIndexForStudent(user?.id || user?._id, assignment.variants?.length || 1)
    : 0;
  const variant = assignment?.variants?.find((v) => v.variantIndex === variantIndex) || assignment?.variants?.[0];
  const inputData = variant?.inputData?.input || variant?.inputData || {};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const numericAnswers = {};
      Object.entries(answers).forEach(([k, v]) => {
        numericAnswers[k] = parseFloat(String(v).replace(',', '.'));
      });
      const res = await studentClassroomApi.submitAssignment(id, {
        answers: numericAnswers,
        variantIndex: variant?.variantIndex ?? 0,
        timeSpent: 0,
      });
      setResult(res.data);
      const refreshed = await studentClassroomApi.getAssignment(id);
      setAssignment(refreshed.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <SEO title={assignment?.title || 'Assignment'} canonical={`/classroom/assignments/${id}`} />
      <ClassroomLayout title={assignment?.title || (bg ? 'Задание' : 'Assignment')} subtitle={assignment?.description}>
        <Link to="/classroom/assignments" className="text-sm text-neutral-500 font-['Manrope'] w-fit hover:text-black dark:hover:text-white">
          ← {bg ? 'Моите задания' : 'My assignments'}
        </Link>

        {loading && <Card className="p-8 text-center text-neutral-500">{bg ? 'Зареждане...' : 'Loading...'}</Card>}
        {error && <Card className="p-4 text-sm text-red-600">{error}</Card>}

        {assignment && tool && (
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="p-6 flex flex-col gap-4">
              <h2 className="font-bold font-['Manrope'] text-black dark:text-white">{bg ? 'Условие' : 'Problem'}</h2>
              {assignment.description && (
                <p className="text-sm text-neutral-600 dark:text-zinc-400 font-['Manrope'] whitespace-pre-wrap">
                  {assignment.description}
                </p>
              )}
              <div className="grid grid-cols-2 gap-2">
                {tool.inputDisplay.map((f) => (
                  <div key={f.key} className="px-3 py-2 bg-stone-50 dark:bg-zinc-800 rounded-lg text-sm font-['Manrope']">
                    <span className="text-neutral-500">{bg ? f.labelBg : f.labelEn}: </span>
                    <span className="font-mono text-black dark:text-white">{inputData[f.key] ?? '—'}</span>
                  </div>
                ))}
              </div>
              <Link
                to={tool.route}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-700 text-sm font-medium font-['Manrope'] text-black dark:text-white w-fit hover:bg-stone-50 dark:hover:bg-zinc-800"
              >
                {bg ? 'Отвори калкулатор ↗' : 'Open calculator ↗'}
              </Link>
              <p className="text-xs text-neutral-400 font-['Manrope']">
                {bg ? 'Краен срок' : 'Due'}: {new Date(assignment.dueDate).toLocaleString(bg ? 'bg-BG' : 'en-US')}
              </p>
            </Card>

            <Card className="p-6 flex flex-col gap-4">
              <h2 className="font-bold font-['Manrope'] text-black dark:text-white">{bg ? 'Предай отговор' : 'Submit answer'}</h2>
              {assignment.submission && (
                <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-sm font-['Manrope'] text-blue-900 dark:text-blue-200">
                  {bg ? 'Последно предаване' : 'Last submission'}: {assignment.submission.status}
                  {assignment.submission.score != null && ` · ${Math.round(assignment.submission.score)}%`}
                  {assignment.submission.feedback && (
                    <p className="mt-1 text-neutral-700 dark:text-zinc-300">{assignment.submission.feedback}</p>
                  )}
                </div>
              )}
              {result && (
                <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 text-sm text-green-800 dark:text-green-200">
                  {bg ? 'Предадено!' : 'Submitted!'} {result.score != null && `${Math.round(result.score)}%`}
                </div>
              )}
              {assignment.canSubmit ? (
                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                  {tool.answerKeys.map((f) => (
                    <label key={f.key} className="flex flex-col gap-1 text-sm font-['Manrope']">
                      {bg ? f.labelBg : f.labelEn}
                      <input
                        required
                        type="number"
                        step="any"
                        value={answers[f.key] ?? ''}
                        onChange={(e) => setAnswers({ ...answers, [f.key]: e.target.value })}
                        className="px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white"
                      />
                    </label>
                  ))}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg text-sm font-medium w-fit disabled:opacity-50"
                  >
                    {submitting ? (bg ? 'Изпращане...' : 'Submitting...') : bg ? 'Предай' : 'Submit'}
                  </button>
                </form>
              ) : (
                <p className="text-sm text-neutral-500 font-['Manrope']">
                  {bg ? 'Краен срокът е изтекъл.' : 'The deadline has passed.'}
                </p>
              )}
            </Card>
          </div>
        )}
      </ClassroomLayout>
    </>
  );
};

export default StudentAssignmentDetailPage;
