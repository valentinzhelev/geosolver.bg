import React, { useState } from 'react';
import Layout from '../../layout/Layout';
import SEO from '../../shared/SEO';
import { useTranslation } from '../../../hooks/useTranslation';
import { Link } from 'react-router-dom';

// Professional Icons Components
const StudentsIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
  </svg>
);

const ClassIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

const InviteIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
  </svg>
);

const PlusIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
);

const ViewIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const EditIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const StatsIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const TrendingUpIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

const CheckIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const StudentManagement = () => {
  const { language } = useTranslation();
  const [activeTab, setActiveTab] = useState('students');
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [newStudent, setNewStudent] = useState({
    name: '',
    email: '',
    class: ''
  });

  // Mock data - will be replaced with API calls
  const students = [
    {
      id: 1,
      name: 'Иван Петров',
      email: 'ivan.petrov@student.bg',
      class: '12А',
      joinDate: '2025-01-10',
      assignmentsCompleted: 8,
      averageScore: 4.2,
      lastActive: '2025-01-15',
      status: 'active'
    },
    {
      id: 2,
      name: 'Мария Георгиева',
      email: 'maria.georgieva@student.bg',
      class: '12А',
      joinDate: '2025-01-08',
      assignmentsCompleted: 12,
      averageScore: 4.8,
      lastActive: '2025-01-15',
      status: 'active'
    },
    {
      id: 3,
      name: 'Петър Димитров',
      email: 'petar.dimitrov@student.bg',
      class: '12Б',
      joinDate: '2025-01-12',
      assignmentsCompleted: 5,
      averageScore: 3.6,
      lastActive: '2025-01-14',
      status: 'active'
    },
    {
      id: 4,
      name: 'Анна Стоянова',
      email: 'anna.stoyanova@student.bg',
      class: '12Б',
      joinDate: '2025-01-09',
      assignmentsCompleted: 10,
      averageScore: 4.5,
      lastActive: '2025-01-15',
      status: 'active'
    }
  ];

  const classes = ['12А', '12Б', '12В', '11А', '11Б'];

  const tabs = [
    { id: 'students', label: language === 'bg' ? 'Ученици' : 'Students', icon: StudentsIcon },
    { id: 'classes', label: language === 'bg' ? 'Класове' : 'Classes', icon: ClassIcon },
    { id: 'invitations', label: language === 'bg' ? 'Покани' : 'Invitations', icon: InviteIcon }
  ];

  const handleAddStudent = () => {
    // TODO: Implement add student logic
    console.log('Adding student:', newStudent);
    setShowAddStudent(false);
    setNewStudent({ name: '', email: '', class: '' });
  };

  const generateInviteCode = () => {
    // TODO: Implement invite code generation
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    console.log('Generated invite code:', code);
    return code;
  };

  return (
    <>
      <SEO
        title={language === 'bg' ? 'Управление на ученици' : 'Student Management'}
        description={language === 'bg' ? 'Управление на ученици и класове' : 'Manage students and classes'}
        canonical="/teacher/students"
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
                    <StudentsIcon className="w-8 h-8 text-gray-600" />
                  </div>
                  <h1 className="text-black text-3xl font-bold font-['Manrope']">
                    {language === 'bg' ? 'Управление на ученици' : 'Student Management'}
                  </h1>
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-gray-800 text-base font-medium">
                  {language === 'bg' 
                    ? 'Управлявайте учениците си, класовете и поканите за присъединяване с подробна аналитика и статистики'
                    : 'Manage your students, classes, and invitation codes with detailed analytics and statistics'
                  }
                </p>
              </div>
            </div>

            {/* Enhanced Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="p-6 bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gray-100 rounded-lg">
                    <StudentsIcon className="w-6 h-6 text-gray-600" />
                  </div>
                  <span className="text-xs text-gray-500 font-medium flex items-center gap-1">
                    <TrendingUpIcon className="w-3 h-3" />
                    +8%
                  </span>
                </div>
                <div className="text-3xl font-bold text-black mb-1">{students.length}</div>
                <div className="text-sm text-neutral-600 font-medium mb-1">
                  {language === 'bg' ? 'Общо ученици' : 'Total Students'}
                </div>
                <div className="text-xs text-neutral-500">
                  {students.filter(s => s.status === 'active').length} {language === 'bg' ? 'активни' : 'active'}
                </div>
              </div>
              
              <div className="p-6 bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gray-100 rounded-lg">
                    <CheckIcon className="w-6 h-6 text-gray-600" />
                  </div>
                  <span className="text-xs text-gray-500 font-medium flex items-center gap-1">
                    <StatsIcon className="w-3 h-3" />
                    {language === 'bg' ? 'онлайн' : 'online'}
                  </span>
                </div>
                <div className="text-3xl font-bold text-gray-600 mb-1">
                  {students.filter(s => s.status === 'active').length}
                </div>
                <div className="text-sm text-neutral-600 font-medium mb-1">
                  {language === 'bg' ? 'Активни ученици' : 'Active Students'}
                </div>
                <div className="text-xs text-neutral-500">
                  {Math.round((students.filter(s => s.status === 'active').length / students.length) * 100)}% {language === 'bg' ? 'от общо' : 'of total'}
                </div>
              </div>
              
              <div className="p-6 bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gray-100 rounded-lg">
                    <ClassIcon className="w-6 h-6 text-gray-600" />
                  </div>
                  <span className="text-xs text-gray-500 font-medium flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {language === 'bg' ? 'седмица' : 'week'}
                  </span>
                </div>
                <div className="text-3xl font-bold text-gray-600 mb-1">{classes.length}</div>
                <div className="text-sm text-neutral-600 font-medium mb-1">
                  {language === 'bg' ? 'Класове' : 'Classes'}
                </div>
                <div className="text-xs text-neutral-500">
                  {Math.round(students.length / classes.length)} {language === 'bg' ? 'средно на клас' : 'avg per class'}
                </div>
              </div>
              
              <div className="p-6 bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 hover:shadow-lg transition-shadow duration-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gray-100 rounded-lg">
                    <TrendingUpIcon className="w-6 h-6 text-gray-600" />
                  </div>
                  <span className="text-xs text-gray-500 font-medium flex items-center gap-1">
                    <TrendingUpIcon className="w-3 h-3" />
                    +0.2
                  </span>
                </div>
                <div className="text-3xl font-bold text-gray-600 mb-1">
                  {(students.reduce((acc, s) => acc + s.averageScore, 0) / students.length).toFixed(1)}
                </div>
                <div className="text-sm text-neutral-600 font-medium mb-1">
                  {language === 'bg' ? 'Средна оценка' : 'Average Grade'}
                </div>
                <div className="text-xs text-neutral-500">
                  {language === 'bg' ? 'От 5.0' : 'Out of 5.0'}
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
              {activeTab === 'students' && (
                <div className="p-6 bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <StudentsIcon className="w-6 h-6 text-green-600" />
                      </div>
                      <h2 className="text-xl font-bold text-black">
                        {language === 'bg' ? 'Списък с ученици' : 'Student List'}
                      </h2>
                    </div>
                    <button
                      onClick={() => setShowAddStudent(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium flex items-center gap-2 shadow-md hover:shadow-lg"
                    >
                      <PlusIcon className="w-4 h-4" />
                      {language === 'bg' ? 'Добави ученик' : 'Add Student'}
                    </button>
                  </div>

                  {/* Students Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-semibold text-black">
                            {language === 'bg' ? 'Име' : 'Name'}
                          </th>
                          <th className="text-left py-3 px-4 font-semibold text-black">
                            {language === 'bg' ? 'Клас' : 'Class'}
                          </th>
                          <th className="text-left py-3 px-4 font-semibold text-black">
                            {language === 'bg' ? 'Завършени задачи' : 'Completed'}
                          </th>
                          <th className="text-left py-3 px-4 font-semibold text-black">
                            {language === 'bg' ? 'Средна оценка' : 'Average'}
                          </th>
                          <th className="text-left py-3 px-4 font-semibold text-black">
                            {language === 'bg' ? 'Последна активност' : 'Last Active'}
                          </th>
                          <th className="text-left py-3 px-4 font-semibold text-black">
                            {language === 'bg' ? 'Действия' : 'Actions'}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {students.map((student) => (
                          <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-3 px-4">
                              <div>
                                <div className="font-medium text-black">{student.name}</div>
                                <div className="text-sm text-neutral-600">{student.email}</div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-sm font-medium">
                                {student.class}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-black">{student.assignmentsCompleted}</td>
                            <td className="py-3 px-4">
                              <span className={`px-2 py-1 rounded text-sm font-medium ${
                                student.averageScore >= 4.5 ? 'bg-green-50 text-green-700' :
                                student.averageScore >= 4.0 ? 'bg-blue-50 text-blue-700' :
                                student.averageScore >= 3.5 ? 'bg-orange-50 text-orange-700' :
                                'bg-red-50 text-red-700'
                              }`}>
                                {student.averageScore}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-neutral-600">{student.lastActive}</td>
                            <td className="py-3 px-4">
                              <div className="flex gap-2">
                                <button className="px-3 py-2 text-sm text-blue-600 hover:text-blue-800 font-medium border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors duration-200 flex items-center gap-1">
                                  <ViewIcon className="w-3 h-3" />
                                  {language === 'bg' ? 'Преглед' : 'View'}
                                </button>
                                <button className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center gap-1">
                                  <EditIcon className="w-3 h-3" />
                                  {language === 'bg' ? 'Редактирай' : 'Edit'}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'classes' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {classes.map((className) => {
                    const classStudents = students.filter(s => s.class === className);
                    const classAverage = classStudents.length > 0 
                      ? (classStudents.reduce((acc, s) => acc + s.averageScore, 0) / classStudents.length).toFixed(1)
                      : 0;
                    const activeStudents = classStudents.filter(s => s.status === 'active').length;
                    
                    return (
                      <div key={className} className="p-6 bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 hover:shadow-lg transition-shadow duration-200">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                              <ClassIcon className="w-5 h-5 text-purple-600" />
                            </div>
                            <h3 className="text-lg font-bold text-black">{className}</h3>
                          </div>
                          <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium border border-blue-200">
                            {classStudents.length} {language === 'bg' ? 'ученика' : 'students'}
                          </span>
                        </div>
                        <div className="space-y-3 text-sm">
                          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                              <TrendingUpIcon className="w-4 h-4 text-orange-600" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{language === 'bg' ? 'Средна оценка:' : 'Average Grade:'}</div>
                              <div className="text-orange-600 font-semibold">{classAverage}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                              <CheckIcon className="w-4 h-4 text-green-600" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{language === 'bg' ? 'Активни:' : 'Active:'}</div>
                              <div className="text-green-600 font-semibold">{activeStudents}</div>
                            </div>
                          </div>
                        </div>
                        <button className="w-full mt-4 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium flex items-center justify-center gap-2 shadow-md hover:shadow-lg">
                          <ViewIcon className="w-4 h-4" />
                          {language === 'bg' ? 'Преглед на класа' : 'View Class'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {activeTab === 'invitations' && (
                <div className="p-6 bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <InviteIcon className="w-6 h-6 text-orange-600" />
                      </div>
                      <h2 className="text-xl font-bold text-black">
                        {language === 'bg' ? 'Покани за присъединяване' : 'Invitation Codes'}
                      </h2>
                    </div>
                    <button
                      onClick={generateInviteCode}
                      className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors duration-200 text-sm font-medium flex items-center gap-2 shadow-md hover:shadow-lg"
                    >
                      <PlusIcon className="w-4 h-4" />
                      {language === 'bg' ? 'Генерирай код' : 'Generate Code'}
                    </button>
                  </div>
                  
                  <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-lg p-8 border border-orange-200 min-h-[200px] flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <InviteIcon className="w-8 h-8 text-orange-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-orange-900 mb-2">
                        {language === 'bg' ? 'Готови за генериране' : 'Ready to Generate'}
                      </h3>
                      <p className="text-orange-700 text-base max-w-md">
                        {language === 'bg' 
                          ? 'Генерирайте кодове за покана, за да учениците да се присъединят към вашия клас'
                          : 'Generate invitation codes for students to join your class'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Add Student Modal */}
        {showAddStudent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <PlusIcon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-black">
                  {language === 'bg' ? 'Добави ученик' : 'Add Student'}
                </h3>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    {language === 'bg' ? 'Име' : 'Name'}
                  </label>
                  <input
                    type="text"
                    value={newStudent.name}
                    onChange={(e) => setNewStudent(prev => ({ ...prev, name: e.target.value }))}
                    placeholder={language === 'bg' ? 'Въведете име на ученика' : 'Enter student name'}
                    className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    {language === 'bg' ? 'Имейл' : 'Email'}
                  </label>
                  <input
                    type="email"
                    value={newStudent.email}
                    onChange={(e) => setNewStudent(prev => ({ ...prev, email: e.target.value }))}
                    placeholder={language === 'bg' ? 'Въведете имейл на ученика' : 'Enter student email'}
                    className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    {language === 'bg' ? 'Клас' : 'Class'}
                  </label>
                  <select
                    value={newStudent.class}
                    onChange={(e) => setNewStudent(prev => ({ ...prev, class: e.target.value }))}
                    className="w-full p-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400"
                  >
                    <option value="">{language === 'bg' ? 'Изберете клас' : 'Select class'}</option>
                    {classes.map((className) => (
                      <option key={className} value={className}>{className}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleAddStudent}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium flex items-center gap-2 shadow-md hover:shadow-lg"
                >
                  <PlusIcon className="w-4 h-4" />
                  {language === 'bg' ? 'Добави' : 'Add'}
                </button>
                <button
                  onClick={() => setShowAddStudent(false)}
                  className="px-6 py-3 bg-white text-black border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-sm font-medium flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  {language === 'bg' ? 'Отказ' : 'Cancel'}
                </button>
              </div>
            </div>
          </div>
        )}
      </Layout>
    </>
  );
};

export default StudentManagement;
