import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const styles = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  .root { width: 794px; padding: 36px 40px; background: #fff; font-family: Manrope, Segoe UI, Arial, sans-serif; color: #0a0a0a; }
  .head { border-bottom: 2px solid #0a0a0a; padding-bottom: 14px; margin-bottom: 18px; }
  .brand { font-size: 20px; font-weight: 700; }
  .doc-type { font-size: 11px; color: #737373; text-transform: uppercase; letter-spacing: 0.08em; margin-top: 4px; }
  h1 { font-size: 18px; margin: 12px 0 8px; }
  .meta { font-size: 13px; color: #525252; line-height: 1.6; }
  table { width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 14px; }
  th, td { border: 1px solid #e5e5e5; padding: 6px 8px; text-align: left; }
  th { background: #f5f5f4; }
  .footer { margin-top: 20px; font-size: 10px; color: #a3a3a3; display: flex; justify-content: space-between; }
`;

export function buildGnssFieldLogReportElement({ entries = [], language = 'bg', title } = {}) {
  const bg = language === 'bg';
  const generatedAt = new Date().toLocaleString(bg ? 'bg-BG' : 'en-GB');
  const rows = entries
    .map(
      (e) => `
      <tr>
        <td>${e.date || '—'}</td>
        <td>${e.site || '—'}</td>
        <td>${e.base || '—'}</td>
        <td>${e.rover || '—'}</td>
        <td>${e.antennaHeight != null && e.antennaHeight !== '' ? e.antennaHeight : '—'}</td>
        <td>${e.fixType || '—'}${e.hdop ? ` · ${e.hdop}` : ''}</td>
        <td>${e.notes || '—'}</td>
      </tr>`
    )
    .join('');

  const root = document.createElement('div');
  root.innerHTML = `
    <style>${styles}</style>
    <div class="root">
      <div class="head">
        <div class="brand">GeoSolver</div>
        <div class="doc-type">${bg ? 'GNSS полеви дневник' : 'GNSS field log'}</div>
      </div>
      <h1>${title || (bg ? 'Полеви сесии' : 'Field sessions')}</h1>
      <div class="meta">${bg ? 'Генерирано' : 'Generated'}: ${generatedAt} · ${entries.length} ${bg ? 'записа' : 'entries'}</div>
      <table>
        <thead>
          <tr>
            <th>${bg ? 'Дата' : 'Date'}</th>
            <th>${bg ? 'Обект' : 'Site'}</th>
            <th>${bg ? 'База' : 'Base'}</th>
            <th>Rover</th>
            <th>${bg ? 'Антена' : 'Antenna'}</th>
            <th>Fix / HDOP</th>
            <th>${bg ? 'Бележки' : 'Notes'}</th>
          </tr>
        </thead>
        <tbody>${rows || `<tr><td colspan="7">${bg ? 'Няма записи' : 'No entries'}</td></tr>`}</tbody>
      </table>
      <div class="footer"><span>geosolver.bg · Wortexa</span><span>${generatedAt}</span></div>
    </div>`;

  const wrapper = document.createElement('div');
  wrapper.style.cssText = 'position:fixed;left:-10000px;top:0;';
  wrapper.appendChild(root);
  return wrapper;
}

export async function downloadGnssFieldLogPdf({
  entries,
  language = 'bg',
  filename = 'gnss_field_log',
  title,
} = {}) {
  const wrapper = buildGnssFieldLogReportElement({ entries, language, title });
  document.body.appendChild(wrapper);
  try {
    await document.fonts?.ready;
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    const canvas = await html2canvas(wrapper.firstElementChild, {
      scale: 2,
      backgroundColor: '#ffffff',
      logging: false,
    });
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 8;
    const imgW = pageW - 2 * margin;
    let imgH = (canvas.height * imgW) / canvas.width;
    let y = margin;
    // Multi-page if tall
    const imgData = canvas.toDataURL('image/png');
    if (imgH <= pageH - 2 * margin) {
      doc.addImage(imgData, 'PNG', margin, y, imgW, imgH);
    } else {
      let remaining = imgH;
      let srcY = 0;
      const pxPerMm = canvas.height / imgH;
      while (remaining > 0) {
        const sliceH = Math.min(remaining, pageH - 2 * margin);
        const sliceCanvas = document.createElement('canvas');
        sliceCanvas.width = canvas.width;
        sliceCanvas.height = Math.max(1, Math.round(sliceH * pxPerMm));
        const ctx = sliceCanvas.getContext('2d');
        ctx.drawImage(
          canvas,
          0,
          Math.round(srcY * pxPerMm),
          canvas.width,
          sliceCanvas.height,
          0,
          0,
          canvas.width,
          sliceCanvas.height
        );
        if (srcY > 0) doc.addPage();
        doc.addImage(sliceCanvas.toDataURL('image/png'), 'PNG', margin, margin, imgW, sliceH);
        srcY += sliceH;
        remaining -= sliceH;
      }
    }
    const safe = filename.replace(/[^\w\u0400-\u04FF.-]+/g, '_').slice(0, 40);
    doc.save(`${safe}.pdf`);
  } finally {
    document.body.removeChild(wrapper);
  }
}
