import React, { useState, useEffect } from 'react';
import SEO from '../shared/SEO';
import Layout from '../layout/Layout';
import TaskActionBar from './TaskActionBar';
import TaskMobileBackButton from './TaskMobileBackButton';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { useSyncTaskLanguage } from '../../hooks/useSyncTaskLanguage';
import { isTaskPlaceholderResult } from '../../utils/taskI18n';
import useTypewriter from '../../hooks/useTypewriter';
import { calculateForwardIntersection as calculateForwardIntersectionDomain } from '../../domain/geodesy';
import { roundTo } from '../../domain/math';
import { useGuardedCalculation } from '../../hooks/useGuardedCalculation';
import { useCalculationRestore } from '../../hooks/useCalculationRestore';
import { inputDataToFormStrings } from '../../utils/calculationRestore';
import { useEduAssignmentBridge } from '../../hooks/useEduAssignmentBridge';
import EduWorkBanner from '../classroom/ui/EduWorkBanner';
import PointPicker from './PointPicker';

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

// Input history helpers
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
 * Wrapper функция, която извиква domain модула и прилага закръгляване
 * Запазва същата структура на резултата за съвместимост с UI
 */
function calculateForwardIntersection(yA, xA, yB, xB, beta1, beta2) {
  const result = calculateForwardIntersectionDomain(yA, xA, yB, xB, beta1, beta2);
  
  // Apply rounding to result (for UI compatibility)
  return {
    // Main results
    deltaX: roundTo(result.deltaX, 3),
    deltaY: roundTo(result.deltaY, 3),
    alphaAB: roundTo(result.alphaAB, 3),
    alphaBA: roundTo(result.alphaBA, 3),
    sAB: roundTo(result.sAB, 3),
    alphaAP: roundTo(result.alphaAP, 3),
    alphaBP: roundTo(result.alphaBP, 3),
    sAP: roundTo(result.sAP, 3),
    sBP: roundTo(result.sBP, 3),
    xP: roundTo(result.xP, 3),
    yP: roundTo(result.yP, 3),
    
    // Intermediate calculations
    deltaX_AP: roundTo(result.deltaX_AP, 3),
    deltaY_AP: roundTo(result.deltaY_AP, 3),
    deltaX_BP: roundTo(result.deltaX_BP, 3),
    deltaY_BP: roundTo(result.deltaY_BP, 3),
    xPrimP: roundTo(result.xPrimP, 3),
    yPrimP: roundTo(result.yPrimP, 3),
    xSecondP: roundTo(result.xSecondP, 3),
    ySecondP: roundTo(result.ySecondP, 3),
    
    // Checks
    diffX: roundTo(result.diffX, 3),
    diffY: roundTo(result.diffY, 3),
    maxDiff: roundTo(result.maxDiff, 3),
    checkSAP: roundTo(result.checkSAP, 3),
    checkSBP: roundTo(result.checkSBP, 3),
    
    // Angles in radians for verification
    alphaABRad: roundTo(result.alphaABRad, 6),
    alphaAPRad: roundTo(result.alphaAPRad, 6),
    alphaBPRad: roundTo(result.alphaBPRad, 6)
  };
}

const ForwardIntersection = () => {
  const [form, setForm] = useState(initialForm);
  useCalculationRestore('forward-intersection', setForm, inputDataToFormStrings);
  const { t, language } = useTranslation();
  const { runWithTracking, isAuthenticated } = useGuardedCalculation();
  const [lastCalcResult, setLastCalcResult] = useState(null);
  const { eduCtx, applyResultToAssignment, dismissEduBanner, canSaveToAssignment } = useEduAssignmentBridge(
    'forward-intersection',
    setForm
  );
  const [resultText, setResultText] = useState(t.defaultResultText);
  useSyncTaskLanguage(resultText, setResultText, (tr) => tr.defaultResultText);
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

  const calculate = async () => {
    const vals = Object.values(form).map(Number);
    if (vals.some(isNaN)) {
      alert(t.fillAllFields);
      return;
    }
    const { yA, xA, yB, xB, beta1, beta2 } = form;
    const results = await runWithTracking({
      toolName: 'forward-intersection',
      toolDisplayName: { bg: 'Права засечка', en: 'Forward Intersection' },
      inputData: { yA, xA, yB, xB, beta1, beta2 },
      getResultData: (r) => ({ xP: r.xP, yP: r.yP, sAP: r.sAP, sBP: r.sBP }),
      run: () =>
        calculateForwardIntersection(
          Number(yA),
          Number(xA),
          Number(yB),
          Number(xB),
          Number(beta1),
          Number(beta2)
        ),
    });
    if (!results) return;
    setLastCalcResult(results);

    const output =
      language === 'bg'
        ? `--------- Права засечка (Enhanced) ---------
Yₐ = ${yA}, Xₐ = ${xA}
Yᵦ = ${yB}, Xᵦ = ${xB}
β₁ = ${beta1}, β₂ = ${beta2}
-------------------------------------
Координатни разлики:
ΔX = Xᵦ - Xₐ = ${yB} - ${xA} = ${results.deltaX} м
ΔY = Yᵦ - Yₐ = ${yB} - ${yA} = ${results.deltaY} м
-------------------------------------
Разстояние и ъгли:
SAB = √(ΔX² + ΔY²) = √(${results.deltaX}² + ${results.deltaY}²) = ${results.sAB} м
αAB = atan2(ΔY, ΔX) = ${results.alphaAB} гради
αBA = αAB ± 200 = ${results.alphaBA} гради
-------------------------------------
Изчислени ъгли:
αAP = αAB - β₁ = ${results.alphaAB} - ${beta1} = ${results.alphaAP} гради
αBP = αBA + β₂ = ${results.alphaBA} + ${beta2} = ${results.alphaBP} гради
-------------------------------------
Разстояния до точка P:
SAP = SAB × sin(β₂) / sin(β₁ + β₂) = ${results.sAB} × sin(${beta2}) / sin(${Number(beta1) + Number(beta2)}) = ${results.sAP} м
SBP = SAB × sin(β₁) / sin(β₁ + β₂) = ${results.sAB} × sin(${beta1}) / sin(${Number(beta1) + Number(beta2)}) = ${results.sBP} м
-------------------------------------
Координати на точка P:
От точка A: Xₚ' = Xₐ + SAP × cos(αAP) = ${xA} + ${results.sAP} × cos(${results.alphaAP}) = ${results.xPrimP} м
           Yₚ' = Yₐ + SAP × sin(αAP) = ${yA} + ${results.sAP} × sin(${results.alphaAP}) = ${results.yPrimP} м
От точка B: Xₚ'' = Xᵦ + SBP × cos(αBP) = ${xB} + ${results.sBP} × cos(${results.alphaBP}) = ${results.xSecondP} м
           Yₚ'' = Yᵦ + SBP × sin(αBP) = ${yB} + ${results.sBP} × sin(${results.alphaBP}) = ${results.ySecondP} м
-------------------------------------
Финален резултат (средно аритметично):
Xₚ = (Xₚ' + Xₚ'') / 2 = (${results.xPrimP} + ${results.xSecondP}) / 2 = ${results.xP} м
Yₚ = (Yₚ' + Yₚ'') / 2 = (${results.yPrimP} + ${results.ySecondP}) / 2 = ${results.yP} м
-------------------------------------
Проверка на точността:
Разлика по X: ${results.diffX} м
Разлика по Y: ${results.diffY} м
Максимална разлика: ${results.maxDiff} м
Проверка SAP: ${results.checkSAP} м
Проверка SBP: ${results.checkSBP} м
-------------------------------------`
        : `--------- Forward Intersection ---------
Yₐ = ${yA}, Xₐ = ${xA}
Yᵦ = ${yB}, Xᵦ = ${xB}
β₁ = ${beta1}, β₂ = ${beta2}
-------------------------------------
ΔX = ${results.deltaX} m, ΔY = ${results.deltaY} m
SAB = ${results.sAB} m
Point P: Xₚ = ${results.xP} m, Yₚ = ${results.yP} m
Max diff: ${results.maxDiff} m
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
    setResultText(t.defaultResultText);
    setLastCalcResult(null);
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
    { key: 'date', label: t.date },
    { key: 'download', label: t.download }
  ];

  return (
    <>
      <SEO
        title={t.forwardIntersection}
        description={t.forwardIntersectionDescription}
        keywords={t.forwardIntersectionKeywords}
        canonical="/forward-intersection"
      />
      <Layout>
        <EduWorkBanner
          eduCtx={eduCtx}
          bg={language === 'bg'}
          showApply={!!lastCalcResult && canSaveToAssignment}
          onApply={() => applyResultToAssignment(lastCalcResult)}
          onDismiss={dismissEduBanner}
        />
        {/* DESKTOP LAYOUT */}
        <div className="hidden md:flex w-full max-w-[1180px] mx-auto px-4 py-10 bg-stone-50 dark:bg-zinc-950 transition-colors flex-col gap-10">
          <div className="flex flex-col justify-center items-start gap-10">
            {/* Breadcrumbs and Title */}
            <div className="w-[580px] flex flex-col justify-start items-start gap-4">
              <div className="flex flex-col justify-start items-start gap-1">
                <div className="justify-start">
                  <Link to="/tools" className="text-neutral-400 dark:text-zinc-400 text-base font-medium font-['Manrope'] underline">{t.toolsTitle}</Link>
                  <span className="text-neutral-400 dark:text-zinc-400 text-base font-medium font-['Manrope']"> {'>'} {t.forwardIntersection}</span>
                </div>
                <div className="justify-start text-black dark:text-white text-3xl font-bold font-['Manrope']">{t.forwardIntersection}</div>
              </div>
              <div className="p-1.5 bg-white dark:bg-zinc-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-800 inline-flex justify-start items-center gap-2">
                <div className="px-3 py-1 bg-gray-200 dark:bg-zinc-700 rounded flex justify-center items-center gap-2.5">
                  <div className="justify-start text-black dark:text-white text-base font-medium font-['Manrope']">{t.instrument}</div>
                </div>
                <Link to="/forward-intersection/docs" className="px-3 py-1 bg-white dark:bg-zinc-900 rounded flex justify-center items-center gap-2.5">
                  <div className="justify-start text-neutral-400 dark:text-zinc-400 text-base font-medium font-['Manrope']">{t.documentation}</div>
                </Link>
              </div>
            </div>
            {/* Form and Results */}
            <div className="self-stretch inline-flex justify-start items-start gap-5">
              {/* Form Card */}
              <div className="flex-1 p-4 bg-white dark:bg-zinc-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-800 inline-flex flex-col justify-center items-end gap-4">
                <div className="self-stretch justify-start text-black dark:text-white text-lg font-semibold font-['Manrope']">{t.inputData}</div>
                <div className="self-stretch grid grid-cols-2 gap-2">
                  <PointPicker language={language} label="A" onSelect={(p) => setForm((f) => ({ ...f, yA: String(p.y), xA: String(p.x) }))} />
                  <PointPicker language={language} label="B" onSelect={(p) => setForm((f) => ({ ...f, yB: String(p.y), xB: String(p.x) }))} />
                </div>
                <div className="self-stretch flex flex-col justify-start items-start gap-4">
                  {/* Yₐ */}
                  <div className="self-stretch flex flex-col justify-start items-start gap-2">
                    <div className="justify-start text-black dark:text-white text-sm font-medium font-['Manrope']">Yₐ</div>
                    <input type="number" id="yA" value={form.yA} onChange={handleChange} className="self-stretch p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-600 bg-white dark:bg-zinc-800 text-black dark:text-zinc-100 placeholder:text-neutral-400 dark:placeholder:text-zinc-500 text-sm font-medium font-['Manrope']" placeholder="Въведете Yₐ" list="yA-history" />
                    <datalist id="yA-history">{getInputHistory('yA').map((v, i) => <option value={v} key={i} />)}</datalist>
                  </div>
                  {/* Xₐ */}
                  <div className="self-stretch flex flex-col justify-start items-start gap-2">
                    <div className="justify-start text-black dark:text-white text-sm font-medium font-['Manrope']">Xₐ</div>
                    <input type="number" id="xA" value={form.xA} onChange={handleChange} className="self-stretch p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-600 bg-white dark:bg-zinc-800 text-black dark:text-zinc-100 placeholder:text-neutral-400 dark:placeholder:text-zinc-500 text-sm font-medium font-['Manrope']" placeholder="Въведете Xₐ" list="xA-history" />
                    <datalist id="xA-history">{getInputHistory('xA').map((v, i) => <option value={v} key={i} />)}</datalist>
                  </div>
                  {/* Yᵦ */}
                  <div className="self-stretch flex flex-col justify-start items-start gap-2">
                    <div className="justify-start text-black dark:text-white text-sm font-medium font-['Manrope']">Yᵦ</div>
                    <input type="number" id="yB" value={form.yB} onChange={handleChange} className="self-stretch p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-600 bg-white dark:bg-zinc-800 text-black dark:text-zinc-100 placeholder:text-neutral-400 dark:placeholder:text-zinc-500 text-sm font-medium font-['Manrope']" placeholder="Въведете Yᵦ" list="yB-history" />
                    <datalist id="yB-history">{getInputHistory('yB').map((v, i) => <option value={v} key={i} />)}</datalist>
                  </div>
                  {/* Xᵦ */}
                  <div className="self-stretch flex flex-col justify-start items-start gap-2">
                    <div className="justify-start text-black dark:text-white text-sm font-medium font-['Manrope']">Xᵦ</div>
                    <input type="number" id="xB" value={form.xB} onChange={handleChange} className="self-stretch p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-600 bg-white dark:bg-zinc-800 text-black dark:text-zinc-100 placeholder:text-neutral-400 dark:placeholder:text-zinc-500 text-sm font-medium font-['Manrope']" placeholder="Въведете Xᵦ" list="xB-history" />
                    <datalist id="xB-history">{getInputHistory('xB').map((v, i) => <option value={v} key={i} />)}</datalist>
                  </div>
                  {/* β₁ */}
                  <div className="self-stretch flex flex-col justify-start items-start gap-2">
                    <div className="justify-start text-black dark:text-white text-sm font-medium font-['Manrope']">β₁</div>
                    <input type="number" id="beta1" value={form.beta1} onChange={handleChange} className="self-stretch p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-600 bg-white dark:bg-zinc-800 text-black dark:text-zinc-100 placeholder:text-neutral-400 dark:placeholder:text-zinc-500 text-sm font-medium font-['Manrope']" placeholder="Въведете β₁" list="beta1-history" />
                    <datalist id="beta1-history">{getInputHistory('beta1').map((v, i) => <option value={v} key={i} />)}</datalist>
                  </div>
                  {/* β₂ */}
                  <div className="self-stretch flex flex-col justify-start items-start gap-2">
                    <div className="justify-start text-black dark:text-white text-sm font-medium font-['Manrope']">β₂</div>
                    <input type="number" id="beta2" value={form.beta2} onChange={handleChange} className="self-stretch p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-600 bg-white dark:bg-zinc-800 text-black dark:text-zinc-100 placeholder:text-neutral-400 dark:placeholder:text-zinc-500 text-sm font-medium font-['Manrope']" placeholder="Въведете β₂" list="beta2-history" />
                    <datalist id="beta2-history">{getInputHistory('beta2').map((v, i) => <option value={v} key={i} />)}</datalist>
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
                <div className="self-stretch justify-start text-black dark:text-white text-lg font-semibold font-['Manrope']">{t.results}</div>
                <div className="self-stretch flex-1 p-3 bg-stone-50 dark:bg-zinc-800 rounded-lg flex flex-col justify-start items-start">
                  <div className="self-stretch text-neutral-400 dark:text-zinc-400 text-sm font-medium font-['Manrope'] whitespace-pre-line">{displayText}{isTyping && <span className="animate-pulse">|</span>}</div>
                </div>
                <button
                  type="button"
                  className={`px-4 py-2 ${isTaskPlaceholderResult(resultText) ? 'opacity-20 cursor-not-allowed' : ''} bg-gray-200 dark:bg-zinc-700 rounded-lg inline-flex justify-start items-center gap-3`}
                  disabled={isTaskPlaceholderResult(resultText)}
                  onClick={() => {
                    if (isTaskPlaceholderResult(resultText)) return;
                    handleDownload(lastEntry);
                  }}
                >
                  <svg className="w-5 h-5 text-black dark:text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 4v12m0 0l-4-4m4 4l4-4M4 20h16" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  <div className="justify-start text-black dark:text-white text-base font-medium font-['Manrope']">Изтегли</div>
                </button>
              </div>
            </div>
            {/* History Table */}
            <div className="self-stretch flex flex-col justify-start items-start gap-4">
              <div className="justify-start text-black dark:text-white text-2xl font-bold font-['Manrope']">{t.calculationHistory}</div>
              <div className="self-stretch rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-800 flex flex-col justify-start items-start gap-px overflow-hidden">
                <div className="self-stretch shadow-[0px_8px_24px_0px_rgba(0,0,0,0.04)] inline-flex justify-start items-start gap-px">
                  {tableHeaders.map((h, i) => (
                    <div key={i} className="flex-1 px-3 py-2 bg-white dark:bg-zinc-900 flex justify-center items-center gap-2.5 border-r border-gray-200">
                      <div className="text-black dark:text-white text-sm font-medium font-['Manrope']">{h.label}</div>
                    </div>
                  ))}
                </div>
                {paginatedHistory.length === 0 ? (
                  <div className="w-full px-3 py-2 bg-white dark:bg-zinc-900 text-neutral-400 dark:text-zinc-400 text-sm font-medium font-['Manrope']">Няма изчисления.</div>
                ) : (
                  paginatedHistory.map((entry, idx) => (
                    <div key={idx} className="self-stretch inline-flex justify-start items-start gap-px">
                      <div className="flex-1 px-3 py-2 bg-white dark:bg-zinc-900 flex justify-center items-center gap-2.5">
                        <div className="justify-start text-neutral-400 dark:text-zinc-400 text-sm font-medium font-['Manrope']">{entry.yA}</div>
                      </div>
                      <div className="flex-1 px-3 py-2 bg-white dark:bg-zinc-900 flex justify-center items-center gap-2.5">
                        <div className="justify-start text-neutral-400 dark:text-zinc-400 text-sm font-medium font-['Manrope']">{entry.xA}</div>
                      </div>
                      <div className="flex-1 px-3 py-2 bg-white dark:bg-zinc-900 flex justify-center items-center gap-2.5">
                        <div className="justify-start text-neutral-400 dark:text-zinc-400 text-sm font-medium font-['Manrope']">{entry.yB}</div>
                      </div>
                      <div className="flex-1 px-3 py-2 bg-white dark:bg-zinc-900 flex justify-center items-center gap-2.5">
                        <div className="justify-start text-neutral-400 dark:text-zinc-400 text-sm font-medium font-['Manrope']">{entry.xB}</div>
                      </div>
                      <div className="flex-1 px-3 py-2 bg-white dark:bg-zinc-900 flex justify-center items-center gap-2.5">
                        <div className="justify-start text-neutral-400 dark:text-zinc-400 text-sm font-medium font-['Manrope']">{entry.beta1}</div>
                      </div>
                      <div className="flex-1 px-3 py-2 bg-white dark:bg-zinc-900 flex justify-center items-center gap-2.5">
                        <div className="justify-start text-neutral-400 dark:text-zinc-400 text-sm font-medium font-['Manrope']">{entry.beta2}</div>
                      </div>
                      <div className="flex-1 px-3 py-2 bg-white dark:bg-zinc-900 flex justify-center items-center gap-2.5">
                        <div className="justify-start text-neutral-400 dark:text-zinc-400 text-sm font-medium font-['Manrope']">{(() => { const d = new Date(entry.date); return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth()+1).toString().padStart(2, '0')}/${d.getFullYear()}` })()}</div>
                      </div>
                      <div className="flex-1 self-stretch px-3 py-2 bg-white dark:bg-zinc-900 flex justify-center items-center gap-2.5">
                        <button onClick={() => handleDownload(entry)} className="flex items-center justify-center">
                          <svg className="w-4 h-4 text-neutral-400 dark:text-zinc-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
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
        {/* MOBILE LAYOUT */}
        <div className="block md:hidden w-full max-w-md mx-auto min-h-screen bg-stone-50 dark:bg-zinc-950 transition-colors relative px-4 py-4">
          <div className="flex flex-col justify-start items-start gap-6 w-full">
            <div className="self-stretch flex flex-col justify-start items-start gap-1">
              <div className="inline-flex items-center gap-3 w-full">
                <TaskMobileBackButton />
                <span className="text-black dark:text-white text-2xl font-bold font-['Manrope']">{t.forwardIntersection}</span>
              </div>
            </div>
            <div className="p-1.5 bg-white dark:bg-zinc-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-800 inline-flex justify-start items-center gap-2 mb-2">
              <div className="px-3 py-1 bg-gray-200 dark:bg-zinc-700 rounded flex justify-center items-center gap-2.5">
                <div className="justify-start text-black dark:text-white text-base font-medium font-['Manrope']">{t.instrument}</div>
              </div>
              <Link to="/forward-intersection/docs" className="px-3 py-1 bg-white dark:bg-zinc-900 rounded flex justify-center items-center gap-2.5">
                <div className="justify-start text-neutral-400 dark:text-zinc-400 text-base font-medium font-['Manrope']">Документация</div>
              </Link>
            </div>
            <div className="self-stretch flex flex-col justify-start items-start gap-10 w-full">
              <div className="self-stretch flex flex-col justify-start items-start gap-5 w-full">
                {/* Form Card */}
                <div className="self-stretch p-3 bg-white dark:bg-zinc-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-800 flex flex-col justify-center items-end gap-3 w-full min-w-0 overflow-hidden">
                  <div className="self-stretch justify-start text-black dark:text-white text-base font-semibold font-['Manrope']">{t.inputData}</div>
                  <div className="self-stretch flex flex-col justify-start items-start gap-4 w-full">
                    {/* Yₐ */}
                    <div className="self-stretch flex flex-col justify-start items-start gap-2">
                      <div className="justify-start text-black dark:text-white text-sm font-medium font-['Manrope']">Yₐ</div>
                      <input type="number" id="yA" value={form.yA} onChange={handleChange} className="self-stretch p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-600 bg-white dark:bg-zinc-800 text-black dark:text-zinc-100 placeholder:text-neutral-400 dark:placeholder:text-zinc-500 text-sm font-medium font-['Manrope']" placeholder="Въведете Yₐ" list="yA-history-mobile" />
                      <datalist id="yA-history-mobile">{getInputHistory('yA').map((v, i) => <option value={v} key={i} />)}</datalist>
                    </div>
                    {/* Xₐ */}
                    <div className="self-stretch flex flex-col justify-start items-start gap-2">
                      <div className="justify-start text-black dark:text-white text-sm font-medium font-['Manrope']">Xₐ</div>
                      <input type="number" id="xA" value={form.xA} onChange={handleChange} className="self-stretch p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-600 bg-white dark:bg-zinc-800 text-black dark:text-zinc-100 placeholder:text-neutral-400 dark:placeholder:text-zinc-500 text-sm font-medium font-['Manrope']" placeholder="Въведете Xₐ" list="xA-history-mobile" />
                      <datalist id="xA-history-mobile">{getInputHistory('xA').map((v, i) => <option value={v} key={i} />)}</datalist>
                    </div>
                    {/* Yᵦ */}
                    <div className="self-stretch flex flex-col justify-start items-start gap-2">
                      <div className="justify-start text-black dark:text-white text-sm font-medium font-['Manrope']">Yᵦ</div>
                      <input type="number" id="yB" value={form.yB} onChange={handleChange} className="self-stretch p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-600 bg-white dark:bg-zinc-800 text-black dark:text-zinc-100 placeholder:text-neutral-400 dark:placeholder:text-zinc-500 text-sm font-medium font-['Manrope']" placeholder="Въведете Yᵦ" list="yB-history-mobile" />
                      <datalist id="yB-history-mobile">{getInputHistory('yB').map((v, i) => <option value={v} key={i} />)}</datalist>
                    </div>
                    {/* Xᵦ */}
                    <div className="self-stretch flex flex-col justify-start items-start gap-2">
                      <div className="justify-start text-black dark:text-white text-sm font-medium font-['Manrope']">Xᵦ</div>
                      <input type="number" id="xB" value={form.xB} onChange={handleChange} className="self-stretch p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-600 bg-white dark:bg-zinc-800 text-black dark:text-zinc-100 placeholder:text-neutral-400 dark:placeholder:text-zinc-500 text-sm font-medium font-['Manrope']" placeholder="Въведете Xᵦ" list="xB-history-mobile" />
                      <datalist id="xB-history-mobile">{getInputHistory('xB').map((v, i) => <option value={v} key={i} />)}</datalist>
                    </div>
                    {/* β₁ */}
                    <div className="self-stretch flex flex-col justify-start items-start gap-2">
                      <div className="justify-start text-black dark:text-white text-sm font-medium font-['Manrope']">β₁</div>
                      <input type="number" id="beta1" value={form.beta1} onChange={handleChange} className="self-stretch p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-600 bg-white dark:bg-zinc-800 text-black dark:text-zinc-100 placeholder:text-neutral-400 dark:placeholder:text-zinc-500 text-sm font-medium font-['Manrope']" placeholder="Въведете β₁" list="beta1-history-mobile" />
                      <datalist id="beta1-history-mobile">{getInputHistory('beta1').map((v, i) => <option value={v} key={i} />)}</datalist>
                    </div>
                    {/* β₂ */}
                    <div className="self-stretch flex flex-col justify-start items-start gap-2">
                      <div className="justify-start text-black dark:text-white text-sm font-medium font-['Manrope']">β₂</div>
                      <input type="number" id="beta2" value={form.beta2} onChange={handleChange} className="self-stretch p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-600 bg-white dark:bg-zinc-800 text-black dark:text-zinc-100 placeholder:text-neutral-400 dark:placeholder:text-zinc-500 text-sm font-medium font-['Manrope']" placeholder="Въведете β₂" list="beta2-history-mobile" />
                      <datalist id="beta2-history-mobile">{getInputHistory('beta2').map((v, i) => <option value={v} key={i} />)}</datalist>
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
                  <div className="self-stretch justify-start text-black dark:text-white text-base font-semibold font-['Manrope']">{t.results}</div>
                  <div className="self-stretch p-3 bg-stone-50 dark:bg-zinc-800 rounded-lg flex flex-col justify-start items-start w-full">
                    <div className="self-stretch text-neutral-400 dark:text-zinc-400 text-sm font-medium font-['Manrope'] whitespace-pre-line">{displayText}{isTyping && <span className="animate-pulse">|</span>}</div>
                  </div>
                </div>
              </div>
              {/* History Table */}
              <div className="self-stretch flex flex-col justify-start items-start gap-3 w-full">
                <div className="text-black dark:text-white text-lg font-bold font-['Manrope']">{t.calculationHistory}</div>
                <div className="self-stretch flex flex-col justify-start items-start gap-2.5 w-full">
                  <div className="w-full overflow-x-auto">
                    <div className="min-w-[800px] rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-800 flex flex-col justify-start items-start gap-px overflow-hidden">
                      <div className="self-stretch shadow-[0px_8px_24px_0px_rgba(0,0,0,0.04)] inline-flex justify-start items-start gap-px bg-white dark:bg-zinc-900">
                        {tableHeaders.map((h, i) => (
                          <div key={i} className="flex-1 px-3 py-2 min-w-[80px] flex justify-center items-center gap-2.5 text-center border-r border-gray-200">
                            <div className="text-black dark:text-white text-sm font-medium font-['Manrope'] text-center">{h.label}</div>
                          </div>
                        ))}
                      </div>
                      {paginatedHistory.length === 0 ? (
                        <div className="w-full px-3 py-2 bg-white dark:bg-zinc-900 text-neutral-400 dark:text-zinc-400 text-sm font-medium font-['Manrope']">Няма изчисления.</div>
                      ) : (
                        paginatedHistory.map((entry, idx) => (
                          <div key={idx} className="self-stretch inline-flex justify-start items-start gap-px">
                            <div className="flex-1 px-3 py-2 bg-white dark:bg-zinc-900 flex justify-center items-center gap-2.5">
                              <div className="justify-start text-neutral-400 dark:text-zinc-400 text-sm font-medium font-['Manrope']">{entry.yA}</div>
                            </div>
                            <div className="flex-1 px-3 py-2 bg-white dark:bg-zinc-900 flex justify-center items-center gap-2.5">
                              <div className="justify-start text-neutral-400 dark:text-zinc-400 text-sm font-medium font-['Manrope']">{entry.xA}</div>
                            </div>
                            <div className="flex-1 px-3 py-2 bg-white dark:bg-zinc-900 flex justify-center items-center gap-2.5">
                              <div className="justify-start text-neutral-400 dark:text-zinc-400 text-sm font-medium font-['Manrope']">{entry.yB}</div>
                            </div>
                            <div className="flex-1 px-3 py-2 bg-white dark:bg-zinc-900 flex justify-center items-center gap-2.5">
                              <div className="justify-start text-neutral-400 dark:text-zinc-400 text-sm font-medium font-['Manrope']">{entry.xB}</div>
                            </div>
                            <div className="flex-1 px-3 py-2 bg-white dark:bg-zinc-900 flex justify-center items-center gap-2.5">
                              <div className="justify-start text-neutral-400 dark:text-zinc-400 text-sm font-medium font-['Manrope']">{entry.beta1}</div>
                            </div>
                            <div className="flex-1 px-3 py-2 bg-white dark:bg-zinc-900 flex justify-center items-center gap-2.5">
                              <div className="justify-start text-neutral-400 dark:text-zinc-400 text-sm font-medium font-['Manrope']">{entry.beta2}</div>
                            </div>
                            <div className="flex-1 px-3 py-2 bg-white dark:bg-zinc-900 flex justify-center items-center gap-2.5">
                              <div className="justify-start text-neutral-400 dark:text-zinc-400 text-sm font-medium font-['Manrope']">{(() => { const d = new Date(entry.date); return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth()+1).toString().padStart(2, '0')}/${d.getFullYear()}` })()}</div>
                            </div>
                            <div className="flex-1 self-stretch px-3 py-2 bg-white dark:bg-zinc-900 flex justify-center items-center gap-2.5">
                              <button onClick={() => handleDownload(entry)} className="flex items-center justify-center">
                                <svg className="w-4 h-4 text-neutral-400 dark:text-zinc-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
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
      </Layout>
    </>
  );
};

export default ForwardIntersection;
