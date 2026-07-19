import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { getModuleDocs, MODULE_META, getModuleBadgeLabel } from '../../config/moduleDocs';
import { ModuleWorkflow, ModuleDocsContent } from './ModulePageLayout';

/** Collapsible education panel for FieldBook workspace */
const FieldBookEducationPanel = ({ language = 'bg' }) => {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState('tips');
  const bg = language === 'bg';
  const badgeLabel = getModuleBadgeLabel(language);
  const meta = MODULE_META.fieldbook;
  const docs = getModuleDocs('fieldbook', language);

  return (
    <div className="rounded-xl outline outline-1 outline-gray-200 dark:outline-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full px-4 py-3 flex items-center justify-between gap-3 text-left hover:bg-stone-50 dark:hover:bg-zinc-800/50 transition-colors"
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="px-2 py-0.5 rounded-md bg-stone-200 dark:bg-zinc-800 text-neutral-700 dark:text-zinc-300 text-[10px] font-bold uppercase font-['Manrope'] shrink-0">
            {badgeLabel}
          </span>
          <span className="text-sm font-semibold text-black dark:text-white font-['Manrope'] truncate">
            {bg ? 'Как работят полевите карнети?' : 'How do field books work?'}
          </span>
        </div>
        <svg viewBox="0 0 10 10" className={`w-3 h-3 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" aria-hidden>
          <path d="M2 4l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
      {open && docs && (
        <div className="px-4 pb-4 border-t border-gray-100 dark:border-zinc-800 flex flex-col gap-4">
          <p className="text-sm text-neutral-500 font-['Manrope'] pt-3">{meta.subtitle[bg ? 'bg' : 'en']}</p>
          <ModuleWorkflow steps={docs.workflow} language={language} />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setTab('tips')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-['Manrope'] ${tab === 'tips' ? 'bg-black dark:bg-white text-white dark:text-black' : 'outline outline-1 outline-gray-200 dark:outline-zinc-700'}`}
            >
              {bg ? 'Съвети' : 'Tips'}
            </button>
            <button
              type="button"
              onClick={() => setTab('docs')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-['Manrope'] ${tab === 'docs' ? 'bg-black dark:bg-white text-white dark:text-black' : 'outline outline-1 outline-gray-200 dark:outline-zinc-700'}`}
            >
              {bg ? 'Документация' : 'Documentation'}
            </button>
          </div>
          {tab === 'tips' ? (
            <ul className="space-y-2">
              {docs.quickTips.map((tip) => (
                <li key={tip} className="text-xs text-neutral-600 dark:text-zinc-300 font-['Manrope'] pl-3 border-l-2 border-orange-400">
                  {tip}
                </li>
              ))}
            </ul>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              <ModuleDocsContent moduleId="fieldbook" language={language} />
            </div>
          )}
          <div className="flex flex-wrap gap-2 pt-1">
            {docs.relatedTools.map((r) => (
              <Link key={r.to} to={r.to} className="text-xs font-semibold font-['Manrope'] underline text-black dark:text-white">
                {r.label} →
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FieldBookEducationPanel;
