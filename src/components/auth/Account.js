import React, { useState, useEffect } from 'react';
import SEO from '../shared/SEO';
import { Link } from 'react-router-dom';
import Layout from '../layout/Layout';
import { useAuth } from './AuthContext';
import { useTranslation } from '../../hooks/useTranslation';
import PlanService from '../../services/planService';
import BillingService from '../../services/billingService';
import CalculationService from '../../services/calculationService';
import UserManagementService from '../../services/userManagementService';

const Account = () => {
  const { user, logout, refreshUser } = useAuth();
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
    if (!user) {
      console.log('No user, skipping history reload');
      return;
    }
    
    try {
      console.log('Reloading usage history for page:', page);
      setLoading(true);
      const calculationData = await CalculationService.getCalculationHistory(page, usageItemsPerPage);
      console.log('Calculation data received:', calculationData);
      console.log('Calculations array:', calculationData.calculations);
      console.log('Calculations array length:', calculationData.calculations?.length || 0);
      
      // Check if we have calculations
      if (!calculationData.calculations || calculationData.calculations.length === 0) {
        console.log('No calculations found in response');
        setUsageHistory([]);
        setTotalCalculations(0);
        setUsageTotalPages(1);
        return;
      }
      
      // Map calculations to display format
      const mappedHistory = calculationData.calculations.map(calc => {
        console.log('Mapping calc:', calc);
        console.log('calc.toolDisplayName:', calc.toolDisplayName);
        console.log('t.language:', t.language);
        
        const toolName = calc.toolDisplayName?.[t.language] || 
                         calc.toolDisplayName?.bg || 
                         calc.toolDisplayName?.en ||
                         calc.toolName || 
                         t.unknownTool;
        
        console.log('Mapped toolName:', toolName);
        
        return {
          tool: toolName,
          date: new Date(calc.createdAt).toLocaleString('bg-BG')
        };
      });
      
      console.log('Mapped history:', mappedHistory);
      console.log('Mapped history length:', mappedHistory.length);
      
      setUsageHistory(mappedHistory);
      
      // Backend returns pagination.total as total pages, pagination.totalItems as total count
      const totalCount = calculationData.pagination?.totalItems || 
                        (calculationData.pagination?.total ? calculationData.pagination.total * usageItemsPerPage : 0);
      setTotalCalculations(totalCount);
      setUsageTotalPages(calculationData.pagination?.total || 1);
      
      console.log('Set usageHistory to:', mappedHistory);
      console.log('Set totalCalculations to:', totalCount);
      console.log('Set usageTotalPages to:', calculationData.pagination?.total || 1);
      
      // Update planExpiryDate from backend response if available
      if (calculationData.period?.end) {
        setPlanExpiryDate(new Date(calculationData.period.end));
      }
    } catch (error) {
      console.error('Failed to reload usage history:', error);
      console.error('Error details:', error.message, error.stack);
      setUsageHistory([]);
      setTotalCalculations(0);
      setUsageTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  // Function to reload payment history when page changes
  const reloadPaymentHistory = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const billingSummary = await BillingService.getBillingSummary();
      const invoices = billingSummary?.invoices || [];
      setPaymentHistory(invoices.map(inv => ({
        method: billingSummary?.paymentMethod?.last4 ? `**** ${billingSummary.paymentMethod.last4}` : (t.language === 'bg' ? 'Карта' : 'Card'),
        amount: `${((inv.amountPaid ?? inv.amountDue ?? 0) / 100).toFixed(2)} ${String(inv.currency || '').toUpperCase()}`,
        date: inv.created ? new Date(inv.created * 1000).toLocaleString('bg-BG') : ''
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
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [error, setError] = useState(null);
  
  // Admin panel state
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminSearch, setAdminSearch] = useState('');
  const [adminRoleFilter, setAdminRoleFilter] = useState('');
  const [adminCurrentPage, setAdminCurrentPage] = useState(1);
  const [adminTotalPages, setAdminTotalPages] = useState(1);
  const [adminTotalUsers, setAdminTotalUsers] = useState(0);

  const isProUser = user?.plan === 'pro' || ['active', 'trialing'].includes(user?.subscriptionStatus);
  const displayLimit = calculationLimits.limit > 0 ? calculationLimits.limit : 5;
  const displayUsed = Math.min(calculationLimits.used, displayLimit);
  const usageProgressPct = displayLimit ? Math.min((displayUsed / displayLimit) * 100, 100) : 0;

  // Pagination state for usage history
  const [usageCurrentPage, setUsageCurrentPage] = useState(1);
  const [usageTotalPages, setUsageTotalPages] = useState(1);
  const usageItemsPerPage = 5;
  // Don't paginate locally - we get paginated data from API
  const paginatedUsageHistory = usageHistory;

  // Pagination state for payment history
  const [paymentCurrentPage, setPaymentCurrentPage] = useState(1);
  const paymentItemsPerPage = 5;
  const paymentTotalPages = Math.ceil(paymentHistory.length / paymentItemsPerPage);
  const paginatedPaymentHistory = paymentHistory.slice((paymentCurrentPage - 1) * paymentItemsPerPage, paymentCurrentPage * paymentItemsPerPage);

  // Refresh user on mount (ensures latest plan/subscription status after billing)
  useEffect(() => {
    if (refreshUser) refreshUser();
  }, [refreshUser]);

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
        
        // Load current subscription and plan (don't let errors block other data loading)
        let subscriptionData = null;
        try {
          subscriptionData = await PlanService.getCurrentSubscription();
          if (subscriptionData) {
            setSubscription(subscriptionData);
            if (subscriptionData.planId) {
              try {
                const planData = await PlanService.getPlan(subscriptionData.planId);
                setPlan(planData);
              } catch (planError) {
                console.log('Failed to load plan, using free plan');
                const plans = await PlanService.getPlans().catch(() => []);
                const freePlan = plans.find(p => p.name === 'free');
                setPlan(freePlan || {
                  name: 'free',
                  displayName: { bg: 'Безплатен план (По подразбиране)', en: 'Free Plan (Default)' },
                  limits: { calculationsPerMonth: 5, unlimited: false }
                });
              }
            } else {
              // If no planId, show free plan
              const plans = await PlanService.getPlans().catch(() => []);
              const freePlan = plans.find(p => p.name === 'free');
              setPlan(freePlan || {
                name: 'free',
                displayName: { bg: 'Безплатен план (По подразбиране)', en: 'Free Plan (Default)' },
                limits: { calculationsPerMonth: 5, unlimited: false }
              });
            }
          } else {
            // No subscription, show free plan
            setSubscription(null);
            const plans = await PlanService.getPlans().catch(() => []);
            const freePlan = plans.find(p => p.name === 'free');
            setPlan(freePlan || {
              name: 'free',
              displayName: { bg: 'Безплатен план (По подразбиране)', en: 'Free Plan (Default)' },
              limits: { calculationsPerMonth: 5, unlimited: false }
            });
          }
        } catch (subError) {
          console.log('Subscription loading error (non-blocking):', subError.message);
          // Continue with free plan - don't block other data loading
          setSubscription(null);
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
        }
        
        // Load calculation history and limits from backend
        // History is automatically filtered to current month by backend
        try {
          console.log('Loading calculation history...');
          const calculationData = await CalculationService.getCalculationHistory(1, usageItemsPerPage);
          console.log('Calculation history received:', calculationData);
          console.log('Calculations array:', calculationData.calculations);
          console.log('Pagination:', calculationData.pagination);
          
          // Check if we have calculations
          if (!calculationData.calculations || calculationData.calculations.length === 0) {
            console.log('No calculations found in initial load');
            setUsageHistory([]);
            setTotalCalculations(0);
            setUsageTotalPages(1);
          } else {
            // Map calculations to display format
            const mappedHistory = calculationData.calculations.map(calc => {
              console.log('Mapping calc:', calc);
              console.log('calc.toolDisplayName:', calc.toolDisplayName);
              console.log('t.language:', t.language);
              
              const toolName = calc.toolDisplayName?.[t.language] || 
                               calc.toolDisplayName?.bg || 
                               calc.toolDisplayName?.en ||
                               calc.toolName || 
                               'Неизвестен инструмент';
              
              console.log('Mapped toolName:', toolName);
              
              return {
                tool: toolName,
                date: new Date(calc.createdAt).toLocaleString('bg-BG')
              };
            });
            
            console.log('Mapped history:', mappedHistory);
            console.log('Mapped history length:', mappedHistory.length);
            setUsageHistory(mappedHistory);
          }
          
          // Backend returns pagination.total as total pages, pagination.totalItems as total count
          const totalCount = calculationData.pagination.totalItems || (calculationData.pagination.total * usageItemsPerPage);
          setTotalCalculations(totalCount);
          setUsageTotalPages(calculationData.pagination.total || 1);
          
          // Update planExpiryDate from backend response if available
          if (calculationData.period?.end) {
            setPlanExpiryDate(new Date(calculationData.period.end));
          }
          
          // Load calculation limits
          console.log('Loading calculation limits...');
          const limits = await CalculationService.checkLimits();
          console.log('Limits received:', limits);
          setCalculationLimits(limits);
          
          // Set plan expiry date based on backend response or subscription
          if (limits.periodEnd) {
            setPlanExpiryDate(new Date(limits.periodEnd));
          } else if (subscriptionData?.endDate) {
            setPlanExpiryDate(new Date(subscriptionData.endDate));
          } else {
            setPlanExpiryDate(null);
          }
          // Prefer limits.used for consistent counts
          if (typeof limits.used === 'number') {
            setTotalCalculations(limits.used);
          }
        } catch (calcError) {
          console.log('No calculation history found from database');
          setUsageHistory([]);
          setTotalCalculations(0);
          setCalculationLimits({ used: 0, limit: 5, unlimited: false });
          setPlanExpiryDate(null);
        }
        
        // Load billing data from Stripe (only if user is logged in)
        try {
          const billingSummary = await BillingService.getBillingSummary();
          
          if (billingSummary?.subscription && !subscriptionData) {
            setSubscription({
              startDate: billingSummary.subscription.currentPeriodStart,
              endDate: billingSummary.subscription.currentPeriodEnd
            });
          }
          
          if (billingSummary?.paymentMethod?.last4) {
            setPaymentMethods([{
              last4: billingSummary.paymentMethod.last4,
              active: true,
              brand: billingSummary.paymentMethod.brand || 'visa'
            }]);
          } else {
            setPaymentMethods([]);
          }
          
          const invoices = billingSummary?.invoices || [];
          setPaymentHistory(invoices.map(inv => ({
            method: billingSummary?.paymentMethod?.last4 ? `**** ${billingSummary.paymentMethod.last4}` : (t.language === 'bg' ? 'Карта' : 'Card'),
            amount: `${((inv.amountPaid ?? inv.amountDue ?? 0) / 100).toFixed(2)} ${String(inv.currency || '').toUpperCase()}`,
            date: inv.created ? new Date(inv.created * 1000).toLocaleString('bg-BG') : ''
          })));
        } catch (paymentError) {
          console.log('No billing history found');
          setPaymentHistory([]);
          setPaymentMethods([]);
        }
        
      } catch (err) {
        console.error('Error loading account data:', err);
        // Show error for any database connection issues
        console.error('Database connection error:', err);
        setError('Failed to connect to database. Please check your internet connection and try again.');
      } finally {
        setLoading(false);
        setInitialLoadDone(true);
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
  // Only refresh if we're still in the same month period
  useEffect(() => {
    console.log('Setting up calculationCompleted event listener, user:', user);
    
    const handleCalculationUpdate = () => {
      console.log('Calculation completed event received!');
      
      // Check if we're still in the same month period
      const now = new Date();
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      
      // Only refresh if we're still in the current month period
      // or if planExpiryDate is not set (first load)
      const shouldRefresh = !planExpiryDate || 
        (now >= currentMonthStart && now <= currentMonthEnd);
      
      if (shouldRefresh) {
        console.log('Refreshing limits and history (within current month period)');
        refreshLimits();
        // Also refresh usage history when new calculation is completed (always go to page 1)
        if (user) {
          console.log('User is logged in, refreshing usage history...');
          setUsageCurrentPage(1); // Reset to first page
          reloadUsageHistory(1);
        } else {
          console.log('User is not logged in, skipping history refresh');
        }
      } else {
        console.log('Skipping refresh - outside current month period');
      }
    };

    window.addEventListener('calculationCompleted', handleCalculationUpdate);
    console.log('Event listener added');
    
    return () => {
      window.removeEventListener('calculationCompleted', handleCalculationUpdate);
      console.log('Event listener removed');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, planExpiryDate]);

  // Reload usage history when page changes
  useEffect(() => {
    if (user) {
      console.log('Reloading usage history for page:', usageCurrentPage);
      reloadUsageHistory(usageCurrentPage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usageCurrentPage, user, planExpiryDate]);

  // Reload payment history when page changes
  useEffect(() => {
    if (user && paymentCurrentPage > 1) {
      reloadPaymentHistory(paymentCurrentPage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentCurrentPage, user]);

  // Load admin users list
  const loadAdminUsers = async (page = 1) => {
    // Check if user is logged in and is admin
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!user || user.role !== 'admin' || !token) {
      setAdminUsers([]);
      setAdminTotalPages(1);
      setAdminTotalUsers(0);
      return;
    }
    
    try {
      setAdminLoading(true);
      const data = await UserManagementService.getUsers(page, 20, adminSearch, adminRoleFilter);
      setAdminUsers(data.users);
      setAdminTotalPages(data.pagination.totalPages || data.pagination.total || 1);
      setAdminTotalUsers(data.pagination.totalUsers || 0);
    } catch (error) {
      console.error('Error loading admin users:', error);
      // Don't show alert if user is not logged in - just silently fail
      if (error.message !== 'Не сте влезли в системата') {
        alert(error.message || 'Грешка при зареждане на потребителите');
      }
      setAdminUsers([]);
      setAdminTotalPages(1);
      setAdminTotalUsers(0);
    } finally {
      setAdminLoading(false);
    }
  };

  // Load admin users when user is admin and search/filter changes
  useEffect(() => {
    if (user && user.role === 'admin') {
      loadAdminUsers(1);
      setAdminCurrentPage(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, adminSearch, adminRoleFilter]);

  // Load admin users when page changes
  useEffect(() => {
    if (user && user.role === 'admin') {
      loadAdminUsers(adminCurrentPage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminCurrentPage]);

  // Handle role change
  const handleRoleChange = async (userId, newRole) => {
    if (!window.confirm(`Сигурни ли сте, че искате да промените ролята на този потребител на "${newRole}"?`)) {
      return;
    }

    try {
      await UserManagementService.updateUserRole(userId, newRole);
      alert('Ролята е променена успешно!');
      loadAdminUsers(adminCurrentPage); // Refresh list
    } catch (error) {
      console.error('Error updating role:', error);
      alert(error.message || 'Грешка при промяна на ролята');
    }
  };

  // Default plan if no subscription
  const defaultPlan = {
    name: t.freePlan,
    daysActive: 0,
    daysToNext: 0,
  };

  if (loading && !initialLoadDone) {
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
                    {user?.plan === 'pro'
                      ? (t.language === 'en' ? 'Professional Plan (Pro)' : 'Професионален план (Pro)')
                      : (plan?.displayName?.[t.language] || (plan?.name === 'free' ? t.freePlan : plan?.name) || defaultPlan.name)}
                  </div>
                </div>
                <div className="self-stretch p-4 bg-white rounded-tl rounded-tr rounded-bl-xl rounded-br-xl shadow-[0px_8px_24px_0px_rgba(0,0,0,0.04)] outline outline-1 outline-offset-[-0.50px] outline-gray-200 flex flex-col justify-start items-start gap-4 overflow-hidden z-10 relative">
                  <div className="justify-start"><span className="text-black text-base font-medium font-['Manrope']">{subscription?.startDate ? Math.floor((new Date() - new Date(subscription.startDate)) / (1000 * 60 * 60 * 24)) : 0} {t.daysFromStart}</span></div>
                  <div className="justify-start"><span className="text-black text-base font-medium font-['Manrope']">{subscription?.endDate ? Math.floor((new Date(subscription.endDate) - new Date()) / (1000 * 60 * 60 * 24)) : (plan?.name === 'free' ? '0' : 0)} {t.daysToNext}</span></div>
                  {(user?.hasBillingCustomer || user?.plan === 'pro') ? (
                    <button
                      onClick={async () => {
                        try {
                          const { url } = await BillingService.createPortalSession();
                          if (url) window.location.href = url;
                        } catch (err) {
                          alert(err.message);
                        }
                      }}
                      className="px-4 py-2 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex justify-start items-center gap-3"
                    >
                      <div className="justify-start text-black text-base font-medium font-['Manrope']">{t.manageSubscription || 'Управление на абонамента'}</div>
                    </button>
                  ) : (
                    <Link to="/prices" className="px-4 py-2 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex justify-start items-center gap-3">
                      <div className="justify-start text-black text-base font-medium font-['Manrope']">{t.changePlan}</div>
                    </Link>
                  )}
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
                {!isProUser ? (
                  // Free Plan Progress Bar
                  <div className="w-[748px] p-3 bg-white rounded-xl shadow-[0px_8px_24px_0px_rgba(0,0,0,0.04)] outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex flex-col justify-start items-start gap-3">
                    <div className="self-stretch inline-flex justify-between items-center">
                      <div className="justify-start">
                        <span className="text-black text-sm font-medium font-['Manrope']">
                          {displayUsed}/{displayLimit}
                        </span>
                        <span className="text-neutral-400 text-sm font-medium font-['Manrope']">
                          {' '}{t.freeCalculationsUntil}
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
                          width: `${usageProgressPct}%` 
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  // Paid Plan Progress Bar (always full)
                  <div className="self-stretch p-3 bg-white rounded-xl shadow-[0px_8px_24px_0px_rgba(0,0,0,0.04)] outline outline-1 outline-offset-[-1px] outline-gray-200 flex flex-col justify-start items-start gap-3">
                    <div className="self-stretch inline-flex justify-between items-center">
                      <div className="justify-start text-black text-sm font-medium font-['Manrope']">{totalCalculations} {t.calculations}</div>
                      <img src="/icons/infinity.svg" alt="Infinity" className="w-3 h-2"/>
                    </div>
                    <div
                      className="w-full h-2 rounded-[100px]"
                      style={{
                        backgroundImage: 'url(/images/account_gradient.png)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}
                    />
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
                  {(() => {
                    console.log('Rendering usage history:');
                    console.log('  - paginatedUsageHistory:', paginatedUsageHistory);
                    console.log('  - paginatedUsageHistory.length:', paginatedUsageHistory?.length || 0);
                    console.log('  - usageHistory state:', usageHistory);
                    console.log('  - usageHistory.length:', usageHistory?.length || 0);
                    console.log('  - usageCurrentPage:', usageCurrentPage);
                    console.log('  - usageTotalPages:', usageTotalPages);
                    
                    if (!paginatedUsageHistory || paginatedUsageHistory.length === 0) {
                      console.log('  - No history to display, showing empty message');
                      return (
                        <div className="w-full px-3 py-2 bg-white text-neutral-400 text-sm font-medium font-['Manrope']">Няма изчисления.</div>
                      );
                    }
                    
                    console.log('  - Rendering', paginatedUsageHistory.length, 'items');
                    return paginatedUsageHistory.map((h, i) => {
                      console.log(`  - Rendering item ${i}:`, h);
                      return (
                        <div key={i} className="self-stretch inline-flex justify-start items-start gap-px">
                          <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                            <div className="justify-start text-neutral-400 text-sm font-medium font-['Manrope']">{h.tool || 'Неизвестен инструмент'}</div>
                          </div>
                          <div className="w-48 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                            <div className="justify-start text-neutral-400 text-sm font-medium font-['Manrope']">{h.date || 'Няма дата'}</div>
                          </div>
                        </div>
                      );
                    });
                  })()}
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

          {/* Admin Panel Section - Only visible for admins */}
          {user && user.role === 'admin' && (
            <div className="self-stretch flex flex-col justify-start items-start gap-4">
              <div className="self-stretch justify-start text-black text-2xl font-bold font-['Manrope']">{t.adminPanel}</div>
              
              {/* Search and Filter */}
              <div className="self-stretch flex gap-4">
                <input
                  type="text"
                  placeholder={t.searchByNameOrEmail}
                  value={adminSearch}
                  onChange={(e) => setAdminSearch(e.target.value)}
                  className="flex-1 p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 text-neutral-400 text-sm font-medium font-['Manrope']"
                />
                <select
                  value={adminRoleFilter}
                  onChange={(e) => setAdminRoleFilter(e.target.value)}
                  className="px-4 py-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 text-neutral-400 text-sm font-medium font-['Manrope']"
                >
                  <option value="">{t.allRoles}</option>
                  <option value="student">{t.student}</option>
                  <option value="teacher">{t.teacher}</option>
                  <option value="admin">{t.administrator}</option>
                </select>
              </div>

              {/* Users Table */}
              <div className="self-stretch rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 flex flex-col justify-start items-start gap-px overflow-hidden">
                <div className="self-stretch shadow-[0px_8px_24px_0px_rgba(0,0,0,0.04)] inline-flex justify-start items-start gap-px">
                  <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5 border-r border-gray-200">
                    <div className="text-black text-sm font-medium font-['Manrope']">{t.name}</div>
                  </div>
                  <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5 border-r border-gray-200">
                    <div className="text-black text-sm font-medium font-['Manrope']">{t.email}</div>
                  </div>
                  <div className="w-32 px-3 py-2 bg-white flex justify-center items-center gap-2.5 border-r border-gray-200">
                    <div className="text-black text-sm font-medium font-['Manrope']">{t.role}</div>
                  </div>
                  <div className="w-32 px-3 py-2 bg-white flex justify-center items-center gap-2.5 border-r border-gray-200">
                    <div className="text-black text-sm font-medium font-['Manrope']">{t.registration}</div>
                  </div>
                  <div className="w-48 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                    <div className="text-black text-sm font-medium font-['Manrope']">{t.actions}</div>
                  </div>
                </div>
                {adminLoading ? (
                  <div className="w-full px-3 py-2 bg-white text-neutral-400 text-sm font-medium font-['Manrope']">{t.loading}</div>
                ) : adminUsers.length === 0 ? (
                  <div className="w-full px-3 py-2 bg-white text-neutral-400 text-sm font-medium font-['Manrope']">{t.noUsers}</div>
                ) : (
                  adminUsers.map((adminUser) => (
                    <div key={adminUser._id || adminUser.id} className="self-stretch inline-flex justify-start items-start gap-px">
                      <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5 border-r border-gray-200">
                        <div className="justify-start text-neutral-400 text-sm font-medium font-['Manrope']">{adminUser.name}</div>
                      </div>
                      <div className="flex-1 px-3 py-2 bg-white flex justify-center items-center gap-2.5 border-r border-gray-200">
                        <div className="justify-start text-neutral-400 text-sm font-medium font-['Manrope']">{adminUser.email}</div>
                      </div>
                      <div className="w-32 px-3 py-2 bg-white flex justify-center items-center gap-2.5 border-r border-gray-200">
                        <div className={`justify-start text-sm font-medium font-['Manrope'] ${
                          adminUser.role === 'admin' ? 'text-red-600' : 
                          adminUser.role === 'teacher' ? 'text-blue-600' : 
                          'text-neutral-400'
                        }`}>
                          {adminUser.role === 'admin' ? t.administrator : 
                           adminUser.role === 'teacher' ? t.teacher : 
                           t.student}
                        </div>
                      </div>
                      <div className="w-32 px-3 py-2 bg-white flex justify-center items-center gap-2.5 border-r border-gray-200">
                        <div className="justify-start text-neutral-400 text-xs font-medium font-['Manrope']">
                          {adminUser.createdAt ? new Date(adminUser.createdAt).toLocaleDateString('bg-BG') : '-'}
                        </div>
                      </div>
                      <div className="w-48 px-3 py-2 bg-white flex justify-center items-center gap-2.5">
                        <select
                          value={adminUser.role}
                          onChange={(e) => handleRoleChange(adminUser._id || adminUser.id, e.target.value)}
                          className="px-2 py-1 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 text-sm font-medium font-['Manrope']"
                          disabled={adminUser._id === user.id || adminUser.id === user.id}
                        >
                          <option value="student">{t.student}</option>
                          <option value="teacher">{t.teacher}</option>
                          <option value="admin">{t.administrator}</option>
                        </select>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Pagination */}
              {adminTotalPages > 1 && (
                <div className="self-stretch inline-flex justify-center items-center gap-4">
                  <div className="flex justify-start items-center gap-2">
                    <button
                      className="w-7 self-stretch px-2 py-1 rounded inline-flex flex-col justify-center items-center"
                      onClick={() => setAdminCurrentPage(p => Math.max(1, p - 1))}
                      disabled={adminCurrentPage === 1 || adminLoading}
                    >
                      <img src="/icons/small_left_arrow.svg" alt={t.back} className="w-3 h-3 opacity-70" />
                    </button>
                    {Array.from({ length: Math.min(adminTotalPages, 10) }, (_, i) => {
                      const pageNum = i + 1;
                      return (
                        <button
                          key={i}
                          className={`w-7 px-2 py-1 rounded ${
                            adminCurrentPage === pageNum ? 'bg-gray-200 text-black' : 'outline outline-1 outline-offset-[-1px] outline-gray-200 text-neutral-400'
                          } inline-flex flex-col justify-center items-center`}
                          onClick={() => setAdminCurrentPage(pageNum)}
                          disabled={adminCurrentPage === pageNum || adminLoading}
                        >
                          <div className="justify-start text-sm font-medium font-['Manrope']">{pageNum}</div>
                        </button>
                      );
                    })}
                    <button
                      className="w-7 self-stretch px-2 py-1 rounded inline-flex flex-col justify-center items-center"
                      onClick={() => setAdminCurrentPage(p => Math.min(adminTotalPages, p + 1))}
                      disabled={adminCurrentPage === adminTotalPages || adminTotalPages === 0 || adminLoading}
                    >
                      <img src="/icons/small_right_arrow.svg" alt={t.next} className="w-3 h-3 opacity-70" />
                    </button>
                  </div>
                </div>
              )}

              <div className="self-stretch text-neutral-400 text-sm font-medium font-['Manrope']">
                {t.totalUsers} {adminTotalUsers}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Account; 