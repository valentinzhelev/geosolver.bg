import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../layout/Layout';
import SEO from '../../shared/SEO';
import { useTranslation } from '../../../hooks/useTranslation';
import API_BASE_URL from '../../../config/api';

const IntegrationsPage = () => {
  const { language } = useTranslation();
  const bg = language === 'bg';
  const base = API_BASE_URL.replace(/\/api\/?$/, '');

  const endpoints = [
    { method: 'GET', path: '/api/v1/me', desc: bg ? 'Информация за акаунта' : 'Account info' },
    { method: 'GET', path: '/api/v1/points', desc: bg ? 'Списък точки (филтър: projectId, layer, q)' : 'List points (filter: projectId, layer, q)' },
    { method: 'GET', path: '/api/v1/projects', desc: bg ? 'Списък проекти/обекти' : 'List sites/projects' },
    { method: 'GET', path: '/api/health', desc: bg ? 'Статус на API (публичен)' : 'API health (public)' },
  ];

  return (
    <>
      <SEO
        title={bg ? 'API и интеграции – GeoSolver' : 'API & integrations – GeoSolver'}
        description={bg ? 'REST API за точки и проекти' : 'REST API for points and projects'}
        canonical="/integrations"
      />
      <Layout>
        <div className="w-full bg-stone-50 dark:bg-zinc-950 py-8 md:py-10">
          <div className="max-w-[800px] mx-auto px-4 flex flex-col gap-6">
            <div>
              <div className="text-neutral-400 text-sm font-['Manrope'] mb-1">
                <Link to="/tools" className="underline">{bg ? 'Инструменти' : 'Tools'}</Link>
                {' > API'}
              </div>
              <h1 className="text-2xl md:text-3xl font-bold font-['Manrope'] text-black dark:text-white">
                {bg ? 'API и интеграции' : 'API & integrations'}
              </h1>
              <p className="text-neutral-500 text-sm font-['Manrope'] mt-2 leading-relaxed">
                {bg
                  ? 'REST достъп с JWT токен от входа. Подходящ за скриптове, Excel Power Query и фирмени интеграции.'
                  : 'REST access with JWT from login. Suitable for scripts, Excel Power Query and firm integrations.'}
              </p>
            </div>

            <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl outline outline-1 outline-gray-200 dark:outline-zinc-800">
              <h2 className="font-semibold font-['Manrope'] mb-2">{bg ? 'Автентикация' : 'Authentication'}</h2>
              <pre className="text-xs bg-stone-100 dark:bg-zinc-800 p-3 rounded-lg overflow-x-auto font-mono">
{`Authorization: Bearer <JWT от /api/auth/login>
Content-Type: application/json
Accept-Language: bg`}
              </pre>
              <p className="text-xs text-neutral-500 font-['Manrope'] mt-2">
                Base URL: <code className="text-black dark:text-white">{base}</code>
              </p>
            </div>

            <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl outline outline-1 outline-gray-200 dark:outline-zinc-800 overflow-x-auto">
              <h2 className="font-semibold font-['Manrope'] mb-3">{bg ? 'Endpoints (v1)' : 'Endpoints (v1)'}</h2>
              <table className="w-full text-sm font-['Manrope']">
                <thead>
                  <tr className="text-left border-b border-gray-200 dark:border-zinc-700">
                    <th className="py-2 pr-3">Method</th>
                    <th className="py-2 pr-3">Path</th>
                    <th className="py-2">{bg ? 'Описание' : 'Description'}</th>
                  </tr>
                </thead>
                <tbody>
                  {endpoints.map((e) => (
                    <tr key={e.path} className="border-b border-gray-100 dark:border-zinc-800">
                      <td className="py-2 pr-3 font-mono text-xs">{e.method}</td>
                      <td className="py-2 pr-3 font-mono text-xs">{e.path}</td>
                      <td className="py-2 text-neutral-600 dark:text-zinc-400">{e.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl outline outline-1 outline-gray-200 dark:outline-zinc-800">
              <h2 className="font-semibold font-['Manrope'] mb-2">{bg ? 'Export формати (UI)' : 'Export formats (UI)'}</h2>
              <ul className="text-sm text-neutral-600 dark:text-zinc-400 font-['Manrope'] space-y-1 list-disc pl-5">
                <li>CSV — точки, GNSS import</li>
                <li>GeoJSON / DXF — библиотека точки / карта</li>
                <li>PDF — карнет, клиентски отчет</li>
              </ul>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link to="/gnss/live" className="text-sm font-semibold underline font-['Manrope']">NMEA live →</Link>
              <Link to="/points" className="text-sm font-semibold underline font-['Manrope']">{bg ? 'Точки →' : 'Points →'}</Link>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default IntegrationsPage;
