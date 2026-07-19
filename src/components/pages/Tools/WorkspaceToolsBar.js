import React from 'react';
import { Link } from 'react-router-dom';

const WorkspaceToolsBar = ({ items = [], language = 'bg', betaLabel = 'BETA' }) => {
  const bg = language === 'bg';
  if (!items.length) return null;

  return (
    <div className="w-full p-4 md:p-5 bg-white dark:bg-zinc-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-800 shadow-[0_2px_8px_0_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_0_rgba(0,0,0,0.2)]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
        <div>
          <div className="text-black dark:text-white text-sm md:text-base font-semibold font-['Manrope']">
            {bg ? 'Теренни и офис инструменти' : 'Field & office tools'}
          </div>
          <p className="text-neutral-400 dark:text-zinc-500 text-xs md:text-sm font-medium font-['Manrope'] mt-0.5">
            {bg
              ? 'Проекти, точки, карта, GNSS, трасиране и карнети.'
              : 'Projects, points, map, GNSS, stake-out and field books.'}
          </p>
        </div>
        <span className="self-start sm:self-center px-2.5 py-1 rounded-md bg-stone-100 dark:bg-zinc-800 text-[10px] font-bold uppercase tracking-wide text-neutral-500 dark:text-zinc-400 font-['Manrope']">
          {items.length} {bg ? 'модула' : 'modules'}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="group inline-flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-stone-50 dark:bg-zinc-800 outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-700 text-sm font-semibold font-['Manrope'] text-black dark:text-white transition-all hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black hover:outline-black dark:hover:outline-white"
          >
            <span>{item.label}</span>
            {item.beta && (
              <span className="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-zinc-700 group-hover:bg-white/20 dark:group-hover:bg-black/10 text-[10px] font-bold font-['Manrope'] transition-colors">
                {betaLabel}
              </span>
            )}
            <svg
              viewBox="0 0 16 16"
              className="w-3 h-3 opacity-40 group-hover:opacity-100 transition-opacity"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M3 8h10M9 4l4 4-4 4" />
            </svg>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default WorkspaceToolsBar;
