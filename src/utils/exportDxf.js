/**
 * Minimal ASCII DXF (R12) export — POINT entities on layer POINTS.
 * Cartesian CAD convention (QA-02): CAD X (group 10) is the horizontal axis = Easting = internal y;
 * CAD Y (group 20) is the vertical axis = Northing = internal x. Elevation (group 30) is unchanged.
 * Only the export axes are mapped; stored values are never modified.
 */

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
      lines.push('0', 'POINT', '8', p.layer || 'POINTS', '10', dxfNum(p.y), '20', dxfNum(p.x));
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
