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
  const [activeTab, setActiveTab] = useState('overview');
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

  const tabs = [
    { id: 'overview', label: language === 'bg' ? 'Преглед' : 'Overview', icon: DashboardIcon },
    { id: 'assignments', label: language === 'bg' ? 'Задания' : 'Assignments', icon: AssignmentIcon },
    { id: 'students', label: language === 'bg' ? 'Ученици' : 'Students', icon: StudentsIcon },
    { id: 'analytics', label: language === 'bg' ? 'Анализ' : 'Analytics', icon: AnalyticsIcon },
  ];

  if (loading) {
    return (
      <Layout>
        <div className="w-full min-h-screen bg-stone-50 flex items-center justify-center">
          <div className="text-center">
            <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 mb-4 animate-spin"></div>
            <p className="text-neutral-600">
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
        <div className="w-full min-h-screen bg-stone-50">
          <div className="w-full max-w-[1180px] mx-auto px-4 lg:px-6 pt-6 lg:pt-20 pb-6 lg:pb-20 flex flex-col gap-6 lg:gap-10">
            
            {/* Header */}
            <div className="flex flex-col gap-6">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div>
                  <h1 className="text-black text-2xl lg:text-3xl font-bold font-['Manrope'] flex items-center gap-3">
                    <DashboardIcon className="w-8 h-8 text-gray-600" />
                    {language === 'bg' ? 'Учителски панел' : 'Teacher Dashboard'}
                  </h1>
                  <p className="text-neutral-600 text-sm lg:text-base mt-2">
                    {language === 'bg' ? 'Център за управление на обучението и проследяване на прогреса' : 'Center for learning management and progress tracking'}
                  </p>
                </div>
                <div className="flex gap-3">
                  <Link
                    to="/teacher/scan-submissions"
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 text-sm font-medium flex items-center gap-2"
                  >
                    <ActivityIcon className="w-4 h-4" />
                    {language === 'bg' ? 'Сканирай решения' : 'Scan Solutions'}
                  </Link>
                  <Link
                    to="/teacher/create-assignment"
                    className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-200 text-sm font-medium flex items-center gap-2"
                  >
                    <PlusIcon className="w-4 h-4" />
                    {language === 'bg' ? 'Създай задание' : 'Create Assignment'}
                  </Link>
                </div>
              </div>

              {/* Enhanced Stats Overview */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-6 bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 hover:shadow-lg transition-shadow duration-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <StudentsIcon className="w-6 h-6 text-gray-600" />
                    </div>
                    <span className="text-xs text-gray-500 font-medium flex items-center gap-1">
                      <TrendingUpIcon className="w-3 h-3" />
                      +12%
                    </span>
                  </div>
                  <div className="text-3xl font-bold text-black mb-1">{stats.totalStudents}</div>
                  <div className="text-sm text-neutral-600 font-medium">{language === 'bg' ? 'Общо ученици' : 'Total Students'}</div>
                  <div className="text-xs text-neutral-500 mt-1">{stats.activeStudents} {language === 'bg' ? 'активни' : 'active'}</div>
                </div>
                
                <div className="p-6 bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 hover:shadow-lg transition-shadow duration-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <AssignmentIcon className="w-6 h-6 text-gray-600" />
                    </div>
                    <span className="text-xs text-gray-500 font-medium flex items-center gap-1">
                      <ClockIcon className="w-3 h-3" />
                      {stats.pendingReviews} {language === 'bg' ? 'чакащи' : 'pending'}
                    </span>
                  </div>
                  <div className="text-3xl font-bold text-black mb-1">{stats.activeAssignments}</div>
                  <div className="text-sm text-neutral-600 font-medium">{language === 'bg' ? 'Активни задания' : 'Active Assignments'}</div>
                  <div className="text-xs text-neutral-500 mt-1">{stats.totalAssignments} {language === 'bg' ? 'общо' : 'total'}</div>
                </div>
                
                <div className="p-6 bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 hover:shadow-lg transition-shadow duration-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <CheckIcon className="w-6 h-6 text-gray-600" />
                    </div>
                    <span className="text-xs text-gray-500 font-medium flex items-center gap-1">
                      <ActivityIcon className="w-3 h-3" />
                      {stats.thisWeekActivity} {language === 'bg' ? 'тази седмица' : 'this week'}
                    </span>
                  </div>
                  <div className="text-3xl font-bold text-black mb-1">{stats.completedReviews}</div>
                  <div className="text-sm text-neutral-600 font-medium">{language === 'bg' ? 'Проверени задачи' : 'Graded Tasks'}</div>
                  <div className="text-xs text-neutral-500 mt-1">{language === 'bg' ? 'Завършени прегледи' : 'Completed reviews'}</div>
                </div>
                
                <div className="p-6 bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 hover:shadow-lg transition-shadow duration-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <AnalyticsIcon className="w-6 h-6 text-gray-600" />
                    </div>
                    <span className="text-xs text-gray-500 font-medium flex items-center gap-1">
                      <TrendingUpIcon className="w-3 h-3" />
                      +0.3
                    </span>
                  </div>
                  <div className="text-3xl font-bold text-black mb-1">{stats.averageScore.toFixed(1)}</div>
                  <div className="text-sm text-neutral-600 font-medium">{language === 'bg' ? 'Средна оценка' : 'Average Score'}</div>
                  <div className="text-xs text-neutral-500 mt-1">{language === 'bg' ? 'От 5.0' : 'Out of 5.0'}</div>
                </div>
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
              {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Recent Activity - Enhanced */}
                  <div className="lg:col-span-2 p-6 bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200">
                    <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <ActivityIcon className="w-6 h-6 text-gray-600" />
                        </div>
                        <h3 className="text-xl font-bold text-black">
                          {language === 'bg' ? 'Последна активност' : 'Recent Activity'}
                        </h3>
                      </div>
                      <Link 
                        to="/teacher/activity" 
                        className="px-3 py-2 bg-gray-50 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors duration-200 flex items-center gap-2"
                      >
                        {language === 'bg' ? 'Виж всички' : 'View All'}
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                    <div className="space-y-4">
                      {recentActivity.length > 0 ? recentActivity.map((activity) => (
                        <div key={activity.id} className="flex justify-between items-center p-4 bg-stone-50 rounded-lg hover:bg-stone-100 transition-colors duration-200 border border-gray-100">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                              <StudentsIcon className="w-6 h-6 text-gray-600" />
                            </div>
                            <div>
                              <div className="text-base font-semibold text-black">{activity.student}</div>
                              <div className="text-sm text-neutral-600">{activity.task}</div>
                              <div className="text-xs text-neutral-500 mt-1">{activity.date}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-black mb-1">{activity.score}/10</div>
                            <div className="text-xs text-neutral-500">
                              {activity.score >= 8 ? (language === 'bg' ? 'Отлично' : 'Excellent') :
                               activity.score >= 6 ? (language === 'bg' ? 'Добро' : 'Good') :
                               activity.score >= 4 ? (language === 'bg' ? 'Задоволително' : 'Satisfactory') :
                               (language === 'bg' ? 'Слабо' : 'Poor')}
                            </div>
                          </div>
                        </div>
                      )) : (
                        <div className="text-center py-8">
                          <ActivityIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-neutral-500">{language === 'bg' ? 'Няма скорошна активност' : 'No recent activity'}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quick Actions - Enhanced */}
                  <div className="p-6 bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <PlusIcon className="w-6 h-6 text-gray-600" />
                      </div>
                      <h3 className="text-xl font-bold text-black">
                        {language === 'bg' ? 'Бързи действия' : 'Quick Actions'}
                      </h3>
                    </div>
                    <div className="space-y-4">
                      <Link
                        to="/teacher/create-assignment"
                        className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200 border border-gray-200 hover:shadow-md"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <AssignmentIcon className="w-5 h-5 text-gray-600" />
                          <div className="text-base font-semibold text-gray-800">
                            {language === 'bg' ? 'Създай ново задание' : 'Create New Assignment'}
                          </div>
                        </div>
                        <div className="text-sm text-gray-600 ml-8">
                          {language === 'bg' ? 'Генерирай задачи за учениците' : 'Generate tasks for students'}
                        </div>
                      </Link>
                      <Link
                        to="/teacher/scan-submissions"
                        className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200 border border-gray-200 hover:shadow-md"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <ActivityIcon className="w-5 h-5 text-gray-600" />
                          <div className="text-base font-semibold text-gray-800">
                            {language === 'bg' ? 'Сканирай решения' : 'Scan Submissions'}
                          </div>
                        </div>
                        <div className="text-sm text-gray-600 ml-8">
                          {language === 'bg' ? 'Автоматична проверка с AI' : 'AI-powered automatic checking'}
                        </div>
                      </Link>
                      <Link
                        to="/teacher/students"
                        className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-200 border border-gray-200 hover:shadow-md"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <StudentsIcon className="w-5 h-5 text-gray-600" />
                          <div className="text-base font-semibold text-gray-800">
                            {language === 'bg' ? 'Управление на ученици' : 'Student Management'}
                          </div>
                        </div>
                        <div className="text-sm text-gray-600 ml-8">
                          {language === 'bg' ? 'Преглед и управление на ученици' : 'View and manage students'}
                        </div>
                      </Link>
                    </div>
                  </div>

                  {/* Class Performance Overview - Enhanced */}
                  <div className="lg:col-span-3 p-6 bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <AnalyticsIcon className="w-6 h-6 text-gray-600" />
                      </div>
                      <h3 className="text-xl font-bold text-black">
                        {language === 'bg' ? 'Успеваемост на класа' : 'Class Performance'}
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="text-center p-6 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow duration-200">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                          <StudentsIcon className="w-6 h-6 text-gray-700" />
                        </div>
                        <div className="text-3xl font-bold text-gray-700 mb-2">{stats.totalStudents}</div>
                        <div className="text-sm text-gray-600 font-medium mb-1">
                          {language === 'bg' ? 'Общо ученици' : 'Total Students'}
                        </div>
                        <div className="text-xs text-gray-500">{stats.activeStudents} {language === 'bg' ? 'активни' : 'active'}</div>
                      </div>
                      <div className="text-center p-6 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow duration-200">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                          <AssignmentIcon className="w-6 h-6 text-gray-700" />
                        </div>
                        <div className="text-3xl font-bold text-gray-700 mb-2">{stats.activeAssignments}</div>
                        <div className="text-sm text-gray-600 font-medium mb-1">
                          {language === 'bg' ? 'Активни задания' : 'Active Assignments'}
                        </div>
                        <div className="text-xs text-gray-500">{stats.totalAssignments} {language === 'bg' ? 'общо' : 'total'}</div>
                      </div>
                      <div className="text-center p-6 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow duration-200">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                          <CheckIcon className="w-6 h-6 text-gray-700" />
                        </div>
                        <div className="text-3xl font-bold text-gray-700 mb-2">{stats.completedReviews}</div>
                        <div className="text-sm text-gray-600 font-medium mb-1">
                          {language === 'bg' ? 'Проверени задачи' : 'Graded Tasks'}
                        </div>
                        <div className="text-xs text-gray-500">{stats.pendingReviews} {language === 'bg' ? 'чакащи' : 'pending'}</div>
                      </div>
                      <div className="text-center p-6 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow duration-200">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                          <TrendingUpIcon className="w-6 h-6 text-gray-700" />
                        </div>
                        <div className="text-3xl font-bold text-gray-700 mb-2">{stats.averageScore.toFixed(1)}</div>
                        <div className="text-sm text-gray-600 font-medium mb-1">
                          {language === 'bg' ? 'Средна оценка' : 'Average Grade'}
                        </div>
                        <div className="text-xs text-gray-500">{language === 'bg' ? 'От 5.0' : 'Out of 5.0'}</div>
                      </div>
                    </div>
                  </div>

                  {/* Upcoming Deadlines - Enhanced */}
                  <div className="lg:col-span-2 p-6 bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <ClockIcon className="w-6 h-6 text-gray-600" />
                      </div>
                      <h3 className="text-xl font-bold text-black">
                        {language === 'bg' ? 'Предстоящи срокове' : 'Upcoming Deadlines'}
                      </h3>
                    </div>
                    <div className="space-y-4">
                      {assignments.filter(a => a.status === 'active').map((assignment) => (
                        <div key={assignment.id} className="flex justify-between items-center p-4 bg-stone-50 rounded-lg hover:bg-stone-100 transition-colors duration-200 border border-gray-100">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                              <AssignmentIcon className="w-5 h-5 text-gray-600" />
                            </div>
                            <div>
                              <div className="text-base font-semibold text-black">{assignment.title}</div>
                              <div className="text-sm text-neutral-600">
                                {assignment.students} {language === 'bg' ? 'ученика' : 'students'} • 
                                {language === 'bg' ? ' Краен срок:' : ' Due:'} {assignment.dueDate}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-600 mb-1">
                              {language === 'bg' ? 'Активно' : 'Active'}
                            </div>
                            <button className="text-sm text-blue-600 hover:text-blue-800 font-medium px-3 py-1 rounded-lg hover:bg-blue-50 transition-colors duration-200">
                              {language === 'bg' ? 'Преглед' : 'View'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Teaching Resources - Enhanced */}
                  <div className="p-6 bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold text-black">
                        {language === 'bg' ? 'Преподавателски ресурси' : 'Teaching Resources'}
                      </h3>
                    </div>
                    <div className="space-y-3">
                      <Link
                        to="/first-task/docs"
                        className="block p-4 bg-stone-50 rounded-lg hover:bg-stone-100 transition-colors duration-200 border border-gray-100 hover:shadow-sm"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div className="text-sm font-semibold text-black">
                            {language === 'bg' ? 'Документация - Първа задача' : 'First Task Documentation'}
                          </div>
                        </div>
                      </Link>
                      <Link
                        to="/scientific-calculator"
                        className="block p-4 bg-stone-50 rounded-lg hover:bg-stone-100 transition-colors duration-200 border border-gray-100 hover:shadow-sm"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div className="text-sm font-semibold text-black">
                            {language === 'bg' ? 'Научен калкулатор' : 'Scientific Calculator'}
                          </div>
                        </div>
                      </Link>
                      <Link
                        to="/tools"
                        className="block p-4 bg-stone-50 rounded-lg hover:bg-stone-100 transition-colors duration-200 border border-gray-100 hover:shadow-sm"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </div>
                          <div className="text-sm font-semibold text-black">
                            {language === 'bg' ? 'Всички инструменти' : 'All Tools'}
                          </div>
                        </div>
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'assignments' && (
                <div className="space-y-6">
                  {/* Assignment Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200">
                      <div className="text-3xl font-bold text-black">{assignments.length}</div>
                      <div className="text-sm text-neutral-600 font-medium">
                        {language === 'bg' ? 'Общо задания' : 'Total Assignments'}
                      </div>
                    </div>
                    <div className="p-6 bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200">
                      <div className="text-3xl font-bold text-green-600">
                        {assignments.filter(a => a.status === 'active').length}
                      </div>
                      <div className="text-sm text-neutral-600 font-medium">
                        {language === 'bg' ? 'Активни' : 'Active'}
                      </div>
                    </div>
                    <div className="p-6 bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200">
                      <div className="text-3xl font-bold text-gray-600">
                        {assignments.filter(a => a.status === 'completed').length}
                      </div>
                      <div className="text-sm text-neutral-600 font-medium">
                        {language === 'bg' ? 'Завършени' : 'Completed'}
                      </div>
                    </div>
                  </div>

                  {/* Assignments List */}
                  <div className="p-6 bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-black">
                        {language === 'bg' ? 'Моите задания' : 'My Assignments'}
                      </h3>
                      <Link
                        to="/teacher/create-assignment"
                        className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-200 text-base font-semibold"
                      >
                        {language === 'bg' ? '+ Създай ново задание' : '+ Create New Assignment'}
                      </Link>
                    </div>
                    <div className="space-y-4">
                      {assignments.map((assignment) => (
                        <div key={assignment.id} className="p-6 bg-stone-50 rounded-lg hover:bg-stone-100 transition-colors duration-200">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="text-lg font-bold text-black mb-2">{assignment.title}</h4>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-neutral-600">
                                <div>
                                  <span className="font-medium">{assignment.students}</span> {language === 'bg' ? 'ученика' : 'students'}
                                </div>
                                <div>
                                  <span className="font-medium">{language === 'bg' ? 'Краен срок:' : 'Due:'}</span> {assignment.dueDate}
                                </div>
                                <div>
                                  <span className="font-medium">{language === 'bg' ? 'Създадено:' : 'Created:'}</span> 2025-01-10
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-col gap-3 items-end">
                              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                assignment.status === 'active' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {assignment.status === 'active' 
                                  ? (language === 'bg' ? 'Активно' : 'Active')
                                  : (language === 'bg' ? 'Завършено' : 'Completed')
                                }
                              </span>
                              <div className="flex gap-2">
                                <button className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800 font-medium border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors duration-200">
                                  {language === 'bg' ? 'Преглед' : 'View'}
                                </button>
                                <button className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                                  {language === 'bg' ? 'Редактирай' : 'Edit'}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'students' && (
                <div className="p-4 lg:p-6 bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold text-black">
                      {language === 'bg' ? 'Моите ученици' : 'My Students'}
                    </h3>
                    <button className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-200 text-sm font-medium">
                      {language === 'bg' ? '+ Добави ученик' : '+ Add Student'}
                    </button>
                  </div>
                  <div className="text-center py-8 text-neutral-600">
                    {language === 'bg' 
                      ? 'Функционалността за управление на ученици ще бъде добавена скоро.'
                      : 'Student management functionality will be added soon.'
                    }
                  </div>
                </div>
              )}

              {activeTab === 'analytics' && (
                <div className="p-4 lg:p-6 bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200">
                  <h3 className="text-lg font-semibold text-black mb-6">
                    {language === 'bg' ? 'Анализ и статистики' : 'Analytics & Statistics'}
                  </h3>
                  <div className="text-center py-8 text-neutral-600">
                    {language === 'bg' 
                      ? 'Детайлните анализи и статистики ще бъдат добавени скоро.'
                      : 'Detailed analytics and statistics will be added soon.'
                    }
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

export default TeacherDashboard;
