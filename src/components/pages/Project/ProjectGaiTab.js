import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { gaiApi } from '../../../services/gaiApi';
import { gaiErrorMessage, evidenceChipLabel, evidenceHref, FALLBACK_STARTERS } from '../../../utils/gaiView';

function fmtTime(iso, bg) {
  try {
    return new Date(iso).toLocaleString(bg ? 'bg-BG' : 'en-US', { dateStyle: 'short', timeStyle: 'short' });
  } catch {
    return '';
  }
}

const EvidenceChip = ({ e, projectId, bg }) => {
  const href = evidenceHref(e, projectId);
  const label = evidenceChipLabel(e, bg);
  const chipClass = "px-2 py-0.5 rounded-md text-[11px] font-semibold font-['Manrope'] bg-stone-100 dark:bg-zinc-800 text-neutral-600 dark:text-zinc-300";
  if (!href) return <span className={chipClass} data-testid="gai-evidence-chip">{label}</span>;
  return (
    <Link to={href} className={`${chipClass} hover:bg-stone-200 dark:hover:bg-zinc-700 underline`} data-testid="gai-evidence-chip">
      {label}
    </Link>
  );
};

/**
 * V1 "GAI": a read-only, project-scoped conversational assistant grounded in the project's own persisted data
 * (points, field data, processing runs, reports). It never calculates or modifies project data itself - it explains
 * and summarizes what the deterministic GeoSolver engines have already produced, citing evidence as source chips.
 *
 * V1.0.2: errors are always rendered from a safe code -> copy map (gaiView), a failed question stays visible with a
 * "Опитай отново" action (the server persisted nothing, so a retry never duplicates history), starter questions
 * come from the server and only reference points that exist in this project.
 */
const ProjectGaiTab = ({ projectId, bg = true }) => {
  const [conversations, setConversations] = useState(null); // null = loading
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [loadingThread, setLoadingThread] = useState(false);
  const [starters, setStarters] = useState(bg ? null : FALLBACK_STARTERS.en); // null = loading

  useEffect(() => {
    if (!projectId) return undefined;
    let cancelled = false;
    gaiApi.listConversations(projectId)
      .then((data) => { if (!cancelled) setConversations(data || []); })
      .catch((e) => { if (!cancelled) { setError(gaiErrorMessage(e, bg)); setConversations([]); } });
    return () => { cancelled = true; };
  }, [projectId, bg]);

  useEffect(() => {
    if (!projectId || !bg) return undefined;
    let cancelled = false;
    gaiApi.getStarters(projectId)
      .then((data) => { if (!cancelled) setStarters(Array.isArray(data) && data.length ? data : FALLBACK_STARTERS.bg); })
      .catch(() => { if (!cancelled) setStarters(FALLBACK_STARTERS.bg); });
    return () => { cancelled = true; };
  }, [projectId, bg]);

  const openConversation = useCallback((id) => {
    setActiveId(id);
    setLoadingThread(true);
    setError('');
    gaiApi.getConversation(id)
      .then((data) => setMessages((data && data.messages) || []))
      .catch((e) => setError(gaiErrorMessage(e, bg)))
      .finally(() => setLoadingThread(false));
  }, [bg]);

  const startNewConversation = () => {
    setActiveId(null);
    setMessages([]);
    setError('');
  };

  const ask = async (text) => {
    const trimmed = String(text || '').trim();
    if (!trimmed || sending) return;
    const localId = `local-${Date.now()}`;
    setSending(true);
    setError('');
    setMessages((prev) => [...prev, { id: localId, role: 'user', text: trimmed, evidence: [], createdAt: new Date().toISOString() }]);
    setQuestion('');
    try {
      let conversationId = activeId;
      if (!conversationId) {
        const created = await gaiApi.createConversation(projectId);
        conversationId = created.id;
        setActiveId(conversationId);
      }
      const result = await gaiApi.sendMessage(conversationId, trimmed);
      setMessages((prev) => [...prev, result.message]);
      setConversations((prev) => {
        const rest = (prev || []).filter((c) => c.id !== conversationId);
        const existing = (prev || []).find((c) => c.id === conversationId);
        return [{ id: conversationId, projectId, title: (existing && existing.title) || trimmed.slice(0, 80) }, ...rest];
      });
    } catch (e) {
      setError(gaiErrorMessage(e, bg));
      setMessages((prev) => prev.map((m) => (m.id === localId ? { ...m, failed: true } : m)));
    } finally {
      setSending(false);
    }
  };

  const retry = (failedMessage) => {
    setMessages((prev) => prev.filter((m) => m.id !== failedMessage.id));
    ask(failedMessage.text);
  };

  const primary = "px-4 py-2 rounded-lg text-sm font-semibold font-['Manrope'] bg-black dark:bg-white text-white dark:text-black disabled:opacity-40 disabled:cursor-not-allowed";
  const ghost = "px-3 py-1.5 rounded-lg text-xs font-semibold font-['Manrope'] bg-white dark:bg-zinc-900 outline outline-1 outline-gray-200 dark:outline-zinc-700 disabled:opacity-40";

  return (
    <div className="flex flex-col md:flex-row gap-4" data-testid="project-gai-tab">
      <div className="md:w-64 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold font-['Manrope'] text-black dark:text-white">{bg ? 'Разговори' : 'Conversations'}</h2>
          <button type="button" className={ghost} onClick={startNewConversation} data-testid="gai-new-conversation">
            {bg ? 'Нов' : 'New'}
          </button>
        </div>
        {conversations === null && <p className="text-xs text-neutral-400 font-['Manrope']" role="status">{bg ? 'Зареждане...' : 'Loading...'}</p>}
        {conversations && conversations.length === 0 && (
          <p className="text-xs text-neutral-400 font-['Manrope']">{bg ? 'Още няма разговори.' : 'No conversations yet.'}</p>
        )}
        <div className="flex flex-col gap-1">
          {(conversations || []).map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => openConversation(c.id)}
              aria-current={activeId === c.id ? 'true' : undefined}
              className={`text-left px-3 py-2 rounded-lg text-xs font-['Manrope'] truncate ${
                activeId === c.id ? 'bg-black dark:bg-white text-white dark:text-black' : 'bg-white dark:bg-zinc-900 outline outline-1 outline-gray-200 dark:outline-zinc-700'
              }`}
              data-testid="gai-conversation-item"
            >
              {c.title || (bg ? 'Нов разговор' : 'New conversation')}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-3 min-w-0">
        {error && <div role="alert" className="p-3 rounded-lg bg-red-50 text-red-700 text-sm font-['Manrope']" data-testid="gai-error">{error}</div>}

        <div className="flex-1 flex flex-col gap-3 p-3 rounded-xl border border-gray-200 dark:border-zinc-800 min-h-[280px]" data-testid="gai-thread" aria-live="polite">
          {loadingThread && <p className="text-xs text-neutral-400 font-['Manrope']" role="status">{bg ? 'Зареждане...' : 'Loading...'}</p>}

          {!loadingThread && messages.length === 0 && (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-neutral-500 dark:text-zinc-400 font-['Manrope']">
                {bg
                  ? 'Попитайте GAI за проекта – точки, теренни данни, обработки и отчети. Отговорите се основават само на данните в проекта.'
                  : 'Ask GAI about the project - points, field data, processing and reports. Answers are grounded only in the project\'s own data.'}
              </p>
              {starters && (
                <div className="flex flex-wrap gap-2">
                  {starters.map((s) => (
                    <button key={s} type="button" className={ghost} onClick={() => ask(s)} disabled={sending} data-testid="gai-starter-question">
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {messages.map((m) => (
            <div key={m.id} className={`flex flex-col gap-1 ${m.role === 'user' ? 'items-end' : 'items-start'}`} data-testid="gai-message">
              <div
                className={`max-w-[85%] px-3 py-2 rounded-xl text-sm font-['Manrope'] whitespace-pre-wrap ${
                  m.role === 'user' ? 'bg-black dark:bg-white text-white dark:text-black' : 'bg-stone-100 dark:bg-zinc-800 text-black dark:text-white'
                } ${m.failed ? 'opacity-60' : ''}`}
              >
                {m.text}
              </div>
              {m.role === 'assistant' && m.evidence && m.evidence.length > 0 && (
                <div className="flex flex-wrap gap-1" aria-label={bg ? 'Източници' : 'Sources'}>
                  {m.evidence.map((e, i) => <EvidenceChip key={`${e.kind}:${e.id || i}`} e={e} projectId={projectId} bg={bg} />)}
                </div>
              )}
              {m.failed ? (
                <button type="button" className={ghost} onClick={() => retry(m)} disabled={sending} data-testid="gai-retry">
                  {bg ? 'Опитай отново' : 'Try again'}
                </button>
              ) : (
                <span className="text-[10px] text-neutral-400 font-['Manrope']">{fmtTime(m.createdAt, bg)}</span>
              )}
            </div>
          ))}
          {sending && <p className="text-xs text-neutral-400 font-['Manrope']" role="status">{bg ? 'GAI отговаря...' : 'GAI is answering...'}</p>}
        </div>

        <form className="flex gap-2" onSubmit={(ev) => { ev.preventDefault(); ask(question); }}>
          <input
            type="text"
            value={question}
            onChange={(ev) => setQuestion(ev.target.value)}
            placeholder={bg ? 'Задайте въпрос за проекта...' : 'Ask a question about the project...'}
            aria-label={bg ? 'Въпрос към GAI' : 'Question for GAI'}
            maxLength={2000}
            className="flex-1 px-3 py-2 rounded-lg text-sm font-['Manrope'] bg-white dark:bg-zinc-900 outline outline-1 outline-gray-200 dark:outline-zinc-700 text-black dark:text-white"
            disabled={sending}
            data-testid="gai-question-input"
          />
          <button type="submit" className={primary} disabled={sending || !question.trim()} aria-busy={sending} data-testid="gai-send">
            {sending ? (bg ? 'Изпращане…' : 'Sending…') : (bg ? 'Изпрати' : 'Send')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProjectGaiTab;
