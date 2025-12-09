import React, { useState, useEffect } from 'react';
import SEO from '../shared/SEO';
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
  
  console.log('Account.js loaded, user:', user);
  console.log('Token in localStorage:', localStorage.getItem('token'));
  
  // Function to refresh limits
  const refreshLimits = async () => {
    try {
      console.log('Refreshing limits...');
      const limits = await CalculationService.checkLimits();
      console.log('New limits:', limits);
      setCalculationLimits(limits);
    } catch (error) {
      console.log('Failed to refresh limits:', error);
    }
  };

  // Function to reload usage history when page changes
  const reloadUsageHistory = async (page) => {
    if (!user) return;
    try {
      console.log('Reloading usage history for page:', page);
      setLoading(true);
      const calculationData = await CalculationService.getCalculationHistory(page, usageItemsPerPage);
      console.log('Calculation data received:', calculationData);
      setUsageHistory(calculationData.calculations.map(calc => ({
        tool: calc.toolDisplayName[t.language] || calc.toolDisplayName.bg,
        date: new Date(calc.createdAt).toLocaleString('bg-BG')
      })));
      setTotalCalculations(calculationData.pagination.total);
    } catch (error) {
      console.log('Failed to reload usage history:', error);
    } finally {
      setLoading(false);
    }
  };

  // Function to reload payment history when page changes
  const reloadPaymentHistory = async (page) => {
    if (!user) return;
    try {
      setLoading(true);
      const paymentData = await PaymentService.getPaymentHistory(page, paymentItemsPerPage);
      setPaymentHistory(paymentData.payments.map(payment => ({
        method: `**** ${payment.paymentMethod.last4}`,
        amount: `${payment.amount}${payment.currency}`,
        date: new Date(payment.createdAt).toLocaleString('bg-BG')
      })));
    } catch (error) {
      console.log('Failed to reload payment history:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // State for real data
  const [plan, setPlan] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [usageHistory, setUsageHistory] = useState([]);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [totalCalculations, setTotalCalculations] = useState(0);
  const [calculationLimits, setCalculationLimits] = useState({ used: 0, limit: 5, unlimited: false });
  const [planExpiryDate, setPlanExpiryDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination state for usage history
  const [usageCurrentPage, setUsageCurrentPage] = useState(1);
  const usageItemsPerPage = 5;
  const usageTotalPages = Math.ceil(usageHistory.length / usageItemsPerPage);
  const paginatedUsageHistory = usageHistory.slice((usageCurrentPage - 1) * usageItemsPerPage, usageCurrentPage * usageItemsPerPage);

  // Pagination state for payment history
  const [paymentCurrentPage, setPaymentCurrentPage] = useState(1);
  const paymentItemsPerPage = 5;
  const paymentTotalPages = Math.ceil(paymentHistory.length / paymentItemsPerPage);
  const paginatedPaymentHistory = paymentHistory.slice((paymentCurrentPage - 1) * paymentItemsPerPage, paymentCurrentPage * paymentItemsPerPage);

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
        let subscriptionData = null;
        try {
          subscriptionData = await PlanService.getCurrentSubscription();
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
          try {
            const plans = await PlanService.getPlans();
            const freePlan = plans.find(p => p.name === 'free');
            setPlan(freePlan);
          } catch (planError) {
            console.log('Failed to load plans, using default free plan');
            setPlan({
              name: 'free',
              displayName: { bg: 'Безплатен план (По подразбиране)', en: 'Free Plan (Default)' },
              limits: { calculationsPerMonth: 5, unlimited: false }
            });
          }
          setSubscription(null);
        }
        
        // Load calculation history and limits from backend
        try {
          console.log('Loading calculation history...');
          const calculationData = await CalculationService.getCalculationHistory(1, usageItemsPerPage);
          console.log('Calculation history received:', calculationData);
          setUsageHistory(calculationData.calculations.map(calc => ({
            tool: calc.toolDisplayName[t.language] || calc.toolDisplayName.bg,
            date: new Date(calc.createdAt).toLocaleString('bg-BG')
          })));
          setTotalCalculations(calculationData.pagination.total);
          
          // Load calculation limits
          console.log('Loading calculation limits...');
          const limits = await CalculationService.checkLimits();
          console.log('Limits received:', limits);
          setCalculationLimits(limits);
          
          // Set plan expiry date
          if (subscriptionData?.endDate) {
            setPlanExpiryDate(new Date(subscriptionData.endDate));
          } else {
            // For free plan, set to end of current month
            const now = new Date();
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
            setPlanExpiryDate(endOfMonth);
          }
        } catch (calcError) {
          console.log('No calculation history found from database');
          setUsageHistory([]);
          setTotalCalculations(0);
          setCalculationLimits({ used: 0, limit: 5, unlimited: false });
          
          // Set fallback expiry date
          const now = new Date();
          const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          setPlanExpiryDate(endOfMonth);
        }
        
        // Load payment history (only if user is logged in)
        try {
          const paymentData = await PaymentService.getPaymentHistory(1, paymentItemsPerPage);
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
        // Show error for any database connection issues
        console.error('Database connection error:', err);
        setError('Failed to connect to database. Please check your internet connection and try again.');
      } finally {
        setLoading(false);
      }
    };

    loadAccountData();
  }, [user, t.language]);

  // Update limits when plan changes
  useEffect(() => {
    if (plan) {
      if (plan.name === 'free') {
        setCalculationLimits(prev => ({
          ...prev,
          limit: plan.limits?.calculationsPerMonth || 5,
          unlimited: false
        }));
      } else {
        setCalculationLimits(prev => ({
          ...prev,
          unlimited: true
        }));
      }
    }
  }, [plan]);

  // Listen for calculation events to refresh limits and history
  useEffect(() => {
    console.log('Setting up calculationCompleted event listener, user:', user);
    
    const handleCalculationUpdate = () => {
      console.log('Calculation completed event received!');
      refreshLimits();
      // Also refresh usage history when new calculation is completed (always go to page 1)
      if (user) {
        console.log('User is logged in, refreshing usage history...');
        setUsageCurrentPage(1); // Reset to first page
        reloadUsageHistory(1);
      } else {
        console.log('User is not logged in, skipping history refresh');
      }
    };

    window.addEventListener('calculationCompleted', handleCalculationUpdate);
    console.log('Event listener added');
    
    // Test: Manually trigger event after 2 seconds to test if listener works
    setTimeout(() => {
      console.log('Testing event listener...');
      window.dispatchEvent(new CustomEvent('calculationCompleted'));
    }, 2000);
    
    return () => {
      window.removeEventListener('calculationCompleted', handleCalculationUpdate);
      console.log('Event listener removed');
    };
  }, [user]);

  // Reload usage history when page changes
  useEffect(() => {
    if (user && usageCurrentPage > 1) {
      reloadUsageHistory(usageCurrentPage);
    }
  }, [usageCurrentPage, user]);

  // Reload payment history when page changes
  useEffect(() => {
    if (user && paymentCurrentPage > 1) {
      reloadPaymentHistory(paymentCurrentPage);
    }
  }, [paymentCurrentPage, user]);

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
      <SEO
        title={t.accountTitle}
        description={t.accountDescription}
        canonical="/account"
      />
      <div className="w-full min-h-screen bg-stone-50 flex flex-col items-center">
        <div className="w-[1180px] mt-8 mb-8 inline-flex flex-col justify-start items-start gap-10">
          <div className="self-stretch justify-start text-black text-3xl font-bold font-['Manrope']">{t.accountTitle}</div>
          
          {/* Debug Test Buttons */}
          <div className="flex gap-4">
            <button 
              onClick={async () => {
                console.log('Testing API manually...');
                try {
                  const limits = await CalculationService.checkLimits();
                  console.log('Manual limits test:', limits);
                  const history = await CalculationService.getCalculationHistory(1, 5);
                  console.log('Manual history test:', history);
                } catch (error) {
                  console.error('Manual test error:', error);
                }
              }}
              className="px-4 py-2 bg-red-500 text-white rounded"
            >
              Test API Manually
            </button>
            
            <button 
              onClick={() => {
                console.log('Manually triggering calculationCompleted event...');
                window.dispatchEvent(new CustomEvent('calculationCompleted'));
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Test Event
            </button>
          </div>
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
                {/* Progress Bar - Different design for free vs paid plans */}
                {plan?.name === 'free' || !plan || calculationLimits.unlimited === false ? (
                  // Free Plan Progress Bar
                  <div className="w-[748px] p-3 bg-white rounded-xl shadow-[0px_8px_24px_0px_rgba(0,0,0,0.04)] outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex flex-col justify-start items-start gap-3">
                    <div className="self-stretch inline-flex justify-between items-center">
                      <div className="justify-start">
                        <span className="text-black text-sm font-medium font-['Manrope']">
                          {calculationLimits.used}/{calculationLimits.limit}
                        </span>
                        <span className="text-neutral-400 text-sm font-medium font-['Manrope']">
                          {' '}{t.freeCalculationsUntil} {planExpiryDate ? planExpiryDate.toLocaleDateString(t.language === 'bg' ? 'bg-BG' : 'en-US') : ''}
                        </span>
                      </div>
                      <Link to="/prices" className="flex justify-start items-center gap-2">
                        <div className="justify-start text-black text-sm font-medium font-['Manrope']">{t.viewPlans}</div>
                        <img src="/icons/small_right_arrow.svg" alt={t.next} className="w-3 h-3 opacity-70" />
                      </Link>
                    </div>
                    <div className="w-[723.99px] h-2 bg-gray-200 rounded-[30px] relative">
                      <div 
                        className="h-2 bg-gradient-to-r from-amber-600 to-gray-800 rounded-[30px] transition-all duration-300"
                        style={{ 
                          width: `${Math.min((calculationLimits.used / calculationLimits.limit) * 100, 100)}%` 
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  // Paid Plan Progress Bar (Original)
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
                )}
                <div className="self-stretch bg-stone-50 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 flex flex-col justify-start items-start gap-px overflow-hidden">
                  <div className="self-stretch shadow-[0px_8px_24px_0px_rgba(0,0,0,0.04)] inline-flex justify-start items-start gap-px">
                    <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                      <div className="justify-start text-black text-sm font-medium font-['Manrope']">{t.tool}</div>
                    </div>
                    <div className="w-48 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                      <div className="justify-start text-black text-sm font-medium font-['Manrope']">{t.date}</div>
                    </div>
                  </div>
                  {paginatedUsageHistory.length === 0 ? (
                    <div className="w-full px-3 py-2 bg-white text-neutral-400 text-sm font-medium font-['Manrope']">Няма изчисления.</div>
                  ) : (
                    paginatedUsageHistory.map((h, i) => (
                      <div key={i} className="self-stretch inline-flex justify-start items-start gap-px">
                        <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                          <div className="justify-start text-neutral-400 text-sm font-medium font-['Manrope']">{h.tool}</div>
                        </div>
                        <div className="w-48 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                          <div className="justify-start text-neutral-400 text-sm font-medium font-['Manrope']">{h.date}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="self-stretch inline-flex justify-center items-center gap-4">
                  <div className="flex justify-start items-center gap-2">
                    <button className="w-7 self-stretch px-2 py-1 rounded inline-flex flex-col justify-center items-center" onClick={() => {
                      const newPage = Math.max(1, usageCurrentPage - 1);
                      setUsageCurrentPage(newPage);
                      if (user) reloadUsageHistory(newPage);
                    }} disabled={usageCurrentPage === 1 || loading}>
                      <img src="/icons/small_left_arrow.svg" alt={t.back} className="w-3 h-3 opacity-70" />
                    </button>
                    {Array.from({ length: usageTotalPages }, (_, i) => (
                      <button key={i} className={`w-7 px-2 py-1 rounded ${usageCurrentPage === i + 1 ? 'bg-gray-200 text-black' : 'outline outline-1 outline-offset-[-1px] outline-gray-200 text-neutral-400'} inline-flex flex-col justify-center items-center`} onClick={() => {
                        setUsageCurrentPage(i + 1);
                        if (user) reloadUsageHistory(i + 1);
                      }} disabled={usageCurrentPage === i + 1 || loading}>
                        <div className="justify-start text-sm font-medium font-['Manrope']">{i + 1}</div>
                      </button>
                    ))}
                    <button className="w-7 self-stretch px-2 py-1 rounded inline-flex flex-col justify-center items-center" onClick={() => {
                      const newPage = Math.min(usageTotalPages, usageCurrentPage + 1);
                      setUsageCurrentPage(newPage);
                      if (user) reloadUsageHistory(newPage);
                    }} disabled={usageCurrentPage === usageTotalPages || usageTotalPages === 0 || loading}>
                      <img src="/icons/small_right_arrow.svg" alt={t.next} className="w-3 h-3 opacity-70" />
                    </button>
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
                  {paginatedPaymentHistory.length === 0 ? (
                    <div className="w-full px-3 py-2 bg-white text-neutral-400 text-sm font-medium font-['Manrope']">Няма плащания.</div>
                  ) : (
                    paginatedPaymentHistory.map((payment, i) => (
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
                    ))
                  )}
                </div>
                <div className="self-stretch inline-flex justify-center items-center gap-4">
                  <div className="flex justify-start items-center gap-2">
                    <button className="w-7 self-stretch px-2 py-1 rounded inline-flex flex-col justify-center items-center" onClick={() => {
                      const newPage = Math.max(1, paymentCurrentPage - 1);
                      setPaymentCurrentPage(newPage);
                      if (user) reloadPaymentHistory(newPage);
                    }} disabled={paymentCurrentPage === 1 || loading}>
                      <img src="/icons/small_left_arrow.svg" alt={t.back} className="w-3 h-3 opacity-70" />
                    </button>
                    {Array.from({ length: paymentTotalPages }, (_, i) => (
                      <button key={i} className={`w-7 px-2 py-1 rounded ${paymentCurrentPage === i + 1 ? 'bg-gray-200 text-black' : 'outline outline-1 outline-offset-[-1px] outline-gray-200 text-neutral-400'} inline-flex flex-col justify-center items-center`} onClick={() => {
                        setPaymentCurrentPage(i + 1);
                        if (user) reloadPaymentHistory(i + 1);
                      }} disabled={paymentCurrentPage === i + 1 || loading}>
                        <div className="justify-start text-sm font-medium font-['Manrope']">{i + 1}</div>
                      </button>
                    ))}
                    <button className="w-7 self-stretch px-2 py-1 rounded inline-flex flex-col justify-center items-center" onClick={() => {
                      const newPage = Math.min(paymentTotalPages, paymentCurrentPage + 1);
                      setPaymentCurrentPage(newPage);
                      if (user) reloadPaymentHistory(newPage);
                    }} disabled={paymentCurrentPage === paymentTotalPages || paymentTotalPages === 0 || loading}>
                      <img src="/icons/small_right_arrow.svg" alt={t.next} className="w-3 h-3 opacity-70" />
                    </button>
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