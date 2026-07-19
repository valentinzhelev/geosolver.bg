import JSZip from 'jszip';
import { generateProjectReportPdfBlob } from './exportProjectReportPdf';
import { pointsToCsvString } from './parseGnssImport';
import { pointsToDxf } from './exportDxf';
import { pointsToGeoJson } from './exportGeoJson';

function safeName(name) {
  return String(name || 'project').replace(/[^\w\u0400-\u04FF.-]+/g, '_').slice(0, 40);
}

function readmeText({ project, points, books, language }) {
  const bg = language === 'bg';
  const generatedAt = new Date().toLocaleString(bg ? 'bg-BG' : 'en-GB');
  return bg
    ? `GeoSolver — клиентски пакет
Обект: ${project?.name || '—'}
Генерирано: ${generatedAt}

Съдържание:
- client_report.pdf — отчет с точки и обобщение
- points.csv — координати (Y, X, H)
- points.dxf — точки за CAD
- points.geojson — обмен с GIS
- README.txt — този файл

Точки: ${points.length} · Карнети: ${books.length}
Разработено и поддържано от Wortexa — wortexa.com
geosolver.bg`
    : `GeoSolver — client package
Site: ${project?.name || '—'}
Generated: ${generatedAt}

Contents:
- client_report.pdf — report with points summary
- points.csv — coordinates (Y, X, H)
- points.dxf — points for CAD
- points.geojson — GIS exchange
- README.txt — this file

Points: ${points.length} · Field books: ${books.length}
Developed and maintained by Wortexa — wortexa.com
geosolver.bg`;
}

/** ZIP: PDF + CSV + DXF + GeoJSON + README for a project. */
export async function downloadProjectPackage({ project, points = [], books = [], language = 'bg' }) {
  const zip = new JSZip();
  const base = safeName(project?.name);

  const [pdfBlob] = await Promise.all([
    generateProjectReportPdfBlob({ project, points, books, language }),
  ]);

  zip.file(`${base}_client_report.pdf`, pdfBlob);
  zip.file(`${base}_points.csv`, pointsToCsvString(points, language));
  zip.file(`${base}_points.dxf`, pointsToDxf(points));
  zip.file(`${base}_points.geojson`, JSON.stringify(pointsToGeoJson(points, { name: project?.name }), null, 2));
  zip.file('README.txt', readmeText({ project, points, books, language }));

  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${base}_geosolver_package.zip`;
  a.click();
  URL.revokeObjectURL(url);
}
