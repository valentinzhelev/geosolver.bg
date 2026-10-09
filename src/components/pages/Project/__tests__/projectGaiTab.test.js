import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import ProjectGaiTab from '../ProjectGaiTab';
import { gaiApi } from '../../../../services/gaiApi';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

// react-router-dom (v7) does not resolve under this Jest setup; the tab only needs Link (see Login.google.test.js).
jest.mock('react-router-dom', () => ({ Link: ({ to, children, ...rest }) => <a href={to} {...rest}>{children}</a> }), { virtual: true });

jest.mock('../../../../services/gaiApi', () => ({
  gaiApi: { createConversation: jest.fn(), listConversations: jest.fn(), getConversation: jest.fn(), sendMessage: jest.fn(), getStarters: jest.fn() },
}));

const conversation = (overrides = {}) => ({ id: 'conv1', projectId: 'proj1', title: 'Обобщи проекта', createdAt: '2026-09-23T09:00:00Z', updatedAt: '2026-09-23T09:00:00Z', ...overrides });
const assistantMessage = (overrides = {}) => ({
  id: 'msg2', role: 'assistant', text: 'Проектът има 3 точки.',
  evidence: [{ kind: 'project', id: 'proj1', label: 'Обект Витоша' }, { kind: 'surveyPoint', id: 'p201', label: '201' }],
  model: 'fixture-model', promptVersion: 'gai-v1.0', createdAt: '2026-09-23T09:00:05Z', ...overrides,
});

const STARTERS = ['Обобщи проекта', 'Кои данни чакат проверка?', 'Как е получена точка 201?'];
beforeEach(() => { gaiApi.getStarters.mockResolvedValue(STARTERS); });

let root;
let container;
async function mount() {
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
  await act(async () => root.render(<ProjectGaiTab projectId="proj1" bg />));
}
afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  jest.clearAllMocks();
});

const q = (testid) => container.querySelector(`[data-testid="${testid}"]`);
const qa = (testid) => [...container.querySelectorAll(`[data-testid="${testid}"]`)];
const click = (el) => act(async () => { el.click(); });
const type = (el, value) => act(async () => {
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
  setter.call(el, value);
  el.dispatchEvent(new Event('input', { bubbles: true }));
});
const flush = () => act(async () => { await Promise.resolve(); await Promise.resolve(); });

describe('ProjectGaiTab: conversation list and starter state', () => {
  it('shows an empty conversation list and starter questions when nothing exists yet', async () => {
    gaiApi.listConversations.mockResolvedValue([]);
    await mount();
    await flush();
    expect(gaiApi.listConversations).toHaveBeenCalledWith('proj1');
    expect(qa('gai-starter-question').length).toBeGreaterThan(0);
  });

  it('lists existing conversations and opens one on click', async () => {
    gaiApi.listConversations.mockResolvedValue([conversation()]);
    gaiApi.getConversation.mockResolvedValue({ conversation: conversation(), messages: [{ id: 'msg1', role: 'user', text: 'Обобщи проекта', evidence: [], createdAt: '2026-09-23T09:00:00Z' }, assistantMessage()] });
    await mount();
    await flush();
    expect(qa('gai-conversation-item')).toHaveLength(1);
    await click(q('gai-conversation-item'));
    await flush();
    expect(gaiApi.getConversation).toHaveBeenCalledWith('conv1');
    expect(qa('gai-message')).toHaveLength(2);
  });
});

describe('ProjectGaiTab: asking a question', () => {
  it('a starter question creates a conversation, sends the message, and renders the grounded reply with evidence chips', async () => {
    gaiApi.listConversations.mockResolvedValue([]);
    gaiApi.createConversation.mockResolvedValue(conversation());
    gaiApi.sendMessage.mockResolvedValue({ message: assistantMessage(), evidence: assistantMessage().evidence });
    await mount();
    await flush();

    await click(q('gai-starter-question'));
    await flush();

    expect(gaiApi.createConversation).toHaveBeenCalledWith('proj1');
    expect(gaiApi.sendMessage).toHaveBeenCalledWith('conv1', 'Обобщи проекта');
    expect(qa('gai-message')).toHaveLength(2); // the optimistic user turn + the assistant reply
    const chips = qa('gai-evidence-chip');
    expect(chips.length).toBe(2);
    expect(chips[1].getAttribute('href')).toBe('/project?projectId=proj1&tab=points');
  });

  it('typing a question and pressing Send reuses the active conversation id, never re-creating it', async () => {
    gaiApi.listConversations.mockResolvedValue([conversation()]);
    gaiApi.getConversation.mockResolvedValue({ conversation: conversation(), messages: [] });
    gaiApi.sendMessage.mockResolvedValue({ message: assistantMessage({ id: 'msg3' }), evidence: [] });
    await mount();
    await flush();
    await click(q('gai-conversation-item'));
    await flush();

    await type(q('gai-question-input'), 'Има ли OPEN полигонови ходове?');
    await click(q('gai-send'));
    await flush();

    expect(gaiApi.createConversation).not.toHaveBeenCalled();
    expect(gaiApi.sendMessage).toHaveBeenCalledWith('conv1', 'Има ли OPEN полигонови ходове?');
  });

  it('a failed send keeps the question visible as failed, with a safe message and a retry action', async () => {
    gaiApi.listConversations.mockResolvedValue([]);
    gaiApi.createConversation.mockResolvedValue(conversation());
    gaiApi.sendMessage.mockRejectedValue({ status: 504, code: 'PROVIDER_TIMEOUT', message: 'x' });
    await mount();
    await flush();

    await click(q('gai-starter-question'));
    await flush();

    expect(container.querySelector('[role="alert"]').textContent).toBe('Отговорът се забави прекалено дълго. Опитайте отново.');
    expect(qa('gai-message')).toHaveLength(1);
    expect(q('gai-retry')).toBeTruthy();
  });

  it('"New" clears the active conversation so the next question starts a fresh one', async () => {
    gaiApi.listConversations.mockResolvedValue([conversation()]);
    gaiApi.getConversation.mockResolvedValue({ conversation: conversation(), messages: [assistantMessage()] });
    gaiApi.createConversation.mockResolvedValue(conversation({ id: 'conv2' }));
    gaiApi.sendMessage.mockResolvedValue({ message: assistantMessage({ id: 'msg9' }), evidence: [] });
    await mount();
    await flush();
    await click(q('gai-conversation-item'));
    await flush();

    await click(q('gai-new-conversation'));
    await flush();
    expect(q('gai-thread').textContent).not.toContain('Проектът има 3 точки.');

    await click(q('gai-starter-question'));
    await flush();
    expect(gaiApi.createConversation).toHaveBeenCalledWith('proj1');
  });
});

describe('an evidence kind with no real destination tab renders as a plain, non-link chip', () => {
  it('never creates a dead link for e.g. a project-level chip', async () => {
    gaiApi.listConversations.mockResolvedValue([]);
    gaiApi.createConversation.mockResolvedValue(conversation());
    gaiApi.sendMessage.mockResolvedValue({ message: assistantMessage({ evidence: [{ kind: 'project', id: 'proj1', label: 'Обект Витоша' }] }), evidence: [] });
    await mount();
    await flush();
    await click(q('gai-starter-question'));
    await flush();
    const chip = q('gai-evidence-chip');
    expect(chip.tagName).toBe('SPAN');
  });
});

describe('V1.0.2: safe errors, retry, starters, chips, accessibility', () => {
  const sendViaStarter = async () => { await click(q('gai-starter-question')); await flush(); };

  it('the exact production failure (raw OpenAI 429 text in the message) is never rendered', async () => {
    gaiApi.listConversations.mockResolvedValue([]);
    gaiApi.createConversation.mockResolvedValue(conversation());
    gaiApi.sendMessage.mockRejectedValue({ status: 503, code: 'PROVIDER_UNAVAILABLE', message: 'OpenAI 429: {"error":{"message":"You exceeded your current quota, see https://platform.openai.com/account/billing"}}' });
    await mount();
    await flush();
    await sendViaStarter();
    expect(container.querySelector('[role="alert"]').textContent).toBe('Асистентът временно не е достъпен.');
    expect(container.textContent).not.toMatch(/OpenAI|429|billing|quota|\{"error"/);
  });

  it('an unknown error shows generic Bulgarian copy, never its own text; a network failure has its own copy', async () => {
    gaiApi.listConversations.mockResolvedValue([]);
    gaiApi.createConversation.mockResolvedValue(conversation());
    gaiApi.sendMessage.mockRejectedValueOnce(new TypeError('Failed to fetch'));
    await mount();
    await flush();
    await sendViaStarter();
    expect(container.querySelector('[role="alert"]').textContent).toBe('Възникна проблем. Опитайте отново.');

    gaiApi.sendMessage.mockRejectedValueOnce({ status: 0, code: 'NETWORK_ERROR' });
    await click(q('gai-retry'));
    await flush();
    expect(container.querySelector('[role="alert"]').textContent).toBe('Няма връзка със сървъра. Проверете връзката и опитайте отново.');
  });

  it('retry resends the same question in the same conversation and leaves no duplicate or failed bubble', async () => {
    gaiApi.listConversations.mockResolvedValue([]);
    gaiApi.createConversation.mockResolvedValue(conversation());
    gaiApi.sendMessage
      .mockRejectedValueOnce({ status: 503, code: 'PROVIDER_UNAVAILABLE' })
      .mockResolvedValueOnce({ message: assistantMessage(), evidence: [] });
    await mount();
    await flush();
    await sendViaStarter();
    await click(q('gai-retry'));
    await flush();

    expect(gaiApi.createConversation).toHaveBeenCalledTimes(1);
    expect(gaiApi.sendMessage.mock.calls).toEqual([['conv1', 'Обобщи проекта'], ['conv1', 'Обобщи проекта']]);
    const texts = qa('gai-message').map((m) => m.textContent);
    expect(texts).toHaveLength(2);
    expect(texts[0]).toContain('Обобщи проекта');
    expect(texts[1]).toContain('Проектът има 3 точки.');
    expect(q('gai-retry')).toBeNull();
    expect(container.querySelector('[role="alert"]')).toBeNull();
  });

  it('starter questions come from the server (real points only) and fall back without a point question', async () => {
    gaiApi.listConversations.mockResolvedValue([]);
    await mount();
    await flush();
    expect(gaiApi.getStarters).toHaveBeenCalledWith('proj1');
    expect(qa('gai-starter-question').map((b) => b.textContent)).toEqual(STARTERS);

    await act(async () => root.unmount());
    container.remove();
    gaiApi.getStarters.mockRejectedValue({ status: 500, code: 'INTERNAL' });
    await mount();
    await flush();
    expect(qa('gai-starter-question').map((b) => b.textContent)).toEqual(['Обобщи проекта', 'Кои данни чакат проверка?']);
  });

  it('chips use product labels: a legacy bare point label gets "Точка", a missing label never shows the internal kind', async () => {
    gaiApi.listConversations.mockResolvedValue([]);
    gaiApi.createConversation.mockResolvedValue(conversation());
    gaiApi.sendMessage.mockResolvedValue({
      message: assistantMessage({
        evidence: [
          { kind: 'surveyPoint', id: 'p201', label: '201' },
          { kind: 'processingRun', id: 'r1', label: 'Полигонов ход 101 → 107' },
          { kind: 'fieldObservationSet', id: 'f1' },
          { kind: 'calculation', id: 'c1', label: 'Права геодезическа задача' },
        ],
      }),
      evidence: [],
    });
    await mount();
    await flush();
    await sendViaStarter();
    const chips = qa('gai-evidence-chip');
    expect(chips.map((c) => c.textContent)).toEqual(['Точка 201', 'Полигонов ход 101 → 107', 'Потвърдени теренни наблюдения', 'Права геодезическа задача']);
    expect(chips.map((c) => c.getAttribute('href'))).toEqual([
      '/project?projectId=proj1&tab=points',
      '/project?projectId=proj1&tab=processing',
      '/project?projectId=proj1&tab=field-data',
      '/calculations/history?projectId=proj1',
    ]);
  });

  it('accessibility: the input has a label, the send button reports busy state while answering', async () => {
    gaiApi.listConversations.mockResolvedValue([]);
    gaiApi.createConversation.mockResolvedValue(conversation());
    let resolveSend;
    gaiApi.sendMessage.mockImplementation(() => new Promise((r) => { resolveSend = r; }));
    await mount();
    await flush();
    expect(q('gai-question-input').getAttribute('aria-label')).toBe('Въпрос към GAI');
    await sendViaStarter();
    expect(q('gai-send').getAttribute('aria-busy')).toBe('true');
    expect(q('gai-send').textContent).toBe('Изпращане…');
    await act(async () => { resolveSend({ message: assistantMessage(), evidence: [] }); });
    await flush();
    expect(q('gai-send').getAttribute('aria-busy')).toBe('false');
  });

  it('switching the UI to English never leaves Bulgarian server starters on screen', async () => {
    gaiApi.listConversations.mockResolvedValue([]);
    await mount();
    await flush();
    expect(qa('gai-starter-question').map((b) => b.textContent)).toEqual(STARTERS);
    await act(async () => root.render(<ProjectGaiTab projectId="proj1" bg={false} />));
    await flush();
    expect(qa('gai-starter-question').map((b) => b.textContent)).toEqual(['Summarize the project', 'Which data is awaiting review?']);
  });

  it('an untitled conversation is listed as "Нов разговор"', async () => {
    gaiApi.listConversations.mockResolvedValue([conversation({ title: null })]);
    await mount();
    await flush();
    expect(q('gai-conversation-item').textContent).toBe('Нов разговор');
  });
});
