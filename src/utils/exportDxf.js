/** Minimal ASCII DXF (R12) export — POINT entities on layer POINTS. */

function dxfNum(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n.toFixed(3) : '0.000';
}

export function pointsToDxf(points = []) {
  const lines = [
    '0', 'SECTION', '2', 'HEADER', '9', '$ACADVER', '1', 'AC1009', '0', 'ENDSEC',
    '0', 'SECTION', '2', 'ENTITIES',
  ];

  points
    .filter((p) => p.x != null && p.y != null)
    .forEach((p) => {
      lines.push('0', 'POINT', '8', p.layer || 'POINTS', '10', dxfNum(p.x), '20', dxfNum(p.y));
      if (p.h != null && Number.isFinite(Number(p.h))) {
        lines.push('30', dxfNum(p.h));
      }
    });

  lines.push('0', 'ENDSEC', '0', 'EOF');
  return lines.join('\r\n');
}

export function downloadDxf(points, filename = 'geosolver_points') {
  const dxf = pointsToDxf(points);
  const blob = new Blob([dxf], { type: 'application/dxf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.dxf`;
  a.click();
  URL.revokeObjectURL(url);
}
