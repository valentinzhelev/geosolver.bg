/** Shared helpers for geodesy SVG diagrams (Y north, X east). */

export function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export function createGeoMapper(points, width, height, pad = 36) {
  const valid = points.filter((p) => p.x != null && p.y != null);
  if (valid.length === 0) {
    return { sx: () => width / 2, sy: () => height / 2, valid: false };
  }
  const xs = valid.map((p) => p.x);
  const ys = valid.map((p) => p.y);
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
  return {
    valid: true,
    sx: (x) => pad + ((x - minX) / (maxX - minX)) * innerW,
    sy: (y) => height - pad - ((y - minY) / (maxY - minY)) * innerH,
    minX,
    maxX,
    minY,
    maxY,
  };
}

/** Direction angle in gon → math angle for SVG (radians, 0 = east, CCW). */
export function gonToSvgAngle(gon) {
  const g = num(gon);
  if (g == null) return -Math.PI / 2;
  return ((90 - (g * 360) / 400) * Math.PI) / 180;
}

export function rayEnd(sx, sy, gon, length = 70) {
  const a = gonToSvgAngle(gon);
  return { x: sx + Math.cos(a) * length, y: sy + Math.sin(a) * length };
}

export function arcPath(cx, cy, r, startGon, sweepGon = 50) {
  const a0 = gonToSvgAngle(startGon);
  const a1 = gonToSvgAngle(startGon + sweepGon);
  const x0 = cx + r * Math.cos(a0);
  const y0 = cy + r * Math.sin(a0);
  const x1 = cx + r * Math.cos(a1);
  const y1 = cy + r * Math.sin(a1);
  const large = Math.abs(sweepGon) > 200 ? 1 : 0;
  return `M ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1}`;
}
