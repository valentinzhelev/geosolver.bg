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
        <Link to="/" className="active">Начало</Link>
        <Link to="/za-nas" className={({ isActive }) => isActive ? 'active' : ''}>
          За нас
        </Link>
        <a href="#">Цени</a>
        <a href="#">Контакти</a>
        <a href="#">Акаунт</a>
        <a href="#"><i className="fas fa-user"></i> Вход / Регистрация</a>
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
