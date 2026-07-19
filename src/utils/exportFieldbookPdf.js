import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { buildFieldbookPdfElement } from './fieldbookPdfTemplate';

function safeName(name) {
  return (name || 'fieldbook').replace(/[^\w\u0400-\u04FF.-]+/g, '_').slice(0, 60);
}

/**
 * Export leveling or coordinate field book as a styled PDF (A4 landscape).
 * Uses html2canvas for Cyrillic-safe rendering and layout matching the app UI.
 */
export async function downloadFieldbookPdf({
  bookType = 'leveling',
  rows = [],
  settings = {},
  summary = null,
  bookName = '',
  bookMeta = {},
  language = 'bg',
}) {
  const wrapper = buildFieldbookPdfElement({
    bookType,
    rows,
    settings,
    summary,
    bookName,
    bookMeta,
    language,
  });

  document.body.appendChild(wrapper);

  try {
    if (document.fonts?.ready) {
      await document.fonts.ready;
    }
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

    const target = wrapper.firstElementChild;
    const canvas = await html2canvas(target, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#fafaf9',
      logging: false,
      windowWidth: target.scrollWidth,
      windowHeight: target.scrollHeight,
    });

    const orientation = bookType === 'coordinate' ? 'landscape' : 'portrait';
    const doc = new jsPDF({ orientation, unit: 'mm', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 8;
    const contentW = pageW - 2 * margin;

    const imgW = contentW;
    const imgH = (canvas.height * imgW) / canvas.width;
    const imgData = canvas.toDataURL('image/png', 1.0);

    let heightLeft = imgH;
    let y = margin;

    doc.addImage(imgData, 'PNG', margin, y, imgW, imgH);
    heightLeft -= pageH - 2 * margin;

    while (heightLeft > 0) {
      doc.addPage();
      y = margin - (imgH - heightLeft);
      doc.addImage(imgData, 'PNG', margin, y, imgW, imgH);
      heightLeft -= pageH - 2 * margin;
    }

    const suffix = bookType === 'coordinate' ? 'coordinates' : 'leveling';
    doc.save(`${safeName(bookName)}_${suffix}.pdf`);
  } finally {
    document.body.removeChild(wrapper);
  }
}
