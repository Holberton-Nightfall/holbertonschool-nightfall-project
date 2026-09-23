import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

// Enveloppe une route réservée aux administrateurs.
// ⚠️ Confort d'interface uniquement : la vraie protection est le middleware
// requireAdmin côté back, qui relit le rôle en base à chaque requête.
export default function RequireAdmin({ children }) {
  const { user, isAuthenticated, status } = useAuth();
  const location = useLocation();

  // Le contexte valide encore le token : ne rien décider maintenant, sinon
  // un admin qui recharge /admin serait éjecté au premier rendu.
  if (status === 'loading') return <p>Vérification de la session…</p>;

  // Non connecté : même comportement que RequireAuth
  if (!isAuthenticated) return <Navigate to="/connexion" state={{ from: location }} replace />;

  // Connecté mais simple membre : retour à l'accueil. Pas la page de connexion,
  // qui laisserait croire qu'il suffit de se reconnecter.
  if (user.role !== 'admin') return <Navigate to="/" replace />;

  return children;
}