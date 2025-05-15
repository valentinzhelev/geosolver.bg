import React, { useState, useEffect } from 'react';
import './TaskLayout.css';
import Layout from './Layout';
import Breadcrumbs from './Breadcrumbs';
import jsPDF from 'jspdf';
import { Helmet } from "react-helmet";

const PravaZasechka = () => {
    const initialMessage = ['Въведете данни и натиснете "Изчисли", за да видите резултати тук.'];

    const [form, setForm] = useState({ xA: '', yA: '', xB: '', yB: '', beta1: '', beta2: '' });
    const [fullLines, setFullLines] = useState(initialMessage);
    const [linesToAnimate, setLinesToAnimate] = useState(initialMessage);
    const [displayedLines, setDisplayedLines] = useState([]);
    const [currentLine, setCurrentLine] = useState(0);
    const [currentCharIndex, setCurrentCharIndex] = useState(0);
    const [isDetailed, setIsDetailed] = useState(true);
    const [animationDone, setAnimationDone] = useState(false);

    const stepDelay = 30;

    useEffect(() => {
        if (currentLine < linesToAnimate.length) {
            if (currentCharIndex <= linesToAnimate[currentLine].length) {
                const timer = setTimeout(() => {
                    const newText = linesToAnimate[currentLine].slice(0, currentCharIndex);
                    setDisplayedLines((prev) => {
                        const copy = [...prev];
                        copy[currentLine] = newText;
                        return copy;
                    });
                    setCurrentCharIndex(currentCharIndex + 1);
                }, stepDelay);

                return () => clearTimeout(timer);
            } else {
                setCurrentLine(currentLine + 1);
                setCurrentCharIndex(0);
            }
        } else {
            // Когато анимацията достигне края, маркираме като завършена
            setAnimationDone(true);
        }
    }, [currentCharIndex, currentLine, linesToAnimate]);

    // Управление на показваните редове при смяна на режим (подробен / финал)
    useEffect(() => {
        if (!animationDone) {
            if (isDetailed) {
                setLinesToAnimate(fullLines);
            } else {
                setLinesToAnimate(fullLines.length > 0 ? [fullLines[fullLines.length - 2], fullLines[fullLines.length - 1]] : []);
            }
            setDisplayedLines([]);
            setCurrentLine(0);
            setCurrentCharIndex(0);
        } else {
            // Ако анимацията вече е направена, просто превключваме без анимация
            if (isDetailed) {
                setDisplayedLines(fullLines);
            } else {
                setDisplayedLines(fullLines.length > 0 ? [fullLines[fullLines.length - 2], fullLines[fullLines.length - 1]] : []);
            }
        }
    }, [isDetailed, fullLines, animationDone]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.id]: e.target.value });
    };

    const copyToClipboard = () => {
        const plainText = displayedLines.join('\n');
        navigator.clipboard.writeText(plainText).then(() => alert("Резултатът е копиран."));
    };

    const exportToPDF = () => {
        const doc = new jsPDF();
        let y = 10;

        displayedLines.forEach((line) => {
            doc.text(line, 10, y);
            y += 7;
        });

        doc.save('prava_zasechka.pdf');
    };

    const calculate = () => {
        setAnimationDone(false);  // ресетваме флага при ново изчисление
        setDisplayedLines([]);
        setCurrentLine(0);
        setCurrentCharIndex(0);

        const { xA, yA, xB, yB, beta1, beta2 } = form;
        const toNum = (v) => parseFloat(v);
        const round = (val, dec = 2) => Math.round(val * 10 ** dec) / 10 ** dec;
        const round4 = (val) => Math.round(val * 10000) / 10000;
        const round3 = (val) => Math.round(val * 1000) / 1000; // нов метод за 3 знака след запетая
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

        const lines = [
            `1) tg\u03B1\u2090\u2091 = \u0394Y / \u0394X = ${dY} / ${dX} → Изчисляваме посоката AB`,
            `α\u2090\u2091 таблично = ${alphaABTablic} gon`,
        ];

        let alphaAB = 0;
        if (dY > 0 && dX > 0) alphaAB = alphaABTablic;
        else if (dY > 0 && dX < 0) alphaAB = 200 - alphaABTablic;
        else if (dY < 0 && dX < 0) alphaAB = 200 + alphaABTablic;
        else if (dY < 0 && dX > 0) alphaAB = 400 - alphaABTablic;

        lines.push(`α\u2090\u2091 = ${round4(alphaAB)} gon (според квадрант)`);

        const sAB = round(Math.sqrt(Math.pow(xB_ - xA_, 2) + Math.pow(yB_ - yA_, 2)));
        lines.push(`s\u2090\u2091 = √(ΔX² + ΔY²) = ${sAB} → Дължина на страната AB`);

        const alphaBA = alphaAB > 200 ? alphaAB - 200 : alphaAB + 200;
        const alphaAP = round4(alphaAB - beta1_);
        const alphaBP = round4(alphaBA + beta2_);

        lines.push(`2) α\u2090P = α\u2090\u2091 - β₁ = ${round4(alphaAB)} - ${beta1_} = ${alphaAP} → Посока към P от A`);
        lines.push(`α\u2090P = α\u2090A + β₂ = ${round4(alphaBA)} + ${beta2_} = ${alphaBP} → Посока към P от B`);

        const sAP = round((sAB * Math.sin(toRad(beta2_))) / Math.sin(toRad(beta1_ + beta2_)));
        const sBP = round((sAB * Math.sin(toRad(beta1_))) / Math.sin(toRad(beta1_ + beta2_)));

        lines.push(`3) s\u2090P = (s\u2090\u2091·sinβ₂) / sin(β₁ + β₂) = ${sAP} → Изчисляваме дължина от A до P`);
        lines.push(`s\u2090P = (s\u2090\u2091·sinβ₁) / sin(β₁ + β₂) = ${sBP} → Изчисляваме дължина от B до P`);

        const xPrimP = xA_ + round(sAP * Math.cos(toRad(alphaAP)), 4);
        const yPrimP = yA_ + round(sAP * Math.sin(toRad(alphaAP)), 4);
        const xSecondP = xB_ + round(sBP * Math.cos(toRad(alphaBP)), 4);
        const ySecondP = yB_ + round(sBP * Math.sin(toRad(alphaBP)), 4);

        lines.push(`4) ΔX\u2090P = s\u2090P·cos(α\u2090P), ΔY\u2090P = s\u2090P·sin(α\u2090P)`);
        lines.push(`ΔX\u2090P = s\u2090P·cos(α\u2090P), ΔY\u2090P = s\u2090P·sin(α\u2090P)`);

        const xP = round3((xPrimP + xSecondP) / 2);
        const yP = round3((yPrimP + ySecondP) / 2);

        lines.push(`5a) X' = ${round(xPrimP, 2)}, X" = ${round(xSecondP, 2)} → X = ${xP}`);
        lines.push(`5b) Y' = ${round(yPrimP, 2)}, Y" = ${round(ySecondP, 2)} → Y = ${yP}`);

        setFullLines(lines);

        if (!isDetailed) {
            setLinesToAnimate(lines.slice(-2));
        } else {
            setLinesToAnimate(lines);
        }
    };

    const resetForm = () => {
        setForm({ xA: '', yA: '', xB: '', yB: '', beta1: '', beta2: '' });
        setFullLines(initialMessage);
        setLinesToAnimate(initialMessage);
        setDisplayedLines([]);
        setCurrentLine(0);
        setCurrentCharIndex(0);
        setAnimationDone(false);
    };

    return (
        <>
            <Helmet>
                <title>Права засечка – Геодезически калкулатор | GeoSolver</title>
                <meta
                    name="description"
                    content="Онлайн калкулатор за права засечка – изчисляване на координати чрез посока и разстояние от известна точка. Точни и бързи геодезически изчисления."
                />
                <meta
                    name="keywords"
                    content="права засечка, геодезически калкулатор, координати, геодезия, тахиметрия, геодезически изчисления, онлайн геодезия, GNSS, координатни системи"
                />
                <meta name="robots" content="index, follow" />
                <meta name="author" content="GeoSolver" />
            </Helmet>
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
                            {displayedLines.length > 0
                                ? displayedLines.map((line, index) => (
                                    <div key={index} style={{ marginBottom: '6px' }}>
                                        {line}
                                    </div>
                                ))
                                : initialMessage.map((line, index) => (
                                    <div key={index} style={{ marginBottom: '6px' }}>
                                        {line}
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            </Layout>
        </>
    );
};

export default PravaZasechka;
