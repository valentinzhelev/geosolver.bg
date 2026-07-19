import React, { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Layout from '../../layout/Layout';
import SEO from '../../shared/SEO';
import ModulePageLayout from '../../modules/ModulePageLayout';
import { MODULE_META } from '../../../config/moduleDocs';
import { useTranslation } from '../../../hooks/useTranslation';
import { useSurveyPoints } from '../../../hooks/useSurveyPoints';
import { useNmeaSerial } from '../../../hooks/useNmeaSerial';
import { useDeviceHeading } from '../../../hooks/useDeviceHeading';
import PointPicker from '../../tasks/PointPicker';
import TwoPointSketch from '../../tasks/TwoPointSketch';
import StakeOutCompass from '../../stakeout/StakeOutCompass';
import { calculateDistanceBearing } from '../../../domain/geodesy/distanceBearing';
import { DEFAULT_CRS, wgs84ToProjected, ensureProjectedPoint, crsLabel } from '../../../domain/geodesy/crsTransform';
import CrsSelect from '../../shared/CrsSelect';
import { fixQualityLabel } from '../../../utils/parseNmea';
import { fieldbooksApi } from '../../../services/fieldbookApi';

const inputClass =
  "w-full px-3 py-2.5 rounded-lg border border-gray-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-sm text-black dark:text-white font-['Manrope'] outline-none focus:ring-2 focus:ring-black/10";
const btnPrimary =
  "px-4 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-lg text-sm font-semibold font-['Manrope'] disabled:opacity-50";
const btnGhost =
  "px-3 py-2 rounded-lg outline outline-1 outline-gray-200 dark:outline-zinc-700 text-sm font-semibold font-['Manrope'] disabled:opacity-50";

const StakeOutPage = () => {
  const { language } = useTranslation();
  const bg = language === 'bg';
  const [searchParams] = useSearchParams();
  const projectFilter = searchParams.get('projectId') || '';
  const { points } = useSurveyPoints(projectFilter ? { projectId: projectFilter } : {});
  const [mode, setMode] = useState('manual');
  const [station, setStation] = useState({ y: '', x: '', label: '', source: 'manual' });
  const [targetId, setTargetId] = useState('');
  const [tolerance, setTolerance] = useState('0.05');
  const [compassEnabled, setCompassEnabled] = useState(false);
  const [copied, setCopied] = useState('');
  const [crsId, setCrsId] = useState(DEFAULT_CRS);

  const nmea = useNmeaSerial();
  const { headingGon, supported: compassSupported, requestPermission } = useDeviceHeading();

  useEffect(() => {
    if (!projectFilter) return;
    fieldbooksApi
      .listProjects()
      .then((res) => {
        const list = res.data || res.projects || [];
        const p = list.find((x) => String(x._id) === String(projectFilter));
        if (p?.crs) setCrsId(p.crs);
      })
      .catch(() => {});
  }, [projectFilter]);

  useEffect(() => {
    if (mode !== 'live' || !nmea.gga) return;
    try {
      const { y, x } = wgs84ToProjected(nmea.gga.lat, nmea.gga.lon, crsId);
      setStation({
        y: String(y),
        x: String(x),
        label: `NMEA → ${crsLabel(crsId, language)}`,
        source: 'nmea',
      });
    } catch {
      setStation({
        y: String(nmea.gga.lon),
        x: String(nmea.gga.lat),
        label: 'NMEA WGS84',
        source: 'nmea',
      });
    }
  }, [mode, nmea.gga, crsId, language]);

  const target = useMemo(() => points.find((p) => p._id === targetId), [points, targetId]);

  const targetProj = useMemo(() => {
    if (!target) return null;
    if (station.source === 'nmea') return ensureProjectedPoint(target, crsId);
    return target;
  }, [target, station.source, crsId]);

  const coordWarning = useMemo(() => {
    if (!target || station.source !== 'nmea') return '';
    if (targetProj?.transformed) {
      return bg
        ? `Целта е трансформирана WGS84 → ${crsLabel(crsId, 'bg')} за изчислението.`
        : `Target transformed WGS84 → ${crsLabel(crsId, 'en')} for this calculation.`;
    }
    return bg
      ? `Станцията е в ${crsLabel(crsId, 'bg')}. Увери се, че целта е в същата система.`
      : `Station is in ${crsLabel(crsId, 'en')}. Ensure the target uses the same CRS.`;
  }, [target, targetProj, station.source, crsId, bg]);

  const result = useMemo(() => {
    const y1 = parseFloat(station.y);
    const x1 = parseFloat(station.x);
    const y2 = targetProj?.y;
    const x2 = targetProj?.x;
    if (!Number.isFinite(y1) || !Number.isFinite(x1) || !Number.isFinite(y2) || !Number.isFinite(x2)) return null;
    try {
      return calculateDistanceBearing(x1, y1, x2, y2);
    } catch {
      return null;
    }
  }, [station, targetProj]);

  const sketchPoints = useMemo(() => {
    if (!result || !targetProj) return null;
    const y1 = parseFloat(station.y);
    const x1 = parseFloat(station.x);
    return {
      a: { y: y1, x: x1, label: station.label || (bg ? 'Станция' : 'Station') },
      b: { y: targetProj.y, x: targetProj.x, label: target?.name },
    };
  }, [result, targetProj, target, station, bg]);

  const gnssTargets = useMemo(
    () => points.filter((p) => p.layer === 'gnss' || p.pointClass === 'gnss'),
    [points]
  );

  const enableCompass = async () => {
    const ok = await requestPermission();
    setCompassEnabled(ok);
  };

  const copyResult = async () => {
    if (!result || !target) return;
    const text = `α = ${result.bearingGon.toFixed(4)} gon\nS = ${result.distance.toFixed(3)} m\nΔY = ${result.deltaY.toFixed(3)} m\nΔX = ${result.deltaX.toFixed(3)} m\n→ ${target.name}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(bg ? 'Копирано' : 'Copied');
      setTimeout(() => setCopied(''), 2000);
    } catch {
      setCopied(bg ? 'Грешка' : 'Failed');
    }
  };

  const modeBtn = (id, label) => (
    <button
      type="button"
      onClick={() => setMode(id)}
      className={`px-3 py-2 rounded-lg text-sm font-semibold font-['Manrope'] ${
        mode === id
          ? 'bg-black dark:bg-white text-white dark:text-black'
          : 'bg-white dark:bg-zinc-900 outline outline-1 outline-gray-200 dark:outline-zinc-700'
      }`}
    >
      {label}
    </button>
  );

  return (
    <>
      <SEO
        title={bg ? 'Трасиране (stake-out) – GeoSolver' : 'Stake-out – GeoSolver'}
        description={MODULE_META.stakeout.seo[bg ? 'bg' : 'en']}
        canonical="/stakeout"
      />
      <Layout>
        <ModulePageLayout moduleId="stakeout" language={language} maxWidth="1000px">
          <div className="flex flex-wrap gap-2">
            {modeBtn('manual', bg ? 'Ръчен режим' : 'Manual mode')}
            {modeBtn('live', bg ? 'Live NMEA' : 'Live NMEA')}
            <Link to="/gnss/live" className={btnGhost}>GNSS live</Link>
          </div>

          <CrsSelect value={crsId} onChange={setCrsId} language={language} className="max-w-md" />

          {mode === 'live' && (
            <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl outline outline-1 outline-gray-200 dark:outline-zinc-800 flex flex-col gap-3">
              <div className="flex flex-wrap gap-2 items-center">
                {!nmea.connected ? (
                  <button type="button" className={btnPrimary} disabled={!nmea.supported} onClick={nmea.connect}>
                    {bg ? 'Свържи GNSS (USB)' : 'Connect GNSS (USB)'}
                  </button>
                ) : (
                  <button type="button" className={btnGhost} onClick={nmea.disconnect}>
                    {bg ? 'Прекъсни' : 'Disconnect'}
                  </button>
                )}
                {compassSupported && !compassEnabled && (
                  <button type="button" className={btnGhost} onClick={enableCompass}>
                    {bg ? 'Компас (телефон)' : 'Compass (phone)'}
                  </button>
                )}
              </div>
              {nmea.error && <div className="text-sm text-red-600 font-['Manrope']">{nmea.error}</div>}
              {nmea.gga && (
                <p className="text-xs text-neutral-500 font-['Manrope']">
                  Fix: {fixQualityLabel(nmea.gga.fixQuality, language)} · Sats: {nmea.gga.satellites} · HDOP: {nmea.gga.hdop ?? '—'}
                </p>
              )}
              {!nmea.supported && (
                <p className="text-xs text-amber-700 font-['Manrope']">
                  {bg ? 'Web Serial — Chrome/Edge на desktop. На телефон ползвай ръчен режим + компас.' : 'Web Serial — Chrome/Edge on desktop. On phone use manual mode + compass.'}
                </p>
              )}
            </div>
          )}

          <div className="p-3 rounded-lg bg-stone-100 dark:bg-zinc-800/50 text-xs font-['Manrope'] text-neutral-600 dark:text-zinc-400 leading-relaxed">
            {bg
              ? 'Трасирането е приложение на втора основна задача: от станция към проектна точка намираш α (gon) и S (m).'
              : 'Stake-out applies the second basic task: from station to design point you get α (gon) and S (m).'}
            {' '}
            <Link to="/second-task/docs" className="underline font-semibold text-black dark:text-white">
              {bg ? 'Документация →' : 'Documentation →'}
            </Link>
          </div>

          {coordWarning && (
            <div className="p-3 rounded-lg bg-amber-50 text-amber-900 text-sm font-['Manrope']">{coordWarning}</div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="p-4 md:p-5 bg-white dark:bg-zinc-900 rounded-xl outline outline-1 outline-gray-200 dark:outline-zinc-800 flex flex-col gap-4">
              <h2 className="font-semibold font-['Manrope'] text-black dark:text-white">
                {mode === 'live'
                  ? bg ? 'Станция (live NMEA)' : 'Station (live NMEA)'
                  : bg ? 'Станция (текуща позиция)' : 'Station (current position)'}
              </h2>
              {mode === 'manual' && (
                <PointPicker
                  language={language}
                  projectId={projectFilter || undefined}
                  label={bg ? 'От библиотека' : 'From library'}
                  onSelect={(p) => setStation({ y: String(p.y), x: String(p.x), label: p.name, source: 'manual' })}
                />
              )}
              <div className="grid grid-cols-2 gap-2">
                <label className="flex flex-col gap-1 text-xs font-medium font-['Manrope']">
                  Y (m)
                  <input
                    className={inputClass}
                    value={station.y}
                    onChange={(e) => setStation((s) => ({ ...s, y: e.target.value, source: 'manual' }))}
                    type="number"
                    step="any"
                    readOnly={mode === 'live' && nmea.connected}
                  />
                </label>
                <label className="flex flex-col gap-1 text-xs font-medium font-['Manrope']">
                  X (m)
                  <input
                    className={inputClass}
                    value={station.x}
                    onChange={(e) => setStation((s) => ({ ...s, x: e.target.value, source: 'manual' }))}
                    type="number"
                    step="any"
                    readOnly={mode === 'live' && nmea.connected}
                  />
                </label>
              </div>

              <h2 className="font-semibold font-['Manrope'] text-black dark:text-white pt-2">
                {bg ? 'Целева точка (проектна)' : 'Target point (design)'}
              </h2>
              <select className={inputClass} value={targetId} onChange={(e) => setTargetId(e.target.value)}>
                <option value="">{bg ? '— избери от библиотеката —' : '— select from library —'}</option>
                {(mode === 'live' ? gnssTargets : points).map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.code ? `${p.code} · ` : ''}{p.name}
                  </option>
                ))}
              </select>
              {mode === 'live' && !gnssTargets.length && (
                <p className="text-xs text-neutral-500 font-['Manrope']">
                  {bg ? 'Няма GNSS точки — запиши от NMEA live или import.' : 'No GNSS points — save from NMEA live or import.'}
                </p>
              )}
              {!points.length && (
                <Link to="/points" className="text-sm font-semibold underline font-['Manrope']">
                  {bg ? 'Добави точки в библиотеката →' : 'Add points to library →'}
                </Link>
              )}

              <label className="flex flex-col gap-1 text-xs font-medium font-['Manrope']">
                {bg ? 'Допуск (m) — учебна проверка' : 'Tolerance (m) — learning check'}
                <input className={inputClass} type="number" step="any" min="0" value={tolerance} onChange={(e) => setTolerance(e.target.value)} />
              </label>
            </div>

            <div className="p-4 md:p-5 bg-white dark:bg-zinc-900 rounded-xl outline outline-1 outline-gray-200 dark:outline-zinc-800 flex flex-col gap-4">
              {result && target ? (
                <>
                  <StakeOutCompass
                    bearingGon={result.bearingGon}
                    distance={result.distance}
                    toleranceM={parseFloat(tolerance) || 0}
                    language={language}
                    deviceHeadingGon={compassEnabled ? headingGon : null}
                  />
                  {sketchPoints && (
                    <TwoPointSketch
                      y1={sketchPoints.a.y}
                      x1={sketchPoints.a.x}
                      y2={sketchPoints.b.y}
                      x2={sketchPoints.b.x}
                      alphaGon={result.bearingGon}
                      distance={result.distance}
                      language={language}
                    />
                  )}
                  <dl className="grid grid-cols-2 gap-3 text-sm font-['Manrope'] border-t border-gray-200 dark:border-zinc-800 pt-4">
                    <div><dt className="text-neutral-500">{bg ? 'Цел' : 'Target'}</dt><dd className="font-semibold">{target.name}</dd></div>
                    <div><dt className="text-neutral-500">α</dt><dd className="font-semibold tabular-nums">{result.bearingGon.toFixed(4)} gon</dd></div>
                    <div><dt className="text-neutral-500">S</dt><dd className="tabular-nums">{result.distance.toFixed(3)} m</dd></div>
                    <div><dt className="text-neutral-500">{bg ? 'Квадрант' : 'Quadrant'}</dt><dd>{result.quadrant}</dd></div>
                  </dl>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={copyResult} className={btnGhost}>
                      {copied || (bg ? 'Копирай α, S' : 'Copy α, S')}
                    </button>
                    <Link to="/second-task" className="text-sm font-semibold underline font-['Manrope'] self-center">
                      {bg ? 'Сравни с калкулатора →' : 'Compare with calculator →'}
                    </Link>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 py-12">
                  <p className="text-neutral-500 text-sm font-['Manrope'] max-w-xs">
                    {bg
                      ? 'Задай станция и избери целева точка, за да видиш α, S и компаса.'
                      : 'Set station and pick a target to see α, S and the compass.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </ModulePageLayout>
      </Layout>
    </>
  );
};

export default StakeOutPage;
