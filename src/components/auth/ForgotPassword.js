import React, { useState } from 'react';
import SEO from '../shared/SEO';
import Layout from '../layout/Layout';
import { Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useTranslation } from '../../hooks/useTranslation';
import AuthShell, { authCardClass, authInputClass, authLabelClass } from './AuthShell';

const ForgotPassword = () => {
  const { t } = useTranslation();
  const { forgotPassword, loading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const msg = await forgotPassword(email);
    if (msg) {
      setSuccess(true);
      setMessage(msg);
    }
  };

  return (
    <Layout>
      <SEO
        title={t.forgotPasswordTitle}
        description={t.forgotPasswordDescription}
        canonical="/forgot-password"
      />
      <AuthShell>
        <form className="w-full" onSubmit={success ? (e) => e.preventDefault() : handleSubmit}>
          <div className={`${authCardClass} flex flex-col gap-5`}>
            {success ? (
              <>
                <div className="w-full flex flex-col gap-2">
                  <h1 className="text-black dark:text-white text-base font-semibold font-['Manrope']">
                    {t.forgotPasswordSuccessTitle}
                  </h1>
                  <p className="text-neutral-500 dark:text-zinc-400 text-sm font-medium font-['Manrope'] leading-relaxed">
                    {message || t.forgotPasswordSuccessBody}
                  </p>
                </div>
                <Link
                  to="/login"
                  className="w-full px-4 py-2 bg-black dark:bg-white rounded-lg flex justify-center items-center text-white dark:text-black text-sm font-medium font-['Manrope'] hover:opacity-90 transition-opacity"
                >
                  {t.backToLogin}
                </Link>
              </>
            ) : (
              <>
                <div className="w-full flex flex-col gap-1.5">
                  <h1 className="text-black dark:text-white text-base font-semibold font-['Manrope']">
                    {t.forgotPasswordTitle}
                  </h1>
                  <p className="text-neutral-500 dark:text-zinc-400 text-sm font-medium font-['Manrope']">
                    {t.forgotPasswordHint}
                  </p>
                </div>

                <label className="w-full flex flex-col gap-1.5">
                  <span className={authLabelClass}>{t.email}</span>
                  <input
                    type="email"
                    className={authInputClass}
                    placeholder={t.enterEmail}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </label>

                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-black dark:bg-white rounded-lg text-white dark:text-black text-sm font-medium font-['Manrope'] hover:opacity-90 transition-opacity disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? t.sending : t.sendResetLink}
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

export default ForgotPassword;
