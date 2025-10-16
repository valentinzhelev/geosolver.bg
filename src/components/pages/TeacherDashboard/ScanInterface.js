import React, { useState, useRef } from 'react';
import Layout from '../../layout/Layout';
import { Helmet } from 'react-helmet';
import { useTranslation } from '../../../hooks/useTranslation';
import { Link } from 'react-router-dom';

const ScanInterface = () => {
  const { t, language } = useTranslation();
  const [selectedFile, setSelectedFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  // Mock analysis result - will be replaced with AI analysis
  const mockAnalysisResult = {
    studentName: 'Иван Петров',
    taskType: 'Първа основна задача',
    overallScore: 7.5,
    totalErrors: 3,
    errors: [
      {
        id: 1,
        type: 'calculation',
        description: language === 'bg' ? 'Грешка в изчислението на ъгъла α' : 'Error in angle α calculation',
        location: { x: 120, y: 80 },
        severity: 'medium',
        suggestion: language === 'bg' ? 'Проверете формулата за sin(α)' : 'Check the sin(α) formula'
      },
      {
        id: 2,
        type: 'formula',
        description: language === 'bg' ? 'Неправилна формула за координата Y₂' : 'Incorrect formula for Y₂ coordinate',
        location: { x: 200, y: 150 },
        severity: 'high',
        suggestion: language === 'bg' ? 'Използвайте Y₂ = Y₁ + S·sin(α)' : 'Use Y₂ = Y₁ + S·sin(α)'
      },
      {
        id: 3,
        type: 'unit',
        description: language === 'bg' ? 'Липсва единица в резултата' : 'Missing unit in result',
        location: { x: 300, y: 220 },
        severity: 'low',
        suggestion: language === 'bg' ? 'Добавете единицата (м)' : 'Add unit (m)'
      }
    ],
    correctSteps: [
      language === 'bg' ? 'Правилно въвеждане на данните' : 'Correct data input',
      language === 'bg' ? 'Правилна формула за X₂' : 'Correct formula for X₂',
      language === 'bg' ? 'Правилно изчисление на разстоянието' : 'Correct distance calculation'
    ],
    feedback: language === 'bg' 
      ? 'Добро разбиране на основните принципи, но има грешки в приложението на формулите. Препоръчвам да се обърне внимание на тригонометричните функции.'
      : 'Good understanding of basic principles, but there are errors in formula application. Recommend focusing on trigonometric functions.'
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = (file) => {
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setAnalysisResult(null);
    } else {
      alert(language === 'bg' ? 'Моля, изберете валиден файл с изображение' : 'Please select a valid image file');
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    
    // Simulate AI analysis delay
    setTimeout(() => {
      setAnalysisResult(mockAnalysisResult);
      setIsAnalyzing(false);
    }, 3000);
  };

  const handleReset = () => {
    setSelectedFile(null);
    setAnalysisResult(null);
    setIsAnalyzing(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'bg-red-50 text-red-700 border-red-200';
      case 'medium': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'low': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getSeverityLabel = (severity) => {
    switch (severity) {
      case 'high': return language === 'bg' ? 'Висока' : 'High';
      case 'medium': return language === 'bg' ? 'Средна' : 'Medium';
      case 'low': return language === 'bg' ? 'Ниска' : 'Low';
      default: return severity;
    }
  };

  return (
    <>
      <Helmet>
        <title>GeoSolver – {language === 'bg' ? 'Сканиране на решения' : 'Solution Scanning'}</title>
        <meta name="description" content={language === 'bg' ? 'AI-анализ на геодезически решения' : 'AI analysis of geodesy solutions'} />
      </Helmet>
      <Layout>
        <div className="w-full min-h-screen bg-stone-50 flex flex-col items-center py-8 px-2 md:px-0">
          <div className="w-full max-w-[1180px] flex flex-col gap-10">
            {/* Header */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <Link 
                  to="/teacher/dashboard" 
                  className="px-3 py-1 bg-white rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 hover:bg-gray-50 transition-colors duration-200"
                >
                  <span className="text-sm text-neutral-600">← {language === 'bg' ? 'Назад' : 'Back'}</span>
                </Link>
                <h1 className="text-black text-3xl font-bold font-['Manrope']">
                  {language === 'bg' ? 'Сканиране на решения' : 'Solution Scanning'}
                </h1>
              </div>
              <p className="text-neutral-600 text-base">
                {language === 'bg' 
                  ? 'Качете снимка на решение и получете автоматичен AI-анализ с визуализация на грешките'
                  : 'Upload a solution image and get automatic AI analysis with error visualization'
                }
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Upload Section */}
              <div className="p-6 bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200">
                <h2 className="text-xl font-bold text-black mb-6">
                  {language === 'bg' ? 'Качване на решение' : 'Upload Solution'}
                </h2>
                
                {/* File Upload Area */}
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 ${
                    dragActive 
                      ? 'border-blue-400 bg-blue-50' 
                      : selectedFile 
                        ? 'border-green-400 bg-green-50' 
                        : 'border-gray-300 bg-gray-50'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  {selectedFile ? (
                    <div className="space-y-4">
                      <div className="text-4xl">📄</div>
                      <div>
                        <div className="font-medium text-black">{selectedFile.name}</div>
                        <div className="text-sm text-neutral-600">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </div>
                      </div>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 bg-gray-200 text-black rounded-lg hover:bg-gray-300 transition-colors duration-200 text-sm font-medium"
                      >
                        {language === 'bg' ? 'Избери друг файл' : 'Choose different file'}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="text-4xl">📸</div>
                      <div>
                        <div className="font-medium text-black mb-2">
                          {language === 'bg' ? 'Плъзнете файла тук или' : 'Drag file here or'}
                        </div>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 text-sm font-medium"
                        >
                          {language === 'bg' ? 'Избери файл' : 'Choose file'}
                        </button>
                      </div>
                      <div className="text-xs text-neutral-500">
                        {language === 'bg' ? 'Поддържани формати: JPG, PNG, PDF' : 'Supported formats: JPG, PNG, PDF'}
                      </div>
                    </div>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileInput}
                  className="hidden"
                />

                {/* Action Buttons */}
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleAnalyze}
                    disabled={!selectedFile || isAnalyzing}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 text-sm font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isAnalyzing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        {language === 'bg' ? 'Анализиране...' : 'Analyzing...'}
                      </>
                    ) : (
                      <>
                        {language === 'bg' ? 'Анализирай' : 'Analyze'}
                        <span>→</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleReset}
                    className="px-4 py-2 bg-gray-200 text-black rounded-lg hover:bg-gray-300 transition-colors duration-200 text-sm font-medium"
                  >
                    {language === 'bg' ? 'Нулирай' : 'Reset'}
                  </button>
                </div>
              </div>

              {/* Analysis Results */}
              <div className="p-6 bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200">
                <h2 className="text-xl font-bold text-black mb-6">
                  {language === 'bg' ? 'Резултати от анализа' : 'Analysis Results'}
                </h2>
                
                {analysisResult ? (
                  <div className="space-y-6">
                    {/* Overall Score */}
                    <div className="p-4 bg-stone-50 rounded-lg border border-gray-200">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-black">
                          {language === 'bg' ? 'Обща оценка' : 'Overall Score'}
                        </span>
                        <span className="text-2xl font-bold text-black">{analysisResult.overallScore}/10</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${(analysisResult.overallScore / 10) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Student Info */}
                    <div className="p-4 bg-stone-50 rounded-lg border border-gray-200">
                      <div className="space-y-2 text-sm">
                        <div><strong>{language === 'bg' ? 'Ученик:' : 'Student:'}</strong> {analysisResult.studentName}</div>
                        <div><strong>{language === 'bg' ? 'Задача:' : 'Task:'}</strong> {analysisResult.taskType}</div>
                        <div><strong>{language === 'bg' ? 'Грешки:' : 'Errors:'}</strong> {analysisResult.totalErrors}</div>
                      </div>
                    </div>

                    {/* Errors List */}
                    <div>
                      <h3 className="font-semibold text-black mb-3">
                        {language === 'bg' ? 'Намерени грешки' : 'Detected Errors'}
                      </h3>
                      <div className="space-y-3">
                        {analysisResult.errors.map((error) => (
                          <div key={error.id} className={`p-3 rounded-lg border ${getSeverityColor(error.severity)}`}>
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-medium">{error.description}</span>
                              <span className="text-xs px-2 py-1 rounded-full bg-white">
                                {getSeverityLabel(error.severity)}
                              </span>
                            </div>
                            <div className="text-sm opacity-80">
                              <strong>{language === 'bg' ? 'Препоръка:' : 'Suggestion:'}</strong> {error.suggestion}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Correct Steps */}
                    <div>
                      <h3 className="font-semibold text-black mb-3">
                        {language === 'bg' ? 'Правилни стъпки' : 'Correct Steps'}
                      </h3>
                      <div className="space-y-2">
                        {analysisResult.correctSteps.map((step, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm text-green-700">
                            <span className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center text-xs">✓</span>
                            {step}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Feedback */}
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h3 className="font-semibold text-blue-800 mb-2">
                        {language === 'bg' ? 'Преподавателска обратна връзка' : 'Teacher Feedback'}
                      </h3>
                      <p className="text-sm text-blue-700">{analysisResult.feedback}</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-stone-50 rounded-lg p-6 border border-gray-200 min-h-[400px] flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl mb-4">🔍</div>
                      <p className="text-neutral-600 text-base">
                        {language === 'bg' 
                          ? 'Качете решение и натиснете "Анализирай", за да видите резултатите тук.'
                          : 'Upload a solution and click "Analyze" to see results here.'
                        }
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Scans */}
            <div className="p-6 bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200">
              <h2 className="text-xl font-bold text-black mb-6">
                {language === 'bg' ? 'Последни сканирания' : 'Recent Scans'}
              </h2>
              <div className="bg-stone-50 rounded-lg p-6 border border-gray-200 min-h-[200px] flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-4">📊</div>
                  <p className="text-neutral-600 text-base">
                    {language === 'bg' 
                      ? 'Историята на сканиранията ще се показва тук'
                      : 'Scan history will be displayed here'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default ScanInterface;
