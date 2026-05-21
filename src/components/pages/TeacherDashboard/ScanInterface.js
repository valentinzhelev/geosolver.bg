import React, { useState, useRef } from 'react';
import Layout from '../../layout/Layout';
import SEO from '../../shared/SEO';
import { useTranslation } from '../../../hooks/useTranslation';
import { Link } from 'react-router-dom';

// Professional Icons Components
const ScanIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const UploadIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
);

const CameraIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 13v7a2 2 0 01-2 2H7a2 2 0 01-2-2v-7" />
  </svg>
);

const AnalysisIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const ErrorIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
  </svg>
);

const CheckIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const FileIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const ResetIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const ActivityIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const TrendingUpIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

const ScanInterface = () => {
  const { language } = useTranslation();
  const [selectedFile, setSelectedFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

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
    e.target.value = '';
  };

  const handleCameraInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
    e.target.value = '';
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
      <SEO
        title={language === 'bg' ? 'Сканиране на решения' : 'Solution Scanning'}
        description={language === 'bg' ? 'AI-анализ на геодезически решения' : 'AI analysis of geodesy solutions'}
        canonical="/teacher/scan"
      />
      <Layout>
        <div className="w-full min-h-screen bg-stone-50 dark:bg-zinc-950 transition-colors flex flex-col items-center py-8 px-2 md:px-0">
          <div className="w-full max-w-[1180px] flex flex-col gap-10">
            {/* Header */}
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-4">
                <Link 
                  to="/teacher/dashboard" 
                  className="px-3 py-2 bg-white dark:bg-zinc-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-800 hover:bg-gray-50 transition-colors duration-200 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span className="text-sm text-neutral-600 dark:text-zinc-400">{language === 'bg' ? 'Назад' : 'Back'}</span>
                </Link>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <ScanIcon className="w-8 h-8 text-gray-600" />
                  </div>
                  <h1 className="text-black dark:text-white text-3xl font-bold font-['Manrope']">
                    {language === 'bg' ? 'Сканиране на решения' : 'Solution Scanning'}
                  </h1>
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-gray-800 text-base font-medium">
                  {language === 'bg' 
                    ? 'Качете снимка на решение и получете автоматичен AI-анализ с визуализация на грешките и подробна обратна връзка'
                    : 'Upload a solution image and get automatic AI analysis with error visualization and detailed feedback'
                  }
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Upload Section */}
              <div className="p-6 bg-white dark:bg-zinc-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-800">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <UploadIcon className="w-6 h-6 text-gray-600" />
                  </div>
                  <h2 className="text-xl font-bold text-black dark:text-white">
                    {language === 'bg' ? 'Качване на решение' : 'Upload Solution'}
                  </h2>
                </div>
                
                {/* File Upload Area */}
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 ${
                    dragActive 
                      ? 'border-gray-400 bg-gray-100' 
                      : selectedFile 
                        ? 'border-gray-400 bg-gray-100' 
                        : 'border-gray-300 bg-gray-50'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  {selectedFile ? (
                    <div className="space-y-4">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                        <FileIcon className="w-8 h-8 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium text-black dark:text-white">{selectedFile.name}</div>
                        <div className="text-sm text-neutral-600 dark:text-zinc-400">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </div>
                      </div>
                      <div className="flex flex-wrap justify-center gap-2">
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="px-4 py-2 bg-gray-200 dark:bg-zinc-700 text-black dark:text-white rounded-lg hover:bg-gray-300 transition-colors duration-200 text-sm font-medium flex items-center gap-2"
                        >
                          <UploadIcon className="w-4 h-4" />
                          {language === 'bg' ? 'Избери друг файл' : 'Choose different file'}
                        </button>
                        <button
                          onClick={() => cameraInputRef.current?.click()}
                          className="px-4 py-2 bg-gray-200 dark:bg-zinc-700 text-black dark:text-white rounded-lg hover:bg-gray-300 transition-colors duration-200 text-sm font-medium flex items-center gap-2"
                        >
                          <CameraIcon className="w-4 h-4" />
                          {language === 'bg' ? 'Направи нова снимка' : 'Take new photo'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                        <UploadIcon className="w-8 h-8 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium text-black dark:text-white mb-2">
                          {language === 'bg' ? 'Плъзнете файла тук или' : 'Drag file here or'}
                        </div>
                        <div className="flex flex-wrap justify-center gap-2">
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium flex items-center gap-2"
                          >
                            <UploadIcon className="w-4 h-4" />
                            {language === 'bg' ? 'Избери файл' : 'Choose file'}
                          </button>
                          <button
                            onClick={() => cameraInputRef.current?.click()}
                            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 text-sm font-medium flex items-center gap-2"
                          >
                            <CameraIcon className="w-4 h-4" />
                            {language === 'bg' ? 'Направи снимка' : 'Take photo'}
                          </button>
                        </div>
                      </div>
                      <div className="text-xs text-neutral-500 dark:text-zinc-400">
                        {language === 'bg' ? 'Поддържани формати: JPG, PNG, PDF. На мобилни „Направи снимка" отваря камерата.' : 'Supported formats: JPG, PNG, PDF. On mobile, "Take photo" opens the camera.'}
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
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleCameraInput}
                  className="hidden"
                />

                {/* Action Buttons */}
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleAnalyze}
                    disabled={!selectedFile || isAnalyzing}
                    className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 text-sm font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                  >
                    {isAnalyzing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        {language === 'bg' ? 'Анализиране...' : 'Analyzing...'}
                      </>
                    ) : (
                      <>
                        <AnalysisIcon className="w-4 h-4" />
                        {language === 'bg' ? 'Анализирай' : 'Analyze'}
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleReset}
                    className="px-6 py-3 bg-gray-200 dark:bg-zinc-700 text-black dark:text-white rounded-lg hover:bg-gray-300 transition-colors duration-200 text-sm font-medium flex items-center gap-2"
                  >
                    <ResetIcon className="w-4 h-4" />
                    {language === 'bg' ? 'Нулирай' : 'Reset'}
                  </button>
                </div>
              </div>

              {/* Analysis Results */}
              <div className="p-6 bg-white dark:bg-zinc-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-800">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <AnalysisIcon className="w-6 h-6 text-purple-600" />
                  </div>
                  <h2 className="text-xl font-bold text-black dark:text-white">
                    {language === 'bg' ? 'Резултати от анализа' : 'Analysis Results'}
                  </h2>
                </div>
                
                {analysisResult ? (
                  <div className="space-y-6">
                    {/* Overall Score */}
                    <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            <TrendingUpIcon className="w-5 h-5 text-gray-600" />
                          </div>
                          <span className="font-semibold text-gray-900 text-lg">
                            {language === 'bg' ? 'Обща оценка' : 'Overall Score'}
                          </span>
                        </div>
                        <span className="text-3xl font-bold text-gray-700">{analysisResult.overallScore}/10</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-zinc-700 rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-gray-500 to-gray-600 h-3 rounded-full transition-all duration-500 shadow-sm"
                          style={{ width: `${(analysisResult.overallScore / 10) * 100}%` }}
                        ></div>
                      </div>
                      <div className="mt-2 text-sm text-gray-700">
                        {analysisResult.overallScore >= 8 ? (language === 'bg' ? 'Отлично изпълнение!' : 'Excellent performance!') :
                         analysisResult.overallScore >= 6 ? (language === 'bg' ? 'Добро изпълнение' : 'Good performance') :
                         analysisResult.overallScore >= 4 ? (language === 'bg' ? 'Задоволително' : 'Satisfactory') :
                         (language === 'bg' ? 'Нужда от подобрение' : 'Needs improvement')}
                      </div>
                    </div>

                    {/* Student Info */}
                    <div className="p-4 bg-gradient-to-br from-gray-50 to-stone-50 rounded-lg border border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-3 p-3 bg-white dark:bg-zinc-900 rounded-lg border border-gray-100">
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 font-medium">{language === 'bg' ? 'Ученик' : 'Student'}</div>
                            <div className="text-sm font-semibold text-gray-900">{analysisResult.studentName}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-white dark:bg-zinc-900 rounded-lg border border-gray-100">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 font-medium">{language === 'bg' ? 'Задача' : 'Task'}</div>
                            <div className="text-sm font-semibold text-gray-900">{analysisResult.taskType}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-white dark:bg-zinc-900 rounded-lg border border-gray-100">
                          <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                            <ErrorIcon className="w-4 h-4 text-red-600" />
                          </div>
                          <div>
                            <div className="text-xs text-gray-500 font-medium">{language === 'bg' ? 'Грешки' : 'Errors'}</div>
                            <div className="text-sm font-semibold text-gray-900">{analysisResult.totalErrors}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Errors List */}
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-red-100 rounded-lg">
                          <ErrorIcon className="w-5 h-5 text-red-600" />
                        </div>
                        <h3 className="font-semibold text-black dark:text-white text-lg">
                          {language === 'bg' ? 'Намерени грешки' : 'Detected Errors'}
                        </h3>
                      </div>
                      <div className="space-y-4">
                        {analysisResult.errors.map((error) => (
                          <div key={error.id} className={`p-4 rounded-lg border ${getSeverityColor(error.severity)} hover:shadow-md transition-shadow duration-200`}>
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                  error.severity === 'high' ? 'bg-red-100' :
                                  error.severity === 'medium' ? 'bg-orange-100' :
                                  'bg-yellow-100'
                                }`}>
                                  <ErrorIcon className={`w-4 h-4 ${
                                    error.severity === 'high' ? 'text-red-600' :
                                    error.severity === 'medium' ? 'text-orange-600' :
                                    'text-yellow-600'
                                  }`} />
                                </div>
                                <span className="font-medium text-lg">{error.description}</span>
                              </div>
                              <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                                error.severity === 'high' ? 'bg-red-100 text-red-700' :
                                error.severity === 'medium' ? 'bg-orange-100 text-orange-700' :
                                'bg-yellow-100 text-yellow-700'
                              }`}>
                                {getSeverityLabel(error.severity)}
                              </span>
                            </div>
                            <div className="p-3 bg-white dark:bg-zinc-900/50 rounded-lg">
                              <div className="text-sm font-medium text-gray-700 mb-1">
                                {language === 'bg' ? 'Препоръка:' : 'Suggestion:'}
                              </div>
                              <div className="text-sm text-gray-600">{error.suggestion}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Correct Steps */}
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <CheckIcon className="w-5 h-5 text-green-600" />
                        </div>
                        <h3 className="font-semibold text-black dark:text-white text-lg">
                          {language === 'bg' ? 'Правилни стъпки' : 'Correct Steps'}
                        </h3>
                      </div>
                      <div className="space-y-3">
                        {analysisResult.correctSteps.map((step, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                              <CheckIcon className="w-4 h-4 text-green-600" />
                            </div>
                            <span className="text-sm font-medium text-green-800">{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Feedback */}
                    <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                        </div>
                        <h3 className="font-semibold text-blue-900 text-lg">
                          {language === 'bg' ? 'Преподавателска обратна връзка' : 'Teacher Feedback'}
                        </h3>
                      </div>
                      <div className="p-4 bg-white dark:bg-zinc-900 rounded-lg border border-blue-100">
                        <p className="text-sm text-blue-800 leading-relaxed">{analysisResult.feedback}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gradient-to-br from-gray-50 to-stone-50 rounded-lg p-8 border border-gray-200 min-h-[400px] flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AnalysisIcon className="w-10 h-10 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        {language === 'bg' ? 'Готови за анализ' : 'Ready for Analysis'}
                      </h3>
                      <p className="text-gray-600 text-base max-w-md">
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
            <div className="p-6 bg-white dark:bg-zinc-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-800">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <ActivityIcon className="w-6 h-6 text-purple-600" />
                </div>
                <h2 className="text-xl font-bold text-black dark:text-white">
                  {language === 'bg' ? 'Последни сканирания' : 'Recent Scans'}
                </h2>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-8 border border-purple-200 min-h-[200px] flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ActivityIcon className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-purple-900 mb-2">
                    {language === 'bg' ? 'История на сканиранията' : 'Scan History'}
                  </h3>
                  <p className="text-purple-700 text-base max-w-md">
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
