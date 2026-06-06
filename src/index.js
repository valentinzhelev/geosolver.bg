import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import 'typeface-montserrat';
import { initSentry, Sentry } from './config/sentry';

initSentry();

const Fallback = () => (
  <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24, textAlign: 'center', fontFamily: 'Manrope, sans-serif' }}>
    <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>Възникна неочаквана грешка</h1>
    <p style={{ color: '#71717a', margin: 0 }}>Опитайте да презаредите страницата.</p>
    <button
      type="button"
      onClick={() => window.location.reload()}
      style={{ marginTop: 8, padding: '10px 18px', borderRadius: 10, border: 'none', background: '#000', color: '#fff', fontWeight: 600, cursor: 'pointer' }}
    >
      Презареди
    </button>
  </div>
);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Sentry.ErrorBoundary fallback={<Fallback />}>
      <App />
    </Sentry.ErrorBoundary>
  </React.StrictMode>
);
