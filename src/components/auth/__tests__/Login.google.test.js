import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import Login from '../Login';

// QA-03: without a Google client ID the Login page showed TWO "Вход с Google" controls (the disabled placeholder plus
// an always-on decorative skin that looked clickable). Exactly one Google control may be visible in either mode, and
// nothing may look clickable that cannot act.

// react-router-dom (v7) does not resolve under this Jest setup; the page only needs Link / useNavigate / useSearchParams
jest.mock(
  'react-router-dom',
  () => ({
    Link: ({ to, children, ...rest }) => <a href={to} {...rest}>{children}</a>,
    useNavigate: () => () => {},
    useSearchParams: () => [new URLSearchParams('')],
  }),
  { virtual: true }
);
jest.mock('../../shared/SEO', () => () => null);
jest.mock('../../layout/Layout', () => ({ children }) => <div>{children}</div>);
jest.mock('../AuthContext', () => ({
  useAuth: () => ({ login: jest.fn(), loginWithGoogle: jest.fn(), loading: false, error: null, user: null }),
}));
jest.mock('../../../hooks/useTranslation', () => ({
  useTranslation: () => ({
    language: 'bg',
    t: new Proxy({}, { get: (_, key) => (key === 'loginWithGoogle' ? 'Вход с Google' : String(key)) }),
  }),
}));

const ORIGINAL = process.env.REACT_APP_GOOGLE_CLIENT_ID;
afterEach(() => {
  if (ORIGINAL === undefined) delete process.env.REACT_APP_GOOGLE_CLIENT_ID;
  else process.env.REACT_APP_GOOGLE_CLIENT_ID = ORIGINAL;
});

const render = () => renderToStaticMarkup(<Login />);
// VISIBLE occurrences only (text nodes); the invisible real button's aria-label is not a visible control
const count = (html, text) => html.split('>' + text + '<').length - 1;

describe('Login page Google control', () => {
  it('WITHOUT a client ID: exactly one Google control, and it is the disabled one', () => {
    delete process.env.REACT_APP_GOOGLE_CLIENT_ID;
    const html = render();
    expect(count(html, 'Вход с Google')).toBe(1);
    expect(html).toMatch(/<button type="button" disabled=""[^>]*>[\s\S]*?Вход с Google/);
    expect(html).not.toMatch(/pointer-events-none[^>]*text-black/); // no clickable-looking decorative skin
  });

  it('WITH a client ID: exactly one visible control (the decorative skin) over the real, invisible Google button container', () => {
    process.env.REACT_APP_GOOGLE_CLIENT_ID = 'test-client-id.apps.googleusercontent.com';
    const html = render();
    expect(count(html, 'Вход с Google')).toBe(1); // the skin; the real GSI button is injected by Google's script
    expect(html).toContain('opacity-[0.01]'); // the real button container
    expect(html).not.toMatch(/<button type="button" disabled=""/); // no disabled placeholder
  });

  it('the Register link is still rendered next to it', () => {
    delete process.env.REACT_APP_GOOGLE_CLIENT_ID;
    expect(render()).toContain('href="/register"');
  });
});
