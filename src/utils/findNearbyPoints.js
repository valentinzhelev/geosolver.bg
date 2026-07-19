/** Find point pairs closer than threshold (planar Y/X, metres). */
export function findNearbyPoints(points = [], thresholdM = 0.05) {
  const pairs = [];
  for (let i = 0; i < points.length; i += 1) {
    for (let j = i + 1; j < points.length; j += 1) {
      const a = points[i];
      const b = points[j];
      if (!Number.isFinite(a.x) || !Number.isFinite(a.y) || !Number.isFinite(b.x) || !Number.isFinite(b.y)) {
        continue;
      }
      const distance = Math.hypot(a.x - b.x, a.y - b.y);
      if (distance <= thresholdM) {
        pairs.push({ a, b, distance });
      }
    }
  }
  return pairs.sort((x, y) => x.distance - y.distance);
}
