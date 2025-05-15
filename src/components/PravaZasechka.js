import React, { useState } from 'react';
import './TaskLayout.css';
import Layout from './Layout';
import Breadcrumbs from './Breadcrumbs';
import jsPDF from 'jspdf';

const PravaZasechka = () => {
    const [form, setForm] = useState({ xA: '', yA: '', xB: '', yB: '', beta1: '', beta2: '' });
    const [result, setResult] = useState([]);
    const [fullLog, setFullLog] = useState([]);
    const [isDetailed, setIsDetailed] = useState(true);

    let delayCounter = 0; // Натрупващо се закъснение за ред по ред
    const stepDelay = 400; // Време между стъпките в ms

    const handleChange = (e) => {
        setForm({ ...form, [e.target.id]: e.target.value });
    };

    const copyToClipboard = () => {
        const plainText = fullLog.map(line => {
            const div = document.createElement('div');
            div.innerHTML = typeof line === 'string' ? line : line.props.children;
            return div.textContent;
        }).join('\n');
        navigator.clipboard.writeText(plainText).then(() => alert("Резултатът е копиран."));
    };

    const exportToPDF = () => {
        const doc = new jsPDF();
        let y = 10;
        fullLog.forEach((line, i) => {
            const div = document.createElement('div');
            div.innerHTML = typeof line === 'string' ? line : line.props.children;
            doc.text(div.textContent || '', 10, y);
            y += 7;
        });
        doc.save('prava_zasechka.pdf');
    };

    const logStep = (jsx) => {
        setFullLog((prev) => [...prev, jsx]);
        setTimeout(() => {
            setResult((prev) => [...prev, jsx]);
        }, delayCounter);
        delayCounter += stepDelay;
    };

    const calculate = () => {
        setResult([]);
        setFullLog([]);
        delayCounter = 0; // Рестартираме закъснението при ново изчисление

        const { xA, yA, xB, yB, beta1, beta2 } = form;
        const toNum = (v) => parseFloat(v);
        const round = (val, dec = 2) => Math.round(val * 10 ** dec) / 10 ** dec;
        const round4 = (val) => Math.round(val * 10000) / 10000;
        const toRad = (g) => g * 0.015708;

        const xA_ = toNum(xA), yA_ = toNum(yA), xB_ = toNum(xB), yB_ = toNum(yB);
        const beta1_ = toNum(beta1), beta2_ = toNum(beta2);

        if ([xA_, yA_, xB_, yB_, beta1_, beta2_].some(isNaN)) {
            alert("Моля, попълнете всички полета коректно.");
            return;
        }

        const dX = round(xB_ - xA_, 2);
        const dY = round(yB_ - yA_, 2);
        const alphaABTablic = round4(Math.abs(Math.atan(dY / dX) * (200 / Math.PI)));

        logStep(<div><strong>1)</strong> tgα<sub>AB</sub> = ΔY / ΔX = {dY} / {dX} → <em>Изчисляваме посоката AB</em></div>);
        logStep(<div>α<sub>AB</sub> таблично = <strong>{alphaABTablic}</strong> gon</div>);

        let alphaAB = 0;
        if (dY > 0 && dX > 0) alphaAB = alphaABTablic;
        else if (dY > 0 && dX < 0) alphaAB = 200 - alphaABTablic;
        else if (dY < 0 && dX < 0) alphaAB = 200 + alphaABTablic;
        else if (dY < 0 && dX > 0) alphaAB = 400 - alphaABTablic;

        logStep(<div>α<sub>AB</sub> = {round4(alphaAB)} gon (според квадрант)</div>);

        const sAB = round(Math.sqrt(Math.pow(xB_ - xA_, 2) + Math.pow(yB_ - yA_, 2)));
        logStep(<div>s<sub>AB</sub> = √(ΔX² + ΔY²) = <strong>{sAB}</strong> → <em>Дължина на страната AB</em></div>);

        const alphaBA = alphaAB > 200 ? alphaAB - 200 : alphaAB + 200;
        const alphaAP = round4(alphaAB - beta1_);
        const alphaBP = round4(alphaBA + beta2_);

        logStep(<><strong>2)</strong> α<sub>AP</sub> = α<sub>AB</sub> - β₁ = {round4(alphaAB)} - {beta1_} = <strong>{alphaAP}</strong> → <em>Посока към P от A</em></>);
        logStep(<div>α<sub>BP</sub> = α<sub>BA</sub> + β₂ = {round4(alphaBA)} + {beta2_} = <strong>{alphaBP}</strong> → <em>Посока към P от B</em></div>);

        const sAP = round((sAB * Math.sin(toRad(beta2_))) / Math.sin(toRad(beta1_ + beta2_)));
        const sBP = round((sAB * Math.sin(toRad(beta1_))) / Math.sin(toRad(beta1_ + beta2_)));

        logStep(<><strong>3)</strong> s<sub>AP</sub> = (s<sub>AB</sub>·sinβ₂) / sin(β₁ + β₂) = <strong>{sAP}</strong> → <em>Изчисляваме дължина от A до P</em></>);
        logStep(<div>s<sub>BP</sub> = (s<sub>AB</sub>·sinβ₁) / sin(β₁ + β₂) = <strong>{sBP}</strong> → <em>Изчисляваме дължина от B до P</em></div>);

        const xPrimP = xA_ + round(sAP * Math.cos(toRad(alphaAP)), 4);
        const yPrimP = yA_ + round(sAP * Math.sin(toRad(alphaAP)), 4);
        const xSecondP = xB_ + round(sBP * Math.cos(toRad(alphaBP)), 4);
        const ySecondP = yB_ + round(sBP * Math.sin(toRad(alphaBP)), 4);

        logStep(<><strong>4)</strong> ΔX<sub>AP</sub> = s<sub>AP</sub>·cos(α<sub>AP</sub>), ΔY<sub>AP</sub> = s<sub>AP</sub>·sin(α<sub>AP</sub>)</>);
        logStep(<div>ΔX<sub>BP</sub> = s<sub>BP</sub>·cos(α<sub>BP</sub>), ΔY<sub>BP</sub> = s<sub>BP</sub>·sin(α<sub>BP</sub>)</div>);

        const xP = round((xPrimP + xSecondP) / 2);
        const yP = round((yPrimP + ySecondP) / 2);

        logStep(<><strong>5)</strong> X' = {round(xPrimP, 2)}, X" = {round(xSecondP, 2)} → X = <strong>{xP}</strong></>);
        logStep(<div>Y' = {round(yPrimP, 2)}, Y" = {round(ySecondP, 2)} → Y = <strong>{yP}</strong></div>);
    };

    const resetForm = () => {
        setForm({ xA: '', yA: '', xB: '', yB: '', beta1: '', beta2: '' });
        setResult([]);
        setFullLog([]);
    };

    return (
        <Layout>
            <Breadcrumbs />
            <h1 style={{ textAlign: 'center', fontSize: '1.8em', marginTop: '1em' }}>
                <i className="fas fa-crosshairs" style={{ color: '#0d99ff', marginRight: '0.4em' }}></i>
                ПРАВА ЗАСЕЧКА
            </h1>
            <div className="task-layout">
                <div className="task-left">
                    <h2>Входни данни</h2>
                    {['yA', 'xA', 'yB', 'xB', 'beta1', 'beta2'].map((id) => (
                        <div className="form-group" key={id}>
                            <label htmlFor={id}>{id.toUpperCase()}</label>
                            <input type="number" id={id} value={form[id]} onChange={handleChange} step="any" />
                        </div>
                    ))}
                    <div className="btn-row">
                        <button onClick={calculate}>Изчисли</button>
                        <button onClick={resetForm}>Изчисти</button>
                        <button onClick={copyToClipboard}>Копирай резултата</button>
                        <button onClick={exportToPDF}>Запази като PDF</button>
                        <button onClick={() => setIsDetailed(!isDetailed)}>
                            {isDetailed ? 'Покажи само финал' : 'Покажи подробно'}
                        </button>
                    </div>
                </div>

                <div className="task-right">
                    <h2><i className="fas fa-chart-line"></i> Изчисления</h2>
                    <div className="output">
                        {(isDetailed ? result : fullLog.slice(-2)).map((line, index) => (
                            <div key={index} style={{ marginBottom: '6px' }}>{line}</div>
                        ))}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default PravaZasechka;
