import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import SEO from '../../shared/SEO';
import ClassroomLayout from '../ClassroomLayout';
import { Card } from '../ui/Card';
import { classroomApi } from '../../../services/classroomApi';
import { useTranslation } from '../../../hooks/useTranslation';
import { EDU_TOOLS } from '../../../config/eduTools';

const CreateAssignmentPage = () => {
  const { language } = useTranslation();
  const bg = language === 'bg';
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedCourse = searchParams.get('course') || '';

  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    course: preselectedCourse,
    toolKey: EDU_TOOLS[0].toolKey,
    variantsCount: 1,
    dueDate: '',
    maxAttempts: 3,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    classroomApi.listCourses().then((res) => setCourses(res.data || []));
  }, []);

  useEffect(() => {
    if (preselectedCourse) {
      setForm((f) => ({ ...f, course: preselectedCourse }));
    }
  }, [preselectedCourse]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const due = new Date(form.dueDate);
      if (Number.isNaN(due.getTime())) {
        throw new Error(bg ? 'Невалидна дата' : 'Invalid date');
      }
      const created = await classroomApi.createAssignment({
        title: form.title,
        description: form.description,
        course: form.course,
        toolKey: form.toolKey,
        variantsCount: Number(form.variantsCount),
        dueDate: due.toISOString(),
        status: 'active',
        options: {
          maxAttempts: Number(form.maxAttempts),
          autoGrade: true,
          showFeedback: true,
        },
      });
      const newId = created?.data?._id;
      navigate(newId ? `/classroom/teaching/assignments/${newId}` : `/classroom/groups/${form.course}`);
    } catch (err) {
      const detail = err.data?.error || err.data?.detail;
      setError(detail ? `${err.message}: ${detail}` : err.message);
    } finally {
      setSaving(false);
    }
  };

  const defaultDue = () => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().slice(0, 16);
  };

  return (
    <>
      <SEO title={bg ? 'Ново задание' : 'New assignment'} canonical="/classroom/assignments/new" />
      <ClassroomLayout
        title={bg ? 'Ново задание' : 'New assignment'}
        subtitle={bg ? 'Свържете упражнение с калкулатор от GeoSolver.' : 'Link practice to a GeoSolver calculator.'}
      >
        <Card className="p-6 max-w-xl">
          {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium font-['Manrope']">{bg ? 'Група' : 'Group'}</span>
              <select
                required
                value={form.course}
                onChange={(e) => setForm({ ...form, course: e.target.value })}
                className="px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white"
              >
                <option value="">{bg ? 'Избери...' : 'Select...'}</option>
                {courses.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium font-['Manrope']">{bg ? 'Инструмент' : 'Tool'}</span>
              <select
                value={form.toolKey}
                onChange={(e) => setForm({ ...form, toolKey: e.target.value })}
                className="px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
              >
                {EDU_TOOLS.map((t) => (
                  <option key={t.toolKey} value={t.toolKey}>
                    {bg ? t.titleBg : t.titleEn}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium font-['Manrope']">{bg ? 'Заглавие' : 'Title'}</span>
              <input
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium font-['Manrope']">{bg ? 'Инструкции' : 'Instructions'}</span>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-black dark:text-white"
              />
            </label>

            <div className="grid grid-cols-2 gap-4">
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium font-['Manrope']">{bg ? 'Варианти' : 'Variants'}</span>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={form.variantsCount}
                  onChange={(e) => setForm({ ...form, variantsCount: e.target.value })}
                  className="px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium font-['Manrope']">{bg ? 'Опити' : 'Attempts'}</span>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={form.maxAttempts}
                  onChange={(e) => setForm({ ...form, maxAttempts: e.target.value })}
                  className="px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                />
              </label>
            </div>

            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium font-['Manrope']">{bg ? 'Краен срок' : 'Due date'}</span>
              <input
                required
                type="datetime-local"
                value={form.dueDate || defaultDue()}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                className="px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
              />
            </label>

            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg text-sm font-medium w-fit disabled:opacity-50"
            >
              {saving ? (bg ? 'Създаване...' : 'Creating...') : bg ? 'Публикувай задание' : 'Publish assignment'}
            </button>
          </form>
        </Card>
      </ClassroomLayout>
    </>
  );
};

export default CreateAssignmentPage;
