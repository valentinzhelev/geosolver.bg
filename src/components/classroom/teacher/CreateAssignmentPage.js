import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import SEO from '../../shared/SEO';
import ClassroomLayout from '../ClassroomLayout';
import { Card } from '../ui/Card';
import { classroomApi } from '../../../services/classroomApi';
import { useTranslation } from '../../../hooks/useTranslation';
import { EDU_TOOLS } from '../../../config/eduTools';
import {
  CALCULATOR_POLICY_OPTIONS,
  DEFAULT_CALCULATOR_POLICY,
  getCalculatorPolicyMeta,
} from '../../../config/eduCalculatorPolicy';

const CreateAssignmentPage = () => {
  const { language } = useTranslation();
  const bg = language === 'bg';
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedCourse = searchParams.get('course') || '';

  const [courses, setCourses] = useState([]);
  const [presets, setPresets] = useState([]);
  const [myTemplates, setMyTemplates] = useState([]);
  const [templateTitle, setTemplateTitle] = useState('');
  const [templateBusy, setTemplateBusy] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    course: preselectedCourse,
    toolKey: EDU_TOOLS[0].toolKey,
    variantsCount: 1,
    dueDate: '',
    maxAttempts: 3,
    customTolerance: 0.01,
    customToleranceType: 'absolute',
    publishAt: '',
    calculatorPolicy: DEFAULT_CALCULATOR_POLICY,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadMyTemplates = () => {
    classroomApi.listMyTemplates().then((res) => setMyTemplates(res.data || [])).catch(() => setMyTemplates([]));
  };

  useEffect(() => {
    classroomApi.listCourses().then((res) => setCourses(res.data || []));
    classroomApi.getAssignmentPresets().then((res) => setPresets(res.data || [])).catch(() => {});
    loadMyTemplates();
  }, []);

  useEffect(() => {
    if (preselectedCourse) {
      setForm((f) => ({ ...f, course: preselectedCourse }));
    }
  }, [preselectedCourse]);

  const defaultDue = () => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().slice(0, 16);
  };

  const applyPreset = (preset) => {
    const due = new Date();
    due.setDate(due.getDate() + (preset.daysUntilDue || 7));
    setForm((f) => ({
      ...f,
      title: bg ? preset.titleBg : preset.titleEn,
      toolKey: preset.toolKey,
      variantsCount: preset.variantsCount,
      maxAttempts: preset.maxAttempts,
      customTolerance: preset.customTolerance,
      customToleranceType: preset.customToleranceType || 'absolute',
      dueDate: due.toISOString().slice(0, 16),
    }));
  };

  const applyMyTemplate = (tpl) => {
    const due = new Date();
    due.setDate(due.getDate() + (tpl.daysUntilDue || 7));
    setForm((f) => ({
      ...f,
      title: tpl.title,
      description: tpl.description || '',
      toolKey: tpl.toolKey,
      variantsCount: tpl.variantsCount ?? 1,
      maxAttempts: tpl.maxAttempts ?? 3,
      customTolerance: tpl.customTolerance ?? 0.01,
      customToleranceType: tpl.customToleranceType || 'absolute',
      dueDate: due.toISOString().slice(0, 16),
      calculatorPolicy: tpl.calculatorPolicy || DEFAULT_CALCULATOR_POLICY,
    }));
  };

  const handleSaveTemplate = async () => {
    const title = templateTitle.trim() || form.title.trim();
    if (!title) {
      setError(bg ? 'Въведете заглавие за шаблона.' : 'Enter a template title.');
      return;
    }
    setTemplateBusy(true);
    setError('');
    try {
      await classroomApi.saveTemplate({
        title,
        toolKey: form.toolKey,
        description: form.description,
        variantsCount: Number(form.variantsCount),
        maxAttempts: Number(form.maxAttempts),
        daysUntilDue: 7,
        customTolerance: Number(form.customTolerance),
        customToleranceType: form.customToleranceType,
        calculatorPolicy: form.calculatorPolicy,
      });
      setTemplateTitle('');
      loadMyTemplates();
    } catch (err) {
      setError(err.message);
    } finally {
      setTemplateBusy(false);
    }
  };

  const handleDeleteTemplate = async (templateId) => {
    setTemplateBusy(true);
    setError('');
    try {
      await classroomApi.deleteTemplate(templateId);
      loadMyTemplates();
    } catch (err) {
      setError(err.message);
    } finally {
      setTemplateBusy(false);
    }
  };

  const buildPayload = (status) => {
    const due = new Date(form.dueDate || defaultDue());
    if (Number.isNaN(due.getTime())) {
      throw new Error(bg ? 'Невалидна дата' : 'Invalid date');
    }
    return {
      title: form.title,
      description: form.description,
      course: form.course,
      toolKey: form.toolKey,
      variantsCount: Number(form.variantsCount),
      dueDate: due.toISOString(),
      status,
      publishAt: form.publishAt ? new Date(form.publishAt).toISOString() : undefined,
      options: {
        maxAttempts: Number(form.maxAttempts),
        autoGrade: true,
        showFeedback: true,
        customTolerance: Number(form.customTolerance),
        customToleranceType: form.customToleranceType,
        calculatorPolicy: form.calculatorPolicy,
      },
    };
  };

  const policyMeta = getCalculatorPolicyMeta(form.calculatorPolicy, bg);

  const handleSubmit = async (e, asDraft = false) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const created = await classroomApi.createAssignment(buildPayload(asDraft ? 'draft' : 'active'));
      const newId = created?.data?._id;
      navigate(newId ? `/classroom/teaching/assignments/${newId}` : `/classroom/groups/${form.course}`);
    } catch (err) {
      const detail = err.data?.error || err.data?.detail;
      setError(detail ? `${err.message}: ${detail}` : err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <SEO title={bg ? 'Ново задание' : 'New assignment'} canonical="/classroom/assignments/new" />
      <ClassroomLayout
        title={bg ? 'Ново задание' : 'New assignment'}
        subtitle={bg ? 'Свържете упражнение с калкулатор от GeoSolver.' : 'Link practice to a GeoSolver calculator.'}
      >
        <Card className="p-6 max-w-xl flex flex-col gap-4">
          {error && <p className="text-sm text-red-600">{error}</p>}

          {presets.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium font-['Manrope']">{bg ? 'Готови шаблони' : 'Built-in presets'}</span>
              <div className="flex flex-wrap gap-2">
                {presets.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => applyPreset(p)}
                    className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-zinc-700 hover:bg-stone-50 dark:hover:bg-zinc-800"
                  >
                    {bg ? p.titleBg : p.titleEn}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2 border-t border-stone-100 dark:border-zinc-800 pt-4">
            <span className="text-sm font-medium font-['Manrope']">{bg ? 'Моите шаблони' : 'My saved templates'}</span>
            {myTemplates.length === 0 ? (
              <p className="text-xs text-neutral-500 dark:text-zinc-400 font-['Manrope']">
                {bg ? 'Няма запазени шаблони.' : 'No saved templates yet.'}
              </p>
            ) : (
              <ul className="flex flex-col gap-1">
                {myTemplates.map((tpl) => (
                  <li key={tpl._id} className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      disabled={templateBusy}
                      onClick={() => applyMyTemplate(tpl)}
                      className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-zinc-700 hover:bg-stone-50 dark:hover:bg-zinc-800"
                    >
                      {tpl.title}
                    </button>
                    <button
                      type="button"
                      disabled={templateBusy}
                      onClick={() => handleDeleteTemplate(tpl._id)}
                      className="text-xs text-red-600 hover:underline"
                    >
                      {bg ? 'Изтрий' : 'Delete'}
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex flex-wrap gap-2 items-end">
              <label className="flex flex-col gap-1 flex-1 min-w-[160px]">
                <span className="text-xs text-neutral-500 dark:text-zinc-400 font-['Manrope']">
                  {bg ? 'Име при запазване (по избор)' : 'Save as (optional)'}
                </span>
                <input
                  value={templateTitle}
                  onChange={(e) => setTemplateTitle(e.target.value)}
                  placeholder={form.title || (bg ? 'Заглавие' : 'Title')}
                  className="px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm"
                />
              </label>
              <button
                type="button"
                disabled={templateBusy || !form.toolKey}
                onClick={handleSaveTemplate}
                className="px-3 py-2 text-sm rounded-lg outline outline-1 outline-gray-200 dark:outline-zinc-700 disabled:opacity-50"
              >
                {templateBusy ? '...' : bg ? 'Запази като шаблон' : 'Save as template'}
              </button>
            </div>
          </div>

          <form onSubmit={(e) => handleSubmit(e, false)} className="flex flex-col gap-4">
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

            <div className="grid grid-cols-2 gap-4">
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium font-['Manrope']">{bg ? 'Допуск' : 'Tolerance'}</span>
                <input
                  type="number"
                  step="any"
                  min={0}
                  value={form.customTolerance}
                  onChange={(e) => setForm({ ...form, customTolerance: e.target.value })}
                  className="px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-sm font-medium font-['Manrope']">{bg ? 'Тип допуск' : 'Tolerance type'}</span>
                <select
                  value={form.customToleranceType}
                  onChange={(e) => setForm({ ...form, customToleranceType: e.target.value })}
                  className="px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                >
                  <option value="absolute">{bg ? 'Абсолютен' : 'Absolute'}</option>
                  <option value="relative">{bg ? 'Относителен' : 'Relative'}</option>
                  <option value="percentage">{bg ? 'Процент' : 'Percentage'}</option>
                </select>
              </label>
            </div>

            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium font-['Manrope']">{bg ? 'Калкулатор за ученици' : 'Calculator for students'}</span>
              <select
                value={form.calculatorPolicy}
                onChange={(e) => setForm({ ...form, calculatorPolicy: e.target.value })}
                className="px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
              >
                {CALCULATOR_POLICY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {bg ? opt.labelBg : opt.labelEn}
                  </option>
                ))}
              </select>
              <p className="text-xs text-neutral-500 dark:text-zinc-400 font-['Manrope']">{policyMeta.teacherHint}</p>
            </label>

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

            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium font-['Manrope']">
                {bg ? 'Публикуване от (по избор)' : 'Publish from (optional)'}
              </span>
              <input
                type="datetime-local"
                value={form.publishAt}
                onChange={(e) => setForm({ ...form, publishAt: e.target.value })}
                className="px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
              />
            </label>

            <div className="flex flex-wrap gap-2">
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg text-sm font-medium disabled:opacity-50"
              >
                {saving ? (bg ? 'Създаване...' : 'Creating...') : bg ? 'Публикувай' : 'Publish'}
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={(e) => handleSubmit(e, true)}
                className="px-4 py-2 rounded-lg text-sm font-medium outline outline-1 outline-gray-200 dark:outline-zinc-700 disabled:opacity-50"
              >
                {bg ? 'Запази чернова' : 'Save draft'}
              </button>
            </div>
          </form>
        </Card>
      </ClassroomLayout>
    </>
  );
};

export default CreateAssignmentPage;
