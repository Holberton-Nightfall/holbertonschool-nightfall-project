import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

// Enveloppe une route qui exige d'être connecté : redirige vers /connexion sinon,
// en gardant la destination initiale pour y revenir après connexion.
export default function RequireAuth({ children }) {
  const { isAuthenticated, status } = useAuth();
  const location = useLocation();

  if (status === 'loading') return <p>Vérification de la session…</p>;
  if (!isAuthenticated) return <Navigate to="/connexion" state={{ from: location }} replace />;
  return children;
}
