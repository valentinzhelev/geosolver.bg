import React from 'react';
import Layout from '../layout/Layout';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';

const FirstTaskDocs = () => {
  const { t } = useTranslation();

  return (
    <Layout>
      <div className="w-full min-h-screen bg-stone-50 flex flex-col items-center">
        <div className="w-full max-w-[1180px] mt-8 mb-8 px-4 sm:px-0 flex flex-col items-center">
          <div className="w-full max-w-[1180px] inline-flex flex-col justify-start items-start gap-10">
            <div className="self-stretch flex flex-col justify-center items-start gap-10">
              <div className="w-full max-w-[580px] flex flex-col justify-start items-start gap-4">
                <div className="flex flex-col justify-start items-start gap-1">
                  <div className="justify-start">
                    <span className="text-neutral-400 text-base font-medium font-['Manrope'] underline">
                      <Link to="/tools">{t.tools}</Link>
                    </span>
                    <span className="text-neutral-400 text-base font-medium font-['Manrope']"> {'>'} {t.firstTaskTitle}</span>
                  </div>
                  <div className="justify-start text-black text-3xl font-bold font-['Manrope']">{t.firstTaskTitle}</div>
                </div>
                <div className="p-1.5 bg-white rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex justify-start items-center gap-2">
                  <div data-property-1="Default" className="px-3 py-1 bg-white rounded flex justify-center items-center gap-2.5">
                    <Link to="/first-task" className="justify-start text-neutral-400 text-base font-medium font-['Manrope']">{t.instrument}</Link>
                  </div>
                  <div data-property-1="Default" className="px-3 py-1 bg-gray-200 rounded flex justify-center items-center gap-2.5">
                    <div className="justify-start text-black text-base font-medium font-['Manrope']">{t.documentation}</div>
                  </div>
                </div>
              </div>

              <div className="self-stretch p-4 bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 flex flex-col justify-start items-start gap-4">
                <div className="self-stretch flex flex-col gap-6">
                  {/* Theory Section */}
                  <section className="flex flex-col gap-4">
                    <h2 className="text-2xl font-semibold text-black border-b pb-1">Теория</h2>
                    <p className="text-lg text-neutral-800">
                      При много от геодезичните изчисления се използват две основни задачи, които са наречени първа и втора основна задача или права и обратна задача.
                    </p>
                    <div className="bg-blue-50 border-l-4 border-blue-400 rounded p-4">
                      <h3 className="text-lg font-semibold text-black mb-2">Първа основна задача</h3>
                      <p className="text-base text-black">
                        Дадени са координатите на една точка А(Х<sub>А</sub>, У<sub>А</sub>), посочният ъгъл α<sub>AB</sub> на отсечката между т. А и В и разстоянието S<sub>AB</sub>. Търсят се координатите на т. В (Х<sub>В</sub>, У<sub>В</sub>).
                      </p>
                    </div>
                  </section>

                  {/* Formulas Section */}
                  <section className="flex flex-col gap-4">
                    <h2 className="text-2xl font-semibold text-black border-b pb-1">Формули</h2>
                    <div className="bg-gray-50 rounded-lg p-4 text-lg font-mono text-black flex flex-col gap-1">
                      <span>ΔY<sub>AB</sub> = S<sub>AB</sub> · sin(α<sub>AB</sub>)</span>
                      <span>ΔX<sub>AB</sub> = S<sub>AB</sub> · cos(α<sub>AB</sub>)</span>
                      <span>Y<sub>B</sub> = Y<sub>A</sub> + ΔY<sub>AB</sub></span>
                      <span>X<sub>B</sub> = X<sub>A</sub> + ΔX<sub>AB</sub></span>
                    </div>
                    <div className="text-sm text-neutral-700">
                      където ΔY<sub>AB</sub> и ΔX<sub>AB</sub> се наричат координатни разлики
                    </div>
                  </section>

                  {/* Graphical Illustration */}
                  <section className="flex flex-col gap-4">
                    <h2 className="text-2xl font-semibold text-black border-b pb-1">Графична илюстрация</h2>
                    <div className="flex justify-center">
                      <div className="w-full max-w-md bg-gray-100 rounded-lg p-4 text-center">
                        <p className="text-sm text-gray-600 mb-2">Фиг. 21.1 - Координатна система с точки A и B</p>
                        <div className="text-xs text-gray-500">
                          <p>Точка A: (X<sub>A</sub>, Y<sub>A</sub>)</p>
                          <p>Точка B: (X<sub>B</sub>, Y<sub>B</sub>)</p>
                          <p>Разстояние: S<sub>AB</sub></p>
                          <p>Посочен ъгъл: α<sub>AB</sub></p>
                        </div>
                      </div>
                    </div>
                    <div className="text-center text-neutral-700 text-sm">
                      Y<sub>B</sub> = Y<sub>A</sub> + ΔY<sub>AB</sub>, X<sub>B</sub> = X<sub>A</sub> + ΔX<sub>AB</sub>
                    </div>
                  </section>

                  {/* Sign Table */}
                  <section className="flex flex-col gap-4">
                    <h2 className="text-2xl font-semibold text-black border-b pb-1">Таблица на знаците</h2>
                    <div className="overflow-x-auto">
                      <table className="min-w-[350px] text-center border border-gray-300 rounded">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="border border-gray-300 px-2 py-1">Посочен ъгъл</th>
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
                    <div className="text-sm text-neutral-700">
                      Таблица 21.1 - Знаци на координатните разлики в зависимост от посочния ъгъл
                    </div>
                  </section>

                  {/* Calculation Method */}
                  <section className="flex flex-col gap-4">
                    <h2 className="text-2xl font-semibold text-black border-b pb-1">Метод на изчисление</h2>
                    <div className="bg-green-50 border-l-4 border-green-400 rounded p-4 flex flex-col gap-4">
                      <h3 className="text-lg font-semibold text-black">С електронен калкулатор</h3>
                      <p className="text-base text-black leading-relaxed">
                        С калкулатори с вградени програми тази задача се свежда до трансформиране на полярни координати (S<sub>AB</sub> и α<sub>AB</sub>) в правоъгълни (ΔX<sub>AB</sub> и ΔY<sub>AB</sub>).
                      </p>
                      <div className="space-y-3">
                        <p className="text-sm font-medium text-gray-700">Последователност на действията:</p>
                        <div className="bg-white rounded-lg p-4 border">
                          <div className="flex flex-wrap gap-2 mb-3">
                            <span className="bg-gray-200 px-3 py-2 rounded text-sm font-medium">GRA</span>
                            <span className="bg-gray-200 px-3 py-2 rounded text-sm font-medium">S<sub>AB</sub></span>
                            <span className="bg-gray-200 px-3 py-2 rounded text-sm font-medium">inv</span>
                            <span className="bg-gray-200 px-3 py-2 rounded text-sm font-medium">P→R</span>
                            <span className="bg-gray-200 px-3 py-2 rounded text-sm font-medium">α<sub>AB</sub></span>
                            <span className="bg-gray-200 px-3 py-2 rounded text-sm font-medium">=</span>
                          </div>
                          <p className="text-sm text-gray-600 font-medium">Резултат: ΔX<sub>AB</sub> и ΔY<sub>AB</sub></p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        За различните калкулатори редът на действията е описан в ръководството за работа.
                      </p>
                    </div>
                    
                    {/* Scientific Calculator Link */}
                    <div className="bg-blue-50 border-l-4 border-blue-400 rounded p-4 flex flex-col gap-4">
                      <h3 className="text-lg font-semibold text-black">Използвайте нашия научен калкулатор</h3>
                      <p className="text-base text-black leading-relaxed">
                        За по-лесно решаване на тригонометричните изчисления, можете да използвате нашия вграден научен калкулатор с поддръжка за градианова система (GRAD режим).
                      </p>
                      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                        <Link 
                          to="/scientific-calculator" 
                          className="inline-flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
                        >
                          Отвори научен калкулатор
                        </Link>
                        <div className="text-sm text-gray-600 flex items-start gap-2">
                          <span className="leading-relaxed">Препоръчваме да използвате GRAD режим за геодезически изчисления</span>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Example */}
                  <section className="flex flex-col gap-4">
                    <h2 className="text-2xl font-semibold text-black border-b pb-1">Пример</h2>
                    <div className="bg-blue-50 border-l-4 border-blue-400 rounded p-4 text-base text-black flex flex-col gap-1">
                      <span>Y<sub>A</sub> = 1209.12</span>
                      <span>X<sub>A</sub> = 4047.53</span>
                      <span>S<sub>AB</sub> = 185.28</span>
                      <span>α<sub>AB</sub> = 28.4512g</span>
                      <span className="mt-2">Y<sub>B</sub> = Y<sub>A</sub> + S<sub>AB</sub> · sin(α<sub>AB</sub>) = 1209.12 + 185.28 · sin(28.4512) = <b>1289.19</b></span>
                      <span>X<sub>B</sub> = X<sub>A</sub> + S<sub>AB</sub> · cos(α<sub>AB</sub>) = 4047.53 + 185.28 · cos(28.4512) = <b>4214.61</b></span>
                    </div>
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded p-4 flex flex-col gap-3">
                      <p className="text-sm text-gray-700 font-medium">
                        <strong>Практически съвет:</strong> Можете да проверите тези изчисления с нашия научен калкулатор:
                      </p>
                      <div className="bg-white rounded-lg p-3 border">
                        <div className="text-sm text-gray-600 space-y-2 font-mono">
                          <div>• sin(28.4512) = ?</div>
                          <div>• cos(28.4512) = ?</div>
                          <div>• 185.28 × sin(28.4512) = ?</div>
                          <div>• 185.28 × cos(28.4512) = ?</div>
                        </div>
                      </div>
                      <Link 
                        to="/scientific-calculator" 
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors duration-200"
                      >
                        Провери с калкулатора →
                      </Link>
                    </div>
                  </section>

                  {/* Notes */}
                  <section className="flex flex-col gap-4">
                    <h2 className="text-2xl font-semibold text-black border-b pb-1">Бележки</h2>
                    <ul className="list-disc ml-6 text-base text-neutral-700 space-y-1">
                      <li>Посочният ъгъл α<sub>AB</sub> се измерва от положителната ос X по часовниковата стрелка</li>
                      <li>Градусите се използват в градианова система (0-400g)</li>
                      <li>Координатните разлики се получават директно с правилните си знаци</li>
                      <li>Калкулаторът трябва да има вградени функции sin и cos</li>
                    </ul>
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

export default FirstTaskDocs; 