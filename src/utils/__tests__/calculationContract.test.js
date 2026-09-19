import fs from 'fs';
import path from 'path';
import { CLIENT_CALCULATION_CONTRACT_VERSION } from '../../config/calculationContract';
import { buildCalculationPayload } from '../calculationPayload';
import contracts from '../../domain/geodesy/__fixtures__/persistedContracts.json';

const SRC = path.join(__dirname, '..', '..');
const read = (rel) => fs.readFileSync(path.join(SRC, rel), 'utf8');

const base = {
  toolName: 'first-basic-task',
  toolDisplayName: { bg: 'Първа задача', en: 'First task' },
  inputData: { y1: 1, x1: 1, alpha: 50, s: 10 },
  resultData: { y2: 2, x2: 2 },
  calculationTime: 5,
};

describe('client calculation contract version is centralized', () => {
  it('is an explicit integer at or above the version the backend requires for offset-point / resection (2)', () => {
    expect(Number.isInteger(CLIENT_CALCULATION_CONTRACT_VERSION)).toBe(true);
    expect(CLIENT_CALCULATION_CONTRACT_VERSION).toBeGreaterThanOrEqual(2);
  });

  it('is added to every professional save payload by the ONE payload builder', () => {
    expect(buildCalculationPayload(base).clientContractVersion).toBe(CLIENT_CALCULATION_CONTRACT_VERSION);
    expect(buildCalculationPayload({ ...base, projectId: 'p', pointReferences: [{ pointId: 'x', role: 'station' }] }).clientContractVersion).toBe(CLIENT_CALCULATION_CONTRACT_VERSION);
    expect(buildCalculationPayload({ ...base, eduContext: { assignmentId: 'a' } }).clientContractVersion).toBe(CLIENT_CALCULATION_CONTRACT_VERSION);
  });

  it('the payload is otherwise backward compatible: exactly the previous keys plus clientContractVersion', () => {
    expect(Object.keys(buildCalculationPayload(base)).sort()).toEqual(
      ['calculationTime', 'clientContractVersion', 'inputData', 'resultData', 'toolDisplayName', 'toolName']
    );
  });

  it('the literal contract number is not scattered: only the config file defines it and only the payload builder sends it', () => {
    const files = [];
    const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).forEach((e) => {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) { if (e.name !== '__tests__') walk(full); } else if (e.name.endsWith('.js')) files.push(full);
    });
    walk(SRC);
    const mentioning = files.filter((f) => fs.readFileSync(f, 'utf8').includes('clientContractVersion')).map((f) => path.relative(SRC, f).replace(/\\/g, '/'));
    expect(mentioning).toEqual(['utils/calculationPayload.js']);
    const usingConstant = files.filter((f) => fs.readFileSync(f, 'utf8').includes('CLIENT_CALCULATION_CONTRACT_VERSION')).map((f) => path.relative(SRC, f).replace(/\\/g, '/')).sort();
    expect(usingConstant).toEqual(['config/calculationContract.js', 'utils/calculationPayload.js']);
  });
});

describe('all 12 professional calculators still route through the shared calculation path', () => {
  const tools = Object.entries(contracts.tools);

  it('covers exactly the 12 professional tools', () => {
    expect(tools).toHaveLength(12);
  });

  it.each(tools.map(([tool, c]) => [tool, c.component]))('%s (%s) calls runWithTracking and never saves on its own', (_tool, component) => {
    const source = read(`components/tasks/${component}`);
    expect(source).toContain('runWithTracking(');
    expect(source).toContain('useGuardedCalculation');
    // no direct persistence, direct network access, or contract literals in a calculator
    expect(source).not.toMatch(/trackCalculation|saveCalculation|CalculationService|useCalculationTracking/);
    expect(source).not.toMatch(/\bfetch\(|axios/);
    expect(source).not.toMatch(/clientContractVersion|CLIENT_CALCULATION_CONTRACT_VERSION/);
    expect(source).toContain('getResultData'); // the persisted subset stays declared next to the calculator
  });

  it('the shared hook is the only place the authoritative overlay is applied', () => {
    const hook = read('hooks/useGuardedCalculation.js');
    expect(hook).toContain('applyAuthoritativeResult(runResult, saved)');
    for (const [, c] of tools) expect(read(`components/tasks/${c.component}`)).not.toContain('applyAuthoritativeResult');
  });

  it('the shared hook handles CLIENT_REFRESH_REQUIRED and structured validation errors through the pure classifier', () => {
    const hook = read('hooks/useGuardedCalculation.js');
    expect(hook).toContain("failure.kind === 'refresh_required'");
    expect(hook).toContain('refreshRequiredMessage(language)');
    expect(hook).toContain("failure.kind === 'validation'");
  });

  it('the save service propagates the backend status/code/field on failures', () => {
    const service = read('services/calculationService.js');
    expect(service).toMatch(/status: response\.status/);
    expect(service).toMatch(/code: errorData\.code/);
  });
});
