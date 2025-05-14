import React, { useEffect } from "react";
import "./HomePage.css";
import { Link } from 'react-router-dom';

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
      <header className="main-header">
        <div className="header-left">
          <img src="/geocalc.png" alt="GEOSOLVER Logo" className="logo" />
        </div>
        <nav className="header-nav">
          <a href="#" className="active">
            Начало
          </a>
          <a href="#">За нас</a>
          <a href="#">Цени</a>
          <a href="#">Контакти</a>
          <a href="#">Акаунт</a>
          <a href="#">
            <i className="fas fa-user"></i> Вход / Регистрация
          </a>
          <div className="theme-switch">
            <input type="checkbox" id="toggle-dark" />
            <label htmlFor="toggle-dark" className="switch-label">
              <i className="fas fa-sun"></i>
            </label>
          </div>
        </nav>
      </header>

      <div className="banner-warning">
        <span className="warning-icon">
          <i className="fa-solid fa-triangle-exclamation warning-icon"></i>
        </span>
        <div className="warning-content">
          <div className="warning-title">
            <strong>Необходима е регистрация</strong>
          </div>
          <div className="warning-text">
            За да използвате инструментите за изчисление в GeoSolver, трябва да
            сте регистриран потребител с потвърден имейл адрес. Ако вече сте се
            регистрирали, проверете входящата си поща и потвърдете своя имейл.
            Ако не сте получили писмо, можете да заявите ново изпращане от
            страницата „Акаунт“.
          </div>
        </div>
      </div>

      <div className="main-content">
        <div className="content-container">
          <div className="top-bar">
            <div className="search-wrapper">
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Търси задачи..."
                className="search-input"
              />
            </div>
            <label className="toggle-fav">
              <input type="checkbox" />
              <span className="switch"></span>
              Покажи задачи в разработка
            </label>
          </div>

          <div className="grid">
            <div className="card">
              <div className="card-title">
                <i className="fas fa-location-arrow"></i>
                <h3>ПЪРВА ОСНОВНА ЗАДАЧА</h3>
              </div>
              <p className="description">
                Изчисляване на координати по начална точка, ъгъл и дължина.
              </p>
              <ul className="details">
                <li>
                  <strong>Параметри:</strong> 1 точка, ъгъл, дължина
                </li>
                <li>
                  <strong>Тип:</strong> трансформация / полярен метод
                </li>
                <li>
                  <strong>Изчисление:</strong> &lt; 0.05s
                </li>
              </ul>
              <div className="card-actions">
                <Link to="/purva-zadacha">
                  <button>Изчисли</button>
                </Link>
                <div className="tooltip">
                  <button>Инфо</button>
                  <div className="tooltip-text">
                    Използва се за определяне на координати чрез посока и
                    разстояние от начална точка.
                    <br />
                    <br />
                    Натиснете бутона за повече информация и скици.
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-title">
                <i className="fas fa-compass"></i>
                <h3>ВТОРА ОСНОВНА ЗАДАЧА</h3>
              </div>
              <p className="description">
                Изчисляване на ъгъл и разстояние между две точки по координати.
              </p>
              <ul className="details">
                <li>
                  <strong>Параметри:</strong> 4 входни координати
                </li>
                <li>
                  <strong>Тип:</strong> GNSS / координатна геодезия
                </li>
                <li>
                  <strong>Изчисление:</strong> &lt; 0.1s
                </li>
              </ul>
              <div className="card-actions">
                <Link to="/vtora-zadacha">
                  <button>Изчисли</button>
                </Link>
                <div className="tooltip">
                  <button>Инфо</button>
                  <div className="tooltip-text">
                    Изчисляване на азимут и дължина между две точки с известни
                    координати.
                    <br />
                    <br />
                    За повече информация и скици, натиснете бутона.
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-title">
                <i className="fas fa-ruler-horizontal"></i>
                <h3>ПРАВА ЗАСЕЧКА</h3>
              </div>
              <p className="description">
                Координати чрез посока и разстояние от известна точка.
              </p>
              <ul className="details">
                <li>
                  <strong>Параметри:</strong> 1 известна точка + мерки
                </li>
                <li>
                  <strong>Тип:</strong> GNSS / тахиметрично измерване
                </li>
                <li>
                  <strong>Изчисление:</strong> &lt; 0.08s
                </li>
              </ul>
              <div className="card-actions">
                <button>Изчисли</button>
                <div className="tooltip">
                  <button>Инфо</button>
                  <div className="tooltip-text">
                    Определяне на позиция чрез мерки от една известна точка.
                    <br />
                    <br />
                    За детайли и графики – натиснете бутона.
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-title">
                <i className="fas fa-crosshairs"></i>
                <h3>ОБРАТНА ЗАСЕЧКА</h3>
              </div>
              <p className="description">
                Определяне на позиция по ъгли от известни точки.
              </p>
              <ul className="details">
                <li>
                  <strong>Параметри:</strong> 2–3 известни точки и ъгли
                </li>
                <li>
                  <strong>Тип:</strong> координатна геодезия / класика
                </li>
                <li>
                  <strong>Изчисление:</strong> ~0.1s
                </li>
              </ul>
              <div className="card-actions">
                <button>Изчисли</button>
                <div className="tooltip">
                  <button>Инфо</button>
                  <div className="tooltip-text">
                    Използва се при определяне на координати чрез посока към
                    известни точки.
                    <br />
                    <br />
                    Още информация чрез бутона.
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-title">
                <i className="fas fa-map-marker-alt"></i>
                <h3>ПОЛЯРНА ЗАСЕЧКА</h3>
              </div>
              <p className="description">
                Изчисления на непознати точки по мерки от база.
              </p>
              <ul className="details">
                <li>
                  <strong>Параметри:</strong> 2 точки база + мерки
                </li>
                <li>
                  <strong>Тип:</strong> полярни координати
                </li>
                <li>
                  <strong>Изчисление:</strong> &lt; 0.09s
                </li>
              </ul>
              <div className="card-actions">
                <button>Изчисли</button>
                <div className="tooltip">
                  <button>Инфо</button>
                  <div className="tooltip-text">
                    Прилага се при засичане на точка по база и измерени мерки.
                    <br />
                    <br />
                    Вижте още чрез бутона.
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-title">
                <i className="fas fa-exchange-alt"></i>
                <h3>КООРДИНАТНА ТРАНСФОРМАЦИЯ</h3>
              </div>
              <p className="description">
                Преобразуване между локални и глобални координатни системи.
              </p>
              <ul className="details">
                <li>
                  <strong>Параметри:</strong> 3+ точки / трансформационни
                </li>
                <li>
                  <strong>Тип:</strong> Хелмерт, афинна, 7 параметъра
                </li>
                <li>
                  <strong>Изчисление:</strong> &lt; 0.2s
                </li>
              </ul>
              <div className="card-actions">
                <button>Изчисли</button>
                <div className="tooltip">
                  <button>Инфо</button>
                  <div className="tooltip-text">
                    Използва се при прехвърляне на координати между две системи.
                    <br />
                    <br />
                    Повече информация чрез бутона.
                  </div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-title">
                <i className="fas fa-equals"></i>
                <h3>ЗАДАЧА НА ХАНЗЕН</h3>
              </div>
              <p className="description">
                Изчисляване на координатите на точка чрез ъглово преместване от
                две известни точки (A и B).
              </p>
              <ul className="details">
                <li>
                  <strong>Параметри:</strong> координати на A и B + ъгли α, β
                </li>
                <li>
                  <strong>Тип:</strong> аналитична триангулация
                </li>
                <li>
                  <strong>Изчисление:</strong> &lt; 0.1s
                </li>
              </ul>
              <div className="card-actions">
                <a href="zadacha-na-hanzen.html">
                  <button>Изчисли</button>
                </a>
                <div className="tooltip">
                  <button>Инфо</button>
                  <div className="tooltip-text">
                    Класическа задача за определяне на непозната точка чрез две
                    известни и измерени посочни ъгли.
                    <br />
                    За повече информация и скица – натиснете бутона.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="site-footer">
        <div className="container">
          <div className="footer-inner">
            <div className="footer-column">
              <h4>
                <i className="fas fa-link"></i> Бързи връзки
              </h4>
              <a href="#">За нас</a>
              <a href="#">Контакт</a>
              <a href="#">Цени</a>
            </div>
            <div className="footer-column">
              <h4>
                <i className="fas fa-info-circle"></i> Информация
              </h4>
              <a href="#">Политика за поверителност</a>
              <a href="#">Общи условия</a>
              <a href="#">Дисклеймър</a>
            </div>
            <div className="footer-column">
              <h4>
                <i className="fas fa-share-alt"></i> Последвайте ни
              </h4>
              <a href="#">
                <i className="fab fa-instagram"></i> Instagram
              </a>
              <a href="#">
                <i className="fab fa-linkedin"></i> LinkedIn
              </a>
              <a href="#">
                <i className="fab fa-youtube"></i> YouTube
              </a>
            </div>
          </div>
          <div className="footer-bottom">
            <p>
              © GEOSOLVER, 2025. Всички права запазени. | Текуща версия на
              платформата: <strong>v1.0.0</strong>
            </p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default HomePage;
