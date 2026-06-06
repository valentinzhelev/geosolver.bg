import * as Sentry from '@sentry/react';

/**
 * Initializes Sentry error monitoring.
 * No-op unless REACT_APP_SENTRY_DSN is set, so local dev stays clean.
 */
export function initSentry() {
  const dsn = process.env.REACT_APP_SENTRY_DSN;
  if (!dsn) return;

  Sentry.init({
    dsn,
    environment: process.env.REACT_APP_ENV || process.env.NODE_ENV || 'production',
    release: process.env.REACT_APP_VERSION || undefined,
    tracesSampleRate: Number(process.env.REACT_APP_SENTRY_TRACES_SAMPLE_RATE || 0.1),
    // Privacy-friendly defaults: no session replay unless explicitly enabled.
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: Number(process.env.REACT_APP_SENTRY_REPLAY_ON_ERROR || 0),
  });
}

export { Sentry };
