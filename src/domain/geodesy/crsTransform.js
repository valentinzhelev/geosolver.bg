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
