import React from 'react';
import './Prices.css';
import Layout from '../../layout/Layout';
import Breadcrumbs from '../../layout/Breadcrumbs';
import { Helmet } from "react-helmet";

const Prices = () => {
    return (
        <Layout>
            <Helmet>
                <title>GeoSolver - Цени и Планове</title>
                <meta name="description" content="GeoSolver - Онлайн геодезически калкулатори. Безплатен план с 5 изчисления месечно или професионален абонамент с неограничен достъп и допълнителни функции." />
                <meta name="keywords" content="геодезия, калкулатори, безплатен план, професионален план, абонамент, изчисления, геодезически инструменти, онлайн калкулатори" />
                <meta name="robots" content="index, follow" />
            </Helmet>

            <Breadcrumbs />

            <div className="prices-container">
                <h1 className="prices-header">Цени и планове</h1>
                <p className="prices-subheader">
                    Използвайте GeoSolver безплатно с до 5 изчисления на задача месечно или изберете професионален абонамент за неограничен достъп и допълнителни функции.
                </p>

                <div className="prices-row">
                    <div className="price-card free">
                        <div className="price-icon">
                            <i className="fas fa-gift"></i>
                        </div>
                        <h2 className="price-title">Безплатен план</h2>
                        <p className="price-amount">Цена: 0 лв</p>
                        <p className="price-description">Безплатни изчисления: 5 на задача месечно</p>
                        <p className="price-description">Основен достъп до всички калкулатори.</p>
                        <button className="price-button">Регистрация</button>
                    </div>

                    <div className="price-card pro">
                        <div className="price-icon">
                            <i className="fas fa-star"></i>
                        </div>
                        <h2 className="price-title">Професионален план</h2>
                        <p className="price-amount">Цена: 19.99 лв / месец</p>
                        <p className="price-description">Изчисления: Неограничени</p>
                        <p className="price-description">
                            Приоритетна поддръжка, история на изчисленията, допълнителни функции.
                        </p>
                        <button className="price-button">Абонирай се</button>
                    </div>

                    <div className="price-card corp">
                        <div className="price-icon">
                            <i className="fas fa-building"></i>
                        </div>
                        <h2 className="price-title">Корпоративен план</h2>
                        <p className="price-description">Персонална оферта</p>
                        <p className="price-description">Персонализирани решения и API достъп.</p>
                        <button className="price-button">Свържете се с нас</button>
                    </div>
                </div>

                <div className="faq-section">
                    <h2 className="faq-title">Често задавани въпроси</h2>

                    <div className="faq-question">Как се изчисляват безплатните изчисления?</div>
                    <div className="faq-answer">
                        Всеки регистриран потребител получава 5 безплатни изчисления за всяка задача на месец.
                    </div>

                    <div className="faq-question">Как мога да се абонирам?</div>
                    <div className="faq-answer">
                        Изберете професионален план и следвайте стъпките за плащане. След потвърждение ще имате неограничен достъп.
                    </div>

                    <div className="faq-question">Какви са начините за плащане?</div>
                    <div className="faq-answer">
                        Приемаме плащания чрез кредитна/дебитна карта и PayPal.
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Prices;
