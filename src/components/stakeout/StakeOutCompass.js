import React from 'react';

/**
 * Field stake-out compass: north up, arrow shows bearing to target (gon, 0 = north/Y+).
 */
const StakeOutCompass = ({
  bearingGon = 0,
  distance,
  toleranceM = 0.05,
  language = 'bg',
  deviceHeadingGon = null,
}) => {
  const bg = language === 'bg';
  const size = 220;
  const cx = size / 2;
  const cy = size / 2;
  const r = 88;
  const angleRad = (bearingGon / 200) * Math.PI;
  const tipX = cx + r * 0.72 * Math.sin(angleRad);
  const tipY = cy - r * 0.72 * Math.cos(angleRad);
  const tolOk = toleranceM <= 0 || (distance != null && distance <= toleranceM);

  const devRad = deviceHeadingGon != null ? (deviceHeadingGon / 200) * Math.PI : null;
  const devTipX = devRad != null ? cx + r * 0.55 * Math.sin(devRad) : null;
  const devTipY = devRad != null ? cy - r * 0.55 * Math.cos(devRad) : null;
  const headingDelta =
    deviceHeadingGon != null && Number.isFinite(bearingGon)
      ? Math.abs(((bearingGon - deviceHeadingGon + 200) % 400) - 200)
      : null;

  return (
    <div className="flex flex-col items-center gap-3">
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full max-w-[240px]" role="img">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="currentColor" className="text-gray-200 dark:text-zinc-700" strokeWidth="2" />
        <circle cx={cx} cy={cy} r={r * 0.55} fill="none" stroke="currentColor" className="text-gray-100 dark:text-zinc-800" strokeWidth="1" strokeDasharray="4 4" />
        {/* Cardinal */}
        <text x={cx} y={cy - r - 6} textAnchor="middle" fontSize="12" fontWeight="700" fill="currentColor" className="text-black dark:text-white" fontFamily="Manrope, sans-serif">N</text>
        <text x={cx + r + 10} y={cy + 4} textAnchor="middle" fontSize="11" fill="currentColor" className="text-neutral-500" fontFamily="Manrope, sans-serif">E</text>
        <text x={cx} y={cy + r + 14} textAnchor="middle" fontSize="11" fill="currentColor" className="text-neutral-500" fontFamily="Manrope, sans-serif">S</text>
        <text x={cx - r - 10} y={cy + 4} textAnchor="middle" fontSize="11" fill="currentColor" className="text-neutral-500" fontFamily="Manrope, sans-serif">W</text>
        {/* Station */}
        <circle cx={cx} cy={cy} r="6" className="fill-black dark:fill-white" />
        {/* Device heading (live) */}
        {devTipX != null && (
          <>
            <line x1={cx} y1={cy} x2={devTipX} y2={devTipY} stroke="currentColor" className="text-blue-500" strokeWidth="2" strokeDasharray="6 4" strokeLinecap="round" />
            <circle cx={devTipX} cy={devTipY} r="4" className="fill-blue-500" />
          </>
        )}
        {/* Bearing arrow */}
        <line x1={cx} y1={cy} x2={tipX} y2={tipY} stroke="currentColor" className="text-orange-600" strokeWidth="3" strokeLinecap="round" />
        <polygon
          points={`${tipX},${tipY} ${tipX - 8 * Math.cos(angleRad - 0.4)},${tipY + 8 * Math.sin(angleRad - 0.4)} ${tipX - 8 * Math.cos(angleRad + 0.4)},${tipY + 8 * Math.sin(angleRad + 0.4)}`}
          className="fill-orange-600"
        />
      </svg>
      <div className="text-center font-['Manrope']">
        <div className="text-2xl font-bold tabular-nums text-black dark:text-white">
          {Number.isFinite(bearingGon) ? `${bearingGon.toFixed(2)} gon` : '—'}
        </div>
        <div className="text-sm text-neutral-500">
          {Number.isFinite(distance) ? `S = ${distance.toFixed(3)} m` : ''}
        </div>
        {toleranceM > 0 && Number.isFinite(distance) && (
          <div className={`text-xs mt-1 font-semibold ${tolOk ? 'text-emerald-600' : 'text-orange-600'}`}>
            {tolOk
              ? bg
                ? 'В допуск — на място'
                : 'Within tolerance — on point'
              : bg
                ? `Остават ${distance.toFixed(3)} m до целта`
                : `${distance.toFixed(3)} m to target`}
          </div>
        )}
        {headingDelta != null && (
          <div className="text-xs mt-1 text-blue-600 font-semibold">
            {bg ? 'Отклонение компас' : 'Compass offset'}: {headingDelta.toFixed(1)} gon
          </div>
        )}
      </div>
    </div>
  );
};

export default StakeOutCompass;
