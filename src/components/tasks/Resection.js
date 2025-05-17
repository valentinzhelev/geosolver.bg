import React, { useState, useEffect } from 'react';
import './TaskLayout.css';
import Layout from '../layout/Layout';
import Breadcrumbs from '../layout/Breadcrumbs';
import jsPDF from 'jspdf';
import { Helmet } from "react-helmet";

const ObratnaZasechka = () => {
    const initialMessage = ['Въведете данни и натиснете "Изчисли", за да видите резултати тук.'];

    const [form, setForm] = useState({
        xA: '', yA: '',
        xB: '', yB: '',
        xC: '', yC: '',
        beta1: '', beta2: ''
    });
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
            setAnimationDone(true);
        }
    }, [currentCharIndex, currentLine, linesToAnimate]);

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
        doc.save('obratna_zasechka.pdf');
    };

    const calculate = () => {
        setAnimationDone(false);
        setDisplayedLines([]);
        setCurrentLine(0);
        setCurrentCharIndex(0);

        const {
            xA, yA,
            xB, yB,
            xC, yC,
            beta1, beta2
        } = form;

        const toNum = (v) => parseFloat(v);
        const round3 = (v) => Math.round(v * 1000) / 1000;
        const toRad = (g) => g * (Math.PI / 200); // градуси в радиани (град)

        const XA = toNum(xA), YA = toNum(yA);
        const XB = toNum(xB), YB = toNum(yB);
        const XC = toNum(xC), YC = toNum(yC);
        const b1 = toNum(beta1), b2 = toNum(beta2);

        if ([XA, YA, XB, YB, XC, YC, b1, b2].some(isNaN)) {
            alert("Моля, попълнете всички полета коректно.");
            return;
        }

        // Изчисляваме разстоянията между точки A и C:
        const SAC = Math.sqrt((XA - XC) ** 2 + (YA - YC) ** 2);

        // Изчисляваме ъглите αАК и αСК (на база координати):
        const alphaAC = Math.atan2(YC - YA, XC - XA) * (200 / Math.PI);
        const alphaCA = Math.atan2(YA - YC, XA - XC) * (200 / Math.PI);

        // Корекция ъгли, ако са отрицателни:
        const fixAngle = (a) => (a < 0 ? a + 400 : a);
        const alfaAK = fixAngle(alphaAC);
        const alfaCK = fixAngle(alphaCA);

        // Изчисляване на дължините SAK и SCK по синусова теорема:
        const SAK = SAC * Math.sin(toRad(b1)) / Math.sin(toRad(b1 + b2));
        const SCK = SAC * Math.sin(toRad(b2)) / Math.sin(toRad(b1 + b2));

        // Координати на точка K (помощна точка):
        const XK1 = XA + SAK * Math.cos(alfaAK * Math.PI / 200);
        const YK1 = YA + SAK * Math.sin(alfaAK * Math.PI / 200);
        const XK2 = XC + SCK * Math.cos(alfaCK * Math.PI / 200);
        const YK2 = YC + SCK * Math.sin(alfaCK * Math.PI / 200);

        // Средни координати на K:
        const XK = (XK1 + XK2) / 2;
        const YK = (YK1 + YK2) / 2;

        // Ъгли δ1 и δ2 за изчисление на P:
        const delta1 = alfaAK - b1;
        const delta2 = alfaCK + b2;

        // Координати на търсената точка P:
        const XP1 = XK + SAK * Math.cos(delta1 * Math.PI / 200);
        const YP1 = YK + SAK * Math.sin(delta1 * Math.PI / 200);
        const XP2 = XK + SCK * Math.cos(delta2 * Math.PI / 200);
        const YP2 = YK + SCK * Math.sin(delta2 * Math.PI / 200);

        // Средни координати на P:
        const XP = round3((XP1 + XP2) / 2);
        const YP = round3((YP1 + YP2) / 2);

        const lines = [
            `1) Изчисляваме ъгъл αАК: ${round3(alfaAK)} gon`,
            `2) Изчисляваме ъгъл αСК: ${round3(alfaCK)} gon`,
            `3) Дължина на отсечката AC: ${round3(SAC)} m`,
            `4) Изчисляваме дължините SAK и SCK чрез синусовата теорема:`,
            `   SAK = SAC * sinβ₁ / sin(β₁ + β₂) = ${round3(SAK)} m`,
            `   SCK = SAC * sinβ₂ / sin(β₁ + β₂) = ${round3(SCK)} m`,
            `5) Изчисляваме координатите на помощната точка K:`,
            `   XK = ${round3(XK)} m, YK = ${round3(YK)} m`,
            `6) Изчисляваме ъглите δ₁ и δ₂:`,
            `   δ₁ = αАК - β₁ = ${round3(delta1)} gon`,
            `   δ₂ = αСК + β₂ = ${round3(delta2)} gon`,
            `7) Изчисляваме координатите на търсената точка P:`,
            `   X_P1 = ${round3(XP1)} m, Y_P1 = ${round3(YP1)} m`,
            `   X_P2 = ${round3(XP2)} m, Y_P2 = ${round3(YP2)} m`,
            `8) Средни координати на P:`,
            `   X_P = ${XP} m, Y_P = ${YP} m`
        ];

        setFullLines(lines);
        if (!isDetailed) {
            setLinesToAnimate(lines.slice(-4));
        } else {
            setLinesToAnimate(lines);
        }
    };

    const resetForm = () => {
        setForm({
            xA: '', yA: '',
            xB: '', yB: '',
            xC: '', yC: '',
            beta1: '', beta2: ''
        });
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
                <title>Обратна засечка – Геодезически калкулатор | GeoSolver</title>
                <meta
                    name="description"
                    content="Онлайн калкулатор за обратна засечка – изчисляване на координати чрез ъгли към известни точки. Точни и бързи геодезически изчисления."
                />
                <meta
                    name="keywords"
                    content="обратна засечка, геодезически калкулатор, координати, геодезия, триангулация, геодезически изчисления, онлайн геодезия, GNSS, координатни системи"
                />
                <meta name="robots" content="index, follow" />
                <meta name="author" content="GeoSolver" />
            </Helmet>
            <Layout>
                <Breadcrumbs />
                <h1 style={{ textAlign: 'center', fontSize: '1.8em', marginTop: '1em' }}>
                    <i className="fas fa-crosshairs" style={{ color: '#0d99ff', marginRight: '0.4em' }}></i>
                    ОБРАТНА ЗАСЕЧКА
                </h1>
                <div className="task-layout">
                    <div className="task-left">
                        <h2>Входни данни</h2>
                        {['xA', 'yA', 'xB', 'yB', 'xC', 'yC', 'beta1', 'beta2'].map((id) => (
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

export default ObratnaZasechka;
