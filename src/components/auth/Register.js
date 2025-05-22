import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import Layout from '../layout/Layout';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const Register = () => {
  const { register, loading, error } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [purpose, setPurpose] = useState('student');
  const [agreed, setAgreed] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!agreed) return;
    const ok = await register(name, email, password, repeatPassword, purpose);
    if (ok) {
      setSuccess(true);
      setTimeout(() => navigate('/account'), 1000);
    }
  };

  return (
    <Layout>
      <Helmet>
        <title>Регистрация | GeoSolver</title>
        <meta name="description" content="Създайте акаунт в GeoSolver за достъп до всички геодезически инструменти и изчисления." />
      </Helmet>
      <div className="w-full min-h-screen bg-stone-50">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="max-w-[580px] w-full mx-auto flex flex-col gap-5">
            {/* Welcome Banner */}
            <div className="w-full px-8 md:px-14 py-6 md:py-10 relative bg-black rounded-xl flex justify-center items-center gap-4 overflow-hidden">
              <img
                className="w-full h-96 absolute origin-center rotate-180 opacity-80"
                src="/images/gradient_wallpaper.jpg"
                alt="Background"
              />
              <div className="relative z-10 flex flex-row items-center justify-center w-full gap-3">
                <span className="text-white text-lg md:text-2xl font-semibold font-['Manrope']">
                  Добре дошли в
                </span>
                <span className="flex items-center gap-2.5">
                  <img
                    src="/icons/white_logo.svg"
                    alt="GeoSolver Logo"
                    className="w-9 md:w-10 h-9 md:h-10"
                  />
                  <span className="text-white text-lg md:text-xl font-bold font-['Manrope']">
                    GeoSolver
                  </span>
                </span>
              </div>
            </div>
            {/* Register Form */}
            <form className="w-full flex flex-col justify-center items-center gap-2.5" onSubmit={handleSubmit}>
              <div className="w-full p-4 bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 flex flex-col justify-center items-center gap-6">
                <div className="w-full flex flex-col justify-start items-start gap-4">
                  {/* Name */}
                  <div className="w-full flex flex-col justify-start items-start gap-2">
                    <label className="text-black text-sm font-medium font-['Manrope']">Име и фамилия</label>
                    <input type="text" placeholder="Въведете вашето име и фамилия" className="w-full p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 text-sm font-medium font-['Manrope']" value={name} onChange={e => setName(e.target.value)} required />
                  </div>
                  {/* Email */}
                  <div className="w-full flex flex-col justify-start items-start gap-2">
                    <label className="text-black text-sm font-medium font-['Manrope']">Имейл</label>
                    <input type="email" placeholder="Въведете вашият имейл" className="w-full p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 text-sm font-medium font-['Manrope']" value={email} onChange={e => setEmail(e.target.value)} required />
                  </div>
                  {/* Password */}
                  <div className="w-full flex flex-col justify-start items-start gap-2">
                    <label className="text-black text-sm font-medium font-['Manrope']">Парола</label>
                    <input type="password" placeholder="Въведете вашата парола" className="w-full p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 text-sm font-medium font-['Manrope']" value={password} onChange={e => setPassword(e.target.value)} required />
                  </div>
                  {/* Repeat Password */}
                  <div className="w-full flex flex-col justify-start items-start gap-2">
                    <label className="text-black text-sm font-medium font-['Manrope']">Повтори паролата</label>
                    <input type="password" placeholder="Повторете вашата парола" className="w-full p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 text-sm font-medium font-['Manrope']" value={repeatPassword} onChange={e => setRepeatPassword(e.target.value)} required />
                  </div>
                  {/* Usage Purpose */}
                  <div className="w-full flex flex-col justify-start items-start gap-2">
                    <label className="text-black text-sm font-medium font-['Manrope']">За какво ще използвате GeoSolver?</label>
                    <div className="p-1.5 bg-white rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 flex flex-row justify-start items-center gap-2">
                      <button type="button" className={`px-3 py-1 rounded flex justify-center items-center gap-2.5 text-base font-['Manrope'] ${purpose === 'student' ? 'bg-gray-200 text-black' : 'text-neutral-400'}`} onClick={() => setPurpose('student')}>За учебни цели</button>
                      <button type="button" className={`px-3 py-1 rounded flex justify-center items-center gap-2.5 text-base font-['Manrope'] ${purpose === 'teacher' ? 'bg-gray-200 text-black' : 'text-neutral-400'}`} onClick={() => setPurpose('teacher')}>За преподаване</button>
                      <button type="button" className={`px-3 py-1 rounded flex justify-center items-center gap-2.5 text-base font-['Manrope'] ${purpose === 'work' ? 'bg-gray-200 text-black' : 'text-neutral-400'}`} onClick={() => setPurpose('work')}>За работа</button>
                    </div>
                  </div>
                </div>
                {/* Terms and Register Button */}
                <div className="w-full flex flex-col justify-start items-start gap-4">
                  <div className="w-full flex flex-row justify-start items-center gap-3">
                    <input type="checkbox" className="w-6 h-6 bg-white rounded border border-gray-200" checked={agreed} onChange={e => setAgreed(e.target.checked)} required />
                    <div className="flex-1 text-black text-sm font-medium font-['Manrope']">
                      Съгласен съм с <Link to="/terms" className="underline">общите условия</Link> и <Link to="/privacy" className="underline">политиката за поверителност</Link> на GeoSolver.
                    </div>
                  </div>
                  <button type="submit" className="w-full px-4 py-2 bg-black rounded-lg flex justify-center items-center gap-3 text-white text-base font-medium font-['Manrope']" disabled={loading || !agreed}>
                    {loading ? 'Регистриране...' : 'Регистрация'}
                  </button>
                  {error && <div className="w-full text-red-500 text-sm font-medium font-['Manrope']">{error}</div>}
                  {success && <div className="w-full text-green-600 text-sm font-medium font-['Manrope']">Успешна регистрация!</div>}
                  <div className="w-full flex justify-center items-center mt-2">
                    <span className="text-neutral-400 text-sm font-medium font-['Manrope']">Вече имате акаунт?</span>
                    <Link to="/login" className="ml-2 text-black text-sm font-semibold font-['Manrope'] underline">Вход</Link>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Register; 