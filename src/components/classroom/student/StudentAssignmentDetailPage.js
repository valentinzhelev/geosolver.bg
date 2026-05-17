import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
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
import StudentStatusBadge from '../ui/StudentStatusBadge';
import {
  setEduWorkContext,
  loadEduAnswersForAssignment,
  clearEduAnswersForAssignment,
} from '../../../utils/eduCalculatorBridge';
import {
  saveAnswerDraft,
  loadAnswerDraft,
  clearAnswerDraft,
} from '../../../utils/eduAnswerDraft';
import {
  normalizeCalculatorPolicy,
  allowsCalculatorAccess,
  getCalculatorPolicyMeta,
} from '../../../config/eduCalculatorPolicy';

const StudentAssignmentDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language } = useTranslation();
  const bg = language === 'bg';
  const [assignment, setAssignment] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [hasDraft, setHasDraft] = useState(false);

  useEffect(() => {
    studentClassroomApi
      .getAssignment(id)
      .then((res) => {
        setAssignment(res.data);
        const key = toolKeyFromTemplate(res.data.taskTemplate);
        const tool = EDU_TOOLS.find((t) => t.toolKey === key);
        if (tool) {
          const fromCalculator = loadEduAnswersForAssignment(id);
          const draft = loadAnswerDraft(id);
          const saved = fromCalculator || draft?.answers;
          const initial = {};
          tool.answerKeys.forEach((f) => {
            initial[f.key] = saved?.[f.key] != null ? String(saved[f.key]) : '';
          });
          setAnswers(initial);
          if (fromCalculator) clearEduAnswersForAssignment(id);
          setHasDraft(Boolean(loadAnswerDraft(id)));
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!id || !assignment?.canSubmit) return undefined;
    const t = setTimeout(() => saveAnswerDraft(id, answers), 500);
    return () => clearTimeout(t);
  }, [id, answers, assignment?.canSubmit]);

  const toolKey = assignment ? toolKeyFromTemplate(assignment.taskTemplate) : null;
  const tool = EDU_TOOLS.find((t) => t.toolKey === toolKey);
  const variantIndex = assignment
    ? variantIndexForStudent(user?.id || user?._id, assignment.variants?.length || 1)
    : 0;
  const variant = assignment?.variants?.find((v) => v.variantIndex === variantIndex) || assignment?.variants?.[0];
  const rawInput = variant?.inputData;
  const inputData =
    rawInput && typeof rawInput === 'object' && rawInput.input && typeof rawInput.input === 'object'
      ? rawInput.input
      : rawInput && typeof rawInput === 'object'
        ? rawInput
        : {};

  const calculatorPolicy = normalizeCalculatorPolicy(assignment?.options?.calculatorPolicy);
  const policyMeta = getCalculatorPolicyMeta(calculatorPolicy, bg);
  const canOpenCalculator = allowsCalculatorAccess(calculatorPolicy);

  const handleOpenCalculator = () => {
    if (!canOpenCalculator || !tool) return;
    setEduWorkContext({
      assignmentId: id,
      assignmentTitle: assignment.title,
      toolKey,
      inputData: variant?.inputData,
      returnPath: `/classroom/assignments/${id}`,
      calculatorPolicy,
    });
    navigate(tool.route);
  };

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
      clearAnswerDraft(id);
      setHasDraft(false);
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

        {assignment && !tool && !loading && (
          <Card className="p-6 flex flex-col gap-3">
            <p className="text-sm text-amber-800 dark:text-amber-200 font-['Manrope']">
              {bg
                ? 'Заданието е заредено, но типът на задачата не се разпознава. Презаредете страницата; ако остане — кажете на преподавателя.'
                : 'The assignment loaded but the task type could not be resolved. Try refreshing or contact your teacher.'}
            </p>
            {assignment.description && (
              <p className="text-sm text-neutral-600 dark:text-zinc-400 whitespace-pre-wrap">{assignment.description}</p>
            )}
          </Card>
        )}

        {assignment && tool && (!assignment.variants || assignment.variants.length === 0) && (
          <Card className="p-6">
            <p className="text-sm text-neutral-600 dark:text-zinc-400 font-['Manrope']">
              {bg
                ? 'Условието все още не е публикувано (няма генерирани варианти). Изчакайте преподавателя да публикува заданието.'
                : 'Problem data is not ready yet. Wait until your teacher publishes the assignment.'}
            </p>
          </Card>
        )}

        {assignment && tool && assignment.variants?.length > 0 && (
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
              <p className="text-xs text-neutral-500 dark:text-zinc-400 font-['Manrope']">{policyMeta.studentHint}</p>
              {canOpenCalculator ? (
                <button
                  type="button"
                  onClick={handleOpenCalculator}
                  className="px-4 py-2 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-700 text-sm font-medium font-['Manrope'] text-black dark:text-white w-fit hover:bg-stone-50 dark:hover:bg-zinc-800"
                >
                  {bg ? 'Отвори в калкулатора' : 'Open in calculator'}
                </button>
              ) : (
                <p className="text-sm text-amber-800 dark:text-amber-200 font-['Manrope']">
                  {bg
                    ? 'За това задание преподавателят е изключил калкулатора. Въведете отговорите ръчно вдясно.'
                    : 'Your teacher disabled the calculator for this assignment. Enter answers manually on the right.'}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-2">
                <StudentStatusBadge status={assignment.studentStatus} language={language} />
                <p className="text-xs text-neutral-400 font-['Manrope']">
                  {bg ? 'Краен срок' : 'Due'}: {new Date(assignment.dueDate).toLocaleString(bg ? 'bg-BG' : 'en-US')}
                  {assignment.submissionCount != null && (
                    <>
                      {' '}
                      · {bg ? 'Опити' : 'Attempts'}: {assignment.submissionCount}/{assignment.maxAttempts}
                    </>
                  )}
                </p>
              </div>
            </Card>

            <Card className="p-6 flex flex-col gap-4">
              <h2 className="font-bold font-['Manrope'] text-black dark:text-white">{bg ? 'Предай отговор' : 'Submit answer'}</h2>
              {assignment.canSubmit && hasDraft && (
                <p className="text-xs text-neutral-500 font-['Manrope']">
                  {bg ? 'Има запазена чернова на отговорите.' : 'A saved answer draft is available.'}
                </p>
              )}
              {assignment.submission && (
                <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-sm font-['Manrope'] text-blue-900 dark:text-blue-200">
                  {bg ? 'Последно предаване' : 'Last submission'}:                   <StudentStatusBadge
                    status={
                      assignment.submission.status === 'graded'
                        ? assignment.submission.isLate
                          ? 'graded_late'
                          : 'graded'
                        : assignment.submission.status === 'needs_review'
                          ? 'awaiting_review'
                          : assignment.submission.isLate
                            ? 'submitted_late'
                            : 'submitted'
                    }
                    language={language}
                  />
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
