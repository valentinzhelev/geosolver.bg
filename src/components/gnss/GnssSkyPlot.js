import React, { useMemo } from 'react';

/** Polar sky plot: azimuth (0°=N, clockwise) vs elevation. */
const GnssSkyPlot = ({ satellites = [], language = 'bg', size = 280 }) => {
  const bg = language === 'bg';
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.38;

  const rings = [90, 60, 30, 0];

  const pts = useMemo(
    () =>
      satellites
        .filter((s) => s.elevation >= 0)
        .map((s) => {
          const rad = ((90 - s.elevation) / 90) * r;
          const ang = ((s.azimuth - 90) * Math.PI) / 180;
          return {
            ...s,
            sx: cx + rad * Math.cos(ang),
            sy: cy + rad * Math.sin(ang),
          };
        }),
    [satellites, cx, cy, r]
  );

  return (
    <div className="p-4 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900">
      <div className="text-sm font-semibold font-['Manrope'] text-black dark:text-white mb-2">
        {bg ? 'Sky plot (азимут / elevation)' : 'Sky plot (azimuth / elevation)'}
      </div>
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-sm mx-auto block">
        {rings.map((elev) => {
          const rr = ((90 - elev) / 90) * r;
          return (
            <circle
              key={elev}
              cx={cx}
              cy={cy}
              r={rr}
              fill="none"
              stroke="currentColor"
              className="text-gray-200 dark:text-zinc-700"
              strokeWidth="1"
            />
          );
        })}
        <line x1={cx} y1={cy - r} x2={cx} y2={cy + r} stroke="currentColor" className="text-gray-200 dark:text-zinc-700" />
        <line x1={cx - r} y1={cy} x2={cx + r} y2={cy} stroke="currentColor" className="text-gray-200 dark:text-zinc-700" />
        <text x={cx} y={cy - r - 4} textAnchor="middle" fontSize="9" className="fill-neutral-500" fontFamily="Manrope">N</text>
        <text x={cx + r + 8} y={cy + 3} fontSize="9" className="fill-neutral-500" fontFamily="Manrope">E</text>
        {pts.map((s) => (
          <g key={s.prn}>
            <circle
              cx={s.sx}
              cy={s.sy}
              r={s.snr > 0 ? 5 : 4}
              className={s.snr >= 35 ? 'fill-emerald-500' : s.snr >= 20 ? 'fill-orange-500' : 'fill-neutral-400'}
              opacity={0.9}
            />
            <text x={s.sx} y={s.sy - 7} textAnchor="middle" fontSize="7" className="fill-neutral-600 dark:fill-zinc-400" fontFamily="Manrope">
              {s.prn}
            </text>
          </g>
        ))}
        {!pts.length && (
          <text x={cx} y={cy} textAnchor="middle" fontSize="11" className="fill-neutral-400" fontFamily="Manrope">
            {bg ? 'Няма GSV данни' : 'No GSV data'}
          </text>
        )}
      </svg>
      <p className="text-[10px] text-neutral-500 font-['Manrope'] mt-2 text-center">
        {bg ? 'Зелено = силен SNR · Очаквай $GPGSV/$GNGSV от приемника' : 'Green = strong SNR · Expect $GPGSV/$GNGSV from receiver'}
      </p>
    </div>
  );
};

export default GnssSkyPlot;
