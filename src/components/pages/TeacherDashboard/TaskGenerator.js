import React, { useState } from 'react';
import Layout from '../../layout/Layout';
import SEO from '../../shared/SEO';
import { useTranslation } from '../../../hooks/useTranslation';
import { Link } from 'react-router-dom';

// Professional Icons Components
const TaskIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const CoordinateIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
  </svg>
);

const IntersectionIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const ResectionIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const SettingsIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const PreviewIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const GenerateIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const ResetIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const CancelIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const TaskGenerator = () => {
  const { t, language } = useTranslation();
  const [selectedTaskType, setSelectedTaskType] = useState('');
  const [taskParameters, setTaskParameters] = useState({
    difficulty: 'medium',
    count: 1,
    dueDate: '',
    description: '',
    instructions: ''
  });

  const taskTypes = [
    {
      id: 'first-task',
      name: language === 'bg' ? 'Първа основна задача' : 'First Basic Task',
      description: language === 'bg' ? 'Координатни изчисления' : 'Coordinate calculations',
      icon: CoordinateIcon,
      color: 'blue',
      parameters: ['coordinateA', 'coordinateB', 'distance', 'angle']
    },
    {
      id: 'second-task',
      name: language === 'bg' ? 'Втора основна задача' : 'Second Basic Task',
      description: language === 'bg' ? 'Обратна засечка' : 'Reverse intersection',
      icon: IntersectionIcon,
      color: 'green',
      parameters: ['point1', 'point2', 'point3', 'angle1', 'angle2']
    },
    {
      id: 'forward-intersection',
      name: language === 'bg' ? 'Засечка напред' : 'Forward Intersection',
      description: language === 'bg' ? 'Пряка засечка' : 'Direct intersection',
      icon: IntersectionIcon,
      color: 'purple',
      parameters: ['base1', 'base2', 'angle1', 'angle2']
    },
    {
      id: 'resection',
      name: language === 'bg' ? 'Засечка назад' : 'Resection',
      description: language === 'bg' ? 'Обратна засечка' : 'Back intersection',
      icon: ResectionIcon,
      color: 'orange',
      parameters: ['point1', 'point2', 'point3', 'angle1', 'angle2', 'angle3']
    }
  ];

  const difficultyLevels = [
    { value: 'easy', label: language === 'bg' ? 'Лесно' : 'Easy' },
    { value: 'medium', label: language === 'bg' ? 'Средно' : 'Medium' },
    { value: 'hard', label: language === 'bg' ? 'Трудно' : 'Hard' }
  ];

  const handleParameterChange = (param, value) => {
    setTaskParameters(prev => ({
      ...prev,
      [param]: value
    }));
  };

  const handleGenerateTask = () => {
    // TODO: Implement task generation logic
    console.log('Generating task:', {
      type: selectedTaskType,
      parameters: taskParameters
    });
  };

  const selectedTask = taskTypes.find(task => task.id === selectedTaskType);

  return (
    <>
      <SEO
        title={language === 'bg' ? 'Генератор на задачи' : 'Task Generator'}
        description={language === 'bg' ? 'Създаване на геодезически задачи за ученици' : 'Create geodesy tasks for students'}
        canonical="/teacher/tasks"
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
                    <TaskIcon className="w-8 h-8 text-gray-600" />
                  </div>
                  <h1 className="text-black text-3xl font-bold font-['Manrope']">
                    {language === 'bg' ? 'Генератор на задачи' : 'Task Generator'}
                  </h1>
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-gray-800 text-base font-medium">
                  {language === 'bg' 
                    ? 'Създайте персонализирани геодезически задачи за вашите ученици с автоматизирани параметри и настройки'
                    : 'Create personalized geodesy tasks for your students with automated parameters and settings'
                  }
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Task Type Selection */}
              <div className="p-6 bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <SettingsIcon className="w-6 h-6 text-gray-600" />
                  </div>
                  <h2 className="text-xl font-bold text-black">
                    {language === 'bg' ? 'Тип задача' : 'Task Type'}
                  </h2>
                </div>
                <div className="space-y-3">
                  {taskTypes.map((task) => {
                    const IconComponent = task.icon;
                    const colorClasses = {
                      blue: 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-800',
                      green: 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-800',
                      purple: 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-800',
                      orange: 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-800'
                    };
                    const selectedColorClasses = {
                      blue: 'bg-gray-100 border-gray-300 text-gray-900',
                      green: 'bg-gray-100 border-gray-300 text-gray-900',
                      purple: 'bg-gray-100 border-gray-300 text-gray-900',
                      orange: 'bg-gray-100 border-gray-300 text-gray-900'
                    };
                    
                    return (
                      <button
                        key={task.id}
                        onClick={() => setSelectedTaskType(task.id)}
                        className={`w-full p-4 rounded-lg text-left transition-all duration-200 border ${
                          selectedTaskType === task.id
                            ? selectedColorClasses[task.color]
                            : colorClasses[task.color]
                        } hover:shadow-md`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                            selectedTaskType === task.id 
                              ? 'bg-white shadow-sm' 
                              : 'bg-white/50'
                          }`}>
                            <IconComponent className="w-6 h-6" />
                          </div>
                          <div className="flex-1">
                            <div className="text-base font-semibold">
                              {task.name}
                            </div>
                            <div className="text-sm opacity-80">
                              {task.description}
                            </div>
                          </div>
                          {selectedTaskType === task.id && (
                            <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Task Configuration */}
              <div className="p-6 bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <SettingsIcon className="w-6 h-6 text-gray-600" />
                  </div>
                  <h2 className="text-xl font-bold text-black">
                    {language === 'bg' ? 'Конфигурация на задачата' : 'Task Configuration'}
                  </h2>
                </div>
                  
                  {selectedTask ? (
                    <div className="space-y-6">
                      {/* Basic Settings */}
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-black mb-2">
                            {language === 'bg' ? 'Трудност' : 'Difficulty'}
                          </label>
                          <select
                            value={taskParameters.difficulty}
                            onChange={(e) => handleParameterChange('difficulty', e.target.value)}
                            className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
                          >
                            {difficultyLevels.map((level) => (
                              <option key={level.value} value={level.value}>
                                {level.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-black mb-2">
                            {language === 'bg' ? 'Брой задачи' : 'Number of Tasks'}
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="10"
                            value={taskParameters.count}
                            onChange={(e) => handleParameterChange('count', parseInt(e.target.value))}
                            placeholder={language === 'bg' ? 'Въведете брой задачи' : 'Enter number of tasks'}
                            className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-black mb-2">
                            {language === 'bg' ? 'Краен срок' : 'Due Date'}
                          </label>
                          <input
                            type="datetime-local"
                            value={taskParameters.dueDate}
                            onChange={(e) => handleParameterChange('dueDate', e.target.value)}
                            className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-black mb-2">
                            {language === 'bg' ? 'Описание' : 'Description'}
                          </label>
                          <textarea
                            value={taskParameters.description}
                            onChange={(e) => handleParameterChange('description', e.target.value)}
                            placeholder={language === 'bg' ? 'Въведете описание на задачата' : 'Enter task description'}
                            rows="3"
                            className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-black mb-2">
                            {language === 'bg' ? 'Инструкции' : 'Instructions'}
                          </label>
                          <textarea
                            value={taskParameters.instructions}
                            onChange={(e) => handleParameterChange('instructions', e.target.value)}
                            placeholder={language === 'bg' ? 'Въведете инструкции за учениците' : 'Enter instructions for students'}
                            rows="4"
                            className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
                          />
                        </div>
                      </div>

                      {/* Task Preview */}
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-gray-100 rounded-lg">
                            <PreviewIcon className="w-5 h-5 text-gray-600" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {language === 'bg' ? 'Преглед на задачата' : 'Task Preview'}
                          </h3>
                        </div>
                        <div className="space-y-3 text-sm">
                          <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100">
                            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                              <TaskIcon className="w-4 h-4 text-gray-600" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{language === 'bg' ? 'Тип:' : 'Type:'}</div>
                              <div className="text-gray-700">{selectedTask.name}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100">
                            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{language === 'bg' ? 'Трудност:' : 'Difficulty:'}</div>
                              <div className="text-gray-700">{difficultyLevels.find(d => d.value === taskParameters.difficulty)?.label}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100">
                            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                              </svg>
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{language === 'bg' ? 'Брой:' : 'Count:'}</div>
                              <div className="text-gray-700">{taskParameters.count} {language === 'bg' ? 'задачи' : 'tasks'}</div>
                            </div>
                          </div>
                          {taskParameters.dueDate && (
                            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100">
                              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">{language === 'bg' ? 'Краен срок:' : 'Due:'}</div>
                                <div className="text-gray-700">{new Date(taskParameters.dueDate).toLocaleString()}</div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        <button
                          onClick={handleGenerateTask}
                          className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 text-sm font-medium flex items-center gap-2 shadow-md hover:shadow-lg"
                        >
                          <GenerateIcon className="w-4 h-4" />
                          {language === 'bg' ? 'Генерирай задачи' : 'Generate Tasks'}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedTaskType('');
                            setTaskParameters({
                              difficulty: 'medium',
                              count: 1,
                              dueDate: '',
                              description: '',
                              instructions: ''
                            });
                          }}
                          className="px-6 py-3 bg-gray-200 text-black rounded-lg hover:bg-gray-300 transition-colors duration-200 text-sm font-medium flex items-center gap-2"
                        >
                          <ResetIcon className="w-4 h-4" />
                          {language === 'bg' ? 'Нулирай' : 'Reset'}
                        </button>
                        <Link
                          to="/teacher/dashboard"
                          className="px-6 py-3 bg-white text-black border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-sm font-medium flex items-center gap-2"
                        >
                          <CancelIcon className="w-4 h-4" />
                          {language === 'bg' ? 'Отказ' : 'Cancel'}
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <TaskIcon className="w-10 h-10 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-black mb-3">
                        {language === 'bg' ? 'Изберете тип задача' : 'Select a Task Type'}
                      </h3>
                      <p className="text-neutral-600 max-w-md mx-auto">
                        {language === 'bg' 
                          ? 'Изберете типа геодезическа задача, която искате да създадете от панела вляво'
                          : 'Choose the type of geodesy task you want to create from the panel on the left'
                        }
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Generated Tasks Results */}
            <div className="p-6 bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-black">
                  {language === 'bg' ? 'Генерирани задачи' : 'Generated Tasks'}
                </h2>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-8 border border-green-200 min-h-[200px] flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-green-900 mb-2">
                    {language === 'bg' ? 'Готови за генериране' : 'Ready to Generate'}
                  </h3>
                  <p className="text-green-700 text-base max-w-md">
                    {language === 'bg' 
                      ? 'Изберете тип задача и натиснете "Генерирай задачи", за да видите резултатите тук.'
                      : 'Select a task type and click "Generate Tasks" to see results here.'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
      </Layout>
    </>
  );
};

export default TaskGenerator;
