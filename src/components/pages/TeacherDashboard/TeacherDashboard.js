import React, { useState, useEffect } from 'react';
import Layout from '../../layout/Layout';
import SEO from '../../shared/SEO';
import { useTranslation } from '../../../hooks/useTranslation';
import { Link } from 'react-router-dom';
import { teacherApi, getRecentActivity } from '../../../services/teacherApi';

// Professional Icons Components
const DashboardIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
  </svg>
);

const StudentsIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
  </svg>
);

const AssignmentIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const AnalyticsIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const PlusIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
);

const ActivityIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const ClockIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CheckIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const TrendingUpIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

const TeacherDashboard = () => {
  const { language } = useTranslation();
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    totalClasses: 0,
    totalAssignments: 0,
    activeAssignments: 0,
    completedReviews: 0,
    averageScore: 0,
    pendingReviews: 0,
    thisWeekActivity: 0,
    classPerformance: {
      excellent: 0,
      good: 0,
      average: 0,
      needsImprovement: 0
    }
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [dashboardStats, activity] = await Promise.all([
          teacherApi.getDashboardStats(),
          getRecentActivity()
        ]);
        setStats(dashboardStats);
        setRecentActivity(activity);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Keep default values on error
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const assignments = [
    { id: 1, title: 'Първа основна задача - Тест 1', students: 24, dueDate: '2025-01-20', status: 'active' },
    { id: 2, title: 'Засечка напред - Практика', students: 24, dueDate: '2025-01-18', status: 'active' },
    { id: 3, title: 'Координатни трансформации', students: 24, dueDate: '2025-01-12', status: 'completed' },
  ];
  const activeClasses = [
    { id: 1, name: '11а Геодезия', year: '2025/2026', students: 24 },
    { id: 2, name: '12б Геодезия', year: '2025/2026', students: 18 },
    { id: 3, name: '10а Геодезия', year: '2025/2026', students: 26 },
  ];
  const recentReviews = recentActivity.slice(0, 4);
  const upcomingTests = assignments.filter(a => a.status === 'active');

  if (loading) {
    return (
      <Layout>
        <div className="w-full min-h-screen bg-stone-50 dark:bg-zinc-950 transition-colors flex items-center justify-center">
          <div className="text-center">
            <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 mb-4 animate-spin"></div>
            <p className="text-neutral-600 dark:text-zinc-400">
              {language === 'bg' ? 'Зареждане на панела...' : 'Loading dashboard...'}
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <>
      <SEO
        title="Учителски панел"
        description="Управлявайте вашите ученици, създавайте задания и проследявайте прогреса с GeoSolver учителския панел."
        keywords="учителски панел, геодезия, образование, задания, ученици, GeoSolver"
        canonical="/teacher/dashboard"
      />
      <Layout>
        <div className="w-full min-h-screen bg-stone-50 dark:bg-zinc-950 transition-colors">
          <div className="w-full max-w-[1180px] mx-auto px-4 lg:px-6 pt-6 lg:pt-16 pb-8 lg:pb-20 flex flex-col gap-8">
            
            <div className="flex flex-col lg:flex-row justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200">
                    <DashboardIcon className="w-7 h-7 text-gray-700" />
                  </div>
                  <h1 className="text-black dark:text-white text-3xl font-bold font-['Manrope']">
                    {language === 'bg' ? 'Учителски панел' : 'Teacher Dashboard'}
                  </h1>
                </div>
                <p className="text-neutral-600 dark:text-zinc-400 text-sm lg:text-base mt-3 max-w-xl">
                  {language === 'bg'
                    ? 'Център за управление на класове, тестове и проверка на резултати.'
                    : 'Manage classes, tests, and grading in one place.'}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="px-3 py-1 text-xs rounded-full bg-white dark:bg-zinc-900 border border-gray-200 text-neutral-600 dark:text-zinc-400">
                    {language === 'bg' ? 'Роля: Учител' : 'Role: Teacher'}
                  </span>
                  <span className="px-3 py-1 text-xs rounded-full bg-white dark:bg-zinc-900 border border-gray-200 text-neutral-600 dark:text-zinc-400">
                    {language === 'bg' ? 'Всички действия се логват' : 'All actions are logged'}
                  </span>
                  <span className="px-3 py-1 text-xs rounded-full bg-white dark:bg-zinc-900 border border-gray-200 text-neutral-600 dark:text-zinc-400">
                    {language === 'bg' ? 'Desktop и Mobile' : 'Desktop & Mobile'}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/teacher/create-assignment"
                  className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-200 text-sm font-medium"
                >
                  {language === 'bg' ? 'Създай тест' : 'Create Test'}
                </Link>
                <Link
                  to="/teacher/create-assignment"
                  className="px-4 py-2 bg-gray-200 dark:bg-zinc-700 text-black dark:text-white rounded-lg hover:bg-gray-300 transition-colors duration-200 text-sm font-medium"
                >
                  {language === 'bg' ? 'Генерирай задачи' : 'Generate Tasks'}
                </Link>
                <Link
                  to="/teacher/courses"
                  className="px-4 py-2 bg-gray-200 dark:bg-zinc-700 text-black dark:text-white rounded-lg hover:bg-gray-300 transition-colors duration-200 text-sm font-medium"
                >
                  {language === 'bg' ? 'Нов клас' : 'New Class'}
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <StudentsIcon className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="text-sm text-neutral-600 dark:text-zinc-400">{language === 'bg' ? 'Ученици' : 'Students'}</div>
                </div>
                <div className="text-2xl font-bold text-black dark:text-white mt-2">{stats.totalStudents}</div>
                <div className="text-xs text-neutral-500 dark:text-zinc-400">{stats.activeStudents} {language === 'bg' ? 'активни' : 'active'}</div>
              </div>
              <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <AssignmentIcon className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="text-sm text-neutral-600 dark:text-zinc-400">{language === 'bg' ? 'Активни тестове' : 'Active Tests'}</div>
                </div>
                <div className="text-2xl font-bold text-black dark:text-white mt-2">{stats.activeAssignments}</div>
                <div className="text-xs text-neutral-500 dark:text-zinc-400">{stats.totalAssignments} {language === 'bg' ? 'общо' : 'total'}</div>
              </div>
              <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <CheckIcon className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="text-sm text-neutral-600 dark:text-zinc-400">{language === 'bg' ? 'Предадени' : 'Submitted'}</div>
                </div>
                <div className="text-2xl font-bold text-black dark:text-white mt-2">{stats.completedReviews}</div>
                <div className="text-xs text-neutral-500 dark:text-zinc-400">{language === 'bg' ? 'Тази седмица' : 'This week'}: {stats.thisWeekActivity}</div>
              </div>
              <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <TrendingUpIcon className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="text-sm text-neutral-600 dark:text-zinc-400">{language === 'bg' ? 'Среден резултат' : 'Average Score'}</div>
                </div>
                <div className="text-2xl font-bold text-black dark:text-white mt-2">{stats.averageScore.toFixed(1)}</div>
                <div className="text-xs text-neutral-500 dark:text-zinc-400">{language === 'bg' ? 'По клас' : 'By class'}</div>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="p-6 bg-white dark:bg-zinc-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-800">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <StudentsIcon className="w-5 h-5 text-gray-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-black dark:text-white">
                        {language === 'bg' ? 'Активни класове' : 'Active Classes'}
                      </h3>
                    </div>
                    <div className="space-y-3">
                      {activeClasses.map(cls => (
                        <div key={cls.id} className="flex justify-between items-center p-3 rounded-lg border border-gray-100 bg-stone-50">
                          <div>
                            <div className="text-sm font-semibold text-black dark:text-white">{cls.name}</div>
                            <div className="text-xs text-neutral-500 dark:text-zinc-400">{cls.year}</div>
                          </div>
                          <div className="text-xs text-neutral-500 dark:text-zinc-400">{cls.students} {language === 'bg' ? 'ученици' : 'students'}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="p-6 bg-white dark:bg-zinc-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-800">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <ClockIcon className="w-5 h-5 text-gray-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-black dark:text-white">
                        {language === 'bg' ? 'Предстоящи тестове' : 'Upcoming Tests'}
                      </h3>
                    </div>
                    <div className="space-y-3">
                      {upcomingTests.map(test => (
                        <div key={test.id} className="flex justify-between items-center p-3 rounded-lg border border-gray-100 bg-stone-50">
                          <div className="text-sm font-semibold text-black dark:text-white">{test.title}</div>
                          <div className="text-xs text-neutral-500 dark:text-zinc-400">{test.dueDate}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="p-6 bg-white dark:bg-zinc-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-800">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <AnalyticsIcon className="w-5 h-5 text-gray-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-black dark:text-white">
                      {language === 'bg' ? 'Статистика' : 'Statistics'}
                    </h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-stone-50">
                      <div className="text-xs text-neutral-500 dark:text-zinc-400">{language === 'bg' ? 'Среден резултат по клас' : 'Avg score per class'}</div>
                      <div className="text-sm font-semibold text-black dark:text-white">{stats.averageScore.toFixed(1)}</div>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-stone-50">
                      <div className="text-xs text-neutral-500 dark:text-zinc-400">{language === 'bg' ? 'Брой предадени тестове' : 'Submitted tests'}</div>
                      <div className="text-sm font-semibold text-black dark:text-white">{stats.completedReviews}</div>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-stone-50">
                      <div className="text-xs text-neutral-500 dark:text-zinc-400">{language === 'bg' ? 'Най-грешени задачи' : 'Most missed tasks'}</div>
                      <div className="text-sm font-semibold text-black dark:text-white">{language === 'bg' ? 'Първа основна задача' : 'First Basic Task'}</div>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-stone-50">
                      <div className="text-xs text-neutral-500 dark:text-zinc-400">{language === 'bg' ? 'Активни класове' : 'Active classes'}</div>
                      <div className="text-sm font-semibold text-black dark:text-white">{stats.totalClasses}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="p-6 bg-white dark:bg-zinc-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-800">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <ActivityIcon className="w-5 h-5 text-gray-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-black dark:text-white">
                      {language === 'bg' ? 'Последни проверени работи' : 'Recently Graded'}
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {recentReviews.length > 0 ? recentReviews.map((activity, index) => (
                      <div key={activity.id || index} className="flex justify-between items-center p-3 rounded-lg border border-gray-100 bg-stone-50">
                        <div>
                          <div className="text-sm font-semibold text-black dark:text-white">
                            {activity.student || activity.studentName || (language === 'bg' ? 'Проверена работа' : 'Graded work')}
                          </div>
                          <div className="text-xs text-neutral-500 dark:text-zinc-400">
                            {activity.task || activity.title || (language === 'bg' ? 'Тест' : 'Test')}
                          </div>
                        </div>
                        <div className="text-sm font-semibold text-black dark:text-white">{activity.score ?? activity.grade ?? '-'}</div>
                      </div>
                    )) : (
                      <div className="text-center py-6 text-neutral-500 dark:text-zinc-400 text-sm">
                        {language === 'bg' ? 'Няма проверени работи.' : 'No graded work yet.'}
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-6 bg-white dark:bg-zinc-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-800">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <PlusIcon className="w-5 h-5 text-gray-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-black dark:text-white">
                      {language === 'bg' ? 'Бързи действия' : 'Quick Actions'}
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Link to="/teacher/create-assignment" className="p-4 rounded-lg border border-gray-100 bg-stone-50 hover:bg-stone-100 transition-colors duration-200">
                      <div className="text-sm font-semibold text-black dark:text-white">{language === 'bg' ? 'Създай тест' : 'Create Test'}</div>
                      <div className="text-xs text-neutral-500 dark:text-zinc-400 mt-1">{language === 'bg' ? 'Контролно по параметри' : 'Build with settings'}</div>
                    </Link>
                    <Link to="/teacher/create-assignment" className="p-4 rounded-lg border border-gray-100 bg-stone-50 hover:bg-stone-100 transition-colors duration-200">
                      <div className="text-sm font-semibold text-black dark:text-white">{language === 'bg' ? 'Генерирай задачи' : 'Generate Tasks'}</div>
                      <div className="text-xs text-neutral-500 dark:text-zinc-400 mt-1">{language === 'bg' ? 'Автоматично генериране' : 'Auto generation'}</div>
                    </Link>
                    <Link to="/teacher/scan-submissions" className="p-4 rounded-lg border border-gray-100 bg-stone-50 hover:bg-stone-100 transition-colors duration-200">
                      <div className="text-sm font-semibold text-black dark:text-white">{language === 'bg' ? 'OCR проверки' : 'OCR Checks'}</div>
                      <div className="text-xs text-neutral-500 dark:text-zinc-400 mt-1">{language === 'bg' ? 'Сканирай решения' : 'Scan submissions'}</div>
                    </Link>
                    <Link to="/teacher/courses" className="p-4 rounded-lg border border-gray-100 bg-stone-50 hover:bg-stone-100 transition-colors duration-200">
                      <div className="text-sm font-semibold text-black dark:text-white">{language === 'bg' ? 'Управление на класове' : 'Class Management'}</div>
                      <div className="text-xs text-neutral-500 dark:text-zinc-400 mt-1">{language === 'bg' ? 'Създай и архивирай' : 'Create and archive'}</div>
                    </Link>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default TeacherDashboard;
