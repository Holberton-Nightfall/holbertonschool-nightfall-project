import { useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext.jsx';
import './Header.css';

export default function Header() {
  const { menuOpen, toggleMenu, closeMenu } = useApp();
  const { pathname } = useLocation();

  useEffect(() => { closeMenu(); }, [pathname]);

  return (
    <header className="header">
      <div className="header__inner container">
        <NavLink to="/" className="header__logo">Nightfall</NavLink>
        <button
          className="header__burger"
          onClick={toggleMenu}
          aria-expanded={menuOpen}
          aria-label="Menu"
        >
          <span /><span /><span />
        </button>
        <nav className={`header__nav ${menuOpen ? 'is-open' : ''}`}>
          <NavLink to="/" end>Accueil</NavLink>
          <NavLink to="/about">À propos</NavLink>
        </nav>
      </div>
    </header>
  );
}
