import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../layout/Layout';
import SEO from '../../shared/SEO';
import { useTranslation } from '../../../hooks/useTranslation';
import { useAuth } from '../../auth/AuthContext';

const ForStudents = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const features = t.forStudentsFeatures || [];
  const steps = t.forStudentsSteps || [];

  return (
    <>
      <SEO
        title={t.forStudentsTitle}
        description={t.forStudentsDescription}
        keywords="геодезия, ученици, задания, класна стая, код за група, GeoSolver, GAI"
        canonical="/for-students"
      />
      <Layout>
        <div className="w-full min-h-screen bg-stone-50 dark:bg-zinc-950 transition-colors">
          <div className="w-full max-w-[1180px] mx-auto px-4 lg:px-6 pt-6 lg:pt-16 pb-12 flex flex-col gap-10 lg:gap-14">
            {/* Hero */}
            <div className="max-w-[640px] flex flex-col gap-2">
              <h1 className="text-black dark:text-white text-2xl lg:text-3xl font-bold font-['Manrope']">
                {t.forStudentsTitle}
              </h1>
              <p className="text-neutral-500 dark:text-zinc-400 text-sm lg:text-base font-semibold font-['Manrope']">
                {t.forStudentsHeadline}
              </p>
              <p className="text-neutral-700 dark:text-zinc-300 text-sm lg:text-base font-['Manrope'] leading-relaxed mt-1">
                {t.forStudentsIntro}
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

            {/* How to start */}
            <section className="flex flex-col gap-4">
              <h2 className="text-black dark:text-white text-lg font-bold font-['Manrope']">
                {t.forStudentsHowTitle}
              </h2>
              <ol className="grid grid-cols-1 md:grid-cols-2 gap-3 list-none p-0 m-0">
                {steps.map((step, i) => (
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

            {/* In class / Self-study */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5">
              <div className="p-5 lg:p-6 bg-white dark:bg-zinc-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-700 flex flex-col gap-3 transition-colors">
                <h2 className="text-black dark:text-white text-lg font-semibold font-['Manrope']">
                  {t.forStudentsInClassTitle}
                </h2>
                <p className="text-sm text-neutral-700 dark:text-zinc-300 font-['Manrope'] leading-relaxed">
                  {t.forStudentsInClassDesc}
                </p>
              </div>
              <div className="p-5 lg:p-6 bg-white dark:bg-zinc-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-700 flex flex-col gap-3 transition-colors">
                <h2 className="text-black dark:text-white text-lg font-semibold font-['Manrope']">
                  {t.forStudentsSelfStudyTitle}
                </h2>
                <p className="text-sm text-neutral-700 dark:text-zinc-300 font-['Manrope'] leading-relaxed">
                  {t.forStudentsSelfStudyDesc}
                </p>
              </div>
            </section>

            {/* Actions */}
            <section className="flex flex-col sm:flex-row flex-wrap items-start gap-3">
              <Link
                to="/classroom/join"
                className="px-4 py-2 bg-black dark:bg-white rounded-lg text-sm font-medium font-['Manrope'] text-white dark:text-black hover:opacity-90 transition-opacity"
              >
                {t.forStudentsJoinCta}
              </Link>
              {!user && (
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-700 text-sm font-medium font-['Manrope'] text-black dark:text-white hover:bg-stone-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  {t.forStudentsRegisterCta}
                </Link>
              )}
              <Link
                to="/tools"
                className="px-4 py-2 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-700 text-sm font-medium font-['Manrope'] text-black dark:text-white hover:bg-stone-50 dark:hover:bg-zinc-800 transition-colors"
              >
                {t.forStudentsToolsCta}
              </Link>
            </section>

            <section className="flex flex-wrap gap-4 text-sm font-['Manrope']">
              <Link
                to="/gai"
                className="text-neutral-600 dark:text-zinc-400 underline underline-offset-2 hover:text-black dark:hover:text-white transition-colors"
              >
                {t.forStudentsGaiLink}
              </Link>
              <Link
                to="/for-teachers"
                className="text-neutral-600 dark:text-zinc-400 underline underline-offset-2 hover:text-black dark:hover:text-white transition-colors"
              >
                {t.forStudentsTeachersLink}
              </Link>
            </section>

            {/* About */}
            <section className="p-5 lg:p-6 bg-white dark:bg-zinc-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-700 flex flex-col gap-3 transition-colors">
              <h2 className="text-black dark:text-white text-base font-bold font-['Manrope']">
                {t.forStudentsNoteTitle}
              </h2>
              <p className="text-sm text-neutral-700 dark:text-zinc-300 font-['Manrope'] leading-relaxed">
                {t.forStudentsNoteP1}
              </p>
              <p className="text-sm text-neutral-700 dark:text-zinc-300 font-['Manrope'] leading-relaxed">
                {t.forStudentsNoteP2}{' '}
                <Link
                  to="/contacts"
                  className="text-black dark:text-white font-medium underline underline-offset-2 hover:opacity-80"
                >
                  {t.howToGetAccessContact}
                </Link>
                .
              </p>
            </section>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default ForStudents;
