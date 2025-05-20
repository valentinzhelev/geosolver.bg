import React, { useEffect } from "react";
import { Link } from 'react-router-dom';
import Layout from '../../layout/Layout';
import { Helmet } from "react-helmet";

const HomePage = () => {
  useEffect(() => {
    const toggle = document.getElementById("toggle-dark");
    const icon = document.querySelector(".switch-label i");
    if (!toggle || !icon) return;

    toggle.addEventListener("change", () => {
      document.body.classList.toggle("dark-mode");
      icon.classList.toggle("fa-sun");
      icon.classList.toggle("fa-moon");
    });
  }, []);

  return (
    <>
      <Helmet>
        <title>GeoSolver - Онлайн калкулатор за геодезия и засечки</title>
        <meta name="description" content="GeoSolver предлага онлайн калкулатори за геодезия, включително права засечка, обратна засечка, полярна засечка, координатни трансформации и други. Бързи и точни изчисления за геодезисти и инженери." />
        <meta name="keywords" content="геодезия, онлайн калкулатори, права засечка, обратна засечка, полярна засечка, координатни трансформации, геодезически изчисления, GNSS, тахиметрия, координати, азимут, дължина, триангулация, Хелмерт, афинна трансформация, инженерна геодезия" />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="GeoSolver" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Helmet>
      <Layout>
        <div className="w-full max-w-[400px] mx-auto px-4 pt-4 pb-4 min-h-[937px] flex flex-col gap-3 md:max-w-[1180px] md:mx-auto md:px-6 md:pt-12 md:pb-12 md:min-h-0" style={{ background: '#F9F9F9' }}>
          <div className="flex flex-col gap-3 md:gap-10">
            {/* Top Buttons */}
            <div className="flex flex-col gap-2 md:flex-row md:gap-5 md:mb-0">
              {[
                { text: "Разгледай инструментите", to: "/tools" },
                { text: "Виж цените", to: "/prices" },
                { text: "Свържи се с нас", to: "/contacts" }
              ].map(({ text, to }, i) => (
                <Link
                  key={i}
                  to={to}
                  className="transition-colors p-4 bg-white rounded-xl outline outline-1 outline-gray-200 flex justify-between items-center md:flex-1 md:p-4 md:bg-white md:rounded-xl md:outline md:outline-1 md:outline-gray-200 hover:outline-black focus:outline-black"
                >
                  <span className="text-black text-sm font-semibold font-['Manrope'] md:text-base">{text}</span>
                  <>
                    <img src="/hero_buttons_arrow.svg" alt="Arrow" className="w-4 h-4 md:hidden" />
                    <img src="/hero_buttons_arrow.svg" alt="Arrow" className="hidden md:block w-4 h-4" />
                  </>
                </Link>
              ))}
        </div>

            {/* Hero Section */}
            <div
              className="w-full p-6 relative rounded-xl flex flex-col justify-center items-center gap-4 overflow-hidden md:h-64 md:p-14 md:bg-black/20"
              style={{
                backgroundImage: "url('/gradient_wallpaper.jpg')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            >
              {/* Overlay for darkening */}
              <div className="absolute inset-0 bg-black/20 pointer-events-none rounded-xl" />
              {/* Logo */}
              <img src="/Vector_logo.png" alt="GeoSolver Logo" className="w-7 h-8 z-10 mb-2 md:w-8 md:h-10 md:mb-2" />
              {/* Text */}
              <div className="relative z-10 text-center text-white text-base font-medium font-['Manrope'] md:text-lg md:font-semibold">
                GeoSolver е проект, роден от желанието да се улесни ежедневната работа  на геодезисти чрез достъпен онлайн инструмент. Платформата предоставя  прецизни изчисления, интуитивен интерфейс и възможност за съхраняване на история на изчисленията.
              </div>
            </div>

            {/* History Section */}
            <section className="flex flex-col gap-3 md:gap-4 w-full">
              <h2 className="text-black text-lg font-bold font-['Manrope'] md:text-2xl">История на GeoSolver</h2>
              {/* Mobile Vertical Timeline */}
              <div className="flex md:hidden w-full">
                <div className="relative flex flex-row w-full p-4 bg-white rounded-xl outline outline-1 outline-gray-200">
                  {/* Timeline column with continuous vertical line and dots */}
                  <div className="relative flex flex-col items-center w-10 min-w-[40px]">
                    {/* Single vertical line for the whole timeline */}
                    <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-0.5 bg-gray-200" style={{ zIndex: 0 }} />
                    {[
                      { mt: 'mt-1.5', ml: 'ml-3.5' }, // 2023
                      { mt: 'mt-5', ml: 'ml-3.5' },     // 2024
                      { mt: 'mt-4', ml: 'ml-3.5' },   // 2025
                      { mt: 'mt-3', ml: 'ml-3.5' }      // Планове за бъдещето
                    ].map((dotStyle, idx) => (
                      <div key={idx} className={`flex-1 flex items-start ${idx !== 3 ? 'mb-4' : ''} w-full`}>
                        <div className={`relative z-10 w-3 h-3 rounded-full bg-black border-2 border-white ${dotStyle.mt} ${dotStyle.ml}`} />
                      </div>
                    ))}
                  </div>
                  {/* Content column */}
                  <div className="flex-1 flex flex-col">
                    {[
                      {
                        year: '2023',
                        text: 'Идеята за GeoSolver се заражда – необходимостта от уеб базирано приложение за геодезически изчисления.'
                      },
                      {
                        year: '2024',
                        text: 'Разработка и първа публична версия на GeoSolver.'
                      },
                      {
                        year: '2025',
                        text: 'Добавяне на нови инструменти и разширяване на функционалността.'
                      },
                      {
                        year: 'Планове за бъдещето',
                        text: 'Постоянно развитие и подобрения според нуждите на потребителите.'
                      }
                    ].map((item, idx, arr) => (
                      <div key={item.year} className={`flex flex-col gap-1 ${idx !== arr.length - 1 ? 'mb-4' : ''}`}> 
                        <span className="text-black text-base font-semibold font-['Manrope']">{item.year}</span>
                        <span className="text-neutral-600 text-sm font-medium font-['Manrope']">{item.text}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {/* Desktop (keep existing) */}
              <div className="hidden md:block">
                <div className="p-4 bg-white rounded-xl outline outline-1 outline-gray-200 flex flex-col gap-10 md:p-10 md:gap-10">
                  <div className="flex flex-col items-center gap-2 md:gap-3">
                    <span className="text-black text-lg font-semibold font-['Manrope'] md:text-2xl">2023</span>
                    <span className="text-center text-black text-sm font-semibold font-['Manrope'] md:text-lg md:font-semibold">
                      Идеята за GeoSolver се заражда – необходимостта от уеб базирано приложение за геодезически изчисления.
                    </span>
                  </div>
                  <div className="w-full flex flex-row gap-3 items-center overflow-x-auto pb-1 md:gap-3 md:overflow-visible md:pb-0">
                    {[{ label: "2023", active: true }, { label: "2024" }, { label: "2025" }, { label: "Планове за бъдещето" }].map((item, i, arr) => (
                      <React.Fragment key={item.label}>
                        <div className={`px-3 py-1 rounded-lg flex justify-center items-center gap-2.5 whitespace-nowrap min-w-max ${item.active ? "bg-black text-white" : "bg-gray-200 text-black"} text-base font-semibold font-['Manrope'] md:text-lg md:flex-shrink-0`}>
                          {item.label}
                </div>
                        {i < arr.length - 1 && (
                          <>
                            <div className="flex-1 h-0 outline outline-1 outline-offset-[-0.5px] outline-gray-200 md:hidden" />
                            <div className="hidden md:block flex-1 h-0 outline outline-1 outline-offset-[-0.5px] outline-gray-200" />
                          </>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </Layout>
    </>
  );
};

export default HomePage;
