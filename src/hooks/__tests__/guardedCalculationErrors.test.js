import fs from 'fs';
import path from 'path';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { useGuardedCalculation } from '../useGuardedCalculation';
import { calculateForwardIntersection } from '../../domain/geodesy/forwardIntersection';
import { ResectionError } from '../../domain/geodesy/resection';
import { isExpectedCalculationError, toCalculationFailure, failureResultText } from '../../utils/calculationErrors';

// QA-06: calculation failures must never crash the UI, never save anything, and always read the same way.
// The REAL hook and REAL domain calculators run; only auth / tracking / router are faked.

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

jest.mock('react-router-dom', () => ({ useNavigate: () => () => {} }), { virtual: true });
const mockAuth = { user: { _id: 'u1' } };
jest.mock('../../components/auth/AuthContext', () => ({ useAuth: () => mockAuth }));
jest.mock('../useTranslation', () => ({ useTranslation: () => ({ language: 'bg' }) }));
jest.mock('../../context/ProjectContext', () => ({ useProjectContext: () => ({ requestedProjectId: 'proj1', error: null }) }));
const mockTrack = jest.fn();
const mockLimits = jest.fn();
jest.mock('../useCalculationTracking', () => ({
  useCalculationTracking: () => ({ trackCalculation: mockTrack, checkLimits: mockLimits }),
}));

let api;
let onFailed;
let root;
function Harness() {
  api = useGuardedCalculation({ onCalculationFailed: (f) => onFailed(f) });
  return null;
}

beforeEach(async () => {
  onFailed = jest.fn();
  mockTrack.mockReset();
  mockLimits.mockReset().mockResolvedValue({ canCalculate: true, used: 0, limit: 5, unlimited: false });
  jest.spyOn(window, 'alert').mockImplementation(() => {});
  root = createRoot(document.createElement('div'));
  await act(async () => root.render(<Harness />));
});
afterEach(async () => {
  await act(async () => root.unmount());
  jest.restoreAllMocks();
});

const run = (fn, extra = {}) =>
  act(async () => api.runWithTracking({ toolName: 'forward-intersection', inputData: { a: 1 }, run: fn, getResultData: (r) => r, ...extra }));

// the exact QA case: A (Y=500000, X=4700000) + C (Y=500100, X=4700000), beta1 = beta2 = 100
const qaCase = () => calculateForwardIntersection(500000, 4700000, 500100, 4700000, 100, 100);

describe('local domain / input errors (the exact QA case)', () => {
  it('beta1 + beta2 = 200 does NOT throw to React: runWithTracking resolves null', async () => {
    let result;
    await expect((async () => { result = await run(qaCase); })()).resolves.toBeUndefined();
    expect(result).toBeNull();
  });

  it('nothing is saved: the tracking/save call is never made', async () => {
    await run(qaCase);
    expect(mockTrack).not.toHaveBeenCalled();
  });

  it('the failure is a professional Bulgarian message: title + specific, mathematically accurate reason + hint; no alert', async () => {
    await run(qaCase);
    const failure = api.calculationError;
    expect(failure.title).toBe('Изчислението не може да бъде извършено');
    expect(failure.message).toContain('Сумата от ъглите не може да бъде по-голяма от 200 гради');
    expect(failure.message).toContain('β₁ + β₂ трябва да е по-малка от 200 гради');
    expect(failure.hint).toBe('Проверете входните данни и опитайте отново.');
    expect(failure.source).toBe('local');
    expect(window.alert).not.toHaveBeenCalled();
    const text = failureResultText(failure);
    expect(text).toContain('Изчислението не може да бъде извършено');
    expect(text).not.toMatch(/\bat \w|\.js:\d|Error:|\{|\}/); // no stack trace, no raw JSON
  });

  it('the calculator is told, so it can replace its previous result (see the harness test below)', async () => {
    await run(qaCase);
    expect(onFailed).toHaveBeenCalledTimes(1);
    expect(onFailed.mock.calls[0][0].message).toContain('β₁ + β₂');
  });

  it('a later valid calculation clears the error and is saved normally', async () => {
    await run(qaCase);
    expect(api.calculationError).not.toBeNull();
    mockTrack.mockResolvedValue({ resultAuthority: 'server', resultData: { xP: 4700050, yP: 500050 }, engineVersion: 1 });
    const ok = await run(() => ({ xP: 1, yP: 2 }));
    expect(ok).toMatchObject({ xP: 4700050, yP: 500050 });
    expect(mockTrack).toHaveBeenCalledTimes(1);
    expect(api.calculationError).toBeNull();
  });

  it('other expected domain errors (e.g. Resection) get the same treatment, keeping the code internally', async () => {
    const err = new ResectionError('COLLINEAR_CONTROLS', 'Контролните точки A, B и C лежат на една права');
    await run(() => { throw err; });
    expect(api.calculationError.message).toContain('лежат на една права');
    expect(api.calculationError.code).toBe('COLLINEAR_CONTROLS');
    expect(api.calculationError.message).not.toContain('COLLINEAR_CONTROLS'); // never the main message
    expect(mockTrack).not.toHaveBeenCalled();
  });
});

describe('structured backend validation (HTTP 400) renders in the same way', () => {
  it('a 400 with a code becomes the same failure shape, without a browser alert, and nothing more is sent', async () => {
    mockTrack.mockRejectedValue(Object.assign(new Error('Сумата от ъглите не може да бъде по-голяма от 200 гради'), { status: 400, code: 'ANGLE_SUM_TOO_LARGE' }));
    const result = await run(() => ({ xP: 1 }));
    expect(result).toBeNull();
    const failure = api.calculationError;
    expect(failure).toMatchObject({ title: 'Изчислението не може да бъде извършено', hint: 'Проверете входните данни и опитайте отново.', source: 'server', code: 'ANGLE_SUM_TOO_LARGE' });
    expect(failure.message).toContain('Сумата от ъглите');
    expect(window.alert).not.toHaveBeenCalled();
    expect(onFailed).toHaveBeenCalledWith(failure);
    expect(mockTrack).toHaveBeenCalledTimes(1);
  });
});

describe('programming errors are NOT swallowed', () => {
  it.each([[TypeError, 'x is not a function'], [ReferenceError, 'y is not defined'], [RangeError, 'bad digits']])(
    '%p from a calculator bug is re-thrown (stays observable) and produces no user message or save',
    async (Kind, message) => {
      await expect(run(() => { throw new Kind(message); })).rejects.toThrow(Kind);
      expect(api.calculationError).toBeNull();
      expect(onFailed).not.toHaveBeenCalled();
      expect(mockTrack).not.toHaveBeenCalled();
    }
  );

  it('classification: only Error-based domain failures are expected', () => {
    expect(isExpectedCalculationError(new Error('Невалидни данни'))).toBe(true);
    expect(isExpectedCalculationError(new ResectionError('X', 'm'))).toBe(true);
    expect(isExpectedCalculationError(new TypeError('bug'))).toBe(false);
    expect(isExpectedCalculationError('string')).toBe(false);
    expect(isExpectedCalculationError(null)).toBe(false);
    expect(toCalculationFailure(new Error('m'), 'en').title).toBe('The calculation cannot be performed');
  });
});

describe('a previous result never stays as if it belonged to the new input', () => {
  it('a calculator wired like the real ones: valid result -> invalid input -> the old result is replaced by the message', async () => {
    let view;
    function Calculator() {
      const [resultText, setResultText] = React.useState('placeholder');
      view = { resultText };
      api = useGuardedCalculation({ onCalculationFailed: (f) => setResultText(failureResultText(f)) });
      view.calc = async (fn) => {
        const r = await api.runWithTracking({ toolName: 'forward-intersection', inputData: {}, run: fn, getResultData: (x) => x });
        if (r) setResultText(`P = (${r.xP}, ${r.yP})`);
      };
      return null;
    }
    await act(async () => root.render(<Calculator />));
    mockTrack.mockResolvedValue({ resultAuthority: 'server', resultData: { xP: 4700050, yP: 500050 }, engineVersion: 1 });
    await act(async () => view.calc(() => ({ xP: 1, yP: 2 })));
    expect(view.resultText).toBe('P = (4700050, 500050)');

    await act(async () => view.calc(qaCase)); // invalid geometry
    expect(view.resultText).not.toContain('4700050');
    expect(view.resultText).toContain('Изчислението не може да бъде извършено');
    expect(mockTrack).toHaveBeenCalledTimes(1); // only the valid one was ever saved
  });
});

describe('all 12 calculators use the shared handling', () => {
  const TASKS = path.join(__dirname, '..', '..', 'components', 'tasks');
  const FILES = ['AreaCalculation', 'CoordinateTransformation', 'DistanceBearing', 'FirstTask', 'ForwardIntersection', 'HansenTask',
    'LineIntersection', 'OffsetPoint', 'PolarIntersection', 'Resection', 'SecondTask', 'SegmentDivision'];

  it.each(FILES)('%s: passes onCalculationFailed that replaces its result with the shared failure text', (name) => {
    const src = fs.readFileSync(path.join(TASKS, `${name}.js`), 'utf8');
    expect(src).toContain('useGuardedCalculation({');
    expect(src).toContain('onCalculationFailed: (failure) => {');
    expect(src).toContain('setResultText(failureResultText(failure))');
    expect(src).toContain("from '../../utils/calculationErrors'");
  });

  it('the hook no longer uses a browser alert for structured validation errors', () => {
    const hook = fs.readFileSync(path.join(__dirname, '..', 'useGuardedCalculation.js'), 'utf8');
    expect(hook).not.toContain('alert(validationMessage');
    expect(hook).toContain("toCalculationFailure(err, language, 'server')");
    expect(hook).toContain('if (!isExpectedCalculationError(err)) throw err;');
  });
});
