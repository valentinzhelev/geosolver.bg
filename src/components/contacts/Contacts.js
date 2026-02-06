import React, { useState } from 'react';
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
      const res = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(data.message);
        setFormData({ email: '', title: '', content: '' });
      } else {
        setError(data.message || t.errorOccurred);
      }
    } catch {
      setError(t.errorSending);
    }
    setLoading(false);
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
      <div className="w-full min-h-screen bg-stone-50">
        {/* Main Content Container */}
        <div className="w-full max-w-[1180px] mx-auto px-4 lg:px-6 pt-6 lg:pt-6 pb-6 flex flex-col gap-10 lg:gap-20">
          {/* Contact Form Section */}
          <div className="flex flex-col gap-6 lg:gap-10">
            <div className="text-black text-2xl lg:text-3xl font-bold font-['Manrope']">{t.contactsTitle}</div>
            
            {/* Contact Form Container */}
            <div className="w-full p-3 lg:p-4 bg-white rounded-xl lg:rounded-xl outline outline-1 outline-offset-[-0.50px] lg:outline-offset-[-1px] outline-gray-200 flex flex-col lg:flex-row gap-3 lg:gap-6">
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
                <div className="text-center text-neutral-400 text-xs lg:text-sm font-medium font-['Manrope']">
                  <span className="block lg:inline">{t.contactIntro}</span>
                  <span className="block lg:inline">help@geosolver.bg</span>
                </div>
              </div>

              {/* Form Fields - Mobile: Below icons, Desktop: Left side */}
              <div className="flex flex-col gap-4 w-full lg:w-auto lg:order-1">
                <div className="w-full lg:w-[464px] flex flex-col gap-2">
                  <div className="text-black text-sm font-medium font-['Manrope']">{t.emailLabel}</div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 text-neutral-400 text-sm font-medium font-['Manrope']"
                    placeholder={t.emailLabel}
                    required
                  />
                </div>
                <div className="w-full lg:w-[464px] flex flex-col gap-2">
                  <div className="text-black text-sm font-medium font-['Manrope']">{t.titleLabel}</div>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 text-neutral-400 text-sm font-medium font-['Manrope']"
                    placeholder={t.titleLabel}
                    required
                  />
                </div>
                <div className="w-full lg:w-[464px] flex flex-col gap-2">
                  <div className="text-black text-sm font-medium font-['Manrope']">{t.contentLabel}</div>
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    className="w-full h-24 p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 text-neutral-400 text-sm font-medium font-['Manrope'] resize-none"
                    placeholder={t.contentLabel}
                    required
                  />
                </div>
                <button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-4 py-2 bg-black rounded-lg inline-flex justify-start items-center gap-3 disabled:opacity-50 w-fit"
                >
                  <div className="text-white text-base font-medium font-['Manrope']">
                    {loading ? t.sending : t.send}
                  </div>
                </button>
              </div>
            </div>

            {/* Status Messages */}
            {success && <div className="text-green-600 text-sm mt-2">{success}</div>}
            {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
          </div>

          {/* FAQ Section */}
          <div className="flex flex-col gap-10">
            <div className="w-full p-3 lg:p-6 bg-white rounded-2xl lg:rounded-3xl shadow-[0px_8px_24px_0px_rgba(0,0,0,0.04)] outline outline-1 outline-offset-[-1px] outline-gray-200 flex flex-col gap-3 lg:gap-6">
              <div className="text-black text-lg lg:text-3xl font-bold font-['Manrope'] text-center lg:text-left">{t.faqTitle}</div>
              
              {/* FAQ Grid - Mobile: Single column, Desktop: 3 columns */}
              <div className="w-full flex flex-col lg:flex-row justify-start items-start gap-3 lg:gap-5">
                {/* Column 1 */}
                <div className="flex-1 flex flex-col gap-3 lg:gap-5">
                  <div className="w-full p-4 bg-white rounded-xl shadow-[0px_8px_24px_0px_rgba(0,0,0,0.04)] outline outline-1 outline-offset-[-1px] outline-gray-200 flex flex-col gap-3">
                    <div className="text-black text-sm lg:text-base font-semibold font-['Manrope']">{faqs[0].question}</div>
                    <div className="text-neutral-400 text-xs lg:text-sm font-medium font-['Manrope']">{faqs[0].answer}</div>
                  </div>
                  <div className="w-full p-4 bg-white rounded-xl shadow-[0px_8px_24px_0px_rgba(0,0,0,0.04)] outline outline-1 outline-offset-[-1px] outline-gray-200 flex flex-col gap-3">
                    <div className="text-black text-sm lg:text-base font-semibold font-['Manrope']">{faqs[1].question}</div>
                    <div className="text-neutral-400 text-xs lg:text-sm font-medium font-['Manrope']">{faqs[1].answer}</div>
                  </div>
                </div>

                {/* Column 2 */}
                <div className="flex-1 flex flex-col gap-3 lg:gap-5">
                  <div className="w-full p-4 bg-white rounded-xl shadow-[0px_8px_24px_0px_rgba(0,0,0,0.04)] outline outline-1 outline-offset-[-1px] outline-gray-200 flex flex-col gap-3">
                    <div className="text-black text-sm lg:text-base font-semibold font-['Manrope']">{faqs[2].question}</div>
                    <div className="text-neutral-400 text-xs lg:text-sm font-medium font-['Manrope']">{faqs[2].answer}</div>
                  </div>
                  <div className="w-full p-4 bg-white rounded-xl shadow-[0px_8px_24px_0px_rgba(0,0,0,0.04)] outline outline-1 outline-offset-[-1px] outline-gray-200 flex flex-col gap-3">
                    <div className="text-black text-sm lg:text-base font-semibold font-['Manrope']">{faqs[3].question}</div>
                    <div className="text-neutral-400 text-xs lg:text-sm font-medium font-['Manrope']">{faqs[3].answer}</div>
                  </div>
                </div>

                {/* Column 3 */}
                <div className="flex-1 flex flex-col gap-3 lg:gap-5">
                  <div className="w-full p-4 bg-white rounded-xl shadow-[0px_8px_24px_0px_rgba(0,0,0,0.04)] outline outline-1 outline-offset-[-1px] outline-gray-200 flex flex-col gap-3">
                    <div className="text-black text-sm lg:text-base font-semibold font-['Manrope']">{faqs[4].question}</div>
                    <div className="text-neutral-400 text-xs lg:text-sm font-medium font-['Manrope']">{faqs[4].answer}</div>
                  </div>
                  <div className="w-full p-4 bg-white rounded-xl shadow-[0px_8px_24px_0px_rgba(0,0,0,0.04)] outline outline-1 outline-offset-[-1px] outline-gray-200 flex flex-col gap-3">
                    <div className="text-black text-sm lg:text-base font-semibold font-['Manrope']">{faqs[5].question}</div>
                    <div className="text-neutral-400 text-xs lg:text-sm font-medium font-['Manrope']">{faqs[5].answer}</div>
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