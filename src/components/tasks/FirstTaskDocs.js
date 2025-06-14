import React from 'react';
import Layout from '../layout/Layout';
import { Link } from 'react-router-dom';

const FirstTaskDocs = () => {
  return (
    <Layout>
      <div className="w-full min-h-screen bg-stone-50 flex flex-col items-center">
        <div className="w-[1180px] mt-8 mb-8 flex flex-col items-center">
          <div className="w-full max-w-3xl flex flex-col gap-10">
            {/* Breadcrumbs and Title */}
            <div className="flex flex-col gap-2">
              <div>
                <Link to="/tools" className="text-neutral-400 text-base font-medium underline">Инструменти</Link>
                <span className="text-neutral-400 text-base font-medium"> {'>'} Първа основна задача</span>
              </div>
              <h1 className="text-4xl font-bold text-black font-['Manrope']">Първа основна задача при координатните изчисления</h1>
              <div className="p-1.5 bg-white rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex gap-2 mt-2">
                <Link to="/first-task" className="px-3 py-1 bg-white rounded flex items-center text-neutral-400 text-base font-medium">Инструмент</Link>
                <div className="px-3 py-1 bg-gray-200 rounded flex items-center text-black text-base font-medium">Документация</div>
              </div>
            </div>

            {/* Академично въведение */}
            <section className="flex flex-col gap-4">
              <h2 className="text-2xl font-semibold text-black border-b pb-1">Теория</h2>
              <p className="text-lg text-neutral-800">
                При много от геодезическите изчисления се използват две основни задачи, които се наричат първа и втора основна задача или права и обратна задача.<br/>
                <b>Първа основна задача</b> е задача за определяне на координатите на точка <b>B</b> (<b>X<sub>B</sub></b>, <b>Y<sub>B</sub></b>), когато са дадени координатите на точка <b>A</b> (<b>X<sub>A</sub></b>, <b>Y<sub>A</sub></b>), дължината на отсечката <b>S<sub>AB</sub></b> и посоченият ъгъл <b>α<sub>AB</sub></b> (в гради).
              </p>
            </section>

            {/* Дадено и Търси се */}
            <section className="flex flex-col gap-2">
              <div className="flex gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-black">Дадено:</h3>
                  <ul className="list-disc ml-6 text-base text-neutral-700">
                    <li>Y<sub>A</sub>, X<sub>A</sub> – координати на начална точка A</li>
                    <li>S<sub>AB</sub> – дължина на отсечката AB</li>
                    <li>α<sub>AB</sub> – посочен ъгъл (в гради, 0g ≤ α ≤ 400g)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-black">Търси се:</h3>
                  <ul className="list-disc ml-6 text-base text-neutral-700">
                    <li>Y<sub>B</sub>, X<sub>B</sub></li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Формули */}
            <section className="flex flex-col gap-2">
              <h2 className="text-2xl font-semibold text-black border-b pb-1">Формули</h2>
              <div className="bg-gray-50 rounded-lg p-4 text-lg font-mono text-black flex flex-col gap-1">
                <span>ΔY<sub>AB</sub> = S<sub>AB</sub> · sin(α<sub>AB</sub>)</span>
                <span>ΔX<sub>AB</sub> = S<sub>AB</sub> · cos(α<sub>AB</sub>)</span>
                <span>Y<sub>B</sub> = Y<sub>A</sub> + ΔY<sub>AB</sub></span>
                <span>X<sub>B</sub> = X<sub>A</sub> + ΔX<sub>AB</sub></span>
              </div>
              <div className="text-sm text-neutral-700 mt-2">
                ΔY<sub>AB</sub> и ΔX<sub>AB</sub> се наричат <b>координатни разлики</b>.
              </div>
            </section>

            {/* Схема */}
            <section className="flex flex-col gap-2">
              <h2 className="text-2xl font-semibold text-black border-b pb-1">Графична илюстрация</h2>
              <div className="flex justify-center">
                <img src="/images/first-task-book-fig1.png" alt="Графика първа основна задача" className="w-full max-w-md my-2" />
              </div>
              <div className="text-center text-neutral-700 text-sm">Съгласно фиг. 21.1 координатите на т. B са:<br/>Y<sub>B</sub> = Y<sub>A</sub> + ΔY<sub>AB</sub>, X<sub>B</sub> = X<sub>A</sub> + ΔX<sub>AB</sub></div>
            </section>

            {/* Таблица със знаци */}
            <section className="flex flex-col gap-2">
              <h2 className="text-2xl font-semibold text-black border-b pb-1">Таблица за знаците</h2>
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
              <div className="text-sm text-neutral-700 mt-2">Знаците на координатните разлики зависят от големината на посочения ъгъл α<sub>AB</sub>.</div>
            </section>

            {/* Особености и бележки */}
            <section className="flex flex-col gap-2 mt-6">
              <h2 className="text-2xl font-semibold text-black border-b pb-1">Особености и бележки</h2>
              <ul className="list-disc ml-6 text-base text-neutral-700">
                <li>Посоченият ъгъл α<sub>AB</sub> може да бъде от 0 до 400g.</li>
                <li>Координатните разлики ΔY<sub>AB</sub> и ΔX<sub>AB</sub> се изчисляват чрез тригонометричните функции sin и cos за дадения ъгъл.</li>
                <li>Знаците на ΔY<sub>AB</sub> и ΔX<sub>AB</sub> се определят по таблицата по-горе.</li>
                <li>В електронните калкулатори често се използва директно формулата с тригонометричните функции.</li>
              </ul>
            </section>

            {/* Пример */}
            <section className="flex flex-col gap-2 mt-6">
              <h2 className="text-2xl font-semibold text-black border-b pb-1">Пример</h2>
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