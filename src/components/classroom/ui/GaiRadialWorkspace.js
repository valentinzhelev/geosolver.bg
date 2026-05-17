import React from 'react';
import GaiSideCallout from './GaiSideCallout';

const CircuitBg = () => (
  <svg
    className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.07] dark:opacity-[0.12]"
    aria-hidden
  >
    <path d="M20 40 H120 M120 40 V100 M120 100 H200" stroke="currentColor" fill="none" />
    <path d="M280 60 H380 M380 60 V140" stroke="currentColor" fill="none" />
    <circle cx="120" cy="40" r="3" fill="currentColor" />
    <circle cx="200" cy="100" r="3" fill="currentColor" />
    <circle cx="380" cy="140" r="3" fill="currentColor" />
  </svg>
);

const CalloutColumn = ({ items, align }) => (
  <div className={`flex flex-col gap-5 ${align === 'left' ? 'items-end' : 'items-start'}`}>
    {items.map((c) => (
      <GaiSideCallout
        key={c.key}
        title={c.title}
        body={c.body}
        variant={c.variant}
        align={c.align}
        icon={c.icon}
        long={c.long}
      />
    ))}
  </div>
);

const GaiRadialWorkspace = ({ leftCallouts = [], rightCallouts = [], children, mobileCallouts }) => {
  const mobile = mobileCallouts || [...leftCallouts, ...rightCallouts];

  return (
    <div className="relative w-full py-4 md:py-8">
      <CircuitBg />
      <div className="relative grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(300px,400px)_minmax(0,1fr)] gap-6 xl:gap-4 items-center max-w-6xl mx-auto">
        <div className="hidden xl:block">
          <CalloutColumn items={leftCallouts} align="left" />
        </div>

        <div className="w-full max-w-md mx-auto xl:max-w-none z-10">{children}</div>

        <div className="hidden xl:block">
          <CalloutColumn items={rightCallouts} align="right" />
        </div>
      </div>

      {mobile.length > 0 && (
        <div className="xl:hidden mt-6 grid sm:grid-cols-2 gap-3">
          {mobile.map((c) => (
            <GaiSideCallout
              key={c.key}
              title={c.title}
              body={c.body}
              variant={c.variant}
              align="left"
              icon={c.icon}
              long={c.long}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default GaiRadialWorkspace;
