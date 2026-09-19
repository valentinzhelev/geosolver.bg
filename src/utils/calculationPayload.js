/**
 * Pure payload-assembly logic for POST /api/calculations, extracted from
 * useCalculationTracking.js so it can be unit-tested without rendering React
 * (Milestone 1 §10). Fields are only included when actually present, so a
 * standalone save's payload is byte-for-byte identical to what the backend
 * already accepted before this milestone (backward compatibility, §L).
 */
import { CLIENT_CALCULATION_CONTRACT_VERSION } from '../config/calculationContract';

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
    // Centralized here (never in a calculator): lets the backend refuse a stale browser.
    clientContractVersion: CLIENT_CALCULATION_CONTRACT_VERSION,
    ...(eduContext?.assignmentId ? { eduContext: { assignmentId: eduContext.assignmentId } } : {}),
    ...(projectId ? { projectId } : {}),
    ...(Array.isArray(pointReferences) && pointReferences.length ? { pointReferences } : {}),
  };
}
