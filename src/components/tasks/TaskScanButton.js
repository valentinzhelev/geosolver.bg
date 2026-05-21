import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useProScan } from '../../hooks/useProScan';
import { TASK_BTN_SECONDARY, TASK_SCAN_WRAP_CLASS } from './taskActionStyles';

const COMING_SOON = {
  bg: 'Тази функция е в процес на разработка и интеграция.',
  en: 'This feature is under development.',
};

/**
 * Scan action with Pro gating: PRO badge, tooltip (hover + touch), same on mobile and desktop.
 */
export default function TaskScanButton({ onClick, isScanning = false, comingSoon = false, labelSize = 'sm' }) {
  const { t, language } = useTranslation();
  const { isProUser, proScanMessage, showProHint, hintProps } = useProScan(language);
  const textSize = labelSize === 'md' ? 'text-base' : 'text-sm';

  const handleClick = () => {
    if (!isProUser) {
      alert(proScanMessage);
      return;
    }
    if (comingSoon || !onClick) {
      alert(COMING_SOON[language] || COMING_SOON.bg);
      return;
    }
    onClick();
  };

  return (
    <div className={TASK_SCAN_WRAP_CLASS} {...hintProps}>
      {!isProUser && showProHint && (
        <div
          role="tooltip"
          className="absolute bottom-full left-0 z-20 mb-1 max-w-[min(calc(100vw-2rem),280px)] whitespace-normal rounded-md bg-black px-3 py-1.5 text-xs leading-snug text-white shadow"
        >
          {proScanMessage}
        </div>
      )}
      <button
        type="button"
        onClick={handleClick}
        disabled={isScanning}
        title={!isProUser ? proScanMessage : undefined}
        className={`${TASK_BTN_SECONDARY} hover:bg-gray-300 disabled:opacity-50${!isProUser ? ' opacity-70' : ''}`}
      >
        {isScanning ? (
          <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
        ) : (
          <img src="/icons/scan_icon.svg" alt={t.scan} className="h-4 w-4 shrink-0 dark:invert" />
        )}
        <span className={`min-w-0 truncate font-medium font-['Manrope'] text-black dark:text-white ${textSize}`}>
          {t.scan}
        </span>
        {!isProUser && (
          <span className="shrink-0 rounded bg-black px-1.5 py-0.5 text-[10px] font-semibold text-white">PRO</span>
        )}
      </button>
    </div>
  );
}
