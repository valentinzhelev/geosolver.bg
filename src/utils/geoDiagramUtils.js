import { bearingScreenVector } from '../domain/geodesy/coordinateConvention';

/**
 * Shared helpers for geodesy SVG diagrams. Official convention (QA-02): X = Northing is the VERTICAL (up) axis,
 * Y = Easting is the HORIZONTAL (right) axis; bearings run clockwise from north (0 gon = up, 100 gon = right).
 */

export function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export function createGeoMapper(points, width, height, pad = 36) {
  const valid = points.filter((p) => p.x != null && p.y != null);
  if (valid.length === 0) {
    return { toScreen: () => ({ sx: width / 2, sy: height / 2 }), valid: false };
  }
  const xs = valid.map((p) => p.x); // Northing
  const ys = valid.map((p) => p.y); // Easting
  let minX = Math.min(...xs);
  let maxX = Math.max(...xs);
  let minY = Math.min(...ys);
  let maxY = Math.max(...ys);
  const spanX = maxX - minX || 1;
  const spanY = maxY - minY || 1;
  const padX = spanX * 0.15;
  const padY = spanY * 0.15;
  minX -= padX;
  maxX += padX;
  minY -= padY;
  maxY += padY;
  const innerW = width - pad * 2;
  const innerH = height - pad * 2;
  // ONE scale for both axes so directions/angles on screen equal the real ones
  const scale = Math.min(innerW / (maxY - minY), innerH / (maxX - minX));
  const midN = (minX + maxX) / 2;
  const midE = (minY + maxY) / 2;
  return {
    valid: true,
    // internal (x = Northing, y = Easting) -> screen: Easting to the right, Northing up
    toScreen: (x, y) => ({
      sx: width / 2 + (y - midE) * scale,
      sy: height / 2 - (x - midN) * scale,
    }),
    minX,
    maxX,
    minY,
    maxY,
  };
}

/** Bearing in gon → screen step (north up): 0 gon = up, 100 gon = right. Missing bearing falls back to north. */
export function gonToScreenVector(gon) {
  const g = num(gon);
  return bearingScreenVector(g == null ? 0 : g);
}

export function rayEnd(sx, sy, gon, length = 70) {
  const v = gonToScreenVector(gon);
  return { x: sx + v.dx * length, y: sy + v.dy * length };
}

export function arcPath(cx, cy, r, startGon, sweepGon = 50) {
  const v0 = gonToScreenVector(startGon);
  const v1 = gonToScreenVector(startGon + sweepGon);
  const x0 = cx + r * v0.dx;
  const y0 = cy + r * v0.dy;
  const x1 = cx + r * v1.dx;
  const y1 = cy + r * v1.dy;
  const large = Math.abs(sweepGon) > 200 ? 1 : 0;
  return `M ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1}`;
}
