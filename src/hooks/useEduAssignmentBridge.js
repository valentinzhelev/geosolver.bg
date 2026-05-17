import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getEduWorkContext,
  clearEduWorkContext,
  mapInputToForm,
  mapResultToAnswers,
  saveEduAnswersForAssignment,
} from '../utils/eduCalculatorBridge';
import { allowsCalculatorAccess, allowsSaveToAssignment } from '../config/eduCalculatorPolicy';

/**
 * Prefill tool form from Edu assignment context; offer to send answers back.
 */
export function useEduAssignmentBridge(toolKey, setForm) {
  const navigate = useNavigate();
  const [eduCtx, setEduCtx] = useState(null);

  useEffect(() => {
    const ctx = getEduWorkContext();
    if (ctx && ctx.toolKey === toolKey) {
      if (!allowsCalculatorAccess(ctx.calculatorPolicy)) {
        clearEduWorkContext();
        setEduCtx(null);
        return;
      }
      setEduCtx(ctx);
      const mapped = mapInputToForm(toolKey, ctx.inputData);
      if (Object.keys(mapped).length) {
        setForm((prev) => ({ ...prev, ...mapped }));
      }
    }
  }, [toolKey, setForm]);

  const applyResultToAssignment = useCallback(
    (result) => {
      if (!eduCtx?.assignmentId) return;
      const answers = mapResultToAnswers(toolKey, result);
      saveEduAnswersForAssignment(eduCtx.assignmentId, answers);
      clearEduWorkContext();
      navigate(eduCtx.returnPath || `/classroom/assignments/${eduCtx.assignmentId}`);
    },
    [eduCtx, toolKey, navigate]
  );

  const dismissEduBanner = useCallback(() => {
    clearEduWorkContext();
    setEduCtx(null);
  }, []);

  const canSaveToAssignment = eduCtx ? allowsSaveToAssignment(eduCtx.calculatorPolicy) : false;

  return { eduCtx, applyResultToAssignment, dismissEduBanner, canSaveToAssignment };
}
