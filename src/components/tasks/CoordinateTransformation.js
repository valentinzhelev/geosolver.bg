import React, { useState, useEffect } from 'react';
import Layout from '../layout/Layout';
import { Helmet } from "react-helmet";
import { Link } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import useTypewriter from '../../hooks/useTypewriter';

// LocalStorage helpers
const getHistory = () => {
  try {
    const data = localStorage.getItem('coordinateTransformationHistory');
    return data ? JSON.parse(data) : [];
  } catch { return []; }
};
const saveHistory = (entry) => {
  const history = getHistory();
  history.unshift(entry);
  localStorage.setItem('coordinateTransformationHistory', JSON.stringify(history.slice(0, 20)));
};

/**
 * Координатна трансформация (Enhanced):
 * Трансформация между различни координатни системи
 * 
 * Поддържани трансформации:
 * 1. Паралелно изместване (Translation)
 * 2. Завъртане (Rotation)
 * 3. Мащабиране (Scaling)
 * 4. Комбинирана трансформация
 * 
 * @param {number} x - X координата
 * @param {number} y - Y координата
 * @param {string} transformationType - Тип трансформация
 * @param {Object} parameters - Параметри за трансформацията
 * @returns {Object} Резултати от трансформацията
 */
function calculateCoordinateTransformation(x, y, transformationType, parameters) {
  let xNew, yNew;
  let transformationDetails = '';

  switch (transformationType) {
    case 'translation':
      // Паралелно изместване
      const dx = parameters.dx || 0;
      const dy = parameters.dy || 0;
      xNew = x + dx;
      yNew = y + dy;
      transformationDetails = `X' = X + ΔX = ${x} + ${dx} = ${xNew}\nY' = Y + ΔY = ${y} + ${dy} = ${yNew}`;
      break;

    case 'rotation':
      // Завъртане около началото на координатната система
      const angle = (parameters.angle || 0) * Math.PI / 200; // гради в радиани
      const cosAngle = Math.cos(angle);
      const sinAngle = Math.sin(angle);
      xNew = x * cosAngle - y * sinAngle;
      yNew = x * sinAngle + y * cosAngle;
      transformationDetails = `X' = X·cos(α) - Y·sin(α) = ${x}·${cosAngle.toFixed(6)} - ${y}·${sinAngle.toFixed(6)} = ${xNew}\nY' = X·sin(α) + Y·cos(α) = ${x}·${sinAngle.toFixed(6)} + ${y}·${cosAngle.toFixed(6)} = ${yNew}`;
      break;

    case 'scaling':
      // Мащабиране
      const scaleX = parameters.scaleX || 1;
      const scaleY = parameters.scaleY || 1;
      xNew = x * scaleX;
      yNew = y * scaleY;
      transformationDetails = `X' = X·Sx = ${x}·${scaleX} = ${xNew}\nY' = Y·Sy = ${y}·${scaleY} = ${yNew}`;
      break;

    case 'helmert':
      // Хелмертова трансформация (4 параметъра)
      const a = parameters.a || 1; // мащаб
      const b = parameters.b || 0; // завъртане
      const tx = parameters.tx || 0; // изместване по X
      const ty = parameters.ty || 0; // изместване по Y
      xNew = a * x - b * y + tx;
      yNew = b * x + a * y + ty;
      transformationDetails = `X' = a·X - b·Y + tx = ${a}·${x} - ${b}·${y} + ${tx} = ${xNew}\nY' = b·X + a·Y + ty = ${b}·${x} + ${a}·${y} + ${ty} = ${yNew}`;
      break;

    case 'affine':
      // Афинна трансформация (6 параметъра)
      const a11 = parameters.a11 || 1;
      const a12 = parameters.a12 || 0;
      const a21 = parameters.a21 || 0;
      const a22 = parameters.a22 || 1;
      const tx_affine = parameters.tx || 0;
      const ty_affine = parameters.ty || 0;
      xNew = a11 * x + a12 * y + tx_affine;
      yNew = a21 * x + a22 * y + ty_affine;
      transformationDetails = `X' = a11·X + a12·Y + tx = ${a11}·${x} + ${a12}·${y} + ${tx_affine} = ${xNew}\nY' = a21·X + a22·Y + ty = ${a21}·${x} + ${a22}·${y} + ${ty_affine} = ${yNew}`;
      break;

    default:
      throw new Error('Неизвестен тип трансформация');
  }

  return {
    xOriginal: x,
    yOriginal: y,
    xTransformed: Math.round(xNew * 1000) / 1000,
    yTransformed: Math.round(yNew * 1000) / 1000,
    transformationType,
    parameters,
    transformationDetails,
    // Допълнителни изчисления
    deltaX: Math.round((xNew - x) * 1000) / 1000,
    deltaY: Math.round((yNew - y) * 1000) / 1000,
    distance: Math.round(Math.sqrt((xNew - x) * (xNew - x) + (yNew - y) * (yNew - y)) * 1000) / 1000
  };
}

const CoordinateTransformation = () => {
  const [form, setForm] = useState({
    x: '', y: '',
    transformationType: 'translation',
    dx: '', dy: '',
    angle: '',
    scaleX: '', scaleY: '',
    a: '', b: '', tx: '', ty: '',
    a11: '', a12: '', a21: '', a22: '', tx_affine: '', ty_affine: ''
  });
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
  };

  const isFormValid = () => {
    if (!form.x || !form.y || isNaN(Number(form.x)) || isNaN(Number(form.y))) {
      return false;
    }

    switch (form.transformationType) {
      case 'translation':
        return form.dx !== '' && form.dy !== '' && !isNaN(Number(form.dx)) && !isNaN(Number(form.dy));
      case 'rotation':
        return form.angle !== '' && !isNaN(Number(form.angle));
      case 'scaling':
        return form.scaleX !== '' && form.scaleY !== '' && !isNaN(Number(form.scaleX)) && !isNaN(Number(form.scaleY));
      case 'helmert':
        return form.a !== '' && form.b !== '' && form.tx !== '' && form.ty !== '' &&
               !isNaN(Number(form.a)) && !isNaN(Number(form.b)) && !isNaN(Number(form.tx)) && !isNaN(Number(form.ty));
      case 'affine':
        return form.a11 !== '' && form.a12 !== '' && form.a21 !== '' && form.a22 !== '' && form.tx_affine !== '' && form.ty_affine !== '' &&
               !isNaN(Number(form.a11)) && !isNaN(Number(form.a12)) && !isNaN(Number(form.a21)) && !isNaN(Number(form.a22)) && !isNaN(Number(form.tx_affine)) && !isNaN(Number(form.ty_affine));
      default:
        return false;
    }
  };

  const handleCalculate = () => {
    if (!isFormValid()) {
      alert(language === 'bg' ? 'Моля, попълнете всички полета коректно.' : 'Please fill in all fields correctly.');
      return;
    }

    try {
      const parameters = {};
      
      switch (form.transformationType) {
        case 'translation':
          parameters.dx = Number(form.dx);
          parameters.dy = Number(form.dy);
          break;
        case 'rotation':
          parameters.angle = Number(form.angle);
          break;
        case 'scaling':
          parameters.scaleX = Number(form.scaleX);
          parameters.scaleY = Number(form.scaleY);
          break;
        case 'helmert':
          parameters.a = Number(form.a);
          parameters.b = Number(form.b);
          parameters.tx = Number(form.tx);
          parameters.ty = Number(form.ty);
          break;
        case 'affine':
          parameters.a11 = Number(form.a11);
          parameters.a12 = Number(form.a12);
          parameters.a21 = Number(form.a21);
          parameters.a22 = Number(form.a22);
          parameters.tx = Number(form.tx_affine);
          parameters.ty = Number(form.ty_affine);
          break;
      }

      const result = calculateCoordinateTransformation(
        Number(form.x),
        Number(form.y),
        form.transformationType,
        parameters
      );

      const transformationNames = {
        translation: language === 'bg' ? 'Паралелно изместване' : 'Translation',
        rotation: language === 'bg' ? 'Завъртане' : 'Rotation',
        scaling: language === 'bg' ? 'Мащабиране' : 'Scaling',
        helmert: language === 'bg' ? 'Хелмертова трансформация' : 'Helmert Transformation',
        affine: language === 'bg' ? 'Афинна трансформация' : 'Affine Transformation'
      };

      const output = language === 'bg'
        ? `--------- Координатна трансформация (Enhanced) ---------
Тип трансформация: ${transformationNames[form.transformationType]}
-------------------------------------
Оригинални координати:
X = ${result.xOriginal}
Y = ${result.yOriginal}
-------------------------------------
Параметри на трансформацията:
${Object.entries(parameters).map(([key, value]) => `${key} = ${value}`).join('\n')}
-------------------------------------
Формули:
${result.transformationDetails}
-------------------------------------
Трансформирани координати:
X' = ${result.xTransformed}
Y' = ${result.yTransformed}
-------------------------------------
Изменения:
ΔX = ${result.deltaX}
ΔY = ${result.deltaY}
Разстояние на изместване: ${result.distance}
-------------------------------------`
        : `--------- Coordinate Transformation (Enhanced) ---------
Transformation type: ${transformationNames[form.transformationType]}
-------------------------------------
Original coordinates:
X = ${result.xOriginal}
Y = ${result.yOriginal}
-------------------------------------
Transformation parameters:
${Object.entries(parameters).map(([key, value]) => `${key} = ${value}`).join('\n')}
-------------------------------------
Formulas:
${result.transformationDetails}
-------------------------------------
Transformed coordinates:
X' = ${result.xTransformed}
Y' = ${result.yTransformed}
-------------------------------------
Changes:
ΔX = ${result.deltaX}
ΔY = ${result.deltaY}
Displacement distance: ${result.distance}
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
    setForm({
      x: '', y: '',
      transformationType: 'translation',
      dx: '', dy: '',
      angle: '',
      scaleX: '', scaleY: '',
      a: '', b: '', tx: '', ty: '',
      a11: '', a12: '', a21: '', a22: '', tx_affine: '', ty_affine: ''
    });
    setResultText('Въведете данни и натиснете "Изчисли", за да видите резултатите тук.');
  };

  const renderParameterInputs = () => {
    switch (form.transformationType) {
      case 'translation':
        return (
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              id="dx"
              value={form.dx}
              onChange={handleChange}
              placeholder={language === 'bg' ? 'ΔX' : 'ΔX'}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="number"
              id="dy"
              value={form.dy}
              onChange={handleChange}
              placeholder={language === 'bg' ? 'ΔY' : 'ΔY'}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        );
      case 'rotation':
        return (
          <input
            type="number"
            id="angle"
            value={form.angle}
            onChange={handleChange}
            placeholder={language === 'bg' ? 'Ъгъл (гради)' : 'Angle (gon)'}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        );
      case 'scaling':
        return (
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              id="scaleX"
              value={form.scaleX}
              onChange={handleChange}
              placeholder={language === 'bg' ? 'Sx' : 'Sx'}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="number"
              id="scaleY"
              value={form.scaleY}
              onChange={handleChange}
              placeholder={language === 'bg' ? 'Sy' : 'Sy'}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        );
      case 'helmert':
        return (
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              id="a"
              value={form.a}
              onChange={handleChange}
              placeholder="a"
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="number"
              id="b"
              value={form.b}
              onChange={handleChange}
              placeholder="b"
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="number"
              id="tx"
              value={form.tx}
              onChange={handleChange}
              placeholder="tx"
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="number"
              id="ty"
              value={form.ty}
              onChange={handleChange}
              placeholder="ty"
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        );
      case 'affine':
        return (
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              id="a11"
              value={form.a11}
              onChange={handleChange}
              placeholder="a11"
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="number"
              id="a12"
              value={form.a12}
              onChange={handleChange}
              placeholder="a12"
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="number"
              id="a21"
              value={form.a21}
              onChange={handleChange}
              placeholder="a21"
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="number"
              id="a22"
              value={form.a22}
              onChange={handleChange}
              placeholder="a22"
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="number"
              id="tx_affine"
              value={form.tx_affine}
              onChange={handleChange}
              placeholder="tx"
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="number"
              id="ty_affine"
              value={form.ty_affine}
              onChange={handleChange}
              placeholder="ty"
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Helmet>
        <title>GeoSolver – {language === 'bg' ? 'Координатна трансформация' : 'Coordinate Transformation'}</title>
        <meta name="description" content={language === 'bg' ? 'Трансформация между координатни системи' : 'Transform between coordinate systems'} />
      </Helmet>
      <Layout>
        <div className="w-full min-h-screen bg-stone-50">
          <div className="w-[1180px] mx-auto px-4 lg:px-6 pt-6 lg:pt-20 pb-6 lg:pb-20 flex flex-col gap-10">
            
            {/* Header Section */}
            <div className="flex flex-col justify-center items-start gap-10">
              <div className="w-[580px] flex flex-col justify-start items-start gap-4">
                {/* Breadcrumbs */}
                <div className="flex flex-col justify-start items-start gap-1">
                  <div className="justify-start">
                    <span className="text-neutral-400 text-base font-medium font-['Manrope'] underline">
                      {language === 'bg' ? 'Инструменти' : 'Tools'}
                    </span>
                    <span className="text-neutral-400 text-base font-medium font-['Manrope']">
                      {language === 'bg' ? ' > Координатна трансформация' : ' > Coordinate Transformation'}
                    </span>
                  </div>
                  <div className="justify-start text-black text-3xl font-bold font-['Manrope']">
                    {language === 'bg' ? 'Координатна трансформация' : 'Coordinate Transformation'}
                  </div>
                </div>
                
                {/* Navigation Tabs */}
                <div className="p-1.5 bg-white rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex justify-start items-center gap-2">
                  <div className="px-3 py-1 bg-gray-200 rounded flex justify-center items-center gap-2.5">
                    <div className="justify-start text-black text-base font-medium font-['Manrope']">
                      {language === 'bg' ? 'Инструмент' : 'Tool'}
                    </div>
                  </div>
                  <div className="px-3 py-1 rounded flex justify-center items-center gap-2.5">
                    <div className="justify-start text-neutral-400 text-base font-medium font-['Manrope']">
                      {language === 'bg' ? 'Документация' : 'Documentation'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="inline-flex justify-start items-start gap-5">
                {/* Input Form */}
                <div className="flex-1 p-4 bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex flex-col justify-center items-end gap-4">
                  <div className="self-stretch justify-start text-black text-lg font-semibold font-['Manrope']">
                    {language === 'bg' ? 'Входни данни' : 'Input Data'}
                  </div>
                  
                  <div className="self-stretch flex flex-col justify-start items-start gap-4">
                    <div className="self-stretch flex flex-col justify-start items-start gap-2">
                      <div className="justify-start text-black text-sm font-medium font-['Manrope']">
                        {language === 'bg' ? 'X координата' : 'X Coordinate'}
                      </div>
                      <div className="self-stretch p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 flex flex-col justify-start items-start">
                        <input
                          type="number"
                          id="x"
                          value={form.x}
                          onChange={handleChange}
                          placeholder={language === 'bg' ? 'Въведете X координата' : 'Enter X coordinate'}
                          className="w-full bg-transparent text-black text-sm font-medium font-['Manrope'] placeholder-neutral-400 focus:outline-none"
                        />
                      </div>
                    </div>
                    
                    <div className="self-stretch flex flex-col justify-start items-start gap-2">
                      <div className="justify-start text-black text-sm font-medium font-['Manrope']">
                        {language === 'bg' ? 'Y координата' : 'Y Coordinate'}
                      </div>
                      <div className="self-stretch p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 flex flex-col justify-start items-start">
                        <input
                          type="number"
                          id="y"
                          value={form.y}
                          onChange={handleChange}
                          placeholder={language === 'bg' ? 'Въведете Y координата' : 'Enter Y coordinate'}
                          className="w-full bg-transparent text-black text-sm font-medium font-['Manrope'] placeholder-neutral-400 focus:outline-none"
                        />
                      </div>
                    </div>

                    
                    <div className="self-stretch flex flex-col justify-start items-start gap-2">
                      <div className="justify-start text-black text-sm font-medium font-['Manrope']">
                        {language === 'bg' ? 'Тип трансформация' : 'Transformation Type'}
                      </div>
                      <div className="self-stretch p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 flex flex-col justify-start items-start">
                        <select
                          id="transformationType"
                          value={form.transformationType}
                          onChange={handleChange}
                          className="w-full bg-transparent text-black text-sm font-medium font-['Manrope'] focus:outline-none"
                        >
                          <option value="translation">{language === 'bg' ? 'Паралелно изместване' : 'Translation'}</option>
                          <option value="rotation">{language === 'bg' ? 'Завъртане' : 'Rotation'}</option>
                          <option value="scaling">{language === 'bg' ? 'Мащабиране' : 'Scaling'}</option>
                          <option value="helmert">{language === 'bg' ? 'Хелмертова трансформация' : 'Helmert Transformation'}</option>
                          <option value="affine">{language === 'bg' ? 'Афинна трансформация' : 'Affine Transformation'}</option>
                        </select>
                      </div>
                    </div>

                    <div className="self-stretch flex flex-col justify-start items-start gap-2">
                      <div className="justify-start text-black text-sm font-medium font-['Manrope']">
                        {language === 'bg' ? 'Параметри' : 'Parameters'}
                      </div>
                      <div className="self-stretch p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 flex flex-col justify-start items-start">
                        {renderParameterInputs()}
                      </div>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="inline-flex justify-start items-start gap-3">
                    <div className="px-4 py-2 bg-gray-200 rounded-lg flex justify-start items-center gap-3">
                      <div className="w-3.5 h-3.5 bg-black" />
                      <div className="justify-start text-black text-base font-medium font-['Manrope']">
                        {language === 'bg' ? 'Сканирай' : 'Scan'}
                      </div>
                    </div>
                    <div 
                      onClick={resetForm}
                      className="px-4 py-2 bg-gray-200 rounded-lg flex justify-start items-center gap-3 cursor-pointer hover:bg-gray-300 transition-colors duration-200"
                    >
                      <div className="justify-start text-black text-base font-medium font-['Manrope']">
                        {language === 'bg' ? 'Нулирай' : 'Reset'}
                      </div>
                    </div>
                    <div 
                      onClick={handleCalculate}
                      className="px-4 py-2 bg-black rounded-lg flex justify-start items-center gap-3 cursor-pointer hover:bg-gray-800 transition-colors duration-200"
                    >
                      <div className="justify-start text-white text-base font-medium font-['Manrope']">
                        {language === 'bg' ? 'Изчисли' : 'Calculate'}
                      </div>
                      <div className="w-2 h-3 bg-white" />
                    </div>
                  </div>
                </div>

                {/* Results */}
                <div className="flex-1 self-stretch p-4 bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex flex-col justify-center items-end gap-3">
                  <div className="self-stretch justify-start text-black text-lg font-semibold font-['Manrope']">
                    {language === 'bg' ? 'Резултати' : 'Results'}
                  </div>
                  <div className="self-stretch flex-1 p-3 bg-stone-50 rounded-lg flex flex-col justify-start items-start">
                    <div className="self-stretch justify-start text-neutral-400 text-sm font-medium font-['Manrope'] font-mono whitespace-pre-wrap">
                      {isTyping ? displayText : resultText}
                    </div>
                  </div>
                  <div className="px-4 py-2 opacity-20 bg-gray-200 rounded-lg inline-flex justify-start items-center gap-3">
                    <div className="w-4 h-4 bg-black" />
                    <div className="justify-start text-black text-base font-medium font-['Manrope']">
                      {language === 'bg' ? 'Изтегли' : 'Download'}
                    </div>
                  </div>
                </div>
            </div>

            {/* History Section */}
            <div className="flex flex-col justify-start items-start gap-4">
              <div className="justify-start text-black text-2xl font-bold font-['Manrope']">
                {language === 'bg' ? 'История на изчисленията' : 'Calculation History'}
              </div>
              <div className="self-stretch rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 flex flex-col justify-start items-start gap-px overflow-hidden">
                {/* Table Header */}
                <div className="self-stretch shadow-[0px_8px_24px_0px_rgba(0,0,0,0.04)] inline-flex justify-start items-start gap-px">
                  <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                    <div className="justify-start text-black text-sm font-medium font-['Manrope']">
                      {language === 'bg' ? 'X' : 'X'}
                    </div>
                  </div>
                  <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                    <div className="justify-start text-black text-sm font-medium font-['Manrope']">
                      {language === 'bg' ? 'Y' : 'Y'}
                    </div>
                  </div>
                  <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                    <div className="justify-start text-black text-sm font-medium font-['Manrope']">
                      {language === 'bg' ? 'Тип' : 'Type'}
                    </div>
                  </div>
                  <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                    <div className="justify-start text-black text-sm font-medium font-['Manrope']">
                      {language === 'bg' ? 'X\'' : 'X\''}
                    </div>
                  </div>
                  <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                    <div className="justify-start text-black text-sm font-medium font-['Manrope']">
                      {language === 'bg' ? 'Y\'' : 'Y\''}
                    </div>
                  </div>
                  <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                    <div className="justify-start text-black text-sm font-medium font-['Manrope']">
                      {language === 'bg' ? 'Дата' : 'Date'}
                    </div>
                  </div>
                  <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                    <div className="justify-start text-black text-sm font-medium font-['Manrope']">
                      {language === 'bg' ? 'Изтегли' : 'Download'}
                    </div>
                  </div>
                </div>
                
                {/* Table Rows */}
                {paginatedHistory.map((entry, index) => (
                  <div key={index} className="self-stretch inline-flex justify-start items-start gap-px">
                    <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                      <div className="justify-start text-neutral-400 text-sm font-medium font-['Manrope']">
                        {entry.xOriginal}
                      </div>
                    </div>
                    <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                      <div className="justify-start text-neutral-400 text-sm font-medium font-['Manrope']">
                        {entry.yOriginal}
                      </div>
                    </div>
                    <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                      <div className="justify-start text-neutral-400 text-sm font-medium font-['Manrope']">
                        {entry.transformationType}
                      </div>
                    </div>
                    <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                      <div className="justify-start text-neutral-400 text-sm font-medium font-['Manrope']">
                        {entry.xTransformed}
                      </div>
                    </div>
                    <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                      <div className="justify-start text-neutral-400 text-sm font-medium font-['Manrope']">
                        {entry.yTransformed}
                      </div>
                    </div>
                    <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                      <div className="justify-start text-neutral-400 text-sm font-medium font-['Manrope']">
                        {new Date(entry.date).toLocaleDateString('bg-BG')} {new Date(entry.date).toLocaleTimeString('bg-BG', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <div className="flex-1 self-stretch px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                      <div className="w-3.5 h-3.5 bg-neutral-400" />
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="self-stretch inline-flex justify-center items-center gap-4">
                  <div className="flex justify-start items-center gap-2">
                    <div 
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      className={`w-7 self-stretch px-2 py-1 rounded inline-flex flex-col justify-center items-center cursor-pointer ${currentPage === 1 ? 'opacity-50' : 'hover:bg-gray-100'}`}
                    >
                      <div className="w-[5.09px] h-2 origin-top-left rotate-180 bg-gray-200" />
                    </div>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = i + 1;
                      const isActive = pageNum === currentPage;
                      return (
                        <div 
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-7 px-2 py-1 rounded inline-flex flex-col justify-center items-center cursor-pointer ${
                            isActive ? 'bg-gray-200' : 'outline outline-1 outline-offset-[-1px] outline-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <div className={`justify-start text-sm font-medium font-['Manrope'] ${
                            isActive ? 'text-black' : 'text-neutral-400'
                          }`}>
                            {pageNum}
                          </div>
                        </div>
                      );
                    })}
                    <div 
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      className={`w-7 self-stretch px-2 py-1 rounded inline-flex flex-col justify-center items-center cursor-pointer ${currentPage === totalPages ? 'opacity-50' : 'hover:bg-gray-100'}`}
                    >
                      <div className="w-[5.09px] h-2 bg-neutral-400" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default CoordinateTransformation;
