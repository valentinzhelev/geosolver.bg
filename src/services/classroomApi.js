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

export const classroomApi = {
  getOverview: () => request('/teacher/classroom/overview'),

  listCourses: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/teacher/courses${q ? `?${q}` : ''}`);
  },
  getCourse: (id) => request(`/teacher/courses/${id}`),
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

  listBuiltinTools: () => request('/teacher/tasks/builtin/list'),

  listAssignments: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/teacher/assignments${q ? `?${q}` : ''}`);
  },
  createAssignment: (body) =>
    request('/teacher/assignments', { method: 'POST', body: JSON.stringify(body) }),
  getAssignment: (id) => request(`/teacher/assignments/${id}`),
  getAssignmentSubmissions: (id) => request(`/teacher/assignments/${id}/submissions`),
  getReviewQueue: () => request('/teacher/assignments/review-queue/list'),
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
