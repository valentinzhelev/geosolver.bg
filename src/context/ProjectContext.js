import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../components/auth/AuthContext';
import { fieldbooksApi } from '../services/fieldbookApi';
import { resolveProjectState } from '../utils/projectResolution';

const ProjectContext = createContext(null);

/**
 * General "current project" awareness for calculators, following the same
 * ?projectId= query-param convention already used by Map/Points/Stake-out
 * (see PointsPage.js).
 *
 * Milestone 1 follow-up §4: a requested-but-unresolved project must be
 * distinguishable from "no project was requested at all" — otherwise a
 * loading hiccup or a transient access problem would look identical to
 * "standalone mode is valid" and a calculation could silently save without
 * its intended project association. This context exposes four fields so
 * consumers never have to guess which case they're in:
 *
 *   requestedProjectId — the raw ?projectId= value, '' if none was given
 *   currentProject     — the resolved project object, or null
 *   loading            — true while resolution is in flight
 *   error              — set (non-null) only when a project WAS requested
 *                        but could not be confirmed (not found, no access,
 *                        not logged in, or the lookup itself failed) — never
 *                        set when nothing was requested
 *
 * Resolution looks the id up in the user's own accessible project list
 * (fieldbooksApi.listProjects(), already fetched elsewhere in the app) —
 * deliberately not a new single-project backend endpoint. This lookup is a
 * convenience/display mechanism only, not a security boundary — the backend
 * independently re-validates project access on every save/list call
 * regardless of what this context believes.
 *
 * IMPORTANT: callers that need to decide whether a calculation belongs to a
 * project (e.g. useGuardedCalculation) must key off `requestedProjectId`,
 * NOT `currentProject` — see that hook for why: an explicitly-requested
 * project association must never be silently dropped just because this
 * convenience lookup hasn't resolved it yet or failed.
 */
export function ProjectProvider({ children }) {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const requestedProjectId = searchParams.get('projectId') || '';
  const [currentProject, setCurrentProject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    if (!requestedProjectId || !user) {
      // Case A (nothing requested) or Case C (requested but not logged in)
      // — neither needs a network round-trip; resolveProjectState decides
      // which.
      const { currentProject: resolved, error: err } = resolveProjectState(requestedProjectId, user, []);
      setCurrentProject(resolved);
      setLoading(false);
      setError(err);
      return undefined;
    }

    setLoading(true);
    setError(null);
    fieldbooksApi
      .listProjects()
      .then((res) => {
        if (cancelled) return;
        const projects = res?.data || res?.projects || [];
        const { currentProject: resolved, error: err } = resolveProjectState(requestedProjectId, user, projects);
        setCurrentProject(resolved);
        setError(err);
      })
      .catch(() => {
        if (cancelled) return;
        setCurrentProject(null);
        setError('lookup_failed');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [requestedProjectId, user]);

  return (
    <ProjectContext.Provider value={{ requestedProjectId, currentProject, loading, error }}>
      {children}
    </ProjectContext.Provider>
  );
}

/** Returns { requestedProjectId, currentProject, loading, error }. */
export function useProjectContext() {
  return useContext(ProjectContext) || { requestedProjectId: '', currentProject: null, loading: false, error: null };
}
