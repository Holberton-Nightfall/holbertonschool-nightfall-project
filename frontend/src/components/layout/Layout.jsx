import { Outlet } from 'react-router-dom';
import Header from './Header.jsx';
import Footer from './Footer.jsx';
import { container } from '../../lib/classNames.js';

// Structure commune à toutes les pages (voir App.jsx). Les deux div overlay en
// fin de page sont purement décoratives (grain/lignes de scan, charte post-apo) :
// aria-hidden pour ne pas polluer les lecteurs d'écran.
export default function Layout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <Header />
      <main className={`${container} flex-1 py-6`}>
        <Outlet />
      </main>
      <Footer />
      <div className="scanlines-overlay" aria-hidden="true" />
      <div className="grain-overlay" aria-hidden="true" />
    </div>
  );
}
