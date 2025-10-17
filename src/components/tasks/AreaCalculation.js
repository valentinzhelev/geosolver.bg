import React, { useState, useEffect } from 'react';
import Layout from '../layout/Layout';
import { Helmet } from "react-helmet";
import { Link } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import useTypewriter from '../../hooks/useTypewriter';

// LocalStorage helpers
const getHistory = () => {
  try {
    const data = localStorage.getItem('areaCalculationHistory');
    return data ? JSON.parse(data) : [];
  } catch { return []; }
};
const saveHistory = (entry) => {
  const history = getHistory();
  history.unshift(entry);
  localStorage.setItem('areaCalculationHistory', JSON.stringify(history.slice(0, 20)));
};

/**
 * Изчисляване на площ (Enhanced):
 * Изчислява площта на многоъгълник по различни методи
 * 
 * Методи:
 * 1. Shoelace Formula (Gauss's area formula)
 * 2. Trapezoidal Rule
 * 3. Simpson's Rule (за криви)
 * 
 * @param {Array} points - Масив от точки [{x, y}, {x, y}, ...]
 * @param {string} method - Метод за изчисление
 * @returns {Object} Резултати от изчисленията
 */
function calculateArea(points, method = 'shoelace') {
  if (points.length < 3) {
    throw new Error('Необходими са поне 3 точки за изчисляване на площ');
  }

  // Затваряне на многоъгълника (добавяне на първата точка в края)
  const closedPoints = [...points, points[0]];

  let area = 0;
  let calculationDetails = '';
  let perimeter = 0;

  switch (method) {
    case 'shoelace':
      // Shoelace Formula (Gauss's area formula)
      let sum1 = 0;
      let sum2 = 0;
      
      for (let i = 0; i < points.length; i++) {
        const j = (i + 1) % points.length;
        sum1 += points[i].x * points[j].y;
        sum2 += points[j].x * points[i].y;
      }
      
      area = Math.abs(sum1 - sum2) / 2;
      calculationDetails = `Shoelace Formula:\nA = |Σ(xi·yi+1) - Σ(xi+1·yi)| / 2\nA = |${sum1} - ${sum2}| / 2 = ${area}`;
      break;

    case 'trapezoidal':
      // Trapezoidal Rule
      let trapezoidalSum = 0;
      for (let i = 0; i < points.length; i++) {
        const j = (i + 1) % points.length;
        trapezoidalSum += (points[i].y + points[j].y) * (points[j].x - points[i].x);
      }
      area = Math.abs(trapezoidalSum) / 2;
      calculationDetails = `Trapezoidal Rule:\nA = |Σ((yi + yi+1) × (xi+1 - xi))| / 2\nA = |${trapezoidalSum}| / 2 = ${area}`;
      break;

    case 'coordinate':
      // Coordinate Method (алтернативен метод)
      let coordSum = 0;
      for (let i = 0; i < points.length; i++) {
        const j = (i + 1) % points.length;
        coordSum += points[i].x * points[j].y - points[j].x * points[i].y;
      }
      area = Math.abs(coordSum) / 2;
      calculationDetails = `Coordinate Method:\nA = |Σ(xi·yi+1 - xi+1·yi)| / 2\nA = |${coordSum}| / 2 = ${area}`;
      break;

    default:
      throw new Error('Неизвестен метод за изчисляване на площ');
  }

  // Изчисляване на периметъра
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    const dx = points[j].x - points[i].x;
    const dy = points[j].y - points[i].y;
    perimeter += Math.sqrt(dx * dx + dy * dy);
  }

  // Допълнителни изчисления
  const centroid = calculateCentroid(points);
  const boundingBox = calculateBoundingBox(points);

  return {
    area: Math.round(area * 1000) / 1000,
    perimeter: Math.round(perimeter * 1000) / 1000,
    method,
    calculationDetails,
    centroid,
    boundingBox,
    pointCount: points.length,
    // Проверка с различни методи
    shoelaceArea: method !== 'shoelace' ? Math.round(calculateArea(points, 'shoelace').area * 1000) / 1000 : area,
    trapezoidalArea: method !== 'trapezoidal' ? Math.round(calculateArea(points, 'trapezoidal').area * 1000) / 1000 : area,
    coordinateArea: method !== 'coordinate' ? Math.round(calculateArea(points, 'coordinate').area * 1000) / 1000 : area
  };
}

/**
 * Изчислява центроида на многоъгълника
 */
function calculateCentroid(points) {
  let cx = 0, cy = 0;
  for (const point of points) {
    cx += point.x;
    cy += point.y;
  }
  return {
    x: Math.round((cx / points.length) * 1000) / 1000,
    y: Math.round((cy / points.length) * 1000) / 1000
  };
}

/**
 * Изчислява ограничителния правоъгълник
 */
function calculateBoundingBox(points) {
  const xs = points.map(p => p.x);
  const ys = points.map(p => p.y);
  return {
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    minY: Math.min(...ys),
    maxY: Math.max(...ys),
    width: Math.max(...xs) - Math.min(...xs),
    height: Math.max(...ys) - Math.min(...ys)
  };
}

const AreaCalculation = () => {
  const [points, setPoints] = useState([]);
  const [currentPoint, setCurrentPoint] = useState({ x: '', y: '' });
  const [method, setMethod] = useState('shoelace');
  const [resultText, setResultText] = useState('Добавете поне 3 точки и натиснете "Изчисли", за да видите резултатите тук.');
  const [history, setHistory] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(history.length / itemsPerPage);
  const paginatedHistory = history.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const { displayText, isTyping } = useTypewriter(resultText);
  const { t, language } = useTranslation();

  useEffect(() => { setHistory(getHistory()); }, []);

  const handlePointChange = (e) => {
    setCurrentPoint({ ...currentPoint, [e.target.id]: e.target.value });
  };

  const addPoint = () => {
    if (currentPoint.x !== '' && currentPoint.y !== '' && !isNaN(Number(currentPoint.x)) && !isNaN(Number(currentPoint.y))) {
      const newPoint = { x: Number(currentPoint.x), y: Number(currentPoint.y) };
      setPoints([...points, newPoint]);
      setCurrentPoint({ x: '', y: '' });
    }
  };

  const removePoint = (index) => {
    setPoints(points.filter((_, i) => i !== index));
  };

  const clearPoints = () => {
    setPoints([]);
    setCurrentPoint({ x: '', y: '' });
  };

  const handleCalculate = () => {
    if (points.length < 3) {
      alert(language === 'bg' ? 'Необходими са поне 3 точки за изчисляване на площ.' : 'At least 3 points are required to calculate area.');
      return;
    }

    try {
      const result = calculateArea(points, method);

      const methodNames = {
        shoelace: language === 'bg' ? 'Shoelace Formula' : 'Shoelace Formula',
        trapezoidal: language === 'bg' ? 'Трапецовидна формула' : 'Trapezoidal Rule',
        coordinate: language === 'bg' ? 'Координатен метод' : 'Coordinate Method'
      };

      const output = language === 'bg'
        ? `--------- Изчисляване на площ (Enhanced) ---------
Метод: ${methodNames[method]}
Брой точки: ${result.pointCount}
-------------------------------------
Точки на многоъгълника:
${points.map((p, i) => `${i + 1}. (${p.x}, ${p.y})`).join('\n')}
-------------------------------------
${result.calculationDetails}
-------------------------------------
Резултати:
Площ: ${result.area} м²
Периметър: ${result.perimeter} м
-------------------------------------
Центроид: (${result.centroid.x}, ${result.centroid.y})
Ограничителен правоъгълник:
Ширина: ${result.boundingBox.width} м
Височина: ${result.boundingBox.height} м
Площ на правоъгълника: ${Math.round(result.boundingBox.width * result.boundingBox.height * 1000) / 1000} м²
-------------------------------------
Проверка с други методи:
Shoelace: ${result.shoelaceArea} м²
Трапецовидна: ${result.trapezoidalArea} м²
Координатен: ${result.coordinateArea} м²
-------------------------------------`
        : `--------- Area Calculation (Enhanced) ---------
Method: ${methodNames[method]}
Point count: ${result.pointCount}
-------------------------------------
Polygon points:
${points.map((p, i) => `${i + 1}. (${p.x}, ${p.y})`).join('\n')}
-------------------------------------
${result.calculationDetails}
-------------------------------------
Results:
Area: ${result.area} m²
Perimeter: ${result.perimeter} m
-------------------------------------
Centroid: (${result.centroid.x}, ${result.centroid.y})
Bounding box:
Width: ${result.boundingBox.width} m
Height: ${result.boundingBox.height} m
Rectangle area: ${Math.round(result.boundingBox.width * result.boundingBox.height * 1000) / 1000} m²
-------------------------------------
Verification with other methods:
Shoelace: ${result.shoelaceArea} m²
Trapezoidal: ${result.trapezoidalArea} m²
Coordinate: ${result.coordinateArea} m²
-------------------------------------`;

      setResultText(output);
      const entry = { points, method, ...result, date: new Date().toISOString() };
      saveHistory(entry);
      setHistory(getHistory());
    } catch (error) {
      setResultText(language === 'bg' 
        ? `Грешка: ${error.message}` 
        : `Error: ${error.message}`);
    }
  };

  const resetForm = () => {
    setPoints([]);
    setCurrentPoint({ x: '', y: '' });
    setResultText('Добавете поне 3 точки и натиснете "Изчисли", за да видите резултатите тук.');
  };

  return (
    <>
      <Helmet>
        <title>GeoSolver – {language === 'bg' ? 'Изчисляване на площ' : 'Area Calculation'}</title>
        <meta name="description" content={language === 'bg' ? 'Изчисляване на площ на многоъгълник' : 'Calculate polygon area'} />
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
                <span className="text-neutral-400">{language === 'bg' ? 'Изчисляване на площ' : 'Area Calculation'}</span>
              </div>
              <h1 className="text-black text-2xl lg:text-3xl font-bold font-['Manrope']">
                {language === 'bg' ? 'Изчисляване на площ' : 'Area Calculation'}
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
                      {language === 'bg' ? 'Метод за изчисление' : 'Calculation Method'}
                    </label>
                    <select
                      value={method}
                      onChange={(e) => setMethod(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="shoelace">{language === 'bg' ? 'Shoelace Formula' : 'Shoelace Formula'}</option>
                      <option value="trapezoidal">{language === 'bg' ? 'Трапецовидна формула' : 'Trapezoidal Rule'}</option>
                      <option value="coordinate">{language === 'bg' ? 'Координатен метод' : 'Coordinate Method'}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      {language === 'bg' ? 'Добавяне на точки' : 'Add Points'}
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="number"
                        id="x"
                        value={currentPoint.x}
                        onChange={handlePointChange}
                        placeholder="X"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <input
                        type="number"
                        id="y"
                        value={currentPoint.y}
                        onChange={handlePointChange}
                        placeholder="Y"
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <button
                      onClick={addPoint}
                      className="w-full mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
                    >
                      {language === 'bg' ? 'Добави точка' : 'Add Point'}
                    </button>
                  </div>

                  {points.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        {language === 'bg' ? 'Точки на многоъгълника' : 'Polygon Points'} ({points.length})
                      </label>
                      <div className="max-h-40 overflow-y-auto space-y-2">
                        {points.map((point, index) => (
                          <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <span className="text-sm">
                              {index + 1}. ({point.x}, {point.y})
                            </span>
                            <button
                              onClick={() => removePoint(index)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              {language === 'bg' ? 'Премахни' : 'Remove'}
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleCalculate}
                      disabled={points.length < 3}
                      className="flex-1 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-200 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {language === 'bg' ? 'Изчисли площ' : 'Calculate Area'}
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
                          {entry.pointCount} {language === 'bg' ? 'точки' : 'points'} - {entry.area} м²
                        </span>
                        <span className="text-xs text-neutral-600">
                          {entry.method} - P: {entry.perimeter} м
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

export default AreaCalculation;
