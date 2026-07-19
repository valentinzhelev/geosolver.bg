import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '../../layout/Layout';
import SEO from '../../shared/SEO';
import ModulePageLayout from '../../modules/ModulePageLayout';
import { MODULE_META } from '../../../config/moduleDocs';
import { useTranslation } from '../../../hooks/useTranslation';
import { surveyPointsApi } from '../../../services/surveyPointsApi';
import { fieldbooksApi } from '../../../services/fieldbookApi';
import { downloadPointsCsv } from '../../../utils/parseGnssImport';
import { downloadGeoJson } from '../../../utils/exportGeoJson';
import { downloadDxf } from '../../../utils/exportDxf';
import { findNearbyPoints } from '../../../utils/findNearbyPoints';

const emptyForm = () => ({
  name: '',
  code: '',
  x: '',
  y: '',
  h: '',
  pointClass: '',
  layer: 'default',
  notes: '',
});

const inputClass =
  "w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-sm text-black dark:text-white font-['Manrope'] outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/20";

const formatCoord = (v) => (v === null || v === undefined ? '—' : Number(v).toFixed(3));

const PointsPage = () => {
  const { language } = useTranslation();
  const bg = language === 'bg';
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const projectFilter = searchParams.get('projectId') || '';
  const [projects, setProjects] = useState([]);
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(emptyForm());
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [dupThreshold, setDupThreshold] = useState('0.05');
  const [showDups, setShowDups] = useState(false);

  const loadPoints = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (search) params.q = search;
      if (projectFilter) params.projectId = projectFilter;
      const res = await surveyPointsApi.list(params);
      setPoints(res.data || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [search, projectFilter]);

  useEffect(() => {
    fieldbooksApi
      .listProjects()
      .then((r) => setProjects(r.data || r.projects || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const t = setTimeout(loadPoints, search ? 300 : 0);
    return () => clearTimeout(t);
  }, [loadPoints, search]);

  const stats = useMemo(
    () => ({
      total: points.length,
      withCoords: points.filter((p) => p.x != null && p.y != null).length,
      withH: points.filter((p) => p.h != null).length,
      layers: new Set(points.map((p) => p.layer || 'default')).size,
    }),
    [points]
  );

  const nearbyPairs = useMemo(() => {
    const t = parseFloat(dupThreshold);
    if (!Number.isFinite(t) || t <= 0) return [];
    return findNearbyPoints(points, t);
  }, [points, dupThreshold]);

  const resetForm = () => {
    setForm(emptyForm());
    setEditId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    setError('');
    try {
      const body = {
        name: form.name.trim(),
        code: form.code.trim(),
        x: form.x === '' ? null : form.x,
        y: form.y === '' ? null : form.y,
        h: form.h === '' ? null : form.h,
        pointClass: form.pointClass.trim(),
        layer: form.layer.trim() || 'default',
        notes: form.notes,
        projectId: projectFilter || null,
      };
      if (editId) {
        await surveyPointsApi.update(editId, body);
      } else {
        await surveyPointsApi.create(body);
      }
      resetForm();
      await loadPoints();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (p) => {
    setEditId(p._id);
    setForm({
      name: p.name || '',
      code: p.code || '',
      x: p.x != null ? String(p.x) : '',
      y: p.y != null ? String(p.y) : '',
      h: p.h != null ? String(p.h) : '',
      pointClass: p.pointClass || '',
      layer: p.layer || 'default',
      notes: p.notes || '',
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm(bg ? 'Изтриване на точката?' : 'Delete this point?')) return;
    try {
      await surveyPointsApi.remove(id);
      if (editId === id) resetForm();
      await loadPoints();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleImportCsv = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/).filter(Boolean);
      const rows = lines.slice(1).map((line) => {
        const cols = line.split(/[,;\t]/).map((c) => c.trim().replace(/^"|"$/g, ''));
        return {
          name: cols[0] || '',
          code: cols[1] || '',
          y: cols[2] || '',
          x: cols[3] || '',
          h: cols[4] || '',
          notes: cols[5] || '',
        };
      });
      await surveyPointsApi.importMany({ points: rows, projectId: projectFilter || null });
      await loadPoints();
    } catch (err) {
      setError(err.message);
    } finally {
      e.target.value = '';
    }
  };

  return (
    <>
      <SEO
        title={bg ? 'Библиотека с точки – GeoSolver' : 'Points library – GeoSolver'}
        description={MODULE_META.points.seo[bg ? 'bg' : 'en']}
        canonical="/points"
      />
      <Layout>
        <ModulePageLayout
          moduleId="points"
          language={language}
          stats={
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <StatBox label={bg ? 'Общо' : 'Total'} value={stats.total} />
              <StatBox label={bg ? 'С координати' : 'With coords'} value={stats.withCoords} />
              <StatBox label={bg ? 'С кота H' : 'With H'} value={stats.withH} />
              <StatBox label={bg ? 'Слоеве' : 'Layers'} value={stats.layers} />
            </div>
          }
          toolbar={
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={!points.length}
                onClick={() => downloadDxf(points, 'geosolver_points')}
                className="px-3 py-2 rounded-lg text-sm font-semibold font-['Manrope'] bg-white dark:bg-zinc-900 outline outline-1 outline-gray-200 dark:outline-zinc-700 disabled:opacity-50"
              >
                DXF
              </button>
              <button
                type="button"
                disabled={!points.length}
                onClick={() => downloadGeoJson(points, 'geosolver_points')}
                className="px-3 py-2 rounded-lg text-sm font-semibold font-['Manrope'] bg-white dark:bg-zinc-900 outline outline-1 outline-gray-200 dark:outline-zinc-700 disabled:opacity-50"
              >
                GeoJSON
              </button>
              <button
                type="button"
                disabled={!points.length}
                onClick={() => downloadPointsCsv(points, 'geosolver_points', language)}
                className="px-3 py-2 rounded-lg text-sm font-semibold font-['Manrope'] bg-white dark:bg-zinc-900 outline outline-1 outline-gray-200 dark:outline-zinc-700 disabled:opacity-50"
              >
                CSV
              </button>
              <Link
                to={projectFilter ? `/map?projectId=${projectFilter}` : '/map'}
                className="px-3 py-2 rounded-lg text-sm font-semibold font-['Manrope'] bg-black dark:bg-white text-white dark:text-black"
              >
                {bg ? 'Карта' : 'Map'}
              </Link>
            </div>
          }
        >
          <div className="flex flex-wrap items-center gap-2">
            <select
              className={inputClass + ' w-auto min-w-[180px]'}
              value={projectFilter}
              onChange={(e) => {
                const v = e.target.value;
                navigate(v ? `/points?projectId=${v}` : '/points');
              }}
            >
              <option value="">{bg ? 'Всички проекти' : 'All projects'}</option>
              {projects.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>
            <Link to="/gnss" className="px-3 py-2 rounded-lg text-sm font-medium font-['Manrope'] outline outline-1 outline-gray-200 dark:outline-zinc-700">
              GNSS import
            </Link>
          </div>

          <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl outline outline-1 outline-gray-200 dark:outline-zinc-800 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setShowDups((v) => !v)}
              className="text-sm font-semibold font-['Manrope'] underline"
            >
              {showDups
                ? bg ? 'Скрий дублирани' : 'Hide duplicates'
                : bg ? 'Провери дублирани точки' : 'Check duplicate points'}
            </button>
            {showDups && (
              <>
                <label className="flex items-center gap-2 text-xs font-['Manrope']">
                  {bg ? 'Допуск (m)' : 'Tolerance (m)'}
                  <input
                    className={inputClass + ' w-24'}
                    type="number"
                    step="any"
                    min="0.001"
                    value={dupThreshold}
                    onChange={(e) => setDupThreshold(e.target.value)}
                  />
                </label>
                <span className="text-xs text-neutral-500 font-['Manrope']">
                  {nearbyPairs.length
                    ? bg
                      ? `${nearbyPairs.length} двойки под допуска`
                      : `${nearbyPairs.length} pairs within tolerance`
                    : bg ? 'Няма близки двойки' : 'No close pairs'}
                </span>
              </>
            )}
          </div>

          {showDups && nearbyPairs.length > 0 && (
            <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-sm font-['Manrope'] space-y-1 max-h-40 overflow-y-auto">
              {nearbyPairs.slice(0, 20).map(({ a, b, distance }) => (
                <div key={`${a._id}-${b._id}`}>
                  <strong>{a.name}</strong> ↔ <strong>{b.name}</strong>
                  {' — '}
                  {distance.toFixed(3)} m
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-sm font-['Manrope']">
              {error}
            </div>
          )}

          <div className="p-3 rounded-lg bg-stone-100 dark:bg-zinc-800/60 text-xs text-neutral-600 dark:text-zinc-400 font-['Manrope'] leading-relaxed">
            {bg
              ? 'Координатна конвенция: Y = север (Northing), X = изток (Easting), единици — метри. Точките се преизползват в калкулаторите чрез PointPicker.'
              : 'Coordinate convention: Y = north (Northing), X = east (Easting), units — metres. Points are reused in calculators via PointPicker.'}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-5">
              <form
                onSubmit={handleSubmit}
                className="p-4 bg-white dark:bg-zinc-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-800 flex flex-col gap-3 h-fit"
              >
                <div className="text-black dark:text-white text-lg font-semibold font-['Manrope']">
                  {editId ? (bg ? 'Редакция' : 'Edit point') : bg ? 'Нова точка' : 'New point'}
                </div>
                <Field label={bg ? 'Име *' : 'Name *'}>
                  <input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                </Field>
                <Field label={bg ? 'Код' : 'Code'}>
                  <input className={inputClass} value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
                </Field>
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Y (m)">
                    <input type="number" step="any" className={inputClass} value={form.y} onChange={(e) => setForm({ ...form, y: e.target.value })} />
                  </Field>
                  <Field label="X (m)">
                    <input type="number" step="any" className={inputClass} value={form.x} onChange={(e) => setForm({ ...form, x: e.target.value })} />
                  </Field>
                </div>
                <Field label={bg ? 'Кота H (m)' : 'Elevation H (m)'}>
                  <input type="number" step="any" className={inputClass} value={form.h} onChange={(e) => setForm({ ...form, h: e.target.value })} />
                </Field>
                <Field label={bg ? 'Клас' : 'Class'}>
                  <input className={inputClass} value={form.pointClass} onChange={(e) => setForm({ ...form, pointClass: e.target.value })} placeholder={bg ? 'контролна, детайл...' : 'control, detail...'} />
                </Field>
                <Field label={bg ? 'Слой' : 'Layer'}>
                  <input className={inputClass} value={form.layer} onChange={(e) => setForm({ ...form, layer: e.target.value })} placeholder="default" />
                </Field>
                <Field label={bg ? 'Бележки' : 'Notes'}>
                  <textarea className={`${inputClass} min-h-[72px] resize-y`} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                </Field>
                <div className="flex flex-wrap gap-2 pt-1">
                  <button type="submit" disabled={saving} className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg text-sm font-semibold font-['Manrope'] disabled:opacity-50">
                    {saving ? (bg ? 'Запис...' : 'Saving...') : editId ? (bg ? 'Обнови' : 'Update') : bg ? 'Добави' : 'Add'}
                  </button>
                  {editId && (
                    <button type="button" onClick={resetForm} className="px-4 py-2 rounded-lg outline outline-1 outline-gray-200 dark:outline-zinc-700 text-sm font-medium font-['Manrope']">
                      {bg ? 'Отказ' : 'Cancel'}
                    </button>
                  )}
                </div>
                <label className="mt-2 pt-3 border-t border-gray-200 dark:border-zinc-800 cursor-pointer text-sm font-medium font-['Manrope'] text-neutral-600 dark:text-zinc-400 hover:text-black dark:hover:text-white">
                  {bg ? 'Import CSV (име, код, Y, X, H, бележки)' : 'Import CSV (name, code, Y, X, H, notes)'}
                  <input type="file" accept=".csv,.txt" className="hidden" onChange={handleImportCsv} />
                </label>
              </form>

              <div className="flex flex-col gap-3 min-w-0">
                <input
                  className={inputClass}
                  placeholder={bg ? 'Търсене по име, код...' : 'Search by name, code...'}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <div className="rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-800 overflow-hidden bg-white dark:bg-zinc-900">
                  {loading ? (
                    <div className="p-8 text-center text-neutral-500 font-['Manrope']">{bg ? 'Зареждане...' : 'Loading...'}</div>
                  ) : points.length === 0 ? (
                    <div className="p-8 text-center text-neutral-500 font-['Manrope']">
                      {bg ? 'Няма точки. Добавете първата от формата вляво.' : 'No points yet. Add the first one using the form on the left.'}
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm font-['Manrope']">
                        <thead>
                          <tr className="bg-stone-50 dark:bg-zinc-800 text-left">
                            <th className="px-3 py-2 font-semibold text-black dark:text-white">{bg ? 'Име' : 'Name'}</th>
                            <th className="px-3 py-2 font-semibold text-black dark:text-white">{bg ? 'Код' : 'Code'}</th>
                            <th className="px-3 py-2 font-semibold text-black dark:text-white">Y</th>
                            <th className="px-3 py-2 font-semibold text-black dark:text-white">X</th>
                            <th className="px-3 py-2 font-semibold text-black dark:text-white">H</th>
                            <th className="px-3 py-2 font-semibold text-black dark:text-white">{bg ? 'Клас' : 'Class'}</th>
                            <th className="px-3 py-2 font-semibold text-black dark:text-white">{bg ? 'Слой' : 'Layer'}</th>
                            <th className="px-3 py-2" />
                          </tr>
                        </thead>
                        <tbody>
                          {points.map((p) => (
                            <tr key={p._id} className="border-t border-gray-100 dark:border-zinc-800 hover:bg-stone-50/80 dark:hover:bg-zinc-800/50">
                              <td className="px-3 py-2 text-black dark:text-white font-medium">{p.name}</td>
                              <td className="px-3 py-2 text-neutral-500">{p.code || '—'}</td>
                              <td className="px-3 py-2 text-neutral-600 dark:text-zinc-300 tabular-nums">{formatCoord(p.y)}</td>
                              <td className="px-3 py-2 text-neutral-600 dark:text-zinc-300 tabular-nums">{formatCoord(p.x)}</td>
                              <td className="px-3 py-2 text-neutral-600 dark:text-zinc-300 tabular-nums">{formatCoord(p.h)}</td>
                              <td className="px-3 py-2 text-neutral-500">{p.pointClass || '—'}</td>
                              <td className="px-3 py-2 text-neutral-500">{p.layer || 'default'}</td>
                              <td className="px-3 py-2 whitespace-nowrap">
                                <button type="button" onClick={() => startEdit(p)} className="text-sm font-medium text-black dark:text-white hover:underline mr-3">
                                  {bg ? 'Ред.' : 'Edit'}
                                </button>
                                <button type="button" onClick={() => handleDelete(p._id)} className="text-sm font-medium text-red-600 dark:text-red-400 hover:underline">
                                  {bg ? 'Изтр.' : 'Del'}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
        </ModulePageLayout>
      </Layout>
    </>
  );
};

const StatBox = ({ label, value }) => (
  <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-800">
    <div className="text-neutral-500 dark:text-zinc-400 text-xs font-medium font-['Manrope']">{label}</div>
    <div className="text-black dark:text-white text-xl font-bold font-['Manrope']">{value}</div>
  </div>
);

const Field = ({ label, children }) => (
  <label className="flex flex-col gap-1">
    <span className="text-xs font-medium font-['Manrope'] text-black dark:text-white">{label}</span>
    {children}
  </label>
);

export default PointsPage;
