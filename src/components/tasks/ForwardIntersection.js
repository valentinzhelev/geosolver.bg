import React, { useState, useEffect } from 'react';
import Layout from '../layout/Layout';
import { Helmet } from 'react-helmet';

// Typewriter hook
const useTypewriter = (text, speed = 12) => {
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  useEffect(() => {
    if (!text) { setDisplayText(''); return; }
    setIsTyping(true);
    let i = 0, buffer = '', cancelled = false, last = performance.now();
    function typeNext(now) {
      if (cancelled) return;
      if (now - last >= speed) {
        buffer += text[i] ?? '';
        setDisplayText(buffer);
        i++; last = now;
      }
      if (i < text.length) requestAnimationFrame(typeNext);
      else setIsTyping(false);
    }
    setDisplayText('');
    requestAnimationFrame(typeNext);
    return () => { cancelled = true; };
  }, [text, speed]);
  return { displayText, isTyping };
};

// LocalStorage helpers
const getHistory = () => {
  try {
    const data = localStorage.getItem('forwardIntersectionHistory');
    return data ? JSON.parse(data) : [];
  } catch { return []; }
};
const saveHistory = (entry) => {
  const history = getHistory();
  history.unshift(entry);
  localStorage.setItem('forwardIntersectionHistory', JSON.stringify(history.slice(0, 20)));
};

// Добавям helpers за input history:
const getInputHistory = (key) => {
  try {
    const data = localStorage.getItem('inputHistory_' + key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const saveInputHistory = (key, value) => {
  if (!value) return;
  let history = getInputHistory(key);
  history = history.filter((v) => v !== value);
  history.unshift(value);
  if (history.length > 5) history = history.slice(0, 5);
  localStorage.setItem('inputHistory_' + key, JSON.stringify(history));
};

const initialForm = { yA: '', xA: '', yB: '', xB: '', beta1: '', beta2: '' };

/**
 * Изчислява координатите на точка P чрез права засечка
 * @param {number} yA - Y координата на точка A
 * @param {number} xA - X координата на точка A
 * @param {number} yB - Y координата на точка B
 * @param {number} xB - X координата на точка B
 * @param {number} beta1 - Ъгъл β₁ в гради
 * @param {number} beta2 - Ъгъл β₂ в гради
 * @returns {Object} Резултати от изчисленията
 */
function calculateForwardIntersection(yA, xA, yB, xB, beta1, beta2) {
  // Изчисляване на разликите в координатите
  const deltaY = yB - yA;
  const deltaX = xB - xA;

  // Изчисляване на табличния ъгъл
  const alphaABTablic = Math.abs(Math.atan(deltaY / deltaX) * (200 / Math.PI));
  
  // Определяне на квадранта и изчисляване на αAB
  let alphaAB = 0;
  if (deltaY > 0 && deltaX > 0) { // Първи квадрант
    alphaAB = alphaABTablic;
  } else if (deltaY > 0 && deltaX < 0) { // Втори квадрант
    alphaAB = 200 - alphaABTablic;
  } else if (deltaY < 0 && deltaX < 0) { // Трети квадрант
    alphaAB = 200 + alphaABTablic;
  } else if (deltaY < 0 && deltaX > 0) { // Четвърти квадрант
    alphaAB = 400 - alphaABTablic;
  }

  // Изчисляване на разстоянието SAB
  const sAB = Math.round(Math.sqrt(Math.pow(deltaY, 2) + Math.pow(deltaX, 2)) * 100) / 100;

  // Изчисляване на αBA
  const alphaBA = alphaAB > 200 ? alphaAB - 200 : alphaAB + 200;

  // Изчисляване на αAP и αBP
  const alphaAP = alphaAB - beta1;
  const alphaBP = alphaBA + beta2;

  // Константа за преобразуване от гради в радиани
  const r = 0.015708;

  // Изчисляване на ъглите в радиани
  const beta2R = beta2 * r;
  const beta1R = beta1 * r;
  const beta3R = (beta1 + beta2) * r;

  // Изчисляване на разстоянията SAP и SBP
  const sAP = Math.round((sAB * Math.sin(beta2R)) / Math.sin(beta3R) * 100) / 100;
  const sBP = Math.round((sAB * Math.sin(beta1R)) / Math.sin(beta3R) * 100) / 100;

  // Изчисляване на разликите в координатите
  const deltaX_AP = Math.round((sAP * Math.cos(alphaAP * r)) * 100) / 100;
  const deltaY_AP = Math.round((sAP * Math.sin(alphaAP * r)) * 100) / 100;
  const deltaX_BP = Math.round((sBP * Math.cos(alphaBP * r)) * 100) / 100;
  const deltaY_BP = Math.round((sBP * Math.sin(alphaBP * r)) * 100) / 100;

  // Изчисляване на координатите на точка P от двете посоки
  const xPrimP = xA + deltaX_AP;
  const yPrimP = yA + deltaY_AP;
  const xSecondP = xB + deltaX_BP;
  const ySecondP = yB + deltaY_BP;

  // Финални координати на точка P (средно аритметично)
  const xP = Math.round((xPrimP + xSecondP) / 2 * 100) / 100;
  const yP = Math.round((yPrimP + ySecondP) / 2 * 100) / 100;

  return {
    alphaAB: Math.round(alphaAB * 10000) / 10000,
    sAB,
    alphaAP: Math.round(alphaAP * 10000) / 10000,
    alphaBP: Math.round(alphaBP * 10000) / 10000,
    sAP,
    sBP,
    xP,
    yP
  };
}

const ForwardIntersection = () => {
  const [form, setForm] = useState(initialForm);
  const [resultText, setResultText] = useState('Въведете данни и натиснете "Изчисли", за да видите резултатите тук.');
  const [history, setHistory] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(history.length / itemsPerPage);
  const paginatedHistory = history.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const { displayText, isTyping } = useTypewriter(resultText);

  useEffect(() => { setHistory(getHistory()); }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.id]: e.target.value });
    saveInputHistory(e.target.id, e.target.value);
  };

  const isFormValid = () => Object.values(form).every(v => v !== '' && !isNaN(parseFloat(v)));

  const calculate = () => {
    const vals = Object.values(form).map(Number);
    if (vals.some(isNaN)) {
      alert('Моля, попълнете всички полета.');
      return;
    }
    const { yA, xA, yB, xB, beta1, beta2 } = form;
    const results = calculateForwardIntersection(
      Number(yA),
      Number(xA),
      Number(yB),
      Number(xB),
      Number(beta1),
      Number(beta2)
    );
    
    const output = `--------- Права засечка ---------
Yₐ = ${yA}, Xₐ = ${xA}
Yᵦ = ${yB}, Xᵦ = ${xB}
β₁ = ${beta1}, β₂ = ${beta2}
-------------------------------------
αAB = ${results.alphaAB} gon
SAB = ${results.sAB} m
αAP = ${results.alphaAP} gon
αBP = ${results.alphaBP} gon
SAP = ${results.sAP} m
SBP = ${results.sBP} m
-------------------------------------
Yₚ = ${results.yP} m
Xₚ = ${results.xP} m
-------------------------------------`;
    
    setResultText(output);
    const entry = { 
      ...form, 
      ...results,
      date: new Date().toISOString() 
    };
    saveHistory(entry);
    setHistory(getHistory());
  };

  const resetForm = () => {
    setForm(initialForm);
    setResultText('Въведете данни и натиснете "Изчисли", за да видите резултатите тук.');
  };

  const handleDownload = (entry) => {
    const text = `Yₐ: ${entry.yA}\nXₐ: ${entry.xA}\nYᵦ: ${entry.yB}\nXᵦ: ${entry.xB}\nβ₁: ${entry.beta1}\nβ₂: ${entry.beta2}\nДата: ${(() => { const d = new Date(entry.date); return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth()+1).toString().padStart(2, '0')}/${d.getFullYear()}` })()}`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `geosolver_result_${entry.yA}_${entry.xA}_${entry.yB}_${entry.xB}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Get last calculated values for export
  const lastEntry = history[0] || null;

  // Table headers
  const tableHeaders = [
    { key: 'yA', label: 'Yₐ' },
    { key: 'xA', label: 'Xₐ' },
    { key: 'yB', label: 'Yᵦ' },
    { key: 'xB', label: 'Xᵦ' },
    { key: 'beta1', label: 'β₁' },
    { key: 'beta2', label: 'β₂' },
    { key: 'date', label: 'Дата' },
    { key: 'download', label: 'Изтегли' }
  ];

  return (
    <>
      <Helmet>
        <title>Права засечка – Геодезически калкулатор | GeoSolver</title>
        <meta name="description" content="Онлайн калкулатор за права засечка – изчисляване на координати чрез посока и разстояние от известна точка. Точни и бързи геодезически изчисления." />
      </Helmet>
      <Layout>
        {/* DESKTOP LAYOUT */}
        <div className="hidden md:flex w-[1180px] mx-auto my-10 flex-col gap-10">
          <div className="flex flex-col justify-center items-start gap-10">
            {/* Breadcrumbs and Title */}
            <div className="w-[580px] flex flex-col justify-start items-start gap-4">
              <div className="flex flex-col justify-start items-start gap-1">
                <div className="justify-start text-black text-3xl font-bold font-['Manrope']">Права засечка</div>
              </div>
              <div className="p-1.5 bg-white rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex justify-start items-center gap-2">
                <div className="px-3 py-1 bg-gray-200 rounded flex justify-center items-center gap-2.5">
                  <div className="justify-start text-black text-base font-medium font-['Manrope']">Инструмент</div>
                </div>
                <div className="px-3 py-1 rounded flex justify-center items-center gap-2.5">
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
                  {/* Yₐ */}
                  <div className="self-stretch flex flex-col justify-start items-start gap-2">
                    <div className="justify-start text-black text-sm font-medium font-['Manrope']">Yₐ</div>
                    <input type="number" id="yA" value={form.yA} onChange={handleChange} className="self-stretch p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 text-neutral-400 text-sm font-medium font-['Manrope']" placeholder="Въведете Yₐ" list="yA-history" />
                    <datalist id="yA-history">{getInputHistory('yA').map((v, i) => <option value={v} key={i} />)}</datalist>
                  </div>
                  {/* Xₐ */}
                  <div className="self-stretch flex flex-col justify-start items-start gap-2">
                    <div className="justify-start text-black text-sm font-medium font-['Manrope']">Xₐ</div>
                    <input type="number" id="xA" value={form.xA} onChange={handleChange} className="self-stretch p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 text-neutral-400 text-sm font-medium font-['Manrope']" placeholder="Въведете Xₐ" list="xA-history" />
                    <datalist id="xA-history">{getInputHistory('xA').map((v, i) => <option value={v} key={i} />)}</datalist>
                  </div>
                  {/* Yᵦ */}
                  <div className="self-stretch flex flex-col justify-start items-start gap-2">
                    <div className="justify-start text-black text-sm font-medium font-['Manrope']">Yᵦ</div>
                    <input type="number" id="yB" value={form.yB} onChange={handleChange} className="self-stretch p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 text-neutral-400 text-sm font-medium font-['Manrope']" placeholder="Въведете Yᵦ" list="yB-history" />
                    <datalist id="yB-history">{getInputHistory('yB').map((v, i) => <option value={v} key={i} />)}</datalist>
                  </div>
                  {/* Xᵦ */}
                  <div className="self-stretch flex flex-col justify-start items-start gap-2">
                    <div className="justify-start text-black text-sm font-medium font-['Manrope']">Xᵦ</div>
                    <input type="number" id="xB" value={form.xB} onChange={handleChange} className="self-stretch p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 text-neutral-400 text-sm font-medium font-['Manrope']" placeholder="Въведете Xᵦ" list="xB-history" />
                    <datalist id="xB-history">{getInputHistory('xB').map((v, i) => <option value={v} key={i} />)}</datalist>
                  </div>
                  {/* β₁ */}
                  <div className="self-stretch flex flex-col justify-start items-start gap-2">
                    <div className="justify-start text-black text-sm font-medium font-['Manrope']">β₁</div>
                    <input type="number" id="beta1" value={form.beta1} onChange={handleChange} className="self-stretch p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 text-neutral-400 text-sm font-medium font-['Manrope']" placeholder="Въведете β₁" list="beta1-history" />
                    <datalist id="beta1-history">{getInputHistory('beta1').map((v, i) => <option value={v} key={i} />)}</datalist>
                  </div>
                  {/* β₂ */}
                  <div className="self-stretch flex flex-col justify-start items-start gap-2">
                    <div className="justify-start text-black text-sm font-medium font-['Manrope']">β₂</div>
                    <input type="number" id="beta2" value={form.beta2} onChange={handleChange} className="self-stretch p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 text-neutral-400 text-sm font-medium font-['Manrope']" placeholder="Въведете β₂" list="beta2-history" />
                    <datalist id="beta2-history">{getInputHistory('beta2').map((v, i) => <option value={v} key={i} />)}</datalist>
                  </div>
                </div>
                <div className="inline-flex justify-end items-center gap-3 w-full">
                  <button type="button" aria-disabled="true" title="Тази функция е в процес на разработка и интеграция." className="px-4 py-2 bg-gray-200 rounded-lg flex justify-start items-center gap-3 opacity-50 select-none cursor-not-allowed">
                    <img src="/icons/scan_icon.svg" alt="Сканирай" className="w-4 h-4" />
                    <span className="justify-start text-black text-sm font-medium font-['Manrope']">Сканирай</span>
                  </button>
                  <button type="button" onClick={resetForm} className="px-4 py-2 bg-gray-200 rounded-lg flex justify-start items-center gap-3">
                    <div className="justify-start text-black text-sm font-medium font-['Manrope']">Нулирай</div>
                  </button>
                  <button type="button" onClick={calculate} disabled={!isFormValid()} className={`px-4 py-2 bg-black rounded-lg flex justify-start items-center gap-3${!isFormValid() ? ' opacity-50 cursor-not-allowed' : ''}`}>
                    <div className="justify-start text-white text-sm font-medium font-['Manrope']">Изчисли</div>
                    <img src="/icons/white_right_arrow.svg" alt="Изчисли" className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {/* Results Card */}
              <div className="flex-1 self-stretch p-4 bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex flex-col justify-center items-end gap-3">
                <div className="self-stretch justify-start text-black text-lg font-semibold font-['Manrope']">Резултати</div>
                <div className="self-stretch flex-1 p-3 bg-stone-50 rounded-lg flex flex-col justify-start items-start">
                  <div className="self-stretch text-neutral-400 text-sm font-medium font-['Manrope'] whitespace-pre-line">{displayText}{isTyping && <span className="animate-pulse">|</span>}</div>
                </div>
                <button
                  type="button"
                  className={`px-4 py-2 ${!resultText || resultText.includes('Въведете данни') ? 'opacity-20 cursor-not-allowed' : ''} bg-gray-200 rounded-lg inline-flex justify-start items-center gap-3`}
                  disabled={!resultText || resultText.includes('Въведете данни')}
                  onClick={() => {
                    if (!resultText || resultText.includes('Въведете данни')) return;
                    handleDownload(lastEntry);
                  }}
                >
                  <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 4v12m0 0l-4-4m4 4l4-4M4 20h16" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <div className="justify-start text-black text-base font-medium font-['Manrope']">Изтегли</div>
                </button>
              </div>
            </div>
            {/* History Table */}
            <div className="self-stretch flex flex-col justify-start items-start gap-4">
              <div className="justify-start text-black text-2xl font-bold font-['Manrope']">История на изчисленията</div>
              <div className="self-stretch rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 flex flex-col justify-start items-start gap-px overflow-hidden">
                <div className="self-stretch shadow-[0px_8px_24px_0px_rgba(0,0,0,0.04)] inline-flex justify-start items-start gap-px">
                  {tableHeaders.map((h, i) => (
                    <div key={i} className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5 border-r border-gray-200">
                      <div className="text-black text-sm font-medium font-['Manrope']">{h.label}</div>
                    </div>
                  ))}
                </div>
                {paginatedHistory.length === 0 ? (
                  <div className="w-full px-3 py-2 bg-white text-neutral-400 text-sm font-medium font-['Manrope']">Няма изчисления.</div>
                ) : (
                  paginatedHistory.map((entry, idx) => (
                    <div key={idx} className="self-stretch inline-flex justify-start items-start gap-px">
                      <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                        <div className="justify-start text-neutral-400 text-sm font-medium font-['Manrope']">{entry.yA}</div>
                      </div>
                      <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                        <div className="justify-start text-neutral-400 text-sm font-medium font-['Manrope']">{entry.xA}</div>
                      </div>
                      <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                        <div className="justify-start text-neutral-400 text-sm font-medium font-['Manrope']">{entry.yB}</div>
                      </div>
                      <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                        <div className="justify-start text-neutral-400 text-sm font-medium font-['Manrope']">{entry.xB}</div>
                      </div>
                      <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                        <div className="justify-start text-neutral-400 text-sm font-medium font-['Manrope']">{entry.beta1}</div>
                      </div>
                      <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                        <div className="justify-start text-neutral-400 text-sm font-medium font-['Manrope']">{entry.beta2}</div>
                      </div>
                      <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                        <div className="justify-start text-neutral-400 text-sm font-medium font-['Manrope']">{(() => { const d = new Date(entry.date); return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth()+1).toString().padStart(2, '0')}/${d.getFullYear()}` })()}</div>
                      </div>
                      <div className="flex-1 self-stretch px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                        <button onClick={() => handleDownload(entry)} className="flex items-center justify-center">
                          <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M12 4v12m0 0l-4-4m4 4l4-4M4 20h16" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {/* Pagination */}
              <div className="self-stretch inline-flex justify-center items-center gap-4 w-full mt-2">
                <div className="flex justify-start items-center gap-2">
                  <button className="w-7 self-stretch px-2 py-1 rounded inline-flex flex-col justify-center items-center" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                    <img src="/icons/small_left_arrow.svg" alt="Назад" className="w-3 h-3 opacity-70" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button key={i} className={`w-7 px-2 py-1 rounded ${currentPage === i + 1 ? 'bg-gray-200 text-black' : 'outline outline-1 outline-offset-[-1px] outline-gray-200 text-neutral-400'} inline-flex flex-col justify-center items-center`} onClick={() => setCurrentPage(i + 1)} disabled={currentPage === i + 1}>
                      <div className="justify-start text-sm font-medium font-['Manrope']">{i + 1}</div>
                    </button>
                  ))}
                  <button className="w-7 self-stretch px-2 py-1 rounded inline-flex flex-col justify-center items-center" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0}>
                    <img src="/icons/small_right_arrow.svg" alt="Напред" className="w-3 h-3 opacity-70" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* MOBILE LAYOUT */}
        <div className="block md:hidden w-full max-w-md mx-auto min-h-screen bg-stone-50 relative px-4 py-4">
          <div className="flex flex-col justify-start items-start gap-6 w-full">
            <div className="self-stretch flex flex-col justify-start items-start gap-1">
              <div className="inline-flex items-center gap-3 w-full">
                <span className="text-black text-2xl font-bold font-['Manrope']">Права засечка</span>
              </div>
            </div>
            <div className="p-1.5 bg-white rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex justify-start items-center gap-2 mb-2">
              <div className="px-3 py-1 bg-gray-200 rounded flex justify-center items-center gap-2.5">
                <div className="justify-start text-black text-base font-medium font-['Manrope']">Инструмент</div>
              </div>
              <div className="px-3 py-1 rounded flex justify-center items-center gap-2.5">
                <div className="justify-start text-neutral-400 text-base font-medium font-['Manrope']">Документация</div>
              </div>
            </div>
            <div className="self-stretch flex flex-col justify-start items-start gap-10 w-full">
              <div className="self-stretch flex flex-col justify-start items-start gap-5 w-full">
                {/* Form Card */}
                <div className="self-stretch p-3 bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 flex flex-col justify-center items-end gap-3 w-full">
                  <div className="self-stretch justify-start text-black text-base font-semibold font-['Manrope']">Входни данни</div>
                  <div className="self-stretch flex flex-col justify-start items-start gap-4 w-full">
                    {/* Yₐ */}
                    <div className="self-stretch flex flex-col justify-start items-start gap-2">
                      <div className="justify-start text-black text-sm font-medium font-['Manrope']">Yₐ</div>
                      <input type="number" id="yA" value={form.yA} onChange={handleChange} className="self-stretch p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 text-neutral-400 text-sm font-medium font-['Manrope']" placeholder="Въведете Yₐ" list="yA-history-mobile" />
                      <datalist id="yA-history-mobile">{getInputHistory('yA').map((v, i) => <option value={v} key={i} />)}</datalist>
                    </div>
                    {/* Xₐ */}
                    <div className="self-stretch flex flex-col justify-start items-start gap-2">
                      <div className="justify-start text-black text-sm font-medium font-['Manrope']">Xₐ</div>
                      <input type="number" id="xA" value={form.xA} onChange={handleChange} className="self-stretch p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 text-neutral-400 text-sm font-medium font-['Manrope']" placeholder="Въведете Xₐ" list="xA-history-mobile" />
                      <datalist id="xA-history-mobile">{getInputHistory('xA').map((v, i) => <option value={v} key={i} />)}</datalist>
                    </div>
                    {/* Yᵦ */}
                    <div className="self-stretch flex flex-col justify-start items-start gap-2">
                      <div className="justify-start text-black text-sm font-medium font-['Manrope']">Yᵦ</div>
                      <input type="number" id="yB" value={form.yB} onChange={handleChange} className="self-stretch p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 text-neutral-400 text-sm font-medium font-['Manrope']" placeholder="Въведете Yᵦ" list="yB-history-mobile" />
                      <datalist id="yB-history-mobile">{getInputHistory('yB').map((v, i) => <option value={v} key={i} />)}</datalist>
                    </div>
                    {/* Xᵦ */}
                    <div className="self-stretch flex flex-col justify-start items-start gap-2">
                      <div className="justify-start text-black text-sm font-medium font-['Manrope']">Xᵦ</div>
                      <input type="number" id="xB" value={form.xB} onChange={handleChange} className="self-stretch p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 text-neutral-400 text-sm font-medium font-['Manrope']" placeholder="Въведете Xᵦ" list="xB-history-mobile" />
                      <datalist id="xB-history-mobile">{getInputHistory('xB').map((v, i) => <option value={v} key={i} />)}</datalist>
                    </div>
                    {/* β₁ */}
                    <div className="self-stretch flex flex-col justify-start items-start gap-2">
                      <div className="justify-start text-black text-sm font-medium font-['Manrope']">β₁</div>
                      <input type="number" id="beta1" value={form.beta1} onChange={handleChange} className="self-stretch p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 text-neutral-400 text-sm font-medium font-['Manrope']" placeholder="Въведете β₁" list="beta1-history-mobile" />
                      <datalist id="beta1-history-mobile">{getInputHistory('beta1').map((v, i) => <option value={v} key={i} />)}</datalist>
                    </div>
                    {/* β₂ */}
                    <div className="self-stretch flex flex-col justify-start items-start gap-2">
                      <div className="justify-start text-black text-sm font-medium font-['Manrope']">β₂</div>
                      <input type="number" id="beta2" value={form.beta2} onChange={handleChange} className="self-stretch p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 text-neutral-400 text-sm font-medium font-['Manrope']" placeholder="Въведете β₂" list="beta2-history-mobile" />
                      <datalist id="beta2-history-mobile">{getInputHistory('beta2').map((v, i) => <option value={v} key={i} />)}</datalist>
                    </div>
                  </div>
                  <div className="inline-flex justify-end items-center gap-3 w-full">
                    <button type="button" onClick={resetForm} className="px-4 py-2 bg-gray-200 rounded-lg flex justify-start items-center gap-3">
                      <div className="justify-start text-black text-sm font-medium font-['Manrope']">Нулирай</div>
                    </button>
                    <button type="button" onClick={calculate} disabled={!isFormValid()} className={`px-4 py-2 bg-black rounded-lg flex justify-start items-center gap-3${!isFormValid() ? ' opacity-50 cursor-not-allowed' : ''}`}> 
                      <div className="justify-start text-white text-sm font-medium font-['Manrope']">Изчисли</div>
                    </button>
                  </div>
                </div>
                {/* Results Card */}
                <div className="self-stretch p-3 bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 flex flex-col justify-center items-end gap-3 w-full">
                  <div className="self-stretch justify-start text-black text-base font-semibold font-['Manrope']">Резултати</div>
                  <div className="self-stretch p-3 bg-stone-50 rounded-lg flex flex-col justify-start items-start w-full">
                    <div className="self-stretch text-neutral-400 text-sm font-medium font-['Manrope'] whitespace-pre-line">{displayText}{isTyping && <span className="animate-pulse">|</span>}</div>
                  </div>
                </div>
              </div>
              {/* History Table */}
              <div className="self-stretch flex flex-col justify-start items-start gap-3 w-full">
                <div className="text-black text-lg font-bold font-['Manrope']">История на изчисленията</div>
                <div className="self-stretch flex flex-col justify-start items-start gap-2.5 w-full">
                  <div className="w-full overflow-x-auto">
                    <div className="min-w-[800px] rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 flex flex-col justify-start items-start gap-px overflow-hidden">
                      <div className="self-stretch shadow-[0px_8px_24px_0px_rgba(0,0,0,0.04)] inline-flex justify-start items-start gap-px bg-white">
                        {tableHeaders.map((h, i) => (
                          <div key={i} className="flex-1 px-3 py-2 min-w-[80px] flex justify-center items-center gap-2.5 text-center border-r border-gray-200">
                            <div className="text-black text-sm font-medium font-['Manrope'] text-center">{h.label}</div>
                          </div>
                        ))}
                      </div>
                      {paginatedHistory.length === 0 ? (
                        <div className="w-full px-3 py-2 bg-white text-neutral-400 text-sm font-medium font-['Manrope']">Няма изчисления.</div>
                      ) : (
                        paginatedHistory.map((entry, idx) => (
                          <div key={idx} className="self-stretch inline-flex justify-start items-start gap-px">
                            <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                              <div className="justify-start text-neutral-400 text-sm font-medium font-['Manrope']">{entry.yA}</div>
                            </div>
                            <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                              <div className="justify-start text-neutral-400 text-sm font-medium font-['Manrope']">{entry.xA}</div>
                            </div>
                            <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                              <div className="justify-start text-neutral-400 text-sm font-medium font-['Manrope']">{entry.yB}</div>
                            </div>
                            <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                              <div className="justify-start text-neutral-400 text-sm font-medium font-['Manrope']">{entry.xB}</div>
                            </div>
                            <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                              <div className="justify-start text-neutral-400 text-sm font-medium font-['Manrope']">{entry.beta1}</div>
                            </div>
                            <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                              <div className="justify-start text-neutral-400 text-sm font-medium font-['Manrope']">{entry.beta2}</div>
                            </div>
                            <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                              <div className="justify-start text-neutral-400 text-sm font-medium font-['Manrope']">{(() => { const d = new Date(entry.date); return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth()+1).toString().padStart(2, '0')}/${d.getFullYear()}` })()}</div>
                            </div>
                            <div className="flex-1 self-stretch px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                              <button onClick={() => handleDownload(entry)} className="flex items-center justify-center">
                                <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                  <path d="M12 4v12m0 0l-4-4m4 4l4-4M4 20h16" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
                {/* Pagination */}
                <div className="self-stretch inline-flex justify-center items-center gap-4 w-full mt-2">
                  <div className="flex justify-start items-center gap-2">
                    <button className="w-7 self-stretch px-2 py-1 rounded inline-flex flex-col justify-center items-center" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                      <img src="/icons/small_left_arrow.svg" alt="Назад" className="w-3 h-3 opacity-70" />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => (
                      <button key={i} className={`w-7 px-2 py-1 rounded ${currentPage === i + 1 ? 'bg-gray-200 text-black' : 'outline outline-1 outline-offset-[-1px] outline-gray-200 text-neutral-400'} inline-flex flex-col justify-center items-center`} onClick={() => setCurrentPage(i + 1)} disabled={currentPage === i + 1}>
                        <div className="justify-start text-sm font-medium font-['Manrope']">{i + 1}</div>
                      </button>
                    ))}
                    <button className="w-7 self-stretch px-2 py-1 rounded inline-flex flex-col justify-center items-center" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0}>
                      <img src="/icons/small_right_arrow.svg" alt="Напред" className="w-3 h-3 opacity-70" />
                    </button>
                  </div>
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
