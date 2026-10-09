import { gaiErrorMessage, evidenceChipLabel, evidenceHref, FALLBACK_STARTERS } from '../gaiView';

describe('gaiErrorMessage', () => {
  it.each([
    ['GAI_DISABLED', 'Асистентът временно не е активен.'],
    ['PROVIDER_NOT_CONFIGURED', 'Асистентът не е настроен.'],
    ['PROVIDER_UNAVAILABLE', 'Асистентът временно не е достъпен.'],
    ['PROVIDER_TIMEOUT', 'Отговорът се забави прекалено дълго. Опитайте отново.'],
    ['PROVIDER_ERROR', 'Възникна проблем при генерирането на отговора.'],
    ['NETWORK_ERROR', 'Няма връзка със сървъра. Проверете връзката и опитайте отново.'],
  ])('%s', (code, text) => {
    expect(gaiErrorMessage({ code, message: 'OpenAI 429: {"error":...}' })).toBe(text);
  });

  it('never returns the raw message of an unknown or code-less error', () => {
    const generic = 'Възникна проблем. Опитайте отново.';
    expect(gaiErrorMessage({ message: 'OpenAI 429 billing' })).toBe(generic);
    expect(gaiErrorMessage(new TypeError('Failed to fetch'))).toBe(generic);
    expect(gaiErrorMessage({ code: 'SOMETHING_NEW', message: 'stack trace' })).toBe(generic);
    expect(gaiErrorMessage(null)).toBe(generic);
  });

  it('GeoSolver-worded validation/access messages are shown as written (Bulgarian UI only)', () => {
    expect(gaiErrorMessage({ code: 'INVALID_REQUEST', message: 'Въпросът е твърде дълъг.' })).toBe('Въпросът е твърде дълъг.');
    expect(gaiErrorMessage({ code: 'INVALID_REQUEST', message: 'x' }, false)).toBe('Something went wrong. Please try again.');
  });
});

describe('evidence chips', () => {
  it('labels: product label kept, bare point name prefixed, missing/id-like label -> Bulgarian kind name', () => {
    expect(evidenceChipLabel({ kind: 'processingRun', label: 'Полигонов ход 101 → 107' })).toBe('Полигонов ход 101 → 107');
    expect(evidenceChipLabel({ kind: 'surveyPoint', label: '201' })).toBe('Точка 201');
    expect(evidenceChipLabel({ kind: 'surveyPoint', label: 'Точка 201' })).toBe('Точка 201');
    expect(evidenceChipLabel({ kind: 'captureJob' })).toBe('Заснемане');
    expect(evidenceChipLabel({ kind: 'report', label: '6a24728aa23b7d85a3236d01' })).toBe('Отчет');
    expect(evidenceChipLabel({ kind: 'somethingNew' })).toBe('Източник');
  });

  it('hrefs only for real destinations', () => {
    expect(evidenceHref({ kind: 'surveyPoint' }, 'p1')).toBe('/project?projectId=p1&tab=points');
    expect(evidenceHref({ kind: 'captureJob' }, 'p1')).toBe('/project?projectId=p1&tab=field-data');
    expect(evidenceHref({ kind: 'report' }, 'p1')).toBe('/project?projectId=p1&tab=documents');
    expect(evidenceHref({ kind: 'calculation' }, 'p1')).toBe('/calculations/history?projectId=p1');
    expect(evidenceHref({ kind: 'project' }, 'p1')).toBeNull();
    expect(evidenceHref({ kind: 'manual' }, 'p1')).toBeNull();
    expect(evidenceHref({ kind: 'surveyPoint' }, '')).toBeNull();
  });

  it('fallback starters never reference a specific point', () => {
    expect([...FALLBACK_STARTERS.bg, ...FALLBACK_STARTERS.en].some((s) => /\d/.test(s))).toBe(false);
  });
});
