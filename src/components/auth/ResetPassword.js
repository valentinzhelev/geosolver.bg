import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import Layout from '../layout/Layout';
import { useLocation, useNavigate } from 'react-router-dom';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const ResetPassword = () => {
  const query = useQuery();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const token = query.get('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!token) {
      setError('Липсва токен.');
      return;
    }
    if (newPassword !== repeatPassword) {
      setError('Паролите не съвпадат.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('https://geosolver-backend-production.up.railway.app/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError(data.message || 'Грешка при смяна на паролата.');
      }
    } catch {
      setError('Грешка при връзка със сървъра.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Helmet>
        <title>Нова парола | GeoSolver</title>
      </Helmet>
      <div className="w-full min-h-screen bg-stone-50 flex flex-col items-center justify-center">
        <div className="max-w-[400px] w-full bg-white rounded-xl p-8 shadow flex flex-col gap-6">
          <h2 className="text-xl font-bold text-center">Въведи нова парола</h2>
          {success ? (
            <div className="text-green-600 text-center">Паролата е сменена успешно! Пренасочване към вход...</div>
          ) : (
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              <input
                type="password"
                className="p-3 rounded-lg outline outline-1 outline-gray-200"
                placeholder="Нова парола"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
              />
              <input
                type="password"
                className="p-3 rounded-lg outline outline-1 outline-gray-200"
                placeholder="Повтори новата парола"
                value={repeatPassword}
                onChange={e => setRepeatPassword(e.target.value)}
                required
              />
              <button type="submit" className="bg-black text-white rounded-lg py-2" disabled={loading}>
                {loading ? 'Записване...' : 'Запази новата парола'}
              </button>
              {error && <div className="text-red-500 text-center text-sm">{error}</div>}
            </form>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ResetPassword; 