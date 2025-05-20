import React, { useState } from 'react';
import Layout from '../../layout/Layout';
import { Helmet } from 'react-helmet';

const faqs = [
  {
    q: 'Как се изчисляват безплатните изчисления?',
    a: 'Всеки регистриран потребител получава 5 безплатни изчисления за всяка задача на месец.'
  },
  {
    q: 'Какви видове изчисления поддържа GeoSolver?',
    a: 'GeoSolver предлага координатни трансформации, изчисления на площ, дължина и обем, GNSS анализ и други инструменти.'
  },
  {
    q: 'Какви са начините за плащане?',
    a: 'Приемаме плащания чрез кредитна/дебитна карта и PayPal.'
  },
  {
    q: 'Сигурни ли са моите данни?',
    a: 'Всички данни се съхраняват криптирано и не се споделят с трети страни.'
  },
  {
    q: 'Как мога да се абонирам?',
    a: 'Изберете професионален план и следвайте стъпките за плащане. След потвърждение ще имате неограничен достъп.'
  },
  {
    q: 'Има ли мобилна версия на GeoSolver?',
    a: 'GeoSolver е направен специално за да се използва на малки устройства.'
  },
];

const Prices = () => {
  const [tab, setTab] = useState('month');
  return (
    <>
      <Helmet>
        <title>GeoSolver - Цени и Планове</title>
        <meta name="description" content="GeoSolver - Онлайн геодезически калкулатори. Безплатен план с 5 изчисления месечно или професионален абонамент с неограничен достъп и допълнителни функции." />
        <meta name="keywords" content="геодезия, калкулатори, безплатен план, професионален план, абонамент, изчисления, геодезически инструменти, онлайн калкулатори" />
        <meta name="robots" content="index, follow" />
      </Helmet>
      <Layout>
      {/* Main container */}
      <div className="w-full min-h-screen bg-stone-50 flex flex-col items-center px-2 md:px-0">
        {/* Content wrapper */}
        <div className="w-full max-w-[1180px] flex flex-col items-center gap-20 pt-10 pb-20">
          {/* Title and tab group */}
          <div className="w-full flex flex-col md:flex-row md:justify-between md:items-end gap-6 md:gap-0">
            <div className="w-full md:w-[580px] flex flex-col gap-1">
              <div className="text-black text-3xl md:text-3xl font-bold font-['Manrope']">Цени и планове</div>
              <div className="text-neutral-400 text-base md:text-base font-semibold font-['Manrope']">Използвайте GeoSolver безплатно с до 5 изчисления на задача месечно или изберете професионален абонамент за неограничен достъп и допълнителни функции.</div>
            </div>
            <div className="p-1.5 bg-white rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 flex gap-2 mt-2 md:mt-0 w-fit">
              <button
                className={`px-3 py-1 rounded text-sm ${tab === 'month' ? 'bg-gray-200 text-black font-medium' : 'text-neutral-400 font-medium'}`}
                onClick={() => setTab('month')}
              >
                Месец
              </button>
              <button
                className={`px-3 py-1 rounded text-sm ${tab === 'year' ? 'bg-gray-200 text-black font-medium' : 'text-neutral-400 font-medium'}`}
                onClick={() => setTab('year')}
              >
                Година (-20%)
              </button>
            </div>
          </div>
          {/* Pricing cards - Carousel on mobile, Figma row on desktop */}
          <div>
            {/* Desktop Figma row */}
            <div className="hidden md:inline-flex w-[1180px] justify-center items-center gap-5">
              {/* Free Plan */}
              <div className="flex-1 p-4 bg-white rounded-xl inline-flex flex-col justify-center items-center gap-4 outline outline-1 outline-offset-[-1px] outline-gray-200 self-stretch">
                <div className="flex flex-col justify-start items-center gap-3">
                  <img src="/price_free.svg" alt="Безплатен план" className="w-6 h-6" />
                  <div className="justify-start text-black text-lg font-semibold font-['Manrope']">Безплатен план</div>
                </div>
                <div className="self-stretch h-0 outline outline-1 outline-offset-[-0.5px] outline-gray-200" />
                <div className="self-stretch flex flex-col justify-start items-start gap-2">
                  <div className="self-stretch p-3 bg-stone-50 rounded-lg flex flex-col justify-center items-center">
                    <div className="justify-start text-black text-sm font-medium font-['Manrope']">Основен достъп до всички инструменти</div>
                  </div>
                  <div className="self-stretch p-3 bg-stone-50 rounded-lg flex flex-col justify-center items-center">
                    <div className="justify-start text-black text-sm font-medium font-['Manrope']">5 изчисления с всеки инструмент на месец</div>
                  </div>
                </div>
                <div className="self-stretch inline-flex justify-between items-center">
                  <div className="justify-start text-black text-lg font-semibold font-['Manrope']">0.00лв</div>
                  <div className="px-4 py-2 bg-black rounded-lg flex justify-start items-center gap-3">
                    <div className="justify-start text-white text-base font-medium font-['Manrope']">Регистрация</div>
                  </div>
                </div>
              </div>
              {/* Pro Plan */}
              <div className="w-96 p-2 rounded-[20px] outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex flex-col justify-start items-start gap-1">
                <div className="self-stretch px-4 py-4 relative bg-black rounded-tl-xl rounded-tr-xl flex flex-col justify-center items-center gap-4 overflow-hidden min-h-[56px]">
                  {/* Optional: <img className='w-96 h-52 left-[-0.5px] top-[-81.93px] absolute opacity-50' src='/star_bg.svg' alt='' /> */}
                  <div className="self-stretch text-center justify-start text-white text-lg font-semibold font-['Manrope']">Препоръчано</div>
                </div>
                <div className="self-stretch p-4 bg-white rounded-tl rounded-tr rounded-bl-xl rounded-br-xl shadow-[0px_8px_24px_0px_rgba(0,0,0,0.04)] flex flex-col justify-center items-center gap-4 overflow-hidden">
                  <div className="flex flex-col justify-start items-center gap-3">
                    <img src="/price_logo.svg" alt="Професионален план" className="w-5 h-6" />
                    <div className="justify-start text-black text-lg font-semibold font-['Manrope']">Професионален план</div>
                  </div>
                  <div className="self-stretch h-0 outline outline-1 outline-offset-[-0.5px] outline-gray-200" />
                  <div className="self-stretch flex flex-col justify-start items-start gap-2">
                    <div className="self-stretch p-3 bg-stone-50 rounded-lg flex flex-col justify-center items-center">
                      <div className="justify-start text-black text-sm font-medium font-['Manrope']">Неограничени изчисления</div>
                    </div>
                    <div className="self-stretch p-3 bg-stone-50 rounded-lg flex flex-col justify-center items-center">
                      <div className="justify-start text-black text-sm font-medium font-['Manrope']">Приоритетна поддръжка</div>
                    </div>
                    <div className="self-stretch p-3 bg-stone-50 rounded-lg flex flex-col justify-center items-center">
                      <div className="justify-start text-black text-sm font-medium font-['Manrope']">Допълнителни функции</div>
                    </div>
                  </div>
                  <div className="self-stretch inline-flex justify-between items-center">
                    <div className="justify-start text-black text-lg font-semibold font-['Manrope']">19.99лв/м</div>
                    <div className="px-4 py-2 bg-black rounded-lg flex justify-start items-center gap-3">
                      <div className="justify-start text-white text-base font-medium font-['Manrope']">Абониране</div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Custom Plan */}
              <div className="flex-1 p-4 bg-white rounded-xl inline-flex flex-col justify-center items-center gap-4 outline outline-1 outline-offset-[-1px] outline-gray-200 self-stretch">
                <div className="flex flex-col justify-start items-center gap-3">
                  <img src="/price_personal.svg" alt="Персонализиран план" className="w-6 h-6" />
                  <div className="justify-start text-black text-lg font-semibold font-['Manrope']">Персонализиран план</div>
                </div>
                <div className="self-stretch h-0 outline outline-1 outline-offset-[-0.5px] outline-gray-200" />
                <div className="self-stretch flex flex-col justify-start items-start gap-2">
                  <div className="self-stretch p-3 bg-stone-50 rounded-lg flex flex-col justify-start items-center">
                    <div className="justify-start text-black text-sm font-medium font-['Manrope']">Персонализирани решения</div>
                  </div>
                  <div className="self-stretch p-3 bg-stone-50 rounded-lg flex flex-col justify-start items-center">
                    <div className="justify-start text-black text-sm font-medium font-['Manrope']">API достъп</div>
                  </div>
                </div>
                <div className="px-4 py-2 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex justify-start items-center gap-3">
                  <div className="justify-start text-black text-base font-medium font-['Manrope']">Свържи се с нас</div>
                </div>
              </div>
            </div>
            {/* Mobile carousel remains as before */}
            <div className="md:hidden w-full overflow-x-auto flex-nowrap scrollbar-hide scroll-snap-x snap-mandatory mt-1">
              <div className="flex flex-nowrap gap-3 w-full">
                {/* Free Plan */}
                <div className="flex-shrink-0 min-w-[280px] max-w-[320px] md:min-w-0 md:max-w-none md:flex-1 md:p-4 md:bg-white md:rounded-xl md:inline-flex md:flex-col md:justify-center md:items-center md:gap-4 md:outline md:outline-1 md:outline-offset-[-1px] md:outline-gray-200 md:self-stretch md:mx-0 p-4 bg-white rounded-xl flex flex-col justify-center items-center gap-4 outline outline-1 outline-offset-[-1px] outline-gray-200 w-full mx-auto snap-center">
                  <div className="flex flex-col justify-start items-center gap-3">
                    <img src="/price_free.svg" alt="Безплатен план" className="w-6 h-6" />
                    <div className="text-black text-lg font-semibold font-['Manrope']">Безплатен план</div>
                  </div>
                  <div className="self-stretch h-0 outline outline-1 outline-offset-[-0.5px] outline-gray-200" />
                  <div className="self-stretch flex flex-col justify-start items-start gap-2">
                    <div className="self-stretch p-3 bg-stone-50 rounded-lg flex flex-col justify-center items-center">
                      <div className="justify-start text-black text-sm font-medium font-['Manrope']">Основен достъп до всички инструменти</div>
                    </div>
                    <div className="self-stretch p-3 bg-stone-50 rounded-lg flex flex-col justify-center items-center">
                      <div className="justify-start text-black text-sm font-medium font-['Manrope']">5 изчисления с всеки инструмент на месец</div>
                    </div>
                  </div>
                  <div className="self-stretch inline-flex justify-between items-center">
                    <div className="justify-start text-black text-lg font-semibold font-['Manrope']">0.00лв</div>
                    <button className="px-4 py-2 bg-black rounded-lg flex justify-start items-center gap-3">
                      <span className="justify-start text-white text-base font-medium font-['Manrope']">Регистрация</span>
                    </button>
                  </div>
                </div>
                {/* Pro Plan (highlighted) */}
                <div className="flex-shrink-0 min-w-[280px] max-w-[320px] md:w-96 p-2 rounded-[20px] outline outline-1 outline-offset-[-1px] outline-gray-200 flex flex-col gap-1 relative z-10 mx-auto snap-center">
                  <div className="w-full px-4 py-4 bg-black rounded-tl-xl rounded-tr-xl flex flex-col items-center justify-center gap-2 relative overflow-hidden min-h-[56px]">
                    <div className="w-full text-center text-white text-base font-semibold font-['Manrope'] z-10">Препоръчано</div>
                  </div>
                  <div className="w-full p-3 bg-white rounded-b-xl shadow-[0px_8px_24px_0px_rgba(0,0,0,0.04)] flex flex-col items-center gap-3 overflow-hidden">
                    <div className="flex flex-col justify-start items-center gap-2">
                      <img src="/price_logo.svg" alt="Професионален план" className="w-5 h-6" />
                      <div className="text-black text-base font-semibold font-['Manrope']">Професионален план</div>
                    </div>
                    <div className="w-full h-0 outline outline-1 outline-offset-[-0.5px] outline-gray-200" />
                    <div className="w-full flex flex-col gap-2">
                      <div className="w-full p-2 bg-stone-50 rounded-lg flex flex-col items-center">
                        <div className="text-black text-xs font-medium font-['Manrope']">Неограничени изчисления</div>
                      </div>
                      <div className="w-full p-2 bg-stone-50 rounded-lg flex flex-col items-center">
                        <div className="text-black text-xs font-medium font-['Manrope']">Приоритетна поддръжка</div>
                      </div>
                      <div className="w-full p-2 bg-stone-50 rounded-lg flex flex-col items-center">
                        <div className="text-black text-xs font-medium font-['Manrope']">Допълнителни функции</div>
                      </div>
                    </div>
                    <div className="w-full flex justify-between items-center mt-1">
                      <div className="text-black text-base font-semibold font-['Manrope']">{tab === 'year' ? '191.90лв/г' : '19.99лв/м'}</div>
                      <button className="px-4 py-2 bg-black rounded-lg flex items-center gap-3">
                        <span className="text-white text-sm font-medium font-['Manrope']">Абониране</span>
                      </button>
                    </div>
                  </div>
                </div>
                {/* Corporate Plan */}
                <div className="flex-shrink-0 min-w-[280px] max-w-[320px] md:flex-1 p-4 bg-white rounded-xl flex flex-col justify-center items-center gap-4 outline outline-1 outline-offset-[-1px] outline-gray-200 w-full mx-auto snap-center">
                  <div className="flex flex-col justify-start items-center gap-3">
                    <img src="/price_personal.svg" alt="Корпоративен план" className="w-6 h-6" />
                    <div className="text-black text-lg font-semibold font-['Manrope']">Персонализиран план</div>
                  </div>
                  <div className="w-full h-0 outline outline-1 outline-offset-[-0.5px] outline-gray-200" />
                  <div className="w-full flex flex-col gap-2">
                    <div className="w-full p-2 bg-stone-50 rounded-lg flex flex-col items-center">
                      <div className="text-black text-xs font-medium font-['Manrope']">Персонализирани решения</div>
                    </div>
                    <div className="w-full p-2 bg-stone-50 rounded-lg flex flex-col items-center">
                      <div className="text-black text-xs font-medium font-['Manrope']">API достъп</div>
                    </div>
                  </div>
                  <div className="w-full flex justify-center items-center mt-1">
                    <button className="px-4 py-2 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 flex items-center gap-3">
                      <span className="text-black text-sm font-medium font-['Manrope']">Свържи се с нас</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* FAQ Section - more compact */}
          <div className="w-full p-4 bg-white rounded-3xl shadow-[0px_8px_24px_0px_rgba(0,0,0,0.04)] outline outline-1 outline-offset-[-1px] outline-gray-200 flex flex-col gap-4 mt-8">
            <div className="text-black text-2xl font-bold font-['Manrope']">Често задавани въпроси</div>
            <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-3">
              {faqs.map((faq, i) => (
                <div key={i} className="p-3 bg-white rounded-xl shadow-[0px_8px_24px_0px_rgba(0,0,0,0.04)] outline outline-1 outline-offset-[-1px] outline-gray-200 flex flex-col gap-2">
                  <div className="text-black text-sm font-semibold font-['Manrope']">{faq.q}</div>
                  <div className="text-neutral-400 text-xs font-medium font-['Manrope']">{faq.a}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      </Layout>
    </>
  );
};

export default Prices;
