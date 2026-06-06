/**
 * CSV export for leveling field book rows (Excel-friendly UTF-8 BOM).
 */
export function downloadLevelingCsv({ rows, settings, bookName, language = 'bg' }) {
  const bg = language === 'bg';
  const headers = bg
    ? ['Станция', 'Задна (m)', 'Предна (m)', 'Превишение Δ (m)', 'Кота H (m)', 'Контролна', 'Коментар']
    : ['Station', 'Back (m)', 'Fore (m)', 'Delta (m)', 'Elev. H (m)', 'Control', 'Comment'];

  const escape = (v) => {
    const s = v === null || v === undefined ? '' : String(v);
    if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };

  const meta = [
    [bg ? 'Карнет' : 'Field book', bookName || ''],
    [bg ? 'Начална кота' : 'Benchmark', settings?.benchmarkHeight ?? ''],
    [bg ? 'Допуск (mm)' : 'Tolerance (mm)', settings?.toleranceMm ?? ''],
    [],
  ];

  const dataRows = (rows || []).map((r) => [
    r.station,
    r.back,
    r.fore,
    r.delta,
    r.height,
    r.isControl ? (bg ? 'Да' : 'Yes') : (bg ? 'Не' : 'No'),
    r.comment,
  ]);

  const lines = [...meta.map((row) => row.map(escape).join(',')), headers.map(escape).join(','), ...dataRows.map((row) => row.map(escape).join(','))];

  const bom = '\uFEFF';
  const blob = new Blob([bom + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const safeName = (bookName || 'fieldbook').replace(/[^\w\u0400-\u04FF.-]+/g, '_').slice(0, 60);
  a.href = url;
  a.download = `${safeName}_leveling.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

const csvEscape = (v) => {
  const s = v === null || v === undefined ? '' : String(v);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
};

/**
 * CSV export for coordinate (traverse) field book rows.
 */
export function downloadCoordinateCsv({ rows, settings, summary, bookName, language = 'bg' }) {
  const bg = language === 'bg';
  const headers = bg
    ? ['№', 'β (gon)', 'α (gon)', 'S (m)', 'ΔY (m)', 'ΔX (m)', 'Y (m)', 'X (m)', 'Коментар']
    : ['№', 'β (gon)', 'α (gon)', 'S (m)', 'ΔY (m)', 'ΔX (m)', 'Y (m)', 'X (m)', 'Comment'];

  const meta = [
    [bg ? 'Карнет' : 'Field book', bookName || ''],
    [bg ? 'Начало Y, X' : 'Start Y, X', `${settings?.startY ?? ''}, ${settings?.startX ?? ''}`],
    [bg ? 'Начален посочен ъгъл α (gon)' : 'Start bearing α (gon)', settings?.startBearing ?? ''],
    [bg ? 'Затворен ход' : 'Closed traverse', settings?.closed === false ? (bg ? 'Не' : 'No') : (bg ? 'Да' : 'Yes')],
    [],
  ];

  const dataRows = (rows || []).map((r) => [
    r.pointNo,
    r.beta,
    r.alpha,
    r.distance,
    r.deltaY,
    r.deltaX,
    r.y,
    r.x,
    r.comment,
  ]);

  const sumRow = summary
    ? ['Σ', summary.sumBeta ?? '', '', summary.sumS ?? '', summary.sumDeltaY ?? '', summary.sumDeltaX ?? '', '', '', '']
    : null;

  const checks = summary
    ? [
        [],
        [bg ? 'Ъглова невръзка f_β (mgon)' : 'Angular misclosure f_β (mgon)', summary.angularMisclosureMgon ?? ''],
        ['f_Y (m)', summary.fY ?? ''],
        ['f_X (m)', summary.fX ?? ''],
        ['f_S (m)', summary.fS ?? ''],
        [bg ? 'Относителна невръзка' : 'Relative misclosure', summary.relative ? `1/${summary.relative}` : ''],
      ]
    : [];

  const lines = [
    ...meta.map((row) => row.map(csvEscape).join(',')),
    headers.map(csvEscape).join(','),
    ...dataRows.map((row) => row.map(csvEscape).join(',')),
    ...(sumRow ? [sumRow.map(csvEscape).join(',')] : []),
    ...checks.map((row) => row.map(csvEscape).join(',')),
  ];

  const bom = '\uFEFF';
  const blob = new Blob([bom + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const safeName = (bookName || 'fieldbook').replace(/[^\w\u0400-\u04FF.-]+/g, '_').slice(0, 60);
  a.href = url;
  a.download = `${safeName}_coordinates.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
