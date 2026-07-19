import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MODULE_META, getModuleDocs, getModuleBadgeLabel } from '../../config/moduleDocs';
import { DocCallout, DocList, DocSection, DocTable } from '../tasks/docs/TaskDocsLayout';

export const ModuleWorkflow = ({ steps = [], language = 'bg' }) => {
  if (!steps.length) return null;
  return (
    <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
      {steps.map((step, i) => (
        <div
          key={step.title}
          className="p-3 bg-white dark:bg-zinc-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-800 flex flex-col gap-1"
        >
          <div className="text-[10px] font-bold uppercase tracking-wide text-neutral-400 font-['Manrope']">
            {language === 'bg' ? 'Стъпка' : 'Step'} {i + 1}
          </div>
          <div className="text-sm font-semibold text-black dark:text-white font-['Manrope']">{step.title}</div>
          <p className="text-xs text-neutral-500 dark:text-zinc-400 font-['Manrope'] leading-relaxed">{step.body}</p>
        </div>
      ))}
    </div>
  );
};

export const ModuleQuickTipsPanel = ({ tips = [], language = 'bg' }) => {
  if (!tips.length) return null;
  return (
    <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-800 sticky top-4">
      <div className="text-sm font-semibold text-black dark:text-white font-['Manrope'] mb-3">
        {language === 'bg' ? 'Бързи съвети' : 'Quick tips'}
      </div>
      <ul className="space-y-2.5">
        {tips.map((tip) => (
          <li key={tip} className="text-xs text-neutral-600 dark:text-zinc-300 font-['Manrope'] leading-relaxed pl-3 border-l-2 border-orange-400">
            {tip}
          </li>
        ))}
      </ul>
    </div>
  );
};

export const ModuleDocsContent = ({ moduleId, language = 'bg' }) => {
  const docs = getModuleDocs(moduleId, language);
  if (!docs) return null;

  return (
    <div className="p-4 md:p-6 bg-white dark:bg-zinc-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-800">
      <div className="flex flex-col gap-8">
        {docs.sections.map((sec) => (
          <DocSection key={sec.title} title={sec.title}>
            {sec.content && <p className="text-base text-neutral-700 dark:text-zinc-300 leading-relaxed">{sec.content}</p>}
            {sec.list && (
              <DocCallout variant={sec.variant || 'blue'}>
                <DocList items={sec.list} />
              </DocCallout>
            )}
            {sec.table && <DocTable headers={sec.table.headers} rows={sec.table.rows} />}
          </DocSection>
        ))}
        {docs.relatedTools.length > 0 && (
          <DocSection title={language === 'bg' ? 'Свързани инструменти' : 'Related tools'}>
            <div className="flex flex-wrap gap-2">
              {docs.relatedTools.map((r) => (
                <Link
                  key={r.to}
                  to={r.to}
                  className="px-3 py-2 rounded-lg bg-stone-50 dark:bg-zinc-800 outline outline-1 outline-gray-200 dark:outline-zinc-700 text-sm font-semibold font-['Manrope'] text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors"
                >
                  {r.label} →
                </Link>
              ))}
            </div>
          </DocSection>
        )}
      </div>
    </div>
  );
};

const ModulePageLayout = ({
  moduleId,
  language = 'bg',
  children,
  toolbar,
  stats,
  maxWidth = '1180px',
}) => {
  const [tab, setTab] = useState('work');
  const meta = MODULE_META[moduleId];
  const docs = getModuleDocs(moduleId, language);
  const bg = language === 'bg';
  const badgeLabel = getModuleBadgeLabel(language);

  if (!meta) return children;

  const tabClass = (id) =>
    `px-4 py-2 rounded-lg text-sm font-semibold font-['Manrope'] transition-colors ${
      tab === id
        ? 'bg-black dark:bg-white text-white dark:text-black'
        : 'bg-white dark:bg-zinc-900 text-neutral-600 dark:text-zinc-400 outline outline-1 outline-gray-200 dark:outline-zinc-700'
    }`;

  return (
    <div className="w-full bg-stone-50 dark:bg-zinc-950 py-6 md:py-10 pb-10 md:pb-14">
      <div className="w-full mx-auto flex flex-col gap-5 md:gap-6 px-4 md:px-0" style={{ maxWidth }}>
        {/* Breadcrumb + header */}
        <div className="flex flex-col gap-3">
          <div className="text-neutral-400 dark:text-zinc-400 text-sm font-medium font-['Manrope']">
            <Link to="/tools" className="underline hover:text-black dark:hover:text-white">
              {bg ? 'Инструменти' : 'Tools'}
            </Link>
            <span> &gt; {meta.title[bg ? 'bg' : 'en']}</span>
          </div>
          <div className="flex flex-wrap items-start gap-3 justify-between">
            <div className="flex flex-col gap-1 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-bold font-['Manrope'] text-black dark:text-white">
                  {meta.title[bg ? 'bg' : 'en']}
                </h1>
                <span className="px-2.5 py-1 rounded-md bg-stone-200 dark:bg-zinc-800 text-neutral-700 dark:text-zinc-300 text-[10px] font-bold uppercase tracking-wide font-['Manrope']">
                  {badgeLabel}
                </span>
              </div>
              <p className="text-neutral-500 dark:text-zinc-400 text-sm md:text-base font-['Manrope'] leading-relaxed">
                {meta.subtitle[bg ? 'bg' : 'en']}
              </p>
            </div>
            {toolbar}
          </div>
        </div>

        {docs && <ModuleWorkflow steps={docs.workflow} language={language} />}

        {stats}

        <div className="flex flex-wrap gap-2">
          <button type="button" className={tabClass('work')} onClick={() => setTab('work')}>
            {bg ? 'Работа' : 'Work'}
          </button>
          <button type="button" className={tabClass('docs')} onClick={() => setTab('docs')}>
            {bg ? 'Документация' : 'Documentation'}
          </button>
        </div>

        {tab === 'docs' ? (
          <ModuleDocsContent moduleId={moduleId} language={language} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5 items-start">
            <div className="min-w-0 flex flex-col gap-4">{children}</div>
            {docs && <ModuleQuickTipsPanel tips={docs.quickTips} language={language} />}
          </div>
        )}
      </div>
    </div>
  );
};

export default ModulePageLayout;
