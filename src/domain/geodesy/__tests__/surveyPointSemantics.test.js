import fs from 'fs';
import path from 'path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  isExplicitGeographicGnssPoint,
  isSupportedCrs,
  toPlanPoint,
  toOsmFramePoint,
  osmFrameToLatLon,
  wgs84ToProjected,
} from '../crsTransform';
import {
  pointsToGeoJson,
  GeoJsonCrsError,
  GEOJSON_CRS_REQUIRED_MESSAGE,
  geoJsonErrorMessage,
} from '../../../utils/exportGeoJson';
import SurveyPlanMap from '../../../components/map/SurveyPlanMap';

// QA-02 cleanup: stored SurveyPoints never change meaning because of their numeric magnitude, and GeoJSON is
// only produced with a KNOWN coordinate system.

const SMALL = { name: 'S', x: 50, y: 20 }; // 50 m Northing, 20 m Easting
const LARGE = { name: 'L', x: 500000, y: 4700000 }; // projected-looking magnitudes
const src = (rel) => fs.readFileSync(path.join(__dirname, '..', '..', '..', rel), 'utf8');

describe('stored survey points are never reinterpreted by magnitude (2D plan)', () => {
  it('small and large ordinary points get IDENTICAL semantic treatment: untouched survey coordinates', () => {
    for (const p of [SMALL, LARGE]) {
      const plan = toPlanPoint(p, 'EPSG:7801');
      expect(plan.x).toBe(p.x);
      expect(plan.y).toBe(p.y);
      expect(plan.transformed).toBe(false);
      expect(isExplicitGeographicGnssPoint(p)).toBe(false);
    }
  });

  it('numeric strings from the API are only converted to numbers, never re-interpreted', () => {
    const plan = toPlanPoint({ name: 'S', x: '50', y: '20' }, 'EPSG:7801');
    expect(plan.x).toBe(50);
    expect(plan.y).toBe(20);
    expect(plan.transformed).toBe(false);
  });

  it('other layers/classes never qualify, even with geographic-looking numbers', () => {
    expect(isExplicitGeographicGnssPoint({ x: 42.7, y: 23.3 })).toBe(false);
    expect(isExplicitGeographicGnssPoint({ x: 42.7, y: 23.3, layer: 'gnss' })).toBe(false); // needs BOTH tags
    expect(isExplicitGeographicGnssPoint({ x: 42.7, y: 23.3, layer: 'default', pointClass: 'gnss' })).toBe(false);
    expect(toPlanPoint({ x: 42.7, y: 23.3, layer: 'detail', pointClass: 'control' }).transformed).toBe(false);
  });

  it('an explicitly GNSS-tagged geographic point (x = latitude, y = longitude) IS projected into the selected CRS', () => {
    const gnss = { name: 'G', x: 42.6977, y: 23.3219, layer: 'gnss', pointClass: 'gnss' };
    const plan = toPlanPoint(gnss, 'EPSG:7801');
    const expected = wgs84ToProjected(42.6977, 23.3219, 'EPSG:7801');
    expect(plan.x).toBeCloseTo(expected.x, 6); // Northing
    expect(plan.y).toBeCloseTo(expected.y, 6); // Easting
    expect(plan.transformed).toBe(true);
    expect(gnss.x).toBe(42.6977); // the stored point is not modified
  });

  it('a GNSS-tagged point that already holds projected metres (converted at import) is left alone', () => {
    const projected = { name: 'P', x: 4726000, y: 4890000, layer: 'gnss', pointClass: 'gnss' };
    expect(isExplicitGeographicGnssPoint(projected)).toBe(false);
    expect(toPlanPoint(projected).x).toBe(4726000);
  });

  it('the plan draws x = 50 / y = 20 exactly like x = 500000 / y = 4700000 (same relative layout)', () => {
    const layout = (base) => {
      const pts = [
        { _id: 'a', name: 'A', x: base.x, y: base.y },
        { _id: 'b', name: 'B', x: base.x + 100, y: base.y }, // 100 m north
        { _id: 'c', name: 'C', x: base.x, y: base.y + 100 }, // 100 m east
      ].map((p) => toPlanPoint(p, 'EPSG:7801'));
      const html = renderToStaticMarkup(<SurveyPlanMap points={pts} language="en" showGrid={false} />);
      return [...html.matchAll(/<circle cx="([-\d.]+)" cy="([-\d.]+)" r="5"/g)].map((m) => [+m[1], +m[2]]);
    };
    const small = layout(SMALL);
    const large = layout(LARGE);
    expect(small).toHaveLength(3);
    small.forEach(([cx, cy], i) => {
      expect(cx).toBeCloseTo(large[i][0], 6);
      expect(cy).toBeCloseTo(large[i][1], 6);
    });
    const [a, b, c] = small;
    expect(b[1]).toBeLessThan(a[1]); // north is up
    expect(c[0]).toBeGreaterThan(a[0]); // east is right
  });

  it('MapPage uses the explicit rule: no numeric heuristic is applied to stored points', () => {
    const page = src('components/pages/Map/MapPage.js');
    expect(page).toContain('toPlanPoint');
    expect(page).toContain('toOsmFramePoint');
    expect(page).not.toMatch(/ensureProjectedPoint|looksLikeWgs84/);
  });
});

describe('OSM display frame (unchanged for GNSS, explicit for everything else)', () => {
  it('a GNSS-tagged geographic point: latitude/longitude reach Leaflet the right way round', () => {
    const { lat, lon } = osmFrameToLatLon(toOsmFramePoint({ name: 'G', x: 42.6977, y: 23.3219, layer: 'gnss', pointClass: 'gnss' }));
    expect(lat).toBeCloseTo(42.6977, 6);
    expect(lon).toBeCloseTo(23.3219, 6);
  });

  it('a small ordinary survey point is NOT treated as latitude/longitude (it goes through the selected CRS)', () => {
    const osm = toOsmFramePoint(SMALL, 'EPSG:7801');
    if (osm) {
      const { lat } = osmFrameToLatLon(osm);
      expect(lat).not.toBeCloseTo(50, 3); // as degrees it would have been latitude 50
    }
  });

  it('a projected survey point maps through the selected CRS to the right latitude/longitude', () => {
    const proj = wgs84ToProjected(42.6977, 23.3219, 'EPSG:7801');
    const { lat, lon } = osmFrameToLatLon(toOsmFramePoint({ name: 'K', x: proj.x, y: proj.y }, 'EPSG:7801'));
    expect(lat).toBeCloseTo(42.6977, 5);
    expect(lon).toBeCloseTo(23.3219, 5);
  });

  it('a point that cannot be placed yields null instead of pretending (unknown CRS)', () => {
    expect(toOsmFramePoint({ name: 'K', x: 4700000, y: 500000 }, 'EPSG:9999')).toBeNull();
  });
});

describe('GeoJSON: standards-compliant [longitude, latitude] only with a known coordinate system', () => {
  const sofia = wgs84ToProjected(42.6977, 23.3219, 'EPSG:7801'); // { x: Northing, y: Easting }
  const project = (p, crs = 'EPSG:7801') => pointsToGeoJson([p], { crs }).features[0];

  it('a projected point with the project CRS exports [lon, lat] (longitude FIRST)', () => {
    const f = project({ name: 'K', x: sofia.x, y: sofia.y, h: 550 });
    expect(f.geometry.coordinates[0]).toBeCloseTo(23.3219, 5); // lon
    expect(f.geometry.coordinates[1]).toBeCloseTo(42.6977, 5); // lat
    expect(f.properties.X).toBe(sofia.x); // survey values kept as properties
    expect(f.properties.Y).toBe(sofia.y);
    expect(f.properties.sourceCrs).toBe('EPSG:7801');
  });

  it('small local coordinates are transformed with the CRS too, never written raw', () => {
    const f = project(SMALL);
    expect(f.geometry.coordinates).not.toEqual([50, 20]);
    expect(f.geometry.coordinates).not.toEqual([20, 50]);
  });

  it('a geographic source (EPSG:4326: x = latitude, y = longitude) exports [lon, lat] = [y, x]', () => {
    expect(project({ name: 'G', x: 42.6977, y: 23.3219 }, 'EPSG:4326').geometry.coordinates).toEqual([23.3219, 42.6977]);
  });

  it('a GNSS-tagged geographic point is [lon, lat] whatever the project CRS', () => {
    expect(project({ name: 'G', x: 42.6977, y: 23.3219, layer: 'gnss', pointClass: 'gnss' }).geometry.coordinates).toEqual([23.3219, 42.6977]);
  });

  it.each([[null], [undefined], ['']])('no CRS (%p) => the export FAILS (no raw metres as fake lon/lat)', (crs) => {
    let error;
    try { pointsToGeoJson([{ name: 'K', x: 4700000, y: 500000 }], { crs }); } catch (e) { error = e; }
    expect(error).toBeInstanceOf(GeoJsonCrsError);
    expect(error.code).toBe('CRS_REQUIRED');
  });

  it('an unsupported CRS fails as well (never invented)', () => {
    let error;
    try { pointsToGeoJson([{ name: 'K', x: 1, y: 2 }], { crs: 'EPSG:9999' }); } catch (e) { error = e; }
    expect(error).toBeInstanceOf(GeoJsonCrsError);
    expect(error.code).toBe('CRS_UNSUPPORTED');
    expect(isSupportedCrs('EPSG:7801')).toBe(true);
    expect(isSupportedCrs('EPSG:9999')).toBe(false);
  });

  it('the result is plain GeoJSON: no non-standard "crs" member is added', () => {
    const geo = pointsToGeoJson([{ name: 'K', x: sofia.x, y: sofia.y }], { crs: 'EPSG:7801', name: 'T' });
    expect(Object.keys(geo).sort()).toEqual(['features', 'name', 'type']);
    expect(geo.type).toBe('FeatureCollection');
  });

  it('does not modify the input points', () => {
    const p = { name: 'K', x: sofia.x, y: sofia.y };
    const copy = { ...p };
    pointsToGeoJson([p], { crs: 'EPSG:7801' });
    expect(p).toEqual(copy);
  });

  it('the user-facing failure message is professional Bulgarian (and English)', () => {
    expect(GEOJSON_CRS_REQUIRED_MESSAGE.bg).toMatch(/координатна система/);
    expect(geoJsonErrorMessage(new GeoJsonCrsError('CRS_REQUIRED', 'x'), 'bg')).toBe(GEOJSON_CRS_REQUIRED_MESSAGE.bg);
    expect(geoJsonErrorMessage(new GeoJsonCrsError('CRS_REQUIRED', 'x'), 'en')).toBe(GEOJSON_CRS_REQUIRED_MESSAGE.en);
    expect(geoJsonErrorMessage(new Error('boom'), 'bg')).toBe('boom');
  });

  it('the callers pass the PROJECT crs and surface the message; the ZIP package skips GeoJSON instead of writing raw metres', () => {
    expect(src('components/pages/Points/PointsPage.js')).toMatch(/projects\.find[\s\S]{0,120}\?\.crs/);
    expect(src('components/pages/Points/PointsPage.js')).toContain('geoJsonErrorMessage');
    expect(src('components/pages/Map/MapPage.js')).toContain('exportProjectCrs');
    const pkg = src('utils/exportProjectPackage.js');
    expect(pkg).toContain("crs: project?.crs || null");
    expect(pkg).toContain('GeoJsonCrsError');
    expect(pkg).toContain('geojsonIncluded');
  });
});
