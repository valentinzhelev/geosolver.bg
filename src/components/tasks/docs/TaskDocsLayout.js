import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../layout/Layout';
import { useTranslation } from '../../../hooks/useTranslation';
import ToolTabSwitcher from './ToolTabSwitcher';

export const DocSection = ({ title, children }) => (
  <section className="flex flex-col gap-4">
    <h2 className="text-xl md:text-2xl font-semibold text-black dark:text-white border-b border-gray-200 dark:border-zinc-700 pb-1">
      {title}
    </h2>
    {children}
  </section>
);

export const DocCallout = ({ title, children, variant = 'blue' }) => {
  const styles = {
    blue: 'bg-blue-50 dark:bg-blue-950/30 border-blue-400',
    green: 'bg-green-50 dark:bg-green-950/30 border-green-400',
    yellow: 'bg-yellow-50 dark:bg-yellow-950/30 border-yellow-400',
  };
  return (
    <div className={`border-l-4 rounded p-4 ${styles[variant] || styles.blue}`}>
      {title && (
        <h3 className="text-lg font-semibold text-black dark:text-white mb-2">{title}</h3>
      )}
      <div className="text-base text-black dark:text-zinc-200">{children}</div>
    </div>
  );
};

export const DocFormulaBlock = ({ children, note }) => (
  <>
    <div className="bg-gray-50 dark:bg-zinc-800 rounded-lg p-4 text-base md:text-lg font-mono text-black dark:text-white flex flex-col gap-1">
      {children}
    </div>
    {note && (
      <p className="text-sm text-neutral-600 dark:text-neutral-400">{note}</p>
    )}
  </>
);

export const DocList = ({ items }) => (
  <ul className="list-disc ml-6 text-base text-neutral-700 dark:text-neutral-300 space-y-1">
    {items.map((item) => (
      <li key={item}>{item}</li>
    ))}
  </ul>
);

export const CalculatorLink = () => {
  const { language } = useTranslation();
  const isBg = language === 'bg';
  return (
    <DocCallout
      title={isBg ? 'Научен калкулатор' : 'Scientific calculator'}
      variant="blue"
    >
      <p className="mb-3">
        {isBg
          ? 'За проверка на sin, cos и atan2 използвайте вградения калкулатор в режим GRAD (гради).'
          : 'Use the built-in calculator in GRAD mode to verify sin, cos, and atan2 steps.'}
      </p>
      <Link
        to="/scientific-calculator"
        className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
      >
        {isBg ? 'Отвори научен калкулатор' : 'Open scientific calculator'}
      </Link>
    </DocCallout>
  );
};

const TaskDocsLayout = ({ title, toolPath, children }) => {
  const { t } = useTranslation();

  return (
    <Layout>
      <div className="w-full bg-stone-50 dark:bg-zinc-950 py-8 md:py-10 pb-12">
        <div className="max-w-[1180px] w-full mx-auto px-4 flex flex-col gap-8 md:gap-10">
          <div className="w-full md:w-[580px] flex flex-col justify-start items-start gap-4">
            <div className="flex flex-col justify-start items-start gap-1 w-full">
              <div className="text-neutral-400 text-base font-medium font-['Manrope']">
                <Link to="/tools" className="underline hover:text-black dark:hover:text-white">
                  {t.tools}
                </Link>
                <span>{' > '}{title}</span>
              </div>
              <h1 className="text-black dark:text-white text-2xl md:text-3xl font-bold font-['Manrope']">
                {title}
              </h1>
            </div>
            <ToolTabSwitcher toolPath={toolPath} active="docs" />
          </div>

          <div className="w-full p-4 md:p-6 bg-white dark:bg-zinc-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-800">
            <div className="flex flex-col gap-8 md:gap-10">{children}</div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TaskDocsLayout;
