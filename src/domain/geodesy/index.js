/**
 * Геодезически изчисления - Domain слой
 * Чисти функции без side effects за геодезически изчисления
 */
export { calculateFirstTask } from './firstTask';
export { calculateSecondTask } from './secondTask';
export { calculateForwardIntersection } from './forwardIntersection';
export { calculateResection } from './resection';
export { calculatePolarIntersection } from './polarIntersection';
export { calculateHansenTask } from './hansenTask';
export { calculateDistanceBearing } from './distanceBearing';
export { calculateCoordinateTransformation } from './coordinateTransformation';
export { calculateArea } from './areaCalculation';
export { calculateLineIntersection } from './lineIntersection';
export { calculateOrthogonalOffset } from './orthogonalOffset';
export { calculateSegmentPoint } from './segmentDivision';
export {
  wgs84ToProjected,
  projectedToWgs84,
  ensureProjectedPoint,
  looksLikeWgs84,
  CRS_OPTIONS,
  DEFAULT_CRS,
  crsLabel,
} from './crsTransform';
