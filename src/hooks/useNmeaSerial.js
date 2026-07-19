import { useCallback, useEffect, useRef, useState } from 'react';
import { mergeGsvSatellites, parseNmeaLine } from '../utils/parseNmea';

/** Web Serial NMEA reader — shared by GNSS live and stake-out. */
export function useNmeaSerial() {
  const [supported, setSupported] = useState(false);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState('');
  const [gga, setGga] = useState(null);
  const [satellites, setSatellites] = useState([]);
  const readerRef = useRef(null);
  const portRef = useRef(null);
  const gsvChunksRef = useRef([]);

  useEffect(() => {
    setSupported(typeof navigator !== 'undefined' && 'serial' in navigator);
  }, []);

  const processLine = useCallback((line) => {
    const parsed = parseNmeaLine(line);
    if (!parsed) return;
    if (parsed.type === 'GGA') setGga(parsed);
    if (parsed.type === 'GSV') {
      gsvChunksRef.current.push(parsed);
      if (parsed.msgNum === parsed.totalMsgs) {
        setSatellites(mergeGsvSatellites(gsvChunksRef.current));
        gsvChunksRef.current = [];
      }
    }
  }, []);

  const readLoop = useCallback(async (port) => {
    const textDecoder = new TextDecoderStream();
    const reader = port.readable.pipeThrough(textDecoder).getReader();
    readerRef.current = reader;
    let buffer = '';
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += value;
        const lines = buffer.split(/\r?\n/);
        buffer = lines.pop() || '';
        lines.forEach((line) => {
          if (line.startsWith('$')) processLine(line);
        });
      }
    } catch {
      /* disconnect */
    }
  }, [processLine]);

  const connect = useCallback(async () => {
    setError('');
    try {
      const port = await navigator.serial.requestPort();
      await port.open({ baudRate: 115200 });
      portRef.current = port;
      setConnected(true);
      readLoop(port);
    } catch (e) {
      if (e.name !== 'NotFoundError') setError(e.message);
    }
  }, [readLoop]);

  const disconnect = useCallback(async () => {
    try {
      await readerRef.current?.cancel();
      await portRef.current?.close();
    } catch {
      /* ignore */
    }
    readerRef.current = null;
    portRef.current = null;
    setConnected(false);
  }, []);

  useEffect(() => () => {
    disconnect();
  }, [disconnect]);

  return { supported, connected, error, setError, gga, satellites, connect, disconnect };
}
