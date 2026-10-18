import React, { useEffect, useRef, useState } from 'react';
import { captureApi } from '../../../../services/captureApi';
import { fieldSessionsApi } from '../../../../services/fieldSessionsApi';
import { sessionErrorMessage, pageStateBadge, pageCountsLine, movePageIds } from '../../../../utils/fieldSessionView';
import { ACCEPTED_TYPES, checkFile, describeCaptureError } from '../../../../utils/captureView';
import { BTN_GHOST, BTN_PRIMARY } from './SessionReviewParts';

const ICON_BTN = "min-w-[44px] min-h-[44px] rounded-lg text-base font-semibold font-['Manrope'] bg-white dark:bg-zinc-900 outline outline-1 outline-gray-300 dark:outline-zinc-700 disabled:opacity-30 touch-manipulation";

/** The page's small picture (the uploader's own capture only - it needs their authorization); a numbered placeholder otherwise. */
const PageThumb = ({ page, bg }) => {
  const [url, setUrl] = useState('');
  useEffect(() => {
    if (!page.mine || !page.hasImage) return undefined;
    let cancelled = false;
    let made = '';
    captureApi.fetchImageObjectUrl(`/capture/jobs/${page.id}/image/thumbnail`)
      .then((u) => { made = u; if (cancelled) URL.revokeObjectURL(u); else setUrl(u); })
      .catch(() => {});
    return () => { cancelled = true; if (made) URL.revokeObjectURL(made); };
  }, [page.id, page.mine, page.hasImage]);
  return url
    ? <img src={url} alt={`${bg ? 'Страница' : 'Page'} ${page.page}`} className="w-16 h-20 object-cover rounded-lg border border-gray-200 dark:border-zinc-700 shrink-0" data-testid="page-thumb" />
    : <div className="w-16 h-20 rounded-lg border border-dashed border-gray-300 dark:border-zinc-700 flex items-center justify-center text-lg font-bold text-neutral-400 shrink-0" aria-hidden="true" data-testid="page-thumb-placeholder">{page.page}</div>;
};

/** Picks one of the project's own notebook captures that belongs to no session yet. */
const ExistingCapturePicker = ({ projectId, onPick, onClose, busy, bg }) => {
  const [jobs, setJobs] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    let cancelled = false;
    Promise.all([captureApi.listJobs(projectId), fieldSessionsApi.list(projectId)])
      .then(([all, sessions]) => {
        if (cancelled) return;
        const attached = new Set(sessions.attachedCaptureJobIds || []);
        setJobs((all || []).filter((j) => j.mode === 'field-notebook' && j.status !== 'confirmed' && !attached.has(j.id)));
      })
      .catch((e) => { if (!cancelled) { setError(describeCaptureError(e, bg)); setJobs([]); } });
    return () => { cancelled = true; };
  }, [projectId, bg]);
  const when = (iso) => { const d = new Date(iso); return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString(bg ? 'bg-BG' : 'en-GB'); };
  return (
    <div className="flex flex-col gap-2 p-3 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900" data-testid="page-picker">
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-sm font-bold font-['Manrope'] text-black dark:text-white">{bg ? 'Заснемания, които още не са в сесия' : 'Captures that are not in a session yet'}</h4>
        <button type="button" className={BTN_GHOST} onClick={onClose} data-testid="page-picker-close">{bg ? 'Затвори' : 'Close'}</button>
      </div>
      {jobs === null && <p className="text-xs text-neutral-400 font-['Manrope']" role="status">{bg ? 'Зареждане...' : 'Loading...'}</p>}
      {error && <p className="text-xs text-red-600 font-['Manrope']" role="alert">{error}</p>}
      {jobs && jobs.length === 0 && !error && <p className="text-xs text-neutral-500 font-['Manrope']" data-testid="page-picker-empty">{bg ? 'Няма свободни заснемания на полеви карнет.' : 'There are no free field notebook captures.'}</p>}
      {jobs && jobs.length > 0 && (
        <ul className="flex flex-col divide-y divide-gray-100 dark:divide-zinc-800">
          {jobs.map((j) => (
            <li key={j.id}>
              <button type="button" disabled={busy} onClick={() => onPick(j.id)} className="w-full min-h-[48px] flex flex-wrap items-center justify-between gap-2 py-2 px-1 text-left rounded-lg hover:bg-stone-50 dark:hover:bg-zinc-800 disabled:opacity-40" data-testid="page-picker-row">
                <span className="text-sm font-medium font-['Manrope'] text-black dark:text-white">{j.originalName || (bg ? '(без име)' : '(unnamed)')}</span>
                <span className="text-[11px] text-neutral-500 font-['Manrope']">{when(j.createdAt)} · {j.status === 'failed' ? (bg ? 'не е разпозната' : 'not recognised') : `${j.rows} ${bg ? 'реда' : 'rows'}`}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

/**
 * The ordered pages of a notebook session: a card per page (number, picture, state, counts, what it continues), the page
 * actions (open, up, down, remove, replace a failed one) and "Добави страница" (upload, camera, an existing capture).
 * Every change is one call to the sessions API that returns the whole updated session; reordering never uploads or reads
 * a page again, and removing a page never deletes its capture.
 */
const SessionPages = ({ session, projectId, selectedId, onOpen, onChanged, onRefresh, disabled, bg = true }) => {
  const pages = session.pages || [];
  const ids = pages.map((p) => p.id);
  const [working, setWorking] = useState('');
  const [error, setError] = useState('');
  const [confirmRemove, setConfirmRemove] = useState('');
  const [picker, setPicker] = useState(false);
  const [replaceId, setReplaceId] = useState('');
  const fileRef = useRef(null);
  const cameraRef = useRef(null);
  const busy = disabled || !!working;

  const act = async (label, fn) => {
    setWorking(label);
    setError('');
    try {
      const view = await fn();
      if (view) onChanged(view);
      return view;
    } catch (e) {
      setError(e && e.name === 'CaptureApiError' ? describeCaptureError(e, bg) : sessionErrorMessage(e, bg));
      if (e && (e.code === 'REVISION_CONFLICT' || e.code === 'SESSION_CONFIRMED') && onRefresh) await onRefresh();
      return undefined;
    } finally {
      setWorking('');
    }
  };

  const move = (index, delta) => act('order', () => fieldSessionsApi.reorderPages(session.id, movePageIds(ids, index, delta), session.revision));
  const remove = (pageId) => act('remove', async () => {
    setConfirmRemove('');
    return fieldSessionsApi.detachPage(session.id, pageId, session.revision);
  });
  const pick = (jobId) => act('attach', async () => {
    setPicker(false);
    return fieldSessionsApi.attachPage(session.id, jobId, { baseRevision: session.revision });
  });

  const upload = (file) => {
    const problem = checkFile(file, bg);
    if (problem) { setError(problem); return Promise.resolve(); }
    const replacing = pages.find((p) => p.id === replaceId) || null;
    const at = replacing ? pages.indexOf(replacing) : undefined;
    return act('upload', async () => {
      let jobId;
      let ocrError = '';
      try {
        jobId = (await captureApi.createJob(file, projectId, 'field-notebook')).id;
      } catch (e) {
        // the photo was stored but could not be read: it is still attached, as a FAILED page the user can replace or remove
        if (e && e.jobId) { jobId = e.jobId; ocrError = describeCaptureError(e, bg); } else throw e;
      }
      let view = await fieldSessionsApi.attachPage(session.id, jobId, at !== undefined ? { position: at } : {});
      if (replacing) view = await fieldSessionsApi.detachPage(session.id, replacing.id, view.revision);
      if (ocrError) setError(ocrError);
      return view;
    }).finally(() => {
      setReplaceId('');
      if (fileRef.current) fileRef.current.value = '';
      if (cameraRef.current) cameraRef.current.value = '';
    });
  };

  const choose = (ref, replace = '') => { setReplaceId(replace); if (ref.current) ref.current.click(); };

  return (
    <section className="flex flex-col gap-3" aria-label={bg ? 'Страници на полевия карнет' : 'Field notebook pages'} data-testid="session-pages-section">
      <h3 className="text-sm font-bold font-['Manrope'] text-black dark:text-white">{bg ? 'Страници' : 'Pages'} ({pages.length})</h3>
      {pages.length === 0 && <p className="text-sm text-neutral-600 dark:text-zinc-300 font-['Manrope']" data-testid="session-pages-empty">{bg ? 'Още няма страници. Добавете първата страница от полевия карнет.' : 'There are no pages yet. Add the first page of the field notebook.'}</p>}
      {pages.length > 0 && (
        <ol className="flex flex-col gap-2 lg:grid lg:grid-cols-2 xl:grid-cols-3" data-testid="session-pages">
          {pages.map((p, i) => {
            const badge = pageStateBadge(p.state, bg);
            const selected = p.id === selectedId;
            return (
              <li key={p.id} className={`flex flex-col gap-2 p-3 rounded-xl border bg-white dark:bg-zinc-900 ${selected ? 'border-black dark:border-white' : 'border-gray-200 dark:border-zinc-800'}`} data-testid="session-page" data-page={p.page} aria-current={selected ? 'true' : undefined}>
                <div className="flex gap-3">
                  <PageThumb page={p} bg={bg} />
                  <div className="flex-1 min-w-0 flex flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold font-['Manrope'] text-black dark:text-white" data-testid="session-page-title">{bg ? 'Страница' : 'Page'} {p.page}</span>
                      <span className={`px-2 py-0.5 rounded-md border text-xs font-semibold font-['Manrope'] ${badge.tone}`} data-testid="session-page-state">{badge.text}</span>
                    </div>
                    {p.state === 'ready' && <span className="text-xs text-neutral-600 dark:text-zinc-300 font-['Manrope']" data-testid="session-page-counts">{pageCountsLine(p, bg)}</span>}
                    {p.continuesStation && <span className="text-xs text-neutral-500 dark:text-zinc-400 font-['Manrope']" data-testid="session-page-continues">{bg ? 'Продължава станция' : 'Continues station'} {p.continuesStation}</span>}
                    {p.repeatsStation && <span className="text-xs text-neutral-500 dark:text-zinc-400 font-['Manrope']" data-testid="session-page-repeats">{bg ? 'Повтаря заглавието на станция' : 'Repeats the heading of station'} {p.repeatsStation}</span>}
                    {p.state === 'failed' && <span className="text-xs text-red-700 dark:text-red-400 font-['Manrope']" data-testid="session-page-failed">{bg ? 'Страницата не беше разпозната. Заменете я с нова снимка (включете заглавния ред на таблицата) или я премахнете.' : 'The page was not recognised. Replace it with a new photo (include the table header row) or remove it.'}</span>}
                    {!p.mine && <span className="text-xs text-neutral-500 font-['Manrope']" data-testid="session-page-not-mine">{bg ? 'Качена от друг потребител – проверката се извършва от него.' : 'Uploaded by another user - they do the review.'}</span>}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {p.mine && p.state !== 'missing' && <button type="button" className={BTN_GHOST} disabled={busy} onClick={() => onOpen(p.id)} data-testid="session-page-open">{bg ? 'Отвори' : 'Open'}</button>}
                  {p.state === 'failed' && <button type="button" className={BTN_GHOST} disabled={busy} onClick={() => choose(fileRef, p.id)} data-testid="session-page-replace">{bg ? 'Замени' : 'Replace'}</button>}
                  <button type="button" className={ICON_BTN} disabled={busy || i === 0} onClick={() => move(i, -1)} aria-label={bg ? `Премести страница ${p.page} нагоре` : `Move page ${p.page} up`} data-testid="session-page-up">↑</button>
                  <button type="button" className={ICON_BTN} disabled={busy || i === pages.length - 1} onClick={() => move(i, 1)} aria-label={bg ? `Премести страница ${p.page} надолу` : `Move page ${p.page} down`} data-testid="session-page-down">↓</button>
                  <button type="button" className={BTN_GHOST} disabled={busy} onClick={() => setConfirmRemove(confirmRemove === p.id ? '' : p.id)} data-testid="session-page-remove">{bg ? 'Премахни' : 'Remove'}</button>
                </div>
                {confirmRemove === p.id && (
                  <div className="flex flex-col gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/20 outline outline-1 outline-red-200 dark:outline-red-900/50" role="alertdialog" aria-label={bg ? 'Премахване на страница' : 'Remove page'} data-testid="session-page-remove-dialog">
                    <p className="text-sm font-['Manrope'] text-black dark:text-white">{bg ? `Страница ${p.page} ще бъде премахната от сесията. Снимката (заснемането) не се изтрива.` : `Page ${p.page} will be removed from the session. The photo (capture) is not deleted.`}</p>
                    <div className="flex flex-wrap gap-2">
                      <button type="button" className={BTN_GHOST} disabled={busy} onClick={() => remove(p.id)} data-testid="session-page-remove-go">{bg ? 'Премахни' : 'Remove'}</button>
                      <button type="button" className={BTN_GHOST} onClick={() => setConfirmRemove('')}>{bg ? 'Отказ' : 'Cancel'}</button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      )}

      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2" data-testid="session-page-add">
        <button type="button" className={BTN_PRIMARY} disabled={busy} onClick={() => choose(fileRef)} data-testid="session-page-upload">{working === 'upload' ? (bg ? 'Разпознаване на страницата…' : 'Recognising the page…') : (bg ? 'Добави страница – качи снимка' : 'Add a page - upload a photo')}</button>
        <button type="button" className={BTN_GHOST} disabled={busy} onClick={() => choose(cameraRef)} data-testid="session-page-camera">{bg ? 'Снимай с камерата' : 'Use the camera'}</button>
        <button type="button" className={BTN_GHOST} disabled={busy} onClick={() => setPicker(!picker)} data-testid="session-page-existing">{bg ? 'Добави съществуващо заснемане' : 'Add an existing capture'}</button>
      </div>
      <p className="text-xs text-neutral-500 dark:text-zinc-400 font-['Manrope']">{bg ? 'JPG, PNG или WebP до 8 MB. Всяка страница се разпознава поотделно; ако страницата продължава станция, включете заглавния ред на таблицата.' : 'JPG, PNG or WebP up to 8 MB. Each page is recognised on its own; if a page continues a station, include the table header row.'}</p>
      <input ref={fileRef} type="file" accept={ACCEPTED_TYPES} className="hidden" onChange={(e) => e.target.files && e.target.files[0] && upload(e.target.files[0])} data-testid="page-file-input" />
      <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => e.target.files && e.target.files[0] && upload(e.target.files[0])} data-testid="page-camera-input" />
      {picker && <ExistingCapturePicker projectId={projectId} busy={busy} bg={bg} onPick={pick} onClose={() => setPicker(false)} />}
      {error && <div role="alert" className="p-3 rounded-lg bg-red-50 text-red-700 text-sm font-['Manrope']" data-testid="session-pages-error">{error}</div>}
    </section>
  );
};

export default SessionPages;
