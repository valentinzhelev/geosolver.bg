import React, { useState, useEffect } from 'react';
import Layout from '../../layout/Layout';
import SEO from '../../shared/SEO';
import { useTranslation } from '../../../hooks/useTranslation';
import { Link } from 'react-router-dom';

// Professional Icons Components
const TemplateIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const CodeIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
  </svg>
);

const PlayIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m-6-8h8a2 2 0 012 2v8a2 2 0 01-2 2H8a2 2 0 01-2-2V6a2 2 0 012-2z" />
  </svg>
);

const SaveIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
  </svg>
);

const TaskTemplateEditor = () => {
  const { language } = useTranslation();
  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState({
    name: '',
    type: 'coordinate-transformation',
    description: '',
    difficulty: 'medium',
    level: 5,
    generatorScript: '',
    solutionScript: '',
    gradingSettings: {
      tolerance: 0.001,
      toleranceType: 'absolute',
      maxScore: 100
    },
    tags: [],
    isPublic: false
  });
  const [testResult, setTestResult] = useState(null);
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const taskTypes = [
    { value: 'coordinate-transformation', label: language === 'bg' ? 'Координатна трансформация' : 'Coordinate Transformation' },
    { value: 'forward-intersection', label: language === 'bg' ? 'Засечка напред' : 'Forward Intersection' },
    { value: 'resection', label: language === 'bg' ? 'Засечка назад' : 'Resection' },
    { value: 'distance-calculation', label: language === 'bg' ? 'Изчисляване на разстояние' : 'Distance Calculation' },
    { value: 'angle-calculation', label: language === 'bg' ? 'Изчисляване на ъгъл' : 'Angle Calculation' },
    { value: 'custom', label: language === 'bg' ? 'Персонализиран' : 'Custom' }
  ];

  const difficulties = [
    { value: 'easy', label: language === 'bg' ? 'Лесно' : 'Easy' },
    { value: 'medium', label: language === 'bg' ? 'Средно' : 'Medium' },
    { value: 'hard', label: language === 'bg' ? 'Трудно' : 'Hard' },
    { value: 'expert', label: language === 'bg' ? 'Експерт' : 'Expert' }
  ];

  const tabs = [
    { id: 'basic', label: language === 'bg' ? 'Основни данни' : 'Basic Info', icon: TemplateIcon },
    { id: 'generator', label: language === 'bg' ? 'Генератор' : 'Generator', icon: CodeIcon },
    { id: 'solution', label: language === 'bg' ? 'Решение' : 'Solution', icon: CodeIcon },
    { id: 'settings', label: language === 'bg' ? 'Настройки' : 'Settings', icon: TemplateIcon }
  ];

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleTestGenerator = async () => {
    setIsTesting(true);
    try {
      // Mock test - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockResult = {
        success: true,
        data: {
          inputData: {
            x1: 100.5,
            y1: 200.3,
            angle: 1.57,
            scale: 1.2,
            dx: 10.0,
            dy: 15.0
          },
          solution: {
            x2: 120.6,
            y2: 215.3
          }
        }
      };
      
      setTestResult(mockResult);
    } catch (error) {
      setTestResult({
        success: false,
        error: error.message
      });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Mock save - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      alert(language === 'bg' ? 'Шаблонът е запазен успешно!' : 'Template saved successfully!');
      
      // Redirect to templates list
      window.location.href = '/teacher/templates';
    } catch (error) {
      alert(language === 'bg' ? 'Грешка при запазване!' : 'Error saving template!');
    } finally {
      setIsSaving(false);
    }
  };

  const getDefaultGeneratorScript = (type) => {
    const scripts = {
      'coordinate-transformation': `// Generate coordinate transformation task
const x1 = Math.random() * 1000 - 500;
const y1 = Math.random() * 1000 - 500;
const angle = Math.random() * 2 * Math.PI;
const scale = 0.8 + Math.random() * 0.4;
const dx = Math.random() * 100 - 50;
const dy = Math.random() * 100 - 50;

return {
  input: {
    x1: Math.round(x1 * 100) / 100,
    y1: Math.round(y1 * 100) / 100,
    angle: Math.round(angle * 1000) / 1000,
    scale: Math.round(scale * 1000) / 1000,
    dx: Math.round(dx * 100) / 100,
    dy: Math.round(dy * 100) / 100
  },
  description: "Transform the given coordinates using the transformation parameters"
};`,
      'forward-intersection': `// Generate forward intersection task
const x1 = Math.random() * 1000 - 500;
const y1 = Math.random() * 1000 - 500;
const x2 = Math.random() * 1000 - 500;
const y2 = Math.random() * 1000 - 500;
const angle1 = Math.random() * Math.PI;
const angle2 = Math.random() * Math.PI;

return {
  input: {
    x1: Math.round(x1 * 100) / 100,
    y1: Math.round(y1 * 100) / 100,
    x2: Math.round(x2 * 100) / 100,
    y2: Math.round(y2 * 100) / 100,
    angle1: Math.round(angle1 * 1000) / 1000,
    angle2: Math.round(angle2 * 1000) / 1000
  },
  description: "Calculate the intersection point using forward intersection"
};`,
      'distance-calculation': `// Generate distance calculation task
const x1 = Math.random() * 1000 - 500;
const y1 = Math.random() * 1000 - 500;
const x2 = Math.random() * 1000 - 500;
const y2 = Math.random() * 1000 - 500;

return {
  input: {
    x1: Math.round(x1 * 100) / 100,
    y1: Math.round(y1 * 100) / 100,
    x2: Math.round(x2 * 100) / 100,
    y2: Math.round(y2 * 100) / 100
  },
  description: "Calculate the distance between the two points"
};`
    };
    return scripts[type] || scripts['coordinate-transformation'];
  };

  const getDefaultSolutionScript = (type) => {
    const scripts = {
      'coordinate-transformation': `// Solution for coordinate transformation
const { x1, y1, angle, scale, dx, dy } = inputData;

// Apply transformation
const cos = Math.cos(angle);
const sin = Math.sin(angle);

const x2 = x1 * scale * cos - y1 * scale * sin + dx;
const y2 = x1 * scale * sin + y1 * scale * cos + dy;

return {
  x2: Math.round(x2 * 100) / 100,
  y2: Math.round(y2 * 100) / 100
};`,
      'forward-intersection': `// Solution for forward intersection
const { x1, y1, x2, y2, angle1, angle2 } = inputData;

// Calculate intersection point
const tan1 = Math.tan(angle1);
const tan2 = Math.tan(angle2);

const x = (y2 - y1 + x1 * tan1 - x2 * tan2) / (tan1 - tan2);
const y = y1 + tan1 * (x - x1);

return {
  x: Math.round(x * 100) / 100,
  y: Math.round(y * 100) / 100
};`,
      'distance-calculation': `// Solution for distance calculation
const { x1, y1, x2, y2 } = inputData;

const distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));

return {
  distance: Math.round(distance * 100) / 100
};`
    };
    return scripts[type] || scripts['coordinate-transformation'];
  };

  useEffect(() => {
    if (formData.type && !formData.generatorScript) {
      setFormData(prev => ({
        ...prev,
        generatorScript: getDefaultGeneratorScript(formData.type)
      }));
    }
    if (formData.type && !formData.solutionScript) {
      setFormData(prev => ({
        ...prev,
        solutionScript: getDefaultSolutionScript(formData.type)
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.type]);

  return (
    <>
      <SEO
        title={language === 'bg' ? 'Редактор на шаблони' : 'Template Editor'}
        description={language === 'bg' ? 'Създавайте и редактирайте шаблони за задачи' : 'Create and edit task templates'}
        canonical="/teacher/templates/editor"
      />
      <Layout>
        <div className="w-full min-h-screen bg-stone-50 flex flex-col items-center py-8 px-2 md:px-0">
          <div className="w-full max-w-[1180px] flex flex-col gap-10">
            {/* Header */}
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-4">
                <Link 
                  to="/teacher/dashboard" 
                  className="px-3 py-2 bg-white rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 hover:bg-gray-50 transition-colors duration-200 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  <span className="text-sm text-neutral-600">{language === 'bg' ? 'Назад' : 'Back'}</span>
                </Link>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <TemplateIcon className="w-8 h-8 text-gray-600" />
                  </div>
                  <h1 className="text-black text-3xl font-bold font-['Manrope']">
                    {language === 'bg' ? 'Редактор на шаблони' : 'Template Editor'}
                  </h1>
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-gray-800 text-base font-medium">
                  {language === 'bg' 
                    ? 'Създавайте шаблони за задачи с JavaScript генератори и решения'
                    : 'Create task templates with JavaScript generators and solutions'
                  }
                </p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex flex-wrap gap-3">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-3 rounded-lg text-base font-medium font-['Manrope'] transition-all duration-200 flex items-center gap-2 ${
                      activeTab === tab.id
                        ? 'bg-gray-100 text-black border border-gray-300 shadow-sm'
                        : 'bg-white text-neutral-600 border border-gray-200 hover:bg-gray-50 hover:text-black hover:shadow-sm'
                    }`}
                  >
                    <IconComponent className="w-5 h-5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Tab Content */}
            <div className="flex flex-col gap-6">
              {activeTab === 'basic' && (
                <div className="p-6 bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200">
                  <h3 className="text-xl font-bold text-black mb-6">
                    {language === 'bg' ? 'Основни данни' : 'Basic Information'}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {language === 'bg' ? 'Име на шаблона' : 'Template Name'}
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={language === 'bg' ? 'Въведете име на шаблона' : 'Enter template name'}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {language === 'bg' ? 'Тип задача' : 'Task Type'}
                      </label>
                      <select
                        value={formData.type}
                        onChange={(e) => handleInputChange('type', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {taskTypes.map(type => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {language === 'bg' ? 'Трудност' : 'Difficulty'}
                      </label>
                      <select
                        value={formData.difficulty}
                        onChange={(e) => handleInputChange('difficulty', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {difficulties.map(diff => (
                          <option key={diff.value} value={diff.value}>{diff.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {language === 'bg' ? 'Ниво (1-10)' : 'Level (1-10)'}
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={formData.level}
                        onChange={(e) => handleInputChange('level', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {language === 'bg' ? 'Описание' : 'Description'}
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                        placeholder={language === 'bg' ? 'Описание на задачата' : 'Task description'}
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'generator' && (
                <div className="p-6 bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-black">
                      {language === 'bg' ? 'Генератор на данни' : 'Data Generator'}
                    </h3>
                    <button
                      onClick={handleTestGenerator}
                      disabled={isTesting || !formData.generatorScript}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isTesting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          {language === 'bg' ? 'Тестване...' : 'Testing...'}
                        </>
                      ) : (
                        <>
                          <PlayIcon className="w-4 h-4" />
                          {language === 'bg' ? 'Тествай' : 'Test'}
                        </>
                      )}
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {language === 'bg' ? 'JavaScript код за генериране' : 'JavaScript code for generation'}
                      </label>
                      <textarea
                        value={formData.generatorScript}
                        onChange={(e) => handleInputChange('generatorScript', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                        rows={15}
                        placeholder={language === 'bg' ? 'Въведете JavaScript код...' : 'Enter JavaScript code...'}
                      />
                    </div>
                    {testResult && (
                      <div className={`p-4 rounded-lg border ${
                        testResult.success 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-red-50 border-red-200'
                      }`}>
                        <h4 className="font-medium text-sm mb-2">
                          {testResult.success 
                            ? (language === 'bg' ? 'Резултат от теста:' : 'Test Result:')
                            : (language === 'bg' ? 'Грешка:' : 'Error:')
                          }
                        </h4>
                        {testResult.success ? (
                          <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                            {JSON.stringify(testResult.data, null, 2)}
                          </pre>
                        ) : (
                          <p className="text-sm text-red-600">{testResult.error}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'solution' && (
                <div className="p-6 bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200">
                  <h3 className="text-xl font-bold text-black mb-6">
                    {language === 'bg' ? 'Решение' : 'Solution'}
                  </h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'bg' ? 'JavaScript код за решение' : 'JavaScript code for solution'}
                    </label>
                    <textarea
                      value={formData.solutionScript}
                      onChange={(e) => handleInputChange('solutionScript', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                      rows={15}
                      placeholder={language === 'bg' ? 'Въведете JavaScript код за решение...' : 'Enter JavaScript code for solution...'}
                    />
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="p-6 bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200">
                  <h3 className="text-xl font-bold text-black mb-6">
                    {language === 'bg' ? 'Настройки за оценяване' : 'Grading Settings'}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {language === 'bg' ? 'Толеранс' : 'Tolerance'}
                      </label>
                      <input
                        type="number"
                        step="0.001"
                        value={formData.gradingSettings.tolerance}
                        onChange={(e) => handleInputChange('gradingSettings.tolerance', parseFloat(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {language === 'bg' ? 'Тип толеранс' : 'Tolerance Type'}
                      </label>
                      <select
                        value={formData.gradingSettings.toleranceType}
                        onChange={(e) => handleInputChange('gradingSettings.toleranceType', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="absolute">{language === 'bg' ? 'Абсолютен' : 'Absolute'}</option>
                        <option value="relative">{language === 'bg' ? 'Относителен' : 'Relative'}</option>
                        <option value="percentage">{language === 'bg' ? 'Процентен' : 'Percentage'}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {language === 'bg' ? 'Максимална оценка' : 'Maximum Score'}
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={formData.gradingSettings.maxScore}
                        onChange={(e) => handleInputChange('gradingSettings.maxScore', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="isPublic"
                        checked={formData.isPublic}
                        onChange={(e) => handleInputChange('isPublic', e.target.checked)}
                        className="mr-2"
                      />
                      <label htmlFor="isPublic" className="text-sm font-medium text-gray-700">
                        {language === 'bg' ? 'Публичен шаблон' : 'Public template'}
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center">
              <Link
                to="/teacher/dashboard"
                className="px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-sm font-medium"
              >
                {language === 'bg' ? 'Отказ' : 'Cancel'}
              </Link>
              <button
                onClick={handleSave}
                disabled={isSaving || !formData.name || !formData.generatorScript || !formData.solutionScript}
                className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-200 text-sm font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {language === 'bg' ? 'Запазване...' : 'Saving...'}
                  </>
                ) : (
                  <>
                    <SaveIcon className="w-4 h-4" />
                    {language === 'bg' ? 'Запази шаблон' : 'Save Template'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default TaskTemplateEditor;
