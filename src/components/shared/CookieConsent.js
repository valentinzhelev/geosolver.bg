import React, { useState, useEffect } from 'react';

const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setShowBanner(false);
  };

  const rejectCookies = () => {
    localStorage.setItem('cookieConsent', 'rejected');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 shadow-lg border-t border-gray-200 dark:border-zinc-800 p-4 z-50 transition-colors duration-300">
      <div className="w-full max-w-5xl mx-auto flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <p className="text-gray-700 dark:text-zinc-300 text-sm text-center sm:text-left mb-0">
          С използването на нашия сайт, вие се съгласявате с нашата политика за бисквитки. Можете да промените настройките си по всяко време.
        </p>
        <div className="flex flex-row gap-2 flex-shrink-0 justify-center sm:justify-end">
          <button
            onClick={rejectCookies}
            className="px-6 py-2 bg-gray-200 dark:bg-zinc-700 text-gray-800 dark:text-zinc-100 rounded-md hover:bg-gray-300 dark:hover:bg-zinc-600 transition-colors text-sm font-medium whitespace-nowrap"
          >
            Отхвърлям
          </button>
          <button
            onClick={acceptCookies}
            className="px-6 py-2 bg-black dark:bg-white text-white dark:text-black rounded-md hover:bg-gray-800 dark:hover:bg-zinc-200 transition-colors text-sm font-medium whitespace-nowrap"
          >
            Приемам и се съгласявам
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent; 