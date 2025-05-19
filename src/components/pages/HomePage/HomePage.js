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
        <div className="w-full max-w-[1660px] mx-auto px-4 md:px-6 flex flex-col gap-10 pt-8 pb-16">
          {/* Top Buttons */}
          <div className="w-full flex flex-col md:flex-row gap-2 md:gap-5">
            {[
              "Разгледай инструментите",
              "Виж цените",
              "Свържи се с нас"
            ].map((text, i) => (
              <div key={i} className="flex-1 p-4 bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 flex justify-between items-center">
                <span className="text-black text-sm md:text-base font-semibold font-['Manrope']">{text}</span>
                <img src="/arrow_right.svg" alt="Arrow" className="w-4 h-4 md:w-5 md:h-5" />
              </div>
            ))}
          </div>

          {/* Hero Section */}
          <div
            className="w-full h-64 md:h-64 p-6 md:p-14 relative rounded-xl flex flex-col justify-center items-center gap-4 overflow-hidden"
            style={{
              backgroundImage: "url('/gradient_wallpaper.jpg')",
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}
          >
            {/* Overlay for darkening */}
            <div className="absolute inset-0 bg-black/30 pointer-events-none rounded-xl" />
            {/* Logo */}
            <img src="/Vector_logo.png" alt="GeoSolver Logo" className="w-10 h-10 md:w-12 md:h-12 mb-2 z-10" />
            {/* Text */}
            <div className="relative z-10 text-center text-white text-base md:text-lg font-semibold font-['Manrope']">
              GeoSolver е проект, роден от желанието да се улесни ежедневната работа на геодезисти чрез достъпен онлайн инструмент. Платформата предоставя прецизни изчисления, интуитивен интерфейс и възможност за съхраняване на история на изчисленията.
            </div>
          </div>

          {/* History Section */}
          <section className="w-full flex flex-col gap-4">
            <h2 className="text-black text-lg md:text-2xl font-bold font-['Manrope']">История на GeoSolver</h2>
            <div className="w-full p-4 md:p-10 bg-white rounded-xl outline outline-1 outline-offset-[-1px] outline-gray-200 flex flex-col gap-10">
              <div className="flex flex-col items-center gap-2">
                <span className="text-black text-lg md:text-2xl font-semibold font-['Manrope']">2023</span>
                <span className="text-center text-black text-sm md:text-lg font-semibold font-['Manrope']">
                  Идеята за GeoSolver се заражда – необходимостта от уеб базирано приложение за геодезически изчисления.
                </span>
              </div>
              <div className="w-full flex flex-col md:flex-row gap-3 items-center">
                {["2023", "2024", "2025", "Планове за бъдещето"].map((label, i) => (
                  <React.Fragment key={label}>
                    <div className={`px-3 py-1 rounded-lg flex justify-center items-center gap-2.5 ${i === 0 ? "bg-black text-white" : "bg-gray-200 text-black"} text-base md:text-lg font-semibold font-['Manrope']`}>
                      {label}
                    </div>
                    {i < 3 && <div className="flex-1 h-0 outline outline-1 outline-offset-[-0.5px] outline-gray-200" />}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </section>
        </div>
      </Layout>
    </>
  );
};

export default HomePage;
