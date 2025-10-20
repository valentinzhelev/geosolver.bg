import React from 'react';
import Layout from '../layout/Layout';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';

const ForwardIntersectionDocs = () => {
  const { language } = useTranslation();

  return (
    <Layout>
      <div className="w-full min-h-screen bg-stone-50 flex flex-col items-center">
        <div className="w-[1180px] mt-8 mb-8 flex flex-col items-center">
          <div className="w-[1180px] inline-flex flex-col justify-start items-start gap-10">
            <div className="self-stretch flex flex-col justify-center items-start gap-10">
              <div className="w-[580px] flex flex-col justify-start items-start gap-4">
                <div className="flex flex-col justify-start items-start gap-1">
                  <div className="justify-start">
                    <span className="text-neutral-400 text-base font-medium font-['Manrope'] underline">
                      <Link to="/tools">{language === 'bg' ? 'Инструменти' : 'Tools'}</Link>
                    </span>
                    <span className="text-neutral-400 text-base font-medium font-['Manrope']">
                      {' > '}{language === 'bg' ? 'Напредна засечка' : 'Forward Intersection'}
                    </span>
                  </div>
                  <div className="justify-start text-black text-3xl font-bold font-['Manrope']">
                    {language === 'bg' ? 'Напредна засечка' : 'Forward Intersection'}
                  </div>
                </div>
                <div className="p-1.5 bg-white rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex justify-start items-center gap-2">
                  <div data-property-1="Default" className="px-3 py-1 bg-white rounded flex justify-center items-center gap-2.5">
                    <Link to="/forward-intersection" className="justify-start text-neutral-400 text-base font-medium font-['Manrope']">
                      {language === 'bg' ? 'Инструмент' : 'Tool'}
                    </Link>
                  </div>
                  <div data-property-1="Default" className="px-3 py-1 bg-gray-200 rounded flex justify-center items-center gap-2.5">
                    <div className="justify-start text-black text-base font-medium font-['Manrope']">
                      {language === 'bg' ? 'Документация' : 'Documentation'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="self-stretch p-4 bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 flex flex-col justify-start items-start gap-4">
                <div className="self-stretch flex flex-col gap-6">
                  {/* Theory Section */}
                  <section className="flex flex-col gap-4">
                    <h2 className="text-2xl font-semibold text-black border-b pb-1">
                      {language === 'bg' ? 'Теория' : 'Theory'}
                    </h2>
                    <p className="text-lg text-neutral-800">
                      {language === 'bg' 
                        ? 'Напредната засечка е геодезическа задача, при която се определят координатите на неизвестна точка чрез измерване на ъгли от две известни точки.'
                        : 'Forward intersection is a geodetic task where the coordinates of an unknown point are determined by measuring angles from two known points.'
                      }
                    </p>
                    <div className="bg-blue-50 border-l-4 border-blue-400 rounded p-4">
                      <h3 className="text-lg font-semibold text-black mb-2">
                        {language === 'bg' ? 'Условие на задачата' : 'Problem Statement'}
                      </h3>
                      <p className="text-base text-black">
                        {language === 'bg' 
                          ? 'Дадени са координатите на две точки A(X₁, Y₁) и B(X₂, Y₂) и измерените ъгли α и β от тези точки към неизвестната точка P. Търсят се координатите на точката P(Xₚ, Yₚ).'
                          : 'Given coordinates of two points A(X₁, Y₁) and B(X₂, Y₂) and measured angles α and β from these points to the unknown point P. Find coordinates of point P(Xₚ, Yₚ).'
                        }
                      </p>
                    </div>
                  </section>

                  {/* Formulas Section */}
                  <section className="flex flex-col gap-4">
                    <h2 className="text-2xl font-semibold text-black border-b pb-1">
                      {language === 'bg' ? 'Формули' : 'Formulas'}
                    </h2>
                    <div className="bg-gray-50 rounded-lg p-4 text-lg font-mono text-black flex flex-col gap-1">
                      <span>Xₚ = (X₁·cot(β) + X₂·cot(α) + Y₂ - Y₁) / (cot(α) + cot(β))</span>
                      <span>Yₚ = (Y₁·cot(β) + Y₂·cot(α) + X₁ - X₂) / (cot(α) + cot(β))</span>
                    </div>
                    <div className="text-sm text-neutral-700">
                      {language === 'bg' 
                        ? 'където α и β са измерените ъгли в радиани'
                        : 'where α and β are measured angles in radians'
                      }
                    </div>
                  </section>

                  {/* Graphical Illustration */}
                  <section className="flex flex-col gap-4">
                    <h2 className="text-2xl font-semibold text-black border-b pb-1">
                      {language === 'bg' ? 'Графична илюстрация' : 'Graphical Illustration'}
                    </h2>
                    <div className="flex justify-center">
                      <div className="w-full max-w-md bg-gray-100 rounded-lg p-4 text-center">
                        <p className="text-sm text-gray-600 mb-2">
                          {language === 'bg' ? 'Фиг. - Напредна засечка' : 'Fig. - Forward Intersection'}
                        </p>
                        <div className="text-xs text-gray-500">
                          <p>{language === 'bg' ? 'Точка A: (X₁, Y₁)' : 'Point A: (X₁, Y₁)'}</p>
                          <p>{language === 'bg' ? 'Точка B: (X₂, Y₂)' : 'Point B: (X₂, Y₂)'}</p>
                          <p>{language === 'bg' ? 'Точка P: (Xₚ, Yₚ)' : 'Point P: (Xₚ, Yₚ)'}</p>
                          <p>{language === 'bg' ? 'Ъгъл α: от A към P' : 'Angle α: from A to P'}</p>
                          <p>{language === 'bg' ? 'Ъгъл β: от B към P' : 'Angle β: from B to P'}</p>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Application Section */}
                  <section className="flex flex-col gap-4">
                    <h2 className="text-2xl font-semibold text-black border-b pb-1">
                      {language === 'bg' ? 'Приложение' : 'Application'}
                    </h2>
                    <div className="bg-green-50 border-l-4 border-green-400 rounded p-4">
                      <h3 className="text-lg font-semibold text-black mb-2">
                        {language === 'bg' ? 'Кога се използва?' : 'When is it used?'}
                      </h3>
                      <ul className="text-base text-black list-disc list-inside space-y-1">
                        <li>{language === 'bg' ? 'При определяне на координатите на недостъпни точки' : 'When determining coordinates of inaccessible points'}</li>
                        <li>{language === 'bg' ? 'В триангулационни мрежи' : 'In triangulation networks'}</li>
                        <li>{language === 'bg' ? 'При топографски снимки' : 'In topographic surveys'}</li>
                        <li>{language === 'bg' ? 'В строителството и инженеринга' : 'In construction and engineering'}</li>
                      </ul>
                    </div>
                  </section>

                  {/* Accuracy Section */}
                  <section className="flex flex-col gap-4">
                    <h2 className="text-2xl font-semibold text-black border-b pb-1">
                      {language === 'bg' ? 'Точност' : 'Accuracy'}
                    </h2>
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded p-4">
                      <h3 className="text-lg font-semibold text-black mb-2">
                        {language === 'bg' ? 'Фактори, влияещи на точността:' : 'Factors affecting accuracy:'}
                      </h3>
                      <ul className="text-base text-black list-disc list-inside space-y-1">
                        <li>{language === 'bg' ? 'Точността на измерените ъгли' : 'Accuracy of measured angles'}</li>
                        <li>{language === 'bg' ? 'Разстоянието между известните точки' : 'Distance between known points'}</li>
                        <li>{language === 'bg' ? 'Геометричното разположение на точките' : 'Geometric configuration of points'}</li>
                        <li>{language === 'bg' ? 'Атмосферните условия' : 'Atmospheric conditions'}</li>
                      </ul>
                    </div>
                  </section>

                  {/* Example Section */}
                  <section className="flex flex-col gap-4">
                    <h2 className="text-2xl font-semibold text-black border-b pb-1">
                      {language === 'bg' ? 'Пример' : 'Example'}
                    </h2>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-black mb-2">
                        {language === 'bg' ? 'Дадено:' : 'Given:'}
                      </h3>
                      <div className="text-base text-black space-y-1">
                        <p>A(1000, 2000), B(1500, 2500)</p>
                        <p>α = 45° = 50 гради</p>
                        <p>β = 60° = 66.67 гради</p>
                      </div>
                      <h3 className="text-lg font-semibold text-black mb-2 mt-4">
                        {language === 'bg' ? 'Намерете координатите на точка P' : 'Find coordinates of point P'}
                      </h3>
                    </div>
                  </section>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ForwardIntersectionDocs;
