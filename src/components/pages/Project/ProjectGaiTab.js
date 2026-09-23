import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { gaiApi } from '../../../services/gaiApi';

const STARTER_QUESTIONS_BG = [
  'Обобщи проекта',
  'Кои данни чакат проверка?',
  'Обясни последния полигонов ход',
  'Как е получена точка 201?',
];
const STARTER_QUESTIONS_EN = [
  'Summarize the project',
  'Which data is awaiting review?',
  'Explain the latest traverse run',
  'How was point 201 obtained?',
];

/** Evidence kind -> the real Project workspace tab it should navigate to (never a dead link - V1 section 20). */
const EVIDENCE_TAB = {
  surveyPoint: 'points',
  captureJob: 'field-data',
  fieldObservationSet: 'field-data',
  processingRun: 'processing',
  report: 'documents',
};

function fmtTime(iso, bg) {
  try {
    return new Date(iso).toLocaleString(bg ? 'bg-BG' : 'en-US', { dateStyle: 'short', timeStyle: 'short' });
  } catch {
    return '';
  }
}

const EvidenceChip = ({ e, projectId, bg }) => {
  const tabId = EVIDENCE_TAB[e.kind];
  const label = e.label || e.kind;
  const chipClass = "px-2 py-0.5 rounded-md text-[11px] font-semibold font-['Manrope'] bg-stone-100 dark:bg-zinc-800 text-neutral-600 dark:text-zinc-300";
  if (!tabId) return <span className={chipClass} data-testid="gai-evidence-chip">{label}</span>;
  return (
    <Link
      to={`/project?projectId=${encodeURIComponent(projectId)}&tab=${tabId}`}
      className={`${chipClass} hover:bg-stone-200 dark:hover:bg-zinc-700 underline`}
      data-testid="gai-evidence-chip"
    >
      {label}
    </Link>
  );
};

/**
 * V1 "GAI": a read-only, project-scoped conversational assistant grounded in the project's own persisted data
 * (points, field data, processing runs, reports). It never calculates or modifies project data itself - it explains
 * and summarizes what the deterministic GeoSolver engines have already produced, citing evidence as source chips.
 */
const ProjectGaiTab = ({ projectId, bg = true }) => {
  const [conversations, setConversations] = useState(null); // null = loading
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [loadingThread, setLoadingThread] = useState(false);

  const loadConversations = useCallback(() => {
    if (!projectId) return undefined;
    let cancelled = false;
    gaiApi.listConversations(projectId)
      .then((data) => { if (!cancelled) setConversations(data || []); })
      .catch((e) => { if (!cancelled) { setError(e.message); setConversations([]); } });
    return () => { cancelled = true; };
  }, [projectId]);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  const openConversation = useCallback((id) => {
    setActiveId(id);
    setLoadingThread(true);
    setError('');
    gaiApi.getConversation(id)
      .then((data) => setMessages((data && data.messages) || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoadingThread(false));
  }, []);

  const startNewConversation = () => {
    setActiveId(null);
    setMessages([]);
    setError('');
  };

  const ask = async (text) => {
    const trimmed = String(text || '').trim();
    if (!trimmed || sending) return;
    setSending(true);
    setError('');
    setMessages((prev) => [...prev, { id: `local-${Date.now()}`, role: 'user', text: trimmed, evidence: [], createdAt: new Date().toISOString() }]);
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
        return [{ id: conversationId, projectId, title: trimmed.slice(0, 80) }, ...rest];
      });
    } catch (e) {
      setError(e.message);
    } finally {
      setSending(false);
    }
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
              className={`text-left px-3 py-2 rounded-lg text-xs font-['Manrope'] truncate ${
                activeId === c.id ? 'bg-black dark:bg-white text-white dark:text-black' : 'bg-white dark:bg-zinc-900 outline outline-1 outline-gray-200 dark:outline-zinc-700'
              }`}
              data-testid="gai-conversation-item"
            >
              {c.title || (bg ? 'Разговор' : 'Conversation')}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-3 min-w-0">
        {error && <div role="alert" className="p-3 rounded-lg bg-red-50 text-red-700 text-sm font-['Manrope']">{error}</div>}

        <div className="flex-1 flex flex-col gap-3 p-3 rounded-xl border border-gray-200 dark:border-zinc-800 min-h-[280px]" data-testid="gai-thread">
          {loadingThread && <p className="text-xs text-neutral-400 font-['Manrope']" role="status">{bg ? 'Зареждане...' : 'Loading...'}</p>}

          {!loadingThread && messages.length === 0 && (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-neutral-500 dark:text-zinc-400 font-['Manrope']">
                {bg
                  ? 'Попитайте GAI за проекта - точки, теренни данни, обработки и отчети. Отговорите се основават само на данните в проекта.'
                  : 'Ask GAI about the project - points, field data, processing and reports. Answers are grounded only in the project\'s own data.'}
              </p>
              <div className="flex flex-wrap gap-2">
                {(bg ? STARTER_QUESTIONS_BG : STARTER_QUESTIONS_EN).map((q) => (
                  <button key={q} type="button" className={ghost} onClick={() => ask(q)} data-testid="gai-starter-question">
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m) => (
            <div key={m.id} className={`flex flex-col gap-1 ${m.role === 'user' ? 'items-end' : 'items-start'}`} data-testid="gai-message">
              <div
                className={`max-w-[85%] px-3 py-2 rounded-xl text-sm font-['Manrope'] whitespace-pre-wrap ${
                  m.role === 'user' ? 'bg-black dark:bg-white text-white dark:text-black' : 'bg-stone-100 dark:bg-zinc-800 text-black dark:text-white'
                }`}
              >
                {m.text}
              </div>
              {m.role === 'assistant' && m.evidence && m.evidence.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {m.evidence.map((e, i) => <EvidenceChip key={`${e.kind}:${e.id || i}`} e={e} projectId={projectId} bg={bg} />)}
                </div>
              )}
              <span className="text-[10px] text-neutral-400 font-['Manrope']">{fmtTime(m.createdAt, bg)}</span>
            </div>
          ))}
          {sending && <p className="text-xs text-neutral-400 font-['Manrope']" role="status">{bg ? 'GAI отговаря...' : 'GAI is answering...'}</p>}
        </div>

        <form
          className="flex gap-2"
          onSubmit={(ev) => { ev.preventDefault(); ask(question); }}
        >
          <input
            type="text"
            value={question}
            onChange={(ev) => setQuestion(ev.target.value)}
            placeholder={bg ? 'Задайте въпрос за проекта...' : 'Ask a question about the project...'}
            className="flex-1 px-3 py-2 rounded-lg text-sm font-['Manrope'] bg-white dark:bg-zinc-900 outline outline-1 outline-gray-200 dark:outline-zinc-700 text-black dark:text-white"
            disabled={sending}
            data-testid="gai-question-input"
          />
          <button type="submit" className={primary} disabled={sending || !question.trim()} data-testid="gai-send">
            {bg ? 'Изпрати' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProjectGaiTab;
