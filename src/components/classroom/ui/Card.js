import React from 'react';
import { Link } from 'react-router-dom';

export function Card({ children, className = '' }) {
  return (
    <div
      className={`bg-white dark:bg-zinc-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-800 shadow-[0_2px_8px_0_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_0_rgba(0,0,0,0.2)] ${className}`}
    >
      {children}
    </div>
  );
}

const STAT_ACCENTS = {
  neutral: 'bg-stone-100 text-stone-600 dark:bg-zinc-800 dark:text-zinc-300',
  blue: 'bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-300',
  green: 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-300',
  amber: 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300',
  purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300',
};

export function StatCard({ label, value, hint, icon, accent = 'neutral', to, highlight = false }) {
  const inner = (
    <>
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-semibold text-neutral-400 dark:text-zinc-500 font-['Manrope'] uppercase tracking-wide">
          {label}
        </span>
        {icon && (
          <span
            className={`shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${STAT_ACCENTS[accent] || STAT_ACCENTS.neutral}`}
          >
            {icon}
          </span>
        )}
      </div>
      <span className="text-3xl font-bold text-black dark:text-white font-['Manrope'] leading-none mt-1">
        {value}
      </span>
      {hint && (
        <span
          className={`text-xs font-['Manrope'] font-medium ${
            highlight
              ? 'text-amber-600 dark:text-amber-400'
              : 'text-neutral-500 dark:text-zinc-400'
          }`}
        >
          {hint}
        </span>
      )}
    </>
  );

  const base = `p-5 flex flex-col gap-1.5 h-full transition-all duration-200 ${
    highlight
      ? 'outline-amber-300 dark:outline-amber-700/60'
      : ''
  }`;

  if (to) {
    return (
      <Card className={`${base} hover:-translate-y-0.5 hover:shadow-lg group cursor-pointer`}>
        <Link to={to} className="flex flex-col gap-1.5 h-full no-underline">
          {inner}
        </Link>
      </Card>
    );
  }

  return <Card className={base}>{inner}</Card>;
}

export function EmptyState({ title, description, action }) {
  return (
    <Card className="p-10 text-center flex flex-col items-center gap-3">
      <h3 className="text-lg font-bold text-black dark:text-white font-['Manrope']">{title}</h3>
      {description && (
        <p className="text-sm text-neutral-600 dark:text-zinc-400 font-['Manrope'] max-w-md">{description}</p>
      )}
      {action}
    </Card>
  );
}
