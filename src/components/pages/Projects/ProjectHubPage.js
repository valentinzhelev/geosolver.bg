import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../layout/Layout';
import SEO from '../../shared/SEO';
import ModulePageLayout from '../../modules/ModulePageLayout';
import { MODULE_META } from '../../../config/moduleDocs';
import { useTranslation } from '../../../hooks/useTranslation';
import { fieldbooksApi } from '../../../services/fieldbookApi';
import { surveyPointsApi } from '../../../services/surveyPointsApi';
import { workspaceApi } from '../../../services/workspaceApi';
import CalculationService from '../../../services/calculationService';
import { downloadProjectReportPdf } from '../../../utils/exportProjectReportPdf';
import { downloadProjectPackage } from '../../../utils/exportProjectPackage';
import CrsSelect from '../../shared/CrsSelect';
import { DEFAULT_CRS } from '../../../domain/geodesy/crsTransform';
import ProjectCreateForm from './ProjectCreateForm';
import { ProjectHubEmptyState, ProjectNextSteps } from './ProjectHubParts';
import { addCreatedProject, loadProjectSummaries } from '../../../utils/projectCreation';

const StatCard = ({ label, value }) => (
  <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl outline outline-1 outline-gray-200 dark:outline-zinc-800">
    <div className="text-[10px] uppercase tracking-wide text-neutral-400 font-['Manrope']">{label}</div>
    <div className="text-xl font-bold text-black dark:text-white font-['Manrope']">{value}</div>
  </div>
);

const ProjectHubPage = () => {
  const { language } = useTranslation();
  const bg = language === 'bg';
  const meta = MODULE_META.projects;
  const [projects, setProjects] = useState([]);
  const [pointCounts, setPointCounts] = useState({});
  const [bookCounts, setBookCounts] = useState({});
  const [calcCounts, setCalcCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exportingId, setExportingId] = useState('');
  const [packagingId, setPackagingId] = useState('');
  const [workspaces, setWorkspaces] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createdId, setCreatedId] = useState('');
  const [booksAvailable, setBooksAvailable] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const projRes = await fieldbooksApi.listProjects();
      const list = projRes.data || projRes.projects || [];
      setProjects(list);
      // every source is independent: Field Books need pilot access and must not wipe the point/calculation counts
      const summary = await loadProjectSummaries(list, {
        listPoints: (id) => surveyPointsApi.list({ projectId: id }),
        listBooks: (id) => fieldbooksApi.listBooks(id),
        getCalcHistory: (id) => CalculationService.getProjectCalculationHistory(id, 1, 1),
      });
      setPointCounts(summary.pointCounts);
      setBookCounts(summary.bookCounts);
      setCalcCounts(summary.calcCounts);
      setBooksAvailable(summary.booksAvailable);
      try {
        const wsRes = await workspaceApi.list();
        setWorkspaces([...(wsRes.data?.owned || []), ...(wsRes.data?.memberOf || [])]);
      } catch {
        setWorkspaces([]);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreate = async (payload) => {
    setCreating(true);
    setCreateError('');
    try {
      const res = await fieldbooksApi.createProject(payload);
      const created = res.data || res.project;
      // appears immediately, without a reload; the new project is selected and shows what to do next
      setProjects((prev) => addCreatedProject(prev, created));
      setPointCounts((prev) => ({ ...prev, [created._id]: 0 }));
      setBookCounts((prev) => ({ ...prev, [created._id]: 0 }));
      setCalcCounts((prev) => ({ ...prev, [created._id]: 0 }));
      setCreatedId(String(created._id));
      setShowCreate(false);
    } catch (e) {
      setCreateError(e.message);
    } finally {
      setCreating(false);
    }
  };

  const assignWorkspace = async (projectId, workspaceId) => {
    try {
      await fieldbooksApi.updateProject(projectId, { workspaceId: workspaceId || null });
      await load();
    } catch (e) {
      setError(e.message);
    }
  };

  const assignCrs = async (projectId, crs) => {
    try {
      await fieldbooksApi.updateProject(projectId, { crs: crs || DEFAULT_CRS });
      await load();
    } catch (e) {
      setError(e.message);
    }
  };

  const exportPackage = async (project) => {
    setPackagingId(project._id);
    try {
      const [ptsRes, bksRes] = await Promise.all([
        surveyPointsApi.list({ projectId: project._id }),
        fieldbooksApi.listBooks(project._id).catch(() => ({ data: [] })), // field books need pilot access: optional
      ]);
      await downloadProjectPackage({
        project,
        points: ptsRes.data || [],
        books: bksRes.data || bksRes.books || [],
        language,
      });
    } catch (e) {
      setError(e.message || (bg ? 'Грешка при ZIP пакет' : 'Package export failed'));
    } finally {
      setPackagingId('');
    }
  };

  const exportReport = async (project) => {
    setExportingId(project._id);
    try {
      const [ptsRes, bksRes] = await Promise.all([
        surveyPointsApi.list({ projectId: project._id }),
        fieldbooksApi.listBooks(project._id).catch(() => ({ data: [] })), // field books need pilot access: optional
      ]);
      await downloadProjectReportPdf({
        project,
        points: ptsRes.data || [],
        books: bksRes.data || bksRes.books || [],
        language,
      });
    } catch (e) {
      setError(e.message || (bg ? 'Грешка при PDF' : 'PDF export failed'));
    } finally {
      setExportingId('');
    }
  };

  const totalPoints = Object.values(pointCounts).reduce((a, b) => a + b, 0);
  const totalBooks = Object.values(bookCounts).reduce((a, b) => a + b, 0);

  return (
    <>
      <SEO
        title={bg ? 'Проекти – GeoSolver' : 'Projects – GeoSolver'}
        description={meta.seo[bg ? 'bg' : 'en']}
        canonical="/projects"
      />
      <Layout>
        <ModulePageLayout
          moduleId="projects"
          language={language}
          maxWidth="900px"
          stats={
            !loading && projects.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                <StatCard label={bg ? 'Проекти' : 'Projects'} value={projects.length} />
                <StatCard label={bg ? 'Точки' : 'Points'} value={totalPoints} />
                <StatCard label={bg ? 'Карнети' : 'Field books'} value={booksAvailable ? totalBooks : '—'} />
              </div>
            ) : null
          }
          toolbar={
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setCreateError('');
                  setShowCreate(true);
                }}
                className="px-3 py-2 rounded-lg text-sm font-semibold font-['Manrope'] bg-black dark:bg-white text-white dark:text-black"
              >
                {bg ? 'Нов проект' : 'New project'}
              </button>
              <Link
                to="/workspace"
                className="px-3 py-2 rounded-lg text-sm font-semibold font-['Manrope'] bg-white dark:bg-zinc-900 outline outline-1 outline-gray-200 dark:outline-zinc-700"
              >
                {bg ? 'Работно пространство' : 'Workspace'}
              </Link>
            </div>
          }
        >
          {error && (
            <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm font-['Manrope']">{error}</div>
          )}

          {showCreate && (
            <ProjectCreateForm
              workspaces={workspaces}
              language={language}
              busy={creating}
              error={createError}
              onSubmit={handleCreate}
              onCancel={() => setShowCreate(false)}
            />
          )}

          {createdId && projects.find((p) => String(p._id) === createdId) && (
            <ProjectNextSteps project={projects.find((p) => String(p._id) === createdId)} language={language} />
          )}

          {loading ? (
            <div className="py-16 text-center text-neutral-500 font-['Manrope']">{bg ? 'Зареждане...' : 'Loading...'}</div>
          ) : projects.length === 0 ? (
            showCreate ? null : <ProjectHubEmptyState language={language} onCreate={() => setShowCreate(true)} />
          ) : (
            <div className="flex flex-col gap-3">
              {projects.map((p) => (
                <div
                  key={p._id}
                  className={`p-4 md:p-5 bg-white dark:bg-zinc-900 rounded-xl outline outline-1 flex flex-col gap-4 ${
                    String(p._id) === createdId ? 'outline-2 outline-orange-400' : 'outline-gray-200 dark:outline-zinc-800'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-bold font-['Manrope'] text-black dark:text-white">{p.name}</h2>
                      <p className="text-sm text-neutral-500 font-['Manrope'] mt-0.5">
                        {[p.year, p.team, p.site].filter(Boolean).join(' · ') || '—'}
                      </p>
                      <div className="flex flex-wrap gap-3 mt-2 text-xs font-semibold font-['Manrope'] text-neutral-600 dark:text-zinc-400">
                        <span>{pointCounts[p._id] ?? 0} {bg ? 'точки' : 'points'}</span>
                        {booksAvailable && <span>{bookCounts[p._id] ?? 0} {bg ? 'карнета' : 'field books'}</span>}
                        <Link
                          to={`/calculations/history?projectId=${p._id}`}
                          className="underline hover:text-black dark:hover:text-white"
                        >
                          {calcCounts[p._id] ?? 0} {bg ? 'изчисления' : 'calculations'}
                        </Link>
                        {p.workspace && (
                          <span className="text-orange-600">
                            {workspaces.find((w) => w._id === String(p.workspace?._id || p.workspace))?.name || (bg ? 'Работно пространство' : 'Workspace')}
                          </span>
                        )}
                      </div>
                      {workspaces.length > 0 && (
                        <select
                          className="mt-2 px-2 py-1 rounded-lg text-xs border border-gray-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 font-['Manrope']"
                          value={String(p.workspace?._id || p.workspace || '')}
                          onChange={(e) => assignWorkspace(p._id, e.target.value)}
                        >
                          <option value="">{bg ? 'Без работно пространство' : 'No workspace'}</option>
                          {workspaces.map((w) => (
                            <option key={w._id} value={w._id}>{w.name}</option>
                          ))}
                        </select>
                      )}
                      <div className="mt-2 max-w-xs">
                        <CrsSelect
                          value={p.crs || DEFAULT_CRS}
                          onChange={(crs) => assignCrs(p._id, crs)}
                          language={language}
                        />
                      </div>
                    </div>
                    <p className="text-xs text-neutral-400 font-['Manrope'] max-w-xs md:text-right">
                      {bg
                        ? 'Провери геометрията на картата преди клиентски PDF.'
                        : 'Check geometry on the map before the client PDF.'}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link
                      to={`/map?projectId=${p._id}`}
                      className="px-3 py-2 rounded-lg text-sm font-semibold font-['Manrope'] bg-black dark:bg-white text-white dark:text-black"
                    >
                      {bg ? 'Карта' : 'Map'}
                    </Link>
                    <Link
                      to={`/points?projectId=${p._id}`}
                      className="px-3 py-2 rounded-lg text-sm font-medium font-['Manrope'] bg-white dark:bg-zinc-900 outline outline-1 outline-gray-200 dark:outline-zinc-700"
                    >
                      {bg ? 'Точки' : 'Points'}
                    </Link>
                    <Link
                      to={`/capture?projectId=${p._id}`}
                      className="px-3 py-2 rounded-lg text-sm font-medium font-['Manrope'] bg-white dark:bg-zinc-900 outline outline-1 outline-gray-200 dark:outline-zinc-700"
                    >
                      {bg ? 'Сканиране' : 'Capture'}
                    </Link>
                    <Link
                      to={`/stakeout?projectId=${p._id}`}
                      className="px-3 py-2 rounded-lg text-sm font-medium font-['Manrope'] bg-white dark:bg-zinc-900 outline outline-1 outline-gray-200 dark:outline-zinc-700"
                    >
                      {bg ? 'Трасиране' : 'Stake-out'}
                    </Link>
                    <Link
                      to="/fieldbook"
                      className="px-3 py-2 rounded-lg text-sm font-medium font-['Manrope'] bg-white dark:bg-zinc-900 outline outline-1 outline-gray-200 dark:outline-zinc-700"
                    >
                      {bg ? 'Карнети (пилот)' : 'Field books (pilot)'}
                    </Link>
                    <Link
                      to={`/calculations/history?projectId=${p._id}`}
                      className="px-3 py-2 rounded-lg text-sm font-medium font-['Manrope'] bg-white dark:bg-zinc-900 outline outline-1 outline-gray-200 dark:outline-zinc-700"
                    >
                      {bg ? 'Изчисления' : 'Calculations'}
                    </Link>
                    <button
                      type="button"
                      onClick={() => exportPackage(p)}
                      disabled={packagingId === p._id}
                      className="px-3 py-2 rounded-lg text-sm font-medium font-['Manrope'] bg-orange-600 text-white disabled:opacity-50"
                    >
                      {packagingId === p._id ? 'ZIP...' : bg ? 'Клиентски пакет' : 'Client package'}
                    </button>
                    <button
                      type="button"
                      onClick={() => exportReport(p)}
                      disabled={exportingId === p._id}
                      className="px-3 py-2 rounded-lg text-sm font-medium font-['Manrope'] bg-white dark:bg-zinc-900 outline outline-1 outline-gray-200 dark:outline-zinc-700 disabled:opacity-50"
                    >
                      {exportingId === p._id ? 'PDF...' : bg ? 'Клиентски PDF' : 'Client PDF'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ModulePageLayout>
      </Layout>
    </>
  );
};

export default ProjectHubPage;
