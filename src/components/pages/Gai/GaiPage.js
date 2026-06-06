import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../layout/Layout';
import SEO from '../../shared/SEO';
import { useTranslation } from '../../../hooks/useTranslation';

/** Same visual language as the BETA pill in the header */
const GaiBadge = ({ tone = 'default' }) => (
  <span
    className={`px-3 py-1 rounded inline-flex items-center shrink-0 ${
      tone === 'light'
        ? 'bg-white/15 backdrop-blur-sm'
        : 'bg-gray-200 dark:bg-zinc-900'
    }`}
  >
    <span
      className={`text-xs font-bold font-['Manrope'] ${
        tone === 'light' ? 'text-white' : 'text-black dark:text-white'
      }`}
    >
      GAI
    </span>
  </span>
);

const FeatureIcon = ({ index }) => {
  const paths = [
    'M9 12l2 2 4-4', // check (result per field)
    'M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z', // warning (typical errors)
    'M3 3v18h18M7 14l4-4 3 3 5-6', // chart (class view)
    'M4 6h16M4 12h16M4 18h10', // tasks (four tasks)
  ];
  return (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path d={paths[index % paths.length]} />
    </svg>
  );
};

const GaiPage = () => {
  const { t, language } = useTranslation();
  const bg = language === 'bg';

  const features = t.gaiFeatures || [];
  const howSteps = t.gaiHowSteps || [];
  const studentPoints = t.gaiForStudentsPoints || [];
  const teacherPoints = t.gaiForTeachersPoints || [];

  const [activeStep, setActiveStep] = useState(0);
  const [audience, setAudience] = useState('students');

  const audienceData =
    audience === 'students'
      ? {
          title: t.gaiForStudentsTitle,
          intro: t.gaiForStudentsIntro,
          points: studentPoints,
          cta: t.gaiCtaStudents,
          to: '/for-students',
        }
      : {
          title: t.gaiForTeachersTitle,
          intro: t.gaiForTeachersIntro,
          points: teacherPoints,
          cta: t.gaiCtaTeachers,
          to: '/for-teachers',
        };

  const taskChips = bg
    ? ['Първа основна', 'Втора основна', 'Права засечка', 'Обратна засечка']
    : ['First task', 'Second task', 'Forward intersection', 'Resection'];

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
          <div className="w-full max-w-[1180px] mx-auto px-4 lg:px-6 pt-6 lg:pt-16 pb-12 flex flex-col gap-10 lg:gap-16">
            {/* Hero */}
            <section className="relative overflow-hidden rounded-2xl">
              <img
                src="/images/gradient_wallpaper.jpg"
                alt=""
                aria-hidden
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/45" />
              <div className="relative z-10 px-5 py-10 sm:px-10 sm:py-14 lg:px-14 lg:py-16 flex flex-col gap-4 max-w-[760px]">
                <div className="flex flex-wrap items-center gap-3 animate-gai-fade-up">
                  <h1 className="text-white text-3xl lg:text-5xl font-bold font-['Manrope'] tracking-tight">
                    {t.gaiTitle}
                  </h1>
                  <GaiBadge tone="light" />
                </div>
                <p
                  className="text-white/90 text-base lg:text-xl font-semibold font-['Manrope'] animate-gai-fade-up"
                  style={{ animationDelay: '60ms' }}
                >
                  {t.gaiHeadline}
                </p>
                <p
                  className="text-white/80 text-sm lg:text-base font-['Manrope'] leading-relaxed animate-gai-fade-up"
                  style={{ animationDelay: '120ms' }}
                >
                  {t.gaiIntro}
                </p>
                <div
                  className="flex flex-wrap gap-2 mt-1 animate-gai-fade-up"
                  style={{ animationDelay: '180ms' }}
                >
                  {taskChips.map((chip) => (
                    <span
                      key={chip}
                      className="px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-sm text-white text-xs font-medium font-['Manrope'] border border-white/20"
                    >
                      {chip}
                    </span>
                  ))}
                </div>
                <p
                  className="text-white/55 text-xs font-['Manrope'] mt-1 animate-gai-fade-up"
                  style={{ animationDelay: '220ms' }}
                >
                  {t.gaiAcronymNote}
                </p>
              </div>
            </section>

            {/* Features */}
            <section className="flex flex-col gap-5">
              <h2 className="text-black dark:text-white text-lg lg:text-xl font-bold font-['Manrope']">
                {bg ? 'Какво прави GAI' : 'What GAI does'}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {features.map((f, i) => (
                  <div
                    key={i}
                    className="group relative p-5 lg:p-6 bg-white dark:bg-zinc-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-700 flex flex-col gap-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:outline-gray-400 dark:hover:outline-zinc-500"
                  >
                    <span className="pointer-events-none absolute inset-x-0 top-0 h-0.5 rounded-t-xl bg-gradient-to-r from-transparent via-black/30 dark:via-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="flex items-center gap-3">
                      <span className="shrink-0 w-10 h-10 rounded-xl bg-stone-100 dark:bg-zinc-800 text-black dark:text-white flex items-center justify-center transition-colors duration-300 group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black">
                        <FeatureIcon index={i} />
                      </span>
                      <h3 className="text-black dark:text-white text-base font-semibold font-['Manrope']">
                        {f.title}
                      </h3>
                    </div>
                    <p className="text-neutral-600 dark:text-zinc-400 text-sm font-['Manrope'] leading-relaxed">
                      {f.desc}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* How it works — interactive stepper */}
            <section className="flex flex-col gap-5">
              <h2 className="text-black dark:text-white text-lg lg:text-xl font-bold font-['Manrope']">
                {t.gaiHowTitle}
              </h2>

              <div className="p-5 lg:p-8 bg-white dark:bg-zinc-900 rounded-2xl outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-700">
                {/* Stepper nav */}
                <ol className="relative flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-2 list-none p-0 m-0">
                  <span
                    aria-hidden
                    className="hidden sm:block absolute left-8 right-8 top-5 h-px bg-stone-200 dark:bg-zinc-700"
                  />
                  {howSteps.map((step, i) => {
                    const isActive = i === activeStep;
                    return (
                      <li key={i} className="relative z-10 sm:flex-1 sm:flex sm:flex-col sm:items-center">
                        <button
                          type="button"
                          onClick={() => setActiveStep(i)}
                          aria-pressed={isActive}
                          className="flex sm:flex-col items-center gap-3 sm:gap-2 w-full sm:w-auto text-left sm:text-center group"
                        >
                          <span
                            className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold font-['Manrope'] border-2 transition-all duration-300 ${
                              isActive
                                ? 'bg-black text-white border-black shadow-md ring-4 ring-black/10 dark:bg-white dark:text-black dark:border-white dark:ring-white/15'
                                : 'bg-white text-neutral-500 border-stone-300 group-hover:border-stone-400 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-600 dark:group-hover:border-zinc-500'
                            }`}
                          >
                            {i + 1}
                          </span>
                          <span
                            className={`text-xs font-semibold font-['Manrope'] sm:max-w-[10rem] transition-colors duration-300 ${
                              isActive
                                ? 'text-black dark:text-white'
                                : 'text-neutral-400 dark:text-zinc-500 group-hover:text-neutral-600 dark:group-hover:text-zinc-300'
                            }`}
                          >
                            {bg ? `Стъпка ${i + 1}` : `Step ${i + 1}`}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ol>

                {/* Active step detail */}
                <div
                  key={activeStep}
                  className="mt-6 pt-6 border-t border-stone-100 dark:border-zinc-800 animate-gai-fade-up"
                >
                  <div className="flex items-start gap-4 max-w-3xl">
                    <span className="shrink-0 w-9 h-9 rounded-lg bg-black text-white dark:bg-white dark:text-black flex items-center justify-center text-sm font-bold font-['Manrope']">
                      {activeStep + 1}
                    </span>
                    <p className="text-neutral-700 dark:text-zinc-200 text-sm lg:text-base font-['Manrope'] leading-relaxed pt-1">
                      {howSteps[activeStep]}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Audience switcher */}
            <section className="flex flex-col gap-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-black dark:text-white text-lg lg:text-xl font-bold font-['Manrope']">
                  {bg ? 'За кого е' : 'Who it is for'}
                </h2>
                <div className="inline-flex p-1 rounded-xl bg-stone-100 dark:bg-zinc-800">
                  {[
                    { id: 'students', label: bg ? 'Ученик' : 'Student' },
                    { id: 'teachers', label: bg ? 'Преподавател' : 'Teacher' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setAudience(tab.id)}
                      aria-pressed={audience === tab.id}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold font-['Manrope'] transition-all duration-300 ${
                        audience === tab.id
                          ? 'bg-white dark:bg-zinc-950 text-black dark:text-white shadow-sm'
                          : 'text-neutral-500 dark:text-zinc-400 hover:text-black dark:hover:text-white'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <div
                key={audience}
                className="p-6 lg:p-8 bg-white dark:bg-zinc-900 rounded-2xl outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-700 flex flex-col gap-5 animate-gai-pop"
              >
                <div className="flex flex-col gap-2">
                  <h3 className="text-black dark:text-white text-xl font-semibold font-['Manrope']">
                    {audienceData.title}
                  </h3>
                  <p className="text-sm lg:text-base text-neutral-700 dark:text-zinc-300 font-['Manrope'] leading-relaxed max-w-3xl">
                    {audienceData.intro}
                  </p>
                </div>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {audienceData.points.map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 px-4 py-3 bg-stone-50 dark:bg-zinc-800 rounded-lg"
                    >
                      <svg
                        className="shrink-0 w-4 h-4 mt-0.5 text-black dark:text-white"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2.5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        viewBox="0 0 24 24"
                        aria-hidden
                      >
                        <path d="M5 12l5 5L20 7" />
                      </svg>
                      <span className="text-sm font-medium font-['Manrope'] text-black dark:text-zinc-200">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
                <Link
                  to={audienceData.to}
                  className="w-fit inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-black dark:bg-white text-white dark:text-black text-sm font-semibold font-['Manrope'] hover:opacity-90 transition-opacity"
                >
                  {audienceData.cta}
                  <span aria-hidden>→</span>
                </Link>
              </div>
            </section>

            {/* Limits */}
            <section className="relative p-5 lg:p-6 bg-white dark:bg-zinc-900 rounded-2xl outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-700 flex items-start gap-4 max-w-[760px]">
              <span className="shrink-0 w-10 h-10 rounded-xl bg-stone-100 dark:bg-zinc-800 text-black dark:text-white flex items-center justify-center">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  viewBox="0 0 24 24"
                  aria-hidden
                >
                  <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
              </span>
              <div className="flex flex-col gap-1.5">
                <h2 className="text-black dark:text-white text-base font-bold font-['Manrope']">
                  {t.gaiLimitsTitle}
                </h2>
                <p className="text-sm text-neutral-700 dark:text-zinc-300 font-['Manrope'] leading-relaxed">
                  {t.gaiLimitsText}
                </p>
              </div>
            </section>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default GaiPage;
