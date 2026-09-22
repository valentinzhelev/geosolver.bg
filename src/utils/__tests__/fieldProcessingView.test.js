import {
  statusLabel, statusTone, fmtCoord, fmtAngle, allObservations, runCounts, runSummaryText, savableCount, setupErrorMessage,
} from '../fieldProcessingView';

const run = (over = {}) => ({
  setups: [
    { index: 0, setupError: null, observations: [
      { index: 0, target: '201', status: 'READY', x: 4700050, y: 500050, h: 120.842 },
      { index: 1, target: '202', status: 'XY_ONLY', x: 4700072.114, y: 500031.442, h: null },
    ] },
    { index: 1, setupError: null, observations: [
      { index: 0, target: '203', status: 'ERROR', x: null, y: null, h: null, errors: [{ code: 'MISSING_DISTANCE', message: 'Липсва разстояние.' }] },
      { index: 1, target: '204', status: 'WARNING', x: 1, y: 2, h: null },
    ] },
  ],
  ...over,
});

describe('statusLabel / statusTone: readable without colour alone', () => {
  it('every status has a symbol AND a word, in both languages', () => {
    expect(statusLabel('READY')).toBe('✓ Готово');
    expect(statusLabel('XY_ONLY')).toBe('~ Само X/Y');
    expect(statusLabel('WARNING')).toBe('! Предупреждение');
    expect(statusLabel('ERROR', false)).toBe('✕ Invalid');
    expect(statusTone('READY')).toMatch(/emerald/);
  });
});

describe('fmtCoord / fmtAngle: never fabricate a value', () => {
  it('formats a finite number to the given decimals', () => {
    expect(fmtCoord(4700050, 3)).toBe('4700050.000');
    expect(fmtAngle(94.5, 4)).toBe('94.5000 g');
  });
  it('null/undefined/NaN become an em dash, never 0', () => {
    expect(fmtCoord(null)).toBe('—');
    expect(fmtCoord(undefined)).toBe('—');
    expect(fmtCoord(NaN)).toBe('—');
  });
});

describe('allObservations: flattens every setup, keeping its setup index', () => {
  it('example table shape: 201 | X | Y | H | Ready etc.', () => {
    const rows = allObservations(run());
    expect(rows).toHaveLength(4);
    expect(rows[0]).toMatchObject({ setupIndex: 0, target: '201', status: 'READY' });
    expect(rows[2]).toMatchObject({ setupIndex: 1, target: '203', status: 'ERROR' });
  });
  it('handles a missing run gracefully', () => {
    expect(allObservations(null)).toEqual([]);
  });
});

describe('runCounts / runSummaryText / savableCount', () => {
  it('counts every status across every setup', () => {
    expect(runCounts(run())).toEqual({ READY: 1, XY_ONLY: 1, WARNING: 1, ERROR: 1 });
  });
  it('renders a stable summary line', () => {
    expect(runSummaryText(run(), true)).toBe('1 готови · 1 само X/Y · 1 предупреждения · 1 невалидни');
    expect(runSummaryText(run(), false)).toBe('1 ready · 1 XY only · 1 warnings · 1 invalid');
  });
  it('savableCount is READY + XY_ONLY only (never WARNING/ERROR)', () => {
    expect(savableCount(run())).toBe(2);
  });
});

describe('setupErrorMessage', () => {
  it('surfaces the first observation\'s error message when the setup itself failed', () => {
    const failed = { setupError: 'STATION_MISSING', observations: [{ errors: [{ code: 'STATION_MISSING', message: 'Станцията не е намерена.' }] }] };
    expect(setupErrorMessage(failed)).toBe('Станцията не е намерена.');
  });
  it('is empty when the setup succeeded', () => {
    expect(setupErrorMessage({ setupError: null, observations: [] })).toBe('');
    expect(setupErrorMessage(null)).toBe('');
  });
});
