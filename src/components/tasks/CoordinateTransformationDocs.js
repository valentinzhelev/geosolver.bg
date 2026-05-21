import React from 'react';
import Layout from '../layout/Layout';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';

const CoordinateTransformationDocs = () => {
  const { language } = useTranslation();

  return (
    <Layout>
      <div className="w-full min-h-screen bg-stone-50 dark:bg-zinc-950 transition-colors flex flex-col items-center">
        <div className="w-[1180px] mt-8 mb-8 flex flex-col items-center">
          <div className="w-[1180px] inline-flex flex-col justify-start items-start gap-10">
            <div className="self-stretch flex flex-col justify-center items-start gap-10">
              <div className="w-[580px] flex flex-col justify-start items-start gap-4">
                <div className="flex flex-col justify-start items-start gap-1">
                  <div className="justify-start">
                    <span className="text-neutral-400 dark:text-zinc-400 text-base font-medium font-['Manrope'] underline">
                      <Link to="/tools">{language === 'bg' ? 'Инструменти' : 'Tools'}</Link>
                    </span>
                    <span className="text-neutral-400 dark:text-zinc-400 text-base font-medium font-['Manrope']">
                      {' > '}{language === 'bg' ? 'Координатна трансформация' : 'Coordinate Transformation'}
                    </span>
                  </div>
                  <div className="justify-start text-black dark:text-white text-3xl font-bold font-['Manrope']">
                    {language === 'bg' ? 'Координатна трансформация' : 'Coordinate Transformation'}
                  </div>
                </div>
                <div className="p-1.5 bg-white dark:bg-zinc-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-800 inline-flex justify-start items-center gap-2">
                  <div data-property-1="Default" className="px-3 py-1 bg-white dark:bg-zinc-900 rounded flex justify-center items-center gap-2.5">
                    <Link to="/coordinate-transformation" className="justify-start text-neutral-400 dark:text-zinc-400 text-base font-medium font-['Manrope']">
                      {language === 'bg' ? 'Инструмент' : 'Tool'}
                    </Link>
                  </div>
                  <div data-property-1="Default" className="px-3 py-1 bg-gray-200 dark:bg-zinc-700 rounded flex justify-center items-center gap-2.5">
                    <div className="justify-start text-black dark:text-white text-base font-medium font-['Manrope']">
                      {language === 'bg' ? 'Документация' : 'Documentation'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="self-stretch p-4 bg-white dark:bg-zinc-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-800 flex flex-col justify-start items-start gap-4">
                <div className="self-stretch flex flex-col gap-6">
                  {/* Theory Section */}
                  <section className="flex flex-col gap-4">
                    <h2 className="text-2xl font-semibold text-black dark:text-white border-b pb-1">
                      {language === 'bg' ? 'Теория' : 'Theory'}
                    </h2>
                    <p className="text-lg text-neutral-800 dark:text-zinc-200">
                      {language === 'bg' 
                        ? 'Координатната трансформация е процес на преобразуване на координати между различни координатни системи или прилагане на геометрични трансформации.'
                        : 'Coordinate transformation is the process of converting coordinates between different coordinate systems or applying geometric transformations.'
                      }
                    </p>
                    <div className="bg-blue-50 border-l-4 border-blue-400 rounded p-4">
                      <h3 className="text-lg font-semibold text-black dark:text-white mb-2">
                        {language === 'bg' ? 'Типове трансформации' : 'Types of Transformations'}
                      </h3>
                      <ul className="text-base text-black dark:text-white list-disc list-inside space-y-1">
                        <li>{language === 'bg' ? 'Паралелно изместване (Translation)' : 'Translation'}</li>
                        <li>{language === 'bg' ? 'Завъртане (Rotation)' : 'Rotation'}</li>
                        <li>{language === 'bg' ? 'Мащабиране (Scaling)' : 'Scaling'}</li>
                        <li>{language === 'bg' ? 'Хелмертова трансформация' : 'Helmert Transformation'}</li>
                        <li>{language === 'bg' ? 'Афинна трансформация' : 'Affine Transformation'}</li>
                      </ul>
                    </div>
                  </section>

                  {/* Formulas Section */}
                  <section className="flex flex-col gap-4">
                    <h2 className="text-2xl font-semibold text-black dark:text-white border-b pb-1">
                      {language === 'bg' ? 'Формули' : 'Formulas'}
                    </h2>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-black dark:text-white mb-2">
                        {language === 'bg' ? '1. Паралелно изместване:' : '1. Translation:'}
                      </h3>
                      <div className="text-base font-mono text-black dark:text-white space-y-1">
                        <p>X' = X + ΔX</p>
                        <p>Y' = Y + ΔY</p>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-black dark:text-white mb-2 mt-4">
                        {language === 'bg' ? '2. Завъртане:' : '2. Rotation:'}
                      </h3>
                      <div className="text-base font-mono text-black dark:text-white space-y-1">
                        <p>X' = X·cos(α) - Y·sin(α)</p>
                        <p>Y' = X·sin(α) + Y·cos(α)</p>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-black dark:text-white mb-2 mt-4">
                        {language === 'bg' ? '3. Мащабиране:' : '3. Scaling:'}
                      </h3>
                      <div className="text-base font-mono text-black dark:text-white space-y-1">
                        <p>X' = X·Sx</p>
                        <p>Y' = Y·Sy</p>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-black dark:text-white mb-2 mt-4">
                        {language === 'bg' ? '4. Хелмертова трансформация:' : '4. Helmert Transformation:'}
                      </h3>
                      <div className="text-base font-mono text-black dark:text-white space-y-1">
                        <p>X' = a·X - b·Y + tx</p>
                        <p>Y' = b·X + a·Y + ty</p>
                      </div>
                    </div>
                  </section>

                  {/* Application Section */}
                  <section className="flex flex-col gap-4">
                    <h2 className="text-2xl font-semibold text-black dark:text-white border-b pb-1">
                      {language === 'bg' ? 'Приложение' : 'Application'}
                    </h2>
                    <div className="bg-green-50 border-l-4 border-green-400 rounded p-4">
                      <h3 className="text-lg font-semibold text-black dark:text-white mb-2">
                        {language === 'bg' ? 'Кога се използва?' : 'When is it used?'}
                      </h3>
                      <ul className="text-base text-black dark:text-white list-disc list-inside space-y-1">
                        <li>{language === 'bg' ? 'Преобразуване между координатни системи' : 'Converting between coordinate systems'}</li>
                        <li>{language === 'bg' ? 'Геодезически изчисления' : 'Geodetic calculations'}</li>
                        <li>{language === 'bg' ? 'Картографски проекции' : 'Cartographic projections'}</li>
                        <li>{language === 'bg' ? 'CAD и GIS системи' : 'CAD and GIS systems'}</li>
                        <li>{language === 'bg' ? 'Компютърна графика' : 'Computer graphics'}</li>
                      </ul>
                    </div>
                  </section>

                  {/* Parameters Section */}
                  <section className="flex flex-col gap-4">
                    <h2 className="text-2xl font-semibold text-black dark:text-white border-b pb-1">
                      {language === 'bg' ? 'Параметри' : 'Parameters'}
                    </h2>
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded p-4">
                      <h3 className="text-lg font-semibold text-black dark:text-white mb-2">
                        {language === 'bg' ? 'Обяснение на параметрите:' : 'Parameter explanation:'}
                      </h3>
                      <ul className="text-base text-black dark:text-white list-disc list-inside space-y-1">
                        <li>{language === 'bg' ? 'ΔX, ΔY - измествания по осите' : 'ΔX, ΔY - translations along axes'}</li>
                        <li>{language === 'bg' ? 'α - ъгъл на завъртане' : 'α - rotation angle'}</li>
                        <li>{language === 'bg' ? 'Sx, Sy - коефициенти на мащабиране' : 'Sx, Sy - scaling factors'}</li>
                        <li>{language === 'bg' ? 'a, b - параметри на Хелмертова трансформация' : 'a, b - Helmert transformation parameters'}</li>
                      </ul>
                    </div>
                  </section>

                  {/* Example Section */}
                  <section className="flex flex-col gap-4">
                    <h2 className="text-2xl font-semibold text-black dark:text-white border-b pb-1">
                      {language === 'bg' ? 'Пример' : 'Example'}
                    </h2>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-black dark:text-white mb-2">
                        {language === 'bg' ? 'Паралелно изместване:' : 'Translation example:'}
                      </h3>
                      <div className="text-base text-black dark:text-white space-y-1">
                        <p>{language === 'bg' ? 'Дадено: P(100, 200), ΔX = 50, ΔY = 30' : 'Given: P(100, 200), ΔX = 50, ΔY = 30'}</p>
                        <p>{language === 'bg' ? 'Резултат: P\'(150, 230)' : 'Result: P\'(150, 230)'}</p>
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

export default CoordinateTransformationDocs;
