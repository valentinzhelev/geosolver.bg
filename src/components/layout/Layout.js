import React from 'react';
import Header from './Header';
import Footer from './Footer';
import CookieConsent from '../shared/CookieConsent';

const Layout = ({ children }) => {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-stone-50 dark:bg-zinc-950 transition-colors duration-300">{children}</main>
      <Footer />
      <CookieConsent />
    </>
  );
};

export default Layout;
