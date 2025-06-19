import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { translations } from '../../translations';

const Footer = () => {
  const { language, toggleLanguage } = useLanguage();
  const t = translations[language];

  const quickLinks = [
    { text: t.tools, path: '/tools' },
    { text: t.prices, path: '/prices' },
    { text: t.contacts, path: '/contacts' },
    { text: t.privacyPolicy, path: '/privacy-policy' },
    { text: t.terms, path: '/terms' },
    { text: t.disclaimer, path: '/disclaimer' }
  ];

  const socialLinks = [
    { text: 'Instagram', url: 'https://instagram.com/geosolver' },
    { text: 'LinkedIn', url: 'https://linkedin.com/company/geosolver' },
    { text: 'Youtube', url: 'https://youtube.com/@geosolver' }
  ];

  return (
    <footer className="w-full bg-white border-t border-gray-200">
      <div className="max-w-[1180px] w-full mx-auto px-4 py-6 flex flex-col gap-6 md:flex-row md:justify-start md:items-start md:gap-5 md:px-6 md:py-10">
        {/* Logo and copyright */}
        <div className="w-full flex flex-col justify-start items-start gap-3 md:flex-1">
          <Link to="/" className="self-stretch inline-flex justify-start items-center gap-2.5">
            <img src="/images/logo.png" alt="GeoSolver Logo" className="w-10 h-10" />
            <div className="justify-start text-black text-xl font-bold font-['Manrope']">GeoSolver</div>
          </Link>
          <div className="self-stretch inline-flex justify-start items-center gap-3">
            <div className="flex-1 justify-start text-neutral-400 text-sm md:text-base font-medium font-['Manrope'] whitespace-pre-line">
              {t.copyright}
            </div>
          </div>
        </div>
        {/* Quick Links */}
        <div className="w-full flex flex-col justify-center items-start gap-2 md:flex-1">
          <div className="self-stretch justify-start text-black text-base font-semibold font-['Manrope']">{t.quickLinks}</div>
          {quickLinks.map((link) => (
            <Link key={link.text} to={link.path} className="self-stretch inline-flex justify-start items-center gap-3 hover:text-black">
              <div className="justify-start text-neutral-400 text-base font-medium font-['Manrope']">{link.text}</div>
              <img src="/icons/footer_right_arrow.svg" alt="Arrow" className="w-[5.09px] h-2" />
            </Link>
          ))}
        </div>
        {/* Social Links */}
        <div className="w-full flex flex-col justify-center items-start gap-2 md:flex-1">
          <div className="self-stretch justify-start text-black text-base font-semibold font-['Manrope']">{t.socialNetworks}</div>
          {socialLinks.map((link) => (
            <a key={link.text} href={link.url} target="_blank" rel="noopener noreferrer" className="self-stretch inline-flex justify-start items-center gap-3 hover:text-black">
              <div className="justify-start text-neutral-400 text-base font-medium font-['Manrope']">{link.text}</div>
              <img src="/icons/footer_right_arrow.svg" alt="Arrow" className="w-[5.09px] h-2" />
            </a>
          ))}
        </div>
        {/* Language and Theme */}
        <div className="w-full flex flex-col justify-center items-start gap-3 md:flex-1">
          <button 
            onClick={toggleLanguage}
            className="w-full px-4 py-2 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex justify-between items-center hover:bg-gray-50"
          >
            <div className="justify-start text-black text-base font-medium font-['Manrope']">{t.language}</div>
            <img src="/icons/footer_down_arrow.svg" alt="Down Arrow" className="w-2 h-2" />
          </button>
          <div className="self-stretch px-4 py-2 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex justify-between items-center">
            <div className="flex justify-start items-center gap-3">
              <img src="/icons/light_mode_icon.svg" alt="Light Mode Icon" className="w-5 h-5" />
              <div className="justify-start text-black text-base font-medium font-['Manrope']">{t.theme}</div>
            </div>
            <img src="/icons/footer_down_arrow.svg" alt="Down Arrow" className="w-2 h-2" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
