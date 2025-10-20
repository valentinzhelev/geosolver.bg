import React, { useState, useEffect } from 'react';
import { Helmet } from "react-helmet";
import Layout from '../layout/Layout';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import useTypewriter from '../../hooks/useTypewriter';

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

// Local history for PolarIntersection
const getHistory = () => {
  const data = localStorage.getItem('polarIntersectionHistory');
  return data ? JSON.parse(data) : [];
};
const saveHistory = (entry) => {
  const history = getHistory();
  history.unshift(entry);
  localStorage.setItem('polarIntersectionHistory', JSON.stringify(history.slice(0, 20)));
};

const PolarIntersection = () => {
  const [form, setForm] = useState({ yA: '', xA: '', angle: '', distance: '' });
  const { t, language } = useTranslation();
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
    const yA = parseFloat(form.yA);
    const xA = parseFloat(form.xA);
    const angle = parseFloat(form.angle);
    const distance = parseFloat(form.distance);
    if (isNaN(yA) || isNaN(xA) || isNaN(angle) || isNaN(distance)) {
      alert(language === 'bg' ? "Моля, попълнете всички полета коректно." : "Please fill in all fields correctly.");
      return;
    }

    const result = calculatePolarIntersection(xA, yA, angle, distance);
    const output = language === 'bg' 
      ? `--------- Полярна засечка (Enhanced) ---------
YA = ${result.yA}, XA = ${result.xA}
Ъгъл = ${result.angle} gon, Разстояние = ${result.distance} м
------------------------------------------------------
Ъгъл в радиани = ${result.angleRad.toFixed(6)} rad
sin(α) = ${result.sinAlpha}
cos(α) = ${result.cosAlpha}
------------------------------------------------------
Координатни разлики:
ΔX = S·cos(α) = ${result.distance}·${result.cosAlpha} = ${result.deltaX} м
ΔY = S·sin(α) = ${result.distance}·${result.sinAlpha} = ${result.deltaY} м
------------------------------------------------------
YP = YA + ΔY = ${result.yA} + ${result.deltaY} = ${result.yP} м
XP = XA + ΔX = ${result.xA} + ${result.deltaX} = ${result.xP} м
------------------------------------------------------
Квадрант: ${result.quadrant}
Обратен ъгъл: ${result.reverseAngle} гради
Проверка - разстояние: ${result.calculatedDistance} м
Проверка - ъгъл: ${result.calculatedAngle} гради
------------------------------------------------------`
      : `--------- Polar Intersection (Enhanced) ---------
YA = ${result.yA}, XA = ${result.xA}
Angle = ${result.angle} gon, Distance = ${result.distance} m
------------------------------------------------------
Angle in radians = ${result.angleRad.toFixed(6)} rad
sin(α) = ${result.sinAlpha}
cos(α) = ${result.cosAlpha}
------------------------------------------------------
Coordinate differences:
ΔX = S·cos(α) = ${result.distance}·${result.cosAlpha} = ${result.deltaX} m
ΔY = S·sin(α) = ${result.distance}·${result.sinAlpha} = ${result.deltaY} m
------------------------------------------------------
YP = YA + ΔY = ${result.yA} + ${result.deltaY} = ${result.yP} m
XP = XA + ΔX = ${result.xA} + ${result.deltaX} = ${result.xP} m
------------------------------------------------------
Quadrant: ${result.quadrant}
Reverse angle: ${result.reverseAngle} gon
Check - distance: ${result.calculatedDistance} m
Check - angle: ${result.calculatedAngle} gon
------------------------------------------------------`;
    
    setResultText(output ? String(output) : "");
    // Save to local history
    const entry = {
      yA: result.yA,
      xA: result.xA,
      angle: result.angle,
      distance: result.distance,
      yP: parseFloat(result.yP.toFixed(2)),
      xP: parseFloat(result.xP.toFixed(2)),
      date: new Date().toISOString(),
    };
    saveHistory(entry);
    setHistory(getHistory());
  };

  /**
   * Полярна засечка (Enhanced):
   * Изчислява координатите на неизвестна точка чрез измерване на ъгъл и разстояние от известна точка
   * 
   * Формули:
   * Xₚ = Xₐ + S·cos(α)
   * Yₚ = Yₐ + S·sin(α)
   * 
   * @param {number} xA - X координата на известна точка A
   * @param {number} yA - Y координата на известна точка A
   * @param {number} angle - Ъгъл в гради
   * @param {number} distance - Разстояние в метри
   * @returns {Object} Резултати от изчисленията
   */
  const calculatePolarIntersection = (xA, yA, angle, distance) => {
    // Валидация на входните данни
    if (distance <= 0) {
      throw new Error('Разстоянието трябва да е положително число');
    }

    // Преобразуване на ъгъла от гради в радиани
    const angleRad = angle * Math.PI / 200;
    
    // Изчисляване на тригонометричните функции
    const sinAlpha = Math.sin(angleRad);
    const cosAlpha = Math.cos(angleRad);
    
    // Изчисляване на координатните разлики
    const deltaX = distance * cosAlpha;
    const deltaY = distance * sinAlpha;
    
    // Изчисляване на координатите на неизвестната точка
    const xP = xA + deltaX;
    const yP = yA + deltaY;

    // Изчисляване на обратния ъгъл
    const reverseAngle = angle >= 200 ? angle - 200 : angle + 200;

    // Определяне на квадранта
    let quadrant = '';
    if (deltaX >= 0 && deltaY >= 0) quadrant = 'I';
    else if (deltaX < 0 && deltaY >= 0) quadrant = 'II';
    else if (deltaX < 0 && deltaY < 0) quadrant = 'III';
    else if (deltaX >= 0 && deltaY < 0) quadrant = 'IV';

    return {
      xA, yA, angle, distance,
      angleRad,
      sinAlpha: Math.round(sinAlpha * 1000000) / 1000000,
      cosAlpha: Math.round(cosAlpha * 1000000) / 1000000,
      deltaX: Math.round(deltaX * 1000) / 1000,
      deltaY: Math.round(deltaY * 1000) / 1000,
      xP: Math.round(xP * 1000) / 1000,
      yP: Math.round(yP * 1000) / 1000,
      reverseAngle: Math.round(reverseAngle * 1000) / 1000,
      quadrant,
      // Допълнителни изчисления за проверка
      calculatedDistance: Math.round(Math.sqrt(deltaX * deltaX + deltaY * deltaY) * 1000) / 1000,
      calculatedAngle: Math.round(Math.atan2(deltaY, deltaX) * 200 / Math.PI * 1000) / 1000
    };
  };

  const resetForm = () => {
    setForm({ yA: '', xA: '', angle: '', distance: '' });
    setResultText(t.defaultResultText);
  };

  const handleDownload = (entry) => {
    const text = language === 'bg'
      ? `YA: ${entry.yA}\nXA: ${entry.xA}\nЪгъл: ${entry.angle}\nРазстояние: ${entry.distance}\nYP: ${entry.yP}\nXP: ${entry.xP}\nДата: ${(() => { const d = new Date(entry.date); return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth()+1).toString().padStart(2, '0')}/${d.getFullYear()}` })()}`
      : `YA: ${entry.yA}\nXA: ${entry.xA}\nAngle: ${entry.angle}\nDistance: ${entry.distance}\nYP: ${entry.yP}\nXP: ${entry.xP}\nDate: ${(() => { const d = new Date(entry.date); return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth()+1).toString().padStart(2, '0')}/${d.getFullYear()}` })()}`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `result_${entry.yA}_${entry.xA}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Проверка дали всички полета са попълнени
  const isFormValid = () => {
    return (
      form.yA !== '' &&
      form.xA !== '' &&
      form.angle !== '' &&
      form.distance !== '' &&
      !isNaN(parseFloat(form.yA)) &&
      !isNaN(parseFloat(form.xA)) &&
      !isNaN(parseFloat(form.angle)) &&
      !isNaN(parseFloat(form.distance))
    );
  };

  return (
    <>
      <Helmet>
        <title>Полярна засечка – Изчисляване по ъгъл и разстояние | GeoSolver</title>
        <meta name="description" content="Изчисляване на координати чрез полярна засечка с онлайн геодезически калкулатор. Бързи и точни решения за геодезисти." />
        <meta name="keywords" content="геодезия, онлайн калкулатор, полярна засечка, координати, ъгъл, разстояние, геодезически изчисления" />
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
                <span className="text-black text-2xl font-bold font-['Manrope']">Полярна засечка</span>
              </div>
            </div>
            {/* Tab group above the form card - use desktop design, but only as wide as content */}
            <div className="p-1.5 bg-white rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex justify-start items-center gap-2 mb-2">
              <div data-property-1="Default" className="px-3 py-1 bg-gray-200 rounded flex justify-center items-center gap-2.5">
                <div className="justify-start text-black text-base font-medium font-['Manrope']">Инструмент</div>
              </div>
              <Link to="/polar-intersection/docs" className="px-3 py-1 bg-white rounded flex justify-center items-center gap-2.5">
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
                    {/* Angle */}
                    <div className="self-stretch flex flex-col justify-start items-start gap-2 w-full">
                      <div className="justify-start text-black text-xs font-medium font-['Manrope']">Ъгъл α (в гради)</div>
                      <input
                        type="number"
                        id="angle"
                        value={form.angle}
                        onChange={handleChange}
                        step="any"
                        className="self-stretch p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 text-neutral-400 text-xs font-medium font-['Manrope']"
                        placeholder="Въведете ъгъл α"
                        list="angle-history"
                      />
                      <datalist id="angle-history">
                        {getInputHistory('angle').map((v, i) => <option value={v} key={i} />)}
                      </datalist>
                    </div>
                    {/* Distance */}
                    <div className="self-stretch flex flex-col justify-start items-start gap-2 w-full">
                      <div className="justify-start text-black text-xs font-medium font-['Manrope']">Разстояние S</div>
                      <input
                        type="number"
                        id="distance"
                        value={form.distance}
                        onChange={handleChange}
                        step="any"
                        className="self-stretch p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 text-neutral-400 text-xs font-medium font-['Manrope']"
                        placeholder="Въведете разстояние S"
                        list="distance-history"
                      />
                      <datalist id="distance-history">
                        {getInputHistory('distance').map((v, i) => <option value={v} key={i} />)}
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
                          <div className="text-black text-sm font-medium font-['Manrope'] text-center">Yₐ</div>
                        </div>
                        <div className="flex-1 px-3 py-2 min-w-[80px] flex justify-center items-center gap-2.5 text-center border-r border-gray-200">
                          <div className="text-black text-sm font-medium font-['Manrope'] text-center">Xₐ</div>
                        </div>
                        <div className="flex-1 px-3 py-2 min-w-[80px] flex justify-center items-center gap-2.5 text-center border-r border-gray-200">
                          <div className="text-black text-sm font-medium font-['Manrope'] text-center">α</div>
                        </div>
                        <div className="flex-1 px-3 py-2 min-w-[80px] flex justify-center items-center gap-2.5 text-center border-r border-gray-200">
                          <div className="text-black text-sm font-medium font-['Manrope'] text-center">S</div>
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
                              <div className="justify-start text-neutral-400 text-sm font-medium font-['Manrope']">{entry.angle}</div>
                            </div>
                            <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                              <div className="justify-start text-neutral-400 text-sm font-medium font-['Manrope']">{entry.distance}</div>
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
                  <span className="text-neutral-400 text-base font-medium font-['Manrope']"> {'>'} Полярна засечка</span>
                </div>
                <div className="justify-start text-black text-3xl font-bold font-['Manrope']">Полярна засечка</div>
              </div>
              <div className="p-1.5 bg-white rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex justify-start items-center gap-2">
                <div className="px-3 py-1 bg-gray-200 rounded flex justify-center items-center gap-2.5">
                  <div className="justify-start text-black text-base font-medium font-['Manrope']">Инструмент</div>
                </div>
                <Link to="/polar-intersection/docs" className="px-3 py-1 bg-white rounded flex justify-center items-center gap-2.5">
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
                  {/* Angle */}
                  <div className="self-stretch flex flex-col justify-start items-start gap-2">
                    <div className="justify-start text-black text-sm font-medium font-['Manrope']">Ъгъл α (в гради)</div>
                    <input
                      type="number"
                      id="angle"
                      value={form.angle}
                      onChange={handleChange}
                      step="any"
                      className="self-stretch p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 text-neutral-400 text-sm font-medium font-['Manrope']"
                      placeholder="Въведете ъгъл α"
                      list="angle-history"
                    />
                    <datalist id="angle-history">
                      {getInputHistory('angle').map((v, i) => <option value={v} key={i} />)}
                    </datalist>
                  </div>
                  {/* Distance */}
                  <div className="self-stretch flex flex-col justify-start items-start gap-2">
                    <div className="justify-start text-black text-sm font-medium font-['Manrope']">Разстояние S</div>
                    <input
                      type="number"
                      id="distance"
                      value={form.distance}
                      onChange={handleChange}
                      step="any"
                      className="self-stretch p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 text-neutral-400 text-sm font-medium font-['Manrope']"
                      placeholder="Въведете разстояние S"
                      list="distance-history"
                    />
                    <datalist id="distance-history">
                      {getInputHistory('distance').map((v, i) => <option value={v} key={i} />)}
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
                  <div className="justify-start text-black text-sm font-medium font-['Manrope']">Yₐ</div>
                </div>
                <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                  <div className="justify-start text-black text-sm font-medium font-['Manrope']">Xₐ</div>
                </div>
                <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                  <div className="justify-start text-black text-sm font-medium font-['Manrope']">α</div>
                </div>
                <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                  <div className="justify-start text-black text-sm font-medium font-['Manrope']">S</div>
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
                      <div className="justify-start text-neutral-400 text-sm font-medium font-['Manrope']">{entry.angle}</div>
                    </div>
                    <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                      <div className="justify-start text-neutral-400 text-sm font-medium font-['Manrope']">{entry.distance}</div>
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

export default PolarIntersection;