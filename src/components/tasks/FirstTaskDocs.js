import React from 'react';
import Layout from '../layout/Layout';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';

const FirstTaskDocs = () => {
  const { t, language } = useTranslation();

  return (
    <Layout>
      <div className="w-full min-h-screen bg-stone-50 flex flex-col items-center">
        <div className="w-[1180px] mt-8 mb-8 flex flex-col items-center">
          <div className="w-full max-w-3xl flex flex-col gap-10">
            {/* Breadcrumbs and Title */}
            <div className="flex flex-col gap-2">
              <div>
                <Link to="/tools" className="text-neutral-400 text-base font-medium underline">{t.tools}</Link>
                <span className="text-neutral-400 text-base font-medium"> {'>'} {t.firstTaskTitle}</span>
              </div>
              <h1 className="text-4xl font-bold text-black font-['Manrope']">{t.firstTaskDocsTitle}</h1>
              <div className="p-1.5 bg-white rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex gap-2 mt-2">
                <Link to="/first-task" className="px-3 py-1 bg-white rounded flex items-center text-neutral-400 text-base font-medium">{t.instrument}</Link>
                <div className="px-3 py-1 bg-gray-200 rounded flex items-center text-black text-base font-medium">{t.documentation}</div>
              </div>
            </div>

            {/* Theory */}
            <section className="flex flex-col gap-4">
              <h2 className="text-2xl font-semibold text-black border-b pb-1">{t.theory}</h2>
              <p className="text-lg text-neutral-800">
                {t.theoryText}<br/>
                <b>{t.firstTaskDefinition}</b>
              </p>
            </section>

            {/* Given and Looking For */}
            <section className="flex flex-col gap-2">
              <div className="flex gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-black">{t.given}:</h3>
                  <ul className="list-disc ml-6 text-base text-neutral-700">
                    {t.givenPoints.map((point, index) => (
                      <li key={index}>{point}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-black">{t.lookingFor}:</h3>
                  <ul className="list-disc ml-6 text-base text-neutral-700">
                    {t.lookingForPoints.map((point, index) => (
                      <li key={index}>{point}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            {/* Formulas */}
            <section className="flex flex-col gap-2">
              <h2 className="text-2xl font-semibold text-black border-b pb-1">{t.formulas}</h2>
              <div className="bg-gray-50 rounded-lg p-4 text-lg font-mono text-black flex flex-col gap-1">
                <span>ΔY<sub>AB</sub> = S<sub>AB</sub> · sin(α<sub>AB</sub>)</span>
                <span>ΔX<sub>AB</sub> = S<sub>AB</sub> · cos(α<sub>AB</sub>)</span>
                <span>Y<sub>B</sub> = Y<sub>A</sub> + ΔY<sub>AB</sub></span>
                <span>X<sub>B</sub> = X<sub>A</sub> + ΔX<sub>AB</sub></span>
              </div>
              <div className="text-sm text-neutral-700 mt-2">
                {t.coordinateDifferences}
              </div>
            </section>

            {/* Graphical Illustration */}
            <section className="flex flex-col gap-2">
              <h2 className="text-2xl font-semibold text-black border-b pb-1">{t.graphicalIllustration}</h2>
              <div className="flex justify-center">
                <img src="/images/first-task-book-fig1.png" alt={t.graphicalIllustration} className="w-full max-w-md my-2" />
              </div>
              <div className="text-center text-neutral-700 text-sm">{t.graphicCaption}<br/>Y<sub>B</sub> = Y<sub>A</sub> + ΔY<sub>AB</sub>, X<sub>B</sub> = X<sub>A</sub> + ΔX<sub>AB</sub></div>
            </section>

            {/* Sign Table */}
            <section className="flex flex-col gap-2">
              <h2 className="text-2xl font-semibold text-black border-b pb-1">{t.signTable}</h2>
              <div className="overflow-x-auto">
                <table className="min-w-[350px] text-center border border-gray-300 rounded">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border border-gray-300 px-2 py-1">{t.directionAngle}</th>
                      <th className="border border-gray-300 px-2 py-1">ΔY<sub>AB</sub> (sin α<sub>AB</sub>)</th>
                      <th className="border border-gray-300 px-2 py-1">ΔX<sub>AB</sub> (cos α<sub>AB</sub>)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 px-2 py-1">0 – 100g</td>
                      <td className="border border-gray-300 px-2 py-1">+</td>
                      <td className="border border-gray-300 px-2 py-1">+</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-2 py-1">100 – 200g</td>
                      <td className="border border-gray-300 px-2 py-1">+</td>
                      <td className="border border-gray-300 px-2 py-1">–</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-2 py-1">200 – 300g</td>
                      <td className="border border-gray-300 px-2 py-1">–</td>
                      <td className="border border-gray-300 px-2 py-1">–</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-2 py-1">300 – 400g</td>
                      <td className="border border-gray-300 px-2 py-1">–</td>
                      <td className="border border-gray-300 px-2 py-1">+</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Notes */}
            <section className="flex flex-col gap-2 mt-6">
              <h2 className="text-2xl font-semibold text-black border-b pb-1">{t.notes}</h2>
              <ul className="list-disc ml-6 text-base text-neutral-700">
                {t.notePoints.map((point, index) => (
                  <li key={index}>{point}</li>
                ))}
              </ul>
            </section>

            {/* Example */}
            <section className="flex flex-col gap-2 mt-6">
              <h2 className="text-2xl font-semibold text-black border-b pb-1">{t.example}</h2>
              <div className="bg-blue-50 border-l-4 border-blue-400 rounded p-4 text-base text-black flex flex-col gap-1">
                <span>Y<sub>A</sub> = 1209.12</span>
                <span>X<sub>A</sub> = 4047.53</span>
                <span>S<sub>AB</sub> = 185.28</span>
                <span>α<sub>AB</sub> = 28.4512</span>
                <span className="mt-2">Y<sub>B</sub> = Y<sub>A</sub> + S<sub>AB</sub> · sin(α<sub>AB</sub>) = 1209.12 + 185.28 · sin(28.4512) = <b>1289.19</b></span>
                <span>X<sub>B</sub> = X<sub>A</sub> + S<sub>AB</sub> · cos(α<sub>AB</sub>) = 4047.53 + 185.28 · cos(28.4512) = <b>4214.61</b></span>
              </div>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default FirstTaskDocs; 