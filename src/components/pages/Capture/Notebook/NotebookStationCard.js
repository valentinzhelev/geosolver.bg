import React from 'react';
import NotebookFieldInput from './NotebookFieldInput';
import { fieldAddrKey } from '../../../../utils/captureView';

/**
 * The station + orientation ("backsight") card for one setup. A setup may have no orientation at all (a soft
 * warning on the server, never invented here).
 */
const NotebookStationCard = ({ setup, selectedKey, onSelect, onCommit, disabled = false, bg = true }) => {
  const addr = (section, field) => ({ setup: setup.index, section, field });
  const isSelected = (a) => fieldAddrKey(a) === selectedKey;
  return (
    <div className="flex flex-col gap-3 p-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900" data-testid="notebook-station-card">
      <div className="text-xs font-bold uppercase tracking-wide text-neutral-500 dark:text-zinc-400 font-['Manrope']">
        {bg ? `Станция ${setup.index + 1}` : `Setup ${setup.index + 1}`}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <NotebookFieldInput
          cell={setup.station.point} addr={addr('station', 'point')} label={bg ? 'Станция' : 'Station'}
          selected={isSelected(addr('station', 'point'))} onSelect={onSelect} onCommit={onCommit} disabled={disabled} bg={bg}
        />
        <NotebookFieldInput
          cell={setup.station.instrumentHeight} addr={addr('station', 'instrumentHeight')} label={bg ? 'Височина на инструмента (i)' : 'Instrument height (i)'}
          selected={isSelected(addr('station', 'instrumentHeight'))} onSelect={onSelect} onCommit={onCommit} disabled={disabled} bg={bg}
        />
      </div>
      {setup.orientation ? (
        <div className="grid grid-cols-2 gap-2">
          <NotebookFieldInput
            cell={setup.orientation.target} addr={addr('orientation', 'target')} label={bg ? 'Ориентир' : 'Backsight'}
            selected={isSelected(addr('orientation', 'target'))} onSelect={onSelect} onCommit={onCommit} disabled={disabled} bg={bg}
          />
          {setup.orientation.direction && (
            <NotebookFieldInput
              cell={setup.orientation.direction} addr={addr('orientation', 'direction')} label={bg ? 'Посока' : 'Direction'}
              selected={isSelected(addr('orientation', 'direction'))} onSelect={onSelect} onCommit={onCommit} disabled={disabled} bg={bg}
            />
          )}
        </div>
      ) : (
        <p className="text-[11px] text-amber-700 dark:text-amber-400 font-['Manrope']" data-testid="notebook-no-orientation">
          ! {bg ? 'Няма зададена ориентация за тази станция.' : 'No orientation set for this station.'}
        </p>
      )}
      {setup.issues && setup.issues.length > 0 && (
        <ul className="text-xs text-neutral-600 dark:text-zinc-300 font-['Manrope'] list-disc pl-5">
          {setup.issues.map((i, n) => <li key={`${i.code}-${n}`}>{i.severity === 'error' ? '✕ ' : '! '}{i.message}</li>)}
        </ul>
      )}
    </div>
  );
};

export default NotebookStationCard;
