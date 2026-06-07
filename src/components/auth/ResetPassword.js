import React, { useState } from 'react';
import API_BASE_URL from '../../config/api';
import {
  getApiLanguageHeaders,
  getAuthClientFallback,
  getNetworkErrorMessage,
} from '../../utils/apiLanguage';
import SEO from '../shared/SEO';
import Layout from '../layout/Layout';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import AuthShell, { authCardClass, authInputClass, authLabelClass } from './AuthShell';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const ResetPassword = () => {
  const { t } = useTranslation();
  const query = useQuery();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const token = query.get('token');
  const invalidLink = !token;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError(t.missingResetToken);
      return;
    }
    if (newPassword !== repeatPassword) {
      setError(t.passwordsDoNotMatch);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: getApiLanguageHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(data.message || getAuthClientFallback('changePassword'));
      }
    } catch {
      setError(getNetworkErrorMessage());
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <SEO
        title={t.resetPasswordTitle}
        description={t.resetPasswordDescription}
        canonical="/reset-password"
      />
      <AuthShell>
        <form
          className="w-full"
          onSubmit={invalidLink || success ? (e) => e.preventDefault() : handleSubmit}
        >
          <div className={`${authCardClass} flex flex-col gap-5`}>
            {invalidLink ? (
              <>
                <div className="w-full flex flex-col gap-1.5">
                  <h1 className="text-black dark:text-white text-base font-semibold font-['Manrope']">
                    {t.resetPasswordTitle}
                  </h1>
                  <p className="text-red-500 dark:text-red-400 text-sm font-medium font-['Manrope']">
                    {t.invalidResetToken}
                  </p>
                </div>
                <Link
                  to="/forgot-password"
                  className="w-full px-4 py-2 bg-black dark:bg-white rounded-lg flex justify-center items-center text-white dark:text-black text-sm font-medium font-['Manrope'] hover:opacity-90 transition-opacity"
                >
                  {t.requestNewResetLink}
                </Link>
                <p className="w-full text-center">
                  <Link
                    to="/login"
                    className="text-neutral-400 dark:text-zinc-400 text-sm font-medium font-['Manrope'] hover:text-black dark:hover:text-white underline"
                  >
                    {t.backToLogin}
                  </Link>
                </p>
              </>
            ) : success ? (
              <div className="w-full flex flex-col gap-2 text-center">
                <h1 className="text-black dark:text-white text-base font-semibold font-['Manrope']">
                  {t.passwordChangedSuccess}
                </h1>
                <p className="text-neutral-500 dark:text-zinc-400 text-sm font-medium font-['Manrope']">
                  {t.redirectingToLogin}
                </p>
              </div>
            ) : (
              <>
                <div className="w-full flex flex-col gap-1.5">
                  <h1 className="text-black dark:text-white text-base font-semibold font-['Manrope']">
                    {t.resetPasswordTitle}
                  </h1>
                  <p className="text-neutral-500 dark:text-zinc-400 text-sm font-medium font-['Manrope']">
                    {t.resetPasswordHint}
                  </p>
                </div>

                <div className="w-full flex flex-col gap-3.5">
                  <label className="w-full flex flex-col gap-1.5">
                    <span className={authLabelClass}>{t.resetNewPassword}</span>
                    <input
                      type="password"
                      className={authInputClass}
                      placeholder={t.resetNewPassword}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      autoComplete="new-password"
                    />
                  </label>

                  <label className="w-full flex flex-col gap-1.5">
                    <span className={authLabelClass}>{t.resetConfirmPassword}</span>
                    <input
                      type="password"
                      className={authInputClass}
                      placeholder={t.resetConfirmPassword}
                      value={repeatPassword}
                      onChange={(e) => setRepeatPassword(e.target.value)}
                      required
                      autoComplete="new-password"
                    />
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-black dark:bg-white rounded-lg text-white dark:text-black text-sm font-medium font-['Manrope'] hover:opacity-90 transition-opacity disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? t.savingPassword : t.confirmBtn}
                </button>

                {error && (
                  <p className="w-full text-red-500 dark:text-red-400 text-sm font-medium font-['Manrope']">
                    {error}
                  </p>
                )}

                <p className="w-full text-center">
                  <Link
                    to="/login"
                    className="text-neutral-400 dark:text-zinc-400 text-sm font-medium font-['Manrope'] hover:text-black dark:hover:text-white underline"
                  >
                    {t.backToLogin}
                  </Link>
                </p>
              </>
            )}
          </div>
        </form>
      </AuthShell>
    </Layout>
  );
};

export default ResetPassword;
