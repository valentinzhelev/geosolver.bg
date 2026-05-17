/** Roles that use the teacher classroom (dashboard, groups, review). */
export const EDU_TEACHER_ROLES = ['teacher', 'admin'];

/** Roles that use the student classroom (assignments, join). */
export const EDU_STUDENT_ROLES = ['student'];

export function canAccessTeacherClassroom(user, { loading = false } = {}) {
  if (loading || !user) return false;
  return EDU_TEACHER_ROLES.includes(user.role);
}

export function canAccessStudentClassroom(user, { loading = false } = {}) {
  if (loading || !user) return false;
  return EDU_STUDENT_ROLES.includes(user.role);
}
