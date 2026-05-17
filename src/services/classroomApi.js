import API_BASE_URL from '../config/api';

function getToken() {
  return localStorage.getItem('token') || sessionStorage.getItem('token');
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  let data = {};
  try {
    data = await response.json();
  } catch {
    /* ignore */
  }

  if (!response.ok) {
    const msg =
      data.message ||
      data.detail ||
      data.error ||
      (response.status === 403
        ? 'Нямате достъп до тази функция.'
        : response.status === 404
          ? 'API endpoint не е намерен — рестартирайте backend с последния код.'
          : `Грешка ${response.status}`);
    const err = new Error(msg);
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return data;
}

export const notificationsApi = {
  list: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/notifications${q ? `?${q}` : ''}`);
  },
  markRead: (id) => request(`/notifications/${id}/read`, { method: 'PATCH' }),
  markAllRead: () => request('/notifications/read-all', { method: 'PATCH' }),
};

export const teacherAccessApi = {
  requestAccess: (message) =>
    request('/teacher-access/request', {
      method: 'POST',
      body: JSON.stringify({ message }),
    }),
  getMyRequest: () => request('/teacher-access/me'),
  listRequestsAdmin: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/teacher-access/admin/list${q ? `?${q}` : ''}`);
  },
  reviewRequestAdmin: (id, body) =>
    request(`/teacher-access/admin/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
};

export const classroomApi = {
  getOverview: () => request('/teacher/classroom/overview'),

  listCourses: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/teacher/courses${q ? `?${q}` : ''}`);
  },
  getCourse: (id) => request(`/teacher/courses/${id}`),
  getCourseAnalytics: (id) => request(`/teacher/courses/${id}/analytics`),
  createCourse: (body) =>
    request('/teacher/courses', { method: 'POST', body: JSON.stringify(body) }),
  addStudents: (courseId, studentEmails) =>
    request(`/teacher/courses/${courseId}/add-students`, {
      method: 'POST',
      body: JSON.stringify({ studentEmails }),
    }),
  deleteCourse: (id) => request(`/teacher/courses/${id}`, { method: 'DELETE' }),

  patchCourseStatus: (id, isActive) =>
    request(`/teacher/courses/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive }),
    }),

  archiveCourse: (id) =>
    request(`/teacher/courses/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive: false }),
    }),

  restoreCourse: (id) =>
    request(`/teacher/courses/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive: true }),
    }),

  exportCourseGrades: async (courseId) => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/teacher/courses/${courseId}/export-grades`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) throw new Error(`Export failed (${response.status})`);
    return response.blob();
  },

  listMyTemplates: () => request('/teacher/templates'),
  saveTemplate: (body) =>
    request('/teacher/templates', { method: 'POST', body: JSON.stringify(body) }),
  deleteTemplate: (id) => request(`/teacher/templates/${id}`, { method: 'DELETE' }),

  listBuiltinTools: () => request('/teacher/tasks/builtin/list'),

  listAssignments: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/teacher/assignments${q ? `?${q}` : ''}`);
  },
  createAssignment: (body) =>
    request('/teacher/assignments', { method: 'POST', body: JSON.stringify(body) }),
  getAssignment: (id) => request(`/teacher/assignments/${id}`),
  getAssignmentSubmissions: (id) => request(`/teacher/assignments/${id}/submissions`),
  getReviewQueue: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/teacher/assignments/review-queue/list${q ? `?${q}` : ''}`);
  },
  getAssignmentPresets: () => request('/teacher/assignments/presets/list'),
  publishAssignment: (id, body = {}) =>
    request(`/teacher/assignments/${id}/publish`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  duplicateAssignment: (id) =>
    request(`/teacher/assignments/${id}/duplicate`, { method: 'POST' }),
  exportAssignmentGrades: async (id) => {
    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/teacher/assignments/${id}/export-grades`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) {
      const err = new Error(`Export failed (${response.status})`);
      err.status = response.status;
      throw err;
    }
    return response.blob();
  },
  gradeSubmission: (assignmentId, submissionId, body) =>
    request(`/teacher/assignments/${assignmentId}/grade/${submissionId}`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  patchAssignmentStatus: (id, status) =>
    request(`/teacher/assignments/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  archiveAssignment: (id) =>
    request(`/teacher/assignments/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'archived' }),
    }),

  restoreAssignment: (id) =>
    request(`/teacher/assignments/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'active' }),
    }),
};

export const studentClassroomApi = {
  listMyCourses: () => request('/student/courses'),
  joinCourse: (code) =>
    request('/student/courses/join', {
      method: 'POST',
      body: JSON.stringify({ code }),
    }),

  listAssignments: () => request('/student/assignments/assignments'),
  getAssignment: (id) => request(`/student/assignments/assignments/${id}`),
  submitAssignment: (id, body) =>
    request(`/student/assignments/assignments/${id}/submit`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
};

export default classroomApi;
