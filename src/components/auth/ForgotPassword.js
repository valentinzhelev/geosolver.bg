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
        <div className="w-[580px] flex flex-col justify-start items-start gap-5">
          <div className="w-full px-14 py-10 relative bg-black rounded-xl flex justify-center items-center gap-4 overflow-hidden">
            <img 
              className="w-[680.50px] h-96 absolute origin-top-left rotate-180 opacity-50" 
              src="https://placehold.co/680x382" 
              alt="Background"
            />
            <div className="text-center text-white text-2xl font-semibold font-['Manrope']">
              Всеки прави грешки...
            </div>
          </div>
          
          <div className="w-full px-10 flex flex-col justify-center items-center gap-2.5">
            <div className="w-full p-4 bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 flex flex-col justify-center items-center gap-6">
              <div className="text-black text-sm font-medium font-['Manrope']">
                Забравена парола
              </div>
              
              {success ? (
                <div className="text-green-600 text-center">{message || 'Провери имейла си за инструкции.'}</div>
              ) : (
                <form className="w-full flex flex-col justify-start items-start gap-4" onSubmit={handleSubmit}>
                  <div className="w-full flex flex-col justify-start items-start gap-2">
                    <div className="text-black text-sm font-medium font-['Manrope']">
                      Имейл
                    </div>
                    <input
                      type="email"
                      className="w-full p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 text-sm font-medium font-['Manrope']"
                      placeholder="Имейл адрес"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  
                  <button 
                    type="submit" 
                    className="w-full px-4 py-2 bg-black rounded-lg flex justify-center items-center gap-3 text-white text-base font-medium font-['Manrope']"
                    disabled={loading}
                  >
                    {loading ? 'Изпращане...' : 'Изпрати код'}
                  </button>
                  
                  {error && (
                    <div className="w-full text-red-500 text-center text-sm">{error}</div>
                  )}
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ForgotPassword; 