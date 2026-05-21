import React, { useState, useEffect } from 'react';
import Layout from '../../layout/Layout';
import SEO from '../../shared/SEO';
import { useTranslation } from '../../../hooks/useTranslation';
import { Link } from 'react-router-dom';

// Professional Icons Components
const CourseIcon = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);

const PlusIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
);

const StudentsIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
  </svg>
);

const EditIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const DeleteIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const CourseManagement = () => {
  const { language } = useTranslation();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddStudentsModal, setShowAddStudentsModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  // Mock data - replace with API calls
  useEffect(() => {
    const mockCourses = [
      {
        id: 1,
        name: 'Геодезия - 1 курс',
        code: 'GEO101',
        description: 'Основен курс по геодезия за първи курс',
        studentCount: 24,
        assignmentCount: 5,
        isActive: true,
        createdAt: '2025-01-01'
      },
      {
        id: 2,
        name: 'Картография',
        code: 'CAR201',
        description: 'Курс по картография и геоинформационни системи',
        studentCount: 18,
        assignmentCount: 3,
        isActive: true,
        createdAt: '2025-01-05'
      },
      {
        id: 3,
        name: 'Висша геодезия',
        code: 'GEO301',
        description: 'Специализиран курс по висша геодезия',
        studentCount: 12,
        assignmentCount: 7,
        isActive: false,
        createdAt: '2024-12-15'
      }
    ];

    setTimeout(() => {
      setCourses(mockCourses);
      setLoading(false);
    }, 1000);
  }, []);

  const handleCreateCourse = (courseData) => {
    const newCourse = {
      id: courses.length + 1,
      ...courseData,
      studentCount: 0,
      assignmentCount: 0,
      isActive: true,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setCourses([newCourse, ...courses]);
    setShowCreateModal(false);
  };

  const handleAddStudents = (courseId, studentEmails) => {
    setCourses(courses.map(course => 
      course.id === courseId 
        ? { ...course, studentCount: course.studentCount + studentEmails.length }
        : course
    ));
    setShowAddStudentsModal(false);
    setSelectedCourse(null);
  };

  const handleDeleteCourse = (courseId) => {
    if (window.confirm(language === 'bg' ? 'Сигурни ли сте, че искате да изтриете този курс?' : 'Are you sure you want to delete this course?')) {
      setCourses(courses.filter(course => course.id !== courseId));
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="w-full min-h-screen bg-stone-50 dark:bg-zinc-950 transition-colors flex items-center justify-center">
          <div className="text-center">
            <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 mb-4 animate-spin"></div>
            <p className="text-neutral-600 dark:text-zinc-400">
              {language === 'bg' ? 'Зареждане на курсовете...' : 'Loading courses...'}
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <>
      <SEO
        title={language === 'bg' ? 'Управление на курсове' : 'Course Management'}
        description={language === 'bg' ? 'Управлявайте вашите курсове и студенти' : 'Manage your courses and students'}
        canonical="/teacher/courses"
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
                    <CourseIcon className="w-8 h-8 text-gray-600" />
                  </div>
                  <h1 className="text-black dark:text-white text-3xl font-bold font-['Manrope']">
                    {language === 'bg' ? 'Управление на курсове' : 'Course Management'}
                  </h1>
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-gray-800 text-base font-medium">
                  {language === 'bg' 
                    ? 'Създавайте и управлявайте курсове, добавяйте студенти и проследявайте прогреса'
                    : 'Create and manage courses, add students and track progress'
                  }
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center">
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-200 text-sm font-medium flex items-center gap-2"
                >
                  <PlusIcon className="w-4 h-4" />
                  {language === 'bg' ? 'Създай курс' : 'Create Course'}
                </button>
              </div>
              <div className="text-sm text-gray-600">
                {language === 'bg' ? 'Общо курсове:' : 'Total courses:'} {courses.length}
              </div>
            </div>

            {/* Courses Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <div key={course.id} className="p-6 bg-white dark:bg-zinc-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-800 hover:shadow-lg transition-shadow duration-200">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <CourseIcon className="w-6 h-6 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-black dark:text-white">{course.name}</h3>
                        <p className="text-sm text-gray-600 font-mono">{course.code}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedCourse(course);
                          setShowAddStudentsModal(true);
                        }}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                        title={language === 'bg' ? 'Добави студенти' : 'Add students'}
                      >
                        <StudentsIcon className="w-4 h-4" />
                      </button>
                      <button
                        className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                        title={language === 'bg' ? 'Редактирай' : 'Edit'}
                      >
                        <EditIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCourse(course.id)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                        title={language === 'bg' ? 'Изтрий' : 'Delete'}
                      >
                        <DeleteIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-4">{course.description}</p>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-700">{course.studentCount}</div>
                      <div className="text-xs text-gray-600">{language === 'bg' ? 'Студенти' : 'Students'}</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-700">{course.assignmentCount}</div>
                      <div className="text-xs text-gray-600">{language === 'bg' ? 'Задания' : 'Assignments'}</div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      course.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {course.isActive 
                        ? (language === 'bg' ? 'Активен' : 'Active')
                        : (language === 'bg' ? 'Неактивен' : 'Inactive')
                      }
                    </span>
                    <Link
                      to={`/teacher/courses/${course.id}`}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {language === 'bg' ? 'Преглед' : 'View'} →
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Create Course Modal */}
            {showCreateModal && (
              <CreateCourseModal
                onClose={() => setShowCreateModal(false)}
                onSubmit={handleCreateCourse}
                language={language}
              />
            )}

            {/* Add Students Modal */}
            {showAddStudentsModal && selectedCourse && (
              <AddStudentsModal
                course={selectedCourse}
                onClose={() => {
                  setShowAddStudentsModal(false);
                  setSelectedCourse(null);
                }}
                onSubmit={handleAddStudents}
                language={language}
              />
            )}
          </div>
        </div>
      </Layout>
    </>
  );
};

// Create Course Modal Component
const CreateCourseModal = ({ onClose, onSubmit, language }) => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.code) {
      onSubmit(formData);
      setFormData({ name: '', code: '', description: '' });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-bold text-black dark:text-white mb-4">
          {language === 'bg' ? 'Създай нов курс' : 'Create New Course'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'bg' ? 'Име на курса' : 'Course Name'}
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'bg' ? 'Код на курса' : 'Course Code'}
            </label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'bg' ? 'Описание' : 'Description'}
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              {language === 'bg' ? 'Отказ' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-200"
            >
              {language === 'bg' ? 'Създай' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Add Students Modal Component
const AddStudentsModal = ({ course, onClose, onSubmit, language }) => {
  const [studentEmails, setStudentEmails] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const emails = studentEmails.split('\n').filter(email => email.trim());
    if (emails.length > 0) {
      onSubmit(course.id, emails);
      setStudentEmails('');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-bold text-black dark:text-white mb-4">
          {language === 'bg' ? `Добави студенти към ${course.name}` : `Add students to ${course.name}`}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {language === 'bg' ? 'Email адреси (по един на ред)' : 'Email addresses (one per line)'}
            </label>
            <textarea
              value={studentEmails}
              onChange={(e) => setStudentEmails(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={5}
              placeholder={language === 'bg' ? 'student1@example.com\nstudent2@example.com' : 'student1@example.com\nstudent2@example.com'}
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              {language === 'bg' ? 'Отказ' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-200"
            >
              {language === 'bg' ? 'Добави' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CourseManagement;
