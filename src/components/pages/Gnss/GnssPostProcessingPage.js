import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../layout/Layout';
import SEO from '../../shared/SEO';
import { useTranslation } from '../../../hooks/useTranslation';

const STEPS = {
  bg: [
    {
      title: '1. Запис на терен',
      body: 'Статична база + rover или RTK сесия. Export RINEX (.obs) или raw от приемника.',
      tools: [{ to: '/gnss', label: 'GNSS import' }, { to: '/gnss/live', label: 'NMEA live' }],
    },
    {
      title: '2. Обработка (външен софтуер)',
      body: 'RTKLib, Leica Infinity, Trimble Business Center или Emlid Studio — PPP/PPK/RTK решение.',
      tools: [],
    },
    {
      title: '3. Контрол на качеството',
      body: 'Провери fix type, RMS, baseline length, antenna height и системата (ETRS89 / BGS2005).',
      tools: [{ to: '/coordinate-transformation/docs', label: 'Трансформация' }],
    },
    {
      title: '4. Export координати',
      body: 'CSV с име, Y, X, H от office софтуера — стандартен обмен с GeoSolver.',
      tools: [{ to: '/gnss', label: 'GNSS import' }],
    },
    {
      title: '5. Проект и карта',
      body: 'Свържи точките с обект, визуализирай на картата и използвай в калкулатори.',
      tools: [
        { to: '/points', label: 'Точки' },
        { to: '/map', label: 'Карта' },
        { to: '/projects', label: 'Проекти' },
      ],
    },
  ],
  en: [
    {
      title: '1. Field record',
      body: 'Static base + rover or RTK session. Export RINEX (.obs) or raw from receiver.',
      tools: [{ to: '/gnss', label: 'GNSS import' }, { to: '/gnss/live', label: 'NMEA live' }],
    },
    {
      title: '2. Processing (external software)',
      body: 'RTKLib, Leica Infinity, Trimble Business Center or Emlid Studio — PPP/PPK/RTK solution.',
      tools: [],
    },
    {
      title: '3. Quality control',
      body: 'Check fix type, RMS, baseline length, antenna height and system (ETRS89 / BGS2005).',
      tools: [{ to: '/coordinate-transformation/docs', label: 'Transformation' }],
    },
    {
      title: '4. Coordinate export',
      body: 'CSV with name, Y, X, H from office software — standard exchange with GeoSolver.',
      tools: [{ to: '/gnss', label: 'GNSS import' }],
    },
    {
      title: '5. Project and map',
      body: 'Link points to a site, visualize on map and use in calculators.',
      tools: [
        { to: '/points', label: 'Points' },
        { to: '/map', label: 'Map' },
        { to: '/projects', label: 'Projects' },
      ],
    },
  ],
};

const btnGhost =
  "px-3 py-2 rounded-lg outline outline-1 outline-gray-200 dark:outline-zinc-700 text-sm font-semibold font-['Manrope']";

const GnssPostProcessingPage = () => {
  const { language } = useTranslation();
  const bg = language === 'bg';
  const steps = STEPS[bg ? 'bg' : 'en'];

  return (
    <>
      <SEO
        title={bg ? 'GNSS post-processing – GeoSolver' : 'GNSS post-processing – GeoSolver'}
        description={
          bg
            ? 'Учебен workflow за обработка на GNSS измервания'
            : 'Educational workflow for GNSS measurement processing'
        }
        canonical="/gnss/post-process"
      />
      <Layout>
        <div className="w-full bg-stone-50 dark:bg-zinc-950 py-8 md:py-10">
          <div className="max-w-[900px] mx-auto px-4 flex flex-col gap-6">
            <div>
              <div className="text-neutral-400 text-sm font-['Manrope'] mb-1">
                <Link to="/tools" className="underline">{bg ? 'Инструменти' : 'Tools'}</Link>
                {' > '}
                <Link to="/gnss" className="underline">GNSS</Link>
                {' > '}
                {bg ? 'Post-processing' : 'Post-processing'}
              </div>
              <h1 className="text-2xl md:text-3xl font-bold font-['Manrope'] text-black dark:text-white">
                {bg ? 'GNSS post-processing workflow' : 'GNSS post-processing workflow'}
              </h1>
              <p className="text-neutral-500 text-sm font-['Manrope'] mt-2 leading-relaxed">
                {bg
                  ? 'Продуктово решение: GeoSolver не вгражда RTK/PPK engine. Този модул е учебен workflow — обработката се прави във външен office софтуер, а GeoSolver приема готовите координати (CSV) и ги управлява в точки, карта и проекти.'
                  : 'Product decision: GeoSolver does not embed an RTK/PPK engine. This module is an educational workflow — processing happens in external office software; GeoSolver accepts finished coordinates (CSV) and manages them in points, map and projects.'}
              </p>
            </div>

            <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 text-sm font-['Manrope']">
              {bg
                ? 'Пълна RTK/PPK обработка се прави в специализиран софтуер. Тук учиш стъпките и проверяваш резултата в библиотеката точки и на картата.'
                : 'Full RTK/PPK processing runs in specialized software. Here you learn the steps and verify results in the points library and map.'}
            </div>

            <div className="flex flex-wrap gap-2">
              <Link to="/gnss" className={btnGhost}>{bg ? '← GNSS import' : '← GNSS import'}</Link>
              <Link to="/gnss/live" className={btnGhost}>NMEA live</Link>
              <Link to="/integrations" className={btnGhost}>API</Link>
            </div>

            <div className="flex flex-col gap-3">
              {steps.map((step) => (
                <div
                  key={step.title}
                  className="p-4 bg-white dark:bg-zinc-900 rounded-xl outline outline-1 outline-gray-200 dark:outline-zinc-800"
                >
                  <h2 className="font-semibold font-['Manrope'] text-black dark:text-white">{step.title}</h2>
                  <p className="text-sm text-neutral-600 dark:text-zinc-400 font-['Manrope'] mt-1 leading-relaxed">
                    {step.body}
                  </p>
                  {step.tools.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {step.tools.map((t) => (
                        <Link
                          key={t.to}
                          to={t.to}
                          className="text-sm font-semibold underline font-['Manrope'] text-black dark:text-white"
                        >
                          {t.label} →
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl outline outline-1 outline-gray-200 dark:outline-zinc-800">
              <h2 className="font-semibold font-['Manrope'] mb-2">
                {bg ? 'RINEX header в GeoSolver' : 'RINEX header in GeoSolver'}
              </h2>
              <p className="text-sm text-neutral-600 dark:text-zinc-400 font-['Manrope'] leading-relaxed">
                {bg
                  ? 'При import на .obs файл виждаш APPROX POSITION, маркер и време — същата информация, с която започваш обработката в RTKLib. След решение export-ваш CSV и го внасяш обратно.'
                  : 'When importing .obs you see APPROX POSITION, marker and time — the same info you start processing with in RTKLib. After the solution, export CSV and import back.'}
              </p>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default GnssPostProcessingPage;
