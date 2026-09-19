import {
  applyAuthoritativeResult, getResultAuthority, classifySaveError, refreshRequiredMessage, validationMessage,
} from '../authoritativeResult';

// The full LOCAL result of a calculator: persisted fields plus display-only intermediates.
const localResult = () => ({
  xP: 100.001, yP: 200.002, sAP: 5, sBP: 6, // persisted subset (client-computed)
  deltaX: 1, alphaAB: 2, checkSAP: 3, // step-by-step / display-only fields (never persisted)
});

const savedServer = (overrides = {}) => ({
  _id: 'c1',
  resultAuthority: 'server',
  engineVersion: 1,
  resultData: { xP: 100.002, yP: 200.003, sAP: 5, sBP: 6 },
  clientCheck: { status: 'mismatch', fields: [{ field: 'xP', difference: 0.001 }], engineVersion: 1 },
  ...overrides,
});

describe('authoritative overlay (Milestone 2 §12)', () => {
  it('the persisted fields come from the backend, so the display matches the stored record', () => {
    const merged = applyAuthoritativeResult(localResult(), savedServer());
    expect(merged.xP).toBe(100.002);
    expect(merged.yP).toBe(200.003);
    expect(merged.sAP).toBe(5);
  });

  it('client-only intermediate/display fields survive untouched', () => {
    const merged = applyAuthoritativeResult(localResult(), savedServer());
    expect(merged.deltaX).toBe(1);
    expect(merged.alphaAB).toBe(2);
    expect(merged.checkSAP).toBe(3);
  });

  it('never mutates the local result', () => {
    const local = localResult();
    const snapshot = JSON.parse(JSON.stringify(local));
    const merged = applyAuthoritativeResult(local, savedServer());
    expect(local).toEqual(snapshot);
    expect(merged).not.toBe(local);
  });

  it('a server field the local result did not have (e.g. the resection method label) is added', () => {
    const merged = applyAuthoritativeResult({ xP: 1 }, savedServer({ resultData: { xP: 2, yP: 3, method: 'circle-intersection' } }));
    expect(merged.method).toBe('circle-intersection');
  });

  it('exposes the authority as shared state for a future mismatch notice — without leaking into spreads or JSON', () => {
    const merged = applyAuthoritativeResult(localResult(), savedServer());
    const authority = getResultAuthority(merged);
    expect(authority).toMatchObject({ source: 'server', engineVersion: 1 });
    expect(authority.overlaidFields.sort()).toEqual(['sAP', 'sBP', 'xP', 'yP']);
    expect(authority.clientCheck.status).toBe('mismatch');
    expect(Object.keys(merged)).not.toContain('__resultAuthority');
    expect(JSON.stringify(merged)).not.toContain('resultAuthority');
    expect({ ...merged }).not.toHaveProperty('__resultAuthority'); // e.g. the history entries calculators build with {...result}
    expect(Object.isFrozen(authority)).toBe(true);
  });
});

describe('legacy behavior is preserved when the response is not server-authoritative', () => {
  it.each([
    ['resultAuthority absent (older backend)', { resultData: { xP: 999 } }],
    ['resultAuthority "client"', { resultAuthority: 'client', resultData: { xP: 999 } }],
    ['unknown authority value', { resultAuthority: 'trusted', resultData: { xP: 999 } }],
    ['server authority but no resultData', { resultAuthority: 'server' }],
    ['server authority with a non-object resultData', { resultAuthority: 'server', resultData: 'x' }],
    ['null response', null],
    ['undefined response', undefined],
  ])('%s -> the local result is returned as-is (same object)', (_name, saved) => {
    const local = localResult();
    const result = applyAuthoritativeResult(local, saved);
    expect(result).toBe(local);
    expect(result.xP).toBe(100.001);
    expect(getResultAuthority(result)).toBeNull();
  });

  it('a non-object local result is returned unchanged', () => {
    for (const v of [null, undefined, 5, 'x', [1]]) expect(applyAuthoritativeResult(v, savedServer())).toBe(v);
  });
});

describe('save failure classification (structured backend errors)', () => {
  const err = (message, extra = {}) => Object.assign(new Error(message), extra);

  it('CLIENT_REFRESH_REQUIRED is its own kind and produces a clear Bulgarian message telling the user to refresh', () => {
    expect(classifySaveError(err('x', { status: 409, code: 'CLIENT_REFRESH_REQUIRED' }))).toEqual({ kind: 'refresh_required' });
    const bg = refreshRequiredMessage('bg');
    expect(bg).toMatch(/опреснете/);
    expect(bg).toMatch(/изчислението не е запазено/);
    expect(refreshRequiredMessage('en')).toMatch(/refresh the page/);
    expect(refreshRequiredMessage('en')).toMatch(/not saved/);
  });

  it('structured 400 validation failures are their own kind and keep code/field', () => {
    expect(classifySaveError(err('Ъгълът е извън диапазона', { status: 400, code: 'OUT_OF_RANGE', field: 'alpha' })))
      .toEqual({ kind: 'validation', code: 'OUT_OF_RANGE', field: 'alpha' });
    expect(validationMessage(err('Ъгълът е извън диапазона', { code: 'OUT_OF_RANGE' }), 'bg')).toBe('Ъгълът е извън диапазона');
    expect(validationMessage(err('x', { code: 'OUT_OF_RANGE' }), 'en')).toMatch(/OUT_OF_RANGE/);
  });

  it('authentication and the free-plan limit keep their existing classification', () => {
    expect(classifySaveError(err('Authentication required', { status: 401 })).kind).toBe('auth');
    expect(classifySaveError(err('Calculation limit reached', { status: 403 })).kind).toBe('limit');
  });

  it('an edu-policy 403 (message without "limit") is NOT mislabelled as the plan limit — it stays "other", as before', () => {
    expect(classifySaveError(err('За това задание калкулаторът не е разрешен от преподавателя', { status: 403 })).kind).toBe('other');
  });

  it('anything else is "other" (logged, calculation not displayed)', () => {
    expect(classifySaveError(err('boom', { status: 500 })).kind).toBe('other');
    expect(classifySaveError(undefined).kind).toBe('other');
    expect(classifySaveError(null).kind).toBe('other');
  });
});
