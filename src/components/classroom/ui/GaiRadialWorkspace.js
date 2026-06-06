import React, { useCallback, useLayoutEffect, useRef, useState } from 'react';
import GaiSideCallout from './GaiSideCallout';

const GaiRadialWorkspace = ({ leftCallouts = [], rightCallouts = [], children, mobileCallouts }) => {
  const mobile = mobileCallouts || [...leftCallouts, ...rightCallouts];

  const containerRef = useRef(null);
  const centerRef = useRef(null);
  const calloutRefs = useRef({});

  const [lines, setLines] = useState([]);
  const [hubs, setHubs] = useState(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  const setCalloutRef = useCallback((key) => (el) => {
    if (el) calloutRefs.current[key] = el;
    else delete calloutRefs.current[key];
  }, []);

  const recompute = useCallback(() => {
    const container = containerRef.current;
    const center = centerRef.current;
    if (!container || !center) return;

    const cRect = container.getBoundingClientRect();
    const mRect = center.getBoundingClientRect();
    if (cRect.width === 0) return;

    setSize({ w: cRect.width, h: cRect.height });

    const midY = mRect.top - cRect.top + mRect.height / 2;
    const leftHub = { x: mRect.left - cRect.left, y: midY };
    const rightHub = { x: mRect.right - cRect.left, y: midY };
    setHubs({ left: leftHub, right: rightHub });

    const next = [];
    const build = (items, side) => {
      const hub = side === 'left' ? leftHub : rightHub;
      items.forEach((c) => {
        const el = calloutRefs.current[c.key];
        if (!el) return;
        const r = el.getBoundingClientRect();
        if (r.width === 0) return;
        const end =
          side === 'left'
            ? { x: r.right - cRect.left, y: r.top - cRect.top + r.height / 2 }
            : { x: r.left - cRect.left, y: r.top - cRect.top + r.height / 2 };
        const dx = end.x - hub.x;
        const c1 = { x: hub.x + dx * 0.5, y: hub.y };
        const c2 = { x: end.x - dx * 0.5, y: end.y };
        const d = `M ${hub.x.toFixed(1)} ${hub.y.toFixed(1)} C ${c1.x.toFixed(1)} ${c1.y.toFixed(1)} ${c2.x.toFixed(1)} ${c2.y.toFixed(1)} ${end.x.toFixed(1)} ${end.y.toFixed(1)}`;
        next.push({ key: c.key, d });
      });
    };
    build(leftCallouts, 'left');
    build(rightCallouts, 'right');
    setLines(next);
  }, [leftCallouts, rightCallouts]);

  useLayoutEffect(() => {
    recompute();
    const ro = new ResizeObserver(() => recompute());
    if (containerRef.current) ro.observe(containerRef.current);
    if (centerRef.current) ro.observe(centerRef.current);
    Object.values(calloutRefs.current).forEach((el) => el && ro.observe(el));
    const t = setTimeout(recompute, 350); // after entrance animations settle
    window.addEventListener('resize', recompute);
    return () => {
      ro.disconnect();
      clearTimeout(t);
      window.removeEventListener('resize', recompute);
    };
  }, [recompute]);

  return (
    <div ref={containerRef} className="relative w-full py-4 md:py-10">
      {/* Ambient stage glow (neutral) */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[680px] h-[420px] max-w-full
          bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.05),transparent_65%)]
          dark:bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.06),transparent_65%)]"
        aria-hidden
      />

      {/* Connecting lines (desktop) */}
      {size.w > 0 && (
        <svg
          className="hidden xl:block absolute inset-0 pointer-events-none z-0 text-stone-400 dark:text-zinc-500"
          width={size.w}
          height={size.h}
          viewBox={`0 0 ${size.w} ${size.h}`}
          fill="none"
        >
          {lines.map((l, i) => {
            const delay = `${0.25 + i * 0.12}s`;
            const pathId = `gai-path-${String(l.key).replace(/[^a-zA-Z0-9_-]/g, '-')}`;
            return (
              <g key={l.key}>
                <path d={l.d} stroke="currentColor" strokeWidth="6" strokeOpacity="0.12" strokeLinecap="round" />
                <path
                  id={pathId}
                  d={l.d}
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeOpacity="0.85"
                  pathLength="1"
                  className="animate-gai-draw"
                  style={{ strokeDasharray: 1, strokeDashoffset: 1, animationDelay: delay }}
                />
                <circle r="3" fill="currentColor">
                  <animateMotion dur="3.2s" begin={`${i * 0.35}s`} repeatCount="indefinite" rotate="auto">
                    <mpath href={`#${pathId}`} />
                  </animateMotion>
                </circle>
              </g>
            );
          })}

          {/* Hub nodes on the center card edges (neutral) */}
          {hubs &&
            [hubs.left, hubs.right].map((h, idx) => (
              <g key={idx} className="text-black dark:text-white">
                <circle cx={h.x} cy={h.y} r="9" fill="currentColor" fillOpacity="0.08" />
                <circle cx={h.x} cy={h.y} r="4.5" fill="currentColor" fillOpacity="0.18" />
                <circle cx={h.x} cy={h.y} r="2.5" fill="currentColor" />
              </g>
            ))}
        </svg>
      )}

      <div className="relative grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(300px,400px)_minmax(0,1fr)] gap-6 xl:gap-8 items-center max-w-6xl mx-auto z-10">
        <div className="hidden xl:flex flex-col gap-6 items-end">
          {leftCallouts.map((c, i) => (
            <GaiSideCallout
              key={c.key}
              ref={setCalloutRef(c.key)}
              title={c.title}
              body={c.body}
              variant={c.variant}
              align="left"
              icon={c.icon}
              long={c.long}
              index={i}
            />
          ))}
        </div>

        <div ref={centerRef} className="w-full max-w-md mx-auto xl:max-w-none relative z-20">
          {children}
        </div>

        <div className="hidden xl:flex flex-col gap-6 items-start">
          {rightCallouts.map((c, i) => (
            <GaiSideCallout
              key={c.key}
              ref={setCalloutRef(c.key)}
              title={c.title}
              body={c.body}
              variant={c.variant}
              align="right"
              icon={c.icon}
              long={c.long}
              index={i}
            />
          ))}
        </div>
      </div>

      {/* Mobile / tablet stacked callouts */}
      {mobile.length > 0 && (
        <div className="xl:hidden mt-6 grid sm:grid-cols-2 gap-4">
          {mobile.map((c, i) => (
            <GaiSideCallout
              key={c.key}
              title={c.title}
              body={c.body}
              variant={c.variant}
              align="left"
              icon={c.icon}
              long={c.long}
              index={i}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default GaiRadialWorkspace;
