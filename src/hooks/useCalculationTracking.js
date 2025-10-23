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

      // Save to database only - no local storage fallback
      const result = await CalculationService.saveCalculation(calculationData);
      console.log('Calculation saved to database:', result);
      
      // Dispatch event to update UI
      window.dispatchEvent(new CustomEvent('calculationCompleted'));
      
      return result;
    } catch (err) {
      setError(err.message);
      console.error('Failed to save calculation to database:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const checkLimits = useCallback(async () => {
    console.log('Checking limits from database...');
    
    try {
      // Get limits from database only
      const result = await CalculationService.checkLimits();
      console.log('Database limits check:', result);
      return result;
    } catch (error) {
      console.error('Failed to check limits from database:', error);
      // If database fails, deny calculation to be safe
      return {
        canCalculate: false,
        used: 0,
        limit: 0,
        unlimited: false
      };
    }
  }, []);

  return {
    trackCalculation,
    checkLimits,
    isLoading,
    error
  };
};
