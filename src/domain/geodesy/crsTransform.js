/**
 * CRS transforms for Bulgarian surveying (BGS2005 / CCS2005 / UTM).
 * Platform convention: X = northing, Y = easting.
 * proj4 returns [easting, northing] → mapped to { y, x }.
 */
import proj4 from 'proj4';

const WGS84 = 'EPSG:4326';

/** BGS2005 / CCS2005 (EPSG:7801) — cadastre TM, lon0=27° */
const BGS2005_CCS2005 =
  '+proj=tmerc +lat_0=0 +lon_0=27 +k=1 +x_0=5000000 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs';

/** BGS2005 / UTM zone 34N (EPSG:7799) */
const BGS2005_UTM34 =
  '+proj=utm +zone=34 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs';

/** BGS2005 / UTM zone 35N (EPSG:7800) */
const BGS2005_UTM35 =
  '+proj=utm +zone=35 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs';

proj4.defs('EPSG:7801', BGS2005_CCS2005);
proj4.defs('EPSG:7799', BGS2005_UTM34);
proj4.defs('EPSG:7800', BGS2005_UTM35);

export const CRS_OPTIONS = [
  {
    id: 'EPSG:7801',
    label: { bg: 'BGS2005 / CCS2005 (кадастър)', en: 'BGS2005 / CCS2005 (cadastre)' },
  },
  {
    id: 'EPSG:7799',
    label: { bg: 'BGS2005 UTM 34N', en: 'BGS2005 UTM 34N' },
  },
  {
    id: 'EPSG:7800',
    label: { bg: 'BGS2005 UTM 35N', en: 'BGS2005 UTM 35N' },
  },
];

export const DEFAULT_CRS = 'EPSG:7801';

/**
 * WGS84 geographic → projected metres (BG: x=northing, y=easting).
 * @param {number} lat degrees
 * @param {number} lon degrees
 * @param {string} crsId
 */
export function wgs84ToProjected(lat, lon, crsId = DEFAULT_CRS) {
  if (![lat, lon].every((n) => typeof n === 'number' && Number.isFinite(n))) {
    throw new Error('Невалидни lat/lon');
  }
  const [easting, northing] = proj4(WGS84, crsId, [lon, lat]);
  return {
    y: easting,
    x: northing,
    crs: crsId,
  };
}

/**
 * Projected metres (BG x/y) → WGS84 lat/lon.
 */
export function projectedToWgs84(xNorthing, yEasting, crsId = DEFAULT_CRS) {
  if (![xNorthing, yEasting].every((n) => typeof n === 'number' && Number.isFinite(n))) {
    throw new Error('Невалидни X/Y');
  }
  const [lon, lat] = proj4(crsId, WGS84, [yEasting, xNorthing]);
  return { lat, lon, crs: crsId };
}

/** Heuristic: absolute values look like WGS84 degrees, not projected metres. */
export function looksLikeWgs84(x, y) {
  if (![x, y].every((n) => typeof n === 'number' && Number.isFinite(n))) return false;
  // lat typically |φ|<90, lon |λ|<180; projected BG coords are ~1e5–5e6
  const a = Math.abs(x);
  const b = Math.abs(y);
  return a <= 90 && b <= 180 && (a > 0.1 || b > 0.1);
}

/**
 * If point appears to be lat/lon in x/y (or y/x), convert to projected.
 * Accepts both {x:lat,y:lon} (platform GNSS) and raw numbers.
 */
export function ensureProjectedPoint(point, crsId = DEFAULT_CRS) {
  const x = Number(point?.x);
  const y = Number(point?.y);
  if (!looksLikeWgs84(x, y) && !looksLikeWgs84(y, x)) {
    return { ...point, x, y, crs: point.crs || null, transformed: false };
  }
  // Prefer platform convention X≈lat, Y≈lon
  let lat = x;
  let lon = y;
  if (Math.abs(y) <= 90 && Math.abs(x) > 90 && Math.abs(x) <= 180) {
    // swapped: y=lat, x=lon
    lat = y;
    lon = x;
  }
  const proj = wgs84ToProjected(lat, lon, crsId);
  return {
    ...point,
    x: proj.x,
    y: proj.y,
    h: point.h,
    crs: crsId,
    transformed: true,
    sourceWgs84: { lat, lon },
  };
}

export function crsLabel(crsId, language = 'bg') {
  const opt = CRS_OPTIONS.find((o) => o.id === crsId);
  return opt ? opt.label[language === 'bg' ? 'bg' : 'en'] : crsId;
}

/**
 * EXPLICIT provenance test for a stored point that holds WGS84 DEGREES (x = latitude, y = longitude):
 * only points tagged by the GNSS importer (layer AND pointClass both 'gnss') qualify, and their values must be valid
 * geographic ranges. An ordinary survey point (any other layer/class) is NEVER reinterpreted, whatever its numbers
 * are: x = 50, y = 20 is 50 m Northing / 20 m Easting, exactly like x = 500000, y = 4700000.
 * (The range check only guards an already GNSS-tagged point; it is not used to decide what an ordinary point is.)
 */
export function isExplicitGeographicGnssPoint(point) {
  if (!point || point.layer !== 'gnss' || point.pointClass !== 'gnss') return false;
  const x = Number(point.x);
  const y = Number(point.y);
  return Number.isFinite(x) && Number.isFinite(y) && Math.abs(x) <= 90 && Math.abs(y) <= 180;
}

/** CRS ids GeoSolver can transform to WGS84 (plus EPSG:4326 itself, where x = latitude, y = longitude). */
export function isSupportedCrs(crsId) {
  return typeof crsId === 'string' && (crsId === WGS84 || CRS_OPTIONS.some((o) => o.id === crsId));
}

/**
 * Point for the 2D PLAN: stored survey coordinates stay survey coordinates (X Northing, Y Easting).
 * Only an explicitly GNSS-tagged geographic point is projected into the selected CRS so it can share the plan.
 */
export function toPlanPoint(point, crsId = DEFAULT_CRS) {
  if (isExplicitGeographicGnssPoint(point)) {
    const proj = wgs84ToProjected(Number(point.x), Number(point.y), crsId);
    return { ...point, x: proj.x, y: proj.y, crs: crsId, transformed: true, sourceWgs84: { lat: Number(point.x), lon: Number(point.y) } };
  }
  return { ...point, x: Number(point.x), y: Number(point.y), crs: point.crs || null, transformed: false };
}

/**
 * Prepare one survey-library point for the OSM basemap (GnssOsmMap), or null when it cannot be placed.
 * The result is in the "OSM frame": fields are named by GEOGRAPHIC role - y = LATITUDE, x = LONGITUDE - which is
 * deliberately the reverse of the survey meaning (X = Northing, Y = Easting). Stored points are never modified.
 *
 *  1. explicit GNSS geographic point (see isExplicitGeographicGnssPoint): x = latitude, y = longitude -> swapped in
 *  2. every other point is a PROJECTED survey point in the selected CRS: projectedToWgs84(x, y, crs), lat -> y, lon -> x
 * There is no numeric guessing and no "stored swapped" interpretation.
 */
export function toOsmFramePoint(point, crsId = DEFAULT_CRS) {
  if (isExplicitGeographicGnssPoint(point)) {
    return { ...point, y: Number(point.x), x: Number(point.y), layer: 'gnss', pointClass: 'gnss' };
  }
  try {
    const wgs = projectedToWgs84(Number(point.x), Number(point.y), crsId);
    if (!Number.isFinite(wgs.lat) || !Number.isFinite(wgs.lon)) return null;
    return { ...point, y: wgs.lat, x: wgs.lon, layer: 'gnss', pointClass: 'gnss', code: point.code || 'CRS' };
  } catch {
    return null;
  }
}

/** The single place where the OSM frame becomes Leaflet's [lat, lon]. */
export function osmFrameToLatLon(point) {
  return { lat: point.y, lon: point.x };
}
