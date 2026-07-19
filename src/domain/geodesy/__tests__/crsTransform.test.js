import { wgs84ToProjected, projectedToWgs84, looksLikeWgs84, ensureProjectedPoint } from '../crsTransform';

describe('crsTransform', () => {
  test('Sofia approx WGS84 → CCS2005 round-trip', () => {
    const lat = 42.6977;
    const lon = 23.3219;
    const proj = wgs84ToProjected(lat, lon, 'EPSG:7801');
    expect(proj.x).toBeGreaterThan(4e6); // northing
    expect(proj.y).toBeGreaterThan(4e6); // easting (false easting 5e6)
    const back = projectedToWgs84(proj.x, proj.y, 'EPSG:7801');
    expect(back.lat).toBeCloseTo(lat, 4);
    expect(back.lon).toBeCloseTo(lon, 4);
  });

  test('looksLikeWgs84', () => {
    expect(looksLikeWgs84(42.7, 23.3)).toBe(true);
    expect(looksLikeWgs84(4723456, 5123456)).toBe(false);
  });

  test('ensureProjectedPoint transforms lat/lon stored as x/y', () => {
    const p = ensureProjectedPoint({ name: 'T', x: 42.7, y: 23.3, h: 500 }, 'EPSG:7801');
    expect(p.transformed).toBe(true);
    expect(p.x).toBeGreaterThan(1e5);
    expect(p.y).toBeGreaterThan(1e5);
  });
});
