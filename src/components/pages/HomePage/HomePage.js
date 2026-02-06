import React, { useState } from "react";
import { Link } from 'react-router-dom';
import Layout from '../../layout/Layout';
import SEO from '../../shared/SEO';
import { useTranslation } from '../../../hooks/useTranslation';
import { useTheme } from '../../../context/ThemeContext';

const historyItems = [
  {
    id: '2023',
    label: { bg: '2023', en: '2023' },
    content: {
      bg: 'Идеята за GeoSolver се заражда – необходимостта от уеб базирано приложение за геодезически изчисления.',
      en: 'The idea for GeoSolver is born – the need for a web-based application for geodetic calculations.'
    }
  },
  {
    id: '2024',
    label: { bg: '2024', en: '2024' },
    content: {
      bg: 'Започва разработката на платформата – първите инструменти и основен функционал.',
      en: 'Platform development begins – first tools and core functionality.'
    }
  },
  {
    id: '2025',
    label: { bg: '2025', en: '2025' },
    content: {
      bg: 'Пускане на продукта, разширение на инструментите и преподавателски панел.',
      en: 'Product launch, tool expansion and teacher panel.'
    }
  },
  {
    id: 'future',
    label: { bg: 'Планове за бъдещето', en: 'Future Plans' },
    labelShort: { bg: 'Планове', en: 'Plans' },
    content: {
      bg: 'Сканиране на задачи от снимка, мобилно приложение и допълнителни геодезически модули.',
      en: 'Task scanning from photo, mobile app and additional geodetic modules.'
    }
  }
];

const HomePage = () => {
  const { language } = useTranslation();
  const { isDark } = useTheme();
  const [activeYear, setActiveYear] = useState('2023');
  const activeItem = historyItems.find(item => item.id === activeYear) || historyItems[0];

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "GeoSolver",
    "description": language === 'bg' 
      ? "Онлайн геодезически калкулатори за професионални геодезисти. Координатни трансформации, засечки, изчисления на площ и дължина."
      : "Online geodetic calculators for professional surveyors. Coordinate transformations, intersections, area and distance calculations.",
    "url": "https://www.geosolver.bg",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "EUR",
      "description": language === 'bg' ? "Безплатен план с 5 изчисления месечно" : "Free plan with 5 calculations per month"
    },
    "featureList": language === 'bg' ? [
      "Координатни трансформации",
      "Права и обратна засечка", 
      "Полярна засечка",
      "Изчисления на площ",
      "Изчисления на дължина",
      "GNSS анализ",
      "Научен калкулатор"
    ] : [
      "Coordinate transformations",
      "Forward and reverse intersection",
      "Polar intersection", 
      "Area calculations",
      "Distance calculations",
      "GNSS analysis",
      "Scientific calculator"
    ]
  };

  return (
    <>
      <SEO
        title={language === 'bg' ? 'Онлайн калкулатор за геодезия и засечки' : 'Online Calculator for Geodesy and Intersections'}
        description={language === 'bg' 
          ? "GeoSolver предлага онлайн калкулатори за геодезия, включително права засечка, обратна засечка, полярна засечка, координатни трансформации и други. Бързи и точни изчисления за геодезисти и инженери." 
          : "GeoSolver offers online calculators for geodesy, including forward intersection, resection, polar intersection, coordinate transformations, and more. Fast and accurate calculations for surveyors and engineers."
        }
        keywords={language === 'bg'
          ? "геодезия, онлайн калкулатори, права засечка, обратна засечка, полярна засечка, координатни трансформации, геодезически изчисления, GNSS, тахиметрия, координати, азимут, дължина, триангулация, Хелмерт, афинна трансформация, инженерна геодезия"
          : "geodesy, online calculators, forward intersection, resection, polar intersection, coordinate transformations, geodetic calculations, GNSS, tacheometry, coordinates, azimuth, distance, triangulation, Helmert, affine transformation, engineering geodesy"
        }
        canonical="/"
        structuredData={structuredData}
      />
      <Layout>
        <div className="w-full min-h-screen bg-stone-50 dark:bg-neutral-950">
          <div className="w-full max-w-[1180px] mx-auto px-4 lg:px-6 pt-6 lg:pt-20 pb-6 flex flex-col gap-6 lg:gap-10">
            {/* Top Buttons - Mobile: Vertical, Desktop: Horizontal */}
            <div className="flex flex-col lg:flex-row justify-start items-start gap-2 lg:gap-5">
              <Link
                to="/tools"
                className="w-full lg:flex-1 p-4 bg-white dark:bg-zinc-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-800 flex justify-between items-center transition-all duration-200 hover:outline-[0.5px] hover:outline-gray-400 dark:hover:outline-zinc-700 hover:shadow-md hover:bg-gray-25 dark:hover:bg-zinc-800 transition"
              >
                <div className="text-black dark:text-white text-sm lg:text-base font-semibold font-['Manrope']">
                  {language === 'bg' ? 'Разгледай инструментите' : 'Explore Tools'}
                </div>
                <img src={isDark ? "/icons/homepage_arrow_icon.svg" : "/icons/hero_buttons_arrow.svg"} alt="Arrow" className="w-1.5 h-2.5 lg:w-2 lg:h-3 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
              <Link
                to="/prices"
                className="w-full lg:flex-1 p-4 bg-white dark:bg-zinc-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-800 flex justify-between items-center transition-all duration-200 hover:outline-[0.5px] hover:outline-gray-400 dark:hover:outline-zinc-700 hover:shadow-md hover:bg-gray-25 dark:hover:bg-zinc-800 transition"
              >
                <div className="text-black dark:text-white text-sm lg:text-base font-semibold font-['Manrope']">
                  {language === 'bg' ? 'Виж цените' : 'View Prices'}
                </div>
                <img src={isDark ? "/icons/homepage_arrow_icon.svg" : "/icons/hero_buttons_arrow.svg"} alt="Arrow" className="w-1.5 h-2.5 lg:w-2 lg:h-3 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
              <Link
                to="/contacts"
                className="w-full lg:flex-1 p-4 bg-white dark:bg-zinc-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-800 flex justify-between items-center transition-all duration-200 hover:outline-[0.5px] hover:outline-gray-400 dark:hover:outline-zinc-700 hover:shadow-md hover:bg-gray-25 dark:hover:bg-zinc-800 transition"
              >
                <div className="text-black dark:text-white text-sm lg:text-base font-semibold font-['Manrope']">
                  {language === 'bg' ? 'Свържи се с нас' : 'Contact Us'}
                </div>
                <img src={isDark ? "/icons/homepage_arrow_icon.svg" : "/icons/hero_buttons_arrow.svg"} alt="Arrow" className="w-1.5 h-2.5 lg:w-2 lg:h-3 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            </div>

            {/* Hero Section - Mobile: Different height and padding */}
            <div className="w-full h-56 lg:h-80 p-4 lg:p-14 relative rounded-xl flex flex-col justify-center items-center gap-4 overflow-hidden">
              <img 
                className="absolute inset-0 w-full h-full object-cover" 
                src="/images/gradient_wallpaper.jpg" 
                alt="" 
              />
              <div className="absolute inset-0 bg-black/20 rounded-xl" />
              <div className="flex flex-col justify-center items-center gap-4 relative z-10 w-full h-full pt-6 pb-6 lg:pt-8 lg:pb-8">
                <img src="/images/Vector_logo.png" alt="GeoSolver Logo" className="w-7 h-8 lg:w-8 lg:h-10" />
                <div className="text-center text-white text-sm lg:text-lg font-medium lg:font-semibold font-['Manrope']" style={{ color: '#FFFFFF', textShadow: '0 0 1px rgba(0,0,0,0.3)' }}>
                  {language === 'bg' 
                    ? 'GeoSolver е проект, роден от желанието да се улесни ежедневната работа на геодезисти чрез достъпен онлайн инструмент. Платформата предоставя прецизни изчисления, интуитивен интерфейс и възможност за съхраняване на история на изчисленията.'
                    : 'GeoSolver is a project born from the desire to simplify the daily work of surveyors through an accessible online tool. The platform provides precise calculations, intuitive interface and the ability to save calculation history.'
                  }
                </div>
              </div>
            </div>

            {/* History Section - Mobile: Different layout and timeline */}
            <div className="flex flex-col justify-center items-start gap-3 lg:gap-4">
              <div className="text-black dark:text-white text-lg lg:text-2xl font-bold font-['Manrope']">
                {language === 'bg' ? 'История на GeoSolver' : 'GeoSolver History'}
              </div>
              <div className="w-full p-4 lg:p-10 bg-white dark:bg-zinc-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-800 flex flex-col justify-start items-start gap-6 lg:gap-10">
                {/* Content - above buttons */}
                <div className="w-full flex flex-col justify-center items-center gap-3 lg:gap-3">
                  <div className="text-black dark:text-white text-lg lg:text-2xl font-semibold font-['Manrope']">
                    {activeItem.label[language]}
                  </div>
                  <div className="text-center text-black dark:text-white text-sm lg:text-base font-medium font-['Manrope'] leading-relaxed px-1">
                    {activeItem.content[language]}
                  </div>
                </div>
                {/* Mobile: Year selector below content, 2x2 grid */}
                <div className="w-full lg:hidden">
                  <div className="grid grid-cols-2 gap-2">
                    {historyItems.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setActiveYear(item.id)}
                        className={`py-3 px-4 rounded-xl flex justify-center items-center transition-all font-['Manrope'] font-semibold text-sm ${
                          activeYear === item.id
                            ? 'bg-black dark:bg-white text-white dark:text-black shadow-md'
                            : 'bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-400 active:bg-stone-200 dark:active:bg-zinc-700'
                        }`}
                      >
                        {(item.labelShort || item.label)[language]}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Desktop: Timeline with lines - below content */}
                <div className="hidden lg:flex w-full flex-row justify-start items-center gap-3">
                  {historyItems.map((item, index) => (
                    <React.Fragment key={item.id}>
                      {index > 0 && (
                        <div className="flex-1 h-0 outline outline-1 outline-offset-[-0.50px] outline-gray-200 dark:outline-zinc-800" />
                      )}
                      <button
                        type="button"
                        onClick={() => setActiveYear(item.id)}
                        className={`px-3 py-1 rounded-lg flex justify-center items-center gap-2.5 flex-shrink-0 transition-colors cursor-pointer ${
                          activeYear === item.id
                            ? 'bg-black dark:bg-white'
                            : 'bg-gray-200 dark:bg-zinc-800 hover:bg-gray-300 dark:hover:bg-zinc-700'
                        }`}
                      >
                        <div className={`text-base lg:text-lg font-semibold font-['Manrope'] ${
                          activeYear === item.id ? 'text-white dark:text-black' : 'text-black dark:text-white'
                        }`}>
                          {item.label[language]}
                        </div>
                      </button>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default HomePage;
