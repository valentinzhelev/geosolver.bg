import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { captureApi } from '../../../../services/captureApi';
import {
  splitIssues, evidenceLine, fmtMeasure, fmtAngle, groupIssuesByPage, pageIssueLocation, pageIssueAddr,
} from '../../../../utils/fieldSessionView';
import { describeCaptureError } from '../../../../utils/captureView';
import CaptureImagePane from '../../Capture/CaptureImagePane';
import NotebookReview from '../../Capture/Notebook/NotebookReview';
import { BTN_PRIMARY, BTN_GHOST, IssueList, DeleteDialog, ConfirmDialog } from './SessionReviewParts';
import SessionPages from './SessionPages';

/** A page's capture job (for its review picture and the editor), fetched on demand. `job` is null while loading. */
function usePageJob(pageId, mine, bg) {
  const [state, setState] = useState({ id: '', job: null, imageUrl: '', error: '' });
  useEffect(() => {
    if (!pageId || !mine) { setState({ id: pageId, job: null, imageUrl: '', error: '' }); return undefined; }
    let cancelled = false;
    let made = '';
    setState({ id: pageId, job: null, imageUrl: '', error: '' });
    (async () => {
      try {
        const job = await captureApi.getJob(pageId);
        let imageUrl = '';
        if (job.images && job.images.review) {
          try { made = await captureApi.fetchImageObjectUrl(job.images.review); imageUrl = made; } catch { /* the image may have expired: the data is still there */ }
        }
        if (cancelled) { if (made) URL.revokeObjectURL(made); return; }
        setState({ id: pageId, job, imageUrl, error: '' });
      } catch (e) {
        if (!cancelled) setState({ id: pageId, job: null, imageUrl: '', error: describeCaptureError(e, bg) });
      }
    })();
    return () => { cancelled = true; if (made) URL.revokeObjectURL(made); };
  }, [pageId, mine, bg]);
  return state;
}

/** The merged notebook: stations in order, each observation with the page it was read from. Typed values only. */
const LogicalNotebook = ({ logical, selected, onSelect, bg }) => {
  const setups = (logical && logical.setups) || [];
  if (!setups.length) return <p className="text-sm text-neutral-500 font-['Manrope']" data-testid="logical-empty">{bg ? 'Още няма разпознати наблюдения.' : 'No recognised observations yet.'}</p>;
  return (
    <div className="flex flex-col gap-3" data-testid="logical-notebook">
      {setups.map((st) => (
        <section key={st.index} className="flex flex-col gap-1 p-3 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900" data-testid="logical-setup">
          <h4 className="text-sm font-bold font-['Manrope'] text-black dark:text-white">
            {bg ? 'Станция' : 'Station'} {st.station.point || '—'}
            {st.station.instrumentHeight && <span className="font-normal text-neutral-500"> · {bg ? 'височина' : 'height'} {fmtMeasure(st.station.instrumentHeight)}</span>}
            <span className="font-normal text-neutral-400" data-testid="logical-setup-pages"> · {st.pages.length > 1 ? (bg ? 'стр.' : 'p.') + ` ${st.pages[0]}–${st.pages[st.pages.length - 1]}` : `${bg ? 'стр.' : 'p.'} ${st.pages[0]}`}</span>
          </h4>
          <p className="text-xs text-neutral-500 dark:text-zinc-400 font-['Manrope']">
            {st.orientation && st.orientation.target
              ? `${bg ? 'Ориентир' : 'Backsight'} ${st.orientation.target}${st.orientation.direction ? ` · ${fmtAngle(st.orientation.direction)}` : ''}`
              : (bg ? 'Няма записан ориентир' : 'No backsight recorded')}
          </p>
          <ul className="flex flex-col divide-y divide-gray-100 dark:divide-zinc-800">
            {st.observations.map((o) => {
              const isSel = selected && selected.page === o.page && selected.setup === o.pageSetup && selected.row === o.pageRow;
              return (
                <li key={`${st.index}-${o.row}`}>
                  <button type="button" onClick={() => onSelect(o)} aria-pressed={!!isSel} className={`w-full min-h-[48px] py-1.5 px-1 text-left rounded-lg touch-manipulation ${isSel ? 'bg-orange-50 dark:bg-orange-950/20' : 'hover:bg-stone-50 dark:hover:bg-zinc-800'}`} data-testid="logical-row" data-page={o.page}>
                    <span className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold font-['Manrope'] text-black dark:text-white">{o.target}</span>
                      <span className="px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 text-[11px] font-semibold font-['Manrope']" data-testid="logical-row-page">{bg ? 'стр.' : 'p.'} {o.page}</span>
                    </span>
                    <span className="block text-xs text-neutral-600 dark:text-zinc-300 font-['Manrope']">{evidenceLine(o, bg)}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
};

/** The picture of the selected page, with the region of the selected observation highlighted. */
const PageImage = ({ page, selected, bg }) => {
  const { job, imageUrl, error } = usePageJob(page && page.id, page && page.mine, bg);
  if (!page) return null;
  if (!page.mine) return <p className="text-xs text-neutral-500 font-['Manrope']" data-testid="page-image-not-mine">{bg ? 'Снимката е качена от друг потребител.' : 'The photo was uploaded by another user.'}</p>;
  if (error) return <p className="text-xs text-red-600 font-['Manrope']" role="alert">{error}</p>;
  if (!job) return <p className="text-xs text-neutral-400 font-['Manrope']" role="status">{bg ? 'Зареждане на снимката...' : 'Loading the photo...'}</p>;
  const bbox = selected && selected.page === page.page ? selected.bbox : null;
  return (
    <div className="flex flex-col gap-1" data-testid="page-image">
      <span className="text-xs font-semibold font-['Manrope'] text-neutral-600 dark:text-zinc-300">{bg ? 'Страница' : 'Page'} {page.page}</span>
      <CaptureImagePane imageUrl={imageUrl} size={job.source && job.source.review} selectedBbox={bbox} bg={bg} />
    </div>
  );
};

/** One page opened in the existing notebook review (cell corrections, column mapping, row exclusion) - without its own confirm. */
const PageEditor = ({ page, pages, focus, onSelectPage, onEdited, onBack, bg }) => {
  const { job, imageUrl, error } = usePageJob(page.id, page.mine, bg);
  const idx = pages.findIndex((p) => p.id === page.id);
  return (
    <div className="flex flex-col gap-3" data-testid="page-editor">
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className={BTN_GHOST} onClick={onBack} data-testid="page-editor-back">{bg ? '← Единен преглед' : '← Unified review'}</button>
        <button type="button" className={BTN_GHOST} disabled={idx <= 0} onClick={() => onSelectPage(pages[idx - 1].id)} data-testid="page-editor-prev">{bg ? '‹ Предишна страница' : '‹ Previous page'}</button>
        <button type="button" className={BTN_GHOST} disabled={idx < 0 || idx >= pages.length - 1} onClick={() => onSelectPage(pages[idx + 1].id)} data-testid="page-editor-next">{bg ? 'Следваща страница ›' : 'Next page ›'}</button>
        <span className="text-sm font-bold font-['Manrope'] text-black dark:text-white">{bg ? 'Страница' : 'Page'} {page.page}</span>
      </div>
      {!page.mine && <p className="text-sm text-neutral-600 dark:text-zinc-300 font-['Manrope']" data-testid="page-editor-not-mine">{bg ? 'Страницата е качена от друг потребител – проверката се извършва от него.' : 'The page was uploaded by another user - they do the review.'}</p>}
      {page.mine && error && <p className="text-sm text-red-700 font-['Manrope']" role="alert">{error}</p>}
      {page.mine && !error && !job && <p className="text-xs text-neutral-400 font-['Manrope']" role="status">{bg ? 'Зареждане...' : 'Loading...'}</p>}
      {page.mine && job && job.notebook && (
        <NotebookReview key={`${job.id}:${focus ? JSON.stringify(focus) : ''}`} initialJob={job} imageUrl={imageUrl} bg={bg} embedded focus={focus} onChange={onEdited} />
      )}
      {page.mine && job && !job.notebook && <p className="text-sm text-neutral-600 dark:text-zinc-300 font-['Manrope']" data-testid="page-editor-nothing">{bg ? 'От тази страница няма разпознати данни за преглед. Заменете я с нова снимка или я премахнете.' : 'No recognised data to review on this page. Replace it with a new photo or remove it.'}</p>}
    </div>
  );
};

/**
 * Проверка of a session fed by notebook PAGES: the pages, the ONE logical notebook they make up (with the page of every
 * observation), the session-wide issues grouped by page, and the confirmation of the whole. The server's merge is the only
 * judge (it is also what the confirm re-runs): errors block here AND there.
 */
const SessionPagesReview = ({ session, projectId, busy, error, bg = true, onSessionChange, onRefresh, onConfirm, onDelete }) => {
  const pages = useMemo(() => session.pages || [], [session.pages]);
  const evaluation = session.evaluation;
  const summary = evaluation ? evaluation.summary : { pages: pages.length, setups: 0, observations: 0, errors: 0, warnings: 0, canConfirm: false };
  const { errors, warnings } = splitIssues(evaluation);
  const logicalSetups = (session.logical && session.logical.setups) || [];

  const [stage, setStage] = useState('idle'); // idle | confirm | delete
  const [selectedId, setSelectedId] = useState(pages[0] ? pages[0].id : '');
  const [mode, setMode] = useState('unified'); // unified | page
  const [focus, setFocus] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [showImage, setShowImage] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 1024);

  useEffect(() => {
    if (pages.length && !pages.some((p) => p.id === selectedId)) setSelectedId(pages[0].id);
    if (!pages.length && mode === 'page') setMode('unified');
  }, [pages, selectedId, mode]);

  const selectedPage = pages.find((p) => p.id === selectedId) || null;
  const canConfirm = !!evaluation && summary.canConfirm && !busy;
  const reason = pages.length === 0
    ? (bg ? 'Добавете поне една страница.' : 'Add at least one page.')
    : summary.errors > 0 ? (bg ? 'Поправете грешките, за да потвърдите.' : 'Fix the errors to confirm.')
      : summary.observations === 0 ? (bg ? 'Няма наблюдения за потвърждаване.' : 'There are no observations to confirm.') : '';

  const openPage = useCallback((pageId, addr = null) => { setSelectedId(pageId); setFocus(addr); setMode('page'); }, []);
  const jump = (issue) => {
    const page = pages.find((p) => p.page === issue.page) || selectedPage;
    if (page) openPage(page.id, pageIssueAddr(issue));
  };
  const selectRow = (o) => {
    const page = pages.find((p) => p.page === o.page);
    if (page) setSelectedId(page.id);
    setSelectedRow({ page: o.page, setup: o.pageSetup, row: o.pageRow, bbox: o.bbox });
  };
  const edited = useCallback(() => { if (onRefresh) onRefresh(); }, [onRefresh]);

  const tiles = [
    [bg ? 'Страници' : 'Pages', summary.pages !== undefined ? summary.pages : pages.length, ''],
    [bg ? 'Станции' : 'Stations', summary.setups, ''],
    [bg ? 'Наблюдения' : 'Observations', summary.observations, ''],
    [bg ? 'Грешки' : 'Errors', summary.errors, summary.errors ? 'text-red-700 dark:text-red-400' : ''],
    [bg ? 'Предупреждения' : 'Warnings', summary.warnings, summary.warnings ? 'text-amber-700 dark:text-amber-400' : ''],
  ];
  const locate = (i) => pageIssueLocation(i, logicalSetups, bg);
  const canJump = (i) => !!i.page && pages.some((p) => p.page === i.page && p.mine && p.state !== 'missing');
  const groups = groupIssuesByPage([...errors, ...warnings]);
  const tab = (active) => `min-h-[44px] px-4 rounded-lg text-sm font-semibold font-['Manrope'] touch-manipulation ${active ? 'bg-black dark:bg-white text-white dark:text-black' : 'bg-white dark:bg-zinc-900 outline outline-1 outline-gray-300 dark:outline-zinc-700'}`;

  return (
    <div className="flex flex-col gap-4" data-testid="session-review">
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2" data-testid="review-summary">
        {tiles.map(([label, n, tone]) => (
          <div key={label} className="p-3 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <div className={`text-xl font-bold font-['Manrope'] ${tone || 'text-black dark:text-white'}`}>{n}</div>
            <div className="text-xs text-neutral-500 font-['Manrope']">{label}</div>
          </div>
        ))}
      </div>

      <SessionPages session={session} projectId={projectId} selectedId={selectedId} onOpen={(id) => openPage(id)} onChanged={onSessionChange} onRefresh={onRefresh} disabled={busy} bg={bg} />

      {pages.length > 0 && (
        <div className="flex flex-wrap gap-2" role="tablist" aria-label={bg ? 'Изглед на прегледа' : 'Review view'}>
          <button type="button" role="tab" aria-selected={mode === 'unified'} className={tab(mode === 'unified')} onClick={() => setMode('unified')} data-testid="review-mode-unified">{bg ? 'Единен преглед' : 'Unified review'}</button>
          <button type="button" role="tab" aria-selected={mode === 'page'} className={tab(mode === 'page')} disabled={!selectedPage} onClick={() => setMode('page')} data-testid="review-mode-page">{selectedPage ? `${bg ? 'Страница' : 'Page'} ${selectedPage.page}` : (bg ? 'Страница' : 'Page')}</button>
        </div>
      )}

      {pages.length > 0 && mode === 'unified' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start" data-testid="review-unified">
          <div className="flex flex-col gap-2 lg:sticky lg:top-4">
            <button type="button" className={`${BTN_GHOST} self-start lg:hidden`} onClick={() => setShowImage(!showImage)} aria-expanded={showImage} data-testid="review-toggle-image">{showImage ? (bg ? 'Скрий снимката' : 'Hide the photo') : (bg ? 'Покажи снимката на страницата' : 'Show the page photo')}</button>
            <div className={showImage ? 'block' : 'hidden lg:block'}><PageImage page={selectedPage} selected={selectedRow} bg={bg} /></div>
          </div>
          <div className="flex flex-col gap-3 min-w-0">
            <LogicalNotebook logical={session.logical} selected={selectedRow} onSelect={selectRow} bg={bg} />
            {groups.length > 0 && (
              <div className="flex flex-col gap-3" data-testid="review-issue-groups">
                {groups.map((g) => (
                  <IssueList
                    key={g.page || 0}
                    title={g.page ? `${bg ? 'Страница' : 'Page'} ${g.page}` : (bg ? 'Цялата сесия' : 'Whole session')}
                    tone={g.issues.some((i) => i.severity === 'error') ? 'border-red-400 bg-red-50 dark:border-red-700 dark:bg-red-950/30' : 'border-amber-400 bg-amber-50 dark:border-amber-700 dark:bg-amber-950/30'}
                    symbol={g.issues.some((i) => i.severity === 'error') ? '✕' : '!'}
                    issues={g.issues} setups={logicalSetups} locate={locate} canJump={canJump} onJump={jump} bg={bg} testId="review-page-issues"
                  />
                ))}
              </div>
            )}
            {evaluation && groups.length === 0 && summary.observations > 0 && (
              <p className="text-sm text-neutral-600 dark:text-zinc-300 font-['Manrope']" data-testid="review-clean">
                {bg ? 'Проверката не откри предупреждения или грешки в обединените страници. Това не означава, че измерванията са точни – проверете ги внимателно преди потвърждение.' : 'The check found no warnings or errors in the merged pages. That does not mean the measurements are accurate - review them carefully before confirming.'}
              </p>
            )}
          </div>
        </div>
      )}

      {pages.length > 0 && mode === 'page' && selectedPage && (
        <PageEditor page={selectedPage} pages={pages} focus={focus} onSelectPage={(id) => { setSelectedId(id); setFocus(null); }} onEdited={edited} onBack={() => setMode('unified')} bg={bg} />
      )}

      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className={BTN_PRIMARY} onClick={() => setStage('confirm')} disabled={!canConfirm} data-testid="session-confirm-start">{bg ? 'Потвърди сесията' : 'Confirm the session'}</button>
        <button type="button" className={BTN_GHOST} onClick={() => setStage('delete')} disabled={busy} data-testid="session-delete">{bg ? 'Изтрий сесията' : 'Delete session'}</button>
      </div>
      {reason && <p className="text-xs text-neutral-500 font-['Manrope']" data-testid="review-confirm-reason">{reason}</p>}

      {stage === 'confirm' && (
        <ConfirmDialog
          bg={bg} busy={busy} warningCount={warnings.length}
          text={bg
            ? `Ще бъдат записани ${summary.observations} наблюдения от ${summary.setups} станции, обединени от ${summary.pages} страници, като потвърдени теренни данни. Те не могат да се променят след това – за корекции се създава ревизия. Досега нищо не е записано.`
            : `${summary.observations} observations from ${summary.setups} stations, merged from ${summary.pages} pages, will be recorded as confirmed field data. They cannot be changed afterwards - corrections are made in a revision. Nothing has been recorded so far.`}
          onGo={() => { setStage('idle'); onConfirm(); }} onCancel={() => setStage('idle')}
        />
      )}
      {stage === 'delete' && (
        <DeleteDialog
          bg={bg} busy={busy} onGo={onDelete} onCancel={() => setStage('idle')}
          text={bg ? 'Сесията ще бъде изтрита. Снимките (заснеманията) не се изтриват – те остават сред „Заснемания извън сесия“. Потвърдени сесии не могат да се изтриват.' : 'The session will be deleted. The photos (captures) are not deleted - they stay among "Captures outside a session". Confirmed sessions cannot be deleted.'}
        />
      )}
      {error && <div role="alert" className="p-3 rounded-lg bg-red-50 text-red-700 text-sm font-['Manrope']" data-testid="session-review-error">{error}</div>}
    </div>
  );
};

export default SessionPagesReview;
