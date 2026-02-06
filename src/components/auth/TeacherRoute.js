import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const TeacherRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-medium text-black">Зареждане...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'teacher' && user.role !== 'admin') {
    return (
      <div className="w-full min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 max-w-md">
          <div className="text-6xl mb-4 font-bold text-gray-400">Lock</div>
          <h2 className="text-xl font-semibold text-black mb-2">Нямате достъп</h2>
          <p className="text-neutral-600 mb-4">
            Тази страница е достъпна само за учители. Ако сте учител, моля свържете се с нас за активиране на вашия акаунт.
          </p>
          <a 
            href="/contacts" 
            className="inline-block px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-200 text-sm font-medium"
          >
            Свържи се с нас
          </a>
        </div>
      </div>
    );
  }

  return children;
};

export default TeacherRoute;
