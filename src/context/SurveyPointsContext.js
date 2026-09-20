import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useAuth } from '../components/auth/AuthContext';
import { surveyPointsApi } from '../services/surveyPointsApi';
import { onSurveyPointsChanged } from '../utils/surveyPointsEvents';
import { useSurveyPoints } from '../hooks/useSurveyPoints';

const SurveyPointsContext = createContext(null);

/** A cache older than this is refreshed when a PointPicker mounts (safety net for changes made elsewhere). */
export const POINTS_STALE_MS = 15000;

/**
 * Shared survey-points cache: ONE source of truth so several PointPickers on one calculator never fetch N times.
 *
 * Freshness (QA-05):
 *  - explicit invalidation: every successful point mutation (create / edit / delete / import / Save as point)
 *    calls notifySurveyPointsChanged() (services/surveyPointsApi.js, calculationService), which refreshes this cache;
 *  - fallback: a PointPicker that mounts calls ensureFresh(), which refreshes only when the cache is missing or older
 *    than POINTS_STALE_MS;
 *  - deduplication: at most one request is in flight. Concurrent refreshes share it; an invalidation that arrives
 *    while a request is in flight (its result may predate the mutation) schedules exactly one follow-up fetch;
 *  - no polling.
 */
export function SurveyPointsProvider({ children }) {
  const { user } = useAuth();
  const [projectId, setProjectId] = useState('');
  const [layer, setLayer] = useState('');
  const [state, setState] = useState({ points: [], loading: false, loaded: false, error: null });

  const userRef = useRef(user);
  const paramsRef = useRef({});
  const inflightRef = useRef(null);
  const inflightKeyRef = useRef('');
  const dirtyRef = useRef(false);
  const loadedAtRef = useRef(0);
  const mountedRef = useRef(true);
  userRef.current = user;
  paramsRef.current = { ...(projectId ? { projectId } : {}), ...(layer ? { layer } : {}) };
  // identity of "what we load": who + which scope (a new key means an in-flight result is for something else)
  const userKey = user ? String(user._id || user.id || user.email || 'user') : '';
  const scopeKey = `${userKey}|${projectId}|${layer}`;
  const scopeKeyRef = useRef(scopeKey);
  scopeKeyRef.current = scopeKey;

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const refresh = useCallback(({ force = false } = {}) => {
    if (!userRef.current) {
      loadedAtRef.current = 0;
      if (mountedRef.current) setState({ points: [], loading: false, loaded: true, error: null });
      return Promise.resolve();
    }
    if (inflightRef.current) {
      if (force) dirtyRef.current = true; // the in-flight result may predate the change: fetch once more afterwards
      return inflightRef.current;
    }
    inflightKeyRef.current = scopeKeyRef.current;
    const run = async () => {
      if (mountedRef.current) setState((s) => ({ ...s, loading: true, error: null }));
      try {
        let points;
        do {
          dirtyRef.current = false;
          const res = await surveyPointsApi.list(paramsRef.current);
          points = (res.data || []).filter((p) => p.y != null && p.x != null);
        } while (dirtyRef.current);
        loadedAtRef.current = Date.now();
        if (mountedRef.current) setState({ points, loading: false, loaded: true, error: null });
      } catch (e) {
        if (mountedRef.current) setState({ points: [], loading: false, loaded: true, error: e.message || 'error' });
      } finally {
        inflightRef.current = null;
      }
    };
    inflightRef.current = run();
    return inflightRef.current;
  }, []);

  // (re)load when the user / scope changes
  useEffect(() => {
    // a request already in flight for this same scope (e.g. started by a mounting PointPicker) is simply shared
    if (inflightRef.current && inflightKeyRef.current === scopeKey) return;
    refresh({ force: true });
  }, [scopeKey, refresh]);

  // explicit invalidation after point mutations
  useEffect(() => onSurveyPointsChanged(() => refresh({ force: true })), [refresh]);

  const ensureFresh = useCallback(
    (maxAgeMs = POINTS_STALE_MS) => {
      if (inflightRef.current) return inflightRef.current;
      const fresh = loadedAtRef.current && Date.now() - loadedAtRef.current <= maxAgeMs;
      return fresh ? Promise.resolve() : refresh();
    },
    [refresh]
  );

  const reload = useCallback(() => refresh({ force: true }), [refresh]);

  const value = {
    points: state.points,
    loading: state.loading,
    loaded: state.loaded,
    error: state.error,
    hasPoints: state.points.length > 0,
    reload,
    invalidate: reload,
    ensureFresh,
    projectId,
    layer,
    setProjectId,
    setLayer,
  };

  return <SurveyPointsContext.Provider value={value}>{children}</SurveyPointsContext.Provider>;
}

export function useSurveyPointsContext() {
  return useContext(SurveyPointsContext);
}

/** Prefer the shared cache; fall back to a dedicated hook fetch when no provider is mounted. */
export function useSharedSurveyPoints(options = {}) {
  const ctx = useContext(SurveyPointsContext);
  const useCache = Boolean(ctx) && options.forceOwn !== true;
  const forceOwn = options.forceOwn === true || !ctx;
  const own = useSurveyPoints({
    projectId: options.projectId,
    layer: options.layer,
    enabled: forceOwn && options.enabled !== false,
  });

  // a picker that mounts (or whose project changes) makes sure the cache is not stale — deduplicated across pickers
  const ensureFresh = ctx ? ctx.ensureFresh : null;
  useEffect(() => {
    if (useCache && ensureFresh) ensureFresh();
  }, [useCache, ensureFresh, options.projectId]);

  if (useCache) {
    let points = ctx.points;
    if (options.projectId) {
      points = points.filter((p) => String(p.projectId || '') === String(options.projectId));
    }
    if (options.layer) {
      points = points.filter((p) => (p.layer || 'default') === options.layer);
    }
    return {
      points,
      loading: ctx.loading,
      loaded: ctx.loaded,
      error: ctx.error,
      reload: ctx.reload,
      hasPoints: points.length > 0,
    };
  }
  return { ...own, loaded: !own.loading };
}
