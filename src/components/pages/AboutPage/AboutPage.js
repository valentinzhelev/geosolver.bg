import React, { useState } from 'react';
import Layout from '../../layout/Layout';
import './AboutPage.css';
import { Helmet } from "react-helmet";
import { useTranslation } from '../../../hooks/useTranslation';

const AboutPage = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const { t, language } = useTranslation();

    const events = [
        {
            year: '2023',
            description: language === 'bg'
                ? 'Идеята за GeoSolver се заражда – необходимостта от уеб базирано приложение за геодезически изчисления.'
                : 'The idea for GeoSolver is born – the need for a web-based application for geodetic calculations.'
        },
        {
            year: '2024',
            description: language === 'bg'
                ? 'Стартиране на активната разработка: изградени са основите на фронтенда и бекенда.'
                : 'Active development begins: frontend and backend foundations are built.'
        },
        {
            year: '2025',
            description: language === 'bg'
                ? 'Публична версия 1.0 с основните функции: трансформации, засечки, базова история на изчисленията.'
                : 'Public version 1.0 with core features: transformations, intersections, basic calculation history.'
        }
    ];

    const progressPercent = (activeIndex) / (events.length - 1) * 100;

    return (
        <>
            <Helmet>
                <title>
                    {language === 'bg' ? 'За нас - История на GeoSolver' : 'About Us - GeoSolver History'}
                </title>
                <meta
                    name="description"
                    content={language === 'bg'
                        ? "Научете историята на GeoSolver – онлайн платформа за геодезически изчисления с лесен и интуитивен интерфейс, предназначена за професионални геодезисти."
                        : "Learn about GeoSolver's history – an online platform for geodetic calculations with an easy and intuitive interface, designed for professional surveyors."
                    }
                />
                <meta
                    name="keywords"
                    content={language === 'bg'
                        ? "GeoSolver, геодезия, история на GeoSolver, онлайн геодезически калкулатор, геодезически изчисления, права засечка, трансформации"
                        : "GeoSolver, geodesy, GeoSolver history, online geodetic calculator, geodetic calculations, forward intersection, transformations"
                    }
                />
                <meta name="robots" content="index, follow" />
                <meta name="author" content="GeoSolver" />
            </Helmet>
            <Layout>
                <div className="about-section">
                    <div className="about-container">
                        <h1 className="about-title">
                            {language === 'bg' ? 'История на ' : 'History of '}
                            <span className="blue">GeoSolver</span>
                        </h1>
                        <p className="about-intro">
                            {language === 'bg'
                                ? 'GeoSolver е проект, роден от желанието да се улесни ежедневната работа на геодезисти чрез достъпен онлайн инструмент. Платформата предоставя прецизни изчисления, интуитивен интерфейс и възможност за съхраняване на история на изчисленията.'
                                : 'GeoSolver is a project born from the desire to simplify the daily work of surveyors through an accessible online tool. The platform provides precise calculations, an intuitive interface, and the ability to store calculation history.'
                            }
                        </p>

                        <div className="timeline-arrow-wrapper">
                            <div className="timeline-arrow-line">
                                {/* Base line in light blue */}
                                <div className="timeline-arrow-base" />

                                {/* Progress line in blue */}
                                <div
                                    className="timeline-arrow-progress"
                                    style={{ width: `max(${progressPercent}%, 17.9%)` }}
                                />

                                {/* Points */}
                                {events.map((event, index) => (
                                    <div
                                        key={index}
                                        className={`timeline-arrow-point ${index <= activeIndex ? 'filled' : ''}`}
                                        onClick={() => setActiveIndex(index)}
                                    >
                                        <span>{event.year}</span>
                                    </div>
                                ))}

                                {/* Arrow */}
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
