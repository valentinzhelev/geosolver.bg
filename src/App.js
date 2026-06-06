import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './components/pages/HomePage/HomePage';
import FirstTask from './components/tasks/FirstTask';
import SecondTask from './components/tasks/SecondTask';
import ForwardIntersection from './components/tasks/ForwardIntersection';
import Prices from './components/pages/Prices/Prices';
import ToolsPage from './components/pages/Tools/ToolsPage';
import ToolComingSoon from './components/pages/Tools/ToolComingSoon';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Account from './components/auth/Account';
import AccountSettingsPage from './components/auth/AccountSettingsPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { AuthProvider } from './components/auth/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';
import CookieConsent from './components/shared/CookieConsent';
import Contacts from './components/contacts/Contacts';
import FirstTaskDocs from './components/tasks/FirstTaskDocs';
import ForwardIntersectionDocs from './components/tasks/ForwardIntersectionDocs';
import ResectionDocs from './components/tasks/ResectionDocs';
import SecondTaskDocs from './components/tasks/SecondTaskDocs';
import ForTeachers from './components/pages/ForTeachers/ForTeachers';
import ForStudents from './components/pages/ForStudents/ForStudents';
import GaiPage from './components/pages/Gai/GaiPage';
import ScientificCalculator from './components/pages/ScientificCalculator/ScientificCalculator';
import ClassroomHub from './components/classroom/ClassroomHub';
import ClassroomRoute from './components/auth/ClassroomRoute';
import ClassroomDashboard from './components/classroom/teacher/ClassroomDashboard';
import GroupsPage from './components/classroom/teacher/GroupsPage';
import GroupDetailPage from './components/classroom/teacher/GroupDetailPage';
import CreateAssignmentPage from './components/classroom/teacher/CreateAssignmentPage';
import TeacherAssignmentDetailPage from './components/classroom/teacher/TeacherAssignmentDetailPage';
import ReviewQueuePage from './components/classroom/teacher/ReviewQueuePage';
import StudentAssignmentsPage from './components/classroom/student/StudentAssignmentsPage';
import StudentAssignmentDetailPage from './components/classroom/student/StudentAssignmentDetailPage';
import JoinGroupPage from './components/classroom/student/JoinGroupPage';
import Resection from './components/tasks/Resection';
import FieldBook from './components/pages/FieldBook/FieldBook';
import BillingSuccess from './components/pages/Billing/BillingSuccess';
import BillingCancel from './components/pages/Billing/BillingCancel';
import PrivacyPolicy from './components/pages/Legal/PrivacyPolicy';
import TermsOfService from './components/pages/Legal/TermsOfService';
import Disclaimer from './components/pages/Legal/Disclaimer';
import NotFound from './components/pages/NotFound/NotFound';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <LanguageProvider>
            {/* Global meta tags are now in public/index.html */}
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/tools" element={<ToolsPage />} />
              <Route path="/first-task" element={<FirstTask />} />
              <Route path="/second-task" element={<SecondTask />} />
              <Route path="/forward-intersection" element={<ForwardIntersection />} />
              <Route path="/resection" element={<Resection />} />
              <Route path="/prices" element={<Prices />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route
                path="/account"
                element={
                  <ProtectedRoute>
                    <Account />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/account/settings"
                element={
                  <ProtectedRoute>
                    <AccountSettingsPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/contacts" element={<Contacts />} />
              <Route path="/first-task/docs" element={<FirstTaskDocs />} />
              <Route path="/second-task/docs" element={<SecondTaskDocs />} />
              <Route path="/forward-intersection/docs" element={<ForwardIntersectionDocs />} />
              <Route path="/resection/docs" element={<ResectionDocs />} />
              <Route path="/for-teachers" element={<ForTeachers />} />
              <Route path="/for-students" element={<ForStudents />} />
              <Route path="/gai" element={<GaiPage />} />
              <Route path="/scientific-calculator" element={<ScientificCalculator />} />
              <Route
                path="/fieldbook"
                element={
                  <ProtectedRoute>
                    <FieldBook />
                  </ProtectedRoute>
                }
              />
              <Route path="/billing/success" element={<BillingSuccess />} />
              <Route path="/billing/cancel" element={<BillingCancel />} />
              {/* Legal pages */}
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/disclaimer" element={<Disclaimer />} />
              {/* Post-MVP tools: code retained, routes show coming-soon */}
              <Route path="/polar-intersection" element={<ToolComingSoon />} />
              <Route path="/polar-intersection/docs" element={<ToolComingSoon />} />
              <Route path="/hansen-task" element={<ToolComingSoon />} />
              <Route path="/hansen-task/docs" element={<ToolComingSoon />} />
              <Route path="/coordinate-transformation" element={<ToolComingSoon />} />
              <Route path="/coordinate-transformation/docs" element={<ToolComingSoon />} />
              <Route path="/area-calculation" element={<ToolComingSoon />} />
              <Route path="/area-calculation/docs" element={<ToolComingSoon />} />
              <Route path="/distance-bearing" element={<ToolComingSoon />} />
              <Route path="/distance-bearing/docs" element={<ToolComingSoon />} />
              {/* GeoSolver Edu — classroom */}
              <Route path="/classroom" element={<ClassroomHub />} />
              <Route
                path="/classroom/dashboard"
                element={
                  <ClassroomRoute>
                    <ClassroomDashboard />
                  </ClassroomRoute>
                }
              />
              <Route
                path="/classroom/groups"
                element={
                  <ClassroomRoute>
                    <GroupsPage />
                  </ClassroomRoute>
                }
              />
              <Route
                path="/classroom/groups/:id"
                element={
                  <ClassroomRoute>
                    <GroupDetailPage />
                  </ClassroomRoute>
                }
              />
              <Route
                path="/classroom/assignments/new"
                element={
                  <ClassroomRoute>
                    <CreateAssignmentPage />
                  </ClassroomRoute>
                }
              />
              <Route
                path="/classroom/teaching/assignments/:id"
                element={
                  <ClassroomRoute>
                    <TeacherAssignmentDetailPage />
                  </ClassroomRoute>
                }
              />
              <Route
                path="/classroom/review"
                element={
                  <ClassroomRoute>
                    <ReviewQueuePage />
                  </ClassroomRoute>
                }
              />
              <Route
                path="/classroom/assignments"
                element={
                  <ProtectedRoute>
                    <StudentAssignmentsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/classroom/assignments/:id"
                element={
                  <ProtectedRoute>
                    <StudentAssignmentDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/classroom/join"
                element={
                  <ProtectedRoute>
                    <JoinGroupPage />
                  </ProtectedRoute>
                }
              />
              {/* Legacy teacher URLs */}
              <Route path="/teacher/dashboard" element={<Navigate to="/classroom/dashboard" replace />} />
              <Route path="/teacher/courses" element={<Navigate to="/classroom/groups" replace />} />
              <Route path="/teacher/create-assignment" element={<Navigate to="/classroom/assignments/new" replace />} />
              <Route path="/teacher/students" element={<Navigate to="/classroom/groups" replace />} />
              <Route path="/teacher/scan-submissions" element={<Navigate to="/classroom/review" replace />} />
              <Route path="/teacher/templates/editor" element={<Navigate to="/classroom/dashboard" replace />} />
              {/* 404 catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <CookieConsent />
          </LanguageProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
