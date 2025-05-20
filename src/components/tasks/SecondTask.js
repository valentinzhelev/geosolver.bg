import React, { useState, useEffect } from 'react';
import Layout from '../layout/Layout';
import { Helmet } from "react-helmet";

const getHistory = () => {
    const data = localStorage.getItem('secondTaskHistory');
    return data ? JSON.parse(data) : [];
};
const saveHistory = (entry) => {
    const history = getHistory();
    history.unshift(entry);
    localStorage.setItem('secondTaskHistory', JSON.stringify(history.slice(0, 20)));
};

const VtoraZadacha = () => {
    const [form, setForm] = useState({ x1: '', y1: '', x2: '', y2: '' });
    const [result, setResult] = useState(
        'Въведете координати и натиснете "Изчисли", за да видите резултатите тук.'
    );
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

    useEffect(() => {
        setHistory(getHistory());
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
        const entry = {
            x1: X1,
            y1: Y1,
            x2: X2,
            y2: Y2,
            alpha: alpha.toFixed(4),
            s: distance.toFixed(2),
            date: new Date().toISOString(),
        };
        saveHistory(entry);
        setHistory(getHistory());
    };

    const resetForm = () => {
        setForm({ x1: '', y1: '', x2: '', y2: '' });
        setResult(
            'Въведете координати и натиснете "Изчисли", за да видите резултатите тук.'
        );
    };

    // Table headers for both layouts
    const tableHeaders = [
        { key: 'x1', label: 'X₁' },
        { key: 'y1', label: 'Y₁' },
        { key: 'x2', label: 'X₂' },
        { key: 'y2', label: 'Y₂' },
        { key: 'alpha', label: 'α' },
        { key: 's', label: 'S' },
        { key: 'date', label: 'Дата' },
    ];

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
                {/* MOBILE LAYOUT */}
                <div className="block md:hidden w-full max-w-md mx-auto min-h-screen bg-stone-50 relative px-4 py-4">
                    <div className="flex flex-col justify-start items-start gap-6 w-full">
                        <div className="self-stretch flex flex-col justify-start items-start gap-1">
                            <div className="inline-flex items-center gap-3 w-full">
                                <button className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-200 text-black focus:outline-none">
                                    <svg width="20" height="20" fill="none" viewBox="0 0 20 20"><path d="M13 15l-5-5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                </button>
                                <span className="text-black text-2xl font-bold font-['Manrope']">Втора основна задача</span>
                            </div>
                        </div>
                        {/* Tab group above the form card - use desktop design, but only as wide as content */}
                        <div className="p-1.5 bg-white rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex justify-start items-center gap-2 mb-2">
                            <div data-property-1="Default" className="px-3 py-1 bg-gray-200 rounded flex justify-center items-center gap-2.5">
                                <div className="justify-start text-black text-base font-medium font-['Manrope']">Инструмент</div>
                            </div>
                            <div data-property-1="Default" className="px-3 py-1 rounded flex justify-center items-center gap-2.5">
                                <div className="justify-start text-neutral-400 text-base font-medium font-['Manrope']">Документация</div>
                            </div>
                        </div>
                        <div className="self-stretch flex flex-col justify-start items-start gap-10 w-full">
                            <div className="self-stretch flex flex-col justify-start items-start gap-5 w-full">
                                {/* Form Card */}
                                <div className="self-stretch p-3 bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 flex flex-col justify-center items-end gap-3 w-full">
                                    <div className="self-stretch justify-start text-black text-base font-semibold font-['Manrope']">Входни данни</div>
                                    <div className="self-stretch flex flex-col justify-start items-start gap-4 w-full">
                                        <div className="self-stretch flex flex-col justify-start items-start gap-2 w-full">
                                            <div className="justify-start text-black text-xs font-medium font-['Manrope']">X₁</div>
                                            <input type="number" id="x1" value={form.x1} onChange={handleChange} step="any" className="self-stretch p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 text-neutral-400 text-xs font-medium font-['Manrope']" placeholder="Въведете X₁" />
                                        </div>
                                        <div className="self-stretch flex flex-col justify-start items-start gap-2 w-full">
                                            <div className="justify-start text-black text-xs font-medium font-['Manrope']">Y₁</div>
                                            <input type="number" id="y1" value={form.y1} onChange={handleChange} step="any" className="self-stretch p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 text-neutral-400 text-xs font-medium font-['Manrope']" placeholder="Въведете Y₁" />
                                        </div>
                                        <div className="self-stretch flex flex-col justify-start items-start gap-2 w-full">
                                            <div className="justify-start text-black text-xs font-medium font-['Manrope']">X₂</div>
                                            <input type="number" id="x2" value={form.x2} onChange={handleChange} step="any" className="self-stretch p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 text-neutral-400 text-xs font-medium font-['Manrope']" placeholder="Въведете X₂" />
                                        </div>
                                        <div className="self-stretch flex flex-col justify-start items-start gap-2 w-full">
                                            <div className="justify-start text-black text-xs font-medium font-['Manrope']">Y₂</div>
                                            <input type="number" id="y2" value={form.y2} onChange={handleChange} step="any" className="self-stretch p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 text-neutral-400 text-xs font-medium font-['Manrope']" placeholder="Въведете Y₂" />
                                        </div>
                                    </div>
                                    <div className="inline-flex justify-end items-center gap-3 w-full">
                                        <button type="button" onClick={resetForm} className="px-4 py-2 bg-gray-200 rounded-lg flex justify-start items-center gap-3">
                                            <div className="justify-start text-black text-sm font-medium font-['Manrope']">Нулирай</div>
                                        </button>
                                        <button type="button" onClick={calculate} className="px-4 py-2 bg-black rounded-lg flex justify-start items-center gap-3">
                                            <div className="justify-start text-white text-sm font-medium font-['Manrope']">Изчисли</div>
                                            <img src="/white_right_arrow.svg" alt="Изчисли" className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                {/* Results Card */}
                                <div className="self-stretch p-3 bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 flex flex-col justify-center items-end gap-3 w-full">
                                    <div className="self-stretch justify-start text-black text-base font-semibold font-['Manrope']">Резултати</div>
                                    <div className="self-stretch p-3 bg-stone-50 rounded-lg flex flex-col justify-start items-start w-full">
                                        <div className="self-stretch justify-start text-neutral-400 text-sm font-medium font-['Manrope'] whitespace-pre-line">{result}</div>
                                    </div>
                                    <button
                                        type="button"
                                        className={`px-4 py-2 ${!result || result.includes('Въведете координати') ? 'opacity-20 cursor-not-allowed' : ''} bg-gray-200 rounded-lg inline-flex justify-start items-center gap-3`}
                                        disabled={!result || result.includes('Въведете координати')}
                                    >
                                        <img src="/download_icon.svg" alt="Изтегли" className="w-4 h-4" />
                                        <div className="justify-start text-black text-base font-medium font-['Manrope']">Изтегли</div>
                                    </button>
                                </div>
                            </div>
                            {/* History Table */}
                            <div className="self-stretch flex flex-col justify-start items-start gap-3">
                                <div className="justify-start text-black text-lg font-bold font-['Manrope']">История на изчисленията</div>
                                <div className="self-stretch flex flex-col justify-start items-start gap-2.5">
                                    <div className="w-full overflow-x-auto">
                                        <div className="min-w-[800px] self-stretch rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-100 flex flex-col justify-start items-start overflow-hidden">
                                            <div className="self-stretch shadow-[0px_8px_24px_0px_rgba(0,0,0,0.04)] inline-flex justify-start items-start gap-px bg-white">
                                                <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5 border-r border-gray-100">
                                                    <div className="justify-start text-black text-sm font-medium font-['Manrope']">Y₁</div>
                                                </div>
                                                <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5 border-r border-gray-100">
                                                    <div className="justify-start text-black text-sm font-medium font-['Manrope']">X₁</div>
                                                </div>
                                                <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5 border-r border-gray-100">
                                                    <div className="justify-start text-black text-sm font-medium font-['Manrope']">α</div>
                                                </div>
                                                <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5 border-r border-gray-100">
                                                    <div className="justify-start text-black text-sm font-medium font-['Manrope']">S</div>
                                                </div>
                                                <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5 border-r border-gray-100">
                                                    <div className="justify-start text-black text-sm font-medium font-['Manrope']">Y₂</div>
                                                </div>
                                                <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5 border-r border-gray-100">
                                                    <div className="justify-start text-black text-sm font-medium font-['Manrope']">X₂</div>
                                                </div>
                                                <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5 border-r border-gray-100">
                                                    <div className="justify-start text-black text-sm font-medium font-['Manrope']">Дата</div>
                                                </div>
                                                <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                                                    <div className="justify-start text-black text-sm font-medium font-['Manrope']">Изтегли</div>
                                                </div>
                                            </div>
                                            {history.length === 0 ? (
                                                <div className="w-full px-3 py-2 bg-[#FAFAFA] text-neutral-400 text-sm font-medium font-['Manrope'] border-b border-gray-100">Няма изчисления.</div>
                                            ) : (
                                                history.map((entry, idx) => (
                                                    <div key={idx} className="self-stretch inline-flex justify-start items-start">
                                                        <div className="flex-1 px-3 py-2 bg-[#FAFAFA] flex justify-center items-center border-r border-b border-gray-100 gap-2.5">
                                                            <div className="justify-start text-neutral-400 text-sm font-medium font-['Manrope']">{entry.y1 ?? ''}</div>
                                                        </div>
                                                        <div className="flex-1 px-3 py-2 bg-[#FAFAFA] flex justify-center items-center border-r border-b border-gray-100 gap-2.5">
                                                            <div className="justify-start text-neutral-400 text-sm font-medium font-['Manrope']">{entry.x1 ?? ''}</div>
                                                        </div>
                                                        <div className="flex-1 px-3 py-2 bg-[#FAFAFA] flex justify-center items-center border-r border-b border-gray-100 gap-2.5">
                                                            <div className="justify-start text-neutral-400 text-sm font-medium font-['Manrope']">{entry.alpha ?? ''}</div>
                                                        </div>
                                                        <div className="flex-1 px-3 py-2 bg-[#FAFAFA] flex justify-center items-center border-r border-b border-gray-100 gap-2.5">
                                                            <div className="justify-start text-neutral-400 text-sm font-medium font-['Manrope']">{entry.s ?? ''}</div>
                                                        </div>
                                                        <div className="flex-1 px-3 py-2 bg-[#FAFAFA] flex justify-center items-center border-r border-b border-gray-100 gap-2.5">
                                                            <div className="justify-start text-neutral-400 text-sm font-medium font-['Manrope']">{entry.y2 ?? ''}</div>
                                                        </div>
                                                        <div className="flex-1 px-3 py-2 bg-[#FAFAFA] flex justify-center items-center border-r border-b border-gray-100 gap-2.5">
                                                            <div className="justify-start text-neutral-400 text-sm font-medium font-['Manrope']">{entry.x2 ?? ''}</div>
                                                        </div>
                                                        <div className="flex-1 px-3 py-2 bg-[#FAFAFA] flex justify-center items-center border-r border-b border-gray-100 gap-2.5">
                                                            <div className="justify-start text-neutral-400 text-sm font-medium font-['Manrope']">{entry.date ? (() => { const d = new Date(entry.date); return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth()+1).toString().padStart(2, '0')}/${d.getFullYear()}` })() : ''}</div>
                                                        </div>
                                                        <div className="flex-1 self-stretch px-3 py-2 bg-[#FAFAFA] flex justify-center items-center border-b border-gray-100 gap-2.5">
                                                            <button type="button" className="w-5 h-5 flex items-center justify-center rounded bg-gray-100 opacity-50 cursor-not-allowed">
                                                                <img src="/download_icon.svg" alt="Изтегли" className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="self-stretch inline-flex justify-center items-center gap-4 w-full mt-2">
                                    <div className="flex justify-start items-center gap-2">
                                        <div className="w-7 self-stretch px-2 py-1 rounded inline-flex flex-col justify-center items-center">
                                            <img src="/small_left_arrow.svg" alt="Назад" className="w-3 h-3" />
                                        </div>
                                        <div className="w-7 px-2 py-1 bg-gray-200 rounded inline-flex flex-col justify-center items-center">
                                            <div className="justify-start text-black text-sm font-medium font-['Manrope']">1</div>
                                        </div>
                                        <div className="w-7 px-2 py-1 rounded outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex flex-col justify-center items-center">
                                            <div className="justify-start text-neutral-400 text-sm font-medium font-['Manrope']">2</div>
                                        </div>
                                        <div className="w-7 px-2 py-1 rounded outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex flex-col justify-center items-center">
                                            <div className="justify-start text-neutral-400 text-sm font-medium font-['Manrope']">3</div>
                                        </div>
                                        <div className="w-7 px-2 py-1 rounded outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex flex-col justify-center items-center">
                                            <div className="justify-start text-neutral-400 text-sm font-medium font-['Manrope']">4</div>
                                        </div>
                                        <div className="w-7 px-2 py-1 rounded outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex flex-col justify-center items-center">
                                            <div className="justify-start text-neutral-400 text-sm font-medium font-['Manrope']">5</div>
                                        </div>
                                        <div className="w-7 self-stretch px-2 py-1 rounded inline-flex flex-col justify-center items-center">
                                            <img src="/small_right_arrow.svg" alt="Напред" className="w-3 h-3" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* DESKTOP LAYOUT */}
                <div className="hidden md:flex w-[1180px] mx-auto my-10 flex-col justify-start items-start gap-10">
                    <div className="self-stretch flex flex-col justify-center items-start gap-10">
                        {/* Breadcrumbs and Title */}
                        <div className="w-[580px] flex flex-col justify-start items-start gap-4">
                            <div className="flex flex-col justify-start items-start gap-1">
                                <div className="justify-start"><span className="text-neutral-400 text-base font-medium font-['Manrope'] underline">Инструменти</span><span className="text-neutral-400 text-base font-medium font-['Manrope']"> &gt; Втора основна задача</span></div>
                                <div className="justify-start text-black text-3xl font-bold font-['Manrope']">Втора основна задача</div>
                            </div>
                            <div className="p-1.5 bg-white rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex justify-start items-center gap-2">
                                <div data-property-1="Default" className="px-3 py-1 bg-gray-200 rounded flex justify-center items-center gap-2.5">
                                    <div className="justify-start text-black text-base font-medium font-['Manrope']">Инструмент</div>
                                </div>
                                <div data-property-1="Default" className="px-3 py-1 rounded flex justify-center items-center gap-2.5">
                                    <div className="justify-start text-neutral-400 text-base font-medium font-['Manrope']">Документация</div>
                                </div>
                            </div>
                        </div>
                        {/* Form and Results */}
                        <div className="self-stretch inline-flex justify-start items-start gap-5">
                            {/* Form Card */}
                            <div className="flex-1 p-4 bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex flex-col justify-center items-end gap-4">
                                <div className="self-stretch justify-start text-black text-lg font-semibold font-['Manrope']">Входни данни</div>
                                <div className="self-stretch flex flex-col justify-start items-start gap-4">
                                    <div className="self-stretch flex flex-col justify-start items-start gap-2">
                                        <div className="justify-start text-black text-sm font-medium font-['Manrope']">X₁</div>
                                        <input type="number" id="x1" value={form.x1} onChange={handleChange} step="any" className="self-stretch p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 text-neutral-400 text-sm font-medium font-['Manrope']" placeholder="Въведете X₁" />
                                    </div>
                                    <div className="self-stretch flex flex-col justify-start items-start gap-2">
                                        <div className="justify-start text-black text-sm font-medium font-['Manrope']">Y₁</div>
                                        <input type="number" id="y1" value={form.y1} onChange={handleChange} step="any" className="self-stretch p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 text-neutral-400 text-sm font-medium font-['Manrope']" placeholder="Въведете Y₁" />
                                    </div>
                                    <div className="self-stretch flex flex-col justify-start items-start gap-2">
                                        <div className="justify-start text-black text-sm font-medium font-['Manrope']">X₂</div>
                                        <input type="number" id="x2" value={form.x2} onChange={handleChange} step="any" className="self-stretch p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 text-neutral-400 text-sm font-medium font-['Manrope']" placeholder="Въведете X₂" />
                                    </div>
                                    <div className="self-stretch flex flex-col justify-start items-start gap-2">
                                        <div className="justify-start text-black text-sm font-medium font-['Manrope']">Y₂</div>
                                        <input type="number" id="y2" value={form.y2} onChange={handleChange} step="any" className="self-stretch p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 text-neutral-400 text-sm font-medium font-['Manrope']" placeholder="Въведете Y₂" />
                                    </div>
                                </div>
                                <div className="inline-flex justify-start items-start gap-3">
                                    {/* Scan button (inactive, with tooltip) */}
                                    <button
                                        type="button"
                                        aria-disabled="true"
                                        title="Тази функция е в процес на разработка и интеграция."
                                        className="px-4 py-2 bg-gray-200 rounded-lg flex justify-start items-center gap-3 opacity-50 select-none cursor-not-allowed"
                                    >
                                        <img src="/scan_icon.svg" alt="Сканирай" className="w-4 h-4" />
                                        <span className="justify-start text-black text-base font-medium font-['Manrope']">Сканирай</span>
                                    </button>
                                    {/* Reset button */}
                                    <button type="button" onClick={resetForm} className="px-4 py-2 bg-gray-200 rounded-lg flex justify-start items-center gap-3">
                                        <div className="justify-start text-black text-base font-medium font-['Manrope']">Нулирай</div>
                                    </button>
                                    {/* Calculate button */}
                                    <button type="button" onClick={calculate} className="px-4 py-2 bg-black rounded-lg flex justify-start items-center gap-3">
                                        <div className="justify-start text-white text-base font-medium font-['Manrope']">Изчисли</div>
                                        <img src="/white_right_arrow.svg" alt="Изчисли" className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            {/* Results Card */}
                            <div className="flex-1 self-stretch p-4 bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex flex-col justify-center items-end gap-3">
                                <div className="self-stretch justify-start text-black text-lg font-semibold font-['Manrope']">Резултати</div>
                                <div className="self-stretch flex-1 p-3 bg-stone-50 rounded-lg flex flex-col justify-start items-start">
                                    <div className="self-stretch justify-start text-neutral-400 text-sm font-medium font-['Manrope'] whitespace-pre-line">{result}</div>
                                </div>
                                <button
                                    type="button"
                                    className={`px-4 py-2 ${!result || result.includes('Въведете координати') ? 'opacity-20 cursor-not-allowed' : ''} bg-gray-200 rounded-lg inline-flex justify-start items-center gap-3`}
                                    disabled={!result || result.includes('Въведете координати')}
                                >
                                    <img src="/download_icon.svg" alt="Изтегли" className="w-4 h-4" />
                                    <div className="justify-start text-black text-base font-medium font-['Manrope']">Изтегли</div>
                                </button>
                            </div>
                        </div>
                        {/* History Table */}
                        <div className="self-stretch inline-flex flex-col justify-start items-start gap-4">
                            <div className="justify-start text-black text-2xl font-bold font-['Manrope']">История на изчисленията</div>
                            <div className="self-stretch rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-100 flex flex-col justify-start items-start gap-px overflow-hidden">
                                <div className="self-stretch shadow-[0px_8px_24px_0px_rgba(0,0,0,0.04)] inline-flex justify-start items-start gap-px bg-white">
                                    <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5 border-r border-gray-100">
                                        <div className="justify-start text-black text-sm font-medium font-['Manrope']">Y₁</div>
                                    </div>
                                    <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5 border-r border-gray-100">
                                        <div className="justify-start text-black text-sm font-medium font-['Manrope']">X₁</div>
                                    </div>
                                    <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5 border-r border-gray-100">
                                        <div className="justify-start text-black text-sm font-medium font-['Manrope']">α</div>
                                    </div>
                                    <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5 border-r border-gray-100">
                                        <div className="justify-start text-black text-sm font-medium font-['Manrope']">S</div>
                                    </div>
                                    <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5 border-r border-gray-100">
                                        <div className="justify-start text-black text-sm font-medium font-['Manrope']">Y₂</div>
                                    </div>
                                    <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5 border-r border-gray-100">
                                        <div className="justify-start text-black text-sm font-medium font-['Manrope']">X₂</div>
                                    </div>
                                    <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5 border-r border-gray-100">
                                        <div className="justify-start text-black text-sm font-medium font-['Manrope']">Дата</div>
                                    </div>
                                    <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                                        <div className="justify-start text-black text-sm font-medium font-['Manrope']">Изтегли</div>
                                    </div>
                                </div>
                                {history.length === 0 ? (
                                    <div className="w-full px-3 py-2 bg-[#FAFAFA] text-neutral-400 text-sm font-medium font-['Manrope'] border-b border-gray-100">Няма изчисления.</div>
                                ) : (
                                    history.map((entry, idx) => (
                                        <div key={idx} className="self-stretch inline-flex justify-start items-start gap-px">
                                            <div className="flex-1 px-3 py-2 bg-[#FAFAFA] flex justify-center items-center gap-2.5 border-r border-b border-gray-100">
                                                <div className="justify-start text-neutral-400 text-sm font-medium font-['Manrope']">{entry.y1 ?? ''}</div>
                                            </div>
                                            <div className="flex-1 px-3 py-2 bg-[#FAFAFA] flex justify-center items-center gap-2.5 border-r border-b border-gray-100">
                                                <div className="justify-start text-neutral-400 text-sm font-medium font-['Manrope']">{entry.x1 ?? ''}</div>
                                            </div>
                                            <div className="flex-1 px-3 py-2 bg-[#FAFAFA] flex justify-center items-center gap-2.5 border-r border-b border-gray-100">
                                                <div className="justify-start text-neutral-400 text-sm font-medium font-['Manrope']">{entry.alpha ?? ''}</div>
                                            </div>
                                            <div className="flex-1 px-3 py-2 bg-[#FAFAFA] flex justify-center items-center gap-2.5 border-r border-b border-gray-100">
                                                <div className="justify-start text-neutral-400 text-sm font-medium font-['Manrope']">{entry.s ?? ''}</div>
                                            </div>
                                            <div className="flex-1 px-3 py-2 bg-[#FAFAFA] flex justify-center items-center gap-2.5 border-r border-b border-gray-100">
                                                <div className="justify-start text-neutral-400 text-sm font-medium font-['Manrope']">{entry.y2 ?? ''}</div>
                                            </div>
                                            <div className="flex-1 px-3 py-2 bg-[#FAFAFA] flex justify-center items-center gap-2.5 border-r border-b border-gray-100">
                                                <div className="justify-start text-neutral-400 text-sm font-medium font-['Manrope']">{entry.x2 ?? ''}</div>
                                            </div>
                                            <div className="flex-1 px-3 py-2 bg-[#FAFAFA] flex justify-center items-center gap-2.5 border-r border-b border-gray-100">
                                                <div className="justify-start text-neutral-400 text-sm font-medium font-['Manrope']">{entry.date ? (() => { const d = new Date(entry.date); return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth()+1).toString().padStart(2, '0')}/${d.getFullYear()}` })() : ''}</div>
                                            </div>
                                            <div className="flex-1 self-stretch px-3 py-2 bg-[#FAFAFA] flex justify-center items-center border-b border-gray-100 gap-2.5">
                                                <button type="button" className="w-5 h-5 flex items-center justify-center rounded bg-gray-100 opacity-50 cursor-not-allowed">
                                                    <img src="/download_icon.svg" alt="Изтегли" className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                            <div className="self-stretch inline-flex justify-center items-center gap-4 w-full mt-2">
                                <div className="flex justify-start items-center gap-2">
                                    <div className="w-7 self-stretch px-2 py-1 rounded inline-flex flex-col justify-center items-center">
                                        <img src="/small_left_arrow.svg" alt="Назад" className="w-3 h-3" />
                                    </div>
                                    <div className="w-7 px-2 py-1 bg-gray-200 rounded inline-flex flex-col justify-center items-center">
                                        <div className="justify-start text-black text-sm font-medium font-['Manrope']">1</div>
                                    </div>
                                    <div className="w-7 px-2 py-1 rounded outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex flex-col justify-center items-center">
                                        <div className="justify-start text-neutral-400 text-sm font-medium font-['Manrope']">2</div>
                                    </div>
                                    <div className="w-7 px-2 py-1 rounded outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex flex-col justify-center items-center">
                                        <div className="justify-start text-neutral-400 text-sm font-medium font-['Manrope']">3</div>
                                    </div>
                                    <div className="w-7 px-2 py-1 rounded outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex flex-col justify-center items-center">
                                        <div className="justify-start text-neutral-400 text-sm font-medium font-['Manrope']">4</div>
                                    </div>
                                    <div className="w-7 px-2 py-1 rounded outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex flex-col justify-center items-center">
                                        <div className="justify-start text-neutral-400 text-sm font-medium font-['Manrope']">5</div>
                                    </div>
                                    <div className="w-7 self-stretch px-2 py-1 rounded inline-flex flex-col justify-center items-center">
                                        <img src="/small_right_arrow.svg" alt="Напред" className="w-3 h-3" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Layout>
        </>
    );
};

export default VtoraZadacha;
