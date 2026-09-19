/**
 * Pure decision logic behind ProjectContext's requestedProjectId/currentProject/
 * error state machine (Milestone 1 follow-up §4), kept framework-free so the
 * "no project requested" vs "requested but unresolved" distinction can be
 * unit-tested without rendering React. See src/context/ProjectContext.js.
 *
 * Does NOT cover the async lookup-failed (network error) branch — that's a
 * trivial catch-and-set-error in the effect itself, not a decision worth
 * extracting.
 */
export function resolveProjectState(requestedProjectId, user, projects) {
  if (!requestedProjectId) {
    // Case A: nothing requested — standalone mode is valid.
    return { currentProject: null, error: null };
  }
  if (!user) {
    // Case C: requested but cannot be confirmed without being logged in.
    return { currentProject: null, error: 'unauthenticated' };
  }
  const match = (projects || []).find((p) => String(p._id) === String(requestedProjectId)) || null;
  // Case B if found, Case C ('not_found') otherwise.
  return { currentProject: match, error: match ? null : 'not_found' };
}
