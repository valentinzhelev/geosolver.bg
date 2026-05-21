import React, { useState, useEffect, useRef, useMemo } from 'react';
import SEO from '../shared/SEO';
import Layout from '../layout/Layout';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { useSyncTaskLanguage } from '../../hooks/useSyncTaskLanguage';
import { isTaskPlaceholderResult } from '../../utils/taskI18n';
import useTypewriter from '../../hooks/useTypewriter';
import { useGuardedCalculation } from '../../hooks/useGuardedCalculation';
import { useEduAssignmentBridge } from '../../hooks/useEduAssignmentBridge';
import EduWorkBanner from '../classroom/ui/EduWorkBanner';
import TaskActionBar from './TaskActionBar';
import TaskMobileBackButton from './TaskMobileBackButton';
import { useProScan } from '../../hooks/useProScan';
import { calculateFirstTask as calculateFirstTaskDomain } from '../../domain/geodesy';
import { roundTo } from '../../domain/math';
import { extractTaskInputFromImage } from '../../services/scanService';

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

const LOW_CONFIDENCE = 0.75;

const PurvaZadacha = () => {
  const [form, setForm] = useState({ y1: '', x1: '', alpha: '', s: '' });
  const [lowConfFields, setLowConfFields] = useState({});
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const { t, language } = useTranslation();
  const { isProUser, proScanMessage } = useProScan(language);
  const [resultText, setResultText] = useState(t.defaultResultText);
  useSyncTaskLanguage(resultText, setResultText, (tr) => tr.defaultResultText);
  const [history, setHistory] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(history.length / itemsPerPage);
  const paginatedHistory = history.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const { displayText, isTyping } = useTypewriter(resultText);
  const { runWithTracking, isAuthenticated } = useGuardedCalculation();
  const [lastCalcResult, setLastCalcResult] = useState(null);
  const { eduCtx, applyResultToAssignment, dismissEduBanner, canSaveToAssignment } = useEduAssignmentBridge(
    'first-basic-task',
    setForm
  );

  // Debug: see what is being set
  useEffect(() => {
    console.log('setResultText value:', resultText);
  }, [resultText]);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  const handleChange = (e) => {
    const id = e.target.id;
    setForm({ ...form, [id]: e.target.value });
    saveInputHistory(id, e.target.value);
    if (lowConfFields[id]) setLowConfFields((prev) => ({ ...prev, [id]: false }));
  };

  const handleScanFile = async (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    if (!isProUser) {
      alert(proScanMessage);
      return;
    }
    setIsScanning(true);
    setLowConfFields({});
    try {
      const result = await extractTaskInputFromImage(file);
      if (result.success && result.inputData) {
        const d = result.inputData;
        const newForm = {
          y1: d.y1 != null ? String(d.y1) : form.y1,
          x1: d.x1 != null ? String(d.x1) : form.x1,
          alpha: d.alpha != null ? String(d.alpha) : form.alpha,
          s: d.s != null ? String(d.s) : form.s
        };
        setForm(newForm);
        if (d.y1 != null) saveInputHistory('y1', String(d.y1));
        if (d.x1 != null) saveInputHistory('x1', String(d.x1));
        if (d.alpha != null) saveInputHistory('alpha', String(d.alpha));
        if (d.s != null) saveInputHistory('s', String(d.s));
        const conf = result.confidence || {};
        setLowConfFields({
          y1: conf.y1 != null && conf.y1 < LOW_CONFIDENCE,
          x1: conf.x1 != null && conf.x1 < LOW_CONFIDENCE,
          alpha: conf.alpha != null && conf.alpha < LOW_CONFIDENCE,
          s: conf.s != null && conf.s < LOW_CONFIDENCE
        });
      } else {
        setLowConfFields({});
        alert(language === 'bg' ? 'Не можахме да разпознаем данни. Опитайте с по-четлива снимка.' : 'Could not recognize data. Try a clearer image.');
      }
    } catch (err) {
      setLowConfFields({});
      const backendMessage = err?.message;
      if (backendMessage) {
        alert(backendMessage);
      } else {
        alert(language === 'bg' ? 'Грешка при сканиране. Уверете се, че backend-ът работи.' : 'Scan error. Ensure the backend is running.');
      }
    } finally {
      setIsScanning(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (cameraInputRef.current) cameraInputRef.current.value = '';
    }
  };

  const handleScanClick = () => {
    cameraInputRef.current?.click();
  };

  const calculate = async () => {
    const y1 = parseFloat(form.y1);
    const x1 = parseFloat(form.x1);
    const alpha = parseFloat(form.alpha);
    const s = parseFloat(form.s);
    if (isNaN(y1) || isNaN(x1) || isNaN(alpha) || isNaN(s)) {
      alert(t.fillAllFields);
      return;
    }

    const result = await runWithTracking({
      toolName: 'first-basic-task',
      toolDisplayName: { bg: 'Първа основна задача', en: 'First Basic Task' },
      inputData: { y1, x1, alpha, s },
      getResultData: (r) => ({
        y2: r.y2,
        x2: r.x2,
        deltaX: r.deltaX,
        deltaY: r.deltaY,
      }),
      run: () => purvaOsnovnaZadacha(y1, x1, alpha, s),
    });
    if (!result) return;
    setLastCalcResult(result);
    const formatNumber = (value, decimals) => {
      if (value == null || Number.isNaN(value)) return '';
      const fixed = Number(value).toFixed(decimals);
      return language === 'bg' ? fixed.replace('.', ',') : fixed;
    };
    const output = language === 'bg' 
      ? `Входни данни:
Y1 = ${formatNumber(result.y1, 2)}, X1 = ${formatNumber(result.x1, 2)}
S₁,₂ = ${formatNumber(result.s, 2)}, α₁,₂ = ${formatNumber(result.alphaGon, 4)} gon

Резултат:
Y2 = Y1 + S₁,₂ * sin(α₁,₂)
Y2 = ${formatNumber(result.y1, 2)} + ${formatNumber(result.s, 2)} * ${formatNumber(result.sinAlpha, 4)} = ${formatNumber(result.y2, 2)} м

X2 = X1 + S₁,₂ * cos(α₁,₂)
X2 = ${formatNumber(result.x1, 2)} + ${formatNumber(result.s, 2)} * ${formatNumber(result.cosAlpha, 4)} = ${formatNumber(result.x2, 2)} м`
      : `Input data:
Y1 = ${formatNumber(result.y1, 2)}, X1 = ${formatNumber(result.x1, 2)}
S₁,₂ = ${formatNumber(result.s, 2)}, α₁,₂ = ${formatNumber(result.alphaGon, 4)} gon

Result:
Y2 = Y1 + S₁,₂ * sin(α₁,₂)
Y2 = ${formatNumber(result.y1, 2)} + ${formatNumber(result.s, 2)} * ${formatNumber(result.sinAlpha, 4)} = ${formatNumber(result.y2, 2)} m

X2 = X1 + S₁,₂ * cos(α₁,₂)
X2 = ${formatNumber(result.x1, 2)} + ${formatNumber(result.s, 2)} * ${formatNumber(result.cosAlpha, 4)} = ${formatNumber(result.x2, 2)} m`;
    
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
  // Uses domain module for calculations
  const purvaOsnovnaZadacha = (y1, x1, alphaGon, s) => {
    const result = calculateFirstTaskDomain(y1, x1, alphaGon, s);
    
    // Apply rounding for UI compatibility
    return {
      x1: result.x1,
      y1: result.y1,
      alphaGon: result.alphaGon,
      s: result.s,
      alphaRad: roundTo(result.alphaRad, 6),
      sinAlpha: roundTo(result.sinAlpha, 6),
      cosAlpha: roundTo(result.cosAlpha, 6),
      deltaX: roundTo(result.deltaX, 3),
      deltaY: roundTo(result.deltaY, 3),
      x2: roundTo(result.x2, 3),
      y2: roundTo(result.y2, 3),
      quadrant: result.quadrant,
      calculatedDistance: roundTo(result.calculatedDistance, 3),
      calculatedAngle: roundTo(result.calculatedAngle, 3)
    };
  };

  const resetForm = () => {
    setForm({ y1: '', x1: '', alpha: '', s: '' });
    setResultText(t.defaultResultText);
    setLastCalcResult(null);
    setLowConfFields({});
  };

  const inputClass = (fieldId) => {
    const low = lowConfFields[fieldId]
      ? 'outline-amber-400 dark:outline-amber-500 ring-1 ring-amber-200 dark:ring-amber-900/50'
      : 'outline-gray-200 dark:outline-zinc-600';
    return `self-stretch p-3 rounded-lg outline outline-1 outline-offset-[-1px] bg-white dark:bg-zinc-800 text-black dark:text-zinc-100 placeholder:text-neutral-400 dark:placeholder:text-zinc-500 text-xs font-medium font-['Manrope'] ${low}`;
  };

  const inputClassDesktop = (fieldId) => {
    const low = lowConfFields[fieldId]
      ? 'outline-amber-400 dark:outline-amber-500 ring-1 ring-amber-200 dark:ring-amber-900/50'
      : 'outline-gray-200 dark:outline-zinc-600';
    return `self-stretch p-3 rounded-lg outline outline-1 outline-offset-[-1px] bg-white dark:bg-zinc-800 text-black dark:text-zinc-100 placeholder:text-neutral-400 dark:placeholder:text-zinc-500 text-sm font-medium font-['Manrope'] ${low}`;
  };

  const handleDownload = (entry) => {
    const text = language === 'bg'
      ? `Y1: ${entry.y1}\nX1: ${entry.x1}\nα: ${entry.alpha}\nS: ${entry.s}\nY2: ${entry.y2}\nX2: ${entry.x2}\n${t.date}: ${(() => { const d = new Date(entry.date); return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth()+1).toString().padStart(2, '0')}/${d.getFullYear()}` })()}`
      : `Y1: ${entry.y1}\nX1: ${entry.x1}\nα: ${entry.alpha}\nS: ${entry.s}\nY2: ${entry.y2}\nX2: ${entry.x2}\n${t.date}: ${(() => { const d = new Date(entry.date); return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth()+1).toString().padStart(2, '0')}/${d.getFullYear()}` })()}`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `result_${entry.y1}_${entry.x1}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Check if all fields are filled
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

  const structuredData = useMemo(
    () => ({
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: `${t.firstTaskTitle} - GeoSolver`,
      description: t.firstTaskDescription,
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web Browser',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
      featureList:
        language === 'bg'
          ? [
              'Изчисляване на координати',
              'Трансформация по полярен метод',
              'Валидация на входни данни',
              'История на изчисленията',
            ]
          : [
              'Coordinate calculation',
              'Polar method transformation',
              'Input validation',
              'Calculation history',
            ],
    }),
    [t, language]
  );

  return (
    <>
      <input ref={fileInputRef} type="file" accept="image/*" onChange={(e) => e.target.files?.[0] && handleScanFile(e.target.files[0])} className="hidden" aria-hidden="true" />
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={(e) => e.target.files?.[0] && handleScanFile(e.target.files[0])} className="hidden" aria-hidden="true" />
      <SEO
        title={t.firstTaskTitle}
        description={t.firstTaskDescription}
        keywords={t.firstTaskKeywords}
        canonical="/first-task"
        structuredData={structuredData}
      />
      <Layout>
        <EduWorkBanner
          eduCtx={eduCtx}
          bg={language === 'bg'}
          showApply={!!lastCalcResult && canSaveToAssignment}
          onApply={() => applyResultToAssignment(lastCalcResult)}
          onDismiss={dismissEduBanner}
        />
        {/* MOBILE LAYOUT */}
        <div className="block md:hidden w-full max-w-md mx-auto min-h-screen bg-stone-50 dark:bg-zinc-950 transition-colors relative px-4 py-4">
          {/* Main Content */}
          <div className="flex flex-col justify-start items-start gap-6 w-full">
            <div className="self-stretch flex flex-col justify-start items-start gap-1">
              <div className="inline-flex items-center gap-3 w-full">
                <TaskMobileBackButton />
                <span className="text-black dark:text-white text-2xl font-bold font-['Manrope']">{t.firstTaskTitle}</span>
              </div>
            </div>
            {/* Tab group above the form card - use desktop design, but only as wide as content */}
            <div className="p-1.5 bg-white dark:bg-zinc-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-800 inline-flex justify-start items-center gap-2 mb-2">
              <div data-property-1="Default" className="px-3 py-1 bg-gray-200 dark:bg-zinc-700 rounded flex justify-center items-center gap-2.5">
                <div className="justify-start text-black dark:text-white text-base font-medium font-['Manrope']">{t.instrument}</div>
              </div>
              <Link to="/first-task/docs" className="px-3 py-1 bg-white dark:bg-zinc-900 rounded flex justify-center items-center gap-2.5">
                <div className="justify-start text-neutral-400 dark:text-zinc-400 text-base font-medium font-['Manrope']">{t.documentation}</div>
              </Link>
            </div>
            <div className="self-stretch flex flex-col justify-start items-start gap-10 w-full">
              <div className="self-stretch flex flex-col justify-start items-start gap-5 w-full">
                {/* Form Card */}
                <div className="self-stretch p-3 bg-white dark:bg-zinc-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-800 flex flex-col justify-center items-end gap-3 w-full min-w-0 overflow-hidden">
                  <div className="self-stretch justify-start text-black dark:text-white text-base font-semibold font-['Manrope']">{t.inputData}</div>
                  <div className="self-stretch flex flex-col justify-start items-start gap-4 w-full">
                    {/* Y1 */}
                    <div className="self-stretch flex flex-col justify-start items-start gap-2 w-full">
                      <div className="justify-start text-black dark:text-white text-xs font-medium font-['Manrope']">{t.y1Coordinate}</div>
                      <input
                        type="number"
                        id="y1"
                        value={form.y1}
                        onChange={handleChange}
                        step="any"
                        className={inputClass('y1')}
                        placeholder={t.enterY1}
                        list="y1-history"
                      />
                      <datalist id="y1-history">
                        {getInputHistory('y1').map((v, i) => <option value={v} key={i} />)}
                      </datalist>
                    </div>
                    {/* X1 */}
                    <div className="self-stretch flex flex-col justify-start items-start gap-2 w-full">
                      <div className="justify-start text-black dark:text-white text-xs font-medium font-['Manrope']">{t.x1Coordinate}</div>
                      <input
                        type="number"
                        id="x1"
                        value={form.x1}
                        onChange={handleChange}
                        step="any"
                        className={inputClass('x1')}
                        placeholder={t.enterX1}
                        list="x1-history"
                      />
                      <datalist id="x1-history">
                        {getInputHistory('x1').map((v, i) => <option value={v} key={i} />)}
                      </datalist>
                    </div>
                    {/* Alpha */}
                    <div className="self-stretch flex flex-col justify-start items-start gap-2 w-full">
                      <div className="justify-start text-black dark:text-white text-xs font-medium font-['Manrope']">{t.angleAlpha}</div>
                      <input
                        type="number"
                        id="alpha"
                        value={form.alpha}
                        onChange={handleChange}
                        step="any"
                        className={inputClass('alpha')}
                        placeholder={t.enterAlpha}
                        list="alpha-history"
                      />
                      <datalist id="alpha-history">
                        {getInputHistory('alpha').map((v, i) => <option value={v} key={i} />)}
                      </datalist>
                    </div>
                    {/* S */}
                    <div className="self-stretch flex flex-col justify-start items-start gap-2 w-full">
                      <div className="justify-start text-black dark:text-white text-xs font-medium font-['Manrope']">{t.lengthS}</div>
                      <input
                        type="number"
                        id="s"
                        value={form.s}
                        onChange={handleChange}
                        step="any"
                        className={inputClass('s')}
                        placeholder={t.enterS}
                        list="s-history"
                      />
                      <datalist id="s-history">
                        {getInputHistory('s').map((v, i) => <option value={v} key={i} />)}
                      </datalist>
                    </div>
                  </div>
                                    <TaskActionBar
                    onReset={resetForm}
                    onCalculate={calculate}
                    calculateDisabled={isAuthenticated && !isFormValid()}
                    scanOnClick={handleScanClick}
                    scanIsScanning={isScanning}
                  />

                </div>
                {/* Results Card */}
                <div className="self-stretch p-3 bg-white dark:bg-zinc-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-800 flex flex-col justify-center items-end gap-3 w-full min-w-0 overflow-hidden">
                  <div className="self-stretch justify-start text-black dark:text-white text-base font-semibold font-['Manrope']">{t.results}</div>
                  <div className="self-stretch p-3 bg-stone-50 dark:bg-zinc-800 rounded-lg flex flex-col justify-start items-start w-full">
                    <div className="self-stretch justify-start text-neutral-400 dark:text-zinc-400 text-sm font-medium font-['Manrope'] whitespace-pre-line">
                      {displayText}
                      {isTyping && <span className="animate-pulse">|</span>}
                    </div>
                  </div>
                </div>
              </div>
              {/* History Table */}
              <div className="self-stretch flex flex-col justify-start items-start gap-3 w-full">
                <div className="justify-start text-black dark:text-white text-lg font-bold font-['Manrope']">{t.calculationHistory}</div>
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
                          <div className="text-black dark:text-white text-sm font-medium font-['Manrope'] text-center">α</div>
                        </div>
                        <div className="flex-1 px-3 py-2 min-w-[80px] flex justify-center items-center gap-2.5 text-center border-r border-gray-200">
                          <div className="text-black dark:text-white text-sm font-medium font-['Manrope'] text-center">S</div>
                        </div>
                        <div className="flex-1 px-3 py-2 min-w-[80px] flex justify-center items-center gap-2.5 text-center border-r border-gray-200">
                          <div className="text-black dark:text-white text-sm font-medium font-['Manrope'] text-center">Y₂</div>
                        </div>
                        <div className="flex-1 px-3 py-2 min-w-[80px] flex justify-center items-center gap-2.5 text-center border-r border-gray-200">
                          <div className="text-black dark:text-white text-sm font-medium font-['Manrope'] text-center">X₂</div>
                        </div>
                        <div className="flex-1 px-3 py-2 min-w-[80px] flex justify-center items-center gap-2.5 text-center border-r border-gray-200">
                          <div className="text-black dark:text-white text-sm font-medium font-['Manrope'] text-center">{t.date}</div>
                        </div>
                        <div className="flex-1 px-3 py-2 min-w-[80px] flex justify-center items-center gap-2.5 text-center">
                          <div className="text-black dark:text-white text-sm font-medium font-['Manrope'] text-center">{t.download}</div>
                        </div>
                      </div>
                      {paginatedHistory.length === 0 ? (
                        <div className="w-full px-3 py-2 bg-white dark:bg-zinc-900 text-neutral-400 dark:text-zinc-400 text-sm font-medium font-['Manrope']">{t.noCalculations}</div>
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
                              <div className="justify-start text-neutral-400 dark:text-zinc-400 text-sm font-medium font-['Manrope']">{entry.alpha}</div>
                            </div>
                            <div className="flex-1 px-3 py-2 bg-white dark:bg-zinc-900 flex justify-center items-center gap-2.5">
                              <div className="justify-start text-neutral-400 dark:text-zinc-400 text-sm font-medium font-['Manrope']">{entry.s}</div>
                            </div>
                            <div className="flex-1 px-3 py-2 bg-white dark:bg-zinc-900 flex justify-center items-center gap-2.5">
                              <div className="justify-start text-neutral-400 dark:text-zinc-400 text-sm font-medium font-['Manrope']">{entry.y2}</div>
                            </div>
                            <div className="flex-1 px-3 py-2 bg-white dark:bg-zinc-900 flex justify-center items-center gap-2.5">
                              <div className="justify-start text-neutral-400 dark:text-zinc-400 text-sm font-medium font-['Manrope']">{entry.x2}</div>
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
                {/* Pagination (static, for design) */}
                <div className="self-stretch inline-flex justify-center items-center gap-4 w-full">
                  <div className="flex justify-start items-center gap-2">
                    <button className="w-7 self-stretch px-2 py-1 rounded inline-flex flex-col justify-center items-center" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                      <img src="/icons/small_left_arrow.svg" alt={t.back} className="w-3 h-3 opacity-70 dark:invert" />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => (
                      <button key={i} className={`w-7 px-2 py-1 rounded ${currentPage === i + 1 ? 'bg-gray-200 dark:bg-zinc-700 text-black dark:text-white' : 'outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-800 text-neutral-400 dark:text-zinc-400'} inline-flex flex-col justify-center items-center`} onClick={() => setCurrentPage(i + 1)} disabled={currentPage === i + 1}>
                        <div className="justify-start text-sm font-medium font-['Manrope']">{i + 1}</div>
                      </button>
                    ))}
                    <button className="w-7 self-stretch px-2 py-1 rounded inline-flex flex-col justify-center items-center" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0}>
                      <img src="/icons/small_right_arrow.svg" alt={t.next} className="w-3 h-3 opacity-70 dark:invert" />
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
                  <Link to="/tools" className="text-neutral-400 dark:text-zinc-400 text-base font-medium font-['Manrope'] underline">{t.toolsTitle}</Link>
                  <span className="text-neutral-400 dark:text-zinc-400 text-base font-medium font-['Manrope']"> {'>'} {t.firstTaskTitle}</span>
                </div>
                <div className="justify-start text-black dark:text-white text-3xl font-bold font-['Manrope']">{t.firstTaskTitle}</div>
              </div>
              <div className="p-1.5 bg-white dark:bg-zinc-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-800 inline-flex justify-start items-center gap-2">
                <div className="px-3 py-1 bg-gray-200 dark:bg-zinc-700 rounded flex justify-center items-center gap-2.5">
                  <div className="justify-start text-black dark:text-white text-base font-medium font-['Manrope']">{t.instrument}</div>
                </div>
                <Link to="/first-task/docs" className="px-3 py-1 bg-white dark:bg-zinc-900 rounded flex justify-center items-center gap-2.5">
                  <div className="justify-start text-neutral-400 dark:text-zinc-400 text-base font-medium font-['Manrope']">{t.documentation}</div>
                </Link>
              </div>
            </div>
            {/* Form and Results */}
            <div className="self-stretch inline-flex justify-start items-start gap-5">
              {/* Form Card */}
              <div className="flex-1 p-4 bg-white dark:bg-zinc-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-800 inline-flex flex-col justify-center items-end gap-4">
                <div className="self-stretch justify-start text-black dark:text-white text-lg font-semibold font-['Manrope']">{t.inputData}</div>
                <div className="self-stretch flex flex-col justify-start items-start gap-4">
                  {/* Y1 */}
                  <div className="self-stretch flex flex-col justify-start items-start gap-2">
                    <div className="justify-start text-black dark:text-white text-sm font-medium font-['Manrope']">{t.y1Coordinate}</div>
                    <input
                      type="number"
                      id="y1"
                      value={form.y1}
                      onChange={handleChange}
                      step="any"
                      className={inputClassDesktop('y1')}
                      placeholder={t.enterY1}
                      list="y1-history"
                    />
                    <datalist id="y1-history">
                      {getInputHistory('y1').map((v, i) => <option value={v} key={i} />)}
                    </datalist>
                  </div>
                  {/* X1 */}
                  <div className="self-stretch flex flex-col justify-start items-start gap-2">
                    <div className="justify-start text-black dark:text-white text-sm font-medium font-['Manrope']">{t.x1Coordinate}</div>
                    <input
                      type="number"
                      id="x1"
                      value={form.x1}
                      onChange={handleChange}
                      step="any"
                      className={inputClassDesktop('x1')}
                      placeholder={t.enterX1}
                      list="x1-history"
                    />
                    <datalist id="x1-history">
                      {getInputHistory('x1').map((v, i) => <option value={v} key={i} />)}
                    </datalist>
                  </div>
                  {/* Alpha */}
                  <div className="self-stretch flex flex-col justify-start items-start gap-2">
                    <div className="justify-start text-black dark:text-white text-sm font-medium font-['Manrope']">{t.angleAlpha}</div>
                    <input
                      type="number"
                      id="alpha"
                      value={form.alpha}
                      onChange={handleChange}
                      step="any"
                      className={inputClassDesktop('alpha')}
                      placeholder={t.enterAlpha}
                      list="alpha-history"
                    />
                    <datalist id="alpha-history">
                      {getInputHistory('alpha').map((v, i) => <option value={v} key={i} />)}
                    </datalist>
                  </div>
                  {/* S */}
                  <div className="self-stretch flex flex-col justify-start items-start gap-2">
                    <div className="justify-start text-black dark:text-white text-sm font-medium font-['Manrope']">{t.lengthS}</div>
                    <input
                      type="number"
                      id="s"
                      value={form.s}
                      onChange={handleChange}
                      step="any"
                      className={inputClassDesktop('s')}
                      placeholder={t.enterS}
                      list="s-history"
                    />
                    <datalist id="s-history">
                      {getInputHistory('s').map((v, i) => <option value={v} key={i} />)}
                    </datalist>
                  </div>
                </div>
                                <TaskActionBar
                  layout="flex"
                  onReset={resetForm}
                  onCalculate={calculate}
                  calculateDisabled={isAuthenticated && !isFormValid()}
                  scanOnClick={handleScanClick}
                  scanIsScanning={isScanning}
                />

              </div>
              {/* Results Card */}
              <div className="flex-1 self-stretch p-4 bg-white dark:bg-zinc-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-800 inline-flex flex-col justify-center items-end gap-3">
                <div className="self-stretch justify-start text-black dark:text-white text-lg font-semibold font-['Manrope']">{t.results}</div>
                <div className="self-stretch flex-1 p-3 bg-stone-50 dark:bg-zinc-800 rounded-lg flex flex-col justify-start items-start">
                  <div className="self-stretch justify-start text-neutral-400 dark:text-zinc-400 text-sm font-medium font-['Manrope'] whitespace-pre-line">
                    {displayText}
                    {isTyping && <span className="animate-pulse">|</span>}
                  </div>
                </div>
                <button
                  type="button"
                  className={`px-4 py-2 ${isTaskPlaceholderResult(resultText) ? 'opacity-20 cursor-not-allowed' : ''} bg-gray-200 dark:bg-zinc-700 rounded-lg inline-flex justify-start items-center gap-3`}
                  disabled={isTaskPlaceholderResult(resultText)}
                  onClick={() => {
                    if (isTaskPlaceholderResult(resultText)) return;
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
                  <div className="justify-start text-black dark:text-white text-base font-medium font-['Manrope']">{t.download}</div>
                </button>
              </div>
            </div>
          </div>
          {/* History Table */}
          <div className="self-stretch flex flex-col justify-start items-start gap-4">
            <div className="justify-start text-black dark:text-white text-2xl font-bold font-['Manrope']">{t.calculationHistory}</div>
            <div className="self-stretch rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-800 flex flex-col justify-start items-start gap-px overflow-hidden">
              <div className="self-stretch shadow-[0px_8px_24px_0px_rgba(0,0,0,0.04)] inline-flex justify-start items-start gap-px">
                <div className="flex-1 px-3 py-2 bg-white dark:bg-zinc-900 flex justify-center items-center gap-2.5">
                  <div className="justify-start text-black dark:text-white text-sm font-medium font-['Manrope']">Y₁</div>
                </div>
                <div className="flex-1 px-3 py-2 bg-white dark:bg-zinc-900 flex justify-center items-center gap-2.5">
                  <div className="justify-start text-black dark:text-white text-sm font-medium font-['Manrope']">X₁</div>
                </div>
                <div className="flex-1 px-3 py-2 bg-white dark:bg-zinc-900 flex justify-center items-center gap-2.5">
                  <div className="justify-start text-black dark:text-white text-sm font-medium font-['Manrope']">α</div>
                </div>
                <div className="flex-1 px-3 py-2 bg-white dark:bg-zinc-900 flex justify-center items-center gap-2.5">
                  <div className="justify-start text-black dark:text-white text-sm font-medium font-['Manrope']">S</div>
                </div>
                <div className="flex-1 px-3 py-2 bg-white dark:bg-zinc-900 flex justify-center items-center gap-2.5">
                  <div className="justify-start text-black dark:text-white text-sm font-medium font-['Manrope']">Y₂</div>
                </div>
                <div className="flex-1 px-3 py-2 bg-white dark:bg-zinc-900 flex justify-center items-center gap-2.5">
                  <div className="justify-start text-black dark:text-white text-sm font-medium font-['Manrope']">X₂</div>
                </div>
                <div className="flex-1 px-3 py-2 bg-white dark:bg-zinc-900 flex justify-center items-center gap-2.5">
                  <div className="justify-start text-black dark:text-white text-sm font-medium font-['Manrope']">{t.date}</div>
                </div>
                <div className="flex-1 px-3 py-2 bg-white dark:bg-zinc-900 flex justify-center items-center gap-2.5">
                  <div className="justify-start text-black dark:text-white text-sm font-medium font-['Manrope']">{t.download}</div>
                </div>
              </div>
              {paginatedHistory.length === 0 ? (
                <div className="w-full px-3 py-2 bg-white dark:bg-zinc-900 text-neutral-400 dark:text-zinc-400 text-sm font-medium font-['Manrope']">{t.noCalculations}</div>
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
                      <div className="justify-start text-neutral-400 dark:text-zinc-400 text-sm font-medium font-['Manrope']">{entry.alpha}</div>
                    </div>
                    <div className="flex-1 px-3 py-2 bg-white dark:bg-zinc-900 flex justify-center items-center gap-2.5">
                      <div className="justify-start text-neutral-400 dark:text-zinc-400 text-sm font-medium font-['Manrope']">{entry.s}</div>
                    </div>
                    <div className="flex-1 px-3 py-2 bg-white dark:bg-zinc-900 flex justify-center items-center gap-2.5">
                      <div className="justify-start text-neutral-400 dark:text-zinc-400 text-sm font-medium font-['Manrope']">{entry.y2}</div>
                    </div>
                    <div className="flex-1 px-3 py-2 bg-white dark:bg-zinc-900 flex justify-center items-center gap-2.5">
                      <div className="justify-start text-neutral-400 dark:text-zinc-400 text-sm font-medium font-['Manrope']">{entry.x2}</div>
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
            {/* Pagination (static, for design) */}
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

export default PurvaZadacha;
