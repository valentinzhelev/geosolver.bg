import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

/** Routes /classroom to teacher dashboard or student assignments */
const ClassroomHub = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'teacher' || user.role === 'admin') {
    return <Navigate to="/classroom/dashboard" replace />;
  }
  return <Navigate to="/classroom/assignments" replace />;
};

export default ClassroomHub;
