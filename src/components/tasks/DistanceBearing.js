import React, { useState, useEffect, useMemo } from 'react';
import SEO from '../shared/SEO';
import Layout from '../layout/Layout';
import TaskActionBar from './TaskActionBar';
import TaskMobileBackButton from './TaskMobileBackButton';
import PointPicker from './PointPicker';
import TwoPointSketch from './TwoPointSketch';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import useTypewriter from '../../hooks/useTypewriter';
import { calculateDistanceBearing as calculateDistanceBearingDomain } from '../../domain/geodesy';
import { roundTo } from '../../domain/math';
import { useGuardedCalculation } from '../../hooks/useGuardedCalculation';
import { useCalculationRestore } from '../../hooks/useCalculationRestore';
import { inputDataToFormStrings } from '../../utils/calculationRestore';

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

// Local history for DistanceBearing
const getHistory = () => {
  const data = localStorage.getItem('distanceBearingHistory');
  return data ? JSON.parse(data) : [];
};
const saveHistory = (entry) => {
  const history = getHistory();
  history.unshift(entry);
  localStorage.setItem('distanceBearingHistory', JSON.stringify(history.slice(0, 20)));
};

const DistanceBearing = () => {
  const [form, setForm] = useState({ y1: '', x1: '', y2: '', x2: '' });
  useCalculationRestore('distance-bearing', setForm, inputDataToFormStrings);
  const { t, language } = useTranslation();
  const { runWithTracking, isAuthenticated } = useGuardedCalculation();
  const [resultText, setResultText] = useState(t.defaultResultText);
  const [lastCalcResult, setLastCalcResult] = useState(null);
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
    const y1 = parseFloat(form.y1);
    const x1 = parseFloat(form.x1);
    const y2 = parseFloat(form.y2);
    const x2 = parseFloat(form.x2);
    if (isNaN(y1) || isNaN(x1) || isNaN(y2) || isNaN(x2)) {
      alert(language === 'bg' ? "Моля, попълнете всички полета коректно." : "Please fill in all fields correctly.");
      return;
    }

    const result = await runWithTracking({
      toolName: 'distance-bearing',
      toolDisplayName: { bg: 'Разстояние и посока', en: 'Distance and Bearing' },
      inputData: { y1, x1, y2, x2 },
      getResultData: (r) => ({ distance: r.distance, bearingGon: r.bearingGon }),
      run: () => calculateDistanceBearing(x1, y1, x2, y2),
    });
    if (!result) return;
    setLastCalcResult(result);
    const output = language === 'bg' 
      ? `--------- Разстояние и посока (Enhanced) ---------
Y₁ = ${result.y1}, X₁ = ${result.x1}
Y₂ = ${result.y2}, X₂ = ${result.x2}
------------------------------------------------------
Координатни разлики:
ΔY = Y₂ - Y₁ = ${result.y2} - ${result.y1} = ${result.deltaY.toFixed(3)} м
ΔX = X₂ - X₁ = ${result.x2} - ${result.x1} = ${result.deltaX.toFixed(3)} м
------------------------------------------------------
Разстояние:
d = √(ΔY² + ΔX²) = √(${result.deltaY.toFixed(3)}² + ${result.deltaX.toFixed(3)}²) = ${result.distance.toFixed(3)} м
------------------------------------------------------
Посока (азимут):
α = arctan(ΔX/ΔY) = arctan(${result.deltaX.toFixed(3)}/${result.deltaY.toFixed(3)}) = ${result.bearingRad.toFixed(6)} rad
α = ${result.bearingGon.toFixed(2)} gon
α = ${result.bearingDeg.toFixed(2)}°
------------------------------------------------------
Квадрант: ${result.quadrant}
------------------------------------------------------`
      : `--------- Distance and Bearing (Enhanced) ---------
Y₁ = ${result.y1}, X₁ = ${result.x1}
Y₂ = ${result.y2}, X₂ = ${result.x2}
------------------------------------------------------
Coordinate differences:
ΔY = Y₂ - Y₁ = ${result.y2} - ${result.y1} = ${result.deltaY.toFixed(3)} m
ΔX = X₂ - X₁ = ${result.x2} - ${result.x1} = ${result.deltaX.toFixed(3)} m
------------------------------------------------------
Distance:
d = √(ΔY² + ΔX²) = √(${result.deltaY.toFixed(3)}² + ${result.deltaX.toFixed(3)}²) = ${result.distance.toFixed(3)} m
------------------------------------------------------
Bearing (azimuth):
α = arctan(ΔX/ΔY) = arctan(${result.deltaX.toFixed(3)}/${result.deltaY.toFixed(3)}) = ${result.bearingRad.toFixed(6)} rad
α = ${result.bearingGon.toFixed(2)} gon
α = ${result.bearingDeg.toFixed(2)}°
------------------------------------------------------
Quadrant: ${result.quadrant}
------------------------------------------------------`;
    
    setResultText(output ? String(output) : "");
    // Save to local history
    const entry = {
      y1: result.y1,
      x1: result.x1,
      y2: result.y2,
      x2: result.x2,
      distance: parseFloat(result.distance.toFixed(2)),
      bearingGon: parseFloat(result.bearingGon.toFixed(2)),
      bearingDeg: parseFloat(result.bearingDeg.toFixed(2)),
      date: new Date().toISOString(),
    };
    saveHistory(entry);
    setHistory(getHistory());
  };

  // Uses domain module for calculations
  const calculateDistanceBearing = (x1, y1, x2, y2) => {
    const result = calculateDistanceBearingDomain(x1, y1, x2, y2);
    
    // Apply rounding for UI compatibility
    return {
      x1: result.x1,
      y1: result.y1,
      x2: result.x2,
      y2: result.y2,
      deltaY: roundTo(result.deltaY, 3),
      deltaX: roundTo(result.deltaX, 3),
      distance: roundTo(result.distance, 3),
      bearingRad: roundTo(result.bearingRad, 6),
      bearingGon: roundTo(result.bearingGon, 2),
      bearingDeg: roundTo(result.bearingDeg, 2),
      quadrant: result.quadrant
    };
  };

  const resetForm = () => {
    setForm({ y1: '', x1: '', y2: '', x2: '' });
    setResultText(t.defaultResultText);
    setLastCalcResult(null);
  };

  const sketchData = useMemo(() => {
    const y1 = parseFloat(form.y1);
    const x1 = parseFloat(form.x1);
    const y2 = parseFloat(form.y2);
    const x2 = parseFloat(form.x2);
    const hasP1 = !Number.isNaN(y1) && !Number.isNaN(x1);
    const hasP2 = !Number.isNaN(y2) && !Number.isNaN(x2);
    if (!hasP1 && !hasP2) return null;
    return {
      y1: hasP1 ? y1 : undefined,
      x1: hasP1 ? x1 : undefined,
      y2: hasP2 ? y2 : undefined,
      x2: hasP2 ? x2 : undefined,
      alphaGon: lastCalcResult?.bearingGon,
      distance: lastCalcResult?.distance,
    };
  }, [form, lastCalcResult]);

  const handleDownload = (entry) => {
    const text = language === 'bg'
      ? `Y₁: ${entry.y1}\nX₁: ${entry.x1}\nY₂: ${entry.y2}\nX₂: ${entry.x2}\nРазстояние: ${entry.distance} м\nПосока: ${entry.bearingGon} gon (${entry.bearingDeg}°)\nДата: ${(() => { const d = new Date(entry.date); return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth()+1).toString().padStart(2, '0')}/${d.getFullYear()}` })()}`
      : `Y₁: ${entry.y1}\nX₁: ${entry.x1}\nY₂: ${entry.y2}\nX₂: ${entry.x2}\nDistance: ${entry.distance} m\nBearing: ${entry.bearingGon} gon (${entry.bearingDeg}°)\nDate: ${(() => { const d = new Date(entry.date); return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth()+1).toString().padStart(2, '0')}/${d.getFullYear()}` })()}`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `distance_bearing_${entry.y1}_${entry.x1}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Check if all fields are filled
  const isFormValid = () => {
    return (
      form.y1 !== '' &&
      form.x1 !== '' &&
      form.y2 !== '' &&
      form.x2 !== '' &&
      !isNaN(parseFloat(form.y1)) &&
      !isNaN(parseFloat(form.x1)) &&
      !isNaN(parseFloat(form.y2)) &&
      !isNaN(parseFloat(form.x2))
    );
  };

  return (
    <>
      <SEO
        title="Разстояние и посока – Изчисляване на разстояние и азимут"
        description="Изчисляване на разстояние и посока между две точки с онлайн геодезически калкулатор. Бързи и точни решения за геодезисти."
        keywords="геодезия, онлайн калкулатор, разстояние и посока, азимут, координати, геодезически изчисления"
        canonical="/tools/distance-bearing"
      />
      <Layout>
        {/* MOBILE LAYOUT */}
        <div className="block md:hidden w-full max-w-md mx-auto min-h-screen bg-stone-50 dark:bg-zinc-950 transition-colors relative px-4 py-4">
          {/* Main Content */}
          <div className="flex flex-col justify-start items-start gap-6 w-full">
            <div className="self-stretch flex flex-col justify-start items-start gap-1">
              <div className="inline-flex items-center gap-3 w-full">
                <TaskMobileBackButton />
                <span className="text-black dark:text-white text-2xl font-bold font-['Manrope']">Разстояние и посока</span>
              </div>
            </div>
            {/* Tab group above the form card */}
            <div className="p-1.5 bg-white dark:bg-zinc-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-800 inline-flex justify-start items-center gap-2 mb-2">
              <div data-property-1="Default" className="px-3 py-1 bg-gray-200 dark:bg-zinc-700 rounded flex justify-center items-center gap-2.5">
                <div className="justify-start text-black dark:text-white text-base font-medium font-['Manrope']">Инструмент</div>
              </div>
              <Link to="/distance-bearing/docs" className="px-3 py-1 bg-white dark:bg-zinc-900 rounded flex justify-center items-center gap-2.5">
                <div className="justify-start text-neutral-400 dark:text-zinc-400 text-base font-medium font-['Manrope']">Документация</div>
              </Link>
            </div>
            <div className="self-stretch flex flex-col justify-start items-start gap-10 w-full">
              <div className="self-stretch flex flex-col justify-start items-start gap-5 w-full">
                {/* Form Card */}
                <div className="self-stretch p-3 bg-white dark:bg-zinc-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-800 flex flex-col justify-center items-end gap-3 w-full min-w-0 overflow-hidden">
                  <div className="self-stretch justify-start text-black dark:text-white text-base font-semibold font-['Manrope']">Входни данни</div>
                  <div className="self-stretch grid grid-cols-2 gap-2 w-full">
                    <PointPicker language={language} label="P₁" onSelect={(p) => setForm((f) => ({ ...f, y1: String(p.y), x1: String(p.x) }))} />
                    <PointPicker language={language} label="P₂" onSelect={(p) => setForm((f) => ({ ...f, y2: String(p.y), x2: String(p.x) }))} />
                  </div>
                  <div className="self-stretch flex flex-col justify-start items-start gap-4 w-full">
                    {/* Y1 */}
                    <div className="self-stretch flex flex-col justify-start items-start gap-2 w-full">
                      <div className="justify-start text-black dark:text-white text-xs font-medium font-['Manrope']">Y₁ (координата)</div>
                      <input
                        type="number"
                        id="y1"
                        value={form.y1}
                        onChange={handleChange}
                        step="any"
                        className="self-stretch p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-600 bg-white dark:bg-zinc-800 text-black dark:text-zinc-100 placeholder:text-neutral-400 dark:placeholder:text-zinc-500 text-xs font-medium font-['Manrope']"
                        placeholder="Въведете координата Y1"
                        list="y1-history"
                      />
                      <datalist id="y1-history">
                        {getInputHistory('y1').map((v, i) => <option value={v} key={i} />)}
                      </datalist>
                    </div>
                    {/* X1 */}
                    <div className="self-stretch flex flex-col justify-start items-start gap-2 w-full">
                      <div className="justify-start text-black dark:text-white text-xs font-medium font-['Manrope']">X₁ (координата)</div>
                      <input
                        type="number"
                        id="x1"
                        value={form.x1}
                        onChange={handleChange}
                        step="any"
                        className="self-stretch p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-600 bg-white dark:bg-zinc-800 text-black dark:text-zinc-100 placeholder:text-neutral-400 dark:placeholder:text-zinc-500 text-xs font-medium font-['Manrope']"
                        placeholder="Въведете координата X1"
                        list="x1-history"
                      />
                      <datalist id="x1-history">
                        {getInputHistory('x1').map((v, i) => <option value={v} key={i} />)}
                      </datalist>
                    </div>
                    {/* Y2 */}
                    <div className="self-stretch flex flex-col justify-start items-start gap-2 w-full">
                      <div className="justify-start text-black dark:text-white text-xs font-medium font-['Manrope']">Y₂ (координата)</div>
                      <input
                        type="number"
                        id="y2"
                        value={form.y2}
                        onChange={handleChange}
                        step="any"
                        className="self-stretch p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-600 bg-white dark:bg-zinc-800 text-black dark:text-zinc-100 placeholder:text-neutral-400 dark:placeholder:text-zinc-500 text-xs font-medium font-['Manrope']"
                        placeholder="Въведете координата Y2"
                        list="y2-history"
                      />
                      <datalist id="y2-history">
                        {getInputHistory('y2').map((v, i) => <option value={v} key={i} />)}
                      </datalist>
                    </div>
                    {/* X2 */}
                    <div className="self-stretch flex flex-col justify-start items-start gap-2 w-full">
                      <div className="justify-start text-black dark:text-white text-xs font-medium font-['Manrope']">X₂ (координата)</div>
                      <input
                        type="number"
                        id="x2"
                        value={form.x2}
                        onChange={handleChange}
                        step="any"
                        className="self-stretch p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-600 bg-white dark:bg-zinc-800 text-black dark:text-zinc-100 placeholder:text-neutral-400 dark:placeholder:text-zinc-500 text-xs font-medium font-['Manrope']"
                        placeholder="Въведете координата X2"
                        list="x2-history"
                      />
                      <datalist id="x2-history">
                        {getInputHistory('x2').map((v, i) => <option value={v} key={i} />)}
                      </datalist>
                    </div>
                  </div>
                                    <TaskActionBar
                    onReset={resetForm}
                    onCalculate={calculate}
                    calculateDisabled={isAuthenticated && !isFormValid()}
                  />

                </div>
                {/* Results Card */}
                <div className="self-stretch p-3 bg-white dark:bg-zinc-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-800 flex flex-col justify-center items-end gap-3 w-full min-w-0 overflow-hidden">
                  <div className="self-stretch justify-start text-black dark:text-white text-base font-semibold font-['Manrope']">Резултати</div>
                  <div className="self-stretch p-3 bg-stone-50 dark:bg-zinc-800 rounded-lg flex flex-col justify-start items-start w-full">
                    <div className="self-stretch justify-start text-neutral-400 dark:text-zinc-400 text-sm font-medium font-['Manrope'] whitespace-pre-line">
                      {displayText}
                      {isTyping && <span className="animate-pulse">|</span>}
                    </div>
                  </div>
                </div>
                <TwoPointSketch
                  y1={sketchData?.y1}
                  x1={sketchData?.x1}
                  y2={sketchData?.y2}
                  x2={sketchData?.x2}
                  alphaGon={sketchData?.alphaGon}
                  distance={sketchData?.distance}
                  language={language}
                />
              </div>
              {/* History Table */}
              <div className="self-stretch flex flex-col justify-start items-start gap-3 w-full">
                <div className="justify-start text-black dark:text-white text-lg font-bold font-['Manrope']">История на изчисленията</div>
                <div className="self-stretch flex flex-col justify-start items-start gap-2.5 w-full">
                  <div className="w-full overflow-x-auto">
                    <div className="min-w-[800px] rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-800 flex flex-col justify-start items-start gap-px overflow-hidden">
                      <div className="self-stretch shadow-[0px_8px_24px_0px_rgba(0,0,0,0.04)] inline-flex justify-start items-start gap-px bg-white dark:bg-zinc-900">
                        <div className="flex-1 px-3 py-2 min-w-[80px] flex justify-center items-center gap-2.5 text-center border-r border-gray-200">
                          <div className="text-black dark:text-white text-sm font-medium font-['Manrope'] text-center">Y₁</div>
                        </div>
                        <div className="flex-1 px-3 py-2 min-w-[80px] flex justify-center items-center gap-2.5 text-center border-r border-gray-200">
                          <div className="text-black dark:text-white text-sm font-medium font-['Manrope'] text-center">X₁</div>
                        </div>
                        <div className="flex-1 px-3 py-2 min-w-[80px] flex justify-center items-center gap-2.5 text-center border-r border-gray-200">
                          <div className="text-black dark:text-white text-sm font-medium font-['Manrope'] text-center">Y₂</div>
                        </div>
                        <div className="flex-1 px-3 py-2 min-w-[80px] flex justify-center items-center gap-2.5 text-center border-r border-gray-200">
                          <div className="text-black dark:text-white text-sm font-medium font-['Manrope'] text-center">X₂</div>
                        </div>
                        <div className="flex-1 px-3 py-2 min-w-[80px] flex justify-center items-center gap-2.5 text-center border-r border-gray-200">
                          <div className="text-black dark:text-white text-sm font-medium font-['Manrope'] text-center">Разстояние (м)</div>
                        </div>
                        <div className="flex-1 px-3 py-2 min-w-[80px] flex justify-center items-center gap-2.5 text-center border-r border-gray-200">
                          <div className="text-black dark:text-white text-sm font-medium font-['Manrope'] text-center">Посока (gon)</div>
                        </div>
                        <div className="flex-1 px-3 py-2 min-w-[80px] flex justify-center items-center gap-2.5 text-center border-r border-gray-200">
                          <div className="text-black dark:text-white text-sm font-medium font-['Manrope'] text-center">Дата</div>
                        </div>
                        <div className="flex-1 px-3 py-2 min-w-[80px] flex justify-center items-center gap-2.5 text-center">
                          <div className="text-black dark:text-white text-sm font-medium font-['Manrope'] text-center">Изтегли</div>
                        </div>
                      </div>
                      {paginatedHistory.length === 0 ? (
                        <div className="w-full px-3 py-2 bg-white dark:bg-zinc-900 text-neutral-400 dark:text-zinc-400 text-sm font-medium font-['Manrope']">Няма изчисления.</div>
                      ) : (
                        paginatedHistory.map((entry, idx) => (
                          <div key={idx} className="self-stretch inline-flex justify-start items-start gap-px">
                            <div className="flex-1 px-3 py-2 bg-white dark:bg-zinc-900 flex justify-center items-center gap-2.5">
                              <div className="justify-start text-neutral-400 dark:text-zinc-400 text-sm font-medium font-['Manrope']">{entry.y1}</div>
                            </div>
                            <div className="flex-1 px-3 py-2 bg-white dark:bg-zinc-900 flex justify-center items-center gap-2.5">
                              <div className="justify-start text-neutral-400 dark:text-zinc-400 text-sm font-medium font-['Manrope']">{entry.x1}</div>
                            </div>
                            <div className="flex-1 px-3 py-2 bg-white dark:bg-zinc-900 flex justify-center items-center gap-2.5">
                              <div className="justify-start text-neutral-400 dark:text-zinc-400 text-sm font-medium font-['Manrope']">{entry.y2}</div>
                            </div>
                            <div className="flex-1 px-3 py-2 bg-white dark:bg-zinc-900 flex justify-center items-center gap-2.5">
                              <div className="justify-start text-neutral-400 dark:text-zinc-400 text-sm font-medium font-['Manrope']">{entry.x2}</div>
                            </div>
                            <div className="flex-1 px-3 py-2 bg-white dark:bg-zinc-900 flex justify-center items-center gap-2.5">
                              <div className="justify-start text-neutral-400 dark:text-zinc-400 text-sm font-medium font-['Manrope']">{entry.distance}</div>
                            </div>
                            <div className="flex-1 px-3 py-2 bg-white dark:bg-zinc-900 flex justify-center items-center gap-2.5">
                              <div className="justify-start text-neutral-400 dark:text-zinc-400 text-sm font-medium font-['Manrope']">{entry.bearingGon}</div>
                            </div>
                            <div className="flex-1 px-3 py-2 bg-white dark:bg-zinc-900 flex justify-center items-center gap-2.5">
                              <div className="justify-start text-neutral-400 dark:text-zinc-400 text-sm font-medium font-['Manrope']">{(() => { const d = new Date(entry.date); return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth()+1).toString().padStart(2, '0')}/${d.getFullYear()}` })()}</div>
                            </div>
                            <div className="flex-1 self-stretch px-3 py-2 bg-white dark:bg-zinc-900 flex justify-center items-center gap-2.5">
                              <button onClick={() => handleDownload(entry)} className="flex items-center justify-center"><svg className="w-4 h-4 text-neutral-400 dark:text-zinc-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 4v12m0 0l-4-4m4 4l4-4M4 20h16" strokeLinecap="round" strokeLinejoin="round"/></svg></button>
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
                      <img src="/icons/small_left_arrow.svg" alt="Назад" className="w-3 h-3 opacity-70 dark:invert" />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => (
                      <button key={i} className={`w-7 px-2 py-1 rounded ${currentPage === i + 1 ? 'bg-gray-200 dark:bg-zinc-700 text-black dark:text-white' : 'outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-800 text-neutral-400 dark:text-zinc-400'} inline-flex flex-col justify-center items-center`} onClick={() => setCurrentPage(i + 1)} disabled={currentPage === i + 1}>
                        <div className="justify-start text-sm font-medium font-['Manrope']">{i + 1}</div>
                      </button>
                    ))}
                    <button className="w-7 self-stretch px-2 py-1 rounded inline-flex flex-col justify-center items-center" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0}>
                      <img src="/icons/small_right_arrow.svg" alt="Напред" className="w-3 h-3 opacity-70 dark:invert" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* DESKTOP LAYOUT */}
        <div className="hidden md:flex w-full max-w-[1180px] mx-auto px-4 py-10 bg-stone-50 dark:bg-zinc-950 transition-colors flex-col justify-start items-start gap-10">
          <div className="self-stretch flex flex-col justify-center items-start gap-10">
            {/* Breadcrumbs and Title */}
            <div className="w-[580px] flex flex-col justify-start items-start gap-4">
              <div className="flex flex-col justify-start items-start gap-1">
                <div className="justify-start">
                  <Link to="/tools" className="text-neutral-400 dark:text-zinc-400 text-base font-medium font-['Manrope'] underline">Инструменти</Link>
                  <span className="text-neutral-400 dark:text-zinc-400 text-base font-medium font-['Manrope']"> {'>'} Разстояние и посока</span>
                </div>
                <div className="justify-start text-black dark:text-white text-3xl font-bold font-['Manrope']">Разстояние и посока</div>
              </div>
              <div className="p-1.5 bg-white dark:bg-zinc-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-800 inline-flex justify-start items-center gap-2">
                <div className="px-3 py-1 bg-gray-200 dark:bg-zinc-700 rounded flex justify-center items-center gap-2.5">
                  <div className="justify-start text-black dark:text-white text-base font-medium font-['Manrope']">Инструмент</div>
                </div>
                <Link to="/distance-bearing/docs" className="px-3 py-1 bg-white dark:bg-zinc-900 rounded flex justify-center items-center gap-2.5">
                  <div className="justify-start text-neutral-400 dark:text-zinc-400 text-base font-medium font-['Manrope']">Документация</div>
                </Link>
              </div>
            </div>
            {/* Form and Results */}
            <div className="self-stretch inline-flex justify-start items-start gap-5">
              {/* Form Card */}
              <div className="flex-1 p-4 bg-white dark:bg-zinc-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-800 inline-flex flex-col justify-center items-end gap-4">
                <div className="self-stretch justify-start text-black dark:text-white text-lg font-semibold font-['Manrope']">Входни данни</div>
                <div className="self-stretch grid grid-cols-2 gap-2">
                  <PointPicker language={language} label="P₁" onSelect={(p) => setForm((f) => ({ ...f, y1: String(p.y), x1: String(p.x) }))} />
                  <PointPicker language={language} label="P₂" onSelect={(p) => setForm((f) => ({ ...f, y2: String(p.y), x2: String(p.x) }))} />
                </div>
                <div className="self-stretch flex flex-col justify-start items-start gap-4">
                  {/* Y1 */}
                  <div className="self-stretch flex flex-col justify-start items-start gap-2">
                    <div className="justify-start text-black dark:text-white text-sm font-medium font-['Manrope']">Y₁ (координата)</div>
                    <input
                      type="number"
                      id="y1"
                      value={form.y1}
                      onChange={handleChange}
                      step="any"
                      className="self-stretch p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-600 bg-white dark:bg-zinc-800 text-black dark:text-zinc-100 placeholder:text-neutral-400 dark:placeholder:text-zinc-500 text-sm font-medium font-['Manrope']"
                      placeholder="Въведете координата Y1"
                      list="y1-history"
                    />
                    <datalist id="y1-history">
                      {getInputHistory('y1').map((v, i) => <option value={v} key={i} />)}
                    </datalist>
                  </div>
                  {/* X1 */}
                  <div className="self-stretch flex flex-col justify-start items-start gap-2">
                    <div className="justify-start text-black dark:text-white text-sm font-medium font-['Manrope']">X₁ (координата)</div>
                    <input
                      type="number"
                      id="x1"
                      value={form.x1}
                      onChange={handleChange}
                      step="any"
                      className="self-stretch p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-600 bg-white dark:bg-zinc-800 text-black dark:text-zinc-100 placeholder:text-neutral-400 dark:placeholder:text-zinc-500 text-sm font-medium font-['Manrope']"
                      placeholder="Въведете координата X1"
                      list="x1-history"
                    />
                    <datalist id="x1-history">
                      {getInputHistory('x1').map((v, i) => <option value={v} key={i} />)}
                    </datalist>
                  </div>
                  {/* Y2 */}
                  <div className="self-stretch flex flex-col justify-start items-start gap-2">
                    <div className="justify-start text-black dark:text-white text-sm font-medium font-['Manrope']">Y₂ (координата)</div>
                    <input
                      type="number"
                      id="y2"
                      value={form.y2}
                      onChange={handleChange}
                      step="any"
                      className="self-stretch p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-600 bg-white dark:bg-zinc-800 text-black dark:text-zinc-100 placeholder:text-neutral-400 dark:placeholder:text-zinc-500 text-sm font-medium font-['Manrope']"
                      placeholder="Въведете координата Y2"
                      list="y2-history"
                    />
                    <datalist id="y2-history">
                      {getInputHistory('y2').map((v, i) => <option value={v} key={i} />)}
                    </datalist>
                  </div>
                  {/* X2 */}
                  <div className="self-stretch flex flex-col justify-start items-start gap-2">
                    <div className="justify-start text-black dark:text-white text-sm font-medium font-['Manrope']">X₂ (координата)</div>
                    <input
                      type="number"
                      id="x2"
                      value={form.x2}
                      onChange={handleChange}
                      step="any"
                      className="self-stretch p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-600 bg-white dark:bg-zinc-800 text-black dark:text-zinc-100 placeholder:text-neutral-400 dark:placeholder:text-zinc-500 text-sm font-medium font-['Manrope']"
                      placeholder="Въведете координата X2"
                      list="x2-history"
                    />
                    <datalist id="x2-history">
                      {getInputHistory('x2').map((v, i) => <option value={v} key={i} />)}
                    </datalist>
                  </div>
                </div>
                                <TaskActionBar
                  layout="flex"
                  onReset={resetForm}
                  onCalculate={calculate}
                  calculateDisabled={isAuthenticated && !isFormValid()}
                />
              </div>
              {/* Results Card */}
              <div className="flex-1 self-stretch p-4 bg-white dark:bg-zinc-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-800 inline-flex flex-col justify-center items-end gap-3">
                <div className="self-stretch justify-start text-black dark:text-white text-lg font-semibold font-['Manrope']">Резултати</div>
                <div className="self-stretch flex-1 p-3 bg-stone-50 dark:bg-zinc-800 rounded-lg flex flex-col justify-start items-start">
                  <div className="self-stretch justify-start text-neutral-400 dark:text-zinc-400 text-sm font-medium font-['Manrope'] whitespace-pre-line">
                    {displayText}
                    {isTyping && <span className="animate-pulse">|</span>}
                  </div>
                </div>
                <button
                  type="button"
                  className={`px-4 py-2 ${!resultText || resultText.includes('Въведете данни') ? 'opacity-20 cursor-not-allowed' : ''} bg-gray-200 dark:bg-zinc-700 rounded-lg inline-flex justify-start items-center gap-3`}
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
                  <svg className="w-5 h-5 text-black dark:text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 4v12m0 0l-4-4m4 4l4-4M4 20h16" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <div className="justify-start text-black dark:text-white text-base font-medium font-['Manrope']">Изтегли</div>
                </button>
              </div>
            </div>
            <TwoPointSketch
              y1={sketchData?.y1}
              x1={sketchData?.x1}
              y2={sketchData?.y2}
              x2={sketchData?.x2}
              alphaGon={sketchData?.alphaGon}
              distance={sketchData?.distance}
              language={language}
            />
          </div>
          {/* History Table */}
          <div className="self-stretch flex flex-col justify-start items-start gap-4">
            <div className="justify-start text-black dark:text-white text-2xl font-bold font-['Manrope']">История на изчисленията</div>
            <div className="self-stretch rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-800 flex flex-col justify-start items-start gap-px overflow-hidden">
              <div className="self-stretch shadow-[0px_8px_24px_0px_rgba(0,0,0,0.04)] inline-flex justify-start items-start gap-px">
                <div className="flex-1 px-3 py-2 bg-white dark:bg-zinc-900 flex justify-center items-center gap-2.5">
                  <div className="justify-start text-black dark:text-white text-sm font-medium font-['Manrope']">Y₁</div>
                </div>
                <div className="flex-1 px-3 py-2 bg-white dark:bg-zinc-900 flex justify-center items-center gap-2.5">
                  <div className="justify-start text-black dark:text-white text-sm font-medium font-['Manrope']">X₁</div>
                </div>
                <div className="flex-1 px-3 py-2 bg-white dark:bg-zinc-900 flex justify-center items-center gap-2.5">
                  <div className="justify-start text-black dark:text-white text-sm font-medium font-['Manrope']">Y₂</div>
                </div>
                <div className="flex-1 px-3 py-2 bg-white dark:bg-zinc-900 flex justify-center items-center gap-2.5">
                  <div className="justify-start text-black dark:text-white text-sm font-medium font-['Manrope']">X₂</div>
                </div>
                <div className="flex-1 px-3 py-2 bg-white dark:bg-zinc-900 flex justify-center items-center gap-2.5">
                  <div className="justify-start text-black dark:text-white text-sm font-medium font-['Manrope']">Разстояние (м)</div>
                </div>
                <div className="flex-1 px-3 py-2 bg-white dark:bg-zinc-900 flex justify-center items-center gap-2.5">
                  <div className="justify-start text-black dark:text-white text-sm font-medium font-['Manrope']">Посока (gon)</div>
                </div>
                <div className="flex-1 px-3 py-2 bg-white dark:bg-zinc-900 flex justify-center items-center gap-2.5">
                  <div className="justify-start text-black dark:text-white text-sm font-medium font-['Manrope']">Дата</div>
                </div>
                <div className="flex-1 px-3 py-2 bg-white dark:bg-zinc-900 flex justify-center items-center gap-2.5">
                  <div className="justify-start text-black dark:text-white text-sm font-medium font-['Manrope']">Изтегли</div>
                </div>
              </div>
              {paginatedHistory.length === 0 ? (
                <div className="w-full px-3 py-2 bg-white dark:bg-zinc-900 text-neutral-400 dark:text-zinc-400 text-sm font-medium font-['Manrope']">Няма изчисления.</div>
              ) : (
                paginatedHistory.map((entry, idx) => (
                  <div key={idx} className="self-stretch inline-flex justify-start items-start gap-px">
                    <div className="flex-1 px-3 py-2 bg-white dark:bg-zinc-900 flex justify-center items-center gap-2.5">
                      <div className="justify-start text-neutral-400 dark:text-zinc-400 text-sm font-medium font-['Manrope']">{entry.y1}</div>
                    </div>
                    <div className="flex-1 px-3 py-2 bg-white dark:bg-zinc-900 flex justify-center items-center gap-2.5">
                      <div className="justify-start text-neutral-400 dark:text-zinc-400 text-sm font-medium font-['Manrope']">{entry.x1}</div>
                    </div>
                    <div className="flex-1 px-3 py-2 bg-white dark:bg-zinc-900 flex justify-center items-center gap-2.5">
                      <div className="justify-start text-neutral-400 dark:text-zinc-400 text-sm font-medium font-['Manrope']">{entry.y2}</div>
                    </div>
                    <div className="flex-1 px-3 py-2 bg-white dark:bg-zinc-900 flex justify-center items-center gap-2.5">
                      <div className="justify-start text-neutral-400 dark:text-zinc-400 text-sm font-medium font-['Manrope']">{entry.x2}</div>
                    </div>
                    <div className="flex-1 px-3 py-2 bg-white dark:bg-zinc-900 flex justify-center items-center gap-2.5">
                      <div className="justify-start text-neutral-400 dark:text-zinc-400 text-sm font-medium font-['Manrope']">{entry.distance}</div>
                    </div>
                    <div className="flex-1 px-3 py-2 bg-white dark:bg-zinc-900 flex justify-center items-center gap-2.5">
                      <div className="justify-start text-neutral-400 dark:text-zinc-400 text-sm font-medium font-['Manrope']">{entry.bearingGon}</div>
                    </div>
                    <div className="flex-1 px-3 py-2 bg-white dark:bg-zinc-900 flex justify-center items-center gap-2.5">
                      <div className="justify-start text-neutral-400 dark:text-zinc-400 text-sm font-medium font-['Manrope']">{(() => { const d = new Date(entry.date); return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth()+1).toString().padStart(2, '0')}/${d.getFullYear()}` })()}</div>
                    </div>
                    <div className="flex-1 self-stretch px-3 py-2 bg-white dark:bg-zinc-900 flex justify-center items-center gap-2.5">
                      <button onClick={() => handleDownload(entry)} className="flex items-center justify-center"><svg className="w-4 h-4 text-neutral-400 dark:text-zinc-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 4v12m0 0l-4-4m4 4l4-4M4 20h16" strokeLinecap="round" strokeLinejoin="round"/></svg></button>
                    </div>
                  </div>
                ))
              )}
            </div>
            {/* Pagination */}
            <div className="self-stretch inline-flex justify-center items-center gap-4">
              <div className="flex justify-start items-center gap-2">
                <button className="w-7 self-stretch px-2 py-1 rounded inline-flex flex-col justify-center items-center" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                  <img src="/icons/small_left_arrow.svg" alt="Назад" className="w-3 h-3 opacity-70 dark:invert" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button key={i} className={`w-7 px-2 py-1 rounded ${currentPage === i + 1 ? 'bg-gray-200 dark:bg-zinc-700 text-black dark:text-white' : 'outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-800 text-neutral-400 dark:text-zinc-400'} inline-flex flex-col justify-center items-center`} onClick={() => setCurrentPage(i + 1)} disabled={currentPage === i + 1}>
                    <div className="justify-start text-sm font-medium font-['Manrope']">{i + 1}</div>
                  </button>
                ))}
                <button className="w-7 self-stretch px-2 py-1 rounded inline-flex flex-col justify-center items-center" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0}>
                  <img src="/icons/small_right_arrow.svg" alt="Напред" className="w-3 h-3 opacity-70 dark:invert" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default DistanceBearing;