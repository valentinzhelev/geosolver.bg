import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../../shared/SEO';
import Layout from '../../layout/Layout';
import { useTranslation } from '../../../hooks/useTranslation';
import { fieldbooksApi } from '../../../services/fieldbookApi';
import { emptyLevelingRow, rowFromApi, rowToApi } from '../../../utils/levelingCarnet';
import {
  emptyCoordinateRow,
  coordRowFromApi,
  coordRowToApi,
  defaultCoordinateSettings,
} from '../../../utils/coordinateCarnet';
import { downloadLevelingCsv, downloadCoordinateCsv } from '../../../utils/exportLevelingCsv';
import LevelingCarnetTable from './LevelingCarnetTable';
import CoordinateCarnetTable from './CoordinateCarnetTable';

const gradientStyle = {
  backgroundImage: 'url(/images/gradient_wallpaper.jpg)',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
};

const defaultLevelingSettings = () => ({ benchmarkHeight: 0, toleranceMm: 5, rounding: 3 });

const defaultSettingsFor = (type) =>
  type === 'coordinate' ? defaultCoordinateSettings() : defaultLevelingSettings();

const rowHelpersFor = (type) =>
  type === 'coordinate'
    ? { empty: emptyCoordinateRow, toApi: coordRowToApi, fromApi: coordRowFromApi }
    : { empty: emptyLevelingRow, toApi: rowToApi, fromApi: rowFromApi };

const TYPE_LABELS = {
  bg: { leveling: 'Нивелачен', coordinate: 'Координатен' },
  en: { leveling: 'Leveling', coordinate: 'Coordinate' },
};

/* ---------- shared button styles ---------- */
const btnPrimary =
  "inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-black dark:bg-white text-white dark:text-black text-sm font-semibold font-['Manrope'] transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed";
const btnGhost =
  "inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg bg-white dark:bg-zinc-900 outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-700 text-black dark:text-white text-sm font-medium font-['Manrope'] transition-colors hover:bg-stone-50 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed";
const inputClass =
  "w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-sm text-black dark:text-white font-['Manrope'] outline-none transition-colors hover:border-gray-300 dark:hover:border-zinc-600 focus:ring-2 focus:ring-black/10 dark:focus:ring-white/20 disabled:opacity-60";

/* ---------- icons ---------- */
const Icon = ({ d, className = 'w-4 h-4' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);
const ICONS = {
  calc: ['M9 7h6', 'M9 11h6', 'M9 15h2', 'M5 3h14a1 1 0 011 1v16a1 1 0 01-1 1H5a1 1 0 01-1-1V4a1 1 0 011-1z'],
  copy: ['M8 8h10a1 1 0 011 1v10a1 1 0 01-1 1H8a1 1 0 01-1-1V9a1 1 0 011-1z', 'M16 4H6a1 1 0 00-1 1v10'],
  lock: ['M6 11h12a1 1 0 011 1v7a1 1 0 01-1 1H6a1 1 0 01-1-1v-7a1 1 0 011-1z', 'M8 11V8a4 4 0 018 0v3'],
  unlock: ['M6 11h12a1 1 0 011 1v7a1 1 0 01-1 1H6a1 1 0 01-1-1v-7a1 1 0 011-1z', 'M8 11V8a4 4 0 017.5-2'],
  archive: ['M4 7h16v3H4z', 'M5 10v9a1 1 0 001 1h12a1 1 0 001-1v-9', 'M10 14h4'],
  restore: ['M4 7h16v3H4z', 'M5 10v9a1 1 0 001 1h12a1 1 0 001-1v-9', 'M12 13v5', 'M9.5 15.5L12 13l2.5 2.5'],
  download: ['M12 4v11', 'M8 11l4 4 4-4', 'M5 19h14'],
  plus: ['M12 5v14', 'M5 12h14'],
  search: ['M11 4a7 7 0 100 14 7 7 0 000-14z', 'M20 20l-3.5-3.5'],
  folder: ['M4 6a1 1 0 011-1h4l2 2h8a1 1 0 011 1v10a1 1 0 01-1 1H5a1 1 0 01-1-1V6z'],
  trash: ['M5 7h14', 'M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2', 'M6 7l1 13a1 1 0 001 1h8a1 1 0 001-1l1-13', 'M10 11v6', 'M14 11v6'],
};

const FieldBookWorkspace = () => {
  const { language } = useTranslation();
  const bg = language === 'bg';

  const [projects, setProjects] = useState([]);
  const [books, setBooks] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedBookId, setSelectedBookId] = useState(null);
  const [rows, setRows] = useState([]);
  const [settings, setSettings] = useState(defaultLevelingSettings());
  const [warnings, setWarnings] = useState([]);
  const [summary, setSummary] = useState(null);
  const [calculationHistory, setCalculationHistory] = useState([]);
  const [bookMeta, setBookMeta] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(null);
  const [calculating, setCalculating] = useState(false);
  const [creatingProject, setCreatingProject] = useState(false);
  const [error, setError] = useState('');
  const [formHint, setFormHint] = useState('');

  const [showProjectForm, setShowProjectForm] = useState(false);
  const [projectForm, setProjectForm] = useState({ name: '', year: '', team: '', site: '' });
  const [showBookForm, setShowBookForm] = useState(false);
  const [bookForm, setBookForm] = useState({ name: '', date: '', crew: '', type: 'coordinate' });

  const [bookSearch, setBookSearch] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [confirm, setConfirm] = useState(null); // { kind: 'project'|'book', id, name }
  const [deleting, setDeleting] = useState(false);

  const saveTimerRef = useRef(null);
  const skipSaveRef = useRef(false);

  const bookType = bookMeta?.type || 'leveling';
  const locked = !!bookMeta?.locked;
  const labels = TYPE_LABELS[bg ? 'bg' : 'en'];

  const selectedBook = useMemo(
    () => books.find((b) => b._id === selectedBookId),
    [books, selectedBookId]
  );

  const visibleBooks = useMemo(() => {
    const q = bookSearch.trim().toLowerCase();
    return books
      .filter((b) => (showArchived ? b.archived : !b.archived))
      .filter((b) => !q || (b.name || '').toLowerCase().includes(q));
  }, [books, showArchived, bookSearch]);

  const filteredProjects = projects;

  const loadProjects = useCallback(async () => {
    const res = await fieldbooksApi.listProjects();
    const list = res.data || [];
    setProjects(list);
    setSelectedProjectId((prev) => prev || (list[0]?._id ?? null));
    return list;
  }, []);

  const loadBooks = useCallback(async (projectId) => {
    if (!projectId) {
      setBooks([]);
      return;
    }
    const res = await fieldbooksApi.listBooks(projectId);
    setBooks(res.data || []);
  }, []);

  const loadBookDetail = useCallback(async (bookId) => {
    if (!bookId) return;
    skipSaveRef.current = true;
    const res = await fieldbooksApi.getBook(bookId);
    const book = res.data;
    const helpers = rowHelpersFor(book.type);
    setBookMeta(book);
    setRows((book.rows || []).map(helpers.fromApi));
    setSettings({ ...defaultSettingsFor(book.type), ...(book.settings || {}) });
    setWarnings(book.calculationHistory?.[0]?.warnings || []);
    setSummary(book.calculationHistory?.[0]?.summary || null);
    setCalculationHistory(book.calculationHistory || []);
    setTimeout(() => {
      skipSaveRef.current = false;
    }, 100);
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError('');
      try {
        await loadProjects();
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [loadProjects]);

  useEffect(() => {
    if (!selectedProjectId) return;
    loadBooks(selectedProjectId).catch((e) => setError(e.message));
  }, [selectedProjectId, loadBooks]);

  useEffect(() => {
    if (!selectedBookId) {
      setRows([]);
      setBookMeta(null);
      return;
    }
    loadBookDetail(selectedBookId).catch((e) => setError(e.message));
  }, [selectedBookId, loadBookDetail]);

  useEffect(() => {
    if (!selectedBookId || !bookMeta || bookMeta.locked || skipSaveRef.current) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    const helpers = rowHelpersFor(bookMeta.type);
    saveTimerRef.current = setTimeout(async () => {
      setSaving(true);
      try {
        await fieldbooksApi.updateBook(selectedBookId, {
          rows: rows.map(helpers.toApi),
          settings,
        });
        setSavedAt(new Date());
      } catch (e) {
        setError(e.message);
      } finally {
        setSaving(false);
      }
    }, 900);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [rows, settings, selectedBookId, bookMeta]);

  const handleCreateProject = async () => {
    const name = projectForm.name.trim();
    if (!name) {
      setFormHint(bg ? 'Въведете име на проекта.' : 'Enter a project name.');
      return;
    }
    setFormHint('');
    setError('');
    setCreatingProject(true);
    try {
      const res = await fieldbooksApi.createProject({
        name,
        year: projectForm.year,
        team: projectForm.team,
        site: projectForm.site,
      });
      const newId = res.data?._id;
      setProjectForm({ name: '', year: '', team: '', site: '' });
      setShowProjectForm(false);
      await loadProjects();
      if (newId) setSelectedProjectId(String(newId));
    } catch (e) {
      setError(e.message || (bg ? 'Грешка при създаване на проект.' : 'Failed to create project.'));
    } finally {
      setCreatingProject(false);
    }
  };

  const handleCreateBook = async () => {
    if (!bookForm.name.trim() || !selectedProjectId) return;
    const type = bookForm.type === 'coordinate' ? 'coordinate' : 'leveling';
    try {
      const res = await fieldbooksApi.createBook(selectedProjectId, {
        name: bookForm.name.trim(),
        date: bookForm.date || new Date().toISOString().slice(0, 10),
        crew: bookForm.crew,
        type,
        settings: defaultSettingsFor(type),
      });
      setBookForm({ name: '', date: '', crew: '', type });
      setShowBookForm(false);
      await loadBooks(selectedProjectId);
      setSelectedBookId(res.data._id);
    } catch (e) {
      setError(e.message);
    }
  };

  const handleCalculate = async () => {
    if (!selectedBookId || locked) return;
    setCalculating(true);
    setError('');
    const helpers = rowHelpersFor(bookType);
    try {
      const res = await fieldbooksApi.calculateBook(selectedBookId, {
        rows: rows.map(helpers.toApi),
        settings,
      });
      skipSaveRef.current = true;
      const book = res.data;
      setRows((book.rows || []).map(helpers.fromApi));
      setWarnings(res.warnings || []);
      setSummary(res.summary || null);
      setCalculationHistory(book.calculationHistory || []);
      setBookMeta(book);
      setBooks((prev) => prev.map((b) => (b._id === book._id ? book : b)));
      setTimeout(() => {
        skipSaveRef.current = false;
      }, 100);
    } catch (e) {
      setError(e.message);
    } finally {
      setCalculating(false);
    }
  };

  const updateRow = (index, key, value) => {
    if (locked) return;
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, [key]: value } : row)));
  };

  const handleAddRow = () => {
    if (locked) return;
    const helpers = rowHelpersFor(bookType);
    setRows((prev) => [...prev, helpers.empty()]);
  };

  const handleDuplicateRow = (index) => {
    if (locked) return;
    const copy = { ...rows[index], _id: undefined };
    setRows((prev) => [...prev.slice(0, index + 1), copy, ...prev.slice(index + 1)]);
  };

  const handleRemoveRow = (index) => {
    if (locked) return;
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  const patchBook = async (patch) => {
    if (!selectedBookId) return;
    try {
      const res = await fieldbooksApi.updateBook(selectedBookId, patch);
      setBookMeta(res.data);
      setBooks((prev) => prev.map((b) => (b._id === res.data._id ? res.data : b)));
    } catch (e) {
      setError(e.message);
    }
  };

  const handleLockBook = () => patchBook({ locked: true });
  const handleUnlockBook = () => patchBook({ locked: false });

  const handleArchiveBook = async () => {
    if (!selectedBookId) return;
    try {
      await fieldbooksApi.updateBook(selectedBookId, { archived: true });
      await loadBooks(selectedProjectId);
      setSelectedBookId(null);
    } catch (e) {
      setError(e.message);
    }
  };

  const handleRestoreBook = async () => {
    if (!selectedBookId) return;
    try {
      await fieldbooksApi.updateBook(selectedBookId, { archived: false });
      await loadBooks(selectedProjectId);
    } catch (e) {
      setError(e.message);
    }
  };

  const handleCopyBook = async () => {
    if (!selectedBookId) return;
    try {
      const res = await fieldbooksApi.copyBook(selectedBookId);
      await loadBooks(selectedProjectId);
      setSelectedBookId(res.data._id);
    } catch (e) {
      setError(e.message);
    }
  };

  const handleConfirmDelete = async () => {
    if (!confirm) return;
    setDeleting(true);
    setError('');
    try {
      if (confirm.kind === 'project') {
        await fieldbooksApi.deleteProject(confirm.id);
        const wasSelected = selectedProjectId === confirm.id;
        setSelectedBookId(null);
        const list = await loadProjects();
        if (wasSelected) {
          const next = list.find((p) => p._id !== confirm.id);
          setSelectedProjectId(next?._id ?? null);
          if (!next) setBooks([]);
        }
      } else {
        await fieldbooksApi.deleteBook(confirm.id);
        if (selectedBookId === confirm.id) setSelectedBookId(null);
        await loadBooks(selectedProjectId);
      }
      setConfirm(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleExport = () => {
    if (!rows.length) return;
    if (bookType === 'coordinate') {
      downloadCoordinateCsv({ rows, settings, summary, bookName: bookMeta?.name, language });
    } else {
      downloadLevelingCsv({ rows, settings, bookName: bookMeta?.name, language });
    }
  };

  const selectedProject = projects.find((p) => p._id === selectedProjectId);

  if (loading) {
    return (
      <Layout>
        <div className="py-20 text-center text-neutral-500">{bg ? 'Зареждане...' : 'Loading...'}</div>
      </Layout>
    );
  }

  return (
    <>
      <SEO
        title={bg ? 'Електронни карнети (пилот)' : 'Electronic field books (pilot)'}
        description={
          bg
            ? 'Пилотни електронни геодезически карнети с автоматични изчисления и проверки.'
            : 'Pilot electronic geodetic field books with automatic calculations and checks.'
        }
        canonical="/fieldbook"
      />
      <Layout>
        <div className="w-full min-h-screen bg-stone-50 dark:bg-zinc-950">
          {/* Sticky app bar */}
          <div className="sticky top-0 z-20 bg-stone-50/90 dark:bg-zinc-950/90 backdrop-blur border-b border-gray-200 dark:border-zinc-800">
            <div className="w-full max-w-[1280px] mx-auto px-4 lg:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl text-white ring-1 ring-black/10 dark:ring-white/10 shrink-0" style={gradientStyle}>
                  <Icon d={ICONS.folder} className="w-4 h-4" />
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h1 className="text-base lg:text-lg font-bold font-['Manrope'] text-black dark:text-white truncate">
                      {bg ? 'Електронни карнети' : 'Electronic field books'}
                    </h1>
                    <span className="px-2 py-0.5 bg-gray-200 dark:bg-zinc-900 rounded text-black dark:text-white text-[10px] font-bold font-['Manrope']">
                      BETA
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 dark:text-zinc-400 font-['Manrope'] truncate">
                    {selectedProject ? selectedProject.name : bg ? 'Нивелачни и координатни карнети' : 'Leveling & coordinate books'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs font-['Manrope']">
                <SaveStatus saving={saving} savedAt={savedAt} bg={bg} />
                <Link to="/tools" className={btnGhost}>
                  {bg ? 'Инструменти' : 'Tools'}
                </Link>
              </div>
            </div>
          </div>

          <div className="w-full max-w-[1280px] mx-auto px-4 lg:px-6 pt-5 pb-16 flex flex-col gap-5">
            {error && (
              <Banner tone="error" onClose={() => setError('')}>
                {error}
              </Banner>
            )}
            {formHint && (
              <Banner tone="warn" onClose={() => setFormHint('')}>
                {formHint}
              </Banner>
            )}

            {projects.length === 0 && !showProjectForm ? (
              <EmptyProjects bg={bg} onCreate={() => { setShowProjectForm(true); setFormHint(''); }} />
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-5">
                {/* ---------- Sidebar / submenu ---------- */}
                <aside className="lg:sticky lg:top-[72px] h-fit flex flex-col gap-4">
                  {/* Projects */}
                  <section className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-400 dark:text-zinc-500 font-['Manrope']">
                        {bg ? 'Проекти' : 'Projects'}
                      </h2>
                      <IconButton label={bg ? 'Нов проект' : 'New project'} onClick={() => setShowProjectForm((v) => !v)}>
                        <Icon d={ICONS.plus} className="w-4 h-4" />
                      </IconButton>
                    </div>

                    {showProjectForm && (
                      <div className="grid gap-2 p-3 bg-stone-50 dark:bg-zinc-800/60 rounded-lg border border-gray-100 dark:border-zinc-800">
                        <input
                          className={inputClass}
                          placeholder={bg ? 'Име на проект *' : 'Project name *'}
                          value={projectForm.name}
                          onChange={(e) => { setProjectForm({ ...projectForm, name: e.target.value }); if (formHint) setFormHint(''); }}
                          autoFocus
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input className={inputClass} placeholder={bg ? 'Година' : 'Year'} value={projectForm.year} onChange={(e) => setProjectForm({ ...projectForm, year: e.target.value })} />
                          <input className={inputClass} placeholder={bg ? 'Екип' : 'Team'} value={projectForm.team} onChange={(e) => setProjectForm({ ...projectForm, team: e.target.value })} />
                        </div>
                        <input className={inputClass} placeholder={bg ? 'Обект' : 'Site'} value={projectForm.site} onChange={(e) => setProjectForm({ ...projectForm, site: e.target.value })} />
                        <div className="flex gap-2 pt-1">
                          <button type="button" onClick={handleCreateProject} disabled={creatingProject} className={`${btnPrimary} flex-1`}>
                            {creatingProject ? (bg ? 'Създаване...' : 'Creating...') : bg ? 'Създай' : 'Create'}
                          </button>
                          <button type="button" onClick={() => { setShowProjectForm(false); setFormHint(''); }} className={btnGhost}>
                            {bg ? 'Отказ' : 'Cancel'}
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col gap-1.5">
                      {filteredProjects.map((p) => {
                        const active = selectedProjectId === p._id;
                        return (
                          <div
                            key={p._id}
                            className={`group relative flex items-center rounded-lg border transition-colors ${
                              active
                                ? 'border-gray-300 dark:border-zinc-600 bg-stone-50 dark:bg-zinc-800'
                                : 'border-transparent hover:bg-stone-50 dark:hover:bg-zinc-800/60'
                            }`}
                          >
                            {active && <span className="absolute left-0 inset-y-1.5 w-1 rounded-full" style={gradientStyle} />}
                            <button
                              type="button"
                              onClick={() => { setSelectedProjectId(p._id); setSelectedBookId(null); }}
                              className="flex-1 min-w-0 text-left pl-4 pr-1 py-2.5"
                            >
                              <div className="font-semibold text-sm text-black dark:text-white font-['Manrope'] truncate">{p.name}</div>
                              <div className="text-xs text-neutral-500 dark:text-zinc-400 truncate">{p.site || (p.year ? `${p.year}` : '—')}</div>
                            </button>
                            <span className="pr-2 opacity-60 hover:opacity-100">
                              <IconButton
                                label={bg ? 'Изтрий проект' : 'Delete project'}
                                danger
                                onClick={() => setConfirm({ kind: 'project', id: p._id, name: p.name })}
                              >
                                <Icon d={ICONS.trash} className="w-3.5 h-3.5" />
                              </IconButton>
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </section>

                  {/* Field books */}
                  <section className="p-4 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xs font-semibold uppercase tracking-wide text-neutral-400 dark:text-zinc-500 font-['Manrope']">
                        {bg ? 'Карнети' : 'Field books'}
                      </h2>
                      <IconButton label={bg ? 'Нов карнет' : 'New field book'} onClick={() => setShowBookForm((v) => !v)} disabled={!selectedProjectId}>
                        <Icon d={ICONS.plus} className="w-4 h-4" />
                      </IconButton>
                    </div>

                    {/* search */}
                    {books.filter((b) => !b.archived).length > 3 && (
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-zinc-500 pointer-events-none">
                          <Icon d={ICONS.search} className="w-4 h-4" />
                        </span>
                        <input
                          value={bookSearch}
                          onChange={(e) => setBookSearch(e.target.value)}
                          placeholder={bg ? 'Търси карнет...' : 'Search book...'}
                          className={`${inputClass} pl-9`}
                        />
                      </div>
                    )}

                    {showBookForm && (
                      <div className="grid gap-2 p-3 bg-stone-50 dark:bg-zinc-800/60 rounded-lg border border-gray-100 dark:border-zinc-800">
                        <input className={inputClass} placeholder={bg ? 'Име на карнет' : 'Field book name'} value={bookForm.name} onChange={(e) => setBookForm({ ...bookForm, name: e.target.value })} autoFocus />
                        <input type="date" className={inputClass} value={bookForm.date} onChange={(e) => setBookForm({ ...bookForm, date: e.target.value })} />
                        <div className="grid grid-cols-2 gap-1 p-1 bg-gray-100 dark:bg-zinc-900 rounded-lg">
                          {['coordinate', 'leveling'].map((t) => (
                            <button
                              key={t}
                              type="button"
                              onClick={() => setBookForm({ ...bookForm, type: t })}
                              className={`px-2 py-2 rounded-md text-xs font-semibold font-['Manrope'] transition-colors ${
                                bookForm.type === t ? 'bg-black dark:bg-white text-white dark:text-black' : 'text-neutral-500 dark:text-zinc-400'
                              }`}
                            >
                              {labels[t]}
                            </button>
                          ))}
                        </div>
                        <button type="button" onClick={handleCreateBook} className={btnPrimary}>
                          {bg ? 'Създай карнет' : 'Create field book'}
                        </button>
                      </div>
                    )}

                    <div className="flex flex-col gap-1.5">
                      {visibleBooks.map((book) => {
                        const active = selectedBookId === book._id;
                        return (
                          <button
                            key={book._id}
                            type="button"
                            onClick={() => setSelectedBookId(book._id)}
                            className={`relative w-full text-left pl-4 pr-3 py-2.5 rounded-lg border transition-colors ${
                              active
                                ? 'border-gray-300 dark:border-zinc-600 bg-stone-50 dark:bg-zinc-800'
                                : 'border-transparent hover:bg-stone-50 dark:hover:bg-zinc-800/60'
                            }`}
                          >
                            {active && <span className="absolute left-0 inset-y-1.5 w-1 rounded-full" style={gradientStyle} />}
                            <div className="flex items-center justify-between gap-2">
                              <span className="truncate text-sm font-medium text-black dark:text-white font-['Manrope']">{book.name}</span>
                              {book.locked && <Icon d={ICONS.lock} className="w-3.5 h-3.5 shrink-0 text-neutral-400 dark:text-zinc-500" />}
                            </div>
                            <div className="flex items-center gap-1.5 mt-1">
                              <TypeBadge type={book.type} labels={labels} />
                              <span className="text-[11px] text-neutral-400 dark:text-zinc-500">{book.date}</span>
                            </div>
                          </button>
                        );
                      })}
                      {visibleBooks.length === 0 && (
                        <p className="text-xs text-neutral-500 dark:text-zinc-400 py-2 text-center">
                          {showArchived ? (bg ? 'Няма архивирани карнети.' : 'No archived books.') : bg ? 'Няма карнети.' : 'No field books.'}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => { setShowArchived((v) => !v); setSelectedBookId(null); }}
                      className="text-xs font-medium text-neutral-500 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors text-left pt-1"
                    >
                      {showArchived ? (bg ? '← Активни карнети' : '← Active books') : bg ? 'Архивирани карнети →' : 'Archived books →'}
                    </button>
                  </section>
                </aside>

                {/* ---------- Main ---------- */}
                <div className="flex flex-col gap-5 min-w-0">
                  {selectedBook && bookMeta ? (
                    <>
                      {/* Book header */}
                      <div className="relative p-5 lg:p-6 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 overflow-hidden">
                        <span className="absolute inset-x-0 top-0 h-1" style={gradientStyle} aria-hidden />
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h2 className="text-xl font-bold text-black dark:text-white font-['Manrope']">{bookMeta.name}</h2>
                              <TypeBadge type={bookType} labels={labels} />
                              {locked && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-stone-100 dark:bg-zinc-800 text-neutral-600 dark:text-zinc-300 text-[11px] font-semibold font-['Manrope']">
                                  <Icon d={ICONS.lock} className="w-3 h-3" />
                                  {bg ? 'Заключен' : 'Locked'}
                                </span>
                              )}
                              {showArchived && (
                                <span className="px-2 py-0.5 rounded-full bg-stone-100 dark:bg-zinc-800 text-neutral-600 dark:text-zinc-300 text-[11px] font-semibold font-['Manrope']">
                                  {bg ? 'Архивиран' : 'Archived'}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-neutral-500 dark:text-zinc-400 font-['Manrope'] mt-1">
                              {bookMeta.date}{bookMeta.crew ? ` · ${bookMeta.crew}` : ''}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {showArchived ? (
                              <>
                                <button type="button" onClick={handleRestoreBook} className={btnPrimary}>
                                  <Icon d={ICONS.restore} /> {bg ? 'Възстанови' : 'Restore'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setConfirm({ kind: 'book', id: selectedBookId, name: bookMeta.name })}
                                  className={btnGhost}
                                  title={bg ? 'Изтрий' : 'Delete'}
                                >
                                  <Icon d={ICONS.trash} />
                                </button>
                              </>
                            ) : (
                              <>
                                <button type="button" onClick={handleCalculate} disabled={locked || calculating} className={btnPrimary}>
                                  <Icon d={ICONS.calc} />
                                  {calculating ? (bg ? 'Изчисляване...' : 'Calculating...') : bg ? 'Изчисли' : 'Calculate'}
                                </button>
                                <button type="button" onClick={handleExport} disabled={!rows.length} className={btnGhost}>
                                  <Icon d={ICONS.download} /> CSV
                                </button>
                                <button type="button" onClick={handleCopyBook} className={btnGhost} title={bg ? 'Копирай' : 'Copy'}>
                                  <Icon d={ICONS.copy} />
                                </button>
                                {locked ? (
                                  <button type="button" onClick={handleUnlockBook} className={btnGhost} title={bg ? 'Отключи' : 'Unlock'}>
                                    <Icon d={ICONS.unlock} />
                                  </button>
                                ) : (
                                  <button type="button" onClick={handleLockBook} className={btnGhost} title={bg ? 'Заключи' : 'Lock'}>
                                    <Icon d={ICONS.lock} />
                                  </button>
                                )}
                                <button type="button" onClick={handleArchiveBook} className={btnGhost} title={bg ? 'Архивирай' : 'Archive'}>
                                  <Icon d={ICONS.archive} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setConfirm({ kind: 'book', id: selectedBookId, name: bookMeta.name })}
                                  className={`${btnGhost} hover:text-red-600 dark:hover:text-red-400`}
                                  title={bg ? 'Изтрий' : 'Delete'}
                                >
                                  <Icon d={ICONS.trash} />
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Quick stats strip */}
                        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2">
                          <Stat label={bg ? 'Точки' : 'Points'} value={rows.length} />
                          {bookType === 'coordinate' ? (
                            <>
                              <Stat label="f_β (mgon)" value={summary?.angularMisclosureMgon} />
                              <Stat label="f_S (m)" value={summary?.fS} />
                              <Stat label={bg ? 'Отн.' : 'Rel.'} value={summary?.relative ? `1/${summary.relative}` : '—'} />
                            </>
                          ) : (
                            <>
                              <Stat label={bg ? 'Контролни' : 'Control'} value={rows.filter((r) => r.isControl).length} />
                              <Stat label={bg ? 'Допуск (mm)' : 'Tol. (mm)'} value={settings.toleranceMm} />
                              <Stat label={bg ? 'Предупр.' : 'Warnings'} value={warnings.length} />
                            </>
                          )}
                        </div>
                      </div>

                      {/* Table */}
                      <div className="flex flex-col gap-3">
                        {bookType === 'coordinate' ? (
                          <CoordinateCarnetTable rows={rows} summary={summary} locked={locked} bg={bg} onUpdateRow={updateRow} onDuplicate={handleDuplicateRow} onRemove={handleRemoveRow} />
                        ) : (
                          <LevelingCarnetTable rows={rows} locked={locked} bg={bg} onUpdateRow={updateRow} onDuplicate={handleDuplicateRow} onRemove={handleRemoveRow} />
                        )}

                        {!locked && (
                          <button
                            type="button"
                            onClick={handleAddRow}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-gray-200 dark:border-zinc-700 text-sm font-semibold text-neutral-600 dark:text-zinc-300 font-['Manrope'] hover:border-gray-400 dark:hover:border-zinc-500 hover:text-black dark:hover:text-white transition-colors"
                          >
                            <Icon d={ICONS.plus} /> {bg ? 'Добави точка' : 'Add point'}
                          </button>
                        )}
                      </div>

                      {/* Settings + Checks */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                        <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800">
                          <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-400 dark:text-zinc-500 mb-4 font-['Manrope']">
                            {bg ? 'Настройки' : 'Settings'}
                          </h3>
                          {bookType === 'coordinate' ? (
                            <CoordinateSettings settings={settings} setSettings={setSettings} locked={locked} bg={bg} />
                          ) : (
                            <LevelingSettings settings={settings} setSettings={setSettings} locked={locked} bg={bg} />
                          )}
                        </div>

                        <div className="p-5 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 flex flex-col">
                          <h3 className="text-xs font-semibold uppercase tracking-wide text-neutral-400 dark:text-zinc-500 mb-4 font-['Manrope']">
                            {bg ? 'Проверки' : 'Checks'}
                          </h3>

                          {warnings.length === 0 ? (
                            <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-zinc-400 font-['Manrope']">
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-stone-100 dark:bg-zinc-800 text-black dark:text-white">
                                <Icon d={['M5 13l4 4L19 7']} className="w-3.5 h-3.5" />
                              </span>
                              {bg ? 'Няма предупреждения. Натиснете „Изчисли“.' : 'No warnings. Press Calculate.'}
                            </div>
                          ) : (
                            <ul className="flex flex-col gap-2">
                              {warnings.map((w, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm p-2.5 rounded-lg bg-stone-100 dark:bg-zinc-800 text-black dark:text-white border-l-2 border-black dark:border-white font-['Manrope']">
                                  <span className="shrink-0 mt-0.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-black dark:bg-white text-white dark:text-black text-[10px] font-bold">!</span>
                                  {w}
                                </li>
                              ))}
                            </ul>
                          )}

                          {calculationHistory.length > 0 && (
                            <div className="mt-4 text-xs text-neutral-400 dark:text-zinc-500 font-['Manrope']">
                              {bg ? 'Последно изчисление: ' : 'Last calculation: '}
                              {new Date(calculationHistory[0].timestamp).toLocaleString(bg ? 'bg-BG' : 'en-GB')}
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="p-12 text-center bg-white dark:bg-zinc-900 rounded-xl border border-dashed border-gray-200 dark:border-zinc-700">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-stone-100 dark:bg-zinc-800 text-neutral-400 dark:text-zinc-500 mb-3">
                        <Icon d={ICONS.folder} className="w-6 h-6" />
                      </div>
                      <p className="text-neutral-500 dark:text-zinc-400 font-['Manrope']">
                        {bg ? 'Изберете или създайте карнет от менюто вляво.' : 'Select or create a field book from the menu.'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <ConfirmModal
          open={!!confirm}
          bg={bg}
          busy={deleting}
          title={
            confirm?.kind === 'project'
              ? bg ? 'Изтриване на проект?' : 'Delete project?'
              : bg ? 'Изтриване на карнет?' : 'Delete field book?'
          }
          message={
            confirm?.kind === 'project'
              ? bg
                ? `„${confirm?.name}“ и всички карнети в него ще бъдат изтрити безвъзвратно.`
                : `"${confirm?.name}" and all field books inside it will be permanently deleted.`
              : bg
                ? `„${confirm?.name}“ ще бъде изтрит безвъзвратно.`
                : `"${confirm?.name}" will be permanently deleted.`
          }
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirm(null)}
        />
      </Layout>
    </>
  );
};

/* ---------- presentational helpers ---------- */

const SaveStatus = ({ saving, savedAt, bg }) => {
  if (saving) {
    return (
      <span className="inline-flex items-center gap-1.5 text-neutral-500 dark:text-zinc-400">
        <span className="w-1.5 h-1.5 rounded-full bg-black dark:bg-white animate-pulse" />
        {bg ? 'Запазване...' : 'Saving...'}
      </span>
    );
  }
  if (savedAt) {
    return (
      <span className="inline-flex items-center gap-1.5 text-neutral-400 dark:text-zinc-500">
        <Icon d={['M5 13l4 4L19 7']} className="w-3.5 h-3.5" />
        {bg ? 'Запазено' : 'Saved'}
      </span>
    );
  }
  return null;
};

const IconButton = ({ children, label, onClick, disabled, danger }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    aria-label={label}
    title={label}
    className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-neutral-500 dark:text-zinc-400 transition-colors disabled:opacity-40 ${
      danger
        ? 'hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-600 dark:hover:text-red-400'
        : 'hover:bg-stone-100 dark:hover:bg-zinc-800 hover:text-black dark:hover:text-white'
    }`}
  >
    {children}
  </button>
);

const TypeBadge = ({ type, labels }) => (
  <span className="inline-block text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded bg-stone-100 dark:bg-zinc-800 text-neutral-600 dark:text-zinc-300 font-semibold font-['Manrope']">
    {labels[type] || type}
  </span>
);

const Banner = ({ tone, children, onClose }) => {
  const tones = {
    error: 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300',
    warn: 'bg-stone-100 dark:bg-zinc-800 border-gray-200 dark:border-zinc-700 text-black dark:text-white',
  };
  return (
    <div className={`flex items-start justify-between gap-3 p-3 rounded-xl border text-sm font-['Manrope'] ${tones[tone] || tones.warn}`}>
      <span>{children}</span>
      {onClose && (
        <button type="button" onClick={onClose} aria-label="close" className="shrink-0 opacity-60 hover:opacity-100">
          ×
        </button>
      )}
    </div>
  );
};

const EmptyProjects = ({ bg, onCreate }) => (
  <div className="p-10 lg:p-14 bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 text-center flex flex-col items-center gap-4">
    <span className="inline-flex items-center justify-center w-14 h-14 rounded-2xl text-white ring-1 ring-black/10 dark:ring-white/10" style={gradientStyle}>
      <Icon d={ICONS.folder} className="w-7 h-7" />
    </span>
    <div>
      <h2 className="text-lg font-bold text-black dark:text-white font-['Manrope']">
        {bg ? 'Започнете с проект' : 'Start with a project'}
      </h2>
      <p className="text-sm text-neutral-500 dark:text-zinc-400 font-['Manrope'] mt-1 max-w-sm">
        {bg ? 'Групирайте карнетите си по обект или задача. Създайте първия си проект, за да започнете.' : 'Group your field books by site or task. Create your first project to get started.'}
      </p>
    </div>
    <button type="button" onClick={onCreate} className={btnPrimary}>
      <Icon d={ICONS.plus} /> {bg ? 'Нов проект' : 'New project'}
    </button>
  </div>
);

const ConfirmModal = ({ open, title, message, onConfirm, onCancel, busy, bg }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={busy ? undefined : onCancel} />
      <div className="relative w-full max-w-sm bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-xl p-6 flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <span className="shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400">
            <Icon d={ICONS.trash} className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-base font-bold text-black dark:text-white font-['Manrope']">{title}</h3>
            <p className="text-sm text-neutral-500 dark:text-zinc-400 font-['Manrope'] mt-1">{message}</p>
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <button type="button" onClick={onCancel} disabled={busy} className={btnGhost}>
            {bg ? 'Отказ' : 'Cancel'}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-red-600 text-white text-sm font-semibold font-['Manrope'] transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {busy ? (bg ? 'Изтриване...' : 'Deleting...') : bg ? 'Изтрий' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

const Stat = ({ label, value }) => (
  <div className="p-2.5 rounded-lg bg-stone-50 dark:bg-zinc-800/60 border border-gray-100 dark:border-zinc-800">
    <div className="text-[10px] uppercase tracking-wide text-neutral-400 dark:text-zinc-500 font-['Manrope']">{label}</div>
    <div className="text-base font-bold text-black dark:text-white tabular-nums font-['Manrope']">
      {value === null || value === undefined || value === '' ? '—' : value}
    </div>
  </div>
);

const SettingField = ({ label, children, full }) => (
  <label className={`flex flex-col gap-1.5 ${full ? 'col-span-2' : ''}`}>
    <span className="text-xs font-medium text-neutral-600 dark:text-zinc-400 font-['Manrope']">{label}</span>
    {children}
  </label>
);

const LevelingSettings = ({ settings, setSettings, locked, bg }) => (
  <div className="grid grid-cols-2 gap-3">
    <SettingField label={bg ? 'Начална кота (репер), m' : 'Benchmark height, m'} full>
      <input type="number" step="any" className={inputClass} value={settings.benchmarkHeight} disabled={locked} onChange={(e) => setSettings({ ...settings, benchmarkHeight: e.target.value })} />
    </SettingField>
    <SettingField label={bg ? 'Допуск, mm' : 'Tolerance, mm'}>
      <input type="number" step="any" className={inputClass} value={settings.toleranceMm} disabled={locked} onChange={(e) => setSettings({ ...settings, toleranceMm: e.target.value })} />
    </SettingField>
    <SettingField label={bg ? 'Закръгляне' : 'Decimals'}>
      <input type="number" className={inputClass} value={settings.rounding} disabled={locked} onChange={(e) => setSettings({ ...settings, rounding: e.target.value })} />
    </SettingField>
  </div>
);

const CoordinateSettings = ({ settings, setSettings, locked, bg }) => {
  const set = (key, value) => setSettings({ ...settings, [key]: value });
  const closed = settings.closed !== false;
  return (
    <div className="grid grid-cols-2 gap-3">
      <SettingField label={bg ? 'Начало Y, m' : 'Start Y, m'}>
        <input type="number" step="any" className={inputClass} value={settings.startY ?? ''} disabled={locked} onChange={(e) => set('startY', e.target.value)} />
      </SettingField>
      <SettingField label={bg ? 'Начало X, m' : 'Start X, m'}>
        <input type="number" step="any" className={inputClass} value={settings.startX ?? ''} disabled={locked} onChange={(e) => set('startX', e.target.value)} />
      </SettingField>
      <SettingField label={bg ? 'Начален посочен ъгъл α (gon)' : 'Start bearing α (gon)'} full>
        <input type="number" step="any" className={inputClass} value={settings.startBearing ?? ''} disabled={locked} onChange={(e) => set('startBearing', e.target.value)} />
      </SettingField>
      <label className="col-span-2 flex items-center gap-2.5 p-2.5 rounded-lg bg-stone-50 dark:bg-zinc-800/60 border border-gray-100 dark:border-zinc-800 cursor-pointer">
        <input type="checkbox" checked={closed} disabled={locked} onChange={(e) => set('closed', e.target.checked)} className="accent-black dark:accent-white w-4 h-4" />
        <span className="text-xs text-neutral-600 dark:text-zinc-400 font-['Manrope']">{bg ? 'Затворен ход (краят съвпада с началото)' : 'Closed traverse (end equals start)'}</span>
      </label>
      {!closed && (
        <>
          <SettingField label={bg ? 'Край Y, m' : 'End Y, m'}>
            <input type="number" step="any" className={inputClass} value={settings.endY ?? ''} disabled={locked} onChange={(e) => set('endY', e.target.value)} />
          </SettingField>
          <SettingField label={bg ? 'Край X, m' : 'End X, m'}>
            <input type="number" step="any" className={inputClass} value={settings.endX ?? ''} disabled={locked} onChange={(e) => set('endX', e.target.value)} />
          </SettingField>
        </>
      )}
      <SettingField label={bg ? 'Знаци координати' : 'Coord. decimals'}>
        <input type="number" className={inputClass} value={settings.rounding ?? 3} disabled={locked} onChange={(e) => set('rounding', e.target.value)} />
      </SettingField>
      <SettingField label={bg ? 'Допуск f_β (mgon)' : 'f_β tol. (mgon)'}>
        <input type="number" className={inputClass} value={settings.angularToleranceMgon ?? 50} disabled={locked} onChange={(e) => set('angularToleranceMgon', e.target.value)} />
      </SettingField>
    </div>
  );
};

export default FieldBookWorkspace;
