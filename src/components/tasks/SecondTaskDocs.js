import React from 'react';
import Layout from '../layout/Layout';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';

const SecondTaskDocs = () => {
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
                      {' > '}{language === 'bg' ? 'Втора основна задача' : 'Second Basic Task'}
                    </span>
                  </div>
                  <div className="justify-start text-black text-3xl font-bold font-['Manrope']">
                    {language === 'bg' ? 'Втора основна задача' : 'Second Basic Task'}
                  </div>
                </div>
                <div className="p-1.5 bg-white rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex justify-start items-center gap-2">
                  <div data-property-1="Default" className="px-3 py-1 bg-white rounded flex justify-center items-center gap-2.5">
                    <Link to="/second-task" className="justify-start text-neutral-400 text-base font-medium font-['Manrope']">
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
                        ? 'Втората основна задача е геодезическа задача, при която се изчисляват ъгълът и разстоянието между две точки по техните координати.'
                        : 'Second basic task is a geodetic problem where the angle and distance between two points are calculated from their coordinates.'
                      }
                    </p>
                    <div className="bg-blue-50 border-l-4 border-blue-400 rounded p-4">
                      <h3 className="text-lg font-semibold text-black mb-2">
                        {language === 'bg' ? 'Условие на задачата' : 'Problem Statement'}
                      </h3>
                      <p className="text-base text-black">
                        {language === 'bg' 
                          ? 'Дадени са координатите на две точки A(X₁, Y₁) и B(X₂, Y₂). Търсят се разстоянието S между тях и посочният ъгъл α от точка A към точка B.'
                          : 'Given coordinates of two points A(X₁, Y₁) and B(X₂, Y₂). Find the distance S between them and the bearing angle α from point A to point B.'
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
                      <span>ΔX = X₂ - X₁</span>
                      <span>ΔY = Y₂ - Y₁</span>
                      <span>S = √(ΔX² + ΔY²)</span>
                      <span>α = atan2(ΔY, ΔX) × 200/π</span>
                    </div>
                    <div className="text-sm text-neutral-700">
                      {language === 'bg' 
                        ? 'където ΔX и ΔY са координатните разлики, S е разстоянието, α е посочният ъгъл в гради'
                        : 'where ΔX and ΔY are coordinate differences, S is distance, α is bearing angle in grad'
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
                          {language === 'bg' ? 'Фиг. - Втора основна задача' : 'Fig. - Second Basic Task'}
                        </p>
                        <div className="text-xs text-gray-500">
                          <p>{language === 'bg' ? 'Точка A: (X₁, Y₁)' : 'Point A: (X₁, Y₁)'}</p>
                          <p>{language === 'bg' ? 'Точка B: (X₂, Y₂)' : 'Point B: (X₂, Y₂)'}</p>
                          <p>{language === 'bg' ? 'Разстояние: S' : 'Distance: S'}</p>
                          <p>{language === 'bg' ? 'Посочен ъгъл: α' : 'Bearing angle: α'}</p>
                          <p>{language === 'bg' ? 'Координатни разлики: ΔX, ΔY' : 'Coordinate differences: ΔX, ΔY'}</p>
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
                        <li>{language === 'bg' ? 'GNSS измервания' : 'GNSS surveys'}</li>
                        <li>{language === 'bg' ? 'Координатна геодезия' : 'Coordinate geodesy'}</li>
                        <li>{language === 'bg' ? 'Топографски снимки' : 'Topographic surveys'}</li>
                        <li>{language === 'bg' ? 'Кадастърни измервания' : 'Cadastral surveys'}</li>
                        <li>{language === 'bg' ? 'Инженерна геодезия' : 'Engineering geodesy'}</li>
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
                        <li>{language === 'bg' ? 'Точността на входните координати' : 'Accuracy of input coordinates'}</li>
                        <li>{language === 'bg' ? 'Координатната система' : 'Coordinate system'}</li>
                        <li>{language === 'bg' ? 'Разстоянието между точките' : 'Distance between points'}</li>
                        <li>{language === 'bg' ? 'Геометричното разположение' : 'Geometric configuration'}</li>
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
                        <p>ΔX = 500, ΔY = 500</p>
                        <p>S = √(500² + 500²) = 707.107 м</p>
                        <p>α = atan2(500, 500) × 200/π = 50 гради</p>
                      </div>
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

export default SecondTaskDocs;
