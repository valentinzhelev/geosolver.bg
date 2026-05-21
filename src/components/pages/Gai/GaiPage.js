import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../layout/Layout';
import SEO from '../../shared/SEO';
import { useTranslation } from '../../../hooks/useTranslation';

/** Same visual language as the BETA pill in the header */
const GaiBadge = () => (
  <span className="px-3 py-1 bg-gray-200 dark:bg-zinc-900 rounded inline-flex items-center shrink-0">
    <span className="text-black dark:text-white text-xs font-bold font-['Manrope']">GAI</span>
  </span>
);

const GaiPage = () => {
  const { t } = useTranslation();
  const features = t.gaiFeatures || [];
  const howSteps = t.gaiHowSteps || [];
  const studentPoints = t.gaiForStudentsPoints || [];
  const teacherPoints = t.gaiForTeachersPoints || [];

  return (
    <>
      <SEO
        title={t.gaiTitle}
        description={t.gaiDescription}
        keywords="GAI, GeoSolver, геодезия, класна стая, обратна връзка, автоматична проверка"
        canonical="/gai"
      />
      <Layout>
        <div className="w-full min-h-screen bg-stone-50 dark:bg-zinc-950 transition-colors">
          <div className="w-full max-w-[1180px] mx-auto px-4 lg:px-6 pt-6 lg:pt-16 pb-12 flex flex-col gap-10 lg:gap-14">
            {/* Hero */}
            <div className="max-w-[720px] flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-black dark:text-white text-2xl lg:text-3xl font-bold font-['Manrope']">
                  {t.gaiTitle}
                </h1>
                <GaiBadge />
              </div>
              <p className="text-neutral-500 dark:text-zinc-400 text-sm lg:text-base font-semibold font-['Manrope']">
                {t.gaiHeadline}
              </p>
              <p className="text-neutral-700 dark:text-zinc-300 text-sm lg:text-base font-['Manrope'] leading-relaxed">
                {t.gaiIntro}
              </p>
              <p className="text-xs text-neutral-500 dark:text-zinc-500 font-['Manrope']">
                {t.gaiAcronymNote}
              </p>
            </div>

            {/* Features */}
            <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {features.map((f, i) => (
                <div
                  key={i}
                  className="p-4 lg:p-5 bg-white dark:bg-zinc-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-700 flex flex-col gap-2 transition-colors"
                >
                  <h2 className="text-black dark:text-white text-base font-semibold font-['Manrope']">
                    {f.title}
                  </h2>
                  <p className="text-neutral-600 dark:text-zinc-400 text-sm font-['Manrope'] leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              ))}
            </section>

            {/* How it works */}
            <section className="flex flex-col gap-4">
              <h2 className="text-black dark:text-white text-lg font-bold font-['Manrope']">
                {t.gaiHowTitle}
              </h2>
              <ol className="grid grid-cols-1 md:grid-cols-2 gap-3 list-none p-0 m-0">
                {howSteps.map((step, i) => (
                  <li
                    key={i}
                    className="flex gap-3 p-4 bg-white dark:bg-zinc-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-700 transition-colors"
                  >
                    <span className="shrink-0 w-7 h-7 rounded-full bg-stone-100 dark:bg-zinc-800 flex items-center justify-center text-sm font-bold font-['Manrope'] text-black dark:text-white">
                      {i + 1}
                    </span>
                    <span className="text-sm text-neutral-700 dark:text-zinc-300 font-['Manrope'] leading-relaxed pt-0.5">
                      {step}
                    </span>
                  </li>
                ))}
              </ol>
            </section>

            {/* Students / Teachers */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5">
              <div className="p-5 lg:p-6 bg-white dark:bg-zinc-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-700 flex flex-col gap-4 transition-colors">
                <h2 className="text-black dark:text-white text-lg font-semibold font-['Manrope']">
                  {t.gaiForStudentsTitle}
                </h2>
                <p className="text-sm text-neutral-700 dark:text-zinc-300 font-['Manrope'] leading-relaxed">
                  {t.gaiForStudentsIntro}
                </p>
                <ul className="flex flex-col gap-2">
                  {studentPoints.map((item, i) => (
                    <li
                      key={i}
                      className="px-3 py-2 bg-stone-50 dark:bg-zinc-800 rounded-lg text-sm font-medium font-['Manrope'] text-black dark:text-zinc-200"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/for-students"
                  className="mt-auto w-fit text-sm font-medium font-['Manrope'] text-black dark:text-white underline underline-offset-2 hover:opacity-80"
                >
                  {t.gaiCtaStudents} →
                </Link>
              </div>

              <div className="p-5 lg:p-6 bg-white dark:bg-zinc-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-700 flex flex-col gap-4 transition-colors">
                <h2 className="text-black dark:text-white text-lg font-semibold font-['Manrope']">
                  {t.gaiForTeachersTitle}
                </h2>
                <p className="text-sm text-neutral-700 dark:text-zinc-300 font-['Manrope'] leading-relaxed">
                  {t.gaiForTeachersIntro}
                </p>
                <ul className="flex flex-col gap-2">
                  {teacherPoints.map((item, i) => (
                    <li
                      key={i}
                      className="px-3 py-2 bg-stone-50 dark:bg-zinc-800 rounded-lg text-sm font-medium font-['Manrope'] text-black dark:text-zinc-200"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  to="/for-teachers"
                  className="mt-auto w-fit text-sm font-medium font-['Manrope'] text-black dark:text-white underline underline-offset-2 hover:opacity-80"
                >
                  {t.gaiCtaTeachers} →
                </Link>
              </div>
            </section>

            {/* Limits */}
            <section className="p-5 lg:p-6 bg-white dark:bg-zinc-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-700 flex flex-col gap-2 transition-colors max-w-[720px]">
              <h2 className="text-black dark:text-white text-base font-bold font-['Manrope']">
                {t.gaiLimitsTitle}
              </h2>
              <p className="text-sm text-neutral-700 dark:text-zinc-300 font-['Manrope'] leading-relaxed">
                {t.gaiLimitsText}
              </p>
            </section>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default GaiPage;
