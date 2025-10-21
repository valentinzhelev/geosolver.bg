import React, { useState, useEffect } from 'react';
import Layout from '../../layout/Layout';
import { Helmet } from "react-helmet";
import { useTranslation } from '../../../hooks/useTranslation';
import { Link } from 'react-router-dom';
import { teacherApi, getRecentActivity } from '../../../services/teacherApi';

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
    averageScore: 0
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
    { id: 'overview', label: language === 'bg' ? 'Преглед' : 'Overview' },
    { id: 'assignments', label: language === 'bg' ? 'Задания' : 'Assignments' },
    { id: 'students', label: language === 'bg' ? 'Ученици' : 'Students' },
    { id: 'analytics', label: language === 'bg' ? 'Анализ' : 'Analytics' },
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
      <Helmet>
        <title>GeoSolver – Учителски панел</title>
        <meta name="description" content="Управлявайте вашите ученици, създавайте задания и проследявайте прогреса с GeoSolver учителския панел." />
        <meta name="keywords" content="учителски панел, геодезия, образование, задания, ученици, GeoSolver" />
      </Helmet>
      <Layout>
        <div className="w-full min-h-screen bg-stone-50">
          <div className="w-full max-w-[1180px] mx-auto px-4 lg:px-6 pt-6 lg:pt-20 pb-6 lg:pb-20 flex flex-col gap-6 lg:gap-10">
            
            {/* Header */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div>
                  <h1 className="text-black text-2xl lg:text-3xl font-bold font-['Manrope']">
                    {language === 'bg' ? 'Учителски панел' : 'Teacher Dashboard'}
                  </h1>
                  <p className="text-neutral-600 text-sm lg:text-base mt-1">
                    {language === 'bg' ? 'Добре дошли във вашият учителски център' : 'Welcome to your teaching center'}
                  </p>
                </div>
                <Link
                  to="/teacher/create-assignment"
                  className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-200 text-sm font-medium"
                >
                  {language === 'bg' ? '+ Създай задание' : '+ Create Assignment'}
                </Link>
              </div>

              {/* Stats Overview */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200">
                  <div className="text-2xl font-bold text-black">{stats.totalStudents}</div>
                  <div className="text-sm text-neutral-600">{language === 'bg' ? 'Ученици' : 'Students'}</div>
                </div>
                <div className="p-4 bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200">
                  <div className="text-2xl font-bold text-black">{stats.activeAssignments}</div>
                  <div className="text-sm text-neutral-600">{language === 'bg' ? 'Активни задания' : 'Active Assignments'}</div>
                </div>
                <div className="p-4 bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200">
                  <div className="text-2xl font-bold text-black">{stats.completedTasks}</div>
                  <div className="text-sm text-neutral-600">{language === 'bg' ? 'Завършени задачи' : 'Completed Tasks'}</div>
                </div>
                <div className="p-4 bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200">
                  <div className="text-2xl font-bold text-black">{stats.averageScore}</div>
                  <div className="text-sm text-neutral-600">{language === 'bg' ? 'Средна оценка' : 'Average Score'}</div>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex flex-wrap gap-3">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-lg text-base font-medium font-['Manrope'] transition-colors duration-200 ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'bg-white text-neutral-600 border border-gray-200 hover:bg-gray-50 hover:text-black'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="flex flex-col gap-6">
              {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Recent Activity - Larger */}
                  <div className="lg:col-span-2 p-6 bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-black">
                        {language === 'bg' ? 'Последна активност' : 'Recent Activity'}
                      </h3>
                      <Link 
                        to="/teacher/activity" 
                        className="px-3 py-1 bg-stone-50 rounded-lg text-sm text-black hover:bg-stone-100 font-medium transition-colors duration-200"
                      >
                        {language === 'bg' ? 'Виж всички' : 'View All'}
                      </Link>
                    </div>
                    <div className="space-y-4">
                      {recentActivity.map((activity) => (
                        <div key={activity.id} className="flex justify-between items-center p-4 bg-stone-50 rounded-lg hover:bg-stone-100 transition-colors duration-200">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center">
                              <div className="w-6 h-6 bg-stone-300 rounded-full"></div>
                            </div>
                            <div>
                              <div className="text-base font-semibold text-black">{activity.student}</div>
                              <div className="text-sm text-neutral-600">{activity.task}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-black">{activity.score}/10</div>
                            <div className="text-sm text-neutral-600">{activity.date}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quick Actions - Enhanced */}
                  <div className="p-6 bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200">
                    <h3 className="text-xl font-bold text-black mb-6">
                      {language === 'bg' ? 'Бързи действия' : 'Quick Actions'}
                    </h3>
                    <div className="space-y-3">
                      <Link
                        to="/teacher/create-assignment"
                        className="block p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200 border border-blue-200"
                      >
                        <div className="text-base font-semibold text-blue-800 mb-1">
                          {language === 'bg' ? 'Създай ново задание' : 'Create New Assignment'}
                        </div>
                        <div className="text-sm text-blue-600">
                          {language === 'bg' ? 'Генерирай задачи за учениците' : 'Generate tasks for students'}
                        </div>
                      </Link>
                      <Link
                        to="/teacher/scan-submissions"
                        className="block p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors duration-200 border border-green-200"
                      >
                        <div className="text-base font-semibold text-green-800 mb-1">
                          {language === 'bg' ? 'Сканирай решения' : 'Scan Submissions'}
                        </div>
                        <div className="text-sm text-green-600">
                          {language === 'bg' ? 'Автоматична проверка с AI' : 'AI-powered automatic checking'}
                        </div>
                      </Link>
                      <Link
                        to="/teacher/students"
                        className="block p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors duration-200 border border-purple-200"
                      >
                        <div className="text-base font-semibold text-purple-800 mb-1">
                          {language === 'bg' ? 'Управление на ученици' : 'Student Management'}
                        </div>
                        <div className="text-sm text-purple-600">
                          {language === 'bg' ? 'Преглед и управление на ученици' : 'View and manage students'}
                        </div>
                      </Link>
                    </div>
                  </div>

                  {/* Class Performance Overview */}
                  <div className="lg:col-span-3 p-6 bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200">
                    <h3 className="text-xl font-bold text-black mb-6">
                      {language === 'bg' ? 'Успеваемост на класа' : 'Class Performance'}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="text-2xl font-bold text-green-700">{stats.totalStudents}</div>
                        <div className="text-sm text-green-600 font-medium">
                          {language === 'bg' ? 'Общо ученици' : 'Total Students'}
                        </div>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="text-2xl font-bold text-blue-700">{stats.activeAssignments}</div>
                        <div className="text-sm text-blue-600 font-medium">
                          {language === 'bg' ? 'Активни задания' : 'Active Assignments'}
                        </div>
                      </div>
                      <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                        <div className="text-2xl font-bold text-orange-700">{stats.completedReviews}</div>
                        <div className="text-sm text-orange-600 font-medium">
                          {language === 'bg' ? 'Проверени задачи' : 'Graded Tasks'}
                        </div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <div className="text-2xl font-bold text-purple-700">{stats.averageScore.toFixed(1)}</div>
                        <div className="text-sm text-purple-600 font-medium">
                          {language === 'bg' ? 'Средна оценка' : 'Average Grade'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Upcoming Deadlines */}
                  <div className="lg:col-span-2 p-6 bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200">
                    <h3 className="text-xl font-bold text-black mb-6">
                      {language === 'bg' ? 'Предстоящи срокове' : 'Upcoming Deadlines'}
                    </h3>
                    <div className="space-y-4">
                      {assignments.filter(a => a.status === 'active').map((assignment) => (
                        <div key={assignment.id} className="flex justify-between items-center p-4 bg-stone-50 rounded-lg">
                          <div>
                            <div className="text-base font-semibold text-black">{assignment.title}</div>
                            <div className="text-sm text-neutral-600">
                              {assignment.students} {language === 'bg' ? 'ученика' : 'students'} • 
                              {language === 'bg' ? ' Краен срок:' : ' Due:'} {assignment.dueDate}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-orange-600">
                              {language === 'bg' ? 'Активно' : 'Active'}
                            </div>
                            <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                              {language === 'bg' ? 'Преглед' : 'View'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Teaching Resources */}
                  <div className="p-6 bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200">
                    <h3 className="text-xl font-bold text-black mb-6">
                      {language === 'bg' ? 'Преподавателски ресурси' : 'Teaching Resources'}
                    </h3>
                    <div className="space-y-4">
                      <Link
                        to="/first-task/docs"
                        className="block p-3 bg-stone-50 rounded-lg hover:bg-stone-100 transition-colors duration-200"
                      >
                        <div className="text-sm font-semibold text-black">
                          {language === 'bg' ? 'Документация - Първа задача' : 'First Task Documentation'}
                        </div>
                      </Link>
                      <Link
                        to="/scientific-calculator"
                        className="block p-3 bg-stone-50 rounded-lg hover:bg-stone-100 transition-colors duration-200"
                      >
                        <div className="text-sm font-semibold text-black">
                          {language === 'bg' ? 'Научен калкулатор' : 'Scientific Calculator'}
                        </div>
                      </Link>
                      <Link
                        to="/tools"
                        className="block p-3 bg-stone-50 rounded-lg hover:bg-stone-100 transition-colors duration-200"
                      >
                        <div className="text-sm font-semibold text-black">
                          {language === 'bg' ? 'Всички инструменти' : 'All Tools'}
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
