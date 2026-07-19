const STORAGE_KEY = 'geosolver_restore_calc';

/** Survives React Strict Mode remount after sessionStorage was cleared. */
const lastConsumedByTool = new Map();

export function setCalculationRestore(toolName, inputData) {
  try {
    lastConsumedByTool.delete(toolName);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ toolName, inputData, at: Date.now() }));
  } catch {
    /* ignore */
  }
}

/** Returns inputData if toolName matches; clears storage only after a successful match. */
export function consumeCalculationRestore(toolName) {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.toolName === toolName) {
        sessionStorage.removeItem(STORAGE_KEY);
        const inputData = parsed.inputData ?? null;
        lastConsumedByTool.set(toolName, { at: parsed.at, inputData });
        return inputData;
      }
      // Wrong tool — leave storage for the correct consumer
      return null;
    }
  } catch {
    /* fall through to memory cache */
  }

  const cached = lastConsumedByTool.get(toolName);
  return cached ? cached.inputData : null;
}

export function inputDataToFormStrings(data) {
  if (!data || typeof data !== 'object') return {};
  return Object.fromEntries(
    Object.entries(data).map(([k, v]) => [k, v == null ? '' : String(v)])
  );
}

/** Maps stored inputData → partial form state per tool */
export function getRestoreMapper(toolName) {
  switch (toolName) {
    case 'coordinate-transformation':
      return (d) => {
        const { parameters, ...rest } = d || {};
        const base = inputDataToFormStrings(rest);
        if (parameters && typeof parameters === 'object') {
          Object.assign(base, inputDataToFormStrings(parameters));
        }
        return base;
      };
    case 'area-calculation':
      return (d) => {
        const method = d?.method || 'shoelace';
        let points = '';
        if (Array.isArray(d?.points)) {
          points = d.points.map((p) => `${p.x} ${p.y}`).join('\n');
        }
        return { method, points };
      };
    default:
      return inputDataToFormStrings;
  }
}

export function formatCalcPayload(data) {
  if (data == null) return '—';
  if (typeof data !== 'object') return String(data);
  if (Array.isArray(data)) return JSON.stringify(data, null, 2);
  return Object.entries(data)
    .map(([k, v]) => {
      if (v == null) return `${k}: —`;
      if (typeof v === 'object') return `${k}: ${JSON.stringify(v)}`;
      return `${k}: ${v}`;
    })
    .join('\n');
}
