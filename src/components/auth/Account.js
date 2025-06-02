import React from 'react';
import { Helmet } from 'react-helmet';
import Layout from '../layout/Layout';
import { useAuth } from './AuthContext';

const Account = () => {
  const { user, logout } = useAuth();

  // Dummy data for plan, payment, and history (replace with real API data)
  const plan = {
    name: 'Професионален план (Месечен)',
    daysActive: 216,
    daysToNext: 4,
  };
  const paymentMethods = [
    { last4: '6225', active: true },
    { last4: '4448', active: false },
  ];
  const usageHistory = Array(10).fill({ tool: 'Първа основна задача', date: '18.04.2025 14:25' });
  const paymentHistory = Array(6).fill({ method: '**** 6225', amount: '19.99лв', date: '18.04.2025 14:25' });
  const totalCalculations = 881;

  return (
    <Layout>
      <Helmet>
        <title>Акаунт | GeoSolver</title>
        <meta name="description" content="Вашият GeoSolver акаунт, абонамент, история и настройки." />
      </Helmet>
      <div className="w-full min-h-screen bg-stone-50 flex flex-col items-center">
        <div className="w-[1180px] mt-8 mb-8 inline-flex flex-col justify-start items-start gap-10">
          <div className="self-stretch justify-start text-black text-3xl font-bold font-['Manrope']">Акаунт</div>
          <div className="self-stretch inline-flex justify-start items-start gap-5">
            <div className="w-96 inline-flex flex-col justify-center items-center gap-5">
              <div className="self-stretch p-4 bg-white rounded-xl shadow-[0px_8px_24px_0px_rgba(0,0,0,0.04)] outline outline-1 outline-offset-[-0.50px] outline-gray-200 flex flex-col justify-start items-start gap-4 overflow-hidden">
                <div className="flex flex-col justify-start items-start gap-2">
                  <div className="justify-start text-black text-lg font-semibold font-['Manrope']">{user?.name || 'Потребител'}</div>
                  <div className="justify-start text-neutral-400 text-base font-semibold font-['Manrope']">{user?.email || ''}</div>
                </div>
                <div className="inline-flex justify-center items-center gap-2">
                  <button onClick={logout} className="px-4 py-2 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 flex justify-start items-center gap-3">
                    <div className="justify-start text-black text-base font-medium font-['Manrope']">Излез от акаунта</div>
                  </button>
                  <div className="w-9 h-9 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 flex justify-center items-center gap-3">
                    <img src="/icons/account_settings.svg" alt="Настройки" className="w-5 h-5" />
                  </div>
                </div>
              </div>
              <div className="self-stretch rounded-[20px] flex flex-col justify-center items-center gap-1 relative overflow-hidden">
                <div className="self-stretch px-4 py-2 relative bg-black rounded-tl-xl rounded-tr-xl rounded-bl rounded-br inline-flex flex-col justify-center items-center gap-4 overflow-hidden">
                  <img
                    className="w-96 h-52 left-[380px] top-[127.42px] absolute origin-top-left rotate-180 opacity-50"
                    src="/images/gradient_wallpaper.jpg"
                    alt="Plan Gradient"
                    style={{ zIndex: 1 }}
                  />
                  <div className="text-center justify-start text-white text-lg font-semibold font-['Manrope'] z-10" style={{ opacity: 1 }}>
                    {plan.name}
                  </div>
                </div>
                <div className="self-stretch p-4 bg-white rounded-tl rounded-tr rounded-bl-xl rounded-br-xl shadow-[0px_8px_24px_0px_rgba(0,0,0,0.04)] outline outline-1 outline-offset-[-0.50px] outline-gray-200 flex flex-col justify-start items-start gap-4 overflow-hidden z-10 relative">
                  <div className="justify-start"><span className="text-black text-base font-medium font-['Manrope']">{plan.daysActive} дни</span><span className="text-neutral-400 text-base font-medium font-['Manrope']"> от началото на плана Ви</span></div>
                  <div className="justify-start"><span className="text-black text-base font-medium font-['Manrope']">{plan.daysToNext} дни</span><span className="text-neutral-400 text-base font-medium font-['Manrope']"> до следващото плащане</span></div>
                  <div className="px-4 py-2 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex justify-start items-center gap-3">
                    <div className="justify-start text-black text-base font-medium font-['Manrope']">Промяна на плана</div>
                  </div>
                </div>
              </div>
              <div className="self-stretch p-4 bg-white rounded-xl shadow-[0px_8px_24px_0px_rgba(0,0,0,0.04)] outline outline-1 outline-offset-[-0.50px] outline-gray-200 flex flex-col justify-start items-start gap-4 overflow-hidden">
                <div className="justify-start text-black text-lg font-semibold font-['Manrope']">Методи за плащане</div>
                <div className="self-stretch h-0 outline outline-1 outline-offset-[-0.50px] outline-gray-200" />
                {paymentMethods.map((method, index) => (
                  <div key={index} className="self-stretch inline-flex justify-between items-center">
                    <div className="flex justify-center items-center gap-4">
                      <div className={`w-12 h-6 p-1 ${method.active ? 'bg-black' : 'rounded-[30px] outline outline-1 outline-offset-[-1px] outline-gray-200'} flex ${method.active ? 'justify-end' : 'justify-start'} items-center gap-2`}>
                        <div className={`w-4 h-4 ${method.active ? 'bg-white' : 'bg-black'} rounded-full`} />
                      </div>
                      <img src="/icons/visa.svg" alt="Visa" className="w-8 h-8" />
                      <div className="justify-start text-neutral-400 text-base font-medium font-['Manrope']">**** {method.last4}</div>
                    </div>
                    <button className="w-5 h-5 flex items-center justify-center">
                      <img src="/icons/account_x.svg" alt="Премахни" className="w-4 h-4 opacity-60" />
                    </button>
                  </div>
                ))}
                <div className="self-stretch h-0 outline outline-1 outline-offset-[-0.50px] outline-gray-200" />
                <div className="px-4 py-2 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex justify-start items-center gap-3">
                  <div className="justify-start text-black text-base font-medium font-['Manrope']">Добави нов метод</div>
                </div>
              </div>
            </div>
            <div className="flex-1 inline-flex flex-col justify-center items-start gap-5">
              <div className="self-stretch p-4 bg-white rounded-xl shadow-[0px_8px_24px_0px_rgba(0,0,0,0.04)] outline outline-1 outline-offset-[-0.50px] outline-gray-200 flex flex-col justify-start items-start gap-4 overflow-hidden">
                <div className="justify-start text-black text-lg font-semibold font-['Manrope']">История на използване</div>
                <div className="self-stretch p-3 bg-white rounded-xl shadow-[0px_8px_24px_0px_rgba(0,0,0,0.04)] outline outline-1 outline-offset-[-1px] outline-gray-200 flex flex-col justify-start items-start gap-3">
                  <div className="self-stretch inline-flex justify-between items-center">
                    <div className="justify-start text-black text-sm font-medium font-['Manrope']">{totalCalculations} изчисления</div>
                    <img src="/icons/infinity.svg" alt="Infinity" className="w-3 h-2"/>
                  </div>
                  <div className="w-[723.13px] h-2 origin-top-left rotate-180 rounded-[100px]">
                    <img
                      src="/images/account_gradient.png"
                      alt="Прогрес"
                      className="w-[723.13px] h-2 origin-top-left rotate-180 rounded-[100px]"
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                </div>
                <div className="self-stretch bg-stone-50 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 flex flex-col justify-start items-start gap-px overflow-hidden">
                  <div className="self-stretch shadow-[0px_8px_24px_0px_rgba(0,0,0,0.04)] inline-flex justify-start items-start gap-px">
                    <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                      <div className="justify-start text-black text-sm font-medium font-['Manrope']">Инструмент</div>
                    </div>
                    <div className="w-48 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                      <div className="justify-start text-black text-sm font-medium font-['Manrope']">Дата</div>
                    </div>
                  </div>
                  {usageHistory.map((h, i) => (
                    <div key={i} className="self-stretch inline-flex justify-start items-start gap-px">
                      <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                        <div className="justify-start text-neutral-400 text-sm font-medium font-['Manrope']">{h.tool}</div>
                      </div>
                      <div className="w-48 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                        <div className="justify-start text-neutral-400 text-sm font-medium font-['Manrope']">{h.date}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="self-stretch inline-flex justify-center items-center gap-4">
                  <div className="flex justify-start items-center gap-2">
                    <div className="w-7 self-stretch px-2 py-1 rounded inline-flex flex-col justify-center items-center">
                    <img src="/icons/small_left_arrow.svg" alt="Назад" className="w-3 h-3" />
                    </div>
                    <div className="w-7 px-2 py-1 bg-gray-200 rounded inline-flex flex-col justify-center items-center">
                      <div className="justify-start text-black text-sm font-medium font-['Manrope']">1</div>
                    </div>
                    <div className="w-7 px-2 py-1 rounded outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex flex-col justify-center items-center">
                      <div className="justify-start text-neutral-400 text-sm font-medium font-['Manrope']">2</div>
                    </div>
                    <div className="w-7 px-2 py-1 rounded outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex flex-col justify-center items-center">
                      <div className="justify-start text-neutral-400 text-sm font-medium font-['Manrope']">3</div>
                    </div>
                    <div className="w-7 px-2 py-1 rounded outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex flex-col justify-center items-center">
                      <div className="justify-start text-neutral-400 text-sm font-medium font-['Manrope']">4</div>
                    </div>
                    <div className="w-7 self-stretch px-2 py-1 rounded inline-flex flex-col justify-center items-center">
                    <img src="/icons/small_right_arrow.svg" alt="Напред" className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="self-stretch p-4 bg-white rounded-xl outline outline-1 outline-offset-[-0.50px] outline-gray-200 inline-flex flex-col justify-start items-start gap-4 overflow-hidden">
                <div className="justify-start text-black text-lg font-semibold font-['Manrope']">История на плащания</div>
                <div className="self-stretch bg-stone-50 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 flex flex-col justify-start items-start gap-px overflow-hidden">
                  <div className="self-stretch shadow-[0px_8px_24px_0px_rgba(0,0,0,0.04)] inline-flex justify-start items-start gap-px">
                    <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                      <div className="justify-start text-black text-sm font-medium font-['Manrope']">Метод на плащане</div>
                    </div>
                    <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                      <div className="justify-start text-black text-sm font-medium font-['Manrope']">Стойност</div>
                    </div>
                    <div className="w-48 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                      <div className="justify-start text-black text-sm font-medium font-['Manrope']">Дата</div>
                    </div>
                  </div>
                  {paymentHistory.map((payment, i) => (
                    <div key={i} className="self-stretch inline-flex justify-start items-center gap-px">
                      <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                        <img src="/icons/visa_small.svg" alt="Visa" className="w-5 h-5" />
                        <div className="justify-start text-neutral-400 text-sm font-medium font-['Manrope']">{payment.method}</div>
                      </div>
                      <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                        <div className="justify-start text-neutral-400 text-sm font-medium font-['Manrope']">{payment.amount}</div>
                      </div>
                      <div className="w-48 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                        <div className="justify-start text-neutral-400 text-sm font-medium font-['Manrope']">{payment.date}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="self-stretch inline-flex justify-center items-center gap-4">
                  <div className="flex justify-start items-center gap-2">
                    <div className="w-7 self-stretch px-2 py-1 rounded inline-flex flex-col justify-center items-center">
                      <img src="/icons/small_left_arrow.svg" alt="Назад" className="w-3 h-3" />
                    </div>
                    <div className="w-7 px-2 py-1 bg-gray-200 rounded inline-flex flex-col justify-center items-center">
                      <div className="justify-start text-black text-sm font-medium font-['Manrope']">1</div>
                    </div>
                    <div className="w-7 px-2 py-1 rounded outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex flex-col justify-center items-center">
                      <div className="justify-start text-neutral-400 text-sm font-medium font-['Manrope']">2</div>
                    </div>
                    <div className="w-7 self-stretch px-2 py-1 rounded inline-flex flex-col justify-center items-center">
                      <img src="/icons/small_right_arrow.svg" alt="Напред" className="w-3 h-3" />
                    </div>
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

export default Account; 