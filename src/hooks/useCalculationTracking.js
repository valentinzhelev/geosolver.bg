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

      // Try to save to backend first
      try {
        const result = await CalculationService.saveCalculation(calculationData);
        console.log('Calculation saved to backend:', result);
        return result;
      } catch (backendError) {
        console.log('Backend save failed, saving locally:', backendError.message);
        
        // Fallback to local storage
        const localHistory = JSON.parse(localStorage.getItem('calculationHistory') || '[]');
        const localData = {
          ...calculationData,
          timestamp: new Date().toISOString()
        };
        localHistory.unshift(localData);
        
        // Keep only last 50 calculations
        if (localHistory.length > 50) {
          localHistory.splice(50);
        }
        
        localStorage.setItem('calculationHistory', JSON.stringify(localHistory));
        console.log('Calculation saved locally:', localData);
        return { success: true, local: true };
      }
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
      // Try to get limits from backend first
      const result = await CalculationService.checkLimits();
      console.log('Backend limits check:', result);
      return result;
    } catch (backendError) {
      console.log('Backend limits check failed, using local limits:', backendError.message);
      
      // Fallback to local storage
      const localHistory = JSON.parse(localStorage.getItem('calculationHistory') || '[]');
      const today = new Date().toDateString();
      const todayCalculations = localHistory.filter(calc => 
        new Date(calc.timestamp).toDateString() === today
      );
      
      const used = todayCalculations.length;
      const limit = 5; // Free plan limit
      
      console.log('Local limits check:', { 
        totalCalculations: localHistory.length,
        todayCalculations: todayCalculations.length,
        used, 
        limit, 
        canCalculate: used < limit 
      });
      
      return {
        canCalculate: used < limit,
        used: used,
        limit: limit,
        unlimited: false
      };
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
