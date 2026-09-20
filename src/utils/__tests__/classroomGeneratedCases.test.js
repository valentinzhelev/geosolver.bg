import { mapInputToForm, mapResultToAnswers } from '../eduCalculatorBridge';
import { calculateForwardIntersection } from '../../domain/geodesy/forwardIntersection';
import { calculateResection } from '../../domain/geodesy/resection';
import cases from './fixtures/classroomGeneratedCases.json';

// Milestone 2.1 - the student-side half of the classroom chain. The fixture holds 200 tasks per tool
// produced by the backend's corrected built-in generators (seeds 1, 11, 21, ... 1991; student-visible
// inputData + the server-side ground truth). The backend proves the same chain for 10,000 seeds per tool
// against the canonical engine and the real grader; here the REAL frontend path is exercised:
// inputData -> mapInputToForm (strings, as the student sees them) -> parse -> domain calculator ->
// mapResultToAnswers -> compare with the ground truth at the classroom tolerance (0.01 m, absolute).

const TOLERANCE = 0.01;
const correct = (answers, truth) => Math.abs(answers.xP - truth.xP) <= TOLERANCE && Math.abs(answers.yP - truth.yP) <= TOLERANCE;
const num = (form, key) => parseFloat(form[key]);

describe('generated classroom tasks solve correctly through the real frontend path', () => {
  it('forward-intersection: 200 generated tasks; beta1 > 0, beta2 > 0, beta1 + beta2 < 200; calculator + answer mapping match the ground truth', () => {
    expect(cases['forward-intersection']).toHaveLength(200);
    for (const { seed, inputData, groundTruth } of cases['forward-intersection']) {
      expect(inputData.beta1).toBeGreaterThan(0);
      expect(inputData.beta2).toBeGreaterThan(0);
      expect(inputData.beta1 + inputData.beta2).toBeLessThan(200);
      const form = mapInputToForm('forward-intersection', inputData);
      const result = calculateForwardIntersection(num(form, 'yA'), num(form, 'xA'), num(form, 'yB'), num(form, 'xB'), num(form, 'beta1'), num(form, 'beta2'));
      const answers = mapResultToAnswers('forward-intersection', result);
      if (!correct(answers, groundTruth)) throw new Error(`seed ${seed}: ${JSON.stringify(answers)} vs ${JSON.stringify(groundTruth)}`);
      expect(correct({ xP: answers.xP + 1, yP: answers.yP + 1 }, groundTruth)).toBe(false);
    }
  });

  it('resection: 200 generated tasks; directed clockwise angles used as given (no complement); calculator + answer mapping match the ground truth', () => {
    expect(cases.resection).toHaveLength(200);
    for (const { seed, inputData, groundTruth } of cases.resection) {
      const form = mapInputToForm('resection', inputData);
      const points = { xA: num(form, 'xA'), yA: num(form, 'yA'), xB: num(form, 'xB'), yB: num(form, 'yB'), xC: num(form, 'xC'), yC: num(form, 'yC') };
      const result = calculateResection(points, { beta1: num(form, 'beta1'), beta2: num(form, 'beta2') });
      const answers = mapResultToAnswers('resection', result);
      if (!correct(answers, groundTruth)) throw new Error(`seed ${seed}: ${JSON.stringify(answers)} vs ${JSON.stringify(groundTruth)}`);
      expect(correct({ xP: answers.xP + 1, yP: answers.yP + 1 }, groundTruth)).toBe(false);
    }
  });

  it('the fixture carries no reserved keys in the student-visible input and none of the answer keys', () => {
    for (const toolKey of Object.keys(cases)) {
      for (const { inputData } of cases[toolKey]) {
        expect(JSON.stringify(inputData)).not.toContain('__');
        expect(inputData).not.toHaveProperty('xP');
        expect(inputData).not.toHaveProperty('yP');
      }
    }
  });
});
