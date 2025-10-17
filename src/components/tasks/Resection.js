import React, { useState, useEffect } from 'react';
import Layout from '../layout/Layout';
import { Helmet } from "react-helmet";
import { Link } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import useTypewriter from '../../hooks/useTypewriter';

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

/**
 * Обратна засечка (Resection) - Enhanced:
 * Дадени са координатите на три точки A, B, C и ъглите β₁, β₂ от неизвестна точка P.
 * Търсят се координатите на точка P.
 * 
 * Метод: Collins Point Method
 * 
 * Формули:
 * 1. Изчисляване на ъглите в триъгълника ABC
 * 2. Изчисляване на координатите на Collins точка H
 * 3. Изчисляване на координатите на точка P
 * 
 * @param {number} xA - X координата на точка A
 * @param {number} yA - Y координата на точка A
 * @param {number} xB - X координата на точка B
 * @param {number} yB - Y координата на точка B
 * @param {number} xC - X координата на точка C
 * @param {number} yC - Y координата на точка C
 * @param {number} beta1 - Ъгъл β₁ в гради
 * @param {number} beta2 - Ъгъл β₂ в гради
 * @returns {Object} Резултати от изчисленията
 */
function calculateResection(xA, yA, xB, yB, xC, yC, beta1, beta2) {
  // Валидация на входните данни
  if (beta1 <= 0 || beta2 <= 0) {
    throw new Error('Ъглите трябва да бъдат положителни');
  }
  if (beta1 + beta2 >= 200) {
    throw new Error('Сумата от ъглите не може да бъде по-голяма от 200 гради');
  }

  // Константа за преобразуване от гради в радиани
  const gonToRad = Math.PI / 200;

  // Изчисляване на разстоянията между известните точки
  const sAB = Math.sqrt((xB - xA) * (xB - xA) + (yB - yA) * (yB - yA));
  const sBC = Math.sqrt((xC - xB) * (xC - xB) + (yC - yB) * (yC - yB));
  const sCA = Math.sqrt((xA - xC) * (xA - xC) + (yA - yC) * (yA - yC));

  // Изчисляване на ъглите в триъгълника ABC (косинусова теорема)
  const cosA = (sAB * sAB + sCA * sCA - sBC * sBC) / (2 * sAB * sCA);
  const cosB = (sAB * sAB + sBC * sBC - sCA * sCA) / (2 * sAB * sBC);
  const cosC = (sBC * sBC + sCA * sCA - sAB * sAB) / (2 * sBC * sCA);

  const angleA = Math.acos(Math.max(-1, Math.min(1, cosA))) * 200 / Math.PI;
  const angleB = Math.acos(Math.max(-1, Math.min(1, cosB))) * 200 / Math.PI;
  const angleC = Math.acos(Math.max(-1, Math.min(1, cosC))) * 200 / Math.PI;

  // Проверка за валидност на триъгълника
  const sumAngles = angleA + angleB + angleC;
  if (Math.abs(sumAngles - 200) > 0.1) {
    throw new Error('Невалиден триъгълник - сумата от ъглите не е 200 гради');
  }

  // Изчисляване на посочните ъгли между точките
  const alphaAB = Math.atan2(yB - yA, xB - xA) * 200 / Math.PI;
  const alphaBC = Math.atan2(yC - yB, xC - xB) * 200 / Math.PI;
  const alphaCA = Math.atan2(yA - yC, xA - xC) * 200 / Math.PI;

  // Нормализиране на ъглите
  const normalizeAngle = (angle) => {
    while (angle < 0) angle += 400;
    while (angle >= 400) angle -= 400;
    return angle;
  };

  const alphaABNorm = normalizeAngle(alphaAB);
  const alphaBCNorm = normalizeAngle(alphaBC);
  const alphaCANorm = normalizeAngle(alphaCA);

  // Collins Point Method
  // Изчисляване на ъглите за Collins точка H
  const gamma1 = beta1;
  const gamma2 = beta2;
  const gamma3 = 200 - gamma1 - gamma2;

  // Изчисляване на разстоянията до Collins точка H
  const sAH = (sAB * Math.sin(gamma2 * gonToRad)) / Math.sin(gamma3 * gonToRad);
  const sBH = (sAB * Math.sin(gamma1 * gonToRad)) / Math.sin(gamma3 * gonToRad);

  // Изчисляване на посочните ъгли до Collins точка H
  const alphaAH = normalizeAngle(alphaABNorm - gamma1);
  const alphaBH = normalizeAngle(alphaABNorm + 200 - gamma2);

  // Изчисляване на координатите на Collins точка H
  const xH1 = xA + sAH * Math.cos(alphaAH * gonToRad);
  const yH1 = yA + sAH * Math.sin(alphaAH * gonToRad);
  const xH2 = xB + sBH * Math.cos(alphaBH * gonToRad);
  const yH2 = yB + sBH * Math.sin(alphaBH * gonToRad);

  // Средно аритметично за Collins точка H
  const xH = (xH1 + xH2) / 2;
  const yH = (yH1 + yH2) / 2;

  // Изчисляване на посочния ъгъл от H към C
  const alphaHC = Math.atan2(yC - yH, xC - xH) * 200 / Math.PI;
  const alphaHCNorm = normalizeAngle(alphaHC);

  // Изчисляване на разстоянието от H до C
  const sHC = Math.sqrt((xC - xH) * (xC - xH) + (yC - yH) * (yC - yH));

  // Изчисляване на координатите на точка P
  // P лежи на правата HC на разстояние sHP от H
  const sHP = sHC * Math.sin(gamma1 * gonToRad) / Math.sin(gamma2 * gonToRad);
  
  const xP = xH + sHP * Math.cos(alphaHCNorm * gonToRad);
  const yP = yH + sHP * Math.sin(alphaHCNorm * gonToRad);

  // Проверка на изчисленията
  const sAP = Math.sqrt((xP - xA) * (xP - xA) + (yP - yA) * (yP - yA));
  const sBP = Math.sqrt((xP - xB) * (xP - xB) + (yP - yB) * (yP - yB));
  const sCP = Math.sqrt((xP - xC) * (xP - xC) + (yP - yC) * (yP - yC));

  return {
    // Основни резултати
    xP: Math.round(xP * 1000) / 1000,
    yP: Math.round(yP * 1000) / 1000,
    
    // Разстояния между известните точки
    sAB: Math.round(sAB * 1000) / 1000,
    sBC: Math.round(sBC * 1000) / 1000,
    sCA: Math.round(sCA * 1000) / 1000,
    
    // Ъгли в триъгълника ABC
    angleA: Math.round(angleA * 1000) / 1000,
    angleB: Math.round(angleB * 1000) / 1000,
    angleC: Math.round(angleC * 1000) / 1000,
    sumAngles: Math.round(sumAngles * 1000) / 1000,
    
    // Посочни ъгли
    alphaAB: Math.round(alphaABNorm * 1000) / 1000,
    alphaBC: Math.round(alphaBCNorm * 1000) / 1000,
    alphaCA: Math.round(alphaCANorm * 1000) / 1000,
    
    // Collins точка H
    xH: Math.round(xH * 1000) / 1000,
    yH: Math.round(yH * 1000) / 1000,
    xH1: Math.round(xH1 * 1000) / 1000,
    yH1: Math.round(yH1 * 1000) / 1000,
    xH2: Math.round(xH2 * 1000) / 1000,
    yH2: Math.round(yH2 * 1000) / 1000,
    
    // Разстояния и ъгли
    sAH: Math.round(sAH * 1000) / 1000,
    sBH: Math.round(sBH * 1000) / 1000,
    sHP: Math.round(sHP * 1000) / 1000,
    sHC: Math.round(sHC * 1000) / 1000,
    alphaAH: Math.round(alphaAH * 1000) / 1000,
    alphaBH: Math.round(alphaBH * 1000) / 1000,
    alphaHC: Math.round(alphaHCNorm * 1000) / 1000,
    
    // Проверки
    sAP: Math.round(sAP * 1000) / 1000,
    sBP: Math.round(sBP * 1000) / 1000,
    sCP: Math.round(sCP * 1000) / 1000,
    
    // Ъгли γ
    gamma1: Math.round(gamma1 * 1000) / 1000,
    gamma2: Math.round(gamma2 * 1000) / 1000,
    gamma3: Math.round(gamma3 * 1000) / 1000
  };
}

const Resection = () => {
  const [form, setForm] = useState({ xA: '', yA: '', xB: '', yB: '', xC: '', yC: '', beta1: '', beta2: '' });
  const [resultText, setResultText] = useState('Въведете данни и натиснете "Изчисли", за да видите резултатите тук.');
  const [history, setHistory] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(history.length / itemsPerPage);
  const paginatedHistory = history.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const { displayText, isTyping } = useTypewriter(resultText);
  const { t, language } = useTranslation();

  useEffect(() => { setHistory(getHistory()); }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.id]: e.target.value });
    saveInputHistory(e.target.id, e.target.value);
  };

  const isFormValid = () => {
    const vals = Object.values(form);
    return vals.every(val => val.trim() !== '') && vals.every(val => !isNaN(Number(val)));
  };

  const handleCalculate = () => {
    if (!isFormValid()) {
      alert(language === 'bg' ? 'Моля, попълнете всички полета коректно.' : 'Please fill in all fields correctly.');
      return;
    }

    try {
      const { xA, yA, xB, yB, xC, yC, beta1, beta2 } = form;
      const result = calculateResection(
        Number(xA), Number(yA),
        Number(xB), Number(yB),
        Number(xC), Number(yC),
        Number(beta1), Number(beta2)
      );

      const output = language === 'bg'
        ? `--------- Обратна засечка (Enhanced) ---------
Дадено:
A(${xA}, ${yA}), B(${xB}, ${yB}), C(${xC}, ${yC})
β₁ = ${beta1} гради, β₂ = ${beta2} гради
-------------------------------------
Разстояния между известните точки:
SAB = √((${xB} - ${xA})² + (${yB} - ${yA})²) = ${result.sAB} м
SBC = √((${xC} - ${xB})² + (${yC} - ${yB})²) = ${result.sBC} м
SCA = √((${xA} - ${xC})² + (${yA} - ${yC})²) = ${result.sCA} м
-------------------------------------
Ъгли в триъгълника ABC:
∠A = ${result.angleA} гради
∠B = ${result.angleB} гради
∠C = ${result.angleC} гради
Сума от ъглите: ${result.sumAngles} гради
-------------------------------------
Посочни ъгли:
αAB = ${result.alphaAB} гради
αBC = ${result.alphaBC} гради
αCA = ${result.alphaCA} гради
-------------------------------------
Collins Point Method:
Collins точка H:
XH = ${result.xH} м, YH = ${result.yH} м
SHC = ${result.sHC} м, αHC = ${result.alphaHC} гради
-------------------------------------
Координати на точка P:
XP = ${result.xP} м
YP = ${result.yP} м
-------------------------------------
Проверка на разстоянията:
SAP = ${result.sAP} м
SBP = ${result.sBP} м
SCP = ${result.sCP} м
-------------------------------------`
        : `--------- Resection (Enhanced) ---------
Given:
A(${xA}, ${yA}), B(${xB}, ${yB}), C(${xC}, ${yC})
β₁ = ${beta1} gon, β₂ = ${beta2} gon
-------------------------------------
Distances between known points:
SAB = √((${xB} - ${xA})² + (${yB} - ${yA})²) = ${result.sAB} m
SBC = √((${xC} - ${xB})² + (${yC} - ${yB})²) = ${result.sBC} m
SCA = √((${xA} - ${xC})² + (${yA} - ${yC})²) = ${result.sCA} m
-------------------------------------
Angles in triangle ABC:
∠A = ${result.angleA} gon
∠B = ${result.angleB} gon
∠C = ${result.angleC} gon
Sum of angles: ${result.sumAngles} gon
-------------------------------------
Direction angles:
αAB = ${result.alphaAB} gon
αBC = ${result.alphaBC} gon
αCA = ${result.alphaCA} gon
-------------------------------------
Collins Point Method:
Collins point H:
XH = ${result.xH} m, YH = ${result.yH} m
SHC = ${result.sHC} m, αHC = ${result.alphaHC} gon
-------------------------------------
Point P coordinates:
XP = ${result.xP} m
YP = ${result.yP} m
-------------------------------------
Distance verification:
SAP = ${result.sAP} m
SBP = ${result.sBP} m
SCP = ${result.sCP} m
-------------------------------------`;

      setResultText(output);
      const entry = { ...form, ...result, date: new Date().toISOString() };
      saveHistory(entry);
      setHistory(getHistory());
    } catch (error) {
      setResultText(language === 'bg' 
        ? `Грешка: ${error.message}` 
        : `Error: ${error.message}`);
    }
  };

  const resetForm = () => {
    setForm({ xA: '', yA: '', xB: '', yB: '', xC: '', yC: '', beta1: '', beta2: '' });
    setResultText('Въведете данни и натиснете "Изчисли", за да видите резултатите тук.');
  };

  const handleDownload = (entry) => {
    const text = language === 'bg'
      ? `XA: ${entry.xA}\nYA: ${entry.yA}\nXB: ${entry.xB}\nYB: ${entry.yB}\nXC: ${entry.xC}\nYC: ${entry.yC}\nβ₁: ${entry.beta1}\nβ₂: ${entry.beta2}\nXP: ${entry.xP}\nYP: ${entry.yP}\nДата: ${(() => { const d = new Date(entry.date); return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth()+1).toString().padStart(2, '0')}/${d.getFullYear()}` })()}`
      : `XA: ${entry.xA}\nYA: ${entry.yA}\nXB: ${entry.xB}\nYB: ${entry.yB}\nXC: ${entry.xC}\nYC: ${entry.yC}\nβ₁: ${entry.beta1}\nβ₂: ${entry.beta2}\nXP: ${entry.xP}\nYP: ${entry.yP}\nDate: ${(() => { const d = new Date(entry.date); return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth()+1).toString().padStart(2, '0')}/${d.getFullYear()}` })()}`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `geosolver_resection_${entry.xA}_${entry.yA}_${entry.xB}_${entry.yB}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Helmet>
        <title>GeoSolver – {language === 'bg' ? 'Обратна засечка' : 'Resection'}</title>
        <meta name="description" content={language === 'bg' ? 'Изчисляване на координати чрез обратна засечка' : 'Calculate coordinates using resection method'} />
      </Helmet>
      <Layout>
        <div className="w-full min-h-screen bg-stone-50">
          <div className="w-full max-w-[1180px] mx-auto px-4 lg:px-6 pt-6 lg:pt-20 pb-6 lg:pb-20 flex flex-col gap-6 lg:gap-10">
            
            {/* Breadcrumbs */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 text-sm">
                <Link to="/tools" className="text-neutral-400 hover:text-black transition-colors duration-200 underline">
                  {language === 'bg' ? 'Инструменти' : 'Tools'}
                </Link>
                <span className="text-neutral-400">{'>'}</span>
                <span className="text-neutral-400">{language === 'bg' ? 'Обратна засечка' : 'Resection'}</span>
              </div>
              <h1 className="text-black text-2xl lg:text-3xl font-bold font-['Manrope']">
                {language === 'bg' ? 'Обратна засечка' : 'Resection'}
              </h1>
            </div>

            {/* Navigation Tabs */}
            <div className="flex flex-wrap gap-3">
              <Link
                to="/tools"
                className="px-4 py-2 rounded-lg text-base font-medium font-['Manrope'] transition-colors duration-200 bg-white text-neutral-600 border border-gray-200 hover:bg-gray-50 hover:text-black"
              >
                {language === 'bg' ? 'Инструмент' : 'Tool'}
              </Link>
              <div className="px-4 py-2 rounded-lg text-base font-medium font-['Manrope'] bg-blue-50 text-blue-700 border border-blue-200">
                {language === 'bg' ? 'Документация' : 'Documentation'}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Input Form */}
              <div className="p-6 bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200">
                <h2 className="text-xl font-bold text-black mb-6">
                  {language === 'bg' ? 'Входни данни' : 'Input Data'}
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      {language === 'bg' ? 'Точка A' : 'Point A'}
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="number"
                        id="xA"
                        value={form.xA}
                        onChange={handleChange}
                        placeholder="X"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <input
                        type="number"
                        id="yA"
                        value={form.yA}
                        onChange={handleChange}
                        placeholder="Y"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      {language === 'bg' ? 'Точка B' : 'Point B'}
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="number"
                        id="xB"
                        value={form.xB}
                        onChange={handleChange}
                        placeholder="X"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <input
                        type="number"
                        id="yB"
                        value={form.yB}
                        onChange={handleChange}
                        placeholder="Y"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      {language === 'bg' ? 'Точка C' : 'Point C'}
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="number"
                        id="xC"
                        value={form.xC}
                        onChange={handleChange}
                        placeholder="X"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <input
                        type="number"
                        id="yC"
                        value={form.yC}
                        onChange={handleChange}
                        placeholder="Y"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      {language === 'bg' ? 'Ъгли' : 'Angles'}
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="number"
                        id="beta1"
                        value={form.beta1}
                        onChange={handleChange}
                        placeholder={language === 'bg' ? 'β₁ (гради)' : 'β₁ (gon)'}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <input
                        type="number"
                        id="beta2"
                        value={form.beta2}
                        onChange={handleChange}
                        placeholder={language === 'bg' ? 'β₂ (гради)' : 'β₂ (gon)'}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleCalculate}
                      className="flex-1 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-200 text-base font-semibold"
                    >
                      {language === 'bg' ? 'Изчисли' : 'Calculate'}
                    </button>
                    <button
                      onClick={resetForm}
                      className="px-6 py-3 bg-gray-200 text-black rounded-lg hover:bg-gray-300 transition-colors duration-200 text-base font-semibold"
                    >
                      {language === 'bg' ? 'Изчисти' : 'Clear'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Results */}
              <div className="p-6 bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200">
                <h2 className="text-xl font-bold text-black mb-6">
                  {language === 'bg' ? 'Резултати' : 'Results'}
                </h2>
                <div className="bg-stone-50 rounded-lg p-4 min-h-[400px] font-mono text-sm whitespace-pre-wrap">
                  {isTyping ? displayText : resultText}
                </div>
              </div>
            </div>

            {/* History */}
            {history.length > 0 && (
              <div className="p-6 bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-black">
                    {language === 'bg' ? 'История на изчисленията' : 'Calculation History'}
                  </h2>
                  <span className="text-sm text-neutral-600">
                    {history.length} {language === 'bg' ? 'записа' : 'entries'}
                  </span>
                </div>
                
                <div className="space-y-3">
                  {paginatedHistory.map((entry, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-stone-50 rounded-lg">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-black">
                          A({entry.xA}, {entry.yA}) B({entry.xB}, {entry.yB}) C({entry.xC}, {entry.yC})
                        </span>
                        <span className="text-xs text-neutral-600">
                          β₁={entry.beta1}° β₂={entry.beta2}° → P({entry.xP}, {entry.yP})
                        </span>
                        <span className="text-xs text-neutral-500">
                          {new Date(entry.date).toLocaleDateString()}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDownload(entry)}
                        className="px-3 py-1 bg-gray-200 text-black rounded text-xs hover:bg-gray-300 transition-colors duration-200"
                      >
                        {language === 'bg' ? 'Изтегли' : 'Download'}
                      </button>
                    </div>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-6">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 bg-gray-200 text-black rounded text-sm hover:bg-gray-300 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {language === 'bg' ? 'Предишна' : 'Previous'}
                    </button>
                    <span className="px-3 py-1 text-sm text-neutral-600">
                      {currentPage} / {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 bg-gray-200 text-black rounded text-sm hover:bg-gray-300 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {language === 'bg' ? 'Следваща' : 'Next'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </Layout>
    </>
  );
};

export default Resection;