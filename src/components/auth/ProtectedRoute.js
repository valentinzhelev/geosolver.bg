import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const ProtectedRoute = ({ children }) => {
  const { token, loading } = useAuth();
  if (loading) return <div className="w-full text-center py-10 text-lg">Зареждане...</div>;
  return token ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute; 