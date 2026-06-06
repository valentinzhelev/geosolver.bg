import React, { useEffect, useRef, useState } from 'react';

const Chevron = ({ open }) => (
  <svg
    viewBox="0 0 24 24"
    className={`shrink-0 w-4 h-4 text-neutral-400 dark:text-zinc-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="M6 9l6 6 6-6" />
  </svg>
);

const Check = () => (
  <svg viewBox="0 0 24 24" className="shrink-0 w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M5 13l4 4L19 7" />
  </svg>
);

/**
 * On-palette custom dropdown (white/black/gray). Replaces native <select>.
 */
const Select = ({ value, onChange, options = [], placeholder = '', className = '', ariaLabel }) => {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={wrapRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg border border-gray-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-sm font-['Manrope'] text-black dark:text-white transition-colors hover:border-gray-300 dark:hover:border-zinc-600 focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/20"
      >
        <span className={`truncate ${selected ? '' : 'text-neutral-400 dark:text-zinc-500'}`}>
          {selected ? selected.label : placeholder}
        </span>
        <Chevron open={open} />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute z-30 mt-1.5 w-full min-w-[180px] max-h-64 overflow-auto rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-[0_12px_32px_-8px_rgba(0,0,0,0.25)] p-1 animate-gai-pop origin-top"
        >
          {options.map((o) => {
            const active = o.value === value;
            return (
              <li key={String(o.value)} role="option" aria-selected={active}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(o.value);
                    setOpen(false);
                  }}
                  className={`w-full text-left flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg text-sm font-['Manrope'] transition-colors ${
                    active
                      ? 'bg-stone-100 dark:bg-zinc-800 text-black dark:text-white font-semibold'
                      : 'text-neutral-700 dark:text-zinc-300 hover:bg-stone-50 dark:hover:bg-zinc-800'
                  }`}
                >
                  <span className="truncate">{o.label}</span>
                  {active && <Check />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default Select;
