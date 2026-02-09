import React, { useEffect, useMemo, useState } from 'react';
import SEO from '../../shared/SEO';
import Layout from '../../layout/Layout';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../../hooks/useTranslation';

const TEMPLATE_DEFINITIONS = [
  {
    id: 'leveling',
    labelBg: 'Нивелачен карнет',
    labelEn: 'Leveling Field Book',
    columns: [
      { key: 'station', labelBg: 'Станция', labelEn: 'Station', type: 'text', required: true },
      { key: 'back', labelBg: 'Задна (m)', labelEn: 'Back (m)', type: 'number', required: true },
      { key: 'fore', labelBg: 'Предна (m)', labelEn: 'Fore (m)', type: 'number', required: true },
      { key: 'height', labelBg: 'Кота (m)', labelEn: 'Height (m)', type: 'number', required: false },
    ],
  },
  {
    id: 'polygon',
    labelBg: 'Полигонометричен',
    labelEn: 'Traverse',
    columns: [
      { key: 'point', labelBg: 'Точка', labelEn: 'Point', type: 'text', required: true },
      { key: 'angle', labelBg: 'Ъгъл (gon)', labelEn: 'Angle (gon)', type: 'number', required: true },
      { key: 'distance', labelBg: 'Дължина (m)', labelEn: 'Distance (m)', type: 'number', required: true },
      { key: 'azimuth', labelBg: 'Азимут', labelEn: 'Azimuth', type: 'number', required: false },
    ],
  },
  {
    id: 'tacheometry',
    labelBg: 'Тахиметричен',
    labelEn: 'Tacheometric',
    columns: [
      { key: 'station', labelBg: 'Станция', labelEn: 'Station', type: 'text', required: true },
      { key: 'target', labelBg: 'Цел', labelEn: 'Target', type: 'text', required: true },
      { key: 'distance', labelBg: 'Дължина (m)', labelEn: 'Distance (m)', type: 'number', required: true },
      { key: 'angle', labelBg: 'Вертикален ъгъл', labelEn: 'Vertical angle', type: 'number', required: false },
    ],
  },
  {
    id: 'coordinate-sheet',
    labelBg: 'Координатна ведомост',
    labelEn: 'Coordinate Sheet',
    columns: [
      { key: 'point', labelBg: 'Точка', labelEn: 'Point', type: 'text', required: true },
      { key: 'x', labelBg: 'X (m)', labelEn: 'X (m)', type: 'number', required: true },
      { key: 'y', labelBg: 'Y (m)', labelEn: 'Y (m)', type: 'number', required: true },
      { key: 'z', labelBg: 'Z (m)', labelEn: 'Z (m)', type: 'number', required: false },
    ],
  },
  {
    id: 'intersections',
    labelBg: 'Засечки',
    labelEn: 'Intersections',
    columns: [
      { key: 'point', labelBg: 'Точка', labelEn: 'Point', type: 'text', required: true },
      { key: 'angleA', labelBg: 'Ъгъл A', labelEn: 'Angle A', type: 'number', required: true },
      { key: 'angleB', labelBg: 'Ъгъл B', labelEn: 'Angle B', type: 'number', required: true },
      { key: 'distance', labelBg: 'Разстояние (m)', labelEn: 'Distance (m)', type: 'number', required: false },
    ],
  },
  {
    id: 'custom',
    labelBg: 'Свободен карнет',
    labelEn: 'Custom Field Book',
    columns: [
      { key: 'col1', labelBg: 'Колона 1', labelEn: 'Column 1', type: 'text', required: false },
      { key: 'col2', labelBg: 'Колона 2', labelEn: 'Column 2', type: 'text', required: false },
      { key: 'col3', labelBg: 'Колона 3', labelEn: 'Column 3', type: 'text', required: false },
      { key: 'col4', labelBg: 'Колона 4', labelEn: 'Column 4', type: 'text', required: false },
    ],
  },
];

const buildEmptyRow = (template) => {
  const values = {};
  template.columns.forEach((col) => {
    values[col.key] = '';
  });
  return {
    id: Date.now() + Math.random(),
    values,
    isControl: false,
    comment: '',
    photoName: '',
  };
};

const storageKey = (bookId, type) => `fieldbook:${bookId}:${type}`;

const FieldBook = () => {
  const { language } = useTranslation();
  const [projects, setProjects] = useState([
    { id: 'p1', name: 'Проект Борово', year: '2025', team: 'Екип 1', site: 'София', notes: '' },
    { id: 'p2', name: 'Проект Карлово', year: '2025', team: 'Екип 2', site: 'Карлово', notes: '' },
  ]);
  const [fieldBooks, setFieldBooks] = useState([
    { id: 'fb1', projectId: 'p1', name: 'Нивелация - Сесия 1', type: 'leveling', date: '2026-02-09', crew: 'Иванов/Петров', site: 'София', notes: '', locked: false, archived: false, lastCalculated: null },
    { id: 'fb2', projectId: 'p1', name: 'Полигон - Север', type: 'polygon', date: '2026-02-08', crew: 'Екип 1', site: 'София', notes: '', locked: false, archived: false, lastCalculated: null },
  ]);
  const [selectedProjectId, setSelectedProjectId] = useState('p1');
  const [selectedBookId, setSelectedBookId] = useState('fb1');
  const [rows, setRows] = useState([]);
  const [calculationHistory, setCalculationHistory] = useState([]);
  const [settings, setSettings] = useState({
    tolerance: '2.0',
    rounding: '0.001',
    coordinateSystem: '2005',
    units: 'm',
    pdfHeader: '',
  });

  const [showProjectForm, setShowProjectForm] = useState(false);
  const [projectForm, setProjectForm] = useState({ name: '', year: '', team: '', site: '' });
  const [showBookForm, setShowBookForm] = useState(false);
  const [bookForm, setBookForm] = useState({ name: '', date: '', crew: '', site: '', type: 'leveling' });

  const selectedBook = fieldBooks.find((b) => b.id === selectedBookId);

  const template = useMemo(() => {
    const templateId = selectedBook?.type || 'leveling';
    return TEMPLATE_DEFINITIONS.find((t) => t.id === templateId) || TEMPLATE_DEFINITIONS[0];
  }, [selectedBook]);

  useEffect(() => {
    const booksForProject = fieldBooks.filter((b) => b.projectId === selectedProjectId);
    if (booksForProject.length > 0 && !booksForProject.find((b) => b.id === selectedBookId)) {
      setSelectedBookId(booksForProject[0].id);
    }
  }, [fieldBooks, selectedProjectId, selectedBookId]);

  useEffect(() => {
    if (!selectedBookId) return;
    const savedRows = localStorage.getItem(storageKey(selectedBookId, 'rows'));
    const savedHistory = localStorage.getItem(storageKey(selectedBookId, 'history'));
    const savedSettings = localStorage.getItem(storageKey(selectedBookId, 'settings'));
    setRows(savedRows ? JSON.parse(savedRows) : []);
    setCalculationHistory(savedHistory ? JSON.parse(savedHistory) : []);
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, [selectedBookId]);

  useEffect(() => {
    if (!selectedBookId) return;
    localStorage.setItem(storageKey(selectedBookId, 'rows'), JSON.stringify(rows));
  }, [rows, selectedBookId]);

  useEffect(() => {
    if (!selectedBookId) return;
    localStorage.setItem(storageKey(selectedBookId, 'history'), JSON.stringify(calculationHistory));
  }, [calculationHistory, selectedBookId]);

  useEffect(() => {
    if (!selectedBookId) return;
    localStorage.setItem(storageKey(selectedBookId, 'settings'), JSON.stringify(settings));
  }, [settings, selectedBookId]);

  const handleAddRow = () => {
    if (!selectedBook || selectedBook.locked) return;
    setRows((prev) => [...prev, buildEmptyRow(template)]);
  };

  const handleDuplicateRow = (row) => {
    if (!selectedBook || selectedBook.locked) return;
    const copy = { ...row, id: Date.now() + Math.random() };
    setRows((prev) => [...prev, copy]);
  };

  const handleUpdateCell = (rowId, key, value) => {
    if (!selectedBook || selectedBook.locked) return;
    setRows((prev) =>
      prev.map((row) => (row.id === rowId ? { ...row, values: { ...row.values, [key]: value } } : row))
    );
  };

  const handleToggleControl = (rowId) => {
    if (!selectedBook || selectedBook.locked) return;
    setRows((prev) => prev.map((row) => (row.id === rowId ? { ...row, isControl: !row.isControl } : row)));
  };

  const handleRowComment = (rowId, value) => {
    if (!selectedBook || selectedBook.locked) return;
    setRows((prev) => prev.map((row) => (row.id === rowId ? { ...row, comment: value } : row)));
  };

  const handleRowPhoto = (rowId, file) => {
    if (!selectedBook || selectedBook.locked) return;
    setRows((prev) =>
      prev.map((row) => (row.id === rowId ? { ...row, photoName: file ? file.name : '' } : row))
    );
  };

  const handleCalculate = () => {
    if (!selectedBook) return;
    const timestamp = new Date().toISOString();
    setCalculationHistory((prev) => [{ id: Date.now(), timestamp }, ...prev]);
    setFieldBooks((prev) =>
      prev.map((book) => (book.id === selectedBookId ? { ...book, lastCalculated: timestamp } : book))
    );
  };

  const handleCreateProject = () => {
    if (!projectForm.name.trim()) return;
    const newProject = {
      id: `p-${Date.now()}`,
      name: projectForm.name.trim(),
      year: projectForm.year.trim() || '2026',
      team: projectForm.team.trim(),
      site: projectForm.site.trim(),
      notes: '',
    };
    setProjects((prev) => [newProject, ...prev]);
    setProjectForm({ name: '', year: '', team: '', site: '' });
    setShowProjectForm(false);
    setSelectedProjectId(newProject.id);
  };

  const handleCreateBook = () => {
    if (!bookForm.name.trim() || !selectedProjectId) return;
    const newBook = {
      id: `fb-${Date.now()}`,
      projectId: selectedProjectId,
      name: bookForm.name.trim(),
      type: bookForm.type,
      date: bookForm.date || new Date().toISOString().slice(0, 10),
      crew: bookForm.crew.trim(),
      site: bookForm.site.trim(),
      notes: '',
      locked: false,
      archived: false,
      lastCalculated: null,
    };
    setFieldBooks((prev) => [newBook, ...prev]);
    setBookForm({ name: '', date: '', crew: '', site: '', type: 'leveling' });
    setShowBookForm(false);
    setSelectedBookId(newBook.id);
  };

  const handleCopyBook = (book) => {
    const copy = {
      ...book,
      id: `fb-${Date.now()}`,
      name: `${book.name} (Copy)`,
      locked: false,
      archived: false,
      lastCalculated: null,
    };
    setFieldBooks((prev) => [copy, ...prev]);
  };

  const handleArchiveBook = (bookId) => {
    setFieldBooks((prev) => prev.map((book) => (book.id === bookId ? { ...book, archived: true } : book)));
  };

  const handleLockBook = (bookId) => {
    setFieldBooks((prev) => prev.map((book) => (book.id === bookId ? { ...book, locked: true } : book)));
  };

  const warnings = useMemo(() => {
    if (!rows.length) return [];
    const requiredKeys = template.columns.filter((c) => c.required).map((c) => c.key);
    const missingRows = rows.filter((row) => requiredKeys.some((key) => !row.values[key]));
    const missing = missingRows.length;
    return missing > 0
      ? [
          language === 'bg'
            ? `Липсват задължителни стойности в ${missing} реда.`
            : `Missing required values in ${missing} rows.`,
        ]
      : [];
  }, [rows, template, language]);

  const booksForProject = fieldBooks.filter((b) => b.projectId === selectedProjectId && !b.archived);
  const archivedBooks = fieldBooks.filter((b) => b.projectId === selectedProjectId && b.archived);

  return (
    <>
      <SEO
        title="Електронни карнети"
        description="Електронни карнети за въвеждане, изчисление и експортиране на теренни измервания."
        keywords="електронни карнети, field book, survey log, геодезия"
        canonical="/fieldbook"
      />
      <Layout>
        <div className="w-full min-h-screen bg-stone-50">
          <div className="w-full max-w-[1180px] mx-auto px-4 lg:px-6 pt-6 lg:pt-16 pb-8 lg:pb-20 flex flex-col gap-8">
            <div className="flex flex-col lg:flex-row justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-xl border border-gray-200">
                    <svg className="w-7 h-7 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h1 className="text-black text-3xl font-bold font-['Manrope']">
                    {language === 'bg' ? 'Електронни карнети' : 'Electronic Field Books'}
                  </h1>
                </div>
                <p className="text-neutral-600 text-sm lg:text-base mt-3 max-w-2xl">
                  {language === 'bg'
                    ? 'Въвеждане на теренни измервания, автоматични проверки и официален експорт за професионална работа.'
                    : 'Capture field measurements, run validations, and export official reports.'}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="px-3 py-1 text-xs rounded-full bg-white border border-gray-200 text-neutral-600">
                    {language === 'bg' ? 'Auto-save' : 'Auto-save'}
                  </span>
                  <span className="px-3 py-1 text-xs rounded-full bg-white border border-gray-200 text-neutral-600">
                    {language === 'bg' ? 'Offline режим' : 'Offline mode'}
                  </span>
                  <span className="px-3 py-1 text-xs rounded-full bg-white border border-gray-200 text-neutral-600">
                    {language === 'bg' ? 'Професионална употреба' : 'Professional use'}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setShowProjectForm(true)}
                  className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-200 text-sm font-medium"
                >
                  {language === 'bg' ? 'Нов проект' : 'New Project'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowBookForm(true)}
                  className="px-4 py-2 bg-gray-200 text-black rounded-lg hover:bg-gray-300 transition-colors duration-200 text-sm font-medium"
                >
                  {language === 'bg' ? 'Нов карнет' : 'New Field Book'}
                </button>
                <Link
                  to="/tools"
                  className="px-4 py-2 bg-gray-200 text-black rounded-lg hover:bg-gray-300 transition-colors duration-200 text-sm font-medium"
                >
                  {language === 'bg' ? 'Инструменти' : 'Tools'}
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 p-5 bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-black">
                    {language === 'bg' ? 'Проекти' : 'Projects'}
                  </h2>
                  <button
                    type="button"
                    onClick={() => setShowProjectForm(true)}
                    className="text-sm text-gray-600 hover:text-black"
                  >
                    {language === 'bg' ? '+ Добави' : '+ Add'}
                  </button>
                </div>
                {showProjectForm && (
                  <div className="p-3 bg-stone-50 rounded-lg border border-gray-100 mb-4">
                    <div className="grid grid-cols-1 gap-2">
                      <input
                        type="text"
                        value={projectForm.name}
                        onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                        placeholder={language === 'bg' ? 'Име на проект' : 'Project name'}
                        className="p-2 rounded-lg border border-gray-200 text-sm"
                      />
                      <input
                        type="text"
                        value={projectForm.year}
                        onChange={(e) => setProjectForm({ ...projectForm, year: e.target.value })}
                        placeholder={language === 'bg' ? 'Учебна година' : 'Year'}
                        className="p-2 rounded-lg border border-gray-200 text-sm"
                      />
                      <input
                        type="text"
                        value={projectForm.team}
                        onChange={(e) => setProjectForm({ ...projectForm, team: e.target.value })}
                        placeholder={language === 'bg' ? 'Екип' : 'Team'}
                        className="p-2 rounded-lg border border-gray-200 text-sm"
                      />
                      <input
                        type="text"
                        value={projectForm.site}
                        onChange={(e) => setProjectForm({ ...projectForm, site: e.target.value })}
                        placeholder={language === 'bg' ? 'Обект' : 'Site'}
                        className="p-2 rounded-lg border border-gray-200 text-sm"
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={handleCreateProject}
                          className="px-3 py-2 bg-black text-white rounded-lg text-sm"
                        >
                          {language === 'bg' ? 'Създай' : 'Create'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowProjectForm(false)}
                          className="px-3 py-2 bg-gray-200 text-black rounded-lg text-sm"
                        >
                          {language === 'bg' ? 'Отказ' : 'Cancel'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  {projects.map((project) => (
                    <button
                      type="button"
                      key={project.id}
                      onClick={() => setSelectedProjectId(project.id)}
                      className={`w-full text-left p-3 rounded-lg border ${
                        selectedProjectId === project.id ? 'border-black bg-stone-50' : 'border-gray-100 bg-white'
                      }`}
                    >
                      <div className="text-sm font-semibold text-black">{project.name}</div>
                      <div className="text-xs text-neutral-500">{project.year} • {project.site || '-'}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-2 p-5 bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-black">
                    {language === 'bg' ? 'Карнети' : 'Field Books'}
                  </h2>
                  <button
                    type="button"
                    onClick={() => setShowBookForm(true)}
                    className="text-sm text-gray-600 hover:text-black"
                  >
                    {language === 'bg' ? '+ Нов карнет' : '+ New Field Book'}
                  </button>
                </div>
                {showBookForm && (
                  <div className="p-3 bg-stone-50 rounded-lg border border-gray-100 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={bookForm.name}
                        onChange={(e) => setBookForm({ ...bookForm, name: e.target.value })}
                        placeholder={language === 'bg' ? 'Име на карнет' : 'Field book name'}
                        className="p-2 rounded-lg border border-gray-200 text-sm"
                      />
                      <input
                        type="date"
                        value={bookForm.date}
                        onChange={(e) => setBookForm({ ...bookForm, date: e.target.value })}
                        className="p-2 rounded-lg border border-gray-200 text-sm"
                      />
                      <input
                        type="text"
                        value={bookForm.crew}
                        onChange={(e) => setBookForm({ ...bookForm, crew: e.target.value })}
                        placeholder={language === 'bg' ? 'Екип' : 'Crew'}
                        className="p-2 rounded-lg border border-gray-200 text-sm"
                      />
                      <input
                        type="text"
                        value={bookForm.site}
                        onChange={(e) => setBookForm({ ...bookForm, site: e.target.value })}
                        placeholder={language === 'bg' ? 'Обект' : 'Site'}
                        className="p-2 rounded-lg border border-gray-200 text-sm"
                      />
                      <select
                        value={bookForm.type}
                        onChange={(e) => setBookForm({ ...bookForm, type: e.target.value })}
                        className="p-2 rounded-lg border border-gray-200 text-sm"
                      >
                        {TEMPLATE_DEFINITIONS.map((tpl) => (
                          <option key={tpl.id} value={tpl.id}>
                            {language === 'bg' ? tpl.labelBg : tpl.labelEn}
                          </option>
                        ))}
                      </select>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={handleCreateBook}
                          className="px-3 py-2 bg-black text-white rounded-lg text-sm"
                        >
                          {language === 'bg' ? 'Създай' : 'Create'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowBookForm(false)}
                          className="px-3 py-2 bg-gray-200 text-black rounded-lg text-sm"
                        >
                          {language === 'bg' ? 'Отказ' : 'Cancel'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  {booksForProject.map((book) => (
                    <div
                      key={book.id}
                      className={`p-3 rounded-lg border ${
                        selectedBookId === book.id ? 'border-black bg-stone-50' : 'border-gray-100'
                      }`}
                    >
                      <div className="flex flex-wrap justify-between items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedBookId(book.id)}
                          className="text-left flex-1"
                        >
                          <div className="text-sm font-semibold text-black">{book.name}</div>
                          <div className="text-xs text-neutral-500">
                            {book.date} • {language === 'bg' ? 'Екип' : 'Crew'}: {book.crew || '-'}
                          </div>
                        </button>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleCopyBook(book)}
                            className="px-2 py-1 text-xs bg-gray-200 rounded-lg"
                          >
                            {language === 'bg' ? 'Копирай' : 'Copy'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleArchiveBook(book.id)}
                            className="px-2 py-1 text-xs bg-gray-200 rounded-lg"
                          >
                            {language === 'bg' ? 'Архив' : 'Archive'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleLockBook(book.id)}
                            className="px-2 py-1 text-xs bg-black text-white rounded-lg"
                          >
                            {language === 'bg' ? 'Заключи' : 'Lock'}
                          </button>
                        </div>
                      </div>
                      <div className="text-xs text-neutral-400 mt-1">
                        {language === 'bg' ? 'Тип' : 'Type'}: {language === 'bg' ? TEMPLATE_DEFINITIONS.find((t) => t.id === book.type)?.labelBg : TEMPLATE_DEFINITIONS.find((t) => t.id === book.type)?.labelEn}
                        {book.locked ? ` • ${language === 'bg' ? 'Заключен' : 'Locked'}` : ''}
                      </div>
                    </div>
                  ))}
                  {booksForProject.length === 0 && (
                    <div className="text-sm text-neutral-500">{language === 'bg' ? 'Няма карнети.' : 'No field books yet.'}</div>
                  )}
                </div>
                {archivedBooks.length > 0 && (
                  <div className="mt-4">
                    <div className="text-xs text-neutral-400 mb-2">{language === 'bg' ? 'Архивирани' : 'Archived'}</div>
                    <div className="space-y-2">
                      {archivedBooks.map((book) => (
                        <div key={book.id} className="p-3 rounded-lg border border-gray-100 text-neutral-400 text-sm">
                          {book.name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {selectedBook && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 p-6 bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <div>
                      <div className="text-lg font-semibold text-black">{selectedBook.name}</div>
                      <div className="text-xs text-neutral-500">
                        {selectedBook.date} • {selectedBook.site || '-'} • {selectedBook.locked ? (language === 'bg' ? 'Заключен' : 'Locked') : (language === 'bg' ? 'Работен' : 'Active')}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleCalculate}
                      className="px-4 py-2 bg-black text-white rounded-lg text-sm"
                      disabled={selectedBook.locked}
                    >
                      {language === 'bg' ? 'Изчисли' : 'Calculate'}
                    </button>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-gray-100">
                    <table className="min-w-full text-sm">
                      <thead className="bg-stone-50">
                        <tr>
                          {template.columns.map((col) => (
                            <th key={col.key} className="px-3 py-2 text-left text-neutral-600 font-medium">
                              {language === 'bg' ? col.labelBg : col.labelEn}
                            </th>
                          ))}
                          <th className="px-3 py-2 text-left text-neutral-600 font-medium">
                            {language === 'bg' ? 'Контролна' : 'Control'}
                          </th>
                          <th className="px-3 py-2 text-left text-neutral-600 font-medium">
                            {language === 'bg' ? 'Коментар' : 'Comment'}
                          </th>
                          <th className="px-3 py-2 text-left text-neutral-600 font-medium">
                            {language === 'bg' ? 'Снимка' : 'Photo'}
                          </th>
                          <th className="px-3 py-2 text-left text-neutral-600 font-medium">
                            {language === 'bg' ? 'Действия' : 'Actions'}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((row) => (
                          <tr key={row.id} className="border-t border-gray-100">
                            {template.columns.map((col) => (
                              <td key={col.key} className="px-3 py-2">
                                <input
                                  type={col.type}
                                  value={row.values[col.key]}
                                  onChange={(e) => handleUpdateCell(row.id, col.key, e.target.value)}
                                  disabled={selectedBook.locked}
                                  className="w-full p-2 rounded-lg border border-gray-200 text-sm"
                                />
                              </td>
                            ))}
                            <td className="px-3 py-2">
                              <button
                                type="button"
                                onClick={() => handleToggleControl(row.id)}
                                disabled={selectedBook.locked}
                                className={`px-2 py-1 rounded-lg text-xs ${row.isControl ? 'bg-black text-white' : 'bg-gray-200 text-black'}`}
                              >
                                {row.isControl ? (language === 'bg' ? 'Да' : 'Yes') : (language === 'bg' ? 'Не' : 'No')}
                              </button>
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="text"
                                value={row.comment}
                                onChange={(e) => handleRowComment(row.id, e.target.value)}
                                disabled={selectedBook.locked}
                                className="w-full p-2 rounded-lg border border-gray-200 text-sm"
                              />
                            </td>
                            <td className="px-3 py-2">
                              <input
                                type="file"
                                onChange={(e) => handleRowPhoto(row.id, e.target.files?.[0])}
                                disabled={selectedBook.locked}
                                className="text-xs"
                              />
                              {row.photoName && (
                                <div className="text-xs text-neutral-500 mt-1">{row.photoName}</div>
                              )}
                            </td>
                            <td className="px-3 py-2">
                              <button
                                type="button"
                                onClick={() => handleDuplicateRow(row)}
                                disabled={selectedBook.locked}
                                className="px-2 py-1 text-xs bg-gray-200 rounded-lg"
                              >
                                {language === 'bg' ? 'Дублирай' : 'Duplicate'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={handleAddRow}
                      disabled={selectedBook.locked}
                      className="px-4 py-2 bg-gray-200 text-black rounded-lg text-sm"
                    >
                      {language === 'bg' ? 'Добави ред' : 'Add Row'}
                    </button>
                  </div>
                </div>

                <div className="p-6 bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 flex flex-col gap-5">
                  <div>
                    <div className="text-sm font-semibold text-black mb-2">
                      {language === 'bg' ? 'Контрол и проверки' : 'Checks'}
                    </div>
                    {warnings.length === 0 ? (
                      <div className="text-xs text-neutral-500">
                        {language === 'bg' ? 'Няма открити проблеми.' : 'No issues detected.'}
                      </div>
                    ) : (
                      warnings.map((warning, idx) => (
                        <div key={idx} className="text-xs text-red-600 bg-red-50 border border-red-100 p-2 rounded-lg mb-2">
                          {warning}
                        </div>
                      ))
                    )}
                  </div>

                  <div>
                    <div className="text-sm font-semibold text-black mb-2">
                      {language === 'bg' ? 'История на пресмятанията' : 'Calculation history'}
                    </div>
                    <div className="space-y-2">
                      {calculationHistory.length === 0 ? (
                        <div className="text-xs text-neutral-500">
                          {language === 'bg' ? 'Няма изчисления.' : 'No calculations yet.'}
                        </div>
                      ) : (
                        calculationHistory.slice(0, 5).map((item) => (
                          <div key={item.id} className="text-xs text-neutral-500">
                            {item.timestamp}
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="text-sm font-semibold text-black mb-2">{language === 'bg' ? 'Експорт' : 'Export'}</div>
                    <div className="grid grid-cols-2 gap-2">
                      <button type="button" className="px-3 py-2 bg-gray-200 rounded-lg text-xs">
                        PDF
                      </button>
                      <button type="button" className="px-3 py-2 bg-gray-200 rounded-lg text-xs">
                        Excel
                      </button>
                      <button type="button" className="px-3 py-2 bg-gray-200 rounded-lg text-xs">
                        CSV
                      </button>
                      <button type="button" className="px-3 py-2 bg-gray-200 rounded-lg text-xs">
                        {language === 'bg' ? 'Печат' : 'Print'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="p-6 bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200">
                <div className="text-lg font-semibold text-black mb-4">
                  {language === 'bg' ? 'Колаборация' : 'Collaboration'}
                </div>
                <div className="space-y-3 text-sm text-neutral-600">
                  <div className="flex justify-between">
                    <span>{language === 'bg' ? 'owner' : 'owner'}</span>
                    <span>geosolver@demo.com</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{language === 'bg' ? 'editor' : 'editor'}</span>
                    <span>team@demo.com</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{language === 'bg' ? 'viewer' : 'viewer'}</span>
                    <span>student@demo.com</span>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200">
                <div className="text-lg font-semibold text-black mb-4">
                  {language === 'bg' ? 'Настройки' : 'Settings'}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={settings.tolerance}
                    onChange={(e) => setSettings({ ...settings, tolerance: e.target.value })}
                    placeholder={language === 'bg' ? 'Толеранс' : 'Tolerance'}
                    className="p-2 rounded-lg border border-gray-200 text-sm"
                  />
                  <input
                    type="text"
                    value={settings.rounding}
                    onChange={(e) => setSettings({ ...settings, rounding: e.target.value })}
                    placeholder={language === 'bg' ? 'Закръгляне' : 'Rounding'}
                    className="p-2 rounded-lg border border-gray-200 text-sm"
                  />
                  <input
                    type="text"
                    value={settings.coordinateSystem}
                    onChange={(e) => setSettings({ ...settings, coordinateSystem: e.target.value })}
                    placeholder={language === 'bg' ? 'Координатна система' : 'Coordinate system'}
                    className="p-2 rounded-lg border border-gray-200 text-sm"
                  />
                  <input
                    type="text"
                    value={settings.units}
                    onChange={(e) => setSettings({ ...settings, units: e.target.value })}
                    placeholder={language === 'bg' ? 'Единици' : 'Units'}
                    className="p-2 rounded-lg border border-gray-200 text-sm"
                  />
                  <input
                    type="text"
                    value={settings.pdfHeader}
                    onChange={(e) => setSettings({ ...settings, pdfHeader: e.target.value })}
                    placeholder={language === 'bg' ? 'PDF header' : 'PDF header'}
                    className="p-2 rounded-lg border border-gray-200 text-sm md:col-span-2"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default FieldBook;
