import React from "react";
import Layout from '../../layout/Layout';
import SEO from '../../shared/SEO';

const features = [
  {
    title: "Бърза и сигурна проверка на задачи",
    desc: "Проверявайте решенията на учениците за секунди. GeoSolver елиминира риска от човешка грешка с до 99.9% точност."
  },
  {
    title: "Създаване на примерни задачи и тестове",
    desc: "Генерирайте и споделяйте задачи за класна и домашна работа с няколко клика."
  },
  {
    title: "Анализ на грешки и автоматични обяснения",
    desc: "Получавайте подробен анализ на всяка стъпка и автоматични обяснения за допуснати грешки."
  },
  {
    title: "Пълна документация на всяка задача",
    desc: "Всяка задача е придружена с подробна документация, примери и обяснения за методите на решаване."
  },
  {
    title: "Поверителност и сигурност",
    desc: "Данните на вас и вашите ученици са защитени с най-високо ниво на сигурност."
  },
  {
    title: "Постоянна поддръжка и обучение",
    desc: "Получавате достъп до специализирана поддръжка и обучения за работа с платформата."
  },
  {
    title: "Достъп до нови функционалности",
    desc: "Учителите получават ранен достъп до нови инструменти и възможности."
  },
  {
    title: "Скоро: Сканиране на задачи от снимка",
    desc: "Планираме възможност за директно качване и автоматично разпознаване на задачи чрез снимка. Това ще ускори проверките с до 70% и ще спести ценно време."
  }
];

const ForTeachers = () => {
  return (
    <>
      <SEO
        title="За преподаватели"
        description="GeoSolver предоставя на учителите по геодезия в България безплатен достъп до професионални инструменти за проверка, анализ и създаване на задачи. Бързо, сигурно и модерно образование!"
        keywords="геодезия, образование, учители, преподаватели, безплатно, GeoSolver, дигитални инструменти, проверка на задачи, сканиране, класна стая, обучение"
        canonical="/for-teachers"
      />
      <Layout>
        <div className="w-full flex justify-center bg-stone-50 min-h-screen py-8 px-2 md:px-0">
          <div className="w-full max-w-[900px] flex flex-col gap-8">
            <div className="flex flex-col gap-4">
              <h1 className="text-black text-xl md:text-2xl font-bold font-['Manrope'] mb-1">За преподаватели</h1>
              <div className="bg-white rounded-xl border border-gray-200 p-6 md:p-8 flex flex-col gap-8 shadow-sm">
                <div className="flex flex-col gap-3">
                <h2 className="text-base md:text-lg font-bold text-black font-['Manrope'] mb-2 text-center">Вашият дигитален асистент в обучението по геодезия</h2>
                  <p className="text-base text-black font-['Manrope'] leading-relaxed">
                    GeoSolver предоставя на учителите по геодезия в България напълно безплатен достъп до всички професионални инструменти на платформата. Нашата мисия е да улесним преподаването, да повишим качеството на обучението и да спестим време на учителите чрез автоматизация и дигитализация на процеса по проверка и анализ на задачи.
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
                  <div className="text-base font-semibold text-blue-900 font-['Manrope']">Как да получите достъп?</div>
                  <div className="text-sm text-blue-900 font-['Manrope']">
                    Свържете се с нас чрез <b>формата за контакт</b> (от менюто <b>Контакти</b>) или ни пишете директно на <a href="mailto:team@geosolver.bg" className="text-blue-700 underline">team@geosolver.bg</a>.<br />
                    Ще ви съдействаме за бързо и лесно активиране на вашия безплатен преподавателски акаунт.
                  </div>
                </div>
                <div className="pt-3 text-center">
                  <span className="text-sm text-neutral-600 font-['Manrope']">Благодарим, че подкрепяте дигиталното образование по геодезия!</span>
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