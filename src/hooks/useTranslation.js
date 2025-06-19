import { useLanguage } from '../context/LanguageContext';
import { translations } from '../translations';

export const useTranslation = () => {
  const { language } = useLanguage();
  const t = translations[language];

  return {
    t,
    language
  };
}; 