import React, { useState, useEffect } from 'react';
import Layout from '../layout/Layout';
import { Helmet } from "react-helmet";

const VtoraZadacha = () => {
    const [form, setForm] = useState({ x1: '', y1: '', x2: '', y2: '' });
    const [result, setResult] = useState(
        'Въведете координати и натиснете "Изчисли", за да видите резултатите тук.'
    );

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

    const handleChange = (e) => {
        setForm({ ...form, [e.target.id]: e.target.value });
    };

    const calculate = () => {
        const { x1, y1, x2, y2 } = form;
        const vals = [x1, y1, x2, y2].map(Number);
        if (vals.some(isNaN)) {
            alert('Моля, попълнете всички полета.');
            return;
        }

        const [X1, Y1, X2, Y2] = vals;
        const deltaX = X2 - X1;
        const deltaY = Y2 - Y1;
        const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2);
        const tangens = deltaY / deltaX;
        const arctanTab = Math.atan(Math.abs(tangens)) * 200 / Math.PI;

        let quadrant, alpha;
        if (deltaY >= 0 && deltaX >= 0) {
            quadrant = 1;
            alpha = arctanTab;
        } else if (deltaY >= 0 && deltaX < 0) {
            quadrant = 2;
            alpha = 200 - arctanTab;
        } else if (deltaY < 0 && deltaX < 0) {
            quadrant = 3;
            alpha = 200 + arctanTab;
        } else {
            quadrant = 4;
            alpha = 400 - arctanTab;
        }

        const output = `
X1 = ${X1}, Y1 = ${Y1}
X2 = ${X2}, Y2 = ${Y2}
-------------------------------------
ΔX = ${deltaX.toFixed(2)}
ΔY = ${deltaY.toFixed(2)}
tg = ${tangens.toFixed(6)}
arctg (таблично) = ${arctanTab.toFixed(4)} gon
Квадрант = ${quadrant}
-------------------------------------
α₁,₂ = ${alpha.toFixed(4)} gon
S₁,₂ = ${distance.toFixed(2)} m
    `;

        setResult(output);
    };

    const resetForm = () => {
        setForm({ x1: '', y1: '', x2: '', y2: '' });
        setResult(
            'Въведете координати и натиснете "Изчисли", за да видите резултатите тук.'
        );
    };

    return (
        <>
            <Helmet>
                <title>Втора основна задача – Изчисляване на ъгъл и разстояние между две точки | GeoSolver</title>
                <meta
                    name="description"
                    content="Онлайн калкулатор за изчисляване на ъгъл и разстояние между две точки по координати. Бързо и лесно геодезическо изчисление за професионалисти."
                />
                <meta
                    name="keywords"
                    content="геодезия, ъгъл между две точки, разстояние, геодезически калкулатор, координати, онлайн изчисления, тахиметрия, GNSS, аналитична геодезия"
                />
                <meta name="robots" content="index, follow" />
                <meta name="author" content="GeoSolver" />
            </Helmet>
            <Layout>
                <h1 style={{ textAlign: 'center', fontSize: '1.8em', marginTop: '1em' }}>
                    <i className="fas fa-compass" style={{ color: '#00c3ff', marginRight: '0.4em' }}></i>
                    ВТОРА ОСНОВНА ЗАДАЧА
                </h1>

                <div className="task-layout">
                    <div className="task-left">
                        <h2><i className="fas fa-edit"></i> Входни данни</h2>

                        <div className="form-group">
                            <label htmlFor="x1">X₁</label>
                            <input type="number" id="x1" value={form.x1} onChange={handleChange} step="any" />
                        </div>

                        <div className="form-group">
                            <label htmlFor="y1">Y₁</label>
                            <input type="number" id="y1" value={form.y1} onChange={handleChange} step="any" />
                        </div>

                        <div className="form-group">
                            <label htmlFor="x2">X₂</label>
                            <input type="number" id="x2" value={form.x2} onChange={handleChange} step="any" />
                        </div>

                        <div className="form-group">
                            <label htmlFor="y2">Y₂</label>
                            <input type="number" id="y2" value={form.y2} onChange={handleChange} step="any" />
                        </div>

                        <div className="btn-row">
                            <button onClick={calculate}>Изчисли</button>
                            <button onClick={resetForm}>Изчисти</button>
                        </div>
                    </div>

                    <div className="task-right">
                        <h2><i className="fas fa-chart-line"></i> Резултати</h2>
                        <div className="output">{result}</div>
                    </div>
                </div>
            </Layout>
        </>
    );
};

export default VtoraZadacha;
