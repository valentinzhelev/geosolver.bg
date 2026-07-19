import React, { useMemo } from 'react';

const PAD = { l: 44, r: 16, t: 16, b: 32 };

/**
 * Distance (chainage) vs elevation H profile for survey points.
 */
const ElevationProfileChart = ({ points = [], language = 'bg', width = 560, height = 200 }) => {
  const bg = language === 'bg';

  const series = useMemo(() => {
    const withH = points.filter((p) => p.h != null && Number.isFinite(Number(p.h)) && p.x != null && p.y != null);
    if (withH.length < 2) return null;

    let chain = 0;
    const pts = [{ chain: 0, h: Number(withH[0].h), name: withH[0].name }];
    for (let i = 1; i < withH.length; i += 1) {
      const a = withH[i - 1];
      const b = withH[i];
      const d = Math.hypot(b.x - a.x, b.y - a.y);
      chain += d;
      pts.push({ chain, h: Number(b.h), name: b.name });
    }

    const chains = pts.map((p) => p.chain);
    const hs = pts.map((p) => p.h);
    const minC = 0;
    const maxC = Math.max(...chains, 1);
    const minH = Math.min(...hs);
    const maxH = Math.max(...hs);
    const spanH = Math.max(maxH - minH, 0.5);

    const innerW = width - PAD.l - PAD.r;
    const innerH = height - PAD.t - PAD.b;

    const toSvg = (c, h) => ({
      sx: PAD.l + ((c - minC) / (maxC - minC || 1)) * innerW,
      sy: PAD.t + innerH - ((h - minH + spanH * 0.08) / (spanH * 1.16)) * innerH,
    });

    return { pts, toSvg, minH, maxH, maxC };
  }, [points, width, height]);

  if (!series) {
    return (
      <div className="p-4 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-neutral-500 font-['Manrope']">
        {bg ? 'Нужни са ≥2 точки с кота H за профил.' : 'Need ≥2 points with elevation H for profile.'}
      </div>
    );
  }

  const { pts, toSvg, minH, maxH, maxC } = series;
  const pathD = pts.map((p, i) => {
    const { sx, sy } = toSvg(p.chain, p.h);
    return `${i === 0 ? 'M' : 'L'} ${sx} ${sy}`;
  }).join(' ');

  return (
    <div className="p-4 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900">
      <div className="text-sm font-semibold font-['Manrope'] text-black dark:text-white mb-2">
        {bg ? 'Височинен профил' : 'Elevation profile'}
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full block">
        <line x1={PAD.l} y1={height - PAD.b} x2={width - PAD.r} y2={height - PAD.b} stroke="currentColor" className="text-gray-300 dark:text-zinc-600" />
        <line x1={PAD.l} y1={PAD.t} x2={PAD.l} y2={height - PAD.b} stroke="currentColor" className="text-gray-300 dark:text-zinc-600" />
        <text x={PAD.l - 4} y={PAD.t + 8} textAnchor="end" fontSize="9" fill="currentColor" className="text-neutral-500" fontFamily="Manrope">{maxH.toFixed(2)}</text>
        <text x={PAD.l - 4} y={height - PAD.b} textAnchor="end" fontSize="9" fill="currentColor" className="text-neutral-500" fontFamily="Manrope">{minH.toFixed(2)}</text>
        <text x={width - PAD.r} y={height - 6} textAnchor="end" fontSize="9" fill="currentColor" className="text-neutral-500" fontFamily="Manrope">{maxC.toFixed(1)} m</text>
        <path d={pathD} fill="none" stroke="currentColor" className="text-black dark:text-white" strokeWidth="2" />
        {pts.map((p) => {
          const { sx, sy } = toSvg(p.chain, p.h);
          return (
            <g key={p.name + p.chain}>
              <circle cx={sx} cy={sy} r="4" className="fill-orange-600" />
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default ElevationProfileChart;
