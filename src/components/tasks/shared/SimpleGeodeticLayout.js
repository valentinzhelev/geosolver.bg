import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../layout/Layout';
import SEO from '../../shared/SEO';
import TaskActionBar from '../TaskActionBar';
import TaskMobileBackButton from '../TaskMobileBackButton';
import ToolTabSwitcher from '../docs/ToolTabSwitcher';
import { TASK_CARD, TASK_INPUT } from '../taskActionStyles';

const fieldClass = TASK_INPUT;
const cardClass = TASK_CARD;

export function CoordInput({ id, label, value, onChange, list }) {
  return (
    <label className="flex flex-col gap-1 text-xs font-medium font-['Manrope']">
      {label}
      <input
        id={id}
        list={list}
        className={fieldClass}
        type="number"
        step="any"
        value={value}
        onChange={onChange}
      />
    </label>
  );
}

export default function SimpleGeodeticLayout({
  title,
  toolPath,
  seo,
  language,
  children,
  resultText,
  onCalculate,
  onReset,
  isValid,
  sketch,
  docsExtra,
}) {
  const bg = language === 'bg';

  return (
    <>
      <SEO title={seo?.title || title} description={seo?.description || ''} canonical={toolPath} />
      <Layout>
        <div className="w-full bg-stone-50 dark:bg-zinc-950 py-6 md:py-10 min-h-screen">
          <div className="max-w-3xl mx-auto px-4 flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <TaskMobileBackButton />
              <h1 className="text-2xl md:text-3xl font-bold font-['Manrope'] text-black dark:text-white">{title}</h1>
            </div>
            <ToolTabSwitcher toolPath={toolPath} active="tool" />

            <div className={`${cardClass} flex flex-col gap-4`}>
              <h2 className="font-semibold font-['Manrope']">{bg ? 'Входни данни' : 'Input'}</h2>
              {children}
              <TaskActionBar onCalculate={onCalculate} onReset={onReset} calculateDisabled={!isValid} />
            </div>

            {sketch}

            <div className={`${cardClass} flex flex-col gap-2`}>
              <h2 className="font-semibold font-['Manrope']">{bg ? 'Резултат' : 'Result'}</h2>
              <pre className="text-xs md:text-sm font-mono whitespace-pre-wrap text-neutral-700 dark:text-zinc-300 leading-relaxed">
                {resultText}
              </pre>
            </div>

            {docsExtra && (
              <p className="text-sm font-['Manrope']">
                <Link to={`${toolPath}/docs`} className="underline font-semibold">
                  {bg ? 'Документация →' : 'Documentation →'}
                </Link>
              </p>
            )}
          </div>
        </div>
      </Layout>
    </>
  );
}
