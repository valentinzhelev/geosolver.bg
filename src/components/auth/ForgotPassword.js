import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import Layout from '../layout/Layout';
import { useAuth } from './AuthContext';

const ForgotPassword = () => {
  const { forgotPassword, loading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const msg = await forgotPassword(email);
    if (msg) {
      setSuccess(true);
      setMessage(msg);
    }
  };

  return (
    <Layout>
      <Helmet>
        <title>Забравена парола | GeoSolver</title>
      </Helmet>
      <div className="w-full min-h-screen bg-stone-50 flex flex-col items-center justify-center">
        <div className="max-w-[400px] w-full bg-white rounded-xl p-8 shadow flex flex-col gap-6">
          <h2 className="text-xl font-bold text-center">Забравена парола</h2>
          {success ? (
            <div className="text-green-600 text-center">{message || 'Провери имейла си за инструкции.'}</div>
          ) : (
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              <input
                type="email"
                className="p-3 rounded-lg outline outline-1 outline-gray-200"
                placeholder="Имейл адрес"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
              <button type="submit" className="bg-black text-white rounded-lg py-2" disabled={loading}>
                {loading ? 'Изпращане...' : 'Изпрати инструкции'}
              </button>
              {error && <div className="text-red-500 text-center text-sm">{error}</div>}
            </form>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ForgotPassword; 