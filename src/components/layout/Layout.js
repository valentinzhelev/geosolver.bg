import React from 'react';
import Header from './Header';
import Footer from './Footer';
import CookieConsent from '../shared/CookieConsent';

const Layout = ({ children, stickyFooter = false }) => {
  return (
    <div className={`flex flex-col bg-stone-50 dark:bg-zinc-950 transition-colors duration-300 ${stickyFooter ? 'min-h-screen' : ''}`}>
      <Header />
      <main className={stickyFooter ? 'flex-1' : ''}>{children}</main>
      <Footer />
      <CookieConsent />
    </div>
  );
};

export default Layout;
