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
      <div className="w-full min-h-screen bg-stone-50 flex flex-col items-center px-2 md:px-0">
          <div className="w-full max-w-[1400px] flex flex-col items-center gap-24 pt-20 pb-32">
            {/* Figma block integration start */}
            <div className="self-stretch flex flex-col justify-start items-start gap-10">
              <div className="self-stretch inline-flex justify-between items-end">
                <div className="w-[580px] inline-flex flex-col justify-start items-start gap-1">
                  <div className="justify-start text-black text-3xl font-bold font-['Manrope']">Цени и планове</div>
                  <div className="self-stretch justify-start text-neutral-400 text-base font-semibold font-['Manrope']">Използвайте GeoSolver безплатно с до 5 изчисления на задача месечно или изберете професионален абонамент за неограничен достъп и допълнителни функции.</div>
                </div>
                <div className="p-1.5 bg-white rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 flex justify-start items-center gap-2">
                  <div
                    data-property-1="Default"
                    className={`px-3 py-1 rounded flex justify-center items-center gap-2.5 cursor-pointer ${tab === 'month' ? 'bg-gray-200 text-black' : 'text-neutral-400'}`}
                    onClick={() => setTab('month')}
                  >
                    <div className="justify-start text-base font-medium font-['Manrope']">Месец</div>
                  </div>
                  <div
                    data-property-1="Default"
                    className={`px-3 py-1 rounded-lg flex justify-center items-center gap-2.5 cursor-pointer ${tab === 'year' ? 'bg-gray-200 text-black' : 'text-neutral-400'}`}
                    onClick={() => setTab('year')}
                  >
                    <div className="justify-start text-base font-medium font-['Manrope']">Година (-20%)</div>
                  </div>
                </div>
              </div>
              <div className="self-stretch flex justify-center items-center gap-5">
                {/* Free Plan */}
                <div className="flex-1 min-w-0 p-4 bg-white rounded-xl inline-flex flex-col justify-center items-center gap-4">
                  <div className="flex flex-col justify-start items-center gap-3">
                    <img src="/icons/price_free.svg" alt="Безплатен план" className="w-6 h-6" />
                    <div className="justify-start text-black text-lg font-semibold font-['Manrope']">Безплатен план</div>
                  </div>
                  <div className="self-stretch h-0 outline outline-1 outline-offset-[-0.50px] outline-gray-200" />
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
                {/* Pro Plan */}
                <div className="flex-1 min-w-0 p-2 rounded-[20px] outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex flex-col justify-start items-start gap-1">
                  <div className="self-stretch px-4 py-2 relative bg-black rounded-tl-xl rounded-tr-xl rounded-bl rounded-br flex flex-col justify-center items-center gap-4 overflow-hidden">
                    {/* Gradient wallpaper as background */}
                    <img src="/images/gradient_wallpaper.jpg" alt="" className="absolute inset-0 w-full h-full object-cover opacity-70 z-0" />
                    <div className="self-stretch text-center justify-start text-white text-lg font-semibold font-['Manrope'] z-10 relative">Препоръчано</div>
                  </div>
                  <div className="self-stretch p-4 bg-white rounded-tl rounded-tr rounded-bl-xl rounded-br-xl shadow-[0px_8px_24px_0px_rgba(0,0,0,0.04)] flex flex-col justify-center items-center gap-4 overflow-hidden">
                    <div className="flex flex-col justify-start items-center gap-3">
                      <img src="/icons/price_logo.svg" alt="Професионален план" className="w-5 h-6" />
                      <div className="justify-start text-black text-lg font-semibold font-['Manrope']">Професионален план</div>
                    </div>
                    <div className="self-stretch h-0 outline outline-1 outline-offset-[-0.50px] outline-gray-200" />
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
                      <div className="justify-start text-black text-lg font-semibold font-['Manrope']">{tab === 'year' ? '191.90лв/г' : '19.99лв/м'}</div>
                      <button className="px-4 py-2 bg-black rounded-lg flex justify-start items-center gap-3">
                        <span className="justify-start text-white text-base font-medium font-['Manrope']">Абониране</span>
                      </button>
                    </div>
                  </div>
                </div>
                {/* Custom Plan */}
                <div className="flex-1 min-w-0 p-4 bg-white rounded-xl inline-flex flex-col justify-center items-center gap-4">
                  <div className="flex flex-col justify-start items-center gap-3">
                    <img src="/icons/price_personal.svg" alt="Персонализиран план" className="w-6 h-6" />
                    <div className="justify-start text-black text-lg font-semibold font-['Manrope']">Персонализиран план</div>
                  </div>
                  <div className="self-stretch h-0 outline outline-1 outline-offset-[-0.50px] outline-gray-200" />
                  <div className="self-stretch flex flex-col justify-start items-start gap-2">
                    <div className="self-stretch p-3 bg-stone-50 rounded-lg flex flex-col justify-start items-center">
                      <div className="justify-start text-black text-sm font-medium font-['Manrope']">Персонализирани решения</div>
                    </div>
                    <div className="self-stretch p-3 bg-stone-50 rounded-lg flex flex-col justify-start items-center">
                      <div className="justify-start text-black text-sm font-medium font-['Manrope']">API достъп</div>
                    </div>
                  </div>
                  <button className="px-4 py-2 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex justify-start items-center gap-3">
                    <span className="justify-start text-black text-base font-medium font-['Manrope']">Свържи се с нас</span>
                  </button>
                </div>
              </div>
            </div>
            {/* Figma block integration end */}

            {/* FAQ Section - Figma style */}
            <div className="self-stretch p-6 bg-white rounded-3xl shadow-[0px_8px_24px_0px_rgba(0,0,0,0.04)] outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex flex-col justify-start items-start gap-6">
              <div className="justify-start text-black text-3xl font-bold font-['Manrope']">Често задавани въпроси</div>
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

