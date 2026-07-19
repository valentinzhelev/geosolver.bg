import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Layout from '../../layout/Layout';
import SEO from '../../shared/SEO';
import ModulePageLayout from '../../modules/ModulePageLayout';
import { MODULE_META } from '../../../config/moduleDocs';
import SurveyPlanMap from '../../map/SurveyPlanMap';
import GnssOsmMap from '../../map/GnssOsmMap';
import ElevationProfileChart from '../../map/ElevationProfileChart';
import Points3DPreview from '../../map/Points3DPreview';
import { useTranslation } from '../../../hooks/useTranslation';
import { surveyPointsApi } from '../../../services/surveyPointsApi';
import { fieldbooksApi } from '../../../services/fieldbookApi';
import { downloadPointsCsv } from '../../../utils/parseGnssImport';
import { downloadGeoJson } from '../../../utils/exportGeoJson';
import { downloadDxf } from '../../../utils/exportDxf';
import CrsSelect from '../../shared/CrsSelect';
import {
  DEFAULT_CRS,
  ensureProjectedPoint,
  projectedToWgs84,
  looksLikeWgs84,
} from '../../../domain/geodesy/crsTransform';

const selectClass =
  "px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm font-['Manrope'] text-black dark:text-white outline-none";

const VIEW_HELP = {
  plan: {
    bg: 'Планът използва Y↑ север в избраната CRS. Zoom с колелцето, пан с влачене. Кликни точка за координати — сравни с втора основна задача между две точки.',
    en: 'Plan uses Y↑ north in the selected CRS. Zoom with wheel, pan by drag. Click a point for coordinates — compare with second basic task between two points.',
  },
  profile: {
    bg: 'Профилът изчислява разстояние по ред на точките (chainage) спрямо котата H. Нужни са минимум 2 точки с H. Подреди точките логично по трасето преди анализ.',
    en: 'Profile computes distance by point order (chainage) vs elevation H. Need at least 2 points with H. Sort points logically along the route before analysis.',
  },
  '3d': {
    bg: 'Изометричният изглед показва X (север), Y (изток) и H нагоре в проекционната система. Учебен преглед — не замества CAD.',
    en: 'Isometric view shows X (north), Y (east) and H upward in the projected CRS. Learning preview — not a CAD replacement.',
  },
  osm: {
    bg: 'OSM подложка: WGS84 точки се показват директно; проекционните се трансформират към lat/lon с избраната CRS.',
    en: 'OSM basemap: WGS84 points show directly; projected points are transformed to lat/lon with the selected CRS.',
  },
};

const MapPage = () => {
  const { language } = useTranslation();
  const bg = language === 'bg';
  const [searchParams] = useSearchParams();
  const crsFromQuery = searchParams.get('crs');
  const [points, setPoints] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [layer, setLayer] = useState('');
  const [projectId, setProjectId] = useState(searchParams.get('projectId') || '');
  const [crsId, setCrsId] = useState(crsFromQuery || DEFAULT_CRS);
  const [selected, setSelected] = useState(null);
  const [view, setView] = useState('plan');

  const tabClass = (id) =>
    `px-3 py-1.5 rounded-lg text-sm font-semibold font-['Manrope'] transition-colors ${
      view === id
        ? 'bg-black dark:bg-white text-white dark:text-black'
        : 'bg-white dark:bg-zinc-900 text-neutral-600 dark:text-zinc-400 outline outline-1 outline-gray-200 dark:outline-zinc-700'
    }`;

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (projectId) params.projectId = projectId;
      if (layer) params.layer = layer;
      const [ptsRes, projRes] = await Promise.all([
        surveyPointsApi.list(params),
        fieldbooksApi.listProjects(),
      ]);
      const projList = projRes.data || projRes.projects || [];
      setPoints(ptsRes.data || []);
      setProjects(projList);
      if (projectId && !crsFromQuery) {
        const p = projList.find((x) => String(x._id) === String(projectId));
        if (p?.crs) setCrsId(p.crs);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [projectId, layer, crsFromQuery]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!projectId || crsFromQuery) return;
    const p = projects.find((x) => String(x._id) === String(projectId));
    if (p?.crs) setCrsId(p.crs);
  }, [projectId, projects, crsFromQuery]);

  const layers = useMemo(() => {
    const set = new Set(points.map((p) => p.layer || 'default'));
    return ['', ...Array.from(set).sort()];
  }, [points]);

  const mapPoints = useMemo(() => points.filter((p) => p.x != null && p.y != null), [points]);

  const planPoints = useMemo(
    () => mapPoints.map((p) => ensureProjectedPoint(p, crsId)),
    [mapPoints, crsId]
  );

  const osmPoints = useMemo(
    () =>
      mapPoints.map((p) => {
        const x = Number(p.x);
        const y = Number(p.y);
        if (looksLikeWgs84(x, y)) {
          // platform GNSS: x≈lat, y≈lon → OSM expects y=lat, x=lon
          return { ...p, y: x, x: y, layer: 'gnss', pointClass: 'gnss' };
        }
        if (looksLikeWgs84(y, x)) {
          return { ...p, layer: 'gnss', pointClass: 'gnss' };
        }
        try {
          const wgs = projectedToWgs84(x, y, crsId);
          return {
            ...p,
            y: wgs.lat,
            x: wgs.lon,
            layer: 'gnss',
            pointClass: 'gnss',
            code: p.code || 'CRS',
          };
        } catch {
          return p;
        }
      }),
    [mapPoints, crsId]
  );

  const withH = useMemo(() => planPoints.filter((p) => p.h != null).length, [planPoints]);
  const gnssForOsm = useMemo(
    () =>
      osmPoints.filter(
        (p) =>
          p.layer === 'gnss' ||
          p.pointClass === 'gnss' ||
          (p.y >= 41 && p.y <= 44.5 && p.x >= 22 && p.x <= 29.5)
      ),
    [osmPoints]
  );

  return (
    <>
      <SEO
        title={bg ? 'Координатна карта – GeoSolver' : 'Coordinate map – GeoSolver'}
        description={MODULE_META.map.seo[bg ? 'bg' : 'en']}
        canonical="/map"
      />
      <Layout>
        <ModulePageLayout
          moduleId="map"
          language={language}
          stats={
            !loading ? (
              <div className="grid grid-cols-3 gap-2">
                <Stat label={bg ? 'На плана' : 'On plan'} value={planPoints.length} />
                <Stat label={bg ? 'С кота H' : 'With H'} value={withH} />
                <Stat label={bg ? 'Слоеве' : 'Layers'} value={Math.max(layers.length - 1, 0)} />
              </div>
            ) : null
          }
          toolbar={
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => downloadDxf(planPoints, 'geosolver_map')}
                disabled={!planPoints.length}
                className="px-3 py-2 rounded-lg text-sm font-semibold font-['Manrope'] bg-white dark:bg-zinc-900 outline outline-1 outline-gray-200 dark:outline-zinc-700 disabled:opacity-50"
              >
                DXF
              </button>
              <button
                type="button"
                onClick={() => downloadGeoJson(planPoints, 'geosolver_map')}
                disabled={!planPoints.length}
                className="px-3 py-2 rounded-lg text-sm font-semibold font-['Manrope'] bg-white dark:bg-zinc-900 outline outline-1 outline-gray-200 dark:outline-zinc-700 disabled:opacity-50"
              >
                GeoJSON
              </button>
              <button
                type="button"
                onClick={() => downloadPointsCsv(points, 'geosolver_points', language)}
                disabled={!points.length}
                className="px-3 py-2 rounded-lg text-sm font-semibold font-['Manrope'] bg-white dark:bg-zinc-900 outline outline-1 outline-gray-200 dark:outline-zinc-700 disabled:opacity-50"
              >
                CSV
              </button>
              <Link to="/points" className="px-3 py-2 rounded-lg text-sm font-semibold font-['Manrope'] bg-black dark:bg-white text-white dark:text-black">
                {bg ? 'Точки' : 'Points'}
              </Link>
            </div>
          }
        >
          <div className="flex flex-wrap gap-2 items-end">
            <select className={selectClass} value={projectId} onChange={(e) => setProjectId(e.target.value)}>
              <option value="">{bg ? 'Всички проекти' : 'All projects'}</option>
              {projects.map((p) => (
                <option key={p._id} value={p._id}>{p.name}</option>
              ))}
            </select>
            <select className={selectClass} value={layer} onChange={(e) => setLayer(e.target.value)}>
              {layers.map((l) => (
                <option key={l || 'all'} value={l}>{l || (bg ? 'Всички слоеве' : 'All layers')}</option>
              ))}
            </select>
            <div className="min-w-[220px]">
              <CrsSelect value={crsId} onChange={setCrsId} language={language} />
            </div>
            <Link to="/gnss" className="px-3 py-2 rounded-lg text-sm font-medium font-['Manrope'] outline outline-1 outline-gray-200 dark:outline-zinc-700">
              GNSS import
            </Link>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-700 text-sm font-['Manrope']">{error}</div>
          )}

          {!loading && (
            <>
              <div className="flex flex-wrap gap-2">
                <button type="button" className={tabClass('plan')} onClick={() => setView('plan')}>{bg ? 'План' : 'Plan'}</button>
                <button type="button" className={tabClass('osm')} onClick={() => setView('osm')}>OSM</button>
                <button type="button" className={tabClass('profile')} onClick={() => setView('profile')}>{bg ? 'Профил' : 'Profile'}</button>
                <button type="button" className={tabClass('3d')} onClick={() => setView('3d')}>3D</button>
              </div>
              <p className="text-xs text-neutral-500 dark:text-zinc-400 font-['Manrope'] leading-relaxed p-3 rounded-lg bg-stone-100 dark:bg-zinc-800/50">
                {VIEW_HELP[view][bg ? 'bg' : 'en']}
              </p>
            </>
          )}

          {loading ? (
            <div className="py-20 text-center text-neutral-500 font-['Manrope']">{bg ? 'Зареждане...' : 'Loading...'}</div>
          ) : view === 'profile' ? (
            <ElevationProfileChart points={planPoints} language={language} width={900} height={320} />
          ) : view === '3d' ? (
            <Points3DPreview points={planPoints} language={language} size={400} />
          ) : view === 'osm' ? (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">
              <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl outline outline-1 outline-gray-200 dark:outline-zinc-800">
                <GnssOsmMap
                  points={osmPoints}
                  language={language}
                  height={520}
                  selectedId={selected?._id}
                  onSelectPoint={setSelected}
                />
              </div>
              <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl outline outline-1 outline-gray-200 dark:outline-zinc-800 h-fit">
                <div className="text-sm font-semibold font-['Manrope'] text-black dark:text-white mb-3">
                  {bg ? 'На OSM' : 'On OSM'}
                </div>
                <p className="text-sm text-neutral-500 font-['Manrope'] mb-3">
                  {bg ? `${gnssForOsm.length} точки (CRS → WGS84)` : `${gnssForOsm.length} points (CRS → WGS84)`}
                </p>
                {selected ? (
                  <dl className="text-sm font-['Manrope'] space-y-2">
                    <div><dt className="text-neutral-500">{bg ? 'Име' : 'Name'}</dt><dd className="font-semibold">{selected.name}</dd></div>
                    <div className="grid grid-cols-2 gap-2">
                      <div><dt className="text-neutral-500">{bg ? 'Ширина' : 'Lat'}</dt><dd className="tabular-nums">{selected.y?.toFixed?.(6)}</dd></div>
                      <div><dt className="text-neutral-500">{bg ? 'Дължина' : 'Lon'}</dt><dd className="tabular-nums">{selected.x?.toFixed?.(6)}</dd></div>
                    </div>
                  </dl>
                ) : (
                  <p className="text-sm text-neutral-500 font-['Manrope']">{bg ? 'Кликни маркер на картата.' : 'Click a marker on the map.'}</p>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">
              <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl outline outline-1 outline-gray-200 dark:outline-zinc-800">
                <SurveyPlanMap
                  points={planPoints}
                  language={language}
                  selectedId={selected?._id}
                  onSelectPoint={setSelected}
                  width={900}
                  height={520}
                />
              </div>
              <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl outline outline-1 outline-gray-200 dark:outline-zinc-800 h-fit">
                <div className="text-sm font-semibold font-['Manrope'] text-black dark:text-white mb-3">
                  {bg ? 'Избрана точка' : 'Selected point'}
                </div>
                {selected ? (
                  <>
                    <dl className="text-sm font-['Manrope'] space-y-2">
                      <div><dt className="text-neutral-500">{bg ? 'Име' : 'Name'}</dt><dd className="font-semibold text-black dark:text-white">{selected.name}</dd></div>
                      {selected.code && <div><dt className="text-neutral-500">{bg ? 'Код' : 'Code'}</dt><dd>{selected.code}</dd></div>}
                      <div className="grid grid-cols-2 gap-2">
                        <div><dt className="text-neutral-500">Y</dt><dd className="tabular-nums">{selected.y?.toFixed?.(3)}</dd></div>
                        <div><dt className="text-neutral-500">X</dt><dd className="tabular-nums">{selected.x?.toFixed?.(3)}</dd></div>
                      </div>
                      {selected.h != null && <div><dt className="text-neutral-500">H</dt><dd className="tabular-nums">{selected.h?.toFixed?.(3)}</dd></div>}
                      <div><dt className="text-neutral-500">{bg ? 'Слой' : 'Layer'}</dt><dd>{selected.layer || 'default'}</dd></div>
                    </dl>
                    <Link to="/second-task" className="mt-4 inline-block text-xs font-semibold underline font-['Manrope']">
                      {bg ? 'Провери с втора основна задача →' : 'Verify with second basic task →'}
                    </Link>
                  </>
                ) : (
                  <p className="text-sm text-neutral-500 font-['Manrope']">{bg ? 'Кликни точка на картата.' : 'Click a point on the map.'}</p>
                )}
                {!planPoints.length && (
                  <Link to="/gnss" className="mt-4 inline-block text-sm font-semibold underline font-['Manrope']">
                    {bg ? 'Import GNSS точки →' : 'Import GNSS points →'}
                  </Link>
                )}
              </div>
            </div>
          )}
        </ModulePageLayout>
      </Layout>
    </>
  );
};

const Stat = ({ label, value }) => (
  <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl outline outline-1 outline-gray-200 dark:outline-zinc-800">
    <div className="text-[10px] uppercase tracking-wide text-neutral-400 font-['Manrope']">{label}</div>
    <div className="text-xl font-bold text-black dark:text-white font-['Manrope']">{value}</div>
  </div>
);

export default MapPage;
