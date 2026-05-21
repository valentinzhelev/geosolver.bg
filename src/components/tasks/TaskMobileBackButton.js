import React from 'react';
import { Link } from 'react-router-dom';

/** Mobile header back control – returns to the tools list. */
export default function TaskMobileBackButton({ to = '/tools' }) {
  return (
    <Link
      to={to}
      aria-label="Назад към инструментите"
      className="w-8 h-8 flex shrink-0 items-center justify-center rounded-xl bg-gray-200 dark:bg-zinc-700 text-black dark:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20"
    >
      <svg width="20" height="20" fill="none" viewBox="0 0 20 20" aria-hidden="true">
        <path
          d="M13 15l-5-5 5-5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </Link>
  );
}
