import { useState, useCallback } from 'react';
import CalculationService from '../services/calculationService';

export const useCalculationTracking = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const trackCalculation = useCallback(async (toolName, toolDisplayName, inputData, resultData, calculationTime = 0) => {
    setIsLoading(true);
    setError(null);

    try {
      const calculationData = {
        toolName,
        toolDisplayName,
        inputData,
        resultData,
        calculationTime
      };

      // Always save to backend
      const result = await CalculationService.saveCalculation(calculationData);
      console.log('Calculation saved to backend:', result);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const checkLimits = useCallback(async () => {
    console.log('Checking limits...');
    
    try {
      // Get limits from backend
      const result = await CalculationService.checkLimits();
      console.log('Backend limits check:', result);
      return result;
    } catch (backendError) {
      console.log('Backend limits check failed:', backendError.message);
      throw backendError;
    }
  }, []);

  const clearLocalHistory = useCallback(() => {
    localStorage.removeItem('calculationHistory');
  }, []);

  return {
    trackCalculation,
    checkLimits,
    clearLocalHistory,
    isLoading,
    error
  };
};
