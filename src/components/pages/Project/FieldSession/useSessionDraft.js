import { useCallback, useEffect, useRef, useState } from 'react';
import { fieldSessionsApi } from '../../../../services/fieldSessionsApi';
import { sessionErrorMessage } from '../../../../utils/fieldSessionView';

const META_KEYS = ['title', 'date', 'operator', 'instrument', 'instrumentSerial', 'conditions', 'notes', 'angleUnit'];

const hasDirty = (d) => d.setups || d.meta.size > 0;

const metaOf = (view) => ({
  title: view.customTitle || '', date: view.date || '', operator: view.operator || '', instrument: view.instrument || '',
  instrumentSerial: view.instrumentSerial || '', conditions: view.conditions || '', notes: view.notes || '', angleUnit: view.angleUnit || 'gon',
});

/**
 * One Field Session being viewed and (while it is an unconfirmed manual session) edited.
 *
 * LOCAL state is the source of truth while typing; the server is updated by a debounced, strictly SERIALISED save
 * (never two requests in flight - a slow network cannot reorder or interleave edits). The last server response only
 * supplies the revision token and the authoritative evaluation; it never overwrites what the user typed meanwhile.
 * A failed save leaves every keystroke on screen with a visible "not saved" state and a retry; a revision conflict
 * (another device saved first) stops saving and asks to reload instead of silently overwriting.
 */
export function useSessionDraft({ sessionId, bg = true, autosaveMs = 700 }) {
  const [session, setSession] = useState(null);
  const [setups, setSetupsState] = useState([]);
  const [meta, setMetaState] = useState({});
  const [loadError, setLoadError] = useState('');
  const [saveState, setSaveState] = useState('saved'); // saved | dirty | saving | error | conflict
  const [saveError, setSaveError] = useState('');

  const mounted = useRef(true);
  const timer = useRef(null);
  const inflight = useRef(null);
  const dirty = useRef({ setups: false, meta: new Set() });
  const blocked = useRef(false); // a revision conflict stops saving until the user reloads
  const latest = useRef({ revision: 0, setups: [], meta: {}, editable: false });

  const editable = !!session && !session.confirmed && session.source !== 'capture';
  latest.current.editable = editable;

  const adopt = useCallback((view) => {
    latest.current.revision = view.revision;
    setSession(view);
  }, []);

  const load = useCallback(async () => {
    setLoadError('');
    try {
      const view = await fieldSessionsApi.get(sessionId);
      if (!mounted.current) return;
      adopt(view);
      latest.current.setups = view.setups || [];
      latest.current.meta = metaOf(view);
      setSetupsState(latest.current.setups);
      setMetaState(latest.current.meta);
      dirty.current = { setups: false, meta: new Set() };
      blocked.current = false;
      setSaveState('saved');
      setSaveError('');
    } catch (e) {
      if (mounted.current) setLoadError(sessionErrorMessage(e, bg));
    }
  }, [sessionId, bg, adopt]);

  useEffect(() => { load(); }, [load]);

  const flush = useCallback(async () => {
    if (inflight.current) return inflight.current;
    if (blocked.current || !hasDirty(dirty.current)) return undefined;
    const d = dirty.current;

    const sentSetups = d.setups;
    const sentMeta = [...d.meta];
    const body = { baseRevision: latest.current.revision };
    if (sentSetups) body.setups = latest.current.setups;
    for (const k of sentMeta) body[k] = latest.current.meta[k];
    dirty.current = { setups: false, meta: new Set() };
    setSaveState('saving');

    let failed = false;
    inflight.current = (async () => {
      try {
        const view = await fieldSessionsApi.update(sessionId, body);
        if (!mounted.current) return;
        adopt(view);
        setSaveError('');
        const again = dirty.current.setups || dirty.current.meta.size > 0;
        setSaveState(again ? 'dirty' : 'saved');
      } catch (e) {
        // nothing typed is lost: re-mark what was in flight (merged with anything typed since) and keep it on screen
        dirty.current = { setups: dirty.current.setups || sentSetups, meta: new Set([...dirty.current.meta, ...sentMeta]) };
        if (!mounted.current) return;
        failed = true;
        setSaveError(sessionErrorMessage(e, bg));
        if (e && e.code === 'REVISION_CONFLICT') blocked.current = true;
        setSaveState(e && e.code === 'REVISION_CONFLICT' ? 'conflict' : 'error');
      } finally {
        inflight.current = null;
      }
    })();
    await inflight.current;
    // edits typed while this request was in flight go out next, still strictly one at a time
    if (mounted.current && !failed && hasDirty(dirty.current)) return flush();
    return undefined;
  }, [sessionId, bg, adopt]);

  const schedule = useCallback(() => {
    clearTimeout(timer.current);
    setSaveState((s) => (s === 'conflict' ? s : 'dirty'));
    timer.current = setTimeout(() => { flush(); }, autosaveMs);
  }, [flush, autosaveMs]);

  const editSetups = useCallback((updater) => {
    if (!latest.current.editable) return;
    const next = typeof updater === 'function' ? updater(latest.current.setups) : updater;
    latest.current.setups = next;
    setSetupsState(next);
    dirty.current.setups = true;
    schedule();
  }, [schedule]);

  const editMeta = useCallback((patch) => {
    if (!latest.current.editable) return;
    latest.current.meta = { ...latest.current.meta, ...patch };
    setMetaState(latest.current.meta);
    for (const k of Object.keys(patch)) if (META_KEYS.includes(k)) dirty.current.meta.add(k);
    schedule();
  }, [schedule]);

  /** Resolves once everything typed has reached the server (or rejects with a safe message if it cannot). */
  const ensureSaved = useCallback(async () => {
    clearTimeout(timer.current);
    for (let i = 0; i < 5; i += 1) {
      if (!hasDirty(dirty.current) && !inflight.current) return true;
      if (blocked.current) return false;
      // eslint-disable-next-line no-await-in-loop
      await flush();
    }
    return !hasDirty(dirty.current);
  }, [flush]);

  // Leaving the screen with unsaved edits: send them best-effort (a plain function, so it reads the CURRENT refs -
  // exactly what is wanted here - rather than values captured when the effect ran).
  const saveOnLeave = useCallback(() => {
    if (!latest.current.editable || blocked.current || !hasDirty(dirty.current)) return;
    const body = { baseRevision: latest.current.revision };
    if (dirty.current.setups) body.setups = latest.current.setups;
    for (const k of dirty.current.meta) body[k] = latest.current.meta[k];
    fieldSessionsApi.update(sessionId, body).catch(() => {});
  }, [sessionId]);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      clearTimeout(timer.current);
      saveOnLeave();
    };
  }, [saveOnLeave]);

  return {
    session, setSession: adopt, setups, meta, loadError, saveState, saveError, editable,
    editSetups, editMeta, flush, ensureSaved, reload: load,
  };
}
