import { useEffect } from 'react';
import { useTranslation } from './useTranslation';
import { isTaskPlaceholderResult } from '../utils/taskI18n';

/**
 * Keeps placeholder result text in sync when UI language changes.
 * @param {string} resultText
 * @param {function} setResultText
 * @param {(t: object) => string} getPlaceholder — e.g. t => t.secondTaskDefaultResultText
 */
export function useSyncTaskLanguage(resultText, setResultText, getPlaceholder) {
  const { t, language } = useTranslation();
  const placeholder = getPlaceholder(t);

  useEffect(() => {
    setResultText((prev) => (isTaskPlaceholderResult(prev) ? placeholder : prev));
  }, [language, placeholder, setResultText]);

  return { t, language, placeholder };
}
