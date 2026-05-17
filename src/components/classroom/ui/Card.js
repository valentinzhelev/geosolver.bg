import React from 'react';

export function Card({ children, className = '' }) {
  return (
    <div
      className={`bg-white dark:bg-zinc-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-800 shadow-[0_2px_8px_0_rgba(0,0,0,0.04)] dark:shadow-[0_2px_8px_0_rgba(0,0,0,0.2)] ${className}`}
    >
      {children}
    </div>
  );
}

export function StatCard({ label, value, hint }) {
  return (
    <Card className="p-5 flex flex-col gap-1">
      <span className="text-xs font-semibold text-neutral-400 dark:text-zinc-500 font-['Manrope'] uppercase">
        {label}
      </span>
      <span className="text-2xl font-bold text-black dark:text-white font-['Manrope']">{value}</span>
      {hint && (
        <span className="text-xs text-neutral-500 dark:text-zinc-400 font-['Manrope']">{hint}</span>
      )}
    </Card>
  );
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
