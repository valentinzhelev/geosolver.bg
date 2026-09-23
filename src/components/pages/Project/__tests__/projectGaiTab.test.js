import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import ProjectGaiTab from '../ProjectGaiTab';
import { gaiApi } from '../../../../services/gaiApi';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

// react-router-dom (v7) does not resolve under this Jest setup; the tab only needs Link (see Login.google.test.js).
jest.mock('react-router-dom', () => ({ Link: ({ to, children, ...rest }) => <a href={to} {...rest}>{children}</a> }), { virtual: true });

jest.mock('../../../../services/gaiApi', () => ({
  gaiApi: { createConversation: jest.fn(), listConversations: jest.fn(), getConversation: jest.fn(), sendMessage: jest.fn() },
}));

const conversation = (overrides = {}) => ({ id: 'conv1', projectId: 'proj1', title: 'Обобщи проекта', createdAt: '2026-09-23T09:00:00Z', updatedAt: '2026-09-23T09:00:00Z', ...overrides });
const assistantMessage = (overrides = {}) => ({
  id: 'msg2', role: 'assistant', text: 'Проектът има 3 точки.',
  evidence: [{ kind: 'project', id: 'proj1', label: 'Обект Витоша' }, { kind: 'surveyPoint', id: 'p201', label: '201' }],
  model: 'fixture-model', promptVersion: 'gai-v1.0', createdAt: '2026-09-23T09:00:05Z', ...overrides,
});

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

  it('a failed send surfaces the error without losing the optimistic user message', async () => {
    gaiApi.listConversations.mockResolvedValue([]);
    gaiApi.createConversation.mockResolvedValue(conversation());
    gaiApi.sendMessage.mockRejectedValue({ message: 'Грешка при заявката.' });
    await mount();
    await flush();

    await click(q('gai-starter-question'));
    await flush();

    expect(container.querySelector('[role="alert"]').textContent).toBe('Грешка при заявката.');
    expect(qa('gai-message')).toHaveLength(1);
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
