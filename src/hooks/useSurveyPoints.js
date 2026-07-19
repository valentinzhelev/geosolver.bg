import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../components/auth/AuthContext';
import { surveyPointsApi } from '../services/surveyPointsApi';

/**
 * Loads survey points for authenticated users (tools point picker, map, etc.).
 */
export function useSurveyPoints({ projectId, layer, enabled = true } = {}) {
  const { user } = useAuth();
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const reload = useCallback(async () => {
    if (!user || !enabled) {
      setPoints([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (projectId) params.projectId = projectId;
      if (layer) params.layer = layer;
      const res = await surveyPointsApi.list(params);
      setPoints((res.data || []).filter((p) => p.y != null && p.x != null));
    } catch (e) {
      setError(e.message);
      setPoints([]);
    } finally {
      setLoading(false);
    }
  }, [user, enabled, projectId, layer]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { points, loading, error, reload, hasPoints: points.length > 0 };
}
