import React, { useState, useEffect } from 'react';
import SEO from '../../shared/SEO';
import Layout from '../../layout/Layout';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../../hooks/useTranslation';

// LocalStorage helpers
const getDraft = () => {
  try {
    const data = localStorage.getItem('fieldBookDraft');
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const saveDraft = (rows) => {
  try {
    localStorage.setItem('fieldBookDraft', JSON.stringify(rows));
  } catch (error) {
    console.error('Грешка при запазване на чернова:', error);
  }
};

const FieldBook = () => {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({ station: '', target: '', distance: '', angle: '' });
  const { language } = useTranslation();

  useEffect(() => {
    setRows(getDraft());
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  const handleAddRow = () => {
    if (!form.station || !form.target) {
      alert(language === 'bg' ? 'Моля, попълнете станция и цел.' : 'Please fill in station and target.');
      return;
    }

    const newRow = {
      id: Date.now(),
      station: form.station.trim(),
      target: form.target.trim(),
      distance: form.distance ? parseFloat(form.distance) : null,
      angle: form.angle ? parseFloat(form.angle) : null,
      date: new Date().toISOString()
    };

    const updatedRows = [...rows, newRow];
    setRows(updatedRows);
    saveDraft(updatedRows);
    
    // Reset формата
    setForm({ station: '', target: '', distance: '', angle: '' });
  };

  const handleDeleteRow = (id) => {
    const updatedRows = rows.filter(row => row.id !== id);
    setRows(updatedRows);
    saveDraft(updatedRows);
  };

  const handleClearAll = () => {
    if (window.confirm(language === 'bg' ? 'Сигурни ли сте, че искате да изтриете всички редове?' : 'Are you sure you want to delete all rows?')) {
      setRows([]);
      saveDraft([]);
    }
  };

  return (
    <>
      <SEO
        title="Дигитален карнет (MVP) – FieldBook"
        description="Минимален дигитален карнет за полеви измервания. Запис и управление на измервания."
        keywords="дигитален карнет, fieldbook, полеви измервания, геодезия"
        canonical="/fieldbook"
      />
      <Layout>
        {/* DESKTOP LAYOUT */}
        <div className="hidden md:flex w-[1180px] mx-auto my-10 flex-col gap-10">
          <div className="flex flex-col justify-center items-start gap-10">
            {/* Breadcrumbs and Title */}
            <div className="w-[580px] flex flex-col justify-start items-start gap-4">
              <div className="flex flex-col justify-start items-start gap-1">
                <div className="justify-start">
                  <Link to="/tools" className="text-neutral-400 text-base font-medium font-['Manrope'] underline">Инструменти</Link>
                  <span className="text-neutral-400 text-base font-medium font-['Manrope']"> {'>'} Дигитален карнет</span>
                </div>
                <div className="justify-start text-black text-3xl font-bold font-['Manrope']">Дигитален карнет (MVP)</div>
              </div>
              <div className="p-1.5 bg-white rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex justify-start items-center gap-2">
                <div className="px-3 py-1 bg-gray-200 rounded flex justify-center items-center gap-2.5">
                  <div className="justify-start text-black text-base font-medium font-['Manrope']">Инструмент</div>
                </div>
              </div>
            </div>

            {/* Form Card */}
            <div className="self-stretch p-4 bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex flex-col justify-center items-end gap-4">
              <div className="self-stretch justify-start text-black text-lg font-semibold font-['Manrope']">Добави ред</div>
              <div className="self-stretch flex flex-col justify-start items-start gap-4">
                <div className="self-stretch flex gap-4">
                  <div className="flex-1 flex flex-col justify-start items-start gap-2">
                    <div className="justify-start text-black text-sm font-medium font-['Manrope']">Станция</div>
                    <input
                      type="text"
                      id="station"
                      value={form.station}
                      onChange={handleChange}
                      className="self-stretch p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 text-neutral-400 text-sm font-medium font-['Manrope']"
                      placeholder="Въведете станция"
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-start items-start gap-2">
                    <div className="justify-start text-black text-sm font-medium font-['Manrope']">Цел</div>
                    <input
                      type="text"
                      id="target"
                      value={form.target}
                      onChange={handleChange}
                      className="self-stretch p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 text-neutral-400 text-sm font-medium font-['Manrope']"
                      placeholder="Въведете цел"
                    />
                  </div>
                </div>
                <div className="self-stretch flex gap-4">
                  <div className="flex-1 flex flex-col justify-start items-start gap-2">
                    <div className="justify-start text-black text-sm font-medium font-['Manrope']">Разстояние (м)</div>
                    <input
                      type="number"
                      id="distance"
                      value={form.distance}
                      onChange={handleChange}
                      step="any"
                      className="self-stretch p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 text-neutral-400 text-sm font-medium font-['Manrope']"
                      placeholder="Въведете разстояние"
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-start items-start gap-2">
                    <div className="justify-start text-black text-sm font-medium font-['Manrope']">Ъгъл (gon)</div>
                    <input
                      type="number"
                      id="angle"
                      value={form.angle}
                      onChange={handleChange}
                      step="any"
                      className="self-stretch p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 text-neutral-400 text-sm font-medium font-['Manrope']"
                      placeholder="Въведете ъгъл"
                    />
                  </div>
                </div>
              </div>
              <div className="inline-flex justify-end items-center gap-3 w-full">
                <button
                  type="button"
                  onClick={handleClearAll}
                  disabled={rows.length === 0}
                  className={`px-4 py-2 bg-gray-200 rounded-lg flex justify-start items-center gap-3${rows.length === 0 ? ' opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="justify-start text-black text-sm font-medium font-['Manrope']">Изчисти всичко</div>
                </button>
                <button
                  type="button"
                  onClick={handleAddRow}
                  disabled={!form.station || !form.target}
                  className={`px-4 py-2 bg-black rounded-lg flex justify-start items-center gap-3${!form.station || !form.target ? ' opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="justify-start text-white text-sm font-medium font-['Manrope']">Добави</div>
                  <img src="/icons/white_right_arrow.svg" alt="Добави" className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="self-stretch flex flex-col justify-start items-start gap-4">
              <div className="justify-start text-black text-2xl font-bold font-['Manrope']">Редове ({rows.length})</div>
              <div className="self-stretch rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 flex flex-col justify-start items-start gap-px overflow-hidden">
                <div className="self-stretch shadow-[0px_8px_24px_0px_rgba(0,0,0,0.04)] inline-flex justify-start items-start gap-px">
                  <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5 border-r border-gray-200">
                    <div className="text-black text-sm font-medium font-['Manrope']">Станция</div>
                  </div>
                  <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5 border-r border-gray-200">
                    <div className="text-black text-sm font-medium font-['Manrope']">Цел</div>
                  </div>
                  <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5 border-r border-gray-200">
                    <div className="text-black text-sm font-medium font-['Manrope']">Разстояние (м)</div>
                  </div>
                  <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5 border-r border-gray-200">
                    <div className="text-black text-sm font-medium font-['Manrope']">Ъгъл (gon)</div>
                  </div>
                  <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                    <div className="text-black text-sm font-medium font-['Manrope']">Действия</div>
                  </div>
                </div>
                {rows.length === 0 ? (
                  <div className="w-full px-3 py-2 bg-white text-neutral-400 text-sm font-medium font-['Manrope']">Няма редове. Добавете нов ред отгоре.</div>
                ) : (
                  rows.map((row) => (
                    <div key={row.id} className="self-stretch inline-flex justify-start items-start gap-px">
                      <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5 border-r border-gray-200">
                        <div className="justify-start text-neutral-400 text-sm font-medium font-['Manrope']">{row.station}</div>
                      </div>
                      <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5 border-r border-gray-200">
                        <div className="justify-start text-neutral-400 text-sm font-medium font-['Manrope']">{row.target}</div>
                      </div>
                      <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5 border-r border-gray-200">
                        <div className="justify-start text-neutral-400 text-sm font-medium font-['Manrope']">{row.distance !== null ? row.distance.toFixed(3) : '-'}</div>
                      </div>
                      <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5 border-r border-gray-200">
                        <div className="justify-start text-neutral-400 text-sm font-medium font-['Manrope']">{row.angle !== null ? row.angle.toFixed(3) : '-'}</div>
                      </div>
                      <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                        <button
                          onClick={() => handleDeleteRow(row.id)}
                          className="px-3 py-1 bg-red-100 text-red-600 rounded-lg text-sm font-medium font-['Manrope'] hover:bg-red-200"
                        >
                          Изтрий
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* MOBILE LAYOUT */}
        <div className="block md:hidden w-full max-w-md mx-auto min-h-screen bg-stone-50 relative px-4 py-4">
          <div className="flex flex-col justify-start items-start gap-6 w-full">
            <div className="self-stretch flex flex-col justify-start items-start gap-1">
              <div className="inline-flex items-center gap-3 w-full">
                <Link to="/tools" className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-200 text-black focus:outline-none">
                  <svg width="20" height="20" fill="none" viewBox="0 0 20 20"><path d="M13 15l-5-5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </Link>
                <span className="text-black text-2xl font-bold font-['Manrope']">Дигитален карнет</span>
              </div>
            </div>

            {/* Form Card */}
            <div className="self-stretch p-3 bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 flex flex-col justify-center items-end gap-3 w-full">
              <div className="self-stretch justify-start text-black text-base font-semibold font-['Manrope']">Добави ред</div>
              <div className="self-stretch flex flex-col justify-start items-start gap-4 w-full">
                <div className="self-stretch flex flex-col justify-start items-start gap-2">
                  <div className="justify-start text-black text-xs font-medium font-['Manrope']">Станция</div>
                  <input
                    type="text"
                    id="station"
                    value={form.station}
                    onChange={handleChange}
                    className="self-stretch p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 text-neutral-400 text-xs font-medium font-['Manrope']"
                    placeholder="Въведете станция"
                  />
                </div>
                <div className="self-stretch flex flex-col justify-start items-start gap-2">
                  <div className="justify-start text-black text-xs font-medium font-['Manrope']">Цел</div>
                  <input
                    type="text"
                    id="target"
                    value={form.target}
                    onChange={handleChange}
                    className="self-stretch p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 text-neutral-400 text-xs font-medium font-['Manrope']"
                    placeholder="Въведете цел"
                  />
                </div>
                <div className="self-stretch flex flex-col justify-start items-start gap-2">
                  <div className="justify-start text-black text-xs font-medium font-['Manrope']">Разстояние (м)</div>
                  <input
                    type="number"
                    id="distance"
                    value={form.distance}
                    onChange={handleChange}
                    step="any"
                    className="self-stretch p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 text-neutral-400 text-xs font-medium font-['Manrope']"
                    placeholder="Въведете разстояние"
                  />
                </div>
                <div className="self-stretch flex flex-col justify-start items-start gap-2">
                  <div className="justify-start text-black text-xs font-medium font-['Manrope']">Ъгъл (gon)</div>
                  <input
                    type="number"
                    id="angle"
                    value={form.angle}
                    onChange={handleChange}
                    step="any"
                    className="self-stretch p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 text-neutral-400 text-xs font-medium font-['Manrope']"
                    placeholder="Въведете ъгъл"
                  />
                </div>
              </div>
              <div className="inline-flex justify-end items-center gap-3 w-full">
                <button
                  type="button"
                  onClick={handleClearAll}
                  disabled={rows.length === 0}
                  className={`px-4 py-2 bg-gray-200 rounded-lg flex justify-start items-center gap-3${rows.length === 0 ? ' opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="justify-start text-black text-sm font-medium font-['Manrope']">Изчисти</div>
                </button>
                <button
                  type="button"
                  onClick={handleAddRow}
                  disabled={!form.station || !form.target}
                  className={`px-4 py-2 bg-black rounded-lg flex justify-start items-center gap-3${!form.station || !form.target ? ' opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="justify-start text-white text-sm font-medium font-['Manrope']">Добави</div>
                  <img src="/icons/white_right_arrow.svg" alt="Добави" className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="self-stretch flex flex-col justify-start items-start gap-3 w-full">
              <div className="text-black text-lg font-bold font-['Manrope']">Редове ({rows.length})</div>
              {rows.length === 0 ? (
                <div className="w-full px-3 py-2 bg-white text-neutral-400 text-sm font-medium font-['Manrope'] rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200">Няма редове. Добавете нов ред отгоре.</div>
              ) : (
                <div className="self-stretch flex flex-col justify-start items-start gap-2 w-full">
                  {rows.map((row) => (
                    <div key={row.id} className="self-stretch p-3 bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <div className="text-black text-sm font-medium font-['Manrope']">{row.station} → {row.target}</div>
                        <button
                          onClick={() => handleDeleteRow(row.id)}
                          className="px-3 py-1 bg-red-100 text-red-600 rounded-lg text-xs font-medium font-['Manrope']"
                        >
                          Изтрий
                        </button>
                      </div>
                      <div className="text-neutral-400 text-xs font-medium font-['Manrope']">
                        Разстояние: {row.distance !== null ? row.distance.toFixed(3) + ' м' : '-'} | Ъгъл: {row.angle !== null ? row.angle.toFixed(3) + ' gon' : '-'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default FieldBook;
