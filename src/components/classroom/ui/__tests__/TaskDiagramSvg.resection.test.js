import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import fs from 'fs';
import path from 'path';
import TaskDiagramSvg from '../TaskDiagramSvg';

// Milestone 2.1 follow-up: the Resection diagram is a fixed SCHEMATIC of the v2 convention (directed
// clockwise angles with the vertex at P). The station P is the unknown, so the diagram must be completely
// independent of task data and must never carry ground truth, solution or any hidden coordinate.

const SECRET = 31337.125;
const poisonedInput = {
  xA: 111.111, yA: 222.222, xB: 333.333, yB: 444.444, xC: 555.555, yC: 666.666, beta1: 77.777, beta2: 88.888,
  __groundTruth: { xP: SECRET, yP: SECRET },
  solution: { xP: SECRET, yP: SECRET },
  solutionHash: 'hash-hash-hash',
};
const poisonedAnswers = { xP: SECRET, yP: SECRET, __groundTruth: { xP: SECRET } };
const render = (props) => renderToStaticMarkup(<TaskDiagramSvg toolKey="resection" bg {...props} />);

describe('Resection diagram: no hidden solution data can reach it', () => {
  it('the markup is IDENTICAL whatever task data / answers / poisoned fields it is given (it uses none)', () => {
    const empty = render({ inputData: {}, answers: {} });
    expect(render({ inputData: poisonedInput, answers: poisonedAnswers })).toBe(empty);
    expect(render({ inputData: { ...poisonedInput, beta1: 1, xA: 5 }, answers: undefined })).toBe(empty);
  });

  it('nothing hidden or numeric-from-the-task appears in the rendered SVG/HTML', () => {
    const html = render({ inputData: poisonedInput, answers: poisonedAnswers });
    for (const forbidden of ['__groundTruth', 'groundTruth', 'solution', 'solutionHash', 'hash-hash-hash', String(SECRET), '31337', '111.111', '222.222', '77.777', '88.888']) {
      expect(html).not.toContain(forbidden);
    }
  });

  it('the Resection branch of the component never reads inputData or answers', () => {
    const src = fs.readFileSync(path.join(__dirname, '..', 'TaskDiagramSvg.js'), 'utf8');
    const start = src.indexOf("if (toolKey === 'resection')");
    const branch = src.slice(start, src.indexOf('return (\n    <div className="w-full max-w-[340px] h-[140px]'));
    expect(branch).not.toMatch(/inputData|answers|solution|groundTruth/);
    const helper = src.slice(src.indexOf('function ResectionConventionSchematic'), src.indexOf('const TaskDiagramSvg'));
    expect(helper).not.toMatch(/inputData|answers|solution|groundTruth/);
  });
});

describe('Resection diagram states the official v2 convention', () => {
  const html = render({ inputData: {}, answers: {} });

  it('both angle arcs are drawn from P, clockwise, with arrowheads; the unknown P is dashed and shows "?" (no coordinates)', () => {
    expect((html.match(/ A \d+ \d+ 0 0 1 /g) || []).length).toBe(2); // two clockwise (sweep-flag 1) arcs
    expect((html.match(/marker-end/g) || []).length).toBe(2);
    expect(html).toContain('>?<');
  });

  it('labels say P→A to P→B and P→B to P→C, and the caption says the angles are clockwise at P (Bulgarian)', () => {
    expect(html).toContain('β₁: P→A към P→B');
    expect(html).toContain('β₂: P→B към P→C');
    expect(html).toContain('по ч. стр. в P');
    expect(renderToStaticMarkup(<TaskDiagramSvg toolKey="resection" bg={false} inputData={{}} />)).toContain('β₁: P→A to P→B');
  });

  it('does not use the old misleading rendering: no rays start at A or B, no "angle between" wording', () => {
    expect(html).not.toMatch(/ъгъл между|angle between/i);
    // all three rays start at the SAME point, P (the old code started rays at A and B)
    const rays = html.match(/<line x1="([\d.]+)" y1="([\d.]+)"/g) || [];
    const fromP = rays.filter((r) => r.includes('x1="150" y1="175"'));
    expect(fromP).toHaveLength(3);
  });

  it('the other tools keep rendering their data-driven diagrams (forward intersection untouched)', () => {
    const fwd = renderToStaticMarkup(<TaskDiagramSvg toolKey="forward-intersection" bg inputData={{ xA: 1, yA: 2, xB: 30, yB: 40, beta1: 50, beta2: 60 }} />);
    expect(fwd).toContain('β₁');
    expect(fwd).not.toContain('P→A');
  });
});
