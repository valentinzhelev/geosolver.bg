import React, { useState } from 'react';
import Layout from '../../layout/Layout';
import './AboutPage.css';
import { Helmet } from "react-helmet";

const events = [
    {
        year: '2023',
        description: 'Идеята за GeoSolver се заражда – необходимостта от уеб базирано приложение за геодезически изчисления.'
    },
    {
        year: '2024',
        description: 'Стартиране на активната разработка: изградени са основите на фронтенда и бекенда.'
    },
    {
        year: '2025',
        description: 'Публична версия 1.0 с основните функции: трансформации, засечки, базова история на изчисленията.'
    }
];

const AboutPage = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const progressPercent = (activeIndex) / (events.length - 1) * 100;

    return (
        <>
            <Helmet>
                <title>За нас - История на GeoSolver</title>
                <meta
                    name="description"
                    content="Научете историята на GeoSolver – онлайн платформа за геодезически изчисления с лесен и интуитивен интерфейс, предназначена за професионални геодезисти."
                />
                <meta
                    name="keywords"
                    content="GeoSolver, геодезия, история на GeoSolver, онлайн геодезически калкулатор, геодезически изчисления, права засечка, трансформации"
                />
                <meta name="robots" content="index, follow" />
                <meta name="author" content="GeoSolver" />
            </Helmet>
            <Layout>
                <div className="about-section">
                    <div className="about-container">
                        <h1 className="about-title">История на <span className="blue">GeoSolver</span></h1>
                        <p className="about-intro">
                            GeoSolver е проект, роден от желанието да се улесни ежедневната работа на геодезисти чрез достъпен онлайн инструмент.
                            Платформата предоставя прецизни изчисления, интуитивен интерфейс и възможност за съхраняване на история на изчисленията.
                        </p>

                        <div className="timeline-arrow-wrapper">
                            <div className="timeline-arrow-line">

                                {/* Линията в светло синьо (основа) */}
                                <div className="timeline-arrow-base" />

                                {/* Линията в синьо (прогрес) */}
                                <div
                                    className="timeline-arrow-progress"
                                    style={{ width: `max(${progressPercent}%, 17.9%)` }}
                                />

                                {/* Точките */}
                                {events.map((event, index) => (
                                    <div
                                        key={index}
                                        className={`timeline-arrow-point ${index <= activeIndex ? 'filled' : ''}`}
                                        onClick={() => setActiveIndex(index)}
                                    >
                                        <span>{event.year}</span>
                                    </div>
                                ))}

                                {/* Стрелката */}
                                <div
                                    className={`timeline-arrow-head ${activeIndex === events.length - 1 ? 'full' : ''}`}
                                />
                            </div>

                        </div>
                        <div className="timeline-description">
                            {events[activeIndex] && (
                                <>
                                    <h2>{events[activeIndex].year}</h2>
                                    <p>{events[activeIndex].description}</p>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </Layout>
        </>
    );
};

export default AboutPage;
