import React from 'react';
import { evidenceLine, fmtMeasure } from '../../../../utils/fieldSessionView';

/**
 * The CONFIRMED observations of a session, read-only, exactly as they were confirmed (typed values with their
 * units). This is evidence: nothing here is editable, and a correction is a new revision of the session.
 */
const SessionEvidence = ({ evidence, bg = true }) => {
  const setups = (evidence && evidence.setups) || [];
  if (!setups.length) {
    return <p className="text-sm text-neutral-500 font-['Manrope']" data-testid="session-evidence-empty">{bg ? 'Няма потвърдени наблюдения.' : 'No confirmed observations.'}</p>;
  }
  return (
    <div className="flex flex-col gap-3" data-testid="session-evidence">
      <p className="text-xs text-neutral-500 dark:text-zinc-400 font-['Manrope']">
        {bg
          ? 'Потвърдени теренни данни. Те не могат да се променят – за корекция се създава ревизия на сесията.'
          : 'Confirmed field data. It cannot be changed - a correction is a revision of the session.'}
      </p>
      {setups.map((s) => (
        <section key={s.index} className="flex flex-col gap-2 p-3 rounded-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900" data-testid="session-evidence-station">
          <h3 className="text-sm font-bold font-['Manrope'] text-black dark:text-white">
            {bg ? 'Станция' : 'Station'} {s.station.point}
            {s.station.instrumentHeight && <span className="font-normal text-neutral-500"> · {bg ? 'височина на инструмента' : 'instrument height'} {fmtMeasure(s.station.instrumentHeight)}</span>}
          </h3>
          <p className="text-xs text-neutral-500 dark:text-zinc-400 font-['Manrope']">
            {s.orientation && s.orientation.target
              ? `${bg ? 'Ориентир' : 'Backsight'} ${s.orientation.target}${s.orientation.direction ? ` · ${s.orientation.direction.value} ${s.orientation.direction.unit === 'deg' ? '°' : 'gon'}` : ''}`
              : (bg ? 'Няма записан ориентир' : 'No backsight recorded')}
          </p>
          <ul className="flex flex-col divide-y divide-gray-100 dark:divide-zinc-800">
            {s.observations.map((o) => (
              <li key={o.row} className="py-1.5 text-sm font-['Manrope']" data-testid="session-evidence-row">
                <span className="font-semibold text-black dark:text-white">{o.target}</span>
                <span className="block text-xs text-neutral-600 dark:text-zinc-300">{evidenceLine(o, bg)}</span>
                {(o.code || o.notes) && <span className="block text-[11px] text-neutral-400">{[o.code, o.notes].filter(Boolean).join(' · ')}</span>}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
};

export default SessionEvidence;
