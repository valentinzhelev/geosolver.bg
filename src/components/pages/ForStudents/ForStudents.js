import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../layout/Layout';
import SEO from '../../shared/SEO';
import { useTranslation } from '../../../hooks/useTranslation';
import { useAuth } from '../../auth/AuthContext';

const ForStudents = () => {
  const { language } = useTranslation();
  const { user } = useAuth();
  const bg = language === 'bg';

  return (
    <>
      <SEO
        title={bg ? 'За ученици' : 'For students'}
        description={
          bg
            ? 'GeoSolver Edu — предаване на домашни, код от преподавателя, калкулатор само когато е разрешен.'
            : 'GeoSolver Edu — submit homework, join with a code, calculator only when allowed.'
        }
        canonical="/for-students"
      />
      <Layout>
        <div className="w-full flex justify-center bg-stone-50 dark:bg-zinc-950 min-h-screen py-8 px-4">
          <div className="w-full max-w-[900px] flex flex-col gap-8">
            <h1 className="text-2xl font-bold font-['Manrope'] text-black dark:text-white">
              {bg ? 'GeoSolver за ученици' : 'GeoSolver for students'}
            </h1>

            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-700 p-6 md:p-8 flex flex-col gap-6 shadow-sm">
              <p className="text-sm text-neutral-700 dark:text-zinc-300 font-['Manrope'] leading-relaxed">
                {bg
                  ? 'В училище използвате GeoSolver Edu: преподавателят ви дава код на група, вие виждате заданията и предавате отговори. Калкулаторът на сайта се ползва само ако за конкретното задание е разрешено — иначе решавате на тетрадка и въвеждате крайните стойности.'
                  : 'At school you use GeoSolver Edu: your teacher gives a group code, you see assignments and submit answers. The site calculator is only for assignments where your teacher allows it — otherwise solve on paper and enter final values.'}
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-stone-50 dark:bg-zinc-800 border border-stone-100 dark:border-zinc-700">
                  <h2 className="font-bold font-['Manrope'] text-black dark:text-white mb-2">
                    {bg ? 'Безплатно в клас' : 'Free in class'}
                  </h2>
                  <p className="text-sm text-neutral-600 dark:text-zinc-400 font-['Manrope']">
                    {bg
                      ? 'Предаванията в classroom не изискват Pro. Изчисленията в рамките на разрешено задание не влизат в лимита 5/5 за свободно ползване на инструментите.'
                      : 'Classroom submissions do not require Pro. Calculations within an allowed assignment do not count toward the 5/5 free limit on tools.'}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-stone-50 dark:bg-zinc-800 border border-stone-100 dark:border-zinc-700">
                  <h2 className="font-bold font-['Manrope'] text-black dark:text-white mb-2">
                    {bg ? 'Самостоятелна практика' : 'Self-study'}
                  </h2>
                  <p className="text-sm text-neutral-600 dark:text-zinc-400 font-['Manrope']">
                    {bg
                      ? 'Извън задание от учител — обикновените калкулатори с лимит 5 изчисления или Pro абонамент.'
                      : 'Outside teacher assignments — standard tools with 5 free calculations or a Pro subscription.'}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {user ? (
                  <Link
                    to="/classroom/assignments"
                    className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg text-sm font-medium"
                  >
                    {bg ? 'Моите задания' : 'My assignments'}
                  </Link>
                ) : (
                  <Link
                    to="/register"
                    className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg text-sm font-medium"
                  >
                    {bg ? 'Регистрация' : 'Register'}
                  </Link>
                )}
                <Link
                  to="/classroom/join"
                  className="px-4 py-2 rounded-lg outline outline-1 outline-gray-200 dark:outline-zinc-700 text-sm font-medium"
                >
                  {bg ? 'Присъедини се с код' : 'Join with code'}
                </Link>
                <Link to="/tools" className="px-4 py-2 text-sm text-neutral-600 underline">
                  {bg ? 'Инструменти (свободно)' : 'Tools (self-study)'}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default ForStudents;
