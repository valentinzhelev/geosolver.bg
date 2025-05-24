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
  const paymentHistory = Array(3).fill({ method: '**** 6225', amount: '19.99лв', date: '18.04.2025 14:25' });

  return (
    <Layout>
      <Helmet>
        <title>Акаунт | GeoSolver</title>
        <meta name="description" content="Вашият GeoSolver акаунт, абонамент, история и настройки." />
      </Helmet>
      <div className="w-full min-h-screen bg-stone-50">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="max-w-[1180px] w-full mx-auto flex flex-col md:flex-row gap-10">
            {/* Left column */}
            <div className="w-full md:w-96 flex flex-col justify-center items-center gap-5">
              {/* User card */}
              <div className="w-full p-4 bg-white rounded-xl shadow-[0px_8px_24px_0px_rgba(0,0,0,0.04)] outline outline-1 outline-offset-[-0.5px] outline-gray-200 flex flex-col justify-start items-start gap-4 overflow-hidden">
                <div className="flex flex-col justify-start items-start gap-2">
                  <div className="text-black text-lg font-semibold font-['Manrope']">{user?.name || 'Потребител'}</div>
                  <div className="text-neutral-400 text-base font-semibold font-['Manrope']">{user?.email || ''}</div>
                </div>
                <div className="inline-flex justify-center items-center gap-2">
                  <button onClick={logout} className="px-4 py-2 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 flex justify-start items-center gap-3">
                    <img src="/icons/account_x.svg" alt="Изход" className="w-5 h-5" />
                    <span className="text-black text-base font-medium font-['Manrope']">Излез от акаунта</span>
                  </button>
                  <div className="w-9 h-9 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 flex justify-center items-center gap-3">
                    <img src="/icons/account_settings.svg" alt="Настройки" className="w-5 h-5" />
                  </div>
                </div>
              </div>
              {/* Plan card */}
              <div className="w-full rounded-[20px] flex flex-col justify-center items-center gap-1">
                <div className="w-full px-4 py-2 relative bg-black rounded-tl-xl rounded-tr-xl flex flex-col justify-center items-center gap-4 overflow-hidden">
                  <img className="w-full h-52 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 origin-top-left rotate-180 opacity-50" src="/images/gradient_wallpaper.jpg" alt="Plan" />
                  <div className="text-center text-white text-lg font-semibold font-['Manrope']">{plan.name}</div>
                </div>
                <div className="w-full p-4 bg-white rounded-b-xl shadow-[0px_8px_24px_0px_rgba(0,0,0,0.04)] outline outline-1 outline-offset-[-0.5px] outline-gray-200 flex flex-col justify-start items-start gap-4 overflow-hidden">
                  <div><span className="text-black text-base font-medium font-['Manrope']">{plan.daysActive} дни</span><span className="text-neutral-400 text-base font-medium font-['Manrope']"> от началото на плана Ви</span></div>
                  <div><span className="text-black text-base font-medium font-['Manrope']">{plan.daysToNext} дни</span><span className="text-neutral-400 text-base font-medium font-['Manrope']"> до следващото плащане</span></div>
                  <button className="px-4 py-2 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 flex justify-start items-center gap-3">
                    <span className="text-black text-base font-medium font-['Manrope']">Промяна на плана</span>
                  </button>
                </div>
              </div>
              {/* Payment methods */}
              <div className="w-full p-4 bg-white rounded-xl shadow-[0px_8px_24px_0px_rgba(0,0,0,0.04)] outline outline-1 outline-offset-[-0.5px] outline-gray-200 flex flex-col justify-start items-start gap-4 overflow-hidden">
                <div className="text-black text-lg font-semibold font-['Manrope']">Методи за плащане</div>
                <div className="w-full h-0 outline outline-1 outline-offset-[-0.5px] outline-gray-200" />
                {paymentMethods.map((pm, i) => (
                  <div key={i} className="w-full flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <img src={`/icons/visa${pm.active ? '' : '_small'}.svg`} alt="Visa" className="w-8 h-8" />
                      <div className="text-neutral-400 text-base font-medium font-['Manrope']">**** {pm.last4}</div>
                    </div>
                    <img src="/icons/account_settings.svg" alt="Настройки" className="w-5 h-5 opacity-60" />
                  </div>
                ))}
                <div className="w-full h-0 outline outline-1 outline-offset-[-0.5px] outline-gray-200" />
                <button className="px-4 py-2 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 flex justify-start items-center gap-3">
                  <span className="text-black text-base font-medium font-['Manrope']">Добави нов метод</span>
                </button>
              </div>
            </div>
            {/* Right column */}
            <div className="flex-1 flex flex-col justify-center items-start gap-5">
              {/* Usage history */}
              <div className="w-full p-4 bg-white rounded-xl shadow-[0px_8px_24px_0px_rgba(0,0,0,0.04)] outline outline-1 outline-offset-[-0.5px] outline-gray-200 flex flex-col justify-start items-start gap-4 overflow-hidden">
                <div className="text-black text-lg font-semibold font-['Manrope']">История на използване</div>
                <div className="w-full p-3 bg-white rounded-xl shadow-[0px_8px_24px_0px_rgba(0,0,0,0.04)] outline outline-1 outline-offset-[-1px] outline-gray-200 flex flex-col justify-start items-start gap-3">
                  <div className="w-full flex justify-between items-center">
                    <div className="text-black text-sm font-medium font-['Manrope']">Инструмент</div>
                    <div className="text-black text-sm font-medium font-['Manrope']">Дата</div>
                  </div>
                  {usageHistory.map((h, i) => (
                    <div key={i} className="w-full flex justify-between items-center">
                      <div className="text-neutral-400 text-sm font-medium font-['Manrope']">{h.tool}</div>
                      <div className="text-neutral-400 text-sm font-medium font-['Manrope']">{h.date}</div>
                    </div>
                  ))}
                </div>
                {/* Pagination (пример) */}
                <div className="w-full flex justify-center items-center gap-2 mt-2">
                  {[1,2,3,4].map(n => (
                    <button key={n} className={`w-7 px-2 py-1 rounded ${n===1 ? 'bg-gray-200' : 'outline outline-1 outline-gray-200'} flex flex-col justify-center items-center`}>
                      <span className={n===1 ? 'text-black' : 'text-neutral-400'}>{n}</span>
                    </button>
                  ))}
                </div>
              </div>
              {/* Payment history */}
              <div className="w-full p-4 bg-white rounded-xl outline outline-1 outline-offset-[-0.5px] outline-gray-200 flex flex-col justify-start items-start gap-4 overflow-hidden">
                <div className="text-black text-lg font-semibold font-['Manrope']">История на плащания</div>
                <div className="w-full bg-stone-50 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 flex flex-col justify-start items-start gap-px overflow-hidden">
                  <div className="w-full flex justify-between items-center bg-white">
                    <div className="text-black text-sm font-medium font-['Manrope']">Метод на плащане</div>
                    <div className="text-black text-sm font-medium font-['Manrope']">Стойност</div>
                    <div className="text-black text-sm font-medium font-['Manrope']">Дата</div>
                  </div>
                  {paymentHistory.map((h, i) => (
                    <div key={i} className="w-full flex justify-between items-center bg-white">
                      <div className="flex items-center gap-2">
                        <img src="/icons/visa_small.svg" alt="Visa Small" className="w-6 h-6" />
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