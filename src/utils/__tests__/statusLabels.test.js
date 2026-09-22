import { statusLabel, statusTone, captureStatusKey, traverseRunStatusKey, polarRunStatusKey } from '../statusLabels';

describe('statusLabel / statusTone: icon + word, never colour alone', () => {
  it('every status has a symbol and a word, in both languages', () => {
    expect(statusLabel('CONFIRMED')).toBe('✓ Потвърдено');
    expect(statusLabel('NEEDS_REVIEW', false)).toBe('! Needs review');
    expect(statusTone('ERROR')).toMatch(/red/);
  });
  it('an unknown key falls back to the key itself rather than crashing', () => {
    expect(statusLabel('SOMETHING_NEW')).toBe('SOMETHING_NEW');
  });
});

describe('captureStatusKey: maps backend job status to the shared vocabulary', () => {
  it.each([
    ['confirmed', 'CONFIRMED'],
    ['needs_review', 'NEEDS_REVIEW'],
    ['failed', 'ERROR'],
    ['uploaded', 'DRAFT'],
    ['processing', 'DRAFT'],
  ])('%s -> %s', (input, expected) => {
    expect(captureStatusKey(input)).toBe(expected);
  });
});

describe('traverseRunStatusKey', () => {
  it.each([
    ['READY', 'PROCESSED'],
    ['PARTIAL', 'PARTIAL'],
    ['INVALID', 'ERROR'],
  ])('%s -> %s', (input, expected) => {
    expect(traverseRunStatusKey(input)).toBe(expected);
  });
});

describe('polarRunStatusKey: derived from READY/XY_ONLY/WARNING/ERROR counts', () => {
  it('all clean -> PROCESSED', () => {
    expect(polarRunStatusKey({ READY: 2, XY_ONLY: 1, WARNING: 0, ERROR: 0 })).toBe('PROCESSED');
  });
  it('some errors/warnings alongside valid targets -> PARTIAL', () => {
    expect(polarRunStatusKey({ READY: 1, XY_ONLY: 0, WARNING: 0, ERROR: 1 })).toBe('PARTIAL');
    expect(polarRunStatusKey({ READY: 1, XY_ONLY: 0, WARNING: 1, ERROR: 0 })).toBe('PARTIAL');
  });
  it('nothing usable at all -> ERROR', () => {
    expect(polarRunStatusKey({ READY: 0, XY_ONLY: 0, WARNING: 0, ERROR: 3 })).toBe('ERROR');
  });
});
