import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../../layout/Layout';
import BillingService from '../../../services/billingService';
import SEO from '../../shared/SEO';
import { useTranslation } from '../../../hooks/useTranslation';

const Prices = () => {
  const [tab, setTab] = useState('month');
  const [subscribing, setSubscribing] = useState(false);
  const { language } = useTranslation();
  const navigate = useNavigate();

  const handleSubscribePro = async () => {
    setSubscribing(true);
    try {
      const { url } = await BillingService.createCheckoutSession();
      if (url) window.location.href = url;
    } catch (err) {
      if (err.status === 401) {
        navigate('/login');
      } else {
        alert(err.message);
      }
    } finally {
      setSubscribing(false);
    }
  };

  const faqs = [
    {
      q: language === 'bg' ? 'Как се изчисляват безплатните изчисления?' : 'How are free calculations counted?',
      a: language === 'bg' ? 'Всеки регистриран потребител с безплатен план получава общо 5 изчисления, които се сумират от всички инструменти (напр. 1-ва основна + права засечка + 2-ра основна = 3/5).' : 'Each registered user on the free plan gets 5 calculations total across all tools (e.g. first basic + forward intersection + second basic = 3/5).'
    },
    {
      q: language === 'bg' ? 'Какви видове изчисления поддържа GeoSolver?' : 'What types of calculations does GeoSolver support?',
      a: language === 'bg' ? 'GeoSolver предлага четири основни инструмента: първа и втора основна задача, права и обратна засечка.' : 'GeoSolver offers four core tools: first and second basic tasks, forward and resection intersection.'
    },
    {
      q: language === 'bg' ? 'Какви са начините за плащане?' : 'What are the payment methods?',
      a: language === 'bg' ? 'Приемаме плащания чрез кредитна/дебитна карта и PayPal.' : 'We accept payments via credit/debit card and PayPal.'
    },
    {
      q: language === 'bg' ? 'Сигурни ли са моите данни?' : 'Is my data secure?',
      a: language === 'bg' ? 'Всички данни се съхраняват криптирано и не се споделят с трети страни.' : 'All data is stored encrypted and is not shared with third parties.'
    },
    {
      q: language === 'bg' ? 'Как мога да се абонирам?' : 'How can I subscribe?',
      a: language === 'bg' ? 'Изберете професионален план и следвайте стъпките за плащане. След потвърждение ще имате неограничен достъп.' : 'Choose a professional plan and follow the payment steps. After confirmation, you will have unlimited access.'
    },
    {
      q: language === 'bg' ? 'Има ли мобилна версия на GeoSolver?' : 'Is there a mobile version of GeoSolver?',
      a: language === 'bg' ? 'GeoSolver е направен специално за да се използва на малки устройства.' : 'GeoSolver is specifically designed to be used on small devices.'
    },
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "GeoSolver Professional Plan",
    "description": language === 'bg' 
      ? "Професионален план за неограничени геодезически изчисления"
      : "Professional plan for unlimited geodetic calculations",
    "brand": {
      "@type": "Brand",
      "name": "GeoSolver"
    },
    "offers": [
      {
        "@type": "Offer",
        "name": language === 'bg' ? "Безплатен план" : "Free Plan",
        "price": "0",
        "priceCurrency": "EUR",
        "description": language === 'bg' ? "5 изчисления месечно" : "5 calculations per month",
        "availability": "https://schema.org/InStock"
      },
      {
        "@type": "Offer", 
        "name": language === 'bg' ? "Професионален план" : "Professional Plan",
        "price": "9.99",
        "priceCurrency": "EUR",
        "description": language === 'bg' ? "Неограничени изчисления" : "Unlimited calculations",
        "availability": "https://schema.org/InStock"
      }
    ]
  };

  return (
    <>
      <SEO
        title={language === 'bg' ? 'Цени и Планове' : 'Prices and Plans'}
        description={language === 'bg'
          ? "GeoSolver - Онлайн геодезически калкулатори. Безплатен план с 5 изчисления месечно или професионален абонамент с неограничен достъп и допълнителни функции."
          : "GeoSolver - Online geodetic calculators. Free plan with 5 calculations per month or professional subscription with unlimited access and additional features."
        }
        keywords={language === 'bg'
          ? "геодезия, калкулатори, безплатен план, професионален план, абонамент, изчисления, геодезически инструменти, онлайн калкулатори"
          : "geodesy, calculators, free plan, professional plan, subscription, calculations, geodetic tools, online calculators"
        }
        canonical="/prices"
        structuredData={structuredData}
      />
      <Layout>
        {/* Responsive Layout */}
        <div className="w-full min-h-screen bg-stone-50 dark:bg-zinc-950 transition-colors duration-300">
          {/* Main Content Container */}
          <div className="w-full max-w-[1180px] mx-auto px-4 lg:px-6 pt-6 lg:pt-20 pb-6 flex flex-col gap-10 lg:gap-20">
            {/* Header Section */}
            <div className="flex flex-col gap-4 lg:gap-10">
              {/* Title and Toggle */}
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-4 lg:gap-0">
                <div className="w-full lg:w-[580px] flex flex-col gap-1">
                  <div className="text-black dark:text-white text-2xl lg:text-3xl font-bold font-['Manrope']">
                    {language === 'bg' ? 'Цени и планове' : 'Prices and Plans'}
                  </div>
                  <div className="text-neutral-400 dark:text-zinc-400 text-xs lg:text-base font-semibold font-['Manrope']">
                    {language === 'bg'
                      ? 'Използвайте GeoSolver безплатно с общо 5 изчисления (от всички инструменти) или изберете професионален абонамент за неограничен достъп и допълнителни функции.'
                      : 'Use GeoSolver for free with 5 calculations total across all tools, or choose a professional subscription for unlimited access and additional features.'
                    }
                  </div>
                </div>
                <div className="p-1.5 bg-white dark:bg-zinc-900 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-700 flex justify-start items-center gap-2 transition-colors">
                  <div
                    className={`px-3 py-1 rounded flex justify-center items-center gap-2.5 cursor-pointer transition-colors ${tab === 'month' ? 'bg-gray-200 dark:bg-zinc-700 text-black dark:text-white' : 'text-neutral-400 dark:text-zinc-500'}`}
                    onClick={() => setTab('month')}
                  >
                    <div className="text-sm lg:text-base font-medium font-['Manrope']">
                      {language === 'bg' ? 'Месец' : 'Month'}
                    </div>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-lg flex justify-center items-center gap-2.5 cursor-pointer transition-colors ${tab === 'year' ? 'bg-gray-200 dark:bg-zinc-700 text-black dark:text-white' : 'text-neutral-400 dark:text-zinc-500'}`}
                    onClick={() => setTab('year')}
                  >
                    <div className="text-sm lg:text-base font-medium font-['Manrope']">
                      {language === 'bg' ? 'Година (-20%)' : 'Year (-20%)'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing Cards */}
              <div className="flex flex-row lg:flex-row justify-start lg:justify-center items-center gap-3 lg:gap-5 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
                {/* Free Plan */}
                <div className="w-72 lg:w-auto lg:flex-1 p-3 lg:p-4 bg-white dark:bg-zinc-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-700 flex flex-col justify-center items-center gap-3 lg:gap-4 flex-shrink-0 lg:flex-shrink transition-colors">
                  <div className="flex flex-col justify-start items-center gap-3">
                    <img src="/icons/price_free.svg" alt={language === 'bg' ? "Безплатен план" : "Free Plan"} className="w-5 h-5 lg:w-6 lg:h-6 dark:invert" />
                    <div className="text-black dark:text-white text-base lg:text-lg font-semibold font-['Manrope']">
                      {language === 'bg' ? 'Безплатен план' : 'Free Plan'}
                    </div>
                  </div>
                  <div className="w-full h-0 outline outline-1 outline-offset-[-0.50px] outline-gray-200 dark:outline-zinc-700" />
                  <div className="w-full flex flex-col justify-start items-start gap-2">
                    <div className="w-full px-3 py-2 lg:p-3 bg-stone-50 dark:bg-zinc-800 rounded-lg flex flex-col justify-center items-center transition-colors">
                      <div className="text-black dark:text-zinc-200 text-xs lg:text-sm font-medium font-['Manrope']">
                        {language === 'bg' ? 'Основен достъп до всички инструменти' : 'Basic access to all tools'}
                      </div>
                    </div>
                    <div className="w-full px-3 py-2 lg:p-3 bg-stone-50 dark:bg-zinc-800 rounded-lg flex flex-col justify-center items-center transition-colors">
                      <div className="text-black dark:text-zinc-200 text-xs lg:text-sm font-medium font-['Manrope']">
                        {language === 'bg' ? '5 изчисления общо (всички инструменти)' : '5 calculations total (all tools)'}
                      </div>
                    </div>
                  </div>
                  <div className="w-full flex justify-between items-center">
                    <div className="text-black dark:text-white text-base lg:text-lg font-semibold font-['Manrope']">0.00{language === 'bg' ? '€' : 'EUR'}</div>
                    <Link to="/register" className="px-4 py-2 bg-black dark:bg-white rounded-lg flex justify-start items-center gap-3 hover:bg-gray-800 dark:hover:bg-zinc-200 transition-colors">
                      <span className="text-white dark:text-black text-sm lg:text-base font-medium font-['Manrope']">
                        {language === 'bg' ? 'Регистрация' : 'Register'}
                      </span>
                    </Link>
                  </div>
                </div>

                {/* Pro Plan */}
                <div className="w-72 lg:w-96 p-1 lg:p-2 rounded-[20px] outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-600 flex flex-col justify-start items-start gap-1 flex-shrink-0 lg:flex-shrink transition-colors">
                  <div className="w-full px-4 py-2 relative bg-black rounded-tl-xl rounded-tr-xl rounded-bl rounded-br flex flex-col justify-center items-center gap-4 overflow-hidden">
                    <img 
                      className="w-full h-full absolute inset-0 object-cover opacity-50" 
                      src="/images/gradient_wallpaper.jpg" 
                      alt="" 
                    />
                    <div className="text-center text-white text-sm lg:text-lg font-semibold font-['Manrope'] relative z-10">
                      {language === 'bg' ? 'Препоръчано' : 'Recommended'}
                    </div>
                  </div>
                  <div className="w-full p-3 lg:p-4 bg-white dark:bg-zinc-900 rounded-tl rounded-tr rounded-bl-xl rounded-br-xl shadow-[0px_8px_24px_0px_rgba(0,0,0,0.04)] dark:shadow-none outline outline-1 outline-offset-[-0.50px] lg:outline-offset-[-1px] outline-gray-200 dark:outline-zinc-700 flex flex-col justify-center items-center gap-3 lg:gap-4 overflow-hidden transition-colors">
                    <div className="flex flex-col justify-start items-center gap-3">
                      <img src="/icons/price_logo.svg" alt={language === 'bg' ? "Професионален план" : "Professional Plan"} className="w-4 h-5 lg:w-5 lg:h-6 dark:invert" />
                      <div className="text-black dark:text-white text-base lg:text-lg font-semibold font-['Manrope']">
                        {language === 'bg' ? 'Професионален план' : 'Professional Plan'}
                      </div>
                    </div>
                    <div className="w-full h-0 outline outline-1 outline-offset-[-0.50px] outline-gray-200 dark:outline-zinc-700" />
                    <div className="w-full flex flex-col justify-start items-start gap-2">
                      <div className="w-full px-3 py-2 lg:p-3 bg-stone-50 dark:bg-zinc-800 rounded-lg flex flex-col justify-center items-center transition-colors">
                        <div className="text-black dark:text-zinc-200 text-xs lg:text-sm font-medium font-['Manrope']">
                          {language === 'bg' ? 'Неограничени изчисления' : 'Unlimited calculations'}
                        </div>
                      </div>
                      <div className="w-full px-3 py-2 lg:p-3 bg-stone-50 dark:bg-zinc-800 rounded-lg flex flex-col justify-center items-center transition-colors">
                        <div className="text-black dark:text-zinc-200 text-xs lg:text-sm font-medium font-['Manrope']">
                          {language === 'bg' ? 'Приоритетна поддръжка' : 'Priority support'}
                        </div>
                      </div>
                      <div className="w-full px-3 py-2 lg:p-3 bg-stone-50 dark:bg-zinc-800 rounded-lg flex flex-col justify-center items-center transition-colors">
                        <div className="text-black dark:text-zinc-200 text-xs lg:text-sm font-medium font-['Manrope']">
                          {language === 'bg' ? 'Допълнителни функции' : 'Additional features'}
                        </div>
                      </div>
                    </div>
                    <div className="w-full flex justify-between items-center">
                      <div className="text-black dark:text-white text-base lg:text-lg font-semibold font-['Manrope']">
                        {tab === 'year' ? `95.90${language === 'bg' ? '€/г' : 'EUR/y'}` : `9.99${language === 'bg' ? '€/м' : 'EUR/m'}`}
                      </div>
                      <button
                        onClick={handleSubscribePro}
                        disabled={subscribing}
                        className="px-4 py-2 bg-black dark:bg-white rounded-lg flex justify-start items-center gap-3 disabled:opacity-50 hover:bg-gray-800 dark:hover:bg-zinc-200 transition-colors"
                      >
                        <span className="text-white dark:text-black text-sm lg:text-base font-medium font-['Manrope']">
                          {subscribing ? (language === 'bg' ? 'Зареждане...' : 'Loading...') : (language === 'bg' ? 'Абонирай се (Pro)' : 'Subscribe (Pro)')}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Custom Plan */}
                <div className="w-72 lg:w-auto lg:flex-1 p-3 lg:p-4 bg-white dark:bg-zinc-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-700 flex flex-col justify-center items-center gap-3 lg:gap-4 flex-shrink-0 lg:flex-shrink transition-colors">
                  <div className="flex flex-col justify-start items-center gap-3">
                    <img src="/icons/price_personal.svg" alt={language === 'bg' ? "Персонализиран план" : "Custom Plan"} className="w-5 h-5 lg:w-6 lg:h-6 dark:invert" />
                    <div className="text-black dark:text-white text-base lg:text-lg font-semibold font-['Manrope']">
                      {language === 'bg' ? 'Персонализиран план' : 'Custom Plan'}
                    </div>
                  </div>
                  <div className="w-full h-0 outline outline-1 outline-offset-[-0.50px] outline-gray-200 dark:outline-zinc-700" />
                  <div className="w-full flex flex-col justify-start items-start gap-2">
                    <div className="w-full px-3 py-2 lg:p-3 bg-stone-50 dark:bg-zinc-800 rounded-lg flex flex-col justify-start items-center transition-colors">
                      <div className="text-black dark:text-zinc-200 text-xs lg:text-sm font-medium font-['Manrope']">
                        {language === 'bg' ? 'Персонализирани решения' : 'Custom solutions'}
                      </div>
                    </div>
                    <div className="w-full px-3 py-2 lg:p-3 bg-stone-50 dark:bg-zinc-800 rounded-lg flex flex-col justify-start items-center transition-colors">
                      <div className="text-black dark:text-zinc-200 text-xs lg:text-sm font-medium font-['Manrope']">API {language === 'bg' ? 'достъп' : 'access'}</div>
                    </div>
                  </div>
                  <Link to="/contacts" className="px-4 py-2 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-700 flex justify-start items-center gap-3 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors">
                    <span className="text-black dark:text-white text-sm lg:text-base font-medium font-['Manrope']">
                      {language === 'bg' ? 'Свържи се с нас' : 'Contact us'}
                    </span>
                  </Link>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="w-full p-3 lg:p-6 bg-white dark:bg-zinc-900 rounded-2xl lg:rounded-3xl shadow-[0px_8px_24px_0px_rgba(0,0,0,0.04)] dark:shadow-none outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-700 flex flex-col gap-3 lg:gap-6 transition-colors">
              <div className="text-black dark:text-white text-lg lg:text-3xl font-bold font-['Manrope'] text-center lg:text-left">
                {language === 'bg' ? 'Често задавани въпроси' : 'Frequently Asked Questions'}
              </div>
              
              <div className="w-full flex flex-col lg:flex-row justify-start items-start gap-3 lg:gap-5">
                <div className="flex-1 flex flex-col gap-3 lg:gap-5">
                  <div className="w-full p-4 bg-white dark:bg-zinc-800/50 rounded-xl shadow-[0px_8px_24px_0px_rgba(0,0,0,0.04)] dark:shadow-none outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-700 flex flex-col gap-3 transition-colors">
                    <div className="text-black dark:text-white text-sm lg:text-base font-semibold font-['Manrope']">{faqs[0].q}</div>
                    <div className="text-neutral-400 dark:text-zinc-400 text-xs lg:text-sm font-medium font-['Manrope']">{faqs[0].a}</div>
                  </div>
                  <div className="w-full p-4 bg-white dark:bg-zinc-800/50 rounded-xl shadow-[0px_8px_24px_0px_rgba(0,0,0,0.04)] dark:shadow-none outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-700 flex flex-col gap-3 transition-colors">
                    <div className="text-black dark:text-white text-sm lg:text-base font-semibold font-['Manrope']">{faqs[1].q}</div>
                    <div className="text-neutral-400 dark:text-zinc-400 text-xs lg:text-sm font-medium font-['Manrope']">{faqs[1].a}</div>
                  </div>
                </div>
                <div className="flex-1 flex flex-col gap-3 lg:gap-5">
                  <div className="w-full p-4 bg-white dark:bg-zinc-800/50 rounded-xl shadow-[0px_8px_24px_0px_rgba(0,0,0,0.04)] dark:shadow-none outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-700 flex flex-col gap-3 transition-colors">
                    <div className="text-black dark:text-white text-sm lg:text-base font-semibold font-['Manrope']">{faqs[2].q}</div>
                    <div className="text-neutral-400 dark:text-zinc-400 text-xs lg:text-sm font-medium font-['Manrope']">{faqs[2].a}</div>
                  </div>
                  <div className="w-full p-4 bg-white dark:bg-zinc-800/50 rounded-xl shadow-[0px_8px_24px_0px_rgba(0,0,0,0.04)] dark:shadow-none outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-700 flex flex-col gap-3 transition-colors">
                    <div className="text-black dark:text-white text-sm lg:text-base font-semibold font-['Manrope']">{faqs[3].q}</div>
                    <div className="text-neutral-400 dark:text-zinc-400 text-xs lg:text-sm font-medium font-['Manrope']">{faqs[3].a}</div>
                  </div>
                </div>
                <div className="flex-1 flex flex-col gap-3 lg:gap-5">
                  <div className="w-full p-4 bg-white dark:bg-zinc-800/50 rounded-xl shadow-[0px_8px_24px_0px_rgba(0,0,0,0.04)] dark:shadow-none outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-700 flex flex-col gap-3 transition-colors">
                    <div className="text-black dark:text-white text-sm lg:text-base font-semibold font-['Manrope']">{faqs[4].q}</div>
                    <div className="text-neutral-400 dark:text-zinc-400 text-xs lg:text-sm font-medium font-['Manrope']">{faqs[4].a}</div>
                  </div>
                  <div className="w-full p-4 bg-white dark:bg-zinc-800/50 rounded-xl shadow-[0px_8px_24px_0px_rgba(0,0,0,0.04)] dark:shadow-none outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-700 flex flex-col gap-3 transition-colors">
                    <div className="text-black dark:text-white text-sm lg:text-base font-semibold font-['Manrope']">{faqs[5].q}</div>
                    <div className="text-neutral-400 dark:text-zinc-400 text-xs lg:text-sm font-medium font-['Manrope']">{faqs[5].a}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default Prices;

