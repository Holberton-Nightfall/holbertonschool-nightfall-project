import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout.jsx';
import Home from './pages/Home.jsx';
import Catalogue from './pages/Catalogue.jsx';
import ExperienceDetail from './pages/ExperienceDetail.jsx';
import CatalogueTest from './pages/CatalogueTest.jsx';
import ExperienceDetailTest from './pages/ExperienceDetailTest.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Account from './pages/Account.jsx';
import Booking from './pages/Booking.jsx';
import BookingConfirmation from './pages/BookingConfirmation.jsx';
import About from './pages/About.jsx';
import Terms from './pages/Terms.jsx';
import NotFound from './pages/NotFound.jsx';
import RequireAuth from './components/auth/RequireAuth.jsx';

// Routeur principal : toutes les pages partagent le même Layout (header/footer).
// RequireAuth protège les routes qui exigent une session (compte, réservation).
export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="catalogue" element={<Catalogue />} />
        <Route path="experiences/:id" element={<ExperienceDetail />} />
        {/* /test et /test/:id : pages de vérification visuelle sur seed statique
            (src/mocks/experiences.js), tant que GET /api/experiences n'est pas
            branché. À supprimer une fois l'API dispo (voir docs/suivi.md). */}
        <Route path="test" element={<CatalogueTest />} />
        <Route path="test/:id" element={<ExperienceDetailTest />} />
        <Route path="connexion" element={<Login />} />
        <Route path="inscription" element={<Register />} />
        <Route path="compte" element={<RequireAuth><Account /></RequireAuth>} />
        <Route path="reservation/:id" element={<RequireAuth><Booking /></RequireAuth>} />
        <Route path="reservation/:id/confirmation" element={<RequireAuth><BookingConfirmation /></RequireAuth>} />
        <Route path="about" element={<About />} />
        <Route path="conditions" element={<Terms />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
