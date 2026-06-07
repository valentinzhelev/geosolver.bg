import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';

export const authCardClass =
  'w-full p-4 md:p-5 bg-white dark:bg-zinc-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-800 transition-colors';

export const authInputClass =
  "w-full p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-600 bg-white dark:bg-zinc-800 text-black dark:text-zinc-100 placeholder-neutral-400 dark:placeholder-zinc-500 text-sm font-medium font-['Manrope']";

export const authLabelClass =
  "text-black dark:text-white text-sm font-medium font-['Manrope']";

export function AuthWelcomeBanner() {
  const { t } = useTranslation();

  return (
    <div className="w-full px-6 md:px-10 py-5 md:py-7 relative bg-black dark:bg-zinc-900 rounded-xl flex justify-center items-center overflow-hidden border border-transparent dark:border-zinc-800 min-h-[4.5rem] md:min-h-[5.25rem]">
      <img
        className="absolute inset-0 w-full h-full object-cover rotate-180 opacity-80"
        src="/images/gradient_wallpaper.jpg"
        alt=""
      />
      <div className="relative z-10 flex flex-row items-center justify-center gap-2.5 md:gap-3">
        <span className="text-white text-base md:text-lg font-semibold font-['Manrope']">
          {t.welcomeTo}
        </span>
        <span className="flex items-center gap-2">
          <img src="/icons/white_logo.svg" alt="GeoSolver" className="w-8 h-8 md:w-9 md:h-9" />
          <span className="text-white text-base md:text-lg font-bold font-['Manrope']">
            GeoSolver
          </span>
        </span>
      </div>
    </div>
  );
}

export default function AuthShell({ children }) {
  return (
    <div className="w-full min-h-screen bg-stone-50 dark:bg-zinc-950 transition-colors">
      <div className="container mx-auto px-4 py-8 md:py-10">
        <div className="max-w-[480px] sm:max-w-[540px] w-full mx-auto flex flex-col gap-4 md:gap-5">
          <AuthWelcomeBanner />
          {children}
        </div>
      </div>
    </div>
  );
}
