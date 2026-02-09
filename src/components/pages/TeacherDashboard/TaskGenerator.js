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
  const { language } = useTranslation();
  const [selectedTaskType, setSelectedTaskType] = useState('');
  const [taskParameters, setTaskParameters] = useState({
    difficulty: 'medium',
    count: 5,
    y1Min: 1000,
    y1Max: 5000,
    x1Min: 1000,
    x1Max: 5000,
    alphaMin: 0,
    alphaMax: 400,
    sMin: 50,
    sMax: 500,
    dueDate: '',
    description: '',
    instructions: ''
  });
  const [generatedTasks, setGeneratedTasks] = useState([]);

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

  const formatNumber = (value, decimals) => {
    const fixed = Number(value).toFixed(decimals);
    return language === 'bg' ? fixed.replace('.', ',') : fixed;
  };

  const toNumber = (value, fallback) => {
    const num = Number(value);
    return Number.isFinite(num) ? num : fallback;
  };

  const randomBetween = (min, max) => {
    const lo = Math.min(min, max);
    const hi = Math.max(min, max);
    return lo + Math.random() * (hi - lo);
  };

  const handleGenerateTask = () => {
    if (selectedTaskType !== 'first-task') {
      setGeneratedTasks([]);
      return;
    }
    const count = Math.max(1, Math.min(50, toNumber(taskParameters.count, 5)));
    const y1Min = toNumber(taskParameters.y1Min, 1000);
    const y1Max = toNumber(taskParameters.y1Max, 5000);
    const x1Min = toNumber(taskParameters.x1Min, 1000);
    const x1Max = toNumber(taskParameters.x1Max, 5000);
    const alphaMin = toNumber(taskParameters.alphaMin, 0);
    const alphaMax = toNumber(taskParameters.alphaMax, 400);
    const sMin = toNumber(taskParameters.sMin, 50);
    const sMax = toNumber(taskParameters.sMax, 500);

    const tasks = Array.from({ length: count }, (_, i) => {
      const y1 = randomBetween(y1Min, y1Max);
      const x1 = randomBetween(x1Min, x1Max);
      const alpha = randomBetween(alphaMin, alphaMax);
      const s = randomBetween(sMin, sMax);
      return {
        id: i + 1,
        y1: Number(y1.toFixed(2)),
        x1: Number(x1.toFixed(2)),
        alpha: Number(alpha.toFixed(4)),
        s: Number(s.toFixed(2))
      };
    });
    setGeneratedTasks(tasks);
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
          <div className="w-full max-w-[1180px] flex flex-col gap-8">
            <div className="flex items-center gap-4">
              <Link to="/teacher/dashboard" className="px-3 py-2 bg-white rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="text-sm text-neutral-600">{language === 'bg' ? 'Назад' : 'Back'}</span>
              </Link>
              <h1 className="text-black text-3xl font-bold font-['Manrope']">
                {language === 'bg' ? 'Генериране на задачи' : 'Task Generation'}
              </h1>
            </div>

            <div className="self-stretch inline-flex justify-start items-start gap-5">
              <div className="w-96 inline-flex flex-col justify-center items-center gap-5">
                <div className="self-stretch p-4 bg-white rounded-xl shadow-[0px_8px_24px_0px_rgba(0,0,0,0.04)] outline outline-1 outline-offset-[-0.50px] outline-gray-200 flex flex-col justify-start items-start gap-4 overflow-hidden">
                  <div className="self-stretch justify-start text-black text-lg font-semibold font-['Manrope']">
                    {language === 'bg' ? 'Входни данни' : 'Input Data'}
                  </div>
                  <div className="self-stretch flex flex-col gap-4">
                    <div>
                      <div className="text-black text-sm font-medium font-['Manrope'] mb-2">
                        {language === 'bg' ? 'Тип задача' : 'Task type'}
                      </div>
                      <select
                        value={selectedTaskType}
                        onChange={(e) => setSelectedTaskType(e.target.value)}
                        className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
                      >
                        <option value="">{language === 'bg' ? 'Изберете' : 'Select'}</option>
                        {taskTypes.map(task => (
                          <option key={task.id} value={task.id}>
                            {task.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <div className="text-black text-sm font-medium font-['Manrope'] mb-2">
                        {language === 'bg' ? 'Брой задачи' : 'Number of tasks'}
                      </div>
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={taskParameters.count}
                        onChange={(e) => handleParameterChange('count', e.target.value)}
                        className="w-full p-3 bg-white border border-gray-200 rounded-lg"
                      />
                    </div>

                    <div>
                      <div className="text-black text-sm font-medium font-['Manrope'] mb-2">
                        {language === 'bg' ? 'Y1 диапазон (м)' : 'Y1 range (m)'}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={taskParameters.y1Min}
                          onChange={(e) => handleParameterChange('y1Min', e.target.value)}
                          className="w-full p-3 bg-white border border-gray-200 rounded-lg"
                        />
                        <input
                          type="number"
                          value={taskParameters.y1Max}
                          onChange={(e) => handleParameterChange('y1Max', e.target.value)}
                          className="w-full p-3 bg-white border border-gray-200 rounded-lg"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="text-black text-sm font-medium font-['Manrope'] mb-2">
                        {language === 'bg' ? 'X1 диапазон (м)' : 'X1 range (m)'}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={taskParameters.x1Min}
                          onChange={(e) => handleParameterChange('x1Min', e.target.value)}
                          className="w-full p-3 bg-white border border-gray-200 rounded-lg"
                        />
                        <input
                          type="number"
                          value={taskParameters.x1Max}
                          onChange={(e) => handleParameterChange('x1Max', e.target.value)}
                          className="w-full p-3 bg-white border border-gray-200 rounded-lg"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="text-black text-sm font-medium font-['Manrope'] mb-2">
                        {language === 'bg' ? 'α диапазон (gon)' : 'α range (gon)'}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={taskParameters.alphaMin}
                          onChange={(e) => handleParameterChange('alphaMin', e.target.value)}
                          className="w-full p-3 bg-white border border-gray-200 rounded-lg"
                        />
                        <input
                          type="number"
                          value={taskParameters.alphaMax}
                          onChange={(e) => handleParameterChange('alphaMax', e.target.value)}
                          className="w-full p-3 bg-white border border-gray-200 rounded-lg"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="text-black text-sm font-medium font-['Manrope'] mb-2">
                        {language === 'bg' ? 'S диапазон (м)' : 'S range (m)'}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={taskParameters.sMin}
                          onChange={(e) => handleParameterChange('sMin', e.target.value)}
                          className="w-full p-3 bg-white border border-gray-200 rounded-lg"
                        />
                        <input
                          type="number"
                          value={taskParameters.sMax}
                          onChange={(e) => handleParameterChange('sMax', e.target.value)}
                          className="w-full p-3 bg-white border border-gray-200 rounded-lg"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="inline-flex justify-end items-center gap-3 w-full">
                    <button
                      type="button"
                      onClick={handleGenerateTask}
                      className="px-4 py-2 bg-black rounded-lg flex justify-start items-center gap-3"
                    >
                      <div className="justify-start text-white text-sm font-medium font-['Manrope']">
                        {language === 'bg' ? 'Генерирай' : 'Generate'}
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setGeneratedTasks([]);
                        setTaskParameters(prev => ({ ...prev, count: 5 }));
                      }}
                      className="px-4 py-2 bg-gray-200 rounded-lg flex justify-start items-center gap-3"
                    >
                      <div className="justify-start text-black text-sm font-medium font-['Manrope']">
                        {language === 'bg' ? 'Нулирай' : 'Reset'}
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex-1 self-stretch p-4 bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex flex-col justify-center items-end gap-3">
                <div className="self-stretch justify-start text-black text-lg font-semibold font-['Manrope']">
                  {language === 'bg' ? 'Резултати' : 'Results'}
                </div>
                <div className="self-stretch flex-1 p-3 bg-stone-50 rounded-lg flex flex-col justify-start items-start">
                  {generatedTasks.length === 0 ? (
                    <div className="text-neutral-400 text-sm font-medium font-['Manrope']">
                      {language === 'bg' ? 'Натиснете "Генерирай", за да видите резултатите.' : 'Click "Generate" to see results.'}
                    </div>
                  ) : (
                    <div className="w-full text-neutral-700 text-sm font-medium font-['Manrope'] space-y-2">
                      {generatedTasks.map((task) => (
                        <div key={task.id} className="flex justify-between border-b border-gray-200 pb-2">
                          <div>Y1={formatNumber(task.y1, 2)}, X1={formatNumber(task.x1, 2)}</div>
                          <div>α={formatNumber(task.alpha, 4)} gon, S={formatNumber(task.s, 2)} m</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default TaskGenerator;
