import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../layout/Layout';
import SEO from '../../shared/SEO';
import ModulePageLayout from '../../modules/ModulePageLayout';
import GnssSkyPlot from '../../gnss/GnssSkyPlot';
import { useTranslation } from '../../../hooks/useTranslation';
import { surveyPointsApi } from '../../../services/surveyPointsApi';
import { useNmeaSerial } from '../../../hooks/useNmeaSerial';
import { fixQualityLabel } from '../../../utils/parseNmea';
import { downloadGnssSessionPdf } from '../../../utils/exportGnssSessionPdf';

const btnPrimary =
  "px-4 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-lg text-sm font-semibold font-['Manrope'] disabled:opacity-50";
const btnGhost =
  "px-4 py-2.5 rounded-lg outline outline-1 outline-gray-200 dark:outline-zinc-700 text-sm font-semibold font-['Manrope'] disabled:opacity-50";

const GnssLivePage = () => {
  const { language } = useTranslation();
  const bg = language === 'bg';
  const { supported, connected, error, setError, gga, satellites, connect, disconnect } = useNmeaSerial();
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [saved, setSaved] = useState('');

  const saveAsPoint = async () => {
    if (!gga) return;
    setSaving(true);
    setSaved('');
    setError('');
    try {
      const name = `GNSS_${gga.time || Date.now()}`;
      await surveyPointsApi.create({
        name,
        code: 'NMEA',
        y: gga.lat,
        x: gga.lon,
        h: gga.alt,
        notes: `NMEA live · fix ${fixQualityLabel(gga.fixQuality, language)} · HDOP ${gga.hdop ?? '—'}`,
        layer: 'gnss',
        pointClass: 'gnss',
      });
      setSaved(bg ? 'Точката е записана в библиотеката.' : 'Point saved to library.');
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const exportSessionPdf = async () => {
    if (!gga) return;
    setExporting(true);
    try {
      await downloadGnssSessionPdf({
        session: { gga, satCount: satellites.length, title: bg ? 'NMEA live сесия' : 'NMEA live session' },
        language,
        filename: `gnss_session_${gga.time || Date.now()}`,
      });
    } catch (e) {
      setError(e.message);
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      <SEO
        title={bg ? 'GNSS NMEA live – GeoSolver' : 'GNSS NMEA live – GeoSolver'}
        description={bg ? 'Live NMEA поток от GNSS приемник' : 'Live NMEA stream from GNSS receiver'}
        canonical="/gnss/live"
      />
      <Layout>
        <ModulePageLayout moduleId="gnss" language={language} maxWidth="1000px">
          {!supported && (
            <div className="p-4 rounded-lg bg-amber-50 text-amber-900 text-sm font-['Manrope']">
              {bg
                ? 'Web Serial изисква Chrome/Edge и HTTPS (или localhost). На телефон използвай Import вместо live.'
                : 'Web Serial requires Chrome/Edge and HTTPS (or localhost). On mobile use Import instead.'}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {!connected ? (
              <button type="button" className={btnPrimary} disabled={!supported} onClick={connect}>
                {bg ? 'Свържи приемник (USB)' : 'Connect receiver (USB)'}
              </button>
            ) : (
              <button type="button" className={btnGhost} onClick={disconnect}>
                {bg ? 'Прекъсни' : 'Disconnect'}
              </button>
            )}
            <Link to="/gnss" className={btnGhost}>{bg ? '← GNSS import' : '← GNSS import'}</Link>
            <Link to="/stakeout" className={btnGhost}>{bg ? 'Трасиране' : 'Stake-out'}</Link>
            <Link to="/gnss/post-process" className={btnGhost}>Post-processing</Link>
            <Link to="/gnss/field-log" className={btnGhost}>{bg ? 'Полеви дневник' : 'Field log'}</Link>
          </div>

          {error && <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm font-['Manrope']">{error}</div>}
          {saved && <div className="p-3 rounded-lg bg-emerald-50 text-emerald-800 text-sm font-['Manrope']">{saved}</div>}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl outline outline-1 outline-gray-200 dark:outline-zinc-800 flex flex-col gap-3">
              <h2 className="font-semibold font-['Manrope'] text-black dark:text-white">
                {bg ? 'Позиция (GGA)' : 'Position (GGA)'}
              </h2>
              {gga ? (
                <dl className="grid grid-cols-2 gap-2 text-sm font-['Manrope']">
                  <div><dt className="text-neutral-500">Lat</dt><dd className="tabular-nums">{gga.lat.toFixed(8)}°</dd></div>
                  <div><dt className="text-neutral-500">Lon</dt><dd className="tabular-nums">{gga.lon.toFixed(8)}°</dd></div>
                  <div><dt className="text-neutral-500">H</dt><dd className="tabular-nums">{gga.alt != null ? `${gga.alt.toFixed(3)} m` : '—'}</dd></div>
                  <div><dt className="text-neutral-500">Fix</dt><dd>{fixQualityLabel(gga.fixQuality, language)}</dd></div>
                  <div><dt className="text-neutral-500">{bg ? 'Сателити' : 'Satellites'}</dt><dd>{gga.satellites}</dd></div>
                  <div><dt className="text-neutral-500">HDOP</dt><dd>{gga.hdop ?? '—'}</dd></div>
                </dl>
              ) : (
                <p className="text-sm text-neutral-500 font-['Manrope']">
                  {connected
                    ? bg ? 'Очакване на $GPGGA/$GNGGA...' : 'Waiting for $GPGGA/$GNGGA...'
                    : bg ? 'Свържи приемника за live данни.' : 'Connect receiver for live data.'}
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                <button type="button" className={btnPrimary} disabled={!gga || saving} onClick={saveAsPoint}>
                  {saving ? '...' : bg ? 'Запиши като точка' : 'Save as point'}
                </button>
                <button type="button" className={btnGhost} disabled={!gga || exporting} onClick={exportSessionPdf}>
                  {exporting ? 'PDF...' : bg ? 'GNSS отчет PDF' : 'GNSS report PDF'}
                </button>
              </div>
            </div>
            <GnssSkyPlot satellites={satellites} language={language} />
          </div>
        </ModulePageLayout>
      </Layout>
    </>
  );
};

export default GnssLivePage;
