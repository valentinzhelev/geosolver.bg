import React, { useState, useEffect } from 'react';
import { Helmet } from "react-helmet";
import Layout from '../layout/Layout';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import useTypewriter from '../../hooks/useTypewriter';
import { useCalculationTracking } from '../../hooks/useCalculationTracking';

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

// Local history for FirstTask (like SecondTask.js)
const getHistory = () => {
  const data = localStorage.getItem('firstTaskHistory');
  return data ? JSON.parse(data) : [];
};
const saveHistory = (entry) => {
  const history = getHistory();
  history.unshift(entry);
  localStorage.setItem('firstTaskHistory', JSON.stringify(history.slice(0, 20)));
};

const PurvaZadacha = () => {
  const [form, setForm] = useState({ y1: '', x1: '', alpha: '', s: '' });
  const { t, language } = useTranslation();
  const [resultText, setResultText] = useState(t.defaultResultText);
  const [history, setHistory] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(history.length / itemsPerPage);
  const paginatedHistory = history.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const { displayText, isTyping } = useTypewriter(resultText);
  const { trackCalculation, checkLimits } = useCalculationTracking();

  // Debug: виж какво се сетва
  useEffect(() => {
    console.log('setResultText value:', resultText);
  }, [resultText]);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.id]: e.target.value });
    saveInputHistory(e.target.id, e.target.value);
  };

  const calculate = async () => {
    const y1 = parseFloat(form.y1);
    const x1 = parseFloat(form.x1);
    const alpha = parseFloat(form.alpha);
    const s = parseFloat(form.s);
    if (isNaN(y1) || isNaN(x1) || isNaN(alpha) || isNaN(s)) {
      alert(language === 'bg' ? "Моля, попълнете всички полета коректно." : "Please fill in all fields correctly.");
      return;
    }

    // Проверка на лимити преди изчисление
    const limits = await checkLimits();
    console.log('Limits check result:', limits);
    if (!limits.canCalculate) {
      alert(language === 'bg' 
        ? `Достигнахте лимита от ${limits.limit} изчисления. Моля, абонирайте се за професионален план.`
        : `You have reached the limit of ${limits.limit} calculations. Please subscribe to a professional plan.`
      );
      return;
    }

    const startTime = performance.now();
    const result = purvaOsnovnaZadacha(y1, x1, alpha, s);
    const endTime = performance.now();
    const calculationTime = endTime - startTime;
    const output = language === 'bg' 
      ? `--------- Първа основна геодезическа задача (Enhanced) ---------
Y1 = ${result.y1}, X1 = ${result.x1}
S₁,₂ = ${result.s}, α₁,₂ = ${result.alphaGon} gon
------------------------------------------------------
α в радиани = ${result.alphaRad.toFixed(6)} rad
sin(α) = ${result.sinAlpha}
cos(α) = ${result.cosAlpha}
------------------------------------------------------
Координатни разлики:
ΔX = S·cos(α) = ${result.s}·${result.cosAlpha} = ${result.deltaX} м
ΔY = S·sin(α) = ${result.s}·${result.sinAlpha} = ${result.deltaY} м
------------------------------------------------------
Y2 = Y1 + ΔY = ${result.y1} + ${result.deltaY} = ${result.y2} м
X2 = X1 + ΔX = ${result.x1} + ${result.deltaX} = ${result.x2} м
------------------------------------------------------
Квадрант: ${result.quadrant}
Проверка - разстояние: ${result.calculatedDistance} м
Проверка - ъгъл: ${result.calculatedAngle} гради
------------------------------------------------------`
      : `--------- First Basic Geodetic Task (Enhanced) ---------
Y1 = ${result.y1}, X1 = ${result.x1}
S₁,₂ = ${result.s}, α₁,₂ = ${result.alphaGon} gon
------------------------------------------------------
α in radians = ${result.alphaRad.toFixed(6)} rad
sin(α) = ${result.sinAlpha}
cos(α) = ${result.cosAlpha}
------------------------------------------------------
Coordinate differences:
ΔX = S·cos(α) = ${result.s}·${result.cosAlpha} = ${result.deltaX} m
ΔY = S·sin(α) = ${result.s}·${result.sinAlpha} = ${result.deltaY} m
------------------------------------------------------
Y2 = Y1 + ΔY = ${result.y1} + ${result.deltaY} = ${result.y2} m
X2 = X1 + ΔX = ${result.x1} + ${result.deltaX} = ${result.x2} m
------------------------------------------------------
Quadrant: ${result.quadrant}
Check - distance: ${result.calculatedDistance} m
Check - angle: ${result.calculatedAngle} gon
------------------------------------------------------`;
    
    setResultText(output ? String(output) : "");
    
    // Save to local history
    const entry = {
      y1: result.y1,
      x1: result.x1,
      alpha: result.alphaGon,
      s: result.s,
      y2: parseFloat(result.y2.toFixed(2)),
      x2: parseFloat(result.x2.toFixed(2)),
      date: new Date().toISOString(),
    };
    saveHistory(entry);
    setHistory(getHistory());

    // Track calculation in backend
    try {
      await trackCalculation(
        'first-basic-task',
        { bg: 'Първа основна задача', en: 'First Basic Task' },
        { y1, x1, alpha, s },
        { y2: result.y2, x2: result.x2, deltaX: result.deltaX, deltaY: result.deltaY },
        calculationTime
      );
      
    } catch (error) {
      console.error('Failed to track calculation:', error);
    }
  };

  /**
   * Първа основна геодезическа задача (Enhanced):
   * Дадени са начална точка (X1, Y1), посочен ъгъл α (в гради) и дължина S.
   * Търсят се координатите на точка 2 (X2, Y2).
   * 
   * Формули:
   * ΔX = S · cos(α)
   * ΔY = S · sin(α)
   * X2 = X1 + ΔX
   * Y2 = Y1 + ΔY
   * 
   * @param {number} y1 - Y координата на точка 1
   * @param {number} x1 - X координата на точка 1
   * @param {number} alphaGon - посочен ъгъл в гради (0-400)
   * @param {number} s - дължина на отсечката (м)
   * @returns {Object} - координати на точка 2 и междинни изчисления
   */
  const purvaOsnovnaZadacha = (y1, x1, alphaGon, s) => {
    // Валидация на входните данни
    if (alphaGon < 0 || alphaGon >= 400) {
      throw new Error('Посочният ъгъл трябва да бъде между 0 и 400 гради');
    }
    if (s <= 0) {
      throw new Error('Дължината трябва да бъде положителна');
    }

    // Преобразуване от гради в радиани
    const alphaRad = alphaGon * Math.PI / 200;
    
    // Изчисляване на тригонометричните функции
    const sinAlpha = Math.sin(alphaRad);
    const cosAlpha = Math.cos(alphaRad);
    
    // Изчисляване на координатните разлики
    const deltaX = s * cosAlpha;
    const deltaY = s * sinAlpha;
    
    // Изчисляване на координатите на точка 2
    const x2 = x1 + deltaX;
    const y2 = y1 + deltaY;

    // Определяне на квадранта
    let quadrant = '';
    if (deltaX >= 0 && deltaY >= 0) quadrant = 'I';
    else if (deltaX < 0 && deltaY >= 0) quadrant = 'II';
    else if (deltaX < 0 && deltaY < 0) quadrant = 'III';
    else if (deltaX >= 0 && deltaY < 0) quadrant = 'IV';

    return {
      x1, y1, alphaGon, s,
      alphaRad,
      sinAlpha: Math.round(sinAlpha * 1000000) / 1000000,
      cosAlpha: Math.round(cosAlpha * 1000000) / 1000000,
      deltaX: Math.round(deltaX * 1000) / 1000,
      deltaY: Math.round(deltaY * 1000) / 1000,
      x2: Math.round(x2 * 1000) / 1000,
      y2: Math.round(y2 * 1000) / 1000,
      quadrant,
      // Допълнителни изчисления за проверка
      calculatedDistance: Math.round(Math.sqrt(deltaX * deltaX + deltaY * deltaY) * 1000) / 1000,
      calculatedAngle: Math.round(Math.atan2(deltaY, deltaX) * 200 / Math.PI * 1000) / 1000
    };
  };

  const resetForm = () => {
    setForm({ y1: '', x1: '', alpha: '', s: '' });
    setResultText(t.defaultResultText);
  };

  const handleDownload = (entry) => {
    const text = language === 'bg'
      ? `Y1: ${entry.y1}\nX1: ${entry.x1}\nα: ${entry.alpha}\nS: ${entry.s}\nY2: ${entry.y2}\nX2: ${entry.x2}\nДата: ${(() => { const d = new Date(entry.date); return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth()+1).toString().padStart(2, '0')}/${d.getFullYear()}` })()}`
      : `Y1: ${entry.y1}\nX1: ${entry.x1}\nα: ${entry.alpha}\nS: ${entry.s}\nY2: ${entry.y2}\nX2: ${entry.x2}\nDate: ${(() => { const d = new Date(entry.date); return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth()+1).toString().padStart(2, '0')}/${d.getFullYear()}` })()}`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `result_${entry.y1}_${entry.x1}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Проверка дали всички полета са попълнени
  const isFormValid = () => {
    return (
      form.y1 !== '' &&
      form.x1 !== '' &&
      form.alpha !== '' &&
      form.s !== '' &&
      !isNaN(parseFloat(form.y1)) &&
      !isNaN(parseFloat(form.x1)) &&
      !isNaN(parseFloat(form.alpha)) &&
      !isNaN(parseFloat(form.s))
    );
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
                  <svg width="20" height="20" fill="none" viewBox="0 0 20 20"><path d="M13 15l-5-5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>
                <span className="text-black text-2xl font-bold font-['Manrope']">Първа основна задача</span>
              </div>
            </div>
            {/* Tab group above the form card - use desktop design, but only as wide as content */}
            <div className="p-1.5 bg-white rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex justify-start items-center gap-2 mb-2">
              <div data-property-1="Default" className="px-3 py-1 bg-gray-200 rounded flex justify-center items-center gap-2.5">
                <div className="justify-start text-black text-base font-medium font-['Manrope']">Инструмент</div>
              </div>
              <Link to="/first-task/docs" className="px-3 py-1 bg-white rounded flex justify-center items-center gap-2.5">
                <div className="justify-start text-neutral-400 text-base font-medium font-['Manrope']">Документация</div>
              </Link>
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
                        list="y1-history"
                      />
                      <datalist id="y1-history">
                        {getInputHistory('y1').map((v, i) => <option value={v} key={i} />)}
                      </datalist>
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
                        list="x1-history"
                      />
                      <datalist id="x1-history">
                        {getInputHistory('x1').map((v, i) => <option value={v} key={i} />)}
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
                        list="s-history"
                      />
                      <datalist id="s-history">
                        {getInputHistory('s').map((v, i) => <option value={v} key={i} />)}
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
                          <div className="text-black text-sm font-medium font-['Manrope'] text-center">Y₁</div>
                        </div>
                        <div className="flex-1 px-3 py-2 min-w-[80px] flex justify-center items-center gap-2.5 text-center border-r border-gray-200">
                          <div className="text-black text-sm font-medium font-['Manrope'] text-center">X₁</div>
                        </div>
                        <div className="flex-1 px-3 py-2 min-w-[80px] flex justify-center items-center gap-2.5 text-center border-r border-gray-200">
                          <div className="text-black text-sm font-medium font-['Manrope'] text-center">α</div>
                        </div>
                        <div className="flex-1 px-3 py-2 min-w-[80px] flex justify-center items-center gap-2.5 text-center border-r border-gray-200">
                          <div className="text-black text-sm font-medium font-['Manrope'] text-center">S</div>
                        </div>
                        <div className="flex-1 px-3 py-2 min-w-[80px] flex justify-center items-center gap-2.5 text-center border-r border-gray-200">
                          <div className="text-black text-sm font-medium font-['Manrope'] text-center">Y₂</div>
                        </div>
                        <div className="flex-1 px-3 py-2 min-w-[80px] flex justify-center items-center gap-2.5 text-center border-r border-gray-200">
                          <div className="text-black text-sm font-medium font-['Manrope'] text-center">X₂</div>
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
                {/* Pagination (static, for design) */}
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
                  <span className="text-neutral-400 text-base font-medium font-['Manrope']"> {'>'} Първа основна задача</span>
                </div>
                <div className="justify-start text-black text-3xl font-bold font-['Manrope']">Първа основна задача</div>
              </div>
              <div className="p-1.5 bg-white rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex justify-start items-center gap-2">
                <div className="px-3 py-1 bg-gray-200 rounded flex justify-center items-center gap-2.5">
                  <div className="justify-start text-black text-base font-medium font-['Manrope']">Инструмент</div>
                </div>
                <Link to="/first-task/docs" className="px-3 py-1 bg-white rounded flex justify-center items-center gap-2.5">
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
                      list="y1-history"
                    />
                    <datalist id="y1-history">
                      {getInputHistory('y1').map((v, i) => <option value={v} key={i} />)}
                    </datalist>
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
                      list="x1-history"
                    />
                    <datalist id="x1-history">
                      {getInputHistory('x1').map((v, i) => <option value={v} key={i} />)}
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
                      list="s-history"
                    />
                    <datalist id="s-history">
                      {getInputHistory('s').map((v, i) => <option value={v} key={i} />)}
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
              {paginatedHistory.length === 0 ? (
                <div className="w-full px-3 py-2 bg-white text-neutral-400 text-sm font-medium font-['Manrope']">Няма изчисления.</div>
              ) : (
                paginatedHistory.map((entry, idx) => (
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
                      <div className="justify-start text-neutral-400 text-sm font-medium font-['Manrope']">{(() => { const d = new Date(entry.date); return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth()+1).toString().padStart(2, '0')}/${d.getFullYear()}` })()}</div>
                    </div>
                    <div className="flex-1 self-stretch px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                      <button onClick={() => handleDownload(entry)} className="flex items-center justify-center"><svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 4v12m0 0l-4-4m4 4l4-4M4 20h16" strokeLinecap="round" strokeLinejoin="round"/></svg></button>
                    </div>
                  </div>
                ))
              )}
            </div>
            {/* Pagination (static, for design) */}
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

export default PurvaZadacha;
