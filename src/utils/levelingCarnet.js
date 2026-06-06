export function parseReading(value) {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(String(value).replace(',', '.'));
  return Number.isFinite(n) ? n : null;
}

export function roundTo(value, decimals) {
  if (value === null || value === undefined || !Number.isFinite(value)) return null;
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

/** Нивелационен карнет: H_i = H_{i-1} + (задно − предно) */
export function computeLevelingCarnet(rows, settings = {}) {
  const decimals = Number.isFinite(Number(settings.rounding)) ? Number(settings.rounding) : 3;
  const benchmarkHeight = parseReading(settings.benchmarkHeight) ?? 0;
  const toleranceMm = parseReading(settings.toleranceMm) ?? 5;

  const warnings = [];
  const computedRows = [];
  let previousHeight = null;

  rows.forEach((row, index) => {
    const back = parseReading(row.back);
    const fore = parseReading(row.fore);
    const delta = back !== null && fore !== null ? back - fore : null;

    let height = null;
    if (index === 0) {
      const manual = parseReading(row.height);
      height = manual !== null ? manual : benchmarkHeight;
    } else if (delta !== null && previousHeight !== null) {
      height = previousHeight + delta;
    }

    const roundedDelta = roundTo(delta, decimals);
    const roundedHeight = roundTo(height, decimals);

    if (!row.station || !String(row.station).trim()) {
      warnings.push(`Ред ${index + 1}: липсва станция/точка.`);
    }

    computedRows.push({
      ...row,
      delta: roundedDelta,
      height: roundedHeight,
    });

    previousHeight = roundedHeight;
  });

  const controlRows = computedRows.filter((r) => r.isControl && r.height !== null);
  if (controlRows.length >= 2) {
    const first = controlRows[0];
    const last = controlRows[controlRows.length - 1];
    const closureMm = Math.abs((last.height - first.height) * 1000);
    if (closureMm > toleranceMm) {
      warnings.push(
        `Нивелационна разлика между контролни точки: ${closureMm.toFixed(1)} mm (допуск ${toleranceMm} mm).`
      );
    }
  }

  return { rows: computedRows, warnings, summary: { rowCount: computedRows.length, decimals, toleranceMm } };
}

export function emptyLevelingRow() {
  return {
    station: '',
    back: '',
    fore: '',
    delta: '',
    height: '',
    isControl: false,
    comment: '',
  };
}

export function rowToApi(row) {
  return {
    _id: row._id,
    station: row.station ?? '',
    back: row.back === '' || row.back === undefined ? null : Number(row.back),
    fore: row.fore === '' || row.fore === undefined ? null : Number(row.fore),
    delta: row.delta === '' || row.delta === undefined ? null : Number(row.delta),
    height: row.height === '' || row.height === undefined ? null : Number(row.height),
    isControl: !!row.isControl,
    comment: row.comment || '',
  };
}

export function rowFromApi(row) {
  return {
    _id: row._id,
    station: row.station ?? '',
    back: row.back ?? '',
    fore: row.fore ?? '',
    delta: row.delta ?? '',
    height: row.height ?? '',
    isControl: !!row.isControl,
    comment: row.comment || '',
  };
}
