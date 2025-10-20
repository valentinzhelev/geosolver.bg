import React from 'react';
import Layout from '../layout/Layout';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';

const AreaCalculationDocs = () => {
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
                      {' > '}{language === 'bg' ? 'Изчисляване на площ' : 'Area Calculation'}
                    </span>
                  </div>
                  <div className="justify-start text-black text-3xl font-bold font-['Manrope']">
                    {language === 'bg' ? 'Изчисляване на площ' : 'Area Calculation'}
                  </div>
                </div>
                <div className="p-1.5 bg-white rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex justify-start items-center gap-2">
                  <div data-property-1="Default" className="px-3 py-1 bg-white rounded flex justify-center items-center gap-2.5">
                    <Link to="/area-calculation" className="justify-start text-neutral-400 text-base font-medium font-['Manrope']">
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
                        ? 'Изчисляването на площта на многоъгълник е основна задача в геодезията, кадастъра и топографията. Съществуват различни методи за изчисляване на площта.'
                        : 'Calculating polygon area is a fundamental task in geodesy, cadastre and topography. There are different methods for calculating area.'
                      }
                    </p>
                    <div className="bg-blue-50 border-l-4 border-blue-400 rounded p-4">
                      <h3 className="text-lg font-semibold text-black mb-2">
                        {language === 'bg' ? 'Методи за изчисление' : 'Calculation Methods'}
                      </h3>
                      <ul className="text-base text-black list-disc list-inside space-y-1">
                        <li>{language === 'bg' ? 'Shoelace Formula (Gauss\'s area formula)' : 'Shoelace Formula (Gauss\'s area formula)'}</li>
                        <li>{language === 'bg' ? 'Trapezoidal Rule' : 'Trapezoidal Rule'}</li>
                        <li>{language === 'bg' ? 'Simpson\'s Rule' : 'Simpson\'s Rule'}</li>
                      </ul>
                    </div>
                  </section>

                  {/* Formulas Section */}
                  <section className="flex flex-col gap-4">
                    <h2 className="text-2xl font-semibold text-black border-b pb-1">
                      {language === 'bg' ? 'Формули' : 'Formulas'}
                    </h2>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-black mb-2">
                        {language === 'bg' ? '1. Shoelace Formula:' : '1. Shoelace Formula:'}
                      </h3>
                      <div className="text-base font-mono text-black space-y-1">
                        <p>A = |Σ(xi·yi+1) - Σ(yi·xi+1)| / 2</p>
                        <p>{language === 'bg' ? 'където i = 1 до n' : 'where i = 1 to n'}</p>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-black mb-2 mt-4">
                        {language === 'bg' ? '2. Trapezoidal Rule:' : '2. Trapezoidal Rule:'}
                      </h3>
                      <div className="text-base font-mono text-black space-y-1">
                        <p>A = |Σ(xi·yi+1 - xi+1·yi)| / 2</p>
                      </div>
                      
                      <h3 className="text-lg font-semibold text-black mb-2 mt-4">
                        {language === 'bg' ? '3. Simpson\'s Rule:' : '3. Simpson\'s Rule:'}
                      </h3>
                      <div className="text-base font-mono text-black space-y-1">
                        <p>A = (h/3) × [y0 + yn + 2Σ(y_even) + 4Σ(y_odd)]</p>
                        <p>{language === 'bg' ? 'където h е стъпката' : 'where h is the step'}</p>
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
                        <li>{language === 'bg' ? 'Кадастърни измервания' : 'Cadastral surveys'}</li>
                        <li>{language === 'bg' ? 'Топографски снимки' : 'Topographic surveys'}</li>
                        <li>{language === 'bg' ? 'Земеустройство' : 'Land surveying'}</li>
                        <li>{language === 'bg' ? 'Строителство и планиране' : 'Construction and planning'}</li>
                        <li>{language === 'bg' ? 'Селско стопанство' : 'Agriculture'}</li>
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
                        <li>{language === 'bg' ? 'Точността на измерените координати' : 'Accuracy of measured coordinates'}</li>
                        <li>{language === 'bg' ? 'Броя на точките' : 'Number of points'}</li>
                        <li>{language === 'bg' ? 'Формата на многоъгълника' : 'Shape of the polygon'}</li>
                        <li>{language === 'bg' ? 'Избраният метод за изчисление' : 'Selected calculation method'}</li>
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
                        {language === 'bg' ? 'Триъгълник с координати:' : 'Triangle with coordinates:'}
                      </h3>
                      <div className="text-base text-black space-y-1">
                        <p>A(0, 0), B(4, 0), C(2, 3)</p>
                        <p>{language === 'bg' ? 'Използвайки Shoelace Formula:' : 'Using Shoelace Formula:'}</p>
                        <p>A = |0×0 + 4×3 + 2×0 - 0×4 - 0×2 - 3×0| / 2 = 6</p>
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

export default AreaCalculationDocs;
