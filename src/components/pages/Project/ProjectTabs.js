import React from 'react';

export const PROJECT_TABS = [
  { id: 'overview', bg: 'Обзор', en: 'Overview' },
  { id: 'points', bg: 'Точки', en: 'Points' },
  { id: 'field-data', bg: 'Теренни данни', en: 'Field data' },
  { id: 'processing', bg: 'Обработки', en: 'Processing' },
  { id: 'map', bg: 'Карта', en: 'Map' },
];

/** The Project workspace's persistent in-project navigation (V2.4.3 section 2). */
const ProjectTabs = ({ active, onChange, bg = true }) => (
  <div className="flex flex-wrap gap-1.5" role="tablist" aria-label={bg ? 'Раздели на проекта' : 'Project sections'}>
    {PROJECT_TABS.map((t) => (
      <button
        key={t.id}
        type="button"
        role="tab"
        aria-selected={active === t.id}
        onClick={() => onChange(t.id)}
        className={`px-3 py-1.5 rounded-lg text-sm font-semibold font-['Manrope'] ${
          active === t.id ? 'bg-black dark:bg-white text-white dark:text-black' : 'bg-white dark:bg-zinc-900 outline outline-1 outline-gray-200 dark:outline-zinc-700'
        }`}
        data-testid={`project-tab-${t.id}`}
      >
        {bg ? t.bg : t.en}
      </button>
    ))}
  </div>
);

export default ProjectTabs;
