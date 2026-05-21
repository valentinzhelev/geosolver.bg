import React, { createContext, useState, useContext } from 'react';

const LanguageContext = createContext();

const STORAGE_KEY = 'geosolver-lang';

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === 'en' ? 'en' : 'bg';
  });

  const setLanguage = (lang) => {
    const next = lang === 'en' ? 'en' : 'bg';
    setLanguageState(next);
    localStorage.setItem(STORAGE_KEY, next);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'bg' ? 'en' : 'bg');
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}; 