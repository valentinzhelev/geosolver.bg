import React, { useId } from 'react';
import { num, createGeoMapper, rayEnd, arcPath } from '../../../utils/geoDiagramUtils';

const W = 320;
const H = 240;

function NorthArrow({ x, y, bg }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <line x1="0" y1="8" x2="0" y2="-14" stroke="currentColor" strokeWidth="1.5" className="text-neutral-400" />
      <polygon points="0,-18 -4,-10 4,-10" className="fill-neutral-500" />
      <text x="0" y="-22" textAnchor="middle" className="text-[9px] fill-neutral-500 font-['Manrope']">
        Y
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
    const px1 = mapper.sx(x1 ?? 0);
    const py1 = mapper.sy(y1 ?? 0);
    const px2 = hasP2 ? mapper.sx(x2) : rayEnd(px1, py1, alpha ?? 0, 55).x;
    const py2 = hasP2 ? mapper.sy(y2) : rayEnd(px1, py1, alpha ?? 0, 55).y;
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
    const px1 = mapper.sx(x1 ?? 0);
    const py1 = mapper.sy(y1 ?? 0);
    const px2 = mapper.sx(x2 ?? 100);
    const py2 = mapper.sy(y2 ?? 100);
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
    const ax = mapper.sx(xA ?? 0);
    const ay = mapper.sy(yA ?? 0);
    const bx = mapper.sx(xB ?? 120);
    const by = mapper.sy(yB ?? 0);
    const px = hasP ? mapper.sx(xP) : (ax + bx) / 2;
    const py = hasP ? mapper.sy(yP) : Math.min(ay, by) - 40;
    const rA = rayEnd(ax, ay, b1 ?? 50, 90);
    const rB = rayEnd(bx, by, b2 ?? 310, 90);

    return (
      <DiagramFrame bg={bg} caption={caption}>
        <Grid mapper={mapper} w={W} h={H} />
        <line x1={ax} y1={ay} x2={rA.x} y2={rA.y} className="stroke-violet-400" strokeWidth="1.5" strokeDasharray="6 4" />
        <line x1={bx} y1={by} x2={rB.x} y2={rB.y} className="stroke-violet-400" strokeWidth="1.5" strokeDasharray="6 4" />
        <line x1={ax} y1={ay} x2={px} y2={py} className="stroke-neutral-300" strokeWidth="1" />
        <line x1={bx} y1={by} x2={px} y2={py} className="stroke-neutral-300" strokeWidth="1" />
        <text x={rA.x - 10} y={rA.y} className="text-[9px] fill-violet-500 font-mono">
          β₁
        </text>
        <text x={rB.x + 4} y={rB.y} className="text-[9px] fill-violet-500 font-mono">
          β₂
        </text>
        <Point cx={ax} cy={ay} label="A" />
        <Point cx={bx} cy={by} label="B" />
        <Point cx={px} cy={py} label="P" accent={hasP} dashed={!hasP} />
      </DiagramFrame>
    );
  }

  if (toolKey === 'resection') {
    const xA = num(inputData.xA);
    const yA = num(inputData.yA);
    const xB = num(inputData.xB);
    const yB = num(inputData.yB);
    const xC = num(inputData.xC);
    const yC = num(inputData.yC);
    const b1 = num(inputData.beta1);
    const b2 = num(inputData.beta2);
    const xP = num(answers?.xP);
    const yP = num(answers?.yP);
    const hasP = xP != null && yP != null;
    const mapper = createGeoMapper(
      [
        { x: xA, y: yA },
        { x: xB, y: yB },
        { x: xC, y: yC },
        hasP ? { x: xP, y: yP } : null,
      ].filter(Boolean),
      W,
      H
    );
    const ax = mapper.sx(xA ?? 0);
    const ay = mapper.sy(yA ?? 0);
    const bx = mapper.sx(xB ?? 80);
    const by = mapper.sy(yB ?? 120);
    const cx = mapper.sx(xC ?? 160);
    const cy = mapper.sy(yC ?? 40);
    const px = hasP ? mapper.sx(xP) : (ax + bx + cx) / 3;
    const py = hasP ? mapper.sy(yP) : (ay + by + cy) / 3;
    const rA = rayEnd(ax, ay, b1 ?? 0, 75);
    const rB = rayEnd(bx, by, b2 ?? 0, 75);

    return (
      <DiagramFrame bg={bg} caption={caption}>
        <Grid mapper={mapper} w={W} h={H} />
        <polygon
          points={`${ax},${ay} ${bx},${by} ${cx},${cy}`}
          fill="none"
          className="stroke-neutral-200 dark:stroke-zinc-600"
          strokeWidth="1"
        />
        <line x1={ax} y1={ay} x2={rA.x} y2={rA.y} className="stroke-violet-400" strokeWidth="1.5" strokeDasharray="5 3" />
        <line x1={bx} y1={by} x2={rB.x} y2={rB.y} className="stroke-violet-400" strokeWidth="1.5" strokeDasharray="5 3" />
        <line x1={ax} y1={ay} x2={px} y2={py} className="stroke-neutral-300" strokeWidth="1" />
        <line x1={bx} y1={by} x2={px} y2={py} className="stroke-neutral-300" strokeWidth="1" />
        <line x1={cx} y1={cy} x2={px} y2={py} className="stroke-neutral-300" strokeWidth="1" />
        <Point cx={ax} cy={ay} label="A" />
        <Point cx={bx} cy={by} label="B" />
        <Point cx={cx} cy={cy} label="C" />
        <Point cx={px} cy={py} label="P" accent={hasP} dashed={!hasP} />
      </DiagramFrame>
    );
  }

  return (
    <div className="w-full max-w-[340px] h-[140px] mx-auto rounded-xl border border-dashed border-stone-200 dark:border-zinc-700 flex items-center justify-center text-xs text-neutral-400 font-['Manrope']">
      {bg ? 'Няма схема за този тип' : 'No diagram for this type'}
    </div>
  );
};

export default TaskDiagramSvg;
