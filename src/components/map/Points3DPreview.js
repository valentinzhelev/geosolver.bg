import React, { useMemo } from 'react';

/** Simple isometric 3D preview of points (X east, Y north, H up). */
const Points3DPreview = ({ points = [], language = 'bg', size = 280 }) => {
  const bg = language === 'bg';

  const geom = useMemo(() => {
    const valid = points.filter((p) => p.x != null && p.y != null);
    if (!valid.length) return null;

    const xs = valid.map((p) => p.x);
    const ys = valid.map((p) => p.y);
    const hs = valid.map((p) => (p.h != null ? Number(p.h) : 0));
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const minH = Math.min(...hs);
    const maxH = Math.max(...hs);
    const spanXY = Math.max(maxX - minX, maxY - minY, 1);
    const spanH = Math.max(maxH - minH, 0.5);
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;

    const iso = (x, y, h) => {
      const dx = (x - cx) / spanXY;
      const dy = (y - cy) / spanXY;
      const dz = ((h - minH) / spanH) * 0.35;
      const sx = size / 2 + (dx - dy) * (size * 0.32);
      const sy = size / 2 + (dx + dy) * (size * 0.16) - dz * (size * 0.5);
      return { sx, sy };
    };

    return { valid, iso, minH, maxH };
  }, [points, size]);

  if (!geom) {
    return (
      <div className="p-4 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-neutral-500 font-['Manrope'] h-[200px] flex items-center justify-center">
        {bg ? 'Няма точки за 3D preview.' : 'No points for 3D preview.'}
      </div>
    );
  }

  const { valid, iso } = geom;

  return (
    <div className="p-4 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900">
      <div className="text-sm font-semibold font-['Manrope'] text-black dark:text-white mb-2">
        {bg ? '3D preview (изометрия)' : '3D preview (isometric)'}
      </div>
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-sm mx-auto block">
        <rect width={size} height={size} fill="transparent" />
        {valid.map((p) => {
          const h = p.h != null ? Number(p.h) : 0;
          const base = iso(p.x, p.y, 0);
          const top = iso(p.x, p.y, h);
          return (
            <g key={p._id || p.name}>
              <line x1={base.sx} y1={base.sy} x2={top.sx} y2={top.sy} stroke="currentColor" className="text-neutral-300 dark:text-zinc-600" strokeWidth="1" />
              <circle cx={top.sx} cy={top.sy} r="4" className="fill-black dark:fill-white" />
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default Points3DPreview;
