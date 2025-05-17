import React from 'react';

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-inner">
          <div className="footer-column">
            <h4><i className="fas fa-link"></i> Бързи връзки</h4>
            <a href="https://geosolver.bg">За нас</a>
            <a href="https://geosolver.bg">Контакт</a>
            <a href="https://geosolver.bg">Цени</a>
          </div>
          <div className="footer-column">
            <h4><i className="fas fa-info-circle"></i> Информация</h4>
            <a href="https://geosolver.bg">Политика за поверителност</a>
            <a href="https://geosolver.bg">Общи условия</a>
            <a href="https://geosolver.bg">Дисклеймър</a>
          </div>
          <div className="footer-column">
            <h4><i className="fas fa-share-alt"></i> Последвайте ни</h4>
            <a href="https://geosolver.bg"><i className="fab fa-instagram"></i> Instagram</a>
            <a href="https://geosolver.bg"><i className="fab fa-linkedin"></i> LinkedIn</a>
            <a href="https://geosolver.bg"><i className="fab fa-youtube"></i> YouTube</a>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© GEOSOLVER, 2025. Всички права запазени. | Текуща версия: <strong>v1.0.23-beta.1</strong></p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
