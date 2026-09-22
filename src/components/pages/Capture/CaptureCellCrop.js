import React, { useEffect, useRef } from 'react';

const PADDING_FACTOR = 0.6; // extra context around the cell, as a fraction of its own size
const TARGET_WIDTH = 280; // canvas px the crop is scaled up to, so a doubtful digit is never squinted at

/**
 * An enlarged, close-up crop of ONE cell's source region, drawn client-side onto a canvas (no extra request, no
 * new server endpoint: the review image is already loaded). Used by the review UI so the user never has to zoom
 * manually into the whole document for every doubtful digit (V2.2 section 9).
 */
const CaptureCellCrop = ({ imageUrl, bbox, bg = true, className = '' }) => {
  const canvasRef = useRef(null);
  const bx = bbox && bbox.x;
  const by = bbox && bbox.y;
  const bw = bbox && bbox.w;
  const bh = bbox && bbox.h;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageUrl || !bbox || !bbox.w || !bbox.h) return undefined;
    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      if (cancelled) return;
      const padX = bbox.w * PADDING_FACTOR;
      const padY = bbox.h * PADDING_FACTOR;
      const sx = Math.max(0, bbox.x - padX);
      const sy = Math.max(0, bbox.y - padY);
      const sw = Math.max(1, Math.min((img.naturalWidth || bbox.x + bbox.w) - sx, bbox.w + padX * 2));
      const sh = Math.max(1, Math.min((img.naturalHeight || bbox.y + bbox.h) - sy, bbox.h + padY * 2));
      const scale = Math.min(8, TARGET_WIDTH / sw);
      canvas.width = Math.round(sw * scale);
      canvas.height = Math.round(sh * scale);
      const ctx = canvas.getContext && canvas.getContext('2d');
      if (!ctx) return; // e.g. a test environment without canvas support: the component still renders, just blank
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
    };
    img.src = imageUrl;
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageUrl, bx, by, bw, bh]);

  if (!bbox) {
    return <div className={`flex items-center justify-center text-xs text-neutral-400 font-['Manrope'] ${className}`} data-testid="capture-cell-crop-empty">{bg ? 'Изберете клетка.' : 'Select a cell.'}</div>;
  }
  return <canvas ref={canvasRef} className={`rounded-lg border border-gray-200 dark:border-zinc-700 bg-white max-w-full ${className}`} data-testid="capture-cell-crop" />;
};

export default CaptureCellCrop;
