import React, { useState } from 'react';
import API_BASE_URL from '../../config/api';
import SEO from '../shared/SEO';
import Layout from '../layout/Layout';
import { useTranslation } from '../../hooks/useTranslation';

const Contacts = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    email: '',
    title: '',
    content: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      const res = await fetch(`${API_BASE_URL}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      let data;
      try {
        data = await res.json();
      } catch {
        throw new Error(res.ok ? 'Invalid response' : `HTTP ${res.status}`);
      }
      if (res.ok) {
        setSuccess(data.message);
        setFormData({ email: '', title: '', content: '' });
      } else {
        setError(data.message || t.errorOccurred);
      }
    } catch (err) {
      const msg = err.name === 'AbortError' ? t.connectionTimeout : (err.message || t.errorSending);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const faqs = t.faqQuestions || [];

  return (
    <Layout>
      <SEO
        title={t.contactsTitle}
        description={t.contactsDescription}
        canonical="/contacts"
      />

      {/* Responsive Layout */}
      <div className="w-full min-h-screen bg-stone-50 dark:bg-zinc-950 transition-colors duration-300">
        {/* Main Content Container */}
        <div className="w-full max-w-[1180px] mx-auto px-4 lg:px-6 pt-6 lg:pt-6 pb-6 flex flex-col gap-10 lg:gap-20">
          {/* Contact Form Section */}
          <div className="flex flex-col gap-6 lg:gap-10">
            <div className="text-black dark:text-white text-2xl lg:text-3xl font-bold font-['Manrope']">{t.contactsTitle}</div>
            
            <div className="w-full p-3 lg:p-4 bg-white dark:bg-zinc-900 rounded-xl lg:rounded-xl outline outline-1 outline-offset-[-0.50px] lg:outline-offset-[-1px] outline-gray-200 dark:outline-zinc-700 flex flex-col lg:flex-row gap-3 lg:gap-6 transition-colors">
              {/* Contact Icons - Mobile: Top, Desktop: Right side */}
              <div className="flex flex-col justify-center items-center gap-3 lg:gap-4 lg:flex-1 lg:order-2">
                {/* Main Contact Icon */}
                <div 
                  className="w-8 h-10 lg:w-12 lg:h-14"
                  style={{
                    WebkitMaskImage: 'url(/icons/contacts_vector.svg)',
                    maskImage: 'url(/icons/contacts_vector.svg)',
                    WebkitMaskRepeat: 'no-repeat',
                    maskRepeat: 'no-repeat',
                    WebkitMaskSize: 'contain',
                    maskSize: 'contain',
                    backgroundImage: 'url(/images/gradient_wallpaper.jpg)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat',
                    display: 'inline-block',
                  }}
                />
                <div className="text-center text-neutral-400 dark:text-zinc-400 text-xs lg:text-sm font-medium font-['Manrope']">
                  <span className="block lg:inline">{t.contactIntro}</span>
                  <span className="block lg:inline">help@geosolver.bg</span>
                </div>
              </div>

              {/* Form Fields - Mobile: Below icons, Desktop: Left side */}
              <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full lg:w-auto lg:order-1">
                <div className="w-full lg:w-[464px] flex flex-col gap-2">
                  <div className="text-black dark:text-white text-sm font-medium font-['Manrope']">{t.emailLabel}</div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-600 bg-white dark:bg-zinc-800 text-black dark:text-zinc-100 placeholder-neutral-400 dark:placeholder-zinc-500 text-sm font-medium font-['Manrope'] transition-colors"
                    placeholder={t.emailLabel}
                    required
                  />
                </div>
                <div className="w-full lg:w-[464px] flex flex-col gap-2">
                  <div className="text-black dark:text-white text-sm font-medium font-['Manrope']">{t.titleLabel}</div>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-600 bg-white dark:bg-zinc-800 text-black dark:text-zinc-100 placeholder-neutral-400 dark:placeholder-zinc-500 text-sm font-medium font-['Manrope'] transition-colors"
                    placeholder={t.titleLabel}
                    required
                  />
                </div>
                <div className="w-full lg:w-[464px] flex flex-col gap-2">
                  <div className="text-black dark:text-white text-sm font-medium font-['Manrope']">{t.contentLabel}</div>
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    className="w-full h-24 p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-600 bg-white dark:bg-zinc-800 text-black dark:text-zinc-100 placeholder-neutral-400 dark:placeholder-zinc-500 text-sm font-medium font-['Manrope'] resize-none transition-colors"
                    placeholder={t.contentLabel}
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-black dark:bg-white rounded-lg inline-flex justify-start items-center gap-3 disabled:opacity-50 w-fit hover:bg-gray-800 dark:hover:bg-zinc-200 transition-colors"
                >
                  <span className="text-white dark:text-black text-base font-medium font-['Manrope']">
                    {loading ? t.sending : t.send}
                  </span>
                </button>
              </form>
            </div>

            {/* Status Messages */}
            {success && <div className="text-green-600 dark:text-green-400 text-sm mt-2">{success}</div>}
            {error && <div className="text-red-600 dark:text-red-400 text-sm mt-2">{error}</div>}
          </div>

          {/* FAQ Section */}
          <div className="flex flex-col gap-10">
            <div className="w-full p-3 lg:p-6 bg-white dark:bg-zinc-900 rounded-2xl lg:rounded-3xl shadow-[0px_8px_24px_0px_rgba(0,0,0,0.04)] dark:shadow-none outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-700 flex flex-col gap-3 lg:gap-6 transition-colors">
              <div className="text-black dark:text-white text-lg lg:text-3xl font-bold font-['Manrope'] text-center lg:text-left">{t.faqTitle}</div>
              <div className="w-full flex flex-col lg:flex-row justify-start items-start gap-3 lg:gap-5">
                <div className="flex-1 flex flex-col gap-3 lg:gap-5">
                  <div className="w-full p-4 bg-white dark:bg-zinc-800/50 rounded-xl shadow-[0px_8px_24px_0px_rgba(0,0,0,0.04)] dark:shadow-none outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-700 flex flex-col gap-3 transition-colors">
                    <div className="text-black dark:text-white text-sm lg:text-base font-semibold font-['Manrope']">{faqs[0].question}</div>
                    <div className="text-neutral-400 dark:text-zinc-400 text-xs lg:text-sm font-medium font-['Manrope']">{faqs[0].answer}</div>
                  </div>
                  <div className="w-full p-4 bg-white dark:bg-zinc-800/50 rounded-xl shadow-[0px_8px_24px_0px_rgba(0,0,0,0.04)] dark:shadow-none outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-700 flex flex-col gap-3 transition-colors">
                    <div className="text-black dark:text-white text-sm lg:text-base font-semibold font-['Manrope']">{faqs[1].question}</div>
                    <div className="text-neutral-400 dark:text-zinc-400 text-xs lg:text-sm font-medium font-['Manrope']">{faqs[1].answer}</div>
                  </div>
                </div>
                <div className="flex-1 flex flex-col gap-3 lg:gap-5">
                  <div className="w-full p-4 bg-white dark:bg-zinc-800/50 rounded-xl shadow-[0px_8px_24px_0px_rgba(0,0,0,0.04)] dark:shadow-none outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-700 flex flex-col gap-3 transition-colors">
                    <div className="text-black dark:text-white text-sm lg:text-base font-semibold font-['Manrope']">{faqs[2].question}</div>
                    <div className="text-neutral-400 dark:text-zinc-400 text-xs lg:text-sm font-medium font-['Manrope']">{faqs[2].answer}</div>
                  </div>
                  <div className="w-full p-4 bg-white dark:bg-zinc-800/50 rounded-xl shadow-[0px_8px_24px_0px_rgba(0,0,0,0.04)] dark:shadow-none outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-700 flex flex-col gap-3 transition-colors">
                    <div className="text-black dark:text-white text-sm lg:text-base font-semibold font-['Manrope']">{faqs[3].question}</div>
                    <div className="text-neutral-400 dark:text-zinc-400 text-xs lg:text-sm font-medium font-['Manrope']">{faqs[3].answer}</div>
                  </div>
                </div>
                <div className="flex-1 flex flex-col gap-3 lg:gap-5">
                  <div className="w-full p-4 bg-white dark:bg-zinc-800/50 rounded-xl shadow-[0px_8px_24px_0px_rgba(0,0,0,0.04)] dark:shadow-none outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-700 flex flex-col gap-3 transition-colors">
                    <div className="text-black dark:text-white text-sm lg:text-base font-semibold font-['Manrope']">{faqs[4].question}</div>
                    <div className="text-neutral-400 dark:text-zinc-400 text-xs lg:text-sm font-medium font-['Manrope']">{faqs[4].answer}</div>
                  </div>
                  <div className="w-full p-4 bg-white dark:bg-zinc-800/50 rounded-xl shadow-[0px_8px_24px_0px_rgba(0,0,0,0.04)] dark:shadow-none outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-700 flex flex-col gap-3 transition-colors">
                    <div className="text-black dark:text-white text-sm lg:text-base font-semibold font-['Manrope']">{faqs[5].question}</div>
                    <div className="text-neutral-400 dark:text-zinc-400 text-xs lg:text-sm font-medium font-['Manrope']">{faqs[5].answer}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Contacts; 