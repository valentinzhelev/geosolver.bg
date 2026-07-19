import React from 'react';
import { CRS_OPTIONS, DEFAULT_CRS } from '../../domain/geodesy/crsTransform';

/**
 * Compact CRS selector for GNSS / stake-out flows.
 */
export default function CrsSelect({ value = DEFAULT_CRS, onChange, language = 'bg', className = '' }) {
  const bg = language === 'bg';
  return (
    <label className={`flex flex-col gap-1 text-xs font-medium font-['Manrope'] ${className}`}>
      <span className="text-neutral-500 dark:text-zinc-400">{bg ? 'Координатна система' : 'Coordinate system'}</span>
      <select
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-sm text-black dark:text-white font-['Manrope'] outline-none focus:ring-2 focus:ring-black/10"
      >
        {CRS_OPTIONS.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label[bg ? 'bg' : 'en']}
          </option>
        ))}
      </select>
    </label>
  );
}
