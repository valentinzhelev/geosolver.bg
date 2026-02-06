import React, { useState, useEffect } from 'react';
import SEO from '../../shared/SEO';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../../layout/Layout';
import { useTranslation } from '../../../hooks/useTranslation';
import { useAuth } from '../../auth/AuthContext';
import PlanService from '../../../services/planService';
import PaymentService from '../../../services/paymentService';

const Checkout = () => {
  const { planId, billingCycle } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  useAuth(); // Required for auth context - Checkout is protected by route
  
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState({
    type: 'card',
    number: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    name: ''
  });

  useEffect(() => {
    const loadPlan = async () => {
      try {
        // Get all plans and find the one with matching name
        const plans = await PlanService.getPlans();
        const planData = plans.find(p => p.name === planId);
        
        if (!planData) {
          setError('Plan not found');
          return;
        }
        
        setPlan(planData);
      } catch (err) {
        setError('Failed to load plan details');
        console.error('Error loading plan:', err);
      } finally {
        setLoading(false);
      }
    };

    if (planId) {
      loadPlan();
    }
  }, [planId]);

  const handlePayment = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setError(null);

    try {
      // Create subscription
      const subscription = await PlanService.createSubscription(plan._id, billingCycle);
      
      // Create payment
      const payment = await PaymentService.createPayment({
        amount: billingCycle === 'yearly' ? plan.price.yearly : plan.price.monthly,
        currency: 'BGN',
        paymentMethod: {
          type: paymentMethod.type,
          last4: paymentMethod.number.slice(-4),
          brand: 'visa', // Would be determined by card number
          expiryMonth: parseInt(paymentMethod.expiryMonth),
          expiryYear: parseInt(paymentMethod.expiryYear)
        },
        subscriptionId: subscription._id,
        description: `${plan.displayName[t.language]} - ${billingCycle === 'yearly' ? 'Yearly' : 'Monthly'}`
      });

      // Simulate payment processing
      setTimeout(async () => {
        try {
          await PaymentService.updatePaymentStatus(payment._id, 'completed');
          navigate('/account?success=true');
        } catch (err) {
          await PaymentService.updatePaymentStatus(payment._id, 'failed', 'Payment processing failed');
          setError('Payment failed. Please try again.');
        }
      }, 2000);

    } catch (err) {
      setError(err.message);
      setProcessing(false);
    }
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

  if (!plan) {
    return (
      <Layout>
        <div className="w-full min-h-screen bg-stone-50 flex flex-col items-center justify-center">
          <div className="text-red-500 text-lg font-medium">Plan not found</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEO
        title={t.checkoutTitle}
        description={t.checkoutDescription}
        canonical="/checkout"
      />
      
      <div className="w-full min-h-screen bg-stone-50 flex flex-col items-center">
        <div className="w-full max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-black mb-4">{t.checkoutTitle}</h1>
            <p className="text-neutral-600">{t.checkoutSubtitle}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Plan Summary */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">{t.orderSummary}</h2>
              
              <div className="border-b pb-4 mb-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">{plan.displayName[t.language]}</h3>
                    <p className="text-sm text-neutral-600">
                      {billingCycle === 'yearly' ? t.yearlyBilling : t.monthlyBilling}
                    </p>
                  </div>
                  <div className="text-lg font-semibold">
                    {billingCycle === 'yearly' ? plan.price.yearly : plan.price.monthly}лв
                    {billingCycle === 'yearly' ? '/г' : '/м'}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm">{feature[t.language]}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Form */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">{t.paymentDetails}</h2>
              
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handlePayment} className="space-y-4">
                {/* Card Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.cardNumber}
                  </label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    value={paymentMethod.number}
                    onChange={(e) => setPaymentMethod({...paymentMethod, number: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Cardholder Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.cardholderName}
                  </label>
                  <input
                    type="text"
                    placeholder={t.cardholderNamePlaceholder}
                    value={paymentMethod.name}
                    onChange={(e) => setPaymentMethod({...paymentMethod, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Expiry and CVV */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.expiryDate}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="MM"
                        value={paymentMethod.expiryMonth}
                        onChange={(e) => setPaymentMethod({...paymentMethod, expiryMonth: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        maxLength="2"
                        required
                      />
                      <input
                        type="text"
                        placeholder="YY"
                        value={paymentMethod.expiryYear}
                        onChange={(e) => setPaymentMethod({...paymentMethod, expiryYear: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        maxLength="2"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      CVV
                    </label>
                    <input
                      type="text"
                      placeholder="123"
                      value={paymentMethod.cvv}
                      onChange={(e) => setPaymentMethod({...paymentMethod, cvv: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      maxLength="3"
                      required
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={processing}
                  className="w-full bg-black text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processing ? t.processingPayment : `${t.completePayment} - ${billingCycle === 'yearly' ? plan.price.yearly : plan.price.monthly}лв`}
                </button>
              </form>

              {/* Security Notice */}
              <div className="mt-6 text-center">
                <p className="text-xs text-neutral-500">
                  {t.securePaymentNotice}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Checkout;
