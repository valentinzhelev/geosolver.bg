const STORAGE_KEY = 'geosolver_gnss_field_log';
const PENDING_KEY = 'geosolver_gnss_field_log_pending';

export function loadGnssFieldLog() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveGnssFieldLog(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, 100)));
}

export function loadPendingGnssFieldLog() {
  try {
    const raw = localStorage.getItem(PENDING_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function savePendingGnssFieldLog(entries) {
  localStorage.setItem(PENDING_KEY, JSON.stringify(entries.slice(0, 100)));
}

/** Queue an entry for later cloud sync (offline writes). */
export function enqueuePendingGnssFieldLog(entry) {
  const list = loadPendingGnssFieldLog();
  const row = {
    ...entry,
    id: entry.id || Date.now(),
    createdAt: entry.createdAt || new Date().toISOString(),
    pendingSync: true,
  };
  list.unshift(row);
  savePendingGnssFieldLog(list);
  // Keep visible local log in sync for offline browsing
  const local = loadGnssFieldLog();
  local.unshift(row);
  saveGnssFieldLog(local);
  return list;
}

export function addGnssFieldLogEntry(entry) {
  return enqueuePendingGnssFieldLog(entry);
}

export function deleteGnssFieldLogEntry(id) {
  const list = loadGnssFieldLog().filter((e) => String(e.id) !== String(id));
  saveGnssFieldLog(list);
  savePendingGnssFieldLog(loadPendingGnssFieldLog().filter((e) => String(e.id) !== String(id)));
  return list;
}

/**
 * Flush pending local entries to cloud via importMany.
 * @returns {{ synced: number, remaining: number }}
 */
export async function flushPendingGnssFieldLog(importManyFn) {
  const pending = loadPendingGnssFieldLog();
  if (!pending.length) return { synced: 0, remaining: 0 };
  await importManyFn(pending);
  savePendingGnssFieldLog([]);
  // Drop pending markers from local mirror
  saveGnssFieldLog(loadGnssFieldLog().filter((e) => !e.pendingSync));
  return { synced: pending.length, remaining: 0 };
}

export function gnssLogToCsv(entries, language = 'bg') {
  const bg = language === 'bg';
  const headers = bg
    ? ['Дата', 'Обект', 'База', 'Rover', 'Антена (m)', 'Fix', 'HDOP', 'Бележки']
    : ['Date', 'Site', 'Base', 'Rover', 'Antenna (m)', 'Fix', 'HDOP', 'Notes'];
  const esc = (v) => {
    const s = v == null ? '' : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const rows = entries.map((e) =>
    [e.date, e.site, e.base, e.rover, e.antennaHeight, e.fixType, e.hdop, e.notes].map(esc).join(',')
  );
  return '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
}

export function downloadGnssLogCsv(entries, language = 'bg') {
  const csv = gnssLogToCsv(entries, language);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'gnss_field_log.csv';
  a.click();
  URL.revokeObjectURL(url);
}
