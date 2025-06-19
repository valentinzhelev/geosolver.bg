import React, { useState } from 'react';
import Layout from '../../layout/Layout';
import { Helmet } from 'react-helmet';
import { useTranslation } from '../../../hooks/useTranslation';

const Prices = () => {
  const [tab, setTab] = useState('month');
  const { t, language } = useTranslation();

  const faqs = [
    {
      q: language === 'bg' ? 'Как се изчисляват безплатните изчисления?' : 'How are free calculations counted?',
      a: language === 'bg' ? 'Всеки регистриран потребител получава 5 безплатни изчисления за всяка задача на месец.' : 'Each registered user gets 5 free calculations per task per month.'
    },
    {
      q: language === 'bg' ? 'Какви видове изчисления поддържа GeoSolver?' : 'What types of calculations does GeoSolver support?',
      a: language === 'bg' ? 'GeoSolver предлага координатни трансформации, изчисления на площ, дължина и обем, GNSS анализ и други инструменти.' : 'GeoSolver offers coordinate transformations, area, length and volume calculations, GNSS analysis, and other tools.'
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

  return (
    <>
      <Helmet>
        <title>
          {language === 'bg' ? 'GeoSolver - Цени и Планове' : 'GeoSolver - Prices and Plans'}
        </title>
        <meta 
          name="description" 
          content={language === 'bg'
            ? "GeoSolver - Онлайн геодезически калкулатори. Безплатен план с 5 изчисления месечно или професионален абонамент с неограничен достъп и допълнителни функции."
            : "GeoSolver - Online geodetic calculators. Free plan with 5 calculations per month or professional subscription with unlimited access and additional features."
          }
        />
        <meta 
          name="keywords" 
          content={language === 'bg'
            ? "геодезия, калкулатори, безплатен план, професионален план, абонамент, изчисления, геодезически инструменти, онлайн калкулатори"
            : "geodesy, calculators, free plan, professional plan, subscription, calculations, geodetic tools, online calculators"
          }
        />
        <meta name="robots" content="index, follow" />
      </Helmet>
      <Layout>
        <div className="w-full min-h-screen bg-stone-50 flex flex-col items-center px-2 md:px-0">
          <div className="w-full max-w-[1400px] flex flex-col items-center gap-24 pt-20 pb-32">
            <div className="self-stretch flex flex-col justify-start items-start gap-10">
              <div className="self-stretch inline-flex justify-between items-end">
                <div className="w-[580px] inline-flex flex-col justify-start items-start gap-1">
                  <div className="justify-start text-black text-3xl font-bold font-['Manrope']">
                    {language === 'bg' ? 'Цени и планове' : 'Prices and Plans'}
                  </div>
                  <div className="self-stretch justify-start text-neutral-400 text-base font-semibold font-['Manrope']">
                    {language === 'bg'
                      ? 'Използвайте GeoSolver безплатно с до 5 изчисления на задача месечно или изберете професионален абонамент за неограничен достъп и допълнителни функции.'
                      : 'Use GeoSolver for free with up to 5 calculations per task per month or choose a professional subscription for unlimited access and additional features.'
                    }
                  </div>
                </div>
                <div className="p-1.5 bg-white rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 flex justify-start items-center gap-2">
                  <div
                    data-property-1="Default"
                    className={`px-3 py-1 rounded flex justify-center items-center gap-2.5 cursor-pointer ${tab === 'month' ? 'bg-gray-200 text-black' : 'text-neutral-400'}`}
                    onClick={() => setTab('month')}
                  >
                    <div className="justify-start text-base font-medium font-['Manrope']">
                      {language === 'bg' ? 'Месец' : 'Month'}
                    </div>
                  </div>
                  <div
                    data-property-1="Default"
                    className={`px-3 py-1 rounded-lg flex justify-center items-center gap-2.5 cursor-pointer ${tab === 'year' ? 'bg-gray-200 text-black' : 'text-neutral-400'}`}
                    onClick={() => setTab('year')}
                  >
                    <div className="justify-start text-base font-medium font-['Manrope']">
                      {language === 'bg' ? 'Година (-20%)' : 'Year (-20%)'}
                    </div>
                  </div>
                </div>
              </div>
              <div className="self-stretch flex justify-center items-center gap-5">
                {/* Free Plan */}
                <div className="flex-1 min-w-0 p-4 bg-white rounded-xl inline-flex flex-col justify-center items-center gap-4">
                  <div className="flex flex-col justify-start items-center gap-3">
                    <img src="/icons/price_free.svg" alt={language === 'bg' ? "Безплатен план" : "Free Plan"} className="w-6 h-6" />
                    <div className="justify-start text-black text-lg font-semibold font-['Manrope']">
                      {language === 'bg' ? 'Безплатен план' : 'Free Plan'}
                    </div>
                  </div>
                  <div className="self-stretch h-0 outline outline-1 outline-offset-[-0.50px] outline-gray-200" />
                  <div className="self-stretch flex flex-col justify-start items-start gap-2">
                    <div className="self-stretch p-3 bg-stone-50 rounded-lg flex flex-col justify-center items-center">
                      <div className="justify-start text-black text-sm font-medium font-['Manrope']">
                        {language === 'bg' ? 'Основен достъп до всички инструменти' : 'Basic access to all tools'}
                      </div>
                    </div>
                    <div className="self-stretch p-3 bg-stone-50 rounded-lg flex flex-col justify-center items-center">
                      <div className="justify-start text-black text-sm font-medium font-['Manrope']">
                        {language === 'bg' ? '5 изчисления с всеки инструмент на месец' : '5 calculations with each tool per month'}
                      </div>
                    </div>
                  </div>
                  <div className="self-stretch inline-flex justify-between items-center">
                    <div className="justify-start text-black text-lg font-semibold font-['Manrope']">0.00{language === 'bg' ? 'лв' : 'BGN'}</div>
                    <button className="px-4 py-2 bg-black rounded-lg flex justify-start items-center gap-3">
                      <span className="justify-start text-white text-base font-medium font-['Manrope']">
                        {language === 'bg' ? 'Регистрация' : 'Register'}
                      </span>
                    </button>
                  </div>
                </div>
                {/* Pro Plan */}
                <div className="flex-1 min-w-0 p-2 rounded-[20px] outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex flex-col justify-start items-start gap-1">
                  <div className="self-stretch px-4 py-2 relative bg-black rounded-tl-xl rounded-tr-xl rounded-bl rounded-br flex flex-col justify-center items-center gap-4 overflow-hidden">
                    <img src="/images/gradient_wallpaper.jpg" alt="" className="absolute inset-0 w-full h-full object-cover opacity-70 z-0" />
                    <div className="self-stretch text-center justify-start text-white text-lg font-semibold font-['Manrope'] z-10 relative">
                      {language === 'bg' ? 'Препоръчано' : 'Recommended'}
                    </div>
                  </div>
                  <div className="self-stretch p-4 bg-white rounded-tl rounded-tr rounded-bl-xl rounded-br-xl shadow-[0px_8px_24px_0px_rgba(0,0,0,0.04)] flex flex-col justify-center items-center gap-4 overflow-hidden">
                    <div className="flex flex-col justify-start items-center gap-3">
                      <img src="/icons/price_logo.svg" alt={language === 'bg' ? "Професионален план" : "Professional Plan"} className="w-5 h-6" />
                      <div className="justify-start text-black text-lg font-semibold font-['Manrope']">
                        {language === 'bg' ? 'Професионален план' : 'Professional Plan'}
                      </div>
                    </div>
                    <div className="self-stretch h-0 outline outline-1 outline-offset-[-0.50px] outline-gray-200" />
                    <div className="self-stretch flex flex-col justify-start items-start gap-2">
                      <div className="self-stretch p-3 bg-stone-50 rounded-lg flex flex-col justify-center items-center">
                        <div className="justify-start text-black text-sm font-medium font-['Manrope']">
                          {language === 'bg' ? 'Неограничени изчисления' : 'Unlimited calculations'}
                        </div>
                      </div>
                      <div className="self-stretch p-3 bg-stone-50 rounded-lg flex flex-col justify-center items-center">
                        <div className="justify-start text-black text-sm font-medium font-['Manrope']">
                          {language === 'bg' ? 'Приоритетна поддръжка' : 'Priority support'}
                        </div>
                      </div>
                      <div className="self-stretch p-3 bg-stone-50 rounded-lg flex flex-col justify-center items-center">
                        <div className="justify-start text-black text-sm font-medium font-['Manrope']">
                          {language === 'bg' ? 'Допълнителни функции' : 'Additional features'}
                        </div>
                      </div>
                    </div>
                    <div className="self-stretch inline-flex justify-between items-center">
                      <div className="justify-start text-black text-lg font-semibold font-['Manrope']">
                        {tab === 'year' ? `191.90${language === 'bg' ? 'лв/г' : 'BGN/y'}` : `19.99${language === 'bg' ? 'лв/м' : 'BGN/m'}`}
                      </div>
                      <button className="px-4 py-2 bg-black rounded-lg flex justify-start items-center gap-3">
                        <span className="justify-start text-white text-base font-medium font-['Manrope']">
                          {language === 'bg' ? 'Абониране' : 'Subscribe'}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
                {/* Custom Plan */}
                <div className="flex-1 min-w-0 p-4 bg-white rounded-xl inline-flex flex-col justify-center items-center gap-4">
                  <div className="flex flex-col justify-start items-center gap-3">
                    <img src="/icons/price_personal.svg" alt={language === 'bg' ? "Персонализиран план" : "Custom Plan"} className="w-6 h-6" />
                    <div className="justify-start text-black text-lg font-semibold font-['Manrope']">
                      {language === 'bg' ? 'Персонализиран план' : 'Custom Plan'}
                    </div>
                  </div>
                  <div className="self-stretch h-0 outline outline-1 outline-offset-[-0.50px] outline-gray-200" />
                  <div className="self-stretch flex flex-col justify-start items-start gap-2">
                    <div className="self-stretch p-3 bg-stone-50 rounded-lg flex flex-col justify-start items-center">
                      <div className="justify-start text-black text-sm font-medium font-['Manrope']">
                        {language === 'bg' ? 'Персонализирани решения' : 'Custom solutions'}
                      </div>
                    </div>
                    <div className="self-stretch p-3 bg-stone-50 rounded-lg flex flex-col justify-start items-center">
                      <div className="justify-start text-black text-sm font-medium font-['Manrope']">API {language === 'bg' ? 'достъп' : 'access'}</div>
                    </div>
                  </div>
                  <button className="px-4 py-2 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex justify-start items-center gap-3">
                    <span className="justify-start text-black text-base font-medium font-['Manrope']">
                      {language === 'bg' ? 'Свържи се с нас' : 'Contact us'}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="self-stretch p-6 bg-white rounded-3xl shadow-[0px_8px_24px_0px_rgba(0,0,0,0.04)] outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex flex-col justify-start items-start gap-6">
              <div className="justify-start text-black text-3xl font-bold font-['Manrope']">
                {language === 'bg' ? 'Често задавани въпроси' : 'Frequently Asked Questions'}
              </div>
              <div className="self-stretch inline-flex justify-start items-start gap-5">
                <div className="flex-1 inline-flex flex-col justify-center items-start gap-5">
                  <div className="self-stretch p-4 bg-white rounded-xl shadow-[0px_8px_24px_0px_rgba(0,0,0,0.04)] outline outline-1 outline-offset-[-1px] outline-gray-200 flex flex-col justify-start items-start gap-3">
                    <div className="self-stretch justify-start text-black text-base font-semibold font-['Manrope']">{faqs[0].q}</div>
                    <div className="self-stretch justify-start text-neutral-400 text-sm font-medium font-['Manrope']">{faqs[0].a}</div>
                  </div>
                  <div className="self-stretch p-4 bg-white rounded-xl shadow-[0px_8px_24px_0px_rgba(0,0,0,0.04)] outline outline-1 outline-offset-[-1px] outline-gray-200 flex flex-col justify-start items-start gap-3">
                    <div className="self-stretch justify-start text-black text-base font-semibold font-['Manrope']">{faqs[1].q}</div>
                    <div className="self-stretch justify-start text-neutral-400 text-sm font-medium font-['Manrope']">{faqs[1].a}</div>
                  </div>
                </div>
                <div className="flex-1 self-stretch inline-flex flex-col justify-center items-start gap-5">
                  <div className="self-stretch p-4 bg-white rounded-xl shadow-[0px_8px_24px_0px_rgba(0,0,0,0.04)] outline outline-1 outline-offset-[-1px] outline-gray-200 flex flex-col justify-start items-start gap-3">
                    <div className="self-stretch justify-start text-black text-base font-semibold font-['Manrope']">{faqs[2].q}</div>
                    <div className="self-stretch justify-start text-neutral-400 text-sm font-medium font-['Manrope']">{faqs[2].a}</div>
                  </div>
                  <div className="self-stretch flex-1 p-4 bg-white rounded-xl shadow-[0px_8px_24px_0px_rgba(0,0,0,0.04)] outline outline-1 outline-offset-[-1px] outline-gray-200 flex flex-col justify-start items-start gap-3">
                    <div className="self-stretch justify-start text-black text-base font-semibold font-['Manrope']">{faqs[3].q}</div>
                    <div className="self-stretch justify-start text-neutral-400 text-sm font-medium font-['Manrope']">{faqs[3].a}</div>
                  </div>
                </div>
                <div className="flex-1 self-stretch inline-flex flex-col justify-center items-start gap-5">
                  <div className="self-stretch flex-1 p-4 bg-white rounded-xl shadow-[0px_8px_24px_0px_rgba(0,0,0,0.04)] outline outline-1 outline-offset-[-1px] outline-gray-200 flex flex-col justify-start items-start gap-3">
                    <div className="self-stretch justify-start text-black text-base font-semibold font-['Manrope']">{faqs[4].q}</div>
                    <div className="self-stretch justify-start text-neutral-400 text-sm font-medium font-['Manrope']">{faqs[4].a}</div>
                  </div>
                  <div className="self-stretch p-4 bg-white rounded-xl shadow-[0px_8px_24px_0px_rgba(0,0,0,0.04)] outline outline-1 outline-offset-[-1px] outline-gray-200 flex flex-col justify-start items-start gap-3">
                    <div className="self-stretch justify-start text-black text-base font-semibold font-['Manrope']">{faqs[5].q}</div>
                    <div className="self-stretch justify-start text-neutral-400 text-sm font-medium font-['Manrope']">{faqs[5].a}</div>
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

