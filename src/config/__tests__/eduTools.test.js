import { EDU_TOOLS, getEduTool } from '../eduTools';

// Student-facing classroom wording for Resection must match the official v2 contract (Milestone 2.1):
// beta1 = directed CLOCKWISE angle P->A to P->B, beta2 = directed CLOCKWISE angle P->B to P->C,
// measured at the station P — never "angles at A, B, C" and never an unsigned "angle between".

const resection = getEduTool('resection');
const texts = (tool) => [
  tool.descBg, tool.descEn,
  ...tool.inputDisplay.flatMap((f) => [f.labelBg, f.labelEn]),
  ...tool.workflowSteps.flatMap((s) => [s.labelBg, s.labelEn]),
  ...tool.calculatorSteps.flatMap((s) => [s.labelBg, s.labelEn]),
];

describe('Resection classroom wording (directed clockwise angles)', () => {
  const beta = (key) => resection.inputDisplay.find((f) => f.key === key);

  it('beta1 and beta2 labels state the directed clockwise meaning in Bulgarian and English', () => {
    expect(beta('beta1').labelBg).toMatch(/насочен ъгъл по ч\. стр\. от P→A към P→B/);
    expect(beta('beta2').labelBg).toMatch(/насочен ъгъл по ч\. стр\. от P→B към P→C/);
    expect(beta('beta1').labelEn).toMatch(/directed clockwise angle P→A to P→B/);
    expect(beta('beta2').labelEn).toMatch(/directed clockwise angle P→B to P→C/);
  });

  it('the workflow says the angles are measured at P, and calls them directed and clockwise', () => {
    const workflow = resection.workflowSteps.map((s) => s.labelBg).join(' | ');
    expect(workflow).toMatch(/насочените ъгли/);
    expect(workflow).toMatch(/по часовниковата стрелка/);
    expect(workflow).toMatch(/измерени в P/);
    expect(resection.workflowSteps.map((s) => s.labelEn).join(' | ')).toMatch(/directed clockwise angles/);
    expect(resection.calculatorSteps.find((s) => s.key === 'angles').labelBg).toMatch(/насочените ъгли.*по часовниковата стрелка/);
    expect(resection.calculatorSteps.find((s) => s.key === 'angles').labelEn).toMatch(/directed clockwise angles/);
  });

  it('the misleading old wording is gone from every Resection text', () => {
    for (const text of texts(resection)) {
      expect(text).not.toMatch(/ъглите от A, B, C/);
      expect(text).not.toMatch(/angles at A, B, C/);
      expect(text).not.toMatch(/angle between/i);
      expect(text).not.toMatch(/ъгъл между/);
    }
  });

  it('Bulgarian and English stay in step (each Bulgarian angle text has an English counterpart mentioning "clockwise")', () => {
    for (const f of resection.inputDisplay.filter((x) => x.key.startsWith('beta'))) expect(f.labelEn).toMatch(/clockwise/);
    expect(resection.descBg).toMatch(/по часовниковата стрелка/);
    expect(resection.descEn).toMatch(/clockwise/);
  });

  it('nothing else changed: the given coordinates and the answer keys are intact', () => {
    expect(resection.answerKeys.map((a) => a.key)).toEqual(['xP', 'yP']);
    expect(resection.inputDisplay.map((f) => f.key)).toEqual(['xA', 'yA', 'xB', 'yB', 'xC', 'yC', 'beta1', 'beta2']);
  });

  it('the other classroom tools are untouched (Forward Intersection keeps its plain beta labels)', () => {
    const forward = getEduTool('forward-intersection');
    expect(forward.inputDisplay.find((f) => f.key === 'beta1').labelBg).toBe('β₁');
    expect(EDU_TOOLS.map((t) => t.toolKey)).toEqual(['first-basic-task', 'second-basic-task', 'forward-intersection', 'resection']);
  });
});
