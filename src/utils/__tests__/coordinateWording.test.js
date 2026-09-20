import fs from 'fs';
import path from 'path';
import { pointsToGeoJson } from '../exportGeoJson';

// QA-02: the visible contract is X = Northing (север), Y = Easting (изток), 0 gon = north (+X).

const SRC = path.join(__dirname, '..', '..');
const read = (rel) => fs.readFileSync(path.join(SRC, rel), 'utf8');

const walk = (dir, out = []) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === '__tests__' || e.name === '__testing__' || e.name === '__fixtures__' || e.name === 'node_modules') continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, out);
    else if (e.name.endsWith('.js')) out.push(full);
  }
  return out;
};

describe('Points Library wording', () => {
  const page = read('components/pages/Points/PointsPage.js');

  it('states X = север (Northing), Y = изток (Easting) in Bulgarian and English', () => {
    expect(page).toContain('X = север (Northing), Y = изток (Easting)');
    expect(page).toContain('X = north (Northing), Y = east (Easting)');
    expect(page).toContain('0 gon = север (+X)');
  });

  it('the fields say which axis they are, and stay bound Y -> y and X -> x', () => {
    expect(page).toMatch(/Y — изток \/ Easting \(m\)[\s\S]{0,260}form\.y/);
    expect(page).toMatch(/X — север \/ Northing \(m\)[\s\S]{0,260}form\.x/);
    expect(page).toMatch(/Y=изток, X=север/); // CSV import hint
  });
});

describe('no contradictory coordinate statement is left in the visible UI / docs', () => {
  const FORBIDDEN = [
    /Y\s*=\s*север/, /Y\s*=\s*north/i, /X\s*=\s*изток/, /X\s*=\s*east/i,
    /Y е север/, /Y is north/i, /Y сочи към север/, /X към изток/,
    /Y\s*↑\s*(север|north)/i, /Y↑/, /\(Y north/i, /Y north, X east/i, /X east, Y north/i,
    /0 gon ≈ (север|north)/, /north\/Y\+/, /0 gon (=|≈) (север|north) \(\+Y\)/,
    /\blat(itude)? *= *Y(?![\w;])/i, /ширина ≈ Y/,
  ];

  it('scans every production source file', () => {
    const offenders = [];
    for (const file of walk(SRC)) {
      const text = fs.readFileSync(file, 'utf8');
      for (const re of FORBIDDEN) {
        const m = text.match(re);
        if (m) offenders.push(`${path.relative(SRC, file).replace(/\\/g, '/')}: ${m[0]}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it('the help/docs and the map screens carry the corrected statements', () => {
    const docs = read('config/moduleDocs.js');
    expect(docs).toContain('X е север (Northing), Y е изток (Easting)');
    expect(docs).toContain('X is north (Northing), Y is east (Easting)');
    expect(docs).toContain('0 gon = север (+X), 100 gon = изток (+Y)');
    expect(read('components/pages/Map/MapPage.js')).toContain('X↑ север и Y→ изток');
    expect(read('components/stakeout/StakeOutCompass.js')).toContain('0 = north = +X');
    expect(read('components/map/GnssOsmMap.js')).toContain('X = ширина, Y = дължина');
  });
});

describe('GeoJSON export properties keep the survey meaning (behaviour is covered in surveyPointSemantics.test.js)', () => {
  it('X is Northing and Y is Easting in the feature properties', () => {
    const f = pointsToGeoJson([{ name: 'P', x: 1234.5, y: 678.9, h: 12 }], { crs: 'EPSG:7801' }).features[0];
    expect(f.properties.X).toBe(1234.5);
    expect(f.properties.Y).toBe(678.9);
  });
});
