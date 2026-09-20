import React, { useEffect, useRef, useState } from 'react';
import { bboxToPercent } from '../../../utils/captureView';

const ZOOMS = [0.5, 0.75, 1, 1.5, 2, 3, 4];

/**
 * The original (review-size) image with zoom, scroll-to-pan and an overlay that highlights the source region of the
 * selected cell. The overlay is positioned in percentages of the review image, so it stays exact at every zoom.
 */
const CaptureImagePane = ({ imageUrl, size, selectedBbox, bg = true, className = '' }) => {
  const [zoomIndex, setZoomIndex] = useState(2);
  const zoom = ZOOMS[zoomIndex];
  const scrollRef = useRef(null);
  const highlight = bboxToPercent(selectedBbox, size);

  // bring the selected region into view (the image can be larger than the pane)
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || !highlight || typeof el.scrollTo !== 'function') return;
    const inner = el.firstElementChild;
    if (!inner) return;
    const left = (highlight.left / 100) * inner.clientWidth - el.clientWidth / 3;
    const top = (highlight.top / 100) * inner.clientHeight - el.clientHeight / 3;
    el.scrollTo({ left: Math.max(0, left), top: Math.max(0, top), behavior: 'smooth' });
  }, [highlight && highlight.left, highlight && highlight.top]); // eslint-disable-line react-hooks/exhaustive-deps

  const btn = "px-2.5 py-1 rounded-lg text-xs font-semibold font-['Manrope'] bg-white dark:bg-zinc-900 outline outline-1 outline-gray-200 dark:outline-zinc-700 disabled:opacity-40";

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex items-center gap-2" role="toolbar" aria-label={bg ? 'Мащаб на изображението' : 'Image zoom'}>
        <button type="button" className={btn} onClick={() => setZoomIndex((i) => Math.max(0, i - 1))} disabled={zoomIndex === 0} aria-label={bg ? 'Намали' : 'Zoom out'}>−</button>
        <span className="text-xs tabular-nums text-neutral-500 font-['Manrope'] w-12 text-center" data-testid="capture-zoom">{Math.round(zoom * 100)}%</span>
        <button type="button" className={btn} onClick={() => setZoomIndex((i) => Math.min(ZOOMS.length - 1, i + 1))} disabled={zoomIndex === ZOOMS.length - 1} aria-label={bg ? 'Увеличи' : 'Zoom in'}>+</button>
        <button type="button" className={btn} onClick={() => setZoomIndex(2)}>{bg ? 'Побери' : 'Fit'}</button>
      </div>
      <div ref={scrollRef} className="relative overflow-auto rounded-xl border border-gray-200 dark:border-zinc-700 bg-stone-100 dark:bg-zinc-900 max-h-[70vh]">
        <div style={{ width: `${zoom * 100}%`, position: 'relative' }}>
          {imageUrl ? (
            <img src={imageUrl} alt={bg ? 'Сканирана таблица' : 'Scanned table'} draggable={false} className="block w-full h-auto select-none" />
          ) : (
            <div className="p-10 text-center text-sm text-neutral-400 font-['Manrope']">{bg ? 'Изображението не е налично.' : 'Image not available.'}</div>
          )}
          {highlight && (
            <div
              data-testid="capture-highlight"
              aria-hidden="true"
              className="absolute pointer-events-none border-2 border-orange-500 bg-orange-400/25 rounded-sm"
              style={{ left: `${highlight.left}%`, top: `${highlight.top}%`, width: `${highlight.width}%`, height: `${highlight.height}%` }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CaptureImagePane;
