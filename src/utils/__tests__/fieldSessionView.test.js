import {
  statusBadge, sessionErrorMessage, addSetup, addNextStation, addObservation, updateObservation, removeObservation, removeSetup,
  updateStation, updateOrientation, isBlankObservation, countObservations, indexIssues, issueKey, issueLocation, splitIssues,
  fieldLabel, evidenceLine, availableModes, noProcessingReason, sessionSummaryLine, capturesOutsideSessions,
} from '../fieldSessionView';

describe('statusBadge: Чернова -> За проверка -> Потвърдена -> Обработена, never colour alone', () => {
  it.each([
    ['draft', '✎ Чернова'], ['review', '! За проверка'], ['confirmed', '✓ Потвърдена'], ['processed', '✓✓ Обработена'],
  ])('%s', (status, text) => expect(statusBadge(status).text).toBe(text));
  it('an unknown status degrades to draft, English works', () => {
    expect(statusBadge('weird').text).toBe('✎ Чернова');
    expect(statusBadge('processed', false).text).toBe('✓✓ Processed');
  });
});

describe('sessionErrorMessage: only safe text', () => {
  it('maps known codes and shows GeoSolver-worded server sentences as written', () => {
    expect(sessionErrorMessage({ code: 'NETWORK_ERROR' })).toMatch(/Няма връзка/);
    expect(sessionErrorMessage({ code: 'REVISION_CONFLICT' })).toMatch(/друго устройство/);
    expect(sessionErrorMessage({ code: 'NOT_SAVED' })).toMatch(/не са запазени/);
    expect(sessionErrorMessage({ code: 'SESSION_CONFIRMED', message: 'Сесията е потвърдена и не може да се променя.' })).toBe('Сесията е потвърдена и не може да се променя.');
  });
  it('never shows an unknown error\'s own text', () => {
    const generic = 'Възникна проблем. Опитайте отново.';
    expect(sessionErrorMessage(new TypeError('Failed to fetch'))).toBe(generic);
    expect(sessionErrorMessage({ code: 'SOMETHING', message: 'MongoServerError at 10.0.0.5' })).toBe(generic);
    expect(sessionErrorMessage({ code: 'SESSION_CONFIRMED', message: 'x' }, false)).toBe('Something went wrong. Please try again.');
    expect(sessionErrorMessage(null)).toBe(generic);
  });
});

describe('entry editing helpers (pure, immutable)', () => {
  it('stations get stable ascending ids; the next station\'s backsight is the previous station', () => {
    let s = addSetup([]);
    s = updateStation(s, 0, { point: '101' });
    s = addNextStation(s);
    expect(s.map((x) => x.index)).toEqual([0, 1]);
    expect(s[1].orientation.target).toBe('101');
    s = removeSetup(s, 0);
    expect(addSetup(s).map((x) => x.index)).toEqual([1, 2]); // an id is never reused
  });

  it('observations keep their station context and get stable row ids', () => {
    let s = updateOrientation(updateStation(addSetup([]), 0, { point: '101', instrumentHeight: '1.5' }), 0, { target: '102', direction: '0' });
    s = addObservation(s, 0, { target: '201', hz: '10', distance: '50' });
    s = addObservation(s, 0, { target: '202', hz: '20', distance: '60' });
    expect(s[0].observations.map((o) => [o.row, o.target])).toEqual([[0, '201'], [1, '202']]);
    s = updateObservation(s, 0, 0, { hz: '11' });
    expect(s[0].observations[0]).toMatchObject({ row: 0, target: '201', hz: '11' });
    s = removeObservation(s, 0, 0);
    expect(addObservation(s, 0, { target: '203' })[0].observations.map((o) => o.row)).toEqual([1, 2]);
    expect(s[0].station).toEqual({ point: '101', instrumentHeight: '1.5', notes: '' });
  });

  it('does not mutate its input', () => {
    const base = addSetup([]);
    const frozen = JSON.stringify(base);
    addObservation(base, 0, { target: 'x' });
    updateStation(base, 0, { point: 'y' });
    expect(JSON.stringify(base)).toBe(frozen);
  });

  it('blank rows are recognised and not counted', () => {
    expect(isBlankObservation({ target: '', hz: ' ', vz: '', distance: '', horizontalDistance: '', prismHeight: '', code: '', notes: '' })).toBe(true);
    const s = addObservation(addObservation(addSetup([]), 0, { target: '201' }), 0, {});
    expect(countObservations(s)).toBe(1);
  });
});

describe('issues: located, highlighted, readable', () => {
  const issues = [
    { severity: 'warning', code: 'MISSING_ORIENTATION', message: 'w', setup: 0, section: 'station', field: 'orientation' },
    { severity: 'error', code: 'MALFORMED_ANGLE', message: 'e', setup: 0, section: 'observation', row: 3, field: 'hz' },
    { severity: 'warning', code: 'INCONSISTENT_ANGLE_UNIT', message: 'w2', setup: 0, section: 'observation', row: 3, field: 'hz' },
    { severity: 'error', code: 'NO_OBSERVATIONS', message: 'n', setup: null, section: 'session', field: null },
  ];
  const setups = [{ index: 0, station: { point: '101' }, observations: [{ row: 3, target: '201' }] }];

  it('indexes the worst issue per field (an error beats a warning on the same field)', () => {
    const m = indexIssues(issues);
    expect(m.get(issueKey({ setup: 0, section: 'observation', row: 3, field: 'hz' })).code).toBe('MALFORMED_ANGLE');
    expect(m.get(issueKey({ setup: 0, section: 'station', field: 'orientation' })).severity).toBe('warning');
    expect(indexIssues(null).size).toBe(0);
  });

  it('describes where an issue is in the user\'s words', () => {
    expect(issueLocation(issues[1], setups)).toBe('Станция 101 · наблюдение към 201 · Hz');
    expect(issueLocation(issues[0], setups)).toBe('Станция 101 · Ориентир');
    expect(issueLocation(issues[3], setups)).toBe('Цялата сесия');
    expect(issueLocation(issues[1], setups, false)).toBe('Station 101 · observation to 201 · Hz');
    expect(issueLocation({ setup: 5, section: 'station', field: 'point' }, setups)).toBe('Станция № 6 · Станция');
  });

  it('splits errors from warnings', () => {
    const s = splitIssues({ issues });
    expect([s.errors.length, s.warnings.length]).toEqual([2, 2]);
    expect(splitIssues(null)).toEqual({ errors: [], warnings: [] });
  });

  it('no internal field name is ever used as a label', () => {
    for (const f of ['point', 'instrumentHeight', 'orientation', 'target', 'direction', 'hz', 'vz', 'distance', 'horizontalDistance', 'prismHeight', 'code', 'notes']) {
      expect(fieldLabel(f)).toBeTruthy();
      expect(fieldLabel(f)).not.toMatch(/[a-z][A-Z]/);
    }
    expect(fieldLabel('unknown')).toBe('');
  });
});

describe('confirmed evidence is shown with its units, exactly as confirmed', () => {
  it('formats a typed observation', () => {
    const line = evidenceLine({ hz: { value: 123.4567, unit: 'gon' }, vz: { value: 94.5, unit: 'deg' }, distance: { value: 50.123, unit: 'm' }, horizontalDistance: null, prismHeight: { value: 150, unit: 'cm' } });
    expect(line).toBe('Hz 123.4567 gon · V 94.5 ° · S 50.123 m · приз. 150 cm');
  });
});

describe('processing options: impossible kinds are simply absent', () => {
  it('availableModes follows the server\'s options', () => {
    expect(availableModes({ polar: { available: true }, traverse: { available: true } })).toEqual(['polar', 'traverse']);
    expect(availableModes({ polar: { available: true }, traverse: { available: false } })).toEqual(['polar']);
    expect(availableModes({ polar: { available: false }, traverse: { available: false } })).toEqual([]);
    expect(availableModes(null)).toEqual([]);
  });
  it('explains why nothing is available in plain words', () => {
    expect(noProcessingReason({ polar: { available: false, reason: 'NO_OBSERVATIONS' } })).toBe('В сесията няма наблюдения за обработка.');
    expect(noProcessingReason(null)).toBe('Няма налична обработка за тези данни.');
  });
});

describe('list helpers', () => {
  it('summary line pluralises', () => {
    expect(sessionSummaryLine({ setupCount: 1, observationCount: 1 })).toBe('1 станция · 1 наблюдение');
    expect(sessionSummaryLine({ setupCount: 2, observationCount: 5 })).toBe('2 станции · 5 наблюдения');
  });
  it('captures outside sessions = all captures minus the attached ones', () => {
    expect(capturesOutsideSessions([{ id: 'a' }, { id: 'b' }], ['a']).map((j) => j.id)).toEqual(['b']);
    expect(capturesOutsideSessions(null, null)).toEqual([]);
  });
});
