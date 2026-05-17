/** Shared layout for Scan / Reset / Calculate rows (mobile + desktop). */
export const TASK_ACTION_BAR_CLASS =
  'grid grid-cols-2 gap-2 w-full min-w-0 max-w-full sm:flex sm:flex-wrap sm:justify-end sm:items-center sm:gap-2';

/** Wrap scan button (PRO badge) so it stays inside the cell on narrow screens. */
export const TASK_SCAN_WRAP_CLASS = 'relative min-w-0 w-full sm:w-auto max-w-full';

export const TASK_BTN_SECONDARY =
  "w-full sm:w-auto px-3 py-2 sm:px-4 bg-gray-200 dark:bg-zinc-700 rounded-lg inline-flex items-center justify-center gap-1.5 sm:gap-2 shrink-0 text-sm font-medium font-['Manrope'] text-black dark:text-white hover:bg-gray-300 dark:hover:bg-zinc-600 min-w-0";

export const TASK_BTN_PRIMARY =
  "col-span-2 sm:col-span-auto justify-self-end w-full sm:w-auto px-3 py-2 sm:px-4 bg-black dark:bg-white rounded-lg inline-flex items-center justify-center gap-1.5 sm:gap-2 shrink-0 text-sm font-medium font-['Manrope'] text-white dark:text-black min-w-0";
