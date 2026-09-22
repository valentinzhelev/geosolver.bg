import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Layout from '../../layout/Layout';
import SEO from '../../shared/SEO';
import { useTranslation } from '../../../hooks/useTranslation';
import { useProScan } from '../../../hooks/useProScan';
import { captureApi } from '../../../services/captureApi';
import { ACCEPTED_TYPES, checkFile, describeCaptureError } from '../../../utils/captureView';
import CaptureReview from './CaptureReview';
import NotebookReview from './Notebook/NotebookReview';
import CaptureHistory from './CaptureHistory';

/**
 * Capture: project -> photo / scan -> reconstructed draft -> review -> explicit confirmation. Two modes since V2.3:
 * coordinate-table (-> SurveyPoints) and field-notebook (-> a FieldObservationSet, never SurveyPoints/a calculation).
 * A first-class workspace page reached from a project.
 */
const CapturePage = () => {
  const { language } = useTranslation();
  const bg = language === 'bg';
  const { isProUser, proScanMessage } = useProScan(language);
  const [params, setParams] = useSearchParams();
  const projectId = params.get('projectId') || '';
  const jobId = params.get('jobId') || '';

  const [job, setJob] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [phase, setPhase] = useState('idle'); // idle | uploading | loading | ready
  const [error, setError] = useState('');
  const [historyRefresh, setHistoryRefresh] = useState(0);
  const [mode, setMode] = useState('coordinate-table'); // the mode chosen on the upload screen, before a job exists
  const fileRef = useRef(null);
  const cameraRef = useRef(null);

  const showJob = useCallback(async (data) => {
    setJob(data);
    setPhase('ready');
    if (data.images && data.images.review) {
      try { setImageUrl(await captureApi.fetchImageObjectUrl(data.images.review)); } catch { setImageUrl(''); }
    }
  }, []);

  // reopen a job from the URL (reload / link)
  useEffect(() => {
    if (!jobId || job || phase === 'uploading') return undefined;
    let cancelled = false;
    setPhase('loading');
    captureApi.getJob(jobId)
      .then((data) => { if (!cancelled) showJob(data); })
      .catch((e) => { if (!cancelled) { setError(describeCaptureError(e, bg)); setPhase('idle'); } });
    return () => { cancelled = true; };
  }, [jobId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => { if (imageUrl) URL.revokeObjectURL(imageUrl); }, [imageUrl]);

  const handleFile = async (file) => {
    const problem = checkFile(file, bg);
    if (problem) { setError(problem); return; }
    setError('');
    setPhase('uploading');
    try {
      const data = await captureApi.createJob(file, projectId, mode);
      setParams({ projectId, jobId: data.id }, { replace: true });
      await showJob(data);
      setHistoryRefresh((n) => n + 1);
    } catch (e) {
      setError(describeCaptureError(e, bg));
      setPhase('idle');
    } finally {
      if (fileRef.current) fileRef.current.value = '';
      if (cameraRef.current) cameraRef.current.value = '';
    }
  };

  const restart = () => {
    setJob(null);
    setImageUrl('');
    setPhase('idle');
    setError('');
    setParams({ projectId }, { replace: true });
  };

  const openHistoryJob = (id) => {
    setJob(null);
    setImageUrl('');
    setError('');
    setParams({ projectId, jobId: id }, { replace: true });
  };

  const primary = "px-4 py-2 rounded-lg text-sm font-semibold font-['Manrope'] bg-black dark:bg-white text-white dark:text-black disabled:opacity-50";
  const ghost = "px-4 py-2 rounded-lg text-sm font-medium font-['Manrope'] bg-white dark:bg-zinc-900 outline outline-1 outline-gray-200 dark:outline-zinc-700";

  let body;
  if (!isProUser) {
    body = (
      <div className="p-6 rounded-xl bg-white dark:bg-zinc-900 outline outline-1 outline-gray-200 dark:outline-zinc-800 flex flex-col gap-3" data-testid="capture-pro-gate">
        <p className="text-sm font-['Manrope'] text-black dark:text-white">
          {bg ? 'Сканирането на таблици е функция на Pro плана.' : 'Table capture is a Pro plan feature.'}
        </p>
        <p className="text-xs text-neutral-500 font-['Manrope']">{proScanMessage}</p>
        <Link to="/prices" className={`${primary} self-start`}>{bg ? 'Виж плановете' : 'See plans'}</Link>
      </div>
    );
  } else if (!projectId) {
    body = (
      <div className="p-6 rounded-xl bg-white dark:bg-zinc-900 outline outline-1 outline-gray-200 dark:outline-zinc-800 flex flex-col gap-3" data-testid="capture-no-project">
        <p className="text-sm font-['Manrope'] text-black dark:text-white">{bg ? 'Сканирането е към проект. Изберете проект.' : 'Capture belongs to a project. Choose a project.'}</p>
        <Link to="/projects" className={`${primary} self-start`}>{bg ? 'Към проектите' : 'Go to projects'}</Link>
      </div>
    );
  } else if (job) {
    const points = job.mode === 'field-notebook'
      ? null
      : <Link to={`/points?projectId=${projectId}`} className={ghost}>{bg ? 'Точки на проекта' : 'Project points'}</Link>;
    body = (
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          <button type="button" className={ghost} onClick={restart}>{bg ? 'Ново сканиране' : 'New capture'}</button>
          {points}
        </div>
        {job.mode === 'field-notebook'
          ? <NotebookReview key={job.id} initialJob={job} imageUrl={imageUrl} bg={bg} />
          : <CaptureReview key={job.id} initialJob={job} imageUrl={imageUrl} bg={bg} />}
      </div>
    );
  } else {
    const modeBtn = (value, bgLabel, enLabel) => (
      <button
        type="button" role="tab" aria-selected={mode === value}
        onClick={() => setMode(value)}
        className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-['Manrope'] ${mode === value ? 'bg-black dark:bg-white text-white dark:text-black' : 'bg-white dark:bg-zinc-900 outline outline-1 outline-gray-200 dark:outline-zinc-700'}`}
        data-testid={`capture-mode-${value}`}
      >
        {bg ? bgLabel : enLabel}
      </button>
    );
    body = (
      <div className="flex flex-col gap-4">
        <div className="p-5 md:p-6 rounded-xl bg-white dark:bg-zinc-900 outline outline-1 outline-gray-200 dark:outline-zinc-800 flex flex-col gap-4" data-testid="capture-upload">
          <div className="flex gap-1.5" role="tablist" aria-label={bg ? 'Вид сканиране' : 'Capture type'}>
            {modeBtn('coordinate-table', 'Таблица с координати', 'Coordinate table')}
            {modeBtn('field-notebook', 'Полева книжка', 'Field notebook')}
          </div>
          {mode === 'field-notebook' ? (
            <div>
              <h2 className="text-lg font-bold font-['Manrope'] text-black dark:text-white">{bg ? 'Полева книжка' : 'Field notebook'}</h2>
              <p className="text-sm text-neutral-500 dark:text-zinc-400 font-['Manrope'] mt-1">
                {bg
                  ? 'Качете снимка или скан на страница от полева книжка (станция, ориентир, наблюдения: Hz, V, разстояние, височина на призма). Разпознатото е само чернова: не се създават точки, нито се изчислява каквото и да било, преди да го потвърдите.'
                  : 'Upload a photo or scan of a field notebook page (station, backsight, observations: Hz, V, distance, prism height). What is recognised is only a draft: no points are created and nothing is calculated before you confirm it.'}
              </p>
              <p className="text-xs text-neutral-400 font-['Manrope'] mt-2">{bg ? 'JPG, PNG или WebP до 8 MB.' : 'JPG, PNG or WebP up to 8 MB.'}</p>
            </div>
          ) : (
            <div>
              <h2 className="text-lg font-bold font-['Manrope'] text-black dark:text-white">{bg ? 'Таблица с координати' : 'Coordinate table'}</h2>
              <p className="text-sm text-neutral-500 dark:text-zinc-400 font-['Manrope'] mt-1">
                {bg
                  ? 'Качете снимка или скан на печатна таблица (Точка, Код, X, Y, H, Бележки). Разпознатото е само чернова: проверявате го и го потвърждавате, преди да стане част от проекта.'
                  : 'Upload a photo or scan of a printed table (Point, Code, X, Y, H, Notes). What is recognised is only a draft: you review and confirm it before it becomes part of the project.'}
              </p>
              <p className="text-xs text-neutral-400 font-['Manrope'] mt-2">{bg ? 'JPG, PNG или WebP до 8 MB. X е север, Y е изток.' : 'JPG, PNG or WebP up to 8 MB. X is Northing, Y is Easting.'}</p>
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            <button type="button" className={primary} disabled={phase === 'uploading' || phase === 'loading'} onClick={() => fileRef.current && fileRef.current.click()}>
              {phase === 'uploading' ? (bg ? 'Обработване...' : 'Processing...') : bg ? 'Избери снимка' : 'Choose image'}
            </button>
            <button type="button" className={ghost} disabled={phase === 'uploading'} onClick={() => cameraRef.current && cameraRef.current.click()}>
              {bg ? 'Снимай с камерата' : 'Use camera'}
            </button>
          </div>
          <input ref={fileRef} type="file" accept={ACCEPTED_TYPES} className="hidden" onChange={(e) => e.target.files && e.target.files[0] && handleFile(e.target.files[0])} data-testid="capture-file-input" />
          <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => e.target.files && e.target.files[0] && handleFile(e.target.files[0])} />
          {(phase === 'uploading' || phase === 'loading') && (
            <p className="text-sm text-neutral-500 font-['Manrope']" role="status">{phase === 'uploading' ? (bg ? 'Разпознаване на таблицата...' : 'Recognising the table...') : (bg ? 'Зареждане...' : 'Loading...')}</p>
          )}
        </div>
        <CaptureHistory projectId={projectId} refreshKey={historyRefresh} onOpen={openHistoryJob} bg={bg} />
      </div>
    );
  }

  return (
    <>
      <SEO title={bg ? 'Сканиране – GeoSolver' : 'Capture – GeoSolver'} description={bg ? 'Импорт на координатни таблици и полеви книжки от снимка' : 'Import coordinate tables and field notebooks from a photo'} canonical="/capture" />
      <Layout>
        <div className="w-full max-w-[1400px] mx-auto px-4 py-6 md:py-10 flex flex-col gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold font-['Manrope'] text-black dark:text-white">{bg ? 'Сканиране' : 'Capture'}</h1>
            <p className="text-sm text-neutral-500 dark:text-zinc-400 font-['Manrope'] mt-1">
              {bg ? 'Снимка → разпознаване → проверка → потвърждение' : 'Photo → recognition → review → confirmation'}
            </p>
          </div>
          {error && <div role="alert" className="p-3 rounded-lg bg-red-50 text-red-700 text-sm font-['Manrope']">{error}</div>}
          {body}
        </div>
      </Layout>
    </>
  );
};

export default CapturePage;
