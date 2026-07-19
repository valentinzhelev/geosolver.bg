import { useEffect, useRef } from 'react';
import { consumeCalculationRestore } from '../utils/calculationRestore';

/**
 * On mount, applies session restore payload for matching toolName.
 */
export function useCalculationRestore(toolName, setState, mapRestore) {
  const applied = useRef(false);
  const mapperRef = useRef(mapRestore);
  mapperRef.current = mapRestore;

  useEffect(() => {
    if (applied.current) return;
    const payload = consumeCalculationRestore(toolName);
    if (!payload) return;
    applied.current = true;
    const map = mapperRef.current || ((d) => d);
    setState((prev) => ({ ...prev, ...map(payload) }));
  }, [toolName, setState]);
}
