import React, { useState, useEffect } from 'react';
import './TaskLayout.css';
import Layout from './Layout';
import Breadcrumbs from './Breadcrumbs';
import { saveCalculation } from "./historyService";
import { getRecentCalculations } from "./historyService";
import { Helmet } from "react-helmet";

const PurvaZadacha = () => {
  const [form, setForm] = useState({ y1: '', x1: '', alpha: '', s: '' });
  const [result, setResult] = useState('Въведете данни и натиснете "Изчисли", за да видите резултати тук.');
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);


  useEffect(() => {
    const toggle = document.getElementById('toggle-dark');
    const icon = document.querySelector('.switch-label i');
    if (!toggle || !icon) return;

    toggle.addEventListener('change', () => {
      document.body.classList.toggle('dark-mode');
      icon.classList.toggle('fa-sun');
      icon.classList.toggle('fa-moon');
    });
  }, []);

  const toggleHistory = async () => {
    if (!showHistory) {
      try {
        const data = await getRecentCalculations();
        setHistory(data);
      } catch (err) {
        console.error("Грешка при зареждане на историята:", err.message);
      }
    }
    setShowHistory(!showHistory);
  };


  const handleChange = (e) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  const calculate = async () => {
    const y1 = parseFloat(form.y1);
    const x1 = parseFloat(form.x1);
    const alpha = parseFloat(form.alpha);
    const s = parseFloat(form.s);

    if (isNaN(y1) || isNaN(x1) || isNaN(alpha) || isNaN(s)) {
      alert("Моля, попълнете всички полета коректно.");
      return;
    }

    const alphaRad = alpha * Math.PI / 200;
    const sinAlpha = Math.sin(alphaRad);
    const cosAlpha = Math.cos(alphaRad);
    const y2 = y1 + s * sinAlpha;
    const x2 = x1 + s * cosAlpha;

    const output = `Y1 = ${y1}, X1 = ${x1}
S = ${s}, α = ${alpha} gon
α в радиани = ${alphaRad.toFixed(6)}
---------------------------------------
sin(α) = ${sinAlpha.toFixed(6)}
cos(α) = ${cosAlpha.toFixed(6)}
---------------------------------------
Y2 = ${y2.toFixed(2)}
X2 = ${x2.toFixed(2)}`;

    setResult(output);

    // 📨 Запис в базата данни
    try {
      await saveCalculation({
        x1,
        y1,
        alpha,
        s,
        x2: parseFloat(x2.toFixed(2)),
        y2: parseFloat(y2.toFixed(2)),
        date: new Date(),
      });
      console.log("✅ Изчислението е запазено успешно.");
    } catch (err) {
      console.error("❌ Грешка при запис на изчислението:", err.message);
    }
  };


  const resetForm = () => {
    setForm({ y1: '', x1: '', alpha: '', s: '' });
    setResult('Въведете данни и натиснете "Изчисли", за да видите резултати тук.');
  };

  return (
    <>
      <Helmet>
        <title>Първа основна задача – Изчисляване по начална точка, ъгъл и дължина | GeoSolver</title>
        <meta
          name="description"
          content="Изчисляване на координати по начална точка, ъгъл и дължина с онлайн геодезически калкулатор. Бързи и точни решения за геодезисти."
        />
        <meta
          name="keywords"
          content="геодезия, онлайн калкулатор, първа основна задача, координати, ъгъл, дължина, трансформация, геодезически изчисления"
        />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="GeoSolver" />
      </Helmet>
      <Layout>
        <Breadcrumbs />
        <h1 style={{ textAlign: 'center', fontSize: '1.8em', marginTop: '1em' }}>
          <i className="fas fa-location-arrow" style={{ color: '#00c3ff', marginRight: '0.4em' }}></i>
          ПЪРВА ОСНОВНА ЗАДАЧА
        </h1>
        <div className="task-layout">
          <div className="task-left">
            <h2><i className="fas fa-location-arrow"></i> Входни данни</h2>

            <div className="form-group">
              <label htmlFor="y1">Y₁ (координата)</label>
              <input type="number" id="y1" value={form.y1} onChange={handleChange} step="any" />
            </div>

            <div className="form-group">
              <label htmlFor="x1">X₁ (координата)</label>
              <input type="number" id="x1" value={form.x1} onChange={handleChange} step="any" />
            </div>

            <div className="form-group">
              <label htmlFor="alpha">Ъгъл α (в гради)</label>
              <input type="number" id="alpha" value={form.alpha} onChange={handleChange} step="any" />
            </div>

            <div className="form-group">
              <label htmlFor="s">Дължина S</label>
              <input type="number" id="s" value={form.s} onChange={handleChange} step="any" />
            </div>

            <div className="btn-row">
              <button onClick={calculate}>Изчисли</button>
              <button onClick={resetForm}>Изчисти</button>
              <button onClick={toggleHistory}>
                {showHistory ? "Скрий историята" : "История на изчисленията"}
              </button>
            </div>
          </div>

          <div className="task-right">
            <h2><i className="fas fa-chart-line"></i> Резултати</h2>
            <div className="output">{result}</div>
          </div>
        </div>
        {showHistory && (
          <div className="history-table">
            <h2>Последни изчисления</h2>
            <table>
              <thead>
                <tr>
                  <th>Y₁</th>
                  <th>X₁</th>
                  <th>α</th>
                  <th>S</th>
                  <th>Y₂</th>
                  <th>X₂</th>
                  <th>Дата</th>
                </tr>
              </thead>
              <tbody>
                {history.map((entry, index) => (
                  <tr key={index}>
                    <td>{entry.y1}</td>
                    <td>{entry.x1}</td>
                    <td>{entry.alpha}</td>
                    <td>{entry.s}</td>
                    <td>{entry.y2}</td>
                    <td>{entry.x2}</td>
                    <td>{new Date(entry.date).toLocaleString("bg-BG")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </Layout>
    </>
  );
};

export default PurvaZadacha;
