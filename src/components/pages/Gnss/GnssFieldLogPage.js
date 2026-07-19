import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../layout/Layout';
import SEO from '../../shared/SEO';
import ModulePageLayout from '../../modules/ModulePageLayout';
import { useTranslation } from '../../../hooks/useTranslation';
import { useNmeaSerial } from '../../../hooks/useNmeaSerial';
import { fixQualityLabel } from '../../../utils/parseNmea';
import {
  loadGnssFieldLog,
  saveGnssFieldLog,
  downloadGnssLogCsv,
  enqueuePendingGnssFieldLog,
  flushPendingGnssFieldLog,
  loadPendingGnssFieldLog,
} from '../../../utils/gnssFieldLog';
import { downloadGnssFieldLogPdf } from '../../../utils/exportGnssFieldLogPdf';
import { gnssFieldLogApi } from '../../../services/gnssFieldLogApi';

const inputClass =
  "w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 text-sm text-black dark:text-white font-['Manrope'] outline-none focus:ring-2 focus:ring-black/10";
const btnPrimary =
  "px-4 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-lg text-sm font-semibold font-['Manrope'] disabled:opacity-50";
const btnGhost =
  "px-4 py-2.5 rounded-lg outline outline-1 outline-gray-200 dark:outline-zinc-700 text-sm font-semibold font-['Manrope'] disabled:opacity-50";

const emptyForm = () => ({
  date: new Date().toISOString().slice(0, 10),
  site: '',
  base: '',
  rover: '',
  antennaHeight: '',
  fixType: '',
  hdop: '',
  notes: '',
});

const GnssFieldLogPage = () => {
  const { language } = useTranslation();
  const bg = language === 'bg';
  const { gga } = useNmeaSerial();
  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pdfBusy, setPdfBusy] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // Flush offline queue first
      const pending = loadPendingGnssFieldLog();
      if (pending.length && navigator.onLine !== false) {
        try {
          const { synced } = await flushPendingGnssFieldLog((rows) => gnssFieldLogApi.importMany(rows));
          if (synced) {
            setSuccess(
              bg
                ? `Синхронизирани ${synced} офлайн записа.`
                : `Synced ${synced} offline entries.`
            );
          }
        } catch {
          /* keep pending; continue with list */
        }
      }

      const res = await gnssFieldLogApi.list();
      setEntries(res.data || []);
      // One-shot migrate legacy local browser log to cloud
      const local = loadGnssFieldLog().filter((e) => !e.pendingSync);
      if (local.length && !(res.data || []).length) {
        const imported = await gnssFieldLogApi.importMany(local);
        setEntries(imported.data || []);
        saveGnssFieldLog([]);
        setSuccess(
          bg
            ? `Мигрирани ${imported.count || local.length} локални записа в облака.`
            : `Migrated ${imported.count || local.length} local entries to cloud.`
        );
      }
    } catch (e) {
      const pending = loadPendingGnssFieldLog();
      const local = loadGnssFieldLog();
      const merged = [...pending, ...local.filter((l) => !pending.some((p) => String(p.id) === String(l.id)))];
      setEntries(merged.map((row) => ({ ...row, _id: row.id, offline: true })));
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [bg]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const onOnline = () => refresh();
    window.addEventListener('online', onOnline);
    return () => window.removeEventListener('online', onOnline);
  }, [refresh]);

  useEffect(() => {
    if (!gga) return;
    setForm((f) => ({
      ...f,
      fixType: fixQualityLabel(gga.fixQuality, language),
      hdop: gga.hdop != null ? String(gga.hdop) : f.hdop,
    }));
  }, [gga, language]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await gnssFieldLogApi.create(form);
      setForm(emptyForm());
      await refresh();
      setSuccess(bg ? 'Сесията е записана в облака.' : 'Session saved to cloud.');
    } catch (err) {
      enqueuePendingGnssFieldLog(form);
      const list = loadGnssFieldLog();
      setEntries(list.map((row) => ({ ...row, _id: row.id, offline: true })));
      setForm(emptyForm());
      setError(
        bg
          ? `Облакът недостъпен — в опашка за синхронизация. (${err.message})`
          : `Cloud unavailable — queued for sync. (${err.message})`
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await gnssFieldLogApi.remove(id);
      await refresh();
    } catch {
      const next = loadGnssFieldLog().filter((e) => String(e.id) !== String(id));
      saveGnssFieldLog(next);
      setEntries(next.map((row) => ({ ...row, _id: row.id, offline: true })));
    }
  };

  const handlePdf = async () => {
    if (!entries.length) return;
    setPdfBusy(true);
    try {
      await downloadGnssFieldLogPdf({ entries, language, filename: 'gnss_field_log' });
    } catch (e) {
      setError(e.message || (bg ? 'PDF грешка' : 'PDF error'));
    } finally {
      setPdfBusy(false);
    }
  };

  return (
    <>
      <SEO
        title={bg ? 'GNSS полеви дневник – GeoSolver' : 'GNSS field log – GeoSolver'}
        description={
          bg
            ? 'Запис на база, rover, антена и качество на fix за полева сесия'
            : 'Log base, rover, antenna and fix quality for field sessions'
        }
        canonical="/gnss/field-log"
      />
      <Layout>
        <ModulePageLayout moduleId="gnss" language={language} maxWidth="900px">
          <p className="text-sm text-neutral-600 dark:text-zinc-400 font-['Manrope'] leading-relaxed">
            {bg
              ? 'Полеви дневник — записите се пазят в акаунта ти (облак). При липса на връзка влизат в офлайн опашка и се синхронизират автоматично.'
              : 'Field log — cloud storage with an offline sync queue that flushes when you are back online.'}
          </p>

          {error && (
            <div className="p-3 rounded-lg bg-amber-50 text-amber-900 text-sm font-['Manrope']">{error}</div>
          )}
          {success && (
            <div className="p-3 rounded-lg bg-emerald-50 text-emerald-800 text-sm font-['Manrope']">{success}</div>
          )}

          <div className="flex flex-wrap gap-2">
            <Link to="/gnss/live" className={btnGhost}>
              {bg ? 'NMEA live' : 'NMEA live'}
            </Link>
            <Link to="/gnss" className={btnGhost}>
              GNSS import
            </Link>
            <button
              type="button"
              className={btnGhost}
              disabled={!entries.length}
              onClick={() => downloadGnssLogCsv(entries, language)}
            >
              CSV
            </button>
            <button type="button" className={btnGhost} disabled={!entries.length || pdfBusy} onClick={handlePdf}>
              {pdfBusy ? 'PDF…' : 'PDF'}
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="p-4 bg-white dark:bg-zinc-900 rounded-xl outline outline-1 outline-gray-200 dark:outline-zinc-800 grid gap-3 sm:grid-cols-2"
          >
            <label className="grid gap-1 text-sm font-['Manrope']">
              <span className="text-neutral-500">{bg ? 'Дата' : 'Date'}</span>
              <input
                type="date"
                className={inputClass}
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                required
              />
            </label>
            <label className="grid gap-1 text-sm font-['Manrope']">
              <span className="text-neutral-500">{bg ? 'Обект / трасе' : 'Site'}</span>
              <input
                className={inputClass}
                value={form.site}
                onChange={(e) => setForm({ ...form, site: e.target.value })}
                placeholder={bg ? 'напр. ж.к. Лозенец' : 'e.g. site name'}
              />
            </label>
            <label className="grid gap-1 text-sm font-['Manrope']">
              <span className="text-neutral-500">{bg ? 'База' : 'Base'}</span>
              <input
                className={inputClass}
                value={form.base}
                onChange={(e) => setForm({ ...form, base: e.target.value })}
              />
            </label>
            <label className="grid gap-1 text-sm font-['Manrope']">
              <span className="text-neutral-500">Rover</span>
              <input
                className={inputClass}
                value={form.rover}
                onChange={(e) => setForm({ ...form, rover: e.target.value })}
              />
            </label>
            <label className="grid gap-1 text-sm font-['Manrope']">
              <span className="text-neutral-500">{bg ? 'Височина антена (m)' : 'Antenna height (m)'}</span>
              <input
                className={inputClass}
                value={form.antennaHeight}
                onChange={(e) => setForm({ ...form, antennaHeight: e.target.value })}
                inputMode="decimal"
              />
            </label>
            <label className="grid gap-1 text-sm font-['Manrope']">
              <span className="text-neutral-500">Fix / HDOP</span>
              <div className="flex gap-2">
                <input
                  className={inputClass}
                  value={form.fixType}
                  onChange={(e) => setForm({ ...form, fixType: e.target.value })}
                  placeholder="Fix"
                />
                <input
                  className={inputClass}
                  value={form.hdop}
                  onChange={(e) => setForm({ ...form, hdop: e.target.value })}
                  placeholder="HDOP"
                  inputMode="decimal"
                />
              </div>
            </label>
            <label className="grid gap-1 text-sm font-['Manrope'] sm:col-span-2">
              <span className="text-neutral-500">{bg ? 'Бележки' : 'Notes'}</span>
              <textarea
                className={`${inputClass} min-h-[72px]`}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </label>
            <div className="sm:col-span-2">
              <button type="submit" className={btnPrimary} disabled={saving}>
                {saving ? (bg ? 'Запис…' : 'Saving…') : bg ? 'Запиши сесия' : 'Save session'}
              </button>
            </div>
          </form>

          {loading ? (
            <div className="text-center text-neutral-500 font-['Manrope'] py-6">
              {bg ? 'Зареждане…' : 'Loading…'}
            </div>
          ) : entries.length > 0 ? (
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-zinc-800">
              <table className="w-full text-sm font-['Manrope']">
                <thead className="bg-stone-50 dark:bg-zinc-800/80 text-left text-neutral-500">
                  <tr>
                    <th className="px-3 py-2">{bg ? 'Дата' : 'Date'}</th>
                    <th className="px-3 py-2">{bg ? 'Обект' : 'Site'}</th>
                    <th className="px-3 py-2">{bg ? 'База' : 'Base'}</th>
                    <th className="px-3 py-2">Rover</th>
                    <th className="px-3 py-2">Fix</th>
                    <th className="px-3 py-2" />
                  </tr>
                </thead>
                <tbody>
                  {entries.map((e) => (
                    <tr key={e._id || e.id} className="border-t border-gray-100 dark:border-zinc-800">
                      <td className="px-3 py-2 tabular-nums">{e.date}</td>
                      <td className="px-3 py-2">{e.site || '—'}</td>
                      <td className="px-3 py-2">{e.base || '—'}</td>
                      <td className="px-3 py-2">{e.rover || '—'}</td>
                      <td className="px-3 py-2">
                        {e.fixType || '—'}
                        {e.hdop ? ` · ${e.hdop}` : ''}
                        {e.offline || e.pendingSync ? ' · local' : ''}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <button
                          type="button"
                          onClick={() => handleDelete(e._id || e.id)}
                          className="text-xs text-red-600 hover:underline"
                        >
                          {bg ? 'Изтрий' : 'Delete'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-neutral-500 font-['Manrope']">
              {bg ? 'Няма записи още.' : 'No entries yet.'}
            </p>
          )}
        </ModulePageLayout>
      </Layout>
    </>
  );
};

export default GnssFieldLogPage;
