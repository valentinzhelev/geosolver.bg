import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../layout/Layout';
import { useTranslation } from '../../../hooks/useTranslation';

const BillingCancel = () => {
  const { language } = useTranslation();
  return (
    <Layout>
      <div className="w-full min-h-screen bg-stone-50 dark:bg-zinc-950 flex flex-col items-center justify-center px-4 transition-colors">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-black dark:text-white mb-2">
            {language === 'bg' ? 'Плащането е отменено' : 'Payment canceled'}
          </h1>
          <p className="text-neutral-600 dark:text-zinc-400 mb-6">
            {language === 'bg'
              ? 'Абонаментът не е завършен. Можете да опитате отново по-късно.'
              : 'The subscription was not completed. You can try again later.'}
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              to="/prices"
              className="inline-block px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-zinc-200 transition-colors"
            >
              {language === 'bg' ? 'Виж плановете' : 'View plans'}
            </Link>
            <Link
              to="/account"
              className="inline-block px-6 py-3 border border-gray-300 dark:border-zinc-600 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-zinc-800 text-black dark:text-white transition-colors"
            >
              {language === 'bg' ? 'Акаунт' : 'Account'}
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BillingCancel;
