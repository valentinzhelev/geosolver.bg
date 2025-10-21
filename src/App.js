import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/pages/HomePage/HomePage';
import FirstTask from './components/tasks/FirstTask';
import SecondTask from './components/tasks/SecondTask';
import ForwardIntersection from './components/tasks/ForwardIntersection';
import Prices from './components/pages/Prices/Prices';
import ToolsPage from './components/pages/Tools/ToolsPage';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Account from './components/auth/Account';
import ProtectedRoute from './components/auth/ProtectedRoute';
import TeacherRoute from './components/auth/TeacherRoute';
import { AuthProvider } from './components/auth/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import { Helmet } from "react-helmet";
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';
import CookieConsent from './components/shared/CookieConsent';
import Contacts from './components/contacts/Contacts';
import FirstTaskDocs from './components/tasks/FirstTaskDocs';
import ForwardIntersectionDocs from './components/tasks/ForwardIntersectionDocs';
import ResectionDocs from './components/tasks/ResectionDocs';
import PolarIntersectionDocs from './components/tasks/PolarIntersectionDocs';
import HansenTaskDocs from './components/tasks/HansenTaskDocs';
import CoordinateTransformationDocs from './components/tasks/CoordinateTransformationDocs';
import AreaCalculationDocs from './components/tasks/AreaCalculationDocs';
import DistanceBearingDocs from './components/tasks/DistanceBearingDocs';
import SecondTaskDocs from './components/tasks/SecondTaskDocs';
import ForTeachers from './components/pages/ForTeachers/ForTeachers';
import ScientificCalculator from './components/pages/ScientificCalculator/ScientificCalculator';
import TeacherDashboard from './components/pages/TeacherDashboard/TeacherDashboard';
import TaskGenerator from './components/pages/TeacherDashboard/TaskGenerator';
import StudentManagement from './components/pages/TeacherDashboard/StudentManagement';
import ScanInterface from './components/pages/TeacherDashboard/ScanInterface';
import CoordinateTransformation from './components/tasks/CoordinateTransformation';
import AreaCalculation from './components/tasks/AreaCalculation';
import DistanceBearing from './components/tasks/DistanceBearing';
import Resection from './components/tasks/Resection';
import PolarIntersection from './components/tasks/PolarIntersection';
import HansenTask from './components/tasks/HansenTask';
import Checkout from './components/pages/Checkout/Checkout';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <LanguageProvider>
            <Helmet>
              <meta charSet="utf-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1" />
              <meta name="theme-color" content="#000000" />
              <link rel="icon" href="/favicon.png" />
            </Helmet>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/tools" element={<ToolsPage />} />
              <Route path="/first-task" element={<FirstTask />} />
              <Route path="/second-task" element={<SecondTask />} />
              <Route path="/forward-intersection" element={<ForwardIntersection />} />
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
              <Route path="/contacts" element={<Contacts />} />
              <Route path="/first-task/docs" element={<FirstTaskDocs />} />
              <Route path="/second-task/docs" element={<SecondTaskDocs />} />
              <Route path="/forward-intersection/docs" element={<ForwardIntersectionDocs />} />
              <Route path="/resection/docs" element={<ResectionDocs />} />
              <Route path="/polar-intersection/docs" element={<PolarIntersectionDocs />} />
              <Route path="/hansen-task/docs" element={<HansenTaskDocs />} />
              <Route path="/coordinate-transformation/docs" element={<CoordinateTransformationDocs />} />
              <Route path="/area-calculation/docs" element={<AreaCalculationDocs />} />
              <Route path="/distance-bearing/docs" element={<DistanceBearingDocs />} />
              <Route path="/for-teachers" element={<ForTeachers />} />
              <Route path="/scientific-calculator" element={<ScientificCalculator />} />
              <Route path="/coordinate-transformation" element={<CoordinateTransformation />} />
              <Route path="/area-calculation" element={<AreaCalculation />} />
              <Route path="/distance-bearing" element={<DistanceBearing />} />
              <Route path="/resection" element={<Resection />} />
              <Route path="/polar-intersection" element={<PolarIntersection />} />
              <Route path="/hansen-task" element={<HansenTask />} />
              <Route path="/checkout/:planId/:billingCycle" element={<Checkout />} />
              <Route
                path="/teacher/dashboard"
                element={
                  <TeacherRoute>
                    <TeacherDashboard />
                  </TeacherRoute>
                }
              />
              <Route
                path="/teacher/create-assignment"
                element={
                  <TeacherRoute>
                    <TaskGenerator />
                  </TeacherRoute>
                }
              />
              <Route
                path="/teacher/students"
                element={
                  <TeacherRoute>
                    <StudentManagement />
                  </TeacherRoute>
                }
              />
              <Route
                path="/teacher/scan-submissions"
                element={
                  <TeacherRoute>
                    <ScanInterface />
                  </TeacherRoute>
                }
              />
            </Routes>
            <CookieConsent />
          </LanguageProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
