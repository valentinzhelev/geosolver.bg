import { useRef, useState } from 'react';
import { useAuth } from '../components/auth/AuthContext';

export function useProScan(language = 'bg') {
  const { user } = useAuth();
  const isProUser =
    user?.plan === 'pro' ||
    ['active', 'trialing'].includes(user?.subscriptionStatus) ||
    user?.role === 'admin';

  const proScanMessage =
    language === 'bg'
      ? 'Сканирането е функция на Pro плана. Моля, абонирайте се.'
      : 'Scanning is a Pro feature. Please subscribe.';

  const [showProHint, setShowProHint] = useState(false);
  const hintTimerRef = useRef(null);

  const clearHintTimer = () => {
    if (hintTimerRef.current) {
      clearTimeout(hintTimerRef.current);
      hintTimerRef.current = null;
    }
  };

  const showHint = () => {
    if (isProUser) return;
    clearHintTimer();
    setShowProHint(true);
  };

  const hideHint = () => {
    clearHintTimer();
    setShowProHint(false);
  };

  const hideHintAfterDelay = (ms = 2500) => {
    clearHintTimer();
    hintTimerRef.current = setTimeout(() => setShowProHint(false), ms);
  };

  const hintProps = isProUser
    ? {}
    : {
        onMouseEnter: showHint,
        onMouseLeave: hideHint,
        onFocus: showHint,
        onBlur: hideHint,
        onTouchStart: showHint,
        onTouchEnd: () => hideHintAfterDelay(2500),
      };

  return {
    isProUser,
    proScanMessage,
    showProHint,
    hintProps,
  };
}
