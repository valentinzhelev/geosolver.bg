import React, { useState, useEffect } from 'react';
import Layout from '../layout/Layout';
import { Helmet } from "react-helmet";
import { Link } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import useTypewriter from '../../hooks/useTypewriter';

// LocalStorage helpers
const getHistory = () => {
  try {
    const data = localStorage.getItem('distanceBearingHistory');
    return data ? JSON.parse(data) : [];
  } catch { return []; }
};
const saveHistory = (entry) => {
  const history = getHistory();
  history.unshift(entry);
  localStorage.setItem('distanceBearingHistory', JSON.stringify(history.slice(0, 20)));
};

/**
 * Изчисляване на разстояние и посока (Enhanced):
 * Изчислява разстоянието и посочния ъгъл между две точки
 * 
 * Формули:
 * S = √((X2-X1)² + (Y2-Y1)²)
 * α = atan2(Y2-Y1, X2-X1) * 200/π (в гради)
 * 
 * @param {number} x1 - X координата на точка 1
 * @param {number} y1 - Y координата на точка 1
 * @param {number} x2 - X координата на точка 2
 * @param {number} y2 - Y координата на точка 2
 * @returns {Object} Резултати от изчисленията
 */
function calculateDistanceBearing(x1, y1, x2, y2) {
  // Валидация на входните данни
  if (x1 === x2 && y1 === y2) {
    throw new Error('Точките не могат да съвпадат');
  }

  // Изчисляване на координатните разлики
  const deltaX = x2 - x1;
  const deltaY = y2 - y1;

  // Изчисляване на разстоянието
  const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

  // Изчисляване на посочния ъгъл
  const bearingRad = Math.atan2(deltaY, deltaX);
  let bearing = bearingRad * 200 / Math.PI;
  if (bearing < 0) bearing += 400;

  // Изчисляване на обратния ъгъл
  const reverseBearing = bearing >= 200 ? bearing - 200 : bearing + 200;

  // Определяне на квадранта
  let quadrant = '';
  if (deltaX >= 0 && deltaY >= 0) quadrant = 'I (0°-100°)';
  else if (deltaX < 0 && deltaY >= 0) quadrant = 'II (100°-200°)';
  else if (deltaX < 0 && deltaY < 0) quadrant = 'III (200°-300°)';
  else if (deltaX >= 0 && deltaY < 0) quadrant = 'IV (300°-400°)';

  // Изчисляване на ъгъла в градуси
  const bearingDegrees = bearing * 0.9; // 1 град = 0.9 гради
  const reverseBearingDegrees = reverseBearing * 0.9;

  // Допълнителни изчисления
  const slope = deltaX !== 0 ? deltaY / deltaX : (deltaY > 0 ? Infinity : -Infinity);
  const azimuth = bearing; // В геодезията azimuth = bearing
  const azimuthDegrees = azimuth * 0.9;

  return {
    // Основни резултати
    distance: Math.round(distance * 1000) / 1000,
    bearing: Math.round(bearing * 1000) / 1000,
    reverseBearing: Math.round(reverseBearing * 1000) / 1000,
    
    // Координатни разлики
    deltaX: Math.round(deltaX * 1000) / 1000,
    deltaY: Math.round(deltaY * 1000) / 1000,
    
    // Ъгли в различни единици
    bearingDegrees: Math.round(bearingDegrees * 1000) / 1000,
    reverseBearingDegrees: Math.round(reverseBearingDegrees * 1000) / 1000,
    azimuth: Math.round(azimuth * 1000) / 1000,
    azimuthDegrees: Math.round(azimuthDegrees * 1000) / 1000,
    
    // Допълнителна информация
    quadrant,
    slope: Math.round(slope * 1000000) / 1000000,
    bearingRad: Math.round(bearingRad * 1000000) / 1000000,
    
    // Проверки
    checkDistance: Math.round(Math.sqrt(deltaX * deltaX + deltaY * deltaY) * 1000) / 1000,
    checkBearing: Math.round(Math.atan2(deltaY, deltaX) * 200 / Math.PI * 1000) / 1000
  };
}

const DistanceBearing = () => {
  const [form, setForm] = useState({ x1: '', y1: '', x2: '', y2: '' });
  const [resultText, setResultText] = useState('Въведете координати на две точки и натиснете "Изчисли", за да видите резултатите тук.');
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
    const vals = Object.values(form);
    return vals.every(val => val.trim() !== '') && vals.every(val => !isNaN(Number(val)));
  };

  const handleCalculate = () => {
    if (!isFormValid()) {
      alert(language === 'bg' ? 'Моля, попълнете всички полета коректно.' : 'Please fill in all fields correctly.');
      return;
    }

    try {
      const { x1, y1, x2, y2 } = form;
      const result = calculateDistanceBearing(
        Number(x1), Number(y1),
        Number(x2), Number(y2)
      );

      const output = language === 'bg'
        ? `--------- Разстояние и посока (Enhanced) ---------
Точка 1: (${x1}, ${y1})
Точка 2: (${x2}, ${y2})
-------------------------------------
Координатни разлики:
ΔX = X2 - X1 = ${x2} - ${x1} = ${result.deltaX} м
ΔY = Y2 - Y1 = ${y2} - ${y1} = ${result.deltaY} м
-------------------------------------
Разстояние:
S = √(ΔX² + ΔY²) = √(${result.deltaX}² + ${result.deltaY}²) = ${result.distance} м
-------------------------------------
Посочен ъгъл (от точка 1 към точка 2):
α = atan2(ΔY, ΔX) = atan2(${result.deltaY}, ${result.deltaX}) = ${result.bearing} гради
α = ${result.bearingDegrees}°
-------------------------------------
Обратен ъгъл (от точка 2 към точка 1):
αобратен = ${result.reverseBearing} гради
αобратен = ${result.reverseBearingDegrees}°
-------------------------------------
Допълнителна информация:
Квадрант: ${result.quadrant}
Наклон: ${result.slope}
Азимут: ${result.azimuth} гради (${result.azimuthDegrees}°)
-------------------------------------
Проверка:
Разстояние: ${result.checkDistance} м
Посочен ъгъл: ${result.checkBearing} гради
-------------------------------------`
        : `--------- Distance and Bearing (Enhanced) ---------
Point 1: (${x1}, ${y1})
Point 2: (${x2}, ${y2})
-------------------------------------
Coordinate differences:
ΔX = X2 - X1 = ${x2} - ${x1} = ${result.deltaX} m
ΔY = Y2 - Y1 = ${y2} - ${y1} = ${result.deltaY} m
-------------------------------------
Distance:
S = √(ΔX² + ΔY²) = √(${result.deltaX}² + ${result.deltaY}²) = ${result.distance} m
-------------------------------------
Bearing (from point 1 to point 2):
α = atan2(ΔY, ΔX) = atan2(${result.deltaY}, ${result.deltaX}) = ${result.bearing} gon
α = ${result.bearingDegrees}°
-------------------------------------
Reverse bearing (from point 2 to point 1):
αreverse = ${result.reverseBearing} gon
αreverse = ${result.reverseBearingDegrees}°
-------------------------------------
Additional information:
Quadrant: ${result.quadrant}
Slope: ${result.slope}
Azimuth: ${result.azimuth} gon (${result.azimuthDegrees}°)
-------------------------------------
Verification:
Distance: ${result.checkDistance} m
Bearing: ${result.checkBearing} gon
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
    setForm({ x1: '', y1: '', x2: '', y2: '' });
    setResultText('Въведете координати на две точки и натиснете "Изчисли", за да видите резултатите тук.');
  };

  return (
    <>
      <Helmet>
        <title>GeoSolver – {language === 'bg' ? 'Разстояние и посока' : 'Distance and Bearing'}</title>
        <meta name="description" content={language === 'bg' ? 'Изчисляване на разстояние и посочен ъгъл между точки' : 'Calculate distance and bearing between points'} />
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
                <span className="text-neutral-400">{language === 'bg' ? 'Разстояние и посока' : 'Distance and Bearing'}</span>
              </div>
              <h1 className="text-black text-2xl lg:text-3xl font-bold font-['Manrope']">
                {language === 'bg' ? 'Разстояние и посока' : 'Distance and Bearing'}
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
                      {language === 'bg' ? 'Точка 1' : 'Point 1'}
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="number"
                        id="x1"
                        value={form.x1}
                        onChange={handleChange}
                        placeholder="X"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <input
                        type="number"
                        id="y1"
                        value={form.y1}
                        onChange={handleChange}
                        placeholder="Y"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      {language === 'bg' ? 'Точка 2' : 'Point 2'}
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="number"
                        id="x2"
                        value={form.x2}
                        onChange={handleChange}
                        placeholder="X"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <input
                        type="number"
                        id="y2"
                        value={form.y2}
                        onChange={handleChange}
                        placeholder="Y"
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
                          ({entry.x1}, {entry.y1}) → ({entry.x2}, {entry.y2})
                        </span>
                        <span className="text-xs text-neutral-600">
                          S: {entry.distance} м, α: {entry.bearing} гради
                        </span>
                        <span className="text-xs text-neutral-500">
                          {new Date(entry.date).toLocaleDateString()}
                        </span>
                      </div>
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

export default DistanceBearing;
