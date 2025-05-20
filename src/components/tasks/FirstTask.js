import React, { useState, useEffect } from 'react';
import { saveCalculation, getRecentCalculations } from "../shared/historyService";
import { Helmet } from "react-helmet";
import Layout from '../layout/Layout';
import Breadcrumbs from '../layout/Breadcrumbs';

const PurvaZadacha = () => {
  const [form, setForm] = useState({ y1: '', x1: '', alpha: '', s: '' });
  const [result, setResult] = useState('Въведете данни и натиснете "Изчисли", за да видите резултати тук.');
  const [history, setHistory] = useState([]);

  useEffect(() => {
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
        {/* MOBILE LAYOUT */}
        <div className="block md:hidden w-full max-w-md mx-auto min-h-screen bg-stone-50 relative px-4 py-4">
          {/* Main Content */}
          <div className="flex flex-col justify-start items-start gap-6 w-full">
            <div className="self-stretch flex flex-col justify-start items-start gap-1">
              <div className="inline-flex items-center gap-3 w-full">
                {/* Back button */}
                <button className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-200 text-black focus:outline-none">
                  <svg width="20" height="20" fill="none" viewBox="0 0 20 20"><path d="M13 15l-5-5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
                <span className="text-black text-2xl font-bold font-['Manrope']">Първа основна задача</span>
              </div>
            </div>
            {/* Tab group above the form card - use desktop design, but only as wide as content */}
            <div className="p-1.5 bg-white rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex justify-start items-center gap-2 mb-2">
              <div data-property-1="Default" className="px-3 py-1 bg-gray-200 rounded flex justify-center items-center gap-2.5">
                <div className="justify-start text-black text-base font-medium font-['Manrope']">Инструмент</div>
              </div>
              <div data-property-1="Default" className="px-3 py-1 rounded flex justify-center items-center gap-2.5">
                <div className="justify-start text-neutral-400 text-base font-medium font-['Manrope']">Документация</div>
              </div>
            </div>
            <div className="self-stretch flex flex-col justify-start items-start gap-10 w-full">
              <div className="self-stretch flex flex-col justify-start items-start gap-5 w-full">
                {/* Form Card */}
                <div className="self-stretch p-3 bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 flex flex-col justify-center items-end gap-3 w-full">
                  <div className="self-stretch justify-start text-black text-base font-semibold font-['Manrope']">Входни данни</div>
                  <div className="self-stretch flex flex-col justify-start items-start gap-4 w-full">
                    {/* Y1 */}
                    <div className="self-stretch flex flex-col justify-start items-start gap-2 w-full">
                      <div className="justify-start text-black text-xs font-medium font-['Manrope']">Y₁ (координата)</div>
                      <input
                        type="number"
                        id="y1"
                        value={form.y1}
                        onChange={handleChange}
                        step="any"
                        className="self-stretch p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 text-neutral-400 text-xs font-medium font-['Manrope']"
                        placeholder="Въведете координата Y1"
                      />
                    </div>
                    {/* X1 */}
                    <div className="self-stretch flex flex-col justify-start items-start gap-2 w-full">
                      <div className="justify-start text-black text-xs font-medium font-['Manrope']">X₁ (координата)</div>
                      <input
                        type="number"
                        id="x1"
                        value={form.x1}
                        onChange={handleChange}
                        step="any"
                        className="self-stretch p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 text-neutral-400 text-xs font-medium font-['Manrope']"
                        placeholder="Въведете координата X1"
                      />
                    </div>
                    {/* Alpha */}
                    <div className="self-stretch flex flex-col justify-start items-start gap-2 w-full">
                      <div className="justify-start text-black text-xs font-medium font-['Manrope']">Ъгъл α (в гради)</div>
                      <input
                        type="number"
                        id="alpha"
                        value={form.alpha}
                        onChange={handleChange}
                        step="any"
                        className="self-stretch p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 text-neutral-400 text-xs font-medium font-['Manrope']"
                        placeholder="Въведете ъгъл α"
                      />
                    </div>
                    {/* S */}
                    <div className="self-stretch flex flex-col justify-start items-start gap-2 w-full">
                      <div className="justify-start text-black text-xs font-medium font-['Manrope']">Дължина S</div>
                      <input
                        type="number"
                        id="s"
                        value={form.s}
                        onChange={handleChange}
                        step="any"
                        className="self-stretch p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 text-neutral-400 text-xs font-medium font-['Manrope']"
                        placeholder="Въведете дължина S"
                      />
                    </div>
                  </div>
                  <div className="inline-flex justify-end items-center gap-3 w-full">
                    <button type="button" onClick={resetForm} className="px-4 py-2 bg-gray-200 rounded-lg flex justify-start items-center gap-3">
                      <div className="justify-start text-black text-sm font-medium font-['Manrope']">Нулирай</div>
                    </button>
                    <button type="button" onClick={calculate} className="px-4 py-2 bg-black rounded-lg flex justify-start items-center gap-3">
                      <div className="justify-start text-white text-sm font-medium font-['Manrope']">Изчисли</div>
                      <img src="/white_right_arrow.svg" alt="Изчисли" className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {/* Results Card */}
                <div className="self-stretch p-3 bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 flex flex-col justify-center items-end gap-3 w-full">
                  <div className="self-stretch justify-start text-black text-base font-semibold font-['Manrope']">Резултати</div>
                  <div className="self-stretch p-3 bg-stone-50 rounded-lg flex flex-col justify-start items-start w-full">
                    <div className="self-stretch justify-start text-neutral-400 text-sm font-medium font-['Manrope'] whitespace-pre-line">{result}</div>
                  </div>
                </div>
              </div>
              {/* History Table */}
              <div className="self-stretch flex flex-col justify-start items-start gap-3 w-full">
                <div className="justify-start text-black text-lg font-bold font-['Manrope']">История на изчисленията</div>
                <div className="self-stretch flex flex-col justify-start items-start gap-2.5 w-full">
                  <div className="w-full rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 flex flex-col justify-start items-start gap-px overflow-hidden">
                    <div className="self-stretch shadow-[0px_8px_24px_0px_rgba(0,0,0,0.04)] inline-flex justify-start items-start gap-px">
                      <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                        <div className="justify-start text-black text-sm font-medium font-['Manrope']">Y₁</div>
                      </div>
                      <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                        <div className="justify-start text-black text-sm font-medium font-['Manrope']">X₁</div>
                      </div>
                      <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                        <div className="justify-start text-black text-sm font-medium font-['Manrope']">α</div>
                      </div>
                      <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                        <div className="justify-start text-black text-sm font-medium font-['Manrope']">S</div>
                      </div>
                      <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                        <div className="justify-start text-black text-sm font-medium font-['Manrope']">Y₂</div>
                      </div>
                      <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                        <div className="justify-start text-black text-sm font-medium font-['Manrope']">X₂</div>
                      </div>
                      <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                        <div className="justify-start text-black text-sm font-medium font-['Manrope']">Дата</div>
                      </div>
                    </div>
                    {history.length === 0 ? (
                      <div className="w-full px-3 py-2 bg-white text-neutral-400 text-sm font-medium font-['Manrope']">Няма изчисления.</div>
                    ) : (
                      history.map((entry, idx) => (
                        <div key={idx} className="self-stretch inline-flex justify-start items-start gap-px">
                          <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                            <div className="justify-start text-neutral-400 text-sm font-medium font-['Manrope']">{entry.y1}</div>
                          </div>
                          <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                            <div className="justify-start text-neutral-400 text-sm font-medium font-['Manrope']">{entry.x1}</div>
                          </div>
                          <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                            <div className="justify-start text-neutral-400 text-sm font-medium font-['Manrope']">{entry.alpha}</div>
                          </div>
                          <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                            <div className="justify-start text-neutral-400 text-sm font-medium font-['Manrope']">{entry.s}</div>
                          </div>
                          <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                            <div className="justify-start text-neutral-400 text-sm font-medium font-['Manrope']">{entry.y2}</div>
                          </div>
                          <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                            <div className="justify-start text-neutral-400 text-sm font-medium font-['Manrope']">{entry.x2}</div>
                          </div>
                          <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                            <div className="justify-start text-neutral-400 text-sm font-medium font-['Manrope']">{new Date(entry.date).toLocaleString("bg-BG")}</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                {/* Pagination (static, for design) */}
                <div className="self-stretch inline-flex justify-center items-center gap-4 w-full">
                  <div className="flex justify-start items-center gap-2">
                    <div className="w-7 self-stretch px-2 py-1 rounded inline-flex flex-col justify-center items-center">
                      <img src="/small_left_arrow.svg" alt="Назад" className="w-3 h-3" />
                    </div>
                    <div className="w-7 px-2 py-1 bg-gray-200 rounded inline-flex flex-col justify-center items-center">
                      <div className="justify-start text-black text-sm font-medium font-['Manrope']">1</div>
                    </div>
                    <div className="w-7 px-2 py-1 rounded outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex flex-col justify-center items-center">
                      <div className="justify-start text-neutral-400 text-sm font-medium font-['Manrope']">2</div>
                    </div>
                    <div className="w-7 px-2 py-1 rounded outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex flex-col justify-center items-center">
                      <div className="justify-start text-neutral-400 text-sm font-medium font-['Manrope']">3</div>
                    </div>
                    <div className="w-7 px-2 py-1 rounded outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex flex-col justify-center items-center">
                      <div className="justify-start text-neutral-400 text-sm font-medium font-['Manrope']">4</div>
                    </div>
                    <div className="w-7 px-2 py-1 rounded outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex flex-col justify-center items-center">
                      <div className="justify-start text-neutral-400 text-sm font-medium font-['Manrope']">5</div>
                    </div>
                    <div className="w-7 self-stretch px-2 py-1 rounded inline-flex flex-col justify-center items-center">
                      <img src="/small_right_arrow.svg" alt="Напред" className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* DESKTOP LAYOUT */}
        <div className="hidden md:flex w-[1180px] mx-auto my-10 flex-col justify-start items-start gap-10">
          <div className="self-stretch flex flex-col justify-center items-start gap-10">
            {/* Breadcrumbs and Title */}
            <div className="w-[580px] flex flex-col justify-start items-start gap-4">
              <div className="flex flex-col justify-start items-start gap-1">
                <div className="justify-start"><span className="text-neutral-400 text-base font-medium font-['Manrope'] underline">Инструменти</span><span className="text-neutral-400 text-base font-medium font-['Manrope']"> &gt; Първа основна задача</span></div>
                <div className="justify-start text-black text-3xl font-bold font-['Manrope']">Първа основна задача</div>
              </div>
              <div className="p-1.5 bg-white rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex justify-start items-center gap-2">
                <div data-property-1="Default" className="px-3 py-1 bg-gray-200 rounded flex justify-center items-center gap-2.5">
                  <div className="justify-start text-black text-base font-medium font-['Manrope']">Инструмент</div>
                </div>
                <div data-property-1="Default" className="px-3 py-1 rounded flex justify-center items-center gap-2.5">
                  <div className="justify-start text-neutral-400 text-base font-medium font-['Manrope']">Документация</div>
                </div>
              </div>
            </div>
            {/* Form and Results */}
            <div className="self-stretch inline-flex justify-start items-start gap-5">
              {/* Form Card */}
              <div className="flex-1 p-4 bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex flex-col justify-center items-end gap-4">
                <div className="self-stretch justify-start text-black text-lg font-semibold font-['Manrope']">Входни данни</div>
                <div className="self-stretch flex flex-col justify-start items-start gap-4">
                  {/* Y1 */}
                  <div className="self-stretch flex flex-col justify-start items-start gap-2">
                    <div className="justify-start text-black text-sm font-medium font-['Manrope']">Y₁ (координата)</div>
                    <input
                      type="number"
                      id="y1"
                      value={form.y1}
                      onChange={handleChange}
                      step="any"
                      className="self-stretch p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 text-neutral-400 text-sm font-medium font-['Manrope']"
                      placeholder="Въведете координата Y1"
                    />
                  </div>
                  {/* X1 */}
                  <div className="self-stretch flex flex-col justify-start items-start gap-2">
                    <div className="justify-start text-black text-sm font-medium font-['Manrope']">X₁ (координата)</div>
                    <input
                      type="number"
                      id="x1"
                      value={form.x1}
                      onChange={handleChange}
                      step="any"
                      className="self-stretch p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 text-neutral-400 text-sm font-medium font-['Manrope']"
                      placeholder="Въведете координата X1"
                    />
                  </div>
                  {/* Alpha */}
                  <div className="self-stretch flex flex-col justify-start items-start gap-2">
                    <div className="justify-start text-black text-sm font-medium font-['Manrope']">Ъгъл α (в гради)</div>
                    <input
                      type="number"
                      id="alpha"
                      value={form.alpha}
                      onChange={handleChange}
                      step="any"
                      className="self-stretch p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 text-neutral-400 text-sm font-medium font-['Manrope']"
                      placeholder="Въведете ъгъл α"
                    />
                  </div>
                  {/* S */}
                  <div className="self-stretch flex flex-col justify-start items-start gap-2">
                    <div className="justify-start text-black text-sm font-medium font-['Manrope']">Дължина S</div>
                    <input
                      type="number"
                      id="s"
                      value={form.s}
                      onChange={handleChange}
                      step="any"
                      className="self-stretch p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 text-neutral-400 text-sm font-medium font-['Manrope']"
                      placeholder="Въведете дължина S"
                    />
                  </div>
                </div>
                <div className="inline-flex justify-start items-start gap-3">
                  {/* Scan button (inactive, with tooltip) */}
                  <button
                    type="button"
                    aria-disabled="true"
                    title="Тази функция е в процес на разработка и интеграция."
                    className="px-4 py-2 bg-gray-200 rounded-lg flex justify-start items-center gap-3 opacity-50 select-none cursor-not-allowed"
                  >
                    <img src="/scan_icon.svg" alt="Сканирай" className="w-4 h-4" />
                    <span className="justify-start text-black text-base font-medium font-['Manrope']">Сканирай</span>
                  </button>
                  {/* Reset button */}
                  <button type="button" onClick={resetForm} className="px-4 py-2 bg-gray-200 rounded-lg flex justify-start items-center gap-3">
                    <div className="justify-start text-black text-base font-medium font-['Manrope']">Нулирай</div>
                  </button>
                  {/* Calculate button */}
                  <button type="button" onClick={calculate} className="px-4 py-2 bg-black rounded-lg flex justify-start items-center gap-3">
                    <div className="justify-start text-white text-base font-medium font-['Manrope']">Изчисли</div>
                    <img src="/white_right_arrow.svg" alt="Изчисли" className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {/* Results Card */}
              <div className="flex-1 self-stretch p-4 bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex flex-col justify-center items-end gap-3">
                <div className="self-stretch justify-start text-black text-lg font-semibold font-['Manrope']">Резултати</div>
                <div className="self-stretch flex-1 p-3 bg-stone-50 rounded-lg flex flex-col justify-start items-start">
                  <div className="self-stretch justify-start text-neutral-400 text-sm font-medium font-['Manrope'] whitespace-pre-line">{result}</div>
                </div>
                <button
                  type="button"
                  className={`px-4 py-2 ${!result || result.includes('Въведете данни') ? 'opacity-20 cursor-not-allowed' : ''} bg-gray-200 rounded-lg inline-flex justify-start items-center gap-3`}
                  disabled={!result || result.includes('Въведете данни')}
                >
                  <img src="/download_icon.svg" alt="Изтегли" className="w-4 h-4" />
                  <div className="justify-start text-black text-base font-medium font-['Manrope']">Изтегли</div>
                </button>
              </div>
            </div>
          </div>
          {/* History Table */}
          <div className="self-stretch flex flex-col justify-start items-start gap-4">
            <div className="justify-start text-black text-2xl font-bold font-['Manrope']">История на изчисленията</div>
            <div className="self-stretch rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 flex flex-col justify-start items-start gap-px overflow-hidden">
              <div className="self-stretch shadow-[0px_8px_24px_0px_rgba(0,0,0,0.04)] inline-flex justify-start items-start gap-px">
                <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                  <div className="justify-start text-black text-sm font-medium font-['Manrope']">Y₁</div>
                </div>
                <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                  <div className="justify-start text-black text-sm font-medium font-['Manrope']">X₁</div>
                </div>
                <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                  <div className="justify-start text-black text-sm font-medium font-['Manrope']">α</div>
                </div>
                <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                  <div className="justify-start text-black text-sm font-medium font-['Manrope']">S</div>
                </div>
                <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                  <div className="justify-start text-black text-sm font-medium font-['Manrope']">Y₂</div>
                </div>
                <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                  <div className="justify-start text-black text-sm font-medium font-['Manrope']">X₂</div>
                </div>
                <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                  <div className="justify-start text-black text-sm font-medium font-['Manrope']">Дата</div>
                </div>
                <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                  <div className="justify-start text-black text-sm font-medium font-['Manrope']">Изтегли</div>
                </div>
              </div>
              {history.length === 0 ? (
                <div className="w-full px-3 py-2 bg-white text-neutral-400 text-sm font-medium font-['Manrope']">Няма изчисления.</div>
              ) : (
                history.map((entry, idx) => (
                  <div key={idx} className="self-stretch inline-flex justify-start items-start gap-px">
                    <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                      <div className="justify-start text-neutral-400 text-sm font-medium font-['Manrope']">{entry.y1}</div>
                    </div>
                    <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                      <div className="justify-start text-neutral-400 text-sm font-medium font-['Manrope']">{entry.x1}</div>
                    </div>
                    <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                      <div className="justify-start text-neutral-400 text-sm font-medium font-['Manrope']">{entry.alpha}</div>
                    </div>
                    <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                      <div className="justify-start text-neutral-400 text-sm font-medium font-['Manrope']">{entry.s}</div>
                    </div>
                    <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                      <div className="justify-start text-neutral-400 text-sm font-medium font-['Manrope']">{entry.y2}</div>
                    </div>
                    <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                      <div className="justify-start text-neutral-400 text-sm font-medium font-['Manrope']">{entry.x2}</div>
                    </div>
                    <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                      <div className="justify-start text-neutral-400 text-sm font-medium font-['Manrope']">{new Date(entry.date).toLocaleString("bg-BG")}</div>
                    </div>
                    <div className="flex-1 self-stretch px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                      <div className="w-3.5 h-3.5 bg-neutral-400" />
                    </div>
                  </div>
                ))
              )}
            </div>
            {/* Pagination (static, for design) */}
            <div className="self-stretch inline-flex justify-center items-center gap-4">
              <div className="flex justify-start items-center gap-2">
                <div className="w-7 self-stretch px-2 py-1 rounded inline-flex flex-col justify-center items-center">
                  <img src="/small_left_arrow.svg" alt="Назад" className="w-3 h-3" />
                </div>
                <div className="w-7 px-2 py-1 bg-gray-200 rounded inline-flex flex-col justify-center items-center">
                  <div className="justify-start text-black text-sm font-medium font-['Manrope']">1</div>
                </div>
                <div className="w-7 px-2 py-1 rounded outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex flex-col justify-center items-center">
                  <div className="justify-start text-neutral-400 text-sm font-medium font-['Manrope']">2</div>
                </div>
                <div className="w-7 px-2 py-1 rounded outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex flex-col justify-center items-center">
                  <div className="justify-start text-neutral-400 text-sm font-medium font-['Manrope']">3</div>
                </div>
                <div className="w-7 px-2 py-1 rounded outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex flex-col justify-center items-center">
                  <div className="justify-start text-neutral-400 text-sm font-medium font-['Manrope']">4</div>
                </div>
                <div className="w-7 px-2 py-1 rounded outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex flex-col justify-center items-center">
                  <div className="justify-start text-neutral-400 text-sm font-medium font-['Manrope']">5</div>
                </div>
                <div className="w-7 self-stretch px-2 py-1 rounded inline-flex flex-col justify-center items-center">
                  <img src="/small_right_arrow.svg" alt="Напред" className="w-3 h-3" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default PurvaZadacha;
