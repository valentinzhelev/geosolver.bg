import React, { useEffect, useRef, useState } from 'react';
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
import GaiRadialWorkspace from '../ui/GaiRadialWorkspace';
import TaskDiagramSvg from '../ui/TaskDiagramSvg';
import CalculatorStepChecklist from './CalculatorStepChecklist';
import { buildStudentGaiCallouts } from '../../../utils/buildStudentGaiCallouts';
import { getEduGamification, recordEduSubmission, badgeLabel } from '../../../utils/eduGamification';

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
  const [gaiFeedback, setGaiFeedback] = useState(null);
  const [gaiContext, setGaiContext] = useState(null);
  const [gaiStudyHint, setGaiStudyHint] = useState(null);
  const [gamification, setGamification] = useState({ streak: 0, badges: [] });
  const startedAtRef = useRef(Date.now());

  useEffect(() => {
    studentClassroomApi
      .getAssignment(id)
      .then((res) => {
        setAssignment(res.data);
        setGaiFeedback(res.data.gaiFeedback || res.data.submission?.gaiFeedback || null);
        setGaiContext(res.data.gaiContext || null);
        setGaiStudyHint(res.data.gaiStudyHint || null);
        setGamification(getEduGamification(user?.id || user?._id));
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
  }, [id, user?.id, user?._id]);

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
  const filledCount = tool
    ? tool.answerKeys.filter((f) => answers[f.key] != null && String(answers[f.key]).trim() !== '').length
    : 0;
  const totalFields = tool?.answerKeys?.length || 0;

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

  const hasSubmitted = Boolean(assignment?.submission || result);
  const { left: leftCallouts, right: rightCallouts } = buildStudentGaiCallouts({
    bg,
    tool,
    gaiFeedback: gaiFeedback || assignment?.gaiFeedback,
    gaiContext: gaiContext || assignment?.gaiContext,
    gaiStudyHint: gaiStudyHint || assignment?.gaiStudyHint,
    canOpenCalculator,
    hasSubmitted,
    gamification,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const numericAnswers = {};
      Object.entries(answers).forEach(([k, v]) => {
        numericAnswers[k] = parseFloat(String(v).replace(',', '.'));
      });
      const minutesOnPage = Math.max(1, Math.round((Date.now() - startedAtRef.current) / 60000));
      const res = await studentClassroomApi.submitAssignment(id, {
        answers: numericAnswers,
        variantIndex: variant?.variantIndex ?? 0,
        timeSpent: minutesOnPage,
      });
      setResult(res.data);
      if (res.data?.gaiFeedback) setGaiFeedback(res.data.gaiFeedback);
      if (res.data?.gaiContext) setGaiContext(res.data.gaiContext);
      const uid = user?.id || user?._id;
      setGamification(recordEduSubmission(uid, { onTime: !res.data?.isLate }));
      clearAnswerDraft(id);
      setHasDraft(false);
      const refreshed = await studentClassroomApi.getAssignment(id);
      setAssignment(refreshed.data);
    } catch (err) {
      try {
        const refreshed = await studentClassroomApi.getAssignment(id);
        if (refreshed.data?.submission) {
          setAssignment(refreshed.data);
          setGaiFeedback(refreshed.data.gaiFeedback || refreshed.data.submission?.gaiFeedback);
          setResult(refreshed.data.submission);
          clearAnswerDraft(id);
          setHasDraft(false);
          return;
        }
      } catch {
        /* ignore recovery fetch */
      }
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
          <GaiRadialWorkspace leftCallouts={leftCallouts} rightCallouts={rightCallouts}>
            <Card className="p-5 md:p-6 flex flex-col gap-4 shadow-xl ring-1 ring-stone-200/80 dark:ring-zinc-700 rounded-2xl">
              <div className="flex items-start gap-3">
                {tool.icon && (
                  <img src={tool.icon} alt="" className="w-12 h-12 rounded-lg bg-stone-100 dark:bg-zinc-800 p-2" />
                )}
                <div>
                  <h2 className="font-bold font-['Manrope'] text-black dark:text-white">
                    {bg ? tool.titleBg : tool.titleEn}
                  </h2>
                  <p className="text-xs text-neutral-500 font-['Manrope'] mt-0.5">
                    {bg ? tool.descBg : tool.descEn}
                  </p>
                </div>
              </div>

              <TaskDiagramSvg toolKey={tool.toolKey} inputData={inputData} answers={answers} bg={bg} />

              <h3 className="text-sm font-semibold font-['Manrope'] text-neutral-500 uppercase tracking-wide">
                {bg ? 'Входни данни' : 'Given data'}
              </h3>
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

              {canOpenCalculator && tool.calculatorSteps && (
                <CalculatorStepChecklist assignmentId={id} steps={tool.calculatorSteps} bg={bg} />
              )}

              <div className="border-t border-stone-100 dark:border-zinc-800 pt-4 flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-bold font-['Manrope'] text-black dark:text-white">{bg ? 'Вашият отговор' : 'Your answer'}</h2>
                {totalFields > 0 && (
                  <span className="text-xs font-['Manrope'] text-neutral-500">
                    {filledCount}/{totalFields} {bg ? 'полета' : 'fields'}
                  </span>
                )}
              </div>
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
                        onChange={(e) => {
                          setAnswers({ ...answers, [f.key]: e.target.value });
                        }}
                        className="px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white"
                      />
                    </label>
                  ))}
                  <div className="flex flex-wrap gap-2">
                    {canOpenCalculator && (
                      <button
                        type="button"
                        onClick={handleOpenCalculator}
                        className="flex-1 min-w-[120px] px-4 py-2 rounded-lg bg-stone-100 dark:bg-zinc-800 text-sm font-medium font-['Manrope']"
                      >
                        {bg ? 'Калкулатор' : 'Calculator'}
                      </button>
                    )}
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex-1 min-w-[120px] px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg text-sm font-medium font-['Manrope'] disabled:opacity-50"
                    >
                      {submitting ? (bg ? 'Изпращане...' : 'Sending...') : bg ? 'Предай →' : 'Submit →'}
                    </button>
                  </div>
                </form>
              ) : (
                <p className="text-sm text-neutral-500 font-['Manrope']">
                  {bg ? 'Краен срокът е изтекъл.' : 'The deadline has passed.'}
                </p>
              )}
              </div>

              {gamification?.badges?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 justify-center">
                  {gamification.badges.map((b) => (
                    <span
                      key={b}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-900 font-['Manrope']"
                    >
                      {badgeLabel(b, bg)}
                    </span>
                  ))}
                </div>
              )}
              <p className="text-[10px] text-neutral-400 font-['Manrope'] text-center">{policyMeta.studentHint}</p>
            </Card>
          </GaiRadialWorkspace>
        )}
      </ClassroomLayout>
    </>
  );
};

export default StudentAssignmentDetailPage;
