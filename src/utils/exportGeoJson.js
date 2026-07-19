/** Export survey points as GeoJSON FeatureCollection (WGS84-style Y/X as properties). */

export function pointsToGeoJson(points = [], { name = 'GeoSolver points' } = {}) {
  const features = points
    .filter((p) => p.x != null && p.y != null)
    .map((p) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        // GeoJSON is lon, lat — here we store plan Y,X in properties; coordinates use X,Y order for GIS swap
        coordinates: [Number(p.x), Number(p.y)],
      },
      properties: {
        name: p.name,
        code: p.code || '',
        Y: p.y,
        X: p.x,
        H: p.h != null ? p.h : null,
        layer: p.layer || 'default',
        pointClass: p.pointClass || '',
        notes: p.notes || '',
      },
    }));

  return {
    type: 'FeatureCollection',
    name,
    features,
  };
}

export function downloadGeoJson(points, filename = 'geosolver_points', meta = {}) {
  const geo = pointsToGeoJson(points, meta);
  const blob = new Blob([JSON.stringify(geo, null, 2)], { type: 'application/geo+json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.geojson`;
  a.click();
  URL.revokeObjectURL(url);
}
