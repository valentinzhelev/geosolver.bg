/**
 * Project-scoping precedence used by PointPicker (Milestone 1 §9).
 *
 * A classroom assignment's linkedProjectId always wins over the general
 * "current project" context — an assignment is a narrower, teacher-defined
 * scope that must not be silently widened by whatever project a student's
 * URL happens to carry. An explicit projectId prop (if a caller ever passes
 * one) is honored next, then the general project context, then no scoping.
 *
 * No current caller passes an explicit projectId prop, so this ordering
 * preserves today's edu behavior exactly — it only starts to matter once
 * ProjectContext is populated.
 */
export function resolveEffectiveProjectId({ eduProjectId, projectId, currentProjectId } = {}) {
  return eduProjectId || projectId || currentProjectId || undefined;
}
