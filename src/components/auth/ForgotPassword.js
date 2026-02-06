import React, { useState } from 'react';
import SEO from '../shared/SEO';
import Layout from '../layout/Layout';
import { useAuth } from './AuthContext';
import { useTranslation } from '../../hooks/useTranslation';

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
      <div className="w-full min-h-screen bg-stone-50 flex flex-col items-center justify-center">
        <div className="w-[580px] inline-flex flex-col justify-start items-start gap-5">
          <div className="self-stretch px-14 py-10 relative rounded-xl inline-flex justify-center items-center gap-4 overflow-hidden" style={{backgroundColor: '#000'}}>
            <div className="absolute inset-0 w-full h-full" style={{backgroundImage: 'url(/images/gradient_wallpaper.jpg)', backgroundSize: 'cover', backgroundPosition: 'left', transform: 'scaleX(-1)', zIndex: 0}} />
            <div className="absolute inset-0 bg-black opacity-30 pointer-events-none" style={{zIndex: 1}} />
            <div className="relative w-full flex justify-center items-center" style={{zIndex: 2}}>
              <span className="text-center text-white text-2xl font-semibold font-['Manrope']">{t.everyoneMakesMistakes}</span>
            </div>
          </div>
          <div className="self-stretch px-10 flex flex-col justify-center items-center gap-2.5">
            <div className="self-stretch p-4 bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 flex flex-col justify-center items-center gap-6">
              <div className="justify-start text-black text-sm font-medium font-['Manrope']">{t.forgotPasswordTitle}</div>
              {success ? (
                <div className="text-green-600 text-center">{message || t.checkEmail}</div>
              ) : (
                <form className="self-stretch flex flex-col justify-start items-start gap-4" onSubmit={handleSubmit}>
                  <div className="self-stretch flex flex-col justify-start items-start gap-2">
                    <div className="justify-start text-black text-sm font-medium font-['Manrope']">{t.email}</div>
                    <input
                      type="email"
                      className="self-stretch p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 flex flex-col justify-start items-start text-sm font-medium font-['Manrope']"
                      placeholder={t.enterEmail}
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <button 
                    type="submit" 
                    className="px-4 py-2 bg-black rounded-lg inline-flex items-center gap-3 self-center"
                    disabled={loading}
                  >
                    <div className="justify-start text-white text-base font-medium font-['Manrope']">
                      {loading ? t.sending : t.sendCode}
                    </div>
                    {loading && <div className="justify-start text-neutral-400 text-base font-medium font-['Manrope']">59</div>}
                  </button>
                  {error && (
                    <div className="text-red-500 text-center text-sm">{error}</div>
                  )}
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ForgotPassword; 