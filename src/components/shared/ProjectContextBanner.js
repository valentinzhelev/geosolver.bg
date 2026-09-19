import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { useProjectContext } from '../../context/ProjectContext';
import { isCalculatorPath } from '../../config/calculationTools';

/**
 * Shown on calculator pages opened with ?projectId= so the user can see
 * where the result will be saved and get back to the project — the
 * calculators' own back controls go to the generic tools list, which would
 * otherwise silently drop the project context.
 */
const ProjectContextBanner = () => {
  const { language } = useTranslation();
  const bg = language === 'bg';
  const { pathname } = useLocation();
  const { requestedProjectId, currentProject, loading, error } = useProjectContext();

  if (!requestedProjectId || !isCalculatorPath(pathname)) return null;

  const historyPath = `/calculations/history?projectId=${encodeURIComponent(requestedProjectId)}`;
  const failed = !loading && error;

  return (
    <div
      role="status"
      className={`fixed bottom-4 left-4 z-[90] max-w-[calc(100vw-2rem)] px-3 py-2 rounded-lg shadow-md text-xs font-semibold font-['Manrope'] flex items-center gap-3 ${
        failed ? 'bg-red-600 text-white' : 'bg-black text-white dark:bg-white dark:text-black'
      }`}
    >
      <span>
        {failed
          ? (bg ? 'Проектът не може да бъде зареден — изчисленията няма да се запазват.' : 'Project could not be loaded — calculations will not be saved.')
          : loading
            ? (bg ? 'Зареждане на проект…' : 'Loading project…')
            : (bg ? `Проект: ${currentProject?.name} · резултатът се запазва в проекта` : `Project: ${currentProject?.name} · result is saved to the project`)}
      </span>
      <Link to={historyPath} className="underline whitespace-nowrap">
        {bg ? 'Към проекта' : 'Back to project'}
      </Link>
    </div>
  );
};

export default ProjectContextBanner;
