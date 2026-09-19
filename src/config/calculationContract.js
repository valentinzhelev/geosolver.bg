/**
 * Frontend CALCULATION CONTRACT version — the ONE place this number lives.
 *
 * It is sent with every professional calculation save (utils/calculationPayload.js) so the backend
 * can refuse a stale browser instead of letting it display one result while the canonical engine
 * stores another (CLIENT_REFRESH_REQUIRED). It is diagnostic and a compatibility gate only:
 * mathematical authority is always the backend engine version.
 *
 *   1 = implicit (no field sent): every build before the canonical engine.
 *   2 = Offset Point v2 (positive d = LEFT), Resection v2 (directed clockwise angles) and the
 *       authoritative-result overlay in useGuardedCalculation.
 *
 * Bump this ONLY when client-side mathematics or the displayed meaning of a persisted result
 * changes, and add the tool to REQUIRED_CLIENT_CONTRACT in geosolver-backend/engines/clientContract.js.
 */
export const CLIENT_CALCULATION_CONTRACT_VERSION = 2;
