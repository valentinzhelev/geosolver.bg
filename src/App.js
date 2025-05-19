import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/pages/HomePage/HomePage';
import FirstTask from './components/tasks/FirstTask';
import SecondTask from './components/tasks/SecondTask';
import ForwardIntersection from './components/tasks/ForwardIntersection';
import Resection from './components/tasks/Resection';
import AboutPage from './components/pages/AboutPage/AboutPage';
import Prices from './components/pages/Prices/Prices';
import ToolsPage from './components/pages/ToolsPage';
import { Helmet } from "react-helmet";

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

      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/first-task" element={<FirstTask />} />
          <Route path="/second-task" element={<SecondTask />} />
          <Route path="/forward-intersection" element={<ForwardIntersection />} />
          <Route path="/resection" element={<Resection />} />
          <Route path="/about-us" element={<AboutPage />} />
          <Route path="/prices" element={<Prices />} />
          <Route path="/tools" element={<ToolsPage />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
