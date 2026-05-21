import React, { useEffect, useState } from 'react';

const storageKey = (assignmentId) => `geosolver_edu_steps_${assignmentId}`;

const CalculatorStepChecklist = ({ assignmentId, steps, bg }) => {
  const [checked, setChecked] = useState({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey(assignmentId));
      if (raw) setChecked(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, [assignmentId]);

  const toggle = (key) => {
    const next = { ...checked, [key]: !checked[key] };
    setChecked(next);
    localStorage.setItem(storageKey(assignmentId), JSON.stringify(next));
  };

  if (!steps?.length) return null;

  const done = steps.filter((s) => checked[s.key]).length;

  return (
    <div className="rounded-lg border border-stone-200 dark:border-zinc-700 p-3 bg-stone-50/80 dark:bg-zinc-900/80 dark:bg-zinc-800/50">
      <p className="text-xs font-semibold uppercase text-neutral-500 dark:text-zinc-400 mb-2 font-['Manrope'] flex justify-between">
        <span>{bg ? 'Междинни стъпки (калкулатор)' : 'Calculator steps'}</span>
        <span>
          {done}/{steps.length}
        </span>
      </p>
      <ul className="flex flex-col gap-1.5">
        {steps.map((s) => (
          <li key={s.key}>
            <label className="flex items-center gap-2 text-sm font-['Manrope'] cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(checked[s.key])}
                onChange={() => toggle(s.key)}
                className="rounded border-stone-300"
              />
              <span className={checked[s.key] ? 'text-neutral-500 dark:text-zinc-400 line-through' : 'text-black dark:text-white'}>
                {bg ? s.labelBg : s.labelEn}
              </span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CalculatorStepChecklist;
