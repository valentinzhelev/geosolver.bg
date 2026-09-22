import React, { useState } from 'react';
import FieldProcessingResults from './FieldProcessingResults';
import TraverseProcessingResults from './TraverseProcessingResults';

/**
 * V2.4.2 section 26: a confirmed Field Notebook offers a processing CHOICE - "Полярна обработка" (V2.4.1, a single
 * setup's targets) or "Полигонов ход" (V2.4.2, a chain of setups). Both children manage their own run entirely
 * (their own start/results/save flow); this wrapper is only the tab switcher, so the server remains authoritative
 * for both and neither becomes a disconnected calculator screen.
 */
const FieldProcessingWorkflow = ({ fieldObservationSetId, projectId, bg = true }) => {
  const [mode, setMode] = useState('polar');
  const tab = (active) => `px-3 py-1.5 rounded-lg text-xs font-semibold font-['Manrope'] ${active ? 'bg-black dark:bg-white text-white dark:text-black' : 'bg-white dark:bg-zinc-900 outline outline-1 outline-gray-200 dark:outline-zinc-700'}`;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-1.5" role="tablist" aria-label={bg ? 'Вид обработка' : 'Processing kind'}>
        <button type="button" role="tab" aria-selected={mode === 'polar'} className={tab(mode === 'polar')} onClick={() => setMode('polar')} data-testid="field-processing-mode-polar">
          {bg ? 'Полярна обработка' : 'Polar processing'}
        </button>
        <button type="button" role="tab" aria-selected={mode === 'traverse'} className={tab(mode === 'traverse')} onClick={() => setMode('traverse')} data-testid="field-processing-mode-traverse">
          {bg ? 'Полигонов ход' : 'Traverse'}
        </button>
      </div>
      {mode === 'polar'
        ? <FieldProcessingResults fieldObservationSetId={fieldObservationSetId} projectId={projectId} bg={bg} />
        : <TraverseProcessingResults fieldObservationSetId={fieldObservationSetId} projectId={projectId} bg={bg} />}
    </div>
  );
};

export default FieldProcessingWorkflow;
