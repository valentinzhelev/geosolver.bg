import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../layout/Layout';
import SEO from '../shared/SEO';
import { useAuth } from './AuthContext';
import { useTranslation } from '../../hooks/useTranslation';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { useUserPreferences } from '../../hooks/useUserPreferences';

const SECTION_IDS = ['profile', 'appearance', 'security', 'preferences', 'privacy'];

const cardClass =
  'h-full bg-white dark:bg-zinc-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-700 shadow-[0px_8px_24px_0px_rgba(0,0,0,0.04)]';

const inputClass =
  "w-full p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-600 bg-white dark:bg-zinc-800 text-black dark:text-zinc-100 text-sm font-medium font-['Manrope'] placeholder:text-neutral-400 dark:text-zinc-400";

const PillChoice = ({ options, value, onChange }) => (
  <div className="inline-flex rounded-lg bg-stone-100 dark:bg-zinc-800 p-0.5">
    {options.map((opt) => (
      <button
        key={opt.value}
        type="button"
        onClick={() => onChange(opt.value)}
        className={`rounded-md px-3 py-1.5 text-sm font-medium font-['Manrope'] transition-colors ${
          value === opt.value
            ? 'bg-white dark:bg-zinc-900 text-black dark:text-white shadow-sm'
            : 'text-neutral-500 dark:text-zinc-400'
        }`}
      >
        {opt.label}
      </button>
    ))}
  </div>
);

const Panel = ({ id, title, description, children, className = '' }) => (
  <section id={id} className={`scroll-mt-24 ${className}`}>
    <div className={cardClass}>
      <div className="px-5 py-4 border-b border-gray-100 dark:border-zinc-800 dark:border-zinc-800">
        <h2 className="text-lg font-semibold font-['Manrope'] text-black dark:text-white">{title}</h2>
        {description && (
          <p className="mt-1 text-sm font-medium font-['Manrope'] text-neutral-500 dark:text-zinc-400">
            {description}
          </p>
        )}
      </div>
      <div className="p-5">{children}</div>
    </div>
  </section>
);

const AccountSettingsPage = () => {
  const { user, changePassword } = useAuth();
  const { t, language } = useTranslation();
  const { setLanguage } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const { preferences, updatePreference, loading: prefsLoading } = useUserPreferences();

  const copy = t.settingsPanel || {};
  const isBg = language === 'bg';
  const isGoogleAccount = Boolean(user?.googleId);

  const [activeSection, setActiveSection] = useState('profile');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState(null);
  const [passwordSuccess, setPasswordSuccess] = useState(null);

  const sectionLabel = (id) => copy.sections?.[id] || id;

  const roleLabel =
    user?.role === 'admin' ? t.administrator : user?.role === 'teacher' ? t.teacher : t.student;

  const formatMemberSince = (dateStr) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString(isBg ? 'bg-BG' : 'en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return '—';
    }
  };

  useEffect(() => {
    const sections = SECTION_IDS.map((id) => document.getElementById(id)).filter(Boolean);
    if (!sections.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target?.id) setActiveSection(visible.target.id);
      },
      { rootMargin: '-20% 0px -55% 0px', threshold: [0.1, 0.35, 0.6] }
    );

    sections.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActiveSection(id);
  };

  const handleChangePassword = async () => {
    setPasswordError(null);
    setPasswordSuccess(null);
    if (!oldPassword || !newPassword || !confirmPassword) {
      setPasswordError(copy.passwordFillAll);
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError(copy.passwordMismatch);
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError(copy.passwordTooShort);
      return;
    }
    setPasswordSaving(true);
    try {
      const ok = await changePassword(oldPassword, newPassword);
      if (ok) {
        setPasswordSuccess(copy.passwordSuccess);
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setPasswordError(copy.passwordFailed);
      }
    } catch (err) {
      setPasswordError(err.message || copy.passwordFailed);
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleResetCookies = () => {
    localStorage.removeItem('cookieConsent');
    window.location.reload();
  };

  return (
    <Layout>
      <SEO title={copy.title} description={copy.subtitle} canonical="/account/settings" />
      <div className="w-full min-h-screen bg-stone-50 dark:bg-zinc-950 transition-colors">
        <div className="w-full max-w-[1180px] mx-auto px-4 lg:px-6 pt-8 pb-12 flex flex-col gap-6 lg:gap-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <Link
                to="/account"
                className="inline-flex items-center gap-2 text-sm font-medium font-['Manrope'] text-neutral-500 dark:text-zinc-400 hover:text-black dark:hover:text-white mb-3"
              >
                <img src="/icons/small_left_arrow.svg" alt="" className="w-3 h-3 opacity-70 dark:invert" />
                {copy.backToAccount}
              </Link>
              <h1 className="text-2xl lg:text-3xl font-bold font-['Manrope'] text-black dark:text-white">
                {copy.title}
              </h1>
              <p className="mt-1 text-sm text-neutral-500 dark:text-zinc-400 font-['Manrope']">{copy.subtitle}</p>
            </div>
            <div className="hidden sm:flex items-center gap-3 px-4 py-3 bg-white dark:bg-zinc-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-700">
              <div className="w-10 h-10 rounded-full bg-stone-100 dark:bg-zinc-800 flex items-center justify-center text-sm font-bold font-['Manrope'] text-black dark:text-white">
                {(user?.name || user?.email || '?').charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold font-['Manrope'] text-black dark:text-white truncate max-w-[200px]">
                  {user?.name || t.user}
                </p>
                <p className="text-xs text-neutral-500 dark:text-zinc-400 truncate max-w-[220px]">{user?.email}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[220px_minmax(0,1fr)] gap-6 lg:gap-8 items-start">
            <aside className="lg:sticky lg:top-24">
              <nav
                className={`${cardClass} p-2 flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible`}
                aria-label={copy.title}
              >
                {SECTION_IDS.map((id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => scrollToSection(id)}
                    className={`shrink-0 lg:w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium font-['Manrope'] transition-colors ${
                      activeSection === id
                        ? 'bg-black dark:bg-white text-white dark:text-black'
                        : 'text-neutral-600 dark:text-zinc-400 hover:bg-stone-100 dark:hover:bg-zinc-800'
                    }`}
                  >
                    {sectionLabel(id)}
                  </button>
                ))}
              </nav>
            </aside>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5 min-w-0">
              <Panel
                id="profile"
                title={sectionLabel('profile')}
                description={copy.profileDesc}
                className="md:col-span-2"
              >
                <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm font-['Manrope']">
                  <div>
                    <dt className="text-xs text-neutral-500 dark:text-zinc-400">{copy.nameLabel}</dt>
                    <dd className="mt-1 font-medium text-black dark:text-white">{user?.name || '—'}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-neutral-500 dark:text-zinc-400">{copy.roleLabel}</dt>
                    <dd className="mt-1 font-medium text-black dark:text-white">{roleLabel}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-neutral-500 dark:text-zinc-400">{copy.memberSince}</dt>
                    <dd className="mt-1 font-medium text-black dark:text-white">{formatMemberSince(user?.createdAt)}</dd>
                  </div>
                  <div className="sm:col-span-2 lg:col-span-1">
                    <dt className="text-xs text-neutral-500 dark:text-zinc-400">{copy.emailLabel}</dt>
                    <dd className="mt-1 font-medium text-black dark:text-white break-all">{user?.email || '—'}</dd>
                  </div>
                </dl>
                <p className="mt-4 text-xs text-neutral-400 dark:text-zinc-400 font-['Manrope']">{copy.profileHint}</p>
              </Panel>

              <Panel id="appearance" title={sectionLabel('appearance')} description={copy.appearanceDesc}>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <span className="text-sm font-medium font-['Manrope'] text-black dark:text-white">
                      {copy.languageLabel}
                    </span>
                    <PillChoice
                      value={language}
                      onChange={setLanguage}
                      options={[
                        { value: 'bg', label: copy.langBg },
                        { value: 'en', label: copy.langEn },
                      ]}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="text-sm font-medium font-['Manrope'] text-black dark:text-white">
                      {copy.themeLabel}
                    </span>
                    <PillChoice
                      value={isDark ? 'dark' : 'light'}
                      onChange={(v) => {
                        if ((v === 'dark') !== isDark) toggleTheme();
                      }}
                      options={[
                        { value: 'light', label: copy.themeLight },
                        { value: 'dark', label: copy.themeDark },
                      ]}
                    />
                  </div>
                </div>
              </Panel>

              <Panel id="preferences" title={sectionLabel('preferences')} description={copy.preferencesDesc}>
                <label className="flex items-start justify-between gap-4 cursor-pointer">
                  <span>
                    <span className="block text-sm font-medium font-['Manrope'] text-black dark:text-white">
                      {copy.toolsInDevLabel}
                    </span>
                    <span className="block mt-1 text-xs text-neutral-500 dark:text-zinc-400 font-['Manrope'] leading-relaxed">
                      {copy.toolsInDevDesc}
                    </span>
                  </span>
                  <input
                    type="checkbox"
                    className="mt-1 w-5 h-5 shrink-0 rounded border-gray-300 dark:border-zinc-600 accent-black dark:accent-white"
                    checked={Boolean(preferences.showToolsInDevelopment)}
                    onChange={(e) => updatePreference('showToolsInDevelopment', e.target.checked)}
                    disabled={prefsLoading}
                  />
                </label>
              </Panel>

              <Panel
                id="security"
                title={sectionLabel('security')}
                description={copy.securityDesc}
                className="md:col-span-2"
              >
                {isGoogleAccount ? (
                  <p className="text-sm text-neutral-600 dark:text-zinc-400 font-['Manrope'] leading-relaxed max-w-2xl">
                    {copy.googleSignInDesc}
                  </p>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                    <div className="flex flex-col gap-3">
                      {passwordError && <p className="text-xs text-red-600 font-['Manrope']">{passwordError}</p>}
                      {passwordSuccess && (
                        <p className="text-xs text-emerald-700 font-['Manrope']">{passwordSuccess}</p>
                      )}
                      <input
                        type="password"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                        placeholder={copy.currentPassword}
                        className={inputClass}
                        autoComplete="current-password"
                      />
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder={copy.newPassword}
                        className={inputClass}
                        autoComplete="new-password"
                      />
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder={copy.confirmPassword}
                        className={inputClass}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={handleChangePassword}
                        disabled={passwordSaving}
                        className="w-fit px-5 py-2.5 bg-black dark:bg-white rounded-lg text-white dark:text-black text-sm font-medium font-['Manrope'] hover:opacity-90 disabled:opacity-50"
                      >
                        {passwordSaving ? copy.saving : copy.savePassword}
                      </button>
                    </div>
                    <div className="flex flex-col justify-center lg:pl-4 lg:border-l border-gray-100 dark:border-zinc-800">
                      <p className="text-sm text-neutral-600 dark:text-zinc-400 font-['Manrope'] leading-relaxed">
                        {isBg
                          ? 'Използвайте силна парола с поне 6 символа. Не споделяйте паролата си с други лица.'
                          : 'Use a strong password with at least 6 characters. Do not share your password with others.'}
                      </p>
                      <Link
                        to="/forgot-password"
                        className="mt-4 text-sm font-medium font-['Manrope'] text-black dark:text-white underline w-fit"
                      >
                        {copy.forgotPasswordLink}
                      </Link>
                    </div>
                  </div>
                )}
              </Panel>

              <Panel id="privacy" title={sectionLabel('privacy')} description={copy.privacyDesc} className="md:col-span-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Link
                    to="/privacy-policy"
                    className="flex items-center justify-between gap-2 px-4 py-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-700 hover:bg-stone-50 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <span className="text-sm font-medium font-['Manrope'] text-black dark:text-white">
                      {t.privacyPolicy}
                    </span>
                    <img src="/icons/small_right_arrow.svg" alt="" className="w-3 h-3 opacity-50 dark:invert shrink-0" />
                  </Link>
                  <Link
                    to="/terms"
                    className="flex items-center justify-between gap-2 px-4 py-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-700 hover:bg-stone-50 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <span className="text-sm font-medium font-['Manrope'] text-black dark:text-white">{t.terms}</span>
                    <img src="/icons/small_right_arrow.svg" alt="" className="w-3 h-3 opacity-50 dark:invert shrink-0" />
                  </Link>
                  <button
                    type="button"
                    onClick={handleResetCookies}
                    className="flex items-center justify-between gap-2 px-4 py-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-700 hover:bg-stone-50 dark:hover:bg-zinc-800 transition-colors text-left"
                  >
                    <span className="text-sm font-medium font-['Manrope'] text-black dark:text-white">
                      {copy.cookieReset}
                    </span>
                    <img src="/icons/small_right_arrow.svg" alt="" className="w-3 h-3 opacity-50 dark:invert shrink-0" />
                  </button>
                </div>
              </Panel>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AccountSettingsPage;
