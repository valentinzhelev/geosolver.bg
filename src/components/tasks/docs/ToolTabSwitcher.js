import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../../hooks/useTranslation';

/**
 * Instrument / Documentation tab bar — matches task tool pages (content-width, not full column).
 */
const ToolTabSwitcher = ({ toolPath, active }) => {
  const { t } = useTranslation();
  const docsPath = `${toolPath}/docs`;

  const tabBase =
    'px-3 py-1 rounded flex justify-center items-center gap-2.5 shrink-0';
  const labelBase = "text-base font-medium font-['Manrope']";

  return (
    <div className="p-1.5 bg-white dark:bg-zinc-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-800 inline-flex justify-start items-center gap-2 w-fit max-w-full">
      {active === 'instrument' ? (
        <div className={`${tabBase} bg-gray-200 dark:bg-zinc-700`}>
          <span className={`${labelBase} text-black dark:text-white`}>{t.instrument}</span>
        </div>
      ) : (
        <Link to={toolPath} className={`${tabBase} bg-white dark:bg-zinc-900`}>
          <span className={`${labelBase} text-neutral-400`}>{t.instrument}</span>
        </Link>
      )}
      {active === 'docs' ? (
        <div className={`${tabBase} bg-gray-200 dark:bg-zinc-700`}>
          <span className={`${labelBase} text-black dark:text-white`}>{t.documentation}</span>
        </div>
      ) : (
        <Link to={docsPath} className={`${tabBase} bg-white dark:bg-zinc-900`}>
          <span className={`${labelBase} text-neutral-400`}>{t.documentation}</span>
        </Link>
      )}
    </div>
  );
};

export default ToolTabSwitcher;
