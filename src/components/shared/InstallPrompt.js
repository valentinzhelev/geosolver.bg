import React, { useEffect, useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';

/**
 * Lightweight install banner for PWA (beforeinstallprompt).
 */
const InstallPrompt = () => {
  const { language } = useTranslation();
  const bg = language === 'bg';
  const [deferred, setDeferred] = useState(null);
  const [dismissed, setDismissed] = useState(() => {
    try {
      return sessionStorage.getItem('pwa_install_dismissed') === '1';
    } catch {
      return false;
    }
  });
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const onBeforeInstall = (e) => {
      e.preventDefault();
      setDeferred(e);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const dismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem('pwa_install_dismissed', '1');
    } catch {
      /* ignore */
    }
  };

  const install = async () => {
    if (!deferred) return;
    deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
  };

  if (installed || dismissed || !deferred) return null;

  return (
    <div
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-sm z-[90] p-4 rounded-xl bg-white dark:bg-zinc-900 shadow-lg border border-gray-200 dark:border-zinc-700 font-['Manrope']"
      role="dialog"
      aria-label={bg ? 'Инсталирай приложението' : 'Install app'}
    >
      <p className="text-sm font-semibold text-black dark:text-white mb-1">
        {bg ? 'Инсталирай GeoSolver' : 'Install GeoSolver'}
      </p>
      <p className="text-xs text-neutral-500 dark:text-zinc-400 mb-3">
        {bg
          ? 'Добави към началния екран за бърз достъп до калкулатори и полеви модули.'
          : 'Add to home screen for quick access to calculators and field tools.'}
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={install}
          className="flex-1 px-3 py-2 rounded-lg bg-black dark:bg-white text-white dark:text-black text-sm font-semibold"
        >
          {bg ? 'Инсталирай' : 'Install'}
        </button>
        <button
          type="button"
          onClick={dismiss}
          className="px-3 py-2 rounded-lg text-sm font-medium text-neutral-500 hover:bg-stone-50 dark:hover:bg-zinc-800"
        >
          {bg ? 'Не сега' : 'Not now'}
        </button>
      </div>
    </div>
  );
};

export default InstallPrompt;
