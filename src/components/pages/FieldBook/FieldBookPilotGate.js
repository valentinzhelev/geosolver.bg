import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../layout/Layout';
import { useTranslation } from '../../../hooks/useTranslation';
import { fieldbookPilotApi } from '../../../services/fieldbookApi';

const FieldBookPilotGate = ({ access, onAccessChange }) => {
  const { language } = useTranslation();
  const bg = language === 'bg';
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState('');

  const status = access?.status;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback('');
    try {
      const res = await fieldbookPilotApi.requestAccess(message);
      setFeedback(res.message || (bg ? 'Заявката е изпратена.' : 'Request sent.'));
      onAccessChange?.(res.access, res.data);
    } catch (err) {
      setFeedback(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="w-full min-h-[60vh] flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-lg p-8 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm">
          <h1 className="text-2xl font-bold font-['Manrope'] text-black dark:text-white mb-2">
            {bg ? 'Пилот: електронни карнети' : 'Pilot: electronic field books'}
          </h1>
          <p className="text-sm text-neutral-600 dark:text-zinc-400 font-['Manrope'] leading-relaxed mb-6">
            {bg
              ? 'Пилотната версия включва нивелационен карнет с автоматично изчисление на превишения и коти. Достъпът е само за одобрени потребители.'
              : 'The pilot includes a leveling field book with automatic elevation computation. Access is for approved users only.'}
          </p>

          {status === 'pending' && (
            <div className="mb-6 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-sm font-['Manrope']">
              {bg
                ? 'Заявката ви чака одобрение. Ще получите достъп след преглед от екипа.'
                : 'Your request is pending approval.'}
            </div>
          )}

          {status === 'rejected' && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-800 dark:text-red-200 text-sm font-['Manrope']">
              {bg ? 'Заявката е отхвърлена.' : 'Your request was rejected.'}
              {access?.adminNote && (
                <p className="mt-2 text-xs opacity-90">{access.adminNote}</p>
              )}
              <p className="mt-2 text-xs">
                {bg ? 'Можете да подадете нова заявка по-долу.' : 'You may submit a new request below.'}
              </p>
            </div>
          )}

          {(!status || status === 'rejected') && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <label className="text-sm font-medium font-['Manrope'] text-black dark:text-white">
                {bg ? 'Кратко съобщение (по избор)' : 'Short message (optional)'}
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="w-full p-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm font-['Manrope']"
                placeholder={
                  bg
                    ? 'Напр. фирма, обект, учебна практика...'
                    : 'e.g. company, site, field practice...'
                }
              />
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-3 bg-black dark:bg-white text-white dark:text-black rounded-xl text-sm font-semibold font-['Manrope'] hover:opacity-90 disabled:opacity-50"
              >
                {submitting
                  ? bg
                    ? 'Изпращане...'
                    : 'Sending...'
                  : bg
                    ? 'Кандидатствай за пилот'
                    : 'Apply for pilot access'}
              </button>
            </form>
          )}

          {feedback && (
            <p className="mt-4 text-sm font-['Manrope'] text-neutral-600 dark:text-zinc-400">{feedback}</p>
          )}

          <div className="mt-8 flex flex-wrap gap-3 text-sm">
            <Link to="/account" className="text-neutral-600 dark:text-zinc-400 hover:text-black dark:hover:text-white font-['Manrope']">
              {bg ? 'Акаунт' : 'Account'}
            </Link>
            <Link to="/tools" className="text-neutral-600 dark:text-zinc-400 hover:text-black dark:hover:text-white font-['Manrope']">
              {bg ? 'Инструменти' : 'Tools'}
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default FieldBookPilotGate;
