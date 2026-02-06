import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../layout/Layout';
import { useTranslation } from '../../../hooks/useTranslation';

const BillingSuccess = () => {
  const { language } = useTranslation();
  return (
    <Layout>
      <div className="w-full min-h-screen bg-stone-50 flex flex-col items-center justify-center px-4">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-black mb-2">
            {language === 'bg' ? 'Абонаментът е активиран!' : 'Subscription activated!'}
          </h1>
          <p className="text-neutral-600 mb-6">
            {language === 'bg'
              ? 'Благодарим! Вече имате достъп до GeoSolver Pro.'
              : 'Thank you! You now have access to GeoSolver Pro.'}
          </p>
          <Link
            to="/account"
            className="inline-block px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800"
          >
            {language === 'bg' ? 'Отиди до акаунта' : 'Go to account'}
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default BillingSuccess;
