import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/auth/AuthContext';
import { useTranslation } from './useTranslation';
import { useCalculationTracking } from './useCalculationTracking';
import { hasUnlimitedCalculations } from '../utils/calculationAccess';
import { getEduWorkContext } from '../utils/eduCalculatorBridge';
import { allowsCalculatorAccess } from '../config/eduCalculatorPolicy';
import { useProjectContext } from '../context/ProjectContext';
import { applyAuthoritativeResult, classifySaveError, refreshRequiredMessage, validationMessage } from '../utils/authoritativeResult';

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

      let saved;
      try {
        saved = await trackCalculation(
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
        const failure = classifySaveError(err);
        if (failure.kind === 'auth') {
          navigate('/login');
          return null;
        }
        if (failure.kind === 'refresh_required') {
          // Zero silent divergence: this browser would display a result the backend is not going to store.
          alert(refreshRequiredMessage(language));
          return null;
        }
        if (failure.kind === 'limit') {
          alert(
            language === 'bg'
              ? 'Лимитът за изчисления е изчерпан.'
              : 'Calculation limit reached.'
          );
          return null;
        }
        if (failure.kind === 'validation') {
          alert(validationMessage(err, language));
          return null;
        }
        console.error('Failed to track calculation:', err);
        return null;
      }

      // The backend computed and stored the authoritative result: never display one coordinate while
      // another is persisted. Persisted fields come from the server; local intermediate fields stay.
      return applyAuthoritativeResult(runResult, saved);

    },
    [requireAuthAndLimits, trackCalculation, navigate, language, requestedProjectId, projectError]
  );

  return {
    runWithTracking,
    requireAuthAndLimits,
    isAuthenticated: !!user,
  };
}
