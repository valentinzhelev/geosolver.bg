import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import TaskScanButton from './TaskScanButton';
import {
  TASK_ACTION_BAR_CLASS,
  TASK_BTN_PRIMARY,
  TASK_BTN_SECONDARY,
} from './taskActionStyles';

const FLEX_BAR_CLASS =
  'flex flex-wrap justify-end items-center gap-2 w-full min-w-0 max-w-full';

/**
 * Scan / Reset / Calculate row shared by all instrument pages.
 */
export default function TaskActionBar({
  onReset,
  onCalculate,
  calculateDisabled = false,
  scanOnClick,
  scanIsScanning = false,
  scanComingSoon = false,
  layout = 'grid',
  className = '',
}) {
  const { t } = useTranslation();
  const barClass = layout === 'flex' ? FLEX_BAR_CLASS : TASK_ACTION_BAR_CLASS;
  const scanReady = typeof scanOnClick === 'function';

  return (
    <div className={`${barClass} ${className}`.trim()}>
      <TaskScanButton
        onClick={scanOnClick}
        isScanning={scanIsScanning}
        comingSoon={scanComingSoon || !scanReady}
        labelSize={layout === 'flex' ? 'md' : 'sm'}
      />
      <button type="button" onClick={onReset} className={TASK_BTN_SECONDARY}>
        <span className="min-w-0 truncate">{t.reset}</span>
      </button>
      <button
        type="button"
        onClick={onCalculate}
        disabled={calculateDisabled}
        className={`${TASK_BTN_PRIMARY}${calculateDisabled ? ' opacity-50 cursor-not-allowed' : ''}`}
      >
        <span className="min-w-0 truncate">{t.calculate}</span>
        <img src="/icons/white_right_arrow.svg" alt={t.calculate} className="h-4 w-4 shrink-0" />
      </button>
    </div>
  );
}
