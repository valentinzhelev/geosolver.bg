import React, { useState } from 'react';
import CrsSelect from '../../shared/CrsSelect';
import { DEFAULT_CRS, crsLabel } from '../../../domain/geodesy/crsTransform';
import { emptyProjectForm, validateProjectForm, buildProjectPayload, PROJECT_NAME_MAX } from '../../../utils/projectCreation';

const inputClass =
  "w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-sm text-black dark:text-white font-['Manrope'] outline-none focus:ring-2 focus:ring-black/10";

/**
 * Smallest professional "new project" form, using the existing POST /projects contract only:
 * name (required), description (notes), coordinate system (default shown), optional workspace ("personal project").
 * Creating a project needs neither Field Book pilot access nor a workspace.
 */
const ProjectCreateForm = ({ workspaces = [], language = 'bg', busy = false, error = '', onSubmit, onCancel }) => {
  const bg = language === 'bg';
  const [form, setForm] = useState(emptyProjectForm());
  const [localError, setLocalError] = useState('');

  const submit = (e) => {
    e.preventDefault();
    const problem = validateProjectForm(form, language);
    setLocalError(problem);
    if (problem) return;
    onSubmit?.(buildProjectPayload(form));
  };

  return (
    <form
      onSubmit={submit}
      aria-label={bg ? 'Нов проект' : 'New project'}
      className="p-4 md:p-5 bg-white dark:bg-zinc-900 rounded-xl outline outline-1 outline-gray-200 dark:outline-zinc-800 flex flex-col gap-3"
    >
      <h2 className="text-lg font-bold font-['Manrope'] text-black dark:text-white">{bg ? 'Нов проект' : 'New project'}</h2>

      <label className="flex flex-col gap-1 text-xs font-medium font-['Manrope'] text-neutral-500 dark:text-zinc-400">
        <span>{bg ? 'Име на проекта *' : 'Project name *'}</span>
        <input
          className={inputClass}
          value={form.name}
          maxLength={PROJECT_NAME_MAX}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder={bg ? 'напр. Трасе ул. „Иван Вазов“' : 'e.g. Road survey, Ivan Vazov St.'}
          autoFocus
        />
      </label>

      <label className="flex flex-col gap-1 text-xs font-medium font-['Manrope'] text-neutral-500 dark:text-zinc-400">
        <span>{bg ? 'Описание (по избор)' : 'Description (optional)'}</span>
        <textarea
          className={inputClass}
          rows={2}
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />
      </label>

      <div>
        <CrsSelect value={form.crs} onChange={(crs) => setForm({ ...form, crs })} language={language} />
        <p className="mt-1 text-[11px] text-neutral-400 font-['Manrope']">
          {bg
            ? `По подразбиране: ${crsLabel(DEFAULT_CRS, 'bg')}. Може да се промени по-късно.`
            : `Default: ${crsLabel(DEFAULT_CRS, 'en')}. You can change it later.`}
        </p>
      </div>

      <label className="flex flex-col gap-1 text-xs font-medium font-['Manrope'] text-neutral-500 dark:text-zinc-400">
        <span>{bg ? 'Работно пространство (по избор)' : 'Workspace (optional)'}</span>
        <select className={inputClass} value={form.workspaceId} onChange={(e) => setForm({ ...form, workspaceId: e.target.value })}>
          <option value="">{bg ? 'Без работно пространство (личен проект)' : 'No workspace (personal project)'}</option>
          {workspaces.map((w) => (
            <option key={w._id} value={w._id}>{w.name}</option>
          ))}
        </select>
      </label>

      {(localError || error) && (
        <div role="alert" className="p-2 rounded-lg bg-red-50 text-red-700 text-sm font-['Manrope']">{localError || error}</div>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={busy}
          className="px-4 py-2 rounded-lg text-sm font-semibold font-['Manrope'] bg-black dark:bg-white text-white dark:text-black disabled:opacity-50"
        >
          {busy ? (bg ? 'Създаване...' : 'Creating...') : bg ? 'Създай проект' : 'Create project'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-sm font-medium font-['Manrope'] bg-white dark:bg-zinc-900 outline outline-1 outline-gray-200 dark:outline-zinc-700"
          >
            {bg ? 'Отказ' : 'Cancel'}
          </button>
        )}
      </div>
    </form>
  );
};

export default ProjectCreateForm;
