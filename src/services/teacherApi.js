import axios from 'axios';
import API_BASE_URL from '../config/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Teacher Dashboard API
export const teacherApi = {
  // Dashboard Stats
  getDashboardStats: async () => {
    try {
      const [students, classes, assignments, submissions] = await Promise.all([
        api.get('/students'),
        api.get('/classes'),
        api.get('/assignments'),
        api.get('/submissions/stats/overview')
      ]);

      return {
        totalStudents: students.data.length,
        activeStudents: students.data.filter(s => s.status === 'active').length,
        totalClasses: classes.data.length,
        totalAssignments: assignments.data.length,
        activeAssignments: assignments.data.filter(a => a.status === 'active').length,
        completedReviews: submissions.data.gradedSubmissions || 0,
        averageScore: submissions.data.averageScore || 0
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },

  // Students
  getStudents: () => api.get('/students'),
  getStudent: (id) => api.get(`/students/${id}`),
  addStudent: (studentData) => api.post('/students', studentData),
  updateStudent: (id, studentData) => api.put(`/students/${id}`, studentData),
  deleteStudent: (id) => api.delete(`/students/${id}`),
  getStudentsByClass: (classId) => api.get(`/students/class/${classId}`),
  getStudentStats: (id) => api.get(`/students/${id}/stats`),

  // Classes
  getClasses: () => api.get('/classes'),
  getClass: (id) => api.get(`/classes/${id}`),
  createClass: (classData) => api.post('/classes', classData),
  updateClass: (id, classData) => api.put(`/classes/${id}`, classData),
  deleteClass: (id) => api.delete(`/classes/${id}`),
  generateInviteCode: (id) => api.post(`/classes/${id}/invite-code`),
  getClassStats: (id) => api.get(`/classes/${id}/stats`),

  // Assignments
  getAssignments: () => api.get('/assignments'),
  getAssignment: (id) => api.get(`/assignments/${id}`),
  createAssignment: (assignmentData) => api.post('/assignments', assignmentData),
  updateAssignment: (id, assignmentData) => api.put(`/assignments/${id}`, assignmentData),
  deleteAssignment: (id) => api.delete(`/assignments/${id}`),
  getAssignmentStats: (id) => api.get(`/assignments/${id}/stats`),

  // Submissions
  getSubmissions: () => api.get('/submissions'),
  getSubmission: (id) => api.get(`/submissions/${id}`),
  getSubmissionsByAssignment: (assignmentId) => api.get(`/submissions/assignment/${assignmentId}`),
  analyzeSubmission: (id) => api.post(`/submissions/${id}/analyze`),
  gradeSubmission: (id, gradeData) => api.put(`/submissions/${id}/grade`, gradeData),
  getSubmissionStats: () => api.get('/submissions/stats/overview'),

  // File Upload
  uploadSubmission: (formData) => {
    return api.post('/submissions', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
};

// Recent Activity API
export const getRecentActivity = async () => {
  try {
    const submissions = await api.get('/submissions');
    return submissions.data.slice(0, 5).map(submission => ({
      id: submission._id,
      student: submission.studentId?.name || 'Unknown Student',
      task: submission.assignmentId?.title || 'Unknown Task',
      score: submission.finalScore || submission.aiAnalysis?.overallScore || 0,
      date: new Date(submission.submittedAt).toLocaleDateString()
    }));
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return [];
  }
};

export default teacherApi;
