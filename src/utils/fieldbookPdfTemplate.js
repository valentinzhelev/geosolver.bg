const fmt = (v, decimals = null) => {
  if (v === '' || v === null || v === undefined) return '';
  const n = Number(v);
  if (!Number.isFinite(n)) return String(v);
  return decimals != null ? n.toFixed(decimals) : String(v);
};

const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const styles = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  .root {
    width: 1060px;
    padding: 28px 32px 32px;
    background: #fafaf9;
    font-family: 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    color: #0a0a0a;
    -webkit-font-smoothing: antialiased;
  }
  .brand-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 2px solid #0a0a0a;
  }
  .brand {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .brand-mark {
    width: 36px;
    height: 36px;
    background: #0a0a0a;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-weight: 700;
    font-size: 14px;
  }
  .brand-name { font-size: 20px; font-weight: 700; letter-spacing: -0.02em; }
  .doc-type {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #737373;
  }
  .title-block { margin-bottom: 18px; }
  .title-block h1 {
    font-size: 22px;
    font-weight: 700;
    margin-bottom: 6px;
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }
  .badge {
    display: inline-block;
    padding: 3px 10px;
    border-radius: 6px;
    background: #e5e5e5;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.04em;
  }
  .meta { font-size: 13px; color: #525252; line-height: 1.5; }
  .meta strong { color: #0a0a0a; font-weight: 600; }
  .settings {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 20px;
    margin: 14px 0 18px;
    padding: 12px 14px;
    background: #fff;
    border: 1px solid #e5e5e5;
    border-radius: 10px;
    font-size: 12px;
    color: #404040;
  }
  .settings span { white-space: nowrap; }
  .settings b { color: #0a0a0a; font-weight: 600; }
  .stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
    margin-bottom: 18px;
  }
  .stat {
    background: #fff;
    border: 1px solid #e5e5e5;
    border-radius: 10px;
    padding: 10px 12px;
  }
  .stat-label {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #737373;
    margin-bottom: 4px;
  }
  .stat-value {
    font-size: 18px;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
  }
  .table-wrap {
    background: #fff;
    border: 1px solid #e5e5e5;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  }
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 11px;
    font-variant-numeric: tabular-nums;
  }
  th {
    border: 1px solid #e5e5e5;
    background: #f5f5f4;
    padding: 8px 6px;
    text-align: center;
    font-weight: 600;
    vertical-align: middle;
    line-height: 1.25;
  }
  th.sub {
    background: #fafaf9;
    font-weight: 500;
    font-size: 10px;
    color: #525252;
  }
  th .formula {
    display: block;
    font-size: 9px;
    font-weight: 400;
    font-style: italic;
    color: #a3a3a3;
    margin-top: 2px;
  }
  td {
    border: 1px solid #e5e5e5;
    padding: 7px 6px;
    text-align: center;
    vertical-align: middle;
  }
  td.readonly { background: #fafaf9; color: #404040; font-weight: 500; }
  td.control { background: #f5f5f4; }
  tr.sum td {
    background: #f5f5f4;
    font-weight: 700;
    border-top: 2px solid #d4d4d4;
  }
  .checks {
    margin-top: 18px;
    padding: 14px 16px;
    background: #fff;
    border: 1px solid #e5e5e5;
    border-radius: 10px;
  }
  .checks h3 {
    font-size: 13px;
    font-weight: 700;
    margin-bottom: 10px;
  }
  .checks-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 6px 24px;
    font-size: 12px;
  }
  .checks-grid div { display: flex; justify-content: space-between; gap: 12px; }
  .checks-grid span { color: #737373; }
  .checks-grid b { font-variant-numeric: tabular-nums; }
  .footer {
    margin-top: 20px;
    padding-top: 12px;
    border-top: 1px solid #e5e5e5;
    font-size: 10px;
    color: #a3a3a3;
    display: flex;
    justify-content: space-between;
  }
`;

function statBox(label, value) {
  return `<div class="stat"><div class="stat-label">${esc(label)}</div><div class="stat-value">${esc(value ?? '—')}</div></div>`;
}

function buildCoordinateTable(rows, summary, bg) {
  const head = bg
    ? {
        no: '№',
        beta: 'Полигонови ъгли',
        alpha: 'Посочни ъгли',
        dist: 'Разстояние',
        diff: 'Координатни разлики',
        coord: 'Координати',
        betaF: 'β (gon)',
        alphaF: 'α = α₀ + β − 200',
        distF: 'S (m)',
        dyF: 'ΔY · S·sinα',
        dxF: 'ΔX · S·cosα',
        yF: 'Y · Yᵢ + ΔY',
        xF: 'X · Xᵢ + ΔX',
      }
    : {
        no: '#',
        beta: 'Polygon angles',
        alpha: 'Bearings',
        dist: 'Distance',
        diff: 'Coord. differences',
        coord: 'Coordinates',
        betaF: 'β (gon)',
        alphaF: 'α = α₀ + β − 200',
        distF: 'S (m)',
        dyF: 'ΔY · S·sinα',
        dxF: 'ΔX · S·cosα',
        yF: 'Y · Yᵢ + ΔY',
        xF: 'X · Xᵢ + ΔX',
      };

  const bodyRows = rows
    .map(
      (r) => `
    <tr>
      <td>${esc(r.pointNo ?? '')}</td>
      <td>${esc(fmt(r.beta))}</td>
      <td>${esc(fmt(r.alpha))}</td>
      <td>${esc(fmt(r.distance))}</td>
      <td class="readonly">${esc(fmt(r.deltaY))}</td>
      <td class="readonly">${esc(fmt(r.deltaX))}</td>
      <td class="readonly">${esc(fmt(r.y))}</td>
      <td class="readonly">${esc(fmt(r.x))}</td>
    </tr>`
    )
    .join('');

  const sumRow = summary
    ? `<tr class="sum">
      <td>Σ</td>
      <td>${esc(fmt(summary.sumBeta))}</td>
      <td></td>
      <td>${esc(fmt(summary.sumS))}</td>
      <td>${esc(fmt(summary.sumDeltaY))}</td>
      <td>${esc(fmt(summary.sumDeltaX))}</td>
      <td></td>
      <td></td>
    </tr>`
    : '';

  return `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th rowspan="2">${head.no}</th>
            <th rowspan="2">${head.beta}<span class="formula">${head.betaF}</span></th>
            <th rowspan="2">${head.alpha}<span class="formula">${head.alphaF}</span></th>
            <th rowspan="2">${head.dist}<span class="formula">${head.distF}</span></th>
            <th colspan="2">${head.diff}</th>
            <th colspan="2">${head.coord}</th>
          </tr>
          <tr>
            <th class="sub">ΔY<span class="formula">${head.dyF}</span></th>
            <th class="sub">ΔX<span class="formula">${head.dxF}</span></th>
            <th class="sub">Y<span class="formula">${head.yF}</span></th>
            <th class="sub">X<span class="formula">${head.xF}</span></th>
          </tr>
        </thead>
        <tbody>${bodyRows}${sumRow}</tbody>
      </table>
    </div>`;
}

function buildLevelingTable(rows, bg) {
  const head = bg
    ? {
        st: 'Станция',
        back: 'Задно',
        fore: 'Предно',
        delta: 'Превишение',
        h: 'Кота H',
        ctrl: 'Контр.',
        backF: 'a (m)',
        foreF: 'b (m)',
        deltaF: 'a − b (m)',
        hF: 'Hᵢ + Δ (m)',
      }
    : {
        st: 'Station',
        back: 'Back',
        fore: 'Fore',
        delta: 'Delta',
        h: 'Elev. H',
        ctrl: 'Ctrl.',
        backF: 'a (m)',
        foreF: 'b (m)',
        deltaF: 'a − b (m)',
        hF: 'Hᵢ + Δ (m)',
      };

  const bodyRows = rows
    .map(
      (r) => `
    <tr${r.isControl ? ' class="control"' : ''}>
      <td style="text-align:left;padding-left:10px;">${esc(r.station ?? '')}</td>
      <td>${esc(fmt(r.back))}</td>
      <td>${esc(fmt(r.fore))}</td>
      <td class="readonly">${esc(fmt(r.delta))}</td>
      <td class="readonly">${esc(fmt(r.height))}</td>
      <td>${r.isControl ? (bg ? 'Да' : 'Yes') : ''}</td>
    </tr>`
    )
    .join('');

  return `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>${head.st}</th>
            <th>${head.back}<span class="formula">${head.backF}</span></th>
            <th>${head.fore}<span class="formula">${head.foreF}</span></th>
            <th>${head.delta}<span class="formula">${head.deltaF}</span></th>
            <th>${head.h}<span class="formula">${head.hF}</span></th>
            <th>${head.ctrl}</th>
          </tr>
        </thead>
        <tbody>${bodyRows}</tbody>
      </table>
    </div>`;
}

/**
 * Builds an off-screen DOM node styled for PDF capture (Cyrillic-safe via system fonts).
 */
export function buildFieldbookPdfElement({
  bookType = 'leveling',
  rows = [],
  settings = {},
  summary = null,
  bookName = '',
  bookMeta = {},
  language = 'bg',
}) {
  const bg = language === 'bg';
  const isCoord = bookType === 'coordinate';
  const typeLabel = isCoord ? (bg ? 'КООРДИНАТЕН' : 'COORDINATE') : bg ? 'НИВЕЛАЦИОНЕН' : 'LEVELING';
  const docTitle = isCoord ? (bg ? 'Координатен карнет' : 'Coordinate field book') : bg ? 'Нивелационен карнет' : 'Leveling field book';

  let settingsHtml = '';
  if (isCoord) {
    settingsHtml = `
      <span><b>${bg ? 'Начало Y, X' : 'Start Y, X'}:</b> ${esc(fmt(settings.startY))}, ${esc(fmt(settings.startX))}</span>
      <span><b>${bg ? 'Начален ъгъл α' : 'Start bearing α'}:</b> ${esc(fmt(settings.startBearing, 4))} gon</span>
      <span><b>${bg ? 'Затворен ход' : 'Closed traverse'}:</b> ${settings.closed === false ? (bg ? 'Не' : 'No') : bg ? 'Да' : 'Yes'}</span>`;
  } else {
    settingsHtml = `
      <span><b>${bg ? 'Начална кота' : 'Benchmark'}:</b> ${esc(fmt(settings.benchmarkHeight))} m</span>
      <span><b>${bg ? 'Допуск' : 'Tolerance'}:</b> ${esc(fmt(settings.toleranceMm, 0))} mm</span>`;
  }

  let statsHtml = '';
  if (isCoord) {
    statsHtml = [
      statBox(bg ? 'Точки' : 'Points', rows.length),
      statBox('f_β (mgon)', fmt(summary?.angularMisclosureMgon, 2)),
      statBox('f_S (m)', fmt(summary?.fS, 3)),
      statBox(bg ? 'Относителна' : 'Relative', summary?.relative ? `1/${summary.relative}` : '—'),
    ].join('');
  } else {
    statsHtml = [
      statBox(bg ? 'Точки' : 'Points', rows.length),
      statBox(bg ? 'Контролни' : 'Control', rows.filter((r) => r.isControl).length),
      statBox(bg ? 'Допуск (mm)' : 'Tol. (mm)', fmt(settings.toleranceMm, 0)),
      statBox(bg ? 'Редове' : 'Rows', rows.length),
    ].join('');
  }

  let checksHtml = '';
  if (isCoord && summary) {
    checksHtml = `
      <div class="checks">
        <h3>${bg ? 'Проверки и невръзки' : 'Checks and misclosures'}</h3>
        <div class="checks-grid">
          <div><span>f_β (mgon)</span><b>${esc(fmt(summary.angularMisclosureMgon, 2))}</b></div>
          <div><span>f_S (m)</span><b>${esc(fmt(summary.fS, 3))}</b></div>
          <div><span>f_Y (m)</span><b>${esc(fmt(summary.fY, 3))}</b></div>
          <div><span>f_X (m)</span><b>${esc(fmt(summary.fX, 3))}</b></div>
          ${summary.relative ? `<div><span>${bg ? 'Относителна' : 'Relative'}</span><b>1/${esc(summary.relative)}</b></div>` : ''}
        </div>
      </div>`;
  }

  const tableHtml = isCoord ? buildCoordinateTable(rows, summary, bg) : buildLevelingTable(rows, bg);
  const generatedAt = new Date().toLocaleString(bg ? 'bg-BG' : 'en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const root = document.createElement('div');
  root.innerHTML = `
    <style>${styles}</style>
    <div class="root">
      <div class="brand-row">
        <div class="brand">
          <div class="brand-mark">GS</div>
          <div class="brand-name">GeoSolver</div>
        </div>
        <div class="doc-type">${esc(docTitle)}</div>
      </div>
      <div class="title-block">
        <h1>${esc(bookName || '—')} <span class="badge">${typeLabel}</span></h1>
        <div class="meta">
          ${bookMeta?.date ? `<span><strong>${bg ? 'Дата' : 'Date'}:</strong> ${esc(bookMeta.date)}</span>` : ''}
          ${bookMeta?.crew ? `<span> · <strong>${bg ? 'Екип' : 'Crew'}:</strong> ${esc(bookMeta.crew)}</span>` : ''}
        </div>
      </div>
      <div class="settings">${settingsHtml}</div>
      <div class="stats">${statsHtml}</div>
      ${tableHtml}
      ${checksHtml}
      <div class="footer">
        <span>${bg ? 'Генерирано от GeoSolver · разработено от Wortexa' : 'Generated by GeoSolver · developed by Wortexa'} · geosolver.bg</span>
        <span>${esc(generatedAt)}</span>
      </div>
    </div>`;

  const wrapper = document.createElement('div');
  wrapper.style.cssText = 'position:fixed;left:-10000px;top:0;z-index:-1;';
  wrapper.appendChild(root);
  return wrapper;
}
