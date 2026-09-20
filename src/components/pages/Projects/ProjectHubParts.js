import React from 'react';
import { Link } from 'react-router-dom';
import { nextStepLinks } from '../../../utils/projectCreation';

/** Empty Project Hub: the way forward is creating a project. Field books are only a secondary, optional link. */
export const ProjectHubEmptyState = ({ language = 'bg', onCreate }) => {
  const bg = language === 'bg';
  return (
    <div className="p-8 bg-white dark:bg-zinc-900 rounded-xl outline outline-1 outline-gray-200 dark:outline-zinc-800 text-center">
      <p className="text-neutral-500 font-['Manrope'] mb-2">{bg ? 'Няма проекти още.' : 'No projects yet.'}</p>
      <p className="text-sm text-neutral-400 font-['Manrope'] mb-4 max-w-md mx-auto">
        {bg
          ? 'Проектът е основната работна единица: към него се добавят точки, изчисления и (по избор) полеви карнети.'
          : 'A project is the main work unit: points, calculations and (optionally) field books belong to it.'}
      </p>
      <button
        type="button"
        onClick={onCreate}
        className="inline-block px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg text-sm font-semibold font-['Manrope']"
      >
        {bg ? 'Създай проект' : 'Create project'}
      </button>
      <div className="mt-4">
        <Link to="/fieldbook" className="text-xs text-neutral-400 hover:text-black dark:hover:text-white underline font-['Manrope']">
          {bg ? 'Електронни карнети (пилот)' : 'Electronic field books (pilot)'}
        </Link>
      </div>
    </div>
  );
};

/** Shown right after creating a project: what to do next (first: add points). */
export const ProjectNextSteps = ({ project, language = 'bg' }) => {
  const bg = language === 'bg';
  const links = nextStepLinks(project._id, language);
  return (
    <div role="status" className="p-4 rounded-xl bg-orange-50 dark:bg-orange-950/20 outline outline-1 outline-orange-200 dark:outline-orange-900/50 flex flex-col gap-3">
      <p className="text-sm font-semibold font-['Manrope'] text-black dark:text-white">
        {bg ? `Проектът „${project.name}“ е създаден. Какво следва?` : `Project “${project.name}” created. What next?`}
      </p>
      <div className="flex flex-wrap gap-2">
        {links.map((l) => (
          <Link
            key={l.key}
            to={l.to}
            className={
              l.primary
                ? "px-4 py-2 rounded-lg text-sm font-semibold font-['Manrope'] bg-black dark:bg-white text-white dark:text-black"
                : "px-3 py-2 rounded-lg text-sm font-medium font-['Manrope'] bg-white dark:bg-zinc-900 outline outline-1 outline-gray-200 dark:outline-zinc-700"
            }
          >
            {l.label}
          </Link>
        ))}
      </div>
    </div>
  );
};
