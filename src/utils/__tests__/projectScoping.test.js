import { resolveEffectiveProjectId } from '../projectScoping';

describe('resolveEffectiveProjectId (Milestone 1 §9 precedence)', () => {
  it('a classroom assignment linkedProjectId wins over the general project context', () => {
    const result = resolveEffectiveProjectId({
      eduProjectId: 'assignment-project',
      currentProjectId: 'general-project',
    });
    expect(result).toBe('assignment-project');
  });

  it('an explicit projectId prop wins over the general project context', () => {
    const result = resolveEffectiveProjectId({
      projectId: 'explicit-prop-project',
      currentProjectId: 'general-project',
    });
    expect(result).toBe('explicit-prop-project');
  });

  it('falls back to the general ProjectContext when neither edu nor an explicit prop is set', () => {
    const result = resolveEffectiveProjectId({ currentProjectId: 'general-project' });
    expect(result).toBe('general-project');
  });

  it('resolves to undefined (no scoping) outside any project context — preserves today\'s standalone behavior', () => {
    const result = resolveEffectiveProjectId({});
    expect(result).toBeUndefined();
  });

  it('edu wins even when BOTH an explicit prop and a general context are present', () => {
    const result = resolveEffectiveProjectId({
      eduProjectId: 'assignment-project',
      projectId: 'explicit-prop-project',
      currentProjectId: 'general-project',
    });
    expect(result).toBe('assignment-project');
  });
});
