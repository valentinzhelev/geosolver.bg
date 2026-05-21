import React, { useState, useEffect, useCallback, useRef } from 'react';
import SEO from '../shared/SEO';
import Layout from '../layout/Layout';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useTranslation } from '../../hooks/useTranslation';

const RememberMeCheckbox = ({ checked, onChange, label }) => (
  <label className="relative flex items-center gap-3 cursor-pointer select-none">
    <input
      type="checkbox"
      className="absolute w-px h-px p-0 opacity-0 overflow-hidden"
      checked={checked}
      onChange={onChange}
    />
    <span
      className={`w-6 h-6 shrink-0 rounded-[4px] border bg-white dark:bg-zinc-900 flex items-center justify-center transition-colors ${
        checked
          ? 'border-gray-300 dark:border-zinc-500'
          : 'border-gray-200 dark:border-zinc-600'
      }`}
      aria-hidden
    >
      {checked && (
        <svg width="12" height="10" viewBox="0 0 12 10" fill="none" aria-hidden>
          <path
            d="M1 5.2 4.2 8.2 11 1.2"
            stroke="currentColor"
            strokeWidth="1.15"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-black dark:text-white"
          />
        </svg>
      )}
    </span>
    <span className="text-black dark:text-white text-sm font-medium font-['Manrope']">{label}</span>
  </label>
);

const GoogleGIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
    <path
      fill="#4285F4"
      d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.91c1.7-1.57 2.68-3.88 2.68-6.62z"
    />
    <path
      fill="#34A853"
      d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.91-2.26c-.81.55-1.86.88-3.05.88-2.35 0-4.34-1.59-5.05-3.72H.96v2.33A8.996 8.996 0 0 0 9 18z"
    />
    <path
      fill="#FBBC05"
      d="M3.95 10.72A5.41 5.41 0 0 1 3.68 9c0-.59.1-1.16.27-1.72V4.95H.96A8.996 8.996 0 0 0 0 9c0 1.45.35 2.82.96 4.05l3.99-2.33z"
    />
    <path
      fill="#EA4335"
      d="M9 3.58c1.32 0 2.5.45 3.43 1.33l2.57-2.57C13.47.89 11.43 0 9 0 5.48 0 2.17 2.13.96 5.22L4.95 7.55C5.66 5.42 7.65 3.58 9 3.58z"
    />
  </svg>
);

const Login = () => {
  const { t } = useTranslation();
  const { login, loginWithGoogle, loading, error, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [success, setSuccess] = useState(false);
  const loginSuccessRef = useRef(false);

  const handleGoogleSignIn = useCallback(
    async (response) => {
      if (!response?.credential) return;

      try {
        const ok = await loginWithGoogle(response, rememberMe);
        if (ok) {
          setSuccess(true);
          loginSuccessRef.current = true;
          setTimeout(() => navigate('/account', { replace: true }), 500);
        } else {
          loginSuccessRef.current = false;
        }
      } catch {
        loginSuccessRef.current = false;
      }
    },
    [loginWithGoogle, rememberMe, navigate]
  );

  useEffect(() => {
    const initGoogleOAuth = () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
          callback: handleGoogleSignIn,
          auto_select: false,
          cancel_on_tap_outside: true,
        });
      } else {
        setTimeout(initGoogleOAuth, 100);
      }
    };
    initGoogleOAuth();
  }, [handleGoogleSignIn]);

  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 50;

    const initHiddenGoogleButton = () => {
      const container = document.getElementById('google-signin-button-hidden');
      if (!container) return;

      if (window.google?.accounts?.id) {
        container.innerHTML = '';
        try {
          window.google.accounts.id.renderButton(container, {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            text: 'signin_with',
            shape: 'rectangular',
            logo_alignment: 'left',
            callback: handleGoogleSignIn,
          });
        } catch (err) {
          console.error('Google button render error:', err);
        }
      } else if (retryCount < maxRetries) {
        retryCount += 1;
        setTimeout(initHiddenGoogleButton, 100);
      }
    };

    setTimeout(initHiddenGoogleButton, 100);
  }, [handleGoogleSignIn]);

  useEffect(() => {
    if (user && loginSuccessRef.current) {
      loginSuccessRef.current = false;
      navigate('/account', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const ok = await login(email, password, rememberMe);
    if (ok) {
      setSuccess(true);
      setTimeout(() => navigate('/account', { replace: true }), 1000);
    }
  };

  const handleCustomGoogleClick = () => {
    const hiddenBtn = document.querySelector('#google-signin-button-hidden [role="button"]');
    if (hiddenBtn) {
      hiddenBtn.click();
    }
  };

  const cardClass =
    'w-full p-4 md:p-5 bg-white dark:bg-zinc-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-700 transition-colors';
  const inputClass =
    "w-full p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-600 bg-white dark:bg-zinc-800 text-black dark:text-zinc-100 placeholder-neutral-400 dark:placeholder-zinc-500 text-sm font-medium font-['Manrope']";
  const labelClass =
    "text-black dark:text-white text-sm font-medium font-['Manrope']";

  return (
    <Layout>
      <SEO title={t.loginTitle} description={t.loginDescription} canonical="/login" />

      <div className="w-full min-h-screen bg-stone-50 dark:bg-zinc-950 transition-colors">
        <div className="container mx-auto px-4 py-8 md:py-10">
          <div className="max-w-[480px] sm:max-w-[540px] w-full mx-auto flex flex-col gap-4 md:gap-5">
            <div className="w-full px-6 md:px-10 py-5 md:py-7 relative bg-black dark:bg-zinc-900 rounded-xl flex justify-center items-center overflow-hidden border border-transparent dark:border-zinc-800 min-h-[4.5rem] md:min-h-[5.25rem]">
              <img
                className="absolute inset-0 w-full h-full object-cover rotate-180 opacity-80"
                src="/images/gradient_wallpaper.jpg"
                alt=""
              />
              <div className="relative z-10 flex flex-row items-center justify-center gap-2.5 md:gap-3">
                <span className="text-white text-base md:text-lg font-semibold font-['Manrope']">
                  {t.welcomeTo}
                </span>
                <span className="flex items-center gap-2">
                  <img src="/icons/white_logo.svg" alt="" className="w-8 h-8 md:w-9 md:h-9" />
                  <span className="text-white text-base md:text-lg font-bold font-['Manrope']">
                    GeoSolver
                  </span>
                </span>
              </div>
            </div>

            <div className="w-full flex flex-col items-center gap-2.5">
              <form className="w-full" onSubmit={handleSubmit}>
                <div className={`${cardClass} flex flex-col gap-5`}>
                  <div className="w-full flex flex-col gap-3.5">
                    <label className="w-full flex flex-col gap-1.5">
                      <span className={labelClass}>{t.email}</span>
                      <input
                        type="email"
                        placeholder={t.email}
                        className={inputClass}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                      />
                    </label>
                    <label className="w-full flex flex-col gap-1.5">
                      <span className={labelClass}>{t.password}</span>
                      <input
                        type="password"
                        placeholder={t.password}
                        className={inputClass}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete="current-password"
                      />
                    </label>
                  </div>

                  <div className="w-full flex flex-wrap items-center justify-between gap-3">
                    <RememberMeCheckbox
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      label={t.rememberMe}
                    />
                    <div className="flex items-center gap-3 ml-auto">
                      <Link
                        to="/forgot-password"
                        className="text-neutral-400 dark:text-zinc-400 text-sm font-medium font-['Manrope'] hover:text-black dark:hover:text-white whitespace-nowrap"
                      >
                        {t.forgotPassword}
                      </Link>
                      <button
                        type="submit"
                        disabled={loading}
                        className="shrink-0 px-4 py-2 bg-black dark:bg-white rounded-lg text-white dark:text-black text-sm font-medium font-['Manrope'] hover:opacity-90 transition-opacity disabled:opacity-50"
                      >
                        {loading ? t.loggingIn : t.login}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <p className="w-full text-red-500 dark:text-red-400 text-sm font-medium font-['Manrope']">
                      {error}
                    </p>
                  )}
                  {success && (
                    <p className="w-full text-green-600 dark:text-green-400 text-sm font-medium font-['Manrope']">
                      {t.successLogin}
                    </p>
                  )}
                </div>
              </form>

              <p className="text-neutral-400 dark:text-zinc-400 text-sm font-medium font-['Manrope']">
                {t.or}
              </p>

              <div className={`${cardClass} flex flex-row gap-2.5`}>
                <button
                  type="button"
                  onClick={handleCustomGoogleClick}
                  disabled={loading}
                  className="flex-1 min-h-[40px] px-3 py-2 bg-stone-100 dark:bg-zinc-800 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-600 flex justify-center items-center gap-2 text-black dark:text-white text-sm font-medium font-['Manrope'] hover:bg-stone-200/80 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50"
                >
                  <GoogleGIcon />
                  {t.loginWithGoogle}
                </button>
                <Link
                  to="/register"
                  className="flex-1 min-h-[40px] px-3 py-2 bg-black dark:bg-white rounded-lg flex justify-center items-center text-white dark:text-black text-sm font-medium font-['Manrope'] hover:opacity-90 transition-opacity"
                >
                  {t.register}
                </Link>
              </div>

              <div
                id="google-signin-button-hidden"
                className="fixed left-[-9999px] top-0 w-px h-px overflow-hidden opacity-0"
                aria-hidden
              />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Login;
