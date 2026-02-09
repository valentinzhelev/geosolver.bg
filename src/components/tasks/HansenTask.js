import React, { useState, useEffect } from 'react';
import SEO from '../shared/SEO';
import Layout from '../layout/Layout';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import useTypewriter from '../../hooks/useTypewriter';
import { useAuth } from '../auth/AuthContext';

// Helpers for localStorage history for each input
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
  // Remove duplicates
  history = history.filter((v) => v !== value);
  history.unshift(value);
  if (history.length > 5) history = history.slice(0, 5);
  localStorage.setItem('inputHistory_' + key, JSON.stringify(history));
};

// Local history for HansenTask
const getHistory = () => {
  const data = localStorage.getItem('hansenTaskHistory');
  return data ? JSON.parse(data) : [];
};
const saveHistory = (entry) => {
  const history = getHistory();
  history.unshift(entry);
  localStorage.setItem('hansenTaskHistory', JSON.stringify(history.slice(0, 20)));
};

const HansenTask = () => {
  const [form, setForm] = useState({ yA: '', xA: '', yB: '', xB: '', alpha: '', beta: '' });
  const { t, language } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAuthenticated = !!user;
  const [resultText, setResultText] = useState(t.defaultResultText);
  const [history, setHistory] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(history.length / itemsPerPage);
  const paginatedHistory = history.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const { displayText, isTyping } = useTypewriter(resultText);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.id]: e.target.value });
    saveInputHistory(e.target.id, e.target.value);
  };

  const calculate = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    const yA = parseFloat(form.yA);
    const xA = parseFloat(form.xA);
    const yB = parseFloat(form.yB);
    const xB = parseFloat(form.xB);
    const alpha = parseFloat(form.alpha);
    const beta = parseFloat(form.beta);
    if (isNaN(yA) || isNaN(xA) || isNaN(yB) || isNaN(xB) || isNaN(alpha) || isNaN(beta)) {
      alert(language === 'bg' ? "Моля, попълнете всички полета коректно." : "Please fill in all fields correctly.");
      return;
    }

    const result = calculateHansenTask(xA, yA, xB, yB, alpha, beta);
    const output = language === 'bg' 
      ? `--------- Задача на Хансен (Enhanced) ---------
YA = ${result.yA}, XA = ${result.xA}
YB = ${result.yB}, XB = ${result.xB}
α = ${result.alpha} gon, β = ${result.beta} gon
------------------------------------------------------
Разстояние AB = ${result.distanceAB.toFixed(3)} м
Ъгъл AB = ${result.angleAB.toFixed(6)} rad
------------------------------------------------------
sin(α) = ${result.sinAlpha}
sin(α + β) = ${result.sinAlphaBeta}
Коефициент = ${result.coefficient}
------------------------------------------------------
Координатни разлики:
ΔX = ${result.deltaX.toFixed(3)} м
ΔY = ${result.deltaY.toFixed(3)} м
------------------------------------------------------
YP = YA + ΔY = ${result.yA} + ${result.deltaY.toFixed(3)} = ${result.yP} м
XP = XA + ΔX = ${result.xA} + ${result.deltaX.toFixed(3)} = ${result.xP} м
------------------------------------------------------
Проверка - разстояние AP: ${result.distanceAP.toFixed(3)} м
Проверка - разстояние BP: ${result.distanceBP.toFixed(3)} м
------------------------------------------------------`
      : `--------- Hansen Task (Enhanced) ---------
YA = ${result.yA}, XA = ${result.xA}
YB = ${result.yB}, XB = ${result.xB}
α = ${result.alpha} gon, β = ${result.beta} gon
------------------------------------------------------
Distance AB = ${result.distanceAB.toFixed(3)} m
Angle AB = ${result.angleAB.toFixed(6)} rad
------------------------------------------------------
sin(α) = ${result.sinAlpha}
sin(α + β) = ${result.sinAlphaBeta}
Coefficient = ${result.coefficient}
------------------------------------------------------
Coordinate differences:
ΔX = ${result.deltaX.toFixed(3)} m
ΔY = ${result.deltaY.toFixed(3)} m
------------------------------------------------------
YP = YA + ΔY = ${result.yA} + ${result.deltaY.toFixed(3)} = ${result.yP} m
XP = XA + ΔX = ${result.xA} + ${result.deltaX.toFixed(3)} = ${result.xP} m
------------------------------------------------------
Check - distance AP: ${result.distanceAP.toFixed(3)} m
Check - distance BP: ${result.distanceBP.toFixed(3)} m
------------------------------------------------------`;
    
    setResultText(output ? String(output) : "");
    // Save to local history
    const entry = {
      yA: result.yA,
      xA: result.xA,
      yB: result.yB,
      xB: result.xB,
      alpha: result.alpha,
      beta: result.beta,
      yP: parseFloat(result.yP.toFixed(2)),
      xP: parseFloat(result.xP.toFixed(2)),
      date: new Date().toISOString(),
    };
    saveHistory(entry);
    setHistory(getHistory());
  };

  /**
   * Задача на Хансен (Enhanced):
   * Изчислява координатите на неизвестна точка чрез ъглово преместване от две известни точки
   * 
   * Формули:
   * P = A + (B - A) * (sin(α) / sin(α + β))
   * 
   * @param {number} xA - X координата на точка A
   * @param {number} yA - Y координата на точка A
   * @param {number} xB - X координата на точка B
   * @param {number} yB - Y координата на точка B
   * @param {number} alpha - Ъгъл α в гради
   * @param {number} beta - Ъгъл β в гради
   * @returns {Object} Резултати от изчисленията
   */
  const calculateHansenTask = (xA, yA, xB, yB, alpha, beta) => {
    // Validate input data
    if (xA === xB && yA === yB) {
      throw new Error('Точките A и B не могат да съвпадат');
    }

    // Gon to radians
    const alphaRad = alpha * Math.PI / 200;
    const betaRad = beta * Math.PI / 200;

    // Distance A-B
    const distanceAB = Math.sqrt((xB - xA) ** 2 + (yB - yA) ** 2);

    // Line AB angle
    const angleAB = Math.atan2(yB - yA, xB - xA);

    // Trig functions
    const sinAlpha = Math.sin(alphaRad);
    const sinAlphaBeta = Math.sin(alphaRad + betaRad);

    // Coefficient
    const coefficient = sinAlpha / sinAlphaBeta;

    // Coordinate differences
    const deltaX = (xB - xA) * coefficient;
    const deltaY = (yB - yA) * coefficient;

    // Point P coordinates
    const xP = xA + deltaX;
    const yP = yA + deltaY;

    // Verification - distances
    const distanceAP = Math.sqrt((xP - xA) ** 2 + (yP - yA) ** 2);
    const distanceBP = Math.sqrt((xP - xB) ** 2 + (yP - yB) ** 2);

    return {
      xA, yA, xB, yB, alpha, beta,
      distanceAB,
      angleAB,
      sinAlpha: Math.round(sinAlpha * 1000000) / 1000000,
      sinAlphaBeta: Math.round(sinAlphaBeta * 1000000) / 1000000,
      coefficient: Math.round(coefficient * 1000000) / 1000000,
      deltaX: Math.round(deltaX * 1000) / 1000,
      deltaY: Math.round(deltaY * 1000) / 1000,
      xP: Math.round(xP * 1000) / 1000,
      yP: Math.round(yP * 1000) / 1000,
      distanceAP: Math.round(distanceAP * 1000) / 1000,
      distanceBP: Math.round(distanceBP * 1000) / 1000
    };
  };

  const resetForm = () => {
    setForm({ yA: '', xA: '', yB: '', xB: '', alpha: '', beta: '' });
    setResultText(t.defaultResultText);
  };

  const handleDownload = (entry) => {
    const text = language === 'bg'
      ? `YA: ${entry.yA}\nXA: ${entry.xA}\nYB: ${entry.yB}\nXB: ${entry.xB}\nα: ${entry.alpha}\nβ: ${entry.beta}\nYP: ${entry.yP}\nXP: ${entry.xP}\nДата: ${(() => { const d = new Date(entry.date); return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth()+1).toString().padStart(2, '0')}/${d.getFullYear()}` })()}`
      : `YA: ${entry.yA}\nXA: ${entry.xA}\nYB: ${entry.yB}\nXB: ${entry.xB}\nα: ${entry.alpha}\nβ: ${entry.beta}\nYP: ${entry.yP}\nXP: ${entry.xP}\nDate: ${(() => { const d = new Date(entry.date); return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth()+1).toString().padStart(2, '0')}/${d.getFullYear()}` })()}`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `result_${entry.yA}_${entry.xA}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Check all fields filled
  const isFormValid = () => {
    return (
      form.yA !== '' &&
      form.xA !== '' &&
      form.yB !== '' &&
      form.xB !== '' &&
      form.alpha !== '' &&
      form.beta !== '' &&
      !isNaN(parseFloat(form.yA)) &&
      !isNaN(parseFloat(form.xA)) &&
      !isNaN(parseFloat(form.yB)) &&
      !isNaN(parseFloat(form.xB)) &&
      !isNaN(parseFloat(form.alpha)) &&
      !isNaN(parseFloat(form.beta))
    );
  };

  return (
    <>
      <SEO
        title="Задача на Хансен – Ъглово преместване"
        description="Изчисляване на координати чрез задача на Хансен с онлайн геодезически калкулатор. Бързи и точни решения за геодезисти."
        keywords="геодезия, онлайн калкулатор, задача на хансен, координати, ъглово преместване, геодезически изчисления"
        canonical="/tools/hansen-task"
      />
      <Layout>
        {/* MOBILE LAYOUT */}
        <div className="block md:hidden w-full max-w-md mx-auto min-h-screen bg-stone-50 relative px-4 py-4">
          {/* Main Content */}
          <div className="flex flex-col justify-start items-start gap-6 w-full">
            <div className="self-stretch flex flex-col justify-start items-start gap-1">
              <div className="inline-flex items-center gap-3 w-full">
                {/* Back button */}
                <button className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-200 text-black focus:outline-none">
                  <svg width="20" height="20" fill="none" viewBox="0 0 20 20"><path d="M13 15l-5-5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>
                <span className="text-black text-2xl font-bold font-['Manrope']">Задача на Хансен</span>
              </div>
            </div>
            {/* Tab group above the form card */}
            <div className="p-1.5 bg-white rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex justify-start items-center gap-2 mb-2">
              <div data-property-1="Default" className="px-3 py-1 bg-gray-200 rounded flex justify-center items-center gap-2.5">
                <div className="justify-start text-black text-base font-medium font-['Manrope']">Инструмент</div>
              </div>
              <Link to="/hansen-task/docs" className="px-3 py-1 bg-white rounded flex justify-center items-center gap-2.5">
                <div className="justify-start text-neutral-400 text-base font-medium font-['Manrope']">Документация</div>
              </Link>
            </div>
            <div className="self-stretch flex flex-col justify-start items-start gap-10 w-full">
              <div className="self-stretch flex flex-col justify-start items-start gap-5 w-full">
                {/* Form Card */}
                <div className="self-stretch p-3 bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 flex flex-col justify-center items-end gap-3 w-full">
                  <div className="self-stretch justify-start text-black text-base font-semibold font-['Manrope']">Входни данни</div>
                  <div className="self-stretch flex flex-col justify-start items-start gap-4 w-full">
                    {/* YA */}
                    <div className="self-stretch flex flex-col justify-start items-start gap-2 w-full">
                      <div className="justify-start text-black text-xs font-medium font-['Manrope']">Yₐ (координата)</div>
                      <input
                        type="number"
                        id="yA"
                        value={form.yA}
                        onChange={handleChange}
                        step="any"
                        className="self-stretch p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 text-neutral-400 text-xs font-medium font-['Manrope']"
                        placeholder="Въведете координата YA"
                        list="yA-history"
                      />
                      <datalist id="yA-history">
                        {getInputHistory('yA').map((v, i) => <option value={v} key={i} />)}
                      </datalist>
                    </div>
                    {/* XA */}
                    <div className="self-stretch flex flex-col justify-start items-start gap-2 w-full">
                      <div className="justify-start text-black text-xs font-medium font-['Manrope']">Xₐ (координата)</div>
                      <input
                        type="number"
                        id="xA"
                        value={form.xA}
                        onChange={handleChange}
                        step="any"
                        className="self-stretch p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 text-neutral-400 text-xs font-medium font-['Manrope']"
                        placeholder="Въведете координата XA"
                        list="xA-history"
                      />
                      <datalist id="xA-history">
                        {getInputHistory('xA').map((v, i) => <option value={v} key={i} />)}
                      </datalist>
                    </div>
                    {/* YB */}
                    <div className="self-stretch flex flex-col justify-start items-start gap-2 w-full">
                      <div className="justify-start text-black text-xs font-medium font-['Manrope']">Yᵦ (координата)</div>
                      <input
                        type="number"
                        id="yB"
                        value={form.yB}
                        onChange={handleChange}
                        step="any"
                        className="self-stretch p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 text-neutral-400 text-xs font-medium font-['Manrope']"
                        placeholder="Въведете координата YB"
                        list="yB-history"
                      />
                      <datalist id="yB-history">
                        {getInputHistory('yB').map((v, i) => <option value={v} key={i} />)}
                      </datalist>
                    </div>
                    {/* XB */}
                    <div className="self-stretch flex flex-col justify-start items-start gap-2 w-full">
                      <div className="justify-start text-black text-xs font-medium font-['Manrope']">Xᵦ (координата)</div>
                      <input
                        type="number"
                        id="xB"
                        value={form.xB}
                        onChange={handleChange}
                        step="any"
                        className="self-stretch p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 text-neutral-400 text-xs font-medium font-['Manrope']"
                        placeholder="Въведете координата XB"
                        list="xB-history"
                      />
                      <datalist id="xB-history">
                        {getInputHistory('xB').map((v, i) => <option value={v} key={i} />)}
                      </datalist>
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
                        list="alpha-history"
                      />
                      <datalist id="alpha-history">
                        {getInputHistory('alpha').map((v, i) => <option value={v} key={i} />)}
                      </datalist>
                    </div>
                    {/* Beta */}
                    <div className="self-stretch flex flex-col justify-start items-start gap-2 w-full">
                      <div className="justify-start text-black text-xs font-medium font-['Manrope']">Ъгъл β (в гради)</div>
                      <input
                        type="number"
                        id="beta"
                        value={form.beta}
                        onChange={handleChange}
                        step="any"
                        className="self-stretch p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 text-neutral-400 text-xs font-medium font-['Manrope']"
                        placeholder="Въведете ъгъл β"
                        list="beta-history"
                      />
                      <datalist id="beta-history">
                        {getInputHistory('beta').map((v, i) => <option value={v} key={i} />)}
                      </datalist>
                    </div>
                  </div>
                  <div className="inline-flex justify-end items-center gap-3 w-full">
                    <button
                      type="button"
                      aria-disabled="true"
                      title="Тази функция е в процес на разработка и интеграция."
                      className="px-4 py-2 bg-gray-200 rounded-lg flex justify-start items-center gap-3 opacity-50 select-none cursor-not-allowed"
                    >
                      <img src="/icons/scan_icon.svg" alt="Сканирай" className="w-4 h-4" />
                      <span className="justify-start text-black text-sm font-medium font-['Manrope']">Сканирай</span>
                    </button>
                    <button type="button" onClick={resetForm} className="px-4 py-2 bg-gray-200 rounded-lg flex justify-start items-center gap-3">
                      <div className="justify-start text-black text-sm font-medium font-['Manrope']">Нулирай</div>
                    </button>
                    <button type="button" onClick={calculate} disabled={isAuthenticated && !isFormValid()} className={`px-4 py-2 bg-black rounded-lg flex justify-start items-center gap-3${isAuthenticated && !isFormValid() ? ' opacity-50 cursor-not-allowed' : ''}`}>
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
                    <div className="min-w-[1000px] rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 flex flex-col justify-start items-start gap-px overflow-hidden">
                      <div className="self-stretch shadow-[0px_8px_24px_0px_rgba(0,0,0,0.04)] inline-flex justify-start items-start gap-px bg-white">
                        <div className="flex-1 px-3 py-2 min-w-[80px] flex justify-center items-center gap-2.5 text-center border-r border-gray-200">
                          <div className="text-black text-sm font-medium font-['Manrope'] text-center">Yₐ</div>
                        </div>
                        <div className="flex-1 px-3 py-2 min-w-[80px] flex justify-center items-center gap-2.5 text-center border-r border-gray-200">
                          <div className="text-black text-sm font-medium font-['Manrope'] text-center">Xₐ</div>
                        </div>
                        <div className="flex-1 px-3 py-2 min-w-[80px] flex justify-center items-center gap-2.5 text-center border-r border-gray-200">
                          <div className="text-black text-sm font-medium font-['Manrope'] text-center">Yᵦ</div>
                        </div>
                        <div className="flex-1 px-3 py-2 min-w-[80px] flex justify-center items-center gap-2.5 text-center border-r border-gray-200">
                          <div className="text-black text-sm font-medium font-['Manrope'] text-center">Xᵦ</div>
                        </div>
                        <div className="flex-1 px-3 py-2 min-w-[80px] flex justify-center items-center gap-2.5 text-center border-r border-gray-200">
                          <div className="text-black text-sm font-medium font-['Manrope'] text-center">α</div>
                        </div>
                        <div className="flex-1 px-3 py-2 min-w-[80px] flex justify-center items-center gap-2.5 text-center border-r border-gray-200">
                          <div className="text-black text-sm font-medium font-['Manrope'] text-center">β</div>
                        </div>
                        <div className="flex-1 px-3 py-2 min-w-[80px] flex justify-center items-center gap-2.5 text-center border-r border-gray-200">
                          <div className="text-black text-sm font-medium font-['Manrope'] text-center">Yₚ</div>
                        </div>
                        <div className="flex-1 px-3 py-2 min-w-[80px] flex justify-center items-center gap-2.5 text-center border-r border-gray-200">
                          <div className="text-black text-sm font-medium font-['Manrope'] text-center">Xₚ</div>
                        </div>
                        <div className="flex-1 px-3 py-2 min-w-[80px] flex justify-center items-center gap-2.5 text-center border-r border-gray-200">
                          <div className="text-black text-sm font-medium font-['Manrope'] text-center">Дата</div>
                        </div>
                        <div className="flex-1 px-3 py-2 min-w-[80px] flex justify-center items-center gap-2.5 text-center">
                          <div className="text-black text-sm font-medium font-['Manrope'] text-center">Изтегли</div>
                        </div>
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
                              <div className="justify-start text-neutral-400 text-sm font-medium font-['Manrope']">{entry.alpha}</div>
                            </div>
                            <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                              <div className="justify-start text-neutral-400 text-sm font-medium font-['Manrope']">{entry.beta}</div>
                            </div>
                            <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                              <div className="justify-start text-neutral-400 text-sm font-medium font-['Manrope']">{entry.yP}</div>
                            </div>
                            <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                              <div className="justify-start text-neutral-400 text-sm font-medium font-['Manrope']">{entry.xP}</div>
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
                  </div>
                </div>
                {/* Pagination */}
                <div className="self-stretch inline-flex justify-center items-center gap-4 w-full">
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
                <div className="justify-start">
                  <Link to="/tools" className="text-neutral-400 text-base font-medium font-['Manrope'] underline">Инструменти</Link>
                  <span className="text-neutral-400 text-base font-medium font-['Manrope']"> {'>'} Задача на Хансен</span>
                </div>
                <div className="justify-start text-black text-3xl font-bold font-['Manrope']">Задача на Хансен</div>
              </div>
              <div className="p-1.5 bg-white rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex justify-start items-center gap-2">
                <div className="px-3 py-1 bg-gray-200 rounded flex justify-center items-center gap-2.5">
                  <div className="justify-start text-black text-base font-medium font-['Manrope']">Инструмент</div>
                </div>
                <Link to="/hansen-task/docs" className="px-3 py-1 bg-white rounded flex justify-center items-center gap-2.5">
                  <div className="justify-start text-neutral-400 text-base font-medium font-['Manrope']">Документация</div>
                </Link>
              </div>
            </div>
            {/* Form and Results */}
            <div className="self-stretch inline-flex justify-start items-start gap-5">
              {/* Form Card */}
              <div className="flex-1 p-4 bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex flex-col justify-center items-end gap-4">
                <div className="self-stretch justify-start text-black text-lg font-semibold font-['Manrope']">Входни данни</div>
                <div className="self-stretch flex flex-col justify-start items-start gap-4">
                  {/* YA */}
                  <div className="self-stretch flex flex-col justify-start items-start gap-2">
                    <div className="justify-start text-black text-sm font-medium font-['Manrope']">Yₐ (координата)</div>
                    <input
                      type="number"
                      id="yA"
                      value={form.yA}
                      onChange={handleChange}
                      step="any"
                      className="self-stretch p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 text-neutral-400 text-sm font-medium font-['Manrope']"
                      placeholder="Въведете координата YA"
                      list="yA-history"
                    />
                    <datalist id="yA-history">
                      {getInputHistory('yA').map((v, i) => <option value={v} key={i} />)}
                    </datalist>
                  </div>
                  {/* XA */}
                  <div className="self-stretch flex flex-col justify-start items-start gap-2">
                    <div className="justify-start text-black text-sm font-medium font-['Manrope']">Xₐ (координата)</div>
                    <input
                      type="number"
                      id="xA"
                      value={form.xA}
                      onChange={handleChange}
                      step="any"
                      className="self-stretch p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 text-neutral-400 text-sm font-medium font-['Manrope']"
                      placeholder="Въведете координата XA"
                      list="xA-history"
                    />
                    <datalist id="xA-history">
                      {getInputHistory('xA').map((v, i) => <option value={v} key={i} />)}
                    </datalist>
                  </div>
                  {/* YB */}
                  <div className="self-stretch flex flex-col justify-start items-start gap-2">
                    <div className="justify-start text-black text-sm font-medium font-['Manrope']">Yᵦ (координата)</div>
                    <input
                      type="number"
                      id="yB"
                      value={form.yB}
                      onChange={handleChange}
                      step="any"
                      className="self-stretch p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 text-neutral-400 text-sm font-medium font-['Manrope']"
                      placeholder="Въведете координата YB"
                      list="yB-history"
                    />
                    <datalist id="yB-history">
                      {getInputHistory('yB').map((v, i) => <option value={v} key={i} />)}
                    </datalist>
                  </div>
                  {/* XB */}
                  <div className="self-stretch flex flex-col justify-start items-start gap-2">
                    <div className="justify-start text-black text-sm font-medium font-['Manrope']">Xᵦ (координата)</div>
                    <input
                      type="number"
                      id="xB"
                      value={form.xB}
                      onChange={handleChange}
                      step="any"
                      className="self-stretch p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 text-neutral-400 text-sm font-medium font-['Manrope']"
                      placeholder="Въведете координата XB"
                      list="xB-history"
                    />
                    <datalist id="xB-history">
                      {getInputHistory('xB').map((v, i) => <option value={v} key={i} />)}
                    </datalist>
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
                      list="alpha-history"
                    />
                    <datalist id="alpha-history">
                      {getInputHistory('alpha').map((v, i) => <option value={v} key={i} />)}
                    </datalist>
                  </div>
                  {/* Beta */}
                  <div className="self-stretch flex flex-col justify-start items-start gap-2">
                    <div className="justify-start text-black text-sm font-medium font-['Manrope']">Ъгъл β (в гради)</div>
                    <input
                      type="number"
                      id="beta"
                      value={form.beta}
                      onChange={handleChange}
                      step="any"
                      className="self-stretch p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 text-neutral-400 text-sm font-medium font-['Manrope']"
                      placeholder="Въведете ъгъл β"
                      list="beta-history"
                    />
                    <datalist id="beta-history">
                      {getInputHistory('beta').map((v, i) => <option value={v} key={i} />)}
                    </datalist>
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
                    <img src="/icons/scan_icon.svg" alt="Сканирай" className="w-4 h-4" />
                    <span className="justify-start text-black text-base font-medium font-['Manrope']">Сканирай</span>
                  </button>
                  {/* Reset button */}
                  <button type="button" onClick={resetForm} className="px-4 py-2 bg-gray-200 rounded-lg flex justify-start items-center gap-3">
                    <div className="justify-start text-black text-base font-medium font-['Manrope']">Нулирай</div>
                  </button>
                  {/* Calculate button */}
                  <button type="button" onClick={calculate} disabled={isAuthenticated && !isFormValid()} className={`px-4 py-2 bg-black rounded-lg flex justify-start items-center gap-3${isAuthenticated && !isFormValid() ? ' opacity-50 cursor-not-allowed' : ''}`}>
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
                  className={`px-4 py-2 ${!resultText || resultText.includes('Въведете данни') ? 'opacity-20 cursor-not-allowed' : ''} bg-gray-200 rounded-lg inline-flex justify-start items-center gap-3`}
                  disabled={!resultText || resultText.includes('Въведете данни')}
                  onClick={() => {
                    if (!resultText || resultText.includes('Въведете данни')) return;
                    const blob = new Blob([resultText], { type: 'text/plain' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'geosolver_result.txt';
                    a.click();
                    URL.revokeObjectURL(url);
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
                  <div className="justify-start text-black text-sm font-medium font-['Manrope']">Yₐ</div>
                </div>
                <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                  <div className="justify-start text-black text-sm font-medium font-['Manrope']">Xₐ</div>
                </div>
                <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                  <div className="justify-start text-black text-sm font-medium font-['Manrope']">Yᵦ</div>
                </div>
                <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                  <div className="justify-start text-black text-sm font-medium font-['Manrope']">Xᵦ</div>
                </div>
                <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                  <div className="justify-start text-black text-sm font-medium font-['Manrope']">α</div>
                </div>
                <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                  <div className="justify-start text-black text-sm font-medium font-['Manrope']">β</div>
                </div>
                <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                  <div className="justify-start text-black text-sm font-medium font-['Manrope']">Yₚ</div>
                </div>
                <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                  <div className="justify-start text-black text-sm font-medium font-['Manrope']">Xₚ</div>
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
                      <div className="justify-start text-neutral-400 text-sm font-medium font-['Manrope']">{entry.alpha}</div>
                    </div>
                    <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                      <div className="justify-start text-neutral-400 text-sm font-medium font-['Manrope']">{entry.beta}</div>
                    </div>
                    <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                      <div className="justify-start text-neutral-400 text-sm font-medium font-['Manrope']">{entry.yP}</div>
                    </div>
                    <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                      <div className="justify-start text-neutral-400 text-sm font-medium font-['Manrope']">{entry.xP}</div>
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
            <div className="self-stretch inline-flex justify-center items-center gap-4">
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

export default HansenTask;