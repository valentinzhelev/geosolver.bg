import React, { createContext, useContext, useState } from 'react';
import { useSurveyPoints } from '../hooks/useSurveyPoints';

const SurveyPointsContext = createContext(null);

/**
 * Shared survey-points cache so multiple PointPickers don't N× fetch.
 */
export function SurveyPointsProvider({ children }) {
  const [projectId, setProjectId] = useState('');
  const [layer, setLayer] = useState('');
  const survey = useSurveyPoints({
    projectId: projectId || undefined,
    layer: layer || undefined,
  });

  const value = {
    ...survey,
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

/** Prefer context cache; fall back to dedicated hook fetch. */
export function useSharedSurveyPoints(options = {}) {
  const ctx = useContext(SurveyPointsContext);
  const forceOwn = options.forceOwn === true || !ctx;
  const own = useSurveyPoints({
    projectId: options.projectId,
    layer: options.layer,
    enabled: forceOwn && options.enabled !== false,
  });

  if (ctx && !options.forceOwn) {
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
      error: ctx.error,
      reload: ctx.reload,
      hasPoints: points.length > 0,
    };
  }
  return own;
}
