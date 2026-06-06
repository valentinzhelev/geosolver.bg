import React, { forwardRef } from 'react';

const gradientStyle = {
  backgroundImage: 'url(/images/gradient_wallpaper.jpg)',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
};

const Svg = ({ children, fill }) => (
  <svg
    viewBox="0 0 24 24"
    className="w-4 h-4"
    fill={fill ? 'currentColor' : 'none'}
    stroke={fill ? 'none' : 'currentColor'}
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    {children}
  </svg>
);

const ICONS = {
  gai: <Svg fill><path d="M12 2l1.6 6.4L20 10l-6.4 1.6L12 18l-1.6-6.4L4 10l6.4-1.6z" /></Svg>,
  check: <Svg><path d="M5 13l4 4L19 7" /></Svg>,
  warn: (
    <Svg>
      <path d="M12 4l9 16H3z" />
      <path d="M12 10v4" />
      <path d="M12 17h.01" />
    </Svg>
  ),
  tip: (
    <Svg>
      <path d="M4 12h14" />
      <path d="M13 6l6 6-6 6" />
    </Svg>
  ),
  method: (
    <Svg>
      <path d="M3 21L21 3" />
      <path d="M3 21V9" />
      <path d="M3 21h12" />
    </Svg>
  ),
  target: (
    <Svg>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3.5" />
    </Svg>
  ),
  settings: (
    <Svg>
      <path d="M4 7h11" />
      <path d="M19 7h1" />
      <circle cx="17" cy="7" r="2" />
      <path d="M4 17h7" />
      <path d="M15 17h5" />
      <circle cx="13" cy="17" r="2" />
    </Svg>
  ),
  peer: (
    <Svg>
      <path d="M5 21V11" />
      <path d="M12 21V4" />
      <path d="M19 21v-7" />
    </Svg>
  ),
  bolt: <Svg fill><path d="M13 2L4 14h6l-1 8 9-12h-6z" /></Svg>,
};

const renderIcon = (icon) => {
  if (!icon) return null;
  if (typeof icon === 'string') return ICONS[icon] || null;
  return icon;
};

const GaiSideCallout = forwardRef(
  ({ title, body, variant = 'default', align = 'left', icon, long = false, index = 0 }, ref) => {
    const isLeft = align === 'left';
    const delay = `${0.2 + index * 0.12}s`;
    const renderedIcon = renderIcon(icon);

    return (
      <div
        ref={ref}
        className={`group relative ${long ? 'w-[260px]' : 'w-[240px]'} opacity-0 animate-gai-card-in [transform-style:preserve-3d]`}
        style={{ animationDelay: delay, '--gai-in-x': isLeft ? '24px' : '-24px' }}
      >
        {/* Connection node on the edge facing the center card */}
        <span
          className={`hidden xl:block absolute top-1/2 -translate-y-1/2 ${isLeft ? '-right-1.5' : '-left-1.5'} z-20`}
          aria-hidden
        >
          <span className="block w-3 h-3 rounded-full ring-2 ring-white dark:ring-zinc-950 shadow" style={gradientStyle} />
          <span
            className="absolute inset-0 rounded-full bg-stone-400/60 dark:bg-zinc-400/50 animate-gai-node-pulse"
            style={{ animationDelay: delay }}
          />
        </span>

        <div
          className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-stone-50 dark:from-zinc-900 dark:to-zinc-900
            ring-1 ring-stone-200/80 dark:ring-zinc-700
            shadow-[0_6px_20px_-6px_rgba(0,0,0,0.18),0_2px_6px_-2px_rgba(0,0,0,0.12)]
            dark:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.6)]
            transition-all duration-300 ease-out
            group-hover:-translate-y-1.5 group-hover:shadow-[0_18px_40px_-12px_rgba(0,0,0,0.30)] group-hover:shadow-black/20
            font-['Manrope']`}
        >
          {/* Brand-gradient accent bar */}
          <span className={`absolute top-0 bottom-0 ${isLeft ? 'right-0' : 'left-0'} w-1`} style={gradientStyle} aria-hidden />
          {/* Sheen */}
          <span className="pointer-events-none absolute -top-1/2 -left-1/4 w-1/2 h-[200%] rotate-12 bg-gradient-to-r from-white/50 to-transparent dark:from-white/5 opacity-0 group-hover:opacity-100 group-hover:translate-x-[260%] transition-all duration-700" aria-hidden />

          <div className={`relative flex items-start gap-2.5 px-4 py-3 ${isLeft ? 'pr-5' : 'pl-5'}`}>
            {renderedIcon && (
              <span className="shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-lg bg-stone-100 text-stone-700 dark:bg-zinc-800 dark:text-zinc-200 shadow-sm transition-transform duration-300 group-hover:scale-110">
                {renderedIcon}
              </span>
            )}
            <div className="min-w-0">
              {title && (
                <p className="text-sm font-bold text-black dark:text-white leading-snug">{title}</p>
              )}
              {body && (
                <p
                  className={`text-xs text-neutral-600 dark:text-zinc-400 mt-1 leading-relaxed ${
                    long ? 'max-h-32 overflow-y-auto pr-1' : ''
                  }`}
                >
                  {body}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

GaiSideCallout.displayName = 'GaiSideCallout';

export default GaiSideCallout;
