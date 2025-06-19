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
import { AuthProvider } from './components/auth/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { Helmet } from "react-helmet";
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';
import CookieConsent from './components/shared/CookieConsent';
import Contacts from './components/contacts/Contacts';
import FirstTaskDocs from './components/tasks/FirstTaskDocs';

function App() {
  return (
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
          </Routes>
          <CookieConsent />
        </LanguageProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
