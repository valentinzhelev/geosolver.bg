import React from "react";
import Layout from '../../layout/Layout';
import SEO from '../../shared/SEO';
import { useTranslation } from '../../../hooks/useTranslation';

const ForTeachers = () => {
  const { t } = useTranslation();
  const features = t.forTeachersFeatures || [];
  return (
    <>
      <SEO
        title={t.forTeachersTitle}
        description={t.forTeachersDescription}
        keywords="геодезия, образование, учители, преподаватели, безплатно, GeoSolver, дигитални инструменти, проверка на задачи, сканиране, класна стая, обучение"
        canonical="/for-teachers"
      />
      <Layout>
        <div className="w-full flex justify-center bg-stone-50 min-h-screen py-8 px-2 md:px-0">
          <div className="w-full max-w-[900px] flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              <h1 className="text-black text-xl md:text-2xl font-bold font-['Manrope'] mb-1">{t.forTeachersTitle}</h1>
              <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8 flex flex-col gap-8 shadow-sm">
                <div className="flex flex-col gap-3">
                <h2 className="text-base md:text-lg font-bold text-black font-['Manrope'] mb-2 text-center">{t.forTeachersHeadline}</h2>
                  <p className="text-base text-black font-['Manrope'] leading-relaxed">
                    {t.forTeachersIntro}
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {features.map((f, i) => (
                    <div key={i} className="flex flex-col gap-1 bg-stone-50 rounded-lg p-4 border border-stone-100 shadow-sm">
                      <div className="text-base font-bold text-black font-['Manrope'] mb-0.5">{f.title}</div>
                      <div className="text-sm text-neutral-700 font-['Manrope']">{f.desc}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-8 p-4 bg-blue-50 border-l-4 border-blue-400 rounded-xl flex flex-col gap-1">
                  <div className="text-base font-semibold text-blue-900 font-['Manrope']">{t.howToGetAccess}</div>
                  <div className="text-sm text-blue-900 font-['Manrope']">
                    {t.howToGetAccessText} <a href="mailto:team@geosolver.bg" className="text-blue-700 underline">team@geosolver.bg</a>.<br />
                    {t.howToGetAccessHelp}
                  </div>
                </div>
                <div className="pt-3 text-center">
                  <span className="text-sm text-neutral-600 font-['Manrope']">{t.thanksForSupport}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default ForTeachers; 