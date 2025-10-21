import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import Layout from '../layout/Layout';
import { useAuth } from './AuthContext';
import { useTranslation } from '../../hooks/useTranslation';
import PlanService from '../../services/planService';
import PaymentService from '../../services/paymentService';
import CalculationService from '../../services/calculationService';

const Account = () => {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  
  // State for real data
  const [plan, setPlan] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [usageHistory, setUsageHistory] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [totalCalculations, setTotalCalculations] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load account data
  useEffect(() => {
    const loadAccountData = async () => {
      try {
        setLoading(true);
        
        // If user is not logged in, show free plan by default
        if (!user) {
          const plans = await PlanService.getPlans();
          const freePlan = plans.find(p => p.name === 'free');
          setPlan(freePlan);
          setSubscription(null);
          setUsageHistory([]);
          setPaymentHistory([]);
          setTotalCalculations(0);
          setPaymentMethods([]);
          setLoading(false);
          return;
        }
        
        // Load current subscription and plan
        try {
          const subscriptionData = await PlanService.getCurrentSubscription();
          setSubscription(subscriptionData);
          if (subscriptionData?.planId) {
            const planData = await PlanService.getPlan(subscriptionData.planId);
            setPlan(planData);
          } else {
            // If no subscription, show free plan
            const plans = await PlanService.getPlans();
            const freePlan = plans.find(p => p.name === 'free');
            setPlan(freePlan);
          }
        } catch (subError) {
          console.log('No subscription found, using free plan');
          const plans = await PlanService.getPlans();
          const freePlan = plans.find(p => p.name === 'free');
          setPlan(freePlan);
          setSubscription(null);
        }
        
        // Load calculation history from backend
        try {
          const calculationData = await CalculationService.getCalculationHistory(1, 10);
          setUsageHistory(calculationData.calculations.map(calc => ({
            tool: calc.toolDisplayName[t.language] || calc.toolDisplayName.bg,
            date: new Date(calc.createdAt).toLocaleString('bg-BG')
          })));
          setTotalCalculations(calculationData.pagination.total);
        } catch (calcError) {
          console.log('No calculation history found');
          setUsageHistory([]);
          setTotalCalculations(0);
        }
        
        // Load payment history (only if user is logged in)
        try {
          const paymentData = await PaymentService.getPaymentHistory(1, 10);
          setPaymentHistory(paymentData.payments.map(payment => ({
            method: `**** ${payment.paymentMethod.last4}`,
            amount: `${payment.amount}${payment.currency}`,
            date: new Date(payment.createdAt).toLocaleString('bg-BG')
          })));
        } catch (paymentError) {
          console.log('No payment history found');
          setPaymentHistory([]);
        }
        
        // Mock payment methods (would come from Stripe API)
        setPaymentMethods([
          { last4: '6225', active: true },
          { last4: '4448', active: false },
        ]);
        
      } catch (err) {
        console.error('Error loading account data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadAccountData();
  }, [user, t.language]);

  // Default plan if no subscription
  const defaultPlan = {
    name: t.freePlan,
    daysActive: 0,
    daysToNext: 0,
  };

  if (loading) {
    return (
      <Layout>
        <div className="w-full min-h-screen bg-stone-50 flex flex-col items-center justify-center">
          <div className="text-black text-lg font-medium">Loading...</div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="w-full min-h-screen bg-stone-50 flex flex-col items-center justify-center">
          <div className="text-red-500 text-lg font-medium">Error: {error}</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Helmet>
        <title>{t.accountTitle} | GeoSolver</title>
        <meta name="description" content={t.accountDescription} />
      </Helmet>
      <div className="w-full min-h-screen bg-stone-50 flex flex-col items-center">
        <div className="w-[1180px] mt-8 mb-8 inline-flex flex-col justify-start items-start gap-10">
          <div className="self-stretch justify-start text-black text-3xl font-bold font-['Manrope']">{t.accountTitle}</div>
          <div className="self-stretch inline-flex justify-start items-start gap-5">
            <div className="w-96 inline-flex flex-col justify-center items-center gap-5">
              <div className="self-stretch p-4 bg-white rounded-xl shadow-[0px_8px_24px_0px_rgba(0,0,0,0.04)] outline outline-1 outline-offset-[-0.50px] outline-gray-200 flex flex-col justify-start items-start gap-4 overflow-hidden">
                <div className="flex flex-col justify-start items-start gap-2">
                  <div className="justify-start text-black text-lg font-semibold font-['Manrope']">{user?.name || t.user}</div>
                  <div className="justify-start text-neutral-400 text-base font-semibold font-['Manrope']">{user?.email || ''}</div>
                </div>
                <div className="inline-flex justify-center items-center gap-2">
                  <button onClick={logout} className="px-4 py-2 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 flex justify-start items-center gap-3">
                    <div className="justify-start text-black text-base font-medium font-['Manrope']">{t.logoutFromAccount}</div>
                  </button>
                  <div className="w-9 h-9 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 flex justify-center items-center gap-3">
                    <img src="/icons/account_settings.svg" alt={t.settings} className="w-5 h-5" />
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
                    {plan?.displayName?.[t.language] || (plan?.name === 'free' ? t.freePlan : plan?.name) || defaultPlan.name}
                  </div>
                </div>
                <div className="self-stretch p-4 bg-white rounded-tl rounded-tr rounded-bl-xl rounded-br-xl shadow-[0px_8px_24px_0px_rgba(0,0,0,0.04)] outline outline-1 outline-offset-[-0.50px] outline-gray-200 flex flex-col justify-start items-start gap-4 overflow-hidden z-10 relative">
                  <div className="justify-start"><span className="text-black text-base font-medium font-['Manrope']">{subscription ? Math.floor((new Date() - new Date(subscription.startDate)) / (1000 * 60 * 60 * 24)) : 0} {t.daysFromStart}</span></div>
                  <div className="justify-start"><span className="text-black text-base font-medium font-['Manrope']">{subscription ? Math.floor((new Date(subscription.endDate) - new Date()) / (1000 * 60 * 60 * 24)) : (plan?.name === 'free' ? '0' : 0)} {t.daysToNext}</span></div>
                  <Link to="/prices" className="px-4 py-2 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex justify-start items-center gap-3">
                    <div className="justify-start text-black text-base font-medium font-['Manrope']">{t.changePlan}</div>
                  </Link>
                </div>
              </div>
              <div className="self-stretch p-4 bg-white rounded-xl shadow-[0px_8px_24px_0px_rgba(0,0,0,0.04)] outline outline-1 outline-offset-[-0.50px] outline-gray-200 flex flex-col justify-start items-start gap-4 overflow-hidden">
                <div className="justify-start text-black text-lg font-semibold font-['Manrope']">{t.paymentMethods}</div>
                <div className="self-stretch h-0 outline outline-1 outline-offset-[-0.50px] outline-gray-200" />
                {paymentMethods.map((method, index) => (
                  <div key={index} className="self-stretch inline-flex justify-between items-center">
                    <div className="flex justify-center items-center gap-4">
                      <div className={`w-12 h-6 p-1 rounded-[30px] ${method.active ? 'bg-black' : 'outline outline-1 outline-offset-[-1px] outline-gray-200'} flex ${method.active ? 'justify-end' : 'justify-start'} items-center gap-2`}>
                        <div className={`w-4 h-4 ${method.active ? 'bg-white' : 'bg-black'} rounded-full`} />
                      </div>
                      <img src="/icons/visa.svg" alt="Visa" className="w-8 h-8" />
                      <div className="justify-start text-neutral-400 text-base font-medium font-['Manrope']">**** {method.last4}</div>
                    </div>
                    <button className="w-5 h-5 flex items-center justify-center">
                      <img src="/icons/account_x.svg" alt={t.remove} className="w-4 h-4 opacity-60" />
                    </button>
                  </div>
                ))}
                <div className="self-stretch h-0 outline outline-1 outline-offset-[-0.50px] outline-gray-200" />
                <div className="px-4 py-2 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex justify-start items-center gap-3">
                  <div className="justify-start text-black text-base font-medium font-['Manrope']">{t.addNewMethod}</div>
                </div>
              </div>
            </div>
            <div className="flex-1 inline-flex flex-col justify-center items-start gap-5">
              <div className="self-stretch p-4 bg-white rounded-xl shadow-[0px_8px_24px_0px_rgba(0,0,0,0.04)] outline outline-1 outline-offset-[-0.50px] outline-gray-200 flex flex-col justify-start items-start gap-4 overflow-hidden">
        <div className="justify-start text-black text-lg font-semibold font-['Manrope']">{t.usageHistory}</div>
                <div className="self-stretch p-3 bg-white rounded-xl shadow-[0px_8px_24px_0px_rgba(0,0,0,0.04)] outline outline-1 outline-offset-[-1px] outline-gray-200 flex flex-col justify-start items-start gap-3">
                  <div className="self-stretch inline-flex justify-between items-center">
                    <div className="justify-start text-black text-sm font-medium font-['Manrope']">{totalCalculations} {t.calculations}</div>
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
                      <div className="justify-start text-black text-sm font-medium font-['Manrope']">{t.tool}</div>
                    </div>
                    <div className="w-48 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                      <div className="justify-start text-black text-sm font-medium font-['Manrope']">{t.date}</div>
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
                    <img src="/icons/small_left_arrow.svg" alt={t.back} className="w-3 h-3" />
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
                    <img src="/icons/small_right_arrow.svg" alt={t.next} className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="self-stretch p-4 bg-white rounded-xl outline outline-1 outline-offset-[-0.50px] outline-gray-200 inline-flex flex-col justify-start items-start gap-4 overflow-hidden">
                <div className="justify-start text-black text-lg font-semibold font-['Manrope']">{t.paymentHistory}</div>
                <div className="self-stretch bg-stone-50 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 flex flex-col justify-start items-start gap-px overflow-hidden">
                  <div className="self-stretch shadow-[0px_8px_24px_0px_rgba(0,0,0,0.04)] inline-flex justify-start items-start gap-px">
                    <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                      <div className="justify-start text-black text-sm font-medium font-['Manrope']">{t.paymentMethod}</div>
                    </div>
                    <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                      <div className="justify-start text-black text-sm font-medium font-['Manrope']">{t.value}</div>
                    </div>
                    <div className="w-48 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                      <div className="justify-start text-black text-sm font-medium font-['Manrope']">{t.date}</div>
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
                      <img src="/icons/small_left_arrow.svg" alt={t.back} className="w-3 h-3" />
                    </div>
                    <div className="w-7 px-2 py-1 bg-gray-200 rounded inline-flex flex-col justify-center items-center">
                      <div className="justify-start text-black text-sm font-medium font-['Manrope']">1</div>
                    </div>
                    <div className="w-7 px-2 py-1 rounded outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex flex-col justify-center items-center">
                      <div className="justify-start text-neutral-400 text-sm font-medium font-['Manrope']">2</div>
                    </div>
                    <div className="w-7 self-stretch px-2 py-1 rounded inline-flex flex-col justify-center items-center">
                      <img src="/icons/small_right_arrow.svg" alt={t.next} className="w-3 h-3" />
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