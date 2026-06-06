import { useEffect, useState } from 'react';
import { useAuth } from '../components/auth/AuthContext';
import { fieldbookPilotApi } from '../services/fieldbookApi';

/**
 * Pilot access for electronic field books (/fieldbook).
 */
export function useFieldBookPilotAccess() {
  const { user, token, loading: authLoading } = useAuth();
  const [access, setAccess] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!token || !user) {
      setAccess(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    fieldbookPilotApi
      .getAccess()
      .then((res) => {
        if (!cancelled) setAccess(res.access || null);
      })
      .catch(() => {
        if (!cancelled) setAccess({ approved: false, status: null });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token, user, authLoading]);

  return {
    access,
    loading: authLoading || loading,
    isLoggedIn: !!user && !!token,
    canUse: !!access?.approved,
    isPending: access?.status === 'pending',
  };
}
