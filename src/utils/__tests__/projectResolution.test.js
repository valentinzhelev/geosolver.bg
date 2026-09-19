import { resolveProjectState } from '../projectResolution';

const USER = { id: 'user-1' };
const PROJECT = { _id: 'proj-1', name: 'Project One', crs: 'EPSG:7801' };

describe('resolveProjectState (Milestone 1 follow-up §4)', () => {
  it('Case A: no projectId requested — standalone is valid, no error', () => {
    const result = resolveProjectState('', USER, [PROJECT]);
    expect(result).toEqual({ currentProject: null, error: null });
  });

  it('Case B: projectId requested and found — resolved, no error', () => {
    const result = resolveProjectState('proj-1', USER, [PROJECT]);
    expect(result).toEqual({ currentProject: PROJECT, error: null });
  });

  it('Case C: projectId requested but not in the accessible list — unresolved with an explicit error, NOT silently null-with-no-error', () => {
    const result = resolveProjectState('proj-does-not-exist', USER, [PROJECT]);
    expect(result.currentProject).toBeNull();
    expect(result.error).toBe('not_found');
    // Critically: this must be distinguishable from Case A.
    expect(result).not.toEqual(resolveProjectState('', USER, [PROJECT]));
  });

  it('Case C: projectId requested but no user — unresolved with an explicit error', () => {
    const result = resolveProjectState('proj-1', null, [PROJECT]);
    expect(result.currentProject).toBeNull();
    expect(result.error).toBe('unauthenticated');
  });

  it('an empty accessible-projects list still distinguishes "not requested" from "requested but not found"', () => {
    expect(resolveProjectState('', USER, [])).toEqual({ currentProject: null, error: null });
    expect(resolveProjectState('proj-1', USER, [])).toEqual({ currentProject: null, error: 'not_found' });
  });
});
