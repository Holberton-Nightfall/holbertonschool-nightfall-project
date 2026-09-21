import { Outlet } from 'react-router-dom';
import Header from './Header.jsx';
import Footer from './Footer.jsx';
import './Layout.css';

export default function Layout() {
  return (
    <div className="layout">
      <Header />
      <main className="layout__main container">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
