/** Parse NMEA 0183 sentences (GGA, GSV, RMC) for GNSS live preview. */

function nmeaChecksumOk(line) {
  const star = line.indexOf('*');
  if (star < 0) return true;
  const body = line.slice(1, star);
  const hex = line.slice(star + 1, star + 3);
  let cs = 0;
  for (let i = 0; i < body.length; i += 1) cs ^= body.charCodeAt(i);
  return cs.toString(16).toUpperCase().padStart(2, '0') === hex.toUpperCase();
}

function parseLatLon(ddmm, hem) {
  if (!ddmm || !hem) return null;
  const v = parseFloat(ddmm);
  if (!Number.isFinite(v)) return null;
  const deg = Math.floor(v / 100);
  const min = v - deg * 100;
  let dec = deg + min / 60;
  if (hem === 'S' || hem === 'W') dec = -dec;
  return dec;
}

/** $GPGGA / $GNGGA — fix position */
export function parseGGA(line) {
  if (!/^\$G[PN]GGA,/.test(line) || !nmeaChecksumOk(line)) return null;
  const p = line.split(',');
  const fixQuality = parseInt(p[6], 10);
  const sats = parseInt(p[7], 10);
  const hdop = parseFloat(p[8]);
  const alt = parseFloat(p[9]);
  const lat = parseLatLon(p[2], p[3]);
  const lon = parseLatLon(p[4], p[5]);
  const time = p[1] || '';
  if (lat == null || lon == null) return null;
  return {
    type: 'GGA',
    time,
    lat,
    lon,
    alt: Number.isFinite(alt) ? alt : null,
    fixQuality: Number.isFinite(fixQuality) ? fixQuality : 0,
    satellites: Number.isFinite(sats) ? sats : 0,
    hdop: Number.isFinite(hdop) ? hdop : null,
  };
}

/** $GPGSV / $GNGSV — satellites in view */
export function parseGSV(line) {
  if (!/^\$G[PN]GSV,/.test(line) || !nmeaChecksumOk(line)) return null;
  const p = line.split(',');
  const totalMsgs = parseInt(p[1], 10);
  const msgNum = parseInt(p[2], 10);
  const totalSats = parseInt(p[3], 10);
  const sats = [];
  for (let i = 4; i + 3 < p.length; i += 4) {
    const prn = parseInt(p[i], 10);
    const elev = parseInt(p[i + 1], 10);
    const az = parseInt(p[i + 2], 10);
    const snr = parseInt(p[i + 3], 10);
    if (!Number.isFinite(prn)) continue;
    sats.push({
      prn,
      elevation: Number.isFinite(elev) ? elev : 0,
      azimuth: Number.isFinite(az) ? az : 0,
      snr: Number.isFinite(snr) ? snr : 0,
    });
  }
  return { type: 'GSV', totalMsgs, msgNum, totalSats, satellites: sats };
}

export function parseNmeaLine(line) {
  const trimmed = line.trim();
  if (!trimmed.startsWith('$')) return null;
  if (/^\$G[PN]GGA,/.test(trimmed)) return parseGGA(trimmed);
  if (/^\$G[PN]GSV,/.test(trimmed)) return parseGSV(trimmed);
  return null;
}

/** Merge GSV fragments by PRN */
export function mergeGsvSatellites(chunks) {
  const map = new Map();
  chunks.forEach((chunk) => {
    (chunk.satellites || []).forEach((s) => {
      map.set(s.prn, { ...s });
    });
  });
  return Array.from(map.values());
}

export const FIX_LABELS = {
  bg: ['Няма', 'GPS', 'DGPS', 'PPS', 'RTK fix', 'RTK float', 'Естимирано', 'Manual', 'Simulation'],
  en: ['None', 'GPS', 'DGPS', 'PPS', 'RTK fix', 'RTK float', 'Estimated', 'Manual', 'Simulation'],
};

export function fixQualityLabel(q, language = 'bg') {
  const labels = FIX_LABELS[language === 'bg' ? 'bg' : 'en'];
  return labels[q] || String(q);
}
