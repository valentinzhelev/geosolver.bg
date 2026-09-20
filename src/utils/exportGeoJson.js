import { isExplicitGeographicGnssPoint, isSupportedCrs, projectedToWgs84 } from '../domain/geodesy/crsTransform';

/**
 * Export survey points as a standards-compliant GEOGRAPHIC GeoJSON FeatureCollection: geometry.coordinates is
 * [longitude, latitude] in WGS84 (RFC 7946). GeoJSON is only produced when the source coordinate system is KNOWN:
 *
 *  - `crs` (the project's coordinate system, e.g. 'EPSG:7801') is required and must be one GeoSolver can transform
 *    to WGS84; projected points are transformed with it (x = Northing, y = Easting -> [lon, lat]);
 *  - crs 'EPSG:4326' means the points are already geographic (x = latitude, y = longitude) -> [y, x];
 *  - a point explicitly tagged as GNSS geographic input is always [y (lon), x (lat)];
 *  - with no usable crs the export FAILS with GeoJsonCrsError. Raw projected metres are never written as if they
 *    were longitude/latitude, no CRS is invented and no non-standard GeoJSON "crs" member is added.
 *
 * The original survey values stay available in properties X (Northing) and Y (Easting) (or latitude/longitude for
 * geographic points); stored points are never modified.
 */

export class GeoJsonCrsError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'GeoJsonCrsError';
    this.code = code; // 'CRS_REQUIRED' | 'CRS_UNSUPPORTED' | 'TRANSFORM_FAILED'
  }
}

export const GEOJSON_CRS_REQUIRED_MESSAGE = Object.freeze({
  bg: 'GeoJSON експортът изисква зададена координатна система (EPSG) на проекта. Изберете проект с координатна система и опитайте отново.',
  en: 'GeoJSON export requires the project to have a coordinate system (EPSG). Select a project with a coordinate system and try again.',
});

export function geoJsonErrorMessage(error, language = 'bg') {
  const l = language === 'bg' ? 'bg' : 'en';
  return error instanceof GeoJsonCrsError ? GEOJSON_CRS_REQUIRED_MESSAGE[l] : error?.message || String(error);
}

function lonLatOf(point, crs) {
  const x = Number(point.x);
  const y = Number(point.y);
  if (crs === 'EPSG:4326' || isExplicitGeographicGnssPoint(point)) return [y, x]; // x = latitude, y = longitude
  const { lat, lon } = projectedToWgs84(x, y, crs);
  return [lon, lat];
}

export function pointsToGeoJson(points = [], { name = 'GeoSolver points', crs = null } = {}) {
  if (!crs) {
    throw new GeoJsonCrsError('CRS_REQUIRED', 'A coordinate system (crs) is required for GeoJSON export.');
  }
  if (!isSupportedCrs(crs)) {
    throw new GeoJsonCrsError('CRS_UNSUPPORTED', `Unsupported coordinate system: ${crs}`);
  }

  const features = points
    .filter((p) => p.x != null && p.y != null && Number.isFinite(Number(p.x)) && Number.isFinite(Number(p.y)))
    .map((p) => {
      let coordinates;
      try {
        coordinates = lonLatOf(p, crs);
      } catch (e) {
        throw new GeoJsonCrsError('TRANSFORM_FAILED', `Point "${p.name}" could not be transformed from ${crs}: ${e.message}`);
      }
      if (!coordinates.every(Number.isFinite)) {
        throw new GeoJsonCrsError('TRANSFORM_FAILED', `Point "${p.name}" has no valid WGS84 position in ${crs}`);
      }
      return {
        type: 'Feature',
        geometry: { type: 'Point', coordinates },
        properties: {
          name: p.name,
          code: p.code || '',
          Y: p.y, // Easting (or longitude for geographic points)
          X: p.x, // Northing (or latitude for geographic points)
          H: p.h != null ? p.h : null,
          sourceCrs: crs,
          layer: p.layer || 'default',
          pointClass: p.pointClass || '',
          notes: p.notes || '',
        },
      };
    });

  return {
    type: 'FeatureCollection',
    name,
    features,
  };
}

export function downloadGeoJson(points, filename = 'geosolver_points', meta = {}) {
  const geo = pointsToGeoJson(points, meta); // throws GeoJsonCrsError when the coordinate system is unknown
  const blob = new Blob([JSON.stringify(geo, null, 2)], { type: 'application/geo+json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.geojson`;
  a.click();
  URL.revokeObjectURL(url);
}
