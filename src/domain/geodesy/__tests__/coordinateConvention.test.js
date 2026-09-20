import fs from 'fs';
import path from 'path';
import {
  COORDINATE_CONVENTION,
  coordinateConventionText,
  bearingUnitVector,
  bearingScreenVector,
  toCartesian,
  planPosition,
  isoPosition,
} from '../coordinateConvention';
import { calculateFirstTask } from '../firstTask';
import { calculateSecondTask } from '../secondTask';
import { wgs84ToProjected, toOsmFramePoint, osmFrameToLatLon } from '../crsTransform';
import { parseGnssCsv, pointsToCsvString } from '../../../utils/parseGnssImport';
import { pointsToDxf } from '../../../utils/exportDxf';

// QA-02: the official convention is X = Northing, Y = Easting, bearings clockwise from +X (0 gon = north,
// 100 gon = east). These tests use ASYMMETRIC values so an accidental x/y swap cannot pass.

const close = (a, b, eps = 1e-9) => expect(Math.abs(a - b)).toBeLessThanOrEqual(eps);

describe('the official convention is pinned', () => {
  it('states X = north (Northing) and Y = east (Easting) in Bulgarian and English', () => {
    expect(COORDINATE_CONVENTION.xMeaning.bg).toBe('X = север (Northing)');
    expect(COORDINATE_CONVENTION.yMeaning.bg).toBe('Y = изток (Easting)');
    expect(coordinateConventionText('en')).toBe('X = north (Northing), Y = east (Easting)');
    expect(COORDINATE_CONVENTION.bearing.en).toBe('0 gon = north (+X), 100 gon = east (+Y)');
  });

  it('bearings: 0 gon = +X (north), 100 gon = +Y (east), 200 = south, 300 = west', () => {
    const at = (g) => bearingUnitVector(g);
    close(at(0).dNorth, 1); close(at(0).dEast, 0);
    close(at(100).dNorth, 0); close(at(100).dEast, 1);
    close(at(200).dNorth, -1); close(at(200).dEast, 0);
    close(at(300).dNorth, 0); close(at(300).dEast, -1);
  });

  it('the REAL calculators agree with the convention (first/second basic task)', () => {
    // P1 at X = 1000 N, Y = 500 E; 100 m at 0 gon must go NORTH (+X), at 100 gon EAST (+Y)
    const north = calculateFirstTask(500, 1000, 0, 100);
    close(north.x2, 1100, 1e-6); close(north.y2, 500, 1e-6);
    const east = calculateFirstTask(500, 1000, 100, 100);
    close(east.x2, 1000, 1e-6); close(east.y2, 600, 1e-6);
    // second task: a point due north has bearing 0 gon, a point due east 100 gon
    close(calculateSecondTask(1000, 500, 1100, 500).alphaAtan2 ?? calculateSecondTask(1000, 500, 1100, 500).alpha, 0, 1e-6);
    close(calculateSecondTask(1000, 500, 1000, 600).alphaAtan2 ?? calculateSecondTask(1000, 500, 1000, 600).alpha, 100, 1e-6);
  });

  it('Cartesian presentation: horizontal = Easting (y), vertical = Northing (x)', () => {
    expect(toCartesian({ x: 1234.5, y: 678.9 })).toEqual({ horizontal: 678.9, vertical: 1234.5 });
  });
});

describe('screen mapping (north up, SVG y grows downward)', () => {
  const view = { cx: 50, cy: 50, span: 200, innerW: 400, innerH: 400, pad: 10 };
  const A = planPosition(0, 0, view);
  const B = planPosition(100, 0, view); // 100 m NORTH of A
  const C = planPosition(0, 100, view); // 100 m EAST of A

  it('plan: +X (north) renders ABOVE, +Y (east) renders to the RIGHT', () => {
    expect(B.sy).toBeLessThan(A.sy); // above
    close(B.sx, A.sx); // same column
    expect(C.sx).toBeGreaterThan(A.sx); // right
    close(C.sy, A.sy); // same row
    close(A.sy - B.sy, 200); // 100 m at 400 px per 200 m
    close(C.sx - A.sx, 200);
  });

  it('screen bearings: 0 gon up, 100 gon right, 200 down, 300 left', () => {
    const v = bearingScreenVector;
    close(v(0).dx, 0); close(v(0).dy, -1);
    close(v(100).dx, 1); close(v(100).dy, 0);
    close(v(200).dx, 0); close(v(200).dy, 1);
    close(v(300).dx, -1); close(v(300).dy, 0);
  });

  it('isometric preview: north goes up-left, east goes up-right, height goes straight up', () => {
    const iso = { cx: 0, cy: 0, spanXY: 100, minH: 0, spanH: 10, size: 300 };
    const o = isoPosition(0, 0, 0, iso);
    const n = isoPosition(100, 0, 0, iso);
    const e = isoPosition(0, 100, 0, iso);
    const h = isoPosition(0, 0, 10, iso);
    expect(n.sx).toBeLessThan(o.sx); expect(n.sy).toBeLessThan(o.sy);
    expect(e.sx).toBeGreaterThan(o.sx); expect(e.sy).toBeLessThan(o.sy);
    close(h.sx, o.sx); expect(h.sy).toBeLessThan(o.sy);
  });
});

describe('DXF export: CAD X = Easting (internal y), CAD Y = Northing (internal x)', () => {
  it('asymmetric point x = 1234.5 (N), y = 678.9 (E), h = 12', () => {
    const lines = pointsToDxf([{ name: 'P', x: 1234.5, y: 678.9, h: 12 }]).split('\r\n');
    const value = (code) => lines[lines.indexOf(code, lines.indexOf('POINT')) + 1];
    expect(value('10')).toBe('678.900'); // CAD X = Easting
    expect(value('20')).toBe('1234.500'); // CAD Y = Northing
    expect(value('30')).toBe('12.000'); // elevation unchanged
  });

  it('does not touch the input point (storage semantics unchanged)', () => {
    const p = { name: 'P', x: 1234.5, y: 678.9, h: 12 };
    pointsToDxf([p]);
    expect(p).toEqual({ name: 'P', x: 1234.5, y: 678.9, h: 12 });
  });
});

describe('GNSS -> OSM runtime chain (x = latitude / y = longitude in the library; OSM frame y = lat, x = lon)', () => {
  const LAT = 42.6977;
  const LON = 23.3219; // Sofia: asymmetric, latitude != longitude and only one ordering is inside Bulgaria

  it('GNSS CSV: lat -> x, lon -> y (the library convention)', () => {
    const [p] = parseGnssCsv('name,lat,lon,h\nS1,42.6977,23.3219,550');
    expect(p.x).toBeCloseTo(LAT, 6);
    expect(p.y).toBeCloseTo(LON, 6);
  });

  it('library WGS84 point -> OSM frame -> Leaflet latitude/longitude (no swap error)', () => {
    const [stored] = parseGnssCsv('name,lat,lon\nS1,42.6977,23.3219');
    const osm = toOsmFramePoint(stored);
    const { lat, lon } = osmFrameToLatLon(osm);
    expect(lat).toBeCloseTo(LAT, 6);
    expect(lon).toBeCloseTo(LON, 6);
    expect(stored.x).toBeCloseTo(LAT, 6); // the stored point is not modified
  });

  it('projected survey point (X Northing, Y Easting) -> WGS84 -> Leaflet latitude/longitude', () => {
    const proj = wgs84ToProjected(LAT, LON); // { x: Northing, y: Easting }
    expect(Math.abs(proj.x - proj.y)).toBeGreaterThan(1000); // genuinely asymmetric
    const { lat, lon } = osmFrameToLatLon(toOsmFramePoint({ name: 'K', x: proj.x, y: proj.y }));
    expect(lat).toBeCloseTo(LAT, 5);
    expect(lon).toBeCloseTo(LON, 5);
  });

  it('a swapped projected pair would be detected: swapping X/Y lands far from the expected place', () => {
    const proj = wgs84ToProjected(LAT, LON);
    const wrong = osmFrameToLatLon(toOsmFramePoint({ name: 'K', x: proj.y, y: proj.x }));
    expect(Math.abs(wrong.lat - LAT) + Math.abs(wrong.lon - LON)).toBeGreaterThan(0.5);
  });

  it('an ordinary (untagged) point is NEVER read as degrees: it is a projected survey point in the selected CRS', () => {
    // x = 23.3 / y = 42.7 looks like a geographic pair numerically, but it is a stored survey point: no guessing.
    const w = toOsmFramePoint({ name: 'W', x: LON, y: LAT });
    if (w) {
      const { lat, lon } = osmFrameToLatLon(w);
      expect(Math.abs(lat - LON) + Math.abs(lon - LAT)).toBeGreaterThan(1); // not reinterpreted as lat/lon
    }
  });
});

describe('CSV: export -> import keeps x/y semantics (column order Y, X unchanged)', () => {
  const points = [{ name: 'A1', code: 'ctl', y: 678.9, x: 1234.5, h: 12.25, pointClass: 'control', layer: 'default', notes: 'note' }];

  it('the export header is Name, Code, Y, X, H, ... and the values sit under the right headers', () => {
    const [header, row] = pointsToCsvString(points, 'en').replace('﻿', '').split('\r\n');
    const cols = header.split(',');
    const vals = row.split(',');
    expect(cols.slice(0, 5)).toEqual(['Name', 'Code', 'Y', 'X', 'H']);
    expect(vals[cols.indexOf('Y')]).toBe('678.9'); // Easting
    expect(vals[cols.indexOf('X')]).toBe('1234.5'); // Northing
  });

  it('round trip through the header-based importer (GNSS import) returns the same x and y', () => {
    const [back] = parseGnssCsv(pointsToCsvString(points, 'bg'));
    expect(back.y).toBe(678.9);
    expect(back.x).toBe(1234.5);
    expect(back.h).toBe(12.25);
  });

  it('the Points Library importer reads the same columns: index 2 -> y (Easting), index 3 -> x (Northing)', () => {
    const src = fs.readFileSync(path.join(__dirname, '..', '..', '..', 'components', 'pages', 'Points', 'PointsPage.js'), 'utf8');
    expect(src).toMatch(/y: cols\[2\]/);
    expect(src).toMatch(/x: cols\[3\]/);
    const cols = pointsToCsvString(points, 'en').replace('﻿', '').split('\r\n')[0].split(',');
    expect(cols[2]).toBe('Y');
    expect(cols[3]).toBe('X');
  });
});
