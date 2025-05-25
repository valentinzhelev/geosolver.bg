import React from 'react';
import Header from './Header';
import Footer from './Footer';
import CookieConsent from '../shared/CookieConsent';

const Layout = ({ children }) => {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
      <CookieConsent />
    </>
  );
};

export default Layout;
