import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import PurvaZadacha from './components/PurvaZadacha';
import VtoraZadacha from './components/VtoraZadacha';
import AboutPage from './components/AboutPage';
import PravaZasechka from './components/PravaZasechka';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/purva-zadacha" element={<PurvaZadacha />} />
        <Route path="/vtora-zadacha" element={<VtoraZadacha />} />
        <Route path="/za-nas" element={<AboutPage />} />
        <Route path="/prava-zasechka" element={<PravaZasechka />} />
      </Routes>
    </Router>
  );
}

export default App;
