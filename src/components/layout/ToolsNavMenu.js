import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getWorkspaceTools, isToolsNavActive } from '../../config/workspaceTools';

const ToolsNavMenu = ({ t, language, user, showFieldBooks, variant = 'desktop', onNavigate }) => {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const bg = language === 'bg';
  const active = isToolsNavActive(location.pathname);
  const workspaces = getWorkspaceTools({ language, showFieldBooks });
  const showWorkspaces = Boolean(user);

  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const close = () => {
    setOpen(false);
    onNavigate?.();
  };

  if (variant === 'mobile') {
    if (!showWorkspaces) {
      return (
        <Link
          to="/tools"
          onClick={close}
          className="self-stretch p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-700 inline-flex justify-start items-center gap-3"
        >
          <div className="text-black dark:text-white text-sm font-medium font-['Manrope']">{t.tools}</div>
          <img src="/icons/small_header_icon.svg" alt="" className="w-3 h-3" />
        </Link>
      );
    }

    return (
      <div className="self-stretch flex flex-col gap-1">
        <Link
          to="/tools"
          onClick={close}
          className="self-stretch p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-700 inline-flex justify-start items-center gap-3"
        >
          <div className="text-black dark:text-white text-sm font-medium font-['Manrope']">
            {bg ? 'Координатни калкулатори' : 'Coordinate calculators'}
          </div>
          <img src="/icons/small_header_icon.svg" alt="" className="w-3 h-3" />
        </Link>
        <div className="pl-3 flex flex-col gap-1">
          <div className="text-neutral-400 text-xs font-semibold font-['Manrope'] px-3 py-1">
            {bg ? 'Работни пространства' : 'Workspaces'}
          </div>
          {workspaces.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={close}
              className="self-stretch p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-700 inline-flex justify-between items-center gap-3"
            >
              <span className="text-black dark:text-white text-sm font-medium font-['Manrope']">{item.label}</span>
              {item.beta && (
                <span className="px-2 py-0.5 bg-gray-200 dark:bg-zinc-900 rounded text-black dark:text-white text-xs font-bold font-['Manrope']">
                  {t.beta}
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>
    );
  }

  const navClass = `px-3 py-1 rounded-lg flex justify-center items-center gap-1 ${
    active ? 'text-black dark:text-white' : 'text-neutral-400 dark:text-zinc-400'
  } text-base font-medium font-['Manrope'] hover:text-black dark:hover:text-white`;

  if (!showWorkspaces) {
    return (
      <Link to="/tools" className={navClass}>
        {t.tools}
      </Link>
    );
  }

  return (
    <div ref={rootRef} className="relative">
      <div className="flex items-center">
        <Link to="/tools" className={navClass}>
          {t.tools}
        </Link>
        <button
          type="button"
          aria-expanded={open}
          aria-haspopup="true"
          aria-label={bg ? 'Други инструменти' : 'More tools'}
          onClick={() => setOpen((v) => !v)}
          className={`ml-0.5 w-6 h-6 rounded-md flex items-center justify-center transition-colors ${
            active ? 'text-black dark:text-white' : 'text-neutral-400 dark:text-zinc-400'
          } hover:bg-gray-100 dark:hover:bg-zinc-900`}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
            <path d="M2 4l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {open && (
        <div className="absolute left-0 top-full mt-2 w-56 py-2 bg-white dark:bg-zinc-900 rounded-xl shadow-lg outline outline-1 outline-gray-200 dark:outline-zinc-700 z-50">
          <Link
            to="/tools"
            onClick={close}
            className="block px-4 py-2.5 text-sm font-medium font-['Manrope'] text-black dark:text-white hover:bg-stone-50 dark:hover:bg-zinc-800"
          >
            {bg ? 'Координатни калкулатори' : 'Coordinate calculators'}
          </Link>
          <div className="my-1.5 mx-3 border-t border-gray-200 dark:border-zinc-700" />
          <div className="px-4 py-1 text-[10px] font-semibold uppercase tracking-wide text-neutral-400 font-['Manrope']">
            {bg ? 'Работни пространства' : 'Workspaces'}
          </div>
          {workspaces.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={close}
              className={`flex items-center justify-between px-4 py-2.5 text-sm font-medium font-['Manrope'] hover:bg-stone-50 dark:hover:bg-zinc-800 ${
                location.pathname.startsWith(item.prefix)
                  ? 'text-black dark:text-white'
                  : 'text-neutral-600 dark:text-zinc-300'
              }`}
            >
              <span>{item.label}</span>
              {item.beta && (
                <span className="px-2 py-0.5 bg-gray-200 dark:bg-zinc-800 rounded text-[10px] font-bold">{t.beta}</span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default ToolsNavMenu;
