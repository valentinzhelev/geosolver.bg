import React, { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Layout from '../../layout/Layout';
import SEO from '../../shared/SEO';
import { useTranslation } from '../../../hooks/useTranslation';
import { fieldbooksApi } from '../../../services/fieldbookApi';
import ProjectTabs, { PROJECT_TABS } from './ProjectTabs';
import ProjectOverviewTab from './ProjectOverviewTab';
import ProjectPointsTab from './ProjectPointsTab';
import ProjectFieldDataTab from './ProjectFieldDataTab';
import ProjectProcessingTab from './ProjectProcessingTab';
import ProjectDocumentsTab from './ProjectDocumentsTab';
import ProjectMapTab from './ProjectMapTab';

const VALID_TABS = new Set(PROJECT_TABS.map((t) => t.id));

/**
 * V2.4.3: the coherent Project workspace - Обзор / Точки / Теренни данни / Обработки / Карта behind one
 * persistent tab bar, instead of the scattered set of standalone pages a project used to be spread across. The
 * user works with "Field data" and "Processing", never CaptureJob/FieldObservationSet/FieldProcessingRun.
 */
const ProjectWorkspacePage = () => {
  const { language } = useTranslation();
  const bg = language === 'bg';
  const [searchParams, setSearchParams] = useSearchParams();
  const projectId = searchParams.get('projectId') || '';
  const rawTab = searchParams.get('tab') || 'overview';
  const tab = VALID_TABS.has(rawTab) ? rawTab : 'overview';

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!projectId) { setLoading(false); return; }
    setLoading(true);
    setError('');
    try {
      const res = await fieldbooksApi.listProjects();
      const list = res.data || res.projects || [];
      const found = list.find((p) => String(p._id) === String(projectId));
      if (!found) setError(bg ? 'Проектът не е намерен.' : 'Project not found.');
      setProject(found || null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [projectId, bg]);

  useEffect(() => { load(); }, [load]);

  const setTab = (id) => setSearchParams({ projectId, tab: id }, { replace: true });

  if (!projectId) {
    return (
      <Layout>
        <div className="w-full py-10 flex flex-col items-center gap-3">
          <p className="text-sm text-neutral-500 font-['Manrope']">{bg ? 'Не е избран проект.' : 'No project selected.'}</p>
          <Link to="/projects" className="px-4 py-2 rounded-lg text-sm font-semibold font-['Manrope'] bg-black dark:bg-white text-white dark:text-black">
            {bg ? 'Към проектите' : 'Go to projects'}
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <>
      <SEO
        title={`${project ? project.name : bg ? 'Проект' : 'Project'} – GeoSolver`}
        description={bg ? 'Работно пространство на проекта: точки, теренни данни, обработки и карта.' : 'Project workspace: points, field data, processing and map.'}
        canonical="/project"
      />
      <Layout>
        <div className="w-full bg-stone-50 dark:bg-zinc-950 py-6 md:py-10 pb-10 md:pb-14">
          <div className="w-full mx-auto flex flex-col gap-5 md:gap-6 px-4 md:px-0" style={{ maxWidth: '1180px' }}>
            <div className="flex flex-col gap-3">
              <div className="text-neutral-400 dark:text-zinc-400 text-sm font-medium font-['Manrope']">
                <Link to="/projects" className="underline hover:text-black dark:hover:text-white">{bg ? 'Проекти' : 'Projects'}</Link>
                {project && <span> &gt; {project.name}</span>}
              </div>
              {loading ? (
                <p className="text-sm text-neutral-400 font-['Manrope']" role="status">{bg ? 'Зареждане...' : 'Loading...'}</p>
              ) : error ? (
                <div role="alert" className="p-3 rounded-lg bg-red-50 text-red-700 text-sm font-['Manrope']">{error}</div>
              ) : (
                <h1 className="text-2xl md:text-3xl font-bold font-['Manrope'] text-black dark:text-white">{project.name}</h1>
              )}
              {!loading && !error && <ProjectTabs active={tab} onChange={setTab} bg={bg} />}
            </div>

            {!loading && !error && (
              <div className="flex flex-col gap-4">
                {tab === 'overview' && <ProjectOverviewTab projectId={projectId} bg={bg} />}
                {tab === 'points' && <ProjectPointsTab projectId={projectId} bg={bg} />}
                {tab === 'field-data' && <ProjectFieldDataTab projectId={projectId} bg={bg} />}
                {tab === 'processing' && <ProjectProcessingTab projectId={projectId} bg={bg} />}
                {tab === 'documents' && <ProjectDocumentsTab projectId={projectId} bg={bg} />}
                {tab === 'map' && <ProjectMapTab projectId={projectId} bg={bg} />}
              </div>
            )}
          </div>
        </div>
      </Layout>
    </>
  );
};

export default ProjectWorkspacePage;
