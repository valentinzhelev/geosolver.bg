import React, { useMemo } from 'react';

const PAD = 36;
const W = 320;
const H = 220;

/**
 * Simple SVG sketch for first basic task: P1 → P2 with bearing α and distance S.
 * X is horizontal (East), Y is vertical (North).
 */
const TaskGeometrySketch = ({ y1, x1, y2, x2, alphaGon, s, language = 'bg' }) => {
  const bg = language === 'bg';

  const geom = useMemo(() => {
    const hasP1 = Number.isFinite(y1) && Number.isFinite(x1);
    const hasP2 = Number.isFinite(y2) && Number.isFinite(x2);
    if (!hasP1) return null;

    const xs = hasP2 ? [x1, x2] : [x1];
    const ys = hasP2 ? [y1, y2] : [y1];
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const spanX = Math.max(maxX - minX, 1);
    const spanY = Math.max(maxY - minY, 1);
    const span = Math.max(spanX, spanY, 1) * 1.35;

    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;

    const toSvg = (x, y) => ({
      sx: PAD + ((x - cx) / span + 0.5) * (W - 2 * PAD),
      sy: H - PAD - ((y - cy) / span + 0.5) * (H - 2 * PAD),
    });

    const p1 = toSvg(x1, y1);
    const p2 = hasP2 ? toSvg(x2, y2) : null;

    let arc = null;
    if (p2 && Number.isFinite(alphaGon)) {
      const refLen = Math.min(48, Math.hypot(p2.sx - p1.sx, p2.sy - p1.sy) * 0.35);
      const alphaRad = (alphaGon / 200) * Math.PI;
      const ex = p1.sx + refLen * Math.cos(alphaRad);
      const ey = p1.sy - refLen * Math.sin(alphaRad);
      arc = { ex, ey, alphaGon };
    }

    return { p1, p2, arc, hasP2 };
  }, [y1, x1, y2, x2, alphaGon]);

  if (!geom) {
    return (
      <div className="w-full p-4 bg-white dark:bg-zinc-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-800">
        <div className="text-black dark:text-white text-sm font-semibold font-['Manrope'] mb-2">
          {bg ? 'Скица' : 'Sketch'}
        </div>
        <div className="h-[220px] flex items-center justify-center text-neutral-400 dark:text-zinc-500 text-sm font-['Manrope']">
          {bg ? 'Въведете координати на точка 1' : 'Enter point 1 coordinates'}
        </div>
      </div>
    );
  }

  const { p1, p2, arc, hasP2 } = geom;

  return (
    <div className="w-full p-4 bg-white dark:bg-zinc-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-800">
      <div className="flex justify-between items-center mb-2">
        <div className="text-black dark:text-white text-sm font-semibold font-['Manrope']">
          {bg ? 'Скица' : 'Sketch'}
        </div>
        {Number.isFinite(s) && (
          <div className="text-neutral-500 dark:text-zinc-400 text-xs font-medium font-['Manrope']">
            S = {Number(s).toFixed(2)} m
          </div>
        )}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-md mx-auto block" role="img" aria-label={bg ? 'Геометрична скица' : 'Geometry sketch'}>
        <defs>
          <marker id="sketch-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="currentColor" className="text-neutral-400" />
          </marker>
        </defs>
        {/* grid */}
        {[0.25, 0.5, 0.75].map((t) => (
          <g key={t} className="text-gray-200 dark:text-zinc-700" stroke="currentColor" strokeWidth="0.5">
            <line x1={PAD} y1={PAD + t * (H - 2 * PAD)} x2={W - PAD} y2={PAD + t * (H - 2 * PAD)} />
            <line x1={PAD + t * (W - 2 * PAD)} y1={PAD} x2={PAD + t * (W - 2 * PAD)} y2={H - PAD} />
          </g>
        ))}
        {/* North */}
        <g className="text-neutral-500 dark:text-zinc-400">
          <line x1={W - PAD + 8} y1={H - PAD} x2={W - PAD + 8} y2={PAD - 4} stroke="currentColor" strokeWidth="1.5" markerEnd="url(#sketch-arrow)" />
          <text x={W - PAD + 8} y={PAD - 8} textAnchor="middle" fontSize="10" fill="currentColor" fontFamily="Manrope, sans-serif">
            Y
          </text>
          <text x={W - PAD - 2} y={H - PAD + 14} textAnchor="end" fontSize="10" fill="currentColor" fontFamily="Manrope, sans-serif">
            X →
          </text>
        </g>
        {hasP2 && (
          <line x1={p1.sx} y1={p1.sy} x2={p2.sx} y2={p2.sy} stroke="currentColor" className="text-black dark:text-white" strokeWidth="2" strokeDasharray="none" />
        )}
        {arc && (
          <>
            <line x1={p1.sx} y1={p1.sy} x2={arc.ex} y2={arc.ey} stroke="currentColor" className="text-neutral-400" strokeWidth="1" strokeDasharray="4 3" />
            <text x={p1.sx + 14} y={p1.sy - 10} fontSize="10" fill="currentColor" className="text-neutral-500 dark:text-zinc-400" fontFamily="Manrope, sans-serif">
              α = {Number(alphaGon).toFixed(2)} gon
            </text>
          </>
        )}
        <circle cx={p1.sx} cy={p1.sy} r="5" className="fill-black dark:fill-white" />
        <text x={p1.sx + 8} y={p1.sy - 8} fontSize="11" fontWeight="600" fill="currentColor" className="text-black dark:text-white" fontFamily="Manrope, sans-serif">
          P₁
        </text>
        {hasP2 && p2 && (
          <>
            <circle cx={p2.sx} cy={p2.sy} r="5" className="fill-neutral-400 dark:fill-zinc-400" />
            <text x={p2.sx + 8} y={p2.sy - 8} fontSize="11" fontWeight="600" fill="currentColor" className="text-black dark:text-white" fontFamily="Manrope, sans-serif">
              P₂
            </text>
          </>
        )}
      </svg>
    </div>
  );
};

export default TaskGeometrySketch;
