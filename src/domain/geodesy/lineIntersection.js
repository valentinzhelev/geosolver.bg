/**
 * Пресичане на две прави — по две точки на всяка права.
 * Права 1: A→B, Права 2: C→D
 */

function lineFromTwoPoints(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  if (len < 1e-12) throw new Error('Точките на права 1 съвпадат');
  return { x0: x1, y0: y1, dx, dy, len };
}

export function calculateLineIntersection(x1, y1, x2, y2, x3, y3, x4, y4) {
  [x1, y1, x2, y2, x3, y3, x4, y4].forEach((v, i) => {
    if (typeof v !== 'number' || !Number.isFinite(v)) {
      throw new Error(`Невалидна координата (${i + 1})`);
    }
  });

  const l1 = lineFromTwoPoints(x1, y1, x2, y2);
  const l2 = lineFromTwoPoints(x3, y3, x4, y4);

  const denom = l1.dx * l2.dy - l1.dy * l2.dx;
  if (Math.abs(denom) < 1e-12) {
    throw new Error('Правите са паралелни — няма пресичане');
  }

  const t = ((x3 - x1) * l2.dy - (y3 - y1) * l2.dx) / denom;
  const s = ((x3 - x1) * l1.dy - (y3 - y1) * l1.dx) / denom;

  const xI = x1 + t * l1.dx;
  const yI = y1 + t * l1.dy;

  const onSegment1 = t >= 0 && t <= 1;
  const onSegment2 = s >= 0 && s <= 1;

  return {
    x1, y1, x2, y2, x3, y3, x4, y4,
    xI, yI,
    t, s,
    onSegment1,
    onSegment2,
    isSegmentIntersection: onSegment1 && onSegment2,
  };
}
