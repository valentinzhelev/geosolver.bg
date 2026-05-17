import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Layout from '../../layout/Layout';
import SEO from '../../shared/SEO';
import { useTranslation } from '../../../hooks/useTranslation';
import { normalizeToolRoute, POST_MVP_TOOL_LABELS } from '../../../config/toolsConfig';

const ToolComingSoon = () => {
  const { language } = useTranslation();
  const { pathname } = useLocation();
  const route = normalizeToolRoute(pathname);
  const labels = POST_MVP_TOOL_LABELS[route];
  const toolName = labels
    ? labels[language] || labels.en
    : language === 'bg'
      ? 'Инструмент'
      : 'Tool';

  return (
    <>
      <SEO
        title={
          language === 'bg'
            ? `${toolName} – скоро в GeoSolver`
            : `${toolName} – coming soon to GeoSolver`
        }
        description={
          language === 'bg'
            ? 'Този инструмент ще бъде достъпен в следваща версия на GeoSolver. Използвайте четирите основни калкулатора за геодезия.'
            : 'This tool will be available in a future GeoSolver release. Use our four core geodetic calculators in the meantime.'
        }
        canonical={pathname}
      />
      <Layout>
        <div className="w-full bg-stone-50 dark:bg-zinc-950 py-12 md:py-16 pb-10 md:pb-14">
          <div className="max-w-lg mx-auto px-4 text-center flex flex-col items-center gap-6">
            <div className="text-black dark:text-white text-2xl md:text-3xl font-bold font-['Manrope']">
              {language === 'bg' ? 'Очаквайте скоро' : 'Coming soon'}
            </div>
            <p className="text-neutral-500 dark:text-neutral-400 text-sm md:text-base font-medium font-['Manrope']">
              {language === 'bg'
                ? `„${toolName}" е част от следващата версия на GeoSolver. Засега използвайте четирите основни инструмента за координатни изчисления и засечки.`
                : `"${toolName}" is planned for a future release. For now, use our four core tools for coordinate calculations and intersections.`}
            </p>
            <Link
              to="/tools"
              className="px-5 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-lg text-sm font-semibold font-['Manrope'] hover:opacity-90 transition"
            >
              {language === 'bg' ? 'Към инструментите' : 'Back to tools'}
            </Link>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default ToolComingSoon;
