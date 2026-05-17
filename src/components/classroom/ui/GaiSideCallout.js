import React from 'react';

const GaiSideCallout = ({ title, body, variant = 'default', align = 'left', icon, long = false }) => {
  const styles = {
    default: 'bg-white dark:bg-zinc-900 border-stone-200 dark:border-zinc-700',
    ai: 'bg-violet-50 dark:bg-violet-950/40 border-violet-200 dark:border-violet-800',
    success: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800',
    warn: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800',
    peer: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800',
  };

  const connector =
    align === 'left'
      ? 'after:absolute after:top-1/2 after:-right-3 after:w-3 after:h-px after:bg-stone-300 dark:after:bg-zinc-600'
      : 'before:absolute before:top-1/2 before:-left-3 before:w-3 before:h-px before:bg-stone-300 dark:before:bg-zinc-600';

  return (
    <div
      className={`relative ${long ? 'max-w-[260px]' : 'max-w-[240px]'} px-4 py-3 rounded-xl border shadow-sm ${styles[variant] || styles.default} ${connector} font-['Manrope']`}
    >
      <div className="flex items-start gap-2">
        {icon && <span className="text-lg shrink-0 leading-none">{icon}</span>}
        <div>
          {title && <p className="text-sm font-bold text-black dark:text-white leading-snug">{title}</p>}
          {body && (
            <p
              className={`text-xs text-neutral-600 dark:text-zinc-400 mt-1 leading-relaxed ${long ? 'max-h-32 overflow-y-auto' : ''}`}
            >
              {body}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default GaiSideCallout;
