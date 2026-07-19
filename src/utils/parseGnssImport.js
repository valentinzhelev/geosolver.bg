/**
 * Parse GNSS / total-station exports (CSV, TXT, GPX) into survey point rows.
 * Supports common receiver exports: name + Y/X/H or lat/lon/elev columns.
 *
 * Bulgarian / platform convention: X = northing, Y = easting.
 */

function splitLine(line) {
  if (line.includes('\t')) return line.split('\t').map((c) => c.trim());
  if (line.includes(';')) return line.split(';').map((c) => c.trim());
  return line.split(',').map((c) => c.trim().replace(/^"|"$/g, ''));
}

function parseNum(v) {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(String(v).replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

function normalizeHeader(h) {
  return String(h || '')
    .toLowerCase()
    .replace(/[^\w\u0400-\u04ff]/g, '');
}

const NAME_KEYS = ['name', 'point', 'pointname', 'id', 'station', 'label', 'име', 'точка'];
const CODE_KEYS = ['code', 'pointid', 'код'];
// Y = easting (BG); also lon when importing WGS84 as educational coords
const Y_KEYS = ['y', 'easting', 'east', 'e', 'longitude', 'lon', 'lng', 'long'];
// X = northing (BG); also lat
const X_KEYS = ['x', 'northing', 'north', 'n', 'latitude', 'lat'];
const H_KEYS = ['h', 'z', 'elev', 'elevation', 'height', 'alt', 'altitude', 'кота', 'височина'];

function findExactColumn(normHeaders, keys) {
  for (const k of keys) {
    const idx = normHeaders.findIndex((h) => h === k);
    if (idx >= 0) return idx;
  }
  return -1;
}

function detectColumns(headers) {
  const norm = headers.map(normalizeHeader);
  return {
    name: findExactColumn(norm, NAME_KEYS),
    code: findExactColumn(norm, CODE_KEYS),
    y: findExactColumn(norm, Y_KEYS),
    x: findExactColumn(norm, X_KEYS),
    h: findExactColumn(norm, H_KEYS),
  };
}

function rowFromParts(parts, cols, index) {
  const pick = (i) => (i >= 0 && i < parts.length ? parts[i] : '');
  const name = pick(cols.name) || pick(cols.code) || `P${index + 1}`;
  const y = parseNum(pick(cols.y));
  const x = parseNum(pick(cols.x));
  const h = parseNum(pick(cols.h));
  if (y == null && x == null) return null;
  return {
    name: String(name).trim(),
    code: cols.code >= 0 ? String(pick(cols.code)).trim() : '',
    y,
    x,
    h,
    pointClass: 'gnss',
    layer: 'gnss',
    notes: '',
  };
}

export function parseGnssCsv(text) {
  const lines = String(text)
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (!lines.length) return [];

  const headerParts = splitLine(lines[0]);
  const cols = detectColumns(headerParts);
  const hasHeader = cols.y >= 0 || cols.x >= 0 || cols.name >= 0;

  const dataLines = hasHeader ? lines.slice(1) : lines;
  const fallbackCols = hasHeader
    ? cols
    : { name: 0, code: -1, y: 1, x: 2, h: 3 };

  const points = [];
  dataLines.forEach((line, i) => {
    const parts = splitLine(line);
    const row = rowFromParts(parts, fallbackCols, i);
    if (row) points.push(row);
  });
  return points;
}

export function parseGpx(text) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, 'application/xml');
  if (doc.querySelector('parsererror')) return [];

  const wpts = [...doc.querySelectorAll('wpt, trkpt, rtept')];
  return wpts
    .map((el, i) => {
      const lat = parseNum(el.getAttribute('lat'));
      const lon = parseNum(el.getAttribute('lon'));
      if (lat == null || lon == null) return null;
      const name =
        el.querySelector('name')?.textContent?.trim() ||
        el.querySelector('desc')?.textContent?.trim() ||
        `GPX${i + 1}`;
      const h = parseNum(el.querySelector('ele')?.textContent);
      return {
        name,
        code: '',
        // Platform: X≈north, Y≈east → lat→X, lon→Y (WGS84 educational, not projected)
        y: lon,
        x: lat,
        h,
        pointClass: 'gnss',
        layer: 'gnss',
        notes: 'GPX import (WGS84: X=lat, Y=lon — не е локална мрежа)',
      };
    })
    .filter(Boolean);
}

export function parseGnssFile(fileName, text) {
  const lower = String(fileName || '').toLowerCase();
  if (lower.endsWith('.gpx')) return parseGpx(text);
  if (lower.endsWith('.obs') || lower.endsWith('.o')) {
    return [];
  }
  return parseGnssCsv(text);
}

export function pointsToCsvString(points, language = 'bg') {
  const bg = language === 'bg';
  const headers = bg
    ? ['Име', 'Код', 'Y', 'X', 'H', 'Клас', 'Слой', 'Бележки']
    : ['Name', 'Code', 'Y', 'X', 'H', 'Class', 'Layer', 'Notes'];
  const escape = (v) => {
    const s = v === null || v === undefined ? '' : String(v);
    if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const rows = points.map((p) =>
    [p.name, p.code, p.y, p.x, p.h, p.pointClass, p.layer, p.notes].map(escape).join(',')
  );
  return '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
}

export function downloadPointsCsv(points, fileName = 'points', language = 'bg') {
  const csv = pointsToCsvString(points, language);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${fileName.replace(/[^\w\u0400-\u04FF.-]+/g, '_')}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
