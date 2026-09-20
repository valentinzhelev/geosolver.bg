/**
 * OFFICIAL GeoSolver coordinate convention (QA-02, FINAL).
 *
 *   X = Northing (север)        Y = Easting (изток)        H = height
 *   bearings are measured clockwise from +X:
 *     0 gon = +X = North,  100 gon = +Y = East,  200 gon = South,  300 gon = West
 *
 * Every calculator and the canonical backend engines already work this way (α = atan2(ΔY, ΔX),
 * x2 = x1 + S·cos α, y2 = y1 + S·sin α). This module only pins the meaning for PRESENTATION boundaries.
 * No stored value is ever converted here.
 *
 * Screen / CAD Cartesian presentation:
 *   horizontal axis (screen right / CAD X)  = Easting  = internal y
 *   vertical axis   (screen up    / CAD Y)  = Northing = internal x
 */

export const COORDINATE_CONVENTION = Object.freeze({
  xMeaning: { bg: 'X = север (Northing)', en: 'X = north (Northing)' },
  yMeaning: { bg: 'Y = изток (Easting)', en: 'Y = east (Easting)' },
  bearing: { bg: '0 gon = север (+X), 100 gon = изток (+Y)', en: '0 gon = north (+X), 100 gon = east (+Y)' },
});

/** One-line statement for help boxes. */
export function coordinateConventionText(language = 'bg') {
  const l = language === 'bg' ? 'bg' : 'en';
  return `${COORDINATE_CONVENTION.xMeaning[l]}, ${COORDINATE_CONVENTION.yMeaning[l]}`;
}

/** Direction of a bearing in gon: 0 = +X (north), 100 = +Y (east). Returns a unit step in (northing, easting). */
export function bearingUnitVector(gon) {
  const a = (gon * Math.PI) / 200;
  return { dNorth: Math.cos(a), dEast: Math.sin(a) };
}

/** Cartesian presentation axes of an internal point: horizontal = Easting (y), vertical = Northing (x). */
export function toCartesian(point) {
  return { horizontal: Number(point.y), vertical: Number(point.x) };
}

/**
 * Plan (SVG) position of an internal point. Screen y grows DOWNWARD, so Northing is negated:
 * larger x (further north) => smaller sy (higher on screen); larger y (further east) => larger sx (further right).
 * @param {number} x Northing
 * @param {number} y Easting
 * @param {{cx:number, cy:number, span:number, innerW:number, innerH:number, pad:number}} view
 *        cx = centre Northing, cy = centre Easting
 */
export function planPosition(x, y, { cx, cy, span, innerW, innerH, pad }) {
  return {
    sx: pad + innerW / 2 + ((y - cy) / span) * innerW,
    sy: pad + innerH / 2 - ((x - cx) / span) * innerH,
  };
}

/**
 * Isometric preview position (viewer standing SOUTH-WEST of the scene, looking north-east):
 *   Easting (y)  -> to the right and away (up on screen)
 *   Northing (x) -> to the left and away (up on screen)
 *   Height (h)   -> straight up
 * @param {number} x Northing @param {number} y Easting @param {number} h height (already normalised 0..1 below)
 * @param {{cx:number, cy:number, spanXY:number, minH:number, spanH:number, size:number}} view
 */
export function isoPosition(x, y, h, { cx, cy, spanXY, minH, spanH, size }) {
  const north = (x - cx) / spanXY;
  const east = (y - cy) / spanXY;
  const up = ((h - minH) / spanH) * 0.35;
  return {
    sx: size / 2 + (east - north) * (size * 0.32),
    sy: size / 2 - (east + north) * (size * 0.16) - up * (size * 0.5),
  };
}

/**
 * Screen (SVG, y grows downward) unit step for a bearing in gon with NORTH UP:
 * 0 gon => straight up (+X north), 100 gon => right (+Y east), 200 gon => down, 300 gon => left.
 */
export function bearingScreenVector(gon) {
  const a = (gon * Math.PI) / 200;
  return { dx: Math.sin(a), dy: -Math.cos(a) };
}
