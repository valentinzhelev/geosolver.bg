/**
 * Ортогонален offset от отсечка A→B.
 * s — разстояние по отсечката от A (m)
 * d — перпендикулярен отстъп (m), положителен = наляво от A→B
 *     (наляво при гледане от A към B; X = север, Y = изток)
 *
 * engineVersion 2 (Milestone 2.0B): positive d = LEFT. Engine v1 placed positive d
 * on the right; those results are historical and are NOT rewritten.
 */

export function calculateOrthogonalOffset(yA, xA, yB, xB, s, d) {
  [yA, xA, yB, xB, s, d].forEach((v, i) => {
    if (typeof v !== 'number' || !Number.isFinite(v)) {
      throw new Error(`Невалидна стойност (${i + 1})`);
    }
  });

  const dy = yB - yA;
  const dx = xB - xA;
  const len = Math.hypot(dy, dx);
  if (len < 1e-12) throw new Error('Точките A и B съвпадат');

  if (s < 0 || s > len) {
    throw new Error(`Разстоянието s=${s.toFixed(3)} m е извън отсечката (0…${len.toFixed(3)} m)`);
  }

  const uy = dy / len;
  const ux = dx / len;
  // Engine v2: LEFT of A→B in the geodetic frame (X = north, Y = east, bearings
  // clockwise from X) is bearing (α − 100 gon), i.e. (cos, sin) = (uy, −ux).
  // Engine v1 (historical, shipped before Milestone 2.0B) used (−uy, ux), which
  // is the RIGHT side in this frame; see __fixtures__/orthogonalOffset.v1.legacy.vectors.json.
  const nx = uy;
  const ny = -ux;

  const yOn = yA + s * uy;
  const xOn = xA + s * ux;
  const yP = yOn + d * ny;
  const xP = xOn + d * nx;

  // Same as secondTask / firstTask: α = atan2(ΔY, ΔX)
  let bearingGon = (Math.atan2(uy, ux) * 200) / Math.PI;
  if (bearingGon < 0) bearingGon += 400;

  return {
    yA, xA, yB, xB, s, d, len,
    uy, ux, nx, ny,
    yOn, xOn, yP, xP,
    bearingGon,
  };
}
