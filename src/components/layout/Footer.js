import React from 'react';

const Footer = () => {
  return (
    <footer className="w-full bg-white border-t border-gray-200">
      <div className="max-w-[1180px] w-full mx-auto px-4 py-6 flex flex-col gap-6 md:flex-row md:justify-start md:items-start md:gap-5 md:px-6 md:py-10">
        {/* Logo and copyright */}
        <div className="w-full flex flex-col justify-start items-start gap-3 md:flex-1">
          <div className="self-stretch inline-flex justify-start items-center gap-2.5">
            <img src="/images/logo.png" alt="GeoSolver Logo" className="w-10 h-10" />
            <div className="justify-start text-black text-xl font-bold font-['Manrope']">GeoSolver</div>
          </div>
          <div className="self-stretch inline-flex justify-start items-center gap-3">
            <div className="flex-1 justify-start text-neutral-400 text-sm md:text-base font-medium font-['Manrope']">
              © GEOSOLVER, 2025.<br />Всички права запазени.<br />Текуща версия: v2.1.5-beta.2
            </div>
          </div>
        </div>
        {/* Quick Links */}
        <div className="w-full flex flex-col justify-center items-start gap-2 md:flex-1">
          <div className="self-stretch justify-start text-black text-base font-semibold font-['Manrope']">Бързи връзки</div>
          {['Инструменти', 'Цени', 'Контакти', 'Политика за поверителност', 'Общи условия', 'Дисклеймър'].map((text) => (
            <div key={text} className="self-stretch inline-flex justify-start items-center gap-3">
              <div className="justify-start text-neutral-400 text-base font-medium font-['Manrope']">{text}</div>
              <img src="/icons/footer_right_arrow.svg" alt="Arrow" className="w-[5.09px] h-2" />
            </div>
          ))}
        </div>
        {/* Social Links */}
        <div className="w-full flex flex-col justify-center items-start gap-2 md:flex-1">
          <div className="self-stretch justify-start text-black text-base font-semibold font-['Manrope']">Социални мрежи</div>
          {['Instagram', 'LinkedIn', 'Youtube'].map((text) => (
            <div key={text} className="self-stretch inline-flex justify-start items-center gap-3">
              <div className="justify-start text-neutral-400 text-base font-medium font-['Manrope']">{text}</div>
              <img src="/icons/footer_right_arrow.svg" alt="Arrow" className="w-[5.09px] h-2" />
            </div>
          ))}
        </div>
        {/* Language and Theme */}
        <div className="w-full flex flex-col justify-center items-start gap-3 md:flex-1">
          <div className="self-stretch px-4 py-2 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex justify-between items-center">
            <div className="justify-start text-black text-base font-medium font-['Manrope']">Български език</div>
            <img src="/icons/footer_down_arrow.svg" alt="Down Arrow" className="w-2 h-2" />
          </div>
          <div className="self-stretch px-4 py-2 rounded-lg outline outline-1 outline-offset-[-1px] outline-gray-200 inline-flex justify-between items-center">
            <div className="flex justify-start items-center gap-3">
              <img src="/icons/light_mode_icon.svg" alt="Light Mode Icon" className="w-5 h-5" />
              <div className="justify-start text-black text-base font-medium font-['Manrope']">Светъл режим</div>
            </div>
            <img src="/icons/footer_down_arrow.svg" alt="Down Arrow" className="w-2 h-2" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
