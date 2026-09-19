/**
 * Worked example shown on the Resection documentation page (ResectionDocs.js).
 *
 * The docs page renders these constants, and resectionExample.test.js re-derives the angles
 * from the known station with an independent atan2 construction and checks that the
 * production solver reproduces the station from the DISPLAYED (rounded) angles. The
 * documentation therefore cannot drift from the engine silently.
 *
 * Frame: X = north, Y = east. Coordinates in metres, angles in gon.
 * beta1 = directed CLOCKWISE angle P->A to P->B, beta2 = directed CLOCKWISE angle P->B to P->C.
 */
export const RESECTION_DOC_EXAMPLE = {
  controls: {
    A: { x: 2100, y: 900 },
    B: { x: 2150, y: 1080 },
    C: { x: 1930, y: 1120 },
  },
  station: { x: 2000, y: 1000 },
  // Displayed to 4 decimals; derived from `station` (verified by the test, not typed by hand).
  angles: { beta1: 81.1917, beta2: 102.4266 },
  // The page prints coordinates with 2 decimals; the engine must reproduce them within half a unit of the last shown digit.
  displayToleranceMetres: 0.005,
};
