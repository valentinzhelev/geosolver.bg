import React, { useState } from 'react';
import FieldProcessingResults from './FieldProcessingResults';
import TraverseProcessingResults from './TraverseProcessingResults';

const ALL_MODES = ['polar', 'traverse'];

/**
 * V2.4.2 section 26: a confirmed Field Notebook offers a processing CHOICE - "Полярна обработка" (V2.4.1, a single
 * setup's targets) or "Полигонов ход" (V2.4.2, a chain of setups). Both children manage their own run entirely
 * (their own start/results/save flow); this wrapper is only the tab switcher, so the server remains authoritative
 * for both and neither becomes a disconnected calculator screen.
 *
 * Field Sessions pass `availableModes` (only what the confirmed data can support - an impossible kind is not shown
 * at all) and `traverseSuggestions` (start station / end candidates inferred from the data, editable). Without
 * them it behaves exactly as before: both kinds, nothing pre-filled.
 */
const FieldProcessingWorkflow = ({ fieldObservationSetId, projectId, bg = true, availableModes = ALL_MODES, traverseSuggestions = null }) => {
  const modes = ALL_MODES.filter((m) => availableModes.includes(m));
  const [chosen, setChosen] = useState(modes[0] || 'polar');
  const mode = modes.includes(chosen) ? chosen : modes[0];
  const tab = (active) => `px-3 py-1.5 rounded-lg text-xs font-semibold font-['Manrope'] ${active ? 'bg-black dark:bg-white text-white dark:text-black' : 'bg-white dark:bg-zinc-900 outline outline-1 outline-gray-200 dark:outline-zinc-700'}`;
  if (!mode) return null;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-1.5" role="tablist" aria-label={bg ? 'Вид обработка' : 'Processing kind'}>
        {modes.includes('polar') && (
          <button type="button" role="tab" aria-selected={mode === 'polar'} className={tab(mode === 'polar')} onClick={() => setChosen('polar')} data-testid="field-processing-mode-polar">
            {bg ? 'Полярна обработка' : 'Polar processing'}
          </button>
        )}
        {modes.includes('traverse') && (
          <button type="button" role="tab" aria-selected={mode === 'traverse'} className={tab(mode === 'traverse')} onClick={() => setChosen('traverse')} data-testid="field-processing-mode-traverse">
            {bg ? 'Полигонов ход' : 'Traverse'}
          </button>
        )}
      </div>
      {mode === 'polar'
        ? <FieldProcessingResults fieldObservationSetId={fieldObservationSetId} projectId={projectId} bg={bg} />
        : <TraverseProcessingResults fieldObservationSetId={fieldObservationSetId} projectId={projectId} bg={bg} suggestions={traverseSuggestions} />}
    </div>
  );
};

export default FieldProcessingWorkflow;
