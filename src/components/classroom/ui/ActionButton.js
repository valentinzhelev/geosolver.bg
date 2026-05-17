import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Compact pill buttons — same language as calculator actions (Сканирай / Нулирай / Изчисли).
 * Variants: primary (black), secondary (gray), outline, danger.
 */
const VARIANTS = {
  primary:
    'bg-black dark:bg-white text-white dark:text-black hover:opacity-90',
  secondary:
    'bg-gray-200 dark:bg-zinc-700 text-black dark:text-white hover:bg-gray-300 dark:hover:bg-zinc-600',
  outline:
    'bg-white dark:bg-zinc-900 outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-700 text-black dark:text-white hover:bg-stone-50 dark:hover:bg-zinc-800',
  danger:
    'bg-red-50 dark:bg-red-950/40 outline outline-1 outline-offset-[-1px] outline-red-200 dark:outline-red-900/50 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/60',
};

const BASE =
  "inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium font-['Manrope'] transition-colors disabled:opacity-50 disabled:cursor-not-allowed no-underline shrink-0";

export function ActionButton({
  to,
  href,
  onClick,
  variant = 'secondary',
  children,
  disabled,
  type = 'button',
  className = '',
  target,
  rel,
}) {
  const classes = `${BASE} ${VARIANTS[variant] || VARIANTS.secondary} ${className}`;

  if (to) {
    return (
      <Link to={to} className={classes} target={target} rel={rel}>
        {children}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={classes} target={target} rel={rel}>
        {children}
      </a>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes}>
      {children}
    </button>
  );
}
