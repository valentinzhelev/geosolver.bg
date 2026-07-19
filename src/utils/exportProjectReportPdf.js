import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const styles = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  .root {
    width: 794px;
    padding: 36px 40px 40px;
    background: #fff;
    font-family: 'Segoe UI', Roboto, Arial, sans-serif;
    color: #0a0a0a;
  }
  .head { border-bottom: 2px solid #0a0a0a; padding-bottom: 16px; margin-bottom: 20px; }
  .brand { font-size: 22px; font-weight: 700; }
  .doc-type { font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; color: #737373; margin-top: 4px; }
  h1 { font-size: 20px; margin: 16px 0 8px; }
  .meta { font-size: 13px; color: #525252; line-height: 1.6; }
  .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin: 18px 0; }
  .stat { border: 1px solid #e5e5e5; border-radius: 8px; padding: 10px 12px; }
  .stat-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.06em; color: #737373; }
  .stat-val { font-size: 18px; font-weight: 700; margin-top: 4px; }
  table { width: 100%; border-collapse: collapse; font-size: 10px; margin-top: 12px; }
  th, td { border: 1px solid #e5e5e5; padding: 6px 5px; text-align: center; }
  th { background: #f5f5f4; font-weight: 600; }
  td.left { text-align: left; }
  .footer { margin-top: 24px; padding-top: 12px; border-top: 1px solid #e5e5e5; font-size: 10px; color: #a3a3a3; display: flex; justify-content: space-between; }
  .note { margin-top: 16px; padding: 12px; background: #fafaf9; border-radius: 8px; font-size: 11px; color: #525252; }
`;

export function buildProjectReportElement({ project, points = [], books = [], language = 'bg' }) {
  const bg = language === 'bg';
  const withCoords = points.filter((p) => p.x != null && p.y != null).length;
  const withH = points.filter((p) => p.h != null).length;
  const generatedAt = new Date().toLocaleString(bg ? 'bg-BG' : 'en-GB');

  const rows = points
    .slice(0, 80)
    .map(
      (p) =>
        `<tr>
      <td class="left">${esc(p.name)}</td>
      <td>${esc(p.code || '')}</td>
      <td>${p.y != null ? Number(p.y).toFixed(3) : '—'}</td>
      <td>${p.x != null ? Number(p.x).toFixed(3) : '—'}</td>
      <td>${p.h != null ? Number(p.h).toFixed(3) : '—'}</td>
      <td>${esc(p.layer || '')}</td>
    </tr>`
    )
    .join('');

  const root = document.createElement('div');
  root.innerHTML = `
    <style>${styles}</style>
    <div class="root">
      <div class="head">
        <div class="brand">GeoSolver</div>
        <div class="doc-type">${bg ? 'Клиентски отчет — геодезически обект' : 'Client report — survey site'}</div>
      </div>
      <h1>${esc(project?.name || '—')}</h1>
      <div class="meta">
        ${[project?.year, project?.team, project?.site].filter(Boolean).map(esc).join(' · ') || '—'}
      </div>
      <div class="stats">
        <div class="stat"><div class="stat-label">${bg ? 'Точки' : 'Points'}</div><div class="stat-val">${points.length}</div></div>
        <div class="stat"><div class="stat-label">${bg ? 'С координати' : 'With coords'}</div><div class="stat-val">${withCoords}</div></div>
        <div class="stat"><div class="stat-label">${bg ? 'Карнети' : 'Field books'}</div><div class="stat-val">${books.length}</div></div>
      </div>
      <div class="note">
        ${bg
          ? `Обобщение на точките и състоянието на обекта. Генерирано ${generatedAt}. Коти (H): ${withH} точки.`
          : `Summary of points and site status. Generated ${generatedAt}. Elevations (H): ${withH} points.`}
      </div>
      <table>
        <thead>
          <tr>
            <th>${bg ? 'Име' : 'Name'}</th>
            <th>${bg ? 'Код' : 'Code'}</th>
            <th>Y</th>
            <th>X</th>
            <th>H</th>
            <th>${bg ? 'Слой' : 'Layer'}</th>
          </tr>
        </thead>
        <tbody>${rows || `<tr><td colspan="6">${bg ? 'Няма точки' : 'No points'}</td></tr>`}</tbody>
      </table>
      <div class="footer">
        <span>geosolver.bg · Wortexa (wortexa.com)</span>
        <span>${esc(generatedAt)}</span>
      </div>
    </div>`;

  const wrapper = document.createElement('div');
  wrapper.style.cssText = 'position:fixed;left:-10000px;top:0;';
  wrapper.appendChild(root);
  return wrapper;
}

export async function generateProjectReportPdfBlob({ project, points = [], books = [], language = 'bg' }) {
  const wrapper = buildProjectReportElement({ project, points, books, language });
  document.body.appendChild(wrapper);
  try {
    await document.fonts?.ready;
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    const target = wrapper.firstElementChild;
    const canvas = await html2canvas(target, { scale: 2, backgroundColor: '#ffffff', logging: false });
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    const margin = 8;
    const imgW = pageW - 2 * margin;
    const imgH = (canvas.height * imgW) / canvas.width;
    doc.addImage(canvas.toDataURL('image/png'), 'PNG', margin, margin, imgW, imgH);
    return doc.output('blob');
  } finally {
    document.body.removeChild(wrapper);
  }
}

export async function downloadProjectReportPdf({ project, points = [], books = [], language = 'bg' }) {
  const blob = await generateProjectReportPdfBlob({ project, points, books, language });
  const safe = (project?.name || 'project').replace(/[^\w\u0400-\u04FF.-]+/g, '_').slice(0, 40);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${safe}_client_report.pdf`;
  a.click();
  URL.revokeObjectURL(url);
}
