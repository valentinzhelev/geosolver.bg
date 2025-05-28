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
import { Helmet } from "react-helmet";
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';
import Contacts from './components/contacts/Contacts';

function App() {
  return (
    <>
      <Helmet>
        <title>GeoSolver - Онлайн калкулатор за геодезия</title>
        <meta
          name="description"
          content="GeoSolver - онлайн геодезически калкулатор за точни и бързи изчисления. Решавай задачи като права засечка, обратна засечка и трансформации с интуитивен интерфейс и запазване на историята."
        />
        <meta
          name="keywords"
          content="геодезия, геодезически калкулатори, права засечка, обратна засечка, онлайн изчисления, координатни трансформации, геодезически задачи"
        />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="GeoSolver" />
      </Helmet>

      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/first-task" element={<FirstTask />} />
            <Route path="/second-task" element={<SecondTask />} />
            <Route path="/forward-intersection" element={<ForwardIntersection />} />
            <Route path="/prices" element={<Prices />} />
            <Route path="/tools" element={<ToolsPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/contacts" element={<Contacts />} />
          </Routes>
        </Router>
      </AuthProvider>
    </>
  );
}

export default App;
