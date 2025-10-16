import React, { useState } from 'react';
import Layout from '../../layout/Layout';
import { Helmet } from 'react-helmet';
import { useTranslation } from '../../../hooks/useTranslation';
import { Link } from 'react-router-dom';

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
      icon: '📐',
      parameters: ['coordinateA', 'coordinateB', 'distance', 'angle']
    },
    {
      id: 'second-task',
      name: language === 'bg' ? 'Втора основна задача' : 'Second Basic Task',
      description: language === 'bg' ? 'Обратна засечка' : 'Reverse intersection',
      icon: '📏',
      parameters: ['point1', 'point2', 'point3', 'angle1', 'angle2']
    },
    {
      id: 'forward-intersection',
      name: language === 'bg' ? 'Засечка напред' : 'Forward Intersection',
      description: language === 'bg' ? 'Пряка засечка' : 'Direct intersection',
      icon: '🎯',
      parameters: ['base1', 'base2', 'angle1', 'angle2']
    },
    {
      id: 'resection',
      name: language === 'bg' ? 'Засечка назад' : 'Resection',
      description: language === 'bg' ? 'Обратна засечка' : 'Back intersection',
      icon: '📍',
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
      <Helmet>
        <title>GeoSolver – {language === 'bg' ? 'Генератор на задачи' : 'Task Generator'}</title>
        <meta name="description" content={language === 'bg' ? 'Създаване на геодезически задачи за ученици' : 'Create geodesy tasks for students'} />
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
                  {language === 'bg' ? 'Генератор на задачи' : 'Task Generator'}
                </h1>
              </div>
              <p className="text-neutral-600 text-base">
                {language === 'bg' 
                  ? 'Създайте персонализирани геодезически задачи за вашите ученици'
                  : 'Create personalized geodesy tasks for your students'
                }
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Task Type Selection */}
              <div className="p-6 bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200">
                <h2 className="text-xl font-bold text-black mb-6">
                  {language === 'bg' ? 'Тип задача' : 'Task Type'}
                </h2>
                <div className="space-y-3">
                  {taskTypes.map((task) => (
                    <button
                      key={task.id}
                      onClick={() => setSelectedTaskType(task.id)}
                      className={`w-full p-4 rounded-lg text-left transition-colors duration-200 ${
                        selectedTaskType === task.id
                          ? 'bg-gray-200 border border-gray-300'
                          : 'bg-stone-50 border border-gray-200 hover:bg-stone-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{task.icon}</span>
                        <div>
                          <div className="text-base font-semibold text-black">
                            {task.name}
                          </div>
                          <div className="text-sm text-neutral-600">
                            {task.description}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Task Configuration */}
              <div className="p-6 bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200">
                <h2 className="text-xl font-bold text-black mb-6">
                  {language === 'bg' ? 'Конфигурация на задачата' : 'Task Configuration'}
                </h2>
                  
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
                      <div className="p-4 bg-stone-50 rounded-lg border border-gray-200">
                        <h3 className="text-lg font-semibold text-black mb-3">
                          {language === 'bg' ? 'Преглед на задачата' : 'Task Preview'}
                        </h3>
                        <div className="space-y-2 text-sm text-neutral-700">
                          <div><strong>{language === 'bg' ? 'Тип:' : 'Type:'}</strong> {selectedTask.name}</div>
                          <div><strong>{language === 'bg' ? 'Трудност:' : 'Difficulty:'}</strong> {difficultyLevels.find(d => d.value === taskParameters.difficulty)?.label}</div>
                          <div><strong>{language === 'bg' ? 'Брой:' : 'Count:'}</strong> {taskParameters.count}</div>
                          {taskParameters.dueDate && (
                            <div><strong>{language === 'bg' ? 'Краен срок:' : 'Due:'}</strong> {new Date(taskParameters.dueDate).toLocaleString()}</div>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        <button
                          onClick={handleGenerateTask}
                          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 text-sm font-medium flex items-center gap-2"
                        >
                          {language === 'bg' ? 'Генерирай задачи' : 'Generate Tasks'}
                          <span>→</span>
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
                          className="px-4 py-2 bg-gray-200 text-black rounded-lg hover:bg-gray-300 transition-colors duration-200 text-sm font-medium"
                        >
                          {language === 'bg' ? 'Нулирай' : 'Reset'}
                        </button>
                        <Link
                          to="/teacher/dashboard"
                          className="px-4 py-2 bg-white text-black border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-sm font-medium"
                        >
                          {language === 'bg' ? 'Отказ' : 'Cancel'}
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">📝</div>
                      <h3 className="text-lg font-semibold text-black mb-2">
                        {language === 'bg' ? 'Изберете тип задача' : 'Select a Task Type'}
                      </h3>
                      <p className="text-neutral-600">
                        {language === 'bg' 
                          ? 'Изберете типа геодезическа задача, която искате да създадете'
                          : 'Choose the type of geodesy task you want to create'
                        }
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Generated Tasks Results */}
            <div className="p-6 bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200">
              <h2 className="text-xl font-bold text-black mb-6">
                {language === 'bg' ? 'Генерирани задачи' : 'Generated Tasks'}
              </h2>
              <div className="bg-stone-50 rounded-lg p-6 border border-gray-200 min-h-[200px] flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-4">📋</div>
                  <p className="text-neutral-600 text-base">
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
