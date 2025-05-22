import React, { useState, useEffect } from 'react';
import Layout from '../layout/Layout';
import { Helmet } from "react-helmet";
import { Link } from 'react-router-dom';

// Custom hook for typewriter effect
const useTypewriter = (text, speed = 12) => {
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const safeText = typeof text === 'string' ? text : (text ? String(text) : '');
    if (!safeText) {
      setDisplayText('');
      return;
    }
    setIsTyping(true);
    let currentIndex = 0;
    let cancelled = false;
    let buffer = '';
    let lastTime = performance.now();
    function typeNext(now) {
      if (cancelled) return;
      if (now - lastTime >= speed) {
        buffer += safeText[currentIndex] ?? '';
        setDisplayText(buffer);
        currentIndex++;
        lastTime = now;
      }
      if (currentIndex < safeText.length) {
        requestAnimationFrame(typeNext);
      } else {
        setIsTyping(false);
      }
    }
    setDisplayText('');
    requestAnimationFrame(typeNext);
    return () => { cancelled = true; };
  }, [text, speed]);
  return { displayText, isTyping };
};

// LocalStorage helpers
const getHistory = () => {
  const data = localStorage.getItem('secondTaskHistory');
  return data ? JSON.parse(data) : [];
};
const saveHistory = (entry) => {
  const history = getHistory();
  history.unshift(entry);
  localStorage.setItem('secondTaskHistory', JSON.stringify(history.slice(0, 20)));
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

// Helper for correct rounding to 4 decimals
const round4 = (num) => Math.round(num * 10000) / 10000;

/**
 * Втора основна геодезическа задача:
 * Дадени са координатите на две точки (X1, Y1) и (X2, Y2).
 * Изчисляват се: ΔX, ΔY, тангенс, табличен арктангенс, квадрант,
 * посочен ъгъл α (в гради) и дължина на отсечката S.
 * @param {number} x1 - X координата на точка 1
 * @param {number} y1 - Y координата на точка 1
 * @param {number} x2 - X координата на точка 2
 * @param {number} y2 - Y координата на точка 2
 * @returns {Object} Резултати: ΔX, ΔY, тангенс, табличен ъгъл, квадрант, α (gon), S (m)
 */
function vtoraOsnovnaZadacha(x1, y1, x2, y2) {
  const deltaX = x2 - x1;
  const deltaY = y2 - y1;
  const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);
  const tangens = deltaY / deltaX;
  const arctanTab = Math.atan(Math.abs(tangens)) * 200 / Math.PI;
  let quadrant;
  let alpha;
  if (deltaY >= 0 && deltaX >= 0) {
    quadrant = 1;
    alpha = arctanTab;
  } else if (deltaY >= 0 && deltaX < 0) {
    quadrant = 2;
    alpha = 200 - arctanTab;
  } else if (deltaY < 0 && deltaX < 0) {
    quadrant = 3;
    alpha = 200 + arctanTab;
  } else if (deltaY < 0 && deltaX >= 0) {
    quadrant = 4;
    alpha = 400 - arctanTab;
  }
  return {
    deltaX,
    deltaY,
    tangens,
    arctanTab,
    quadrant,
    alpha,
    distance
  };
}

const SecondTask = () => {
  const [form, setForm] = useState({ x1: '', y1: '', x2: '', y2: '' });
  const [resultText, setResultText] = useState('Въведете координати и натиснете "Изчисли", за да видите резултатите тук.');
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

  const isFormValid = () => {
    return (
      form.x1 !== '' && form.y1 !== '' && form.x2 !== '' && form.y2 !== '' &&
      !isNaN(parseFloat(form.x1)) && !isNaN(parseFloat(form.y1)) && !isNaN(parseFloat(form.x2)) && !isNaN(parseFloat(form.y2))
    );
  };

  const calculate = () => {
    const { x1, y1, x2, y2 } = form;
    const vals = [x1, y1, x2, y2].map(Number);
    if (vals.some(isNaN)) {
      alert('Моля, попълнете всички полета.');
      return;
    }
    const [X1, Y1, X2, Y2] = vals;
    const { deltaX, deltaY, tangens, arctanTab, quadrant, alpha, distance } = vtoraOsnovnaZadacha(X1, Y1, X2, Y2);
    const output = `--------- Втора основна геодезическа задача ---------
X1 = ${X1}, Y1 = ${Y1}
X2 = ${X2}, Y2 = ${Y2}
-------------------------------------
ΔX = ${deltaX.toFixed(2)}
ΔY = ${deltaY.toFixed(2)}
tg = ${tangens.toFixed(4)}
arctg (таблично) = ${round4(arctanTab).toFixed(4)} gon
Квадрант = ${quadrant}
-------------------------------------
α₁,₂ = ${round4(alpha).toFixed(4)} gon
S₁,₂ = ${distance.toFixed(2)} m
-------------------------------------`;
    setResultText(output);
    const entry = {
      x1: X1,
      y1: Y1,
      x2: X2,
      y2: Y2,
      alpha: round4(alpha).toFixed(4),
      s: distance.toFixed(2),
      date: new Date().toISOString(),
    };
    saveHistory(entry);
    setHistory(getHistory());
  };

  const resetForm = () => {
    setForm({ x1: '', y1: '', x2: '', y2: '' });
    setResultText('Въведете координати и натиснете "Изчисли", за да видите резултатите тук.');
  };

  const handleDownload = (entry) => {
    const text = `X1: ${entry.x1}\nY1: ${entry.y1}\nX2: ${entry.x2}\nY2: ${entry.y2}\nα: ${entry.alpha}\nS: ${entry.s}\nДата: ${(() => { const d = new Date(entry.date); return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth()+1).toString().padStart(2, '0')}/${d.getFullYear()}` })()}`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `geosolver_result_${entry.x1}_${entry.y1}_${entry.x2}_${entry.y2}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Get last calculated alpha/s for export
  const lastAlpha = history[0]?.alpha || '';
  const lastS = history[0]?.s || '';

  return (
    <>
      <Helmet>
        <title>Втора основна задача – Изчисляване на ъгъл и разстояние между две точки | GeoSolver</title>
        <meta name="description" content="Онлайн калкулатор за изчисляване на ъгъл и разстояние между две точки по координати. Бързо и лесно геодезическо изчисление за професионалисти." />
        <meta name="keywords" content="геодезия, ъгъл между две точки, разстояние, геодезически калкулатор, координати, онлайн изчисления, тахиметрия, GNSS, аналитична геодезия" />
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
                  <svg width="20" height="20" fill="none" viewBox="0 0 20 20"><path d="M13 15l-5-5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>
                <span className="text-black text-2xl font-bold font-['Manrope']">Втора основна задача</span>
              </div>
            </div>
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
                    {/* X1 */}
                    <div className="self-stretch flex flex-col justify-start items-start gap-2 w-full">
                      <div className="justify-start text-black text-xs font-medium font-['Manrope']">X₁</div>
                      <input type="number" id="x1" value={form.x1} onChange={handleChange} step="any" className="self-stretch p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 text-neutral-400 text-xs font-medium font-['Manrope']" placeholder="Въведете X₁" list="x1-history" />
                      <datalist id="x1-history">{getInputHistory('x1').map((v, i) => <option value={v} key={i} />)}</datalist>
                    </div>
                    {/* Y1 */}
                    <div className="self-stretch flex flex-col justify-start items-start gap-2 w-full">
                      <div className="justify-start text-black text-xs font-medium font-['Manrope']">Y₁</div>
                      <input type="number" id="y1" value={form.y1} onChange={handleChange} step="any" className="self-stretch p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 text-neutral-400 text-xs font-medium font-['Manrope']" placeholder="Въведете Y₁" list="y1-history" />
                      <datalist id="y1-history">{getInputHistory('y1').map((v, i) => <option value={v} key={i} />)}</datalist>
                    </div>
                    {/* X2 */}
                    <div className="self-stretch flex flex-col justify-start items-start gap-2 w-full">
                      <div className="justify-start text-black text-xs font-medium font-['Manrope']">X₂</div>
                      <input type="number" id="x2" value={form.x2} onChange={handleChange} step="any" className="self-stretch p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 text-neutral-400 text-xs font-medium font-['Manrope']" placeholder="Въведете X₂" list="x2-history" />
                      <datalist id="x2-history">{getInputHistory('x2').map((v, i) => <option value={v} key={i} />)}</datalist>
                    </div>
                    {/* Y2 */}
                    <div className="self-stretch flex flex-col justify-start items-start gap-2 w-full">
                      <div className="justify-start text-black text-xs font-medium font-['Manrope']">Y₂</div>
                      <input type="number" id="y2" value={form.y2} onChange={handleChange} step="any" className="self-stretch p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 text-neutral-400 text-xs font-medium font-['Manrope']" placeholder="Въведете Y₂" list="y2-history" />
                      <datalist id="y2-history">{getInputHistory('y2').map((v, i) => <option value={v} key={i} />)}</datalist>
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
                <div className="self-stretch p-3 bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 flex flex-col justify-center items-end gap-3 w-full">
                  <div className="self-stretch justify-start text-black text-base font-semibold font-['Manrope']">Резултати</div>
                  <div className="self-stretch p-3 bg-stone-50 rounded-lg flex flex-col justify-start items-start w-full">
                    <div className="self-stretch justify-start text-neutral-400 text-sm font-medium font-['Manrope'] whitespace-pre-line">
                      {displayText}
                      {isTyping && <span className="animate-pulse">|</span>}
                    </div>
                  </div>
                </div>
              </div>
              {/* History Table */}
              <div className="self-stretch flex flex-col justify-start items-start gap-3 w-full">
                <div className="justify-start text-black text-lg font-bold font-['Manrope']">История на изчисленията</div>
                <div className="self-stretch flex flex-col justify-start items-start gap-2.5 w-full">
                  <div className="w-full overflow-x-auto">
                    <div className="min-w-[800px] rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 flex flex-col justify-start items-start gap-px overflow-hidden">
                      <div className="self-stretch shadow-[0px_8px_24px_0px_rgba(0,0,0,0.04)] inline-flex justify-start items-start gap-px bg-white">
                        <div className="flex-1 px-3 py-2 min-w-[80px] flex justify-center items-center gap-2.5 text-center border-r border-gray-200">
                          <div className="text-black text-sm font-medium font-['Manrope'] text-center">X₁</div>
                        </div>
                        <div className="flex-1 px-3 py-2 min-w-[80px] flex justify-center items-center gap-2.5 text-center border-r border-gray-200">
                          <div className="text-black text-sm font-medium font-['Manrope'] text-center">Y₁</div>
                        </div>
                        <div className="flex-1 px-3 py-2 min-w-[80px] flex justify-center items-center gap-2.5 text-center border-r border-gray-200">
                          <div className="text-black text-sm font-medium font-['Manrope'] text-center">X₂</div>
                        </div>
                        <div className="flex-1 px-3 py-2 min-w-[80px] flex justify-center items-center gap-2.5 text-center border-r border-gray-200">
                          <div className="text-black text-sm font-medium font-['Manrope'] text-center">Y₂</div>
                        </div>
                        <div className="flex-1 px-3 py-2 min-w-[80px] flex justify-center items-center gap-2.5 text-center border-r border-gray-200">
                          <div className="text-black text-sm font-medium font-['Manrope'] text-center">α</div>
                        </div>
                        <div className="flex-1 px-3 py-2 min-w-[80px] flex justify-center items-center gap-2.5 text-center border-r border-gray-200">
                          <div className="text-black text-sm font-medium font-['Manrope'] text-center">S</div>
                        </div>
                        <div className="flex-1 px-3 py-2 min-w-[80px] flex justify-center items-center gap-2.5 text-center border-r border-gray-200">
                          <div className="text-black text-sm font-medium font-['Manrope'] text-center">Дата</div>
                        </div>
                      </div>
                      {paginatedHistory.length === 0 ? (
                        <div className="w-full px-3 py-2 bg-white text-neutral-400 text-sm font-medium font-['Manrope']">Няма изчисления.</div>
                      ) : (
                        paginatedHistory.map((entry, idx) => (
                          <div key={idx} className="self-stretch inline-flex justify-start items-start gap-px">
                            <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                              <div className="justify-start text-neutral-400 text-sm font-medium font-['Manrope']">{entry.x1}</div>
                            </div>
                            <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                              <div className="justify-start text-neutral-400 text-sm font-medium font-['Manrope']">{entry.y1}</div>
                            </div>
                            <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                              <div className="justify-start text-neutral-400 text-sm font-medium font-['Manrope']">{entry.x2}</div>
                            </div>
                            <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                              <div className="justify-start text-neutral-400 text-sm font-medium font-['Manrope']">{entry.y2}</div>
                            </div>
                            <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                              <div className="justify-start text-neutral-400 text-sm font-medium font-['Manrope']">{entry.alpha}</div>
                            </div>
                            <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                              <div className="justify-start text-neutral-400 text-sm font-medium font-['Manrope']">{entry.s}</div>
                            </div>
                            <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                              <div className="justify-start text-neutral-400 text-sm font-medium font-['Manrope']">{(() => { const d = new Date(entry.date); return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth()+1).toString().padStart(2, '0')}/${d.getFullYear()}` })()}</div>
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
        {/* DESKTOP LAYOUT */}
        <div className="hidden md:flex w-[1180px] mx-auto my-10 flex-col justify-start items-start gap-10">
          <div className="self-stretch flex flex-col justify-center items-start gap-10">
            {/* Breadcrumbs and Title */}
            <div className="w-[580px] flex flex-col justify-start items-start gap-4">
              <div className="flex flex-col justify-start items-start gap-1">
                <div className="justify-start"><Link to="/tools" className="text-neutral-400 text-base font-medium font-['Manrope'] underline hover:text-black">Инструменти</Link><span className="text-neutral-400 text-base font-medium font-['Manrope']"> &gt; Втора основна задача</span></div>
                <div className="justify-start text-black text-3xl font-bold font-['Manrope']">Втора основна задача</div>
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
                  {/* X1 */}
                  <div className="self-stretch flex flex-col justify-start items-start gap-2">
                    <div className="justify-start text-black text-sm font-medium font-['Manrope']">X₁</div>
                    <input type="number" id="x1" value={form.x1} onChange={handleChange} step="any" className="self-stretch p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 text-neutral-400 text-sm font-medium font-['Manrope']" placeholder="Въведете X₁" list="x1-history" />
                    <datalist id="x1-history">{getInputHistory('x1').map((v, i) => <option value={v} key={i} />)}</datalist>
                  </div>
                  {/* Y1 */}
                  <div className="self-stretch flex flex-col justify-start items-start gap-2">
                    <div className="justify-start text-black text-sm font-medium font-['Manrope']">Y₁</div>
                    <input type="number" id="y1" value={form.y1} onChange={handleChange} step="any" className="self-stretch p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 text-neutral-400 text-sm font-medium font-['Manrope']" placeholder="Въведете Y₁" list="y1-history" />
                    <datalist id="y1-history">{getInputHistory('y1').map((v, i) => <option value={v} key={i} />)}</datalist>
                  </div>
                  {/* X2 */}
                  <div className="self-stretch flex flex-col justify-start items-start gap-2">
                    <div className="justify-start text-black text-sm font-medium font-['Manrope']">X₂</div>
                    <input type="number" id="x2" value={form.x2} onChange={handleChange} step="any" className="self-stretch p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 text-neutral-400 text-sm font-medium font-['Manrope']" placeholder="Въведете X₂" list="x2-history" />
                    <datalist id="x2-history">{getInputHistory('x2').map((v, i) => <option value={v} key={i} />)}</datalist>
                  </div>
                  {/* Y2 */}
                  <div className="self-stretch flex flex-col justify-start items-start gap-2">
                    <div className="justify-start text-black text-sm font-medium font-['Manrope']">Y₂</div>
                    <input type="number" id="y2" value={form.y2} onChange={handleChange} step="any" className="self-stretch p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 text-neutral-400 text-sm font-medium font-['Manrope']" placeholder="Въведете Y₂" list="y2-history" />
                    <datalist id="y2-history">{getInputHistory('y2').map((v, i) => <option value={v} key={i} />)}</datalist>
                  </div>
                </div>
                <div className="inline-flex justify-start items-start gap-3">
                  <button type="button" aria-disabled="true" title="Тази функция е в процес на разработка и интеграция." className="px-4 py-2 bg-gray-200 rounded-lg flex justify-start items-center gap-3 opacity-50 select-none cursor-not-allowed">
                    <img src="/icons/scan_icon.svg" alt="Сканирай" className="w-4 h-4" />
                    <span className="justify-start text-black text-base font-medium font-['Manrope']">Сканирай</span>
                  </button>
                  <button type="button" onClick={resetForm} className="px-4 py-2 bg-gray-200 rounded-lg flex justify-start items-center gap-3">
                    <div className="justify-start text-black text-base font-medium font-['Manrope']">Нулирай</div>
                  </button>
                  <button type="button" onClick={calculate} disabled={!isFormValid()} className={`px-4 py-2 bg-black rounded-lg flex justify-start items-center gap-3${!isFormValid() ? ' opacity-50 cursor-not-allowed' : ''}`}>
                    <div className="justify-start text-white text-base font-medium font-['Manrope']">Изчисли</div>
                    <img src="/icons/white_right_arrow.svg" alt="Изчисли" className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {/* Results Card */}
              <div className="flex-1 self-stretch p-4 bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex flex-col justify-center items-end gap-3">
                <div className="self-stretch justify-start text-black text-lg font-semibold font-['Manrope']">Резултати</div>
                <div className="self-stretch flex-1 p-3 bg-stone-50 rounded-lg flex flex-col justify-start items-start">
                  <div className="self-stretch justify-start text-neutral-400 text-sm font-medium font-['Manrope'] whitespace-pre-line">
                    {displayText}
                    {isTyping && <span className="animate-pulse">|</span>}
                  </div>
                </div>
                <button
                  type="button"
                  className={`px-4 py-2 ${!resultText || resultText.includes('Въведете координати') ? 'opacity-20 cursor-not-allowed' : ''} bg-gray-200 rounded-lg inline-flex justify-start items-center gap-3`}
                  disabled={!resultText || resultText.includes('Въведете координати')}
                  onClick={() => {
                    if (!resultText || resultText.includes('Въведете координати')) return;
                    handleDownload({
                      x1: form.x1,
                      y1: form.y1,
                      x2: form.x2,
                      y2: form.y2,
                      alpha: lastAlpha,
                      s: lastS,
                      date: new Date().toISOString(),
                    });
                  }}
                >
                  <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 4v12m0 0l-4-4m4 4l4-4M4 20h16" strokeLinecap="round" strokeLinejoin="round"/></svg>
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
                  <div className="justify-start text-black text-sm font-medium font-['Manrope']">X₁</div>
                </div>
                <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                  <div className="justify-start text-black text-sm font-medium font-['Manrope']">Y₁</div>
                </div>
                <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                  <div className="justify-start text-black text-sm font-medium font-['Manrope']">X₂</div>
                </div>
                <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                  <div className="justify-start text-black text-sm font-medium font-['Manrope']">Y₂</div>
                </div>
                <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                  <div className="justify-start text-black text-sm font-medium font-['Manrope']">α</div>
                </div>
                <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                  <div className="justify-start text-black text-sm font-medium font-['Manrope']">S</div>
                </div>
                <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                  <div className="justify-start text-black text-sm font-medium font-['Manrope']">Дата</div>
                </div>
                <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                  <div className="justify-start text-black text-sm font-medium font-['Manrope']">Изтегли</div>
                </div>
              </div>
              {paginatedHistory.length === 0 ? (
                <div className="w-full px-3 py-2 bg-white text-neutral-400 text-sm font-medium font-['Manrope']">Няма изчисления.</div>
              ) : (
                paginatedHistory.map((entry, idx) => (
                  <div key={idx} className="self-stretch inline-flex justify-start items-start gap-px">
                    <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                      <div className="justify-start text-neutral-400 text-sm font-medium font-['Manrope']">{entry.x1}</div>
                    </div>
                    <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                      <div className="justify-start text-neutral-400 text-sm font-medium font-['Manrope']">{entry.y1}</div>
                    </div>
                    <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                      <div className="justify-start text-neutral-400 text-sm font-medium font-['Manrope']">{entry.x2}</div>
                    </div>
                    <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                      <div className="justify-start text-neutral-400 text-sm font-medium font-['Manrope']">{entry.y2}</div>
                    </div>
                    <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                      <div className="justify-start text-neutral-400 text-sm font-medium font-['Manrope']">{entry.alpha}</div>
                    </div>
                    <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                      <div className="justify-start text-neutral-400 text-sm font-medium font-['Manrope']">{entry.s}</div>
                    </div>
                    <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                      <div className="justify-start text-neutral-400 text-sm font-medium font-['Manrope']">{(() => { const d = new Date(entry.date); return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth()+1).toString().padStart(2, '0')}/${d.getFullYear()}` })()}</div>
                    </div>
                    <div className="flex-1 self-stretch px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                      <button onClick={() => handleDownload(entry)} className="flex items-center justify-center"><svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 4v12m0 0l-4-4m4 4l4-4M4 20h16" strokeLinecap="round" strokeLinejoin="round"/></svg></button>
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
      </Layout>
    </>
  );
};

export default SecondTask;
