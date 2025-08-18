import React from "react";
import { Link } from 'react-router-dom';
import Layout from '../../layout/Layout';
import { Helmet } from "react-helmet";
import { useTranslation } from '../../../hooks/useTranslation';
import { useTheme } from '../../../context/ThemeContext';

const HomePage = () => {
  const { language } = useTranslation();
  const { isDark } = useTheme();

  return (
    <>
      <Helmet>
        <title>{language === 'bg' ? 'GeoSolver - Онлайн калкулатор за геодезия и засечки' : 'GeoSolver - Online Calculator for Geodesy and Intersections'}</title>
        <meta 
          name="description" 
          content={language === 'bg' 
            ? "GeoSolver предлага онлайн калкулатори за геодезия, включително права засечка, обратна засечка, полярна засечка, координатни трансформации и други. Бързи и точни изчисления за геодезисти и инженери." 
            : "GeoSolver offers online calculators for geodesy, including forward intersection, resection, polar intersection, coordinate transformations, and more. Fast and accurate calculations for surveyors and engineers."
          } 
        />
        <meta 
          name="keywords" 
          content={language === 'bg'
            ? "геодезия, онлайн калкулатори, права засечка, обратна засечка, полярна засечка, координатни трансформации, геодезически изчисления, GNSS, тахиметрия, координати, азимут, дължина, триангулация, Хелмерт, афинна трансформация, инженерна геодезия"
            : "geodesy, online calculators, forward intersection, resection, polar intersection, coordinate transformations, geodetic calculations, GNSS, tacheometry, coordinates, azimuth, distance, triangulation, Helmert, affine transformation, engineering geodesy"
          }
        />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="GeoSolver" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Helmet>
      <Layout>
        <div className="w-full min-h-screen bg-stone-50 dark:bg-neutral-950">
          <div className="w-full max-w-[1180px] mx-auto px-4 lg:px-6 pt-6 lg:pt-20 pb-6 lg:pb-20 flex flex-col gap-6 lg:gap-10">
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
              <div className="w-full p-4 lg:p-10 bg-white dark:bg-zinc-900 rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 dark:outline-zinc-800 flex flex-col justify-start items-start gap-10">
                <div className="w-full flex flex-col justify-center items-center gap-2 lg:gap-3">
                  <div className="text-black dark:text-white text-lg lg:text-2xl font-semibold font-['Manrope']">2023</div>
                  <div className="text-center text-black dark:text-white text-sm lg:text-lg font-semibold font-['Manrope']">
                    {language === 'bg' 
                      ? 'Идеята за GeoSolver се заражда – необходимостта от уеб базирано приложение за геодезически изчисления.'
                      : 'The idea for GeoSolver is born – the need for a web-based application for geodetic calculations.'
                    }
                  </div>
                </div>
                {/* Timeline - Mobile: Horizontal scrollable, Desktop: Normal */}
                <div className="w-full flex flex-row justify-start items-center gap-3 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
                  <div className="px-3 py-1 bg-black dark:bg-white rounded-lg flex justify-center items-center gap-2.5 flex-shrink-0">
                    <div className="text-white dark:text-black text-base lg:text-lg font-semibold font-['Manrope']">2023</div>
                  </div>
                  <div className="flex-1 h-0 outline outline-1 outline-offset-[-0.50px] outline-gray-200 dark:outline-zinc-800" />
                  <div className="px-3 py-1 bg-gray-200 dark:bg-zinc-800 rounded-lg flex justify-center items-center gap-2.5 flex-shrink-0">
                    <div className="text-black dark:text-white text-base lg:text-lg font-semibold font-['Manrope']">2024</div>
                  </div>
                  <div className="flex-1 h-0 outline outline-1 outline-offset-[-0.50px] outline-gray-200 dark:outline-zinc-800" />
                  <div className="px-3 py-1 bg-gray-200 dark:bg-zinc-800 rounded-lg flex justify-center items-center gap-2.5 flex-shrink-0">
                    <div className="text-black dark:text-white text-base lg:text-lg font-semibold font-['Manrope']">2025</div>
                  </div>
                  <div className="flex-1 h-0 outline outline-1 outline-offset-[-0.50px] outline-gray-200 dark:outline-zinc-800" />
                  <div className="px-3 py-1 bg-gray-200 dark:bg-zinc-800 rounded-lg flex justify-center items-center gap-2.5 flex-shrink-0">
                    <div className="text-black dark:text-white text-base lg:text-lg font-semibold font-['Manrope']">
                      {language === 'bg' ? 'Планове за бъдещето' : 'Future Plans'}
                    </div>
                  </div>
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
