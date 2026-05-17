import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/auth/AuthContext';
import { useTranslation } from './useTranslation';
import { useCalculationTracking } from './useCalculationTracking';

/**
 * Auth gate + shared free-plan limit (5 total across all tools) + backend tracking.
 */
export function useGuardedCalculation() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { language } = useTranslation();
  const { trackCalculation, checkLimits } = useCalculationTracking();

  const requireAuthAndLimits = useCallback(async () => {
    if (!user) {
      navigate('/login');
      return null;
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
  }, [user, navigate, checkLimits, language]);

  const runWithTracking = useCallback(
    async ({ toolName, toolDisplayName, inputData, resultData, getResultData, run }) => {
      const limits = await requireAuthAndLimits();
      if (!limits) return null;

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
          calculationTime
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
    [requireAuthAndLimits, trackCalculation, navigate, language]
  );

  return {
    runWithTracking,
    requireAuthAndLimits,
    isAuthenticated: !!user,
  };
}
