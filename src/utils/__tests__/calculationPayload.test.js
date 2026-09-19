import { buildCalculationPayload } from '../calculationPayload';

const base = {
  toolName: 'first-basic-task',
  toolDisplayName: { bg: 'Първа задача', en: 'First task' },
  inputData: { y1: 1, x1: 1, alpha: 50, s: 10 },
  resultData: { y2: 2, x2: 2 },
  calculationTime: 5,
};

describe('buildCalculationPayload (Milestone 1 §10)', () => {
  it('a standalone calculator payload has no projectId/pointReferences/eduContext keys at all', () => {
    const payload = buildCalculationPayload({ ...base });
    expect(payload).not.toHaveProperty('projectId');
    expect(payload).not.toHaveProperty('pointReferences');
    expect(payload).not.toHaveProperty('eduContext');
    // Exactly the same shape the backend already accepted before this milestone.
    expect(Object.keys(payload).sort()).toEqual(
      ['calculationTime', 'inputData', 'resultData', 'toolDisplayName', 'toolName'].sort()
    );
  });

  it('project context propagates projectId into the payload', () => {
    const payload = buildCalculationPayload({ ...base, projectId: 'proj-1' });
    expect(payload.projectId).toBe('proj-1');
  });

  it('pointReferences propagate into the payload when non-empty', () => {
    const refs = [{ pointId: 'p1', role: 'station' }];
    const payload = buildCalculationPayload({ ...base, pointReferences: refs });
    expect(payload.pointReferences).toEqual(refs);
  });

  it('an empty pointReferences array is omitted, not sent as []', () => {
    const payload = buildCalculationPayload({ ...base, pointReferences: [] });
    expect(payload).not.toHaveProperty('pointReferences');
  });

  it('edu context still includes only assignmentId, unaffected by projectId/pointReferences', () => {
    const payload = buildCalculationPayload({
      ...base,
      eduContext: { assignmentId: 'assign-1' },
      projectId: null,
      pointReferences: [],
    });
    expect(payload.eduContext).toEqual({ assignmentId: 'assign-1' });
    expect(payload).not.toHaveProperty('projectId');
  });
});
