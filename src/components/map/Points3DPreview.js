import React, { useMemo } from 'react';
import { isoPosition } from '../../domain/geodesy/coordinateConvention';

/**
 * Simple isometric preview of points (an SVG projection, not a 3D engine). Official convention (QA-02):
 * X = Northing, Y = Easting, H up; the viewer looks north-east from the south-west, so Easting runs to the
 * right/away and Northing to the left/away (see isoPosition in domain/geodesy/coordinateConvention.js).
 */
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

    // cx = centre Northing (x), cy = centre Easting (y)
    const iso = (x, y, h) => isoPosition(x, y, h, { cx, cy, spanXY, minH, spanH, size });

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
        {/* axis key: shows the visible convention (Northing X, Easting Y, Height H) */}
        <g className="text-neutral-500" fill="currentColor" stroke="currentColor" fontSize="9" fontFamily="Manrope, sans-serif">
          <line x1="30" y1={size - 24} x2="8" y2={size - 35} strokeWidth="1.2" />
          <text x="0" y={size - 39} stroke="none">X (N)</text>
          <line x1="30" y1={size - 24} x2="52" y2={size - 35} strokeWidth="1.2" />
          <text x="46" y={size - 39} stroke="none">Y (E)</text>
          <line x1="30" y1={size - 24} x2="30" y2={size - 50} strokeWidth="1.2" />
          <text x="34" y={size - 50} stroke="none">H</text>
        </g>
      </svg>
    </div>
  );
};

export default Points3DPreview;
