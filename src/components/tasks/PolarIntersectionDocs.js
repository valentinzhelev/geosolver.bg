import React from 'react';
import Layout from '../layout/Layout';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';

const PolarIntersectionDocs = () => {
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
                      {' > '}{language === 'bg' ? 'Полярна засечка' : 'Polar Intersection'}
                    </span>
                  </div>
                  <div className="justify-start text-black text-3xl font-bold font-['Manrope']">
                    {language === 'bg' ? 'Полярна засечка' : 'Polar Intersection'}
                  </div>
                </div>
                <div className="p-1.5 bg-white rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex justify-start items-center gap-2">
                  <div data-property-1="Default" className="px-3 py-1 bg-white rounded flex justify-center items-center gap-2.5">
                    <Link to="/polar-intersection" className="justify-start text-neutral-400 text-base font-medium font-['Manrope']">
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
                        ? 'Полярната засечка е геодезическа задача, при която се определят координатите на неизвестна точка чрез измерване на ъгъл и разстояние от известна точка.'
                        : 'Polar intersection is a geodetic task where the coordinates of an unknown point are determined by measuring angle and distance from a known point.'
                      }
                    </p>
                    <div className="bg-blue-50 border-l-4 border-blue-400 rounded p-4">
                      <h3 className="text-lg font-semibold text-black mb-2">
                        {language === 'bg' ? 'Условие на задачата' : 'Problem Statement'}
                      </h3>
                      <p className="text-base text-black">
                        {language === 'bg' 
                          ? 'Дадени са координатите на известна точка A(X₁, Y₁), измерените ъгъл α и разстояние S до неизвестната точка P. Търсят се координатите на точката P(Xₚ, Yₚ).'
                          : 'Given coordinates of known point A(X₁, Y₁), measured angle α and distance S to unknown point P. Find coordinates of point P(Xₚ, Yₚ).'
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
                      <span>ΔX = S · cos(α)</span>
                      <span>ΔY = S · sin(α)</span>
                      <span>Xₚ = X₁ + ΔX</span>
                      <span>Yₚ = Y₁ + ΔY</span>
                    </div>
                    <div className="text-sm text-neutral-700">
                      {language === 'bg' 
                        ? 'където S е измереното разстояние, α е измереният ъгъл в гради'
                        : 'where S is the measured distance, α is the measured angle in grad'
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
                          {language === 'bg' ? 'Фиг. - Полярна засечка' : 'Fig. - Polar Intersection'}
                        </p>
                        <div className="text-xs text-gray-500">
                          <p>{language === 'bg' ? 'Точка A: (X₁, Y₁)' : 'Point A: (X₁, Y₁)'}</p>
                          <p>{language === 'bg' ? 'Точка P: (Xₚ, Yₚ)' : 'Point P: (Xₚ, Yₚ)'}</p>
                          <p>{language === 'bg' ? 'Разстояние: S' : 'Distance: S'}</p>
                          <p>{language === 'bg' ? 'Ъгъл: α' : 'Angle: α'}</p>
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
                        <li>{language === 'bg' ? 'При топографски снимки с тахиметър' : 'In topographic surveys with tacheometer'}</li>
                        <li>{language === 'bg' ? 'В строителството за определяне на точки' : 'In construction for point determination'}</li>
                        <li>{language === 'bg' ? 'При кадастърни измервания' : 'In cadastral surveys'}</li>
                        <li>{language === 'bg' ? 'В инженерна геодезия' : 'In engineering geodesy'}</li>
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
                        <li>{language === 'bg' ? 'Точността на измерените разстояния' : 'Accuracy of measured distances'}</li>
                        <li>{language === 'bg' ? 'Атмосферните условия' : 'Atmospheric conditions'}</li>
                        <li>{language === 'bg' ? 'Качеството на инструмента' : 'Instrument quality'}</li>
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
                        <p>A(1000, 2000)</p>
                        <p>S = 150.5 м</p>
                        <p>α = 45° = 50 гради</p>
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

export default PolarIntersectionDocs;
