import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import SurveyPlanMap from '../map/SurveyPlanMap';
import Points3DPreview from '../map/Points3DPreview';
import TaskGeometrySketch from '../tasks/TaskGeometrySketch';
import TwoPointSketch from '../tasks/TwoPointSketch';
import TaskDiagramSvg from '../classroom/ui/TaskDiagramSvg';
import { createGeoMapper } from '../../utils/geoDiagramUtils';

// QA-02: every coordinate PLOT must show Northing (internal x) UP and Easting (internal y) to the RIGHT.
// Deterministic case: B is 100 m NORTH of A (must render ABOVE A); C is 100 m EAST of A (must render RIGHT of A).

const A = { _id: 'a', name: 'A', x: 0, y: 0 };
const B = { _id: 'b', name: 'B', x: 100, y: 0 };
const C = { _id: 'c', name: 'C', x: 0, y: 100 };

const circles = (html) => [...html.matchAll(/<circle cx="([-\d.]+)" cy="([-\d.]+)" r="([\d.]+)"/g)].map((m) => ({ cx: +m[1], cy: +m[2], r: +m[3] }));
const lines = (html) => [...html.matchAll(/<line x1="([-\d.]+)" y1="([-\d.]+)" x2="([-\d.]+)" y2="([-\d.]+)"([^>]*)>/g)]
  .map((m) => ({ x1: +m[1], y1: +m[2], x2: +m[3], y2: +m[4], rest: m[5] }));

describe('SurveyPlanMap (2D plan): +X up, +Y right', () => {
  const html = renderToStaticMarkup(<SurveyPlanMap points={[A, B, C]} language="en" showGrid={false} />);
  const dots = circles(html).filter((c) => c.r === 5); // one 5px dot per unselected point, in input order
  const [a, b, c] = dots;

  it('renders three points', () => {
    expect(dots).toHaveLength(3);
  });

  it('B (100 m NORTH of A) is ABOVE A, in the same column', () => {
    expect(b.cy).toBeLessThan(a.cy);
    expect(Math.abs(b.cx - a.cx)).toBeLessThan(1e-6);
  });

  it('C (100 m EAST of A) is to the RIGHT of A, in the same row', () => {
    expect(c.cx).toBeGreaterThan(a.cx);
    expect(Math.abs(c.cy - a.cy)).toBeLessThan(1e-6);
  });

  it('the north arrow key is labelled X and the help text says X north / Y east', () => {
    expect(html).toContain('X ↑ north, Y → east');
    expect(html).not.toMatch(/Y ↑ north/);
  });
});

describe('Points3DPreview: north up-left, east up-right, height up; axes are labelled', () => {
  const pts = [
    { _id: 'a', name: 'A', x: 0, y: 0, h: 0 },
    { _id: 'b', name: 'B', x: 100, y: 0, h: 0 },
    { _id: 'c', name: 'C', x: 0, y: 100, h: 0 },
    { _id: 'd', name: 'D', x: 0, y: 0, h: 50 },
  ];
  const html = renderToStaticMarkup(<Points3DPreview points={pts} language="en" />);
  const tops = circles(html).filter((c) => c.r === 4); // one dot at each point's top
  const [a, b, c, d] = tops;

  it('B (north of A) is up and to the left; C (east of A) is up and to the right', () => {
    expect(b.cx).toBeLessThan(a.cx); expect(b.cy).toBeLessThan(a.cy);
    expect(c.cx).toBeGreaterThan(a.cx); expect(c.cy).toBeLessThan(a.cy);
  });

  it('a higher point (same x, y) is straight above', () => {
    expect(Math.abs(d.cx - a.cx)).toBeLessThan(1e-6);
    expect(d.cy).toBeLessThan(a.cy);
  });

  it('the axis key states X (N), Y (E) and H', () => {
    expect(html).toContain('X (N)');
    expect(html).toContain('Y (E)');
    expect(html).toMatch(/>H</);
  });
});

describe('TaskGeometrySketch / TwoPointSketch: Easting horizontal, Northing vertical', () => {
  it('TaskGeometrySketch: P2 100 m north of P1 is directly above; 100 m east is directly right', () => {
    const north = circles(renderToStaticMarkup(<TaskGeometrySketch y1={0} x1={0} y2={0} x2={100} />)).filter((c) => c.r === 5);
    expect(north[1].cy).toBeLessThan(north[0].cy);
    expect(Math.abs(north[1].cx - north[0].cx)).toBeLessThan(1e-6);
    const east = circles(renderToStaticMarkup(<TaskGeometrySketch y1={0} x1={0} y2={100} x2={0} />)).filter((c) => c.r === 5);
    expect(east[1].cx).toBeGreaterThan(east[0].cx);
    expect(Math.abs(east[1].cy - east[0].cy)).toBeLessThan(1e-6);
  });

  it('TaskGeometrySketch: the bearing marker follows 0 gon = up, 100 gon = right', () => {
    const marker = (alpha) => {
      const html = renderToStaticMarkup(<TaskGeometrySketch y1={0} x1={0} y2={100} x2={100} alphaGon={alpha} />);
      return lines(html).find((l) => l.rest.includes('4 3'));
    };
    const up = marker(0);
    expect(Math.abs(up.x2 - up.x1)).toBeLessThan(1e-6);
    expect(up.y2).toBeLessThan(up.y1);
    const right = marker(100);
    expect(right.x2).toBeGreaterThan(right.x1);
    expect(Math.abs(right.y2 - right.y1)).toBeLessThan(1e-6);
  });

  it('TaskGeometrySketch labels the axes X (N) and Y (E)', () => {
    const html = renderToStaticMarkup(<TaskGeometrySketch y1={0} x1={0} />);
    expect(html).toContain('X (N)');
    expect(html).toContain('Y (E)');
  });

  it('TwoPointSketch: the segment runs up for a northern P2 and right for an eastern P2', () => {
    const seg = (y2, x2) => lines(renderToStaticMarkup(<TwoPointSketch y1={0} x1={0} y2={y2} x2={x2} />)).find((l) => l.rest.includes('stroke-width="2"') || true);
    const north = circles(renderToStaticMarkup(<TwoPointSketch y1={0} x1={0} y2={0} x2={100} />));
    const east = circles(renderToStaticMarkup(<TwoPointSketch y1={0} x1={0} y2={100} x2={0} />));
    expect(seg(0, 100)).toBeDefined();
    // the two dots are the first two circles
    expect(north[1].cy).toBeLessThan(north[0].cy);
    expect(Math.abs(north[1].cx - north[0].cx)).toBeLessThan(1e-6);
    expect(east[1].cx).toBeGreaterThan(east[0].cx);
    expect(Math.abs(east[1].cy - east[0].cy)).toBeLessThan(1e-6);
    expect(renderToStaticMarkup(<TwoPointSketch y1={0} x1={0} y2={0} x2={100} />)).toContain('X ↑ N · Y → E');
  });
});

describe('classroom TaskDiagramSvg coordinate plots', () => {
  it('createGeoMapper: Northing up, Easting right, one scale for both axes', () => {
    const m = createGeoMapper([{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 0, y: 100 }], 320, 240);
    const a = m.toScreen(0, 0);
    const b = m.toScreen(100, 0);
    const c = m.toScreen(0, 100);
    expect(b.sy).toBeLessThan(a.sy);
    expect(Math.abs(b.sx - a.sx)).toBeLessThan(1e-9);
    expect(c.sx).toBeGreaterThan(a.sx);
    expect(Math.abs(c.sy - a.sy)).toBeLessThan(1e-9);
    expect(Math.abs((a.sy - b.sy) - (c.sx - a.sx))).toBeLessThan(1e-9); // 100 m north == 100 m east on screen
  });

  it('first basic task: the unknown P2 is drawn along the given bearing (0 gon up, 100 right, 200 down, 300 left)', () => {
    const p2 = (alpha) => {
      const dots = circles(renderToStaticMarkup(<TaskDiagramSvg toolKey="first-basic-task" bg={false} inputData={{ x1: 1000, y1: 500, alpha, s: 50 }} answers={{}} />));
      return { p1: dots[0], p2: dots[1] };
    };
    let d = p2(0); expect(d.p2.cy).toBeLessThan(d.p1.cy); expect(Math.abs(d.p2.cx - d.p1.cx)).toBeLessThan(1e-6);
    d = p2(100); expect(d.p2.cx).toBeGreaterThan(d.p1.cx); expect(Math.abs(d.p2.cy - d.p1.cy)).toBeLessThan(1e-6);
    d = p2(200); expect(d.p2.cy).toBeGreaterThan(d.p1.cy);
    d = p2(300); expect(d.p2.cx).toBeLessThan(d.p1.cx);
  });

  it('second basic task: P2 north of P1 is above, P2 east of P1 is to the right', () => {
    const dots = (x2, y2) => circles(renderToStaticMarkup(<TaskDiagramSvg toolKey="second-basic-task" bg={false} inputData={{ x1: 0, y1: 0, x2, y2 }} />));
    const n = dots(100, 0);
    expect(n[1].cy).toBeLessThan(n[0].cy);
    const e = dots(0, 100);
    expect(e[1].cx).toBeGreaterThan(e[0].cx);
  });

  it('forward intersection: A -> B due east; the rays follow alpha_AB - beta1 from A and alpha_BA + beta2 from B, both towards the LEFT (north) side', () => {
    const html = renderToStaticMarkup(<TaskDiagramSvg toolKey="forward-intersection" bg={false}
      inputData={{ xA: 0, yA: 0, xB: 0, yB: 100, beta1: 50, beta2: 50 }} answers={{}} />);
    const rays = lines(html).filter((l) => l.rest.includes('6 4'));
    expect(rays).toHaveLength(2);
    const [ra, rb] = rays;
    // alpha_AB = 100 gon (east): ray A at 50 gon = north-east (up + right); ray B at 300 + 50 = 350 gon = north-west (up + left)
    expect(ra.y2).toBeLessThan(ra.y1); expect(ra.x2).toBeGreaterThan(ra.x1);
    expect(rb.y2).toBeLessThan(rb.y1); expect(rb.x2).toBeLessThan(rb.x1);
    // and no invented station: the unknown P is not drawn at all
    expect(html).not.toMatch(/>P</);
  });

  it('resection stays the data-independent schematic (unchanged)', () => {
    const one = renderToStaticMarkup(<TaskDiagramSvg toolKey="resection" bg inputData={{ xA: 1, yA: 2 }} />);
    const two = renderToStaticMarkup(<TaskDiagramSvg toolKey="resection" bg inputData={{ xA: 999, yA: -5 }} />);
    expect(one).toBe(two);
  });
});
