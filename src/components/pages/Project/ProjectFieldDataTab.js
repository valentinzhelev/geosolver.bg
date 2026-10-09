import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import FieldSessionsPanel from './FieldSession/FieldSessionsPanel';
import FieldSessionDetail from './FieldSession/FieldSessionDetail';

/**
 * "Теренни данни": the project's Field Sessions (Теренна сесия) - one real working session in the field, from
 * entry (manual or from a notebook photo) through review and confirmation to processing, points and a report.
 * `?session=<id>[&section=...]` opens one session inside the tab (so a link, a reload and the browser's back button
 * all work); without it the tab lists the sessions plus, for compatibility, the captures that belong to no session
 * and the legacy carnets. The OCR capture/review workspace itself is unchanged and still lives on the Capture page.
 */
const ProjectFieldDataTab = ({ projectId, bg = true }) => {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const sessionId = params.get('session') || '';
  const section = params.get('section') || '';

  const openSession = (id, sec = '') => setParams({ projectId, tab: 'field-data', session: id, ...(sec ? { section: sec } : {}) });
  const backToList = () => setParams({ projectId, tab: 'field-data' });
  const openCapture = (jobId) => navigate(`/capture?projectId=${projectId}&jobId=${jobId}`);

  return (
    <div className="flex flex-col gap-3" data-testid="project-field-data-tab">
      {sessionId
        ? <FieldSessionDetail key={sessionId} projectId={projectId} sessionId={sessionId} initialSection={section} bg={bg} onBack={backToList} onOpenSession={openSession} />
        : <FieldSessionsPanel projectId={projectId} bg={bg} onOpenSession={openSession} onOpenCapture={openCapture} />}
    </div>
  );
};

export default ProjectFieldDataTab;
