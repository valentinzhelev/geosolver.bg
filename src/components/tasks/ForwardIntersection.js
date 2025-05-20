import React, { useState, useEffect } from 'react';
import Layout from '../layout/Layout';
import { Helmet } from 'react-helmet';

const getHistory = () => {
  const data = localStorage.getItem('forwardIntersectionHistory');
  return data ? JSON.parse(data) : [];
};
const saveHistory = (entry) => {
  const history = getHistory();
  history.unshift(entry);
  localStorage.setItem('forwardIntersectionHistory', JSON.stringify(history.slice(0, 20)));
};

const ForwardIntersection = () => {
  const [form, setForm] = useState({ yA: '', xA: '', yB: '', xB: '', beta1: '', beta2: '' });
  const [result, setResult] = useState('Въведете данни и натиснете "Изчисли", за да видите резултати тук.');
  const [history, setHistory] = useState([]);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  const calculate = () => {
    const yA = parseFloat(form.yA);
    const xA = parseFloat(form.xA);
    const yB = parseFloat(form.yB);
    const xB = parseFloat(form.xB);
    const beta1 = parseFloat(form.beta1);
    const beta2 = parseFloat(form.beta2);
    if ([yA, xA, yB, xB, beta1, beta2].some(isNaN)) {
      alert('Моля, попълнете всички полета коректно.');
      return;
    }
    // Calculation logic (dummy for now)
    const output = `yA = ${yA}, xA = ${xA}\nyB = ${yB}, xB = ${xB}\nbeta1 = ${beta1}, beta2 = ${beta2}`;
    setResult(output);
    const entry = {
      yA, xA, yB, xB, beta1, beta2,
      date: new Date().toISOString(),
    };
    saveHistory(entry);
    setHistory(getHistory());
  };

  const resetForm = () => {
    setForm({ yA: '', xA: '', yB: '', xB: '', beta1: '', beta2: '' });
    setResult('Въведете данни и натиснете "Изчисли", за да видите резултати тук.');
  };

  // Table headers
  const tableHeaders = [
    { key: 'yA', label: 'Yₐ' },
    { key: 'xA', label: 'Xₐ' },
    { key: 'yB', label: 'Yᵦ' },
    { key: 'xB', label: 'Xᵦ' },
    { key: 'beta1', label: 'β₁' },
    { key: 'beta2', label: 'β₂' },
    { key: 'date', label: 'Дата' },
    { key: 'download', label: 'Изтегли' },
  ];

  return (
    <>
      <Helmet>
        <title>Права засечка – Геодезически калкулатор | GeoSolver</title>
        <meta name="description" content="Онлайн калкулатор за права засечка – изчисляване на координати чрез посока и разстояние от известна точка. Точни и бързи геодезически изчисления." />
        <meta name="keywords" content="права засечка, геодезически калкулатор, координати, геодезия, тахиметрия, геодезически изчисления, онлайн геодезия, GNSS, координатни системи" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="GeoSolver" />
      </Helmet>
      <Layout>
        {/* MOBILE LAYOUT */}
        <div className="block md:hidden w-full max-w-md mx-auto min-h-screen bg-stone-50 relative px-4 py-4">
          <div className="flex flex-col justify-start items-start gap-6 w-full">
            <div className="self-stretch flex flex-col justify-start items-start gap-1">
              <div className="inline-flex items-center gap-3 w-full">
                <button className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-200 text-black focus:outline-none">
                  <svg width="20" height="20" fill="none" viewBox="0 0 20 20"><path d="M13 15l-5-5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
                <span className="text-black text-2xl font-bold font-['Manrope']">Права засечка</span>
              </div>
            </div>
            <div className="p-1.5 bg-white rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex justify-start items-center gap-2 mb-2">
              <div className="px-3 py-1 bg-gray-200 rounded flex justify-center items-center gap-2.5">
                <div className="text-black text-base font-medium font-['Manrope']">Инструмент</div>
              </div>
              <div className="px-3 py-1 rounded flex justify-center items-center gap-2.5">
                <div className="text-neutral-400 text-base font-medium font-['Manrope']">Документация</div>
              </div>
            </div>
            <div className="self-stretch flex flex-col justify-start items-start gap-10 w-full">
              <div className="self-stretch flex flex-col justify-start items-start gap-5 w-full">
                {/* Form Card */}
                <div className="self-stretch p-3 bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 flex flex-col justify-center items-end gap-3 w-full">
                  <div className="self-stretch text-black text-base font-semibold font-['Manrope']">Входни данни</div>
                  <div className="self-stretch flex flex-col justify-start items-start gap-4 w-full">
                    {/* yA */}
                    <div className="self-stretch flex flex-col justify-start items-start gap-2 w-full">
                      <div className="text-black text-xs font-medium font-['Manrope']">Yₐ</div>
                      <input type="number" id="yA" value={form.yA} onChange={handleChange} step="any" className="self-stretch p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 text-neutral-400 text-xs font-medium font-['Manrope']" placeholder="Въведете Yₐ" />
                    </div>
                    {/* xA */}
                    <div className="self-stretch flex flex-col justify-start items-start gap-2 w-full">
                      <div className="text-black text-xs font-medium font-['Manrope']">Xₐ</div>
                      <input type="number" id="xA" value={form.xA} onChange={handleChange} step="any" className="self-stretch p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 text-neutral-400 text-xs font-medium font-['Manrope']" placeholder="Въведете Xₐ" />
                    </div>
                    {/* yB */}
                    <div className="self-stretch flex flex-col justify-start items-start gap-2 w-full">
                      <div className="text-black text-xs font-medium font-['Manrope']">Yᵦ</div>
                      <input type="number" id="yB" value={form.yB} onChange={handleChange} step="any" className="self-stretch p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 text-neutral-400 text-xs font-medium font-['Manrope']" placeholder="Въведете Yᵦ" />
                    </div>
                    {/* xB */}
                    <div className="self-stretch flex flex-col justify-start items-start gap-2 w-full">
                      <div className="text-black text-xs font-medium font-['Manrope']">Xᵦ</div>
                      <input type="number" id="xB" value={form.xB} onChange={handleChange} step="any" className="self-stretch p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 text-neutral-400 text-xs font-medium font-['Manrope']" placeholder="Въведете Xᵦ" />
                    </div>
                    {/* beta1 */}
                    <div className="self-stretch flex flex-col justify-start items-start gap-2 w-full">
                      <div className="text-black text-xs font-medium font-['Manrope']">β₁</div>
                      <input type="number" id="beta1" value={form.beta1} onChange={handleChange} step="any" className="self-stretch p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 text-neutral-400 text-xs font-medium font-['Manrope']" placeholder="Въведете β₁" />
                    </div>
                    {/* beta2 */}
                    <div className="self-stretch flex flex-col justify-start items-start gap-2 w-full">
                      <div className="text-black text-xs font-medium font-['Manrope']">β₂</div>
                      <input type="number" id="beta2" value={form.beta2} onChange={handleChange} step="any" className="self-stretch p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 text-neutral-400 text-xs font-medium font-['Manrope']" placeholder="Въведете β₂" />
                    </div>
                  </div>
                  <div className="inline-flex justify-end items-center gap-3 w-full">
                    <button type="button" onClick={resetForm} className="px-4 py-2 bg-gray-200 rounded-lg flex justify-start items-center gap-3">
                      <div className="text-black text-sm font-medium font-['Manrope']">Нулирай</div>
                    </button>
                    <button type="button" onClick={calculate} className="px-4 py-2 bg-black rounded-lg flex justify-start items-center gap-3">
                      <div className="text-white text-sm font-medium font-['Manrope']">Изчисли</div>
                      <img src="/white_right_arrow.svg" alt="Изчисли" className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {/* Results Card */}
                <div className="self-stretch p-3 bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 flex flex-col justify-center items-end gap-3 w-full">
                  <div className="self-stretch text-black text-base font-semibold font-['Manrope']">Резултати</div>
                  <div className="self-stretch p-3 bg-stone-50 rounded-lg flex flex-col justify-start items-start w-full">
                    <div className="self-stretch text-neutral-400 text-sm font-medium font-['Manrope'] whitespace-pre-line">{result}</div>
                  </div>
                </div>
              </div>
              {/* History Table */}
              <div className="self-stretch flex flex-col justify-start items-start gap-3">
                <div className="text-black text-lg font-bold font-['Manrope']">История на изчисленията</div>
                <div className="w-full overflow-x-auto">
                  <div className="min-w-[800px] rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-100 flex flex-col justify-start items-start overflow-hidden">
                    <div className="w-full shadow-[0px_8px_24px_0px_rgba(0,0,0,0.04)] inline-flex justify-start items-start gap-px bg-white">
                      {tableHeaders.map((h, i) => (
                        <div key={i} className="flex-1 px-3 py-2 bg-white flex justify-start items-center gap-2.5 border-r border-gray-100">
                          <div className="text-black text-sm font-medium font-['Manrope']">{h.label}</div>
                        </div>
                      ))}
                    </div>
                    {history.length === 0 ? (
                      <div className="w-full px-3 py-2 bg-[#FAFAFA] text-neutral-400 text-sm font-medium font-['Manrope'] border-b border-gray-100">Няма изчисления.</div>
                    ) : (
                      history.map((entry, idx) => (
                        <div key={idx} className="w-full inline-flex">
                          <div className="flex-1 px-3 py-2 bg-[#FAFAFA] flex justify-start items-center border-r border-b border-gray-100 gap-2.5">
                            <div className="text-neutral-400 text-sm font-medium font-['Manrope']">{entry.yA ?? ''}</div>
                          </div>
                          <div className="flex-1 px-3 py-2 bg-[#FAFAFA] flex justify-start items-center border-r border-b border-gray-100 gap-2.5">
                            <div className="text-neutral-400 text-sm font-medium font-['Manrope']">{entry.xA ?? ''}</div>
                          </div>
                          <div className="flex-1 px-3 py-2 bg-[#FAFAFA] flex justify-start items-center border-r border-b border-gray-100 gap-2.5">
                            <div className="text-neutral-400 text-sm font-medium font-['Manrope']">{entry.yB ?? ''}</div>
                          </div>
                          <div className="flex-1 px-3 py-2 bg-[#FAFAFA] flex justify-start items-center border-r border-b border-gray-100 gap-2.5">
                            <div className="text-neutral-400 text-sm font-medium font-['Manrope']">{entry.xB ?? ''}</div>
                          </div>
                          <div className="flex-1 px-3 py-2 bg-[#FAFAFA] flex justify-start items-center border-r border-b border-gray-100 gap-2.5">
                            <div className="text-neutral-400 text-sm font-medium font-['Manrope']">{entry.beta1 ?? ''}</div>
                          </div>
                          <div className="flex-1 px-3 py-2 bg-[#FAFAFA] flex justify-start items-center border-r border-b border-gray-100 gap-2.5">
                            <div className="text-neutral-400 text-sm font-medium font-['Manrope']">{entry.beta2 ?? ''}</div>
                          </div>
                          <div className="flex-1 px-3 py-2 bg-[#FAFAFA] flex justify-start items-center border-r border-b border-gray-100 gap-2.5">
                            <div className="text-neutral-400 text-sm font-medium font-['Manrope']">{entry.date ? (() => { const d = new Date(entry.date); return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth()+1).toString().padStart(2, '0')}/${d.getFullYear()}` })() : ''}</div>
                          </div>
                          <div className="flex-1 self-stretch px-3 py-2 bg-[#FAFAFA] flex justify-center items-center border-b border-gray-100 gap-2.5">
                            <button type="button" className="w-5 h-5 flex items-center justify-center rounded bg-gray-100 opacity-50 cursor-not-allowed">
                              <img src="/download_icon.svg" alt="Изтегли" className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                <div className="self-stretch inline-flex justify-center items-center gap-4 w-full mt-2">
                  <div className="flex justify-start items-center gap-2">
                    <div className="w-7 self-stretch px-2 py-1 rounded inline-flex flex-col justify-center items-center">
                      <img src="/small_left_arrow.svg" alt="Назад" className="w-3 h-3" />
                    </div>
                    <div className="w-7 px-2 py-1 bg-gray-200 rounded inline-flex flex-col justify-center items-center">
                      <div className="text-black text-sm font-medium font-['Manrope']">1</div>
                    </div>
                    <div className="w-7 px-2 py-1 rounded outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex flex-col justify-center items-center">
                      <div className="text-neutral-400 text-sm font-medium font-['Manrope']">2</div>
                    </div>
                    <div className="w-7 px-2 py-1 rounded outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex flex-col justify-center items-center">
                      <div className="text-neutral-400 text-sm font-medium font-['Manrope']">3</div>
                    </div>
                    <div className="w-7 px-2 py-1 rounded outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex flex-col justify-center items-center">
                      <div className="text-neutral-400 text-sm font-medium font-['Manrope']">4</div>
                    </div>
                    <div className="w-7 px-2 py-1 rounded outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex flex-col justify-center items-center">
                      <div className="text-neutral-400 text-sm font-medium font-['Manrope']">5</div>
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
                <div className="text-neutral-400 text-base font-medium font-['Manrope']">
                  <span className="underline">Инструменти</span><span> &gt; Права засечка</span>
                </div>
                <div className="text-black text-3xl font-bold font-['Manrope']">Права засечка</div>
              </div>
              <div className="p-1.5 bg-white rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex justify-start items-center gap-2">
                <div className="px-3 py-1 bg-gray-200 rounded flex justify-center items-center gap-2.5">
                  <div className="text-black text-base font-medium font-['Manrope']">Инструмент</div>
                </div>
                <div className="px-3 py-1 rounded flex justify-center items-center gap-2.5">
                  <div className="text-neutral-400 text-base font-medium font-['Manrope']">Документация</div>
                </div>
              </div>
            </div>
            {/* Form and Results */}
            <div className="self-stretch inline-flex justify-start items-start gap-5">
              {/* Form Card */}
              <div className="flex-1 p-4 bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex flex-col justify-center items-end gap-4">
                <div className="self-stretch text-black text-lg font-semibold font-['Manrope']">Входни данни</div>
                <div className="self-stretch flex flex-col justify-start items-start gap-4">
                  {/* yA */}
                  <div className="self-stretch flex flex-col justify-start items-start gap-2">
                    <div className="text-black text-sm font-medium font-['Manrope']">Yₐ</div>
                    <input type="number" id="yA" value={form.yA} onChange={handleChange} step="any" className="self-stretch p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 text-neutral-400 text-sm font-medium font-['Manrope']" placeholder="Въведете Yₐ" />
                  </div>
                  {/* xA */}
                  <div className="self-stretch flex flex-col justify-start items-start gap-2">
                    <div className="text-black text-sm font-medium font-['Manrope']">Xₐ</div>
                    <input type="number" id="xA" value={form.xA} onChange={handleChange} step="any" className="self-stretch p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 text-neutral-400 text-sm font-medium font-['Manrope']" placeholder="Въведете Xₐ" />
                  </div>
                  {/* yB */}
                  <div className="self-stretch flex flex-col justify-start items-start gap-2">
                    <div className="text-black text-sm font-medium font-['Manrope']">Yᵦ</div>
                    <input type="number" id="yB" value={form.yB} onChange={handleChange} step="any" className="self-stretch p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 text-neutral-400 text-sm font-medium font-['Manrope']" placeholder="Въведете Yᵦ" />
                  </div>
                  {/* xB */}
                  <div className="self-stretch flex flex-col justify-start items-start gap-2">
                    <div className="text-black text-sm font-medium font-['Manrope']">Xᵦ</div>
                    <input type="number" id="xB" value={form.xB} onChange={handleChange} step="any" className="self-stretch p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 text-neutral-400 text-sm font-medium font-['Manrope']" placeholder="Въведете Xᵦ" />
                  </div>
                  {/* beta1 */}
                  <div className="self-stretch flex flex-col justify-start items-start gap-2">
                    <div className="text-black text-sm font-medium font-['Manrope']">β₁</div>
                    <input type="number" id="beta1" value={form.beta1} onChange={handleChange} step="any" className="self-stretch p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 text-neutral-400 text-sm font-medium font-['Manrope']" placeholder="Въведете β₁" />
                  </div>
                  {/* beta2 */}
                  <div className="self-stretch flex flex-col justify-start items-start gap-2">
                    <div className="text-black text-sm font-medium font-['Manrope']">β₂</div>
                    <input type="number" id="beta2" value={form.beta2} onChange={handleChange} step="any" className="self-stretch p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 text-neutral-400 text-sm font-medium font-['Manrope']" placeholder="Въведете β₂" />
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
                <div className="self-stretch text-black text-lg font-semibold font-['Manrope']">Резултати</div>
                <div className="self-stretch flex-1 p-3 bg-stone-50 rounded-lg flex flex-col justify-start items-start">
                  <div className="self-stretch text-neutral-400 text-sm font-medium font-['Manrope'] whitespace-pre-line">{result}</div>
                </div>
                <button
                  type="button"
                  className={`px-4 py-2 ${!result || result.includes('Въведете данни') ? 'opacity-20 cursor-not-allowed' : ''} bg-gray-200 rounded-lg inline-flex justify-start items-center gap-3`}
                  disabled={!result || result.includes('Въведете данни')}
                >
                  <img src="/download_icon.svg" alt="Изтегли" className="w-4 h-4" />
                  <div className="text-black text-base font-medium font-['Manrope']">Изтегли</div>
                </button>
              </div>
            </div>
          </div>
          {/* History Table */}
          <div className="self-stretch flex flex-col justify-start items-start gap-4">
            <div className="text-black text-2xl font-bold font-['Manrope']">История на изчисленията</div>
            <div className="self-stretch w-full rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-100 flex flex-col justify-start items-start gap-px overflow-hidden">
              <div className="self-stretch shadow-[0px_8px_24px_0px_rgba(0,0,0,0.04)] inline-flex justify-start items-start gap-px bg-white w-full">
                {tableHeaders.map((h, i) => (
                  <div key={i} className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5 border-r border-gray-100">
                    <div className="text-black text-sm font-medium font-['Manrope']">{h.label}</div>
                  </div>
                ))}
              </div>
              {history.length === 0 ? (
                <div className="w-full px-3 py-2 bg-[#FAFAFA] text-neutral-400 text-sm font-medium font-['Manrope'] border-b border-gray-100">Няма изчисления.</div>
              ) : (
                history.map((entry, idx) => (
                  <div key={idx} className="inline-flex w-full">
                    <div className="flex-1 px-3 py-2 bg-[#FAFAFA] flex justify-center items-center border-r border-b border-gray-100 gap-2.5">
                      <div className="text-neutral-400 text-sm font-medium font-['Manrope']">{entry.yA ?? ''}</div>
                    </div>
                    <div className="flex-1 px-3 py-2 bg-[#FAFAFA] flex justify-center items-center border-r border-b border-gray-100 gap-2.5">
                      <div className="text-neutral-400 text-sm font-medium font-['Manrope']">{entry.xA ?? ''}</div>
                    </div>
                    <div className="flex-1 px-3 py-2 bg-[#FAFAFA] flex justify-center items-center border-r border-b border-gray-100 gap-2.5">
                      <div className="text-neutral-400 text-sm font-medium font-['Manrope']">{entry.yB ?? ''}</div>
                    </div>
                    <div className="flex-1 px-3 py-2 bg-[#FAFAFA] flex justify-center items-center border-r border-b border-gray-100 gap-2.5">
                      <div className="text-neutral-400 text-sm font-medium font-['Manrope']">{entry.xB ?? ''}</div>
                    </div>
                    <div className="flex-1 px-3 py-2 bg-[#FAFAFA] flex justify-center items-center border-r border-b border-gray-100 gap-2.5">
                      <div className="text-neutral-400 text-sm font-medium font-['Manrope']">{entry.beta1 ?? ''}</div>
                    </div>
                    <div className="flex-1 px-3 py-2 bg-[#FAFAFA] flex justify-center items-center border-r border-b border-gray-100 gap-2.5">
                      <div className="text-neutral-400 text-sm font-medium font-['Manrope']">{entry.beta2 ?? ''}</div>
                    </div>
                    <div className="flex-1 px-3 py-2 bg-[#FAFAFA] flex justify-center items-center border-r border-b border-gray-100 gap-2.5">
                      <div className="text-neutral-400 text-sm font-medium font-['Manrope']">{entry.date ? (() => { const d = new Date(entry.date); return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth()+1).toString().padStart(2, '0')}/${d.getFullYear()}` })() : ''}</div>
                    </div>
                    <div className="flex-1 self-stretch px-3 py-2 bg-[#FAFAFA] flex justify-center items-center border-b border-gray-100 gap-2.5">
                      <button type="button" className="w-5 h-5 flex items-center justify-center rounded bg-gray-100 opacity-50 cursor-not-allowed">
                        <img src="/download_icon.svg" alt="Изтегли" className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="self-stretch inline-flex justify-center items-center gap-4 w-full mt-2">
              <div className="flex justify-start items-center gap-2">
                <div className="w-7 self-stretch px-2 py-1 rounded inline-flex flex-col justify-center items-center">
                  <img src="/small_left_arrow.svg" alt="Назад" className="w-3 h-3" />
                </div>
                <div className="w-7 px-2 py-1 bg-gray-200 rounded inline-flex flex-col justify-center items-center">
                  <div className="text-black text-sm font-medium font-['Manrope']">1</div>
                </div>
                <div className="w-7 px-2 py-1 rounded outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex flex-col justify-center items-center">
                  <div className="text-neutral-400 text-sm font-medium font-['Manrope']">2</div>
                </div>
                <div className="w-7 px-2 py-1 rounded outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex flex-col justify-center items-center">
                  <div className="text-neutral-400 text-sm font-medium font-['Manrope']">3</div>
                </div>
                <div className="w-7 px-2 py-1 rounded outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex flex-col justify-center items-center">
                  <div className="text-neutral-400 text-sm font-medium font-['Manrope']">4</div>
                </div>
                <div className="w-7 px-2 py-1 rounded outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex flex-col justify-center items-center">
                  <div className="text-neutral-400 text-sm font-medium font-['Manrope']">5</div>
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

export default ForwardIntersection;
