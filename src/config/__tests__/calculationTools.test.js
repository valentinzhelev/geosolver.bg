import {
  getProjectCalculationTools,
  getToolPath,
  withProjectId,
  isCalculatorPath,
} from '../calculationTools';

const PROFESSIONAL_TOOLS = [
  'first-basic-task', 'second-basic-task', 'forward-intersection', 'resection',
  'polar-intersection', 'coordinate-transformation', 'hansen-task', 'area-calculation',
  'distance-bearing', 'line-intersection', 'offset-point', 'segment-division',
];

describe('calculationTools project helpers', () => {
  it('offers exactly the 12 professional tools as Project calculations', () => {
    const ids = getProjectCalculationTools().map((t) => t.id).sort();
    expect(ids).toEqual([...PROFESSIONAL_TOOLS].sort());
  });

  it('never offers the Scientific Calculator as a Project calculation', () => {
    expect(getProjectCalculationTools().some((t) => t.id === 'scientific-calculator')).toBe(false);
  });

  it('every project tool link carries the projectId on its existing calculator route', () => {
    for (const tool of getProjectCalculationTools()) {
      expect(getToolPath(tool.id, 'proj-1')).toBe(`${tool.path}?projectId=proj-1`);
    }
  });

  it('safely appends projectId: query-aware and URL-encoded', () => {
    expect(withProjectId('/first-task?x=1', 'p1')).toBe('/first-task?x=1&projectId=p1');
    expect(withProjectId('/first-task', 'a b&c')).toBe('/first-task?projectId=a%20b%26c');
  });

  it('every project tool has a real, distinct, absolute route', () => {
    const paths = getProjectCalculationTools().map((t) => t.path);
    expect(new Set(paths).size).toBe(12);
    paths.forEach((p) => expect(p).toMatch(/^\/[a-z-]+$/));
  });

  it('standalone paths are unchanged when no project is given', () => {
    expect(getToolPath('first-basic-task')).toBe('/first-task');
    expect(withProjectId('/first-task', '')).toBe('/first-task');
  });

  it('recognizes professional calculator routes only — not the scientific calculator, not project pages', () => {
    expect(isCalculatorPath('/first-task')).toBe(true);
    expect(isCalculatorPath('/scientific-calculator')).toBe(false);
    expect(isCalculatorPath('/calculations/history')).toBe(false);
    expect(isCalculatorPath('/projects')).toBe(false);
  });
});
