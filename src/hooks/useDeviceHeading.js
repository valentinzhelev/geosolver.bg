import { useEffect, useState } from 'react';

/**
 * Device compass heading in gon (0 = north), when a true-heading source is available.
 * Ignores relative `alpha` without absolute orientation (wrong on most Android devices).
 */
export function useDeviceHeading() {
  const [headingGon, setHeadingGon] = useState(null);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    const hasOrientation = typeof window !== 'undefined' && 'DeviceOrientationEvent' in window;
    setSupported(hasOrientation);
    if (!hasOrientation) return undefined;

    const applyDeg = (deg) => {
      if (deg == null || !Number.isFinite(deg)) return;
      let d = deg % 360;
      if (d < 0) d += 360;
      setHeadingGon((d / 360) * 400);
    };

    const onOrient = (e) => {
      if (typeof e.webkitCompassHeading === 'number' && Number.isFinite(e.webkitCompassHeading)) {
        applyDeg(e.webkitCompassHeading);
        return;
      }
      // Absolute orientation: alpha is CCW from north → convert to CW compass heading
      if (e.absolute === true && typeof e.alpha === 'number' && Number.isFinite(e.alpha)) {
        applyDeg((360 - e.alpha) % 360);
      }
    };

    window.addEventListener('deviceorientationabsolute', onOrient);
    window.addEventListener('deviceorientation', onOrient);
    return () => {
      window.removeEventListener('deviceorientationabsolute', onOrient);
      window.removeEventListener('deviceorientation', onOrient);
    };
  }, []);

  const requestPermission = async () => {
    if (typeof DeviceOrientationEvent?.requestPermission === 'function') {
      try {
        const res = await DeviceOrientationEvent.requestPermission();
        return res === 'granted';
      } catch {
        return false;
      }
    }
    return true;
  };

  return { headingGon, supported, requestPermission };
}
