/**
 * Extract metadata from RINEX observation file header (v2.x / v3.x).
 * Full post-processing is out of scope — we import approximate marker position as a point.
 * APPROX POSITION XYZ is ECEF; we convert to WGS84 lat/lon (not local grid).
 */

const WGS84_A = 6378137;
const WGS84_F = 1 / 298.257223563;
const WGS84_E2 = WGS84_F * (2 - WGS84_F);

/** ECEF (m) → geodetic lat/lon (deg) + ellipsoidal height (m), WGS84 */
function ecefToGeodetic(x, y, z) {
  const lon = Math.atan2(y, x);
  const p = Math.hypot(x, y);
  let lat = Math.atan2(z, p * (1 - WGS84_E2));
  for (let i = 0; i < 8; i += 1) {
    const sinLat = Math.sin(lat);
    const N = WGS84_A / Math.sqrt(1 - WGS84_E2 * sinLat * sinLat);
    lat = Math.atan2(z + WGS84_E2 * N * sinLat, p);
  }
  const sinLat = Math.sin(lat);
  const N = WGS84_A / Math.sqrt(1 - WGS84_E2 * sinLat * sinLat);
  const h = p / Math.cos(lat) - N;
  return {
    lat: (lat * 180) / Math.PI,
    lon: (lon * 180) / Math.PI,
    h,
  };
}

function readHeaderLines(text) {
  const lines = String(text).replace(/^\uFEFF/, '').split(/\r?\n/);
  const header = [];
  for (const line of lines) {
    header.push(line);
    if (/END OF HEADER/i.test(line)) break;
    if (header.length > 500) break;
  }
  return header;
}

function rinexField(line, start, len) {
  return line.slice(start, start + len).trim();
}

function parseApproxPosition(headerLines) {
  for (const line of headerLines) {
    if (/APPROX POSITION XYZ/i.test(line)) {
      const x = parseFloat(rinexField(line, 0, 14));
      const y = parseFloat(rinexField(line, 14, 14));
      const z = parseFloat(rinexField(line, 28, 14));
      if ([x, y, z].every((n) => Number.isFinite(n))) return { x, y, z };
    }
  }
  return null;
}

function parseMarkerName(headerLines) {
  for (const line of headerLines) {
    if (/MARKER NAME/i.test(line)) {
      const name = rinexField(line, 0, 60) || rinexField(line, 0, 20);
      if (name) return name;
    }
  }
  return null;
}

function parseAntennaHeight(headerLines) {
  for (const line of headerLines) {
    if (/ANTENNA:/i.test(line) && /APPROX/i.test(line)) {
      const h = parseFloat(rinexField(line, 0, 14));
      if (Number.isFinite(h)) return h;
    }
  }
  return null;
}

function parseTimeOfFirstObs(headerLines) {
  for (const line of headerLines) {
    if (/TIME OF FIRST OBS/i.test(line)) {
      return rinexField(line, 0, 60);
    }
  }
  return null;
}

function parseRinexVersion(headerLines) {
  for (const line of headerLines) {
    if (/RINEX VERSION/i.test(line)) {
      return rinexField(line, 0, 9);
    }
  }
  return null;
}

/**
 * @returns {{ markerName, approxXyz, antennaHeight, timeFirstObs, version, point } | null}
 */
export function parseRinexObservationHeader(text) {
  const headerLines = readHeaderLines(text);
  if (!headerLines.some((l) => /RINEX VERSION/i.test(l))) {
    return null;
  }

  const approxXyz = parseApproxPosition(headerLines);
  const markerName = parseMarkerName(headerLines) || 'RINEX';
  const antennaHeight = parseAntennaHeight(headerLines);
  const timeFirstObs = parseTimeOfFirstObs(headerLines);
  const version = parseRinexVersion(headerLines);

  const geodetic = approxXyz
    ? ecefToGeodetic(approxXyz.x, approxXyz.y, approxXyz.z)
    : null;

  const notes = [
    version ? `RINEX ${version}` : '',
    timeFirstObs ? `OBS: ${timeFirstObs}` : '',
    approxXyz ? `ECEF: ${approxXyz.x.toFixed(3)}, ${approxXyz.y.toFixed(3)}, ${approxXyz.z.toFixed(3)}` : '',
    geodetic
      ? `WGS84 ≈ lat ${geodetic.lat.toFixed(8)}, lon ${geodetic.lon.toFixed(8)} (не е локална мрежа)`
      : '',
    'Approx. position from header',
  ]
    .filter(Boolean)
    .join(' · ');

  // Store as X=lat, Y=lon so values are not mistaken for projected metres
  const point = geodetic
    ? {
        name: markerName,
        code: markerName.slice(0, 20),
        x: geodetic.lat,
        y: geodetic.lon,
        h: Number.isFinite(geodetic.h) ? geodetic.h : null,
        pointClass: 'gnss',
        layer: 'gnss',
        notes,
      }
    : null;

  return {
    markerName,
    approxXyz,
    antennaHeight,
    timeFirstObs,
    version,
    point,
  };
}

export function parseRinexFile(fileName, text) {
  const lower = String(fileName || '').toLowerCase();
  if (!lower.endsWith('.obs') && !lower.endsWith('.o') && !/rinex/i.test(text.slice(0, 200))) {
    return null;
  }
  return parseRinexObservationHeader(text);
}
