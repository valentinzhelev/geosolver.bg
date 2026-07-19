import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import SEO from '../../shared/SEO';
import ClassroomLayout from '../ClassroomLayout';
import { Card } from '../ui/Card';
import Select from '../ui/Select';
import { classroomApi } from '../../../services/classroomApi';
import { fieldbooksApi } from '../../../services/fieldbookApi';
import { useTranslation } from '../../../hooks/useTranslation';
import { EDU_TOOLS } from '../../../config/eduTools';
import {
  CALCULATOR_POLICY_OPTIONS,
  DEFAULT_CALCULATOR_POLICY,
  getCalculatorPolicyMeta,
} from '../../../config/eduCalculatorPolicy';

const gradientStyle = {
  backgroundImage: 'url(/images/gradient_wallpaper.jpg)',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
};

const SectionLabel = ({ children }) => (
  <span className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400 dark:text-zinc-500 font-['Manrope']">
    {children}
  </span>
);

const CreateAssignmentPage = () => {
  const { language } = useTranslation();
  const bg = language === 'bg';
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedCourse = searchParams.get('course') || '';

  const [courses, setCourses] = useState([]);
  const [projects, setProjects] = useState([]);
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
    linkedProjectId: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadMyTemplates = () => {
    classroomApi.listMyTemplates().then((res) => setMyTemplates(res.data || [])).catch(() => setMyTemplates([]));
  };

  useEffect(() => {
    classroomApi.listCourses().then((res) => setCourses(res.data || []));
    classroomApi.getAssignmentPresets().then((res) => setPresets(res.data || [])).catch(() => {});
    fieldbooksApi.listProjects().then((res) => setProjects(res.data || res.projects || [])).catch(() => setProjects([]));
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
        linkedProjectId: form.linkedProjectId || null,
      },
    };
  };

  const policyMeta = getCalculatorPolicyMeta(form.calculatorPolicy, bg);

  const handleSubmit = async (e, asDraft = false) => {
    e.preventDefault();
    if (!form.course) {
      setError(bg ? 'Изберете група.' : 'Select a group.');
      return;
    }
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
        <Card className="relative p-6 lg:p-7 max-w-2xl flex flex-col gap-5 overflow-hidden">
          {/* Decorative brand-gradient top accent */}
          <span className="absolute inset-x-0 top-0 h-1" style={gradientStyle} aria-hidden />

          {error && (
            <p className="text-sm text-red-600 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {/* Quick start */}
          {(presets.length > 0 || myTemplates.length > 0) && (
            <div className="flex flex-col gap-3 p-4 rounded-xl bg-stone-50 dark:bg-zinc-800/50 border border-stone-100 dark:border-zinc-800">
              <SectionLabel>{bg ? 'Бърз старт' : 'Quick start'}</SectionLabel>

              {presets.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs text-neutral-500 dark:text-zinc-400 font-['Manrope']">
                    {bg ? 'Готови шаблони' : 'Built-in presets'}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {presets.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => applyPreset(p)}
                        className="px-3 py-1.5 text-xs font-medium font-['Manrope'] rounded-lg bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 text-black dark:text-white transition-colors hover:border-gray-400 dark:hover:border-zinc-500 hover:-translate-y-0.5 hover:shadow-sm duration-200"
                      >
                        {bg ? p.titleBg : p.titleEn}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <span className="text-xs text-neutral-500 dark:text-zinc-400 font-['Manrope']">
                  {bg ? 'Моите шаблони' : 'My saved templates'}
                </span>
                {myTemplates.length === 0 ? (
                  <p className="text-xs text-neutral-400 dark:text-zinc-500 font-['Manrope']">
                    {bg ? 'Няма запазени шаблони.' : 'No saved templates yet.'}
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {myTemplates.map((tpl) => (
                      <span
                        key={tpl._id}
                        className="inline-flex items-center gap-1 rounded-lg bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 overflow-hidden"
                      >
                        <button
                          type="button"
                          disabled={templateBusy}
                          onClick={() => applyMyTemplate(tpl)}
                          className="pl-3 pr-2 py-1.5 text-xs font-medium font-['Manrope'] text-black dark:text-white hover:bg-stone-50 dark:hover:bg-zinc-800 transition-colors"
                        >
                          {tpl.title}
                        </button>
                        <button
                          type="button"
                          disabled={templateBusy}
                          onClick={() => handleDeleteTemplate(tpl._id)}
                          aria-label={bg ? 'Изтрий' : 'Delete'}
                          className="px-2 py-1.5 text-neutral-400 hover:text-red-600 transition-colors border-l border-gray-200 dark:border-zinc-700"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex flex-wrap gap-2 items-end mt-1">
                  <label className="flex flex-col gap-1 flex-1 min-w-[160px]">
                    <span className="text-xs text-neutral-500 dark:text-zinc-400 font-['Manrope']">
                      {bg ? 'Име при запазване (по избор)' : 'Save as (optional)'}
                    </span>
                    <input
                      value={templateTitle}
                      onChange={(e) => setTemplateTitle(e.target.value)}
                      placeholder={form.title || (bg ? 'Заглавие' : 'Title')}
                      className="px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm text-black dark:text-white"
                    />
                  </label>
                  <button
                    type="button"
                    disabled={templateBusy || !form.toolKey}
                    onClick={handleSaveTemplate}
                    className="px-3 py-2 text-sm font-medium font-['Manrope'] rounded-lg bg-white dark:bg-zinc-900 outline outline-1 outline-gray-200 dark:outline-zinc-700 text-black dark:text-white hover:bg-stone-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
                  >
                    {templateBusy ? '...' : bg ? 'Запази като шаблон' : 'Save as template'}
                  </button>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={(e) => handleSubmit(e, false)} className="flex flex-col gap-6">
            {/* Section: basics */}
            <div className="flex flex-col gap-4">
              <SectionLabel>{bg ? 'Основни' : 'Basics'}</SectionLabel>

              <div className="grid sm:grid-cols-2 gap-4">
                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium font-['Manrope'] text-black dark:text-white">{bg ? 'Група' : 'Group'}</span>
                  <Select
                    value={form.course}
                    onChange={(v) => setForm({ ...form, course: v })}
                    placeholder={bg ? 'Избери...' : 'Select...'}
                    ariaLabel={bg ? 'Група' : 'Group'}
                    options={courses.map((c) => ({ value: c._id, label: `${c.name} (${c.code})` }))}
                  />
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium font-['Manrope'] text-black dark:text-white">{bg ? 'Инструмент' : 'Tool'}</span>
                  <Select
                    value={form.toolKey}
                    onChange={(v) => setForm({ ...form, toolKey: v })}
                    ariaLabel={bg ? 'Инструмент' : 'Tool'}
                    options={EDU_TOOLS.map((t) => ({ value: t.toolKey, label: bg ? t.titleBg : t.titleEn }))}
                  />
                </label>
              </div>

              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium font-['Manrope'] text-black dark:text-white">{bg ? 'Заглавие' : 'Title'}</span>
                <input
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="px-3 py-2.5 rounded-lg border border-gray-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-black dark:text-white font-['Manrope'] transition-colors hover:border-gray-300 dark:hover:border-zinc-600 focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/20"
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium font-['Manrope'] text-black dark:text-white">{bg ? 'Инструкции' : 'Instructions'}</span>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="px-3 py-2.5 rounded-lg border border-gray-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-black dark:text-white font-['Manrope'] transition-colors hover:border-gray-300 dark:hover:border-zinc-600 focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/20"
                />
              </label>
            </div>

            {/* Section: grading */}
            <div className="flex flex-col gap-4 border-t border-stone-100 dark:border-zinc-800 pt-5">
              <SectionLabel>{bg ? 'Оценяване' : 'Grading'}</SectionLabel>

              <div className="grid grid-cols-2 gap-4">
                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium font-['Manrope'] text-black dark:text-white">{bg ? 'Варианти' : 'Variants'}</span>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={form.variantsCount}
                    onChange={(e) => setForm({ ...form, variantsCount: e.target.value })}
                    className="px-3 py-2.5 rounded-lg border border-gray-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-black dark:text-white font-['Manrope'] transition-colors hover:border-gray-300 dark:hover:border-zinc-600 focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/20"
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium font-['Manrope'] text-black dark:text-white">{bg ? 'Опити' : 'Attempts'}</span>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={form.maxAttempts}
                    onChange={(e) => setForm({ ...form, maxAttempts: e.target.value })}
                    className="px-3 py-2.5 rounded-lg border border-gray-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-black dark:text-white font-['Manrope'] transition-colors hover:border-gray-300 dark:hover:border-zinc-600 focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/20"
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium font-['Manrope'] text-black dark:text-white">{bg ? 'Допуск' : 'Tolerance'}</span>
                  <input
                    type="number"
                    step="any"
                    min={0}
                    value={form.customTolerance}
                    onChange={(e) => setForm({ ...form, customTolerance: e.target.value })}
                    className="px-3 py-2.5 rounded-lg border border-gray-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-black dark:text-white font-['Manrope'] transition-colors hover:border-gray-300 dark:hover:border-zinc-600 focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/20"
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium font-['Manrope'] text-black dark:text-white">{bg ? 'Тип допуск' : 'Tolerance type'}</span>
                  <Select
                    value={form.customToleranceType}
                    onChange={(v) => setForm({ ...form, customToleranceType: v })}
                    ariaLabel={bg ? 'Тип допуск' : 'Tolerance type'}
                    options={[
                      { value: 'absolute', label: bg ? 'Абсолютен' : 'Absolute' },
                      { value: 'relative', label: bg ? 'Относителен' : 'Relative' },
                      { value: 'percentage', label: bg ? 'Процент' : 'Percentage' },
                    ]}
                  />
                </label>
              </div>

              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium font-['Manrope'] text-black dark:text-white">{bg ? 'Калкулатор за ученици' : 'Calculator for students'}</span>
                <Select
                  value={form.calculatorPolicy}
                  onChange={(v) => setForm({ ...form, calculatorPolicy: v })}
                  ariaLabel={bg ? 'Калкулатор за ученици' : 'Calculator for students'}
                  options={CALCULATOR_POLICY_OPTIONS.map((opt) => ({ value: opt.value, label: bg ? opt.labelBg : opt.labelEn }))}
                />
                <p className="text-xs text-neutral-500 dark:text-zinc-400 font-['Manrope']">{policyMeta.teacherHint}</p>
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium font-['Manrope'] text-black dark:text-white">
                  {bg ? 'Свързан обект (по избор)' : 'Linked survey project (optional)'}
                </span>
                <Select
                  value={form.linkedProjectId}
                  onChange={(v) => setForm({ ...form, linkedProjectId: v })}
                  ariaLabel={bg ? 'Свързан обект' : 'Linked project'}
                  options={[
                    { value: '', label: bg ? 'Без връзка' : 'None' },
                    ...projects.map((p) => ({ value: p._id, label: p.name })),
                  ]}
                />
                <p className="text-xs text-neutral-500 dark:text-zinc-400 font-['Manrope']">
                  {bg
                    ? 'Учениците могат да ползват точките от този обект в PointPicker по време на задачата.'
                    : 'Students can use points from this site in PointPicker during the assignment.'}
                </p>
              </label>
            </div>

            {/* Section: schedule */}
            <div className="flex flex-col gap-4 border-t border-stone-100 dark:border-zinc-800 pt-5">
              <SectionLabel>{bg ? 'Срокове' : 'Schedule'}</SectionLabel>

              <div className="grid sm:grid-cols-2 gap-4">
                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium font-['Manrope'] text-black dark:text-white">{bg ? 'Краен срок' : 'Due date'}</span>
                  <input
                    required
                    type="datetime-local"
                    value={form.dueDate || defaultDue()}
                    onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                    className="px-3 py-2.5 rounded-lg border border-gray-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-black dark:text-white font-['Manrope'] transition-colors hover:border-gray-300 dark:hover:border-zinc-600 focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/20"
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium font-['Manrope'] text-black dark:text-white">
                    {bg ? 'Публикуване от (по избор)' : 'Publish from (optional)'}
                  </span>
                  <input
                    type="datetime-local"
                    value={form.publishAt}
                    onChange={(e) => setForm({ ...form, publishAt: e.target.value })}
                    className="px-3 py-2.5 rounded-lg border border-gray-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-black dark:text-white font-['Manrope'] transition-colors hover:border-gray-300 dark:hover:border-zinc-600 focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/20"
                  />
                </label>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 border-t border-stone-100 dark:border-zinc-800 pt-5">
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-lg text-sm font-medium font-['Manrope'] transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {saving ? (bg ? 'Създаване...' : 'Creating...') : bg ? 'Публикувай' : 'Publish'}
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={(e) => handleSubmit(e, true)}
                className="px-4 py-2.5 rounded-lg text-sm font-medium font-['Manrope'] bg-white dark:bg-zinc-900 outline outline-1 outline-gray-200 dark:outline-zinc-700 text-black dark:text-white hover:bg-stone-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
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
