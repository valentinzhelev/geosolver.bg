import fs from 'fs';
import path from 'path';

// QA-05: every approved point role must be pickable from the library in EVERY responsive layout. This is a structural
// test over the real component sources: a calculator with separate mobile ("block md:hidden") and desktop
// ("hidden md:flex") layouts must contain a PointPicker recording each role in BOTH of them.

const TASKS = path.join(__dirname, '..');
const MOBILE = 'block md:hidden';
const DESKTOP = 'hidden md:flex';

const APPROVED = [
  { tool: 'first-basic-task', file: 'FirstTask.js', roles: ['station'], responsive: true },
  { tool: 'second-basic-task', file: 'SecondTask.js', roles: ['point1', 'point2'], responsive: true },
  { tool: 'forward-intersection', file: 'ForwardIntersection.js', roles: ['pointA', 'pointB'], responsive: true },
  { tool: 'resection', file: 'Resection.js', roles: ['pointA', 'pointB', 'pointC'], responsive: true },
  { tool: 'polar-intersection', file: 'PolarIntersection.js', roles: ['pointA'], responsive: true },
  { tool: 'hansen-task', file: 'HansenTask.js', roles: ['pointA', 'pointB'], responsive: true },
  { tool: 'coordinate-transformation', file: 'CoordinateTransformation.js', roles: ['pointP'], responsive: true },
  { tool: 'distance-bearing', file: 'DistanceBearing.js', roles: ['point1', 'point2'], responsive: true },
  { tool: 'line-intersection', file: 'LineIntersection.js', roles: ['pointA', 'pointB', 'pointC', 'pointD'], responsive: false },
  { tool: 'offset-point', file: 'OffsetPoint.js', roles: ['pointA', 'pointB'], responsive: false },
  { tool: 'segment-division', file: 'SegmentDivision.js', roles: ['pointA', 'pointB'], responsive: false },
  { tool: 'area-calculation', file: 'AreaCalculation.js', roles: ['vertex:N'], responsive: true },
];

const source = (file) => fs.readFileSync(path.join(TASKS, file), 'utf8');
const count = (text, needle) => text.split(needle).length - 1;

/** The text of one layout branch: from its marker to the next layout marker (or the end of the file). */
function layoutSegments(src) {
  expect(count(src, MOBILE)).toBe(1);
  expect(count(src, DESKTOP)).toBe(1);
  const m = src.indexOf(MOBILE);
  const d = src.indexOf(DESKTOP);
  const [firstStart, secondStart] = m < d ? [m, d] : [d, m];
  const first = src.slice(firstStart, secondStart);
  const second = src.slice(secondStart);
  return m < d ? { mobile: first, desktop: second } : { desktop: first, mobile: second };
}

const recordsRole = (segment, role) =>
  role === 'vertex:N' ? segment.includes('recordSelection(`vertex:${index}`') : segment.includes(`recordSelection('${role}'`);

function assertPickers(segment, roles, where) {
  const pickers = count(segment, '<PointPicker');
  expect({ where, pickers: pickers >= roles.length }).toEqual({ where, pickers: true });
  for (const role of roles) {
    expect({ where, role, recorded: recordsRole(segment, role) }).toEqual({ where, role, recorded: true });
  }
}

describe('PointPicker roles are available in every responsive layout', () => {
  it.each(APPROVED.filter((t) => t.responsive))('$tool: mobile AND desktop layouts both offer $roles', ({ file, roles }) => {
    const { mobile, desktop } = layoutSegments(source(file));
    assertPickers(mobile, roles, 'mobile');
    assertPickers(desktop, roles, 'desktop');
  });

  it.each(APPROVED.filter((t) => !t.responsive))('$tool: single layout offers $roles', ({ file, roles }) => {
    const src = source(file);
    expect(src).not.toContain(MOBILE); // genuinely one layout; if a split is introduced, move it to the responsive list
    assertPickers(src, roles, 'single');
  });

  it('the matrix covers exactly the 12 professional calculators', () => {
    expect(APPROVED.map((t) => t.tool)).toHaveLength(12);
    expect(new Set(APPROVED.map((t) => t.tool)).size).toBe(12);
  });

  it('the two QA-05 gaps are closed: Forward has pickers in mobile, Resection in desktop', () => {
    const fwd = layoutSegments(source('ForwardIntersection.js'));
    expect(count(fwd.mobile, '<PointPicker')).toBe(2);
    expect(fwd.mobile).toContain("recordSelection('pointA'");
    expect(fwd.mobile).toContain("recordSelection('pointB'");
    const res = layoutSegments(source('Resection.js'));
    expect(count(res.desktop, '<PointPicker')).toBe(3);
    expect(res.desktop).toContain("recordSelection('pointC'");
  });

  it('every layout writes the pick into the SAME fields (Y then X per role) and manual edits go through noteFieldChange', () => {
    for (const [file, pairs] of [
      ['ForwardIntersection.js', [['pointA', 'yA', 'xA'], ['pointB', 'yB', 'xB']]],
      ['Resection.js', [['pointA', 'yA', 'xA'], ['pointB', 'yB', 'xB'], ['pointC', 'yC', 'xC']]],
    ]) {
      const src = source(file);
      const { mobile, desktop } = layoutSegments(src);
      for (const seg of [mobile, desktop]) {
        for (const [role, yf, xf] of pairs) {
          expect(seg).toContain(`const fields = { ${yf}: String(p.y), ${xf}: String(p.x) }; setForm((f) => ({ ...f, ...fields })); recordSelection('${role}', p, fields);`);
        }
      }
      expect(src).toMatch(/const handleChange = \(e\) => \{[\s\S]{0,200}noteFieldChange\(e\.target\.id, e\.target\.value\)/);
      expect(src).toContain('pointReferences: getPointReferences()');
    }
  });
});
