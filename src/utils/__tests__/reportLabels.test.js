import { reportTypeLabel, sourceTypeLabel, fmtFileSize, fmtGeneratedAt } from '../reportLabels';

describe('reportTypeLabel / sourceTypeLabel: never a raw enum string', () => {
  it('translates every V2.5 report type', () => {
    expect(reportTypeLabel('POLAR_PROCESSING_REPORT')).toBe('Отчет за полярна обработка');
    expect(reportTypeLabel('TRAVERSE_PROCESSING_REPORT', false)).toBe('Traverse processing report');
    expect(reportTypeLabel('PROJECT_COORDINATE_LIST')).toBe('Координатен регистър');
  });
  it('translates source types', () => {
    expect(sourceTypeLabel('field-processing-run')).toContain('теренни');
    expect(sourceTypeLabel('project-points-snapshot')).toContain('точките');
  });
  it('an unknown value falls back to itself rather than crashing', () => {
    expect(reportTypeLabel('SOMETHING_NEW')).toBe('SOMETHING_NEW');
  });
});

describe('fmtFileSize', () => {
  it('formats bytes/KB/MB appropriately', () => {
    expect(fmtFileSize(500)).toBe('500 B');
    expect(fmtFileSize(2048)).toBe('2.0 KB');
    expect(fmtFileSize(5 * 1024 * 1024)).toBe('5.00 MB');
  });
  it('a missing size is a dash, never 0', () => {
    expect(fmtFileSize(null)).toBe('—');
    expect(fmtFileSize(undefined)).toBe('—');
  });
});

describe('fmtGeneratedAt', () => {
  it('formats a real timestamp', () => {
    expect(fmtGeneratedAt('2026-09-22T10:00:00Z')).toMatch(/2026/);
  });
  it('an invalid date is a dash', () => {
    expect(fmtGeneratedAt('not-a-date')).toBe('—');
  });
});
