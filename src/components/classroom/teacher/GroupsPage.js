import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../../shared/SEO';
import ClassroomLayout from '../ClassroomLayout';
import { Card, EmptyState } from '../ui/Card';
import { ActionButton } from '../ui/ActionButton';
import { classroomApi } from '../../../services/classroomApi';
import { useTranslation } from '../../../hooks/useTranslation';

const gradientStyle = {
  backgroundImage: 'url(/images/gradient_wallpaper.jpg)',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
};

const groupInitials = (name) =>
  (name || '?')
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

const PeopleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M5 13l4 4L19 7" />
  </svg>
);

const GroupsPage = () => {
  const { language } = useTranslation();
  const bg = language === 'bg';
  const [courses, setCourses] = useState([]);
  const [showArchived, setShowArchived] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', code: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [statusBusy, setStatusBusy] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    const params = showArchived ? { archived: 'true' } : {};
    classroomApi
      .listCourses(params)
      .then((res) => setCourses(res.data || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [showArchived]);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await classroomApi.createCourse({
        name: form.name,
        code: form.code.toUpperCase(),
        description: form.description,
      });
      setForm({ name: '', code: '', description: '' });
      setShowForm(false);
      setMessage(bg ? 'Групата е създадена.' : 'Group created.');
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleRestoreGroup = async (courseId) => {
    setStatusBusy(true);
    setError('');
    try {
      await classroomApi.restoreCourse(courseId);
      setMessage(bg ? 'Групата е възстановена.' : 'Group restored.');
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setStatusBusy(false);
    }
  };

  return (
    <>
      <SEO title={bg ? 'Групи — GeoSolver Edu' : 'Groups — GeoSolver Edu'} canonical="/classroom/groups" />
      <ClassroomLayout
        title={showArchived ? (bg ? 'Архивирани групи' : 'Archived groups') : bg ? 'Групи' : 'Groups'}
        subtitle={
          showArchived
            ? bg
              ? 'Възстановете група, ако сте я архивирали по погрешка.'
              : 'Restore a group if you archived it by mistake.'
            : bg
              ? 'Създайте група и споделете кода с учениците.'
              : 'Create a group and share the code with students.'
        }
      >
        {error && <Card className="p-4 text-sm text-red-600">{error}</Card>}
        {message && (
          <Card className="p-4 flex items-center gap-2 text-sm font-medium text-black dark:text-white font-['Manrope']">
            <span className="shrink-0 w-7 h-7 rounded-full bg-stone-100 dark:bg-zinc-800 text-black dark:text-white flex items-center justify-center">
              <CheckIcon />
            </span>
            {message}
          </Card>
        )}

        <div className="flex flex-wrap justify-end items-center gap-2">
          <ActionButton
            type="button"
            variant="outline"
            className="text-sm px-3 py-1.5"
            onClick={() => {
              setShowArchived((v) => !v);
              setMessage('');
            }}
          >
            {showArchived ? (bg ? 'Активни групи' : 'Active groups') : bg ? 'Архивирани' : 'Archived'}
          </ActionButton>
          {!showArchived && (
            <button
              type="button"
              onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg text-sm font-medium font-['Manrope']"
            >
              {showForm ? (bg ? 'Отказ' : 'Cancel') : bg ? '+ Нова група' : '+ New group'}
            </button>
          )}
        </div>

        {showForm && !showArchived && (
          <Card className="p-6">
            <form onSubmit={handleCreate} className="flex flex-col gap-4 max-w-lg">
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium font-['Manrope'] text-black dark:text-white">
                  {bg ? 'Име на групата' : 'Group name'}
                </span>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white font-['Manrope']"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium font-['Manrope'] text-black dark:text-white">
                  {bg ? 'Код (напр. GEO11A)' : 'Code (e.g. GEO11A)'}
                </span>
                <input
                  required
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  className="px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 font-mono text-black dark:text-white"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium font-['Manrope'] text-black dark:text-white">
                  {bg ? 'Описание' : 'Description'}
                </span>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                  className="px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white font-['Manrope']"
                />
              </label>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg text-sm font-medium w-fit disabled:opacity-50"
              >
                {saving ? (bg ? 'Запазване...' : 'Saving...') : bg ? 'Създай група' : 'Create group'}
              </button>
            </form>
          </Card>
        )}

        {loading && (
          <Card className="p-8 text-center text-neutral-500 dark:text-zinc-400 font-['Manrope']">{bg ? 'Зареждане...' : 'Loading...'}</Card>
        )}

        {!loading && courses.length === 0 && !showForm && (
          <EmptyState
            title={showArchived ? (bg ? 'Няма архивирани групи' : 'No archived groups') : bg ? 'Няма групи' : 'No groups'}
            description={
              showArchived
                ? bg
                  ? 'Архивираните групи ще се появят тук.'
                  : 'Archived groups will appear here.'
                : bg
                  ? 'Създайте първата група за вашия клас.'
                  : 'Create your first class group.'
            }
          />
        )}

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {courses.map((c) => (
            <Card
              key={c._id}
              className="group relative p-5 h-full flex flex-col gap-3 overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:outline-gray-300 dark:hover:outline-zinc-600"
            >
              {/* Decorative brand-gradient top accent */}
              <span className="absolute inset-x-0 top-0 h-1" style={gradientStyle} aria-hidden />

              <div className="flex items-start gap-3">
                <span
                  className="shrink-0 w-11 h-11 rounded-xl bg-stone-100 dark:bg-zinc-800 text-black dark:text-white flex items-center justify-center text-sm font-bold font-['Manrope'] ring-1 ring-stone-200 dark:ring-zinc-700"
                >
                  {groupInitials(c.name)}
                </span>
                <div className="min-w-0 flex-1">
                  <Link
                    to={`/classroom/groups/${c._id}`}
                    className="font-bold text-black dark:text-white font-['Manrope'] hover:underline block truncate"
                  >
                    {c.name}
                  </Link>
                  <span className="inline-block mt-1 text-[11px] font-mono px-2 py-0.5 bg-stone-100 dark:bg-zinc-800 rounded text-neutral-600 dark:text-zinc-300">
                    {c.code}
                  </span>
                </div>
              </div>

              {c.description && (
                <p className="text-sm text-neutral-600 dark:text-zinc-400 font-['Manrope'] line-clamp-2">
                  {c.description}
                </p>
              )}

              <p className="inline-flex items-center gap-1.5 text-xs text-neutral-500 dark:text-zinc-400 font-['Manrope']">
                <PeopleIcon />
                {c.students?.length || 0} {bg ? 'ученици' : 'students'}
              </p>

              <div className="flex flex-wrap gap-2 mt-auto pt-1">
                <ActionButton to={`/classroom/groups/${c._id}`} variant="primary">
                  {bg ? 'Отвори' : 'Open'}
                </ActionButton>
                {showArchived && (
                  <ActionButton
                    type="button"
                    variant="secondary"
                    disabled={statusBusy}
                    onClick={() => handleRestoreGroup(c._id)}
                  >
                    {bg ? 'Възстанови' : 'Restore'}
                  </ActionButton>
                )}
              </div>
            </Card>
          ))}
        </div>
      </ClassroomLayout>
    </>
  );
};

export default GroupsPage;
