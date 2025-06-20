import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useTranslation } from '../../hooks/useTranslation';
import { useTheme } from '../../context/ThemeContext';

const Header = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, loading, logout } = useAuth();
  const { t } = useTranslation();
  const { isDark, toggleTheme } = useTheme();

  // Debug: виж user в конзолата
  console.log('user in Header:', user);

  // Функция за показване на име или fallback
  const getAccountLabel = () => {
    if (!user) return t.login;
    if (user.name && user.name.trim() !== '') return user.name;
    return t.account;
  };

  // Loader компонент
  const Loader = () => (
    <div className="px-4 py-2 flex items-center gap-2">
      <span className="loader w-4 h-4 border-2 border-gray-300 dark:border-gray-600 border-t-black dark:border-t-white rounded-full animate-spin"></span>
      <span className="text-neutral-400 dark:text-gray-300 text-base font-medium font-['Manrope']">{t.loading}</span>
    </div>
  );

  return (
    <>
      {/* Desktop Header */}
      <div className="hidden md:flex w-full px-6 py-3 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 items-center justify-between">
        <div className="flex-1 flex justify-start items-center gap-2.5">
          <Link to="/" className="flex justify-start items-center gap-2.5">
            <img src="/images/logo.png" alt="GeoSolver Logo" className="w-10 h-10" />
            <div className="justify-start text-black dark:text-white text-xl font-bold font-['Manrope']">GeoSolver</div>
            <div className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded flex justify-center items-center gap-2.5">
              <div className="justify-start text-black dark:text-white text-xs font-bold font-['Manrope']">{t.beta}</div>
            </div>
          </Link>
        </div>
        <div className="flex justify-start items-center gap-2">
          <Link
            to="/"
            className={`px-3 py-1 rounded-lg flex justify-center items-center gap-2.5 ${location.pathname === '/' ? 'text-black dark:text-white' : 'text-neutral-400 dark:text-gray-300'} text-base font-medium font-['Manrope'] hover:text-black dark:hover:text-white`}
          >
            {t.home}
          </Link>
          <Link
            to="/tools"
            className={`px-3 py-1 rounded-lg flex justify-center items-center gap-2.5 ${
              location.pathname === '/tools' ||
              location.pathname.startsWith('/first-task') ||
              location.pathname.startsWith('/second-task') ||
              location.pathname.startsWith('/forward-intersection') ||
              location.pathname.startsWith('/resection')
                ? 'text-black dark:text-white'
                : 'text-neutral-400 dark:text-gray-300'
            } text-base font-medium font-['Manrope'] hover:text-black dark:hover:text-white`}
          >
            {t.tools}
          </Link>
          <Link
            to="/prices"
            className={`px-3 py-1 rounded-lg flex justify-center items-center gap-2.5 ${location.pathname === '/prices' ? 'text-black dark:text-white' : 'text-neutral-400 dark:text-gray-300'} text-base font-medium font-['Manrope'] hover:text-black dark:hover:text-white`}
          >
            {t.prices}
          </Link>
          <Link
            to="/contacts"
            className={`px-3 py-1 rounded-lg flex justify-center items-center gap-2.5 ${location.pathname === '/contacts' ? 'text-black dark:text-white' : 'text-neutral-400 dark:text-gray-300'} text-base font-medium font-['Manrope'] hover:text-black dark:hover:text-white`}
          >
            {t.contacts}
          </Link>
          <div data-property-1="Default" className="px-3 py-1 rounded-lg flex justify-center items-center gap-2.5 hover:text-black dark:hover:text-white">
            <div className="justify-start text-neutral-400 dark:text-gray-300 text-base font-medium font-['Manrope']">{t.forTeachers}</div>
          </div>
        </div>
        <div className="flex-1 flex justify-end items-center gap-3">
          <div className="w-9 h-9 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-gray-600 flex justify-center items-center gap-3">
            <img src="/icons/calc_icon.svg" alt="Calculator Icon" className="w-6 h-6" />
          </div>
          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-gray-600 flex justify-center items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <img src={isDark ? "/icons/light_mode_icon.svg" : "/icons/night_mode_icon.svg"} alt="Theme Toggle" className="w-6 h-6" />
          </button>
          {loading ? (
            <Loader />
          ) : user ? (
            <Link to="/account" className="px-4 py-2 bg-black dark:bg-white rounded-lg flex justify-start items-center gap-3">
              <div className="justify-start text-white dark:text-black text-base font-medium font-['Manrope']">{t.account}</div>
              <img src="/icons/login_icon.svg" alt="Account Icon" className="w-5 h-5" />
            </Link>
          ) : (
            <Link to="/login" className="px-4 py-2 bg-black dark:bg-white rounded-lg flex justify-start items-center gap-3">
              <div className="justify-start text-white dark:text-black text-base font-medium font-['Manrope']">{t.login}</div>
              <img src="/icons/login_icon.svg" alt="Login Icon" className="w-5 h-5" />
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden w-full px-4 pt-4 pb-2 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2">
          <img src="/images/logo.png" alt="GeoSolver Logo" className="w-9 h-9 rounded-lg bg-black dark:bg-white" />
          <div className="text-black dark:text-white text-base font-bold font-['Manrope']">GeoSolver</div>
          <div className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded flex items-center gap-2.5">
            <div className="text-black dark:text-white text-xs font-bold font-['Manrope']">{t.beta}</div>
          </div>
        </Link>
        <button
          className="w-9 h-9 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-gray-600 flex items-center justify-center"
          onClick={() => setMobileMenuOpen(true)}
        >
          <img src="/icons/header_icon.svg" alt="Menu" className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-center items-start pt-16">
          <div className="w-96 px-4 pt-12 pb-6 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 inline-flex flex-col justify-start items-start gap-6 rounded-lg shadow-lg">
            <div className="self-stretch inline-flex justify-between items-start">
              <div className="flex justify-start items-center gap-2">
                <img src="/images/logo.png" alt="GeoSolver Logo" className="w-9 h-9 rounded-lg bg-black dark:bg-white" />
                <div className="justify-start text-black dark:text-white text-base font-bold font-['Manrope']">GeoSolver</div>
                <div className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded flex justify-center items-center gap-2.5">
                  <div className="justify-start text-black dark:text-white text-xs font-bold font-['Manrope']">{t.beta}</div>
                </div>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="w-9 h-9 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-gray-600 flex justify-center items-center">
                <img src="/icons/close_button.svg" alt="Close" className="w-6 h-6" />
              </button>
            </div>
            <div className="self-stretch flex flex-col justify-center items-start gap-2">
              <Link to="/" onClick={() => setMobileMenuOpen(false)} className="self-stretch p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-gray-600 inline-flex justify-start items-center gap-3">
                <div className="justify-start text-black dark:text-white text-sm font-medium font-['Manrope']">{t.home}</div>
                <img src="/icons/small_header_icon.svg" alt="Arrow" className="w-3 h-3" />
              </Link>
              <Link to="/tools" onClick={() => setMobileMenuOpen(false)} className="self-stretch p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-gray-600 inline-flex justify-start items-center gap-3">
                <div className="justify-start text-black dark:text-white text-sm font-medium font-['Manrope']">{t.tools}</div>
                <img src="/icons/small_header_icon.svg" alt="Arrow" className="w-3 h-3" />
              </Link>
              <Link to="/prices" onClick={() => setMobileMenuOpen(false)} className="self-stretch p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-gray-600 inline-flex justify-start items-center gap-3">
                <div className="justify-start text-black dark:text-white text-sm font-medium font-['Manrope']">{t.prices}</div>
                <img src="/icons/small_header_icon.svg" alt="Arrow" className="w-3 h-3" />
              </Link>
              <Link to="/contacts" onClick={() => setMobileMenuOpen(false)} className="self-stretch p-3 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-gray-600 inline-flex justify-start items-center gap-3">
                <div className="justify-start text-black dark:text-white text-sm font-medium font-['Manrope']">{t.contacts}</div>
                <img src="/icons/small_header_icon.svg" alt="Arrow" className="w-3 h-3" />
              </Link>
            </div>
            <div className="inline-flex justify-end items-center gap-3">
              {loading ? (
                <Loader />
              ) : user ? (
                <div className="flex items-center gap-3">
                  <Link to="/account" onClick={() => setMobileMenuOpen(false)} className="px-4 py-2 bg-black dark:bg-white rounded-lg flex justify-start items-center gap-3">
                    <div className="justify-start text-white dark:text-black text-sm font-medium font-['Manrope']">{getAccountLabel()}</div>
                    <img src="/icons/account_icon.svg" alt="Account Icon" className="w-4 h-4" />
                  </Link>
                  <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="px-4 py-2 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-gray-600 flex justify-start items-center gap-3">
                    <div className="justify-start text-black dark:text-white text-sm font-medium font-['Manrope']">{t.logout}</div>
                    <img src="/icons/logout_icon.svg" alt="Logout" className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="justify-start text-white dark:text-black text-sm font-medium font-['Manrope'] px-4 py-2 bg-black dark:bg-white rounded-lg flex items-center gap-3">
                  {t.login}
                  <img src="/icons/login_icon.svg" alt="Login" className="w-3 h-3" />
                </Link>
              )}
              <div className="w-9 self-stretch rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-gray-600 flex justify-center items-center gap-3">
                <img src="/icons/calc_icon.svg" alt="Calculator" className="w-3.5 h-3.5" />
              </div>
              <button
                onClick={toggleTheme}
                className="w-9 self-stretch rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-gray-600 flex justify-center items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <img src={isDark ? "/icons/light_mode_icon.svg" : "/icons/night_mode_icon.svg"} alt="Theme Toggle" className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
