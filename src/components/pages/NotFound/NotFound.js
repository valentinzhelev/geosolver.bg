import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../../shared/SEO';
import Layout from '../../layout/Layout';
import { useTranslation } from '../../../hooks/useTranslation';
import { useTheme } from '../../../context/ThemeContext';

const NotFound = () => {
  const { language } = useTranslation();
  const { isDark } = useTheme();
  const bg = language === 'bg';

  const links = [
    { to: '/', label: bg ? 'Начало' : 'Home' },
    { to: '/tools', label: bg ? 'Инструменти' : 'Tools' },
    { to: '/prices', label: bg ? 'Цени' : 'Pricing' },
    { to: '/contacts', label: bg ? 'Контакти' : 'Contacts' },
  ];

  return (
    <>
      <SEO title={bg ? 'Страницата не е намерена' : 'Page not found'} canonical="/404" />
      <Layout>
        <div className="w-full min-h-[70vh] bg-stone-50 dark:bg-zinc-950 flex items-center justify-center px-4">
          <div className="w-full max-w-md text-center flex flex-col items-center gap-5 py-16">
            <span
              className="text-7xl font-extrabold tracking-tight text-transparent bg-clip-text font-['Manrope']"
              style={{
                backgroundImage: isDark
                  ? 'linear-gradient(135deg, #fff 0%, #a1a1aa 100%)'
                  : 'linear-gradient(135deg, #000 0%, #555 100%)',
              }}
            >
              404
            </span>
            <h1 className="text-2xl font-bold text-black dark:text-white font-['Manrope']">
              {bg ? 'Страницата не е намерена' : 'Page not found'}
            </h1>
            <p className="text-sm leading-relaxed text-neutral-600 dark:text-zinc-400 font-['Manrope']">
              {bg
                ? 'Възможно е адресът да е грешен или страницата да е преместена.'
                : 'The address may be wrong or the page may have moved.'}
            </p>

            <Link
              to="/"
              className="mt-1 inline-flex items-center justify-center px-6 py-2.5 rounded-lg bg-black dark:bg-white text-white dark:text-black text-sm font-semibold font-['Manrope'] hover:bg-gray-800 dark:hover:bg-zinc-200 transition-colors"
            >
              {bg ? 'Към началото' : 'Back home'}
            </Link>

            <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
              {links.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className="text-sm text-neutral-500 dark:text-zinc-400 hover:text-black dark:hover:text-white font-['Manrope'] underline-offset-4 hover:underline"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default NotFound;
