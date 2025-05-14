import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import PurvaZadacha from './components/PurvaZadacha';
import VtoraZadacha from './components/VtoraZadacha';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/purva-zadacha" element={<PurvaZadacha />} />
        <Route path="/vtora-zadacha" element={<VtoraZadacha />} />
      </Routes>
    </Router>
  );
}

export default App;
