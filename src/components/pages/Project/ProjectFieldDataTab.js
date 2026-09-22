import React from 'react';
import { useNavigate } from 'react-router-dom';
import CaptureHistory from '../Capture/CaptureHistory';

/**
 * V2.4.3 "Теренни данни": the project's unified Capture history (coordinate-table AND Field Notebook captures -
 * CaptureHistory already lists both, V2.2/V2.3), given a proper home in the Project workspace instead of only
 * being reachable by first navigating to the standalone Capture page. Opening or continuing a capture still
 * happens on the Capture page itself (its review UI - OCR correction, candidate panel, confirm flow - is
 * substantial and already fully tested; this tab does not duplicate it, only makes it discoverable and deep-links
 * into it via the existing ?projectId=&jobId= mechanism).
 */
const ProjectFieldDataTab = ({ projectId, bg = true }) => {
  const navigate = useNavigate();
  const openJob = (jobId) => navigate(`/capture?projectId=${projectId}&jobId=${jobId}`);

  return (
    <div className="flex flex-col gap-3" data-testid="project-field-data-tab">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <h2 className="text-sm font-bold font-['Manrope'] text-black dark:text-white">{bg ? 'Теренни данни' : 'Field data'}</h2>
          <p className="text-xs text-neutral-500 dark:text-zinc-400 font-['Manrope']">
            {bg
              ? 'Всички заснемания за проекта - таблици с координати и полеви карнети. Отвори за преглед, продължи проверка на данни „За проверка“, или обработи потвърден карнет.'
              : 'Every capture for this project - coordinate tables and field notebooks. Open to review, continue a "needs review" item, or process a confirmed notebook.'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate(`/capture?projectId=${projectId}`)}
          className="px-3 py-2 rounded-lg text-sm font-semibold font-['Manrope'] bg-black dark:bg-white text-white dark:text-black"
          data-testid="project-field-data-new"
        >
          {bg ? 'Ново заснемане' : 'New capture'}
        </button>
      </div>
      <CaptureHistory projectId={projectId} onOpen={openJob} bg={bg} />
    </div>
  );
};

export default ProjectFieldDataTab;
