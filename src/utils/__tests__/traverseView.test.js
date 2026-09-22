import {
  traverseTypeLabel, runStatusLabel, sequenceIssueMessage, closureUnavailableMessage, fmtRelativeClosure, savableLegCount, hasAdjustment,
} from '../traverseView';

describe('traverseTypeLabel / runStatusLabel', () => {
  it('labels every traverse type and run status in both languages', () => {
    expect(traverseTypeLabel('CLOSED_LOOP')).toBe('Затворен ход');
    expect(traverseTypeLabel('KNOWN_ENDPOINT', false)).toBe('Known endpoint');
    expect(traverseTypeLabel('OPEN')).toBe('Отворен ход');
    expect(runStatusLabel('READY')).toBe('Готов');
    expect(runStatusLabel('PARTIAL', false)).toBe('Partial');
    expect(runStatusLabel('INVALID')).toBe('Невалиден');
  });
});

describe('sequenceIssueMessage: surfaces enough detail for the user to fix the field notebook', () => {
  it('includes the offending station and expected continuation', () => {
    const msg = sequenceIssueMessage({ code: 'MISSING_FORESIGHT_OBSERVATION', atStationIdentifier: '101', expectedNextIdentifier: '102' });
    expect(msg).toContain('101');
    expect(msg).toContain('102');
  });
  it('includes ambiguous candidates', () => {
    const msg = sequenceIssueMessage({ code: 'AMBIGUOUS_CONTINUATION', atStationIdentifier: '101', candidateIdentifiers: ['102', '102b'] });
    expect(msg).toContain('102');
    expect(msg).toContain('102b');
  });
  it('is empty for no issue', () => {
    expect(sequenceIssueMessage(null)).toBe('');
  });
});

describe('closureUnavailableMessage: never blank for a known reason', () => {
  it('OPEN_TRAVERSE explains that an open traverse has no closing control', () => {
    expect(closureUnavailableMessage('OPEN_TRAVERSE')).toMatch(/затваряне/);
  });
  it('an unrecognised reason still renders the code rather than nothing', () => {
    expect(closureUnavailableMessage('SOME_FUTURE_CODE')).toBe('SOME_FUTURE_CODE');
  });
});

describe('fmtRelativeClosure: a transparent ratio, never a judgement', () => {
  it('formats "1 : N"', () => {
    expect(fmtRelativeClosure(18493.2)).toBe(`1 : ${(18493).toLocaleString('bg-BG')}`);
  });
  it('is an em dash when there is no meaningful ratio (e.g. perfect closure)', () => {
    expect(fmtRelativeClosure(null)).toBe('—');
    expect(fmtRelativeClosure(undefined)).toBe('—');
  });
});

describe('savableLegCount / hasAdjustment', () => {
  const traverse = (over = {}) => ({
    legs: [{ status: 'READY' }, { status: 'XY_ONLY' }, { status: 'ERROR' }],
    adjustment: { applied: false },
    ...over,
  });
  it('counts only READY/XY_ONLY legs', () => {
    expect(savableLegCount(traverse())).toBe(2);
  });
  it('hasAdjustment reflects adjustment.applied exactly', () => {
    expect(hasAdjustment(traverse())).toBe(false);
    expect(hasAdjustment(traverse({ adjustment: { applied: true } }))).toBe(true);
    expect(hasAdjustment(null)).toBe(false);
  });
});
