import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../layout/Layout';
import SEO from '../../shared/SEO';
import { useTranslation } from '../../../hooks/useTranslation';

const AboutPage = () => {
  const { t } = useTranslation();
  const ap = t.aboutPage || {};
  const focusAreas = ap.focusAreas || [];
  const values = ap.values || [];

  return (
    <>
      <SEO
        title={ap.seoTitle}
        description={ap.seoDescription}
        keywords="GeoSolver, Wortexa, за нас, геодезия, образование, дигитализация, about us, geodesy"
        canonical="/about"
      />
      <Layout>
        <div className="w-full min-h-screen bg-stone-50 dark:bg-zinc-950 transition-colors">
          <div className="w-full max-w-[1180px] mx-auto px-4 lg:px-6 pt-6 lg:pt-16 pb-12 flex flex-col gap-10 lg:gap-14">
            <div className="max-w-[640px] flex flex-col gap-2">
              <h1 className="text-black dark:text-white text-2xl lg:text-3xl font-bold font-['Manrope']">
                {ap.title}
              </h1>
              <p className="text-neutral-500 dark:text-zinc-400 text-sm lg:text-base font-semibold font-['Manrope']">
                {ap.headline}
              </p>
              <p className="text-neutral-700 dark:text-zinc-300 text-sm lg:text-base font-['Manrope'] leading-relaxed mt-1">
                {ap.intro}
              </p>
            </div>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 lg:p-5 bg-white dark:bg-zinc-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-700 flex flex-col gap-2 transition-colors">
                <h2 className="text-black dark:text-white text-base font-semibold font-['Manrope']">
                  {ap.missionTitle}
                </h2>
                <p className="text-neutral-600 dark:text-zinc-400 text-sm font-['Manrope'] leading-relaxed">
                  {ap.missionText}
                </p>
              </div>
              <div className="p-4 lg:p-5 bg-white dark:bg-zinc-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-700 flex flex-col gap-2 transition-colors">
                <h2 className="text-black dark:text-white text-base font-semibold font-['Manrope']">
                  {ap.companyTitle}
                </h2>
                <p className="text-neutral-600 dark:text-zinc-400 text-sm font-['Manrope'] leading-relaxed">
                  {ap.companyTextBefore}
                  <a
                    href="https://wortexa.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-black dark:text-white font-semibold underline underline-offset-2 hover:opacity-80"
                  >
                    {ap.companyLinkLabel || 'Wortexa'}
                  </a>
                  {ap.companyTextAfter}
                </p>
              </div>
            </section>

            <section className="flex flex-col gap-4">
              <h2 className="text-black dark:text-white text-lg font-bold font-['Manrope']">
                {ap.focusTitle}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {focusAreas.map((item) => (
                  <div
                    key={item.title}
                    className="p-4 lg:p-5 bg-white dark:bg-zinc-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-700 flex flex-col gap-2 transition-colors"
                  >
                    <h3 className="text-black dark:text-white text-base font-semibold font-['Manrope']">
                      {item.title}
                    </h3>
                    <p className="text-neutral-600 dark:text-zinc-400 text-sm font-['Manrope'] leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section className="flex flex-col gap-4">
              <h2 className="text-black dark:text-white text-lg font-bold font-['Manrope']">
                {ap.valuesTitle}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {values.map((item) => (
                  <div
                    key={item.title}
                    className="p-4 lg:p-5 bg-white dark:bg-zinc-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-700 flex flex-col gap-2 transition-colors"
                  >
                    <h3 className="text-black dark:text-white text-base font-semibold font-['Manrope']">
                      {item.title}
                    </h3>
                    <p className="text-neutral-600 dark:text-zinc-400 text-sm font-['Manrope'] leading-relaxed">
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section className="flex flex-col gap-3">
              <h2 className="text-black dark:text-white text-lg font-bold font-['Manrope']">
                {ap.ctaTitle}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <Link
                  to="/for-teachers"
                  className="p-4 bg-white dark:bg-zinc-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-700 flex justify-between items-center hover:shadow-md transition-shadow"
                >
                  <span className="text-black dark:text-white text-sm font-semibold font-['Manrope']">
                    {ap.ctaTeachers}
                  </span>
                  <img src="/icons/hero_buttons_arrow.svg" alt="" className="w-2 h-3 dark:invert" />
                </Link>
                <Link
                  to="/for-students"
                  className="p-4 bg-white dark:bg-zinc-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-700 flex justify-between items-center hover:shadow-md transition-shadow"
                >
                  <span className="text-black dark:text-white text-sm font-semibold font-['Manrope']">
                    {ap.ctaStudents}
                  </span>
                  <img src="/icons/hero_buttons_arrow.svg" alt="" className="w-2 h-3 dark:invert" />
                </Link>
                <Link
                  to="/contacts"
                  className="p-4 bg-black dark:bg-white rounded-xl flex justify-between items-center hover:opacity-90 transition-opacity"
                >
                  <span className="text-white dark:text-black text-sm font-semibold font-['Manrope']">
                    {ap.ctaContact}
                  </span>
                  <img src="/icons/homepage_arrow_icon.svg" alt="" className="w-2 h-3" />
                </Link>
              </div>
            </section>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default AboutPage;
