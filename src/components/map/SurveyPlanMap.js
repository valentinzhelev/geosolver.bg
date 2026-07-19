import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const PAD = 48;
const MIN_ZOOM = 0.4;
const MAX_ZOOM = 8;

function boundsOf(points) {
  const valid = points.filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y));
  if (!valid.length) return null;
  const xs = valid.map((p) => p.x);
  const ys = valid.map((p) => p.y);
  return {
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    minY: Math.min(...ys),
    maxY: Math.max(...ys),
  };
}

const LAYER_COLORS = {
  default: '#0a0a0a',
  gnss: '#ea580c',
  control: '#2563eb',
  detail: '#16a34a',
  polygon: '#9333ea',
};

function dist2d(a, b) {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

function niceScaleMeters(raw) {
  if (!Number.isFinite(raw) || raw <= 0) return 10;
  const pow = 10 ** Math.floor(Math.log10(raw));
  const n = raw / pow;
  const nice = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
  return nice * pow;
}

/**
 * Interactive 2D plan view (Y north, X east) for survey points.
 */
const SurveyPlanMap = ({
  points = [],
  width = 800,
  height = 520,
  language = 'bg',
  selectedId = null,
  onSelectPoint,
  showGrid = true,
}) => {
  const bg = language === 'bg';
  const svgRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [measureOn, setMeasureOn] = useState(false);
  const [measurePts, setMeasurePts] = useState([]);
  const dragRef = useRef(null);

  const plotPoints = useMemo(
    () => points.filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y)),
    [points]
  );

  const bbox = useMemo(() => boundsOf(plotPoints), [plotPoints]);

  const view = useMemo(() => {
    if (!bbox) {
      return { toSvg: () => ({ sx: width / 2, sy: height / 2 }), span: 100 };
    }
    const spanX = Math.max(bbox.maxX - bbox.minX, 1);
    const spanY = Math.max(bbox.maxY - bbox.minY, 1);
    const span = Math.max(spanX, spanY) * 1.25;
    const cx = (bbox.minX + bbox.maxX) / 2;
    const cy = (bbox.minY + bbox.maxY) / 2;
    const innerW = width - 2 * PAD;
    const innerH = height - 2 * PAD;

    const toSvg = (x, y) => ({
      sx: PAD + innerW / 2 + ((x - cx) / span) * innerW,
      sy: PAD + innerH / 2 - ((y - cy) / span) * innerH,
    });

    return { toSvg, span, cx, cy };
  }, [bbox, width, height]);

  useEffect(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, [plotPoints.length, bbox?.minX, bbox?.maxX]);

  const fitView = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  const onWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom((z) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z * delta)));
  };

  const onPointerDown = (e) => {
    if (e.button !== 0) return;
    dragRef.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e) => {
    if (!dragRef.current) return;
    setPan({
      x: dragRef.current.panX + (e.clientX - dragRef.current.x),
      y: dragRef.current.panY + (e.clientY - dragRef.current.y),
    });
  };

  const onPointerUp = () => {
    dragRef.current = null;
  };

  const gridLines = useMemo(() => {
    if (!showGrid || !bbox) return [];
    const { span, cx, cy, toSvg } = view;
    const step = span > 500 ? 100 : span > 100 ? 20 : span > 20 ? 5 : 1;
    const startX = Math.floor((bbox.minX - span * 0.1) / step) * step;
    const endX = Math.ceil((bbox.maxX + span * 0.1) / step) * step;
    const startY = Math.floor((bbox.minY - span * 0.1) / step) * step;
    const endY = Math.ceil((bbox.maxY + span * 0.1) / step) * step;
    const lines = [];
    for (let x = startX; x <= endX; x += step) {
      const a = toSvg(x, cy - span);
      const b = toSvg(x, cy + span);
      lines.push({ x1: a.sx, y1: a.sy, x2: b.sx, y2: b.sy, label: x });
    }
    for (let y = startY; y <= endY; y += step) {
      const a = toSvg(cx - span, y);
      const b = toSvg(cx + span, y);
      lines.push({ x1: a.sx, y1: a.sy, x2: b.sx, y2: b.sy, label: y, horizontal: true });
    }
    return lines;
  }, [showGrid, bbox, view]);

  const transform = `translate(${width / 2 + pan.x}, ${height / 2 + pan.y}) scale(${zoom}) translate(${-width / 2}, ${-height / 2})`;

  const innerW = width - 2 * PAD;
  const metersPerPx = bbox ? view.span / innerW / zoom : 1;
  const scaleBarPx = 100;
  const scaleBarM = niceScaleMeters(metersPerPx * scaleBarPx);
  const scaleBarWidth = scaleBarM / metersPerPx;

  const measureDistance =
    measurePts.length === 2 ? dist2d(measurePts[0], measurePts[1]) : null;

  const handlePointClick = (p, e) => {
    e.stopPropagation();
    if (measureOn) {
      setMeasurePts((prev) => {
        if (prev.length >= 2) return [p];
        return [...prev, p];
      });
      return;
    }
    onSelectPoint?.(p);
  };

  return (
    <div className="w-full flex flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-xs text-neutral-500 dark:text-zinc-400 font-['Manrope']">
          {measureOn
            ? bg
              ? 'Линийка: кликни 2 точки · Y ↑ север'
              : 'Ruler: click 2 points · Y ↑ north'
            : bg
              ? 'Zoom: колело · Pan: drag · Y ↑ север'
              : 'Zoom: wheel · Pan: drag · Y ↑ north'}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              setMeasureOn((v) => !v);
              setMeasurePts([]);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-['Manrope'] outline outline-1 ${
              measureOn
                ? 'bg-black dark:bg-white text-white dark:text-black outline-transparent'
                : 'bg-white dark:bg-zinc-900 outline-gray-200 dark:outline-zinc-700 hover:bg-stone-50 dark:hover:bg-zinc-800'
            }`}
          >
            {bg ? 'Линийка' : 'Ruler'}
          </button>
          <button
            type="button"
            onClick={fitView}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold font-['Manrope'] bg-white dark:bg-zinc-900 outline outline-1 outline-gray-200 dark:outline-zinc-700 hover:bg-stone-50 dark:hover:bg-zinc-800"
          >
            {bg ? 'Центрирай' : 'Fit view'}
          </button>
        </div>
      </div>
      {measureDistance != null && (
        <div className="text-sm font-semibold font-['Manrope'] text-black dark:text-white px-3 py-2 rounded-lg bg-stone-100 dark:bg-zinc-800/60">
          S = {measureDistance.toFixed(3)} m
          <span className="text-neutral-500 font-normal ml-2">
            ({measurePts[0].code || measurePts[0].name} → {measurePts[1].code || measurePts[1].name})
          </span>
        </div>
      )}
      <div
        className="w-full rounded-xl overflow-hidden border border-gray-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-950 cursor-grab active:cursor-grabbing"
        style={{ touchAction: 'none' }}
      >
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full block select-none"
          onWheel={onWheel}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
          role="img"
          aria-label={bg ? 'Координатна карта' : 'Coordinate map'}
        >
          <rect width={width} height={height} fill="currentColor" className="text-stone-50 dark:text-zinc-950" />
          <g transform={transform}>
            {gridLines.map((ln, i) => (
              <line
                key={i}
                x1={ln.x1}
                y1={ln.y1}
                x2={ln.x2}
                y2={ln.y2}
                stroke="currentColor"
                className="text-gray-200 dark:text-zinc-800"
                strokeWidth="1"
              />
            ))}
            {plotPoints.length > 1 && (
              <polyline
                points={plotPoints.map((p) => {
                  const { sx, sy } = view.toSvg(p.x, p.y);
                  return `${sx},${sy}`;
                }).join(' ')}
                fill="none"
                stroke="currentColor"
                className="text-neutral-300 dark:text-zinc-600"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
            )}
            {measurePts.length === 2 && (
              <line
                x1={view.toSvg(measurePts[0].x, measurePts[0].y).sx}
                y1={view.toSvg(measurePts[0].x, measurePts[0].y).sy}
                x2={view.toSvg(measurePts[1].x, measurePts[1].y).sx}
                y2={view.toSvg(measurePts[1].x, measurePts[1].y).sy}
                stroke="#ea580c"
                strokeWidth="2"
                strokeDasharray="6 4"
              />
            )}
            {plotPoints.map((p) => {
              const { sx, sy } = view.toSvg(p.x, p.y);
              const color = LAYER_COLORS[p.layer] || LAYER_COLORS.default;
              const selected = selectedId && (p._id === selectedId || p.name === selectedId);
              const inMeasure = measurePts.some((m) => m._id === p._id || m.name === p.name);
              return (
                <g
                  key={p._id || p.name}
                  onClick={(e) => handlePointClick(p, e)}
                  style={{ cursor: measureOn || onSelectPoint ? 'pointer' : 'default' }}
                >
                  <circle
                    cx={sx}
                    cy={sy}
                    r={selected || inMeasure ? 7 : 5}
                    fill={color}
                    stroke={selected || inMeasure ? '#fff' : 'none'}
                    strokeWidth={2}
                  />
                  <text
                    x={sx + 8}
                    y={sy - 8}
                    fontSize="10"
                    fontWeight="600"
                    fill="currentColor"
                    className="text-black dark:text-white"
                    fontFamily="Manrope, Segoe UI, sans-serif"
                  >
                    {p.code || p.name}
                  </text>
                </g>
              );
            })}
          </g>
          {bbox && (
            <g transform={`translate(${PAD}, ${height - PAD - 12})`}>
              <line x1="0" y1="0" x2={scaleBarWidth} y2="0" stroke="currentColor" className="text-neutral-600" strokeWidth="2" />
              <line x1="0" y1="-4" x2="0" y2="4" stroke="currentColor" className="text-neutral-600" strokeWidth="1.5" />
              <line x1={scaleBarWidth} y1="-4" x2={scaleBarWidth} y2="4" stroke="currentColor" className="text-neutral-600" strokeWidth="1.5" />
              <text x={scaleBarWidth / 2} y="-8" textAnchor="middle" fontSize="10" fill="currentColor" className="text-neutral-600" fontFamily="Manrope, sans-serif">
                {scaleBarM >= 1000 ? `${(scaleBarM / 1000).toFixed(scaleBarM % 1000 === 0 ? 0 : 1)} km` : `${scaleBarM} m`}
              </text>
            </g>
          )}
          <g transform={`translate(${width - PAD - 8}, ${PAD + 20})`}>
            <line x1="0" y1="16" x2="0" y2="-12" stroke="currentColor" className="text-neutral-500" strokeWidth="1.5" markerEnd="url(#north-arrow)" />
            <text x="0" y="-18" textAnchor="middle" fontSize="10" fill="currentColor" className="text-neutral-500" fontFamily="Manrope, sans-serif">
              Y
            </text>
          </g>
          <defs>
            <marker id="north-arrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
              <path d="M0,6 L3,0 L6,6 Z" fill="currentColor" className="text-neutral-500" />
            </marker>
          </defs>
          {!plotPoints.length && (
            <text
              x={width / 2}
              y={height / 2}
              textAnchor="middle"
              fontSize="14"
              fill="currentColor"
              className="text-neutral-400"
              fontFamily="Manrope, sans-serif"
            >
              {bg ? 'Няма точки с координати' : 'No points with coordinates'}
            </text>
          )}
        </svg>
      </div>
      <div className="flex flex-wrap gap-3 text-xs font-['Manrope'] text-neutral-500 dark:text-zinc-400">
        {Object.entries(LAYER_COLORS).map(([layer, color]) => (
          <span key={layer} className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
            {layer}
          </span>
        ))}
      </div>
    </div>
  );
};

export default SurveyPlanMap;
