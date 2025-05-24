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
        <div className="w-[1180px] mt-16 flex flex-col items-start gap-10">
          <div className="text-black text-3xl font-bold font-['Manrope'] mb-2">Акаунт</div>
          <div className="w-full flex flex-row gap-5 items-start">
            {/* Left column */}
            <div className="w-96 flex flex-col gap-5">
              {/* User card */}
              <div className="p-4 bg-white rounded-xl shadow-[0px_8px_24px_0px_rgba(0,0,0,0.04)] outline outline-1 outline-offset-[-0.5px] outline-gray-200 flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <div className="text-black text-lg font-semibold font-['Manrope']">{user?.name || 'Потребител'}</div>
                  <div className="text-neutral-400 text-base font-semibold font-['Manrope']">{user?.email || ''}</div>
                </div>
                <div className="inline-flex items-center gap-2">
                  <button onClick={logout} className="px-4 py-2 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 flex items-center gap-3">
                    <span className="text-black text-base font-medium font-['Manrope']">Излез от акаунта</span>
                  </button>
                  <div className="w-9 h-9 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 flex items-center justify-center">
                    <img src="/icons/account_settings.svg" alt="Настройки" className="w-5 h-5" />
                  </div>
                </div>
              </div>
              {/* Plan card */}
              <div className="rounded-[20px] flex flex-col items-center gap-1 w-full">
                <div className="w-full px-4 py-2 relative bg-black rounded-tl-xl rounded-tr-xl flex flex-col items-center gap-4 overflow-hidden">
                  <img className="w-96 h-52 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 origin-top-left rotate-180 opacity-50" src="/images/gradient_wallpaper.jpg" alt="Plan" />
                  <div className="text-center text-white text-lg font-semibold font-['Manrope']">{plan.name}</div>
                </div>
                <div className="w-full p-4 bg-white rounded-b-xl shadow-[0px_8px_24px_0px_rgba(0,0,0,0.04)] outline outline-1 outline-offset-[-0.5px] outline-gray-200 flex flex-col gap-4">
                  <div><span className="text-black text-base font-medium font-['Manrope']">{plan.daysActive} дни</span><span className="text-neutral-400 text-base font-medium font-['Manrope']"> от началото на плана Ви</span></div>
                  <div><span className="text-black text-base font-medium font-['Manrope']">{plan.daysToNext} дни</span><span className="text-neutral-400 text-base font-medium font-['Manrope']"> до следващото плащане</span></div>
                  <button className="px-4 py-2 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 flex items-center gap-3">
                    <span className="text-black text-base font-medium font-['Manrope']">Промяна на плана</span>
                  </button>
                </div>
              </div>
              {/* Payment methods */}
              <div className="p-4 bg-white rounded-xl shadow-[0px_8px_24px_0px_rgba(0,0,0,0.04)] outline outline-1 outline-offset-[-0.5px] outline-gray-200 flex flex-col gap-4">
                <div className="text-black text-lg font-semibold font-['Manrope']">Методи за плащане</div>
                <div className="w-full h-0 outline outline-1 outline-offset-[-0.5px] outline-gray-200" />
                {/* Активна карта */}
                <div className="w-full flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    {/* Switch ON */}
                    <div className="w-12 h-6 p-1 bg-black rounded-[30px] flex justify-end items-center gap-2">
                      <div className="w-4 h-4 bg-white rounded-full" />
                    </div>
                    <img src="/icons/visa.svg" alt="Visa" className="w-8 h-8" />
                    <div className="text-neutral-400 text-base font-medium font-['Manrope']">**** 6225</div>
                  </div>
                  <button className="w-5 h-5 flex items-center justify-center">
                    <img src="/icons/account_x.svg" alt="Премахни" className="w-4 h-4 opacity-60" />
                  </button>
                </div>
                <div className="w-full h-0 outline outline-1 outline-offset-[-0.5px] outline-gray-200" />
                {/* Неактивна карта */}
                <div className="w-full flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    {/* Switch OFF */}
                    <div className="w-12 h-6 p-1 rounded-[30px] outline outline-1 outline-offset-[-1px] outline-gray-200 flex justify-start items-center gap-2">
                      <div className="w-4 h-4 bg-black rounded-full" />
                    </div>
                    <img src="/icons/visa.svg" alt="Visa" className="w-8 h-8" />
                    <div className="text-neutral-400 text-base font-medium font-['Manrope']">**** 4448</div>
                  </div>
                  <button className="w-5 h-5 flex items-center justify-center">
                    <img src="/icons/account_x.svg" alt="Премахни" className="w-4 h-4 opacity-60" />
                  </button>
                </div>
                <div className="w-full h-0 outline outline-1 outline-offset-[-0.5px] outline-gray-200" />
                <button className="px-4 py-2 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 flex items-center gap-3">
                  <span className="text-black text-base font-medium font-['Manrope']">Добави нов метод</span>
                </button>
              </div>
            </div>
            {/* Right column */}
            <div className="flex-1 flex flex-col gap-5">
              {/* Usage history */}
              <div className="p-4 bg-white rounded-xl shadow-[0px_8px_24px_0px_rgba(0,0,0,0.04)] outline outline-1 outline-offset-[-0.5px] outline-gray-200 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="text-black text-lg font-semibold font-['Manrope']">История на използване</div>
                  <div className="flex items-center gap-2">
                    <span className="text-neutral-400 text-sm font-medium font-['Manrope']">{totalCalculations} изчисления</span>
                    <div className="w-64 h-3 bg-gray-200 rounded-full relative overflow-hidden">
                      <div className="absolute left-0 top-0 h-3 bg-gradient-to-r from-orange-300 via-orange-400 to-black rounded-full" style={{ width: '90%' }} />
                    </div>
                    <img src="/icons/infinity.svg" alt="Infinity" className="w-5 h-5" />
                  </div>
                </div>
                <div className="p-3 bg-white rounded-xl shadow-[0px_8px_24px_0px_rgba(0,0,0,0.04)] outline outline-1 outline-offset-[-1px] outline-gray-200 flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <div className="text-black text-sm font-medium font-['Manrope']">Инструмент</div>
                    <div className="text-black text-sm font-medium font-['Manrope']">Дата</div>
                  </div>
                  {usageHistory.map((h, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <div className="text-neutral-400 text-sm font-medium font-['Manrope']">{h.tool}</div>
                      <div className="text-neutral-400 text-sm font-medium font-['Manrope']">{h.date}</div>
                    </div>
                  ))}
                </div>
                {/* Pagination */}
                <div className="flex justify-center items-center gap-2 mt-2">
                  <div className="w-7 px-2 py-1 bg-gray-200 rounded flex flex-col justify-center items-center">
                    <span className="text-black text-sm font-medium font-['Manrope']">1</span>
                  </div>
                  <div className="w-7 px-2 py-1 rounded outline outline-1 outline-offset-[-1px] outline-gray-200 flex flex-col justify-center items-center">
                    <span className="text-neutral-400 text-sm font-medium font-['Manrope']">2</span>
                  </div>
                  <div className="w-7 px-2 py-1 rounded outline outline-1 outline-offset-[-1px] outline-gray-200 flex flex-col justify-center items-center">
                    <span className="text-neutral-400 text-sm font-medium font-['Manrope']">3</span>
                  </div>
                  <div className="w-7 px-2 py-1 rounded outline outline-1 outline-offset-[-1px] outline-gray-200 flex flex-col justify-center items-center">
                    <span className="text-neutral-400 text-sm font-medium font-['Manrope']">4</span>
                  </div>
                </div>
              </div>
              {/* Payment history */}
              <div className="p-4 bg-white rounded-xl outline outline-1 outline-offset-[-0.5px] outline-gray-200 flex flex-col gap-4">
                <div className="text-black text-lg font-semibold font-['Manrope']">История на плащания</div>
                <div className="bg-stone-50 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 flex flex-col gap-px overflow-hidden">
                  <div className="flex justify-between items-center bg-white">
                    <div className="text-black text-sm font-medium font-['Manrope']">Метод на плащане</div>
                    <div className="text-black text-sm font-medium font-['Manrope']">Стойност</div>
                    <div className="text-black text-sm font-medium font-['Manrope']">Дата</div>
                  </div>
                  {paymentHistory.map((h, i) => (
                    <div key={i} className="flex justify-between items-center bg-white">
                      <div className="flex items-center gap-2">
                        <img src="/icons/visa.svg" alt="Visa Small" className="w-6 h-6" />
                        <div className="text-neutral-400 text-sm font-medium font-['Manrope']">{h.method}</div>
                      </div>
                      <div className="text-neutral-400 text-sm font-medium font-['Manrope']">{h.amount}</div>
                      <div className="text-neutral-400 text-sm font-medium font-['Manrope']">{h.date}</div>
                    </div>
                  ))}
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