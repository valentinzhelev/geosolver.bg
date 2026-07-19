import React, { useEffect, useMemo, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import icon from 'leaflet/dist/images/marker-icon.png';
import shadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: iconRetina,
  iconUrl: icon,
  shadowUrl: shadow,
});

function isGnssLike(p) {
  return p.layer === 'gnss' || p.pointClass === 'gnss' || p.code === 'NMEA' || p.code === 'GNSS';
}

function looksLikeWgs84(lat, lon) {
  return lat >= 41 && lat <= 44.5 && lon >= 22 && lon <= 29.5;
}

/**
 * OSM basemap for GNSS / WGS84 points (lat = Y, lon = X in library).
 */
const GnssOsmMap = ({
  points = [],
  language = 'bg',
  height = 520,
  selectedId = null,
  onSelectPoint,
}) => {
  const bg = language === 'bg';
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);

  const gnssPoints = useMemo(() => {
    return points
      .filter((p) => Number.isFinite(p.y) && Number.isFinite(p.x))
      .filter((p) => isGnssLike(p) || looksLikeWgs84(p.y, p.x))
      .map((p) => ({ ...p, lat: p.y, lon: p.x }));
  }, [points]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, { zoomControl: true }).setView([42.7, 25.5], 8);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    if (!gnssPoints.length) return;

    const bounds = L.latLngBounds(gnssPoints.map((p) => [p.lat, p.lon]));
    gnssPoints.forEach((p) => {
      const marker = L.circleMarker([p.lat, p.lon], {
        radius: selectedId && (p._id === selectedId || p.name === selectedId) ? 9 : 6,
        color: '#ea580c',
        fillColor: '#ea580c',
        fillOpacity: 0.85,
        weight: 2,
      })
        .addTo(map)
        .bindTooltip(p.code || p.name || '—', { permanent: false, direction: 'top' });

      if (onSelectPoint) {
        marker.on('click', () => onSelectPoint(p));
      }
      markersRef.current.push(marker);
    });

    map.fitBounds(bounds.pad(0.15));
  }, [gnssPoints, selectedId, onSelectPoint]);

  return (
    <div className="w-full flex flex-col gap-2">
      <p className="text-xs text-amber-800 dark:text-amber-200 font-['Manrope'] p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/50">
        {bg
          ? 'OSM подложка е за GNSS/WGS84 точки (ширина ≈ Y, дължина ≈ X). Координатни точки в BGS2005 не се показват тук — използвайте План.'
          : 'OSM basemap is for GNSS/WGS84 points (lat ≈ Y, lon ≈ X). BGS2005 survey points belong on Plan view.'}
      </p>
      <div
        ref={containerRef}
        className="w-full rounded-xl overflow-hidden border border-gray-200 dark:border-zinc-700 z-0"
        style={{ height }}
        role="img"
        aria-label={bg ? 'OSM карта с GNSS точки' : 'OSM map with GNSS points'}
      />
      {!gnssPoints.length && (
        <p className="text-sm text-neutral-500 font-['Manrope'] text-center py-4">
          {bg ? 'Няма GNSS точки за OSM изглед. Import от /gnss или NMEA live.' : 'No GNSS points for OSM view. Import via /gnss or NMEA live.'}
        </p>
      )}
    </div>
  );
};

export default GnssOsmMap;
