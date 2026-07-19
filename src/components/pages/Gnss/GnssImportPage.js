import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../layout/Layout';
import SEO from '../../shared/SEO';
import ModulePageLayout from '../../modules/ModulePageLayout';
import { MODULE_META } from '../../../config/moduleDocs';
import { useTranslation } from '../../../hooks/useTranslation';
import { surveyPointsApi } from '../../../services/surveyPointsApi';
import { fieldbooksApi } from '../../../services/fieldbookApi';
import { parseGnssFile } from '../../../utils/parseGnssImport';
import { parseRinexFile } from '../../../utils/parseRinexHeader';
import { DEFAULT_CRS, ensureProjectedPoint, looksLikeWgs84, crsLabel } from '../../../domain/geodesy/crsTransform';
import CrsSelect from '../../shared/CrsSelect';

const inputClass =
  "w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-sm text-black dark:text-white font-['Manrope'] outline-none focus:ring-2 focus:ring-black/10";
const btnPrimary =
  "px-4 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-lg text-sm font-semibold font-['Manrope'] disabled:opacity-50";

const FORMATS = [
  { id: 'csv', bg: 'CSV / TXT', en: 'CSV / TXT', descBg: 'Име, Y, X, H — export от Excel или тотална станция', descEn: 'Name, Y, X, H — Excel or total station export' },
  { id: 'gpx', bg: 'GPX', en: 'GPX', descBg: 'Waypoints от мобилни GNSS приложения', descEn: 'Waypoints from mobile GNSS apps' },
  { id: 'rinex', bg: 'RINEX .obs', en: 'RINEX .obs', descBg: 'APPROX POSITION XYZ от header (учебно)', descEn: 'APPROX POSITION XYZ from header (educational)' },
];

const GnssImportPage = () => {
  const { language } = useTranslation();
  const bg = language === 'bg';
  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState('');
  const [preview, setPreview] = useState([]);
  const [rinexMeta, setRinexMeta] = useState(null);
  const [fileName, setFileName] = useState('');
  const [error, setError] = useState('');
  const [importing, setImporting] = useState(false);
  const [success, setSuccess] = useState('');
  const [crsId, setCrsId] = useState(DEFAULT_CRS);
  const [convertWgs84, setConvertWgs84] = useState(true);

  useEffect(() => {
    fieldbooksApi.listProjects().then((res) => setProjects(res.data || res.projects || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (!projectId || !projects.length) return;
    const p = projects.find((x) => String(x._id) === String(projectId));
    if (p?.crs) setCrsId(p.crs);
  }, [projectId, projects]);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setSuccess('');
    setRinexMeta(null);
    try {
      const text = await file.text();
      const lower = file.name.toLowerCase();
      if (lower.endsWith('.obs') || lower.endsWith('.o')) {
        const meta = parseRinexFile(file.name, text);
        if (!meta) {
          setError(bg ? 'Невалиден RINEX файл.' : 'Invalid RINEX file.');
          setPreview([]);
          return;
        }
        setRinexMeta(meta);
        setPreview(meta.point ? [meta.point] : []);
        setFileName(file.name);
        if (!meta.point) {
          setError(bg ? 'RINEX header прочетен, но липсва APPROX POSITION XYZ.' : 'RINEX header read, but APPROX POSITION XYZ is missing.');
        }
        return;
      }
      const points = parseGnssFile(file.name, text);
      if (!points.length) {
        setError(bg ? 'Не са открити точки във файла.' : 'No points found in file.');
        setPreview([]);
        return;
      }
      setPreview(points);
      setFileName(file.name);
    } catch (err) {
      setError(err.message);
      setPreview([]);
    } finally {
      e.target.value = '';
    }
  };

  const handleImport = async () => {
    if (!preview.length) return;
    setImporting(true);
    setError('');
    setSuccess('');
    try {
      let points = preview;
      if (convertWgs84) {
        points = preview.map((p) => {
          if (!looksLikeWgs84(Number(p.x), Number(p.y))) return p;
          const t = ensureProjectedPoint(p, crsId);
          return {
            ...p,
            x: t.x,
            y: t.y,
            notes: [p.notes, `CRS ${crsId} from WGS84`].filter(Boolean).join(' · '),
          };
        });
      }
      const res = await surveyPointsApi.importMany({ points, projectId: projectId || null });
      const converted = points.filter((p, i) => looksLikeWgs84(Number(preview[i].x), Number(preview[i].y))).length;
      setSuccess(
        bg
          ? `Импортирани ${res.count || points.length} точки${converted && convertWgs84 ? ` (${converted} трансформирани към ${crsLabel(crsId, 'bg')})` : ''}.`
          : `Imported ${res.count || points.length} points${converted && convertWgs84 ? ` (${converted} transformed to ${crsLabel(crsId, 'en')})` : ''}.`
      );
      setPreview([]);
      setRinexMeta(null);
      setFileName('');
    } catch (err) {
      setError(err.message);
    } finally {
      setImporting(false);
    }
  };

  return (
    <>
      <SEO title={bg ? 'GNSS import – GeoSolver' : 'GNSS import – GeoSolver'} description={MODULE_META.gnss.seo[bg ? 'bg' : 'en']} canonical="/gnss" />
      <Layout>
        <ModulePageLayout moduleId="gnss" language={language} maxWidth="900px">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {FORMATS.map((f) => (
              <div key={f.id} className="p-3 bg-white dark:bg-zinc-900 rounded-xl outline outline-1 outline-gray-200 dark:outline-zinc-800">
                <div className="text-sm font-semibold text-black dark:text-white font-['Manrope']">{f[bg ? 'bg' : 'en']}</div>
                <p className="text-xs text-neutral-500 font-['Manrope'] mt-1">{f[bg ? 'descBg' : 'descEn']}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <Link to="/gnss/live" className="px-3 py-2 rounded-lg text-sm font-medium font-['Manrope'] outline outline-1 outline-gray-200 dark:outline-zinc-700">
              NMEA live
            </Link>
            <Link to="/gnss/post-process" className="px-3 py-2 rounded-lg text-sm font-medium font-['Manrope'] outline outline-1 outline-gray-200 dark:outline-zinc-700">
              {bg ? 'Post-processing' : 'Post-processing'}
            </Link>
            <Link to="/gnss/field-log" className="px-3 py-2 rounded-lg text-sm font-medium font-['Manrope'] outline outline-1 outline-gray-200 dark:outline-zinc-700">
              {bg ? 'Полеви дневник' : 'Field log'}
            </Link>
            <Link to="/integrations" className="px-3 py-2 rounded-lg text-sm font-medium font-['Manrope'] outline outline-1 outline-gray-200 dark:outline-zinc-700">
              API
            </Link>
          </div>

          <div className="p-4 md:p-5 bg-white dark:bg-zinc-900 rounded-xl outline outline-1 outline-gray-200 dark:outline-zinc-800 flex flex-col gap-4">
            <label className="flex flex-col gap-2 cursor-pointer">
              <span className="text-sm font-semibold font-['Manrope'] text-black dark:text-white">
                {bg ? '1. Избери файл' : '1. Choose file'}
              </span>
              <input
                type="file"
                accept=".csv,.txt,.gpx,.obs,.o"
                onChange={handleFile}
                className="text-sm file:mr-3 file:px-4 file:py-2 file:rounded-lg file:border-0 file:bg-black file:text-white dark:file:bg-white dark:file:text-black file:font-semibold file:font-['Manrope']"
              />
            </label>

            {fileName && (
              <p className="text-sm text-neutral-500 font-['Manrope']">
                {bg ? 'Файл' : 'File'}: <strong>{fileName}</strong>
                {preview.length ? ` · ${preview.length} ${bg ? 'точки за preview' : 'points in preview'}` : ''}
              </p>
            )}

            {rinexMeta && (
              <div className="p-3 rounded-lg bg-stone-50 dark:bg-zinc-800 text-sm font-['Manrope'] space-y-1">
                <div className="font-semibold text-black dark:text-white">{bg ? 'RINEX header (учебен преглед)' : 'RINEX header (learning preview)'}</div>
                {rinexMeta.version && <div>RINEX {rinexMeta.version}</div>}
                {rinexMeta.markerName && <div>{bg ? 'Маркер' : 'Marker'}: {rinexMeta.markerName}</div>}
                {rinexMeta.approxXyz && (
                  <div className="tabular-nums">XYZ: {rinexMeta.approxXyz.x}, {rinexMeta.approxXyz.y}, {rinexMeta.approxXyz.z}</div>
                )}
                {rinexMeta.timeFirstObs && <div className="text-xs text-neutral-500">{rinexMeta.timeFirstObs}</div>}
              </div>
            )}

            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium font-['Manrope'] text-black dark:text-white">
                {bg ? '2. Проект (по избор) — свързва точките с обект' : '2. Project (optional) — links points to site'}
              </span>
              <select className={inputClass} value={projectId} onChange={(e) => setProjectId(e.target.value)}>
                <option value="">{bg ? '— без проект —' : '— no project —'}</option>
                {projects.map((p) => (
                  <option key={p._id} value={p._id}>{p.name}</option>
                ))}
              </select>
            </label>

            <CrsSelect value={crsId} onChange={setCrsId} language={language} />
            <label className="flex items-center gap-2 text-sm font-['Manrope'] text-neutral-700 dark:text-zinc-300">
              <input type="checkbox" checked={convertWgs84} onChange={(e) => setConvertWgs84(e.target.checked)} />
              {bg
                ? 'Ако координатите изглеждат като WGS84 (lat/lon) — трансформирай към избраната система при import'
                : 'If coordinates look like WGS84 (lat/lon) — transform to selected CRS on import'}
            </label>

            {error && <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm font-['Manrope']">{error}</div>}
            {success && (
              <div className="p-3 rounded-lg bg-emerald-50 text-emerald-800 text-sm font-['Manrope']">
                {success}{' '}
                <Link to="/map" className="underline font-semibold">{bg ? '3. Виж на картата →' : '3. View on map →'}</Link>
              </div>
            )}

            {preview.length > 0 && (
              <>
                <p className="text-xs text-neutral-500 font-['Manrope']">
                  {bg ? 'Провери preview преди import — грешна система или разменени Y/X са честа студентска грешка.' : 'Check preview before import — wrong system or swapped Y/X is a common student mistake.'}
                </p>
                <div className="rounded-lg border border-gray-200 dark:border-zinc-700 overflow-x-auto max-h-64">
                  <table className="w-full text-xs font-['Manrope']">
                    <thead>
                      <tr className="bg-stone-50 dark:bg-zinc-800 text-left">
                        <th className="px-2 py-2">#</th>
                        <th className="px-2 py-2">{bg ? 'Име' : 'Name'}</th>
                        <th className="px-2 py-2">Y</th>
                        <th className="px-2 py-2">X</th>
                        <th className="px-2 py-2">H</th>
                      </tr>
                    </thead>
                    <tbody>
                      {preview.slice(0, 50).map((p, i) => (
                        <tr key={i} className="border-t border-gray-100 dark:border-zinc-800">
                          <td className="px-2 py-1.5">{i + 1}</td>
                          <td className="px-2 py-1.5">{p.name}</td>
                          <td className="px-2 py-1.5 tabular-nums">{p.y ?? '—'}</td>
                          <td className="px-2 py-1.5 tabular-nums">{p.x ?? '—'}</td>
                          <td className="px-2 py-1.5 tabular-nums">{p.h ?? '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button type="button" onClick={handleImport} disabled={importing} className={btnPrimary}>
                  {importing ? (bg ? 'Import...' : 'Importing...') : bg ? 'Import в библиотеката' : 'Import to library'}
                </button>
              </>
            )}
          </div>

          <div className="p-3 rounded-lg bg-stone-100 dark:bg-zinc-800/50 text-xs font-['Manrope'] text-neutral-600 dark:text-zinc-400">
            <strong>CSV пример:</strong> Name,Y,X,H · TP1,5012345.120,4321000.450,512.340
          </div>
        </ModulePageLayout>
      </Layout>
    </>
  );
};

export default GnssImportPage;
