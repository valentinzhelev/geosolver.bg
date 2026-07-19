import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { fixQualityLabel } from './parseNmea';

const styles = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  .root { width: 794px; padding: 36px 40px; background: #fff; font-family: Manrope, Segoe UI, Arial, sans-serif; color: #0a0a0a; }
  .head { border-bottom: 2px solid #0a0a0a; padding-bottom: 14px; margin-bottom: 18px; }
  .brand { font-size: 20px; font-weight: 700; }
  .doc-type { font-size: 11px; color: #737373; text-transform: uppercase; letter-spacing: 0.08em; margin-top: 4px; }
  h1 { font-size: 18px; margin: 12px 0 8px; }
  .meta { font-size: 13px; color: #525252; line-height: 1.6; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 14px; }
  th, td { border: 1px solid #e5e5e5; padding: 8px; text-align: left; }
  th { background: #f5f5f4; }
  .footer { margin-top: 20px; font-size: 10px; color: #a3a3a3; display: flex; justify-content: space-between; }
`;

export function buildGnssSessionReportElement({ session = {}, language = 'bg' }) {
  const bg = language === 'bg';
  const gga = session.gga || {};
  const generatedAt = new Date().toLocaleString(bg ? 'bg-BG' : 'en-GB');

  const root = document.createElement('div');
  root.innerHTML = `
    <style>${styles}</style>
    <div class="root">
      <div class="head">
        <div class="brand">GeoSolver</div>
        <div class="doc-type">${bg ? 'GNSS сесия — полеви отчет' : 'GNSS session — field report'}</div>
      </div>
      <h1>${session.title || (bg ? 'NMEA live сесия' : 'NMEA live session')}</h1>
      <div class="meta">${bg ? 'Генерирано' : 'Generated'}: ${generatedAt}</div>
      <table>
        <tr><th>${bg ? 'Параметър' : 'Parameter'}</th><th>${bg ? 'Стойност' : 'Value'}</th></tr>
        <tr><td>Lat</td><td>${gga.lat != null ? gga.lat.toFixed(8) + '°' : '—'}</td></tr>
        <tr><td>Lon</td><td>${gga.lon != null ? gga.lon.toFixed(8) + '°' : '—'}</td></tr>
        <tr><td>H</td><td>${gga.alt != null ? gga.alt.toFixed(3) + ' m' : '—'}</td></tr>
        <tr><td>${bg ? 'Fix' : 'Fix'}</td><td>${fixQualityLabel(gga.fixQuality ?? 0, language)}</td></tr>
        <tr><td>${bg ? 'Сателити' : 'Satellites'}</td><td>${gga.satellites ?? '—'}</td></tr>
        <tr><td>HDOP</td><td>${gga.hdop ?? '—'}</td></tr>
        <tr><td>${bg ? 'Време (NMEA)' : 'Time (NMEA)'}</td><td>${gga.time || '—'}</td></tr>
        <tr><td>${bg ? 'Сателити в sky plot' : 'Sky plot sats'}</td><td>${session.satCount ?? '—'}</td></tr>
      </table>
      <p class="meta" style="margin-top:14px">
        ${bg
          ? 'Учебен отчет от NMEA live preview. За официални GNSS отчети използвай office софтуер след post-processing.'
          : 'Educational report from NMEA live preview. For official GNSS reports use office software after post-processing.'}
      </p>
      <div class="footer"><span>geosolver.bg · Wortexa</span><span>${generatedAt}</span></div>
    </div>`;

  const wrapper = document.createElement('div');
  wrapper.style.cssText = 'position:fixed;left:-10000px;top:0;';
  wrapper.appendChild(root);
  return wrapper;
}

export async function downloadGnssSessionPdf({ session, language = 'bg', filename = 'gnss_session' }) {
  const wrapper = buildGnssSessionReportElement({ session, language });
  document.body.appendChild(wrapper);
  try {
    await document.fonts?.ready;
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    const canvas = await html2canvas(wrapper.firstElementChild, { scale: 2, backgroundColor: '#ffffff', logging: false });
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    const margin = 8;
    const imgW = pageW - 2 * margin;
    const imgH = (canvas.height * imgW) / canvas.width;
    doc.addImage(canvas.toDataURL('image/png'), 'PNG', margin, margin, imgW, imgH);
    const safe = filename.replace(/[^\w\u0400-\u04FF.-]+/g, '_').slice(0, 40);
    doc.save(`${safe}.pdf`);
  } finally {
    document.body.removeChild(wrapper);
  }
}
