import React, { useState } from 'react';
import Layout from '../../layout/Layout';
import { Helmet } from 'react-helmet';
import { useTranslation } from '../../../hooks/useTranslation';
import { Link } from 'react-router-dom';

const StudentManagement = () => {
  const { t, language } = useTranslation();
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
    { id: 'students', label: language === 'bg' ? 'Ученици' : 'Students' },
    { id: 'classes', label: language === 'bg' ? 'Класове' : 'Classes' },
    { id: 'invitations', label: language === 'bg' ? 'Покани' : 'Invitations' }
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
      <Helmet>
        <title>GeoSolver – {language === 'bg' ? 'Управление на ученици' : 'Student Management'}</title>
        <meta name="description" content={language === 'bg' ? 'Управление на ученици и класове' : 'Manage students and classes'} />
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
                  {language === 'bg' ? 'Управление на ученици' : 'Student Management'}
                </h1>
              </div>
              <p className="text-neutral-600 text-base">
                {language === 'bg' 
                  ? 'Управлявайте учениците си, класовете и поканите за присъединяване'
                  : 'Manage your students, classes, and invitation codes'
                }
              </p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="p-6 bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200">
                <div className="text-3xl font-bold text-black">{students.length}</div>
                <div className="text-sm text-neutral-600 font-medium">
                  {language === 'bg' ? 'Общо ученици' : 'Total Students'}
                </div>
              </div>
              <div className="p-6 bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200">
                <div className="text-3xl font-bold text-green-600">
                  {students.filter(s => s.status === 'active').length}
                </div>
                <div className="text-sm text-neutral-600 font-medium">
                  {language === 'bg' ? 'Активни' : 'Active'}
                </div>
              </div>
              <div className="p-6 bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200">
                <div className="text-3xl font-bold text-blue-600">{classes.length}</div>
                <div className="text-sm text-neutral-600 font-medium">
                  {language === 'bg' ? 'Класове' : 'Classes'}
                </div>
              </div>
              <div className="p-6 bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200">
                <div className="text-3xl font-bold text-purple-600">
                  {(students.reduce((acc, s) => acc + s.averageScore, 0) / students.length).toFixed(1)}
                </div>
                <div className="text-sm text-neutral-600 font-medium">
                  {language === 'bg' ? 'Средна оценка' : 'Average Grade'}
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
                      ? 'bg-gray-200 text-black border border-gray-300'
                      : 'bg-white text-neutral-600 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="flex flex-col gap-6">
              {activeTab === 'students' && (
                <div className="p-6 bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-black">
                      {language === 'bg' ? 'Списък с ученици' : 'Student List'}
                    </h2>
                    <button
                      onClick={() => setShowAddStudent(true)}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 text-sm font-medium flex items-center gap-2"
                    >
                      {language === 'bg' ? 'Добави ученик' : 'Add Student'}
                      <span>+</span>
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
                                <button className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 font-medium border border-blue-200 rounded hover:bg-blue-50 transition-colors duration-200">
                                  {language === 'bg' ? 'Преглед' : 'View'}
                                </button>
                                <button className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 font-medium border border-gray-200 rounded hover:bg-gray-50 transition-colors duration-200">
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
                    
                    return (
                      <div key={className} className="p-6 bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="text-lg font-bold text-black">{className}</h3>
                          <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-sm font-medium">
                            {classStudents.length} {language === 'bg' ? 'ученика' : 'students'}
                          </span>
                        </div>
                        <div className="space-y-2 text-sm text-neutral-600">
                          <div>
                            <strong>{language === 'bg' ? 'Средна оценка:' : 'Average Grade:'}</strong> {classAverage}
                          </div>
                          <div>
                            <strong>{language === 'bg' ? 'Активни:' : 'Active:'}</strong> {classStudents.filter(s => s.status === 'active').length}
                          </div>
                        </div>
                        <button className="w-full mt-4 px-4 py-2 bg-gray-200 text-black rounded-lg hover:bg-gray-300 transition-colors duration-200 text-sm font-medium">
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
                    <h2 className="text-xl font-bold text-black">
                      {language === 'bg' ? 'Покани за присъединяване' : 'Invitation Codes'}
                    </h2>
                    <button
                      onClick={generateInviteCode}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 text-sm font-medium flex items-center gap-2"
                    >
                      {language === 'bg' ? 'Генерирай код' : 'Generate Code'}
                      <span>+</span>
                    </button>
                  </div>
                  
                  <div className="bg-stone-50 rounded-lg p-6 border border-gray-200 min-h-[200px] flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl mb-4">🔑</div>
                      <p className="text-neutral-600 text-base">
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
            <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
              <h3 className="text-xl font-bold text-black mb-4">
                {language === 'bg' ? 'Добави ученик' : 'Add Student'}
              </h3>
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
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 text-sm font-medium flex items-center gap-2"
                >
                  {language === 'bg' ? 'Добави' : 'Add'}
                  <span>→</span>
                </button>
                <button
                  onClick={() => setShowAddStudent(false)}
                  className="px-4 py-2 bg-white text-black border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-sm font-medium"
                >
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
