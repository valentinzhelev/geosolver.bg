import React from 'react';
import { Helmet } from 'react-helmet';
import Layout from '../layout/Layout';
import { Link } from 'react-router-dom';

const Login = () => {
  return (
    <Layout>
      <Helmet>
        <title>Вход | GeoSolver</title>
        <meta name="description" content="Влезте в своя GeoSolver акаунт за достъп до геодезически инструменти и изчисления." />
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
              <div className="relative z-10 flex flex-col items-center w-full">
                <div className="flex flex-row items-center justify-center gap-3">
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
            </div>

            {/* Login Form */}
            <div className="w-full flex flex-col justify-center items-center gap-2.5">
              <div className="w-full p-4 bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 flex flex-col justify-center items-center gap-6">
                <div className="w-full flex flex-col justify-start items-start gap-4">
                  {/* Email Input */}
                  <div className="w-full flex flex-col justify-start items-start gap-2">
                    <label className="text-black text-sm font-medium font-['Manrope']">
                      Имейл
                    </label>
                    <input 
                      type="email"
                      placeholder="Имейл"
                      className="w-full p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 text-sm font-medium font-['Manrope']"
                    />
                  </div>

                  {/* Password Input */}
                  <div className="w-full flex flex-col justify-start items-start gap-2">
                    <label className="text-black text-sm font-medium font-['Manrope']">
                      Парола
                    </label>
                    <input 
                      type="password"
                      placeholder="Парола"
                      className="w-full p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 text-sm font-medium font-['Manrope']"
                    />
                  </div>
                </div>

                {/* Remember Me & Login Button */}
                <div className="w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex justify-start items-center gap-3">
                    <input 
                      type="checkbox"
                      className="w-6 h-6 bg-white rounded border border-gray-200"
                    />
                    <span className="text-black text-sm font-medium font-['Manrope']">
                      Запомни ме
                    </span>
                  </div>
                  <div className="flex justify-center items-center gap-3">
                    <a href="/forgot-password" className="text-neutral-400 text-sm font-medium font-['Manrope']">
                      Забравена парола
                    </a>
                    <button className="px-4 py-2 bg-black rounded-lg text-white text-sm md:text-base font-medium font-['Manrope']">
                      Вход
                    </button>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="text-neutral-400 text-sm font-medium font-['Manrope']">
                или
              </div>

              {/* Social Login & Register */}
              <div className="w-full p-4 bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 flex flex-col md:flex-row justify-center items-center gap-3">
                <button className="w-full md:flex-1 px-3 py-2 bg-gray-200 rounded-lg flex justify-center items-center gap-3">
                  <img className="w-5 h-5" src="/icons/google.svg" alt="Google" />
                  <span className="text-black text-sm md:text-base font-medium font-['Manrope']">
                    Вход с Google
                  </span>
                </button>
                <Link to="/register" className="w-full md:flex-1 px-3 py-2 bg-black rounded-lg flex justify-center items-center gap-3 text-white text-sm md:text-base font-medium font-['Manrope']">
                  Регистрация
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Login; 