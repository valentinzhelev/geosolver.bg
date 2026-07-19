import React, { useMemo } from 'react';

const PAD = 48;
const W = 320;
const H = 220;

/**
 * SVG sketch for two-point tasks: segment P1—P2 with optional bearing label.
 */
const TwoPointSketch = ({
  y1,
  x1,
  y2,
  x2,
  alphaGon,
  distance,
  language = 'bg',
  showBearing = true,
}) => {
  const bg = language === 'bg';

  const geom = useMemo(() => {
    const hasP1 = Number.isFinite(y1) && Number.isFinite(x1);
    const hasP2 = Number.isFinite(y2) && Number.isFinite(x2);
    if (!hasP1 && !hasP2) return null;

    const xs = [];
    const ys = [];
    if (hasP1) {
      xs.push(x1);
      ys.push(y1);
    }
    if (hasP2) {
      xs.push(x2);
      ys.push(y2);
    }
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const span = Math.max(maxX - minX, maxY - minY, 1) * 1.4;
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;

    const toSvg = (x, y) => ({
      sx: PAD + ((x - cx) / span + 0.5) * (W - 2 * PAD),
      sy: H - PAD - ((y - cy) / span + 0.5) * (H - 2 * PAD),
    });

    return {
      p1: hasP1 ? toSvg(x1, y1) : null,
      p2: hasP2 ? toSvg(x2, y2) : null,
      hasP1,
      hasP2,
      hasBoth: hasP1 && hasP2,
    };
  }, [y1, x1, y2, x2]);

  if (!geom) {
    return (
      <div className="w-full p-4 bg-white dark:bg-zinc-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-800">
        <div className="text-black dark:text-white text-sm font-semibold font-['Manrope'] mb-2">
          {bg ? 'Скица' : 'Sketch'}
        </div>
        <div className="h-[180px] flex items-center justify-center text-neutral-400 text-sm font-['Manrope']">
          {bg ? 'Въведете координати' : 'Enter coordinates'}
        </div>
      </div>
    );
  }

  const { p1, p2, hasP1, hasP2, hasBoth } = geom;
  const mid =
    hasBoth && p1 && p2
      ? { sx: (p1.sx + p2.sx) / 2, sy: (p1.sy + p2.sy) / 2 - 12 }
      : null;

  return (
    <div className="w-full p-4 bg-white dark:bg-zinc-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-800">
      <div className="flex justify-between items-center mb-2">
        <div className="text-black dark:text-white text-sm font-semibold font-['Manrope']">
          {bg ? 'Скица' : 'Sketch'}
        </div>
        {Number.isFinite(distance) && (
          <div className="text-neutral-500 dark:text-zinc-400 text-xs font-medium font-['Manrope']">
            S = {Number(distance).toFixed(2)} m
          </div>
        )}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-md mx-auto block" role="img">
        {[0.25, 0.5, 0.75].map((t) => (
          <line
            key={t}
            x1={PAD}
            y1={PAD + t * (H - 2 * PAD)}
            x2={W - PAD}
            y2={PAD + t * (H - 2 * PAD)}
            stroke="currentColor"
            className="text-gray-200 dark:text-zinc-800"
            strokeWidth="0.5"
          />
        ))}
        {hasBoth && p1 && p2 && (
          <line
            x1={p1.sx}
            y1={p1.sy}
            x2={p2.sx}
            y2={p2.sy}
            stroke="currentColor"
            className="text-black dark:text-white"
            strokeWidth="2"
          />
        )}
        {hasP1 && p1 && (
          <>
            <circle cx={p1.sx} cy={p1.sy} r="5" className="fill-black dark:fill-white" />
            <text x={p1.sx + 8} y={p1.sy - 8} fontSize="11" fontWeight="600" fill="currentColor" className="text-black dark:text-white" fontFamily="Manrope, sans-serif">
              P₁
            </text>
          </>
        )}
        {hasP2 && p2 && (
          <>
            <circle cx={p2.sx} cy={p2.sy} r="5" className="fill-neutral-400 dark:fill-zinc-400" />
            <text x={p2.sx + 8} y={p2.sy - 8} fontSize="11" fontWeight="600" fill="currentColor" className="text-black dark:text-white" fontFamily="Manrope, sans-serif">
              P₂
            </text>
          </>
        )}
        {showBearing && mid && Number.isFinite(alphaGon) && (
          <text x={mid.sx} y={mid.sy} textAnchor="middle" fontSize="10" fill="currentColor" className="text-neutral-500" fontFamily="Manrope, sans-serif">
            α = {Number(alphaGon).toFixed(2)} gon
          </text>
        )}
        <text x={W - PAD} y={PAD - 4} textAnchor="end" fontSize="10" fill="currentColor" className="text-neutral-500" fontFamily="Manrope, sans-serif">
          Y ↑
        </text>
      </svg>
    </div>
  );
};

export default TwoPointSketch;
