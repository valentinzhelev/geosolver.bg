import React, { useId } from 'react';
import { num, createGeoMapper, rayEnd, arcPath } from '../../../utils/geoDiagramUtils';

const W = 320;
const H = 240;

function NorthArrow({ x, y, bg }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <line x1="0" y1="8" x2="0" y2="-14" stroke="currentColor" strokeWidth="1.5" className="text-neutral-400 dark:text-zinc-400" />
      <polygon points="0,-18 -4,-10 4,-10" className="fill-neutral-500" />
      <text x="0" y="-22" textAnchor="middle" className="text-[9px] fill-neutral-500 font-['Manrope']">
        X
      </text>
    </g>
  );
}

function Grid({ mapper, w, h }) {
  if (!mapper.valid) return null;
  const lines = [];
  for (let i = 0; i <= 4; i += 1) {
    const t = i / 4;
    const x = 36 + t * (w - 72);
    const y = 36 + t * (h - 72);
    lines.push(
      <line key={`v${i}`} x1={x} y1={36} x2={x} y2={h - 36} className="stroke-stone-200 dark:stroke-zinc-700" strokeWidth="0.5" />,
      <line key={`h${i}`} x1={36} y1={y} x2={w - 36} y2={y} className="stroke-stone-200 dark:stroke-zinc-700" strokeWidth="0.5" />
    );
  }
  return <g opacity="0.6">{lines}</g>;
}

function Point({ cx, cy, label, sublabel, accent, dashed }) {
  return (
    <g>
      <circle
        cx={cx}
        cy={cy}
        r={accent ? 7 : 5}
        className={accent ? 'fill-violet-600' : 'fill-black dark:fill-white'}
        stroke="white"
        strokeWidth="1"
        strokeDasharray={dashed ? '2 2' : undefined}
        opacity={dashed ? 0.45 : 1}
      />
      <text x={cx + 10} y={cy - 6} className="text-[11px] font-bold fill-neutral-800 dark:fill-zinc-200 font-mono">
        {label}
      </text>
      {sublabel && (
        <text x={cx + 10} y={cy + 8} className="text-[9px] fill-neutral-500 font-mono">
          {sublabel}
        </text>
      )}
    </g>
  );
}

function DiagramFrame({ children, bg, caption }) {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[340px] mx-auto" role="img" aria-label={caption}>
      <rect x="0" y="0" width={W} height={H} rx="12" className="fill-stone-50 dark:fill-zinc-800/50" />
      {children}
      <NorthArrow x={W - 28} y={28} bg={bg} />
      <text x={W / 2} y={H - 8} textAnchor="middle" className="text-[9px] fill-neutral-400 font-['Manrope']">
        {caption}
      </text>
    </svg>
  );
}

// Fixed illustrative layout (screen coordinates, bearings clockwise from "up"). Not derived from any task.
const SCHEMA_P = { x: 150, y: 175 };
const SCHEMA_BEARINGS = { A: 315, B: 15, C: 100 }; // degrees, sweeping clockwise A -> B -> C as seen from P
const SCHEMA_DIST = { A: 100, B: 110, C: 95 };
const polar = (deg, r) => ({
  x: SCHEMA_P.x + r * Math.sin((deg * Math.PI) / 180),
  y: SCHEMA_P.y - r * Math.cos((deg * Math.PI) / 180),
});
function clockwiseArc(fromDeg, toDeg, r) {
  const a = polar(fromDeg, r);
  const b = polar(toDeg, r);
  const sweep = (((toDeg - fromDeg) % 360) + 360) % 360;
  return `M ${a.x.toFixed(1)} ${a.y.toFixed(1)} A ${r} ${r} 0 ${sweep > 180 ? 1 : 0} 1 ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
}

function ResectionConventionSchematic({ bg }) {
  const markerId = useId();
  const pts = Object.fromEntries(Object.keys(SCHEMA_BEARINGS).map((k) => [k, polar(SCHEMA_BEARINGS[k], SCHEMA_DIST[k])]));
  const mid1 = polar((SCHEMA_BEARINGS.A + 360 + SCHEMA_BEARINGS.B + 360) / 2, 58);
  const mid2 = polar((SCHEMA_BEARINGS.B + SCHEMA_BEARINGS.C) / 2, 70);
  return (
    <g>
      <defs>
        <marker id={markerId} markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <polygon points="0 0, 6 3, 0 6" fill="#8b5cf6" />
        </marker>
      </defs>
      {['A', 'B', 'C'].map((k) => (
        <line key={k} x1={SCHEMA_P.x} y1={SCHEMA_P.y} x2={pts[k].x} y2={pts[k].y} className="stroke-neutral-400" strokeWidth="1" strokeDasharray="4 3" />
      ))}
      <path d={clockwiseArc(SCHEMA_BEARINGS.A, SCHEMA_BEARINGS.B, 40)} fill="none" stroke="#8b5cf6" strokeWidth="1.8" markerEnd={`url(#${markerId})`} />
      <path d={clockwiseArc(SCHEMA_BEARINGS.B, SCHEMA_BEARINGS.C, 52)} fill="none" stroke="#8b5cf6" strokeWidth="1.8" markerEnd={`url(#${markerId})`} />
      <text x={mid1.x - 8} y={mid1.y} textAnchor="middle" className="text-[11px] fill-violet-600 font-mono">β₁</text>
      <text x={mid2.x + 6} y={mid2.y} textAnchor="middle" className="text-[11px] fill-violet-600 font-mono">β₂</text>
      <Point cx={pts.A.x} cy={pts.A.y} label="A" />
      <Point cx={pts.B.x} cy={pts.B.y} label="B" />
      <Point cx={pts.C.x} cy={pts.C.y} label="C" />
      <Point cx={SCHEMA_P.x} cy={SCHEMA_P.y} label="P" sublabel="?" dashed />
      <text x="14" y="22" className="text-[9px] fill-neutral-500 font-['Manrope']">
        {bg ? 'β₁: P→A към P→B' : 'β₁: P→A to P→B'}
      </text>
      <text x="14" y="34" className="text-[9px] fill-neutral-500 font-['Manrope']">
        {bg ? 'β₂: P→B към P→C' : 'β₂: P→B to P→C'}
      </text>
    </g>
  );
}

const TaskDiagramSvg = ({ toolKey, inputData, answers, bg }) => {
  const arrowId = useId();
  const caption = bg ? 'Схема (ориентировъчна)' : 'Diagram (schematic)';

  if (toolKey === 'first-basic-task') {
    const x1 = num(inputData.x1);
    const y1 = num(inputData.y1);
    const x2 = num(answers?.x2);
    const y2 = num(answers?.y2);
    const alpha = num(inputData.alpha);
    const s = num(inputData.s);
    const hasP2 = x2 != null && y2 != null;
    const mapper = createGeoMapper(
      [
        { x: x1, y: y1 },
        hasP2 ? { x: x2, y: y2 } : { x: (x1 ?? 0) + 40, y: (y1 ?? 0) + 30 },
      ],
      W,
      H
    );
    const { sx: px1, sy: py1 } = mapper.toScreen(x1 ?? 0, y1 ?? 0);
    const p2 = hasP2 ? mapper.toScreen(x2, y2) : rayEnd(px1, py1, alpha ?? 0, 55);
    const px2 = hasP2 ? p2.sx : p2.x;
    const py2 = hasP2 ? p2.sy : p2.y;
    const ray = rayEnd(px1, py1, alpha ?? 0, Math.hypot(px2 - px1, py2 - py1) * 0.85);

    return (
      <DiagramFrame bg={bg} caption={caption}>
        <Grid mapper={mapper} w={W} h={H} />
        {alpha != null && (
          <path d={arcPath(px1, py1, 28, alpha, 45)} fill="none" stroke="#8b5cf6" strokeWidth="1.5" />
        )}
        <line x1={px1} y1={py1} x2={px2} y2={py2} stroke="#8b5cf6" strokeWidth="2" markerEnd={`url(#${arrowId})`} />
        <defs>
          <marker id={arrowId} markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <polygon points="0 0, 6 3, 0 6" fill="#8b5cf6" />
          </marker>
        </defs>
        <text
          x={(px1 + px2) / 2}
          y={(py1 + py2) / 2 - 8}
          textAnchor="middle"
          className="text-[10px] fill-violet-600 font-mono"
        >
          S{s != null ? `=${s}` : ''}
        </text>
        <text x={px1 + 32} y={py1 - 18} className="text-[10px] fill-violet-600 font-mono">
          α{alpha != null ? `=${alpha}g` : ''}
        </text>
        <Point cx={px1} cy={py1} label="P₁" sublabel={x1 != null ? `${x1}, ${y1}` : null} />
        <Point cx={px2} cy={py2} label="P₂" sublabel={hasP2 ? `${x2}, ${y2}` : '?'} accent={hasP2} dashed={!hasP2} />
        <line x1={px1} y1={py1} x2={ray.x} y2={ray.y} strokeDasharray="3 3" className="stroke-neutral-300" strokeWidth="1" />
      </DiagramFrame>
    );
  }

  if (toolKey === 'second-basic-task') {
    const x1 = num(inputData.x1);
    const y1 = num(inputData.y1);
    const x2 = num(inputData.x2);
    const y2 = num(inputData.y2);
    const mapper = createGeoMapper(
      [
        { x: x1, y: y1 },
        { x: x2, y: y2 },
      ],
      W,
      H
    );
    const { sx: px1, sy: py1 } = mapper.toScreen(x1 ?? 0, y1 ?? 0);
    const { sx: px2, sy: py2 } = mapper.toScreen(x2 ?? 100, y2 ?? 100);
    const midX = (px1 + px2) / 2;
    const midY = (py1 + py2) / 2;
    const ang = Math.atan2(py2 - py1, px2 - px1);

    return (
      <DiagramFrame bg={bg} caption={caption}>
        <Grid mapper={mapper} w={W} h={H} />
        <line x1={px1} y1={py1} x2={px2} y2={py2} stroke="#8b5cf6" strokeWidth="2.5" />
        <text x={midX} y={midY - 10} textAnchor="middle" className="text-[10px] fill-violet-600 font-mono">
          S
        </text>
        <path
          d={`M ${px1} ${py1} L ${px1 + 30 * Math.cos(ang - 0.4)} ${py1 + 30 * Math.sin(ang - 0.4)}`}
          fill="none"
          stroke="#a78bfa"
          strokeWidth="1.5"
        />
        <text x={px1 + 20} y={py1 - 8} className="text-[10px] fill-violet-500 font-mono">
          α
        </text>
        <Point cx={px1} cy={py1} label="P₁" sublabel={`${x1}, ${y1}`} />
        <Point cx={px2} cy={py2} label="P₂" sublabel={`${x2}, ${y2}`} />
      </DiagramFrame>
    );
  }

  if (toolKey === 'forward-intersection') {
    const xA = num(inputData.xA);
    const yA = num(inputData.yA);
    const xB = num(inputData.xB);
    const yB = num(inputData.yB);
    const b1 = num(inputData.beta1);
    const b2 = num(inputData.beta2);
    const xP = num(answers?.xP);
    const yP = num(answers?.yP);
    const hasP = xP != null && yP != null;
    const mapper = createGeoMapper(
      [
        { x: xA, y: yA },
        { x: xB, y: yB },
        hasP ? { x: xP, y: yP } : null,
      ].filter(Boolean),
      W,
      H
    );
    const { sx: ax, sy: ay } = mapper.toScreen(xA ?? 0, yA ?? 0);
    const { sx: bx, sy: by } = mapper.toScreen(xB ?? 0, yB ?? 120);
    const pScreen = hasP ? mapper.toScreen(xP, yP) : null;
    // Real directions from the given data (never the answer): alpha_AP = alpha_AB - beta1 (P on the LEFT of A->B),
    // alpha_BP = alpha_BA + beta2, bearings in gon clockwise from north (+X).
    const alphaAB = (((Math.atan2((yB ?? 120) - (yA ?? 0), (xB ?? 0) - (xA ?? 0)) * 200) / Math.PI) + 400) % 400;
    const alphaBA = (alphaAB + 200) % 400;
    const rA = rayEnd(ax, ay, alphaAB - (b1 ?? 50), 90);
    const rB = rayEnd(bx, by, alphaBA + (b2 ?? 50), 90);

    return (
      <DiagramFrame bg={bg} caption={caption}>
        <Grid mapper={mapper} w={W} h={H} />
        <line x1={ax} y1={ay} x2={rA.x} y2={rA.y} className="stroke-violet-400" strokeWidth="1.5" strokeDasharray="6 4" />
        <line x1={bx} y1={by} x2={rB.x} y2={rB.y} className="stroke-violet-400" strokeWidth="1.5" strokeDasharray="6 4" />
        <line x1={ax} y1={ay} x2={bx} y2={by} className="stroke-neutral-300" strokeWidth="1" />
        {pScreen && <line x1={ax} y1={ay} x2={pScreen.sx} y2={pScreen.sy} className="stroke-neutral-300" strokeWidth="1" />}
        {pScreen && <line x1={bx} y1={by} x2={pScreen.sx} y2={pScreen.sy} className="stroke-neutral-300" strokeWidth="1" />}
        <text x={rA.x - 10} y={rA.y} className="text-[9px] fill-violet-500 font-mono">
          β₁
        </text>
        <text x={rB.x + 4} y={rB.y} className="text-[9px] fill-violet-500 font-mono">
          β₂
        </text>
        <Point cx={ax} cy={ay} label="A" />
        <Point cx={bx} cy={by} label="B" />
        {pScreen && <Point cx={pScreen.sx} cy={pScreen.sy} label="P" accent />}
      </DiagramFrame>
    );
  }

  if (toolKey === 'resection') {
    // Resection v2 convention SCHEMATIC. The station P is the unknown, so this diagram deliberately uses
    // NO task data at all (no coordinates, no student answer): it only illustrates that both measured
    // angles have their vertex at P and are directed, clockwise sweeps P->A to P->B (beta1) and
    // P->B to P->C (beta2). Nothing about the real geometry, and never the answer, can appear here.
    return (
      <DiagramFrame bg={bg} caption={bg ? 'Схема на конвенцията: ъглите са по ч. стр. в P' : 'Convention schematic: clockwise angles at P'}>
        <ResectionConventionSchematic bg={bg} />
      </DiagramFrame>
    );
  }


  return (
    <div className="w-full max-w-[340px] h-[140px] mx-auto rounded-xl border border-dashed border-stone-200 dark:border-zinc-700 flex items-center justify-center text-xs text-neutral-400 dark:text-zinc-400 font-['Manrope']">
      {bg ? 'Няма схема за този тип' : 'No diagram for this type'}
    </div>
  );
};

export default TaskDiagramSvg;
