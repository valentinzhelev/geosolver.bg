/** Shared layout for Scan / Reset / Calculate rows (mobile + desktop). */
export const TASK_ACTION_BAR_CLASS =
  'grid grid-cols-2 gap-2 w-full min-w-0 max-w-full sm:flex sm:flex-wrap sm:justify-end sm:items-center sm:gap-2';

/** Wrap scan button (PRO badge) so it stays inside the cell on narrow screens. */
export const TASK_SCAN_WRAP_CLASS = 'relative min-w-0 w-full sm:w-auto max-w-full';

export const TASK_BTN_SECONDARY =
  "w-full sm:w-auto px-3 py-2 sm:px-4 bg-gray-200 dark:bg-zinc-700 rounded-lg inline-flex items-center justify-center gap-1.5 sm:gap-2 shrink-0 text-sm font-medium font-['Manrope'] text-black dark:text-white hover:bg-gray-300 dark:hover:bg-zinc-600 min-w-0";

export const TASK_BTN_PRIMARY =
  "col-span-2 sm:col-span-auto justify-self-end w-full sm:w-auto px-3 py-2 sm:px-4 bg-black dark:bg-white rounded-lg inline-flex items-center justify-center gap-1.5 sm:gap-2 shrink-0 text-sm font-medium font-['Manrope'] text-white dark:text-black min-w-0";

/** Page shells — match HomePage / Tools (zinc-950). */
export const TASK_PAGE_MOBILE =
  'block md:hidden w-full max-w-md mx-auto min-h-screen bg-stone-50 dark:bg-zinc-950 transition-colors relative px-4 py-4';

export const TASK_PAGE_DESKTOP =
  'hidden md:flex w-full flex-col items-center py-10 bg-stone-50 dark:bg-zinc-950 transition-colors';

export const TASK_PAGE_DESKTOP_INNER =
  'w-full max-w-[1180px] mx-auto flex flex-col justify-start items-start gap-10 px-4';

export const TASK_CARD =
  'p-4 bg-white dark:bg-zinc-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-800';

export const TASK_TAB_GROUP =
  'p-1.5 bg-white dark:bg-zinc-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-800 inline-flex justify-start items-center gap-2';

export const TASK_TAB_ACTIVE =
  'px-3 py-1 bg-gray-200 dark:bg-zinc-700 rounded flex justify-center items-center gap-2.5';

export const TASK_TAB_INACTIVE =
  'px-3 py-1 bg-white dark:bg-zinc-900 rounded flex justify-center items-center gap-2.5';

export const TASK_INPUT =
  "self-stretch p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-600 bg-white dark:bg-zinc-800 text-black dark:text-zinc-100 placeholder:text-neutral-400 dark:placeholder:text-zinc-500 text-sm font-medium font-['Manrope']";

export const TASK_INPUT_SM =
  "self-stretch p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-600 bg-white dark:bg-zinc-800 text-black dark:text-zinc-100 placeholder:text-neutral-400 dark:placeholder:text-zinc-500 text-xs font-medium font-['Manrope']";

export const TASK_RESULT_BOX =
  'self-stretch p-3 bg-stone-50 dark:bg-zinc-800 rounded-lg flex flex-col justify-start items-start w-full border border-gray-100 dark:border-zinc-700/80';

export const TASK_HISTORY_TABLE =
  'self-stretch bg-stone-50 dark:bg-zinc-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-800 flex flex-col justify-start items-start gap-px overflow-hidden';
