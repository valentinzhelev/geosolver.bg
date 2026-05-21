import React, { useState, useEffect } from 'react';
import Layout from '../layout/Layout';
import TaskActionBar from './TaskActionBar';
import TaskMobileBackButton from './TaskMobileBackButton';
import SEO from '../shared/SEO';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { useSyncTaskLanguage } from '../../hooks/useSyncTaskLanguage';
import { isTaskPlaceholderResult } from '../../utils/taskI18n';
import useTypewriter from '../../hooks/useTypewriter';
import { useGuardedCalculation } from '../../hooks/useGuardedCalculation';
import { useEduAssignmentBridge } from '../../hooks/useEduAssignmentBridge';
import EduWorkBanner from '../classroom/ui/EduWorkBanner';

// LocalStorage helpers
const getHistory = () => {
  try {
    const data = localStorage.getItem('resectionHistory');
    return data ? JSON.parse(data) : [];
  } catch { return []; }
};
const saveHistory = (entry) => {
  const history = getHistory();
  history.unshift(entry);
  localStorage.setItem('resectionHistory', JSON.stringify(history.slice(0, 20)));
};

/**
 * Изчисляване на обратна засечка (Resection):
 * Определяне на позиция на точка P по ъгли от известни точки A, B, C
 * 
 * Методи:
 * 1. Hansen Problem (три точки)
 * 2. Collins Point Method
 * 3. Cassini Method
 * 
 * @param {Object} points - Известни точки {xA, yA, xB, yB, xC, yC}
 * @param {Object} angles - Ъгли {beta1, beta2}
 * @returns {Object} Резултати от изчисленията
 */
function calculateResection(points, angles) {
  const { xA, yA, xB, yB, xC, yC } = points;
  const { beta1, beta2 } = angles;

  // Validate input data
  if (!xA || !yA || !xB || !yB || !xC || !yC || !beta1 || !beta2) {
    throw new Error('Всички координати и ъгли са задължителни');
  }

  // Gon to radians
  const beta1Rad = (beta1 * Math.PI) / 200;
  const beta2Rad = (beta2 * Math.PI) / 200;

  // Hansen Problem - triangulation
  const dxAB = xB - xA;
  const dyAB = yB - yA;
  const dxBC = xC - xB;
  const dyBC = yC - yB;

  // Triangle ABC angles
  const angleA = Math.atan2(dyAB, dxAB);
  const angleB = Math.atan2(dyBC, dxBC);

  // Sides
  const sideAB = Math.sqrt(dxAB * dxAB + dyAB * dyAB);
  const sideBC = Math.sqrt(dxBC * dxBC + dyBC * dyBC);

  // Solve for point P (law of sines)
  const angleAPB = Math.PI - beta1Rad;
  const angleBPC = Math.PI - beta2Rad;

  // Distances P to A, B, C
  const sideAP = (sideAB * Math.sin(beta1Rad)) / Math.sin(angleAPB);
  const sideBP = (sideBC * Math.sin(beta2Rad)) / Math.sin(angleBPC);

  // Point P coordinates (polar)
  const xP1 = xA + sideAP * Math.cos(angleA + beta1Rad);
  const yP1 = yA + sideAP * Math.sin(angleA + beta1Rad);
  
  const xP2 = xB + sideBP * Math.cos(angleB - beta2Rad);
  const yP2 = yB + sideBP * Math.sin(angleB - beta2Rad);

  // Average of both solutions
  const xP = (xP1 + xP2) / 2;
  const yP = (yP1 + yP2) / 2;

  // Distances for verification
  const distAP = Math.sqrt((xP - xA) * (xP - xA) + (yP - yA) * (yP - yA));
  const distBP = Math.sqrt((xP - xB) * (xP - xB) + (yP - yB) * (yP - yB));
  const distCP = Math.sqrt((xP - xC) * (xP - xC) + (yP - yC) * (yP - yC));

  // Angles for verification
  const calcBeta1 = Math.atan2(yB - yP, xB - xP) - Math.atan2(yA - yP, xA - xP);
  const calcBeta2 = Math.atan2(yC - yP, xC - xP) - Math.atan2(yB - yP, xB - xP);

  // Normalize angles
  const normalizedBeta1 = ((calcBeta1 * 200) / Math.PI + 400) % 400;
  const normalizedBeta2 = ((calcBeta2 * 200) / Math.PI + 400) % 400;

  return {
    xP: Math.round(xP * 1000) / 1000,
    yP: Math.round(yP * 1000) / 1000,
    distAP: Math.round(distAP * 1000) / 1000,
    distBP: Math.round(distBP * 1000) / 1000,
    distCP: Math.round(distCP * 1000) / 1000,
    calcBeta1: Math.round(normalizedBeta1 * 1000) / 1000,
    calcBeta2: Math.round(normalizedBeta2 * 1000) / 1000,
    error1: Math.round(Math.abs(normalizedBeta1 - beta1) * 1000) / 1000,
    error2: Math.round(Math.abs(normalizedBeta2 - beta2) * 1000) / 1000,
    method: 'Hansen Problem',
    calculationDetails: `Решение на триангулация с три точки и два ъгъла`
  };
}

const Resection = () => {
  const { t, language } = useTranslation();
  const [form, setForm] = useState({
    xA: '',
    yA: '',
    xB: '',
    yB: '',
    xC: '',
    yC: '',
    beta1: '',
    beta2: ''
  });
  const [resultText, setResultText] = useState(t.resectionDefaultResultText);
  useSyncTaskLanguage(resultText, setResultText, (tr) => tr.resectionDefaultResultText);
  const [history, setHistory] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(history.length / itemsPerPage);
  const paginatedHistory = history.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const { displayText, isTyping } = useTypewriter(resultText);
  const { runWithTracking, isAuthenticated } = useGuardedCalculation();
  const [lastCalcResult, setLastCalcResult] = useState(null);
  const { eduCtx, applyResultToAssignment, dismissEduBanner, canSaveToAssignment } = useEduAssignmentBridge('resection', setForm);

  useEffect(() => { setHistory(getHistory()); }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  const isFormValid = () => {
    return form.xA && form.yA && form.xB && form.yB && form.xC && form.yC && form.beta1 && form.beta2;
  };

  const handleCalculate = async () => {
    if (!isFormValid()) {
      alert(t.fillAllFields);
      return;
    }

    try {
      const points = {
        xA: parseFloat(form.xA),
        yA: parseFloat(form.yA),
        xB: parseFloat(form.xB),
        yB: parseFloat(form.yB),
        xC: parseFloat(form.xC),
        yC: parseFloat(form.yC)
      };
      const angles = {
        beta1: parseFloat(form.beta1),
        beta2: parseFloat(form.beta2)
      };

      const result = await runWithTracking({
        toolName: 'resection',
        toolDisplayName: { bg: 'Обратна засечка', en: 'Resection' },
        inputData: { ...points, ...angles },
        getResultData: (r) => ({ xP: r.xP, yP: r.yP, method: r.method }),
        run: () => calculateResection(points, angles),
      });
      if (!result) return;
      setLastCalcResult(result);

      const output = language === 'bg'
        ? `--------- Обратна засечка (Resection) ---------
Метод: ${result.method}
Входни данни: 3 точки, 2 ъгъла

--------- Координати на известни точки ---------
Точка A: (${points.xA}, ${points.yA})
Точка B: (${points.xB}, ${points.yB})
Точка C: (${points.xC}, ${points.yC})

--------- Измерени ъгли ---------
β₁ (A-P-B): ${angles.beta1} гради
β₂ (B-P-C): ${angles.beta2} гради

--------- Резултати ---------
Координати на точка P: (${result.xP}, ${result.yP})

--------- Разстояния за проверка ---------
Разстояние A-P: ${result.distAP} м
Разстояние B-P: ${result.distBP} м
Разстояние C-P: ${result.distCP} м

--------- Проверка на ъглите ---------
Изчислен β₁: ${result.calcBeta1} гради
Изчислен β₂: ${result.calcBeta2} гради
Грешка β₁: ${result.error1} гради
Грешка β₂: ${result.error2} гради

--------- Детайли за изчислението ---------
${result.calculationDetails}

Дата: ${new Date().toLocaleString('bg-BG')}`
        : `--------- Resection ---------
Method: ${result.method}
Input data: 3 points, 2 angles

--------- Known Point Coordinates ---------
Point A: (${points.xA}, ${points.yA})
Point B: (${points.xB}, ${points.yB})
Point C: (${points.xC}, ${points.yC})

--------- Measured Angles ---------
β₁ (A-P-B): ${angles.beta1} grads
β₂ (B-P-C): ${angles.beta2} grads

--------- Results ---------
Point P coordinates: (${result.xP}, ${result.yP})

--------- Verification Distances ---------
Distance A-P: ${result.distAP} m
Distance B-P: ${result.distBP} m
Distance C-P: ${result.distCP} m

--------- Angle Verification ---------
Calculated β₁: ${result.calcBeta1} grads
Calculated β₂: ${result.calcBeta2} grads
Error β₁: ${result.error1} grads
Error β₂: ${result.error2} grads

--------- Calculation Details ---------
${result.calculationDetails}

Date: ${new Date().toLocaleString('en-US')}`;

      setResultText(output);
      saveHistory({
        ...form,
        ...result,
        date: new Date().toISOString()
      });
      setHistory(getHistory());
    } catch (error) {
      setResultText(language === 'bg' 
        ? `Грешка: ${error.message}` 
        : `Error: ${error.message}`);
    }
  };

  const resetForm = () => {
    setForm({
      xA: '',
      yA: '',
      xB: '',
      yB: '',
      xC: '',
      yC: '',
      beta1: '',
      beta2: ''
    });
    setResultText(t.resectionDefaultResultText);
    setLastCalcResult(null);
  };

  return (
    <>
      <SEO
        title={t.resection}
        description={t.resectionDescription}
        keywords={t.resectionKeywords}
        canonical="/resection"
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
          <div className="flex flex-col justify-start items-start gap-6 w-full">
            <div className="self-stretch flex flex-col justify-start items-start gap-1">
              <div className="inline-flex items-center gap-3 w-full">
                <TaskMobileBackButton />
                <span className="text-black dark:text-white text-2xl font-bold font-['Manrope']">{t.resection}</span>
              </div>
            </div>
            {/* Tab group above the form card */}
            <div className="p-1.5 bg-white dark:bg-zinc-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-800 inline-flex justify-start items-center gap-2 mb-2">
              <div data-property-1="Default" className="px-3 py-1 bg-gray-200 dark:bg-zinc-700 rounded flex justify-center items-center gap-2.5">
                <div className="justify-start text-black dark:text-white text-base font-medium font-['Manrope']">{t.instrument}</div>
              </div>
              <Link to="/resection/docs" className="px-3 py-1 bg-white dark:bg-zinc-900 rounded flex justify-center items-center gap-2.5">
                <div className="justify-start text-neutral-400 dark:text-zinc-400 text-base font-medium font-['Manrope']">{t.documentation}</div>
              </Link>
            </div>
            <div className="self-stretch flex flex-col justify-start items-start gap-10 w-full">
              <div className="self-stretch flex flex-col justify-start items-start gap-5 w-full">
                {/* Form Card */}
                <div className="self-stretch p-3 bg-white dark:bg-zinc-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-800 flex flex-col justify-center items-end gap-3 w-full min-w-0 overflow-hidden">
                  <div className="self-stretch justify-start text-black dark:text-white text-base font-semibold font-['Manrope']">{t.inputData}</div>
                  <div className="self-stretch flex flex-col justify-start items-start gap-4 w-full">
                    {/* Point A */}
                    <div className="self-stretch flex flex-col justify-start items-start gap-2 w-full">
                      <div className="justify-start text-black dark:text-white text-xs font-medium font-['Manrope']">Точка A</div>
                      <div className="self-stretch flex gap-2 w-full">
                        <input
                          type="number"
                          id="xA"
                          value={form.xA}
                          onChange={handleChange}
                          step="any"
                          className="flex-1 p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-600 bg-white dark:bg-zinc-800 text-black dark:text-zinc-100 placeholder:text-neutral-400 dark:placeholder:text-zinc-500 text-xs font-medium font-['Manrope']"
                          placeholder="XA"
                        />
                        <input
                          type="number"
                          id="yA"
                          value={form.yA}
                          onChange={handleChange}
                          step="any"
                          className="flex-1 p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-600 bg-white dark:bg-zinc-800 text-black dark:text-zinc-100 placeholder:text-neutral-400 dark:placeholder:text-zinc-500 text-xs font-medium font-['Manrope']"
                          placeholder="YA"
                        />
                      </div>
                    </div>
                    {/* Point B */}
                    <div className="self-stretch flex flex-col justify-start items-start gap-2 w-full">
                      <div className="justify-start text-black dark:text-white text-xs font-medium font-['Manrope']">Точка B</div>
                      <div className="self-stretch flex gap-2 w-full">
                        <input
                          type="number"
                          id="xB"
                          value={form.xB}
                          onChange={handleChange}
                          step="any"
                          className="flex-1 p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-600 bg-white dark:bg-zinc-800 text-black dark:text-zinc-100 placeholder:text-neutral-400 dark:placeholder:text-zinc-500 text-xs font-medium font-['Manrope']"
                          placeholder="XB"
                        />
                        <input
                          type="number"
                          id="yB"
                          value={form.yB}
                          onChange={handleChange}
                          step="any"
                          className="flex-1 p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-600 bg-white dark:bg-zinc-800 text-black dark:text-zinc-100 placeholder:text-neutral-400 dark:placeholder:text-zinc-500 text-xs font-medium font-['Manrope']"
                          placeholder="YB"
                        />
                      </div>
                    </div>
                    {/* Point C */}
                    <div className="self-stretch flex flex-col justify-start items-start gap-2 w-full">
                      <div className="justify-start text-black dark:text-white text-xs font-medium font-['Manrope']">Точка C</div>
                      <div className="self-stretch flex gap-2 w-full">
                        <input
                          type="number"
                          id="xC"
                          value={form.xC}
                          onChange={handleChange}
                          step="any"
                          className="flex-1 p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-600 bg-white dark:bg-zinc-800 text-black dark:text-zinc-100 placeholder:text-neutral-400 dark:placeholder:text-zinc-500 text-xs font-medium font-['Manrope']"
                          placeholder="XC"
                        />
                        <input
                          type="number"
                          id="yC"
                          value={form.yC}
                          onChange={handleChange}
                          step="any"
                          className="flex-1 p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-600 bg-white dark:bg-zinc-800 text-black dark:text-zinc-100 placeholder:text-neutral-400 dark:placeholder:text-zinc-500 text-xs font-medium font-['Manrope']"
                          placeholder="YC"
                        />
                      </div>
                    </div>
                    {/* Beta 1 */}
                    <div className="self-stretch flex flex-col justify-start items-start gap-2 w-full">
                      <div className="justify-start text-black dark:text-white text-xs font-medium font-['Manrope']">Ъгъл β₁ (в гради)</div>
                      <input
                        type="number"
                        id="beta1"
                        value={form.beta1}
                        onChange={handleChange}
                        step="any"
                        className="self-stretch p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-600 bg-white dark:bg-zinc-800 text-black dark:text-zinc-100 placeholder:text-neutral-400 dark:placeholder:text-zinc-500 text-xs font-medium font-['Manrope']"
                        placeholder="Въведете ъгъл β₁"
                      />
                    </div>
                    {/* Beta 2 */}
                    <div className="self-stretch flex flex-col justify-start items-start gap-2 w-full">
                      <div className="justify-start text-black dark:text-white text-xs font-medium font-['Manrope']">Ъгъл β₂ (в гради)</div>
                      <input
                        type="number"
                        id="beta2"
                        value={form.beta2}
                        onChange={handleChange}
                        step="any"
                        className="self-stretch p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-600 bg-white dark:bg-zinc-800 text-black dark:text-zinc-100 placeholder:text-neutral-400 dark:placeholder:text-zinc-500 text-xs font-medium font-['Manrope']"
                        placeholder="Въведете ъгъл β₂"
                      />
                    </div>
                  </div>
                                    <TaskActionBar
                    onReset={resetForm}
                    onCalculate={handleCalculate}
                    calculateDisabled={isAuthenticated && !isFormValid()}
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
                          <div className="text-black dark:text-white text-sm font-medium font-['Manrope'] text-center">XA</div>
                        </div>
                        <div className="flex-1 px-3 py-2 min-w-[80px] flex justify-center items-center gap-2.5 text-center border-r border-gray-200">
                          <div className="text-black dark:text-white text-sm font-medium font-['Manrope'] text-center">YA</div>
                        </div>
                        <div className="flex-1 px-3 py-2 min-w-[80px] flex justify-center items-center gap-2.5 text-center border-r border-gray-200">
                          <div className="text-black dark:text-white text-sm font-medium font-['Manrope'] text-center">XB</div>
                        </div>
                        <div className="flex-1 px-3 py-2 min-w-[80px] flex justify-center items-center gap-2.5 text-center border-r border-gray-200">
                          <div className="text-black dark:text-white text-sm font-medium font-['Manrope'] text-center">YB</div>
                        </div>
                        <div className="flex-1 px-3 py-2 min-w-[80px] flex justify-center items-center gap-2.5 text-center border-r border-gray-200">
                          <div className="text-black dark:text-white text-sm font-medium font-['Manrope'] text-center">XC</div>
                        </div>
                        <div className="flex-1 px-3 py-2 min-w-[80px] flex justify-center items-center gap-2.5 text-center border-r border-gray-200">
                          <div className="text-black dark:text-white text-sm font-medium font-['Manrope'] text-center">YC</div>
                        </div>
                        <div className="flex-1 px-3 py-2 min-w-[80px] flex justify-center items-center gap-2.5 text-center border-r border-gray-200">
                          <div className="text-black dark:text-white text-sm font-medium font-['Manrope'] text-center">β₁</div>
                        </div>
                        <div className="flex-1 px-3 py-2 min-w-[80px] flex justify-center items-center gap-2.5 text-center border-r border-gray-200">
                          <div className="text-black dark:text-white text-sm font-medium font-['Manrope'] text-center">β₂</div>
                        </div>
                        <div className="flex-1 px-3 py-2 min-w-[80px] flex justify-center items-center gap-2.5 text-center border-r border-gray-200">
                          <div className="text-black dark:text-white text-sm font-medium font-['Manrope'] text-center">XP</div>
                        </div>
                        <div className="flex-1 px-3 py-2 min-w-[80px] flex justify-center items-center gap-2.5 text-center border-r border-gray-200">
                          <div className="text-black dark:text-white text-sm font-medium font-['Manrope'] text-center">YP</div>
                        </div>
                        <div className="flex-1 px-3 py-2 min-w-[80px] flex justify-center items-center gap-2.5 text-center border-r border-gray-200">
                          <div className="text-black dark:text-white text-sm font-medium font-['Manrope'] text-center">Дата</div>
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
                              <div className="justify-start text-neutral-400 dark:text-zinc-400 text-sm font-medium font-['Manrope']">{entry.xA}</div>
                            </div>
                            <div className="flex-1 px-3 py-2 bg-white dark:bg-zinc-900 flex justify-center items-center gap-2.5">
                              <div className="justify-start text-neutral-400 dark:text-zinc-400 text-sm font-medium font-['Manrope']">{entry.yA}</div>
                            </div>
                            <div className="flex-1 px-3 py-2 bg-white dark:bg-zinc-900 flex justify-center items-center gap-2.5">
                              <div className="justify-start text-neutral-400 dark:text-zinc-400 text-sm font-medium font-['Manrope']">{entry.xB}</div>
                            </div>
                            <div className="flex-1 px-3 py-2 bg-white dark:bg-zinc-900 flex justify-center items-center gap-2.5">
                              <div className="justify-start text-neutral-400 dark:text-zinc-400 text-sm font-medium font-['Manrope']">{entry.yB}</div>
                            </div>
                            <div className="flex-1 px-3 py-2 bg-white dark:bg-zinc-900 flex justify-center items-center gap-2.5">
                              <div className="justify-start text-neutral-400 dark:text-zinc-400 text-sm font-medium font-['Manrope']">{entry.xC}</div>
                            </div>
                            <div className="flex-1 px-3 py-2 bg-white dark:bg-zinc-900 flex justify-center items-center gap-2.5">
                              <div className="justify-start text-neutral-400 dark:text-zinc-400 text-sm font-medium font-['Manrope']">{entry.yC}</div>
                            </div>
                            <div className="flex-1 px-3 py-2 bg-white dark:bg-zinc-900 flex justify-center items-center gap-2.5">
                              <div className="justify-start text-neutral-400 dark:text-zinc-400 text-sm font-medium font-['Manrope']">{entry.beta1}</div>
                            </div>
                            <div className="flex-1 px-3 py-2 bg-white dark:bg-zinc-900 flex justify-center items-center gap-2.5">
                              <div className="justify-start text-neutral-400 dark:text-zinc-400 text-sm font-medium font-['Manrope']">{entry.beta2}</div>
                            </div>
                            <div className="flex-1 px-3 py-2 bg-white dark:bg-zinc-900 flex justify-center items-center gap-2.5">
                              <div className="justify-start text-neutral-400 dark:text-zinc-400 text-sm font-medium font-['Manrope']">{entry.xP}</div>
                            </div>
                            <div className="flex-1 px-3 py-2 bg-white dark:bg-zinc-900 flex justify-center items-center gap-2.5">
                              <div className="justify-start text-neutral-400 dark:text-zinc-400 text-sm font-medium font-['Manrope']">{entry.yP}</div>
                            </div>
                            <div className="flex-1 px-3 py-2 bg-white dark:bg-zinc-900 flex justify-center items-center gap-2.5">
                              <div className="justify-start text-neutral-400 dark:text-zinc-400 text-sm font-medium font-['Manrope']">{(() => { const d = new Date(entry.date); return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth()+1).toString().padStart(2, '0')}/${d.getFullYear()}` })()}</div>
                            </div>
                            <div className="flex-1 self-stretch px-3 py-2 bg-white dark:bg-zinc-900 flex justify-center items-center gap-2.5">
                              <button onClick={() => {
                                const text = `XA: ${entry.xA}, YA: ${entry.yA}\nXB: ${entry.xB}, YB: ${entry.yB}\nXC: ${entry.xC}, YC: ${entry.yC}\nβ₁: ${entry.beta1} гради\nβ₂: ${entry.beta2} гради\nXP: ${entry.xP}, YP: ${entry.yP}\nДата: ${(() => { const d = new Date(entry.date); return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth()+1).toString().padStart(2, '0')}/${d.getFullYear()}` })()}`;
                                const blob = new Blob([text], { type: 'text/plain' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = 'geosolver_resection.txt';
                                a.click();
                                URL.revokeObjectURL(url);
                              }} className="flex items-center justify-center"><svg className="w-4 h-4 text-neutral-400 dark:text-zinc-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 4v12m0 0l-4-4m4 4l4-4M4 20h16" strokeLinecap="round" strokeLinejoin="round"/></svg></button>
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
                  <Link to="/tools" className="text-neutral-400 dark:text-zinc-400 text-base font-medium font-['Manrope'] underline">{t.toolsTitle}</Link>
                  <span className="text-neutral-400 dark:text-zinc-400 text-base font-medium font-['Manrope']"> {'>'} {t.resection}</span>
                </div>
                <div className="justify-start text-black dark:text-white text-3xl font-bold font-['Manrope']">{t.resection}</div>
              </div>
              <div className="p-1.5 bg-white dark:bg-zinc-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-800 inline-flex justify-start items-center gap-2">
                <div className="px-3 py-1 bg-gray-200 dark:bg-zinc-700 rounded flex justify-center items-center gap-2.5">
                  <div className="justify-start text-black dark:text-white text-base font-medium font-['Manrope']">{t.instrument}</div>
                </div>
                <Link to="/resection/docs" className="px-3 py-1 bg-white dark:bg-zinc-900 rounded flex justify-center items-center gap-2.5">
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
                  {/* Point A */}
                  <div className="self-stretch flex flex-col justify-start items-start gap-2">
                    <div className="justify-start text-black dark:text-white text-sm font-medium font-['Manrope']">Точка A</div>
                    <div className="self-stretch flex gap-2">
                      <input
                        type="number"
                        id="xA"
                        value={form.xA}
                        onChange={handleChange}
                        step="any"
                        className="flex-1 p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-600 bg-white dark:bg-zinc-800 text-black dark:text-zinc-100 placeholder:text-neutral-400 dark:placeholder:text-zinc-500 text-sm font-medium font-['Manrope']"
                        placeholder="XA"
                      />
                      <input
                        type="number"
                        id="yA"
                        value={form.yA}
                        onChange={handleChange}
                        step="any"
                        className="flex-1 p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-600 bg-white dark:bg-zinc-800 text-black dark:text-zinc-100 placeholder:text-neutral-400 dark:placeholder:text-zinc-500 text-sm font-medium font-['Manrope']"
                        placeholder="YA"
                      />
                    </div>
                  </div>
                  {/* Point B */}
                  <div className="self-stretch flex flex-col justify-start items-start gap-2">
                    <div className="justify-start text-black dark:text-white text-sm font-medium font-['Manrope']">Точка B</div>
                    <div className="self-stretch flex gap-2">
                      <input
                        type="number"
                        id="xB"
                        value={form.xB}
                        onChange={handleChange}
                        step="any"
                        className="flex-1 p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-600 bg-white dark:bg-zinc-800 text-black dark:text-zinc-100 placeholder:text-neutral-400 dark:placeholder:text-zinc-500 text-sm font-medium font-['Manrope']"
                        placeholder="XB"
                      />
                      <input
                        type="number"
                        id="yB"
                        value={form.yB}
                        onChange={handleChange}
                        step="any"
                        className="flex-1 p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-600 bg-white dark:bg-zinc-800 text-black dark:text-zinc-100 placeholder:text-neutral-400 dark:placeholder:text-zinc-500 text-sm font-medium font-['Manrope']"
                        placeholder="YB"
                      />
                    </div>
                  </div>
                  {/* Point C */}
                  <div className="self-stretch flex flex-col justify-start items-start gap-2">
                    <div className="justify-start text-black dark:text-white text-sm font-medium font-['Manrope']">Точка C</div>
                    <div className="self-stretch flex gap-2">
                      <input
                        type="number"
                        id="xC"
                        value={form.xC}
                        onChange={handleChange}
                        step="any"
                        className="flex-1 p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-600 bg-white dark:bg-zinc-800 text-black dark:text-zinc-100 placeholder:text-neutral-400 dark:placeholder:text-zinc-500 text-sm font-medium font-['Manrope']"
                        placeholder="XC"
                      />
                      <input
                        type="number"
                        id="yC"
                        value={form.yC}
                        onChange={handleChange}
                        step="any"
                        className="flex-1 p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-600 bg-white dark:bg-zinc-800 text-black dark:text-zinc-100 placeholder:text-neutral-400 dark:placeholder:text-zinc-500 text-sm font-medium font-['Manrope']"
                        placeholder="YC"
                      />
                    </div>
                  </div>
                  {/* Beta 1 */}
                  <div className="self-stretch flex flex-col justify-start items-start gap-2">
                    <div className="justify-start text-black dark:text-white text-sm font-medium font-['Manrope']">Ъгъл β₁ (в гради)</div>
                    <input
                      type="number"
                      id="beta1"
                      value={form.beta1}
                      onChange={handleChange}
                      step="any"
                      className="self-stretch p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-600 bg-white dark:bg-zinc-800 text-black dark:text-zinc-100 placeholder:text-neutral-400 dark:placeholder:text-zinc-500 text-sm font-medium font-['Manrope']"
                      placeholder="Въведете ъгъл β₁"
                    />
                  </div>
                  {/* Beta 2 */}
                  <div className="self-stretch flex flex-col justify-start items-start gap-2">
                    <div className="justify-start text-black dark:text-white text-sm font-medium font-['Manrope']">Ъгъл β₂ (в гради)</div>
                    <input
                      type="number"
                      id="beta2"
                      value={form.beta2}
                      onChange={handleChange}
                      step="any"
                      className="self-stretch p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-600 bg-white dark:bg-zinc-800 text-black dark:text-zinc-100 placeholder:text-neutral-400 dark:placeholder:text-zinc-500 text-sm font-medium font-['Manrope']"
                      placeholder="Въведете ъгъл β₂"
                    />
                  </div>
                </div>
                                <TaskActionBar
                  layout="flex"
                  onReset={resetForm}
                  onCalculate={handleCalculate}
                  calculateDisabled={isAuthenticated && !isFormValid()}
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
                    a.download = 'geosolver_resection_result.txt';
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
                  <div className="justify-start text-black dark:text-white text-sm font-medium font-['Manrope']">XA</div>
                </div>
                <div className="flex-1 px-3 py-2 bg-white dark:bg-zinc-900 flex justify-center items-center gap-2.5">
                  <div className="justify-start text-black dark:text-white text-sm font-medium font-['Manrope']">YA</div>
                </div>
                <div className="flex-1 px-3 py-2 bg-white dark:bg-zinc-900 flex justify-center items-center gap-2.5">
                  <div className="justify-start text-black dark:text-white text-sm font-medium font-['Manrope']">XB</div>
                </div>
                <div className="flex-1 px-3 py-2 bg-white dark:bg-zinc-900 flex justify-center items-center gap-2.5">
                  <div className="justify-start text-black dark:text-white text-sm font-medium font-['Manrope']">YB</div>
                </div>
                <div className="flex-1 px-3 py-2 bg-white dark:bg-zinc-900 flex justify-center items-center gap-2.5">
                  <div className="justify-start text-black dark:text-white text-sm font-medium font-['Manrope']">XC</div>
                </div>
                <div className="flex-1 px-3 py-2 bg-white dark:bg-zinc-900 flex justify-center items-center gap-2.5">
                  <div className="justify-start text-black dark:text-white text-sm font-medium font-['Manrope']">YC</div>
                </div>
                <div className="flex-1 px-3 py-2 bg-white dark:bg-zinc-900 flex justify-center items-center gap-2.5">
                  <div className="justify-start text-black dark:text-white text-sm font-medium font-['Manrope']">β₁</div>
                </div>
                <div className="flex-1 px-3 py-2 bg-white dark:bg-zinc-900 flex justify-center items-center gap-2.5">
                  <div className="justify-start text-black dark:text-white text-sm font-medium font-['Manrope']">β₂</div>
                </div>
                <div className="flex-1 px-3 py-2 bg-white dark:bg-zinc-900 flex justify-center items-center gap-2.5">
                  <div className="justify-start text-black dark:text-white text-sm font-medium font-['Manrope']">XP</div>
                </div>
                <div className="flex-1 px-3 py-2 bg-white dark:bg-zinc-900 flex justify-center items-center gap-2.5">
                  <div className="justify-start text-black dark:text-white text-sm font-medium font-['Manrope']">YP</div>
                </div>
                <div className="flex-1 px-3 py-2 bg-white dark:bg-zinc-900 flex justify-center items-center gap-2.5">
                  <div className="justify-start text-black dark:text-white text-sm font-medium font-['Manrope']">Дата</div>
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
                      <div className="justify-start text-neutral-400 dark:text-zinc-400 text-sm font-medium font-['Manrope']">{entry.xA}</div>
                    </div>
                    <div className="flex-1 px-3 py-2 bg-white dark:bg-zinc-900 flex justify-center items-center gap-2.5">
                      <div className="justify-start text-neutral-400 dark:text-zinc-400 text-sm font-medium font-['Manrope']">{entry.yA}</div>
                    </div>
                    <div className="flex-1 px-3 py-2 bg-white dark:bg-zinc-900 flex justify-center items-center gap-2.5">
                      <div className="justify-start text-neutral-400 dark:text-zinc-400 text-sm font-medium font-['Manrope']">{entry.xB}</div>
                    </div>
                    <div className="flex-1 px-3 py-2 bg-white dark:bg-zinc-900 flex justify-center items-center gap-2.5">
                      <div className="justify-start text-neutral-400 dark:text-zinc-400 text-sm font-medium font-['Manrope']">{entry.yB}</div>
                    </div>
                    <div className="flex-1 px-3 py-2 bg-white dark:bg-zinc-900 flex justify-center items-center gap-2.5">
                      <div className="justify-start text-neutral-400 dark:text-zinc-400 text-sm font-medium font-['Manrope']">{entry.xC}</div>
                    </div>
                    <div className="flex-1 px-3 py-2 bg-white dark:bg-zinc-900 flex justify-center items-center gap-2.5">
                      <div className="justify-start text-neutral-400 dark:text-zinc-400 text-sm font-medium font-['Manrope']">{entry.yC}</div>
                    </div>
                    <div className="flex-1 px-3 py-2 bg-white dark:bg-zinc-900 flex justify-center items-center gap-2.5">
                      <div className="justify-start text-neutral-400 dark:text-zinc-400 text-sm font-medium font-['Manrope']">{entry.beta1}</div>
                    </div>
                    <div className="flex-1 px-3 py-2 bg-white dark:bg-zinc-900 flex justify-center items-center gap-2.5">
                      <div className="justify-start text-neutral-400 dark:text-zinc-400 text-sm font-medium font-['Manrope']">{entry.beta2}</div>
                    </div>
                    <div className="flex-1 px-3 py-2 bg-white dark:bg-zinc-900 flex justify-center items-center gap-2.5">
                      <div className="justify-start text-neutral-400 dark:text-zinc-400 text-sm font-medium font-['Manrope']">{entry.xP}</div>
                    </div>
                    <div className="flex-1 px-3 py-2 bg-white dark:bg-zinc-900 flex justify-center items-center gap-2.5">
                      <div className="justify-start text-neutral-400 dark:text-zinc-400 text-sm font-medium font-['Manrope']">{entry.yP}</div>
                    </div>
                    <div className="flex-1 px-3 py-2 bg-white dark:bg-zinc-900 flex justify-center items-center gap-2.5">
                      <div className="justify-start text-neutral-400 dark:text-zinc-400 text-sm font-medium font-['Manrope']">{(() => { const d = new Date(entry.date); return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth()+1).toString().padStart(2, '0')}/${d.getFullYear()}` })()}</div>
                    </div>
                    <div className="flex-1 self-stretch px-3 py-2 bg-white dark:bg-zinc-900 flex justify-center items-center gap-2.5">
                      <button onClick={() => {
                        const text = `XA: ${entry.xA}, YA: ${entry.yA}\nXB: ${entry.xB}, YB: ${entry.yB}\nXC: ${entry.xC}, YC: ${entry.yC}\nβ₁: ${entry.beta1} гради\nβ₂: ${entry.beta2} гради\nXP: ${entry.xP}, YP: ${entry.yP}\nДата: ${(() => { const d = new Date(entry.date); return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth()+1).toString().padStart(2, '0')}/${d.getFullYear()}` })()}`;
                        const blob = new Blob([text], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'geosolver_resection.txt';
                        a.click();
                        URL.revokeObjectURL(url);
                      }} className="flex items-center justify-center"><svg className="w-4 h-4 text-neutral-400 dark:text-zinc-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 4v12m0 0l-4-4m4 4l4-4M4 20h16" strokeLinecap="round" strokeLinejoin="round"/></svg></button>
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

export default Resection;
