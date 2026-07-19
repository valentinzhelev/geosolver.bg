import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../../layout/Layout';
import SEO from '../../shared/SEO';
import { useTranslation } from '../../../hooks/useTranslation';
import CalculationService from '../../../services/calculationService';
import { getToolLabel, getToolPath, toolFilterOptions } from '../../../config/calculationTools';
import { formatCalcPayload, setCalculationRestore } from '../../../utils/calculationRestore';

const selectClass =
  "px-3 py-2 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm font-['Manrope'] text-black dark:text-white outline-none";
const btnPrimary =
  "px-4 py-2.5 bg-black dark:bg-white text-white dark:text-black rounded-lg text-sm font-semibold font-['Manrope'] disabled:opacity-50";
const btnGhost =
  "px-4 py-2.5 rounded-lg outline outline-1 outline-gray-200 dark:outline-zinc-700 text-sm font-semibold font-['Manrope'] disabled:opacity-50";

const PAGE_SIZE = 15;

const CalculationHistoryPage = () => {
  const { language } = useTranslation();
  const bg = language === 'bg';
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [toolFilter, setToolFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [limits, setLimits] = useState(null);
  const [copied, setCopied] = useState(false);

  const loadList = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await CalculationService.getCalculationHistory(page, PAGE_SIZE, toolFilter || null);
      setItems(data.calculations || []);
      setTotalPages(data.pagination?.total || 1);
      setTotalItems(data.pagination?.totalItems || 0);
    } catch (e) {
      setError(e.message);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [page, toolFilter]);

  useEffect(() => {
    loadList();
  }, [loadList]);

  useEffect(() => {
    CalculationService.getCalculationStats().then(setStats).catch(() => {});
    CalculationService.checkLimits().then(setLimits).catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      return;
    }
    setDetailLoading(true);
    CalculationService.getCalculationById(selectedId)
      .then(setDetail)
      .catch((e) => setError(e.message))
      .finally(() => setDetailLoading(false));
  }, [selectedId]);

  useEffect(() => {
    setPage(1);
  }, [toolFilter]);

  const topTools = useMemo(() => {
    if (!stats?.calculationsByTool?.length) return [];
    return stats.calculationsByTool.slice(0, 5);
  }, [stats]);

  const repeatCalculation = () => {
    if (!detail) return;
    setCalculationRestore(detail.toolName, detail.inputData);
    navigate(getToolPath(detail.toolName));
  };

  const copyInput = async () => {
    if (!detail?.inputData) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(detail.inputData, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  const formatDate = (iso) => {
    try {
      return new Date(iso).toLocaleString(bg ? 'bg-BG' : 'en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '—';
    }
  };

  return (
    <>
      <SEO
        title={bg ? 'История на изчисления – GeoSolver' : 'Calculation history – GeoSolver'}
        description={bg ? 'Преглед и повторно ползване на минали геодезически изчисления' : 'Review and reuse past geodetic calculations'}
        canonical="/calculations/history"
      />
      <Layout>
        <div className="w-full bg-stone-50 dark:bg-zinc-950 min-h-screen py-8 md:py-12">
          <div className="max-w-6xl mx-auto px-4 flex flex-col gap-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold font-['Manrope'] text-black dark:text-white">
                  {bg ? 'История на изчисления' : 'Calculation history'}
                </h1>
                <p className="mt-2 text-sm text-neutral-500 dark:text-zinc-400 font-['Manrope'] max-w-xl">
                  {bg
                    ? 'Всички запазени изчисления от калкулаторите. Избери запис за детайли и „Повтори“ за попълване на входа.'
                    : 'All saved calculator runs. Select a record for details and use Repeat to restore inputs.'}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link to="/tools" className={btnGhost}>{bg ? 'Калкулатори' : 'Tools'}</Link>
                <Link to="/account" className={btnGhost}>{bg ? 'Акаунт' : 'Account'}</Link>
              </div>
            </div>

            {(limits || stats) && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard label={bg ? 'Общо' : 'Total'} value={stats?.totalCalculations ?? '—'} />
                <StatCard label={bg ? 'Този месец' : 'This month'} value={stats?.monthlyCalculations ?? '—'} />
                <StatCard
                  label={bg ? 'Лимит' : 'Limit'}
                  value={
                    limits?.unlimited
                      ? '∞'
                      : limits
                        ? `${limits.used ?? 0}/${limits.limit > 0 ? limits.limit : 5}`
                        : '—'
                  }
                />
                <StatCard label={bg ? 'В списъка' : 'Filtered'} value={totalItems} />
              </div>
            )}

            {topTools.length > 0 && (
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-xs font-semibold uppercase tracking-wide text-neutral-400 font-['Manrope']">
                  {bg ? 'Топ инструменти' : 'Top tools'}
                </span>
                {topTools.map((t) => (
                  <button
                    key={t._id}
                    type="button"
                    onClick={() => setToolFilter(t._id)}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium font-['Manrope'] bg-white dark:bg-zinc-900 outline outline-1 outline-gray-200 dark:outline-zinc-700"
                  >
                    {getToolLabel(t._id, language)} · {t.count}
                  </button>
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-2 items-center">
              <select className={selectClass} value={toolFilter} onChange={(e) => setToolFilter(e.target.value)}>
                {toolFilterOptions(language).map((o) => (
                  <option key={o.value || 'all'} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-700 text-sm font-['Manrope']">{error}</div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4">
              <div className="bg-white dark:bg-zinc-900 rounded-xl outline outline-1 outline-gray-200 dark:outline-zinc-800 overflow-hidden">
                {loading ? (
                  <div className="p-12 text-center text-neutral-500 font-['Manrope']">{bg ? 'Зареждане...' : 'Loading...'}</div>
                ) : !items.length ? (
                  <div className="p-12 text-center text-neutral-500 font-['Manrope']">
                    {bg ? 'Няма записи за избрания филтър.' : 'No records for this filter.'}
                    <div className="mt-4">
                      <Link to="/tools" className={btnPrimary}>{bg ? 'Към калкулатори' : 'Go to tools'}</Link>
                    </div>
                  </div>
                ) : (
                  <table className="w-full text-sm font-['Manrope']">
                    <thead className="bg-stone-50 dark:bg-zinc-800/80 text-left text-neutral-500">
                      <tr>
                        <th className="px-4 py-3">{bg ? 'Инструмент' : 'Tool'}</th>
                        <th className="px-4 py-3 hidden sm:table-cell">{bg ? 'Дата' : 'Date'}</th>
                        <th className="px-4 py-3 hidden md:table-cell">ms</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((row) => {
                        const active = selectedId === row._id;
                        const label =
                          row.toolDisplayName?.[bg ? 'bg' : 'en'] ||
                          getToolLabel(row.toolName, language, row.toolDisplayName);
                        return (
                          <tr
                            key={row._id}
                            onClick={() => setSelectedId(row._id)}
                            className={`border-t border-gray-100 dark:border-zinc-800 cursor-pointer transition-colors ${
                              active ? 'bg-stone-50 dark:bg-zinc-800/60' : 'hover:bg-stone-50/80 dark:hover:bg-zinc-800/40'
                            }`}
                          >
                            <td className="px-4 py-3 font-medium text-black dark:text-white">{label}</td>
                            <td className="px-4 py-3 text-neutral-500 hidden sm:table-cell tabular-nums">{formatDate(row.createdAt)}</td>
                            <td className="px-4 py-3 text-neutral-400 hidden md:table-cell tabular-nums">
                              {row.calculationTime != null ? Math.round(row.calculationTime) : '—'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 p-4 border-t border-gray-100 dark:border-zinc-800">
                    <button type="button" className={btnGhost} disabled={page <= 1 || loading} onClick={() => setPage((p) => p - 1)}>
                      {bg ? 'Назад' : 'Prev'}
                    </button>
                    <span className="text-sm text-neutral-500 font-['Manrope']">{page} / {totalPages}</span>
                    <button type="button" className={btnGhost} disabled={page >= totalPages || loading} onClick={() => setPage((p) => p + 1)}>
                      {bg ? 'Напред' : 'Next'}
                    </button>
                  </div>
                )}
              </div>

              <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl outline outline-1 outline-gray-200 dark:outline-zinc-800 h-fit lg:sticky lg:top-24">
                <h2 className="text-sm font-semibold font-['Manrope'] text-black dark:text-white mb-3">
                  {bg ? 'Детайли' : 'Details'}
                </h2>
                {!selectedId ? (
                  <p className="text-sm text-neutral-500 font-['Manrope']">{bg ? 'Избери ред от таблицата.' : 'Select a row from the table.'}</p>
                ) : detailLoading ? (
                  <p className="text-sm text-neutral-500 font-['Manrope']">{bg ? 'Зареждане...' : 'Loading...'}</p>
                ) : detail ? (
                  <div className="flex flex-col gap-4">
                    <div>
                      <div className="text-xs text-neutral-400 uppercase tracking-wide mb-1">{bg ? 'Инструмент' : 'Tool'}</div>
                      <div className="font-semibold text-black dark:text-white">
                        {detail.toolDisplayName?.[bg ? 'bg' : 'en'] || getToolLabel(detail.toolName, language)}
                      </div>
                      <div className="text-xs text-neutral-500 mt-1">{formatDate(detail.createdAt)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-neutral-400 uppercase tracking-wide mb-1">{bg ? 'Вход' : 'Input'}</div>
                      <pre className="text-xs font-mono whitespace-pre-wrap p-3 rounded-lg bg-stone-50 dark:bg-zinc-800 text-neutral-700 dark:text-zinc-300 max-h-40 overflow-auto">
                        {formatCalcPayload(detail.inputData)}
                      </pre>
                    </div>
                    <div>
                      <div className="text-xs text-neutral-400 uppercase tracking-wide mb-1">{bg ? 'Резултат' : 'Result'}</div>
                      <pre className="text-xs font-mono whitespace-pre-wrap p-3 rounded-lg bg-stone-50 dark:bg-zinc-800 text-neutral-700 dark:text-zinc-300 max-h-40 overflow-auto">
                        {formatCalcPayload(detail.resultData)}
                      </pre>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button type="button" className={btnPrimary} onClick={repeatCalculation}>
                        {bg ? 'Повтори' : 'Repeat'}
                      </button>
                      <button type="button" className={btnGhost} onClick={copyInput}>
                        {copied ? (bg ? 'Копирано' : 'Copied') : (bg ? 'Копирай вход' : 'Copy input')}
                      </button>
                      <Link to={getToolPath(detail.toolName)} className={btnGhost}>
                        {bg ? 'Инструмент' : 'Open tool'}
                      </Link>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

const StatCard = ({ label, value }) => (
  <div className="p-4 bg-white dark:bg-zinc-900 rounded-xl outline outline-1 outline-gray-200 dark:outline-zinc-800">
    <div className="text-[10px] uppercase tracking-wide text-neutral-400 font-['Manrope']">{label}</div>
    <div className="text-xl font-bold text-black dark:text-white font-['Manrope'] mt-1">{value}</div>
  </div>
);

export default CalculationHistoryPage;
