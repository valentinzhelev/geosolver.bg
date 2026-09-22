import React from 'react';
import { Link } from 'react-router-dom';

/**
 * V2.4.3 "Карта": hands off to the existing full Map page (/map), which composes several heavy map components
 * (survey plan, GNSS/OSM, elevation profile, 3D preview) with their own data fetching - deliberately not
 * re-implemented inline here.
 */
const ProjectMapTab = ({ projectId, bg = true }) => (
  <div className="flex flex-col gap-3 items-start" data-testid="project-map-tab">
    <div className="flex flex-col gap-1">
      <h2 className="text-sm font-bold font-['Manrope'] text-black dark:text-white">{bg ? 'Карта' : 'Map'}</h2>
      <p className="text-xs text-neutral-500 dark:text-zinc-400 font-['Manrope']">
        {bg ? 'Плановата карта, GNSS/OSM слоеве, профил на релефа и 3D преглед на точките на проекта.' : 'The survey plan map, GNSS/OSM layers, elevation profile and 3D point preview for this project.'}
      </p>
    </div>
    <Link to={`/map?projectId=${projectId}`} className="px-4 py-2 rounded-lg text-sm font-semibold font-['Manrope'] bg-black dark:bg-white text-white dark:text-black" data-testid="project-map-open">
      {bg ? 'Отвори картата' : 'Open the map'}
    </Link>
  </div>
);

export default ProjectMapTab;
