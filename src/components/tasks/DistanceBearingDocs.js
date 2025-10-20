import React from 'react';
import Layout from '../layout/Layout';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';

const DistanceBearingDocs = () => {
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
                      {' > '}{language === 'bg' ? 'Разстояние и посока' : 'Distance & Bearing'}
                    </span>
                  </div>
                  <div className="justify-start text-black text-3xl font-bold font-['Manrope']">
                    {language === 'bg' ? 'Разстояние и посока' : 'Distance & Bearing'}
                  </div>
                </div>
                <div className="p-1.5 bg-white rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex justify-start items-center gap-2">
                  <div data-property-1="Default" className="px-3 py-1 bg-white rounded flex justify-center items-center gap-2.5">
                    <Link to="/distance-bearing" className="justify-start text-neutral-400 text-base font-medium font-['Manrope']">
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
                        ? 'Изчисляването на разстояние и посока между две точки е основна задача в геодезията. Разстоянието е дължината на правата линия между точките, а посоката е ъгълът на тази права спрямо северната посока.'
                        : 'Calculating distance and bearing between two points is a fundamental task in geodesy. Distance is the length of the straight line between points, and bearing is the angle of this line relative to north.'
                      }
                    </p>
                    <div className="bg-blue-50 border-l-4 border-blue-400 rounded p-4">
                      <h3 className="text-lg font-semibold text-black mb-2">
                        {language === 'bg' ? 'Определения' : 'Definitions'}
                      </h3>
                      <ul className="text-base text-black list-disc list-inside space-y-1">
                        <li>{language === 'bg' ? 'Разстояние - дължината на правата между две точки' : 'Distance - length of straight line between two points'}</li>
                        <li>{language === 'bg' ? 'Посока - ъгълът спрямо северната посока (0°-400° гради)' : 'Bearing - angle relative to north (0°-400° grad)'}</li>
                        <li>{language === 'bg' ? 'Обратна посока - посоката в обратната посока (+200° гради)' : 'Reverse bearing - bearing in opposite direction (+200° grad)'}</li>
                      </ul>
                    </div>
                  </section>

                  {/* Formulas Section */}
                  <section className="flex flex-col gap-4">
                    <h2 className="text-2xl font-semibold text-black border-b pb-1">
                      {language === 'bg' ? 'Формули' : 'Formulas'}
                    </h2>
                    <div className="bg-gray-50 rounded-lg p-4 text-lg font-mono text-black flex flex-col gap-1">
                      <span>S = √((X₂-X₁)² + (Y₂-Y₁)²)</span>
                      <span>α = atan2(Y₂-Y₁, X₂-X₁) × 200/π</span>
                      <span>α_reverse = α + 200° (ако α &lt; 200°) или α - 200° (ако α ≥ 200°)</span>
                    </div>
                    <div className="text-sm text-neutral-700">
                      {language === 'bg' 
                        ? 'където S е разстоянието, α е посоката в гради, atan2 е аркустангенс функцията'
                        : 'where S is distance, α is bearing in grad, atan2 is arctangent function'
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
                          {language === 'bg' ? 'Фиг. - Разстояние и посока' : 'Fig. - Distance & Bearing'}
                        </p>
                        <div className="text-xs text-gray-500">
                          <p>{language === 'bg' ? 'Точка 1: (X₁, Y₁)' : 'Point 1: (X₁, Y₁)'}</p>
                          <p>{language === 'bg' ? 'Точка 2: (X₂, Y₂)' : 'Point 2: (X₂, Y₂)'}</p>
                          <p>{language === 'bg' ? 'Разстояние: S' : 'Distance: S'}</p>
                          <p>{language === 'bg' ? 'Посока: α' : 'Bearing: α'}</p>
                          <p>{language === 'bg' ? 'Обратна посока: α + 200°' : 'Reverse bearing: α + 200°'}</p>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Quadrants Section */}
                  <section className="flex flex-col gap-4">
                    <h2 className="text-2xl font-semibold text-black border-b pb-1">
                      {language === 'bg' ? 'Квадранти' : 'Quadrants'}
                    </h2>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-black mb-2">
                        {language === 'bg' ? 'Определяне на квадранта:' : 'Quadrant determination:'}
                      </h3>
                      <ul className="text-base text-black list-disc list-inside space-y-1">
                        <li>{language === 'bg' ? 'I квадрант: 0° - 100° гради (ΔX > 0, ΔY > 0)' : 'I quadrant: 0° - 100° grad (ΔX > 0, ΔY > 0)'}</li>
                        <li>{language === 'bg' ? 'II квадрант: 100° - 200° гради (ΔX < 0, ΔY > 0)' : 'II quadrant: 100° - 200° grad (ΔX < 0, ΔY > 0)'}</li>
                        <li>{language === 'bg' ? 'III квадрант: 200° - 300° гради (ΔX < 0, ΔY < 0)' : 'III quadrant: 200° - 300° grad (ΔX < 0, ΔY < 0)'}</li>
                        <li>{language === 'bg' ? 'IV квадрант: 300° - 400° гради (ΔX > 0, ΔY < 0)' : 'IV quadrant: 300° - 400° grad (ΔX > 0, ΔY > 0)'}</li>
                      </ul>
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
                        <li>{language === 'bg' ? 'Геодезически измервания' : 'Geodetic surveys'}</li>
                        <li>{language === 'bg' ? 'Навигация и GPS' : 'Navigation and GPS'}</li>
                        <li>{language === 'bg' ? 'Строителство и планиране' : 'Construction and planning'}</li>
                        <li>{language === 'bg' ? 'Картографиране' : 'Mapping'}</li>
                        <li>{language === 'bg' ? 'Астрономия' : 'Astronomy'}</li>
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

export default DistanceBearingDocs;
