import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/auth/AuthContext';
import { useTranslation } from './useTranslation';
import { useCalculationTracking } from './useCalculationTracking';
import { hasUnlimitedCalculations } from '../utils/calculationAccess';
import { getEduWorkContext } from '../utils/eduCalculatorBridge';
import { allowsCalculatorAccess } from '../config/eduCalculatorPolicy';
import { useProjectContext } from '../context/ProjectContext';

/**
 * Auth gate + shared free-plan limit (5 total across all tools) + backend tracking.
 */
export function useGuardedCalculation() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { language } = useTranslation();
  const { trackCalculation, checkLimits } = useCalculationTracking();
  // Milestone 1 follow-up §4: key off `requestedProjectId` (the raw
  // ?projectId= value), NOT `currentProject`. An explicitly-requested
  // project association must never be silently dropped just because the
  // frontend's convenience lookup hasn't resolved it yet or failed — the
  // backend is the actual authorization boundary and will correctly reject
  // an invalid/inaccessible id (fail closed), rather than this hook quietly
  // saving the calculation as standalone instead.
  const { requestedProjectId, error: projectError } = useProjectContext();

  const getActiveEduContext = useCallback(() => {
    const ctx = getEduWorkContext();
    if (ctx?.assignmentId && allowsCalculatorAccess(ctx.calculatorPolicy)) {
      return { assignmentId: ctx.assignmentId };
    }
    return null;
  }, []);

  const requireAuthAndLimits = useCallback(async () => {
    if (!user) {
      navigate('/login');
      return null;
    }

    if (hasUnlimitedCalculations(user)) {
      return { canCalculate: true, unlimited: true, used: 0, limit: -1 };
    }

    const eduContext = getActiveEduContext();
    if (eduContext) {
      return { canCalculate: true, unlimited: false, used: 0, limit: -1, eduContext };
    }

    const limits = await checkLimits();
    if (!limits.canCalculate) {
      const max = limits.limit > 0 ? limits.limit : 5;
      const used = limits.used ?? 0;
      alert(
        language === 'bg'
          ? `Достигнахте лимита от ${max} изчисления (${used}/${max}) за безплатния план. Изберете професионален план за неограничен достъп.`
          : `You have reached the free plan limit of ${max} calculations (${used}/${max}). Choose a professional plan for unlimited access.`
      );
      return null;
    }

    return limits;
  }, [user, navigate, checkLimits, language, getActiveEduContext]);

  const runWithTracking = useCallback(
    async ({ toolName, toolDisplayName, inputData, resultData, getResultData, run, pointReferences }) => {
      const limits = await requireAuthAndLimits();
      if (!limits) return null;

      // A project was explicitly requested (via ?projectId=) but could not
      // be confirmed (not found, no access, lookup failed, not logged in)
      // — refuse to save rather than silently falling back to standalone.
      if (requestedProjectId && projectError) {
        alert(
          language === 'bg'
            ? 'Проектът не може да бъде зареден — изчислението не е запазено, за да не бъде свързано погрешно.'
            : 'The project could not be loaded — the calculation was not saved, to avoid attaching it to the wrong place.'
        );
        return null;
      }

      const start = performance.now();
      const runResult = await run();
      const calculationTime = performance.now() - start;
      const savedResult =
        typeof getResultData === 'function' ? getResultData(runResult) : resultData;

      try {
        await trackCalculation(
          toolName,
          toolDisplayName,
          inputData,
          savedResult,
          calculationTime,
          limits.eduContext,
          requestedProjectId || null,
          pointReferences || []
        );
      } catch (err) {
        const message = err?.message || '';
        if (message.includes('Authentication required') || message.includes('401')) {
          navigate('/login');
          return null;
        }
        if (message.includes('limit') || message.includes('403')) {
          alert(
            language === 'bg'
              ? 'Лимитът за изчисления е изчерпан.'
              : 'Calculation limit reached.'
          );
          return null;
        }
        console.error('Failed to track calculation:', err);
        return null;
      }

      return runResult;
    },
    [requireAuthAndLimits, trackCalculation, navigate, language, requestedProjectId, projectError]
  );

  return {
    runWithTracking,
    requireAuthAndLimits,
    isAuthenticated: !!user,
  };
}
