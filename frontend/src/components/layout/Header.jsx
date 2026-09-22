import { useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext.jsx';
import { container } from '../../lib/classNames.js';

const navLinkClass = ({ isActive }) =>
  `py-2 font-heading text-[.85rem] uppercase tracking-[.08em] transition-colors duration-300 ${
    isActive ? 'text-accent' : 'text-text-muted hover:text-accent-2'
  }`;

export default function Header() {
  const { menuOpen, toggleMenu, closeMenu } = useApp();
  const { pathname } = useLocation();

  useEffect(() => { closeMenu(); }, [pathname]);

  return (
    <header className="sticky top-0 z-10 border-b border-border-accent bg-bg-elevated/90 backdrop-blur-md">
      <div className={`${container} relative flex min-h-14 items-center justify-between`}>
        <NavLink
          to="/"
          className="text-glow-crimson animate-flicker motion-reduce:animate-none font-heading text-xl font-black uppercase tracking-[.1em] text-accent hover:text-accent"
        >
          Nightfall
        </NavLink>
        <button
          type="button"
          className="flex cursor-pointer flex-col gap-[5px] border-0 bg-transparent p-2 md:hidden"
          onClick={toggleMenu}
          aria-expanded={menuOpen}
          aria-controls="header-nav"
          aria-label="Menu"
        >
          <span className="h-0.5 w-6 bg-text" />
          <span className="h-0.5 w-6 bg-text" />
          <span className="h-0.5 w-6 bg-text" />
        </button>
        <nav
          id="header-nav"
          className={`${menuOpen ? 'flex' : 'hidden'} absolute inset-x-0 top-full flex-col border-b border-border-accent bg-bg-elevated px-4 py-2 md:static md:flex md:flex-row md:gap-6 md:border-0 md:bg-transparent md:p-0`}
        >
          <NavLink to="/" end className={navLinkClass}>Accueil</NavLink>
          <NavLink to="/catalogue" className={navLinkClass}>Catalogue</NavLink>
          <NavLink to="/about" className={navLinkClass}>À propos</NavLink>
        </nav>
      </div>
    </header>
  );
}
