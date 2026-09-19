/**
 * Pure payload-assembly logic for POST /api/calculations, extracted from
 * useCalculationTracking.js so it can be unit-tested without rendering React
 * (Milestone 1 §10). Fields are only included when actually present, so a
 * standalone save's payload is byte-for-byte identical to what the backend
 * already accepted before this milestone (backward compatibility, §L).
 */
export function buildCalculationPayload({
  toolName,
  toolDisplayName,
  inputData,
  resultData,
  calculationTime,
  eduContext,
  projectId,
  pointReferences,
}) {
  return {
    toolName,
    toolDisplayName,
    inputData,
    resultData,
    calculationTime,
    ...(eduContext?.assignmentId ? { eduContext: { assignmentId: eduContext.assignmentId } } : {}),
    ...(projectId ? { projectId } : {}),
    ...(Array.isArray(pointReferences) && pointReferences.length ? { pointReferences } : {}),
  };
}
