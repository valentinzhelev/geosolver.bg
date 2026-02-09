import React, { useState } from 'react';
import API_BASE_URL from '../../config/api';
import SEO from '../shared/SEO';
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
      const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
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
      <SEO
        title="Нова парола"
        description="Задаване на нова парола за GeoSolver акаунт"
        canonical="/reset-password"
      />
      <div className="w-full min-h-screen bg-stone-50 flex flex-col items-center justify-center">
        <div className="w-[580px] inline-flex flex-col justify-start items-start gap-5">
          <div className="self-stretch px-14 py-10 relative rounded-xl inline-flex justify-center items-center gap-4 overflow-hidden" style={{backgroundColor: '#000'}}>
            <div className="absolute inset-0 w-full h-full" style={{backgroundImage: 'url(/images/gradient_wallpaper.jpg)', backgroundSize: 'cover', backgroundPosition: 'left', transform: 'scaleX(-1)', zIndex: 0}} />
            <div className="absolute inset-0 bg-black opacity-30 pointer-events-none" style={{zIndex: 1}} />
            <div className="relative w-full flex justify-center items-center" style={{zIndex: 2}}>
              <span className="flex-1 text-center text-white text-2xl font-semibold font-['Manrope']">...важното е да се учим от тях.</span>
            </div>
          </div>
          <div className="self-stretch px-10 flex flex-col justify-center items-center gap-2.5">
            <div className="self-stretch p-4 bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 flex flex-col justify-center items-center gap-6">
              {success ? (
                <div className="text-green-600 text-center self-stretch">Паролата е сменена успешно! Пренасочване към вход...</div>
              ) : (
                <form className="self-stretch flex flex-col justify-start items-start gap-4" onSubmit={handleSubmit}>
                  <div className="self-stretch flex flex-col justify-start items-start gap-2">
                    <div className="justify-start text-black text-sm font-medium font-['Manrope']">Нова парола</div>
                    <input
                      type="password"
                      className="self-stretch p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 flex flex-col justify-start items-start text-sm font-medium font-['Manrope']"
                      placeholder="Нова парола"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="self-stretch flex flex-col justify-start items-start gap-2">
                    <div className="justify-start text-black text-sm font-medium font-['Manrope']">Повтори нова парола</div>
                    <input
                      type="password"
                      className="self-stretch p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 flex flex-col justify-start items-start text-sm font-medium font-['Manrope']"
                      placeholder="Повтори нова парола"
                      value={repeatPassword}
                      onChange={e => setRepeatPassword(e.target.value)}
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-black rounded-lg inline-flex items-center gap-3 self-center"
                    disabled={loading}
                  >
                    <div className="justify-start text-white text-base font-medium font-['Manrope']">
                      {loading ? 'Записване...' : 'Потвърди'}
                    </div>
                  </button>
                  {error && <div className="text-red-500 text-center text-sm self-stretch">{error}</div>}
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ResetPassword; 