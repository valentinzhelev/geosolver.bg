import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useTranslation } from '../../hooks/useTranslation';
import { canAccessTeacherClassroom } from '../../utils/eduRoles';

/** Teacher-only classroom routes */
const ClassroomRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const { language } = useTranslation();
  const bg = language === 'bg';

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-stone-50 dark:bg-zinc-950 flex items-center justify-center">
        <div className="text-lg font-medium font-['Manrope'] text-black dark:text-white">
          {bg ? 'Зареждане...' : 'Loading...'}
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!canAccessTeacherClassroom(user)) {
    return <Navigate to={user.role === 'student' ? '/classroom/assignments' : '/'} replace />;
  }

  return children;
};

export default ClassroomRoute;
