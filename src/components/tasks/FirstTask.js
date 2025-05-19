import React, { useState, useEffect } from 'react';
import Layout from '../layout/Layout';
import { Link } from 'react-router-dom';
import { saveCalculation, getRecentCalculations } from "../shared/historyService";
import { Helmet } from "react-helmet";

const PurvaZadacha = () => {
  const [form, setForm] = useState({ y1: '', x1: '', alpha: '', s: '' });
  const [result, setResult] = useState('Въведете данни и натиснете "Изчисли", за да видите резултати тук.');
  const [history, setHistory] = useState([]);

  useEffect(() => {
    // Fetch history on mount
    getRecentCalculations().then(setHistory).catch(() => {});
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  const calculate = async () => {
    const y1 = parseFloat(form.y1);
    const x1 = parseFloat(form.x1);
    const alpha = parseFloat(form.alpha);
    const s = parseFloat(form.s);
    if (isNaN(y1) || isNaN(x1) || isNaN(alpha) || isNaN(s)) {
      alert("Моля, попълнете всички полета коректно.");
      return;
    }
    const alphaRad = alpha * Math.PI / 200;
    const sinAlpha = Math.sin(alphaRad);
    const cosAlpha = Math.cos(alphaRad);
    const y2 = y1 + s * sinAlpha;
    const x2 = x1 + s * cosAlpha;
    const output = `Y1 = ${y1}, X1 = ${x1}\nS = ${s}, α = ${alpha} gon\nα в радиани = ${alphaRad.toFixed(6)}\n---------------------------------------\nsin(α) = ${sinAlpha.toFixed(6)}\ncos(α) = ${cosAlpha.toFixed(6)}\n---------------------------------------\nY2 = ${y2.toFixed(2)}\nX2 = ${x2.toFixed(2)}`;
    setResult(output);
    try {
      await saveCalculation({ x1, y1, alpha, s, x2: parseFloat(x2.toFixed(2)), y2: parseFloat(y2.toFixed(2)), date: new Date() });
      getRecentCalculations().then(setHistory);
    } catch {}
  };

  const resetForm = () => {
    setForm({ y1: '', x1: '', alpha: '', s: '' });
    setResult('Въведете данни и натиснете "Изчисли", за да видите резултати тук.');
  };

  return (
    <>
      <Helmet>
        <title>Първа основна задача – Изчисляване по начална точка, ъгъл и дължина | GeoSolver</title>
        <meta name="description" content="Изчисляване на координати по начална точка, ъгъл и дължина с онлайн геодезически калкулатор. Бързи и точни решения за геодезисти." />
        <meta name="keywords" content="геодезия, онлайн калкулатор, първа основна задача, координати, ъгъл, дължина, трансформация, геодезически изчисления" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="GeoSolver" />
      </Helmet>
      <Layout>
        <div className="w-full min-h-screen bg-stone-50 overflow-hidden px-4 py-6 md:px-0 md:py-12">
          <div className="max-w-[1180px] mx-auto flex flex-col gap-6 md:gap-10">

            {/* Main Content Section */}
            <div className="w-full flex flex-col gap-6 md:gap-10">
              {/* Title and Tabs */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 bg-gray-200 rounded-lg flex items-center justify-center">
                    <img src="/left_arrow_dark.svg" alt="" className="w-4 h-4" />
                  </div>
                  <div className="text-black text-2xl md:text-3xl font-bold font-['Manrope']">Първа основна задача</div>
                </div>
                <div className="p-1.5 bg-white rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex items-center gap-2">
                  <div data-property-1="Default" className="px-3 py-1 bg-gray-200 rounded flex items-center gap-2.5">
                    <div className="text-black text-sm md:text-base font-medium font-['Manrope']">Инструмент</div>
                  </div>
                  <div data-property-1="Default" className="px-3 py-1 rounded-lg flex items-center gap-2.5">
                    <div className="text-neutral-400 text-sm md:text-base font-medium font-['Manrope']">Документация</div>
                  </div>
                </div>
              </div>

              {/* Form and Results - Responsive Stack */}
              <div className="flex flex-col md:flex-row gap-5">
                {/* Form Card */}
                <div className="w-full md:w-1/2 p-3 md:p-4 bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 flex flex-col justify-center items-end gap-3">
                  <div className="w-full text-black text-base md:text-lg font-semibold font-['Manrope']">Входни данни</div>
                  <div className="w-full flex flex-col gap-4">
                    {/* Y1 */}
                    <div className="w-full flex flex-col gap-2">
                      <label htmlFor="y1" className="text-black text-xs md:text-sm font-medium font-['Manrope']">Y₁ (координата)</label>
                      <input
                        type="number"
                        id="y1"
                        value={form.y1}
                        onChange={handleChange}
                        step="any"
                        className="w-full p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 text-neutral-400 text-xs md:text-sm font-medium font-['Manrope']"
                        placeholder="Въведете координата Y1"
                      />
                    </div>
                    {/* X1 */}
                    <div className="w-full flex flex-col gap-2">
                      <label htmlFor="x1" className="text-black text-xs md:text-sm font-medium font-['Manrope']">X₁ (координата)</label>
                      <input
                        type="number"
                        id="x1"
                        value={form.x1}
                        onChange={handleChange}
                        step="any"
                        className="w-full p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 text-neutral-400 text-xs md:text-sm font-medium font-['Manrope']"
                        placeholder="Въведете координата X1"
                      />
                    </div>
                    {/* Alpha */}
                    <div className="w-full flex flex-col gap-2">
                      <label htmlFor="alpha" className="text-black text-xs md:text-sm font-medium font-['Manrope']">Ъгъл α (в гради)</label>
                      <input
                        type="number"
                        id="alpha"
                        value={form.alpha}
                        onChange={handleChange}
                        step="any"
                        className="w-full p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 text-neutral-400 text-xs md:text-sm font-medium font-['Manrope']"
                        placeholder="Въведете ъгъл α"
                      />
                    </div>
                    {/* S */}
                    <div className="w-full flex flex-col gap-2">
                      <label htmlFor="s" className="text-black text-xs md:text-sm font-medium font-['Manrope']">Дължина S</label>
                      <input
                        type="number"
                        id="s"
                        value={form.s}
                        onChange={handleChange}
                        step="any"
                        className="w-full p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 text-neutral-400 text-xs md:text-sm font-medium font-['Manrope']"
                        placeholder="Въведете дължина S"
                      />
                    </div>
                  </div>
                  <div className="inline-flex justify-start items-start gap-3 mt-2">
                    <button type="button" onClick={resetForm} className="px-4 py-2 bg-gray-200 rounded-lg flex items-center gap-3">
                      <span className="text-black text-sm md:text-base font-medium font-['Manrope']">Нулирай</span>
                    </button>
                    <button type="button" onClick={calculate} className="px-4 py-2 bg-black rounded-lg flex items-center gap-3">
                      <span className="text-white text-sm md:text-base font-medium font-['Manrope']">Изчисли</span>
                      <img src="/right_arrow_icon.svg" alt="Изчисли" className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                {/* Results Card */}
                <div className="w-full md:w-1/2 p-3 md:p-4 bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 flex flex-col justify-center items-end gap-3 mt-4 md:mt-0">
                  <div className="w-full text-black text-base md:text-lg font-semibold font-['Manrope']">Резултати</div>
                  <div className="w-full p-3 bg-stone-50 rounded-lg flex flex-col justify-start items-start">
                    <div className="w-full text-neutral-400 text-xs md:text-sm font-medium font-['Manrope'] whitespace-pre-line">{result}</div>
                  </div>
                  <button
                    type="button"
                    className={`px-4 py-2 ${!result || result.includes('Въведете данни') ? 'opacity-20 cursor-not-allowed' : ''} bg-gray-200 rounded-lg flex items-center gap-3 mt-2`}
                    disabled={!result || result.includes('Въведете данни')}
                  >
                    <img src="/download_icon.svg" alt="Изтегли" className="w-4 h-4" />
                    <span className="text-black text-sm md:text-base font-medium font-['Manrope']">Изтегли</span>
                  </button>
                </div>
              </div>

              {/* History Table - Responsive */}
              <div className="w-full flex flex-col gap-3 mt-6">
                <div className="text-black text-lg md:text-2xl font-bold font-['Manrope']">История на изчисленията</div>
                <div className="w-full overflow-x-auto">
                  <div className="min-w-[600px] md:min-w-full rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 flex flex-col gap-px overflow-hidden">
                    <div className="shadow-[0px_8px_24px_0px_rgba(0,0,0,0.04)] flex justify-start items-start gap-px">
                      <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                        <div className="text-black text-xs md:text-sm font-medium font-['Manrope']">Y₁</div>
                      </div>
                      <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                        <div className="text-black text-xs md:text-sm font-medium font-['Manrope']">X₁</div>
                      </div>
                      <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                        <div className="text-black text-xs md:text-sm font-medium font-['Manrope']">α</div>
                      </div>
                      <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                        <div className="text-black text-xs md:text-sm font-medium font-['Manrope']">S</div>
                      </div>
                      <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                        <div className="text-black text-xs md:text-sm font-medium font-['Manrope']">Y₂</div>
                      </div>
                      <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                        <div className="text-black text-xs md:text-sm font-medium font-['Manrope']">X₂</div>
                      </div>
                      <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                        <div className="text-black text-xs md:text-sm font-medium font-['Manrope']">Дата</div>
                      </div>
                    </div>
                    {history.length === 0 ? (
                      <div className="w-full px-3 py-2 bg-white text-neutral-400 text-xs md:text-sm font-medium font-['Manrope']">Няма изчисления.</div>
                    ) : (
                      history.map((entry, idx) => (
                        <div key={idx} className="flex justify-start items-start gap-px">
                          <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                            <div className="text-neutral-400 text-xs md:text-sm font-medium font-['Manrope']">{entry.y1}</div>
                          </div>
                          <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                            <div className="text-neutral-400 text-xs md:text-sm font-medium font-['Manrope']">{entry.x1}</div>
                          </div>
                          <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                            <div className="text-neutral-400 text-xs md:text-sm font-medium font-['Manrope']">{entry.alpha}</div>
                          </div>
                          <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                            <div className="text-neutral-400 text-xs md:text-sm font-medium font-['Manrope']">{entry.s}</div>
                          </div>
                          <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                            <div className="text-neutral-400 text-xs md:text-sm font-medium font-['Manrope']">{entry.y2}</div>
                          </div>
                          <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                            <div className="text-neutral-400 text-xs md:text-sm font-medium font-['Manrope']">{entry.x2}</div>
                          </div>
                          <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                            <div className="text-neutral-400 text-xs md:text-sm font-medium font-['Manrope']">{new Date(entry.date).toLocaleString("bg-BG")}</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                {/* Pagination (static, for design) */}
                <div className="w-full flex justify-center items-center gap-2 mt-2">
                  <button className="w-7 h-7 flex items-center justify-center rounded" type="button">
                    <img src="/small_left_arrow.svg" alt="Назад" className="w-3 h-3" />
                  </button>
                  {[1,2,3,4,5].map((n) => (
                    <button key={n} className={`w-7 h-7 flex items-center justify-center rounded ${n===1 ? 'bg-gray-200 text-black' : 'outline outline-1 outline-gray-200 text-neutral-400'}`}>{n}</button>
                  ))}
                  <button className="w-7 h-7 flex items-center justify-center rounded" type="button">
                    <img src="/small_right_arrow.svg" alt="Напред" className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* Footer Section (optional, if not in Layout) */}
            {/* ...footer code if needed... */}
          </div>
        </div>
      </Layout>
    </>
  );
};

export default PurvaZadacha;
