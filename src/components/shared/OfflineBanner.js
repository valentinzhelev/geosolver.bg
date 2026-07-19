import React, { useEffect, useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';

/**
 * Subtle banner when the app is offline (PWA / field use).
 */
const OfflineBanner = () => {
  const { language } = useTranslation();
  const bg = language === 'bg';
  const [offline, setOffline] = useState(
    typeof navigator !== 'undefined' ? !navigator.onLine : false
  );

  useEffect(() => {
    const on = () => setOffline(false);
    const off = () => setOffline(true);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  if (!offline) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[95] px-4 py-2 bg-amber-600 text-white text-center text-sm font-semibold font-['Manrope'] shadow-md"
      role="status"
    >
      {bg
        ? 'Офлайн режим — калкулаторите работят; синхронизацията със сървъра е паузирана.'
        : 'Offline — calculators work; server sync is paused.'}
    </div>
  );
};

export default OfflineBanner;
