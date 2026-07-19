/**
 * Точка на отсечка A→B на разстояние s от A (или по пропорция k).
 * mode: 'distance' | 'ratio'
 */

export function calculateSegmentPoint(yA, xA, yB, xB, value, mode = 'distance') {
  [yA, xA, yB, xB, value].forEach((v, i) => {
    if (typeof v !== 'number' || !Number.isFinite(v)) {
      throw new Error(`Невалидна стойност (${i + 1})`);
    }
  });

  const dy = yB - yA;
  const dx = xB - xA;
  const len = Math.hypot(dy, dx);
  if (len < 1e-12) throw new Error('Точките A и B съвпадат');

  let t;
  let s;
  if (mode === 'ratio') {
    if (value < 0 || value > 1) throw new Error('Пропорцията k трябва да е между 0 и 1');
    t = value;
    s = t * len;
  } else {
    s = value;
    if (s < 0 || s > len) {
      throw new Error(`Разстоянието s=${s.toFixed(3)} m е извън отсечката (0…${len.toFixed(3)} m)`);
    }
    t = s / len;
  }

  const yP = yA + t * dy;
  const xP = xA + t * dx;

  return { yA, xA, yB, xB, len, s, t, yP, xP, mode };
}
