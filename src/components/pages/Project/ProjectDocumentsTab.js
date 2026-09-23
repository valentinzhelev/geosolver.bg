import React, { useCallback, useEffect, useState } from 'react';
import { reportsApi } from '../../../services/reportsApi';
import { reportTypeLabel, sourceTypeLabel, fmtFileSize, fmtGeneratedAt } from '../../../utils/reportLabels';

/** Fetches the PDF (with auth), then triggers a real browser download via a throwaway <a download>. */
async function downloadReport(report) {
  const url = await reportsApi.getFileObjectUrl(report.id);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${report.title.replace(/[^\wЀ-ӿ]+/g, '_')}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

/**
 * V2.5 "Документи": every generated professional report for the project, newest first. Polar/traverse reports are
 * generated from a specific historical run on the Processing tab ("Генерирай отчет"); this tab also offers direct
 * generation of a Project Coordinate List, since that report has no single source run to pick from.
 */
const ProjectDocumentsTab = ({ projectId, bg = true }) => {
  const [reports, setReports] = useState(null); // null = loading
  const [error, setError] = useState('');
  const [generating, setGenerating] = useState(false);
  const [downloadingId, setDownloadingId] = useState('');

  const load = useCallback(() => {
    if (!projectId) return undefined;
    let cancelled = false;
    setError('');
    reportsApi.listReports(projectId)
      .then((data) => { if (!cancelled) setReports(data || []); })
      .catch((e) => { if (!cancelled) { setError(e.message); setReports([]); } });
    return () => { cancelled = true; };
  }, [projectId]);

  useEffect(() => { load(); }, [load]);

  const generateCoordinateList = async () => {
    setGenerating(true);
    setError('');
    try {
      const created = await reportsApi.createReport({ reportType: 'PROJECT_COORDINATE_LIST', projectId });
      setReports((prev) => [created, ...(prev || [])]);
    } catch (e) {
      setError(e.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = async (report) => {
    setDownloadingId(report.id);
    try {
      await downloadReport(report);
    } catch (e) {
      setError(e.message);
    } finally {
      setDownloadingId('');
    }
  };

  const primary = "px-4 py-2 rounded-lg text-sm font-semibold font-['Manrope'] bg-black dark:bg-white text-white dark:text-black disabled:opacity-40 disabled:cursor-not-allowed";
  const ghost = "px-3 py-1.5 rounded-lg text-xs font-semibold font-['Manrope'] bg-white dark:bg-zinc-900 outline outline-1 outline-gray-200 dark:outline-zinc-700 disabled:opacity-40";

  return (
    <div className="flex flex-col gap-3" data-testid="project-documents-tab">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <h2 className="text-sm font-bold font-['Manrope'] text-black dark:text-white">{bg ? 'Документи' : 'Documents'}</h2>
          <p className="text-xs text-neutral-500 dark:text-zinc-400 font-['Manrope']">
            {bg
              ? 'Генерираните професионални отчети за проекта. Отчетите за обработка се генерират от раздел „Обработки“.'
              : 'Generated professional reports for this project. Processing reports are generated from the "Processing" section.'}
          </p>
        </div>
        <button type="button" className={primary} disabled={generating} onClick={generateCoordinateList} data-testid="documents-generate-coordinate-list">
          {generating ? (bg ? 'Генериране...' : 'Generating...') : (bg ? 'Генерирай координатен регистър' : 'Generate coordinate list')}
        </button>
      </div>

      {error && <div role="alert" className="p-3 rounded-lg bg-red-50 text-red-700 text-sm font-['Manrope']">{error}</div>}
      {reports === null && <p className="text-xs text-neutral-400 font-['Manrope']" role="status">{bg ? 'Зареждане...' : 'Loading...'}</p>}
      {reports && reports.length === 0 && !error && (
        <p className="text-xs text-neutral-400 font-['Manrope']" data-testid="project-documents-empty">
          {bg ? 'Още няма генерирани отчети.' : 'No generated reports yet.'}
        </p>
      )}

      {reports && reports.length > 0 && (
        <>
          {/* Desktop: table-like list. Mobile: stacked cards - both driven by the same data, no squeezed table. */}
          <div className="hidden md:block overflow-auto rounded-xl border border-gray-200 dark:border-zinc-800">
            <table className="min-w-full text-left border-collapse text-xs">
              <thead className="bg-stone-50 dark:bg-zinc-800">
                <tr>
                  {[bg ? 'Название' : 'Title', bg ? 'Тип' : 'Type', bg ? 'Източник' : 'Source', bg ? 'Генериран' : 'Generated', bg ? 'От' : 'By', bg ? 'Размер' : 'Size', ''].map((h) => (
                    <th key={h} className="p-2 font-semibold text-neutral-600 dark:text-zinc-300 font-['Manrope']">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reports.map((r) => (
                  <tr key={r.id} className="border-t border-gray-100 dark:border-zinc-800" data-testid="document-row">
                    <td className="p-2 font-medium text-black dark:text-white">{r.title}</td>
                    <td className="p-2">{reportTypeLabel(r.reportType, bg)}</td>
                    <td className="p-2 text-neutral-500 dark:text-zinc-400">{sourceTypeLabel(r.sourceType, bg)}</td>
                    <td className="p-2">{fmtGeneratedAt(r.generatedAt, bg)}</td>
                    <td className="p-2 text-neutral-500 dark:text-zinc-400">{r.generatedBy && r.generatedBy.name}</td>
                    <td className="p-2 font-mono">{fmtFileSize(r.fileSize)}</td>
                    <td className="p-2">
                      <button type="button" className={ghost} disabled={downloadingId === r.id} onClick={() => handleDownload(r)} data-testid="document-download">
                        {downloadingId === r.id ? '...' : (bg ? 'Изтегли' : 'Download')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden flex flex-col gap-2">
            {reports.map((r) => (
              <div key={r.id} className="p-3 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col gap-1" data-testid="document-card">
                <span className="text-sm font-semibold font-['Manrope'] text-black dark:text-white">{r.title}</span>
                <span className="text-xs text-neutral-500 dark:text-zinc-400 font-['Manrope']">{reportTypeLabel(r.reportType, bg)} · {sourceTypeLabel(r.sourceType, bg)}</span>
                <span className="text-[11px] text-neutral-400 font-['Manrope']">{fmtGeneratedAt(r.generatedAt, bg)} · {r.generatedBy && r.generatedBy.name} · {fmtFileSize(r.fileSize)}</span>
                <button type="button" className={`${ghost} self-start mt-1`} disabled={downloadingId === r.id} onClick={() => handleDownload(r)} data-testid="document-download">
                  {downloadingId === r.id ? '...' : (bg ? 'Изтегли' : 'Download')}
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ProjectDocumentsTab;
