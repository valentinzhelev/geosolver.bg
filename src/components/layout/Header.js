import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  useEffect(() => {
    const toggle = document.getElementById('toggle-dark');
    const icon = document.querySelector('.switch-label i');
    if (!toggle || !icon) return;

    toggle.addEventListener('change', () => {
      document.body.classList.toggle('dark-mode');
      icon.classList.toggle('fa-sun');
      icon.classList.toggle('fa-moon');
    });
  }, []);

  return (
    <header className="main-header">
      <div className="header-left">
        <img src="/geocalc.png" alt="GEOSOLVER Logo" className="logo" />
      </div>
      <nav className="header-nav">
        <Link to="/" className={({ isActive }) => isActive ? 'active' : ''}>
          Начало
        </Link>
        <Link to="/about-us" className={({ isActive }) => isActive ? 'active' : ''}>
          За нас
        </Link>
        <Link to="/prices" className={({ isActive }) => isActive ? 'active' : ''}>
          Цени
        </Link>
        <a href="https://geosolver.bg">Контакти</a>
        <a href="https://geosolver.bg">Акаунт</a>
        <a href="https://geosolver.bg"><i className="fas fa-user"></i> Вход / Регистрация</a>
        <div className="theme-switch">
          <input type="checkbox" id="toggle-dark" />
          <label htmlFor="toggle-dark" className="switch-label">
            <i className="fas fa-sun"></i>
          </label>
        </div>
      </nav>
    </header>
  );
};

export default Header;
